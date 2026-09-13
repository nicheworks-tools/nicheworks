# Tiny Audio Meter — canonical tool specification

- **Slug:** `tiny-audio-meter`
- **Display name (JA):** 簡易オーディオメーター
- **Display name (EN):** Tiny Audio Meter
- **Implementation:** `tools/tiny-audio-meter/`
- **Registry state:** active (registered implementation present)
- **Category:** audio, meter, sound, browser
- **Common specification:** `common-spec/spec-ja.md`
- **Affiliate specification:** `common-spec/amazon-affiliate.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for `/tools/tiny-audio-meter/`. `app.js` owns the microphone stream and core Web Audio analysis. `comparison.js` observes the same analyser, provides baseline/spectrum context, and loads page-local `records-export.js`, `ambient-reference.js`, and `measurement-conditions.js`. These extensions must not open a second microphone stream.

## 2. Purpose

Use browser microphone input to inspect relative input level, estimated single-tone pitch/note, pitch confidence, spectrum, short-segment trends, same-device/same-microphone changes, a temporary two-second ambient relative reference, and the acquisition conditions needed to interpret before/after comparisons. Numeric snapshots can be summarized/copied or exported as CSV. It is not a calibrated sound-level meter, statutory instrument, professional acoustic meter, or guaranteed tuner.

## 3. Inputs

- Browser microphone permission and active microphone stream.
- Audio input device selection when exposed after permission.
- Start / Stop mic.
- Set / Clear comparison baseline.
- Set / Clear two-second ambient relative reference.
- Numeric snapshot and snapshot CSV/summary actions.
- Segment Analysis Start / Stop / copy.
- Measurement-conditions copy action.
- JP/EN UI language.

## 4. Processing behavior

- Request `echoCancellation=false`, `noiseSuppression=false`, `autoGainControl=false`, and mono input where supported.
- Display actual reported EC / NS / AGC track settings; warn when any remain ON.
- Enumerate `audioinput` devices after permission and allow switching when multiple inputs are exposed. Device label/ID is page state only.
- Compute RMS and display approximately `-60..0 dB` relative microphone input. This is not dB SPL.
- Run pitch estimation at approximately 100 ms cadence using normalized autocorrelation over approximately 60–1200 Hz, calculate relative confidence, suppress low-confidence results, and map valid pitch with A4=440 Hz.
- Render frequency-domain data and expose the strongest FFT component between roughly 40 Hz and 12 kHz as spectrum peak; this is distinct from pitch semantics.
- The comparison analyser hook also publishes the same analyser's `sampleRate` and `fftSize` to page-local UI via `nw-tiny-audio-spectrum`; it does not create another analyser or stream.
- Keep numeric snapshots to at most 20 in page memory.
- Segment Analysis requires at least one second and summarizes average relative level, average valid pitch/confidence, and rough pitch stability.

### Baseline comparison

- Store current relative level plus valid pitch/note/confidence in page memory.
- Show current-minus-baseline relative level and valid-pitch delta.
- Start/stop/device change clears the baseline.
- Baseline is not dB SPL, is not persisted, and is not sent to analytics.

### Ambient relative reference

- At user request, sample displayed relative dB for about two seconds at about 100 ms cadence.
- Use the median of at least ten valid samples as the ambient relative reference.
- Show current relative dB minus ambient-reference relative dB.
- This is not microphone calibration, sensitivity correction, noise-floor SPL, or calibrated dB SPL.
- Start/stop/device change cancels sampling and clears the reference.
- Ambient reference does not modify activity threshold, pitch estimation, or spectrum calculation.
- If EC / NS / AGC is reported ON, warn that automatic processing may affect comparison.

### Numeric export

- Export only currently retained snapshot rows as UTF-8 CSV with `time,relative_db,pitch_hz,note,pitch_confidence_percent`.
- Deleted rows do not reappear in later exports.
- Snapshot summary locally copies count, relative-dB min/avg/max, valid-pitch count, and average valid pitch.
- Segment result can be locally copied with explicit relative-value / not-dB-SPL wording.
- Audio, device label/ID, baseline, ambient samples, and affiliate data are excluded from numeric exports.

### Measurement conditions

- Show the currently selected input-device label, current analyser sample rate, FFT size, and displayed EC / NS / AGC states while the microphone is active.
- Device label is used only for local on-page display and an explicit local clipboard copy. It is not persisted and is not sent to analytics or affiliate links.
- Sample rate and FFT size come from the same analyser used by the meter; no second stream/acquisition path is opened.
- The copied report includes an explicit statement that meter values are relative browser microphone-input measurements, not calibrated dB SPL.
- Start/stop/device change clears cached sample-rate/FFT condition state until the active analyser publishes new values.

## 5. Outputs

- Relative input level and meter bar.
- Estimated Hz/note and relative pitch confidence.
- Spectrum canvas and spectrum peak.
- Sound activity indicator.
- Reported EC / NS / AGC settings and warning.
- Baseline summary/deltas and ambient reference/delta.
- Up to 20 numeric snapshots, numeric summary, CSV, and Segment Analysis copy text.
- Measurement-conditions card: active device label, sample rate, FFT size, EC / NS / AGC, and local copy action.

Observed delivery capabilities: clipboard copy **present** for numeric summaries/segment/conditions; download/export **present** for snapshot CSV; audio export **not present**.

## 6. Error behavior

- **No microphone API / unavailable AudioContext:** visible unsupported/error state; no fabricated readings.
- **Permission denied / security error:** visible permission error; no fake stream.
- **Device switch failure:** core microphone-start error handling applies; comparison/reference state is cleared around acquisition changes.
- **Low-confidence/no pitch:** Hz/note remains unavailable.
- **Segment under one second:** explicit too-short result.
- **Ambient sampling without enough valid readings:** no reference is fabricated; show retry guidance.
- **Conditions before active analyser data:** sample rate/FFT display remains unavailable rather than fabricating defaults.
- **Clipboard failure:** condition/numeric copy stays local and reports failure where implemented.
- **Safe stop/reset:** stream tracks and animation loop stop; page-local state can be reset without network operations.

## 7. Privacy/data handling

Audio analysis runs in the browser; audio stream/files are not uploaded to a NicheWorks analysis API. Device label/ID, relative level, pitch, note, confidence, spectrum peak, baseline, ambient reference/samples, snapshots, segment data, sample rate, FFT size, and copied condition report are not sent through affiliate analytics and are not persisted as measurement history.

Device label may appear in the explicit local measurement-conditions copy because that copy is a user-invoked browser clipboard operation. It remains forbidden from GA4/affiliate payloads. Only the JP/EN preference may be stored as `nw_lang`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- Live controls/readings remain first.
- Baseline/ambient/snapshot/segment/measurement-condition tools follow as secondary cards.
- Condition grid and comparison cards collapse to one column on narrow viewports.
- Spectrum stays within its responsive card/canvas.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN switches in place.
- Dynamic condition labels/copy follow the current document language.
- Only language preference is persisted.

## 10. SEO contract

Keep a tool-specific title/description, one self-referencing canonical for `https://nicheworks.app/tools/tiny-audio-meter/`, valid `WebApplication` JSON-LD, and evidence-based FAQ/schema copy. Claims must preserve the distinction between relative input level and calibrated dB SPL; acquisition-condition display must not be described as calibration.

## 11. Advertising contract

### Affiliate contract

- Preserve existing GA4/AdSense identifiers and common-spec placement rules.
- Shared `/assets/amazon-affiliate.js` plus local `affiliate-config.js` form the Amazon insertion contract.
- Production default remains `enabled: false` with empty `sound_level_meter` and `usb_microphone` targets until verified Amazon URLs exist.
- Disabled or invalid config: no Amazon CTA, Associates disclosure, or affiliate click event.
- Valid enabled config may expose contextual Amazon navigation for dedicated sound-level meters or USB microphones.
- `affiliate_click` stays limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata.
- Device label/ID, EC/NS/AGC, sample rate, FFT size, microphone readings, baseline/ambient/snapshot/segment/export/conditions values are forbidden affiliate analytics fields.

## 12. Donation/support contract

Preserve the existing donation/support block. Future Amazon activation remains independent.

## 13. Help/usage/FAQ contract

- Main-page concise explanation: required-and-present.
- Usage documentation: recommended-and-missing; not a hard compliance failure.
- FAQ: optional-present and currently present.
- Measurement limits/privacy notes remain visible after the primary workflow.
- Conditions UI must explain why acquisition settings matter without implying laboratory-grade reproducibility.

## 14. Functional acceptance tests

- [ ] Microphone permission produces relative level, valid pitch/note/confidence, spectrum, and spectrum-peak updates.
- [ ] EC / NS / AGC are requested OFF and reported states are shown; reported ON produces a warning.
- [ ] Multiple exposed audio inputs can be selected without persisting identifiers.
- [ ] Low-confidence pitch is suppressed.
- [ ] Baseline is page-only, relative, and clears on mic start/stop/device change.
- [ ] Ambient reference uses multiple displayed relative-dB samples/median, is non-calibrated, and clears on acquisition changes.
- [ ] Ambient reference does not alter activity/pitch/spectrum core calculations.
- [ ] Snapshots remain capped at 20 and current rows export only local numeric CSV/summary without audio/device/affiliate data.
- [ ] Segment under one second is rejected and valid result can be copied with relative-value wording.
- [ ] Measurement conditions show active device label, analyser sample rate/FFT size, and EC / NS / AGC from existing acquisition state.
- [ ] Measurement-condition copy opens no new microphone stream, persists nothing, and sends no analytics.
- [ ] Default Amazon config mounts no CTA/disclosure; enabled+valid uses only coarse click metadata; enabled+invalid remains hidden.

Automated contract evidence: `scripts/check-amazon-ready-tools.mjs`, `scripts/check-size-audio-growth-wave.mjs`, and `scripts/check-size-audio-growth-wave3.mjs`, all executed by the existing Tool runtime audit. A full real-microphone browser automation suite is not claimed.

## 15. Explicit tool-specific exceptions

- No language exception beyond bilingual single-page mode.
- No additional layout exception.
- Relative level, baseline delta, ambient reference/delta, pitch confidence, spectrum peak, and acquisition-condition display must not be promoted as calibrated measurement accuracy.
- Device label is allowed only in explicit local display/copy, never in analytics/affiliate payloads.

### Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/comparison.js`
- `tools/tiny-audio-meter/ambient-reference.js`
- `tools/tiny-audio-meter/records-export.js`
- `tools/tiny-audio-meter/measurement-conditions.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/comparison.css`
- `tools/tiny-audio-meter/affiliate-config.js`
- `assets/amazon-affiliate.js`
- `common-spec/amazon-affiliate.md`
