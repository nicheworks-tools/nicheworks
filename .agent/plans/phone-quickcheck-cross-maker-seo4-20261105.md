# ExecPlan — Four cross-maker Phone QuickCheck SEO guides (2026-11-05)

## Goal
Expand Phone QuickCheck's indexable, Japanese-market charging accessory long-tail pages from five Galaxy-only guides to nine guides across five makers. The maintained catalog stays 255 verified Japan phones.

## Scope
- Four `tools/phone-quickcheck/models/<phone-id>/index.html` pages for Google Pixel 9a, SHARP AQUOS sense9, Sony Xperia 1 VII, OPPO Reno14 5G.
- Existing static `tools/phone-quickcheck/models/index.html` contextual model guide links.
- `sitemap.xml` discovery URLs.
- Additive CI checker `scripts/check-phone-quickcheck-cross-maker-profiles.mjs`, callable from the existing affiliate CI script and new public HTTP checks from `scripts/check-phone-quickcheck-production.mjs`.

## Rules
- Use canonical data and official manufacturer specs only; do not fabricate missing PPS, maximum charge W, bundled accessories or wireless status.
- Distinguish Pixel 9a 23W phone input from 45W recommended supply; SHARP 36W PD 3.0; Sony PD 30W recommended but max input unspecified; OPPO 80W proprietary SUPERVOOC vs 33W standard PD/PPS.
- Keep original 255 count, 11 makers, 24 accessory classifications, original five Galaxy SEO pages and every existing Amazon link.
- All outbound Amazon links are search/discovery, not certified product compatibility, with tracking tag `nicheworks09-22`, `rel="sponsored noopener noreferrer"` and clear Associates disclosure.
- No new dependencies, no personal identifiers or query strings in GA4 event payloads; retain existing model-profile event handler and hosted analytics tags.
- Run static/SEO/affiliate checks and public browser checks; merge after passing CI; check Cloudflare separately after merge.
- Do not alter or duplicate the site's existing Apps Script trigger or make any claim of actual Amazon orders without official report.
