# SEO internal navigation integrity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 through #506 now protect public URL identity, all-indexable canonical/sitemap identity, JSON-LD integrity, singleton head metadata, and existing language metadata. The remaining deterministic navigation gap is internal anchor integrity. The current strict SEO audit only treats `/tools/{slug}/...` links as internal and verifies that the top-level tool landing exists. It does not verify the actual linked subpage path, root-relative non-tool pages, relative navigation, or same-origin absolute links.

This PR adds a read-only internal-navigation integrity contract for indexable HTML. It validates existing same-origin navigation targets without inventing links, restructuring navigation, or checking external sites.

## Progress

- [x] Confirmed main HEAD `c7afdfc8b6f82068d9eac4cea1196d99370f3ee8` after PR #506.
- [x] Confirmed root `_redirects` is empty, so there are no repository-defined redirect aliases that need to be treated as valid targets.
- [x] Created branch `fix/seo-internal-link-integrity-20260912` from that exact main commit.
- [ ] Add a read-only checker for same-origin HTML navigation links.
- [ ] Wire it into the existing SEO workflow.
- [ ] Run across the complete indexable HTML surface and record link/target/error counts.
- [ ] Repair only proven broken internal navigation hrefs surfaced by the checker.
- [ ] Re-run all prior SEO contracts and strict audit.
- [ ] Review diff, update this ExecPlan, merge only after green CI, then confirm main.

## Decision Log

- Decision: inspect anchor (`<a href>`) navigation only in this PR.
  Rationale: stylesheet/script/image/download resource integrity is a different failure domain. This contract is specifically for user- and crawler-visible navigation.
  Date: 2026-09-12.

- Decision: validate root-relative, document-relative, and absolute `https://nicheworks.app/...` links as internal. Do not treat other hosts or NicheWorks subdomains as the same publication origin.
  Rationale: the canonical publication origin for this repository is exactly `https://nicheworks.app`; separate subdomains can be independent deployments.
  Date: 2026-09-12.

- Decision: ignore fragment-only, mailto, tel, javascript, data, blob, and external links.
  Rationale: they do not represent repository HTML navigation targets.
  Date: 2026-09-12.

- Decision: strip query and fragment components before checking target file existence, rather than rejecting them.
  Rationale: query/fragment semantics can be valid for application state or in-page navigation. This PR checks whether the underlying navigation document exists.
  Date: 2026-09-12.

- Decision: support static-host path resolution for exact files, extensionless `.html` paths, and directory `index.html` paths.
  Rationale: Cloudflare Pages/static hosting can expose clean paths while the repository stores `.html` or `index.html` files.
  Date: 2026-09-12.

- Decision: limit the contract to HTML/navigation-looking targets (trailing slash, `.html`, or extensionless path). Ignore explicit non-HTML asset/download extensions.
  Rationale: avoids conflating navigation integrity with data/file asset validation while still covering SEO-relevant internal links.
  Date: 2026-09-12.

## Context and Orientation

Relevant files:

- `scripts/audit-seo.mjs`: current general SEO audit. Its `internalLinks()` only captures `/tools/{slug}/...` and `brokenLinks()` checks only `tools/{slug}/index.html`.
- `scripts/seo-public-url-contract.mjs`: canonical origin/path helper.
- `scripts/check-seo-indexable-url-identity.mjs`: established public HTML scan scope and noindex semantics.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.
- `_redirects`: currently empty.

A known candidate the checker should evaluate is the Rename Wizard English landing's Japanese navigation href `/rename-wizard/`, which is outside the canonical `/tools/rename-wizard/` path and is not covered by the current audit.

## Plan of Work

Create `scripts/check-seo-internal-link-integrity.mjs`.

For every indexable HTML page in the established SEO scan scope:

1. derive the current page URL from `htmlFilePublicUrl(relativePath)`;
2. collect anchor `href` values;
3. ignore empty/fragment-only and non-HTTP navigation schemes such as mailto/tel/javascript/data/blob;
4. resolve relative hrefs against the current canonical page URL;
5. consider only links whose resolved host is exactly `nicheworks.app`;
6. strip query and fragment for target-file resolution;
7. skip explicit non-HTML asset/download extensions;
8. map navigation paths to repository candidates: exact path, extensionless `.html`, or directory `index.html`;
9. reject targets that resolve outside the repository or only into excluded/non-public source areas;
10. fail when no public repository target exists.

The checker should report scanned/indexable/noindex page counts, total internal navigation links checked, unique resolved targets, and defects.

Wire it into `.github/workflows/seo-audit.yml` after language metadata integrity and before structured-data integrity. Include its script path in pull-request and main-push path filters.

Open a PR before production HTML repairs so CI provides the complete defect list. Repair only actual broken hrefs required to adopt the contract.

## Validation and Acceptance

Acceptance requires:

- every checked same-origin HTML navigation href resolves to an existing public repository target;
- all PR #502–#506 contracts remain green;
- strict SEO audit stays `288 OK / 0 WARN / 0 FAIL`;
- validation leaves the repository unchanged;
- production edits, if any, are limited to proven broken href values.

## Idempotence and Recovery

The checker is read-only. All repairs remain on `fix/seo-internal-link-integrity-20260912`. Main changes only through PR merge.

## Artifacts and Notes

Base/main SHA: `c7afdfc8b6f82068d9eac4cea1196d99370f3ee8`.

Parent work: PR #502, #503, #504, #505, #506.

## Interfaces and Dependencies

No package dependency is required; Node.js built-ins only. The checker imports `SITE_ORIGIN` and `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
