import {GraphEngine} from './graph-engine';
import type {GraphNotifier} from './types';

const graphNotifier = new Proxy<GraphNotifier>({} as unknown as GraphNotifier, {
	get(_target, prop, _receiver) {
		return (...args: any) => {
			postMessage([prop, ...args]);
		};
	},
});

let graphEngine: GraphEngine;

onmessage = ({data}) => {
	const [method, ...args] = data;

	if (method === 'init') {
		graphEngine = new GraphEngine(args[0], args[1], graphNotifier);
	} else {
		const f = (graphEngine as any)[method] as (...args: any) => void;
		f.bind(graphEngine)(...args);
	}
};
