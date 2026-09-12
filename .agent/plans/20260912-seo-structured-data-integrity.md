# SEO structured data integrity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 fixed the canonical public URL contract for the 87 registered tool landings. PR #503 extended canonical / `og:url` / sitemap identity enforcement to all indexable HTML. This PR closes the next structural gap: repository-wide JSON-LD was previously checked mainly for presence, while actual JSON parsing was only guaranteed for registered tool landings.

The new contract parses every JSON-LD block on the full indexable HTML surface, rejects preview-origin leakage, and checks current-page identity only for schema types that represent the document itself. It does not force application/entity URLs to equal the current page URL and does not rewrite schema semantics.

## Progress

- [x] Confirmed main HEAD `180d1ca8eb77ea9679633d4791c6cf652389ba84` after PR #503.
- [x] Created branch `fix/seo-structured-data-integrity-20260912` from that exact main commit.
- [x] Added `scripts/check-seo-structured-data-integrity.mjs` for the same indexable-page scope as PR #503.
- [x] Wired the checker into `.github/workflows/seo-audit.yml` after URL identity checks and before strict SEO audit.
- [x] Opened PR #504 and ran the checker against the full repository.
- [x] Initial run parsed all 356 JSON-LD blocks successfully but reported three URL mismatches because the checker treated WebApplication entities as current-page identity.
- [x] Reviewed the three cases and determined they were checker false positives, not page defects: usage/language pages may describe the parent application entity whose canonical application URL is the tool landing.
- [x] Narrowed current-page URL enforcement to document/page schema types (WebPage subclasses, Article subclasses, HowTo); registered-tool WebApplication URL remains enforced by PR #502.
- [x] Re-run succeeded end-to-end.
- [ ] Final diff/PR metadata review and squash merge.
- [ ] Confirm the same workflow succeeds on main after merge.

## Surprises & Discoveries

- Full SEO scope remains 288 HTML files: 285 indexable and 3 noindex.
- The repository contains 356 JSON-LD blocks across the 285 indexable pages, and **all 356 parse successfully as JSON**.
- The successful checker sees 135 top-level document/page identity nodes, 76 of which publish a `url`; all 76 match the path-derived canonical page URL.
- No applicable absolute `mainEntityOfPage` identity was present in the current scan.
- No indexable-page JSON-LD contains `pages.dev`.
- The initial three apparent failures were:
  - `tools/earth-map-suite/usage-en.html` WebApplication URL → parent tool landing
  - `tools/earth-map-suite/usage.html` WebApplication URL → parent tool landing
  - `tools/rename-wizard/en/index.html` WebApplication URL → parent tool landing
  These are application-entity URLs, not necessarily current-document identity, so production HTML was deliberately left unchanged.

## Decision Log

- Decision: validate every JSON-LD block on every indexable page as JSON.
  Rationale: malformed structured data is a deterministic technical defect.
  Date: 2026-09-12.

- Decision: reject `pages.dev` anywhere inside indexable-page JSON-LD.
  Rationale: preview/deployment origins must not leak into public structured data.
  Date: 2026-09-12.

- Decision: current-page URL enforcement applies to top-level document/page schema types such as WebPage subclasses, Article subclasses, and HowTo, but **not** WebApplication / SoftwareApplication / MobileApplication in the global checker.
  Rationale: an application entity embedded on a usage or language page may correctly point to the parent application landing. PR #502 already enforces WebApplication URL on the 87 registered primary tool landings.
  Date: 2026-09-12.

- Decision: do not validate arbitrary nested entity URLs against the current page URL and do not force one schema class across the site.
  Rationale: Organization, Product, Offer, publisher, source, and related entities legitimately have different identities.
  Date: 2026-09-12.

## Outcomes & Retrospective

PR #504 turns JSON-LD syntax from an implicit assumption into a repository-wide CI invariant without changing any production HTML. The first run also proved why schema semantics matter: blindly treating every WebApplication `url` as current-page identity would have caused unnecessary and potentially incorrect edits. The checker was corrected instead of changing valid application data.

Observed successful PR workflow:

- `SEO public URL contract: OK (87 registered tools checked)`
- `Indexable SEO URL identity: OK (285 indexable / 3 noindex / 288 scanned)`
- `SEO structured data integrity: OK (285 indexable / 3 noindex / 288 scanned; 356 JSON-LD blocks / 356 parsed; 135 page-identity nodes / 76 urls / 0 mainEntityOfPage identities)`
- `SEO audit: 288 OK / 0 WARN / 0 FAIL / 288 checks (strict)`
- `git diff --exit-code`: success

No production page content, metadata, routing, or schema data was changed in this PR.

## Context and Orientation

Relevant files:

- `scripts/seo-public-url-contract.mjs`: canonical origin and path-derived public URL helper.
- `scripts/check-seo-public-url-contract.mjs`: registered-tool WebApplication validation for 87 primary landings.
- `scripts/check-seo-indexable-url-identity.mjs`: all-indexable canonical / `og:url` / sitemap identity contract.
- `scripts/check-seo-structured-data-integrity.mjs`: all-indexable JSON-LD parse/origin/document-identity contract.
- `scripts/audit-seo.mjs`: general strict SEO audit.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.

## Implemented Contract

For each indexable HTML page in the established scan scope:

1. at least one `application/ld+json` block must exist;
2. every non-empty JSON-LD block must parse with `JSON.parse`;
3. structured data must not contain `pages.dev`;
4. top-level document/page schema nodes, including nodes directly inside top-level `@graph`, are inspected;
5. if such a document/page node publishes `url`, it must equal `htmlFilePublicUrl(relativePath)`;
6. applicable absolute NicheWorks/preview `mainEntityOfPage` identities must equal the same canonical page URL;
7. application entities and arbitrary nested entities are not coerced to the current page URL.

## Validation and Acceptance

Acceptance demonstrated on PR #504:

- 285 indexable / 3 noindex / 288 scanned.
- 356 JSON-LD blocks discovered and all 356 parsed successfully.
- 135 document/page identity nodes inspected; 76 canonical URLs checked and all passed.
- zero `pages.dev` structured-data leaks.
- existing 87-tool public URL contract passes.
- existing full indexable URL identity contract passes.
- strict SEO audit passes with 288/288 OK.
- validation leaves the repository unchanged.

## Idempotence and Recovery

The checker is read-only and safe to rerun. All writes remain on `fix/seo-structured-data-integrity-20260912` until PR merge. Main is modified only through the PR.

## Artifacts and Notes

Base/main SHA: `180d1ca8eb77ea9679633d4791c6cf652389ba84`.

PR: `https://github.com/nicheworks-tools/nicheworks/pull/504`.

Parent work:

- PR #502 / `.agent/plans/20260912-seo-public-url-contract.md`
- PR #503 / `.agent/plans/20260912-seo-indexable-url-identity.md`

## Interfaces and Dependencies

No new package dependency is required. The checker uses Node.js built-ins and imports `SITE_ORIGIN` / `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
