# Old Kanji SEO Wave 1 — 画 / 畫

## Goal
Publish exactly one evidence-backed individual Old Kanji Reference page for the strongest verified Search Console demand after PR8 dictionary repair. Do not start mass/programmatic SEO.

## Evidence gate

### Search Console demand
Source: authenticated Google Search Console property `sc-domain:nicheworks.app`, queried through Supermetrics on 2026-09-16 with finalized results and query filters covering `旧字体|旧字|異体字|Unicode|新字体`.

- `計画 旧字体`: strongest current candidate; 11 impressions in the 180-day extraction, and 10 impressions with average position about 8.9 in the last 30 days.
- `臨 旧字体`: demand exists, but the repository dictionary classifies the character as identity, so it is excluded from individual old/new SEO.
- `魂 旧字体` and `霧 旧字体`: excluded for the same identity-mapping reason.
- `御 旧字体`: excluded from Wave 1 because an authoritative old/new mapping has not been established for this publication decision.
- `将 旧字体`: lower demand and already ranking strongly; not needed in Wave 1.

### Dictionary safety
PR8 left the Old Kanji audit with zero issue records and zero conflicting raw duplicate keys. `畫 → 画` is classified as `old_to_modern` and is eligible as a repository SEO candidate. This eligibility is necessary but not sufficient; the GSC demand above is the second gate.

### External authority
Before publishing factual copy, verify the relation with an authoritative source. The intended primary source is the Agency for Cultural Affairs (文化庁) 常用漢字表, which lists `画（畫）` and explains the parenthesized forms as historical/Kangxi-dictionary forms used to show the relation to older printed forms. Any Unicode code-point claim must be checked against Unicode before inclusion.

## Scope

Create only:

1. `tools/old-kanji-reference/kanji/ga-kaku/index.html`
   - canonical URL: `https://nicheworks.app/tools/old-kanji-reference/kanji/ga-kaku/`
   - answer the observed query immediately: the old form of `画` is `畫`, therefore `計画` can be written `計畫` in old-form orthography.
   - include primary-source citation/link and restrained explanatory copy.
   - link back to Old Kanji Reference and its usage guide.
2. Add one contextual internal link from the Old Kanji Reference root to the new page.
3. Add the new canonical URL to the existing root `sitemap.xml` next to the Old Kanji Reference entries.

No other individual kanji pages. No generator/template rollout. No dictionary mapping changes.

## Quality / stop conditions

- Do not publish unsupported character history, semantic claims, or name-use claims.
- Do not turn identity/unresolved records into SEO pages.
- Do not add a second character merely because it is dictionary-safe.
- Preserve current tool behavior and bilingual interface; this PR is additive SEO content only.
- Keep unrelated tools and current parallel work untouched.

## Validation

- Confirm page title, description, canonical, robots, OG/Twitter metadata, and structured data do not conflict.
- Confirm all relative links and stylesheet paths resolve from the nested route.
- Confirm the new page is reachable from Old Kanji Reference and appears once in `sitemap.xml`.
- Run repository CI without weakening or bypassing checks.
- Re-read latest `main` and confirm PR mergeability immediately before merge.
- Squash merge only if required checks pass and no conflict is present.
