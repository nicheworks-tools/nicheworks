# Tool Specification — Cosmetic Ingredient Checker Lite

- Slug: `cosmetic-ingredient-checker-lite`
- Public URL: `https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a fast Japanese paste-first cosmetic ingredient checker that normalizes an ingredient list, matches exact INCI / Japanese / alias names against the local NicheWorks ingredient data, and summarizes useful reference categories without presenting medical, diagnostic, regulatory, allergy, concentration, or product-safety conclusions.

The Lite product is intentionally distinct from INCI FastScan:

- Lite = paste text and review quickly.
- INCI FastScan = photo/OCR plus more detailed bilingual review.

## Current functional contract

- Accept ingredient text containing INCI names, Japanese names, or a mixture.
- Parse explicit list separators while preserving legitimate ingredient-name punctuation such as `/`, `・`, and numeric locant commas such as `1,2-Hexanediol`.
- Match normalized input by exact INCI name, Japanese name, or declared alias against the existing local INCI FastScan dictionary files.
- Fall back gracefully to the implemented lightweight exact-match rules if dictionary files cannot be loaded.
- Show parsed count, dictionary-match count, review-candidate count, unclassified count, dictionary recognition percentage, top functional categories, and a row-per-ingredient result table.
- Surface the current unclassified ingredient names as a compact review list so users can see coverage gaps without scanning the entire table.
- Allow result-table filtering between all / unclassified / review-candidate / dictionary-match rows without re-running analysis.
- Allow users to copy only the current unclassified ingredient names for follow-up review.
- Keep `caution` / `risk` dictionary metadata internal to the matching layer; the Lite UI exposes only a non-diagnostic `確認候補` signal.
- Keep unknown entries explicitly unclassified rather than inventing a diagnosis or safety conclusion.
- Support clear/reset and copying the current result.
- Support Cmd/Ctrl + Enter as a convenience check action.
- Present explicit information-only and non-diagnostic disclaimers.
- Link to INCI FastScan when the user needs photo/OCR input.

## Inputs

- Pasted cosmetic ingredient-list text.
- Check, clear, copy, and result-filter actions.
- Optional keyboard shortcut: Cmd/Ctrl + Enter.

## Outputs

- Parsed ingredient count.
- Dictionary-match / review-candidate / unclassified summary.
- Dictionary recognition percentage (`dictionary matches / parsed ingredients`).
- Compact list of currently unclassified ingredient names, capped in the summary while the full table remains available.
- Up to eight prominent functional-category chips derived from matched dictionary entries.
- Ingredient table containing the original input name, current reference status/categories, and concise explanatory note.
- Client-side filtering of the result table by status, including a horizontally scrollable mobile control row.
- Clipboard copy of the current full result or unclassified-name subset.

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

Input, parsed results, and the current result filter are ephemeral current-page state. The current implementation does not define saved ingredient history or cross-session persistence.

## Privacy and network behavior

Ingredient parsing, filtering, and matching run in the browser. The pasted ingredient text is not intentionally uploaded by the checker workflow. Static dictionary files are loaded from the same NicheWorks origin. Suite-wide advertising and analytics resources may load separately, but raw ingredient input must not be included in analytics or affiliate events.

## Language mode

`Japanese-only`

The current UI explicitly labels itself Japanese-only. English UI must not be added merely to satisfy a suite-wide default unless the product contract is intentionally changed.

## Layout class

`mobile-oriented`

The page is input-first: the first meaningful interaction after the existing top advertising slot is the ingredient input. Results use a compact summary followed by mobile-friendly filter controls and a horizontally safe detailed table.

## Monetization readiness

The page includes the stable, intentionally inactive result-adjacent container:

```txt
#amazonAffiliateSlot
provider = amazon
placement = after-summary
state = inactive
```

Both cosmetics tools share these frozen runtime assets:

```txt
/tools/_shared/cosmetics-affiliate-config.js
/tools/_shared/cosmetics-affiliate-slot.js
/tools/_shared/cosmetics-affiliate-slot.css
```

`cosmetics-affiliate-config.js` is the single activation point. Before Amazon Associates setup is ready it must remain:

```txt
enabled = false
associateTag = empty
links = empty
```

The shared adapter is loaded only when the stable affiliate slot exists. While disabled it clears and hides the slot and emits no affiliate impression/click event. Future activation must not require changes to ingredient parsing, dictionary matching, result layout, or the slot ID/placement.

When activation is eventually allowed, optional analytics are limited to `affiliate_impression` and `affiliate_click` with generic metadata only: `tool`, `provider`, `placement`, `link_key`. Pasted ingredient names, complete analysis results, or other user-entered content must never be attached.

## Limits and non-goals

- `辞書一致` means only that the normalized name matched a local dictionary entry; it is not a safety guarantee.
- `辞書認識率` is a dictionary coverage indicator, not a product-quality or safety score.
- `確認候補` is a review cue, not a danger label.
- `未分類` is not evidence that an ingredient is unsafe.
- Result filters only change visibility; they do not change the underlying analysis.
- The tool does not know ingredient concentration, complete formulation context, user allergies, individual skin condition, pregnancy suitability, drug interactions, or regulatory status from the pasted list alone.
- Lite does not perform OCR; use INCI FastScan for image input.
- This improvement wave does not attempt a full audit of every dictionary entry.
- Amazon Associates is not active until account setup and policy verification are complete.

## Acceptance criteria

- [x] A comma-, Japanese-comma-, semicolon-, or line-break-separated ingredient list is parsed in input order.
- [x] Slash / middle-dot ingredient names and numeric locant commas are preserved by the shared parser.
- [x] Exact INCI / Japanese / alias matches can enrich Lite results from the local maintained dictionary set.
- [x] `Cetearyl Alcohol` does not become an ethanol-type alcohol result merely because the word `Alcohol` is present.
- [x] Unknown items remain explicitly unclassified rather than receiving fabricated safety claims.
- [x] Dictionary recognition percentage is visible after analysis without being framed as a safety score.
- [x] Unclassified ingredient names are surfaced compactly while the complete result table remains available.
- [x] Result rows can be filtered by status without changing analysis state, including on narrow mobile screens.
- [x] Users can copy only unclassified ingredient names without sending them to analytics or an external API.
- [x] The page remains explicitly Japanese-only and retains the medical/regulatory disclaimer.
- [x] The NicheWorks logo image is not shown in the tool header.
- [x] The donation block appears before the footer.
- [x] A clear INCI FastScan route exists for photo/OCR use.
- [x] The Amazon-ready slot exists and keeps the frozen `after-summary` placement.
- [x] Shared affiliate configuration remains disabled, empty, and non-tracking before activation.

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
- `tools/cosmetic-ingredient-checker-lite/enhancements.js`
- `tools/cosmetic-ingredient-checker-lite/enhancements.css`
- `tools/cosmetic-ingredient-checker-lite/qa.json`
- `tools/cosmetic-ingredient-checker-lite/howto/`
- `tools/inci-fastscan/data/ingredients*.json` (read-only runtime data dependency)
