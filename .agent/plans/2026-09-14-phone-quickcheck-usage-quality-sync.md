# ExecPlan — Phone QuickCheck usage documentation and quality sync

## Goal

Close the remaining documented Phone QuickCheck quality gaps after the 150-model dataset and behavior-test rollout.

## Scope

In scope:

- add one bilingual single-page `usage.html` for Phone QuickCheck;
- explain search/filter/detail flow, charger-guidance semantics, recharge estimates, accessory/Amazon handoff, official-source links, privacy, limits, and common questions;
- link the usage guide from the public Phone QuickCheck page;
- update canonical specs to record usage and FAQ as present;
- update `audits/tool-quality-matrix.json` so Phone QuickCheck reflects the already-merged behavior test and new usage evidence;
- keep the main tool behavior, dataset, affiliate destinations, and charging formula unchanged.

Out of scope:

- more phone records beyond the maintained 150-model target;
- per-model SEO pages;
- live Amazon price, inventory, rating, or product-image ingestion;
- new compatibility rules or charging-value inference;
- changes to common specification policy.

## Quality target

The Phone QuickCheck matrix record should end with:

- `usage_status: recommended-and-present`;
- `faq_status: optional-present`;
- `functional_test_status: behavior-test-present`;
- behavior test evidence including `tools/phone-quickcheck/tests/behavior.test.mjs`;
- no Phone QuickCheck recommendation-only quality gaps remaining.

## Verification

- `usage.html` is bilingual on one page and preserves the shared `nw_lang` preference;
- main page links to `usage.html` without changing primary tool flow;
- Tool spec audit succeeds;
- SEO audit succeeds;
- Phone QuickCheck data, affiliate, behavior, and runtime checks remain green;
- no temporary workflow remains in the final PR.

## Release gate

Squash merge only when the PR is mergeable against current `main` and every triggered PR check succeeds.
