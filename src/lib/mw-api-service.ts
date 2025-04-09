import type {WikibaseEntity} from '$lib/wdtypes';
import {browser} from '$app/environment';

class ApiError extends Error {
	constructor(public statusCode: number, public response: Record<string, any>) {
		super('unexpected response code');
	}
}

type FetchFunction = (info: RequestInfo, init?: RequestInit | undefined) => Promise<Response>;
type WdQueryParameters = Record<string, string[] | string | number | boolean>;

export type QueryServiceInit = {
	server: string;
	apiEndpoint?: string;
	fetch?: FetchFunction;
};

export class MwApiService {
	public static getInstance(init: QueryServiceInit): MwApiService {
		MwApiService.instances[init.server] ||= new MwApiService(init);

		return MwApiService.instances[init.server];
	}

	private static readonly instances: Record<string, MwApiService> = {};

	private readonly server: string;
	private readonly apiEndpoint: string;
	private readonly fetch: FetchFunction;

	private constructor(init: QueryServiceInit) {
		this.server = init.server;
		this.apiEndpoint = init.apiEndpoint ?? '/w/api.php';
		this.fetch = init.fetch ?? (async (...arguments_) => fetch(...arguments_));
	}

	async getEntityData(entityId: string) {
		const headers = browser ? undefined : {
			'User-Agent': 'l-tools',
		};

		const url = `${this.server}/wiki/Special:EntityData/${entityId}.json`;
		const resp = await this.fetch(url, {headers});

		if (resp.status !== 200) {
			const json = await resp.json() as Record<string, any>;
			throw new ApiError(resp.status, json);
		}

		const entitiesData = await resp.json() as {entities: Record<string, WikibaseEntity>};

		return entitiesData.entities[entityId];
	}

	async call(query: WdQueryParameters, options: RequestInit = {}) {
		const headers: HeadersInit = {
			'Content-Type': 'application/x-www-form-urlencoded',
		};

		if (!browser) {
			headers['User-Agent'] = 'l-tools';
		}

		const queryEx = {
			errorformat: 'plaintext',
			format: 'json',
			formatversion: 2,
			origin: '*',
			...query,
		};

		const method = 'GET' as string;

		const parameters: RequestInit = {headers, method, ...options};

		const body = new URLSearchParams();
		for (const [key, value] of Object.entries(queryEx)) {
			if (Array.isArray(value)) {
				body.append(key, value.join('|'));
			} else if (typeof value === 'boolean' && value === true) {
				if (value === true) {
					// If the parameter is specified, regardless of value, it is considered true
					body.append(key, '');
				}
			} else {
				body.append(key, String(value));
			}
		}

		let url = this.server + this.apiEndpoint;

		if (method === 'POST') {
			parameters.body = body;
		} else {
			url += `?${body.toString()}`;
		}

		const resp = await this.fetch(url, parameters);

		if (resp.status !== 200) {
			const json = await resp.json() as Record<string, any>;
			throw new ApiError(resp.status, json);
		}

		return await resp.json() as Record<string, any>;
	}

	async * callGen(query: WdQueryParameters) {
		const field = query?.action === 'wbgetentities'
			? 'entities'
			: (('generator' in query || 'titles' in query || 'pageids' in query || 'revids' in query) ? 'pages' : query.list as string);
		const chunkSize = 50;

		let queryField: string | undefined;
		if (query?.action === 'wbgetentities') {
			if ('ids' in query) {
				queryField = 'ids';
			} else if ('titles' in query) {
				queryField = 'titles';
			}
		} else if ('titles' in query) {
			queryField = 'titles';
		} else if ('pageids' in query) {
			queryField = 'pageids';
		} else if ('pages' in query) {
			queryField = 'pages';
		}

		if (queryField) {
			const queryFieldValues = query[queryField] as string[];

			const promises = [];
			for (let i = 0; i < queryFieldValues.length; i += chunkSize) {
				query = {...query};
				query[queryField] = queryFieldValues.slice(i, i + chunkSize);
				promises.push(this.processChunk(query));
			}

			for (const chunk of await Promise.all(promises)) {
				for (const item of chunk) {
					yield item;
				}
			}

			return;
		}

		for (;;) {
			/* eslint-disable-next-line no-await-in-loop */
			const resp = await this.call(query);

			if (!('query' in resp)) {
				console.error('Unexpected response', resp);
				throw new Error('Unexpected response');
			}

			for (const item of resp.query[field]) {
				yield item as Record<string, any>;
			}

			if (resp.continue) {
				query = {...query, ...resp.continue as Record<string, string>};
			} else {
				break;
			}
		}
	}

	private async processChunk(query: WdQueryParameters) {
		const out: Array<Record<string, any>> = [];

		for (;;) {
			/* eslint-disable-next-line no-await-in-loop */
			const resp = await this.call(query);
			if ('entities' in resp) {
				return Object.values(resp.entities as Record<string, Record<string, any>>);
			}

			if ('query' in resp) {
				for (const item of resp.query.pages) {
					if (query.prop === 'revisions' && item.revisions?.[0]) {
						out.push(item as Record<string, any>);
					}
				}

				if (resp.continue) {
					query = {...query, ...resp.continue as Record<string, string>};
				} else {
					break;
				}
			}
		}

		return out;
	}
}
