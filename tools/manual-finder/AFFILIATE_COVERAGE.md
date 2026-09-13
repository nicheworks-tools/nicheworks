# ManualFinder Affiliate Coverage

Updated: 2026-09-13

ManualFinder must not require one manually generated Amazon short link per model. Official manufacturer destinations remain the primary output; Amazon is an optional commercial next action.

## Current strategy

There are two affiliate destination modes.

1. **Fixed override** — use an exact Amazon-generated Special Link when there is a reason to pin one specific destination. The current Nikon Z8 proof remains in this class.
2. **Validated deterministic template** — generate an Amazon search URL from canonical ManualFinder maker/model metadata plus the fixed NicheWorks tracking ID. One validated template can serve many model records; no per-model SiteStripe operation is required.

Amazon's help recognizes affiliate links created or edited outside Associates Central and provides Link Checker for validating them. The release gate is therefore **one representative template validation**, not thousands of manual short-link generations.

## Current template

- template: `manual_model_search`
- base: `https://www.amazon.co.jp/s`
- tracking ID: `nicheworks09-22`
- query source: canonical ManualFinder maker + model only
- user-entered search text: never used in the Amazon destination
- initial eligible categories: `カメラ・映像`, `プリンター・複合機`
- current status: `verified`
- verified: `2026-09-13`
- verification method: Amazon Link Checker
- representative proof URL: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`
- Link Checker result: the URL contains an Associates ID / Tracking ID that is correctly associated with the account

This one validation activates the same tagged-search format for eligible canonical model records. It does **not** require storing or maintaining one URL per model.

## Fixed overrides

| Maker | Model | Type | Status | Destination | Verified |
| --- | --- | --- | --- | --- | --- |
| Nikon | Z8 | Amazon search override | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |

The Z8 override remains useful as an end-to-end proof of SiteStripe/account behavior, but it is not the rollout model for the directory.

## Offer-rule budget

ManualFinder should stay rule-driven. The expected long-term shape is a small number of offer rules/templates, not thousands of links. Candidate rule classes include:

- model search;
- genuine ink / toner search where the consumable mapping is independently verified;
- battery / charger search where compatibility is independently verified;
- filter / replacement-part search where compatibility is independently verified;
- other narrowly justified accessory families.

A rule may apply to many canonical records. Compatibility-sensitive rules need their own verified mapping data; the generic model-search rule does not infer accessory compatibility.

## Runtime boundary

- `affiliate-config.js` owns the fixed tracking ID and deterministic URL builder.
- `affiliate-runtime.js` may use a dynamic destination only when the corresponding coarse template target is active.
- `/assets/amazon-affiliate.js` validates the destination host and records only fixed coarse analytics metadata such as `manual_model_search_template`; model names/search terms are not sent as analytics parameters.
- Existing fixed links continue to work as overrides.
- The verified model-search template is active only for the explicitly eligible categories; other categories still fail closed until deliberately added.
