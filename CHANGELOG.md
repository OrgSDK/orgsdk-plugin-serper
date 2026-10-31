# Changelog

## 1.1.8 (unreleased)

- Pin the authoring/execution packages to 0.2.2/0.1.0, with the tracked executor packaging fixes.
- Build a restricted npm distribution and verify every exported function from the packed artifact through the headless executor.
- Add versioned npm release CI that publishes the exact tested tarball after explicit repository activation.

All notable releases of `@orgsdk/plugin-serper` are documented here.

The catalog treats versions as **write-once**: a given `(slug, version)` may be
re-published only with identical artifact content; differing content is
rejected with HTTP 409. Every entry below is therefore forward-only.

## [1.1.7] — provenance (`marketplace.links.sourceRepo`) release

A forward-only patch release that brings the Serper plugin to provenance parity
with every other external OrgSDK plugin. **No plugin source behavior changed** —
the safe functions (`search`, `newsSearch`, `imageSearch`, `scrapeUrl`), the
token auth provider, the manifest auth shape, the config schema, and the runtime
dependency (`zod` only) are byte-identical to `1.1.6`.

### Why a bump at all?

`1.1.6` was published without the `marketplace.links.sourceRepo` provenance
field — it is the only external plugin in the catalog missing it, and (as a
side effect of its publish predating the catalog's server-side action
enrichment) the only one whose catalog `actions` summary is `null`. Adding
`sourceRepo` alters the **immutable publishable content** of the staged
artifact (the manifest file changes), even though no plugin *behavior* changed.
Because catalog versions are write-once, the existing `1.1.6` artifact on
record cannot be re-published with this changed content — it would differ and
be rejected with HTTP 409. Rather than mutate the published history of `1.1.6`,
the new artifact lands as a fresh `1.1.7` entry.

The `1.1.7` publish also re-enters the manifest through the catalog's current
`enrichWithActions` step, so the catalog `actions` summary for `serper` is
populated (4 read-only functions with descriptions) for the first time —
bringing it in line with `browser`, `data`, `facebook`, `github`, `gmail`,
`google-sheets`, `google-tasks`, `linkedin`, `llm`, and `twitter`.

### Changed

- Bump `plugin/.plugin.json` version `1.1.6` → `1.1.7` (catalog source of
  truth).
- Bump `package.json` version `1.1.6` → `1.1.7` (kept in sync; enforced by the
  CI version guard).
- Add `plugin/.plugin.json` → `marketplace.links.sourceRepo` =
  `https://github.com/OrgSDK/orgsdk-plugin-serper`.
- Update `tests/packaging.test.ts` expected generated-artifact version.
- Add `tests/manifest.test.ts` assertion for the `sourceRepo` provenance link.
- Document the provenance release here and in [docs/release.md](docs/release.md).

### Frozen (unchanged from 1.1.6)

- All four safe functions — names, parameters, return types, metadata,
  `requiredCredentials: ["serper"]`, `readonly: true`, `discovery: true`.
- Token auth provider — `type: token`, `serper` provider key, dashboard
  credential flow, `storeToken`/`authSetup` behavior.
- Plugin config schema (Zod) and `onLoad` credential check.
- Runtime dependency surface (`zod` only; `@orgsdk/plugins` is type-only,
  erased at compile time).

The `1.1.7` artifact is byte-for-byte reproducible: a follow-up real publish of
`1.1.7` is idempotent (HTTP 201), proving source-basis determinism.

## [1.1.6] — clean deterministic-bundling artifact-format release

A forward-only patch release that supersedes the **pre-fix** `1.1.5` artifact.
**No plugin source behavior changed** — the safe functions
(`search`, `newsSearch`, `imageSearch`, `scrapeUrl`), the token auth provider,
the manifest shape, and the runtime dependencies (`zod` only) are identical to
`1.1.4` and `1.1.5`.

### Why a bump at all?

`1.1.5` was published to accommodate the catalog's new server-side
runtime-dependency bundling step, but that step was **not yet deterministic** at
the time `1.1.5` was published. Deterministic server-side bundling has since
been deployed. Because catalog versions are write-once, the pre-fix `1.1.5`
artifact cannot be re-published with the now-deterministic content — it would
differ and be rejected with HTTP 409.

### Resolution

- Do **not** mutate the published history of `1.1.5`.
- Bump to `1.1.6` so the deterministic-bundled artifact lands as a fresh,
  forward-only catalog entry that supersedes the pre-fix `1.1.5` artifact.
- Document the artifact-format change here and in
  [docs/release.md](docs/release.md) so the bump is not mistaken for a plugin
  behavior change.

The `1.1.6` artifact is byte-for-byte reproducible: re-running the publish
pipeline produces identical staged content, so a follow-up real publish of
`1.1.6` is idempotent (HTTP 201) rather than a 409.

### Changed

- Bump `plugin/.plugin.json` version `1.1.5` → `1.1.6` (catalog source of
  truth).
- Bump `package.json` version `1.1.5` → `1.1.6` (kept in sync; enforced by the
  CI version guard).
- Update `tests/packaging.test.ts` expected generated-artifact version.
- Document the deterministic-bundling artifact-format change in
  `docs/release.md` and this changelog.

## [1.1.5] — release-pipeline artifact-format change

A forward-only patch release. **No plugin source behavior changed** — the safe
functions (`search`, `newsSearch`, `imageSearch`, `scrapeUrl`), the token auth
provider, the manifest shape, and the runtime dependencies (`zod` only) are
identical to `1.1.4`.

### Why a bump at all?

The catalog deployed a new **server-side runtime-dependency bundling** step on
its publish path. That step changes how the staged artifact content is computed
for an existing version. Because catalog versions are write-once, the artifact
already stored for `serper 1.1.4` can no longer be re-published — the newly
bundled content would differ from what is on record and be rejected with
HTTP 409.

### Resolution

- Do **not** mutate the published history of `1.1.4`.
- Bump to `1.1.5` so the new artifact format lands as a fresh, forward-only
  catalog entry.
- Document the artifact-format change here and in
  [docs/release.md](docs/release.md) so the bump is not mistaken for a plugin
  behavior change.

This is the supported path: treat every publish as forward-only and bump on any
artifact content change, including one introduced by the release pipeline
itself.

### Changed

- Bump `plugin/.plugin.json` version `1.1.4` → `1.1.5` (catalog source of
  truth).
- Bump `package.json` version `1.1.4` → `1.1.5` (kept in sync; enforced by the
  CI version guard).
- Update `tests/packaging.test.ts` expected generated-artifact version.
- Document the artifact-format change in `docs/release.md` and this changelog.

## [1.1.4]

- Adopt `@orgsdk/plugins@0.2.1` authoring contract (CLI + reusable workflows).
