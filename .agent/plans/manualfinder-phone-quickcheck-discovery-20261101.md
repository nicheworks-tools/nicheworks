# ManualFinder → Phone QuickCheck related-link discovery experiment
Date: 2026-11-01

## Evidence
The owner's existing daily GSC/GA4 sheet for 2026-10-02 to 2026-10-29 shows ManualFinder with 588 landing sessions. Phone QuickCheck does not appear in the GA4 top ~200 landing pages or top ~200 GSC pages (not proof of zero traffic). Existing affiliate links work and are tagged; lack of qualified visibility is currently a key bottleneck.

## Scope
Change only the already-permitted **footer-near related tools block** in `tools/manual-finder/index.html`: replace its unrelated LogFormatter entry with a link to `/tools/phone-quickcheck/`, localized JA `スマホサイズ・充電器確認` and EN `Phone QuickCheck`. Keep exactly three links, no new header/common navigation, no new ad slots, no marketing tracking, no user search parameter, no CTA that would pretend there are product results. No changes to Phone QuickCheck canonical data or affiliate tracking.

## Acceptance
Existing ManualFinder browser/SEO/runtime/spec CI green, merged to main. Verify published ManualFinder HTML includes both visible JA/EN links and target responds 200, then track Phone QuickCheck GA4 landing/total sessions and affiliate_outbound over a later comparable period. This placement alone does not prove clicks or sales.
