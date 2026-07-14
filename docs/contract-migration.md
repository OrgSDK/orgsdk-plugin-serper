# Contract migration — completed

## Status: migrated to `@orgsdk/plugins`

This plugin now imports its authoring types from the public
[`@orgsdk/plugins`](https://github.com/OrgSDK/plugins) package instead of a
local shim. The migration is complete:

1. **`plugin/contract.ts` deleted** — the temporary type-only shim is gone.
2. **All imports updated** — `from "./contract"` → `from "@orgsdk/plugins"`.
3. **devDependency pinned** to the public GitHub repo at an immutable commit
   (`github:OrgSDK/plugins#da5ae72…`) until npm publication of v0.1.0.
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

## Moving to npm

Once `@orgsdk/plugins@0.1.0` is published to npm, replace the GitHub pin:

```diff
- "@orgsdk/plugins": "github:OrgSDK/plugins#da5ae72…"
+ "@orgsdk/plugins": "^0.1.0"
```
