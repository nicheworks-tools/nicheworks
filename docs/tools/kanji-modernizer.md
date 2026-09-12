# Kanji Modernizer — canonical tool specification

- **Slug:** `kanji-modernizer`
- **Display name (JA):** 旧字体変換ツール
- **Display name (EN):** Kanji Modernizer
- **Implementation:** `tools/kanji-modernizer/`
- **Registry state:** active (registered implementation present)
- **Category:** kanji, japanese, old-kanji, convert
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `kanji-modernizer` implementation at `/tools/kanji-modernizer/`. It does not authorize a production rewrite.

## 2. Purpose

Convert registered old-form and modern-form kanji character-by-character using the tool's dictionary while exposing replacements and ambiguity instead of claiming context-aware official-name conversion.

## 3. Inputs

- Text to convert.
- Old→Modern or Modern→Old direction.
- Modern→Old ambiguity policy.
- ASCII/URL/code-block exclusion toggle.
- JP/EN UI selection.

## 4. Processing behavior

- Accept arbitrary text and convert Old → Modern or Modern → Old using the loaded dictionary.
- For Modern → Old, support Conservative behavior that preserves characters with multiple candidates and First-candidate behavior that automatically selects the first dictionary candidate.
- Optionally exclude ASCII text, URLs, and code-block content from conversion.
- Highlight detected source hits, show converted text, list replacements/counts, and surface ambiguous Modern → Old candidates and resulting actions.
- Copy converted text and copy the replacement list.
- Display dictionary-size information and provide retry/error behavior if dictionary loading fails.
- Provide JP/EN UI while remaining a Japanese-kanji transformation tool.

## 5. Outputs

- Converted text.
- Highlighted original text.
- Replacement table and counts.
- Ambiguity-review table for Modern → Old where relevant.
- Clipboard copies of converted text/replacement list.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Conversion runs in the browser and the input text is not intentionally uploaded by the conversion workflow. The dictionary is a site-hosted tool resource. Advertising/analytics resources may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Large input/result blocks and replacement tables benefit from width but can be stacked for mobile use.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same converter and explanation while the transformed content remains kanji-focused.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/kanji-modernizer/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/kanji-modernizer/usage-en.html`, `tools/kanji-modernizer/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Registered Old → Modern characters are replaced according to the current dictionary and listed in the replacement summary.
- [ ] Modern → Old ambiguity follows the selected Conservative or First-candidate policy and is exposed in the ambiguity review.
- [ ] The exclusion option protects implemented ASCII/URL/code-block regions from conversion.
- [ ] JP/EN switching preserves the same dictionary behavior and non-authoritative-name disclaimer.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/kanji-modernizer/index.html`
- `tools/kanji-modernizer/app.js`
- `tools/kanji-modernizer/style.css`
- `tools/kanji-modernizer/usage-en.html`
- `tools/kanji-modernizer/usage.html`
