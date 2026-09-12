# SEO structured data integrity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 fixed the canonical public URL contract for the 87 registered tool landings. PR #503 extended canonical / `og:url` / sitemap identity enforcement to all indexable HTML. The remaining structural SEO gap is JSON-LD: the repository-wide strict audit currently checks only that indexable pages contain an `application/ld+json` block, while actual JSON parsing and WebApplication URL validation are enforced only for registered tool landings.

This PR adds a read-only structured-data integrity check for the complete indexable HTML surface. It validates JSON-LD syntax and checks page-identity URLs where the page's top-level schema explicitly publishes one. It does not force one schema type onto all pages and does not rewrite schema semantics.

## Progress

- [x] 2026-09-12T11:20+09:00 Confirmed main HEAD `180d1ca8eb77ea9679633d4791c6cf652389ba84` after PR #503.
- [x] 2026-09-12T11:20+09:00 Created branch `fix/seo-structured-data-integrity-20260912` from that exact main commit.
- [x] Confirmed the existing SEO workflow already runs the 87-tool URL contract, full indexable URL identity contract, and strict SEO audit.
- [ ] Add a read-only JSON-LD integrity checker for the same indexable-page scope.
- [ ] Wire it into the existing SEO audit workflow.
- [ ] Run it against the repository through PR CI and record actual block/type/error counts.
- [ ] Repair only mechanical JSON-LD syntax or canonical page-identity URL defects required to adopt the contract.
- [ ] Re-run all existing SEO checks and clean-repository validation.
- [ ] Review diff, update this ExecPlan, merge only after repository checks are green, then confirm main.

## Surprises & Discoveries

- `scripts/audit-seo.mjs --strict` now reports the full 288-page scan as green, but its JSON-LD rule is presence-based rather than parse-based.
- `scripts/check-seo-public-url-contract.mjs` parses JSON-LD and validates WebApplication `url`, but only for the 87 registered tool landing pages.
- PR #503 intentionally did not impose a WebApplication schema on subpages, because subpages may legitimately use WebPage, Article, HowTo, FAQPage, or other schema types.

## Decision Log

- Decision: validate every JSON-LD block on every indexable page as JSON.
  Rationale: malformed structured data is a deterministic technical defect and can be checked without changing semantics.
  Date: 2026-09-12.

- Decision: validate canonical page identity only for top-level schema nodes whose `@type` represents the page/application itself and that publish a `url` or `mainEntityOfPage` identity.
  Rationale: nested Organization, Product, Offer, publisher, source, or related-entity URLs can legitimately differ from the current page URL and must not be rewritten blindly.
  Date: 2026-09-12.

- Decision: reject `pages.dev` anywhere inside indexable-page JSON-LD.
  Rationale: preview/deployment origins must not leak into public structured data; canonical public origin is `https://nicheworks.app`.
  Date: 2026-09-12.

- Decision: do not require every schema node to have a URL and do not force one schema class across the site.
  Rationale: this PR is an integrity contract, not a schema redesign.
  Date: 2026-09-12.

## Outcomes & Retrospective

Pending implementation and CI results.

## Context and Orientation

Relevant files:

- `scripts/seo-public-url-contract.mjs`: canonical origin and path-derived public URL helper.
- `scripts/check-seo-public-url-contract.mjs`: JSON-LD/WebApplication validation for 87 registered tool landings.
- `scripts/check-seo-indexable-url-identity.mjs`: full indexable-page canonical / `og:url` / sitemap contract.
- `scripts/audit-seo.mjs`: general strict SEO audit; currently requires JSON-LD presence but does not parse all blocks.
- `.github/workflows/seo-audit.yml`: existing SEO workflow.

The new checker must use the same scan exclusions and noindex semantics as the existing full-page identity checker so the contracts refer to the same public surface.

## Plan of Work

Create `scripts/check-seo-structured-data-integrity.mjs`.

For each indexable HTML page in the established SEO scope:

1. derive the canonical page URL with `htmlFilePublicUrl(relativePath)`;
2. find all `<script type="application/ld+json">` blocks;
3. require at least one JSON-LD block, matching the current strict SEO expectation;
4. parse every non-empty block with `JSON.parse`; invalid JSON is a failure with file/block diagnostics;
5. reject `pages.dev` in structured-data blocks;
6. inspect only top-level JSON-LD nodes (including top-level array items and nodes directly inside top-level `@graph`);
7. for page-identity schema types such as WebApplication/SoftwareApplication/WebPage subclasses/Article subclasses/HowTo, if a `url` is present, require it to equal the path-derived canonical page URL;
8. when a page-identity node publishes `mainEntityOfPage` as a string or object `@id`, require that identity to equal the canonical page URL when it is an absolute NicheWorks/page-preview URL.

Do not validate arbitrary nested entity URLs against the page URL.

Wire the checker into `.github/workflows/seo-audit.yml` after indexable URL identity and before strict SEO audit. Include the checker in workflow path filters.

Open a PR to run against the complete repository. Repair only actual malformed JSON-LD or page-identity URL defects surfaced by the checker.

## Validation and Acceptance

Acceptance requires:

- Every JSON-LD block on every indexable page parses successfully.
- Every indexable page still has at least one JSON-LD block.
- No indexable-page JSON-LD contains `pages.dev`.
- Any top-level page-identity schema `url` that is present equals `htmlFilePublicUrl(relativePath)`.
- Any applicable `mainEntityOfPage` identity is canonical.
- Existing 87-tool URL contract remains green.
- Existing full indexable URL identity contract remains green.
- Existing strict SEO audit remains green.
- Validation leaves the repository unchanged.

The checker must report scanned/indexable/noindex page counts, JSON-LD block count, and page-identity URL count on success.

## Idempotence and Recovery

The checker is read-only and safe to rerun. All writes remain on `fix/seo-structured-data-integrity-20260912`. Before editing any existing page or workflow, refetch the current blob SHA. Main is modified only through PR merge.

## Artifacts and Notes

Base/main SHA: `180d1ca8eb77ea9679633d4791c6cf652389ba84`.

Parent work:

- PR #502 / `.agent/plans/20260912-seo-public-url-contract.md`
- PR #503 / `.agent/plans/20260912-seo-indexable-url-identity.md`

## Interfaces and Dependencies

No new package dependency is required. The checker uses Node.js built-ins and imports `SITE_ORIGIN` / `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
