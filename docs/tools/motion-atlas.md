# Motion Atlas — canonical tool specification

- **Slug:** `motion-atlas`
- **Display name (JA):** 動きのアトラス
- **Display name (EN):** Motion Atlas
- **Implementation:** `tools/motion-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** motion, form, analysis, atlas
- **Monetization:** `ADS_DONATION`
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
- Up to four compare selections.
- Reduced-motion toggle.
- Favorite/recent interactions and implementation-output actions.

## 4. Processing behavior

- Provide a searchable motion catalog with live demos and detail panels.
- Filter by category, motion type, trigger, intensity, speed feel, mobile fit, and accessibility load.
- Support reduced-motion mode with safer demo fallback behavior.
- Allow comparison of up to four motions without payment or entitlement.
- Keep favorites, recent history, and compare choices in the browser.
- All implemented handoff features are free: motion decision memo, Framer Motion prompt, CSS prompt, Tailwind/React prompt, Codex task, GitHub Issue, reduced-motion checklist, compare handoff, and Markdown/JSON export.
- Provide separate English and Japanese public pages.
- Monetization is advertising plus optional donations. Donations never unlock features.
- Historical `/pro/` routes remain only as noindex compatibility notices directing users back to the free main tool.

## 5. Outputs

- Filtered motion catalog and live motion demonstrations.
- Detail guidance and basic implementation prompt text.
- Up to four-motion comparison output.
- Browser-local favorites/recent lists.
- Implementation handoff artifacts and Markdown/JSON exports.

Observed delivery capabilities: clipboard copy **present**; Markdown/JSON download/export **present** through the implementation handoff actions.

## 6. Error behavior

- **Empty or incomplete input:** Implemented guard clauses prevent the affected action from completing normally.
- **Unsupported or over-limit input:** The four-item comparison cap and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as successful output.
- **Network/API failure:** Core catalog/search/decision behavior does not depend on an application search backend. Analytics/ad/donation failures do not fabricate tool results.
- **Copy/download failure:** Clipboard rejection and download failures remain bounded to the affected output action.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/motion-atlas/app.js`, `tools/motion-atlas/index.html`, `tools/motion-atlas/ja/index.html`, `tools/motion-atlas/pro/index.html`, `tools/motion-atlas/ja/pro/index.html`, `tools/motion-atlas/pro-bridge.js`.

## 7. Privacy/data handling

Catalog search and motion decision logic are client-side; entered search text is not sent to an application search backend. Favorites, recent history, and compare state use browser-local storage. Page analytics/ads and optional OFUSE/Ko-fi support links can communicate independently. Motion Atlas has no Stripe purchase flow and no paid-entitlement authority.

Persistence evidence: `localStorage`. Network-capable public integrations are limited to site analytics/ads and optional support links; a payment URL is not part of the Motion Atlas contract.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- The primary interface is a three-column filter/catalog/detail workspace plus compare and implementation-handoff panels.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- The English canonical root and Japanese `/ja/` page are separate public language surfaces.
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/motion-atlas/`, and valid `WebApplication` JSON-LD. SEO prose must remain evidence-based rather than being padded arbitrarily. Historical `/pro/` compatibility pages stay `noindex,follow`.

## 11. Advertising contract

Preserve existing GA4 and AdSense identifiers/code on the public tool where applicable. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Advertising does not unlock features.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. OFUSE/Ko-fi support is optional and does not change feature availability. Preserve and update the support block in place rather than turning it into an entitlement surface.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/motion-atlas/ja/usage/index.html`, `tools/motion-atlas/usage/index.html`.
- **FAQ:** `recommended-and-missing`; this remains an improvement opportunity rather than a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Search and all documented catalog filters operate without sending user search text to a tool backend.
- [ ] Compare accepts up to four simultaneous motion selections and prevents a fifth.
- [ ] Reduced-motion mode changes demo behavior without removing the underlying catalog decision context.
- [ ] Decision memo, framework prompts, Codex/GitHub handoff, reduced-motion checklist, compare handoff, Markdown export, and JSON export work without a paid entitlement.
- [ ] Main EN/JA pages and historical `/pro/` pages contain no Stripe purchase URL, fixed paid price, or purchase-to-unlock claim.
- [ ] Ads and donations remain non-gating support mechanisms.

Automated contract coverage is provided by the repository runtime and monetization checks. Behavior-level interaction coverage should continue to be expanded independently; source-contract checks are not silently counted as full browser behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.
- The historical `pro-bridge.js` filename is retained only as a compatibility loader name; its active contract is free-mode initialization for this ADS_DONATION tool, not paid entitlement handling.

### Implementation evidence

- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`
- `tools/motion-atlas/pro/index.html`
- `tools/motion-atlas/ja/pro/index.html`
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/pro-bridge.js`
- `tools/motion-atlas/styles.css`
