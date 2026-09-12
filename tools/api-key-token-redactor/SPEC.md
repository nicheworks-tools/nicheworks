# Tool Specification — API Key Token Redactor

- Slug: `api-key-token-redactor`
- Public URL: `https://nicheworks.app/tools/api-key-token-redactor/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Canonical per-tool specification: `docs/tools/api-key-token-redactor.md`
- Monetization class: `PRO_BUNDLE`

## Purpose

Detect likely secrets in pasted logs, configuration text, `.env`, JSON, curl commands, and similar text, then produce a locally redacted copy that is safer to review or share.

## Current functional contract

- Detect supported API-key, Bearer/Authorization, JWT, private-key, labeled-secret, header, URL-token, Cookie, and related secret patterns.
- Allow detection modes to be enabled or disabled by category.
- Support replacement styles including `[REDACTED]`, `****`, `<redacted>`, and optional length-preserving asterisk masking.
- Produce redacted output plus category/severity counts and findings based on the original input.
- Do not expose raw first/last credential fragments in visible finding previews, copied review material, or downloaded finding/audit artifacts; finding previews may retain only non-secret context plus a redacted marker.
- Provide sample inputs, clear/reset behavior, clipboard copy, and TXT download.
- Switch the same page between Japanese and English UI.
- Current legacy shared Pro exposes custom secret rules, redaction profiles, audit/handoff templates, and findings exports behind the Pro-only section.

## Inputs

- Arbitrary pasted text that may contain secrets.
- Detection-mode checkboxes.
- Replacement style and keep-length option.
- Sample-input selection and UI language selection.
- Current legacy Pro-only custom rule/profile fields when entitled.

## Outputs

Free:
- redacted text;
- finding/category/severity summaries and counts with secret-safe preview markers;
- clipboard copy of redacted text;
- TXT download generated from the redacted result.

Current paid operation boundaries:
1. `customRules` — add/remove custom secret-prefix rules used by Pro-active scanning;
2. `redactionProfiles` — select the Pro-only handoff/redaction profile used by generated artifacts;
3. `auditMarkdown` — copy generated Audit Markdown;
4. `githubIssueTemplate` — copy generated GitHub Issue template;
5. `supportTemplates` — copy Support/Discord sharing templates;
6. `jsonFindingsExport` — download secret-safe findings JSON;
7. `csvFindingsExport` — download secret-safe findings CSV;
8. `handoffMarkdownExport` — download the generated Markdown handoff pack.

No additional paid operation is implied by the current Pro panel.

## State and persistence

Input and findings are ephemeral page state. The tool does not intentionally persist secret-bearing input/history. Current live Pro entitlement remains the legacy shared NicheWorks Pro state until an authorized server-verified migration occurs.

## Monetization and entitlement contract

`MONETIZATION_CLASSIFICATION_87.md` classifies `api-key-token-redactor` as `PRO_BUNDLE`. Future live product authority is the shared `nicheworks.pro` product. Legacy `nicheworks_pro` is compatibility/migration state only.

`tools/api-key-token-redactor/product-scoped-controller.mjs` remains non-live staging over `assets/nw-product-scoped-controller.mjs`. It keeps exactly the eight paid operations listed above and requires explicit product/feature configuration. For live migration, configured product ID must be `nicheworks.pro`; no API-Key-Redactor-specific paid product is authorized.

Until that migration, legacy activation requires exact `status.active === true && status.entitlement === "nicheworks_pro"`. Missing entitlement must fail closed and must not be replaced with the expected entitlement.

Because the current application reads `data-pro-active` when adding custom rules and when deciding whether custom rules participate in scanning, the bridge revalidates exact legacy state in click capture before `#redactBtn`, built-in sample buttons, and Pro controls. Pro-only profile/custom-rule/artifact/export controls are blocked at capture time when exact legacy entitlement is inactive. DOM-only `data-pro-active="true"` edits therefore do not survive the ordinary UI action path.

## Privacy and network behavior

Secret detection and replacement run locally in the browser. The pasted secret-bearing text is not intentionally uploaded by the redaction workflow. Suite-wide advertising and analytics scripts may load separately, so the tool must not claim that the page performs no network requests at all.

The existing secret-preview hardening is part of the product contract and must survive monetization migration:

- visible finding/verification code previews are suppressed to a safe redacted marker rather than exposing first/last credential fragments;
- copied review/support/handoff artifacts pass through preview scrubbing;
- string content written through browser Blob downloads passes through preview scrubbing;
- generated finding/audit artifacts must not reproduce raw credential fragments;
- the staged entitlement wrapper must not read or receive input text, output text, finding previews, raw matched values, custom secret values, generated templates, filenames, or export payloads.

Billing/entitlement requests may contain only fixed product/feature entitlement metadata. They must not contain pasted secret-bearing input, detected credentials, preview fragments, redacted output, findings, audit/support/handoff text, filenames, or downloaded content.

## Language mode

`bilingual single-page`

JP/EN controls switch labels and explanatory copy on the same canonical tool page.

## Layout class

`hybrid`

The workflow supports narrow-screen use but also relies on large text areas, findings, and summary regions that benefit from wider screens.

## Limits and non-goals

- Detection is heuristic and cannot guarantee that every secret or personal identifier is found.
- A redacted result is not automatically safe to publish; users must still review URLs, cookies, headers, emails, IPs, and custom secret formats.
- The tool is not a password manager, secret vault, or external credential-rotation service.
- Free detector/redaction/copy/TXT behavior remains Free.
- Legacy capture hardening is not future payment authority; production access still requires server-verified `nicheworks.pro`.
- Product-scoped staging does not decide bundle price/currency, Stripe Product/Price, production feature IDs, restore policy, historical purchaser migration, or live rollout timing.
- This hardening does not alter detector regexes, redaction behavior, secret-preview scrubbing, or artifact builders.

## Acceptance criteria

- [ ] Supported secret patterns in sample or pasted text can be detected and replaced according to the selected masking mode.
- [ ] Category and severity counts reflect the current findings and clear/reset removes the current working result.
- [ ] Free copy/download uses the redacted output rather than the original secret-bearing input.
- [ ] Visible finding previews and review/export artifacts do not reproduce raw first/last credential fragments from detected secrets.
- [ ] Missing or unrelated legacy entitlement cannot activate paid behavior.
- [ ] A DOM-only `data-pro-active` edit is corrected before ordinary redaction/sample actions and cannot execute manually unhidden Pro controls while inactive.
- [ ] JP/EN switching preserves all detection and replacement controls.
- [ ] Staged wrapper defines exactly eight paid operations and delegates entitlement-state logic to the shared core.
- [ ] Staged wrapper contains no secret-bearing user content or legacy browser/payment authority.
- [ ] Existing clipboard, Blob, and visible-preview hardening remains protected by deterministic checks.
- [ ] Future live authority is shared `nicheworks.pro`.

## Implementation evidence

- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/pro-bridge.js`
- `tools/api-key-token-redactor/product-scoped-controller.mjs`
- `scripts/check-api-key-redactor-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave2.md`
- `docs/billing/pro-product-contracts-wave7.md`
- `tools/api-key-token-redactor/howto/`
