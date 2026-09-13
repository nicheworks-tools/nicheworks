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

This record is the canonical per-tool contract for the registered `tiny-audio-meter` implementation at `/tools/tiny-audio-meter/`. The active measurement runtime is `app.js`; `comparison.js` adds same-stream comparison/spectrum observation and loads page-local numeric export plus ambient-reference extensions without opening another microphone stream.

## 2. Purpose

Use browser microphone input to inspect relative input level, estimated single-tone pitch/note, pitch confidence, spectrum, short-segment trends, same-device/same-microphone baseline changes, and a temporary two-second ambient relative reference. Numeric snapshots can be summarized/copied or exported as CSV. It is not a calibrated sound level meter, statutory instrument, professional acoustic meter, or guaranteed tuner.

## 3. Inputs

- Browser microphone permission.
- Microphone input stream.
- Audio input device selection when multiple devices are exposed after permission.
- Start / Stop mic.
- Set / Clear comparison baseline.
- Set / Clear two-second ambient relative reference.
- Numeric snapshot.
- Numeric snapshot CSV / summary actions.
- Segment Analysis Start / Stop / copy.
- JP/EN UI language.

## 4. Processing behavior

- On microphone start, request `echoCancellation=false`, `noiseSuppression=false`, `autoGainControl=false`, and mono input where supported.
- Display actual reported EC / NS / AGC track settings and warn when any remain ON.
- Enumerate `audioinput` devices after permission and allow switching when multiple inputs are exposed; device labels/IDs remain page state only.
- Compute RMS from time-domain Web Audio data and show approximately `-60..0 dB` relative input level; this is not dB SPL.
- Run pitch estimation at approximately 100 ms cadence, use normalized autocorrelation over approximately 60–1200 Hz, calculate relative confidence, suppress low-confidence results, and map valid pitch to note names using A4=440 Hz.
- Render frequency-domain data and expose the strongest FFT component between roughly 40 Hz and 12 kHz as a spectrum peak. Spectrum peak is distinct from pitch semantics.
- Keep numeric snapshots to a maximum of 20 in page memory.
- Segment Analysis requires at least one second and summarizes average relative level, average valid pitch/confidence, and rough pitch stability.

### Baseline comparison

- Store current relative level plus valid pitch/note/confidence in page memory.
- Show current-minus-baseline relative level and valid-pitch delta.
- Start/stop/device change clears the baseline.
- Baseline is not dB SPL, is not persisted, and is not sent to analytics.

### Ambient relative reference

- At user request, sample the displayed relative dB value for about two seconds at about 100 ms cadence.
- Use the median of at least ten valid displayed samples as the ambient relative reference.
- Show current relative dB minus ambient-reference relative dB.
- This is not microphone calibration, microphone sensitivity correction, noise-floor SPL, or calibrated dB SPL.
- Start/stop/device change cancels sampling and clears the reference.
- Ambient reference does not modify the core activity threshold, pitch estimation, or spectrum calculation.
- If EC / NS / AGC is reported ON, warn that automatic processing may affect comparison.

### Numeric export

- Export only currently retained snapshot rows as UTF-8 CSV with `time,relative_db,pitch_hz,note,pitch_confidence_percent`.
- Deleted snapshot rows do not reappear in later exports.
- Snapshot summary can locally copy count, relative-dB min/avg/max, valid-pitch count, and average valid pitch.
- Segment result can be locally copied with explicit relative-value / not-dB-SPL wording.
- Audio, device label/ID, baseline state, ambient-reference samples, and affiliate data are excluded from these exports.

## 5. Outputs

- Relative input level and meter bar.
- Estimated Hz/note and relative pitch confidence.
- Spectrum canvas and spectrum peak.
- Sound activity indicator.
- Reported EC / NS / AGC settings and warning.
- Baseline summary and deltas.
- Ambient relative reference and current-minus-reference delta.
- Up to 20 numeric snapshots.
- Snapshot numeric summary and CSV.
- Segment Analysis summary and copy text.

Observed delivery capabilities: clipboard copy **present for numeric summary/segment result**; download/export **present for snapshot CSV**; audio export **not present**.

## 6. Error behavior

- **No microphone API / unavailable AudioContext:** visible unsupported/error state; no fabricated readings.
- **Permission denied / security error:** visible permission error; no fake stream.
- **Device switch failure:** existing microphone-start error handling applies; baseline and ambient reference are cleared around changed acquisition conditions.
- **Low-confidence/no pitch:** Hz/note remains unavailable.
- **Segment under one second:** explicit too-short result.
- **Ambient sampling without enough valid readings:** no reference is fabricated; show a retry message.
- **Safe stop/reset:** stream tracks and animation loop stop; page-local state can be reset without network operations.

## 7. Privacy/data handling

Audio analysis runs in the browser. Audio stream/files are not uploaded to a NicheWorks analysis API. Microphone device label/ID, relative level, pitch, note, confidence, spectrum peak, baseline, ambient reference/samples, snapshot, and segment data are not sent through affiliate analytics and are not persisted as measurement history.

Snapshot CSV/summary and segment copy are generated locally. Only the JP/EN preference may be stored as `nw_lang`. Ads/analytics resources may load separately under the common specification.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- Live controls/readings remain first.
- Baseline/ambient/snapshot/segment tools follow as secondary cards.
- Comparison delta cards collapse for narrow viewports.
- Spectrum stays inside its responsive card/canvas.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN is switched in place.
- Only language preference is persisted.

## 10. SEO contract

Keep a tool-specific title/description, one self-referencing canonical for `https://nicheworks.app/tools/tiny-audio-meter/`, valid `WebApplication` JSON-LD, and evidence-based FAQ/schema copy. Claims must preserve the distinction between relative input level and calibrated dB SPL.

## 11. Advertising contract

### Affiliate contract

- Preserve existing GA4/AdSense identifiers and common-spec placement rules.
- Shared `/assets/amazon-affiliate.js` plus local `affiliate-config.js` form the Amazon insertion contract.
- Production default remains `enabled: false` with empty `sound_level_meter` and `usb_microphone` targets until verified Amazon URLs exist.
- Disabled or invalid config: no Amazon CTA, Associates disclosure, or affiliate click event.
- Valid enabled config may expose contextual Amazon navigation for dedicated sound-level meters or USB microphones.
- `affiliate_click` is limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata.
- Microphone/device/measurement/baseline/ambient/snapshot/segment/export values are forbidden affiliate analytics fields.

## 12. Donation/support contract

Preserve the existing donation/support block. Future Amazon activation remains independent.

## 13. Help/usage/FAQ contract

- Main-page concise explanation: required-and-present.
- Usage documentation: recommended-and-missing; not a hard compliance failure.
- FAQ: optional-present and currently present.
- Measurement limits/privacy notes remain visible after the primary workflow.

## 14. Functional acceptance tests

- [ ] Microphone permission produces relative level, valid pitch/note/confidence, spectrum, and spectrum-peak updates.
- [ ] EC / NS / AGC are requested OFF and reported settings are shown; reported ON state produces a warning.
- [ ] Multiple exposed audio inputs can be selected without persisting device identifiers.
- [ ] Low-confidence pitch is suppressed.
- [ ] Baseline is page-only, explicitly relative, and clears on mic start/stop/device change.
- [ ] Ambient reference uses multiple displayed relative-dB samples and their median, is explicitly non-calibrated, and clears on mic start/stop/device change.
- [ ] Ambient reference does not alter activity/pitch/spectrum core calculations.
- [ ] Snapshots remain capped at 20; current rows can export to local numeric CSV and summary without audio/device/affiliate data.
- [ ] Deleted snapshot rows stay absent from later export.
- [ ] Segment analysis rejects intervals under one second and can be locally copied with relative-value wording.
- [ ] Default Amazon config mounts no CTA/disclosure; enabled+valid uses only coarse click metadata; enabled+invalid remains hidden.

Automated contract evidence: `scripts/check-amazon-ready-tools.mjs` for Amazon activation/helper behavior and source-contract assertions; the existing Tool runtime audit executes that checker. A full real-microphone browser automation suite is not claimed.

## 15. Explicit tool-specific exceptions

- No language exception beyond bilingual single-page mode.
- No additional layout exception.
- Relative level, baseline delta, ambient reference/delta, pitch confidence, and spectrum peak must not be promoted as calibrated measurement accuracy.

### Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/comparison.js`
- `tools/tiny-audio-meter/ambient-reference.js`
- `tools/tiny-audio-meter/records-export.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/comparison.css`
- `tools/tiny-audio-meter/affiliate-config.js`
- `assets/amazon-affiliate.js`
- `common-spec/amazon-affiliate.md`
