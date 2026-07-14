# Release & catalog promotion

## Current state: no production side effects

This repository has **no publish credentials**. The CI pipeline produces a
local artifact (`dist/`) uploaded as a GitHub Actions artifact. The catalog
publish workflow (`publish-catalog.yml`) is **manual only** — it never runs
on pushes or tags.

## Version policy

- **Current version:** `1.1.3` (first external-source release).
- Catalog v1.1.2 remains retained and usable from prior catalog state.
- The manifest version (`.plugin.json` → `version`) is the **source of
  truth** for the catalog. Bump it on every behavior change.
- Versions are **write-once** in the catalog: re-publishing the same
  `(slug, version)` with identical content is idempotent; different content
  is rejected with HTTP 409. Legacy versions with no checksum are treated
  as immutable/unknown — always bump the version.

## The artifact

`bun run package` (run in CI) produces:

```
dist/
├── serper/                         # staged plugin folder (slug-named)
│   ├── .plugin.json
│   ├── package.json                # generated: name, version, type, runtime deps only
│   ├── index.ts
│   ├── auth-provider.ts
│   ├── serper-functions.ts
│   └── docs/overview.md
├── serper-1.1.3.manifest.json      # file list + SHA-256 checksums (sorted)
└── serper-1.1.3.tgz                # tarball of the plugin folder
```

Packaging is deterministic: `dist/` is fully removed and recreated on every
run. The generated `package.json` carries only `zod` as a runtime dependency
(no `@orgsdk/plugins` — type-only imports are erased).

## Catalog promotion (manual, authenticated)

The `publish-catalog.yml` workflow is triggered manually via
`workflow_dispatch`:

1. **Dry-run (default):** packages, validates, uploads the artifact. Does
   NOT require `ORGSDK_PUBLISH_TOKEN`.
2. **Real publish:** select `dry_run = false`. Requires
   `ORGSDK_PUBLISH_TOKEN` secret (admin JWT) and `ORGSDK_CATALOG_URL`
   variable in the `catalog-publish` environment. Fails clearly if the
   secret is absent.

The workflow posts the artifact to `POST /api/plugins`. The server enforces
write-once: same `(slug, version)` with identical content is idempotent;
different content returns HTTP 409. Existing tenants stay pinned to their
current version until they update.
