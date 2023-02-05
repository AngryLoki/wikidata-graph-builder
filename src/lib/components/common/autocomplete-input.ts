export type LangValue = {
	language: string;
	value: string;
};

export type ValueItem = {
	id: string;
	label: LangValue | undefined;
	description?: LangValue | undefined;
	language?: string;
};

export type AutocompleteItem = {
	value: ValueItem;
	match?: {
		text: string;
		language: string;
	};
};

export type LoadMoreFunction = ((abortSignal: AbortSignal) => Promise<AutocompleteResult>) | undefined;

export type AbortFunction = (() => void) | undefined;

export type AutocompleteResult = {
	autocompleteItems: AutocompleteItem[];
	loadMore?: LoadMoreFunction;
};

export type AutocompleteFunction = (search: string, abortSignal: AbortSignal) => Promise<AutocompleteResult>;

export type ResolveFunction = (value: string, abortSignal: AbortSignal) => Promise<ValueItem | undefined>;
