# SEO head metadata cardinality contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 fixed registered-tool public URLs, PR #503 fixed all-indexable URL identity, and PR #504 made JSON-LD parse/integrity explicit. This PR closes the next structural gap: the existing strict SEO audit proves that important head metadata exists, but previously did not fail when the same standard key appeared more than once.

The new contract makes singleton head metadata deterministic on every indexable page. It checks title, description, robots, standard Open Graph fields, and standard Twitter fields without changing page copy or visual UI.

## Progress

- [x] Confirmed main HEAD `f8013665180aad413aad7f0d594ca5b835e7ffba` after PR #504.
- [x] Created `fix/seo-head-metadata-cardinality-20260912` from that exact main commit.
- [x] Added `scripts/check-seo-head-metadata-cardinality.mjs`.
- [x] Wired it into the existing SEO workflow.
- [x] Opened PR #505 and ran the checker across the full indexable HTML surface.
- [x] Initial run checked 3,135 singleton fields across 285 indexable pages and found exactly three duplicates.
- [x] Repaired only those three duplicates by deleting one redundant standard image tag from each affected page.
- [x] Re-run succeeded with all prior SEO contracts and strict audit still green.
- [ ] Final diff/PR metadata review and squash merge.
- [ ] Confirm the same SEO workflow succeeds on main after merge.

## Surprises & Discoveries

- Full scope remains 288 scanned HTML files: 285 indexable and 3 noindex.
- The checker performs 11 singleton field checks per indexable page, for 3,135 total checks.
- Only three defects existed:
  - `tools/cosmetic-ingredient-checker-lite/index.html`: duplicate standard `twitter:image` in the English metadata block.
  - `tools/message-generator/index.html`: duplicate standard `twitter:image` in the English metadata block.
  - `tools/metadatasnap/index.html`: duplicate standard `og:image` in the English metadata block.
- There were no additional missing/empty singleton fields, no non-HTTPS social image failures, and no `pages.dev` social metadata leaks.
- Language-suffixed custom fields such as `og:title:en` and `twitter:card:en` remain untouched and do not count as duplicates of the standard keys.

## Decision Log

- Decision: require exactly one non-empty `<title>` on every indexable page.
  Rationale: multiple title elements are ambiguous and the old audit only read the first.
  Date: 2026-09-12.

- Decision: require exactly one non-empty standard meta description and robots tag on every indexable page.
  Rationale: these were already required by the strict audit; this adds cardinality, not a new content policy.
  Date: 2026-09-12.

- Decision: require exactly one non-empty standard `og:title`, `og:description`, `og:url`, `og:image`, `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image`.
  Rationale: these are already expected by the current SEO rules. Exact key matching preserves language-suffixed custom metadata.
  Date: 2026-09-12.

- Decision: do not add a new `og:type` requirement in this PR.
  Rationale: this work hardens existing requirements rather than expanding policy.
  Date: 2026-09-12.

- Decision: reject `pages.dev` in standard OG/Twitter URL-bearing fields and require standard social images to be absolute HTTPS URLs.
  Rationale: preview origins must not leak into public share metadata.
  Date: 2026-09-12.

## Outcomes & Retrospective

PR #505 turns singleton head metadata into a CI-enforced invariant. The repository was already close to the desired state: only three redundant standard image tags were found among 3,135 checks, and all three were removed with one-line deletions.

Observed successful PR workflow:

- `SEO public URL contract: OK (87 registered tools checked)`
- `Indexable SEO URL identity: OK (285 indexable / 3 noindex / 288 scanned)`
- `SEO head metadata cardinality: OK (285 indexable / 3 noindex / 288 scanned; 3135 singleton field checks)`
- `SEO structured data integrity: OK (285 indexable / 3 noindex / 288 scanned; 356 JSON-LD blocks / 356 parsed; 135 page-identity nodes / 76 urls / 0 mainEntityOfPage identities)`
- `SEO audit: 288 OK / 0 WARN / 0 FAIL / 288 checks (strict)`
- `git diff --exit-code`: success

Production HTML changes are exactly three deleted duplicate metadata lines. No UI, copy, routing, canonical, sitemap, or JSON-LD changes were made.

## Context and Orientation

Relevant files:

- `scripts/check-seo-head-metadata-cardinality.mjs`: singleton/non-empty social/head metadata contract.
- `scripts/check-seo-indexable-url-identity.mjs`: canonical + `og:url` + sitemap identity.
- `scripts/check-seo-structured-data-integrity.mjs`: JSON-LD integrity.
- `scripts/audit-seo.mjs`: existing strict SEO audit.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.

## Implemented Contract

For each indexable HTML page:

1. exactly one non-empty `<title>`;
2. exactly one non-empty description;
3. exactly one non-empty robots tag;
4. exactly one non-empty standard `og:title`, `og:description`, `og:url`, `og:image`;
5. exactly one non-empty standard `twitter:card`, `twitter:title`, `twitter:description`, `twitter:image`;
6. no `pages.dev` in standard OG/Twitter URL/image values;
7. `og:image` and `twitter:image` are absolute HTTPS URLs.

Exact metadata key matching means `og:title:en`, `twitter:title:en`, and similar custom language keys remain distinct.

## Validation and Acceptance

Acceptance demonstrated on PR #505:

- 285 indexable / 3 noindex / 288 scanned.
- 3,135 singleton field checks all pass.
- Previous 87-tool URL contract passes.
- Full indexable URL identity passes.
- Structured-data integrity passes with 356/356 JSON-LD blocks parsed.
- Strict SEO audit passes with 288/288 OK.
- Validation leaves the repository unchanged.

## Idempotence and Recovery

The checker is read-only and safe to rerun. The three production repairs are deterministic one-line deletions. Main changes only through PR merge.

## Artifacts and Notes

Base/main SHA: `f8013665180aad413aad7f0d594ca5b835e7ffba`.

PR: `https://github.com/nicheworks-tools/nicheworks/pull/505`.

Parent work: PR #502, #503, #504.

## Interfaces and Dependencies

No package dependency is required; Node.js built-ins only.
