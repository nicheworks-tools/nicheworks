# Cosmetic Ingredient Checker Lite — canonical tool specification

- **Slug:** `cosmetic-ingredient-checker-lite`
- **Display name (JA):** 化粧品成分チェック Lite
- **Display name (EN):** Cosmetic Ingredient Checker Lite
- **Implementation:** `tools/cosmetic-ingredient-checker-lite/`
- **Registry state:** active (registered implementation present)
- **Category:** cosmetic, ingredients, inci, beauty
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `cosmetic-ingredient-checker-lite` implementation at `/tools/cosmetic-ingredient-checker-lite/`. It reflects the current runtime after synchronization with main and does not authorize unrelated production rewrites.

## 2. Purpose

Provide a fast Japanese paste-first cosmetic ingredient checker that normalizes an ingredient list, matches exact INCI/Japanese/alias names against the maintained local ingredient data, and summarizes reference categories without presenting medical, diagnostic, regulatory, allergy, concentration, or product-safety conclusions.

## 3. Inputs

- Pasted cosmetic ingredient-list text containing INCI names, Japanese names, or a mixture.
- Check, clear/reset, and copy actions.
- Optional Cmd/Ctrl + Enter check shortcut.

## 4. Processing behavior

- Parse explicit comma, Japanese-comma, semicolon, and line-break separators while preserving legitimate ingredient-name punctuation such as `/`, `・`, and numeric locant commas such as `1,2-Hexanediol`.
- Reuse the maintained shared cosmetic parser and the local INCI FastScan dictionary files.
- Match normalized input by exact INCI name, Japanese name, or declared alias; do not promote substring similarity into an exact ingredient identity.
- Fall back to the implemented lightweight exact-match rules if the dictionary files cannot be loaded.
- Show parsed count, dictionary-match count, review-candidate count, unclassified count, dictionary recognition percentage, prominent functional categories, and a row-per-ingredient result table.
- Surface currently unclassified ingredient names as a compact review list so coverage gaps are visible without scanning the full table.
- Keep caution/risk metadata internal to the matching layer; the Lite UI exposes only a non-diagnostic review cue.
- Keep unknown entries explicitly unclassified rather than inventing a diagnosis or safety conclusion.
- Support clear/reset and copying the current result.
- Present explicit information-only and non-diagnostic disclaimers.
- Link to INCI FastScan for users who need photo/OCR input.

## 5. Outputs

- Parsed ingredient count.
- Dictionary-match, review-candidate, and unclassified summary counts.
- Dictionary recognition percentage (`dictionary matches / parsed ingredients`) as a coverage indicator, not a safety score.
- Compact list of currently unclassified ingredient names, capped in the summary while the full result table remains available.
- Up to eight prominent functional-category chips derived from matched dictionary entries.
- Ingredient table containing the original input name, current reference status/categories, and concise explanatory note.
- Clipboard copy of the current result.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard/validation path prevents a successful result from being shown without usable ingredient input.
- **Dictionary load failure:** Same-origin dictionary loading may fail; the current implementation falls back to its lightweight exact-match rules instead of fabricating remote or dictionary-backed matches.
- **Invalid or unsupported input:** Unrecognized items remain explicitly unclassified rather than receiving an invented ingredient identity or safety conclusion.
- **Copy failure:** Clipboard rejection follows the implemented feedback/fallback path and does not mutate the ingredient result.
- **Safe fallback/reset:** Clear/reset removes the current input-derived result and returns the tool to a retryable state.
- **Runtime evidence inspected:** `tools/_shared/cosmetic-ingredient-parser.js`, `tools/cosmetic-ingredient-checker-lite/app.js`, `tools/cosmetic-ingredient-checker-lite/enhancements.js`, `tools/cosmetic-ingredient-checker-lite/index.html`, `tools/cosmetic-ingredient-checker-lite/qa.json`.

## 7. Privacy/data handling

Ingredient parsing and matching run in the browser. Pasted ingredient text is not intentionally uploaded by the checker workflow. The tool fetches maintained static dictionary files from the same NicheWorks origin; user-entered ingredient text is not included in those requests. Suite-wide advertising and analytics resources may load separately, but raw ingredient input must not be added to analytics or affiliate requests.

Input and parsed results are ephemeral current-page state; the current implementation does not define saved ingredient history or cross-session result persistence.

Network-capable application code: **present for same-origin static dictionary loading**. External support/advertising/analytics resources are outside the core ingredient-processing payload.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The page is input-first: the first meaningful interaction after the existing top advertising slot is the ingredient input, followed by compact summary and a horizontally safe result table.
- The implementation must preserve its functional width class and follow common-spec section 9-2 adaptation rules; it must not be forced into a universal fixed-width layout.
- Current audit: no concrete responsive defect was established after the latest main changes.

## 9. Language contract

- **Policy:** `Japanese-only`.
- The current UI explicitly labels itself Japanese-only. English UI must not be added merely to satisfy a suite-wide default unless the product contract is intentionally changed.
- Existing Japanese behavior and safety wording must be preserved.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**.

## 11. Advertising contract

Preserve existing GA4 and AdSense identifiers/code. Advertising must follow common-spec placement rules and must not be inserted into the input flow or directly beneath the principal action button.

The current page also contains an intentionally inactive hidden Amazon-ready slot: `#amazonAffiliateSlot`, provider `amazon`, placement `after-summary`, state `inactive`. It must contain no live Amazon URL, Associates tag, affiliate claim, product recommendation, or click tracking until Amazon Associates configuration is explicitly activated. Future activation must not transmit pasted ingredient text or raw analysis results.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Current main-page donation/support evidence: **present**. Preserve the support block before the footer unless the suite contract intentionally changes.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Extended guidance:** the current repository contains `tools/cosmetic-ingredient-checker-lite/howto/`; no separate `usage.html` contract is required merely for filename consistency.
- **Usage documentation classification:** `recommended-and-missing` under the Phase 1 matrix semantics because no canonical `usage.html`/equivalent usage contract was established there; this remains recommendation-only, not a hard failure.
- **FAQ:** `recommended-and-missing`; absence remains recommendation-only under the common specification.

## 14. Functional acceptance tests

- [ ] Comma-, Japanese-comma-, semicolon-, and line-break-separated ingredient lists are parsed in input order.
- [ ] Slash/middle-dot ingredient names and numeric locant commas are preserved by the shared parser.
- [ ] Exact INCI/Japanese/alias matches enrich results from maintained local dictionary data without substring false positives such as treating `Cetearyl Alcohol` as plain `Alcohol`.
- [ ] Unknown items remain explicitly unclassified rather than receiving fabricated safety claims.
- [ ] Dictionary recognition percentage is visible after analysis and remains framed as dictionary coverage rather than a safety or product-quality score.
- [ ] Unclassified ingredient names are surfaced compactly while the complete result table remains available.
- [ ] Clear removes the current working result and copy uses the currently generated result.
- [ ] The page remains Japanese-only and retains medical/regulatory disclaimers.
- [ ] The INCI FastScan route remains available for photo/OCR use.
- [ ] The Amazon-ready slot remains inactive and hidden with no live affiliate URL/tag until explicitly configured.

Automated evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test) and `tools/_shared/check-cosmetic-ingredient-parser.mjs` (shared-parser regression/behavior assertions). Phase 1 tool-level behavior-test status remains **behavior-test-missing** because the shared parser check does not exercise the complete Lite UI workflow.

## 15. Explicit tool-specific exceptions

- Japanese-only is an explicit tool-specific language exception.
- No additional layout exception is established.
- Amazon affiliate integration is structural readiness only and is not live monetization.

### Implementation evidence

- `tools/_shared/cosmetic-ingredient-parser.js`
- `tools/_shared/check-cosmetic-ingredient-parser.mjs`
- `tools/cosmetic-ingredient-checker-lite/index.html`
- `tools/cosmetic-ingredient-checker-lite/app.js`
- `tools/cosmetic-ingredient-checker-lite/style.css`
- `tools/cosmetic-ingredient-checker-lite/enhancements.js`
- `tools/cosmetic-ingredient-checker-lite/enhancements.css`
- `tools/cosmetic-ingredient-checker-lite/qa.json`
- `tools/cosmetic-ingredient-checker-lite/howto/`
- `tools/inci-fastscan/data/ingredients*.json` (read-only runtime data dependency)
