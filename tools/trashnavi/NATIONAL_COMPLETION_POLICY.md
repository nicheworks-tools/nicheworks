# TrashNavi National Completion Policy

Status: canonical working policy for nationwide municipality coverage  
Scope: `tools/trashnavi/`  
Adopted: 2026-09-19

## 1. Completion target

TrashNavi Phase 1 is complete only when **all 1,741 independent municipality entries** in `data/localgovjp-lite.json` have a final reviewed coverage state.

The 1,741 target includes Tokyo's 23 special wards. It excludes the 175 designated-city administrative ward entries whose `city` value contains a parent city and ward name separated by a space. Those 175 administrative wards are a separate Phase 2 decision set after Phase 1 reaches 1,741 / 1,741 reviewed.

The current dataset therefore has two different denominators:

- Phase 1 independent municipalities: **1,741**
- Full TrashNavi location dataset including designated-city administrative wards: **1,916**

Do not report 1,916 as the Phase 1 municipality-completion denominator.

## 2. Completion and publication are different metrics

A municipality is **complete** when it has been reviewed and assigned one final coverage state. Completion does not require three independent URLs and does not require a public municipality page.

Track at least:

- reviewed municipalities / 1,741
- published municipality pages / 1,741
- municipalities by final coverage state
- unresolved / pending review count

A municipality must never remain indefinitely skipped only because three direct links cannot be found.

## 3. Final coverage states

Every Phase 1 municipality must end in exactly one of these final states.

### `standard`

Use when there are at least:

- 3 distinct waste-specific link types, and
- 3 distinct qualifying official URLs.

This is the strongest publication state and preserves the existing preferred-candidate quality level.

### `limited`

Use when only 1 or 2 distinct waste-specific qualifying official URLs can be verified after review.

Rules:

- expose all verified links in the main searchable directory; a dedicated municipality page is optional and requires independent user value;
- do not duplicate one URL under multiple types to reach a threshold;
- do not invent a missing calendar, bulky-waste, sorting, application, or facility page;
- if a dedicated municipality page is selectively published, it must clearly state that official direct-link coverage is limited.

### `joint_service`

Use when the municipality's waste service is materially handled by an official inter-municipal association, regional authority, clean center, or equivalent public body and the strongest usable waste information is published there.

Rules:

- require evidence tying the municipality to that public body/service area;
- links from the official joint body are allowed as qualifying sources;
- preserve the municipality identity separately from the service provider identity;
- if a dedicated municipality page is selectively published, it must explain that the waste information is provided through the joint public service body.

### `reviewed_no_direct`

Use only after review finds no qualifying waste-specific direct source that can be safely published.

Rules:

- this is a completed review state, not a backlog state;
- do not substitute a generic municipal homepage merely to create a result;
- do not publish a normal municipality detail page unless the product later defines a specific reviewed-no-direct public representation;
- retain review evidence sufficient to show that the municipality was intentionally reviewed rather than forgotten.

## 4. Non-final state

### `pending_review`

The municipality has not yet completed source review.

This is the only state that counts as unfinished Phase 1 work.

## 5. Source qualification

Preferred source order:

1. municipality official website;
2. official inter-municipal / regional public waste authority when applicable;
3. another official public body directly responsible for that municipality's waste service.

Do not use commercial aggregation, unofficial reposts, scraped mirrors, search-result URLs, or generic municipal homepages as substitutes for waste-specific evidence.

A source URL may represent only what the source actually supports. Do not classify a single page as multiple independent URLs.

## 6. Publication rules — data first, selective pages

**Review completion, official-link data publication, and independent landing-page publication are separate decisions.** A finalized municipality must not be forced into the page manifest merely because it has at least one verified waste-specific URL.

- **Data publication:** verified waste-specific official links for `standard`, `limited`, and `joint_service` belong in the searchable source datasets, regardless of whether a landing page exists.
- **`standard`:** eligible for a standalone page, but not automatically published.
- **`limited`:** normally data-only. A standalone page requires an expressly documented additional benefit; one ordinary direct link alone is insufficient.
- **`joint_service`:** data-only by default; a standalone page is optional when it genuinely clarifies municipal membership, divided districts, service jurisdiction, or another material user problem.
- **`reviewed_no_direct`:** final review state with evidence and no ordinary standalone page.
- **`pending_review`:** not completed; no independent page.

The original SPEC.md remains the selection reference: **2+ independently verified waste-specific link types** are a first-pass landing-page candidate, **3+ types** are preferred. Meeting the threshold does not itself authorize publication. Also require distinct utility versus the main search results, such as clear search demand, local-year/district guidance or documented joint-service responsibilities.

The manifest is an **explicit, curated allowlist**, not a mirror of all reviewed municipalities. Keep already indexed municipality pages and their links in place pending a separate content/SEO audit; do not mass-delete or create 404s as a side effect of this policy alignment.

The existing exact-source behavior remains mandatory:

- use only verified official links;
- retain `last_checked` where verified;
- preserve explicit `link_type`;
- never infer an annual calendar callout unless the source record explicitly identifies the applicable fiscal/calendar year;
- avoid municipality-wide claims from a source that applies only to one district.

## 7. Batch size

The previous 10-municipality wave size is no longer the default after this policy is adopted.

Default target:

- **50 municipalities per review batch** when source quality and CI remain stable;
- reduce to 25 when a region has unusually complex joint-service structures or source ambiguity;
- do not reduce batch size merely to preserve the old Wave cadence.

Batch size must never weaken source verification or final-state assignment.

## 8. Audit ledger requirement

The repository must maintain a machine-readable municipality review ledger keyed by `lgcode`.

Each Phase 1 municipality must eventually have at least:

- `lgcode`
- prefecture
- municipality name
- final or pending coverage state
- review date
- qualifying-source count
- distinct qualifying link-type count
- optional service-provider identity for `joint_service`
For migrated and newly reviewed rows, these two counts use `minimum_verified_for_state` semantics: they record the minimum verified source/type counts that justify the assigned state. CI independently recalculates the current direct-link datasets and requires the actual qualifying counts to be at least those recorded minimums. This avoids rewriting historical reviewed rows merely because additional official links are later added.

- optional review note / reason for `reviewed_no_direct`

The ledger, not the number of generated pages, is the authoritative Phase 1 completion measure.

## 9. Migration of already published municipalities

Existing published municipalities are not grandfathered outside this model.

They must be represented in the review ledger. Existing municipalities that satisfy the current 3-type / 3-URL rule should migrate to `standard` without changing their public behavior.

Do not downgrade or rewrite already verified source records merely to populate the ledger.

## 10. Designated-city administrative wards

The 175 designated-city administrative ward entries are not part of the 1,741 Phase 1 completion target.

After Phase 1 is complete, review them as a separate Phase 2:

- determine whether the ward has genuinely distinct waste rules or official waste pages;
- otherwise prefer city-level inheritance/reference rather than duplicating identical municipality content;
- never count inherited administrative-ward pages as additional independent municipalities.

## 11. Definition of nationwide completion

Phase 1 nationwide completion is reached when:

- review ledger coverage is **1,741 / 1,741**;
- `pending_review = 0`;
- every municipality has one final state;
- state counts reconcile exactly to 1,741;
- published-page count is reported separately and may be lower than 1,741 because `reviewed_no_direct` does not require a normal public detail page.

This definition supersedes the previous practical behavior of advancing only municipalities that already met the 3-distinct-link preferred threshold.
