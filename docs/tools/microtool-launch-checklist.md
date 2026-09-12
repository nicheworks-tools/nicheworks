# Microtool Launch Checklist — canonical tool specification

- **Slug:** `microtool-launch-checklist`
- **Display name (JA):** ミニツール公開チェックリスト
- **Display name (EN):** Microtool Launch Checklist
- **Implementation:** `tools/microtool-launch-checklist/`
- **Registry state:** active (registered implementation present)
- **Category:** launch, checklist, microtool, seo
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `microtool-launch-checklist` implementation at `/tools/microtool-launch-checklist/`. It does not authorize a production rewrite.

## 2. Purpose

Generate a lightweight pre-launch checklist for small web tools so a publisher can review common release concerns before shipping.

## 3. Inputs

- Tool type: converter, checker, generator, or directory.
- JP/EN display language.

## 4. Processing behavior

- Classify the tool as converter, checker, generator, or directory.
- Generate a checklist tailored to the selected class.
- Cover common launch concerns such as SEO, ads, donation/support links, mobile layout, error states, disclaimers, and related links.
- Allow generated checklist text to be copied or saved as Markdown or TXT.
- Provide JP/EN display switching.
- Act as a manual review aid; it does not execute repository checks or validate a live deployment.

## 5. Outputs

- A generated pre-launch checklist.
- Clipboard copy.
- Markdown download.
- TXT download.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Checklist generation runs in the browser and does not require sending checklist inputs to an application backend. Advertising and analytics resources may load separately as part of the page.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary flow is one select control followed by actions and a single output block.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN content is switched on the same page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/microtool-launch-checklist/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Each of the four supported tool classes can produce a checklist without a server-side generation dependency.
- [ ] Generated content can be copied and downloaded as both Markdown and TXT.
- [ ] The UI does not imply that checklist completion guarantees legal, privacy, ad, or deployment correctness.
- [ ] JP/EN switching preserves the tool flow on the same page.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/microtool-launch-checklist/index.html`
- `tools/microtool-launch-checklist/app.js`
- `tools/microtool-launch-checklist/style.css`
