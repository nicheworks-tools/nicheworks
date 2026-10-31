# ManualFinder Amazon outbound readiness — 2026-10-31

## Scope
- Target: `tools/manual-finder/affiliate-runtime.js` only for runtime behavior
- Target: `.agent/plans/manualfinder-amazon-first-click-20261031.md` for execution plan
- Keep all existing Amazon URLs, associate tags, GA4 tag, AdSense, donations, and layout intact.

## Problem
The current affiliate runtime waits for a serial chain of dozens of camera-accessory data scripts before it starts attaching Amazon offers to any results. Printer consumable and model lookup offers do not depend on that camera-data chain, so this delays useful purchase links needlessly.

## Implementation
1. Initialize shared affiliate handling immediately after the deferred runtime executes.
2. Load camera-accessory layers in the background while initial cards already receive their eligible base/model/consumable links.
3. On completion, adopt the latest merged affiliate config and update existing cards exactly once, without duplicating offer blocks.
4. Retain the targeted event identifiers introduced on this PR.

## Verification
- Confirm JS syntax and the changed lines against the original.
- Confirm initial execution does not depend on camera-accessory layer completion.
- Confirm cards are refreshed once on layer completion, preserving search, language, and official manual links.
- Confirm normal Amazon affiliate URLs, tracking tag, donation, GA4, and AdSense code are unchanged.
- Browser QA after merge: open printer and camera results, verify product links and GA4 click events.

## Safety
Do not modify unrelated tools or merge/deploy until validation is complete. Revenue uplift is not assumed or guaranteed.
