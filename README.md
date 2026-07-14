# @orgsdk/plugin-serper

Official OrgSDK plugin for [Serper.dev](https://serper.dev) — Google Search for
agents. Returns organic results, news, images, knowledge graph, answer boxes,
and full-page scraping for research workflows.

[![CI](https://github.com/OrgSDK/orgsdk-plugin-serper/actions/workflows/ci.yml/badge.svg)](https://github.com/OrgSDK/orgsdk-plugin-serper/actions/workflows/ci.yml)

## Repository layout

```
orgsdk-plugin-serper/
├── .github/workflows/ci.yml      # CI: install, lint, typecheck, test, validate, package
├── plugin/                       # the publishable plugin folder
│   ├── .plugin.json              # manifest (slug, version, auth, marketplace)
│   ├── contract.ts               # temporary type-only authoring shim (see docs/contract-migration.md)
│   ├── index.ts                  # entry — factory(ctx) → PluginModule
│   ├── auth-provider.ts          # token auth provider (dashboard credential flow)
│   ├── serper-functions.ts       # safe functions: search, newsSearch, imageSearch, scrapeUrl
│   └── docs/overview.md          # plugin-local docs
├── tests/                        # bun:test — manifest, source purity, plugin shape
├── scripts/                      # validate-plugin.ts, package-plugin.ts
├── docs/                         # contract migration plan, release/promotion contract
├── package.json
├── tsconfig.json
├── biome.json
└── README.md
```

The `plugin/` folder maps 1:1 to `packages/plugins/src/serper/` in the main
[OrgSDK monorepo](https://github.com/OrgSDK/AIOrg). At catalog cutover, the
monorepo source will be replaced by this repo's `plugin/` content.

## Local development

Requires [Bun](https://bun.sh) ≥ 1.3.x.

```bash
# Install (frozen lockfile in CI; dev: generates one)
bun install

# Lint + format check
bun run check

# Typecheck (no emit)
bun run typecheck

# Run tests
bun run test

# Validate manifest + source purity
bun run validate

# Stage distributable artifact into dist/
bun run package

# Full build pipeline (typecheck → validate → package)
bun run build
```

## Functions

| Function | Purpose |
|---|---|
| `search` | Organic Google results for a query. |
| `newsSearch` | News results for a query. |
| `imageSearch` | Image results for a query. |
| `scrapeUrl` | Fetch and extract the content of a URL. |

All functions require the `serper` credential (API key).

## Manifest & version rules

- The manifest lives at `plugin/.plugin.json`.
- `version` is the **source of truth** for the catalog — bump it on every
  behavior change.
- Versions are **write-once** in the catalog history table: re-publishing the
  same version updates mutable fields but does not create a new entry.
- There is no rollback path yet — treat every publish as forward-only.
- See [docs/release.md](docs/release.md) for the catalog promotion contract.

## Security constraints

- The Serper API key is injected at call time via `requiredCredentials:
  ["serper"]` — it is **never** hardcoded, logged, or persisted in plugin
  source.
- The key flows through the daemon's `CredentialStore.getSecrets()` → leading
  positional arg injection. Plugin handlers receive it as a parameter; they
  must not return, log, or store it.
- Source purity is enforced: no imports from private `@orgsdk/*` packages, no
  cross-plugin imports, no runtime value imports from the type shim. The
  `validate` script and `tests/purity.test.ts` guard this.
- No publish credentials or production catalog secrets exist in this repo.
  See [docs/release.md](docs/release.md).

## Contract shim

The plugin authoring types live in `plugin/contract.ts` as a temporary,
type-only shim. This avoids a runtime dependency on private daemon packages.
When the planned `@orgsdk/plugin-contract` types-only npm package ships, the
shim will be replaced with a mechanical import-path change. See
[docs/contract-migration.md](docs/contract-migration.md).

## Source attribution

Extracted from the OrgSDK monorepo at:

- **Source path:** `packages/plugins/src/serper/`
- **Serper source commit:** `608a151686a79b4375f1ea4ffb8cc024c5fb5a23`
- **Monorepo HEAD at extraction:** `494ae227975b186e17365e2e448557ad45b6df98`

The monorepo source is **not** deleted — this is staged duplication until the
catalog cutover safety work ships.

## License

Proprietary — All rights reserved. This source is the confidential property
of OrgSDK. No part of this repository may be reproduced, distributed, or
transmitted in any form without the prior written permission of OrgSDK.
Unauthorized use, modification, or redistribution is strictly prohibited.
