# Construction Tools Atlas — canonical tool specification

- **Slug:** `construction-tools-atlas`
- **Display name (JA):** 建設工具アトラス
- **Display name (EN):** Construction Tools Atlas
- **Implementation:** `tools/construction-tools-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** construction, tools, atlas, dictionary
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `construction-tools-atlas` implementation at `/tools/construction-tools-atlas/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a searchable browser reference for construction tools, site terminology, work names, aliases, and English/Japanese terminology, with detail views and local favorites.

## 3. Inputs

- Search query.
- Action/category/task filters.
- Language/theme controls.
- Favorite actions and optional favorite import data.
- Navigation/detail/tab selections.

## 4. Processing behavior

- Search the local construction-term dataset by tool/term names, aliases, work names, and English/Japanese wording.
- Filter results by implemented action, category, and task dimensions and load additional results when needed.
- Open a term detail sheet with description, term variants, chips, bullets, and tabs for meaning, examples, aliases, and metadata.
- Switch the reference UI between Japanese and English and support light/theme controls.
- Mark terms as favorites, filter to favorites, and export/import favorite state through the browser UI.
- Provide menu, how-to, FAQ, related-tools, and support sheets/sections.

## 5. Outputs

- Filtered/search result list and counts.
- Detailed term reference sheets.
- Browser-local favorite collection plus explicit favorite export/import actions.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **Network/API failure:** Implemented response checks, rejection handling, timeout/abort logic, or catch paths expose the unavailable/error state; remote failure is not replaced with fabricated remote data.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/construction-tools-atlas/app.js`, `tools/construction-tools-atlas/app.runtime.js`, `tools/construction-tools-atlas/howto/en/index.html`, `tools/construction-tools-atlas/howto/index.html`, `tools/construction-tools-atlas/index.html`.

## 7. Privacy/data handling

Search and filtering operate against tool data in the browser; search terms are not intentionally sent to an application search backend. The page may load suite-wide analytics/advertising resources. Support links intentionally navigate to external support services.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The atlas supports desktop reference browsing while detail/filter/menu interactions are implemented as adaptable sheets suitable for narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- A JA/EN control changes the same reference application's displayed language rather than using separate canonical language pages for the main atlas.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/construction-tools-atlas/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Searching for a known indexed term or alias returns matching reference entries without sending the query to an application backend.
- [ ] Opening an entry exposes its detail content and supported detail tabs.
- [ ] Favorite add/remove and favorites-only filtering work locally, and favorite export/import preserves supported favorite state.
- [ ] JA/EN switching keeps search, filtering, detail, and favorites behavior available.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test), `tools/construction-tools-atlas/scripts/audit-duplicates.mjs` (audit script), `tools/construction-tools-atlas/scripts/validate-data.mjs` (data validation). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/construction-tools-atlas/index.html`
- `tools/construction-tools-atlas/app.js`
- `tools/construction-tools-atlas/app.runtime.js`
- `tools/construction-tools-atlas/style.css`
