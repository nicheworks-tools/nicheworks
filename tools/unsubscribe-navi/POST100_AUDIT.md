# 解約どこナビ — Post-100 coverage audit

Date: 2026-09-12

This document fixes the first 100-public-visible milestone audit before Phase 3 expansion. Counts are based on the effective merge contract: legacy base → additions → re-verification overlays.

## Effective database state

- effective records: **104**
- public-visible records: **100**
- verified: **98**
- needs_review: **1** (`amazon-prime`)
- retired: **1** (`d-tv`)
- placeholder: **4**
- direct procedure URLs: **100 / 104**
- verified records with `procedure_type`: **98 / 98**
- verified records with non-empty `billing_routes`: **98 / 98**
- verified records older than 90-day freshness threshold: **0** at this audit date

`procedure_url` presence alone is not verification. The four placeholder records remain intentionally hidden, and Amazon Prime remains `needs_review` despite having a candidate account URL.

## Category distribution

| Category | Effective records | Share of 104 |
| --- | ---: | ---: |
| `software_saas` | 31 | 29.8% |
| `video_streaming` | 18 | 17.3% |
| `mobile_carrier` | 10 | 9.6% |
| `ebooks_media` | 10 | 9.6% |
| `music_audio` | 8 | 7.7% |
| `ai` | 6 | 5.8% |
| `other` | 6 | 5.8% |
| `shopping_membership` | 5 | 4.8% |
| `gaming` | 5 | 4.8% |
| `cloud_productivity` | 5 | 4.8% |

### Category finding

The first 100-record set is materially SaaS-heavy. `software_saas` alone is 31/104, while shopping memberships, gaming and cloud/productivity are only five records each.

Phase 3 must therefore **not** add another broad SaaS wave simply because official help pages are easy to verify. Candidate selection should preferentially search the thinner categories and Japan-specific services first, while still allowing SaaS additions when user demand or route complexity justifies them.

Guardrail for Phase 3 discovery:

- treat category counts as a coverage signal, not a quota;
- do not let `software_saas` dominate a Phase 3 wave by default;
- prioritize `shopping_membership`, `gaming`, `cloud_productivity`, `music_audio`, `ebooks_media`, domestic carrier/service memberships and Japan-specific recurring services;
- continue adding `video_streaming` only where the billing route or cancellation semantics add material coverage;
- use search-query/GSC evidence after publication to override these provisional priorities when real demand says otherwise.

## Procedure-type distribution among verified records

| Procedure type | Verified records | Share of 98 verified |
| --- | ---: | ---: |
| `subscription_cancellation` | 74 | 75.5% |
| `automatic_renewal_stop` | 10 | 10.2% |
| `carrier_termination` | 10 | 10.2% |
| `plan_downgrade_or_cancellation` | 3 | 3.1% |
| `account_deletion` | 1 | 1.0% |

### Procedure finding

The database is correctly centered on subscription cancellation, but the less common semantic cases are exactly where an individual guide can add value. Phase 3 should deliberately preserve distinctions among cancellation, automatic-renewal stop, carrier termination/MNP, downgrade, and account deletion rather than normalizing all records to `subscription_cancellation`.

The single current `account_deletion` classification should be re-reviewed before publication to confirm that the underlying procedure truly represents account deletion rather than paid-plan termination. A taxonomy fix should be evidence-driven and must not be made only to make the distribution look cleaner.

## Billing-route coverage

All 98 verified records currently declare at least one `billing_routes` value. Coverage is therefore complete at the field-presence level.

The route vocabulary is intentionally more detailed than a small fixed enum because real services use different purchase and termination paths. Current data includes broad families such as:

- direct web / service account
- Apple App Store
- Google Play
- Amazon / Amazon Appstore
- carrier billing and carrier account portals
- partner billing
- service-specific account portals
- store / phone / MNP transfer routes where relevant

For Phase 3, do not collapse these raw routes. If cross-service analytics become necessary, add a separate normalized route-family layer while preserving the service-specific route values.

## Post-100 UI audit

At 100 public-visible records, the two-column desktop / one-column narrow layout remains usable, but the original search contract had a scaling weakness: the entire search input was treated as one contiguous substring.

Post-100 UI hardening therefore requires:

- NFKC normalization so full-width/half-width variants are less brittle;
- whitespace-tokenized AND search so queries such as `動画 App Store` can match records containing both concepts without requiring a contiguous phrase;
- category option counts so users can see the size of each category before filtering;
- verification-state option counts;
- a visible reset action when any filter is active;
- a clearer empty-state message that points users toward reducing or clearing filters.

These changes do not alter publication status or expose the staged tool.

## Phase 3 decision

Phase 3 remains a **candidate-discovery and verification** phase, not a blind +50 import.

Order of work:

1. close the remaining Amazon Prime `needs_review` only if a stable Japan-relevant official source can be fixed;
2. use this audit to source candidates from underrepresented categories;
3. keep official-source verification as the publication gate;
4. expand individual pages from the already selected P0/P1/P2 pool only after the first staged template set passes visual/mobile review;
5. use freshness reporting as a review trigger, never as an automatic state mutation.

Formal registration remains a separate decision and must not be bundled into Phase 3 data growth.