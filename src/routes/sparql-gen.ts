export type AppMode = 'forward' | 'reverse' | 'both' | 'undirected' | 'wdqs';

export type QueryParameters = {
	property: string | undefined;
	item: string | undefined;
	language: string;
	iterations: number | undefined;
	limit: number | undefined;
	mode: AppMode;
	wdqs: string | undefined;
	sizeProperty: string | undefined;
	special?: {
		instanceOrSubclass?: boolean;
	};
};

export const queryParametersIsValid = (state: QueryParameters) =>
	(state.mode === 'wdqs' && state.wdqs !== undefined && state.wdqs?.length > 0)
|| (state.language?.length > 0 && state.item !== undefined && state.property !== undefined);

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const useGas = (data: QueryParameters) => (data.limit !== 0) || (data.iterations !== 0) || (data.mode === 'undirected');

export type GenerateSparqlClauseOptions = Record<string, unknown>;

const generateSparqlClause = (options: QueryParameters, mode = options.mode): string => {
	if (mode === 'both') {
		return `{ ${generateSparqlClause(options, 'forward')} } UNION { ${generateSparqlClause(options, 'reverse')} }`;
	}

	if (useGas(options)) {
		return `\
SERVICE gas:service {
    gas:program gas:gasClass "com.bigdata.rdf.graph.analytics.SSSP" ;
                gas:in wd:${options.item!} ;
                gas:traversalDirection "${capitalize(mode)}" ;
                gas:out ?item ;
                gas:out1 ?depth ;${
	options.iterations ? `\n                gas:maxIterations ${options.iterations} ;` : ''
}${
	options.limit ? `\n                gas:maxVisited ${options.limit} ;` : ''
}
                gas:linkType wdt:${options.property!} .
  }\
`;
	}

	if (mode === 'forward') {
		return `wd:${options.item!} wdt:${options.property!}* ?item`;
	}

	if (mode === 'reverse') {
		return `?item wdt:${options.property!}* wd:${options.item!}`;
	}

	return '';
};

export const generateQuery = (options: QueryParameters | undefined) => {
	if (!options || !queryParametersIsValid(options)) {
		return;
	}

	if (options.mode === 'wdqs') {
		return options.wdqs;
	}

	if (!options.item || !options.property) {
		return;
	}

	const out = useGas(options) ? 'PREFIX gas: <http://www.bigdata.com/rdf/gas#>\n\n' : '';
	const language = options.language === 'en' ? 'en,mul' : (options.language + ',mul,en');
	const languageService = `SERVICE wikibase:label {bd:serviceParam wikibase:language "${language}" }`;

	if (options.special?.instanceOrSubclass) {
		const clauses: string[] = [];

		if (options.mode === 'forward' || options.mode === 'both') {
			clauses.push(`\
				{
					BIND(wd:${options.item} AS ?item)
					OPTIONAL { ?item wdt:P31 ?linkTo BIND("instance" AS ?linkType) }
				}
				UNION
				{
					wd:${options.item} wdt:P279* ?item
					OPTIONAL { ?item wdt:P279 ?linkTo }
				}
				UNION
				{
					wd:${options.item} wdt:P31 ?instance .
					?instance wdt:P279* ?item .
					OPTIONAL { ?item wdt:P279 ?linkTo }
				}\
				`);
		}

		if (options.mode === 'reverse' || options.mode === 'both') {
			clauses.push(`\
				{
					?item wdt:P279* wd:${options.item}
					OPTIONAL { ?item wdt:P279 ?linkTo }
				}
				UNION
				{
					?class wdt:P279* wd:${options.item} .
					?item wdt:P31 ?class .
					OPTIONAL { ?item wdt:P31 ?linkTo BIND("instance" AS ?linkType) }
				}\
				`);
		}

		return `\
			SELECT DISTINCT ?item ?itemLabel ?linkTo ?linkType {
				${clauses.join('\nUNION\n')}
				${languageService}
			}\
			`;
	}

	if (options.sizeProperty) {
		return out
        + `\
  SELECT ?item ?itemLabel ?linkTo ?size {
    { SELECT ?item (count(distinct ?element) as ?size) {
    ${generateSparqlClause(options)}
    OPTIONAL { ?element wdt:${options.sizeProperty} ?item }
    } GROUP BY ?item }
    OPTIONAL { ?item wdt:${options.property} ?linkTo }
    ${languageService}
  }\
  `;
	}

	return out
    + `\
SELECT ?item ?itemLabel ?linkTo {
${generateSparqlClause(options)}
OPTIONAL { ?item wdt:${options.property} ?linkTo }
${languageService}
}\
`;
};
