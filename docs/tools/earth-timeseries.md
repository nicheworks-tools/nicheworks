# Earth Timeseries — canonical tool specification

- **Slug:** `earth-timeseries`
- **Display name (JA):** Earth Timeseries
- **Display name (EN):** Earth Timeseries
- **Implementation:** `tools/earth-timeseries/`
- **Registry state:** active (registered implementation present)
- **Category:** earth, timeseries
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `earth-timeseries` implementation at `/tools/earth-timeseries/`. It does not authorize a production rewrite.

## 2. Purpose

Publish an explicit coming-soon status page for a future point-based Earth-observation time-series utility without implying that observed time-series values are already available.

## 3. Inputs

Only UI language selection and normal page navigation. There is no current point/date-series input workflow.

## 4. Processing behavior

- State that Earth Timeseries is not currently usable as a time-series data tool.
- Describe the intended future scope as organizing point-based Earth-observation metadata/data over time.
- Explicitly state that the current page does not retrieve observed values or sample raster precipitation.
- Explain that current real-data work is limited to Earth Map Suite storm metadata status.
- Link to Earth Map Suite as the related active page.
- Provide JP/EN copy on the same page.

## 5. Outputs

- Coming-soon/current-status information.
- Link to Earth Map Suite.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty, invalid, unsupported, or over-limit input:** Not applicable because the current implementation has no operational user-input workflow.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Safe fallback:** On a failed/guarded action, the implementation does not create a substitute successful result; retry uses the existing inputs and controls.
- **Runtime evidence inspected:** `tools/earth-timeseries/index.html`.

## 7. Privacy/data handling

No Earth-observation query is submitted by this page because data retrieval/sampling is not implemented. Suite-wide advertising and analytics resources may load normally.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The current experience is a simple stacked informational page.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same status page.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/earth-timeseries/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `not-applicable`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `not-applicable`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] The page clearly labels Earth Timeseries as coming soon/not currently usable.
- [ ] The page does not imply that observed values or raster sampling are available.
- [ ] JP/EN modes communicate the same current limitations and provide the Earth Map Suite link.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/earth-timeseries/index.html`
