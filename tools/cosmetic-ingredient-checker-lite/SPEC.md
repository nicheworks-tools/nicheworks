# Tool Specification — Cosmetic Ingredient Checker Lite

- Slug: `cosmetic-ingredient-checker-lite`
- Public URL: `https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a fast bilingual paste-first cosmetic ingredient checker. A user pastes a full ingredient list and receives the useful answer first: each ingredient, its main role when supported, and a plain role explanation.

The tool is informational. It does not score product safety, diagnose skin conditions, estimate concentration, or determine whether a product is suitable for a particular person.

Lite and FastScan remain separate workflows:

- Lite = paste text and review immediately.
- INCI FastScan = photo/image OCR plus detailed review.

## Public result contract

The result experience is **answer-first**.

Order after a check:

1. ingredient-level result rows,
2. filters only when multiple rows make filtering useful,
3. aggregate role summary only for multi-ingredient results,
4. incomplete-information guidance when needed,
5. Amazon affiliate handoff after the useful result content.

A one-ingredient query must not show redundant result filters or an aggregate summary before the ingredient answer.

Each result row contains:

- original ingredient text,
- main role, or `情報不足 / Information incomplete`,
- role explanation or an explicit incomplete-information explanation.

### Explanation completeness rule

A row may be counted and labeled as `役割・説明あり / Role and explanation available` only when the runtime has both:

- a supported bilingual role label, and
- a non-empty JP and EN role explanation for that role.

Dictionary recognition by itself is not enough to qualify as a complete public result. A dictionary record with missing or unsupported role/explanation metadata is presented as `情報不足 / Information incomplete` rather than receiving a fabricated role description.

`note_short` remains a more specific data-layer note where available. Missing `note_short` must not be disguised as a verified ingredient-specific note. The public Japanese explanation may be a clearly role-level explanation; the UI labels that column `役割の説明` rather than implying that every sentence is an ingredient-specific monograph.

## Current functional contract

- JP/EN switching uses one bilingual single-page workflow.
- Accept INCI, Japanese names, aliases, or mixed ingredient lists.
- Preserve ingredient punctuation such as `/`, `・`, and numeric locant commas such as `1,2-Hexanediol`.
- Match exact normalized INCI/Japanese/alias names against the maintained local cosmetics dictionary.
- Keep matching/debug metadata internal; public value is the role and explanation.
- Keep incomplete entries explicit instead of inventing a role, diagnosis, or safety conclusion.
- Support clear/reset and result copy.
- Support Cmd/Ctrl + Enter.
- Link to INCI FastScan for photo/OCR input.
- Do not expose `caution`, `risk`, legacy `safety`, match route, or canonical-debug metadata as a consumer-facing verdict.

## Multi-result controls

When two or more result rows exist, Lite may show:

- result-state filtering,
- role/category filtering when at least two roles are present,
- visible-row count,
- copy-visible and copy-incomplete actions,
- aggregate role counts.

These controls are secondary to the ingredient-level answer and must not displace a single-result answer.

## Ingredient data dependency

Lite reuses the maintained static data shipped with INCI FastScan:

```txt
/tools/inci-fastscan/data/ingredients.json
/tools/inci-fastscan/data/ingredients-extra-1.json
...
/tools/inci-fastscan/data/ingredients-extra-8.json
```

The shared parser performs canonical merge and normalization. The legacy local Lite dictionary is not the runtime source of truth.

## State and persistence

Raw ingredient input, parsed results, filters, and summaries are ephemeral current-page state. Language preference may be stored locally under `cosmetic-lite-lang`.

No ingredient history is intentionally persisted by the checker workflow.

## Privacy and network behavior

Raw ingredient text and analysis remain in the browser. Static dictionary files are loaded from the NicheWorks origin. Suite-wide analytics, advertising, and other declared shared resources may load separately.

The Amazon layer is isolated from raw ingredient input and raw analysis. Ingredient names, unknown names, role categories, filters, copied subsets, or analysis output must not be attached to affiliate destinations or affiliate analytics.

Affiliate analytics are limited to fixed metadata:

```txt
tool
provider
placement
link_key
```

## Language mode

`bilingual single-page`

JP/EN switching re-renders the current result state without rerunning ingredient analysis.

## Layout class

`mobile-oriented`

The page uses the approved white-background v2 presentation. Desktop may use a detailed table. Narrow screens keep the same DOM contract while presenting result rows as stacked/card-like records rather than forcing horizontal table scrolling.

## Amazon affiliate contract

The affiliate block is a post-result handoff, not part of the answer.

```txt
#amazonAffiliateSlot
provider = amazon
placement = after-results
HTML default state = inactive
runtime state = active only after a rendered result exists and the fixed-link config validates
```

Shared assets:

```txt
/tools/_shared/cosmetics-affiliate-config.js
/tools/_shared/cosmetics-affiliate-slot.js
/tools/_shared/cosmetics-affiliate-slot.css
```

Activation contract:

```txt
enabled = true
trackingMode = tagged_search
associateTag = nicheworks09-22
displayMode = post_result_category_choice
placement = after-results
```

The current fixed Amazon Japan search choices are neutral user-selected categories:

- toner,
- serum,
- moisturizer,
- facial cleanser,
- cleansing / makeup remover,
- sunscreen,
- body care.

The entered ingredients and result categories do not choose, rank, or rewrite an Amazon destination.

The affiliate card must display `[PR]` and the active-language Amazon Associates disclosure.

## Limits and non-goals

- A role explanation is not a safety verdict.
- `情報不足 / Information incomplete` is not evidence that an ingredient is unsafe.
- A role-level explanation must not be presented as an ingredient-specific scientific monograph.
- The tool does not know ingredient concentration, full formulation context, allergies, individual skin condition, pregnancy suitability, drug interactions, or regulatory status from a pasted list alone.
- Lite does not perform photo/OCR; use INCI FastScan.
- Amazon links do not change based on ingredient input or analysis.
- The tool does not display Amazon price, availability, rating, seller status, review count, or product imagery.

## Acceptance criteria

- [x] Paste-first input remains the primary workflow.
- [x] Exact INCI/Japanese/alias matches use the maintained shared dictionary.
- [x] Result value is role-first, not match/debug-first.
- [x] Ingredient-level rows appear before aggregate summary and affiliate content.
- [x] One-result queries hide redundant filtering and aggregate summary.
- [x] The explanation column is explicitly `役割の説明 / Role explanation`.
- [x] A row is labeled complete only when a bilingual public role explanation exists.
- [x] Unsupported/missing role metadata is exposed as incomplete instead of receiving a fabricated complete label.
- [x] JP/EN switching preserves the current result state.
- [x] Mobile results remain readable without mandatory horizontal scrolling.
- [x] A clear INCI FastScan route exists for photo/OCR use.
- [x] The Amazon slot is after-results, fail-closed in HTML, and result-gated at runtime.
- [x] Fixed Amazon category choices remain independent of ingredient input and analysis.
- [x] Affiliate analytics contain no raw ingredient or analysis payload.

## Implementation evidence

- `tools/_shared/cosmetic-ingredient-parser.js`
- `tools/_shared/cosmetics-affiliate-config.js`
- `tools/_shared/cosmetics-affiliate-slot.js`
- `tools/_shared/check-cosmetics-affiliate-contract.mjs`
- `tools/_shared/check-cosmetics-cross-tool-release.mjs`
- `tools/cosmetic-ingredient-checker-lite/index.html`
- `tools/cosmetic-ingredient-checker-lite/app.js`
- `tools/cosmetic-ingredient-checker-lite/ui-v2.css`
- `tools/cosmetic-ingredient-checker-lite/enhancements.js`
- `tools/cosmetic-ingredient-checker-lite/enhancements.css`
- `tools/inci-fastscan/data/ingredients*.json`
