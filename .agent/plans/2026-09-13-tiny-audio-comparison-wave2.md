# ExecPlan: Tiny Audio Meter comparison wave

## Goal
Turn Tiny Audio Meter from a live display into a useful same-device comparison tool while preserving local-only processing and the disabled Amazon insertion points.

## Scope
- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/SPEC.md`
- this plan

## Changes
1. Add a baseline capture/reset workflow for current relative level and valid pitch.
2. Display current-minus-baseline deltas for relative level and pitch without implying calibrated dB SPL accuracy.
3. Clear the baseline automatically when the input microphone changes or the microphone stream restarts.
4. Show a warning when reported echo cancellation, noise suppression, or automatic gain control remains ON.
5. Add peak-frequency readout from the current spectrum data.
6. Add simple frequency-axis labels to the spectrum canvas.
7. Keep pitch confidence visible and avoid comparing pitch when no valid baseline/current pitch exists.
8. Keep snapshots, segment analysis, privacy rules, and Amazon-ready helper/config unchanged.

## Verification
- baseline capture uses page-memory numeric state only;
- device changes clear baseline;
- relative level delta is labeled as relative, not dB SPL;
- pitch delta appears only with valid pitch values;
- Amazon config remains disabled and no microphone-derived values enter affiliate analytics;
- existing runtime/spec/SEO audits pass.
