# Pattern Atlas — canonical tool specification

- **Slug:** `pattern-atlas`
- **Display name (JA):** Pattern Atlas HTML Mock
- **Display name (EN):** Pattern Atlas
- **Implementation:** `tools/pattern-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** pattern, atlas
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `pattern-atlas` implementation at `/tools/pattern-atlas/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a visual dictionary for world pattern references with searchable metadata, live SVG previews, color editing, cultural-context cautions, and client-side asset export.

## 3. Inputs

- Search query and catalog filters.
- Selected pattern.
- Color/palette edits.
- Export format and PNG size.
- Cultural-warning acknowledgement when required.

## 4. Processing behavior

- Load the current pattern dataset from local JavaScript data rather than relying on the hardcoded fallback cards in the HTML shell.
- Search patterns across English/Japanese names, aliases, regions, cultures, categories, motifs, use cases, and summaries.
- Filter by region, category, and use case.
- Open pattern detail/edit state and render live SVG previews through the registered renderer implementation.
- Edit pattern colors and apply palette presets with synchronized previews.
- Export the current rendered pattern as SVG, PNG, or CSS.
- Support PNG size selection and build CSS using an SVG data URI plus the pattern tile dimensions.
- Require an explicit cultural-context acknowledgement before export for patterns marked with an export warning.
- Provide separate English and Japanese public pages.
- Public home/usage copy describes these implemented capabilities as current behavior rather than a future shell plan.

## 5. Outputs

- Filtered visual pattern catalog.
- Pattern detail, context, and live SVG preview.
- Color-edited pattern preview.
- Downloaded SVG, PNG, or CSS asset.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Catalog search, rendering, color editing, PNG conversion, CSS generation, and downloads run in the browser from same-site code/data. The current workflow does not require uploading a user image/design file. Ads and analytics may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The catalog, filters, detail/editor preview, color tools, and export controls are primarily a desktop creative-workspace layout while remaining responsive.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The English root and `/ja/` page are separate language surfaces.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/pattern-atlas/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/pattern-atlas/ja/usage.html`, `tools/pattern-atlas/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Runtime cards are populated from the current pattern dataset and searchable/filterable by the documented metadata.
- [ ] Selecting/editing a pattern updates the live SVG preview and export uses the current edited render.
- [ ] SVG, PNG, and CSS exports are generated client-side and produce the selected current pattern rather than fallback placeholder content.
- [ ] Patterns marked as requiring export caution cannot be exported until the user acknowledges the cultural warning.
- [ ] Public EN/JA home and usage copy describes the implemented search/edit/preview/export workflow as current functionality.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave5.mjs` (regression/contract test), `tools/pattern-atlas/checks/check-pattern-atlas-data.mjs` (data validation). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/pattern-atlas/index.html`
- `tools/pattern-atlas/README.md`
- `tools/pattern-atlas/ja/usage.html`
- `tools/pattern-atlas/js/app.js`
- `tools/pattern-atlas/usage.html`
