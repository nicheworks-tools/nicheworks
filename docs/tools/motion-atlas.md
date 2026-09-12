# Motion Atlas — canonical tool specification

- **Slug:** `motion-atlas`
- **Display name (JA):** 動きのアトラス
- **Display name (EN):** Motion Atlas
- **Implementation:** `tools/motion-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** motion, form, analysis, atlas
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

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

- [ ] Free compare rejects or prevents a third simultaneous motion selection.

## 7. Privacy/data handling

Catalog search and motion decision logic are client-side; entered search text is not sent to an application search backend. Page analytics/ads and the external Pro purchase flow can communicate independently.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `buy.stripe.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary interface is a three-column filter/catalog/detail workspace plus compare and Pro handoff panels.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

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

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] Search and all documented catalog filters operate without sending user search text to a tool backend.
- [ ] Free compare rejects or prevents a third simultaneous motion selection.
- [ ] Reduced-motion mode changes demo behavior without removing the underlying catalog decision context.
- [ ] Pro handoff copy/export actions remain gated while the free catalog, demos, detail pages, favorites, recent history, and two-motion compare remain usable.
- [ ] A cached active entitlement other than `nicheworks_pro` does not unlock Motion Atlas Pro actions.

Automated test evidence: `tools/motion-atlas/MOTION_ATLAS_SPEC.md`, `tools/motion-atlas/docs/motion-atlas-spec.md`, `tools/motion-atlas/mock/test`.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/motion-atlas/index.html`
- `tools/motion-atlas/README.md`
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/styles.css`
