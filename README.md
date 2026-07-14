# @orgsdk/plugin-serper

Official OrgSDK plugin for [Serper.dev](https://serper.dev) — Google Search for
agents. Returns organic results, news, images, knowledge graph, answer boxes,
and full-page scraping for research workflows.

[![CI](https://github.com/OrgSDK/orgsdk-plugin-serper/actions/workflows/ci.yml/badge.svg)](https://github.com/OrgSDK/orgsdk-plugin-serper/actions/workflows/ci.yml)

## Repository layout

```
orgsdk-plugin-serper/
├── .github/workflows/
│   ├── ci.yml                 # CI: install, lint, typecheck, test, validate, package, version guard
│   └── publish-catalog.yml    # auto-publish to catalog on main (opt-in); manual dry-run
├── plugin/                    # the publishable plugin folder
│   ├── .plugin.json           # manifest (slug, version, auth, marketplace)
│   ├── index.ts               # entry — factory(ctx) → PluginModule
│   ├── auth-provider.ts       # token auth provider (dashboard credential flow)
│   ├── serper-functions.ts    # safe functions: search, newsSearch, imageSearch, scrapeUrl
│   └── docs/overview.md       # plugin-local docs
├── tests/                     # bun:test — manifest, source purity, plugin shape
├── scripts/                   # validate-plugin, package-plugin, publish-catalog, check-version-bump
├── docs/                      # contract migration, release/promotion contract
├── package.json
├── tsconfig.json
├── biome.json
└── README.md
```

The `plugin/` folder is the canonical source for the Serper plugin; it is
published to the OrgSDK catalog on merge to `main` when opted in via the
`ORGSDK_ENABLE_CATALOG_PUBLISH` repo variable (see
[docs/release.md](docs/release.md)).

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
  publishable content change (the CI version guard enforces this).
- `package.json` → `version` is kept in sync with the manifest (enforced by
  the version guard).
- Versions are **write-once** in the catalog: re-publishing the same
  `(slug, version)` with identical content is idempotent; differing content is
  rejected (HTTP 409). Treat every publish as forward-only.
- See [docs/release.md](docs/release.md) for the automatic publish model and
  required repository settings.

## Security constraints

- The Serper API key is injected at call time via `requiredCredentials:
  ["serper"]` — it is **never** hardcoded, logged, or persisted in plugin
  source.
- The key flows through the daemon's `CredentialStore.getSecrets()` → leading
  positional arg injection. Plugin handlers receive it as a parameter; they
  must not return, log, or store it.
- Source purity is enforced: no imports from private `@orgsdk/*` packages, no
  cross-plugin imports, no runtime value imports from the authoring SDK. The
  `validate` script and `tests/purity.test.ts` guard this.
- Publish credentials (`ORGSDK_PUBLISH_TOKEN`) live as a GitHub secret
  (repository-level or `catalog-publish` environment); they are never committed
  to the repo. See [docs/release.md](docs/release.md).

## Authoring contract

The plugin authoring types come from the public
[`@orgsdk/plugins`](https://www.npmjs.com/package/@orgsdk/plugins) npm package,
imported type-only (`import type { … } from "@orgsdk/plugins"`). The SDK is a
dev-only dependency; the runtime artifact carries only `zod`. See
[docs/contract-migration.md](docs/contract-migration.md).

## Source attribution

Extracted from the OrgSDK monorepo at:

- **Source path:** `packages/plugins/src/serper/`
- **Serper source commit:** `608a151686a79b4375f1ea4ffb8cc024c5fb5a23`
- **Monorepo HEAD at extraction:** `494ae227975b186e17365e2e448557ad45b6df98`

## License

Proprietary — All rights reserved. This source is the confidential property
of OrgSDK. No part of this repository may be reproduced, distributed, or
transmitted in any form without the prior written permission of OrgSDK.
Unauthorized use, modification, or redistribution is strictly prohibited.
