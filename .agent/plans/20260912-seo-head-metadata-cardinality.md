# SEO head metadata cardinality contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 fixed registered-tool public URLs, PR #503 fixed all-indexable URL identity, and PR #504 made JSON-LD parse/integrity explicit. The next gap is HTML head cardinality: the existing strict SEO audit proves that important metadata exists, but it generally reads the first matching tag and does not fail when the same standard metadata key appears more than once.

This PR makes singleton head metadata deterministic on every indexable page. It detects duplicate or empty `<title>`, meta description, robots, Open Graph identity/content fields, and Twitter card fields without changing page copy or visual UI.

## Progress

- [x] Confirmed main HEAD `f8013665180aad413aad7f0d594ca5b835e7ffba` after PR #504.
- [x] Created `fix/seo-head-metadata-cardinality-20260912` from that exact main commit.
- [ ] Add a read-only head metadata cardinality checker.
- [ ] Wire it into the existing SEO workflow.
- [ ] Run against the full indexable HTML surface and record actual duplicate/empty/missing counts.
- [ ] Repair only mechanical singleton metadata defects surfaced by the checker.
- [ ] Re-run all previous SEO contracts and strict audit.
- [ ] Review diff, update this ExecPlan, merge after green CI, and confirm main.

## Decision Log

- Decision: require exactly one non-empty `<title>` on every indexable page.
  Rationale: multiple title elements are ambiguous and the current audit only reads the first.
  Date: 2026-09-12.

- Decision: require exactly one non-empty standard meta description and robots tag on every indexable page.
  Rationale: current strict audit already expects these fields; this PR adds cardinality rather than a new content requirement.
  Date: 2026-09-12.

- Decision: require exactly one non-empty standard Open Graph `og:title`, `og:description`, `og:url`, and `og:image` field, and exactly one standard Twitter `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image` field.
  Rationale: these are already expected by the current strict SEO audit (with `og:url` additionally enforced by PR #503). Language-suffixed custom keys such as `og:title:en` are distinct keys and are not treated as duplicates of `og:title`.
  Date: 2026-09-12.

- Decision: do not add a new `og:type` requirement in this PR.
  Rationale: `og:type` is not part of the current strict required set; adding it would be a separate policy/content expansion rather than cardinality hardening.
  Date: 2026-09-12.

- Decision: reject `pages.dev` in standard OG/Twitter image/url values and require absolute HTTPS URLs for standard social image fields.
  Rationale: preview origins must not leak into share metadata, while dedicated per-tool NicheWorks images remain allowed.
  Date: 2026-09-12.

## Outcomes & Retrospective

Pending implementation and CI results.

## Context and Orientation

Relevant files:

- `scripts/audit-seo.mjs`: current strict SEO presence/content audit.
- `scripts/check-seo-indexable-url-identity.mjs`: canonical + `og:url` + sitemap identity.
- `scripts/check-seo-structured-data-integrity.mjs`: JSON-LD integrity.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.

The checker will reuse the established public scan exclusions and `noindex` semantics used by PR #503/#504.

## Plan of Work

Create `scripts/check-seo-head-metadata-cardinality.mjs`.

For each indexable HTML page:

1. require exactly one non-empty `<title>`;
2. require exactly one non-empty `<meta name="description">`;
3. require exactly one non-empty `<meta name="robots">`;
4. require exactly one non-empty `og:title`, `og:description`, `og:url`, and `og:image`;
5. require exactly one non-empty `twitter:card`, `twitter:title`, `twitter:description`, and `twitter:image`;
6. reject `pages.dev` in the standard OG/Twitter URL-bearing fields;
7. require `og:image` and `twitter:image` to be absolute HTTPS URLs.

The checker must use exact metadata key matching, so custom keys such as `og:title:en` or `twitter:card:en` remain separate and do not count as duplicates.

Wire the checker into `.github/workflows/seo-audit.yml` after URL identity and before structured-data/general strict auditing. Open a PR to obtain full repository results, then repair only duplicate/missing/empty standard tags required by this contract.

## Validation and Acceptance

Acceptance requires:

- all 285 current indexable pages satisfy singleton/non-empty head metadata rules;
- no standard social URL/image field leaks a `pages.dev` origin;
- social image values are absolute HTTPS URLs;
- PR #502 public URL contract stays green;
- PR #503 indexable URL identity stays green;
- PR #504 structured-data integrity stays green;
- strict SEO audit stays `288 OK / 0 WARN / 0 FAIL`;
- validation leaves the repository unchanged.

## Idempotence and Recovery

The checker is read-only. All repairs remain on `fix/seo-head-metadata-cardinality-20260912`. Before editing any existing file, refetch its blob SHA. Main changes only through the PR merge.

## Artifacts and Notes

Base/main SHA: `f8013665180aad413aad7f0d594ca5b835e7ffba`.

Parent work: PR #502, #503, #504.

## Interfaces and Dependencies

No package dependency is required; Node.js built-ins only.
