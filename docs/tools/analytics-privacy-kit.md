# Analytics Privacy Kit — canonical tool specification

- **Slug:** `analytics-privacy-kit`
- **Display name (JA):** アクセス解析プライバシー確認キット
- **Display name (EN):** Analytics Privacy Kit
- **Implementation:** `tools/analytics-privacy-kit/`
- **Registry state:** active (registered implementation present)
- **Category:** analytics, privacy, ga4, website
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `analytics-privacy-kit` implementation at `/tools/analytics-privacy-kit/`. It does not authorize a production rewrite.

## 2. Purpose

Generate draft privacy-policy add-on text and analytics/advertising notices for small sites using services such as GA4, Cloudflare Web Analytics, Plausible, Google AdSense, Google Tag Manager, Microsoft Clarity, and Meta Pixel.

## 3. Inputs

- Site name.
- Optional site URL.
- Optional contact email.
- Provider checkboxes for GA4, Cloudflare Web Analytics, Plausible, AdSense, GTM, Clarity, and Meta Pixel.
- Output language selection.
- UI language selection.

## 4. Processing behavior

- Accept a site name plus optional site URL and contact email.
- Let the user select which supported analytics/advertising providers are used.
- Let the user choose Japanese or English output language independently of the UI language.
- Generate short, standard, and detailed draft text variants from the selected inputs.
- Support copying each generated variant, clearing the form, and downloading generated text as TXT.
- Show explicit legal/compliance disclaimers: generated text is a draft and does not guarantee legal or platform compliance.

## 5. Outputs

- Short, standard, and detailed draft notice/policy text.
- Clipboard copies of generated text.
- User-triggered TXT download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Draft generation runs in the browser; the entered site name, URL, and email are not submitted to an application backend by this tool. Advertising and analytics tags used by the NicheWorks page may still load independently of the drafting workflow.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `.`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary workflow is a vertical form followed by generated text blocks and remains naturally usable as a single-column tool on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same page UI, and the output language selector controls the generated draft language.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/analytics-privacy-kit/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Selecting providers and generating output produces short, standard, and detailed drafts in the selected output language.
- [ ] Copy and TXT download operate only on generated text and do not require sending the entered policy inputs to an application backend.
- [ ] Switching JP/EN UI does not remove the legal disclaimer or provider controls.
- [ ] Clear resets user-entered drafting state without creating stored history.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/analytics-privacy-kit/index.html`
- `tools/analytics-privacy-kit/app.js`
- `tools/analytics-privacy-kit/style.css`
