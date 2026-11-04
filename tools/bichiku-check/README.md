# BichikuCheck — disaster stockpile and go-bag planner

Status: **staged, unregistered review candidate on a feature branch**. Four routes use `noindex,nofollow` and are intentionally absent from the public tools index/sitemap until launch gates pass. Do not present as publicly launched.

## Audience and product value
Japan-focused, mobile-first, free planning aid for Japanese users and foreign residents of Japan. The distinct consumer task is to subtract household inventory from suggested preparedness targets, optionally override targets, and immediately find missing categories on Amazon Japan. Not an official safety service, nutritional calculator, real-time alert service, or shopping comparison engine.

## Routes and UI
- `/tools/bichiku-check/` Japanese
- `/tools/bichiku-check/en/` English
- `/tools/bichiku-check/zh-cn/` Simplified Chinese
- `/tools/bichiku-check/vi/` Vietnamese
- Locale-specific page titles, descriptions, canonical tags, hreflang including x-default.
- Shared static `core.js`, `catalog.js`, `i18n.js`, `app.js`, and `style.css`.
- Mobile widths: 320, 360, 375, 390, 414px. **No horizontal scrolling, floating controls, or scrollable result panel**. Controls at least 43px high (normal buttons >=44px).
- Desktop >=769px: setup on left (310–370px), results on right; avoid simply enlarging the mobile column.
- Landing controls fit a minimal one-column flow: mode, household steppers, duration, collapsible constraints, primary calculate button.
- Result starts with priority shortages; optional and covered sections are collapsible. Each row has a visible stock input and optional Amazon link; editing target quantity and expiry is collapsed by default.

## Units, calculations, and what they do NOT mean
- Household drinking/cooking water: 3 L per adult/child per day. This does not include daily living water or individual infant needs.
- Food: three meal occasions per adult/child per day **for planning only**, not an assessment of calories or nutrition. User must count only edible food under the chosen cooking conditions.
- Portable toilet: five uses per adult/child per day (the lower end of the official 5–6 range).
- Go-bag: illustrative 0.5 L carry water/person and two portable-toilet uses/person; **not a recommended day-long ration**.
- Child diapers: illustrative six pieces/infant/day and six for the go-bag; adjust for actual use.
- Pet food: pet-days, not number of packets or meals.
- Other entries: starter checklist values, **not official universal minimums**.
- 44 planning categories including separate floor-insulating mats, with **81 concrete options** (emergency, household, and temporary substitutes); visible requirements depend on household/mode.
- Some categories overlap (food/snacks, food/child-specific items). Do not sum them as independent nutritional requirements. Food coverage represents **staple portions**, not balanced complete meals. In go-bag mode three staple portions/person are shown as a one-day planning example.
- Each item can be overridden to a personal desired target, including zero if not applicable.
- Single expiry date per category, not multi-lot inventory. Expired stock does not count.
- No automatic validation of whether an individual product is safe for allergies, religion-based dietary practices, children, or pets. Verify actual labels and consult specialists as appropriate.

Primary public references:
- [Prime Minister's Office, household preparedness](https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html)
- [Government of Japan, preparation and toilet guidance](https://www.gov-online.go.jp/tokusyu/bousai/preparation.html)
- [National Consumer Affairs Center, emergency supplies](https://www.kokusen.go.jp/mimamori/mj_mailmag/mj-shinsen498.html)

## Concrete foods and substitute data (second phase, 2026-11-02)
- `options.js` contains 81 named options with JA/EN/zh-CN/vi names, one parent category each, nutritional/functional role, intended use conditions, candidate-versus-substitute class, warning key, fixed Amazon Japan query (if relevant), and optional official primary reference.
- `options-i18n.js` contains localized warnings and capability labels; `options-ui.js` provides a mobile-first, initially folded searchable reference explorer in the results, with filters for food, warmth/mats, toilet/hygiene, water, power/equipment and other.
- All 81 options are **individual specific examples**, not 81 must-buy products. Existing broad category inputs are **unclassified other holdings**; new detailed entries are added separately and a warning tells users not to enter the same stock twice.
- Only options classed `equivalence=full` can contribute, and only via explicit user-entered quantities in the parent's units: staple food portions, safe water liters, portable toilet uses, people/sets of equipment. This is **not** an automatic translation from packaging quantity to calories, portions, liters or uses.
- `conditional` and `supplement` options NEVER automatically reduce the shortage figure (e.g. cardboard vs insulated sleeping pad, foil emergency sheet vs blanket, trash bags/newspapers vs dedicated toilet kits, canned fish vs a complete staple portion). A real example can help while not being represented as a guaranteed equivalent.
- When the no-heating scenario is selected, heat-required and unverified staple-food entries stay visible but **do not count** toward preparedness. Alpha-rice variants with drinking-water rehydration are an exception only where a manufacturer identifies that use; consult packaging before relying on it. A separate adequate safe-water supply still matters.
- Food remains grouped by staple/protein/vegetable/fruit/snack; no claim of caloric adequacy or allergy appropriateness. Protein and vegetables are shown as important complements rather than treated as one staple meal each.
- 2018/2019/2023 Tokyo Metropolitan Police **specific experiments** are linked for water-soaked cup noodles (~15m), yakisoba (~20m), cup udon (~60m). These are NOT product-universal preparation guarantees, safe temperature rules, or instructions to count all noodles as ready-to-eat:
  - https://www.keishicho.metro.tokyo.lg.jp/kurashi/saigai/yakudachi/food/instantnoodles/899806935150493697.html
  - https://www.keishicho.metro.tokyo.lg.jp/kurashi/saigai/yakudachi/food/instantnoodles/1012154906709405696.html
  - https://www.keishicho.metro.tokyo.lg.jp/kurashi/saigai/yakudachi/food/instantnoodles/1098362102173974528.html
- Specific source anchors also point to MAFF alpha-rice water rehydration, Government of Japan shelter-floor cardboard techniques, and Tokyo government's emergency toilet substitute.
- Food sanitation cautions are supported by: https://www.maff.go.jp/j/fs/foodpois_flooding.html .

### Known limitations
- No nutritional/macronutrient balancing; no automatic *one package = one meal* equivalence.
- No per-product manufacturer-specific temperature/preparation proof, verified thermal R-values, stock price, availability, or recommendations disguised as official.
- Alternative quantities currently use one optional expiry per option and are stored in localStorage only.
- Conditional substitutes do not count toward readiness until a future explicit validated equivalence model is introduced.

## Monetization
- Reuses NicheWorks common `/assets/amazon-affiliate.js` and established Amazon.co.jp tracking ID `nicheworks09-22` on 38 relevant categories.
- Affiliate searches are fixed, curated Japanese category queries. **Never** insert household sizes, personal constraints, inventory values, expiry, or user text into Amazon URLs or analytics events.
- `rel="sponsored noopener"` comes from the shared link helper.
- Required Amazon Associates disclosure appears above the first result links. Localized explanation appears with it. The precise Japanese official statement is rendered by the common helper.
- No invented Amazon prices, stock, reviews, brand rankings, or claims of budget optimization. If unit pricing is added later, it must be sourced/dated or explicitly user-provided.
- No Amazon affiliate redirect until the user requests a result and clicks a category link.
- OFUSE and Ko-fi are both present, away from ads.
- Existing GA4 and Cloudflare Analytics loaders are included. **AdSense is intentionally withheld while the tool is staged** to satisfy the NicheWorks AdSense review-surface contract. `ad-top` is reserved but no ad unit ID is guessed. Add the verified AdSense script/slot only in the public-release PR.
- Existing Amazon tag in source code is not proof of current Associates account eligibility or actual affiliate revenue; verify in the account.

## Privacy / technical
Everything entered is computed in browser JavaScript. Household configuration and one item/expiry per category persist in same-origin `localStorage` (`bichiku-check-v1`), and can be reset. Language changes keep the same storage key. No backend, API key, cookies written by tool logic, or user-data uploads. Platform ad/analytics scripts may use separate tracking under their own policies. CSV/print/copy are client-side.

## Test commands
With Node.js installed from repo root:
```sh
node --test tools/bichiku-check/tests/core.test.cjs
```

Review checklist before merge:
1. Width 320, 360, 375, 390, 414, 768, 1280px: verify no `document.documentElement.scrollWidth > innerWidth`, overlapping touch targets, or clipped long Vietnamese labels.
2. Four locales: page titles, locale persistence, readable translation, no untranslated controls. Have a proficient speaker proofread high-stakes disaster warnings before wide promotion.
3. Adults 2, seven days => 42 L, 42 meal occasions, 70 toilet uses; owned 12 L => 30 L short.
4. Expired stock counts as unavailable; target override works, including zero; independent home/go stocks stay separate.
5. Amazon links have fixed Japanese terms plus the existing `tag`, sponsored rel, correct disclosure, and no household data.
6. CSV, print, copy, reset, localStorage blocked/disabled. No broken internal links.
7. Check Cloudflare Pages preview, browser console, GA4 outbound event, production AdSense ad unit configuration and Amazon Associates account eligibility.

**Not shipped in this first implementation:** automatic current-price comparison, a true price-aware budget planner, multi-lot expiry tracking, automated expiry notifications, store stock feeds, dynamic safety alerts, live translations, PDF export, and guaranteed suitability scoring.

## Publication gate
The existing repo has fixed 89-tool spec, monetization, non-affiliate, and publishing audits. When choosing to publish as a 90th tool, coordinate public registry (`tools/tools-index.json`), sitemap, tools spec manifest, monetization ledger, non-affiliate classification, and all audit denominators. Do not change unrelated ledgers while this tool is only staged. Switch all four locales to `index,follow` and remove the staged-tools registry row only in the publication PR. Verify account setup and customer-facing translations first.

## Expansion gates
Track by locale: Search Console impressions/clicks for route, on-page result generation, coarse affiliate outbound click counts, and verified Amazon conversions from the Associates dashboard. Do not log household inputs. At day 30/90, decide continuation based on actual SEO and conversion data, not hypothetical revenue.

## Guided decision UX v2 — 2026-11-02

The four routes now load `experience.js` and `decision.js` instead of the previous `app.js` and `options-ui.js`. Those legacy files remain versioned for audit/rollback, but are not active. The established 44 parent categories and 81 concrete examples remain the shared underlying data; they are **not** displayed as a huge landing list.

User journey:
1. Choose **home/go-bag**, household size, time horizon, and outage/heat assumptions in a compact mobile input screen.
2. Show **seven outcome cards**: food, drinking water, toilet, sleeping/warmth, power/cooking, hygiene/health, and evacuation/other. Only the purpose-based shortages appear at first.
3. Enter a purpose to inspect parent targets and owned quantities, then compare **emergency-specific / everyday / improvised or conditional** named options, with warnings and manual expiry entries.
4. Produce a selectable **missing-items-only shopping list** with Amazon Japan links where curated, and client-side CSV, copy, print or reset.

### Composition and safety rules
- A food requiring preparation water is counted only after the user confirms safe drinking water, opens **each specific food**, records the total litres required for **all of its registered portions**, and checks that specific product's preparation instructions. Editing quantity or water volume invalidates its confirmation. Older stored global water quantities are never treated as confirmation for multiple foods. When tap water is unavailable, the allocation must fit stored drinking water. Water for food is allocated from the same water pool and is **not added twice** to the household's 3L/person/day planning target; the remaining amount is shown.
- Instant noodles with only an experimental police cold-water example are *not* automatically counted as ready to eat in a no-heat scenario. Manufacturer instructions and hygiene remain authoritative.
- Toilet bag/solidifier stock is credited only if the user explicitly confirms the complete assembly with compatible installation and safe sealed storage/disposal; otherwise it remains non-equivalent.
- Sleeping floor insulation and body warmth require different classes of supplies. Foil sheets and cardboard remain supplementary or temporary options.
- `core.calculate()` supports opt-in enforced-condition assessment, preserving the older API for existing tests. `decision.assessment()` returns the guided, dependency-aware values and seven goal groups.

### Scope and known constraints
- No product-specific verified recipes, calories or nutrition scoring, automatic amounts of food-preparation water, or evidence that an improvised shelter achieves a particular insulation value.
- The category stock quantities are **unclassified extra holdings**; specific quantities are added separately. Avoid entering the same units twice.
- No real-time Amazon pricing or paid advertising in staged preview. Shop links carry only fixed Japanese category queries, not user's family/outage data.
- Staged `noindex,nofollow`, not registered in public index/sitemap, until a separate coordinated launch PR.
- Unit tests include `tests/decision.test.cjs` and browser smoke targets the four-stage UI. Native language and actual-device usability review remain important.



## Blackout and shopping-selection correctness (2026-11-03)

- Selecting **power outage** now affects readiness of products that require heating. They are not credited until the user explicitly confirms a non-electric cooking device, adequate fuel and a safe place to use it. The separate **no heating possible** scenario always wins, regardless of that confirmation. Changing the outage/heat scenario invalidates the earlier off-grid confirmation.
- For water-dependent heated foods, both the confirmed per-item safe-water allocation and off-grid heat requirements apply. Food that cannot be heated during the blackout does not silently reserve preparation water.
- Safety: follow equipment instructions and provide adequate ventilation; do **not** use portable generators or charcoal burners indoors or in tents. Reference: https://www.caa.go.jp/policies/policy/consumer_safety/caution/caution_063/
- The shopping list initially displays and selects **only eight priority missing categories**. Others are explicitly unchecked until the user expands the list and selects them. A counter shows the number selected. Copy/CSV/print are based strictly on selections; print creates a separate selected-only layout that includes manually checked items even after the list has been collapsed.
- Automated regression now tests power-out heating and the hidden-item selection/print mismatch at mobile width 390px, in addition to previous 7 widths and four locales.

## Food-group visibility and explicit bottle units — 2026-11-03

- The `food` detail screen now reports **named food-group inventory** independently of the staple-meal target: protein/main-dish candidates, vegetable/side-dish candidates, and fruit candidates. The result is the number of **types with usable recorded stock**, not the number of nutritionally complete portions or a nutritional score. It does **not** check calories, nutrient composition, body requirements, or allergens. Unclassified category quantities do not imply any food group.
- Expired foods, unverified-preparation products, items needing unavailable heat and items needing unconfirmed preparation water remain uncredited in the food-group inventory. Water-using vegetable side dishes can be included only after their per-product preparation conditions and water volume are confirmed; they consume that same water allocation but do not count as staple meals.
- The 2L and 500mL named bottled-water entries accept **number of bottles**. The UI converts 3 × 2L to 6L and 4 × 500mL to 2L. Previously stored quantities remain in **litres**, so the page displays the equivalent bottle count without rewriting saved data. Other water products of unknown container size remain explicitly labelled in litres. Do not duplicate quantities in manual/unclassified entries.
- Other stock quantity labels now explicitly identify staple meal portions, water litres or usable toilet occasions when applicable.
- Core calculation and underlying 44/81 categories remain unchanged. Test coverage includes classification safety, expiry, preparation water, bottle arithmetic, 390px Chromium interactions and storage persistence.
- Official background: MAFF stocking guide https://www.maff.go.jp/j/zyukyu/foodstock/chapter03.html and preparedness food overview https://www.maff.go.jp/j/syokuiku/plan/4_plan/togo/html/part8.html.

## Toilet bag/solidifier matching and safe use review — 2026-11-04

- The toilet detail view separates **waste-collection bags** from **compatible solidifier/absorbent uses**. Only the lesser usable count can form a pair.
- To credit paired uses toward the toilet shortage, the user must separately confirm compatibility/instructions, safe toilet/commode installation, hygienic sealed temporary storage, and the local authority's disposal guidance. Unverified/expired/unmatched components do not cover a shortage.
- Complete toilet kits also require installation, sealed storage and disposal confirmation before counting, but not the separate bag/solidifier compatibility checkbox (because they are an identified kit). Do not register their included parts as additional loose components.
- The earlier `bichiku-check-v1` `variants[mode+":toiletBags"].qty` stays in localStorage for review but **cannot automatically create paired uses**. New fields `bagQty` and `solidifierQty` are integer usage counts. Old data is not deleted.
- This is a conservative planning/stock judgment, not a guarantee that a product is safe. The waste category and collection method are municipality-dependent; never assume all treated waste is burnable.
- Government sources: [Tokyo Metropolitan Government](https://www.koho.metro.tokyo.lg.jp/2025/09/01-1.html) and [Hekinan City](https://www.city.hekinan.lg.jp/soshiki/shiminseikatsu/kikikanri/disaster/22829.html).

## Blackout heating / fuel-session budget — 2026-11-04

- Replaces the old one-checkbox unlimited-heating assumption with **a safe stove, compatible fuel, explicit fuel capacity and the summed preparation sessions for every registered food requiring heat**. Historical `offGridHeatConfirmed` is retained in localStorage but **cannot** authorize any heating in the new calculation.
- Home and go-bag inventories remain independent. The existing `stocks[mode+":stove"].qty` and `stocks[mode+":gas"].qty` count usable stove units and fuel canisters. The user additionally enters `stocks[mode+":gas"].heatCapacityUses` (total estimated heating sessions across the stock, not per canister) and separately confirms `heatEquipmentConfirmed` and `heatFuelCompatibleConfirmed`. Zero stock, expiry, unchecked safety or insufficient capacity blocks heated foods under blackout.
- Food entries `variants[mode+":"+optionId]` with `prep:"heat"` gain `heatSessions` and `heatConfirmed`. This is the number of cooking sessions needed for all stored portions **of that food**, allowing batch preparation. The app cannot convert meals into sessions automatically. All heating-food session demands share the same user-verified fuel capacity; insufficient capacity blocks all heated foods rather than granting everyone the same fuel.
- Editing a food quantity or session count revokes that food's heating confirmation. Editing stove count revokes equipment confirmation; editing fuel count revokes the previous fuel capacity and compatibility confirmation, including via the power category.
- No fixed canister-to-session multiplier or implied use indoors/tents/cars. The [MAFF stock guidance](https://www.maff.go.jp/j/zyukyu/foodstock/chapter07.html) quotes around six canisters/person/week only as a **general preparedness example**. Actual fuel sessions depend on equipment, cooking method and manufacturer instructions. The [NITE stove safety guidance](https://www.nite.go.jp/jiko/chuikanki/press/2024fy/prs241226.html) applies.
- `noHeat` always blocks heated foods. Heating using ordinary electricity remains available when `powerOut` is false and `noHeat` is false. Food with `prep:"water"` is not forced into the heat budget. Water-dependent heated foods still require safe water and the product-specific allocated amount.
- Maintains original 44 parent categories, 81 concrete variants, four languages, localStorage key, guided four-stage navigation and existing shopping links. This is an input audit, **not** a guarantee of physical fuel performance or a product safety certification.

## Operational lighting, radio and mobile-power readiness — 2026-11-04

- Separates physically **owned** units from genuinely **operating** units for the named flashlight, headlamp, battery lantern and mobile power-bank options as well as manually entered `light`, `lantern`, `radio` and `powerbank` categories. New optional persisted fields are `powerReadyQty` (whole-number working units) and `powerReadyConfirmed` (explicit check).
- Under guided BichikuCheck assessment, an energy-dependent entry credits `min(qty,powerReadyQty)` **only** when `powerReadyConfirmed === true` and `powerReadyQty` is a non-negative integer. Unverified legacy quantities remain stored and visible as **owned**, but do not silently qualify as usable. Expiry/invalid stock still blocks credit. Home and evacuation go-bag inventories remain isolated.
- User confirmations mean: lights/radios actually turn on, compatible installed cells or available charge and an appropriate operation/battery-replacement plan; a bank actually contains charge, the output/USB cable works with the intended device, and the bank shows no damage. Merely recording spare battery sets or charging cables cannot certify a working device.
- Changing a parent or option quantity, its verified operating count, or expiry revokes its independent power confirmation. Fractional entries are rejected in UI. Owners and users of other/manual categories are unaffected.
- No automatic battery-set-to-device conversion, mAh-to-phone-charge cycles, or guarantee of multi-day runtime. The operator must avoid claiming the same spare cells are simultaneously usable in multiple devices and avoid double registering identical physical units in both manual and named stock.
- Official references: [Japan Disaster Management: flashlight and spare batteries are distinct](https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html); [Japan METI: mobile battery handling and connector safety](https://www.hkd.meti.go.jp/hokih/20220826/index.htm).
- Four-language guided UI and seven viewport smoke tests; existing 44 parent categories, 81 concrete options, `bichiku-check-v1`, commercial links/SEO, and four-stage journey unchanged.

## Typed spare-battery allocation and per-device replacement plans — 2026-11-04

- Distinguish **currently operating** units from **units sustained over the selected home preparation horizon**. During a power outage, `light`, `lantern` and `radio` coverage is calculated from the second value; the former remains visible. Without a power outage, the prior current-working-unit calculation remains in force. Mobile power banks retain their separately verified charged/compatible count, **not** a guaranteed multi-day charging capacity.
- `stocks[mode+":batteries"].batteryCells` holds integer counts of **unused spare cells** by AA, AAA, C, D, 9V, CR2032, CR123A. Existing `stocks[mode+":batteries"].qty` continues as legacy spare-battery *sets*: never multiply it by an assumed pack size, and never count it as a typed cell. Existing stored expiry invalidates typed stock.
- Each working manual device (`light`, `lantern`, `radio`) and named full light variant (`headlamp`, `ledLantern`, `flashlight`) may have `batteryType`, `cellsPerChange`, `plannedChanges`, `batteryPlanConfirmed`, and `batteryPlanDays`. For dry cells, total spare demand = **verified operating units × cells per replacement per device × replacements per device during the selected period**. Sum all demand **across** devices of the same battery type; do not double-count the same spare stock, or count installed cells as unused spares. A shortfall in a type blocks any period-sustained credit for devices requesting that type, rather than allocating the same stock multiple times.
- Zero replacement cycles are permitted **only when the user explicitly verifies** they do not need changes during the period; no manufacturer runtime is presumed. For `rechargeable`, a user must verify sufficient charge for the period or safe independent charging. Unknown/mixed battery types and unverified plans receive no period credit. Moving from 3 to 7/14 days requires fresh confirmation, and the go-bag uses its own one-day planning scope.
- Changing device ownership, working count, power confirmation, battery type, battery count, or planned replacement cycles invalidates the related battery plan. Date/expiry edits revoke it. Entering fractional cell counts or replacement cycles is blocked. Existing legacy stock is not deleted.
- Official battery safety guidance: [Battery Association of Japan](https://baj.or.jp/safety/primarybattery_light/safety20.html), [NITE](https://www.nite.go.jp/jiko/chuikanki/kyouzai/denchi.html). Never mix new/old or incompatible battery brands/types in one device, reverse polarity, or risk shorting loose cells. Do not infer runtime, cell chemistry interchangeability, charging cycles, or waste-disposal permissions.
- Preserve four-stage UI, four languages, 44 parent categories, 81 concrete options, SEO, affiliate/donation links and `bichiku-check-v1` key. No new scripts or tracking.
