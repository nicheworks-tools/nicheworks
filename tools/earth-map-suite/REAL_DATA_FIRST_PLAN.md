# Earth Map Suite Real Data First Plan

Last updated: 2026-05-15

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
| EMS-RD-01 | Real Data Adapter investigation / connection method | Partially done |
| EMS-RD-02 | precipitation dataset registry | Partially done |
| EMS-RD-03 | Cloudflare Pages Function for real data retrieval | metadata-only done; real raster sampling not done |
| EMS-RD-04 | connect Storm to real precipitation | metadata-only done; real values not done |
| EMS-RD-05 | connect Compare to real precipitation | metadata-only done; real values not done |
| EMS-RD-06 | connect Card to real precipitation | metadata-only done; real values not done |

## Next required work

The next work is not another support page.

The next work is:

```text
EMS-RD-03B: Research real precipitation sampling from GSMaP COG
```

Goal:

- Move beyond metadata-only.
- Determine if a small Cloudflare Pages Function can read a tiny COG window or sample point/area values.
- Keep this isolated from public Storm / Compare / Card UI until proven.

Acceptance for EMS-RD-03B:

- A research endpoint or script attempts a real sample for a tiny bbox / one date.
- It reports whether sampling succeeded or why it failed.
- It does not silently fabricate values.
- It returns clear `data_type`:
  - `real_observation_sample` if sampled
  - `range_probe_only` if only asset access was checked
  - `unavailable` if failed
- It documents unit / NoData / scale handling status.
- Public UI remains unchanged until sampling is proven.

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
