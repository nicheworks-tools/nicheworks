# ExecPlan: EMS-RD-06A〜06H

## Scope
- `functions/api/earth-map-suite/*` (new files only: `health.js`, `manifest.js`)
- `tools/earth-map-suite/*` (new docs/pages + update `REAL_DATA_FIRST_PLAN.md`)
- Repository configuration audit inputs: root config files, route config files, workflows, docs

## Files to touch
- `functions/api/earth-map-suite/health.js` (new)
- `functions/api/earth-map-suite/manifest.js` (new)
- `tools/earth-map-suite/EMS_RD_06_DEPLOYMENT_ROUTE_AUDIT.md` (new)
- `tools/earth-map-suite/api-status.html` (new)
- `tools/earth-map-suite/EMS_RD_06_MANUAL_ENDPOINT_VERIFICATION.md` (new)
- `tools/earth-map-suite/ems-rd-06-verification-result.template.json` (new)
- `tools/earth-map-suite/REAL_DATA_FIRST_PLAN.md` (update)
- `tools/earth-map-suite/EMS_RD_06_STORM_REAL_BLOCKED.md` (new)

## Steps
1. Inspect deployment/function routing related repository config and Earth Map Suite endpoint files.
2. Implement `health.js` and `manifest.js` without external fetch.
3. Add research-only static status page with manual links and safe auto-check behavior.
4. Add deployment audit + manual verification + blocked marker docs and verification JSON template.
5. Update `REAL_DATA_FIRST_PLAN.md` current state/gate markers for EMS-RD-06.
6. Run syntax/JSON validation checks and git diff review.

## Manual verification for user
- Open `tools/earth-map-suite/api-status.html` from deployed site and manually hit health/manifest/probe links.
- Follow `tools/earth-map-suite/EMS_RD_06_MANUAL_ENDPOINT_VERIFICATION.md` runbook and record outcomes using template JSON.
