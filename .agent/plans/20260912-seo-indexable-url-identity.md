# SEO indexable URL identity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 fixed and enforced the canonical public URL contract for the 87 registered tool landing pages. The remaining gap is the wider static publication surface: how-to pages, usage pages, language variants, Atlas subpages, mother-site pages, and other indexable HTML. Those pages are currently checked by the general SEO audit, but they do not have the same exact identity guarantees as registered tool landings.

This PR extends URL identity enforcement to every indexable public HTML page without changing product UI or routing. For each indexable page, canonical and `og:url` must equal the URL derived from its repository path, and the sitemap must publish that URL exactly once.

## Progress

- [x] 2026-09-12T11:10+09:00 Confirmed main HEAD is `263e8aa44e389631cd3edbfde4e7a8daa62945fd` after PR #502.
- [x] 2026-09-12T11:10+09:00 Created branch `fix/seo-indexable-url-identity-20260912` from that exact main commit.
- [x] 2026-09-12T11:10+09:00 Confirmed PR #502 already protects 87 registered tool landing pages but not the full indexable HTML surface.
- [ ] Add a read-only indexable-page URL identity checker.
- [ ] Wire the checker into the existing SEO audit workflow.
- [ ] Run the checker through PR CI and record all pre-existing violations.
- [ ] Repair only mechanical URL-identity defects required to make the contract adoptable.
- [ ] Re-run strict SEO audit and clean-repository validation.
- [ ] Review diff, update this ExecPlan, open/finish PR, and merge only after repository checks are green.

## Surprises & Discoveries

- PR #502 deliberately scoped WebApplication JSON-LD URL enforcement to the 87 registered tool landing pages, where the common specification explicitly defines that contract.
- `scripts/audit-seo.mjs` already computes a canonical expected URL for all scanned HTML and warns on canonical mismatch, but sitemap membership is currently checked with a substring lookup and the audit does not require `og:url` to equal the page URL.
- The common-breakage job scans roughly 292 HTML files, so the public indexable surface is materially larger than the 87 registered landing pages.

## Decision Log

- Decision: PR2 will enforce canonical + `og:url` + exact sitemap membership for every indexable public HTML page.
  Rationale: these are page-identity fields that should be deterministic from deployment path and can be checked mechanically without changing page semantics.
  Date: 2026-09-12.

- Decision: keep WebApplication JSON-LD enforcement in the existing registered-tool checker rather than require one schema type on every subpage.
  Rationale: subpages may legitimately use different schema types; the common specification's WebApplication requirement is specific to tool pages.
  Date: 2026-09-12.

- Decision: no mass content, title, description, layout, or routing edits in this PR. Only URL-identity metadata defects surfaced by the checker may be repaired.
  Rationale: keeps the PR reviewable and separates structural SEO identity from content-quality work.
  Date: 2026-09-12.

## Outcomes & Retrospective

Pending implementation and CI results.

## Context and Orientation

Relevant files:

- `scripts/seo-public-url-contract.mjs`: shared canonical origin and repository-path-to-public-URL helper added by PR #502.
- `scripts/check-seo-public-url-contract.mjs`: registered-tool landing-page contract checker added by PR #502.
- `scripts/audit-seo.mjs`: repository-wide SEO audit.
- `.github/workflows/seo-audit.yml`: existing PR/main SEO workflow.
- `sitemap.xml`: public sitemap.
- Static HTML under repository root and `tools/**` is the publication surface. Existing SEO-audit exclusions remain authoritative for archived, application, mock, template, and no-publication paths.

An “indexable page” in this PR means an HTML file already included by the repository SEO scan whose effective robots meta does not contain `noindex`.

## Plan of Work

Add `scripts/check-seo-indexable-url-identity.mjs`. It will reuse `htmlFilePublicUrl()` from the shared URL contract, walk the same public HTML scope used by `audit-seo.mjs`, skip noindex pages, and enforce:

1. exactly one canonical tag and exact equality with the path-derived public URL;
2. exactly one `og:url` and exact equality with the path-derived public URL;
3. the exact expected URL occurs exactly once as a sitemap `<loc>`;
4. canonical and `og:url` do not use `pages.dev` or another public origin;
5. sitemap `<loc>` entries are globally unique and do not publish `/index.html` aliases or deprecated `pages.dev` URLs.

Wire that script into `.github/workflows/seo-audit.yml` after the registered-tool contract check and before the strict general SEO audit. Add the script itself to workflow path filters.

Open a PR so GitHub Actions executes against the full repository. If the new checker reports pre-existing defects, repair only those identity tags or sitemap entries that are mechanically implied by the existing public path. Re-run until the new checker and existing strict SEO audit are both green.

## Concrete Steps

On branch `fix/seo-indexable-url-identity-20260912`:

1. Add `scripts/check-seo-indexable-url-identity.mjs`.
2. Update `.github/workflows/seo-audit.yml` path filters and steps.
3. Open a pull request to trigger repository CI.
4. Inspect checker output and repair any mechanical identity defects.
5. Confirm `Check SEO public URL contract`, `Check indexable SEO URL identity`, `Run strict SEO audit`, and `Confirm repository was not modified` all succeed.
6. Review compare diff against main and update this ExecPlan with observed counts/results.
7. Squash merge after the PR is mergeable and repository checks are green.
8. Confirm main runs the same SEO checks successfully after merge.

## Validation and Acceptance

Acceptance requires:

- Every indexable HTML page in the established SEO scan scope has exactly one canonical equal to `htmlFilePublicUrl(relativePath)`.
- Every such page has exactly one `og:url` equal to the same URL.
- Every such page occurs exactly once in `sitemap.xml`.
- Sitemap locations are unique.
- No indexable identity URL or sitemap location uses `pages.dev`.
- Sitemap does not publish an `index.html` alias.
- Existing 87-tool landing contract still passes.
- Existing strict SEO audit still passes.
- Validation scripts leave the repository unchanged.

The checker must print a useful page count on success and page-specific expected/actual diagnostics on failure.

## Idempotence and Recovery

All validation is read-only. Writes stay on `fix/seo-indexable-url-identity-20260912`. Before updating an existing file through the contents API, refetch its current blob SHA. Do not directly edit main. Mechanical repairs are safe to retry after refreshing the target SHA.

## Artifacts and Notes

Base/main SHA: `263e8aa44e389631cd3edbfde4e7a8daa62945fd`.

Parent work: PR #502 / `.agent/plans/20260912-seo-public-url-contract.md`.

## Interfaces and Dependencies

No new package dependency is required. The checker uses Node.js built-ins and imports `SITE_ORIGIN` / `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
