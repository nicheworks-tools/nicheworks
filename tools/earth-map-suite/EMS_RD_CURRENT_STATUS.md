# EMS-RD Current Status

## 1) Current phase
- `EMS-RD-16-VERIFY`

## 2) branch_decision / next_task_family
- branch_decision: `browser_result_missing`
- next_task_family: `VERIFY`

## 3) Endpoint status snapshot (if known)
- self_check: `unknown` (actual deployed copied browser result missing)
- health: `unknown` (actual deployed copied browser result missing)
- manifest: `unknown` (actual deployed copied browser result missing)

## 4) Complete
- Real Data First plan established and maintained.
- Probe research pathway and branch model are documented.
- Contracts and safety constraints are documented.
- Browser self-check flow/page exists.
- `self_check` endpoint exists in verification schema/flow.
- Validator now requires `self_check`.

## 5) Not complete
- Actual deployed browser result JSON is still missing.
- Validated `real_observation` output is not approved.
- Storm real connection is not enabled.
- Compare real connection is not enabled.
- Card real connection is not enabled.
- Remaining 15 tools/modes are not in validated real-data state.

## 6) Current blockers
- No pasted deployed browser safe-check JSON from `https://nicheworks.app/tools/earth-map-suite/api-status.html`.
- Without that artifact, route/probe/sample branch cannot advance beyond `VERIFY`.

## 7) Next 3 actions
1. Run deployed browser safe-check and copy JSON output.
2. Paste JSON into `ems-rd-11-browser-self-check-result.json` and re-run validator/classification.
3. Route to EMS-RD-17 family based on updated branch decision.

## 8) Guardrails (must remain)
- `public_real_data_enabled=false`
- `storm_compare_card_connected=false`
- no raw pixel as rainfall
- no synthetic fallback inside real block
- no paid infrastructure

## 9) EMS-RD-17
- Autorun safe URL enabled (?autorun=safe / ?run=safe).
- Copy/download/restore flow available.
- Probes manual only.
- branch_decision browser_result_missing; next_task_family VERIFY unless updated by real artifact.

## EMS-RD-18 Status (2026-05-19)
- autorun safe URL available: yes
- JSON download available: yes
- downloaded result intake exists: yes
- canonical browser result sync exists: yes
- current branch_decision: `browser_result_missing`
- current next_task_family: `VERIFY`
- public_real_data_enabled: false
- storm_compare_card_connected: false
- Storm/Compare/Card: disconnected
- `precipitation-sample-real` remains non-public until full validation.
