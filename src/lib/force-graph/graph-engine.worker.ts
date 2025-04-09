import {GraphEngine} from './graph-engine';
import type {Canvas, GraphNotifier, VisParameters} from './types';

const graphNotifier = new Proxy<GraphNotifier>({} as unknown as GraphNotifier, {
	get(_target, property, _receiver) {
		return (...arguments_: any) => {
			postMessage([property, ...arguments_]);
		};
	},
});

let graphEngine: GraphEngine;

type WorkerMessage = ['init', Canvas, VisParameters];

onmessage = ({data}: MessageEvent<WorkerMessage>) => {
	const [method, ...arguments_] = data;

	if (method === 'init') {
		graphEngine = new GraphEngine(arguments_[0], arguments_[1], graphNotifier);
	} else {
		const f = (graphEngine as any)[method] as (...arguments_: any) => void;
		f.bind(graphEngine)(...arguments_);
	}
};
