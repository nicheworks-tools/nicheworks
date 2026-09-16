# Tool Specification — Cosmetic Ingredient Checker Lite

- Slug: `cosmetic-ingredient-checker-lite`
- Public URL: `https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a fast bilingual paste-first cosmetic ingredient checker that normalizes an ingredient list, matches exact INCI / Japanese / alias names against the local NicheWorks ingredient data, and summarizes useful reference categories without presenting medical, diagnostic, regulatory, allergy, concentration, or product-safety conclusions.

The Lite product is intentionally distinct from INCI FastScan:

- Lite = paste text and review quickly.
- INCI FastScan = photo/OCR plus more detailed bilingual review.

## Current functional contract

- Provide JP/EN switching on the same page, including static copy, dynamic dictionary state, analysis results, filter labels, copy states, category labels, notes, and disclaimers.
- Keep Lite / FastScan switching visible in the tool header so users can move between the paste-first and OCR-first workflows without NicheWorks logo/title branding in the header.
- Accept ingredient text containing INCI names, Japanese names, or a mixture.
- Parse explicit list separators while preserving legitimate ingredient-name punctuation such as `/`, `・`, and numeric locant commas such as `1,2-Hexanediol`.
- Match normalized input by exact INCI name, Japanese name, or declared alias against the existing local INCI FastScan dictionary files.
- Fall back gracefully to the implemented lightweight exact-match rules if dictionary files cannot be loaded.
- Show parsed count, dictionary-match count, review-candidate count, unclassified count, dictionary recognition percentage, top functional categories, and a row-per-ingredient result table.
- Surface the current unclassified ingredient names as a compact review list so users can see coverage gaps without scanning the entire table.
- Allow result-table filtering between all / unclassified / review-candidate / dictionary-match rows without re-running analysis.
- Allow the status filter to be combined with a functional-category filter generated from the categories present in the current result.
- Show the current visible-row count against the complete result count while filters are active.
- Allow users to copy the currently visible ingredient names or only the current unclassified ingredient names; both actions are explicit local clipboard operations.
- Keep `caution` / `risk` dictionary metadata internal to the matching layer; the Lite UI exposes only a non-diagnostic `確認候補 / Review` signal.
- Keep unknown entries explicitly unclassified rather than inventing a diagnosis or safety conclusion.
- Support clear/reset and copying the current result.
- Support Cmd/Ctrl + Enter as a convenience check action.
- Present explicit information-only and non-diagnostic disclaimers in both UI languages.
- Link to INCI FastScan when the user needs photo/OCR input.

## Inputs

- Pasted cosmetic ingredient-list text.
- Check, clear, copy, status-filter, and category-filter actions.
- UI language (JP / EN).
- Optional keyboard shortcut: Cmd/Ctrl + Enter.

## Outputs

- Parsed ingredient count.
- Dictionary-match / review-candidate / unclassified summary.
- Dictionary recognition percentage (`dictionary matches / parsed ingredients`).
- Compact list of currently unclassified ingredient names, capped in the summary while the full table remains available.
- Up to eight prominent functional-category chips derived from matched dictionary entries.
- Ingredient table containing the original input name, current reference status/categories, and concise explanatory note.
- Client-side filtering of the result table by status and by currently represented functional category, including horizontally safe controls on narrow screens.
- Current visible-row count versus complete result count.
- Clipboard copy of the current full result, currently visible ingredient-name subset, or unclassified-name subset.
- The same result state can be re-rendered in JP or EN without rerunning ingredient analysis.

## Ingredient data dependency

Lite reuses the maintained static ingredient data already shipped with INCI FastScan:

```txt
/tools/inci-fastscan/data/ingredients.json
/tools/inci-fastscan/data/ingredients-extra-1.json
...
/tools/inci-fastscan/data/ingredients-extra-8.json
```

This is a same-origin browser fetch of static application data. User-entered ingredient text is not included in those requests.

The legacy `tools/cosmetic-ingredient-checker-lite/data/ingredients.json` is not treated as the runtime source of truth in the current Lite implementation.

## State and persistence

Input, parsed results, the current status filter, and the current category filter are ephemeral current-page state. UI language preference is stored locally under `cosmetic-lite-lang` when browser storage is available. The current implementation does not define saved ingredient history or cross-session result persistence.

## Privacy and network behavior

Ingredient parsing, filtering, matching, language re-rendering, and subset-copy operations run in the browser. The pasted ingredient text is not intentionally uploaded by the checker workflow. Static dictionary files are loaded from the same NicheWorks origin. Suite-wide advertising and analytics resources may load separately.

The Amazon affiliate layer is isolated from ingredient state. Raw ingredient input, parsed ingredient names, unknown names, categories, filters, complete analysis results, copied subsets, and UI language state must never be attached to affiliate analytics or the Amazon destination. Affiliate analytics are limited to fixed metadata: `tool`, `provider`, `placement`, `link_key`.

## Language mode

`bilingual single-page`

JP/EN controls switch the same Lite workflow. The initial language follows the stored local preference when available, otherwise the browser language (`ja` -> Japanese, other languages -> English). Switching language re-renders the visible static and dynamic UI without changing or rerunning the ingredient analysis.

## Layout class

`mobile-oriented`

The page is paste-first and uses the approved v2 white-background presentation with spacing, typography, and thin borders rather than gray page/card surfaces. The purpose of Lite is stated in the first view before the workspace. On narrow mobile screens, result rows are presented as card-like stacked records while preserving the existing result-table DOM contract; desktop keeps the detailed tabular presentation.

## Amazon affiliate contract

The existing result-adjacent slot is live through the shared cosmetics affiliate layer:

```txt
#amazonAffiliateSlot
provider = amazon
placement = after-summary
HTML default state = inactive (fail-closed before runtime)
runtime state = active when the fixed Amazon search config passes validation
```

Both cosmetics tools share these runtime assets:

```txt
/tools/_shared/cosmetics-affiliate-config.js
/tools/_shared/cosmetics-affiliate-slot.js
/tools/_shared/cosmetics-affiliate-slot.css
```

The current activation contract is:

```txt
enabled = true
trackingMode = tagged_search
associateTag = nicheworks09-22
fixed Amazon search categories = 4
verifiedAt = 2026-09-13
placement = after-summary
```

The four fixed destinations are neutral Amazon Japan searches for general skincare, moisturizing skincare, ceramide skincare, and sunscreen. They are defined statically in the shared config and are not selected, rewritten, or ranked from the ingredient analysis.

The adapter fail-closes unless a tagged-search destination is HTTPS on `amazon.co.jp` / an `amazon.co.jp` subdomain, uses the `/s` search path, contains a non-empty fixed `k` search term, and carries the exact configured Associate tag.

The live CTAs are intentionally generic and not tied to the ingredient analysis, for example:

```txt
スキンケアをAmazonで探す [PR]
保湿スキンケアを探す [PR]
セラミド系スキンケアを探す [PR]
日焼け止めをAmazonで探す [PR]
```

The affiliate card also renders the required disclosure for the active UI language, including:

```txt
Amazonのアソシエイトとして、NicheWorksは適格販売により収入を得ています。
```

These are fixed Amazon search handoffs. They are not statements that any product is safe, suitable, recommended, cheapest, available, hypoallergenic, or medically appropriate for the entered ingredients.

Affiliate analytics are limited to `affiliate_impression` and `affiliate_click` with `tool`, `provider`, `placement`, and `link_key`. Pasted ingredient names, complete analysis results, or other user-entered content must never be attached.

## Limits and non-goals

- `辞書一致 / Matched` means only that the normalized name matched a local dictionary entry; it is not a safety guarantee.
- `辞書認識率 / Dictionary recognition` is a dictionary coverage indicator, not a product-quality or safety score.
- `確認候補 / Review` is a review cue, not a danger label.
- `未分類 / Unclassified` is not evidence that an ingredient is unsafe.
- Result filters only change visibility; they do not change the underlying analysis.
- Category filters are derived from the tool's existing functional classification labels and are not product-suitability recommendations.
- The tool does not know ingredient concentration, complete formulation context, user allergies, individual skin condition, pregnancy suitability, drug interactions, or regulatory status from the pasted list alone.
- Lite does not perform OCR; use INCI FastScan for image input.
- The current Amazon links are fixed generic category searches and do not change based on the ingredient list or analysis result.
- The tool does not display Amazon price, availability, rating, seller status, review count, or product imagery.

## Acceptance criteria

- [x] A comma-, Japanese-comma-, semicolon-, or line-break-separated ingredient list is parsed in input order.
- [x] Slash / middle-dot ingredient names and numeric locant commas are preserved by the shared parser.
- [x] Exact INCI / Japanese / alias matches can enrich Lite results from the local maintained dictionary set.
- [x] `Cetearyl Alcohol` does not become an ethanol-type alcohol result merely because the word `Alcohol` is present.
- [x] Unknown items remain explicitly unclassified rather than receiving fabricated safety claims.
- [x] Dictionary recognition percentage is visible after analysis without being framed as a safety score.
- [x] Unclassified ingredient names are surfaced compactly while the complete result table remains available.
- [x] Result rows can be filtered by status and current functional category without changing analysis state, including on narrow mobile screens.
- [x] Current visible-row count remains visible while result filters are active.
- [x] Users can explicitly copy the currently visible ingredient names or only unclassified ingredient names without sending them to analytics or an external API.
- [x] JP/EN switching covers static and dynamic Lite UI, preserves the current analysis state, and retains the medical/regulatory disclaimer in both languages.
- [x] The header exposes Lite / FastScan switching without the NicheWorks logo/title branding used by the old UI.
- [x] The NicheWorks logo image is not shown in the tool header.
- [x] The mobile result presentation avoids a mandatory horizontal table-scroll experience by rendering table rows as card-like stacked records while preserving the DOM contract.
- [x] The donation block appears before the footer.
- [x] A clear INCI FastScan route exists for photo/OCR use.
- [x] The Amazon slot keeps the frozen `after-summary` placement and fail-closed HTML default.
- [x] Four fixed Amazon category searches are rendered only through `tagged_search` mode with the configured Associate tag.
- [x] Amazon destinations remain independent of ingredient input, result categories, unknowns, filters, and analysis output.
- [x] Amazon disclosure and `[PR]` labeling are visible with the live affiliate CTAs.
- [x] Affiliate analytics remain coarse and contain no ingredient or analysis payload.

## Implementation evidence

- `tools/_shared/cosmetic-ingredient-parser.js`
- `tools/_shared/check-cosmetic-ingredient-parser.mjs`
- `tools/_shared/cosmetics-affiliate-config.js`
- `tools/_shared/cosmetics-affiliate-slot.js`
- `tools/_shared/cosmetics-affiliate-slot.css`
- `tools/_shared/check-cosmetics-affiliate-contract.mjs`
- `tools/cosmetic-ingredient-checker-lite/index.html`
- `tools/cosmetic-ingredient-checker-lite/app.js`
- `tools/cosmetic-ingredient-checker-lite/style.css`
- `tools/cosmetic-ingredient-checker-lite/ui-v2.css`
- `tools/cosmetic-ingredient-checker-lite/enhancements.js`
- `tools/cosmetic-ingredient-checker-lite/enhancements.css`
- `tools/cosmetic-ingredient-checker-lite/qa.json`
- `tools/cosmetic-ingredient-checker-lite/howto/`
- `tools/inci-fastscan/data/ingredients*.json` (read-only runtime data dependency)
