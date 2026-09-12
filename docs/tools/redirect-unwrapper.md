# Redirect Unwrapper — canonical tool specification

- **Slug:** `redirect-unwrapper`
- **Display name (JA):** リダイレクト展開ツール
- **Display name (EN):** Redirect Unwrapper
- **Implementation:** `tools/redirect-unwrapper/`
- **Registry state:** active (registered implementation present)
- **Category:** url, redirect, security, link
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `redirect-unwrapper` implementation at `/tools/redirect-unwrapper/`. It does not authorize a production rewrite.

## 2. Purpose

Inspect redirect/tracking URL strings locally and extract embedded destination URL candidates without opening or following the URL.

## 3. Inputs

- One URL/tracking-link string.
- Optional built-in sample selection.
- JP/EN display language.

## 4. Processing behavior

- Accept a URL string and parse its components in the browser.
- Inspect common redirect/tracking query parameters and decoded/nested URL strings for destination candidates.
- Surface URL details, extracted candidates, and warnings/check points.
- Provide sample redirect/tracking URL strings for testing.
- Copy candidate URLs or a summarized analysis result.
- Never navigate to or fetch the entered URL as part of analysis.
- Do not follow server-side 301/302 redirect chains.
- Switch JP/EN UI.

## 5. Outputs

- Parsed URL detail.
- Extracted destination-candidate list.
- Warnings/check points.
- Clipboard copy of candidates or summary.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

The entered URL string is analyzed locally and is not fetched/opened or sent to a redirect-resolution backend. Advertising and analytics resources may load independently from the page.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `${value}`, `social.example`, `mail.example`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The main flow is one text input followed by result cards and copy actions.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/redirect-unwrapper/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **present**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Analysis does not issue a network request to the entered URL or follow redirect chains.
- [ ] Embedded/encoded destination candidates are surfaced without claiming they are safe or final.
- [ ] Candidate and summary copy actions operate on the locally derived result.
- [ ] Shortener/server-side redirect limitations remain explicit in the UI and specification.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/redirect-unwrapper/index.html`
- `tools/redirect-unwrapper/app.js`
- `tools/redirect-unwrapper/style.css`
- `tools/redirect-unwrapper/usage-en.html`
- `tools/redirect-unwrapper/usage.html`
