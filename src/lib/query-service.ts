import makeChunkedFunction from './utils/make-chunked-function';
import {browser} from '$app/environment';

type FetchFn = (url: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;

export type QueryServiceInit = {
	endpointUrl?: string;
	fetch?: FetchFn | undefined;
};

export type QueryResponseValue = {
	value: string | undefined;
	type: string;
};

export type QueryResponseBinding = Record<string, QueryResponseValue>;

export type QueryResponse = {
	head: {
		vars: string[];
	};
	results: {
		bindings: QueryResponseBinding[];
	};
};

export class QueryService {
	public static getInstance(init: QueryServiceInit = {}): QueryService {
		const endpointUrl = init.endpointUrl ?? 'https://query.wikidata.org/sparql';
		if (!QueryService.instances[endpointUrl]) {
			QueryService.instances[endpointUrl] = new QueryService(init);
		}

		return QueryService.instances[endpointUrl];
	}

	private static instances: Record<string, QueryService> = {};

	ask = makeChunkedFunction(async (queries: string[]) => this.askMany(queries), 50);

	private readonly endpointUrl: string;
	private readonly fetch: FetchFn;

	private constructor(init: QueryServiceInit = {}) {
		this.endpointUrl = init.endpointUrl ?? 'https://query.wikidata.org/sparql';
		this.fetch = init.fetch ?? (async (...args) => fetch(...args));
	}

	async get(query: string, options: RequestInit = {}) {
		const items = await this.request(query, options) as QueryResponse;
		return items.results.bindings;
	}

	async getFlat(query: string, options: RequestInit = {}) {
		const items = await this.get(query, options);
		const out: Array<Record<string, string>> = [];
		for (const item of items) {
			const flat: Record<string, string> = {};
			for (const [k, v] of Object.entries(item)) {
				flat[k] = v.value!;
			}

			out.push(flat);
		}

		return out;
	}

	async askOne(query: string, options: RequestInit = {}) {
		const response = await this.request(query, options) as {boolean: boolean};
		return response.boolean;
	}

	async request(query: string, options: RequestInit = {}) {
		const parameters = new URLSearchParams({
			query,
		});
		const headers: HeadersInit = {
			// eslint-disable-next-line @typescript-eslint/naming-convention
			Accept: 'application/sparql-results+json',
		};

		if (!browser) {
			headers['User-Agent'] = 'l-tools';
		}

		const init: RequestInit = {headers, ...options};
		let url = this.endpointUrl;
		if (query.length > 2000) {
			init.body = parameters;
			init.method = 'POST';
			headers['Content-type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
		} else {
			url += `?${parameters.toString()}`;
		}

		const response = await this.fetch(url, init);

		if (!response.ok) {
			throw new Error(`Failed to execute query: request failed with code ${response.status}`);
		}

		return await response.json() as Record<string, any>;
	}

	private async askMany(queries: string[]) {
		const subqueries = queries.map((x, i) => `{ ${x.trim().replace(/^ASK/, `SELECT ("${i}" as ?r)`)} LIMIT 1 }`);

		const query = `SELECT * {
			${subqueries.join('\nUNION\n')}
		}`;

		const results = await this.getFlat(query);
		const trueItems = new Set(results.map(({r}) => Number.parseInt(r, 10)));

		return Object.fromEntries(queries.map((x, i) => [x, trueItems.has(i)]));
	}
}

