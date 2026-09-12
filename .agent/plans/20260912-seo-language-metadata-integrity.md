# SEO language metadata integrity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 through #505 fixed public URL identity, sitemap identity, JSON-LD integrity, and singleton head metadata across the NicheWorks static publication surface. The next structural SEO gap is language metadata. The current general audit checks that an `html lang` attribute exists, but not whether it is unique/valid. Existing `hreflang` declarations, if any, are not validated for canonical targets or reciprocal relationships.

This PR adds a read-only language-metadata integrity contract. It does **not** require hreflang on pages that do not already use it, and it does not invent Japanese/English pairings. It validates the language metadata that already exists.

## Progress

- [x] Confirmed main HEAD `279ce58c3f7444a9612eb5514293b635a885e79a` after PR #505.
- [x] Created branch `fix/seo-language-metadata-integrity-20260912` from that exact main commit.
- [ ] Add a read-only checker for `html lang` and existing hreflang declarations.
- [ ] Wire it into the existing SEO workflow.
- [ ] Run across the full indexable HTML surface and record actual language/hreflang counts and defects.
- [ ] Repair only mechanical language-metadata defects surfaced by the checker.
- [ ] Re-run all prior SEO contracts and strict audit.
- [ ] Review diff, update this ExecPlan, merge only after green CI, then confirm main.

## Decision Log

- Decision: require exactly one non-empty `lang` attribute on the document `<html>` element for every indexable page, using a conservative BCP47-style syntax check.
  Rationale: the existing audit already requires a language attribute; this PR adds integrity/cardinality rather than a new policy.
  Date: 2026-09-12.

- Decision: do not require hreflang on pages that currently have none.
  Rationale: deciding which pages are true translated equivalents is content/product semantics, not a safe mechanical inference.
  Date: 2026-09-12.

- Decision: when hreflang declarations exist, validate uniqueness, language-code syntax, absolute HTTPS canonical NicheWorks targets, target existence/indexability, and reciprocity.
  Rationale: these are deterministic properties of an existing alternate-language graph and do not invent relationships.
  Date: 2026-09-12.

- Decision: allow `x-default` as a hreflang value but do not require it.
  Rationale: it is optional and only meaningful for some language-selection experiences.
  Date: 2026-09-12.

- Decision: do not force hreflang value to equal target `<html lang>` exactly in this first contract.
  Rationale: valid regional mappings (for example `en-US` pointing to a page whose HTML language is `en`) may be intentional. Target existence and reciprocity are safer invariants.
  Date: 2026-09-12.

## Outcomes & Retrospective

Pending implementation and CI results.

## Context and Orientation

Relevant files:

- `scripts/seo-public-url-contract.mjs`: path-derived canonical URL helper.
- `scripts/check-seo-indexable-url-identity.mjs`: canonical/sitemap identity for all indexable pages.
- `scripts/check-seo-head-metadata-cardinality.mjs`: standard head singleton contract.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.

The checker will use the same scan exclusions and noindex semantics as PR #503–#505.

## Plan of Work

Create `scripts/check-seo-language-metadata-integrity.mjs`.

For every indexable page:

1. require exactly one `<html>` opening tag and one non-empty `lang` value;
2. validate `lang` using conservative language-tag syntax such as `ja`, `en`, `en-US`, while rejecting URLs/whitespace/empty values;
3. collect `<link rel="alternate" hreflang="..." href="...">` declarations;
4. for pages with hreflang declarations, reject duplicate hreflang keys on the same page;
5. validate hreflang syntax or `x-default`;
6. require each alternate href to be an absolute HTTPS `https://nicheworks.app/...` URL without `pages.dev`;
7. require each alternate href to equal the canonical path-derived URL of an existing indexable page in the same scan scope;
8. require the target page to declare a reciprocal hreflang link back to the source canonical URL under some non-`x-default` language key.

No page without existing hreflang declarations will fail merely for lacking hreflang.

Wire the checker into `.github/workflows/seo-audit.yml` after head metadata cardinality and before structured-data integrity. Open a PR to obtain repository-wide results before editing production HTML.

## Validation and Acceptance

Acceptance requires:

- all 285 current indexable pages have exactly one valid non-empty `<html lang>`;
- every existing hreflang declaration has a valid key and canonical HTTPS NicheWorks target;
- every hreflang target exists and is indexable;
- no duplicate hreflang key exists per page;
- every non-x-default alternate relationship is reciprocal;
- all PR #502–#505 contracts stay green;
- strict SEO audit stays `288 OK / 0 WARN / 0 FAIL`;
- validation leaves the repository unchanged.

The checker should report scanned/indexable/noindex counts, language-tag count, hreflang-page count, and hreflang-link count.

## Idempotence and Recovery

The checker is read-only. All repairs remain on `fix/seo-language-metadata-integrity-20260912`. Main changes only through the PR merge.

## Artifacts and Notes

Base/main SHA: `279ce58c3f7444a9612eb5514293b635a885e79a`.

Parent work: PR #502, #503, #504, #505.

## Interfaces and Dependencies

No package dependency is required; Node.js built-ins only. The checker imports `SITE_ORIGIN` and `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
