# SEO public URL contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

NicheWorks has one canonical public origin: `https://nicheworks.app`. Tool landing pages are published at `/tools/{slug}/`. Today those URLs are reconstructed independently by SEO audit logic, sitemap maintenance, and individual HTML heads. This change establishes one explicit, testable public-URL contract derived from the existing tool registry and makes CI fail when a registered tool drifts from that contract.

The user-visible outcome is not a redesign. It is a correctness guard: every registered tool must have one canonical landing URL, that URL must exist in the sitemap exactly once, and the tool landing page must use the same URL for canonical, `og:url`, and WebApplication JSON-LD `url` when those fields are present/required by the common specification.

## Progress

- [x] 2026-09-12T10:55+09:00 Confirmed GitHub connection has push permission.
- [x] 2026-09-12T10:55+09:00 Confirmed `fix/seo-public-url-contract-20260912` exists and initially matched main at `b86fb018489d7f7ca21a44e28b8b9476c4485b01`.
- [x] 2026-09-12T10:55+09:00 Confirmed this ExecPlan did not previously exist.
- [x] 2026-09-12T10:55+09:00 Read `AGENTS.md`, `.agent/PLANS.md`, the SEO section of `common-spec/spec-ja.md`, `tools/tools-index.json`, `scripts/audit-seo.mjs`, `scripts/generate-tools-index.mjs`, `robots.txt`, `sitemap.xml`, and `.github/workflows/seo-audit.yml`.
- [ ] Add a small reusable public URL contract module.
- [ ] Add a contract checker covering registered tool landing pages, sitemap membership/uniqueness, canonical, `og:url`, WebApplication JSON-LD URL, duplicate slugs, and deprecated/non-canonical public origins.
- [ ] Make the existing SEO audit consume the same URL helper instead of reconstructing tool landing URLs independently.
- [ ] Wire the contract checker into the existing SEO audit workflow.
- [ ] Run/observe validation and record results.
- [ ] Review branch diff, open PR, and record final state.

## Surprises & Discoveries

- `tools/tools-index.json` currently contains 87 tool records and metadata fields, but no stored `publicUrl` field.
- `scripts/generate-tools-index.mjs` rebuilds the registry from tool directories plus metadata. Adding hand-maintained URL strings to all 87 records would create redundant state unless the generator also owned them.
- `scripts/audit-seo.mjs` currently reconstructs URLs from filesystem paths with its own `fileUrl()` helper.
- `robots.txt` already points to `https://nicheworks.app/sitemap.xml`.
- An existing `.github/workflows/seo-audit.yml` already runs strict SEO auditing on pull requests, so PR1 can extend that established validation path rather than create a parallel CI system.

## Decision Log

- Decision: treat the tool `slug` in `tools/tools-index.json` as the registry key and derive the public landing path as `/tools/{slug}/`; do not add 87 redundant `publicUrl` strings in PR1.
  Rationale: the common specification fixes this URL shape, the generator already guarantees slug-based registry entries, and derivation prevents two mutable sources of truth.
  Date: 2026-09-12.

- Decision: define the canonical site origin in one reusable script module and import it from SEO validation.
  Rationale: this removes independent string reconstruction and makes a future origin/path contract change localized and testable.
  Date: 2026-09-12.

- Decision: keep PR1 focused on contract enforcement. Do not mass-edit tool copy/layout or perform unrelated SEO cleanup.
  Rationale: a small diff is easier to validate and any pre-existing page defects can be repaired in follow-up PRs against a stable contract.
  Date: 2026-09-12.

## Outcomes & Retrospective

Pending implementation and CI results.

## Context and Orientation

Relevant repository files:

- `tools/tools-index.json`: registry of 87 tool slugs and metadata.
- `scripts/generate-tools-index.mjs`: regenerates the registry from directories/metadata.
- `scripts/audit-seo.mjs`: repository-wide HTML/SEO audit; currently owns an independent `siteBase` constant and URL reconstruction logic.
- `sitemap.xml`: public sitemap.
- `robots.txt`: sitemap pointer.
- `.github/workflows/seo-audit.yml`: pull-request/main SEO validation workflow.
- `common-spec/spec-ja.md`: common specification. Its SEO section requires tool canonical URLs and WebApplication URLs in the form `https://nicheworks.app/tools/{tool-slug}/`.

A “registered tool” means an item in `tools/tools-index.json`. Its expected landing file is `tools/{slug}/index.html`, expected public path is `/tools/{slug}/`, and expected absolute public URL is `https://nicheworks.app/tools/{slug}/`.

## Plan of Work

Create `scripts/seo-public-url-contract.mjs` with the canonical site origin and small pure helpers for converting a tool slug or repository HTML path to the canonical public URL. Reject malformed slugs/path traversal rather than normalizing unsafe input.

Create `scripts/check-seo-public-url-contract.mjs`. It will load the existing registry and sitemap, validate registry shape/unique slugs, verify every registered tool landing file exists, and require the expected landing URL exactly once in `sitemap.xml`. For every registered tool landing HTML, require canonical to equal the expected URL, require `og:url` to equal it, parse JSON-LD blocks, locate WebApplication data, and require its `url` to equal it. Also reject deprecated `pages.dev` public URLs and other non-`nicheworks.app` canonical/OG/WebApplication URLs on registered tool landing pages.

Update `scripts/audit-seo.mjs` to import the shared origin/path-to-public-URL helper so general SEO audit and the new contract checker cannot disagree about URL construction.

Update `.github/workflows/seo-audit.yml` path filters for the new scripts and add a `Check SEO public URL contract` step before the existing strict SEO audit.

Do not modify tool page content in this PR unless validation proves a current page violates the new contract and the violation must be repaired for the contract to be adoptable. If broad pre-existing violations emerge, record them and narrow PR1 to non-breaking contract checks or repair only clearly mechanical URL metadata, rather than mixing unrelated SEO work.

## Concrete Steps

From repository root on branch `fix/seo-public-url-contract-20260912`:

1. Add `scripts/seo-public-url-contract.mjs`.
2. Add `scripts/check-seo-public-url-contract.mjs`.
3. Update `scripts/audit-seo.mjs` to use the shared URL contract helper.
4. Update `.github/workflows/seo-audit.yml` to run the checker and trigger when either new script changes.
5. Run `node scripts/check-seo-public-url-contract.mjs`.
6. Run `node scripts/audit-seo.mjs --strict`.
7. Run `git diff --check` and review the branch diff.
8. Open a pull request only after validation is green or any known pre-existing blocker is explicitly documented.

## Validation and Acceptance

Acceptance requires:

- Every registry slug is unique and safe.
- Every registry slug maps to `tools/{slug}/index.html`.
- Every registered tool’s expected public landing URL is exactly `https://nicheworks.app/tools/{slug}/`.
- The sitemap contains that landing URL exactly once.
- Each registered tool landing page canonical equals the expected URL.
- Each registered tool landing page `og:url` equals the expected URL.
- Each registered tool landing page has WebApplication JSON-LD whose `url` equals the expected URL.
- Registered tool landing metadata does not use `pages.dev` or another public origin in those URL-bearing fields.
- Existing strict SEO audit still succeeds.
- Repository is unmodified by validation commands.

Expected successful checker output should summarize the number of registered tools checked and exit 0. Any mismatch must print the slug/file and the expected versus actual contract value and exit non-zero.

## Idempotence and Recovery

The checker and audit are read-only and safe to rerun. The URL helper is pure. If a write is interrupted, refetch the target file SHA before retrying an update. Never retry a contents-API update using a stale blob SHA. All writes stay on `fix/seo-public-url-contract-20260912`; main is not edited directly.

## Artifacts and Notes

Initial branch/base SHA: `b86fb018489d7f7ca21a44e28b8b9476c4485b01`.

The common specification explicitly uses `https://nicheworks.app/tools/{tool-slug}/` for both canonical and WebApplication `url`, and `https://nicheworks.app/sitemap.xml` for robots/sitemap examples.

## Interfaces and Dependencies

No third-party npm dependency is required. Scripts use Node.js 20 built-ins (`node:fs`, `node:path`) as already used by the repository’s existing SEO scripts and CI.

Planned exports from `scripts/seo-public-url-contract.mjs`:

- `SITE_ORIGIN`: `https://nicheworks.app`.
- `toolPublicPath(slug)`: returns `/tools/{slug}/` after validating the slug.
- `toolPublicUrl(slug)`: returns the absolute canonical tool landing URL.
- `htmlFilePublicUrl(relativePath)`: converts a repository HTML path into the canonical public URL using the same trailing-slash behavior as deployment.
