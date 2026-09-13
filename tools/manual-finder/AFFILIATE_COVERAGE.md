# ManualFinder Affiliate Coverage

Updated: 2026-09-13

ManualFinder must not require one manually generated Amazon short link per model. Official manufacturer destinations remain the primary output; Amazon is an optional commercial next action.

## Decided rollout strategy

ManualFinder will stay rule-driven. The target is a small number of reusable commerce rules, not a URL ledger with hundreds or thousands of rows.

The rollout order is fixed as follows:

1. **Generic exact-model search** — active now. One validated Amazon search template generates a tagged search URL from canonical ManualFinder `maker + model` metadata.
2. **Printer consumables** — next specialized rule family. Add only after cartridge/toner mappings are independently verified from manufacturer evidence; never infer compatibility from a model string.
3. **Camera batteries / chargers** — later, only for independently verified compatibility mappings.
4. **Appliance replacement parts / filters** — later, only where exact compatibility can be proven.
5. Additional accessory families require a clear user need and a verified mapping source. Do not proliferate rules merely to increase affiliate density.

This keeps the expected long-term rule count well below a large per-model inventory while allowing each rule to cover many canonical records.

## Destination modes

There are two destination modes.

1. **Fixed override** — an exact Amazon-generated Special Link when there is a reason to pin one specific destination. The current Nikon Z8 proof remains in this class.
2. **Validated deterministic template** — a reusable Amazon search URL generated from canonical ManualFinder maker/model metadata plus the fixed NicheWorks tracking ID. No per-model SiteStripe operation is required.

Amazon Link Checker validated the representative tagged-search format on 2026-09-13. One validated format is therefore used for eligible model records instead of storing one short link per model.

## Generic model-search rule

- template: `manual_model_search`
- base: `https://www.amazon.co.jp/s`
- tracking ID: `nicheworks09-22`
- query source: canonical ManualFinder maker + model only
- user-entered search text: never used in the Amazon destination
- status: `verified`
- verified: `2026-09-13`
- verification method: Amazon Link Checker
- representative proof URL: `https://www.amazon.co.jp/s?k=Brother+MFC-J4440N&tag=nicheworks09-22`
- Link Checker result: the URL contains an Associates ID / Tracking ID correctly associated with the account

### Eligible categories

The generic exact-model rule is active for these product categories:

- `PC・スマホ`
- `家電`
- `プリンター・複合機`
- `カメラ・映像`
- `オーディオ`
- `ゲーム`
- `ネットワーク機器`

A result must also contain a non-empty canonical model. Generic manufacturer entrances therefore do not receive an Amazon CTA.

### Deliberate exclusion: `その他`

`その他` is excluded from the generic rule. It currently mixes materially different identities such as Seiko watch calibers and Roland legacy product records. A caliber code is not necessarily a retail product model, and a broad heterogeneous category is not a safe basis for automatic commercial matching.

Useful `その他` families may receive their own narrowly scoped rule later (for example a verified CASIO product family), but there will be no blanket `その他` activation.

## Current fixed override

| Maker | Model | Type | Status | Destination | Verified |
| --- | --- | --- | --- | --- | --- |
| Nikon | Z8 | Amazon search override | verified | `https://amzn.to/3T7sxbB` | 2026-09-13 |

The Z8 override remains an end-to-end proof of SiteStripe/account behavior. It is not the normal rollout mechanism.

## Runtime boundary

- `app.paged.js` places canonical `maker`, `model`, and `category` metadata on each rendered result card. Affiliate code does not reverse-engineer those fields from display text.
- `affiliate-config.js` owns the fixed tracking ID, category policy, and deterministic URL builder.
- `affiliate-runtime.js` uses a dynamic destination only when the coarse template target is active.
- `/assets/amazon-affiliate.js` validates the Amazon destination host and records only fixed coarse analytics metadata such as `manual_model_search_template`; maker/model/search terms are not analytics parameters.
- Existing fixed links may continue as explicit overrides.
- Unsupported categories, empty models, malformed URLs, and unverified specialized rules fail closed.

## Measurement rule

Do not add specialized offer families merely because they can be generated. First measure the generic rule by eligible-result exposure and coarse affiliate clicks, then prioritize specialized mappings where the ManualFinder task naturally creates replacement-purchase intent. Printer consumables are the first such target because the relation between an exact printer model and its consumable is useful only when compatibility has been verified.
