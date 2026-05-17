# ExecPlan: EMS-RD-05A deployed probe-status re-check

## Scope

- Target documentation only: `tools/earth-map-suite/EMS_RD_05_DEPLOYED_PROBE_CHECK.md`.
- Supporting plan file: `.agent/plans/ems-rd-05a-deployed-probe-check.md`.
- No public UI, `app.js`, Storm, Compare, Card, dependency, or deployment setting changes.

## Files to touch

- Create or update `tools/earth-map-suite/EMS_RD_05_DEPLOYED_PROBE_CHECK.md`.
- Create this ExecPlan file.

## Steps

1. Inspect existing EMS-RD-04 research notes and endpoint contracts.
2. Run deployed `curl` checks for the three requested Earth Map Suite endpoints if network access is available.
3. Record exact endpoint URLs, HTTP status (if available), relevant JSON fields, failure details if blocked, usability for next implementation, and the branch decision.
4. Verify only the intended documentation/plan files changed.

## Manual verification for user

1. Re-run the listed `curl` commands from a network environment that can reach `https://nicheworks.app`.
2. Confirm public Earth Map Suite UI remains unchanged and real precipitation values are still not enabled.
