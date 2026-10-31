# Phone QuickCheck Wave 17 — public 211-phones JSON parity gate
Date: 2026-10-31

## Motivation
Wave 16 adds three verified phones (211 total) to GitHub main; a local-only main data check is insufficient evidence of Cloudflare Pages propagation. Existing live Chrome smoke compares only the count and two specific IDs. Extend to complete canonical JSON equality and check newly introduced model-specific charging/box semantics.

## Scope
- scripts/check-phone-quickcheck-production.mjs: parse one canonical local payload and assert live JSON deep-equals it; add targeted Alpha M08, We2 Plus M06 and Phone 3a assertions.
- tools/phone-quickcheck/COMPLETION_AUDIT.md: document the provenance and deployment gate.
- .agent/plans/phone-quickcheck-production-data-parity-20261031.md: this plan.

No UI, data, SEO, common spec, tools outside Phone QuickCheck, affiliate, analytics, deployment routes or dependencies changed.

## Verification
PR triggers the production smoke itself; require actual public 211 model parity and Chrome 320/390/414/768/1280 JP/EN/search/detail/non-overlap assertions before merging. Main push of workflow script reruns guard. A stale deployment should fail CI, not be marked complete.
