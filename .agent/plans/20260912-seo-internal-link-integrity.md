# SEO internal navigation integrity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 through #506 protect public URL identity, all-indexable canonical/sitemap identity, JSON-LD integrity, singleton head metadata, and existing language metadata. The next deterministic navigation gap was internal anchor integrity. The prior strict SEO audit treated only `/tools/{slug}/...` links as internal and verified only the top-level tool landing, so broken subpage paths, root-relative non-tool paths, relative navigation, and same-origin absolute links could survive CI.

This PR adds a read-only internal-navigation integrity contract for indexable HTML. It validates existing same-origin navigation targets without inventing links, restructuring navigation, or checking external sites.

## Progress

- [x] Confirmed main HEAD `c7afdfc8b6f82068d9eac4cea1196d99370f3ee8` after PR #506.
- [x] Confirmed root `_redirects` is empty, so there are no repository-defined redirect aliases that need to be treated as valid targets.
- [x] Created branch `fix/seo-internal-link-integrity-20260912` from that exact main commit.
- [x] Added `scripts/check-seo-internal-link-integrity.mjs`.
- [x] Wired the checker into `.github/workflows/seo-audit.yml` after language metadata and before structured-data integrity.
- [x] First broad run exposed 23 candidates across 1,578 same-origin navigation-looking links / 288 unique targets.
- [x] Refined the checker to ignore HTML-like anchor strings inside scripts/templates, dynamic `/api/` endpoints, and to allow existing public `pro/unlock/` targets even though they are excluded from the SEO scan surface.
- [x] Refined baseline measured 10 real broken navigation occurrences across 1,566 checked links / 281 unique targets.
- [x] Repaired only those proven broken navigation hrefs, plus the directly related ATS visible implementation-instruction leak on the same related-links block.
- [x] Final measurement: 1,560 checked internal navigation links / 276 unique targets, 0 defects.
- [x] Re-ran all PR #502–#506 SEO contracts, strict SEO audit, and clean-repository validation successfully.
- [ ] Squash merge PR #507 and confirm the same checks on main.

## Surprises & Discoveries

- The first implementation intentionally scanned broad anchor-looking markup and therefore surfaced false positives from JavaScript template strings plus Earth Map Suite `/api/...` application endpoints. These are not static HTML navigation targets; the checker now strips script/style/template markup and ignores `/api/` paths before evaluating navigation.
- Public Pro unlock HTML is intentionally excluded from the SEO scan surface but still exists as a valid user navigation target. Scan exclusions and target-validity exclusions therefore need separate rules.
- `tools/ats-paste-doctor/howto/en/index.html` had two related navigation defects in one block: `../usage.html` resolved to a nonexistent `howto/usage.html`, and `../` labeled “Open the tool” actually returned to the Japanese how-to directory rather than the tool landing. The same heading also exposed the implementation instruction text `Related links (must include ../ and ../usage.html)`. The block was repaired to the real tool root and English usage page and the visible implementation instruction was removed.
- Codex Usage Forecaster English usage/how-to pages labeled links “Ko-fi” and “OFUSE” but pointed both to a nonexistent internal `/support/` path. They now use the existing project-standard external donation URLs.
- Image Redact linked to nonexistent `usage.html` and `usage-en.html`; the landing already contains quick steps and a bilingual `#safetyChecklist`, so the links now target that existing in-page detail instead of creating thin duplicate pages.
- Motion Atlas EN/JA linked “NicheWorks tools” to nonexistent `/tools/`; because the repository has no tools index at that route, these links now return to the site root.
- Rename Wizard English landing retained an obsolete body language-switch path `/rename-wizard/` even after PR #506 corrected hreflang. It now points to the canonical Japanese landing `/tools/rename-wizard/`.

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

- Decision: strip `<script>`, `<style>`, `<template>`, and comments before collecting anchors, and ignore unresolved `${...}` href templates.
  Rationale: source strings used to construct dynamic UI are not static anchors present in the rendered HTML document and should not become repository-file assertions.
  Date: 2026-09-12.

- Decision: ignore `/api/` targets in the static navigation checker.
  Rationale: application/API endpoints are not repository HTML documents; validating runtime API routing belongs in a separate contract.
  Date: 2026-09-12.

- Decision: allow existing public HTML targets such as `pro/unlock/` even when they are intentionally outside the indexable SEO scan scope.
  Rationale: a noindex/excluded page can still be a valid navigation destination. “Pages to audit as indexable SEO documents” and “files allowed as internal navigation targets” are separate concepts.
  Date: 2026-09-12.

## Outcomes & Retrospective

The final checker validates the complete static same-origin navigation surface while avoiding runtime/dynamic false positives. After the ten real broken-link occurrences were repaired, all 1,560 checked internal navigation links resolve to 276 existing public targets.

Production HTML changes are limited to seven files:

- `tools/ats-paste-doctor/howto/en/index.html`
- `tools/codex-usage-forecaster/en/howto.html`
- `tools/codex-usage-forecaster/en/usage.html`
- `tools/image-redact/index.html`
- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`
- `tools/rename-wizard/en/index.html`

Final CI evidence on code HEAD `ac9e00d30537814410833ba571d02e6d7094f426`:

- `SEO public URL contract: OK (87 registered tools checked)`
- `Indexable SEO URL identity: OK (285 indexable / 3 noindex / 288 scanned)`
- `SEO head metadata cardinality: OK (285 indexable / 3 noindex / 288 scanned; 3135 singleton field checks)`
- `SEO language metadata integrity: OK (285 indexable / 3 noindex / 288 scanned; 285 html lang checks; 113 pages with hreflang / 258 hreflang links)`
- `SEO internal link integrity: OK (285 indexable / 3 noindex / 288 scanned; 1560 internal navigation links / 276 unique targets)`
- `SEO structured data integrity: OK (285 indexable / 3 noindex / 288 scanned; 356 JSON-LD blocks / 356 parsed; 135 page-identity nodes / 76 urls / 0 mainEntityOfPage identities)`
- `SEO audit: 288 OK / 0 WARN / 0 FAIL / 288 checks (strict)`
- `git diff --exit-code`: success

## Context and Orientation

Relevant files:

- `scripts/audit-seo.mjs`: general SEO audit. Its older `internalLinks()` / `brokenLinks()` logic only covers top-level tool identity.
- `scripts/seo-public-url-contract.mjs`: canonical origin/path helper.
- `scripts/check-seo-indexable-url-identity.mjs`: established public HTML scan scope and noindex semantics.
- `scripts/check-seo-internal-link-integrity.mjs`: this PR's full static navigation contract.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.
- `_redirects`: empty.

## Plan of Work

For every indexable HTML page the checker:

1. derives the current page URL from `htmlFilePublicUrl(relativePath)`;
2. removes comments and script/style/template source before collecting static anchor `href` values;
3. ignores empty/fragment-only and non-HTTP navigation schemes such as mailto/tel/javascript/data/blob;
4. resolves relative hrefs against the current canonical page URL;
5. considers only links whose resolved host is exactly `nicheworks.app`;
6. strips query and fragment for target-file resolution;
7. skips `/api/` runtime endpoints and explicit non-HTML asset/download extensions;
8. maps navigation paths to repository candidates: exact path, extensionless `.html`, or directory `index.html`;
9. rejects targets that resolve outside the repository or only into genuinely non-public source areas;
10. fails when no public repository target exists.

The checker reports scanned/indexable/noindex page counts, total internal navigation links checked, unique resolved targets, and defects.

## Validation and Acceptance

Acceptance requires:

- every checked same-origin HTML navigation href resolves to an existing public repository target;
- all PR #502–#506 contracts remain green;
- strict SEO audit stays `288 OK / 0 WARN / 0 FAIL`;
- validation leaves the repository unchanged;
- production edits are limited to proven broken navigation destinations and directly related visible-link cleanup.

## Idempotence and Recovery

The checker is read-only. All repairs remain on `fix/seo-internal-link-integrity-20260912`. Main changes only through PR merge.

## Artifacts and Notes

Base/main SHA: `c7afdfc8b6f82068d9eac4cea1196d99370f3ee8`.

Parent work: PR #502, #503, #504, #505, #506.

PR: #507.

## Interfaces and Dependencies

No package dependency is required; Node.js built-ins only. The checker imports `SITE_ORIGIN` and `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
