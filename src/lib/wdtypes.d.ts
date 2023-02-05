type WikibaseEntityCommon = {
	pageid: number;
	ns: number;
	title: string;
	lastrevid: number;
	modified: string;

	id: string;
	labels: Record<string, Description>;
	descriptions: Record<string, Description>;
	aliases: Record<string, Description[]>;
	claims: Record<string, Claim[]>;
};

export type WikibaseItem = WikibaseEntityCommon & {
	type: 'item';
	sitelinks: Record<string, Sitelink>;
};

type PropertyDatatype = 'commonsMedia' | 'geo-shape' | 'tabular-data' | 'url' |
'external-id' | 'wikibase-item' | 'wikibase-property' | 'globe-coordinate' |
'monolingualtext' | 'quantity' | 'string' | 'time' | 'musical-notation' |
'math' | 'wikibase-lexeme' | 'wikibase-form' | 'wikibase-sense';

export type WikibaseProperty = WikibaseEntityCommon & {
	type: 'property';
	datatype: PropertyDatatype;
};

export type WikibaseEntity = WikibaseItem | WikibaseProperty;

type Sitelink = {
	site: string;
	title: string;
	badges: unknown[];
	url: string;
};

type Description = {
	language: string;
	value: string;
};

type Claim = {
	mainsnak: Snak;
	type?: 'statement';
	qualifiers?: Record<string, Snak[]>;
	'qualifiers-order'?: string[];
	references?: Reference[];
	id?: string;
	rank?: 'normal' | 'preferred' | 'deprecated';
};

type Reference = {
	hash?: string;
	snaks: Record<string, Snak[]>;
	'snaks-order'?: string[];
};

type Snak = SnakOther | SnakValue;

type SnakOther = {
	snaktype: 'somevalue' | 'novalue';
	property: string;
	hash?: string;
	datatype: PropertyDatatype;
};

type SnakValue = SnakString | SnakItemId | SnakPropertyId | SnakLexemeId | SnakFormId | SnakSenseId |
SnakMonolingualText | SnakGlobeCoordinate | SnakQuantity | SnakTime;

type SnakString = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'string' | 'url' | 'commonsMedia' | 'external-id' | 'tabular-data' | 'geo-shape';
	datavalue: StringValue;
};

type SnakItemId = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'wikibase-item';
	datavalue: WikibaseItemEntityIdValue;
};

type SnakPropertyId = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'wikibase-property';
	datavalue: WikibasePropertyEntityIdValue;
};

type SnakLexemeId = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'wikibase-lexeme';
	datavalue: WikibaseLexemeEntityIdValue;
};

type SnakFormId = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'wikibase-form';
	datavalue: WikibaseFormEntityIdValue;
};

type SnakSenseId = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'wikibase-sense';
	datavalue: WikibaseSenseEntityIdValue;
};

type SnakMonolingualText = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'monolingualtext';
	datavalue: MonolingualTextValue;
};

type SnakGlobeCoordinate = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'globe-coordinate';
	datavalue: GlobeCoordinateValue;
};

type SnakQuantity = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'quantity';
	datavalue: QuantityValue;
};

type SnakTime = {
	snaktype: 'value';
	property: string;
	hash?: string;
	datatype: 'time';
	datavalue: TimeValue;
};

type QuantityValue = {
	type: 'quantity';
	value: 	{
		// Implicit part of the string (mapping of unit prefix is unclear)
		amount: string;
		// Quantity's lower bound
		lowerBound?: string;
		// Quantity's upper bound
		upperBound?: string;
		// Implicit part of the string that defaults to "1" (mapping to standardizing body is unclear)
		unit: string;
	};
};

type StringValue = {
	type: 'string';
	value: 	string;
};

type WikibaseItemEntityIdValue = {
	type: 'wikibase-entityid';
	value: 	{
		'entity-type': 'item';
		id: string;
		'numeric-id'?: number;
	};
};

type WikibasePropertyEntityIdValue = {
	type: 'wikibase-entityid';
	value: 	{
		'entity-type': 'property';
		id: string;
		'numeric-id'?: number;
	};
};

type WikibaseLexemeEntityIdValue = {
	type: 'wikibase-entityid';
	value: 	{
		'entity-type': 'lexeme';
		id: string;
		'numeric-id'?: number;
	};
};

type WikibaseFormEntityIdValue = {
	type: 'wikibase-entityid';
	value: 	{
		'entity-type': 'form';
		id: string;
		'numeric-id'?: number;
	};
};

type WikibaseSenseEntityIdValue = {
	type: 'wikibase-entityid';
	value: 	{
		'entity-type': 'sense';
		id: string;
		'numeric-id'?: number;
	};
};

type TimeValue = {
	type: 'time';
	value: {
		time: string;
		timezone: number;
		before: number;
		after: number;
		precision: number;
		calendarmodel: string;
	};
};

type GlobeCoordinateValue = {
	type: 'globecoordinate';
	value: {
		latitude: number;
		longitude: number;
		altitude: undefined;
		precision: number;
		globe: string;
	};
};

type MonolingualTextValue = {
	type: 'monolingualtext';
	value: {
		language: string;
		text: string;
	};
};
