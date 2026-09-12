# ExecPlan: Size Converter fit-quality wave

## Goal
Improve measurement-based fit estimates without fabricating brand-specific precision, while preserving the Amazon-ready quick-result insertion point.

## Scope
- `tools/size-converter/index.html`
- `tools/size-converter/app.js`
- `tools/size-converter/style.css`
- `tools/size-converter/SPEC.md`
- this plan

## Changes
1. Add concise inline measurement guidance for foot length/width and clothing measurements.
2. Detect shoe measurements outside the supported JP reference range and return an explicit out-of-range state instead of clamping to the nearest endpoint.
3. Detect clothing measurements outside the supported chart envelope and return an explicit out-of-range state instead of presenting the largest/smallest size as a match.
4. Improve shoe boundary messaging using distance from the nearest 0.5 cm reference row.
5. Explain foot-width tendency as a rough ratio-based context signal, not a formal width-size standard.
6. Show which clothing measurements drove the estimate and whether the result sits near a chart boundary.
7. Add local copy actions for shoe/clothing fit results.
8. Keep brand-wide numeric corrections disabled and keep Amazon config/helper unchanged.

## Verification
- endpoint overflow produces out-of-range rather than a false nearest-size result;
- optional fields remain optional;
- cm/inch clothing input still works;
- copy actions stay local;
- Amazon remains disabled/hidden;
- existing runtime/spec/SEO audits pass.
