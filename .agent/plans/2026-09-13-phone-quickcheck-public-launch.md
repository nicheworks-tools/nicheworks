# ExecPlan — Phone QuickCheck public launch

## Goal

Promote the verified 30-device Phone QuickCheck runtime from the repository staging convention to the canonical public NicheWorks URL.

## Scope

In scope:

- add `tools/phone-quickcheck/index.html` as the production entry point
- remove `tools/phone-quickcheck/index.staged.html` after promotion
- register `phone-quickcheck` in `tools/tools-index.json`
- add the canonical URL to root `sitemap.xml`
- update `tools/phone-quickcheck/SPEC.md` from planned/staged wording to implemented/public evidence
- preserve the existing 30-device dataset, JP/EN UI, desktop right pane, mobile bottom sheet, charging estimates, official links and reusable accessory compatibility logic

Out of scope:

- no new phone records
- no live Amazon affiliate URLs
- no Amazon price or availability display
- no per-model indexable pages
- no new server-side behavior

## Public contract

Canonical URL:

`https://nicheworks.app/tools/phone-quickcheck/`

Launch requirements:

- production `index.html` must not contain `noindex`
- canonical must point to the public URL above
- `tools-index.json` must contain exactly one `phone-quickcheck` item and the total must match the resulting item count
- `sitemap.xml` must contain the canonical URL exactly once
- the obsolete staged entry file must be removed
- live Amazon destinations must remain disabled until Associates setup and disclosure are completed in a separate change

## Verification

- compare against latest `main` and confirm only launch-scoped files change
- verify `tools/tools-index.json` remains valid JSON and contains 89 unique tool entries after this launch
- verify `tools/tool-spec-manifest.json` and `audits/tool-quality-matrix.json` both cover the same 89 registered tools
- verify sitemap contains the Phone QuickCheck canonical URL once
- verify production HTML has canonical metadata and an explicit indexable robots directive
- verify the existing 30-device JSON and accessory catalog remain untouched by the launch promotion
- run all pull-request CI, including Tool runtime contract audit, Tool spec audit and SEO audit
- require mergeable=true immediately before merge
- squash merge only after all current CI checks succeed

## Post-merge check

Confirm the repository public entry exists on `main` and check the deployed canonical URL when the production deployment becomes observable in the current session.
