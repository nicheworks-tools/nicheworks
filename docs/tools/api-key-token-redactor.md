# API Key Token Redactor — canonical tool specification

- **Slug:** `api-key-token-redactor`
- **Display name (JA):** APIキー・トークン伏せ字ツール
- **Display name (EN):** API Key Token Redactor
- **Implementation:** `tools/api-key-token-redactor/`
- **Registry state:** active (registered implementation present)
- **Category:** api, token, secret, redact
- **Common specification:** `common-spec/spec-ja.md`
- **Monetization class:** `PRO_BUNDLE`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `api-key-token-redactor` implementation at `/tools/api-key-token-redactor/`. It does not authorize live billing launch or a production rewrite.

## 2. Purpose

Detect likely secrets in pasted logs, configuration text, `.env`, JSON, curl commands, and similar text, then produce a locally redacted copy that is safer to review or share.

## 3. Inputs

- Arbitrary pasted text that may contain secrets.
- Detection-mode checkboxes.
- Replacement style and keep-length option.
- Sample-input selection and UI language selection.
- Current legacy Pro-only custom rule/profile fields when entitled.

## 4. Processing behavior

- Detect supported API-key, Bearer/Authorization, JWT, private-key, labeled-secret, header, URL-token, Cookie, and related secret patterns.
- Allow detection modes to be enabled or disabled by category.
- Support replacement styles including `[REDACTED]`, `****`, `<redacted>`, and optional length-preserving asterisk masking.
- Produce redacted output plus category/severity counts and findings based on the original input.
- Do not expose raw first/last credential fragments in visible finding previews, copied review material, or downloaded finding/audit artifacts; finding previews may retain only non-secret context plus a redacted marker.
- Provide sample inputs, clear/reset behavior, clipboard copy, and TXT download.
- Switch the same page between Japanese and English UI.
- Current legacy shared Pro adds custom rules, redaction profiles, audit/handoff templates, and findings exports.

## 5. Outputs

Free:
- redacted text;
- finding/category/severity summaries and counts with secret-safe preview markers;
- clipboard copy of redacted text;
- TXT download generated from the redacted result.

Runtime-backed paid value boundaries:
1. `customRules` — add/remove custom secret-prefix rules used by Pro-active scanning;
2. `redactionProfiles` — select the Pro-only handoff/redaction profile used by generated artifacts;
3. `auditMarkdown` — copy generated Audit Markdown;
4. `githubIssueTemplate` — copy generated GitHub Issue template;
5. `supportTemplates` — copy Support/Discord sharing templates;
6. `jsonFindingsExport` — download secret-safe findings JSON;
7. `csvFindingsExport` — download secret-safe findings CSV;
8. `handoffMarkdownExport` — download the generated Markdown handoff pack.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.

## 7. Privacy/data handling

Secret detection and replacement run locally in the browser. The pasted secret-bearing text is not intentionally uploaded by the redaction workflow. Suite-wide advertising and analytics scripts may load separately, so the tool must not claim that the page performs no network requests at all.

Persistence evidence: no secret-bearing application history is part of the current contract. Network-capable core processing code is not required; historical purchase links and suite scripts are separate from the redaction engine.

The secret-safety contract includes:

- visible finding/verification code previews use the fixed safe redacted marker;
- clipboard text for generated review artifacts is scrubbed against unsafe preview strings;
- string parts used to construct downloadable Blob artifacts are scrubbed before Blob creation;
- generated findings/review artifacts must not intentionally reproduce detected raw secret values.

Billing/entitlement requests may contain only fixed product/feature entitlement metadata. They must not contain pasted secret-bearing input, detected credentials, preview fragments, redacted output, findings, custom-rule values, generated audit/support/handoff text, filenames, or downloaded content.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The workflow supports narrow-screen use but also relies on large text areas, findings, and summary regions that benefit from wider screens.
- Preserve the functional width class and common-spec adaptation rules.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch labels and explanatory copy on the same canonical tool page.
- Existing bilingual coverage must remain equivalent for core functionality and safety copy.

## 10. SEO contract

The main public page must retain a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/api-key-token-redactor/`, and valid `WebApplication` JSON-LD according to common-spec.

## 11. Advertising contract

Preserve existing GA4 and AdSense identifiers/code. Advertising must follow common-spec placement rules and must not be inserted into the input/action flow.

## 12. Donation/support contract

Preserve the existing support block and common-spec behavior unless a separate specification change explicitly authorizes restructuring.

## 13. Help/usage/FAQ contract

- Main-page concise explanation: required-and-present.
- Usage documentation: present.
- FAQ: present/optional under the current implementation.
- Existing usage/help links remain subordinate to the core redaction workflow.

## 14. Functional acceptance tests

- [ ] Supported secret patterns in sample or pasted text can be detected and replaced according to the selected masking mode.
- [ ] Category and severity counts reflect the current findings and clear/reset removes the current working result.
- [ ] Free copy/download uses the redacted output rather than the original secret-bearing input.
- [ ] Visible finding previews and review/export artifacts do not reproduce raw first/last credential fragments from detected secrets.
- [ ] Missing/unrelated legacy entitlement cannot unlock paid behavior.
- [ ] DOM-only `data-pro-active` edits are revalidated before ordinary Redact/sample actions and manually unhidden Pro controls do not execute while inactive.
- [ ] JP/EN switching preserves all detection and replacement controls.
- [ ] Staged wrapper defines exactly eight paid operations and fails closed without matching server-verified product/features.
- [ ] Billing/entitlement traffic contains no secret-bearing or generated user content.
- [ ] Future live authority is shared `nicheworks.pro`.

Automated evidence includes `scripts/check-tool-runtime-contracts.mjs`, `scripts/check-api-key-redactor-product-scoped-staging.mjs`, and the tool test-data generator.

## 15. Explicit tool-specific exceptions

- No language exception beyond bilingual single-page mode.
- No additional layout exception.
- Secret-preview hardening is part of the product contract and must not be weakened by monetization migration.

### Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `api-key-token-redactor` as `PRO_BUNDLE`. Future live paid product authority is shared `nicheworks.pro`; legacy `nicheworks_pro` remains compatibility/migration state only.

The eight exact current paid operation boundaries are listed in section 5. Free detection/redaction, safe findings/summaries, redacted-output copy and TXT download remain independent of billing availability.

The current legacy bridge may activate paid behavior only when `status.active === true` and `status.entitlement === "nicheworks_pro"`. Missing entitlement must fail closed rather than being replaced with the expected entitlement.

Because the current app reads `data-pro-active` for custom-rule creation and Pro-active scanning, the bridge revalidates exact legacy state in capture phase before ordinary Redact/sample actions. Pro-only profile/custom-rule/review/export controls are also revalidated and blocked at capture time while inactive. Manually editing `data-pro-active` or unhiding the Pro section therefore does not unlock the ordinary UI path.

`tools/api-key-token-redactor/product-scoped-controller.mjs` remains non-live staging. It exposes exactly the eight paid operations and delegates server verification to `assets/nw-product-scoped-controller.mjs`. For live migration, configured product ID must be `nicheworks.pro`; no API-Key-Redactor-specific paid product is authorized.

Bundle price/currency, Stripe Product/Price, production feature IDs, restore/account policy, purchaser migration and rollout timing remain unresolved.

### Implementation evidence

- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/pro-bridge.js`
- `tools/api-key-token-redactor/product-scoped-controller.mjs`
- `scripts/check-api-key-redactor-product-scoped-staging.mjs`
- `tools/api-key-token-redactor/tests/README.md`
- `tools/api-key-token-redactor/usage.html`
- `docs/billing/pro-product-contracts-wave2.md`
- `docs/billing/pro-product-contracts-wave7.md`
