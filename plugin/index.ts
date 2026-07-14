import type {
	PluginContext,
	PluginFactory,
	PluginModule,
} from "@orgsdk/plugins";
import { z } from "zod";
import { SerperAuthProvider } from "./auth-provider";
import { safeFunctions } from "./serper-functions";

const createPlugin: PluginFactory = (ctx: PluginContext): PluginModule => {
	const authProvider = new SerperAuthProvider(ctx);

	return {
		safeFunctions,
		authProvider,
		config: {
			title: "Serper Search",
			description:
				"Default settings for Google Search functions (search, newsSearch, imageSearch). These are fallback values — explicit parameters in function calls take priority.",
			schema: z.object({
				defaultCountry: z
					.string()
					.length(2)
					.optional()
					.describe(
						'Two-letter country code for search results (e.g. "us", "au", "uk")',
					),
				defaultLanguage: z
					.string()
					.optional()
					.describe('Language code for results (e.g. "en", "es", "fr")'),
				defaultNumResults: z
					.number()
					.int()
					.min(1)
					.max(100)
					.optional()
					.describe("Number of results per page (1–100)"),
				defaultDevice: z
					.enum(["desktop", "mobile"])
					.optional()
					.describe("Device type for search results"),
			}),
		},
		async onLoad() {
			const cred = await ctx.stores.credential.get("serper", "default");
			if (!cred) {
				ctx.logger.warn(
					"[serper] No serper credential found. Add it in the dashboard (Credentials tab).",
				);
			}
		},
	};
};

export default createPlugin;
