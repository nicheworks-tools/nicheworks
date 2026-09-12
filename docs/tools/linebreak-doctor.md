# Linebreak Doctor — canonical tool specification

- **Slug:** `linebreak-doctor`
- **Display name (JA):** 改行整形ドクター
- **Display name (EN):** Linebreak Doctor
- **Implementation:** `tools/linebreak-doctor/`
- **Registry state:** active (registered implementation present)
- **Category:** text, linebreak, format, writing
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `linebreak-doctor` implementation at `/tools/linebreak-doctor/`. It does not authorize a production rewrite.

## 2. Purpose

Generate platform-oriented copies of social-post text with adjusted line breaks, blank lines, and spacing before the user pastes the text into X, Instagram, LINE, Facebook, or LinkedIn.

## 3. Inputs

- Source post text.
- Invisible-character policy: platform-safe or plain-text.
- JP/EN UI selection.

## 4. Processing behavior

- Accept pasted source text and show its current character count.
- Generate platform-specific formatted variants using the current local formatting rules.
- Support a `platform-safe` policy that may insert zero-width spaces to help preserve blank lines and a `plain-text` policy that does not insert invisible characters.
- Explain the per-platform formatting rules and warn that platform behavior can change.
- Allow the user to review/copy the generated platform result before posting.
- Reset the current working state.
- Provide JP/EN UI.

## 5. Outputs

- Platform-specific formatted post-text variants.
- Character count, rule explanations, status, and clipboard copies.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Formatting runs in the browser and source post text is not intentionally uploaded by the formatting workflow. Advertising and analytics resources may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary use case is preparing short/medium social text for copying, with a vertical input → policy → results flow suitable for phones.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same formatter and platform guidance.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/linebreak-doctor/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Source text can generate the implemented per-platform variants without an application-backend request.
- [ ] Platform-safe and plain-text policies visibly differ in invisible-character behavior where the formatting rules require it.
- [ ] Generated variants remain reviewable/copyable and the UI tells users to confirm the actual post preview before publishing.
- [ ] JP/EN switching preserves the formatter, rule explanations, and invisible-character warning.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/linebreak-doctor/index.html`
- `tools/linebreak-doctor/app.js`
- `tools/linebreak-doctor/style.css`
