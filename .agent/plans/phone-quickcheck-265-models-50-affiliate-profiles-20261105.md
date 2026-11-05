# ExecPlan — More verified smartphone listings and affiliate handoffs (2026-11-05)

## User priority
Grow **actual phone coverage and accessory buying paths first**; GA4/Apps Script integration is out of scope.

## Repo scope
`tools/phone-quickcheck/**`, `sitemap.xml`, the specifically matching `scripts/check-phone-quickcheck-*.mjs` tests, and this plan. Do not alter shared spec, cross-tool menus, payments, deployment settings, or unrelated programs.

## Batch goals
1. Add 10 missing, individual Japan-market Android smartphones to the curated phone dataset using manufacturer / carrier primary specs and explicit date/source URLs. Preserve the dated Nov-3 14-phone growth pack unchanged. Target 255→265 phones, same 11 manufacturers. No anonymous specs or mixed regional SKUs.
2. Add new device-specific commercial reference guides for 10 fresh records plus approximately 40 existing high-intent records across 11 manufacturers. Keep all nine published old pages unchanged; publish 50 new, 59 total.
3. Add four tagged Amazon discovery links to each new guide: appropriately matched charging cable, cautiously qualified charger category, explicit model-name case search and screen protector search. Those links are exploratory searches, not claimed compatible products. Never invent prices, reviews, commission or charge speed.
4. Add at least two new bilingual affiliate categories for smartphone case and protective film, wired to the existing `affiliate-config.js` query registry and safe event telemetry; do not send model, query text or Amazon URL to GA4.
5. Update static 265-row index, mother landing copy, structured metadata, sitemap for 50 distinct canonicals and new records; preserve JA+EN main UI. Keep old Apple/Google/Samsung ManualFinder mappings and all original links.
6. Update relevant existing QA checks for 265 rows, 26 accessory classes, 59 guide pages, 200 new tagged Amazon links, model-specific canonical sources, sitemap, English copy and click safety. Add a dedicated 50-page checks script and wire into existing affiliate CI. Update public HTTP smoke to require new pages only after `main` publish, not before.
7. Create PR, run CI, squash merge, verify Cloudflare Pages and deployed Chromium/browser smoke.

## Source/release safeguards
- Added verified sources for Pixel 3, 3a, 3a XL, 4, 4 XL, REDMI Note 14 Pro 5G, Redmi 14C, AQUOS sense2 SH-M08, AQUOS sense3 lite and moto g05. Record only explicit height/width/depth, weight, battery, connector, wattage and package facts; use null/unknown for absent details.
- Foldable and unknown-variant models are not promoted to generic cases/films.
- All Amazon links: `https://www.amazon.co.jp/s?k=...&tag=nicheworks09-22`, exact hostname and `rel="sponsored noopener noreferrer"`, Associates disclosure.
- No unsupported battery mAh for Apple and no inference that charger-side rated wattage equals phone-side input.
- After main deploy, verify browser and live HTTP, and report separately that affiliate revenue is unverified.
