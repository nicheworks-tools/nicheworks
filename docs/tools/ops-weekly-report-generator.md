# Ops Weekly Report Generator — canonical tool specification

- **Slug:** `ops-weekly-report-generator`
- **Display name (JA):** 週次運用レポート生成
- **Display name (EN):** Ops Weekly Report Generator
- **Implementation:** `tools/ops-weekly-report-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** ops, report, weekly, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `ops-weekly-report-generator` implementation at `/tools/ops-weekly-report-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Create a bilingual weekly operations-report draft from manually entered KPIs, changes, results, risks, open items, decisions, and next actions.

## 3. Inputs

- Required report period.
- Optional team/owner.
- KPI and operational narrative fields.
- JP/EN display selection.

## 4. Processing behavior

- Require a report period and at least one substantive report field before generation.
- Accept team/owner, KPI, changes, results/impact, wins, issues/risks, open items, next actions, next-week focus, and decisions needed.
- Generate Japanese and English weekly-report drafts from the same entered facts.
- Omit blank sections rather than fabricating missing content.
- Allow JP and EN report copy actions.
- Allow JP TXT, EN TXT, and Markdown downloads.
- Switch surrounding UI between JP and EN.
- Generate locally in the browser; no AI/report-generation API is used.

## 5. Outputs

- Japanese weekly operations report draft.
- English weekly operations report draft.
- Clipboard copies.
- JP TXT, EN TXT, and Markdown files.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

Report generation is browser-local. Entered KPIs, revenue notes, customer references, or internal initiatives are not sent to a generation backend. Advertising and analytics resources may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The workflow is a vertically stacked report form followed by text outputs and export actions.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- The page exposes JP/EN UI while generating both-language report drafts from the entered source facts.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/ops-weekly-report-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Generation is blocked or warned when the report period is missing or no substantive report field is supplied.
- [ ] Blank optional sections are omitted instead of being populated with invented facts.
- [ ] Both JP and EN report drafts can be copied or downloaded from the same entered source data.
- [ ] Entered operational data is not sent to an AI/report-generation backend.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/ops-weekly-report-generator/index.html`
- `tools/ops-weekly-report-generator/app.js`
- `tools/ops-weekly-report-generator/style.css`
