# Pattern Dictionary — repository vertical slice

20-pattern repository-backed implementation for search/browse/compare validation.

- All records remain `prototype-curated`.
- Pattern images are generated DEV placeholders, not final Reference Images.
- `pattern.html?id=...` is deliberately `noindex`; canonical static per-pattern pages are the next repository commit before any merge/publication.
- Amazon UI is not connected to affiliate URLs yet.
- Search runs client-side only.

Validation: `node tools/pattern-dictionary/tests/validate.mjs` and `node tools/pattern-dictionary/tests/search-test.mjs`.
