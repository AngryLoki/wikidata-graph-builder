import type {AutocompleteItem, AutocompleteResult, LangValue, LoadMoreFunction, ValueItem} from '../common/autocomplete-input';
import {MwApiService} from '$lib/mw-api-service';
import type {WikibaseEntityCommon} from '$lib/wdtypes';

export type ValueType = 'property' | 'item';

// eslint-disable-next-line max-params
export const searchEntities = async (type: ValueType, search: string, language: string | undefined, abortSignal: AbortSignal, after?: number): Promise<AutocompleteResult> => {
	if (language === undefined) {
		language = 'en';
	}

	let autocompleteItems: AutocompleteItem[] | undefined = [];
	let loadMore: LoadMoreFunction;

	if (search.length === 0) {
		return {autocompleteItems, loadMore};
	}

	const query: Record<string, any> = {
		action: 'wbsearchentities',
		type: type as string,
		search,
		language,
		uselang: language,
	};

	if (after) {
		query.continue = after;
	}

	const wikidataClient = MwApiService.getInstance({
		server: 'https://www.wikidata.org',
	});

	type SearchResult = {
		id: string;
		title: string;
		pageid: number;
		display: {
			label?: LangValue;
			description?: LangValue;
		};
		repository: string;
		url: string;
		datatype: string;
		concepturi: string;
		label: string;
		description: string;
		match: {
			language: string;
			text: string;
			type: string;
		};
		aliases: string[];
	};

	type SearchResults = {
		search: SearchResult[];
		'search-continue'?: number;
		searchinfo: {search: string};
		success: 1;
	};

	const resp = (await wikidataClient.call(query, {signal: abortSignal})) as SearchResults;
	autocompleteItems = resp.search.map(item => ({
		value: {
			id: item.id,
			label: item.display.label,
			description: item.display.description,
			language,
		},
		match: item.match,
	}));

	if (resp['search-continue']) {
		loadMore = async (abortSignal: AbortSignal) => searchEntities(type, search, language, abortSignal, resp['search-continue']);
	}

	return {
		autocompleteItems,
		loadMore,
	};
};

export const getEntity = async (id: string, language: string | undefined, abortSignal: AbortSignal): Promise<ValueItem | undefined> => {
	if (language === undefined) {
		language = 'en';
	}

	type WbGetEntitiesResultMissing = {
		id: string;
		missing: '';
	};

	type WbGetEntitiesResult = {
		entities: Record<string, WikibaseEntityCommon | WbGetEntitiesResultMissing>;
	};

	const parameters = {
		action: 'wbgetentities',
		ids: id,
		languages: language,
		props: ['labels', 'descriptions'],
		languagefallback: true,
	};

	const wikidataClient = MwApiService.getInstance({
		server: 'https://www.wikidata.org',
	});

	const response = (await wikidataClient.call(parameters, {signal: abortSignal})) as WbGetEntitiesResult;
	if (!response.entities) {
		return;
	}

	if ((response.entities[id] as WbGetEntitiesResultMissing).missing) {
		return;
	}

	const result = response.entities[id] as WikibaseEntityCommon;

	return {
		id: result.id,
		label: result.labels[language],
		description: result.labels[language],
		language,
	};
};
