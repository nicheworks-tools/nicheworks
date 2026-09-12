# ATS Paste Doctor — canonical tool specification

- **Slug:** `ats-paste-doctor`
- **Display name (JA):** ATS貼り付け整形チェック
- **Display name (EN):** ATS Paste Doctor
- **Implementation:** `tools/ats-paste-doctor/`
- **Registry state:** active (registered implementation present)
- **Category:** ats, resume, paste, job
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `ats-paste-doctor` implementation at `/tools/ats-paste-doctor/`. It does not authorize a production rewrite.

## 2. Purpose

Clean and inspect resume, cover-letter, and application text before it is pasted into an ATS or job form, while surfacing formatting and character issues that may affect readability.

## 3. Inputs

- Resume, cover-letter, application, or other pasted text.
- Output-mode selection.
- Optional character-limit value.
- UI language selection.
- Shared NicheWorks Pro entitlement state.

## 4. Processing behavior

- Accept pasted application text and report character/count information and warnings.
- Provide three output modes: ATS-friendly plain text, keep-line-breaks, and clean.
- Accept an optional character-limit target and show limit-related status.
- Generate cleaned output plus a compact ATS-style readability preview.
- Free mode supports copy and TXT download up to the implemented free character limit.
- Shared NicheWorks Pro raises the character limit and unlocks PDF/Markdown/JSON outputs, reusable templates, local history, full output packs, and pre-submit material.
- Provide bilingual UI and explicit privacy/ATS-guarantee notices.

## 5. Outputs

- Cleaned text.
- Counts, warnings, and short readability preview.
- Clipboard copy and TXT download in free mode.
- Pro-only export, template, history, and output-pack material when entitlement is active.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/ats-paste-doctor/app.js`, `tools/ats-paste-doctor/howto/en/index.html`, `tools/ats-paste-doctor/howto/index.html`, `tools/ats-paste-doctor/index.html`.

## 7. Privacy/data handling

Text formatting runs in the browser and pasted application content is not intentionally uploaded by the tool workflow. The page may load suite-wide ads, analytics, and shared Pro entitlement resources independently, so users are still advised to redact personal details when appropriate.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The desktop form uses paired panels while the same workflow remains usable on narrow screens through responsive stacking.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN buttons switch the same tool UI and notices.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/ats-paste-doctor/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/ats-paste-doctor/usage-en.html`, `tools/ats-paste-doctor/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Pasted text can be processed in each of the three supported modes and produces output, counts, warnings, and a preview.
- [ ] Copy/TXT export uses the generated output and reset returns the current tool state to its initial working state.
- [ ] Free/Pro limits and Pro-only actions remain gated by the shared entitlement rather than by UI language.
- [ ] JP/EN switching retains the same formatting functionality and safety notices.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/ats-paste-doctor/index.html`
- `tools/ats-paste-doctor/README.md`
- `tools/ats-paste-doctor/app.js`
- `tools/ats-paste-doctor/style.css`
- `tools/ats-paste-doctor/usage-en.html`
- `tools/ats-paste-doctor/usage.html`
