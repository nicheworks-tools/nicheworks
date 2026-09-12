# Earth Map Suite — canonical tool specification

- **Slug:** `earth-map-suite`
- **Display name (JA):** Earth Map Suite
- **Display name (EN):** Earth Map Suite
- **Implementation:** `tools/earth-map-suite/`
- **Registry state:** active (registered implementation present)
- **Category:** map, geo, earth, utility
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `earth-map-suite` implementation at `/tools/earth-map-suite/`. It does not authorize a production rewrite.

## 2. Purpose

Organize Earth/map-view conditions and provide Storm, Compare, and Card preview workflows while keeping synthetic visualization separate from the real metadata-reachability checks currently available through the Earth Map Suite precipitation endpoint.

## 3. Inputs

- Mode selection.
- BBox and/or point coordinates depending on mode.
- Date range(s), preset/detail level, frames, focus area, layers, and notes.
- JP/EN selection.

## 4. Processing behavior

- Provide three selectable modes: `storm`, `compare`, and `card`.
- Accept mode-specific inputs including BBox, dates, preset/detail level, frame count, focus/area, layers, notes, and compare/card fields.
- Validate bounded inputs such as BBox span, date range, preset values, and storm frame limits.
- Generate deterministic synthetic storm/compare/card grids and previews in the browser; these visual previews are not observed precipitation.
- Call `/api/earth-map-suite/precipitation` to check real precipitation-metadata reachability/status for the relevant BBox/date/preset inputs.
- Keep the returned metadata status separately labeled from the synthetic preview.
- Produce a shareable text/check memo from the selected inputs and support the implemented copy/download actions.
- Persist selected display language locally as implemented.

## 5. Outputs

- Synthetic Storm/Compare/Card visualization and summaries.
- Real metadata reachability/status from the internal precipitation endpoint.
- Shareable map-view/check memo and implemented copy/download output.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Synthetic preview generation runs in the browser. Metadata-status checks make same-origin requests to `/api/earth-map-suite/precipitation`; that backend may contact upstream Earth-observation sources. Suite-wide analytics/advertising may also load. The current tool must not be described as fully offline when metadata checks are used.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `s3.ap-northeast-1.wasabisys.com`, `data.earth.jaxa.jp`, `example.test`, `earth.jaxa.jp`, `www.eorc.jaxa.jp`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The multi-mode workspace, input/edit panels, metadata status, and visual preview are information-dense and benefit from desktop width, with responsive behavior required for narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same multi-mode workspace.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/earth-map-suite/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/earth-map-suite/usage-en.html`, `tools/earth-map-suite/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Each of Storm, Compare, and Card modes can be selected and produces its implemented synthetic preview from valid inputs.
- [ ] Synthetic preview content is visibly distinguished from real metadata reachability/status.
- [ ] A metadata check uses the same-origin precipitation endpoint and failure/unavailable states are surfaced without relabeling synthetic data as observed data.
- [ ] Invalid/out-of-bound BBox, date, preset, or frame inputs are rejected by the implemented validation path.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/earth-map-suite/index.html`
- `tools/earth-map-suite/README.md`
- `tools/earth-map-suite/app.js`
- `tools/earth-map-suite/style.css`
- `tools/earth-map-suite/usage-en.html`
- `tools/earth-map-suite/usage.html`
