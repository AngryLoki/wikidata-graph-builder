# [Wikidata Graph Builder](https://angryloki.github.io/wikidata-graph-builder/)
Visualize [Wikidata](https://www.wikidata.org) items using [d3.js](http://d3js.org/).

## Main features
* Forward and backward graph traversal using [RDF GAS API](https://github.com/blazegraph/database/wiki/RDF_GAS_API)
* Support for various languages for item labels
* Limits for number of iterations and number of items in graph
* SPARQL query generation for [Wikidata Query Service](https://query.wikidata.org/) and links to [Wikidata generic tree](https://tools.wmflabs.org/wikidata-todo/tree.html)

## Developing

Once you've created a project and installed dependencies with `pnpm install`, start a development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.
