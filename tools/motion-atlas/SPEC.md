# Tool Specification — Motion Atlas

- Slug: `motion-atlas`
- Public URL: `https://nicheworks.app/tools/motion-atlas/`
- Specification status: `complete`
- Monetization class: `ADS_DONATION`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a visual UI-motion reference and decision tool where users can search motion patterns, inspect live demos, compare alternatives, and create implementation-oriented handoff text.

## Current functional contract

- Provide a searchable motion catalog with live demos and detail panels.
- Filter by category, motion type, trigger, intensity, speed feel, mobile fit, and accessibility load.
- Support reduced-motion mode with safer demo fallback behavior.
- Allow comparison of up to four motions without payment or entitlement.
- Keep favorites, recent history, and compare choices in the browser.
- All implemented output tools are free: motion decision memo, Framer Motion prompt, CSS prompt, Tailwind/React prompt, Codex task, GitHub Issue, reduced-motion checklist, compare handoff, and Markdown/JSON export.
- Provide separate English and Japanese public pages.
- Monetization is ads plus optional donations. Donations do not unlock features.
- The historical `/pro/` pages are compatibility notices only and must not contain a purchase path.

## Inputs

- Search text.
- Catalog filter selections.
- Selected motion/detail item.
- Up to four compare selections.
- Reduced-motion toggle.
- Favorite/recent interactions and implementation-output actions.

## Outputs

- Filtered motion catalog and live motion demonstrations.
- Detail guidance and basic implementation prompt text.
- Up to four-motion comparison output.
- Browser-local favorites/recent lists.
- Implementation handoff artifacts and Markdown/JSON exports.

## State and persistence

Favorites, recent motion history, and compare choices are stored in browser-local state. Search text is transient and is not stored as a server-side search history by the tool. No paid entitlement is required by Motion Atlas.

## Privacy and network behavior

Catalog search and motion decision logic are client-side; entered search text is not sent to an application search backend. Page analytics, ads, and optional external donation links can communicate independently. Motion Atlas must not send users to a Stripe purchase flow.

## Language mode

`separate JA/EN pages`

The English canonical root and Japanese `/ja/` page are separate public language surfaces.

## Layout class

`pc-oriented`

The primary interface is a three-column filter/catalog/detail workspace plus compare and implementation-handoff panels.

## Limits and non-goals

- Motion Atlas is a decision aid, not an accessibility diagnosis or implementation guarantee.
- Live demos illustrate patterns and do not guarantee equivalent behavior in every framework/browser.
- Reduced-motion guidance does not replace product-specific accessibility review.
- Compare is capped at four motions.
- Generated implementation outputs are drafts and require project-specific review.
- Historical Pro infrastructure must not become an authorization gate or purchase surface for this `ADS_DONATION` tool.

## Acceptance criteria

- [ ] Search and all documented catalog filters operate without sending user search text to a tool backend.
- [ ] Compare permits up to four simultaneous motion selections and prevents a fifth.
- [ ] Reduced-motion mode changes demo behavior without removing the underlying catalog decision context.
- [ ] Decision memo, framework prompts, Codex/GitHub handoff, reduced-motion checklist, compare handoff, Markdown export, and JSON export work without a paid entitlement.
- [ ] Main and historical `/pro/` pages contain no Stripe purchase URL, fixed paid price, or purchase-to-unlock claim.
- [ ] Ads and optional donation links do not gate or unlock product features.

## Implementation evidence

- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/pro-bridge.js`
- `tools/motion-atlas/styles.css`
- `tools/motion-atlas/pro/index.html`
- `tools/motion-atlas/ja/pro/index.html`
