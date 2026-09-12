# API Key Token Redactor — canonical tool specification

- **Slug:** `api-key-token-redactor`
- **Display name (JA):** APIキー・トークン伏せ字ツール
- **Display name (EN):** API Key Token Redactor
- **Implementation:** `tools/api-key-token-redactor/`
- **Registry state:** active (registered implementation present)
- **Category:** api, token, secret, redact
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `api-key-token-redactor` implementation at `/tools/api-key-token-redactor/`. It does not authorize a production rewrite.

## 2. Purpose

Detect likely secrets in pasted logs, configuration text, `.env`, JSON, curl commands, and similar text, then produce a locally redacted copy that is safer to review or share.

## 3. Inputs

- Arbitrary pasted text that may contain secrets.
- Detection-mode checkboxes.
- Replacement style and keep-length option.
- Sample-input selection and UI language selection.

## 4. Processing behavior

- Detect supported API-key, Bearer/Authorization, JWT, private-key, labeled-secret, header, URL-token, Cookie, and related secret patterns.
- Allow detection modes to be enabled or disabled by category.
- Support replacement styles including `[REDACTED]`, `****`, `<redacted>`, and optional length-preserving asterisk masking.
- Produce redacted output plus category/severity counts and findings based on the original input.
- Do not expose raw first/last credential fragments in visible finding previews, copied review material, or downloaded finding/audit artifacts; finding previews may retain only non-secret context plus a redacted marker.
- Provide sample inputs, clear/reset behavior, clipboard copy, and TXT download.
- Switch the same page between Japanese and English UI.

## 5. Outputs

- Redacted text.
- Finding/category/severity summaries and counts with secret-safe preview markers.
- Clipboard copy of redacted text.
- TXT download generated from the redacted result.
- When Pro is active, review/export artifacts whose finding previews do not reproduce raw credential fragments.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/api-key-token-redactor/app.js`, `tools/api-key-token-redactor/howto/en/index.html`, `tools/api-key-token-redactor/howto/index.html`, `tools/api-key-token-redactor/index.html`, `tools/api-key-token-redactor/src/core.js`.

## 7. Privacy/data handling

Secret detection and replacement run locally in the browser. The pasted secret-bearing text is not intentionally uploaded by the redaction workflow. Suite-wide advertising and analytics scripts may load separately, so the tool must not claim that the page performs no network requests at all.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The workflow supports narrow-screen use but also relies on large text areas, findings, and summary regions that benefit from wider screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch labels and explanatory copy on the same canonical tool page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/api-key-token-redactor/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/api-key-token-redactor/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Supported secret patterns in sample or pasted text can be detected and replaced according to the selected masking mode.
- [ ] Category and severity counts reflect the current findings and clear/reset removes the current working result.
- [ ] Copy/download uses the redacted output rather than the original secret-bearing input.
- [ ] Visible finding previews and review/export artifacts do not reproduce raw first/last credential fragments from detected secrets.
- [ ] JP/EN switching preserves all detection and replacement controls.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test), `tools/api-key-token-redactor/tests/generate_testdata.js` (generator). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/style.css`
- `tools/api-key-token-redactor/tests/README.md`
- `tools/api-key-token-redactor/usage.html`
