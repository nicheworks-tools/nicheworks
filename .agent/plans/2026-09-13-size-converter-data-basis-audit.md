# ExecPlan — Size Converter data-basis audit

## Scope
- `tools/size-converter/` only, plus this ExecPlan.
- External research is limited to official size-guide sources used to evaluate the current representative tables.
- Do not change shared specs, Tiny Audio Meter, deployment, or Amazon configuration.

## Goal
Audit the bundled shoe/clothing conversion rows and measurement charts so the tool clearly distinguishes representative reference data from universal standards, documents what official sources support or contradict, and removes or downgrades any claim that cannot be defended.

## Files to touch
- `tools/size-converter/SPEC.md`
- `tools/size-converter/index.html` if user-facing provenance wording is needed
- `tools/size-converter/data-basis.md` (new audit/source ledger)
- Runtime data only if a concrete unsupported or misleading row is identified.

## Steps
1. Inventory the current shoe, clothing, and measurement datasets.
2. Compare representative rows against multiple current official brand/retailer size guides.
3. Record source URLs, scope, observations, and limitations in a local data-basis ledger.
4. Do not treat any one brand chart as a universal standard.
5. If cross-brand official charts materially disagree, preserve only "representative estimate" positioning and state that explicitly.
6. Keep brand-wide offsets disabled and Amazon disabled.

## Verification
- Existing Size Converter behavior tests remain green.
- Runtime/spec/SEO audits remain green.
- User-facing copy does not imply a universal or standardized US/JP/EU conversion where sources do not support one.
- Source ledger distinguishes evidence from the tool's synthesized representative rows.
- Amazon config remains disabled and empty.
