# Tool Specification — Cosmetic Ingredient Checker Lite

- Slug: `cosmetic-ingredient-checker-lite`
- Public URL: `https://nicheworks.app/tools/cosmetic-ingredient-checker-lite/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Parse a pasted cosmetic ingredient list and show lightweight ingredient flags and explanatory notes as a reference aid, without presenting medical, diagnostic, or regulatory conclusions.

## Current functional contract

- Accept ingredient text containing INCI names, Japanese names, or a mixture separated by commas, Japanese commas, or line breaks.
- Parse ingredients in input order and classify implemented ingredient patterns into simple caution/reference flags such as fragrance, preservative, alcohol, and related categories.
- Show parsed-item count, summary groups, simple consideration prompts, and a row-per-ingredient table with flag and note.
- Support clear/reset and copying the current result.
- Present explicit information-only and non-diagnostic disclaimers.

## Inputs

- Pasted cosmetic ingredient-list text.
- Check, clear, and copy actions.

## Outputs

- Parsed ingredient count.
- Summary/category indicators and consideration prompts.
- Ingredient table containing name, simple flag, and explanatory note.
- Clipboard copy of the current result.

## State and persistence

Input and parsed results are ephemeral current-page state. The current implementation does not define saved ingredient history or cross-session persistence.

## Privacy and network behavior

Ingredient parsing runs in the browser. The pasted ingredient text is not intentionally uploaded by the checker workflow. Suite-wide advertising and analytics resources may load separately.

## Language mode

`Japanese-only`

The current UI explicitly labels itself Japanese-only. English UI must not be added merely to satisfy a suite-wide default unless the product contract is intentionally changed.

## Layout class

`mobile-oriented`

The primary interaction is a single text input followed by summary and result table content; the workflow is intended to remain usable on narrow screens.

## Limits and non-goals

- Flags are simplified reference signals and do not establish safety, allergy risk, concentration, product suitability, medical diagnosis, or Pharmaceutical and Medical Device Act compliance.
- Ingredient names and classifications can be incomplete or ambiguous.
- The tool does not know ingredient concentration or formulation context from the pasted list alone.

## Acceptance criteria

- [ ] A comma-, Japanese-comma-, or line-break-separated ingredient list is parsed in input order and produces a result count/table.
- [ ] Implemented recognized ingredients can receive the corresponding simple flag/note while unknown items remain non-authoritative rather than fabricated diagnoses.
- [ ] Clear removes the current working result and copy uses the currently generated result.
- [ ] The page remains explicitly Japanese-only and retains the medical/regulatory disclaimer.

## Implementation evidence

- `tools/cosmetic-ingredient-checker-lite/index.html`
- `tools/cosmetic-ingredient-checker-lite/app.js`
- `tools/cosmetic-ingredient-checker-lite/howto/`
