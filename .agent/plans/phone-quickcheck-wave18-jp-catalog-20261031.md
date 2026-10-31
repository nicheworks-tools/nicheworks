# Phone QuickCheck Wave 18 — Japanese FCNT and Nothing 4-model backfill
Date: 2026-10-31

## Scope
Add FCNT arrows We2 M07, Nothing CMF Phone 2 Pro A001, Nothing Phone (3a) Lite A001T and Nothing Phone (3) A024. Update canonical dataset from 211 to 215, Phone QuickCheck-specific count gates/JP+EN SEO summary/spec and maintenance audit only. Keep original 181-V1 baseline, 11 manufacturer roster and 36 foldables unchanged. No other tool, common spec, affiliate runtime, analytics or deployment mutation.

## Evidence
- FCNT M07: https://www.fcnt.com/spec/m07-sim-free/ | https://www.fcnt.com/news/1008/
- CMF A001: https://network.mobile.rakuten.co.jp/product/smartphone/cmf-phone-2-pro/spec/ | https://jp.nothing.tech/products/cmf-phone-2-pro | https://corp.mobile.rakuten.co.jp/news/press/2025/0722_01/ | https://support.nothing.tech/hc/ja/categories/32612177779473-CMF-by-Nothing-Phone-2-Pro
- 3a Lite A001T: https://network.mobile.rakuten.co.jp/product/smartphone/phone-3a-lite/spec/ | https://jp.nothing.tech/products/phone-3a-lite | https://corp.mobile.rakuten.co.jp/news/press/2026/0107_01/ | https://support.nothing.tech/hc/ja/categories/37560459056913-Nothing-Phone-3a-Lite
- Phone3 A024: https://network.mobile.rakuten.co.jp/product/smartphone/phone-3/spec/ | https://jp.nothing.tech/products/phone-3 | https://corp.mobile.rakuten.co.jp/news/press/2025/0820_01/ | https://support.nothing.tech/hc/ja/categories/34659490954897-Nothing-Phone-3

## Source-specific decisions
FCNT M07 only guide in box, no cable or adapter. CMF and Lite JP carrier boxes include USB-C cable and no adapter; wireless explicitly unsupported. CMF and Lite use manufacturer-certified 33W fast-charge capability, not an inferred generic USB-PD PPS claim. A024 JP carrier box includes USB-C cable though Nothing generic help list omits it: use Japan A024-specific box evidence. Phone3 source supports 15W wireless charging but no Qi revision specified; do not invent one. No unsupported wired wattage, PPS or wireless claim.

## Quality gates
215 distinct IDs, 11 makers, 36 foldables, no unreviewed package/water fields; full Phone QuickCheck data/source/completion/behavior/responsive/affiliate, SEO, runtime CI. After merging, require production Chrome HTTP exact JSON parity and five viewports JP/EN search/details, no close-button overlap.
