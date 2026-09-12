# Tool Specification — AI Interaction Atlas

- Slug: `ai-interaction-atlas`
- Public URL: `https://nicheworks.app/tools/ai-interaction-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable reference atlas of AI interaction patterns so builders can compare UI patterns, inspect risks and failure states, and turn a selected pattern into implementation-oriented handoff material.

## Current functional contract

- Load the local pattern dataset and support text search plus category, purpose, risk, user-control, and AI-visibility filters.
- Open a pattern detail view with purpose, best-fit contexts, non-fit contexts, failure states, trust notes, implementation notes, required states, common mistakes, and a copyable implementation prompt.
- Maintain recent items and favorites in browser storage; free favorites are capped at five.
- Compare two patterns for free; active NicheWorks Pro raises comparison to three or four patterns.
- Generate Pro handoff outputs for the selected pattern, including product-spec, Codex-task, GitHub-Issue, UX-risk, safety/fallback, Markdown, and JSON-oriented outputs.
- Provide separate English and Japanese page families over the same atlas behavior.

## Inputs

- Search text.
- Filter selections for category, purpose, risk, control, and visibility.
- Pattern selection, favorite actions, comparison selection, and diff-only toggle.
- Shared NicheWorks Pro entitlement state in the current browser.

## Outputs

- Filtered pattern cards and result count.
- Pattern detail panels, comparison summaries, recent/favorite lists, copied prompts and comparison text.
- Pro-only copied/downloaded handoff material when Pro is active.

## State and persistence

Favorites, recent items, and comparison selections use `localStorage` keys `nw_aiia_favorites`, `nw_aiia_recent`, and `nw_aiia_compare`. Current filters and the open detail are in-memory UI state. Downloaded exports are user-controlled files.

## Privacy and network behavior

Pattern search, filtering, comparison, storage, and export generation run in the browser. The tool loads repository-hosted atlas data and the shared NicheWorks Pro client; suite-wide advertising and analytics scripts may also load. User search/filter text is not sent to an AI API by the atlas implementation.

## Language mode

`separate JA/EN pages`

The canonical root is English and `/ja/` provides the Japanese experience. Shared JavaScript selects copy based on the document language.

## Layout class

`pc-oriented`

The primary interaction is a multi-pane searchable reference workspace with filter, list, detail, and comparison regions; mobile controls adapt those panes rather than redefining the tool as a narrow single-column form.

## Limits and non-goals

- The atlas does not call an AI model and does not produce live model output.
- Pattern guidance is design reference material, not a guarantee that an AI product will be safe, correct, or compliant.
- Free comparison and favorites are intentionally limited; Pro availability depends on the shared browser entitlement.

## Acceptance criteria

- [ ] Searching or applying a supported filter changes the visible pattern set without external AI processing.
- [ ] Opening a pattern exposes its detail information and supports prompt copying; recent state is retained locally.
- [ ] Free comparison never exceeds two items, while active Pro allows up to four and exposes Pro handoff/export actions.
- [ ] English and Japanese page families preserve equivalent core pattern browsing behavior.

## Implementation evidence

- `tools/ai-interaction-atlas/index.html`
- `tools/ai-interaction-atlas/app.js`
- `tools/ai-interaction-atlas/complete-details.js`
- `tools/ai-interaction-atlas/pro-bridge.js`
- `tools/ai-interaction-atlas/data/`
- `tools/ai-interaction-atlas/ja/`
