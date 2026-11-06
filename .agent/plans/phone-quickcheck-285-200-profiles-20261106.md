# ExecPlan — Phone QuickCheck 285 verified phones and 200 commercial profiles (2026-11-06)
## Priority and baseline
User requested more listings and affiliate links before GA4 reporting. Baseline on main: 275 verified JP phone models, 27 accessory classes, 100 published model profiles, 175 uncovered listings. Do not recreate any existing profile or change cross-tool navigation.
## Scope
- tools/phone-quickcheck/data/phones.json and reviewed-unknowns.json
- tools/phone-quickcheck/models/index.html, tools/phone-quickcheck/index.html and 100 new model profile index.html files
- sitemap.xml
- scripts/check-phone-quickcheck-* validation and post-main production checks, .github/workflows/phone-quickcheck-production-smoke.yml if essential
No other tool, common spec, billing, deploy config or source history modifications.
## Work
1. Add 10 first-party Japan-market source-backed devices (Xiaomi family and SHARP AQUOS R9 pro), and explicit reviews for unverified package/water fields; never invent features.
2. Expand crawlable static directory and tool count to 285 while keeping all 11 makers and exact-model links.
3. Add 100 new individual model guides: all ten new models, plus 90 hitherto-uncovered existing catalog records from every maker. Each five discovery Amazon searches (cable, charger, case, screen protection, USB-C power bank), fixed tag nicheworks09-22; verify source provenance and explain product compatibility, variant dimensions, boxed accessories and charging standard uncertainty.
4. Add SEO canonical, metadata, TechArticle, WebApplication, official source citations, primary source links, and sitemap entries for exactly those 100 guides. Do not assert real prices, stock, compatible product IDs, sales, conversions or fees.
5. Update exact-count tests and add a dedicated 285/200 growth batch contract, ensure privacy-preserving gtag events and respect old 265 and 275 historical batch suites.
6. CI on PR (content/SEO/affiliate/data); deployed real HTTP Chromium check on main only, then squash merge after targeted failures resolved. Verify post-merge Pages and smoke.
## Exclusions
No Apps Script, GA4 sheet integration, Cloudflare account operations, Stripe changes, ads tuning or unrelated issue work.
