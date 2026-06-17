# PR #484 common breakage audit

## Scope

This PR starts the common breakage repair phase after PR #482 and PR #483.

The current patch is intentionally small and targets the shared top-page search input breakage found in both language home pages.

## Fixed

- `index.html`
  - Replaced invalid `stable content="..."` on the top search input with a valid `placeholder="..."` attribute.
- `en/index.html`
  - Replaced invalid `stable content="..."` on the top search input with a valid `placeholder="..."` attribute.

## Checks performed

- Confirmed the Japanese top search input now has a valid placeholder.
- Confirmed the English top search input now has a valid placeholder.
- Compared branch against the PR #483 baseline commit.
- Confirmed only the two top pages were changed before opening the PR.

## Notes

The broader PR #484 schedule includes common HTML, metadata, ad ID, review-text, link, and shared button cleanup. This first PR keeps the actual code change limited to the confirmed shared top-search breakage so it can be reviewed safely before the next batch repair.
