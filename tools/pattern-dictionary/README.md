# Pattern Dictionary — canonical 20 verified publication / canonical 100 freeze

Production implementation for the published 20-pattern visual dictionary, with the next 80 canonical entries frozen for staged expansion to 100. The live product provides visual discovery, exact-name/alias search, ambiguous description search, bilingual static detail pages, comparison guidance, reviewed Reference Images, publication validation, and the shared live NicheWorks Amazon Associates contract.

## Current state

- The **published runtime set remains exactly 20 patterns**. No planned 21-100 entry is exposed merely because it is present in the expansion manifest.
- Source verification is complete for all published 20 terms: 17 are verified and 3 (`moroccan-trellis`, `ikat`, `kilim`) remain qualified with explicit scope notes.
- `data/production-content.json` is at `verified-publication` and contains JA/EN definitions, distinguishing features, common uses, color contracts, term scope, qualification notes, and verified review state for all published records.
- All 20 primary Reference Images are deterministic 1536×1536 PNGs under `assets/reference/`, structurally reviewed, publication-verified, and runtime-wired.
- Broad or technique/category terms use representative recognition references and do not claim one uniquely canonical motif.
- JA/EN top pages provide visual browsing, client-side exact-name/alias search, ambiguous-description search, Visual Autocomplete, interpretation chips, confidence handling, typo tolerance, zero-result handling, and comparison.
- Search regressions cover the required natural-language Top1 cases plus exact names, mixed JA/EN, typo, confidence, and zero-result cases.
- Six canonical comparison guides are implemented, including Argyle vs the generic Diamond family.
- 20 JA + 20 EN static detail URLs exist under `patterns/{id}/` and `en/patterns/{id}/`; all 40 are `index,follow` and are listed in the root sitemap.
- All 40 detail pages carry canonical JA/EN hreflang pairs, Open Graph and Twitter metadata, absolute production Reference Image social previews, apple-touch icon metadata, and JSON-LD containing both `WebPage` and `WebApplication` identity.
- The 40-page detail surface passes the repository-wide indexable URL identity, head metadata cardinality, language metadata, internal-link, structured-data, and strict SEO audits.
- Desktop and 390px mobile Chromium QA passed for browse, search, bilingual detail routes, comparison, horizontal overflow, and the live affiliate flow.
- Amazon is active for all 20 published patterns using the maintained NicheWorks tag `nicheworks09-22` and shared `/assets/amazon-affiliate.js` helper.
- The published 20 expose 65 maintained Amazon.co.jp commerce-intent searches. User free text is never forwarded to Amazon.
- User search text is processed client-side only.
- Pattern Atlas remains a separate product and is explicitly out of scope for this expansion.

## Canonical 100 freeze

`data/canonical-100-expansion.json` is the planning source of truth for ordinals **21-100**. Together with the published `data/patterns.json` canonical 20, it defines a unique 100-entry target taxonomy.

The expansion is split into four fixed 20-entry production waves:

- **Wave 2 / 21-40:** checks, stripes, dots, and core geometric distinctions, including relationship-driven entries such as Buffalo Check, Shepherd's Check, Prince of Wales Check, Koushi, Herringbone, Diamond, Harlequin, and Checkerboard.
- **Wave 3 / 41-60:** geometric, floral, and ornamental families, including Hexagon, Hishi, Trellis, Toile de Jouy, Chintz, Acanthus, Medallion, and Ivy.
- **Wave 4 / 61-80:** ornamental, Japanese, and global textile/technique terms, including Baroque Scroll, Yagasuri, Sayagata, Tatewaku, Kagome, Nami Chidori, Tomoe, Shibori, Batik, and Bandhani.
- **Wave 5 / 81-100:** global textile traditions, animal prints, and abstract/material-inspired families, ending with Camouflage, Tie-dye, Marbling, and Terrazzo Pattern.

IDs and JA/EN display names are frozen for production unless source verification demonstrates a factual naming error. Broad techniques, textile traditions, styles, weave/effect terms, and material-inspired visual families stay explicitly qualified rather than being presented as one universal fixed motif.

The freeze also requires every `similar` and `often_confused_with` target already referenced by the published 20 to resolve within the canonical 100. This is why relationship-driven entries such as `koushi`, `hexagon`, `hishi`, and `ivy` take priority over lower-value generic candidates.

A planned entry does **not** become public simply by being frozen. Each 20-entry wave must close source verification, bilingual production content, Reference Image review, search regressions, comparison/relationship work, SEO/static routes, Amazon commerce mapping where appropriate, and desktop/mobile QA before it can enter `data/patterns.json` and the public runtime.

## Validation

Run from the repository root:

```bash
node --check tools/pattern-dictionary/app.js
node tools/pattern-dictionary/tests/canonical-100-test.mjs
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

The current publication contract still applies only to the published 20. `canonical-100-test.mjs` separately enforces the 20 + 80 taxonomy freeze, unique IDs, contiguous ordinals, four 20-entry waves, qualified broad-term handling, and complete resolution of the current relationship targets.

## Canonical-20 Amazon commerce contract

Amazon commerce is active for all 20 published patterns. Pattern Dictionary reuses the site-wide `/assets/amazon-affiliate.js` helper and maintained tracking ID `nicheworks09-22`. The shared ID is common across NicheWorks, while destinations are pattern- and intent-specific. Search-box text, autocomplete text, interpreted descriptions, and other user state must never be forwarded into Amazon queries.

The published 20 use **65 maintained Amazon.co.jp search destinations**. Every pattern has one broad pattern search plus two or three pattern-appropriate shopping intents such as apparel, accessory, material, or home. All destinations are fixed in `data/affiliate-config.json`, retain the shared Associates disclosure and sponsored link semantics, and are validated independently of Pattern Dictionary free-text search.

## Next production unit

After the canonical-100 freeze is merged, the next unit is **Wave 2 source verification for entries 21-40**. No Wave 2 runtime publication should occur until that research ledger is complete enough to determine which terms are verified and which must remain qualified.
