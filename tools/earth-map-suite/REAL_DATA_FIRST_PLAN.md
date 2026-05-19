# Earth Map Suite Real Data First Plan

Last updated: 2026-05-19

## Decision

The active plan is **Real Data First**.

The old plan to complete all 18 ideas as a synthetic-only suite first is rejected.

Development must proceed in this order:

1. Build and verify the real data adapter first.
2. Prove real precipitation handling for Storm / Compare / Card.
3. Expand the same data foundation to the remaining ideas.
4. Use synthetic preview only for unsupported metrics or modes, and label it clearly.

## Current legal / product constraints

- JAXA notification/application is still on hold.
- Donation links may remain visible as NicheWorks site support.
- No checkout or paid feature button should be shown for this tool family.
- Every real-data output must show source, dataset, license/status, retrieved_at, and processing note.
- Raw bbox / lat / lon must not be sent to GA4.
- The UI may send bbox / point / date range / selected metric to a data endpoint only for Earth observation retrieval.

## Four-directory structure

```text
tools/
  earth-map-suite/      # Ideas 1-13 and 18
  earth-timeseries/     # Idea 14
  earth-alerts/         # Idea 15
  earth-seo/            # Ideas 16-17
```

## Correct 18 idea map

| Idea | Name | Target |
|---:|---|---|
| 1 | Location Card | earth-map-suite / card |
| 2 | Compare | earth-map-suite / compare |
| 3 | Storm Replay | earth-map-suite / storm |
| 4 | Heat Map | earth-map-suite / heat |
| 5 | Aerosol Watch | earth-map-suite / aerosol |
| 6 | Sea Ice | earth-map-suite / seaice |
| 7 | One-page Report | earth-map-suite / report |
| 8 | Solar | earth-map-suite / solar |
| 9 | Land Cover | earth-map-suite / landcover |
| 10 | Terrain | earth-map-suite / terrain |
| 11 | Dataset Picker | earth-map-suite / picker |
| 12 | AOI Export | earth-map-suite / export |
| 13 | Code Generator | earth-map-suite / codegen |
| 14 | Time-series | earth-timeseries |
| 15 | Alerts | earth-alerts |
| 16 | Daily Rankings | earth-seo / rankings |
| 17 | Place Pages | earth-seo / place-pages |
| 18 | News Check | earth-map-suite / news |

## Current implementation state

Some pages and endpoints already exist, but the state must be described precisely.

### Implemented or partially implemented

- Storm: metadata-only status exists; real raster values are not sampled.
- Compare: metadata-only A/B status exists; real raster values are not sampled.
- Card: metadata-only point-area status exists; real raster values are not sampled.
- Report page exists, but is metadata-only / synthetic preview oriented.
- Export page exists, but is metadata-only / synthetic preview oriented.
- Dataset status page exists, but is not a full dataset picker.
- Codegen page exists, but only for metadata endpoint examples.
- Raster probe endpoint/page exists for research, but does not sample real precipitation values.

### Not yet implemented as real-data tools

- Heat Map
- Aerosol Watch
- Sea Ice
- Solar
- Land Cover
- Terrain
- Time-series
- Alerts
- Daily Rankings
- Place Pages
- News Check

## #318 decision

PR #318 is rejected and must not be merged.

Reason:

- It conflicts with current main.
- It only auto-runs the raster probe page.
- It does not advance the 18-tool Real Data First plan.

If auto-run is needed later, recreate it from latest main in a fresh branch.

## EMS-RD current status

| Task | Intended goal | Current status |
|---|---|---|
| EMS-RD-01 | Real Data Adapter investigation / connection method | Complete (research baseline) |
| EMS-RD-02 | precipitation dataset registry | Complete (research baseline) |
| EMS-RD-03 | Cloudflare Pages Function for real data retrieval | Complete as research/metadata + probe foundation |
| EMS-RD-04A〜04H | Real observation contract / validation gates | Complete |
| EMS-RD-05A〜05H | Probe/decoder branch and safe unavailable contract hardening | Complete |
| EMS-RD-06 | Deployment and route verification gate | **Current active gate** |

### EMS-RD-06 gate statement

- `precipitation-sample-real` exists.
- `precipitation-sample-real` is safe-unavailable by design until full validation/unlock.
- `public_ui_allowed` remains `false`.
- Storm / Compare / Card are not connected to real values.
- `real_observation` public output is not enabled.

## Next required work

The next work is EMS-RD-06 deployment and route verification (not UI wiring).

Active next steps:

1. Add `/api/earth-map-suite/health` endpoint for lightweight deploy reachability checks.
2. Add `/api/earth-map-suite/manifest` endpoint for local route/contract inventory checks.
3. Run manual deployed verification from external network (`nicheworks.app` and `nicheworks.pages.dev`).
4. Record branch decision after verification (`route_missing`, `functions_not_deployed`, `health_ok_probe_error`, `probe_status_raw_pixel_read`, `probe_status_decoder_strategy_required`).
5. Keep Storm/Compare/Card real connection blocked until verification and sampling validation are approved.


### EMS-RD-08 verification result

- workflow availability: file exists locally; Actions visibility/dispatch are unverified from this environment.
- health / manifest smoke result: `network_unverified` (manual dispatch blocker: GitHub Actions dispatch unavailable from this environment).
- probe result: `network_unverified` (not run because health/manifest reachability is not confirmed).
- final branch decision: `network_unverified`.

#### EMS-RD-08 safety state (unchanged)

- `precipitation-sample-real` is safe-unavailable.
- `public_ui_allowed` is false.
- `public_real_data_enabled` is false.
- Storm / Compare / Card are not connected.
- `real_observation` public output is not enabled.

#### EMS-RD-08 next gate

- `raw_pixel_read` → EMS-RD-09-SAMPLE
- `decoder_strategy_required` → EMS-RD-09-DECODER
- `health_manifest_failed` → EMS-RD-09-ROUTE
- `endpoint_error` / `blocked` / `inconclusive` → EMS-RD-09-PROBEFIX
- `network_unverified` → EMS-RD-09-VERIFY

## Guardrails for future implementation

Do not:

- Rename metadata-only output as real precipitation values.
- Merge synthetic preview and real sampled values in one unlabeled chart.
- Hide endpoint failures behind synthetic fallback.
- Add paid/checkout UI.
- Generate JAXA API code for unverified datasets.
- Create SEO pages that imply real daily rankings before real data is verified.

Do:

- Keep `data_type` on every output.
- Keep `source`, `dataset_id`, `license`, `retrieved_at`, and `processing_note` on every real output.
- Keep `synthetic_preview` on fallback or unsupported outputs.
- Keep real-data adapter work isolated until proven.

## Implementation order from here

1. EMS-RD-03B: real COG sampling feasibility.
2. If successful, Storm real precipitation values.
3. Then Compare real precipitation values.
4. Then Card real precipitation values.
5. Then update Report / Export / Codegen / Dataset Picker around real precipitation.
6. Then implement Heat / Aerosol / Sea Ice / Solar / Land Cover / Terrain as real-first or preview-fallback modes.
7. Then implement Time-series.
8. Then Alerts.
9. Then earth-seo Rankings / Place Pages.
10. Then News Check.


### EMS-RD-09 verification result

- workflow visibility result: `unknown` from this environment (GitHub API access blocked by `curl: (56) CONNECT tunnel failed, response 403`).
- health / manifest result: `network_unverified` (workflow dispatch not executed because API visibility/dispatchability was unconfirmed).
- probe result: `network_unverified` (not dispatched; prerequisite `health_manifest_reachable` not met).
- final branch decision: `network_unverified`.

#### EMS-RD-09 safety state (unchanged)

- `precipitation-sample-real` is safe-unavailable.
- `public_ui_allowed` is false.
- `public_real_data_enabled` is false.
- Storm / Compare / Card are not connected.
- `real_observation` public output is not enabled.

#### EMS-RD-09 next gate

- `raw_pixel_read` → EMS-RD-10-SAMPLE
- `decoder_strategy_required` → EMS-RD-10-DECODER
- `health_manifest_failed` → EMS-RD-10-ROUTE
- `endpoint_error` / `blocked` / `inconclusive` → EMS-RD-10-PROBEFIX
- `network_unverified` → EMS-RD-10-VERIFY


### EMS-RD-10 browser self-check gate

- `tools/earth-map-suite/api-status.html` now provides browser self-check controls and copyable JSON output.
- Safe check (`health` / `manifest`) exists for low-risk reachability verification.
- Research probe check exists and remains manual/research-only.
- Public real data remains disabled: `public_real_data_enabled=false`.
- Storm / Compare / Card remain disconnected: `storm_compare_card_connected=false`.
- `precipitation-sample-real` is still not public real output.

### EMS-RD-11 browser result intake gate

- Canonical intake template: `ems-rd-11-browser-self-check-result.template.json`.
- Canonical result file: `ems-rd-11-browser-self-check-result.json`.
- Current branch decision: `browser_result_missing`.

#### EMS-RD-11 next gate mapping

- `browser_result_missing` → EMS-RD-12-VERIFY
- `health_manifest_failed` → EMS-RD-12-ROUTE
- `health_manifest_reachable` → EMS-RD-12-PROBE
- `raw_pixel_read` → EMS-RD-12-SAMPLE
- `decoder_strategy_required` → EMS-RD-12-DECODER
- `endpoint_error` / `blocked` / `inconclusive` → EMS-RD-12-PROBEFIX

### EMS-RD-12 local browser-result validation gate

Current branch: `browser_result_missing`.

Current active gate:

1. run browser self-check
2. paste JSON result
3. validate JSON result
4. select next task family

References:

- `tools/earth-map-suite/EMS_RD_12_BROWSER_RESULT_PASTE_GUIDE.md`
- `tools/earth-map-suite/validate-browser-self-check-result.mjs`
- `tools/earth-map-suite/EMS_RD_12_VALIDATION_COMMANDS.md`

Safety constraints (unchanged):

- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `precipitation-sample-real` is not public real output
- Storm / Compare / Card remain disconnected

Next gate mapping:

- `health_manifest_reachable` → `EMS-RD-12-PROBE`
- `health_manifest_failed` → `EMS-RD-12-ROUTE`
- `raw_pixel_read` → `EMS-RD-12-SAMPLE`
- `decoder_strategy_required` → `EMS-RD-12-DECODER`
- `endpoint_error` / `blocked` / `inconclusive` → `EMS-RD-12-PROBEFIX`
- `browser_result_missing` / `network_unverified` → `EMS-RD-12-VERIFY`


### EMS-RD-13 browser-result validation and branch classification

- actual browser JSON recorded: **No** (placeholder retained; deployed source fetch unavailable in this run).
- validator result: pass (`branch_decision=browser_result_missing`, `next_task_family=VERIFY`).
- branch_decision: `browser_result_missing`.
- next_task_family: `VERIFY`.

EMS-RD-13 safety state remains unchanged:

- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `precipitation-sample-real` is not public real output
- Storm / Compare / Card remain disconnected

EMS-RD next gate mapping:

- `VERIFY` → continue browser result collection
- `ROUTE` → fix health/manifest deployment
- `PROBE` → run research probe and record branch
- `SAMPLE` → validate unit/scale/NoData/geolocation/source/license
- `DECODER` → isolated decoder feasibility
- `PROBEFIX` → fix probe chain

### EMS-RD-15 verification update

- EMS-RD-14 added the `self_check` endpoint.
- Browser result schema now includes `self_check`.
- Local validator now requires `self_check`.
- Current branch_decision: `browser_result_missing`.
- Current next_task_family: `VERIFY`.
- `public_real_data_enabled=false` (unchanged).
- `storm_compare_card_connected=false` (unchanged).
- `precipitation-sample-real` is not public real output (unchanged).
- Storm / Compare / Card remain disconnected (unchanged).

#### EMS-RD-15 next gate mapping

- `VERIFY` → run browser safe check and paste result
- `ROUTE` → fix route/deployment
- `PROBE` → run research probe
- `SAMPLE` → validate sampling gates
- `DECODER` → isolated decoder feasibility
- `PROBEFIX` → repair probe chain

### EMS-RD-16 verification result

- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`
- self_check / health / manifest status: `unknown` (actual deployed copied browser result is not recorded yet)
- actual browser JSON recorded: `no`

Safety state remains unchanged:

- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- `precipitation-sample-real` is not public real output
- Storm / Compare / Card remain disconnected

EMS-RD-16 next gate mapping:

- `VERIFY` → rerun browser safe check and paste JSON
- `ROUTE` → fix API route/deployment
- `PROBE` → run research probe and record branch
- `SAMPLE` → validate sampling gates
- `DECODER` → isolated decoder feasibility
- `PROBEFIX` → repair probe chain
