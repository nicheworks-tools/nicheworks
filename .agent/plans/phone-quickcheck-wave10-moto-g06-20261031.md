# Phone QuickCheck Wave 10 — moto g06
Date: 2026-10-31

## Scope
Add one verified Japan-market handset to `tools/phone-quickcheck/data/phones.json`; update Phone QuickCheck-specific count assertions, overview, SPEC and audit. No cross-tool, common specification, analytics, deployment or styling changes.

## Evidence
- Official Japan product specifications: https://store.motorola.co.jp/item/MOTO_G06.html
- Japan announcement (2026-03-10) / retail date (2026-03-19): https://store.motorola.co.jp/topics_detail.html?info_id=1148
- Product specification states exact physical, charging (10W), water (IP64), and in-box states.

## QA
- Confirm 206 unique IDs, nine manufacturers, 36 foldables; data contract / completion / source semantics / runtime / affiliate CI.
- Check the deployed 320/390px mobile sheet and desktop detail after deploy (manual browser smoke outstanding).
- Do not infer PPS/PD, wireless capability or charger adapter guidance; keep unknowns explicit.
