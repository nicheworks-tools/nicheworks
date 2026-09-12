# SEO language metadata integrity contract

This ExecPlan is a living document. Keep `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` current while the work proceeds.

## Purpose / Big Picture

PR #502 through #505 fixed public URL identity, sitemap identity, JSON-LD integrity, and singleton head metadata across the NicheWorks static publication surface. This PR closes the next structural SEO gap: language metadata. The prior general audit checked that an `html lang` attribute existed, but not whether it was unique/valid, and existing `hreflang` declarations were not validated for canonical targets or reciprocal relationships.

This PR adds a read-only language-metadata integrity contract. It does **not** require hreflang on pages that do not already use it, and it does not invent Japanese/English pairings. It validates the language metadata that already exists and repairs only proven mechanical defects.

## Progress

- [x] Confirmed main HEAD `279ce58c3f7444a9612eb5514293b635a885e79a` after PR #505.
- [x] Created branch `fix/seo-language-metadata-integrity-20260912` from that exact main commit.
- [x] Added `scripts/check-seo-language-metadata-integrity.mjs`.
- [x] Wired the checker into `.github/workflows/seo-audit.yml` after head metadata cardinality and before structured-data integrity.
- [x] Ran the checker across the complete SEO scan surface.
- [x] Initial measurement: 288 HTML scanned, 285 indexable / 3 noindex, 285 `html lang` checks, 118 pages with hreflang, 268 hreflang links, 8 defects.
- [x] Repaired only the 8 proven language-metadata defects.
- [x] Final measurement: 288 HTML scanned, 285 indexable / 3 noindex, 285 `html lang` checks, 113 pages with hreflang, 258 hreflang links, 0 defects.
- [x] Re-ran all prior SEO contracts and strict audit successfully.
- [x] Construction Tools Atlas data validation and duplicate audit also passed after its four static-page metadata edits.
- [ ] Squash merge PR #506 and confirm the same checks on main.

## Surprises & Discoveries

- The repository already contained substantial hreflang coverage: 118 pages and 268 links before repair.
- Four Construction Tools Atlas static pages (`about`, `credits`, `disclaimer`, `method`) declared `?lang=ja` as a Japanese alternate even though each page is one canonical bilingual document containing both EN and JA content. The query URL was not a separate canonical/indexable translation page.
- Rename Wizard has a real English landing page at `/tools/rename-wizard/en/`, but the Japanese landing pointed its English hreflang to `/howto/en/`, while the English landing pointed its `en` hreflang back to the Japanese landing. The actual landing pair existed; the hreflang graph was simply wired incorrectly.
- Sukima Baito Income has an English how-to page but no English tool landing. Its Japanese tool landing incorrectly treated that how-to as the English equivalent of the application landing.

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

- Decision: remove hreflang entirely from the four bilingual Construction Tools Atlas static pages rather than converting `?lang=ja` to a second URL.
  Rationale: there is only one canonical document; no separate indexable translation exists.
  Date: 2026-09-12.

- Decision: repair Rename Wizard to a real reciprocal landing pair: Japanese `/tools/rename-wizard/` ↔ English `/tools/rename-wizard/en/`.
  Rationale: both canonical landing pages exist and are true language equivalents.
  Date: 2026-09-12.

- Decision: remove the Sukima Baito Income landing hreflang declarations.
  Rationale: an English how-to document is not the English equivalent of the Japanese application landing, and no English landing currently exists.
  Date: 2026-09-12.

## Outcomes & Retrospective

The language-metadata contract now covers the complete indexable surface without manufacturing new translation relationships. The first run found 8 real defects; all were corrected with metadata-only production changes.

Final CI evidence on branch HEAD `fc649d17d0031db21b190cda0da6cab75e65e9a8`:

- `SEO public URL contract: OK (87 registered tools checked)`
- `Indexable SEO URL identity: OK (285 indexable / 3 noindex / 288 scanned)`
- `SEO head metadata cardinality: OK (285 indexable / 3 noindex / 288 scanned; 3135 singleton field checks)`
- `SEO language metadata integrity: OK (285 indexable / 3 noindex / 288 scanned; 285 html lang checks; 113 pages with hreflang / 258 hreflang links)`
- `SEO structured data integrity: OK (285 indexable / 3 noindex / 288 scanned; 356 JSON-LD blocks / 356 parsed; 135 page-identity nodes / 76 urls / 0 mainEntityOfPage identities)`
- `SEO audit: 288 OK / 0 WARN / 0 FAIL / 288 checks (strict)`
- `git diff --exit-code`: success
- Construction Tools Atlas data validation: success
- Construction Tools Atlas duplicate audit: success

Production HTML changes are limited to seven files: two Rename Wizard landing pages, four Construction Tools Atlas static pages, and the Sukima Baito Income landing. No UI, copy, routing, canonical URL, JSON-LD, or application behavior was changed.

## Context and Orientation

Relevant files:

- `scripts/seo-public-url-contract.mjs`: path-derived canonical URL helper.
- `scripts/check-seo-indexable-url-identity.mjs`: canonical/sitemap identity for all indexable pages.
- `scripts/check-seo-head-metadata-cardinality.mjs`: standard head singleton contract.
- `scripts/check-seo-language-metadata-integrity.mjs`: this PR's language/hreflang contract.
- `.github/workflows/seo-audit.yml`: combined SEO workflow.

The checker uses the same scan exclusions and noindex semantics as PR #503–#505.

## Plan of Work

For every indexable page the checker:

1. requires exactly one `<html>` opening tag and one non-empty `lang` value;
2. validates `lang` using conservative language-tag syntax such as `ja`, `en`, `en-US`, while rejecting URLs/whitespace/empty values;
3. collects `<link rel="alternate" hreflang="..." href="...">` declarations;
4. rejects duplicate hreflang keys on the same page;
5. validates hreflang syntax or `x-default`;
6. requires each alternate href to be an absolute HTTPS `https://nicheworks.app/...` URL without `pages.dev`, query strings, or fragments;
7. requires each alternate href to equal the canonical path-derived URL of an existing indexable page in the same scan scope;
8. requires the target page to declare a reciprocal hreflang link back to the source canonical URL under some non-`x-default` language key.

No page without existing hreflang declarations fails merely for lacking hreflang.

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

## Idempotence and Recovery

The checker is read-only. All repairs remain on `fix/seo-language-metadata-integrity-20260912`. Main changes only through the PR merge.

## Artifacts and Notes

Base/main SHA: `279ce58c3f7444a9612eb5514293b635a885e79a`.

Parent work: PR #502, #503, #504, #505.

PR: #506.

## Interfaces and Dependencies

No package dependency is required; Node.js built-ins only. The checker imports `SITE_ORIGIN` and `htmlFilePublicUrl` from `scripts/seo-public-url-contract.mjs`.
