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

## Inputs

- Arbitrary pasted text that may contain secrets.
- Detection-mode checkboxes.
- Replacement style and keep-length option.
- Sample-input selection and UI language selection.

## Outputs

- Redacted text.
- Finding/category/severity summaries and counts with secret-safe preview markers.
- Clipboard copy of redacted text.
- TXT download generated from the redacted result.
- When Pro is active, review/export artifacts whose finding previews do not reproduce raw credential fragments.

## State and persistence

Input and findings are ephemeral page state. The specification does not guarantee retention across reloads, and secret input is not intended to be stored as history by the tool.

## Privacy and network behavior

Secret detection and replacement run locally in the browser. The pasted secret-bearing text is not intentionally uploaded by the redaction workflow. Suite-wide advertising and analytics scripts may load separately, so the tool must not claim that the page performs no network requests at all.

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

## Acceptance criteria

- [ ] Supported secret patterns in sample or pasted text can be detected and replaced according to the selected masking mode.
- [ ] Category and severity counts reflect the current findings and clear/reset removes the current working result.
- [ ] Copy/download uses the redacted output rather than the original secret-bearing input.
- [ ] Visible finding previews and review/export artifacts do not reproduce raw first/last credential fragments from detected secrets.
- [ ] JP/EN switching preserves all detection and replacement controls.

## Implementation evidence

- `tools/api-key-token-redactor/index.html`
- `tools/api-key-token-redactor/app.js`
- `tools/api-key-token-redactor/pro-bridge.js`
- `tools/api-key-token-redactor/howto/`
