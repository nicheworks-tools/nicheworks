# Pattern Dictionary — canonical 60 verified publication / canonical 100 freeze

Production implementation for the published 60-pattern visual dictionary, with the remaining 40 canonical entries frozen for staged expansion to 100. The live product provides visual discovery, exact-name/alias search, ambiguous description search, bilingual static detail pages, comparison guidance, reviewed Reference Images, publication validation, and the shared live NicheWorks Amazon Associates contract.

## Current state

- The **published runtime set is exactly 60 patterns** after Wave 3 (entries 41-60) completed source verification, bilingual production content, Reference Image generation/review, runtime search/compare integration, maintained Amazon commerce mapping, static-route SEO, and publication validation.
- Source verification is complete for all 60 published terms. Qualified terms remain explicitly scoped rather than being presented as one universal fixed motif.
- **Wave 2 / entries 21-40 is published and remains part of the canonical 60.**
- **Wave 3 / entries 41-60 is published in the branch transform:** 20 bilingual production records, 17 additional comparison guides, 52 staged natural-language search regressions, and 60 fixed Amazon commerce intents.
- `data/production-content.json` is at `verified-publication` and still contains only the 20 published records; Wave 2 remains isolated in `data/wave2-production-content.json` until the remaining publication gates close.
- All 20 published primary Reference Images are deterministic 1536×1536 PNGs under `assets/reference/`, structurally reviewed, publication-verified, and runtime-wired. Wave 2 Reference Images are the next gate.
- Broad or technique/category terms use representative recognition references and do not claim one uniquely canonical motif.
- JA/EN top pages provide visual browsing, client-side exact-name/alias search, ambiguous-description search, Visual Autocomplete, interpretation chips, confidence handling, typo tolerance, zero-result handling, and comparison.
- Search regressions cover the required natural-language Top1 cases plus exact names, mixed JA/EN, typo, confidence, and zero-result cases. Wave 2 adds 40 staged JA/EN Top1 cases before runtime integration.
- Six comparison guides are currently public. Wave 2 stages 13 additional canonical guides, including Glen Check vs Prince of Wales Check, Chevron vs Herringbone, Argyle vs Diamond Pattern, Koushi vs Ichimatsu, and Ichimatsu vs Checkerboard.
- 20 JA + 20 EN static detail URLs exist under `patterns/{id}/` and `en/patterns/{id}/`; all 40 are `index,follow` and are listed in the root sitemap. Wave 2 static routes are not yet public.
- All published detail pages carry canonical JA/EN hreflang pairs, Open Graph and Twitter metadata, absolute production Reference Image social previews, apple-touch icon metadata, and JSON-LD containing both `WebPage` and `WebApplication` identity.
- The current 40-page detail surface passes the repository-wide indexable URL identity, head metadata cardinality, language metadata, internal-link, structured-data, and strict SEO audits.
- Desktop and 390px mobile Chromium QA passed for the current published browse, search, bilingual detail routes, comparison, horizontal overflow, and live affiliate flow.
- Amazon is active for all 20 published patterns using the maintained NicheWorks tag `nicheworks09-22` and shared `/assets/amazon-affiliate.js` helper.
- The published 20 expose 65 maintained Amazon.co.jp commerce-intent searches. Wave 2 staging adds 2-4 fixed canonical shopping queries per new pattern; none is exposed until publication.
- User free text is never forwarded to Amazon. User search text is processed client-side only.
- Pattern Atlas remains a separate product and is explicitly out of scope for this expansion.

## Canonical 100 freeze

`data/canonical-100-expansion.json` is the planning source of truth for the remaining ordinals **61-100**. Together with the published `data/patterns.json` canonical 20, it defines a unique 100-entry target taxonomy.

The 100-entry plan is split into fixed 20-entry production waves; Waves 1-3 are published and Waves 4-5 remain planned:

- **Wave 2 / 21-40:** checks, stripes, dots, and core geometric distinctions, including relationship-driven entries such as Buffalo Check, Shepherd's Check, Prince of Wales Check, Koushi, Herringbone, Diamond, Harlequin, and Checkerboard.
- **Wave 3 / 41-60:** geometric, floral, and ornamental families, including Hexagon, Hishi, Trellis, Toile de Jouy, Chintz, Acanthus, Medallion, and Ivy.
- **Wave 4 / 61-80:** ornamental, Japanese, and global textile/technique terms, including Baroque Scroll, Yagasuri, Sayagata, Tatewaku, Kagome, Nami Chidori, Tomoe, Shibori, Batik, and Bandhani.
- **Wave 5 / 81-100:** global textile traditions, animal prints, and abstract/material-inspired families, ending with Camouflage, Tie-dye, Marbling, and Terrazzo Pattern.

IDs and JA/EN display names are frozen for production unless source verification demonstrates a factual naming error. Broad techniques, textile traditions, styles, weave/effect terms, and material-inspired visual families stay explicitly qualified rather than being presented as one universal fixed motif.

The freeze also requires every `similar` and `often_confused_with` target already referenced by the published 20 to resolve within the canonical 100. This is why relationship-driven entries such as `koushi`, `hexagon`, `hishi`, and `ivy` take priority over lower-value generic candidates.

A planned entry does **not** become public simply by being frozen. Each 20-entry wave must close source verification, bilingual production content, Reference Image review, search regressions, comparison/relationship work, SEO/static routes, Amazon commerce mapping, and desktop/mobile QA before it can enter `data/patterns.json` and the public runtime.

## Wave 2 source verification

`data/wave2-source-verification.json` is the research ledger for ordinals **21-40**. It freezes evidence-backed terminology, visual structure, aliases, color guidance, and the exact semantic boundary that production copy must preserve.

Current result:

- **Verified (13):** Buffalo Check, Shepherd's Check, Windowpane Check, Tattersall, Gun Club Check, Pinstripe, Chalk Stripe, Bengal Stripe, Awning Stripe, Zigzag, Diamond Pattern, Harlequin, Checkerboard.
- **Qualified (7):** Madras Check, Prince of Wales Check, Koushi, Regimental Stripe, Breton Stripe, Swiss Dot, Herringbone.

The qualified terms are deliberate, not incomplete research flags:

- **Madras Check:** Madras is also a textile/style tradition, not one immutable check repeat.
- **Prince of Wales Check:** modern usage overlaps with Glen Check; the practical overcheck distinction and historical relationship must both be explained.
- **Koushi:** 格子 is a broad Japanese lattice/check family and must not be collapsed into Ichimatsu.
- **Regimental Stripe:** a family tied to regimental neckwear conventions, not one universal color sequence or stripe direction.
- **Breton Stripe:** modern fashion usage is broader than the historically specified French naval marinière.
- **Swiss Dot:** fundamentally a dotted textile/fabric treatment, not generic flat polka dots.
- **Herringbone:** a weave/arrangement and broader broken-V visual family; it must be distinguished from simple printed Chevron/Zigzag.

`tests/wave2-source-verification-test.mjs` enforces exact 21-40 coverage, frozen JA/EN names, the 13/7 verification split, qualified-term boundary text, evidence records, source diversity, and the requirement that runtime remains the published canonical 20 during staging.

## Wave 2 production staging

The production layer for ordinals **21-40** is curated but intentionally isolated from the live runtime until image, route, SEO, affiliate, and browser-QA gates are complete.

- `data/wave2-production-content.json`: 20/20 bilingual definitions, distinguishing features, common uses, visual metadata, search terms, canonical-100 relationships, and maintained Amazon shopping intents.
- `data/wave2-compare-guides.json`: 13 bilingual comparison guides with decisive cues. Where appearance alone cannot decide the name, such as Ichimatsu vs Checkerboard, the guide explicitly preserves that ambiguity instead of inventing a false visual distinction.
- `data/wave2-search-dictionary.json`: staged bilingual interpretation vocabulary for exact terms and natural-language visual descriptions.
- `tests/wave2-search-cases.json`: 40 natural-language Top1 regressions, 20 Japanese and 20 English.
- `tests/wave2-production-content-test.mjs`: locks exact Wave 2 coverage, content completeness, relationship resolution, comparison integrity, Amazon-query policy, and all staged Top1 cases while asserting that runtime remains exactly 20 patterns.

The staged search contract initially exposed several real vocabulary gaps rather than being weakened to make the test pass. Natural expressions such as `カラフルな夏シャツのチェック`, `グレンチェックに大きい格子`, and `スーツの極細縦線` were added to the interpretation layer, and the complete 40-case contract now passes.

## Validation

Run from the repository root:

```bash
node --check tools/pattern-dictionary/app.js
node tools/pattern-dictionary/tests/canonical-100-test.mjs
node tools/pattern-dictionary/tests/wave2-source-verification-test.mjs
node tools/pattern-dictionary/tests/wave2-production-content-test.mjs
node tools/pattern-dictionary/tests/source-verification-test.mjs
node tools/pattern-dictionary/tests/production-content-test.mjs
node tools/pattern-dictionary/tests/reference-image-test.mjs
node tools/pattern-dictionary/tests/search-test.mjs
node tools/pattern-dictionary/tests/compare-test.mjs
node tools/pattern-dictionary/tests/affiliate-test.mjs
node tools/pattern-dictionary/tests/browse-mobile-test.mjs
node tools/pattern-dictionary/tests/validate.mjs
node tools/pattern-dictionary/tests/publication-test.mjs
node tools/pattern-dictionary/tests/seo-detail-test.mjs
node scripts/check-seo-indexable-url-identity.mjs
node scripts/check-seo-head-metadata-cardinality.mjs
node scripts/check-seo-language-metadata-integrity.mjs
node scripts/check-seo-internal-link-integrity.mjs
node scripts/check-seo-structured-data-integrity.mjs
node scripts/audit-seo.mjs --strict
```

The current live publication contract still applies only to the published 20. `canonical-100-test.mjs` enforces the 20 + 80 taxonomy freeze, `wave2-source-verification-test.mjs` locks the evidence boundary for 21-40, and `wave2-production-content-test.mjs` locks the completed non-public production pack.

## Canonical-20 Amazon commerce contract

Amazon commerce is active for all 20 published patterns. Pattern Dictionary reuses the site-wide `/assets/amazon-affiliate.js` helper and maintained tracking ID `nicheworks09-22`. The shared ID is common across NicheWorks, while destinations are pattern- and intent-specific. Search-box text, autocomplete text, interpreted descriptions, and other user state must never be forwarded into Amazon queries.

The published 20 use **65 maintained Amazon.co.jp search destinations**. Every pattern has one broad pattern search plus two or three pattern-appropriate shopping intents such as apparel, accessory, material, or home. All destinations are fixed in `data/affiliate-config.json`, retain the shared Associates disclosure and sponsored link semantics, and are validated independently of Pattern Dictionary free-text search.

Wave 2 follows the same rule: each staged pattern already has 2-4 fixed, pattern-appropriate commerce intents, but they remain non-public until the wave publication gate closes.

## Next production unit

Wave 3 is the current publication unit. After branch-level validation and desktop/mobile Chromium QA close, the next production unit is **Wave 4 / entries 61-80**. Wave 4 remains non-public until source verification, bilingual production content, Reference Image review, search/compare work, commerce mapping, SEO/static routes, and browser QA all close.
