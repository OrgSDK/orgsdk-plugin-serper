/**
 * Plugin shape / contract tests.
 *
 * Imports the real entry through Bun's module system (no daemon, no DB) and
 * exercises the factory with a no-op PluginContext — mirrors the monorepo's
 * tests/plugins/helpers/harness.ts approach.
 */
import { describe, expect, it } from "bun:test";
import type {
	AuthProvider,
	PluginContext,
	PluginModule,
} from "../plugin/contract";

const noopCtx: PluginContext = {
	stores: {
		credential: {
			get: async () => null,
			list: async () => [],
			upsert: async () => {},
			delete: async () => {},
			getSecrets: async () => null,
			setSecrets: async () => {},
		},
		config: {
			list: async () => [],
			get: async () => null,
			set: async () => ({ key: "", value: {}, updatedAt: null }),
			delete: async () => {},
		},
	},
	publicBaseUrl: "http://localhost:3000",
	logger: {
		trace() {},
		debug() {},
		info() {},
		warn() {},
		error() {},
		fatal() {},
		child() {
			return this;
		},
	},
};

async function loadPlugin(): Promise<PluginModule> {
	const mod = await import("../plugin/index");
	const factory = mod.default as (ctx: PluginContext) => PluginModule;
	return factory(noopCtx);
}

describe("plugin shape", () => {
	it("factory returns a module with safeFunctions", async () => {
		const mod = await loadPlugin();
		expect(Array.isArray(mod.safeFunctions)).toBe(true);
		expect(mod.safeFunctions?.length).toBeGreaterThan(0);
	});

	it("exposes the four expected safe functions", async () => {
		const mod = await loadPlugin();
		const names = mod.safeFunctions?.map((f) => f.name) ?? [];
		expect(names).toContain("search");
		expect(names).toContain("newsSearch");
		expect(names).toContain("imageSearch");
		expect(names).toContain("scrapeUrl");
	});

	it('every function declares requiredCredentials: ["serper"]', async () => {
		const mod = await loadPlugin();
		const fns = mod.safeFunctions ?? [];
		for (const fn of fns) {
			expect(fn.requiredCredentials).toContain("serper");
		}
	});

	it("every function has metadata with readonly + discovery tags", async () => {
		const mod = await loadPlugin();
		const fns = mod.safeFunctions ?? [];
		for (const fn of fns) {
			expect(fn.metadata?.readonly).toBe(true);
			expect(fn.metadata?.discovery).toBe(true);
		}
	});

	it("has a token authProvider", async () => {
		const mod = await loadPlugin();
		const auth = mod.authProvider as AuthProvider | undefined;
		expect(auth).toBeDefined();
		expect(auth?.type).toBe("token");
		expect(auth?.authMeta?.displayName).toBe("Serper.dev");
	});

	it("authProvider.storeToken writes to the credential store", async () => {
		let capturedKey: string | undefined;
		const ctx: PluginContext = {
			...noopCtx,
			stores: {
				...noopCtx.stores,
				credential: {
					...noopCtx.stores.credential,
					async setSecrets(_p, _n, secrets) {
						const bundle = secrets as Record<string, unknown>;
						capturedKey = bundle.secret_apiKey as string;
					},
				},
			},
		};
		const mod = await import("../plugin/index");
		const factory = mod.default as (ctx: PluginContext) => PluginModule;
		const modWithCapture = factory(ctx);
		const auth = modWithCapture.authProvider as AuthProvider | undefined;
		expect(auth).toBeDefined();
		expect(typeof auth?.storeToken).toBe("function");
		await auth?.storeToken?.("test-name", "test-key");
		expect(capturedKey).toBe("test-key");
	});

	it("has a Zod config schema with expected fields", async () => {
		const mod = await loadPlugin();
		expect(mod.config).toBeDefined();
		expect(mod.config?.title).toBe("Serper Search");
		expect(mod.config?.schema).toBeDefined();
	});
});
