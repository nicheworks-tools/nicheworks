# ExecPlan: Amazon-ready contract hardening

## Goal
Synchronize the canonical tool documentation with the completed Size Converter and Tiny Audio Meter upgrades, and add a deterministic regression check for the disabled-by-default Amazon activation contract.

## Scope
- `docs/tools/size-converter.md`
- `docs/tools/tiny-audio-meter.md`
- `scripts/check-amazon-ready-tools.mjs`
- `.github/workflows/tool-runtime-contract-audit.yml`
- this plan

## Changes
1. Replace stale Size Converter canonical references to `app-complete.js`, optional brand corrections, and table-first behavior with the current direct-input and conservative fit contract.
2. Update Tiny Audio Meter canonical documentation for measurement-oriented constraints, device switching, confidence, baseline comparison, spectrum peak, and Amazon readiness.
3. Add a Node/VM behavior check for `/assets/amazon-affiliate.js` covering:
   - OFF => no CTA / no disclosure;
   - ON + missing/invalid URL => no CTA / no disclosure;
   - ON + valid Amazon HTTPS URL => CTA + disclosure;
   - click => exactly one `affiliate_click` event using only coarse `tool`, `affiliate`, `target`, `placement` parameters.
4. Assert both local tool configs remain disabled/empty until official URLs are available.
5. Assert Size Converter and Tiny Audio Meter retain their Amazon insertion wiring and do not pass measurement/microphone values into affiliate analytics.
6. Run the new checker from the existing Tool runtime contract audit workflow; do not create another workflow.

## Verification
- run `node scripts/check-amazon-ready-tools.mjs`;
- existing runtime/spec/SEO checks remain green;
- no live Amazon URL or Associate tag is introduced;
- no Manual Finder files are touched.
