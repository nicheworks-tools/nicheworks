# Name Old Kanji Checker — canonical tool specification

- **Slug:** `name-old-kanji-checker`
- **Display name (JA):** 人名旧字体チェッカー | Name Old Kanji Checker
- **Display name (EN):** Name Old Kanji Checker
- **Implementation:** `tools/name-old-kanji-checker/`
- **Registry state:** active (registered implementation present)
- **Category:** name, old, kanji, checker
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `name-old-kanji-checker` implementation at `/tools/name-old-kanji-checker/`. It does not authorize a production rewrite.

## 2. Purpose

Check characters in a name against the Old Kanji Reference data and surface old-form, modern-form, and variant candidates as a reference aid.

## 3. Inputs

- Name text.
- JP/EN display selection.

## 4. Processing behavior

- Accept arbitrary name text and inspect it character by character.
- Load same-site Old Kanji Reference mapping data, metadata files, and compatibility notes.
- Detect an entered old form and show its mapped modern form when present.
- Build a reverse lookup so entered modern forms can show registered old/variant candidates.
- Show available reading, meaning, category, and rendering/compatibility notes from the reference data.
- Provide copy actions for input characters, modern forms, candidates, and candidate lists.
- Link to the full Old Kanji Reference and Kanji Modernizer for follow-up review.
- Degrade to basic mappings when optional metadata files fail to load.
- Show Old Kanji Toolkit Pro as billing-unavailable/locked; batch, reports, exports, saved sets, and audit-note capabilities are not currently purchasable through this page.

## 5. Outputs

- Per-character old→modern or modern→old/variant candidate cards.
- Reading/meaning/category metadata when available.
- Compatibility/rendering cautions.
- Copyable candidate data and related-tool links.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- [ ] Failure of optional metadata files still allows base mapping checks rather than falsely reporting a total application failure.
- [ ] Billing-unavailable Pro controls remain disabled until a real entitlement/purchase path exists.

## 7. Privacy/data handling

Name checking runs in the browser after same-site reference JSON is loaded. Entered names are not sent to an external lookup API. Advertising and analytics resources may load separately.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The workflow is a short name input followed by vertically stacked per-character result cards and warnings.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/name-old-kanji-checker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] Old forms in the reference mapping show their modern mapping and modern forms show registered reverse candidates when available.
- [ ] Failure of optional metadata files still allows base mapping checks rather than falsely reporting a total application failure.
- [ ] Entered name text is not sent to an external character-lookup API.
- [ ] Results retain explicit official-use cautions and do not claim legal/registry authority.
- [ ] Billing-unavailable Pro controls remain disabled until a real entitlement/purchase path exists.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/name-old-kanji-checker/index.html`
- `tools/name-old-kanji-checker/app.js`
- `tools/name-old-kanji-checker/style.css`
