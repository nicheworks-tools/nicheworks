# Tool Specification — BichikuCheck

- Slug: `bichiku-check`
- Public URL: `https://nicheworks.app/tools/bichiku-check/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Owner: NicheWorks
- Canonical source: `tools/bichiku-check/`

## Purpose

Japan-focused mobile-first household disaster preparedness assistant. Calculate household shortages, show purpose-based gaps, compare dedicated emergency products / ordinary supplies / improvised substitutes, and provide an optional selected shortfall shopping list. Explain what is NOT automatically equivalent.

## Current functional contract

Four-step guided flow: (1) select stay-home versus go-bag, adults, children, days, scenarios and optional special needs; (2) show seven grouped gap categories; (3) inspect specific stock and conditions including food preparation water, toilet kit compatibility and floor insulation versus body warmth; (4) select missing categories for fixed Amazon Japan search, client-side CSV/print/copy. Catalog has 44 parent planning categories and 81 concrete options; only appropriate equivalents count toward target.

For two adults and seven days in stay-home mode the base targets include 42L drinking/cooking water, 42 staple portions (planning proxy only), 70 toilet uses. The estimate is not a nutritional, medical or product safety certification.

## Inputs

Adults/children/infants/pets, home or go mode, 3/7/14 days (home), no-heat, power outage, tap-water outage, dietary restrictions. User-entered owned and desired quantities and optional expiry dates per category or named item; explicit confirmation of safe preparation water and per-food total litres from label; toilet assembly compatibility/installation/disposal confirmation; shopping subset selections.

## Outputs

Seven goal-based gap cards, per-category target/usable/shortage values, distinct everyday/dedicated/conditional alternatives, evidence/cautions, preparation-water allocation, assembled toilet-use counts, selectable list of shortages, fixed affiliate searches, CSV/print/copy outputs, official sources and donate links.

## State and persistence

Same-origin `localStorage` key `bichiku-check-v1` retains settings, stocks and variants across languages and sessions; reset control deletes the key. No server persistence. Empty/blocked localStorage falls back to in-memory defaults. Current shopping selection lives only in current page session.

## Privacy and network behavior

Household data is calculated in the browser; no bespoke backend, fetch to shopping APIs or transmission of household settings to Amazon. Amazon.co.jp links contain only reviewed Japanese category queries and tag `nicheworks09-22`. Shared helper logs only tool/placement/offer/language metadata. Existing GA4, Cloudflare Analytics and Google AdSense loader may process separate analytics/advertising data under platform policies. Support links OFUSE and Ko-fi are external.

## Language mode

`mixed/reference-specific mode`: independent, crawlable Japanese, English, Simplified Chinese, Vietnamese entry pages; shared JS data and dedicated locale dictionaries. Hreflang and self-canonical, Japanese x-default.

## Layout class

`mobile-oriented`

320–414px primary, single input screen or one result stage at a time; no nested result scrolling or fixed ads. At >=769px, setup and result areas in separate columns, plus responsive option panels. Touch controls generally >=44px. Reduced-motion handled.

## Limits and non-goals

No automatically verified recipes, brand-specific nutrition or allergens, complete food sufficiency, price comparison, live stock, nearest shelter, weather warnings or guarantee of safe water. Improvised cardboard and foil do not automatically count as insulation/blankets. Water-dependent foods require a per-item manufacturer-method confirmation and manually verified total litres for all portions; if tap is out, the sum must fit stored water. The 3L/person/day planning target includes cooking. Expired items are conservatively excluded until reviewed. Go-bag quantities are illustrative, not a full-day drinking-water allowance. The website is not official emergency instructions.

## Acceptance criteria

- [x] Seven goal cards, four-step journey, 44 parents and 81 options, four language routes.
- [x] Safe-water quantity allocation prevents global blank checks and double credit for unrelated foods.
- [x] Improvised alternatives never silently satisfy fully equivalent equipment requirements.
- [x] Existing localStorage quantities carry across routes; CSV/print/copy and reset are available.
- [x] Browser tests for widths 320, 360, 375, 390, 414, 768, 1280; all four language entrypoints.
- [x] Official sources and fixed affiliate URL + disclosure are included.
- [ ] Independent native-speaker proofreading and physical-device tactile testing (recommended follow-up, not claimed completed).
- [ ] Actual Amazon Associates conversion/AdSense impressions verified in their dashboards.

## Implementation evidence

- `tools/bichiku-check/index.html` and `tools/bichiku-check/en/index.html`, `zh-cn/index.html`, `vi/index.html`.
- `tools/bichiku-check/core.js`, `decision.js`, `experience.js`, `catalog.js`, `options.js`.
- `tools/bichiku-check/experience-i18n.js`, `options-i18n.js`, `guided.css`, `style.css`.
- `tools/bichiku-check/tests/core.test.cjs`, `decision.test.cjs`, `mobile.smoke.mjs`.
- `tools/bichiku-check/README.md`.
- Official references: https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html, https://www.maff.go.jp/j/syokuiku/plan/4_plan/togo/html/part8.html, https://www.gov-online.go.jp/tokusyu/bousai/preparation.html.


## Post-release behavior correction (2026-11-03)

Selecting a power outage is not cosmetic: full-equivalence food needing heat is excluded unless the user separately confirms an appropriate non-electric cooking method, adequate fuel and a safe location. The no-heat scenario supersedes that confirmation. Water-dependent heated food still requires per-item method/water confirmation and sufficient safe-water allocation; a prohibited heating scenario does not allocate its prep water. Consumer Affairs Agency cooking/generator safety reference: https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063/ . An acknowledgement is a planning input, not proof of actual safety.

Shopping initially selects the first eight visible missing categories only. More categories start unchecked until expanded. Copy, CSV and printing include the selected subset, with a print-specific selected-item rendering. The user can select additional categories explicitly. No hidden default items are exported.

## 2026-11-03 safety/measurement increment

In the food detail, an informational food-group audit lists **types of usable registered protein, vegetable and fruit options** separately from main-staple portion targets. Expired or unverified items are excluded. It is not a nutrient, calorie or meal adequacy assessment; manual generic food holdings cannot be analyzed by group. Water-dependent vegetable side dishes now allocate their independently confirmed water but do not count as staple portions.

Named 2L/500mL bottled-water variants accept whole bottle counts in the UI and convert to persisted litres (2 or 0.5 respectively). Legacy stored variant quantity remains interpreted as litres; other water items require explicit litre totals because container size varies. Prevent double-entry under generic water category.

## Toilet-assembly decision precision (2026-11-04)

- Preserve 44 classifications/81 concrete options and existing persisted storage key. In the `toiletBags` entry, `bagQty` and `solidifierQty` are separately entered whole-use counts. The legacy `qty` field remains stored/displayed for manual review but never itself proves a usable matched pair.
- Credited loose-component uses = `min(floor(bagQty), floor(solidifierQty))` if the option is not expired **and** `toiletAssemblyConfirmed`, `toiletSeatConfirmed`, `toiletStorageConfirmed`, and `toiletDisposalConfirmed` are all true. Otherwise credit zero. Do not infer specific product compatibility or local disposal instructions.
- Complete `toiletKit` units require verified safe installation, sealed storage and disposal. They are not dependent on the loose-pair compatibility flag.
- Separate `home:` and `go:` entries; never silently migrate old `qty` into two component counts. Duplicate physical items must not be included both as a complete kit and as loose supplies.
- Informational help explains that waste classification/collection is locally determined. Maintain JP/EN/zh-CN/VI strings and regression tests.

## Verified off-grid heating session budget (2026-11-04)

- During blackout (`powerOut===true`) and where heating is possible (`noHeat===false`), do not authorize `prep:"heat"` products from legacy `offGridHeatConfirmed` alone.
- Gate on user-confirmed non-expired stove inventory and non-expired compatible fuel inventory, separate safe-use and fuel-compatibility checks, positive measured total fuel-supported sessions, **each registered unexpired heating-food** having an explicit positive whole number of cooking sessions and item confirmation, and `sum(food.heatSessions) <= gas.heatCapacityUses`.
- Fuel capacity is an explicitly entered estimate from the user's equipment/fuel instructions and heating plan; **do not derive from a default number of sessions per canister**. Do not promise effective safety or calorific coverage.
- Reject fractional stove, canister, fuel-session or food-session entries. User edits to stove/gas quantities or food heating demand must invalidate the related confirmations; do not delete legacy `offGridHeatConfirmed`.
- Distinguish from everyday heating without power outage and from `noHeat`. Apply to supplemental heated food as well as heat-dependent staple food; enforce the same budget across them. Block the entire uncertain heating group if totals exceed capacity rather than allocating a shared fuel unit multiple times.
- Keep home/go-bag per-mode quantities separate. Provide JP/EN/ZH/VI labels and mobile/browser decision regressions.

## Separating powered operational units from device ownership (2026-11-04)

- Applies to `stocks[mode+":"+id]` for `id in {light,lantern,radio,powerbank}` and `variants[mode+":"+id]` for explicit `{headlamp,ledLantern,flashlight,batteryBank}` options (or future `parent:"light"` options).
- `qty` = physically held items. `powerReadyQty` = personally verified working devices with fitted/compatible cells or charge. `powerReadyConfirmed` must be true before any working units are credited. Credited count is capped at `qty`, and noninteger counts are rejected. The count does not establish battery runtime or charging cycles.
- For battery banks, confirmation includes remaining charge, safe physical condition, appropriate connectors, and cable/device output compatibility; merely holding a separate `cable` item is insufficient. For lights/radios, confirmation includes working power and an operation or replacement-battery plan. `batteries` stocks are recorded as spare sets and do not automatically attach to any lamp.
- Existing `qty` values and localStorage key remain untouched, but old unverified units are not silently credited. Quantity, operating count and expiry updates invalidate approval. Manual entries are considered separately from named variants to avoid duplicate physical device counting.
- Reference sources are generic safety and inventory guidance, not product-certification proof. Always show JP/EN/zh/vi text, without changing the seven-goal/four-stage flow, shopping links or SEO.

## Shared typed-battery replacement budgeting (2026-11-04)

- Spare typed cell inventory is `stocks[mode+":batteries"].batteryCells.{AA,AAA,C,D,9V,CR2032,CR123A}`. Store unused cells as whole-number counts; preserve legacy `qty` (sets) but **never convert it into cells**. Expired entries provide zero typed spares.
- For operating `light`, `lantern`, `radio` manual stock and `parent:"light"` full options, record verified battery type, number of cells per device replacement, number of replacement cycles planned during `mode==="go"?1:days`, and `batteryPlanConfirmed=true` with the approved `batteryPlanDays`.
- Physical working count stays based on `powerReadyQty` / `powerReadyConfirmed`. A period-sustained device is covered only with a current-day plan and adequate shared type budget. For each dry-cell type `t`, `required[t] = sum(workingUnits × cellsPerChange × plannedChanges)`; `enough[t] = availableUnusedCells[t] >= required[t]`. Do not allocate the same spare AA inventory independently to two headlamps/radios, do not round up fractional stock, and never count already installed cells as spares.
- A currently working `rechargeable` device needs independent confirmation of enough charge or an off-grid charging plan, not an invented battery-life conversion. Zero replacement count is allowed only with explicit duration review; unknown and unverified types remain unresolved.
- During `powerOut=true`, computed shortages for lights, lanterns and radios use `sustainedEffective`, while `currentEffective` remains separately visible. Without outage, current operating stock stays the primary assessment. Do not assume the bank can repeatedly charge devices merely from mAh.
- Confirmations are invalidated on relevant quantity/type/cycle/expiry edits, and older three-day approvals do not apply to longer planning. Do not delete any `bichiku-check-v1` entries.

## Duplicate stock reconciliation (2026-11-05)

- `qty` on a parent entry is ambiguous relative to named `variant.qty`; do not automatically add the two when both are nonzero. Preserve historical values and use opt-in per-parent `manualCountBasis` of `"includes_options"`, `"additional"` or unset. Unset overlap credits no manual quantity until inspected. Quantity or expiry mutations require re-confirmation.
- `includes_options`: count named safe usable entries plus the **unlisted remainder**, `max(0,manualQty - namedOwned)`, if manual stock is not expired. Deduct raw owned named quantities even when expired/unusable, so they cannot become phantom manual reserves. `additional`: count all independently owned safe manual and named stock. If no named entries, parent manual stock remains countable under existing rules.
- The same deduplication feeds the `storedWater` budget, so cooking/preparation cannot spend the same litres twice. Treat matched toilet bag+solidifier uses as named inventory for overlap resolution with the manual toilet total. Apply to the current-operating and blackout-period credited light counts and batteries.
- Display a per-category reconciliation control and global caution before presenting a shopping list with disputed manual quantities. Manual review status stays per mode (`home:`/`go:`) and old `bichiku-check-v1` data is retained.
- Do not automatically deduplicate *different named variants* that a user knowingly enters; avoid guessing physical identities. Keep safety/expiry checks, testing in four languages and existing commercial code unchanged.
