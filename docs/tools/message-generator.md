# Message Generator — canonical tool specification

- **Slug:** `message-generator`
- **Display name (JA):** メッセージ文生成補助
- **Display name (EN):** Message Generator
- **Implementation:** `tools/message-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** message, writing, template, communication
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `message-generator` implementation at `/tools/message-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Generate a short message draft from purpose, culture, formality, optional relationship, and optional keywords using a local phrase/template dictionary with small randomized wording variation.

## 3. Inputs

- Purpose, culture, and formality.
- Optional relationship and keyword text.
- JP/EN UI selection.

## 4. Processing behavior

- Require purpose, culture, and formality before generation is enabled.
- Support wedding, funeral, thank-you, apology, seasonal greeting, business greeting, and casual-message purposes.
- Support Japan, English-speaking, and EU culture selections plus high/medium/casual formality.
- Optionally incorporate relationship context for friend, family, boss, or client and user-supplied keywords.
- Build the result from local opening/closing dictionaries, purpose body templates, relationship phrases, and randomized lead/ending variants.
- Support regenerate using the same last input context and clipboard copy of the current result.
- Provide JP/EN UI, while generated phrase content can still reflect the selected culture dictionary rather than acting as a general translation engine.

## 5. Outputs

- Locally generated message draft.
- Regenerated variant from the same input context.
- Clipboard copy.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Message generation runs locally from fixed dictionaries/templates and does not call an AI model or send the entered context to a generation backend. Advertising and analytics resources may load independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The selector form and single generated-result block are compact and suitable for a narrow stacked layout.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same generator UI. Culture selection is a separate content parameter and should not be confused with the interface-language setting.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/message-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-absent`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Generate remains unavailable until purpose, culture, and formality are selected.
- [ ] Generation uses the selected culture/formality dictionaries and current purpose/relationship/keyword context without an AI API request.
- [ ] Regenerate keeps the same input context while allowing the implemented randomized phrasing to vary.
- [ ] Copy uses the current message and JP/EN switching preserves the generator behavior.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/message-generator/index.html`
- `tools/message-generator/app.js`
- `tools/message-generator/style.css`
