# Light Check — canonical tool specification

- **Slug:** `light-check`
- **Display name (JA):** 照明・光環境チェック
- **Display name (EN):** Light Check
- **Implementation:** `tools/light-check/`
- **Registry state:** active (registered implementation present)
- **Category:** light, room, check, environment
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `light-check` implementation at `/tools/light-check/`. It does not authorize a production rewrite.

## 2. Purpose

Use live camera frames to compare relative brightness, color cast, contrast/shadow characteristics, and brightness variation before shooting or streaming, without presenting the browser camera as a calibrated light meter.

## 3. Inputs

- Live camera permission/video frames.
- Start, Stop, camera-flip, Lite-mode, and result/how-to controls.
- JP/EN UI selection.

## 4. Processing behavior

- Request browser camera access only after the user starts the tool and provide an explicit Stop action that releases camera use.
- Analyze camera frames locally and present compact B/C/S/F relative metrics plus explanatory result/how-to sheets.
- Treat B as brightness-related comparison, C as color-cast-related comparison, S as contrast/shadow-related comparison, and F as a simple brightness-variation indicator.
- Provide camera flip where supported and a Lite mode for reduced processing/load as implemented.
- Show camera-permission/startup error guidance for common mobile/browser cases.
- Provide JP/EN UI and explicit warnings that the metrics are relative camera-derived indicators.

## 5. Outputs

- Relative B/C/S/F metrics and supporting status/details.
- Camera/startup error guidance and comparison-oriented interpretation.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/light-check/app.js`, `tools/light-check/index.html`.

## 7. Privacy/data handling

Frame analysis runs in the browser and the tool does not intentionally upload camera video. Advertising and analytics resources may load separately. Users are warned not to place faces, confidential material, or personal information in view unnecessarily.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The camera preview, compact metrics, bottom controls, and sheets are explicitly designed for phone use while still working on desktop cameras.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same camera-analysis workflow and limitations.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/light-check/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/light-check/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Camera analysis starts only after permission/user action and Stop ends active camera use.
- [ ] Active video analysis produces the implemented relative B/C/S/F indicators without claiming lux or calibrated flicker values.
- [ ] Camera errors are surfaced with recoverable guidance rather than silently failing.
- [ ] JP/EN and Lite/camera controls preserve the relative-measurement disclaimer and local-analysis behavior.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/light-check/index.html`
- `tools/light-check/README.md`
- `tools/light-check/app.js`
- `tools/light-check/style.css`
- `tools/light-check/usage.html`
