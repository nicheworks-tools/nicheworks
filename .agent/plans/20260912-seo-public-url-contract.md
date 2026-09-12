# SEO public URL contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

NicheWorks has one canonical public origin: `https://nicheworks.app`. Tool landing pages are published at `/tools/{slug}/`. This change establishes one explicit, testable public-URL contract derived from the existing tool registry and makes CI fail when a registered tool drifts from that contract.

The user-visible outcome is not a redesign. It is a correctness guard: every registered tool has one canonical landing URL, that URL exists in the sitemap exactly once, and the tool landing page uses the same URL for canonical, `og:url`, and WebApplication JSON-LD `url`.

## Progress

- [x] 2026-09-12T10:55+09:00 Confirmed GitHub connection has push permission.
- [x] 2026-09-12T10:55+09:00 Confirmed `fix/seo-public-url-contract-20260912` existed and initially matched main at `b86fb01838341b3ca2efe742bf70bbf4b39ba330`.
- [x] 2026-09-12T10:55+09:00 Confirmed this ExecPlan did not previously exist.
- [x] 2026-09-12T10:55+09:00 Read `AGENTS.md`, `.agent/PLANS.md`, the SEO section of `common-spec/spec-ja.md`, `tools/tools-index.json`, `scripts/audit-seo.mjs`, `scripts/generate-tools-index.mjs`, `robots.txt`, `sitemap.xml`, and `.github/workflows/seo-audit.yml`.
- [x] 2026-09-12T11:02+09:00 Added reusable public URL contract module.
- [x] 2026-09-12T11:02+09:00 Added contract checker covering registered tool landing pages, sitemap membership/uniqueness, canonical, `og:url`, WebApplication JSON-LD URL, duplicate slugs, and deprecated/non-canonical public origins.
- [x] 2026-09-12T11:04+09:00 Updated the existing SEO audit to consume the same URL helper instead of reconstructing public URLs independently.
- [x] 2026-09-12T11:02+09:00 Wired the contract checker into the existing SEO audit workflow.
- [x] 2026-09-12T11:03+09:00 Initial PR CI found one real pre-existing defect: duplicate `og:url` in `tools/metadatasnap/index.html`; removed only the duplicate tag.
- [x] 2026-09-12T11:05+09:00 Re-run SEO audit succeeded end-to-end: publishing mode, common breakage audit, 87-tool public URL contract, strict SEO audit, and clean-repository check all passed.
- [x] 2026-09-12T11:05+09:00 PR #502 is open and mergeable; branch diff reviewed.

## Surprises & Discoveries

- `tools/tools-index.json` contains 87 tool records and metadata fields, but no stored `publicUrl` field.
- `scripts/generate-tools-index.mjs` rebuilds the registry from tool directories plus metadata. Adding hand-maintained URL strings to all 87 records would create redundant state unless the generator also owned them.
- `scripts/audit-seo.mjs` previously reconstructed URLs from filesystem paths with its own site-origin constant. It now imports the shared URL contract.
- `robots.txt` already points to `https://nicheworks.app/sitemap.xml`.
- An existing `.github/workflows/seo-audit.yml` already ran strict SEO auditing on pull requests, so PR1 extends that established validation path rather than create a parallel CI system.
- The first real contract run found exactly one repository defect: `metadatasnap` had two identical `og:url` tags. No other registered tool failed the new canonical/sitemap/OG/JSON-LD contract.
- The Cloudflare Pages preview check succeeded. An unrelated `Workers Builds: url-title-proxy` external check reports failure on the PR head; this PR does not modify that Worker or its configuration and the repository SEO/validation jobs are green.

## Decision Log

- Decision: treat the tool `slug` in `tools/tools-index.json` as the registry key and derive the public landing path as `/tools/{slug}/`; do not add 87 redundant `publicUrl` strings in PR1.
  Rationale: the common specification fixes this URL shape, the generator already guarantees slug-based registry entries, and derivation prevents two mutable sources of truth.
  Date: 2026-09-12.

- Decision: define the canonical site origin in one reusable script module and import it from SEO validation.
  Rationale: this removes independent string reconstruction and makes a future origin/path contract change localized and testable.
  Date: 2026-09-12.

- Decision: keep PR1 focused on contract enforcement and repair only defects surfaced by the new contract.
  Rationale: this kept the page-level repair to one deleted duplicate `og:url` tag and avoided unrelated SEO/UI cleanup.
  Date: 2026-09-12.

## Outcomes & Retrospective

PR #502 establishes the public URL contract without adding redundant per-tool URL state. The contract is derived from the existing 87-slug registry and is enforced in the existing SEO CI path.

The first contract run was useful immediately: it caught the duplicate MetadataSnap `og:url`, which was repaired with a one-line deletion. The next run passed all contract checks and the existing strict SEO audit. This demonstrates that the contract is adoptable against the current repository rather than merely aspirational.

No tool layout, copy, routing structure, sitemap content, or registry metadata was broadly rewritten in this PR.

## Context and Orientation

Relevant repository files:

- `tools/tools-index.json`: registry of 87 tool slugs and metadata.
- `scripts/generate-tools-index.mjs`: regenerates the registry from directories/metadata.
- `scripts/seo-public-url-contract.mjs`: shared canonical origin and URL derivation helpers.
- `scripts/check-seo-public-url-contract.mjs`: executable 87-tool contract checker.
- `scripts/audit-seo.mjs`: repository-wide HTML/SEO audit; now uses the shared URL helper.
- `sitemap.xml`: public sitemap.
- `robots.txt`: sitemap pointer.
- `.github/workflows/seo-audit.yml`: pull-request/main SEO validation workflow.
- `common-spec/spec-ja.md`: common specification requiring tool canonical/WebApplication URLs in the form `https://nicheworks.app/tools/{tool-slug}/`.

A “registered tool” means an item in `tools/tools-index.json`. Its expected landing file is `tools/{slug}/index.html`, expected public path is `/tools/{slug}/`, and expected absolute public URL is `https://nicheworks.app/tools/{slug}/`.

## Plan of Work

Implemented `scripts/seo-public-url-contract.mjs` with the canonical site origin and pure helpers for converting a tool slug or repository HTML path to the canonical public URL. Malformed slugs/path traversal are rejected rather than normalized.

Implemented `scripts/check-seo-public-url-contract.mjs`. It loads the existing registry and sitemap, validates registry shape/unique slugs, verifies every registered tool landing file exists, requires the expected landing URL exactly once in `sitemap.xml`, verifies canonical and `og:url`, parses JSON-LD and verifies WebApplication `url`, rejects deprecated `pages.dev` identity URLs/non-`nicheworks.app` origins, and checks registry/site/sitemap landing coverage in both directions.

Updated `scripts/audit-seo.mjs` to import the shared origin/path-to-public-URL helper. Updated `.github/workflows/seo-audit.yml` to run the checker before the existing strict SEO audit and to trigger when either contract script changes.

## Concrete Steps

Completed on `fix/seo-public-url-contract-20260912`:

1. Added `scripts/seo-public-url-contract.mjs`.
2. Added `scripts/check-seo-public-url-contract.mjs`.
3. Updated `scripts/audit-seo.mjs` to use the shared URL contract helper.
4. Updated `.github/workflows/seo-audit.yml` to run the checker and trigger on contract-script changes.
5. Opened PR #502.
6. Observed initial checker failure on duplicate MetadataSnap `og:url` and removed only the duplicate tag.
7. Re-ran PR CI; the public URL contract, strict SEO audit, and clean working-tree check all passed.

## Validation and Acceptance

Acceptance requires and the successful PR SEO run confirms:

- Every registry slug is unique and safe.
- Every registry slug maps to `tools/{slug}/index.html`.
- Every registered tool’s expected public landing URL is exactly `https://nicheworks.app/tools/{slug}/`.
- The sitemap contains that landing URL exactly once.
- Each registered tool landing page canonical equals the expected URL.
- Each registered tool landing page `og:url` equals the expected URL.
- Each registered tool landing page has WebApplication JSON-LD whose `url` equals the expected URL.
- Registered tool landing metadata does not use `pages.dev` or another public origin in those identity fields.
- Existing strict SEO audit succeeds.
- Validation leaves the repository unmodified.

Observed successful workflow steps on run `34666638094`: `Verify normal publishing mode`, `Audit common HTML breakage`, `Check SEO public URL contract`, `Run strict SEO audit`, and `Confirm repository was not modified` all completed with `success`.

## Idempotence and Recovery

The checker and audit are read-only and safe to rerun. The URL helper is pure. If a write is interrupted, refetch the target file SHA before retrying an update. Never retry a contents-API update using a stale blob SHA. All writes stay on `fix/seo-public-url-contract-20260912` until PR merge; main is not edited directly.

## Artifacts and Notes

Initial branch/base SHA: `b86fb01838341b3ca2efe742bf70bbf4b39ba330`.

PR: `https://github.com/nicheworks-tools/nicheworks/pull/502`.

The common specification explicitly uses `https://nicheworks.app/tools/{tool-slug}/` for both canonical and WebApplication `url`, and `https://nicheworks.app/sitemap.xml` for robots/sitemap examples.

## Interfaces and Dependencies

No third-party npm dependency is required. Scripts use Node.js 20 built-ins (`node:fs`, `node:path`) as already used by the repository’s existing SEO scripts and CI.

Exports from `scripts/seo-public-url-contract.mjs`:

- `SITE_ORIGIN`: `https://nicheworks.app`.
- `assertToolSlug(slug)`: validates the registry slug contract.
- `toolPublicPath(slug)`: returns `/tools/{slug}/`.
- `toolPublicUrl(slug)`: returns the absolute canonical tool landing URL.
- `htmlFilePublicUrl(relativePath)`: converts a repository HTML path into the canonical public URL using deployment trailing-slash behavior.
