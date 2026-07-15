# Changelog

All notable releases of `@orgsdk/plugin-serper` are documented here.

The catalog treats versions as **write-once**: a given `(slug, version)` may be
re-published only with identical artifact content; differing content is
rejected with HTTP 409. Every entry below is therefore forward-only.

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
