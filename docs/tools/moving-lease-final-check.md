# Moving Lease Final Check — canonical tool specification

- **Slug:** `moving-lease-final-check`
- **Display name (JA):** 退去・賃貸最終チェック
- **Display name (EN):** Moving Lease Final Check
- **Implementation:** `tools/moving-lease-final-check/`
- **Registry state:** active (registered implementation present)
- **Category:** moving, lease, rental, check
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `moving-lease-final-check` implementation at `/tools/moving-lease-final-check/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a final pre-move/pre-vacate checklist for common cancellation, address-change, inspection, photo, meter, and key-return tasks.

## 3. Inputs

- Required move/exit date.
- Home type: rental or owned.
- Checklist completion toggles.
- Pro actions when entitlement is active.

## 4. Processing behavior

- Require an exit/move date and accept home type (`rental` or `owned`).
- Generate a final checklist and completion progress for the selected conditions.
- Persist exit date, home type, and checkbox state in the current browser.
- Allow clearing completion state, resetting inputs, deleting the current condition's saved state, and deleting the previously used condition's saved state.
- Allow checklist TXT copy, TXT download, and browser print/PDF.
- Include a non-persistent inspection memo template for inspection date, management contact, keys, meter photos, observed damage/equipment, and agreements.
- Show an Old/NicheWorks shared Pro preview for an expanded Moving / Lease Final Pack; Pro-specific copy/save/print actions are unavailable until the shared entitlement is active.

## 5. Outputs

- Final checklist and progress indicator.
- TXT copy/download.
- Browser print/PDF output.
- Inspection memo template.
- Pro expanded handoff/share pack when unlocked.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Checklist generation and state management are browser-side. Ads/analytics and the external Pro purchase flow may communicate independently. The tool does not send checklist data to a lease-management service.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The primary experience is a short form followed by a checklist, progress bar, outputs, and a vertically stacked Pro preview.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `Japanese-only`.
- The current public tool surface and structured language declaration are Japanese-only.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/moving-lease-final-check/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] A required move/exit date and home type produce the corresponding final checklist.
- [ ] Completion state persists in the browser for the saved condition and can be deleted explicitly.
- [ ] Free TXT copy/download and browser print remain usable independently of Pro.
- [ ] The UI does not present checklist completion as a guarantee about restoration costs, deposits, or legal obligations.
- [ ] A cached active entitlement other than `nicheworks_pro` does not unlock the Pro pack or Pro copy/save/print actions.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- Japanese-only is an explicit tool-specific language exception.
- No additional layout exception is established.

### Implementation evidence

- `tools/moving-lease-final-check/index.html`
- `tools/moving-lease-final-check/app.js`
- `tools/moving-lease-final-check/style.css`
