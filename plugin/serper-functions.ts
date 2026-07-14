import type { SafeFunction } from "@orgsdk/plugins";

export const moduleDescription =
	"Search Google via Serper.dev API. Returns organic results, knowledge graph, answer boxes, and more.";

// ─── Types ──────────────────────────────────────────────────────────────

/** Friendly time-range filter. Maps to Serper `tbs` parameter. */
export type TimeRange =
	| "past_hour"
	| "past_24h"
	| "past_week"
	| "past_month"
	| "past_year";

const TIME_RANGE_MAP: Record<TimeRange, string> = {
	past_hour: "qdr:h",
	past_24h: "qdr:d",
	past_week: "qdr:w",
	past_month: "qdr:m",
	past_year: "qdr:y",
};

export interface SearchParams {
	/** Search query. */
	q: string;
	/** Country code for results (e.g. "us", "au", "uk"). Default: "us". */
	gl?: string;
	/** Language code (e.g. "en", "es"). */
	hl?: string;
	/** Result page number (1-based). Default: 1. */
	page?: number;
	/** Number of results per page. Default: 10. */
	num?: number;
	/** Time range filter. */
	timeRange?: TimeRange;
	/** Location string (e.g. "Austin,Texas,United States"). */
	location?: string;
	/** Device type: "desktop" or "mobile". */
	device?: "desktop" | "mobile";
	/** Autocomplete: include auto-corrected query variations. */
	autocorrect?: boolean;
}

export interface OrganicResult {
	position: number;
	title: string;
	link: string;
	snippet: string;
	date?: string;
	sitelinks?: Array<{ title: string; link: string }>;
}

export interface KnowledgeGraph {
	title?: string;
	type?: string;
	description?: string;
	sourceUrl?: string;
	attributes?: Record<string, string>;
}

export interface AnswerBox {
	snippet?: string;
	title?: string;
	link?: string;
	answer?: string;
}

export interface SearchResult {
	query: string;
	searchParameters: {
		q: string;
		gl: string;
		hl?: string;
		page: number;
		tbs?: string;
	};
	answerBox?: AnswerBox;
	knowledgeGraph?: KnowledgeGraph;
	organic: OrganicResult[];
	/** "People also ask" suggestions. */
	peopleAlsoAsk?: Array<{ question: string; snippet?: string; link?: string }>;
	/** Related search queries. */
	relatedSearches?: Array<{ query: string }>;
}

export interface ScrapeResult {
	/** Full URL that was scraped. */
	url: string;
	/** Extracted visible text content of the page. */
	text: string;
	metadata: {
		title?: string;
		description?: string;
		[key: string]: string | undefined;
	};
	/** Serper credit cost for the request. */
	credits: number;
}

// ─── Helpers ────────────────────────────────────────────────────────────

function getApiKey(credentials: Record<string, unknown>): string {
	const serperCreds = credentials.serper as Record<string, unknown> | undefined;
	const apiKey = serperCreds?.secret_apiKey as string | undefined;
	if (!apiKey) {
		throw new Error(
			"Serper API key not configured. Add it in the dashboard (Credentials tab).",
		);
	}
	return apiKey;
}

async function serperRequest(
	apiKey: string,
	endpoint: string,
	body: Record<string, unknown>,
	baseUrl = "https://google.serper.dev",
): Promise<unknown> {
	const url = endpoint ? `${baseUrl}/${endpoint}` : `${baseUrl}/`;
	const resp = await fetch(url, {
		method: "POST",
		headers: {
			"X-API-KEY": apiKey,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(body),
	});

	if (!resp.ok) {
		const errText = await resp.text();
		throw new Error(`Serper API error ${resp.status}: ${errText}`);
	}

	return resp.json();
}

function buildSearchParams(params: SearchParams): Record<string, unknown> {
	const body: Record<string, unknown> = {
		q: params.q,
		gl: params.gl ?? "us",
	};

	if (params.hl) body.hl = params.hl;
	if (params.page) body.page = params.page;
	if (params.num) body.num = params.num;
	if (params.location) body.location = params.location;
	if (params.device) body.device = params.device;
	if (params.autocorrect !== undefined) body.autocorrect = params.autocorrect;

	if (params.timeRange) {
		body.tbs = TIME_RANGE_MAP[params.timeRange];
	}

	return body;
}

/** Shared parameter definitions used by all search functions. */
const searchParameters = [
	{ name: "q", type: "string", description: "The search query." },
	{
		name: "gl",
		type: "string",
		description:
			'Country code for results (e.g. "us", "au", "uk"). Default: "us".',
		optional: true,
	},
	{
		name: "hl",
		type: "string",
		description: 'Language code (e.g. "en", "es").',
		optional: true,
	},
	{
		name: "page",
		type: "number",
		description: "Result page number (1-based). Default: 1.",
		optional: true,
	},
	{
		name: "num",
		type: "number",
		description: "Number of results per page. Default: 10.",
		optional: true,
	},
	{
		name: "timeRange",
		type: "TimeRange",
		description:
			'Time range filter. One of: "past_hour", "past_24h", "past_week", "past_month", "past_year".',
		optional: true,
	},
	{
		name: "location",
		type: "string",
		description: 'Location string (e.g. "Austin,Texas,United States").',
		optional: true,
	},
	{
		name: "device",
		type: '"desktop" | "mobile"',
		description: "Device type for results. Default: desktop.",
		optional: true,
	},
	{
		name: "autocorrect",
		type: "boolean",
		description: "Whether to apply autocorrect. Default: true.",
		optional: true,
	},
];

const searchDocParameters = [
	{
		name: "q",
		type: "string",
		description: "The search query.",
		example: '"apple inc"',
	},
	{
		name: "gl",
		type: "string",
		description:
			'Country code for results (e.g. "us", "au", "uk"). Default: "us".',
		optional: true,
		defaultValue: "us",
	},
	{
		name: "hl",
		type: "string",
		description: 'Language code (e.g. "en", "es").',
		optional: true,
	},
	{
		name: "page",
		type: "number",
		description: "Result page number (1-based). Default: 1.",
		optional: true,
		defaultValue: "1",
	},
	{
		name: "num",
		type: "number",
		description: "Number of results per page. Default: 10.",
		optional: true,
		defaultValue: "10",
	},
	{
		name: "timeRange",
		type: "TimeRange",
		description:
			'Time range filter. One of: "past_hour", "past_24h", "past_week", "past_month", "past_year".',
		optional: true,
	},
	{
		name: "location",
		type: "string",
		description: 'Location string (e.g. "Austin,Texas,United States").',
		optional: true,
	},
	{
		name: "device",
		type: '"desktop" | "mobile"',
		description: "Device type for results. Default: desktop.",
		optional: true,
	},
	{
		name: "autocorrect",
		type: "boolean",
		description: "Whether to apply autocorrect. Default: true.",
		optional: true,
	},
];

/** News parameters (same as search but without timeRange). */
const newsParameters = searchParameters.filter((p) => p.name !== "timeRange");
const newsDocParameters = searchDocParameters.filter(
	(p) => p.name !== "timeRange",
);

// ─── Safe Functions ─────────────────────────────────────────────────────

export const safeFunctions: SafeFunction[] = [
	{
		name: "search",
		requiredCredentials: ["serper"],
		handler: async (
			credentials: Record<string, unknown>,
			params: SearchParams,
		): Promise<SearchResult> => {
			const apiKey = getApiKey(credentials);
			const body = buildSearchParams(params);
			const data = (await serperRequest(apiKey, "search", body)) as Record<
				string,
				unknown
			>;
			const sp = data.searchParameters as Record<string, unknown> | undefined;

			return {
				query: params.q,
				searchParameters: {
					q: (sp?.q as string) ?? params.q,
					gl: (sp?.gl as string) ?? params.gl ?? "us",
					hl: sp?.hl as string | undefined,
					page: (sp?.page as number) ?? 1,
					tbs: sp?.tbs as string | undefined,
				},
				answerBox: data.answerBox as AnswerBox | undefined,
				knowledgeGraph: data.knowledgeGraph as KnowledgeGraph | undefined,
				organic: (data.organic as OrganicResult[]) ?? [],
				peopleAlsoAsk: data.peopleAlsoAsk as
					| Array<{
							question: string;
							snippet?: string;
							link?: string;
					  }>
					| undefined,
				relatedSearches: data.relatedSearches as
					| Array<{ query: string }>
					| undefined,
			};
		},
		description:
			"Search Google via Serper.dev. Returns organic results, knowledge graph, answer box, people-also-ask, and related searches.",
		returnType: "Promise<SearchResult>",
		typeDeclarations: `
			type TimeRange = "past_hour" | "past_24h" | "past_week" | "past_month" | "past_year";
			interface OrganicResult {
				position: number;
				title: string;
				link: string;
				snippet: string;
				date?: string;
				sitelinks?: Array<{ title: string; link: string }>;
			}
			interface AnswerBox {
				snippet?: string;
				title?: string;
				link?: string;
				answer?: string;
			}
			interface KnowledgeGraph {
				title?: string;
				type?: string;
				description?: string;
				sourceUrl?: string;
				attributes?: Record<string, string>;
			}
			interface SearchResult {
				query: string;
				searchParameters: { q: string; gl: string; hl?: string; page: number; tbs?: string; };
				answerBox?: AnswerBox;
				knowledgeGraph?: KnowledgeGraph;
				organic: OrganicResult[];
				peopleAlsoAsk?: Array<{ question: string; snippet?: string; link?: string }>;
				relatedSearches?: Array<{ query: string }>;
			}
			interface ImageResult {
				position: number;
				title: string;
				link: string;
				snippet: string;
				imageUrl: string;
				imageWidth?: number;
				imageHeight?: number;
				source?: string;
			}
		`,
		parameters: searchParameters,
		metadata: {
			category: "search",
			tags: ["readonly", "search", "google", "discovery"],
			readonly: true,
			discovery: true,
			version: "1.0.0",
		},
		docs: {
			summary:
				"Search Google using the Serper.dev API. Returns rich results including organic listings, knowledge graph panels, answer boxes, related questions, and more.",
			parameters: searchDocParameters,
			returns: {
				type: "Promise<SearchResult>",
				description:
					"Search results including organic listings, knowledge graph, answer box, people-also-ask, and related searches.",
			},
			examples: [
				{
					title: "Basic search",
					code: 'const results = await serper.search({ q: "climate change impact" });\nfor (const r of results.organic) {\n  console.log(`${r.position}. ${r.title}\\n   ${r.link}`);\n}',
				},
				{
					title: "Search with time range and country",
					code: 'const recent = await serper.search({\n  q: "AI news",\n  gl: "au",\n  timeRange: "past_24h",\n  num: 5,\n});',
				},
				{
					title: "Paginated search",
					code: 'const page2 = await serper.search({\n  q: "typescript best practices",\n  page: 2,\n  num: 20,\n});',
				},
			],
		},
	},

	{
		name: "newsSearch",
		requiredCredentials: ["serper"],
		handler: async (
			credentials: Record<string, unknown>,
			params: Omit<SearchParams, "timeRange">,
		): Promise<SearchResult> => {
			const apiKey = getApiKey(credentials);
			const body = buildSearchParams(params);
			const data = (await serperRequest(apiKey, "news", body)) as Record<
				string,
				unknown
			>;
			const sp = data.searchParameters as Record<string, unknown> | undefined;

			return {
				query: params.q,
				searchParameters: {
					q: (sp?.q as string) ?? params.q,
					gl: (sp?.gl as string) ?? params.gl ?? "us",
					hl: sp?.hl as string | undefined,
					page: (sp?.page as number) ?? 1,
				},
				organic: (data.organic as OrganicResult[]) ?? [],
				knowledgeGraph: data.knowledgeGraph as KnowledgeGraph | undefined,
			};
		},
		description:
			"Search Google News via Serper.dev. Returns news articles matching the query.",
		returnType: "Promise<SearchResult>",
		typeDeclarations: `
			type TimeRange = "past_hour" | "past_24h" | "past_week" | "past_month" | "past_year";
			interface OrganicResult {
				position: number;
				title: string;
				link: string;
				snippet: string;
				date?: string;
				sitelinks?: Array<{ title: string; link: string }>;
			}
			interface AnswerBox {
				snippet?: string;
				title?: string;
				link?: string;
				answer?: string;
			}
			interface KnowledgeGraph {
				title?: string;
				type?: string;
				description?: string;
				sourceUrl?: string;
				attributes?: Record<string, string>;
			}
			interface SearchResult {
				query: string;
				searchParameters: { q: string; gl: string; hl?: string; page: number; tbs?: string; };
				answerBox?: AnswerBox;
				knowledgeGraph?: KnowledgeGraph;
				organic: OrganicResult[];
				peopleAlsoAsk?: Array<{ question: string; snippet?: string; link?: string }>;
				relatedSearches?: Array<{ query: string }>;
			}
			interface ImageResult {
				position: number;
				title: string;
				link: string;
				snippet: string;
				imageUrl: string;
				imageWidth?: number;
				imageHeight?: number;
				source?: string;
			}
		`,
		parameters: newsParameters,
		metadata: {
			category: "search",
			tags: ["readonly", "search", "google", "news", "discovery"],
			readonly: true,
			discovery: true,
			version: "1.0.0",
		},
		docs: {
			summary:
				"Search Google News using the Serper.dev API. Returns news articles with titles, snippets, dates, and links.",
			parameters: newsDocParameters,
			returns: {
				type: "Promise<SearchResult>",
				description: "News article results.",
			},
			examples: [
				{
					title: "Search for recent news",
					code: 'const news = await serper.newsSearch({\n  q: "artificial intelligence",\n  gl: "au",\n});\nfor (const article of news.organic) {\n  console.log(`${article.date} - ${article.title}`);\n}',
				},
			],
		},
	},

	{
		name: "imageSearch",
		requiredCredentials: ["serper"],
		handler: async (
			credentials: Record<string, unknown>,
			params: SearchParams,
		): Promise<{
			query: string;
			images: Array<{
				position: number;
				title: string;
				link: string;
				snippet: string;
				imageUrl: string;
				imageWidth?: number;
				imageHeight?: number;
				source?: string;
			}>;
		}> => {
			const apiKey = getApiKey(credentials);
			const body = buildSearchParams(params);
			const data = (await serperRequest(apiKey, "images", body)) as Record<
				string,
				unknown
			>;

			const images = (
				(data.images ?? []) as Array<Record<string, unknown>>
			).map((img, i) => ({
				position: (img.position as number) ?? i + 1,
				title: (img.title as string) ?? "",
				link: (img.link as string) ?? "",
				snippet: (img.snippet as string) ?? "",
				imageUrl: (img.imageUrl as string) ?? "",
				imageWidth: img.imageWidth as number | undefined,
				imageHeight: img.imageHeight as number | undefined,
				source: img.source as string | undefined,
			}));

			return { query: params.q, images };
		},
		description:
			"Search Google Images via Serper.dev. Returns image results with thumbnails and source links.",
		returnType: "Promise<{ query: string; images: ImageResult[] }>",
		typeDeclarations: `
			type TimeRange = "past_hour" | "past_24h" | "past_week" | "past_month" | "past_year";
			interface OrganicResult {
				position: number;
				title: string;
				link: string;
				snippet: string;
				date?: string;
				sitelinks?: Array<{ title: string; link: string }>;
			}
			interface AnswerBox {
				snippet?: string;
				title?: string;
				link?: string;
				answer?: string;
			}
			interface KnowledgeGraph {
				title?: string;
				type?: string;
				description?: string;
				sourceUrl?: string;
				attributes?: Record<string, string>;
			}
			interface SearchResult {
				query: string;
				searchParameters: { q: string; gl: string; hl?: string; page: number; tbs?: string; };
				answerBox?: AnswerBox;
				knowledgeGraph?: KnowledgeGraph;
				organic: OrganicResult[];
				peopleAlsoAsk?: Array<{ question: string; snippet?: string; link?: string }>;
				relatedSearches?: Array<{ query: string }>;
			}
			interface ImageResult {
				position: number;
				title: string;
				link: string;
				snippet: string;
				imageUrl: string;
				imageWidth?: number;
				imageHeight?: number;
				source?: string;
			}
		`,
		parameters: searchParameters,
		metadata: {
			category: "search",
			tags: ["readonly", "search", "google", "images", "discovery"],
			readonly: true,
			discovery: true,
			version: "1.0.0",
		},
		docs: {
			summary:
				"Search Google Images using the Serper.dev API. Returns image results with titles, thumbnail URLs, dimensions, and source links.",
			parameters: searchDocParameters,
			returns: {
				type: "Promise<{ query: string; images: ImageResult[] }>",
				description: "Image search results.",
			},
			examples: [
				{
					title: "Search for images",
					code: 'const results = await serper.imageSearch({ q: "solar panels installation" });\nfor (const img of results.images.slice(0, 5)) {\n  console.log(`${img.title} → ${img.imageUrl}`);\n}',
				},
			],
		},
	},

	{
		name: "scrapeUrl",
		requiredCredentials: ["serper"],
		handler: async (
			credentials: Record<string, unknown>,
			params: { url: string },
		): Promise<ScrapeResult> => {
			const apiKey = getApiKey(credentials);
			const data = (await serperRequest(
				apiKey,
				"",
				{ url: params.url },
				"https://scrape.serper.dev",
			)) as Record<string, unknown>;

			return {
				url: params.url,
				text: (data.text as string) ?? "",
				metadata: (data.metadata as ScrapeResult["metadata"]) ?? {},
				credits: (data.credits as number) ?? 0,
			};
		},
		description:
			"Scrape the full text content and metadata of a web page via the Serper.dev scrape endpoint (scrape.serper.dev). Returns the page's visible text plus Open Graph / Twitter / title / description metadata.",
		returnType: "Promise<ScrapeResult>",
		typeDeclarations: `
			interface ScrapeResult {
				/** Full URL that was scraped. */
				url: string;
				/** Extracted visible text content of the page. */
				text: string;
				metadata: {
					title?: string;
					description?: string;
					[key: string]: string | undefined;
				};
				/** Serper credit cost for the request. */
				credits: number;
			}
		`,
		parameters: [
			{
				name: "url",
				type: "string",
				description: "The fully-qualified URL of the page to scrape.",
			},
		],
		metadata: {
			category: "scrape",
			tags: ["readonly", "scrape", "web", "discovery"],
			readonly: true,
			discovery: true,
			version: "1.0.0",
		},
		docs: {
			summary:
				"Scrape a web page via the Serper.dev scrape endpoint. Returns the page's visible text content plus metadata (title, description, Open Graph, Twitter cards). Useful for reading an article, extracting copy from a landing page, or feeding page content into an LLM.",
			parameters: [
				{
					name: "url",
					type: "string",
					description: "The fully-qualified URL of the page to scrape.",
					example: '"https://orgsdk.ai/"',
				},
			],
			returns: {
				type: "Promise<ScrapeResult>",
				description:
					"The page text, metadata, and the credit cost of the request.",
			},
			examples: [
				{
					title: "Scrape a landing page",
					code: 'const page = await serper.scrapeUrl({ url: "https://orgsdk.ai/" });\nconsole.log(page.metadata.title);\nconsole.log(page.text.slice(0, 500));',
				},
			],
		},
	},
];
