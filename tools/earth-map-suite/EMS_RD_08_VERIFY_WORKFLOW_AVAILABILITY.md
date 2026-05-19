# EMS-RD-08 Verify Workflow Availability

Checked at: 2026-05-19 (UTC)  
Checked by: Codex CLI agent

## Verification summary

- workflow file exists: **yes**
- workflow visible in Actions: **unknown**
- manual dispatch possible: **unknown**
- blockers:
  - Local repository includes `.github/workflows/ems-rd-api-smoke.yml`.
  - Workflow name is `EMS RD API smoke check`.
  - Trigger is `workflow_dispatch` only.
  - Inputs `base_url` and `run_probe` are present.
  - No deployment step is defined.
  - No `${{ secrets.* }}` reference is present.
  - GitHub Actions visibility/dispatch could not be verified from this environment because `gh` CLI is not installed and no authenticated GitHub API session is available.

## Notes

This document records only locally verifiable facts plus explicit remote-check blocker(s). No remote Actions result is fabricated.
