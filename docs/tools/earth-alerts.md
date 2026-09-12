# Earth Alerts — canonical tool specification

- **Slug:** `earth-alerts`
- **Display name (JA):** Earth Alerts
- **Display name (EN):** Earth Alerts
- **Implementation:** `tools/earth-alerts/`
- **Registry state:** active (registered implementation present)
- **Category:** earth, alerts
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `earth-alerts` implementation at `/tools/earth-alerts/`. It does not authorize a production rewrite.

## 2. Purpose

Publish an explicit coming-soon status page for the planned Earth-observation alert-rule tool without implying that notifications or real-data alert evaluation already exist.

## 3. Inputs

Only UI language selection and normal page navigation. There is no current alert-rule input form.

## 4. Processing behavior

- State that Earth Alerts is not currently usable as an alerting tool.
- Describe the planned future scope as previewing thresholds and alert rules for Earth-observation workflows.
- Explicitly state that no notifications are sent, Discord/email integrations are inactive, and real-data alert logic is not implemented.
- Link users to the currently active Earth Map Suite for storm-mode metadata reachability status.
- Provide JP/EN copy on the same page.

## 5. Outputs

- Coming-soon/current-status information.
- Link to Earth Map Suite as the related active tool.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

No alert data is submitted because alert creation/evaluation is not implemented. Suite-wide advertising and analytics resources may load normally.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The current experience is a simple informational status page with stacked sections.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules not found.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same status page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/earth-alerts/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] The page clearly labels Earth Alerts as coming soon/not currently usable.
- [ ] The page does not expose a working notification, Discord, email, or real-data alert workflow.
- [ ] JP/EN modes communicate the same non-active status and link to the related active Earth Map Suite page.

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/earth-alerts/index.html`
