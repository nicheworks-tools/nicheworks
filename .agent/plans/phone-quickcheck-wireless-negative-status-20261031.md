# Phone QuickCheck — source-backed wireless non-support display
Date: 2026-10-31

## Scope
Single-tool, additive schema/UI correction: tools/phone-quickcheck/data/phones.json, app.js, tests/behavior.test.mjs, SPEC.md and COMPLETION_AUDIT.md; plus specific Phone QuickCheck data and source-semantic CI validators. No change to common spec, cross-tool UI, ads, analytics, or deployment.

## Motivation
The Japan carrier [Phone (4b) official specification](https://network.mobile.rakuten.co.jp/product/smartphone/phone-4b/spec/) expressly says wireless charging is unsupported. Existing schema could only show a positive wireless standard or unknown dash, losing this verified negative fact.

## Implementation
Add optional `charging.wirelessStatus: not_supported` with `sources.wirelessUrl` required and conflicting standard/wattage prohibited. Render JP 非対応 / EN Not supported in wireless field. Set only Nothing Phone (4b) where first-party evidence exists. All other unknowns remain unknown; no inference from absent claims. Cover both language modes in actual app behavior regression harness.

## Validation
- Data and source semantics: 208 phones / 11 manufacturers / 36 foldables; positive and negative wireless source invariants.
- CI: tool behavior, affiliates, tool spec, SEO, runtime.
- Manually verify production 320/390px bottom sheet and desktop detail after deploy; GitHub CI is not a proof of deployed rendering.
