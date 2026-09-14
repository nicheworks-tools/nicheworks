# Construction Tools Atlas v2.3 — PR 1 notes

This PR freezes the redesign contract before behavior changes begin.

## Included

- v2.3 product/search/UI/language/share/image/affiliate specification
- formal canonical entry JSON Schema
- representative example entry
- no-dependency contract validator
- explicit runtime authority: `app.runtime.js`
- legacy `app.js` is non-authoritative
- current detail/image hotfix layers are tolerated during staged migration and are not treated as the target architecture

## Not included

- search behavior changes
- desktop/mobile layout rewrite
- JA/EN/Both runtime implementation
- deep-link runtime implementation
- SVG/image migration
- affiliate runtime

Those are intentionally isolated into subsequent PRs.

## Manual validation command

From repository root:

```bash
node tools/construction-tools-atlas/validate-contract-v2.3.mjs
```
