import adapter from '@sveltejs/adapter-static';
import {vitePreprocess} from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		paths: {
			base: '/wikidata-graph-builder',
		},
		adapter: adapter(),
		appDir: 'internal',
	},
};

export default config;
