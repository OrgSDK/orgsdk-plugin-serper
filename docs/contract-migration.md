# Contract migration — completed

## Status: consuming `@orgsdk/plugins` from npm

This plugin imports its authoring types from the public
[`@orgsdk/plugins`](https://www.npmjs.com/package/@orgsdk/plugins) npm package.
The migration is complete.

## What changed

1. **`plugin/contract.ts` deleted** — the temporary type-only shim is gone.
2. **All imports updated** — `from "./contract"` → `from "@orgsdk/plugins"`.
3. **devDependency** is the published npm package, pinned to an exact version
   (`@orgsdk/plugins@0.2.0`) for reproducibility at this early contract stage.
4. **Purity guards updated** — type-only imports from `@orgsdk/plugins` are
   allowed; value imports and all other `@orgsdk/*` packages are still blocked.
5. **Artifact purity** — the runtime artifact's `package.json` contains `zod`
   but NOT `@orgsdk/plugins` (type-only imports are erased at compile time).
6. **Manifest `$schema`** — `plugin/.plugin.json` declares
   `$schema: https://orgsdk.ai/schemas/plugin-manifest.v1.json` for editor
   completion and schema validation.
7. **No local management scripts** — `validate`, `package`, `version-guard`,
   and `publish` are npm scripts that delegate to the `orgsdk-plugin` CLI
   shipped by `@orgsdk/plugins`. The old `scripts/*.ts` shims are removed.
8. **Reusable CI/CD workflows** — `.github/workflows/ci.yml` and
   `publish-catalog.yml` call the centrally maintained reusable workflows in
   `OrgSDK/plugins` (pinned to an immutable commit) instead of duplicating
   CI/publish mechanics.

## Why `@orgsdk/plugins`?

The package provides the stable, minimal, structural TypeScript contract
between plugin authors and the OrgSDK daemon — with no private daemon,
platform, storage, or database internals. It is Apache-2.0 licensed and
designed for third-party use. See
[OrgSDK/plugins](https://github.com/OrgSDK/plugins) for the full API surface.

## Type-only contract

All imports from `@orgsdk/plugins` are `import type { … }` — erased at
compile time. The runtime plugin artifact carries only `zod` as a dependency.
This means:

- No runtime weight from the authoring SDK.
- No Zod dual-package risk (the daemon provides the Zod instance).
- Plugin source typechecks against the same contract the daemon enforces.

## Upgrading the contract version

The dependency is pinned exactly (`0.2.0`). When a new contract version is
released, update the version in `package.json`, regenerate the lockfile with
`bun install`, and confirm tests still pass. Prefer deliberate, reviewed
upgrades over floating ranges while the contract is still pre-1.0.
