# BichikuCheck — disaster stockpile and go-bag planner

Status: **review candidate on a feature branch**. Do not present as live until the PR is merged and Cloudflare Pages has deployed it.

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
- 43 product/supply categories, about 34 visible for the default home scenario, 29 for the default go-bag.
- Some categories overlap (food/snacks, food/child-specific items). Do not sum them as independent nutritional requirements.
- Each item can be overridden to a personal desired target, including zero if not applicable.
- Single expiry date per category, not multi-lot inventory. Expired stock does not count.
- No automatic validation of whether an individual product is safe for allergies, religion-based dietary practices, children, or pets. Verify actual labels and consult specialists as appropriate.

Primary public references:
- [Prime Minister's Office, household preparedness](https://www.kantei.go.jp/jp/headline/bousai/sonae.html)
- [Government of Japan, preparation and toilet guidance](https://www.gov-online.go.jp/tokusyu/bousai/preparation.html)
- [National Consumer Affairs Center, emergency supplies](https://www.kokusen.go.jp/mimamori/mj_mailmag/mj-shinsen498.html)

## Monetization
- Reuses NicheWorks common `/assets/amazon-affiliate.js` and established Amazon.co.jp tracking ID `nicheworks09-22` on 38 relevant categories.
- Affiliate searches are fixed, curated Japanese category queries. **Never** insert household sizes, personal constraints, inventory values, expiry, or user text into Amazon URLs or analytics events.
- `rel="sponsored noopener"` comes from the shared link helper.
- Required Amazon Associates disclosure appears above the first result links. Localized explanation appears with it. The precise Japanese official statement is rendered by the common helper.
- No invented Amazon prices, stock, reviews, brand rankings, or claims of budget optimization. If unit pricing is added later, it must be sourced/dated or explicitly user-provided.
- No Amazon affiliate redirect until the user requests a result and clicks a category link.
- OFUSE and Ko-fi are both present, away from ads.
- Existing GA4, Cloudflare Analytics, and AdSense loader preserved; `ad-top` reserved but **no guessed AdSense unit ID**. A live display unit requires a verified slot ID before claiming ad monetization is active.
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

## Expansion gates
Track by locale: Search Console impressions/clicks for route, on-page result generation, coarse affiliate outbound click counts, and verified Amazon conversions from the Associates dashboard. Do not log household inputs. At day 30/90, decide continuation based on actual SEO and conversion data, not hypothetical revenue.
