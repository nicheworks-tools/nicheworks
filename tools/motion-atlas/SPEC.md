# Tool Specification — Motion Atlas

- Slug: `motion-atlas`
- Public URL: `https://nicheworks.app/tools/motion-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a visual UI-motion reference and decision tool where users can search motion patterns, inspect live demos, compare alternatives, and create implementation-oriented handoff text.

## Current functional contract

- Provide a searchable motion catalog with live demos and detail panels.
- Filter by category, motion type, trigger, intensity, speed feel, mobile fit, and accessibility load.
- Support reduced-motion mode with safer demo fallback behavior.
- Allow free comparison of up to two motions.
- Keep favorites, recent history, and compare choices in the browser.
- Free usage includes search, demos, details, two-motion compare, basic prompt copy, favorites, recent history, and reduced-motion checks.
- Pro adds motion decision memo, Framer Motion prompt, CSS prompt, Tailwind/React prompt, Codex task, GitHub Issue, reduced-motion checklist, compare handoff, and Markdown/JSON export.
- Provide separate English and Japanese public pages.

## Inputs

- Search text.
- Catalog filter selections.
- Selected motion/detail item.
- Up to two free compare selections.
- Reduced-motion toggle.
- Favorite/recent interactions and Pro actions.

## Outputs

- Filtered motion catalog and live motion demonstrations.
- Detail guidance and basic implementation prompt text.
- Two-motion comparison output.
- Browser-local favorites/recent lists.
- Pro implementation handoff artifacts and Markdown/JSON exports.

## State and persistence

Favorites, recent motion history, and compare choices are stored in browser-local state. Shared NicheWorks Pro entitlement is also browser-bound. Search text is transient and is not stored as a server-side search history by the tool.

## Privacy and network behavior

Catalog search and motion decision logic are client-side; entered search text is not sent to an application search backend. Page analytics/ads and the external Pro purchase flow can communicate independently.

## Language mode

`separate JA/EN pages`

The English canonical root and Japanese `/ja/` page are separate public language surfaces.

## Layout class

`pc-oriented`

The primary interface is a three-column filter/catalog/detail workspace plus compare and Pro handoff panels.

## Limits and non-goals

- Motion Atlas is a decision aid, not an accessibility diagnosis or implementation guarantee.
- Live demos illustrate patterns and do not guarantee equivalent behavior in every framework/browser.
- Reduced-motion guidance does not replace product-specific accessibility review.
- Free compare is limited to two motions.
- Pro outputs are implementation drafts and require project-specific review.
- Until product-scoped billing migration is explicitly completed for this tool, its legacy paid gate accepts only the shared `nicheworks_pro` entitlement; an active entitlement for another product must not unlock Motion Atlas.

## Acceptance criteria

- [ ] Search and all documented catalog filters operate without sending user search text to a tool backend.
- [ ] Free compare rejects or prevents a third simultaneous motion selection.
- [ ] Reduced-motion mode changes demo behavior without removing the underlying catalog decision context.
- [ ] Pro handoff copy/export actions remain gated while the free catalog, demos, detail pages, favorites, recent history, and two-motion compare remain usable.
- [ ] A cached active entitlement other than `nicheworks_pro` does not unlock Motion Atlas Pro actions.

## Implementation evidence

- `tools/motion-atlas/index.html`
- `tools/motion-atlas/ja/index.html`
- `tools/motion-atlas/app.js`
- `tools/motion-atlas/pro-bridge.js`
- `tools/motion-atlas/styles.css`
