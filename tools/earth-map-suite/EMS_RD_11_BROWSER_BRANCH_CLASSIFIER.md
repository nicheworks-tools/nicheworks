# EMS-RD-11 Browser Self-Check Branch Classifier

This document maps `branch_decision` values from `ems-rd-11-browser-self-check-result.json` to exactly one next EMS-RD-12 task family.

Storm real remains blocked while these branches are being processed.

## Branch mapping

1. `browser_result_missing`
   - Next action: run deployed browser self-check.
   - Task family: **EMS-RD-12-VERIFY**.
   - Constraint: do not proceed to sampling.

2. `health_manifest_failed`
   - Next action: fix Pages Functions route/deployment.
   - Task family: **EMS-RD-12-ROUTE**.
   - Constraint: do not run probe chain.

3. `health_manifest_reachable`
   - Next action: run research probe from browser self-check.
   - Task family: **EMS-RD-12-PROBE**.
   - Constraint: do not connect public UI.

4. `raw_pixel_read`
   - Next action: start validated sample validation (unit / scale / NoData / geolocation / source / license).
   - Task family: **EMS-RD-12-SAMPLE**.
   - Constraint: do not connect Storm / Compare / Card.

5. `decoder_strategy_required`
   - Next action: test decoder in isolated endpoint.
   - Task family: **EMS-RD-12-DECODER**.
   - Constraint: do not add decoder to public endpoint yet.

6. `endpoint_error`, `blocked`, `inconclusive`, `probe_checked_without_phase`
   - Next action: fix probe chain first.
   - Task family: **EMS-RD-12-PROBEFIX**.

7. `network_unverified`
   - Next action: continue verification and evidence collection.
   - Task family: **EMS-RD-12-VERIFY**.
   - Constraint: do not infer a different branch without verification evidence.
