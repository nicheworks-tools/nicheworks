# Old Kanji Amazon activation + detail-layout repair

## Goal
Activate contextual Amazon.co.jp search handoffs for Old Kanji Reference and Old Kanji OCR Scanner using the already-validated NicheWorks tracking ID/search-link format, while repairing the unstyled dynamic shape/stroke detail blocks in Old Kanji Reference.

## Scope
- Old Kanji Reference: fixed contextual Amazon searches for old/variant-kanji dictionaries, document magnifiers, and book stands.
- Old Kanji OCR Scanner: fixed contextual Amazon searches for non-destructive book scanners and document magnifiers.
- Use `nicheworks09-22` and `https://www.amazon.co.jp/s?k=...&tag=nicheworks09-22`; do not derive search terms from user input.
- Use shared `/assets/amazon-affiliate.js` for disclosure, `rel="sponsored noopener"`, and coarse click analytics only.
- Add missing CSS for `shape-note` / `stroke-note` detail sections and mobile collapse.
- Update tool SPECs and canonical docs.
- Extend existing wave4 runtime contract checker; do not add or modify workflows.

## Non-goals
- No product images, prices, ratings, reviews, availability, or scraped Amazon metadata.
- No dynamic affiliate URLs based on searched kanji, OCR text, image metadata, or user state.
- No changes to OCR engine, kanji dictionary, mapping, Pro billing, or entitlement behavior.
- No new cross-tool navigation/header.

## Verification
- Exact tracking ID and fixed search queries are source-checked.
- Shared helper loads before per-tool affiliate runtime.
- Associates disclosure containers are present.
- Reference detail CSS covers shape/stroke grids, labels, values, tags, wrapping, and mobile 1-column layout.
- Existing wave4 runtime checker passes with new affiliate/layout assertions.
- Tool spec, SEO, and Construction Atlas checks pass before merge.
