# EMS-RD-12 Validation Commands (No Dependencies)

Last updated: 2026-05-20

## Commands

```bash
python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.json
python -m json.tool tools/earth-map-suite/ems-rd-11-browser-self-check-result.template.json
python -m json.tool tools/earth-map-suite/ems-rd-21-safe-result.json
node tools/earth-map-suite/validate-browser-self-check-result.mjs
```

## Safety statements

- No dependency install required.
- Validator is local-only and no endpoint call is made.
- `api_safe_bundle` mode is accepted for `/api/earth-map-suite/safe-result` intake.
- Public real data remains disabled.
- Storm real remains blocked.
