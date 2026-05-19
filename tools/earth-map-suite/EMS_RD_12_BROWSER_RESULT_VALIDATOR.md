# EMS-RD-12 Browser Result Validator

Last updated: 2026-05-19

Run:

```bash
node tools/earth-map-suite/validate-browser-self-check-result.mjs
```

Required top-level fields:
- branch_decision
- mode (`safe_self_health_manifest` / `research_probe` / `not_run`)
- page_url
- checked_at
- public_real_data_enabled
- storm_compare_card_connected
- endpoints

Required endpoint keys:
- self_check
- health
- manifest
- probe_status
- precipitation_sample_real

Safety hard-fail:
- public_real_data_enabled !== false
- storm_compare_card_connected !== false
- missing branch_decision
- missing endpoints array
- missing required endpoint keys

Output includes:
- branch_decision
- next_task_family
- mode
- required endpoints found/missing
