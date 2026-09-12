# Tool Specification — ManualFinder

- Slug: `manual-finder`
- Public URL: `https://nicheworks.app/tools/manual-finder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a searchable, paginated directory of official manufacturer manual/support destinations so users can reach the correct brand support page and continue model/series lookup there.

## Current functional contract

- Load the maintained ManualFinder manufacturer/link dataset and display official support/manual destinations.
- Filter by manufacturer/brand name, model-number fragment, product/category term, and explicit category selection.
- Provide quick-search shortcuts for common brands/categories.
- Paginate large result sets, including the 500+ candidate directory described by the current UI.
- Link users out to manufacturer official support/manual pages; the actual product-manual search continues on the destination site.
- Provide method, disclaimer, credits, usage, and search-guide pages.
- Provide distinct canonical Japanese and English page families using the shared underlying directory logic.

## Inputs

- Search text for brand/model/category.
- Category and quick-search selections.
- Pagination/navigation actions.

## Outputs

- Filtered manufacturer/manual-support destination cards and result count.
- External navigation to official manufacturer sites.

## State and persistence

Search/filter/page state is current-browser UI state. The current contract does not include saved manual lists, account history, or downloaded manual storage.

## Privacy and network behavior

Directory filtering runs against NicheWorks-hosted data. Search terms are not intentionally submitted to an application search backend. Clicking a manufacturer destination intentionally navigates to that external official site, where that site's own network/privacy behavior applies. Advertising and analytics resources may load on NicheWorks pages.

## Language mode

`separate JA/EN pages`

The Japanese canonical root and `/en/` page are distinct indexable language pages with corresponding guides/usage links.

## Layout class

`hybrid`

The directory/search cards are usable on mobile while desktop width improves browsing of larger result sets and pagination.

## Limits and non-goals

- ManualFinder is a directory/link aid; it does not host or guarantee the current content of manufacturers' manuals.
- A listed link can change or become stale; users must confirm the latest information on the manufacturer site.
- The tool does not guarantee that a model number maps directly to a downloadable manual without further searching on the destination site.

## Acceptance criteria

- [ ] Brand/category/model-fragment filtering changes the visible official-destination candidates and result count.
- [ ] Large result sets remain navigable through the implemented pagination rather than rendering an unbounded single list.
- [ ] Result actions navigate to maintained external manufacturer support/manual destinations rather than pretending NicheWorks hosts the manuals.
- [ ] Japanese and English canonical pages provide equivalent core search/directory behavior and preserve the accuracy disclaimer.

## Implementation evidence

- `tools/manual-finder/index.html`
- `tools/manual-finder/en/index.html`
- `tools/manual-finder/app.paged.js`
- ManualFinder maintained data resources
- `tools/manual-finder/howto/`
- `tools/manual-finder/usage.html`
- `tools/manual-finder/usage-en.html`
