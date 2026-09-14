# ExecPlan — Phone QuickCheck behavior regression coverage

## Goal

Close the documented behavior-test gap for Phone QuickCheck by executing the real browser runtime in a deterministic Node VM harness.

## Scope

In scope:

- exercise `tools/phone-quickcheck/app.js` without changing production behavior;
- use canonical `phones.json` and `accessories.json` as test fixtures;
- cover maintained alias/model search;
- cover JP/EN switching;
- cover 67% power-bank recharge estimates;
- prove Apple unknown mAh does not fabricate recharge counts;
- prove Lightning-era iPhones receive USB-C-to-Lightning accessory guidance;
- prove proprietary fast-charging values remain device-side facts rather than invented generic USB-PD recommendations;
- exercise mobile row selection, bottom-sheet opening, and closing;
- run the behavior test in the existing Phone QuickCheck CI workflow.

Out of scope:

- browser screenshot/pixel-diff testing;
- network availability of manufacturer sites;
- Amazon checkout or external retailer-page behavior;
- altering phone data or production UI behavior merely to simplify tests.

## Verification

- `node tools/phone-quickcheck/tests/behavior.test.mjs` passes;
- `node scripts/check-phone-quickcheck-data.mjs` passes;
- `node scripts/check-phone-quickcheck-affiliate.mjs` passes;
- Tool runtime contract audit, Tool spec audit, SEO audit and Phone QuickCheck CI remain green;
- canonical docs no longer claim behavior testing is missing.

## Release gate

Squash merge only after the branch is mergeable against current `main` and all triggered PR checks succeed.
