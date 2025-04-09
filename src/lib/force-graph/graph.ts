import {zoom as d3Zoom, zoomTransform as d3ZoomTransform, type D3ZoomEvent} from 'd3-zoom';
import {select as d3Select, type Selection} from 'd3-selection';
import {drag as d3Drag, type D3DragEvent} from 'd3-drag';
import {writable} from 'svelte/store';
import type {
	GraphEngineNotifier, GraphNotifier, GraphState, Point, VisParameters,
} from './types';

const zoom2NodesFactor = 4;

export class Graph implements GraphNotifier {
	public static async create(canvas: HTMLCanvasElement, visParameters: VisParameters) {
		const useOffscreenCanvas = Boolean(HTMLCanvasElement.prototype.transferControlToOffscreen);

		if (!useOffscreenCanvas) {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			const {GraphEngine} = await import('$lib/force-graph/graph-engine');
			const createCanvasNotifier = (self: GraphNotifier) => new GraphEngine(canvas, visParameters, self);
			return new Graph(canvas, createCanvasNotifier);
		}

		// eslint-disable-next-line @typescript-eslint/naming-convention
		const {default: GraphEngineWorker} = await import('$lib/force-graph/graph-engine.worker?worker');

		const createCanvasNotifier = (self: GraphNotifier) => {
			const worker = new GraphEngineWorker();

			worker.addEventListener('message', (event: MessageEvent<any>) => {
				const [method, ...arguments_] = event.data;
				const f = (self as any)[method] as (...arguments_: any) => void;
				f.bind(self)(...arguments_); // eslint-disable-line @typescript-eslint/no-unsafe-argument
			});

			const shadowCanvas = canvas.transferControlToOffscreen();
			worker.postMessage(['init', shadowCanvas, visParameters], [shadowCanvas]);

			const proxy = new Proxy<GraphEngineNotifier>({} as unknown as GraphEngineNotifier, {
				get(_target, property, _receiver) {
					return (...arguments_: any) => {
						if (property === 'destroy') {
							worker.terminate();
							return;
						}

						worker.postMessage([property, ...arguments_]);
					};
				},
			});

			return proxy;
		};

		return new Graph(canvas, createCanvasNotifier);
	}

	readonly tooltip = writable<string | undefined>();
	readonly isHover = writable<boolean>(false);
	readonly state = writable<GraphState>('ok');
	readonly error = writable<string | undefined>();
	readonly isDragging = writable<boolean>(false);
	readonly pointerPos = writable<Point>({x: -1e12, y: -1e12});

	private readonly resizeObserver: ResizeObserver;

	private width = 0;
	private height = 0;

	private readonly zoomBehavior = d3Zoom<HTMLCanvasElement, unknown>();
	private readonly graphEngine: GraphEngineNotifier;

	// eslint-disable-next-line @typescript-eslint/ban-types
	private readonly d3Canvas: Selection<HTMLCanvasElement, unknown, null, undefined>;
	private hoverNodeId: string | undefined;
	private draggable = true;

	private constructor(private canvas: HTMLCanvasElement, createCanvasNotifier: (self: GraphNotifier) => GraphEngineNotifier) {
		this.graphEngine = createCanvasNotifier(this);

		let pointerPos = {x: -1e12, y: -1e12};

		this.d3Canvas = d3Select(this.canvas);

		this.zoomBehavior
			.on('zoom', (event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
				this.graphEngine.onZoomTransform({x: event.transform.x, y: event.transform.y, k: event.transform.k});
			})
			.on('end', (_event: D3ZoomEvent<HTMLCanvasElement, unknown>) => {
				this.graphEngine.onZoomTransformEnd();
			});

		const dragSubject = () => this.draggable ? this.hoverNodeId : undefined;

		const onDragStart = (event: D3DragEvent<HTMLCanvasElement, unknown, string>) => {
			this.isDragging.set(true);
			const nodeId = event.subject;
			this.graphEngine.onDragStart(nodeId, event.active);
		};

		const onDrag = (event: D3DragEvent<HTMLCanvasElement, unknown, string>) => {
			const nodeId = event.subject;
			const [x, y] = d3ZoomTransform(this.canvas).invert([event.x, event.y]);
			this.graphEngine.onDrag(nodeId, {x, y});
		};

		const onDragEnd = (event: D3DragEvent<HTMLCanvasElement, unknown, string>) => {
			const nodeId = event.subject;
			this.isDragging.set(false);
			this.graphEngine.onDragEnd(nodeId);
		};

		const dragBehavior = d3Drag<HTMLCanvasElement, unknown>().subject(dragSubject).on('start', onDragStart).on('drag', onDrag).on('end', onDragEnd);

		this.d3Canvas.call(dragBehavior).call(this.zoomBehavior);

		this.resizeObserver = new ResizeObserver(() => {
			this.adjustCanvasSize();
		});

		this.resizeObserver.observe(canvas);
		this.adjustCanvasSize();

		// Capture pointer coords on move or touchstart
		const listener = (event: PointerEvent) => {
			if (event.type === 'pointerdown') {
				this.graphEngine.onPointerDown();
			}

			const rect = canvas.getBoundingClientRect();
			const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
			const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
			const offset = {top: rect.top + scrollTop, left: rect.left + scrollLeft};
			pointerPos = {x: event.pageX - offset.left, y: event.pageY - offset.top};
			this.pointerPos.set(pointerPos);
			this.graphEngine.setPointerPos(pointerPos);
		};

		canvas.addEventListener('pointermove', listener, {passive: true});
		canvas.addEventListener('pointerdown', listener, {passive: true});

		// Handle click/touch events on nodes/links
		canvas.addEventListener('pointerup', event => {
			this.graphEngine.onPointerUp(event.button);
		}, {passive: true});
	}

	public load(query: string, rootNode: string | undefined) {
		void this.graphEngine.load(query, rootNode);
	}

	public setVisParameters(visParameters: VisParameters) {
		this.draggable = visParameters.graphDirection === 'none';

		this.graphEngine.setVisParameters(visParameters);
	}

	public destroy() {
		this.resizeObserver.unobserve(this.canvas);
		this.graphEngine.destroy();
	}

	public setTooltip(tooltip: string | undefined) {
		this.tooltip.set(tooltip);
	}

	public setHoverNodeId(nodeId: string | undefined) {
		this.hoverNodeId = nodeId;
		this.isHover.set(nodeId !== undefined);
	}

	public onNodeClicked(url: string) {
		window.open(url, '_blank');
	}

	public onLayoutComplete(x: number, y: number, width: number, height: number) {
		const zoomK = Math.max(1e-12, Math.min(1e12,
			this.canvas.width / width,
			this.canvas.height / height,
		)) / window.devicePixelRatio;

		this.zoomBehavior.translateTo(this.d3Canvas, x + (width / 2), y + (height / 2));
		this.zoomBehavior.scaleTo(this.d3Canvas, zoomK);
		this.graphEngine.requestRedraw();
	}

	public setState(state: GraphState): void {
		this.state.set(state);
	}

	public setError(error: string | undefined): void {
		this.error.set(error);
	}

	private adjustCanvasSize() {
		const oldWidth = this.width;
		const oldHeight = this.height;

		this.width = this.canvas.clientWidth;
		this.height = this.canvas.clientHeight;

		this.graphEngine.adjustCanvasSize(this.canvas.clientWidth, this.canvas.clientHeight, window.devicePixelRatio);

		// Relative center panning based on 0,0
		const k = d3ZoomTransform(this.canvas).k;
		this.zoomBehavior.translateBy(this.d3Canvas,
			(this.width - oldWidth) / 2 / k,
			(this.height - oldHeight) / 2 / k,
		);

		this.graphEngine.requestRedraw();
	}
}
