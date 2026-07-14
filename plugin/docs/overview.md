# Serper

Google Search via Serper.dev — organic results, news, images, knowledge graph,
answer boxes, and live page scraping. Token auth (API key).

## What it does

The `serper` plugin gives workflows live web search: run a Google query and get
ranked organic results, news, images, or the knowledge-graph/answer-box
summary for a query, plus the ability to scrape a URL's content. It is the
primary "what's happening on the web right now" input — distinct from the
`llm` plugin's `querySearch`, which is knowledge-based (not live).

Typical uses:

- **Research** — gather fresh sources before summarising with the `llm` plugin.
- **Monitoring** — watch a competitor's name or a keyword for new results on a
  schedule.
- **Enrichment** — scrape a company's homepage to enrich a prospect record.
- **News roundups** — pull top news for a topic into a digest.

## Functions

| Function | Purpose |
|---|---|
| `search` | Organic Google results for a query. |
| `newsSearch` | News results for a query. |
| `imageSearch` | Image results for a query. |
| `scrapeUrl` | Fetch and extract the content of a URL. |

Common optional params across search functions: `num` (result count), `gl`
(country), `hl` (language), `location`, `timeRange`, `autocorrect`, `page`.

The full function list (parameters, return types) is available via the
`plugins:info` command in the dashboard.

## Credentials

Every function declares `requiredCredentials: ["serper"]`. A Serper.dev API key
must be connected before any function is callable.

| Provider | Type | How to get it |
|---|---|---|
| `serper` | token | Create a key at `serper.dev` (free tier available). |

Connect the token inline from the plugin row, or via the CLI:

```bash
orgsdk credential set serper default your_serper_key
```

## Using it in a workflow

```typescript
// Fresh competitive research, then summarise
const results = await search({
  q: "AI agent orchestration platform",
  num: 10,
  gl: "us",
});
// const summary = await synthesizeAnswer(results.organic.map(r => r.snippet)); // llm plugin

// Scrape a specific page for deeper content
const page = await scrapeUrl({ url: "https://acme.com/about" });
```

## Notes

- Prefer `search` for ranked links and `scrapeUrl` when you need the full
  page body of a known URL.
- `num`, `gl`, `hl`, `timeRange` meaningfully change result quality — set them
  deliberately rather than relying on defaults.
- No `guides/` reference yet; agent usage patterns can be added later.
