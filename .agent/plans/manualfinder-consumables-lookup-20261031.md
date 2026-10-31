# ManualFinder consumables lookup — 2026-10-31

## Goal
Give users seeking ink and toner a usable entry point to an exact-model product mapping already maintained in ManualFinder, and measure its Amazon outbound clicks.

## Scope
- Add `tools/manual-finder/consumables/index.html` and `app.js`
- Add a small text link in `tools/manual-finder/index.html` and `tools/manual-finder/en/index.html`
- Add one canonical URL to `sitemap.xml`
- Do not touch `common-spec/`, product mappings, Amazon tracking tag or pricing claims.

## Data contract
Use `MANUALFINDER_AFFILIATE_CONFIG` and the existing printer/toner mapping waves, not a second hand-maintained compatibility table.
Require a verified row and exact maker/model mapping; no inferred compatibility.
Search locally by model, manufacturer, and verified accessory code.
Show official manufacturer source and labeled Amazon search link; do not claim Amazon inventory or product accuracy.
No external query API, and preserve JA/EN toggle.

## Implementation
1. Add consumer-facing page with a true search/result interface and specific official compatibility caveats.
2. Use shared `NWAmazonAffiliate` for tagged links and GA4 outbound event.
3. Expose page via existing ManualFinder navigation and sitemap.
4. Keep SEO, privacy, Google analytics, and Amazon disclosures intact.

## QA
- JS syntax check, all HTML tags/assets/paths checked.
- Check example model Brother MFC-J4440N and product code LC416 against official mapping.
- Check empty/missing/invalid entries and bilingual toggling.
- GitHub checks must pass before merge; no self-clicks on affiliate links.
