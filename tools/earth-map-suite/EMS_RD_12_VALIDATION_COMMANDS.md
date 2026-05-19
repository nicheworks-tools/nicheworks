# EMS-RD-12 Validation Commands (No Dependencies)

Last updated: 2026-05-19

## Commands

```bash
python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.json
python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.template.json
node tools/earth-map-suite/validate-browser-self-check-result.mjs
```

## Expected success output

### 1) `python -m json.tool ...result.json`

- Pretty-printed JSON is shown.
- Exit code is `0`.

### 2) `python -m json.tool ...template.json`

- Pretty-printed JSON is shown.
- Exit code is `0`.

### 3) `node ...validate-browser-self-check-result.mjs`

Expected lines include:

- `Browser self-check result validation passed.`
- `next_task_family: <VERIFY|ROUTE|PROBE|SAMPLE|DECODER|PROBEFIX>`

## Expected failure examples

- invalid JSON
  - `python -m json.tool` fails with parse error.
- `public_real_data_enabled=true`
  - validator fails with unsafe flag error.
- `storm_compare_card_connected=true`
  - validator fails with unsafe flag error.
- missing `branch_decision`
  - validator fails with missing required field error.

## Safety statements

- No dependency install required.
- No endpoint call is made.
- No network access is required.
- No public real data is enabled by these commands.
- Storm real remains blocked.
