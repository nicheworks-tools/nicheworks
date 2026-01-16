# Construction Tools Atlas — UI mapping (recon)

## Files
- `index.html`: Main markup for header, hero, controls, results list, and detail panel. DOM anchors for all key UI blocks.  
- `style.css`: Layout, card styling, and scroll container rules for results/detail panels.  
- `app.js`: UI state, list rendering, and detail open/close logic.

## Mapping
- `index.html` → **Header/topbar** → Title + theme/lang toggles + donate buttons.  
  - Selectors: `.topbar`, `.topbar-title`, `.topbar-brand`, `.topbar-tool` (`#headerTitle`), `.topbar-actions`, `#themeToggle`, `#langToggle`, `.donate-buttons`, `.donate-button`, `.donate-button--alt`.  
- `index.html` → **Hero/title block** → Tool name and lede text.  
  - Selectors: `.hero`, `#eyebrow`, `#heroTitle`, `#heroLede`.  
- `index.html` → **Donate/OFUSE/Ko-fi blocks** → Header buttons + footer donation links + mobile bottom bar.  
  - Header: `.donate-buttons`, `.donate-button` (Donate/Ko-fi).  
  - Footer: `.donation-links`, `.donation-link` (OFUSE, Ko-fi).  
  - Mobile: `.mobile-bottom-bar`, `.mobile-bottom-bar__btn` (Donate + Top).  
- `index.html` → **Results container** → Results header, count, list, and empty states.  
  - Selectors: `.results-panel`, `.results-header`, `#resultsTitle`, `#resultCount`, `.results-scroll`, `#results.results-list`, `#emptyState`, `#quickGuide`.  
- `style.css` → **Results internal scroll container** → Scroll area for results list.  
  - Selector: `.results-scroll` with `overflow-y: auto` and `flex: 1`.  
- `app.js` → **Results rendering (cards)** → Builds card buttons per entry.  
  - Functions: `renderList()`, `renderResultItem(entry)` creates `.card`, `.card__title`, `.card__desc`, `.card__tags` and updates list in `#results`.  
- `index.html` → **Entry detail view (sheet/panel)** → Detail panel with actions and fields.  
  - Selectors: `.detail-panel#detailPanel`, `#detailPlaceholder`, `.detail-sheet#detailSheet`, `.detail-actions#detailActions`, `#detailBack`, `#detailClose`, `.detail#detail`, plus detail fields (`#detailCategory`, `#detailTitle`, `#detailSubtitle`, `#detailDescription`, `#detailExamples`, `#detailTasks`, `#detailAliases`, `#detailTags`, `#detailId`).  
- `style.css` → **Detail scroll container** → Scrollable detail sheet.  
  - Selector: `.detail-sheet` with `overflow-y: auto` and `flex: 1`.  
- `app.js` → **Entry detail open/close** → Controls opening/closing and content population.  
  - Functions: `openDetail(id, { pushUrl })` (populates detail fields), `closeDetail({ pushUrl })` (hides sheet).  
  - Buttons: `#detailBack`, `#detailClose` wired in init (event listeners).  

## Notes
- Results are rendered as **cards** (`button.card` elements) inside `#results`.  
- Internal scroll containers: `.results-scroll` for results, `.detail-sheet` for the detail content panel.
