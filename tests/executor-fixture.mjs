import assert from "node:assert/strict";

export default async function createFixture() {
	return {
		configuration: {},
		provider: "serper",
		secret: { secret_apiKey: "synthetic-serper" },
		async fetch(request) {
			const url = new URL(request.url);
			assert(
				["https://google.serper.dev", "https://scrape.serper.dev"].includes(
					url.origin,
				),
			);
			assert.equal(request.method, "POST");
			assert.equal(request.headers.get("x-api-key"), "synthetic-serper");
			const body = await request.json();
			if (url.origin === "https://scrape.serper.dev")
				return Response.json({
					text: "Synthetic page",
					metadata: { title: "Example" },
					credits: 1,
				});
			assert(["/search", "/news", "/images"].includes(url.pathname));
			return Response.json({
				searchParameters: { q: body.q },
				organic: [
					{
						title: "Example",
						link: "https://example.invalid",
						snippet: "Synthetic",
						position: 1,
					},
				],
				news: [
					{
						title: "Example",
						link: "https://example.invalid",
						snippet: "Synthetic",
						date: "1 hour ago",
						source: "Fixture",
					},
				],
				images: [
					{
						title: "Example",
						imageUrl: "https://example.invalid/image.png",
						link: "https://example.invalid",
						position: 1,
					},
				],
			});
		},
		async run(call) {
			assert.equal((await call("search", { q: "Example" })).query, "Example");
			assert.equal(
				(await call("newsSearch", { q: "Example" })).query,
				"Example",
			);
			assert.equal(
				(await call("imageSearch", { q: "Example" })).query,
				"Example",
			);
			assert.equal(
				(await call("scrapeUrl", { url: "https://example.invalid" })).text,
				"Synthetic page",
			);
		},
	};
}
