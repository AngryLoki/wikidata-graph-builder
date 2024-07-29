import {scaleLinear} from 'd3-scale';
import escape from 'lodash.escape';
import ColorTracker from 'canvas-color-tracker';
import type {Canvas, CanvasContext, LinkObject, NodeObject, SearchObject, ShortcutsMode} from './types';
import {QueryService, type QueryResponseBinding} from '$lib/query-service';

class TextMeasurer {
	canvas: Canvas;
	context: CanvasContext;
	constructor() {
		this.canvas = (typeof OffscreenCanvas === 'undefined') ? new HTMLCanvasElement() : new OffscreenCanvas(0, 0);
		this.context = this.canvas.getContext('2d', {alpha: false})! as CanvasContext;
		this.context.font = '10px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
	}

	getTextWidth(text: string) {
		return this.context.measureText(text).width;
	}
}

export class SparqlGraphData {
	public nodes: NodeObject[];
	public shortcutsMode: ShortcutsMode = 'preserve';

	private readonly measurer = new TextMeasurer();

	public get forceLinks(): LinkObject[] {
		return this.shortcutsMode === 'preserve' ? this.allLinks : this.noShortcutLinks;
	}

	public get viewLinks(): LinkObject[] {
		return this.shortcutsMode === 'remove' ? this.noShortcutLinks : this.allLinks;
	}

	private allLinks: LinkObject[];
	private noShortcutLinks: LinkObject[];
	private colorTracker: ColorTracker = new ColorTracker();

	constructor(
		public linksSet: Set<LinkObject> = new Set(),
		public nodesMap: Map<string, NodeObject> = new Map(),
		public rootNode: NodeObject | undefined = undefined) {
		this.nodes = [...nodesMap.values()];

		const links = [...linksSet];
		this.allLinks = links;
		this.noShortcutLinks = links.filter(({isShortcut}) => !isShortcut);
	}

	public lookup(color: Uint8ClampedArray) {
		return this.colorTracker.lookup(color as any) as SearchObject ?? undefined;
	}

	public async loadFromSparql(query: string, rootNodeId: string | undefined, abortSignal: AbortSignal) {
		const queryService = QueryService.getInstance();
		const lines = await queryService.get(query, {signal: abortSignal});

		let minSize = Number.POSITIVE_INFINITY;
		let maxSize = 0;

		const nodesMap = new Map<string, NodeObject>();
		let rootNode;
		const defaultRadius = 5;

		this.colorTracker = new ColorTracker();

		for (const line of lines) {
			const itemId = line.item.value!;

			if (nodesMap.has(itemId)) {
				continue;
			}

			const size = line.size === undefined ? undefined : Number.parseInt(line.size.value!, 10);
			if (size !== undefined && size < minSize) {
				minSize = size;
			}

			if (size !== undefined && size > maxSize) {
				maxSize = size;
			}

			const label = itemLabel(line);

			const node: NodeObject = {
				id: itemId,
				label,
				tooltip: itemTooltip(label, size),
				url: itemId,
				size,
				radius: defaultRadius,
				edgesIn: [],
				edgesOut: [],
				textHeight: 10,
				textWidth: this.measurer.getTextWidth(label),
				indexColor: '',
				shape: 'point',
			};
			node.indexColor = this.colorTracker.register({type: 'Node', object: node} as SearchObject)!;

			if (rootNodeId !== undefined && itemId.endsWith(rootNodeId)) {
				rootNode = node;
			}

			nodesMap.set(itemId, node);
		}

		const scaler = scaleLinear().domain([minSize, maxSize]).range([3, 20]);
		for (const node of nodesMap.values()) {
			node.radius = node.size === undefined ? defaultRadius : scaler(node.size);
		}

		const linksSet = new Set<LinkObject>();

		for (const line of lines) {
			const sourceId = line.item?.value;
			const targetId = line.linkTo?.value;
			const linkType = line.linkType?.value

			if (!sourceId || !nodesMap.has(sourceId) || !targetId || !nodesMap.has(targetId)) {
				continue;
			}

			const link: LinkObject = {
				id: sourceId + '-' + targetId,
				source: nodesMap.get(sourceId)!,
				target: nodesMap.get(targetId)!,
				isShortcut: false,
				indexColor: '',
				dashed: linkType === 'instance',
			};
			link.indexColor = this.colorTracker.register({type: 'Link', object: link} as SearchObject)!;

			if (linksSet.has(link)) {
				continue;
			}

			nodesMap.get(targetId)!.edgesIn.push(link);
			nodesMap.get(sourceId)!.edgesOut.push(link);
			linksSet.add(link);
		}

		// Fill isShortcut fields
		const isIndirectlyConnected = (source: NodeObject, target: NodeObject) => {
			const visited = new Set<NodeObject>();
			const stack = [source];

			while (stack.length > 0) {
				const current = stack.pop()!;
				visited.add(current);

				const currentChildren = current.edgesOut.map(edge => edge.target);
				if (currentChildren) {
					const next = [...currentChildren].filter(child => !visited.has(child));
					if (next.includes(target)) {
						return true;
					}

					stack.push(...next);
				}
			}

			return false;
		};

		for (const link of linksSet) {
			const {source, target} = link;
			const firstLevel = source.edgesOut.map(edge => edge.target);
			link.isShortcut = firstLevel.some(element => isIndirectlyConnected(element, target));
		}

		this.linksSet = linksSet;
		this.nodesMap = nodesMap;
		this.rootNode = rootNode;
		this.nodes = [...nodesMap.values()];
		const links = [...linksSet];
		this.allLinks = links;
		this.noShortcutLinks = links.filter(({isShortcut}) => !isShortcut);
	}

	public getConnectedNodes(source: NodeObject, direction: 'forward' | 'reverse') {
		let getChildrenLinks;
		if (this.shortcutsMode === 'remove') {
			getChildrenLinks = direction === 'forward'
				? (node: NodeObject) => node.edgesOut.filter(x => !x.isShortcut)
				: (node: NodeObject) => node.edgesIn.filter(x => !x.isShortcut);
		} else {
			getChildrenLinks = direction === 'forward'
				? (node: NodeObject) => node.edgesOut
				: (node: NodeObject) => node.edgesIn;
		}

		const getEdgeTarget = direction === 'forward' ? (edge: LinkObject) => edge.target : (edge: LinkObject) => edge.source;

		const childrenNodes = new Set<NodeObject>();
		const childrenLinks = new Set<LinkObject>();
		const stack = [this.nodesMap.get(source.id)!];

		while (stack.length > 0) {
			const current = stack.pop()!;
			childrenNodes.add(current);

			const currentChildrenLinks = getChildrenLinks(current);
			for (const link of currentChildrenLinks) {
				childrenLinks.add(link);
			}

			// eslint-disable-next-line unicorn/no-array-callback-reference
			const currentChildrenNodes = currentChildrenLinks.map(getEdgeTarget);
			const next = [...currentChildrenNodes].filter(child => !childrenNodes.has(child));
			stack.push(...next);
		}

		childrenNodes.delete(source);

		return {childrenNodes, childrenLinks};
	}
}

const itemTooltip = (label: string, size: number | undefined = undefined) => {
	label = escape(label);

	if (size !== undefined) {
		label += `<br>(${size} items)`;
	}

	return label;
};

const itemLabel = (element: QueryResponseBinding) => element.itemLabel?.value
					?? /^http:\/\/www.wikidata.org\/entity\/(.+)$/.exec(element.item.value!)?.[1]
					?? element.item.value!;
