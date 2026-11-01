# Phone QuickCheck Wave 28 — 5 Japan FCNT historical sales models
Date: 2026-11-02

## Goal
Continue adding real JP marketed smartphones instead of pausing catalog for SEO or analytics checks. Add arrows Be F-04K (2018), arrows U 801FJ SoftBank, arrows J 901FJ Ymobile Japanet, arrows RX Rakuten, arrows M05 SIM-free (2019). These are separate branded commercial models despite some hardware commonality; 227→232 verified phones; 11 makers, 36 foldables unchanged.

## First-party model and packaging evidence
- arrows Be F-04K: https://www.fmworld.net/product/phone/f-04k/spec.html | standard box https://www.fmworld.net/product/phone/f-04k/option.html
- arrows U: https://www.fmworld.net/product/phone/arrows_u/spec.html | standard box https://www.fmworld.net/product/phone/arrows_u/fuzokuhin.html
- arrows J: https://www.fmworld.net/product/phone/arrows_j/spec.html | standard box https://www.fmworld.net/product/phone/arrows_j/fuzokuhin.html
- arrows RX: https://www.fmworld.net/product/phone/arrows_rx/spec.html | standard box https://www.fmworld.net/product/phone/arrows_rx/fuzokuhin.html
- arrows M05: https://www.fmworld.net/product/phone/m05/spec.html | standard box https://www.fmworld.net/product/phone/m05/fuzokuhin.html
- RX Rakuten Japan primary no-wireless/box evidence: https://network.mobile.rakuten.co.jp/product/smartphone/arrows-rx/

## Constraints
2018+ models only. Body, grams, diagonal, mAh, USB-C and IP from exact manufacturer SKU specifications; package cable/brick from model-specific manufacturer box enumeration. RX cable **included**, unlike the others. No manufacturer PD/wired-max/PPS assumptions. RX Qi negative explicitly verified; other unverified Qi statuses left unknown. The four M05/U/J/RX sales models have similar published physical specifications but are not the same marketed package and should not be forcibly merged.

## File scope
- tools/phone-quickcheck/data/phones.json, SPEC.md, index.html, COMPLETION_AUDIT.md
- scripts/check-phone-quickcheck-completion.mjs, scripts/check-phone-quickcheck-data.mjs
- scripts/check-phone-quickcheck-source-semantics.mjs: FCNT trusted Japan Rakuten carrier only
- .agent/plans/phone-quickcheck-wave28-five-fcnt-20261102.md (this plan)

## Validation and deployment
Phone QuickCheck data/completion/semantic/behavior/affiliate/SEO/runtime all pass, then merge. Production browser smoke on live 232 model page: deep public JSON parity, actual search/details of all 5, verified RX cable vs other models and source negative Qi, and full Amazon link class/associates tagging. Avoid changing ad slots, other tools or common spec. If unrelated repository CI blocks the phone work, report it separately; do not assume live release.
