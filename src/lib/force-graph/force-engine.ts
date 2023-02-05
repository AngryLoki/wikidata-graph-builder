/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
	forceSimulation as d3ForceSimulation,
	forceLink as d3ForceLink,
	forceManyBody as d3ForceManyBody,
	forceCenter as d3ForceCenter,
	forceCollide as d3ForceCollide,
} from 'd3-force-3d';
import type {SparqlGraphData} from './graph-data';
import type {GraphEngineNotifier, LayoutEngine, NodeObject, Point} from './types';

const strengthFn = (node: NodeObject) => (node.edgesIn.length > 0 || node.edgesOut.length > 0) ? -50 : 0;

export class ForceEngine implements LayoutEngine {
	private graphData: SparqlGraphData | undefined;

	private readonly forceLayout = d3ForceSimulation()
		.force('link', d3ForceLink().distance(50).iterations(1))
		.force('charge', d3ForceManyBody().strength(strengthFn).distanceMax(200))
		.force('center', d3ForceCenter())
		.force('collide', d3ForceCollide().radius((node: NodeObject) => (node).radius * 1.5).strength(0.5))
	// .force('link', d3ForceLink().distance(30).iterations(1))
	// .force('charge', d3ForceManyBody().strength(-500).distanceMax(200))
	// .force('center', d3ForceCenter())
	// .force('collide', d3ForceCollide().radius((node: NodeObject) => (node).radius * 1.5).strength(0.5))
		.stop();

	private engineRunning = false;

	// How many times to tick the force engine at init before starting to render
	private get warmupTicks() {
		return 100;
	}

	private readonly _cooldownTicks: number = Number.POSITIVE_INFINITY;

	private get cooldownTime() {
		return 15_000;
	} // Ms

	private cntTicks = 0;
	private startTickTime = new Date();

	constructor(private readonly notifier: GraphEngineNotifier) {
		this.forceLayout.alphaDecay(1 - (0.001 ** (1 / 400)));
		this.forceLayout.velocityDecay(0.1);
	}

	public onDrag() {
		// Prevent freeze while dragging
		this.forceLayout.alphaTarget(0.3); // Keep engine running at low intensity throughout drag
		this.resetCountdown(); // Prevent freeze while dragging
	}

	public onDragEnd() {
		if (this.forceLayout.alphaTarget()) {
			this.forceLayout.alphaTarget(0); // Release engine low intensity
			this.resetCountdown(); // Let the engine readjust after releasing fixed nodes
		}
	}

	public setGraphData(graphData: SparqlGraphData, replace = true) {
		for (const node of graphData.nodes) {
			node.shape = 'point';
		}

		for (const link of graphData.viewLinks) {
			link.sections = undefined;
		}

		this.graphData = graphData;
		this.engineRunning = false;
		this.update(replace);
	}

	public isEngineRunning() {
		return Boolean(this.engineRunning);
	}

	public tickFrame() {
		if (!this.engineRunning) {
			return;
		}

		if (++this.cntTicks > this._cooldownTicks
			|| (Date.now() - Number(this.startTickTime)) > this.cooldownTime
			|| (this.d3AlphaMin > 0 && this.forceLayout.alpha() < this.d3AlphaMin)
		) {
			this.engineRunning = false;
			console.log('Engine was stopped');
		} else {
			this.forceLayout.tick();
		}
	}

	private update(replace: boolean) {
		if (!this.graphData) {
			return;
		}

		this.engineRunning = false;

		// Feed data to force-directed layout
		this.forceLayout
			.stop()
			.alpha(1) // Re-heat the simulation
			.nodes(this.graphData.nodes);

		// Add links (if link force is still active)
		const linkForce = this.forceLayout.force('link');
		if (linkForce) {
			linkForce
				.id((d: NodeObject) => d.id)
				.links(this.graphData.forceLinks);
		}

		if (replace) {
			// Initial ticks before starting to render
			for (let i = 0; (i < this.warmupTicks) && !(this.d3AlphaMin > 0 && this.forceLayout.alpha() < this.d3AlphaMin); i++) {
				this.forceLayout.tick();
			}
		}

		this.resetCountdown();

		if (!replace) {
			return;
		}

		let tl: Point | undefined;
		let br: Point | undefined;
		const pointOffset = 1;
		const graphPadding = 10;

		for (const node of this.graphData.nodes) {
			const rectTl = {x: node.x! - node.radius, y: node.y! - node.radius};
			const rectBr = {x: node.x! + node.radius + pointOffset + node.textWidth, y: node.y! + node.radius};

			if (tl) {
				if (rectTl.x < tl.x) {
					tl.x = rectTl.x!;
				}

				if (rectTl.y < tl.y) {
					tl.y = rectTl.y!;
				}
			} else {
				tl = {x: rectTl.x, y: rectTl.y};
			}

			if (br) {
				if (rectBr.x > br.x) {
					br.x = rectBr.x!;
				}

				if (rectBr.y > br.y) {
					br.y = rectBr.y!;
				}
			} else {
				br = {x: rectBr.x, y: rectBr.y};
			}
		}

		if (!tl || !br) {
			this.notifier.onLayoutComplete(0, 0, 100, 100);
		} else {
			const width = br.x - tl.x;
			const height = br.y - tl.y;
			this.notifier.onLayoutComplete(tl.x - graphPadding, tl.y - graphPadding, width + (2 * graphPadding), height + (2 * graphPadding));
		}
	}

	private get d3AlphaMin() {
		return 0;
	}

	private resetCountdown() {
		this.cntTicks = 0;
		this.startTickTime = new Date();
		this.engineRunning = true;
	}
}

