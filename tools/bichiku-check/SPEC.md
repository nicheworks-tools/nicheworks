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
