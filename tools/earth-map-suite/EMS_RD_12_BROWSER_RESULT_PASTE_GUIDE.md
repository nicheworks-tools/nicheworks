# EMS-RD-12 Browser Result Paste Guide

Last updated: 2026-05-19

This guide explains how to paste a **real browser self-check result JSON** safely.

## Steps

1. Open `/tools/earth-map-suite/api-status.html` on deployed site.
2. Run **safe check first** (`health` + `manifest`) before any probe action.
3. Copy the produced JSON result exactly as output.
4. Replace `tools/earth-map-suite/ems-rd-11-browser-self-check-result.json` with the copied JSON.
5. Validate JSON locally:

```bash
python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.json
```

6. Run branch selection/validation workflow after JSON validation.

## Branch interpretation (initial routing)

- `browser_result_missing` → keep verifying.
- `health_manifest_reachable` → run research probe.
- `health_manifest_failed` → route/deploy fix.
- `raw_pixel_read` → sample validation only.
- `decoder_strategy_required` → decoder feasibility only.

## Non-negotiables

- Do not paste fake results.
- Do not edit endpoint values by hand.
- Keep `public_real_data_enabled=false`.
- Keep `storm_compare_card_connected=false`.
- Do not connect public UI.
