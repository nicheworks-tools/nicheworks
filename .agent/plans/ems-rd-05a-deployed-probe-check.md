# EMS-RD-05A deployed probe check

## Scope
- Target documentation file: `tools/earth-map-suite/EMS_RD_05_DEPLOYED_PROBE_CHECK.md`.
- No public UI files (`app.js`, HTML, CSS) will be changed.
- No Storm / Compare / Card wiring, no dependencies, and no spec changes.

## Steps
1. Inspect existing EMS-RD-04 documentation for expected probe decision terminology.
2. Query the deployed Earth Map Suite probe endpoints with exact URLs when network is available.
3. Record exact HTTP / JSON results without fabricating missing fields.
4. Classify the current branch decision for Real Data First.
5. Verify only the intended documentation files changed, then commit and open one PR.

## Manual verification for user
- Re-run the three documented endpoint URLs from `EMS_RD_05_DEPLOYED_PROBE_CHECK.md`.
- Confirm public UI remains unchanged and real precipitation values are still not enabled.
