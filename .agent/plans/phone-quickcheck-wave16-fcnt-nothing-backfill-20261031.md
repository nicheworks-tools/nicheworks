# Phone QuickCheck Wave 16 — Japan FCNT/Nothing catalog backfill
Date: 2026-10-31

## Scope and principles
Add verified FCNT arrows Alpha M08 (SIM-free), arrows We2 Plus M06 (Rakuten Mobile), Nothing Phone (3a) A059 (Rakuten Mobile) to the canonical JSON under tools/phone-quickcheck. Update Phone QuickCheck-only count checks/overview/spec and maintenance audit; preserve old historical V1 baseline and 36 foldables. No changes to common spec, unrelated tools, ads, affiliate implementation, analytics, deployment or UI logic.

## Primary sources
- FCNT Alpha: https://www.fcnt.com/spec/m08-sim-free/ / https://www.fcnt.com/news/27917/
- FCNT We2 Plus M06: https://www.fcnt.com/spec/m06/ / https://www.fcnt.com/news/1005/
- Nothing 3a Japan: https://network.mobile.rakuten.co.jp/product/smartphone/phone-3a/spec/ / https://corp.mobile.rakuten.co.jp/news/press/2025/0408_01/
- Nothing package: https://support.nothing.tech/hc/ja/articles/32978953822609-Phone-3a-%E3%81%AE%E3%83%9C%E3%83%83%E3%82%AF%E3%82%B9%E3%81%AB%E3%81%AF%E4%BD%95%E3%81%8C%E5%85%A5%E3%81%A3%E3%81%A6%E3%81%84%E3%81%BE%E3%81%99%E3%81%8B

## Semantics
Use variant-specific first-party in-box evidence. Alpha M08 has 90W charger + cable included (adapter W not device input W), M06 only quick start guide (charger and cable excluded), Nothing 3a Type-C cable included and charger excluded; Rakuten states wireless charging not supported. Where only PD 3.0 is evidenced, no PPS inference. No unauthorized claim of charging wattage, positive wireless or carrier SKU identity. Each water rating grounded in first-party specs.

## Gates
211 unique IDs, 11 manufacturers, 36 foldables, reviewed unknown invariant, all Phone QuickCheck data/source/affiliate/completion/responsive/behavior and tool spec/SEO/runtime CI. On main, verify Cloudflare Pages public HTML+JSON freshness and all viewport production Chrome checks, resolving any stale deployment by investigation rather than overriding tests.
