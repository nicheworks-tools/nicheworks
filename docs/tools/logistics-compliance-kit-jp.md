# Logistics Compliance Kit JP — canonical tool specification

- **Slug:** `logistics-compliance-kit-jp`
- **Display name (JA):** 物流コンプライアンス確認キット
- **Display name (EN):** Logistics Compliance Kit JP
- **Implementation:** `tools/logistics-compliance-kit-jp/`
- **Registry state:** active (registered implementation present)
- **Category:** logistics, compliance, japan, business
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `logistics-compliance-kit-jp` implementation at `/tools/logistics-compliance-kit-jp/`. It does not authorize a production rewrite.

## 2. Purpose

Help Japanese shippers organize logistics-efficiency conditions such as waiting time, delivery-window constraints, visibility gaps, outsourcing, and congestion into a practical review level, next actions, and planning draft without presenting the result as a legal/compliance determination.

## 3. Inputs

- Implemented shipper/logistics condition fields rendered by the application.
- Optional current-state memo.
- Current live legacy shared NicheWorks Pro state for the existing paid operations.

## 4. Processing behavior

- Collect the implemented logistics-efficiency conditions and generate a simple review/priority level with supporting signals.
- Generate next-action guidance and a medium/long-term improvement-plan draft.
- Preserve a freeform current-state memo in output without using that memo as an input to the scoring/decision logic.
- Provide free on-screen result, evidence signals, next actions, planning draft, current-state memo, and Markdown preview.
- With the current live legacy NicheWorks Pro gate active, unlock the implemented Markdown save, internal-share memo, contractor/vendor confirmation memo, improvement plan, GitHub Issue draft, Codex task, handoff Markdown, and JSON export.
- Keep official/regulatory/legal interpretation outside the tool and point users to government, legal, logistics, and internal responsible teams.

## 5. Outputs

- Review/priority level and supporting signals.
- Next actions and medium/long-term planning draft.
- Current-state memo in the generated output.
- Free Markdown preview and Pro-only operational/export artifacts.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- [ ] The staged product-scoped controller represents all eight paid operations exactly once and fails closed without authoritative server verification.

## 7. Privacy/data handling

Assessment/draft generation runs in the browser and the entered logistics information is not intentionally uploaded by that workflow. Advertising, analytics, and current shared Pro resources may load separately.

The staged product-scoped controller handles fixed entitlement metadata only. It must not add assessment answers, memo content, generated Markdown, handoff text, filenames, or other user-entered/generated content to billing or entitlement requests.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The experience is document/form oriented and usable on narrow screens, while detailed output and Pro handoff material benefit from wider layouts.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `Japanese-only`.
- The tool is scoped to Japanese logistics/business context and the current public UI is Japanese-only.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/logistics-compliance-kit-jp/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Entered implemented logistics conditions produce the current review level/signals, next actions, and planning draft locally.
- [ ] The current-state memo appears in output but does not alter the scoring/decision result.
- [ ] Free result/Markdown preview remains available without Pro while operational handoff/export artifacts stay gated.
- [ ] The page remains Japanese-only and clearly states that the result is not a legal or administrative determination.
- [ ] The staged product-scoped controller represents all eight paid operations exactly once and fails closed without authoritative server verification.
- [ ] The staged controller remains disconnected from the public runtime until commercial configuration and migration are explicitly authorized.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- Japanese-only is an explicit tool-specific language exception.
- No additional layout exception is established.

### Implementation evidence

- `tools/logistics-compliance-kit-jp/index.html`
- `tools/logistics-compliance-kit-jp/app.js`
- `tools/logistics-compliance-kit-jp/howto.html`
- `tools/logistics-compliance-kit-jp/style.css`
- `tools/logistics-compliance-kit-jp/usage.html`
