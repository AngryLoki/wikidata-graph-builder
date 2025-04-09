import {
	generateQuery, type AppMode, type QueryParameters, queryParametersIsValid,
} from './sparql-gen';
import {goto} from '$app/navigation';
import type {GraphLayout, ShortcutsMode, VisParameters} from '$lib/force-graph/types';

export const defaultLanguage = 'en';
export const defaultIterations = 0;
export const defaultLimit = 0;
export const defaultMode: AppMode = 'forward';
export const defaultShortcutsMode: ShortcutsMode = 'preserve';
export const defaultShortcutsColor = '#000000';
export const defaultShortcutsWidth = 1;
export const defaultGraphLayout: GraphLayout = 'none';

export const modes: Record<AppMode, string> = {
	forward: 'Forward',
	reverse: 'Reverse',
	both: 'Bidirectional',
	undirected: 'Undirected',
	wdqs: 'SPARQL query',
};

export const shortcutsModes: Record<ShortcutsMode, string> = {
	preserve: 'Preserve',
	remove: 'Remove',
	relax: 'Relax',
};

export const graphLayouts: Record<GraphLayout, string> = {
	none: 'Force-directed',
	down: 'Top to bottom',
	up: 'Bottom to top',
	right: 'Left to right',
	left: 'Right to left',
};

export type AppParameters = {
	queryParameters: QueryParameters;
	visParameters: VisParameters;
};

// eslint-disable-next-line complexity
export const parseUrlParameters = (parameters: URLSearchParams = new URLSearchParams()): AppParameters => {
	const property = /^P\d+$/.test(parameters.get('property') ?? '')
		? parameters.get('property')!
		: undefined;
	const item = /^Q\d+$/.test(parameters.get('item') ?? '')
		? parameters.get('item')!
		: undefined;
	const language = /^[a-z-]{2,}$/.test(parameters.get('lang') ?? '')
		? parameters.get('lang')!
		: defaultLanguage;
	const iterations = /^\d+$/.test(parameters.get('iterations') ?? '')
		? Number.parseInt(parameters.get('iterations')!, 10)
		: defaultIterations;
	const limit = /^\d+$/.test(parameters.get('limit') ?? '')
		? Number.parseInt(parameters.get('limit')!, 10)
		: defaultLimit;
	const instanceOrSubclass = parameters.get('instance_or_subclass') === '1';

	const modeRaw = parameters.get('mode') ?? parameters.get('direction');
	const mode
            = modeRaw && modes[modeRaw as AppMode] ? (modeRaw as AppMode) : defaultMode;
	const wdqs = parameters.get('wdqs') ?? undefined;
	const sizeProperty = /^P\d+$/.test(parameters.get('size_property') ?? '')
		? parameters.get('size_property')!
		: undefined;

	const queryParameters: QueryParameters = {
		property, item, language, iterations, limit, mode, wdqs, sizeProperty, special: {instanceOrSubclass},
	};

	const shortcutsModeRaw = parameters.get('sc') as ShortcutsMode;
	const shortcutsMode = shortcutsModes[shortcutsModeRaw] ? shortcutsModeRaw : defaultShortcutsMode;

	const shortcutsColor = /^#[\da-fA-F]{6}|#[\da-fA-F]{8}$/.test(parameters.get('sc_color') ?? '')
		? parameters.get('sc_color')!
		: defaultShortcutsColor;

	const shortcutsWidth = /^\d+$/.test(parameters.get('sc_width') ?? '')
		? Number.parseInt(parameters.get('sc_width')!, 10)
		: defaultShortcutsWidth;

	const graphLayoutRaw = parameters.get('graph_direction') as GraphLayout;
	const graphLayout = graphLayouts[graphLayoutRaw] ? graphLayoutRaw : defaultGraphLayout;

	const visParameters: VisParameters = {
		shortcutsMode,
		shortcutsColor,
		shortcutsWidth,
		graphDirection: graphLayout,
	};

	return {queryParameters, visParameters};
};

export const updateUrl = async (query: QueryParameters, vis: VisParameters, replaceState: boolean) => {
	const parameters = new URLSearchParams();

	if (query.item) {
		parameters.append('item', query.item);
	}

	if (query.property) {
		parameters.append('property', query.property);
	}

	if (query.mode !== defaultMode) {
		parameters.append('mode', query.mode);
	}

	if (query.limit !== undefined && query.limit !== defaultLimit) {
		parameters.append('limit', query.limit.toString());
	}

	if (query.iterations !== undefined && query.iterations !== defaultIterations) {
		parameters.append('iterations', query.iterations.toString());
	}

	if (query.language !== defaultLanguage) {
		parameters.append('lang', query.language);
	}

	if (query.wdqs && query.mode === 'wdqs') {
		parameters.append('wdqs', query.wdqs);
	}

	if (query.sizeProperty) {
		parameters.append('size_property', query.sizeProperty);
	}

	if (vis.shortcutsMode !== defaultShortcutsMode) {
		parameters.append('sc', vis.shortcutsMode);
	}

	if (vis.shortcutsColor !== defaultShortcutsColor) {
		parameters.append('sc_color', vis.shortcutsColor);
	}

	if (vis.shortcutsWidth !== defaultShortcutsWidth) {
		parameters.append('sc_width', vis.shortcutsWidth.toString());
	}

	if (vis.graphDirection !== defaultGraphLayout) {
		parameters.append('graph_direction', vis.graphDirection);
	}

	if (query.special?.instanceOrSubclass) {
		parameters.append('instance_or_subclass', '1');
	}

	await goto('?' + parameters.toString(), {replaceState});
};

const wdqsLink = function (state: QueryParameters) {
	const query = '#defaultView:Graph\n' + generateQuery(state)!;
	return 'https://query.wikidata.org/#' + encodeURIComponent(query);
};

const listLink = (state: QueryParameters) => {
	let url = 'https://tools.wmflabs.org/wikidata-todo/tree.html?q=' + (state.item!.slice(1));

	if (state.mode === 'reverse' || state.mode === 'both') {
		url += '&rp=' + (state.property!.slice(1));
	}

	if (state.mode === 'forward' || state.mode === 'both') {
		url += '&p=' + (state.property!.slice(1));
	}

	if (state.iterations !== 0) {
		url += `&depth=${state.iterations ?? 0}`;
	}

	if (state.language !== 'en') {
		url += `&lang=${state.language ?? 'en'}`;
	}

	return url;
};

export const getLinks = (state: QueryParameters) => {
	if (!queryParametersIsValid(state)) {
		return [];
	}

	const links = [{
		text: 'Wikidata Query Service',
		link: wdqsLink(state),
	}];

	if (state.mode === 'forward' || state.mode === 'reverse') {
		links.push({
			text: 'Wikidata generic tree',
			link: listLink(state),
		});
	}

	return links;
};
