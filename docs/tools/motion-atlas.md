# Motion Atlas — canonical tool specification

- **Slug:** `motion-atlas`
- **Display name (JA):** 動きのアトラス
- **Display name (EN):** Motion Atlas
- **Implementation:** `tools/motion-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** motion, form, analysis, atlas
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `motion-atlas` implementation at `/tools/motion-atlas/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a visual UI-motion reference and decision tool where users can search motion patterns, inspect live demos, compare alternatives, and create implementation-oriented handoff text.

## 3. Inputs

- Search text.
- Catalog filter selections.
- Selected motion/detail item.
- Up to two free compare selections.
- Reduced-motion toggle.
- Favorite/recent interactions and Pro actions.

## 4. Processing behavior

- Provide a searchable motion catalog with live demos and detail panels.
- Filter by category, motion type, trigger, intensity, speed feel, mobile fit, and accessibility load.
- Support reduced-motion mode with safer demo fallback behavior.
- Allow free comparison of up to two motions.
- Keep favorites, recent history, and compare choices in the browser.
- Free usage includes search, demos, details, two-motion compare, basic prompt copy, favorites, recent history, and reduced-motion checks.
- Pro adds motion decision memo, Framer Motion prompt, CSS prompt, Tailwind/React prompt, Codex task, GitHub Issue, reduced-motion checklist, compare handoff, and Markdown/JSON export.
- Provide separate English and Japanese public pages.

## 5. Outputs

- Filtered motion catalog and live motion demonstrations.
- Detail guidance and basic implementation prompt text.
- Two-motion comparison output.
- Browser-local favorites/recent lists.
- Pro implementation handoff artifacts and Markdown/JSON exports.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **Network/API failure:** Implemented response checks, rejection handling, timeout/abort logic, or catch paths expose the unavailable/error state; remote failure is not replaced with fabricated remote data.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/motion-atlas/about/index.html`, `tools/motion-atlas/app.js`, `tools/motion-atlas/index.html`, `tools/motion-atlas/ja/about/index.html`, `tools/motion-atlas/ja/index.html`, `tools/motion-atlas/ja/pro/index.html`, `tools/motion-atlas/ja/usage/index.html`, `tools/motion-atlas/pro/index.html`.

## 7. Privacy/data handling

Catalog search and motion decision logic are client-side; entered search text is not sent to an application search backend. Page analytics/ads and the external Pro purchase flow can communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary interface is a three-column filter/catalog/detail workspace plus compare and Pro handoff panels.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The English canonical root and Japanese `/ja/` page are separate public language surfaces.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/motion-atlas/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/motion-atlas/ja/usage/index.html`, `tools/motion-atlas/usage/index.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-missing`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Search and all documented catalog filters operate without sending user search text to a tool backend.
- [ ] Free compare rejects or prevents a third simultaneous motion selection.
- [ ] Reduced-motion mode changes demo behavior without removing the underlying catalog decision context.
- [ ] Pro handoff copy/export actions remain gated while the free catalog, demos, detail pages, favorites, recent history, and two-motion compare remain usable.
- [ ] A cached active entitlement other than `nicheworks_pro` does not unlock Motion Atlas Pro actions.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/motion-atlas/index.html`
- `tools/motion-atlas/README.md`
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/styles.css`
