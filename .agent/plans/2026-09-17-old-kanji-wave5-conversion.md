# Old Kanji SEO Wave 5 — 旧字体変換 / 旧漢字変換

## Goal
Improve the existing Kanji Modernizer page for observed Google Search Console conversion intent. Do not create another individual-kanji page when the remaining character-specific demand does not pass the old-to-modern publication gate.

## Demand gate
Authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-17 with finalized enhanced-precision data for 2026-03-21 through 2026-09-16.

Query-level conversion demand containing both `旧` and `変換`:

- `旧字体変換サイト`: 3 impressions, 0 clicks, average position 15.
- `旧 字体 変換`: 2 impressions, 0 clicks, average position 73.5.
- `旧 漢字 変換`: 1 impression, 0 clicks, average position 77.
- `旧字体 変換`: 1 impression, 0 clicks, average position 70.
- `旧漢字 変換`: 1 impression, 0 clicks, average position 76.
- `旧漢字変換`: 1 impression, 0 clicks, average position 81.
- `辰 旧 字 変換`: 1 impression, 0 clicks, average position 11; this is character-specific and is not treated as the generic conversion intent.

The generic conversion variants therefore have 9 observed impressions and 0 clicks in the period. Search Console page-level rows also show that some generic conversion intent currently lands on Old Kanji Reference instead of Kanji Modernizer.

## Why not another individual character page
The remaining visible character-specific rows include `臨 旧字体`, `魂 旧字体`, `霧 旧字体`, and `綱 旧字`. In the repository dictionary these are self mappings (`臨→臨`, `魂→魂`, `霧→霧`, `綱→綱`), not verified old-to-modern pairs. Existing exclusions from prior waves also remain in force for identity, compatibility, unresolved, or unsupported records.

## Scope
1. Keep the existing Kanji Modernizer URL and functionality.
2. Align Japanese title, H1, description, OG/Twitter metadata, and WebApplication name/description with the observed intents `旧字体変換` and `旧漢字変換`.
3. Add a concise static explanation above the converter that clearly states:
   - old-to-modern conversion is the default direction;
   - modern-to-old returns dictionary candidates and can be ambiguous;
   - examples are illustrative and dictionary-based, not legal/official-name verification.
4. Add a contextual internal link from Old Kanji Reference to Kanji Modernizer for whole-text conversion, so conversion-intent users are not stranded on the reference page.
5. Refresh only the existing Kanji Modernizer sitemap `lastmod`.
6. Do not modify dictionary mappings, conversion logic, individual-kanji pages, unrelated tools, billing, or CI rules.

## SEO/content constraints
- Do not claim contextual linguistic conversion; the implementation is character-by-character dictionary replacement.
- Do not claim official-name or registry correctness.
- Do not describe modern-to-old as uniquely determined when multiple candidates can exist.
- Keep canonical URL unchanged.
- No new mass/pSEO page family.

## Validation
- Preserve GA, AdSense, canonical, robots, OG/Twitter metadata, and WebApplication JSON-LD.
- Preserve both conversion directions and existing policy controls.
- Verify the Old Kanji Reference internal link resolves to `/tools/kanji-modernizer/`.
- Confirm the existing Kanji Modernizer sitemap URL appears once and only its `lastmod` changes.
- Run repository CI without weakening checks.
- Re-read latest `main` and PR mergeability immediately before squash merge.
