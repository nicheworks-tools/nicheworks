# EMS-RD-09 Health / Manifest Smoke Run (VERIFY-B)

Checked at: 2026-05-19 (UTC)  
Checked by: Codex CLI agent

## Prerequisite check

- VERIFY-A dispatchable status: `unknown`
- dispatch precondition satisfied: **no**

## Dispatch attempt

- workflow: `EMS RD API smoke check`
- intended inputs:
  - `base_url=https://nicheworks.app`
  - `run_probe=false`
- dispatch executed: **no**

## Blocker (exact)

GitHub API access from this environment failed:

- command: `curl -sS -D /tmp/ems_headers.txt https://api.github.com/repos/nicheworks-tools/nicheworks/actions/workflows`
- error: `curl: (56) CONNECT tunnel failed, response 403`

Because workflow visibility/dispatchability could not be confirmed via API, workflow dispatch was not attempted in this task.

## Classification

- expected classification: `network_unverified`

## Run capture fields

- workflow run URL: `unknown`
- run ID: `unknown`
- conclusion: `unknown`
- health result: `unknown`
- manifest result: `unknown`
- failed job/step: `unknown`
- error message: `unknown`
- artifact availability: `unknown`

## Guardrail confirmation

- probe endpoints were not run.
- endpoint code and UI were not modified.
- Storm / Compare / Card remain disconnected.
