# ExecPlan: BichikuCheck safety and mobile prelaunch hardening

Date: 2026-11-03 (JST)
Branch: fix/bichiku-safety-mobile-launch-prep-20261103
Scope: tools/bichiku-check/**, this plan only. Preserve the existing public 89-tool registry, unrelated monetization and all other tools.

## Objective
Validate the current mobile-first guided preparedness checker before release. Keep critical readiness accounting conservative: user-provided total preparation-water allocation must not apply to unlimited packets or unrelated items.

## Work completed for review
- Require an **individual verified preparation method and whole-quantity water volume** for each water-dependent food option when using the guided assessment. Preserve legacy storage but do not let its old global volume mark any item ready.
- Any quantity or per-item water volume edit invalidates a previous prep confirmation.
- Sum explicitly confirmed total food-prep water; in water-outage mode, block these items from credit if summed allocation exceeds stored drinking water; maintain one water stock pool.
- Keep non-full substitutes non-counting. No new manufacturer-specific claims, unsafe cold-soaking assumptions or phantom water supply.
- Replace the old Prime Minister's Office URL (404 in current external checks) with accessible official disaster guidance at `https://www.bousai.go.jp/kyoiku/hokenkyousai/check.html`; align four-language link labels.
- Extend core tests for legacy inputs, over-allocation, cross-item confirmation and expiration; update mobile smoke to require explicit per-item confirmation.

## Verification
- Node: `node --test tools/bichiku-check/tests/*.test.cjs`.
- Chromium: `node tools/bichiku-check/tests/mobile.smoke.mjs http://127.0.0.1:8877` after starting a static server. Seven widths 320/360/375/390/414/768/1280 and four locales.
- Check affiliate disclosure before shopping results; links remain fixed Japan-only queries without household data.
- Continue staged `noindex,nofollow` and AdSense disabled until the full 90th-tool public release process is approved.

## Remaining constraints
- Verified first-party attribution and current Amazon Associates eligibility cannot be inferred from a source tag; account dashboard access is required.
- Native speaker proofreading and physical phone tactile QA are not certified by Chromium screenshots.
- A manufacturer-specific nutrition/water table is not yet provided; quantities remain explicitly user-confirmed planning data, not certified safety judgments.

## Rollback
Revert only this branch PR to restore previous guided experience without affecting sibling NicheWorks tools.
