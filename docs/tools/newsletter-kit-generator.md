# Newsletter Kit Generator — canonical tool specification

- **Slug:** `newsletter-kit-generator`
- **Display name (JA):** ニュースレター構成キット
- **Display name (EN):** Newsletter Kit Generator
- **Implementation:** `tools/newsletter-kit-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** newsletter, writing, marketing, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `newsletter-kit-generator` implementation at `/tools/newsletter-kit-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Generate a lightweight bilingual newsletter planning kit from a theme, audience, and delivery frequency.

## 3. Inputs

- Newsletter theme.
- Audience.
- Delivery frequency.
- JP/EN UI selection.

## 4. Processing behavior

- Accept newsletter theme, intended audience, and frequency.
- Generate a deterministic template containing subject ideas, issue structure, CTA ideas, and a sponsor pitch.
- Produce both Japanese and English sections in the generated kit regardless of the current UI language.
- Substitute explicit missing-input placeholders rather than blocking generation.
- Allow the generated kit to be copied to the clipboard.
- Switch the surrounding UI between JP and EN.
- Use local templates only; no AI generation backend is involved.

## 5. Outputs

- JP subject ideas, structure, CTA, and sponsor pitch.
- EN subject ideas, structure, CTA, and sponsor pitch.
- Clipboard copy of the full bilingual kit.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Kit generation is browser-local and does not send the entered newsletter details to an AI or text-generation backend. Ads may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The tool is three text inputs, generate/copy actions, and one output area.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The UI language switches, while the generated artifact intentionally contains both JP and EN sections.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/newsletter-kit-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-absent`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Generation works locally with any combination of filled or blank theme/audience/frequency inputs.
- [ ] The output always contains both JP and EN sections even when only one UI language is visible.
- [ ] Missing inputs use explicit placeholder text rather than invented user details.
- [ ] Clipboard copy copies the generated local template without an AI/API request.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/newsletter-kit-generator/index.html`
- `tools/newsletter-kit-generator/app.js`
- `tools/newsletter-kit-generator/style.css`
