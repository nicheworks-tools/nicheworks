# Tool Specification — API Key Token Redactor

- Slug: `api-key-token-redactor`
- Public URL: `https://nicheworks.app/tools/api-key-token-redactor/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

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

- Redacted text.
- Finding/category/severity summaries and counts with secret-safe preview markers.
- Clipboard copy of redacted text.
- TXT download generated from the redacted result.
- Current legacy Pro review/export artifacts whose finding previews do not reproduce raw credential fragments.

## State and persistence

Input and findings are ephemeral page state. The specification does not guarantee retention across reloads, and secret input is not intended to be stored as history by the tool. Current live Pro entitlement remains the legacy shared NicheWorks Pro state until an authorized product-scoped migration occurs.

## Paid-operation boundary

Current runtime/UI evidence supports eight product-scoped paid operations:

1. **Custom rules** — add/remove custom secret-prefix rules used by Pro-active scanning.
2. **Redaction profiles** — select the Pro-only profile used by generated audit/handoff material.
3. **Audit Markdown** — copy the generated audit Markdown.
4. **GitHub Issue template** — copy the generated GitHub Issue template.
5. **Support templates** — copy Support or Discord sharing templates.
6. **JSON findings export** — download secret-safe findings JSON.
7. **CSV findings export** — download secret-safe findings CSV.
8. **Markdown handoff export** — download the generated handoff pack.

The core detector, replacement controls, redacted output, safe summaries/findings, redacted-output clipboard copy, and TXT download remain Free.

## Product-scoped migration staging

`tools/api-key-token-redactor/product-scoped-controller.mjs` is a **non-live staging wrapper** over `assets/nw-product-scoped-controller.mjs`. It does not register or activate a real API Key Token Redactor product and does not replace the current public `pro-bridge.js`.

The staged contract requires:

- explicit future `productId` with no default product;
- complete and unique feature-ID mapping for all eight paid operations;
- common server-backed `refreshProState({ productId })` verification through the shared controller core;
- exact product match;
- `active: true`;
- `source: "server"`;
- `reason: "verified_entitlement"`;
- operation-level activation only for feature IDs returned by the verified server response.

Wrong-product, local/browser-only, unverified, incomplete/duplicate mapping, and refresh-failure states fail closed through the shared core.

Historical shared Payment Link / `nicheworks_pro` state is migration evidence only and does not establish future product ID, price, billing model, or production feature namespace.

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
- Product-scoped staging does not authorize a product ID, price, Stripe Price ID, production feature namespace, or live checkout.
- The staging wave does not alter detector regexes, redaction behavior, secret-preview scrubbing, or artifact builders.

## Acceptance criteria

- [ ] Supported secret patterns in sample or pasted text can be detected and replaced according to the selected masking mode.
- [ ] Category and severity counts reflect the current findings and clear/reset removes the current working result.
- [ ] Free copy/download uses the redacted output rather than the original secret-bearing input.
- [ ] Visible finding previews and review/export artifacts do not reproduce raw first/last credential fragments from detected secrets.
- [ ] JP/EN switching preserves all detection and replacement controls.
- [ ] Staged wrapper defines exactly eight paid operations and delegates entitlement-state logic to the shared core.
- [ ] Staged wrapper contains no secret-bearing user content or legacy browser/payment authority.
- [ ] Existing clipboard, Blob, and visible-preview hardening remains protected by deterministic staging checks.
- [ ] Public runtime remains on the current legacy gate until authoritative commercial configuration and an explicit live migration are authorized.

## Implementation evidence

- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/pro-bridge.js`
- `tools/api-key-token-redactor/product-scoped-controller.mjs`
- `scripts/check-api-key-redactor-product-scoped-staging.mjs`
- `docs/billing/pro-product-contracts-wave2.md`
- `tools/api-key-token-redactor/howto/`
