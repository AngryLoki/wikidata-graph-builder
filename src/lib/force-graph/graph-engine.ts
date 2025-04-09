/* eslint-disable @typescript-eslint/prefer-readonly */

import {ForceEngine} from './force-engine';
import {ElkEngine} from './elk-engine';
import {SparqlGraphData} from './graph-data';
import type {
	Canvas, CanvasContext, GraphLayout, GraphEngineNotifier, LayoutEngine, LinkObject, NodeObject, Point, SearchObject, ShortcutsMode, VisParameters, GraphNotifier, ElkDirection,
} from './types';

type DragObject = NodeObject & {
	__initialDragPos?: {x: number; y: number; fx: number | undefined; fy: number | undefined};
	x: number;
	y: number;
	fx: number | undefined;
	fy: number | undefined;
};

type DrawNode = NodeObject & {
	x: number;
	y: number;
};

type ZoomSettings = {x: number; y: number; k: number};

export class GraphEngine implements GraphEngineNotifier {
	private engine!: LayoutEngine;
	private hoverObject: SearchObject | undefined;

	private graphData: SparqlGraphData = new SparqlGraphData();
	private devicePixelRatio = 1;

	private abortController: AbortController | undefined;

	private backgroundColor = '#ffffff';

	private shortcutsColor = '#000000';
	private shortcutsWidth = 1;
	private linksColor = '#000000';
	private linksWidth = 1;
	private pointOffset = 1;
	private forwardHighlightColor = '#1e40af50';
	private reverseHighlightColor = '#ea580c50';
	private highlightLinksWidth = 5;

	private forwardNodes = new Set<NodeObject>();
	private forwardLinks = new Set<LinkObject>();

	private reverseNodes = new Set<NodeObject>();
	private reverseLinks = new Set<LinkObject>();

	private animationFrameRequestId: number | undefined;

	private readonly canvas: Canvas;
	private readonly shadowCanvas: Canvas;
	private readonly ctx: CanvasContext;
	private readonly shadowCtx: CanvasContext;

	private needsRedraw = false;

	private autoPauseRedraw = true;

	private isZoomDragging = false;
	private isPointerDragging = false;
	private pointerPos: Point = {x: -1e12, y: -1e12};

	private hoverNode: NodeObject | undefined = undefined;
	private nodeLineWidth = 2;

	private pointFill = '#9ca3af';
	private blockFill = '#e5e7eb';
	private rootNodePointFill = '#dc2626';
	private rootNodeBlockFill = '#ef4444';

	constructor(canvas: Canvas, visParameters: VisParameters, private readonly graphNotifier: GraphNotifier) {
		this.setVisParameters(visParameters);

		this.canvas = canvas;
		if (typeof OffscreenCanvas === 'undefined') {
			this.shadowCanvas = new HTMLCanvasElement();
			this.shadowCanvas.width = canvas.width;
			this.shadowCanvas.height = canvas.height;
		} else {
			this.shadowCanvas = new OffscreenCanvas(canvas.width, canvas.height);
		}

		this.ctx = this.canvas.getContext('2d', {alpha: false}) as CanvasContext;
		this.shadowCtx = this.shadowCanvas.getContext('2d', {willReadFrequently: true, alpha: false})! as CanvasContext;

		this.animate();
	}

	public onZoomTransform(t: ZoomSettings) {
		this.isZoomDragging = true;

		for (const context of [this.ctx, this.shadowCtx]) {
			context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
			context.translate(t.x, t.y);
			context.scale(t.k, t.k);
		}

		this.needsRedraw = true;
	}

	public onZoomTransformEnd() {
		this.isZoomDragging = false;
	}

	public onLayoutComplete(x: number, y: number, width: number, height: number) {
		this.graphNotifier.onLayoutComplete(x, y, width, height);
	}

	public setVisParameters(visParameters: VisParameters) {
		this.setLayoutOptions(visParameters.graphDirection);

		this.shortcutsMode = visParameters.shortcutsMode;
		this.shortcutsWidth = visParameters.shortcutsWidth;
		this.shortcutsColor = visParameters.shortcutsColor;

		this.needsRedraw = true;
	}

	public requestRedraw() {
		this.needsRedraw = true;
	}

	public async load(query: string, rootNode: string | undefined) {
		this.abort();

		this.graphNotifier.setState('loading');

		this.abortController = new AbortController();
		try {
			await this.graphData.loadFromSparql(
				query,
				rootNode,
				this.abortController.signal,
			);
			this.clearCanvas(this.ctx, this.backgroundColor);
			this.clearCanvas(this.shadowCtx);
			this.engine.setGraphData(this.graphData);
			this.graphNotifier.setState('ok');
		} catch (error_: unknown) {
			if ((error_ as Error).name !== 'AbortError') {
				this.graphNotifier.setError((error_ as Error).message);
				this.graphNotifier.setState('error');
			}
		} finally {
			this.abortController = undefined;
		}
	}

	public setPointerPos(point: Point) {
		this.pointerPos = point;
	}

	public onDragStart(nodeId: string, active: number) {
		const node = this.graphData.nodesMap.get(nodeId)! as DragObject;
		node.__initialDragPos = {
			x: node.x, y: node.y, fx: node.fx, fy: node.fy,
		};

		// Keep engine running at low intensity throughout drag
		if (!active) {
			node.fx = node.x;
			node.fy = node.y; // Fix points
		}
	}

	public onDrag(nodeId: string, dragPos: Point) {
		this.isPointerDragging = true;

		const node = this.graphData.nodesMap.get(nodeId)! as DragObject;
		node.x = dragPos.x;
		node.fx = dragPos.x;
		node.y = dragPos.y;
		node.fy = dragPos.y;

		this.engine.onDrag?.();
		this.needsRedraw = true;
	}

	public onDragEnd(nodeId: string) {
		this.isPointerDragging = false;

		const node = this.graphData.nodesMap.get(nodeId)! as DragObject;

		const initPos = node.__initialDragPos!;
		if (initPos.fx === undefined) {
			node.fx = undefined;
		}

		if (initPos.fy === undefined) {
			node.fy = undefined;
		}

		delete (node.__initialDragPos);

		this.engine.onDragEnd?.();
	}

	// eslint-disable-next-line @typescript-eslint/no-empty-function
	public onPointerDown() {}

	public onPointerUp(button: number) {
		if (this.isPointerDragging || this.isZoomDragging) {
			this.isPointerDragging = false;
			return; // Don't trigger click events after pointer drag (pan / node drag functionality)
		}

		requestAnimationFrame(() => { // Trigger click events asynchronously, to allow hoverObj to be set (on frame)
			if (button === 0 && this.hoverObject?.type === 'Node') {
				this.graphNotifier.onNodeClicked(this.hoverObject.object.url);
			}
		});
	}

	public adjustCanvasSize(width: number, height: number, devicePixelRatio: number) {
		this.devicePixelRatio = devicePixelRatio;
		let currentWidth = this.canvas.width;
		let currentHeight = this.canvas.height;
		if (currentWidth === 300 && currentHeight === 150) {
			currentWidth = 0;
			currentHeight = 0;
		}

		// Resize canvases
		for (const canvas of [this.canvas, this.shadowCanvas]) {
			// Memory size (scaled to avoid blurriness)
			canvas.width = width * devicePixelRatio;
			canvas.height = height * devicePixelRatio;

			// Normalize coordinate system to use css pixels (on init only)
			if (!currentWidth && !currentHeight) {
				this.ctx.scale(devicePixelRatio, devicePixelRatio);
			}
		}

		this.needsRedraw = true;
	}

	public pauseAnimation() {
		if (this.animationFrameRequestId) {
			window.cancelAnimationFrame(this.animationFrameRequestId);
			this.animationFrameRequestId = undefined;
		}
	}

	public resumeAnimation() {
		if (!this.animationFrameRequestId) {
			this.animate();
		}
	}

	public destroy() {
		this.abort();
		this.pauseAnimation();
	}

	private clearCanvas(context: CanvasContext, color = '#000000') {
		context.save();
		context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0);
		if (color === '#000000') {
			context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		} else {
			context.fillStyle = color;
			context.fillRect(0, 0, this.canvas.width, this.canvas.height);
		}

		context.restore(); // Restore transforms
	}

	private abort() {
		if (this.abortController) {
			this.abortController.abort();
			this.abortController = undefined;
			this.graphNotifier.setState('ok');
		}
	}

	private onLinkHover?(link: LinkObject | undefined, previousLink: LinkObject | undefined): void;
	private onNodeHover(node: NodeObject | undefined, previousNode: NodeObject | undefined) {
		if (node) {
			({childrenNodes: this.forwardNodes, childrenLinks: this.forwardLinks} = this.graphData.getConnectedNodes(node, 'forward'));
			({childrenNodes: this.reverseNodes, childrenLinks: this.reverseLinks} = this.graphData.getConnectedNodes(node, 'reverse'));
		} else {
			this.forwardNodes.clear();
			this.forwardLinks.clear();
			this.reverseNodes.clear();
			this.reverseLinks.clear();
		}

		this.hoverNode = node ?? undefined;
		this.needsRedraw = true;
	}

	// eslint-disable-next-line complexity
	private paintCanvas() {
		const context = this.ctx;
		const isPoint = this.graphData.nodes[0]?.shape === 'point';

		// Draw links
		const links = this.graphData.viewLinks;
		if (this.shortcutsColor === this.linksColor && this.shortcutsWidth === this.linksWidth) {
			context.strokeStyle = this.linksColor;
			context.lineWidth = this.linksWidth;
			drawLinks(links, context);
		} else {
			context.strokeStyle = this.linksColor;
			context.lineWidth = this.linksWidth;
			drawLinks(links, context, false);

			if (this.shortcutsWidth !== 0) {
				context.strokeStyle = this.shortcutsColor;
				context.lineWidth = this.shortcutsWidth;
				drawLinks(links, context, true);
			}
		}

		if (this.forwardLinks.size > 0) {
			context.strokeStyle = this.forwardHighlightColor;
			context.lineWidth = this.highlightLinksWidth;
			drawLinks(this.forwardLinks, context);
		}

		if (this.reverseLinks.size > 0) {
			context.strokeStyle = this.reverseHighlightColor;
			context.lineWidth = this.highlightLinksWidth;
			drawLinks(this.reverseLinks, context);
		}

		// Draw arrows
		const arrowsSizeBase = isPoint ? 13 : 8;
		const arrowsSize = arrowsSizeBase * Math.sqrt(this.linksWidth);
		const shortcutsArrowsSize = arrowsSizeBase * Math.sqrt(this.shortcutsWidth);

		if (this.shortcutsColor === this.linksColor && this.shortcutsWidth === this.linksWidth) {
			const arrowsFilter = this.shortcutsWidth === 0 ? ((link: LinkObject) => !link.isShortcut) : undefined;
			drawArrows(links, arrowsSize, context, arrowsFilter);
		} else {
			context.strokeStyle = this.linksColor;
			drawArrows(links, arrowsSize, context, link => !link.isShortcut);

			if (this.shortcutsWidth !== 0) {
				context.fillStyle = this.shortcutsColor;
				drawArrows(links, shortcutsArrowsSize, context, link => link.isShortcut);
			}
		}

		// Draw nodes
		const nodes = this.graphData.nodes as DrawNode[];

		context.strokeStyle = '#000000';
		context.lineWidth = this.nodeLineWidth;
		context.fillStyle = isPoint ? this.pointFill : this.blockFill;
		drawNodes(nodes, context);

		const rootNode = this.graphData.rootNode as DrawNode;
		if (rootNode) {
			context.strokeStyle = '#000000';
			context.lineWidth = this.nodeLineWidth;
			context.fillStyle = isPoint ? this.rootNodePointFill : this.rootNodeBlockFill;
			drawNodes([rootNode], context);
		}

		if (this.forwardNodes.size > 0) {
			context.fillStyle = this.forwardHighlightColor;
			context.lineWidth = 5;
			context.strokeStyle = this.forwardHighlightColor;
			drawNodes(this.forwardNodes as Iterable<DrawNode>, context);
		}

		if (this.reverseNodes.size > 0) {
			context.fillStyle = this.reverseHighlightColor;
			context.lineWidth = 5;
			context.strokeStyle = this.reverseHighlightColor;
			drawNodes(this.reverseNodes as Iterable<DrawNode>, context);
		}

		if (this.hoverNode) {
			context.strokeStyle = '#40404050';
			context.lineWidth = 5;
			context.fillStyle = '#40404050';
			drawNodes([this.hoverNode as DrawNode], context);
		}

		context.beginPath();
		context.font = '10px ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"';
		context.textAlign = 'left';
		context.textBaseline = isPoint ? 'middle' : 'hanging';
		context.lineWidth = 1;
		context.strokeStyle = '#ffffff';
		context.fillStyle = '#000000';

		for (const node of nodes) {
			const x = isPoint ? node.x + node.radius + this.pointOffset : node.x + 5;
			const y = isPoint ? node.y : node.y + 5;
			if (isPoint) {
				context.strokeText(node.label, x, y);
			}

			context.fillText(node.label, x, y);
		}
	}

	private paintShadowCanvas() {
		const context = this.shadowCtx;

		const nodes = this.graphData.nodes as DrawNode[];
		const isPoint = nodes[0]?.shape === 'point';

		for (const node of nodes) {
			if (isPoint) {
				const {textWidth, radius, x, y, indexColor} = node;
				context.fillStyle = indexColor;
				context.fillRect(x - radius, y - radius, 2 * radius, 2 * radius);
				context.fillRect(x + radius + this.pointOffset, y - 5, textWidth, 10);
			} else {
				const {textWidth, textHeight, x, y, indexColor} = node;
				context.fillStyle = indexColor;
				context.fillRect(
					x - (this.nodeLineWidth / 2), y - (this.nodeLineWidth / 2),
					textWidth + 10 + this.nodeLineWidth, textHeight + 10 + this.nodeLineWidth,
				);
			}
		}
	}

	private get shortcutsMode() {
		return this.graphData.shortcutsMode;
	}

	private set shortcutsMode(shortcutsMode: ShortcutsMode) {
		if (shortcutsMode === this.graphData.shortcutsMode) {
			return;
		}

		const requiresReload = this.graphData.shortcutsMode === 'preserve' || shortcutsMode === 'preserve';
		this.graphData.shortcutsMode = shortcutsMode;
		if (requiresReload) {
			this.engine.setGraphData(this.graphData, false);
		}
	}

	private animate() {
		const doRedraw = !this.autoPauseRedraw || this.needsRedraw || this.engine.isEngineRunning();
		this.needsRedraw = false;

		// Update tooltip and trigger onHover events
		const object = this.isPointerDragging ? undefined : this.getObjectUnderPointer(); // Don't hover during drag
		if (object !== this.hoverObject) {
			if (!object || object.type === 'Node') {
				this.graphNotifier.setHoverNodeId(object?.object.id);
				this.graphNotifier.setTooltip(object?.object.tooltip);
			}

			const previousObject = this.hoverObject;

			if (previousObject && previousObject.type !== object?.type) {
				// Hover
				if (previousObject.type === 'Link') {
					this.onLinkHover?.(undefined, previousObject.object);
				} else {
					this.onNodeHover?.(undefined, previousObject.object);
				}
			}

			if (object) {
				// Hover in
				if (object.type === 'Link') {
					this.onLinkHover?.(object.object, previousObject?.type === 'Link' ? previousObject.object : undefined);
				} else {
					this.onNodeHover?.(object.object, previousObject?.type === 'Node' ? previousObject.object : undefined);
				}
			}

			this.hoverObject = object;
		}

		if (doRedraw) {
			this.engine.tickFrame?.();
			this.clearCanvas(this.shadowCtx);
			this.paintShadowCanvas();
			this.clearCanvas(this.ctx, this.backgroundColor);
			this.paintCanvas();
		}

		this.animationFrameRequestId = requestAnimationFrame(this.animate.bind(this));
	}

	private getObjectUnderPointer() {
		let object: SearchObject | undefined;
		const pxScale = this.devicePixelRatio;
		const px = (this.pointerPos.x > 0 && this.pointerPos.y > 0)
			? this.shadowCtx.getImageData(this.pointerPos.x * pxScale, this.pointerPos.y * pxScale, 1, 1)
			: undefined;
		if (px) {
			// Find object per pixel color
			object = this.graphData.lookup(px.data) ?? undefined;
		}

		return object;
	}

	private setLayoutOptions(graphLayout: GraphLayout) {
		const createLayoutEngine = graphLayout === 'none' ? () => new ForceEngine(this) : () => new ElkEngine(this, graphLayout);
		if (
			(graphLayout === 'none' && this.engine instanceof ForceEngine)
			|| (graphLayout !== 'none' && this.engine instanceof ElkEngine && this.engine.graphLayout === graphLayout)
		) {
			return;
		}

		const cls = graphLayout === 'none' ? ForceEngine : ElkEngine;
		if (this.engine === undefined || !(this.engine instanceof cls)) {
			this.engine = createLayoutEngine();
			this.engine.setGraphData(this.graphData);
			return;
		}

		if (this.engine instanceof ElkEngine && this.engine.graphLayout !== graphLayout) {
			this.engine.graphLayout = graphLayout as ElkDirection;
			this.engine.update();
		}
	}
}

const drawLinks = (
	links: Iterable<LinkObject>,
	context: CanvasContext,
	shortcutFilter?: boolean,
) => {
	for (const drawDashed of [true, false]) {
		if (drawDashed) {
			context.setLineDash(shortcutFilter ? [7, 3] : [3.5, 1.5]);
		}

		for (const link of links) {
			if (shortcutFilter !== undefined && shortcutFilter !== link.isShortcut) {
				continue;
			}

			if (Boolean(link.dashed) !== drawDashed) {
				continue;
			}

			context.beginPath();

			if (link.sections) {
				context.moveTo(link.sections[0][0], link.sections[0][1]);
				for (let i = 1; i < link.sections.length; i++) {
					context.lineTo(link.sections[i][0], link.sections[i][1]);
				}
			} else {
				const source = link.source;
				const target = link.target;
				context.moveTo(source.x!, source.y!);
				context.lineTo(target.x!, target.y!);
			}

			context.stroke();
		}

		context.setLineDash([]);
	}
};

const drawArrows = (
	links: Iterable<LinkObject>,
	arrowLength: number,
	context: CanvasContext,
	filter: ((links: LinkObject) => boolean) | undefined = undefined,
) => {
	for (const link of links) {
		if (filter && !filter(link)) {
			continue;
		}

		let start: Point;
		let end: Point;
		let endR: number;

		if (link.sections) {
			const p1 = link.sections.at(-2);
			const p2 = link.sections.at(-1);
			start = {x: p1[0], y: p1[1]};
			end = {x: p2[0], y: p2[1]};
			endR = 0;
		} else {
			start = {x: link.source.x!, y: link.source.y!};
			end = {x: link.target.x!, y: link.target.y!};
			endR = link.target.radius;
		}

		const arrowWhRatio = 1.6;
		const arrowVlenRatio = 0.2;

		const arrowHalfWidth = arrowLength / arrowWhRatio / 2;

		const getCoordsAlongLine = (t: number) => ({
			x: (start.x * (1 - t)) + (end.x * t),
			y: (start.y * (1 - t)) + (end.y * t),
		});

		const lineLength = Math.hypot(((end.x - start.x)), ((end.y - start.y)));
		const posAlongLine = lineLength - endR;
		const arrowHead = getCoordsAlongLine(posAlongLine / lineLength);
		const arrowTail = getCoordsAlongLine((posAlongLine - arrowLength) / lineLength);
		const arrowTailVertex = getCoordsAlongLine((posAlongLine - (arrowLength * (1 - arrowVlenRatio))) / lineLength);
		const cos = (arrowHead.y - arrowTail.y) / arrowLength;
		const sin = -(arrowHead.x - arrowTail.x) / arrowLength;

		context.beginPath();
		context.moveTo(arrowHead.x, arrowHead.y);
		context.lineTo(arrowTail.x + (arrowHalfWidth * cos), arrowTail.y + (arrowHalfWidth * sin));
		context.lineTo(arrowTailVertex.x, arrowTailVertex.y);
		context.lineTo(arrowTail.x - (arrowHalfWidth * cos), arrowTail.y - (arrowHalfWidth * sin));
		context.fill();
	}
};

const drawNodes = (nodes: Iterable<DrawNode>, context: CanvasContext) => {
	context.beginPath();
	for (const node of nodes) {
		if (node.shape === 'block') {
			context.rect(node.x, node.y, node.textWidth + 10, node.textHeight + 10);
		} else {
			context.moveTo(node.x + node.radius, node.y);
			context.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
		}
	}

	context.stroke();
	context.fill();
};
