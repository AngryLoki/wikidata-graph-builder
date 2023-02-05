import type {AutocompleteItem, AutocompleteResult, ValueItem} from '../common/autocomplete-input';
import {MwApiService} from '$lib/mw-api-service';
import makeCachedFunction from '$lib/utils/make-cached-function';

export const languageSearch = async (search: string, abortSignal: AbortSignal): Promise<AutocompleteResult> => {
	if (search.length === 0) {
		return {autocompleteItems: []};
	}

	const query: Record<string, any> = {
		action: 'languagesearch',
		search,
		smaxage: 7 * 24 * 3600,
		maxage: 7 * 24 * 3600,
	};

	const wikidataClient = MwApiService.getInstance({
		server: 'https://www.wikidata.org',
	});

	type SearchResults = {
		languagesearch: Record<string, string>;
	};

	const resp = (await wikidataClient.call(query, {signal: abortSignal})) as SearchResults;
	const allLanguages = await getCachedLanguagesMap();

	const autocompleteItems: AutocompleteItem[] = Object.entries(resp.languagesearch)
		.filter(([id, _]) => allLanguages[id])
		.map(([id, value]) => ({
			value: {
				id,
				label: {
					language: id,
					value: allLanguages[id],
				},
			},
			match: {
				language: id,
				text: value,
			},
		}));

	return {autocompleteItems};
};

const getLanguagesMap = async () => {
	const parameters = {
		action: 'query',
		meta: 'siteinfo',
		siprop: 'languages',
		smaxage: 7 * 24 * 3600,
		maxage: 7 * 24 * 3600,
	};

	const wikidataClient = MwApiService.getInstance({
		server: 'https://www.wikidata.org',
	});

	type QuerySiteinfoLanguagesResult = {
		batchcomplete: true;
		query: {
			languages: Array<{
				code: string;
				bcp47: string;
				name: string;
			}>;
		};
	};

	const response = (await wikidataClient.call(parameters)) as QuerySiteinfoLanguagesResult;
	return Object.fromEntries(response.query.languages.map(element => [element.code, element.name]));
};

const getCachedLanguagesMap = makeCachedFunction('allLanguages', getLanguagesMap, 7 * 24 * 3600 * 1000, 1);

export const resolveLanguage = async (id: string, abortSignal: AbortSignal): Promise<ValueItem | undefined> => {
	const languages = await getCachedLanguagesMap();

	const value = languages[id];
	if (value === undefined) {
		return;
	}

	return {
		id,
		label: {
			value: languages[id],
			language: id,
		},
	};
};
