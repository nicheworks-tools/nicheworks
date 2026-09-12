# SEO indexable URL identity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 fixed and enforced the canonical public URL contract for the 87 registered tool landing pages. This PR extends URL identity enforcement to the wider static publication surface: how-to pages, usage pages, language variants, Atlas subpages, mother-site pages, and other indexable HTML.

For every indexable public HTML page, canonical and `og:url` must equal the URL derived from its repository path, and the sitemap must publish that URL exactly once. Product UI, routing, and page semantics remain unchanged.

## Progress

- [x] 2026-09-12T11:10+09:00 Confirmed main HEAD `263e8aa44e389631cd3edbfde4e7a8daa62945fd` after PR #502.
- [x] 2026-09-12T11:10+09:00 Created `fix/seo-indexable-url-identity-20260912` from that exact main commit.
- [x] Added read-only `scripts/check-seo-indexable-url-identity.mjs`.
- [x] Wired the checker into the existing SEO audit workflow after the 87-tool URL contract and before strict SEO audit.
- [x] Opened PR #503 and ran the checker against the full repository.
- [x] Initial run scanned 288 SEO-scope HTML pages: 285 indexable and 3 noindex. It found exactly five violations.
- [x] All five violations were missing `og:url` tags on AI Interaction Atlas English subpages: `categories/`, `compare/`, `patterns/`, `search/`, and `topics/`.
- [x] Repaired only those five defects by adding one path-correct `og:url` line to each page.
- [x] Re-run succeeded: 285 indexable / 3 noindex / 288 scanned.
- [x] Existing 87-tool public URL contract succeeded.
- [x] Existing strict SEO audit succeeded with `288 OK / 0 WARN / 0 FAIL`.
- [x] Clean-repository validation (`git diff --exit-code`) succeeded.
- [ ] Final compare/PR metadata review and squash merge.
- [ ] Confirm the same SEO workflow succeeds on main after merge.

## Surprises & Discoveries

- PR #502 deliberately scoped WebApplication JSON-LD URL enforcement to the 87 registered tool landing pages, where the common specification explicitly defines that contract.
- The wider SEO scan contains 288 HTML pages after existing exclusions. Of these, 285 are indexable and 3 are noindex.
- The existing repository was already very close to the stronger contract: the only five failures were missing `og:url` on five English AI Interaction Atlas subpages.
- Canonical URLs, sitemap membership, sitemap uniqueness, deprecated-origin checks, and `/index.html` alias checks produced no additional violations.
- The final strict general SEO audit reports all 288 scanned pages as OK with zero warnings and zero failures.

## Decision Log

- Decision: enforce canonical + `og:url` + exact sitemap membership for every indexable public HTML page.
  Rationale: these are deterministic page-identity fields and can be checked mechanically without changing page semantics.
  Date: 2026-09-12.

- Decision: keep WebApplication JSON-LD enforcement in the existing registered-tool checker rather than require one schema type on every subpage.
  Rationale: subpages may legitimately use different schema types; the common specification's WebApplication requirement is specific to tool pages.
  Date: 2026-09-12.

- Decision: repair only the five missing `og:url` tags surfaced by the new checker.
  Rationale: no content, title, description, routing, sitemap, or layout changes were necessary to make the stronger contract pass.
  Date: 2026-09-12.

## Outcomes & Retrospective

The new checker is adoptable against the current repository with only five one-line metadata repairs. It converts a previously implicit convention into a CI-enforced invariant across the complete indexable static site, while PR #502 continues to provide the stronger registered-tool/WebApplication checks for the 87 primary tool landings.

Observed successful PR workflow output:

- `SEO public URL contract: OK (87 registered tools checked)`
- `Indexable SEO URL identity: OK (285 indexable / 3 noindex / 288 scanned)`
- `SEO audit: 288 OK / 0 WARN / 0 FAIL / 288 checks (strict)`
- `git diff --exit-code`: success

The page-level production changes are limited to five added `og:url` tags.

## Context and Orientation

Relevant files:

- `scripts/seo-public-url-contract.mjs`: shared canonical origin and repository-path-to-public-URL helper added by PR #502.
- `scripts/check-seo-public-url-contract.mjs`: registered-tool landing-page contract checker added by PR #502.
- `scripts/check-seo-indexable-url-identity.mjs`: full indexable-page identity checker added by this PR.
- `scripts/audit-seo.mjs`: repository-wide SEO audit.
- `.github/workflows/seo-audit.yml`: PR/main SEO workflow.
- `sitemap.xml`: public sitemap.

An “indexable page” means an HTML file included by the existing repository SEO scan whose robots meta does not contain `noindex`.

## Implemented Contract

For every indexable page in the established SEO scan scope, the checker enforces:

1. exactly one canonical tag equal to `htmlFilePublicUrl(relativePath)`;
2. exactly one `og:url` equal to that same URL;
3. the expected URL appears exactly once as a sitemap `<loc>`;
4. canonical and `og:url` do not use `pages.dev` or another public origin;
5. sitemap `<loc>` values are globally unique;
6. sitemap does not publish deprecated `pages.dev` URLs or `/index.html` aliases.

No third-party package is required. The script uses Node.js built-ins and the shared PR #502 URL helper.

## Validation and Acceptance

Acceptance has been demonstrated on PR #503:

- 285 indexable pages satisfy canonical identity.
- 285 indexable pages satisfy `og:url` identity.
- 285 indexable pages have exact single sitemap membership.
- 3 noindex pages are intentionally excluded from identity enforcement.
- Sitemap uniqueness/origin/index-alias checks pass.
- Existing 87-tool landing contract passes.
- Existing strict SEO audit passes with 288/288 OK.
- Validation leaves the repository unchanged.

## Idempotence and Recovery

All validation is read-only. The five page repairs are deterministic additions of the canonical path-derived `og:url`. The checker can be rerun safely on every pull request and main push. Main is modified only through the PR merge.

## Artifacts and Notes

Base/main SHA: `263e8aa44e389631cd3edbfde4e7a8daa62945fd`.

PR: `https://github.com/nicheworks-tools/nicheworks/pull/503`.

Parent work: PR #502 / `.agent/plans/20260912-seo-public-url-contract.md`.
