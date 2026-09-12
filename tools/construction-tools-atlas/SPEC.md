# Tool Specification — Construction Tools Atlas

- Slug: `construction-tools-atlas`
- Public URL: `https://nicheworks.app/tools/construction-tools-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable browser reference for construction tools, site terminology, work names, aliases, and English/Japanese terminology, with detail views and local favorites.

## Current functional contract

- Search the local construction-term dataset by tool/term names, aliases, work names, and English/Japanese wording.
- Filter results by implemented action, category, and task dimensions and load additional results when needed.
- Open a term detail sheet with description, term variants, chips, bullets, and tabs for meaning, examples, aliases, and metadata.
- Switch the reference UI between Japanese and English and support light/theme controls.
- Mark terms as favorites, filter to favorites, and export/import favorite state through the browser UI.
- Provide menu, how-to, FAQ, related-tools, and support sheets/sections.

## Inputs

- Search query.
- Action/category/task filters.
- Language/theme controls.
- Favorite actions and optional favorite import data.
- Navigation/detail/tab selections.

## Outputs

- Filtered/search result list and counts.
- Detailed term reference sheets.
- Browser-local favorite collection plus explicit favorite export/import actions.

## State and persistence

Favorites are stored in the current browser and can be explicitly exported/imported through the tool UI. Search/filter/detail state is primarily current-session UI state. Theme/language behavior follows the implemented browser UI.

## Privacy and network behavior

Search and filtering operate against tool data in the browser; search terms are not intentionally sent to an application search backend. The page may load suite-wide analytics/advertising resources. Support links intentionally navigate to external support services.

## Language mode

`bilingual single-page`

A JA/EN control changes the same reference application's displayed language rather than using separate canonical language pages for the main atlas.

## Layout class

`hybrid`

The atlas supports desktop reference browsing while detail/filter/menu interactions are implemented as adaptable sheets suitable for narrow screens.

## Limits and non-goals

- This is a practical lightweight reference, not an authoritative safety standard, legal definition source, or formal trade dictionary.
- Term definitions, aliases, and examples can be incomplete; official manuals, standards, and safety documentation remain authoritative.
- Favorites are browser-local unless the user explicitly exports them.
- `app.runtime.js` is the active public-page runtime. The older `app.js` file is not authoritative for the current rendered atlas.

## Acceptance criteria

- [ ] Searching for a known indexed term or alias returns matching reference entries without sending the query to an application backend.
- [ ] Opening an entry exposes its detail content and supported detail tabs.
- [ ] Favorite add/remove and favorites-only filtering work locally, and favorite export/import preserves supported favorite state.
- [ ] JA/EN switching keeps search, filtering, detail, and favorites behavior available.

## Implementation evidence

- `tools/construction-tools-atlas/index.html`
- `tools/construction-tools-atlas/app.runtime.js`
- `tools/construction-tools-atlas/data/quality-loader.js`
- `tools/construction-tools-atlas/data/`
- `tools/construction-tools-atlas/style.css`
