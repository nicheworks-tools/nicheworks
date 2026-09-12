# Notion Form Design Kit — canonical tool specification

- **Slug:** `notion-form-design-kit`
- **Display name (JA):** Notionフォーム設計キット
- **Display name (EN):** Notion Form Design Kit
- **Implementation:** `tools/notion-form-design-kit/`
- **Registry state:** active (registered implementation present)
- **Category:** notion, form, design, workflow
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `notion-form-design-kit` implementation at `/tools/notion-form-design-kit/`. It does not authorize a production rewrite.

## 2. Purpose

Draft a Notion-oriented intake database design, workflow, and notification-message set without connecting to or modifying a Notion workspace.

## 3. Inputs

- Use-case text.
- Preset selection.
- Field-selection checkboxes.
- JP/EN display language.

## 4. Processing behavior

- Accept a free-text use case.
- Provide use-case presets: simple, detailed, inquiry, application, recruiting, bug report, and creative request.
- Let users include or exclude common fields such as name, email, company, request, priority, deadline, and attachment.
- Generate three artifacts: property design, status pipeline, and message templates.
- Allow all generated content to be copied and saved as Markdown or TXT.
- Switch JP/EN UI on the same page.
- Generate locally; there is no Notion API authentication or workspace mutation.

## 5. Outputs

- Notion property design draft.
- Status/workflow pipeline draft.
- Notification/message templates.
- Combined clipboard, Markdown, and TXT outputs.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/notion-form-design-kit/app.js`, `tools/notion-form-design-kit/index.html`.

## 7. Privacy/data handling

Design generation runs in the browser. The tool does not send the design to Notion and does not call the Notion API. Ads/analytics may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The workflow is a compact use-case/preset form followed by three vertically stacked text outputs.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The implemented `bilingual single-page` mode above is the canonical language behavior; repository HTML/JavaScript establishes the switching or page-separation mechanism.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/notion-form-design-kit/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Every documented preset can generate property, pipeline, and message-template output without Notion credentials.
- [ ] Field checkboxes materially change the generated design rather than being decorative controls.
- [ ] Copy, Markdown save, and TXT save operate on locally generated content.
- [ ] The UI and specification do not imply that a Notion database/workspace is modified automatically.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/notion-form-design-kit/index.html`
- `tools/notion-form-design-kit/app.js`
- `tools/notion-form-design-kit/style.css`
