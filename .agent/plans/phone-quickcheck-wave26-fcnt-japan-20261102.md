# Phone QuickCheck Wave 26 — Resume FCNT domestic catalog backfill
Date: 2026-11-02

## Purpose
Add actual missing Japan-market source-backed phone models **in parallel** with affiliate conversion analysis and SEO. Four distinct historic docomo FCNT models: Be4 Plus F-41B, 5G F-51A, Be4 F-41A, Be3 F-02L. Raise 223 to 227 verified phone records; keep all old models, 11 manufacturers, 36 foldables and Amazon CTA logic intact.

## Provenance
- arrows Be4 Plus F-41B: https://www.fcnt.com/spec/f-41b/ | standard package https://www.fcnt.com/spec/f-41b/
- arrows 5G F-51A: https://www.fcnt.com/spec/f-51a/ | standard package https://www.fcnt.com/spec/f-51a/
- arrows Be4 F-41A: https://www.docomo.ne.jp/support/product/f41a/spec.html | standard package https://www.fmworld.net/product/phone/f-41a/option.html
- arrows Be3 F-02L: https://www.docomo.ne.jp/support/product/f02l/spec.html | standard package https://www.fmworld.net/product/phone/f-02l/option.html

## Data semantics
Official exact dimensions/grams/display/battery/IP, connector and actual standard package. F-51A has USB PD Rev2.0 confirmed, so declare protocol only and leave watts/PPS unknown; F-41B's rapid-charge '-' is not enough to assert PD, so protocols empty. Be4 F-41A and Be3 F-02L official carrier specifications explicitly mark wireless Qi as absent, preserve source-backed not_supported. No brand-unverified wattage or charger recommendation. USB-C headphones adapter for 5G is not a wall charger. Retain dynamic affiliate classes rather than invent individual retail URLs.

## Scope
- tools/phone-quickcheck/data/phones.json, SPEC.md, index.html, COMPLETION_AUDIT.md
- scripts/check-phone-quickcheck-completion.mjs, scripts/check-phone-quickcheck-data.mjs
- scripts/check-phone-quickcheck-source-semantics.mjs: FCNT trust manufacturer original `fmworld.net` and docomo carrier `docomo.ne.jp` narrowly.
- .agent/plans/phone-quickcheck-wave26-fcnt-japan-20261102.md (this ExecPlan)

## Gate
All Phone QuickCheck data, source semantic, completion, affiliate, behavior and responsive checks; repo SEO/runtime/other checks must pass. Merge only after green. Prove public exact JSON parity / all five viewport browser checks on actual deployed 227-device site, and include device-specific new models in live test. Do not claim full Japan completeness.
