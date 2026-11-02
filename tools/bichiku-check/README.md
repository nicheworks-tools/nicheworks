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

