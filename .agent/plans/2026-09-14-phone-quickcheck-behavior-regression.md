# ExecPlan — Phone QuickCheck behavior regression coverage

## Goal

Close the documented Phone QuickCheck behavior-test gap without changing production behavior.

## Coverage

- execute the maintained `tools/phone-quickcheck/app.js` in a deterministic Node VM DOM harness;
- verify canonical model and alias search;
- verify JP/EN language switching;
- verify the maintained 67% power-bank recharge estimate;
- verify Apple unknown mAh never fabricates recharge counts;
- verify Lightning-era iPhones resolve the USB-C-to-Lightning accessory class;
- verify proprietary fast charging remains device-side data rather than an invented generic USB-PD recommendation;
- verify mobile row selection opens the bottom sheet and closing it restores page state.

## CI integration

The behavior suite lives at `tools/phone-quickcheck/tests/behavior.test.mjs` and runs from the existing Phone QuickCheck data workflow alongside data and affiliate contracts.

## Release gate

The branch was synchronized with current `main` on 2026-09-14. Squash merge only after all PR checks succeed on the post-sync human commit and the PR is mergeable.
