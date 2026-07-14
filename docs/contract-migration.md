# Contract migration — completed

## Status: consuming `@orgsdk/plugins` from npm

This plugin imports its authoring types from the public
[`@orgsdk/plugins`](https://www.npmjs.com/package/@orgsdk/plugins) npm package.
The migration is complete:

1. **`plugin/contract.ts` deleted** — the temporary type-only shim is gone.
2. **All imports updated** — `from "./contract"` → `from "@orgsdk/plugins"`.
3. **devDependency** is the published npm package, pinned to an exact version
   (`@orgsdk/plugins@0.1.0`) for reproducibility at this early contract stage.
4. **Purity guards updated** — type-only imports from `@orgsdk/plugins` are
   allowed; value imports and all other `@orgsdk/*` packages are still blocked.
5. **Artifact purity** — the runtime artifact's `package.json` contains `zod`
   but NOT `@orgsdk/plugins` (type-only imports are erased at compile time).

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

The dependency is pinned exactly (`0.1.0`). When a new contract version is
released, update the version in `package.json`, regenerate the lockfile with
`bun install`, and confirm tests still pass. Prefer deliberate, reviewed
upgrades over floating ranges while the contract is still pre-1.0.
