# ExecPlan — Phone QuickCheck 275 verified phones and 50 additional commercial guides (2026-11-06)
## Intent
Prioritize real Japan smartphone catalog growth and Amazon accessory discovery. GA4 Sheets work remains lower priority.
## Target files
`tools/phone-quickcheck/data/phones.json`, `data/reviewed-unknowns.json`, `tools/phone-quickcheck/models/index.html`, 50 new `tools/phone-quickcheck/models/<slug>/index.html` files, `tools/phone-quickcheck/models/model-profile-affiliate.js`, `tools/phone-quickcheck/index.html`, `sitemap.xml`, matching scripts in `scripts/check-phone-quickcheck-*.mjs`, and this plan. Existing 14-phone historical pack, all earlier 59 guides, common-spec and other apps are untouched.
## Scope
1. Add 10 distinct domestic manufacturer or carrier-supported records from primary JP specifications: Pixel 3 XL, OPPO A79 5G, OPPO A73, OPPO Reno3 A, POCO X7 Pro, POCO F7 Pro, moto g66j 5G, nubia S 5G (A403ZT), AQUOS sense6s (SHG07), Xperia 10 III Lite (XQ-BT44). Avoid variant conflation, including case fit.
2. Add at least 40 meaningful commercial pages (10 new plus 30 maintained gap models) with device-specific dimensions, batteries where supported, standard-specific charger caveats, direct exact-model app link, primary-source links, canonical, TechArticle + WebApplication structured data, full OG/Twitter metadata and mobile layout.
3. Five Amazon fixed search categories per new page (USB cable, charging adapter, model-specific case, model-specific screen protector, 10,000mAh USB-C powerbank): 200 new tagged links at 40 pages, `nicheworks09-22`, sponsored, explicit disclosure. These are category searches, not verified compatible SKUs. Do not infer purchase/revenue.
4. Update the static 275-model index, 40 guide backlinks, public count text, 40 sitemap entries. Preserve existing EN/JA app, Galaxy ManualFinder exact SKU, Apple/Pixel aliases.
5. Extend CI contracts to account for 275 records and 40 new paths; preserve previous 50-profile and nine legacy-guide tests. Assert no GA4 payload sends model name or search query. Separate PR static tests from public post-merge smoke.
6. Run PR checks, fix failures, squash merge then inspect Cloudflare + production browser HTTP & five viewports.
## Evidence and safety
Only use official Google/OPPO/Xiaomi/Motorola/ZTE carrier/Sharp/Sony product sources; no broadening the manufacturer allowlist for unrelated sites. Retain unknown in-box and IP fields with reviewed_unresolved evidence entries, not fabricated labels. Distinguish charger-rated output versus device maximum input, particularly Xiaomi proprietary protocols.
