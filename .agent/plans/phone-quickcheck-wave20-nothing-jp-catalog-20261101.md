# Phone QuickCheck Wave 20 — Nothing Japan catalogue (2026-11-01)

## Objective
Expand maintained Japan phone list 215 → 219 (11 manufacturers / 36 foldables) with four source-backed models: Phone (4a), Phone (4a) Pro A069P, Phone (2a), and CMF Phone 1. Use Japanese carrier variants where present and manufacturer's Japan product/support information for exact evidence.

## Primary sources
- a4Au: https://onlineshop.au.com/disp/CSfLastGoodsPage_001.jsp?GOODS_NO=14595&dispNo=001007
- a4Mfg: https://jp.nothing.tech/products/phone-4a
- a4Support: https://support.nothing.tech/hc/en-us/categories/40129777015569
- a4Box: https://support.nothing.tech/hc/en-us/articles/43193532938513-What-s-included-in-the-box-for-Phone-4a
- proRak: https://network.mobile.rakuten.co.jp/product/smartphone/phone-4a-pro/spec/
- proMfg: https://jp.nothing.tech/products/phone-4a-pro/
- proSupport: https://support.nothing.tech/hc/en-us/categories/40129794073361-Nothing-Phone-4a-Pro
- proRelease: https://corp.mobile.rakuten.co.jp/news/press/2026/0415_01/
- a2Mfg: https://jp.nothing.tech/products/phone-2a
- a2Dims: https://support.nothing.tech/hc/en-us/articles/22960522674321-What-are-the-dimensions-weight-of-Phone-2a
- a2Wireless: https://support.nothing.tech/hc/en-us/articles/22960579342737-Does-Phone-2a-support-wireless-charging
- a2Support: https://support.nothing.tech/hc/en-us/sections/21890183481745-Product-Feature
- cmfMfg: https://jp.nothing.tech/products/cmf-phone-1
- cmfIij: https://www.iijmio.jp/campaign/device/nothing202410.html
- cmfRelease: https://www.iijmio.jp/info/iij/1726809877.html
- cmfSupport: https://jp.nothing.tech/pages/contact-support

## Scope
Only tools/phone-quickcheck/data/phones.json, SPEC.md, index.html, COMPLETION_AUDIT.md; the specific count validators and manufacturer official/carrier primary URL allowlist in scripts/check-phone-quickcheck-source-semantics.mjs, and this ExecPlan. Preserve historical v1 baseline and all unrelated tools/specs, ads, analytics and affiliate behavior.

## Key evidence and uncertainty
- Phone4a Japanese au size/weight trumps generic rounded Nothing lab sizes. USB-C cable in-box, no adapter. Manufacturer 50W fast charging, do not infer PD/PPS support or wireless non-support from silence.
- Phone4a Pro Japan Rakuten A069P 50W from Nothing product, wireless explicitly unsupported, cable in-box, adapter excluded.
- Phone2a official 45W/IP54, cable in-box, wireless explicitly unsupported.
- CMF Phone 1 Japanese IIJ SKU has two thickness and weight variants (black/green 8mm/197g; orange vegan leather 9mm/202g). Preserve paired physicalVariants, and IIJ explicit 33W PPS. IIJ time-limited *bonus earbuds* not assumed included in standard phone box.

## Quality gates
Unique 219 IDs, 11 makers, 36 foldables; 34 intentional Apple battery unknowns, no new unreviewed package/water unknowns; Phone QuickCheck data, first-party domain/charging semantic, completion, behavior, affiliate, SEO, runtime CI. Merge only green. Existing public Chrome smoke triggers main and must report HTTP 219 and live JSON exactly equal to checkout; 320/390/414/768/1280px JP/EN/search/mobile detail and badge-close nonoverlap must pass. Failed deployment is a blocker, not a success.
