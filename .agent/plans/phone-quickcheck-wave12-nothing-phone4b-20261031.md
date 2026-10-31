# Phone QuickCheck Wave 12 — Nothing Phone (4b)
Date: 2026-10-31

## Scope
Add one new Japanese-market manufacturer (Nothing) and model Phone (4b) to the Phone QuickCheck canonical dataset. Update phone model counts, official-source allowlist, specs, and maintenance audit. No shared-spec or runtime UI changes.

## Primary documents
- Japan carrier-specific SKU specifications: https://network.mobile.rakuten.co.jp/product/smartphone/phone-4b/spec/
- Official Japan manufacturer product: https://jp.nothing.tech/products/phone-4b
- Japan launch confirmation: https://corp.mobile.rakuten.co.jp/news/press/2026/1020_01/
- Japan Nothing support / box contents: https://support.nothing.tech/hc/ja/categories/43042083804945-25131

## Semantic choices
Preserve Japan A009P exact dimensions 164.4 × 78.22 × 8.65mm (global Nothing display rounds to 164.4 × 78.2 × 8.6). Cable included, charger adapter excluded for Japan SKU. Charger wattage and device PPS status unknown because source does not establish exact capability. Although Japan carrier says wireless is not supported, existing null-only UI cannot express a negative state; do not invent a wireless standard; log schema follow-up in audit.

## CI and live smoke
Require 208 unique models / 11 manufacturers / 36 foldables, phone data, source semantics, completion, behavior, SEO, runtime, affiliates. A green GitHub PR does not verify the public Cloudflare Pages deploy or mobile 320/390/414px browser rendering.
