# ExecPlan — Tiny Audio Meter quality and Amazon readiness

## Scope

Only:

- `.agent/plans/2026-09-13-tiny-audio-meter-amazon-ready.md`
- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/affiliate-config.js`
- `tools/tiny-audio-meter/SPEC.md`

Reuse the shared `/assets/amazon-affiliate.js` foundation already merged in PR #600. Manual Finder and unrelated tools are out of scope.

## Goal

Improve Tiny Audio Meter as a browser measurement utility without pretending it is a calibrated sound level meter. Make the main measurement workflow faster and clearer, reduce browser audio processing that distorts measurement, keep useful snapshot/segment features, and make Amazon recommendations activatable later without blocking this tool work.

## Changes

1. Move the primary microphone controls and live measurement cards above long-form warnings.
2. Request measurement-oriented microphone constraints (`echoCancellation`, `noiseSuppression`, `autoGainControl` false) and show the actual processing state reported by the selected audio track where available.
3. Enumerate audio inputs after permission and allow switching between available microphones without persisting or transmitting device labels.
4. Keep relative loudness, pitch/note, spectrum, snapshots, and segment analysis.
5. Throttle the expensive pitch calculation rather than running autocorrelation every animation frame.
6. Bound autocorrelation to the useful 60–1200 Hz lag range and expose an algorithmic pitch-confidence indicator. Low-confidence pitch is suppressed.
7. Add coarse spectrum frequency labels for readability.
8. Keep detailed privacy/accuracy limitations available below the main meter instead of forcing them before the tool.
9. Add disabled `affiliate-config.js` targets for `sound_level_meter` and `usb_microphone`.
10. Mount Amazon CTAs only through the shared helper and only when enabled with valid targets.
11. Never send microphone device labels, loudness, pitch, note, confidence, spectrum, snapshots, segment results, or audio-derived state to affiliate analytics.
12. Update `SPEC.md` to match the new runtime contract.

## Verification

- Starting the mic requests browser-local audio with processing constraints disabled where supported.
- Stopping the mic ends all stream tracks and animation work.
- Device selector appears only when usable input devices are available and a device change safely restarts the stream.
- Relative loudness updates continuously but is still explicitly labeled as not dB SPL.
- Pitch analysis runs at a throttled cadence, reports a relative confidence value, and suppresses low-confidence estimates.
- Snapshot count remains capped at 20 and stores numeric results only, never audio.
- Segment analysis rejects intervals under one second and summarizes longer intervals locally.
- With default affiliate config, Amazon CTAs and disclosure remain hidden.
- With valid enabled targets, CTA labels explicitly identify Amazon and only coarse target/placement metadata is tracked.
- Existing GA4, AdSense, canonical, JSON-LD, bilingual behavior, donation, related links, and footer remain available.

## Non-goals

- No calibrated dB SPL measurement.
- No recording, audio upload, cloud storage, or long-term history.
- No live Amazon URL, price, rating, availability, or product image is committed.
- No external library or framework is introduced.
