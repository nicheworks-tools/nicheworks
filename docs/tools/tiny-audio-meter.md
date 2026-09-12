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

This record is the canonical per-tool contract for the registered `tiny-audio-meter` implementation at `/tools/tiny-audio-meter/`. The active measurement runtime is `app.js`; `comparison.js` adds same-stream baseline comparison and spectrum-peak observation without opening a second microphone stream.

## 2. Purpose

Use browser microphone input to inspect relative input level, estimated single-tone pitch/note, pitch confidence, spectrum, short-segment trends, and same-device/same-microphone changes from a temporary baseline. It is not a calibrated sound level meter, statutory instrument, professional acoustic meter, or guaranteed tuner.

## 3. Inputs

- Browser microphone permission.
- Microphone input stream.
- Audio input device selection when multiple devices are exposed after permission.
- Start / Stop mic.
- Set / Clear comparison baseline.
- Numeric snapshot.
- Segment Analysis Start / Stop.
- JP/EN UI language.

## 4. Processing behavior

- On microphone start, request `echoCancellation=false`, `noiseSuppression=false`, `autoGainControl=false`, and mono input where supported.
- Display the actual reported EC / NS / AGC track settings because browsers/OS/hardware may ignore requested constraints.
- Warn when any reported EC / NS / AGC setting remains ON because comparisons may be affected by device-side processing.
- Enumerate `audioinput` devices after permission and allow switching when multiple inputs are exposed.
- Device labels/IDs are page state only and are not persisted or sent to affiliate analytics.
- Compute RMS from time-domain Web Audio data and show approximately `-60..0 dB` relative input level. This is not dB SPL.
- Run pitch estimation at approximately 100 ms cadence rather than every animation frame.
- Search normalized autocorrelation over approximately 60–1200 Hz and calculate relative pitch confidence.
- Suppress low-confidence pitch estimates from the displayed Hz/note result.
- Convert valid pitch to note name using A4=440 Hz.
- Render frequency-domain data to the spectrum canvas.
- Observe the same analyser frequency data to expose the strongest FFT component between roughly 40 Hz and 12 kHz as a `spectrum peak`; this is not guaranteed to equal the fundamental/pitch.
- Use a simple RMS threshold for sound-activity display.
- Keep numeric snapshots to a maximum of 20 in page memory.
- Segment Analysis requires at least one second and summarizes average relative level, average valid pitch/confidence, and rough pitch stability.

### Baseline comparison

- Capturing a baseline stores the current relative level and, only when valid, current pitch/note/confidence in page memory.
- While baseline exists, show current minus baseline relative-level change.
- Show pitch delta only when both baseline and current pitch are valid.
- Relative-level delta is explicitly a same-device/same-microphone relative comparison, not calibrated dB SPL difference.
- Microphone start, stop, or input-device change clears the baseline to avoid comparing different acquisition conditions.
- Baseline is not stored in localStorage and is not sent to analytics.

## 5. Outputs

- Relative input level and meter bar.
- Estimated Hz and note name.
- Relative pitch confidence.
- Spectrum canvas with scale labels.
- Spectrum peak frequency from the current FFT data.
- Sound-activity indicator.
- Reported EC / NS / AGC settings and processing warning when applicable.
- Baseline summary, relative-level delta, and valid-pitch delta.
- Up to 20 numeric snapshots.
- Segment Analysis summary.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **No microphone API / unavailable AudioContext:** visible local unsupported/error state; no fabricated readings.
- **Permission denied / security error:** visible permission error; no fallback fake stream.
- **Device switch failure:** existing microphone start error handling applies; baseline is cleared before the changed acquisition condition is used.
- **Low-confidence/no pitch:** Hz/note remains unavailable rather than showing a weak estimate as valid pitch.
- **Segment under one second:** explicit too-short result.
- **Safe stop/reset:** stream tracks and animation loop are stopped; page-local records can be reset without network operations.

## 7. Privacy/data handling

Audio analysis runs in the browser. Audio stream/files are not uploaded to a NicheWorks analysis API. Microphone device label/ID, relative level, pitch, note, confidence, spectrum peak, baseline, snapshot, and segment data are not sent through affiliate analytics and are not persisted as measurement history.

Only the JP/EN preference may be stored as `nw_lang`. Ads/analytics resources may load separately under the common specification.

## 8. Responsive contract

- **Layout class:** `mobile-oriented`.
- Live meter controls and readings remain the first interaction block.
- Baseline/snapshot/segment comparison tools follow as secondary cards.
- Comparison delta cards collapse for narrow viewports.
- Spectrum stays inside its responsive canvas/card rather than forcing page overflow.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN is switched in place and the existing bilingual mode must not be removed.
- Only language preference is persisted.

## 10. SEO contract

The main public page must keep a tool-specific title/description, exactly one self-referencing canonical for `https://nicheworks.app/tools/tiny-audio-meter/`, valid `WebApplication` JSON-LD, and evidence-based FAQ/schema copy. Claims must preserve the distinction between relative input level and calibrated dB SPL.

## 11. Advertising / affiliate contract

- Preserve existing GA4 and AdSense identifiers/code and common-spec placement rules.
- The shared `/assets/amazon-affiliate.js` helper and local `affiliate-config.js` form the Amazon insertion contract.
- Production default remains `enabled: false` with empty `sound_level_meter` and `usb_microphone` targets until verified Amazon URLs exist.
- Disabled or invalid configuration must show no Amazon CTA, no Associates disclosure, and emit no affiliate click event.
- Valid enabled configuration may expose contextual Amazon navigation after the meter/analysis area for dedicated sound-level meters or USB microphones.
- `affiliate_click` is limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata.
- Microphone/device/measurement/baseline/snapshot/segment values are forbidden affiliate analytics fields.

## 12. Donation/support contract

Preserve the existing donation/support block under common-spec rules. Future Amazon activation is an independent monetization path and does not implicitly remove support links.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** required-and-present.
- **Usage documentation:** recommended-and-missing; not a hard compliance failure.
- **FAQ:** optional-present and currently present.
- Measurement limits and privacy notes remain visible after the primary tool workflow.

## 14. Functional acceptance tests

- [ ] Microphone permission produces relative level, valid pitch/note/confidence, and spectrum updates.
- [ ] EC / NS / AGC are requested OFF and reported settings are shown.
- [ ] Any reported EC / NS / AGC ON state produces a processing warning.
- [ ] Multiple exposed audio inputs can be selected without persisting the device identifier.
- [ ] Low-confidence pitch is suppressed.
- [ ] Spectrum peak derives from the existing analyser frequency data and is distinct from pitch semantics.
- [ ] Baseline capture stores only page-memory numeric state.
- [ ] Baseline relative-level delta is explicitly relative, not dB SPL.
- [ ] Pitch delta is shown only when baseline/current pitch are both valid.
- [ ] Mic start/stop/device change clears baseline.
- [ ] Snapshots remain capped at 20 and segment analysis rejects intervals under one second.
- [ ] Default Amazon config mounts no CTA/disclosure.
- [ ] Enabled+valid Amazon config mounts contextual Amazon navigation using only coarse click metadata.
- [ ] Enabled+missing/invalid target remains hidden.

Automated contract evidence: `scripts/check-amazon-ready-tools.mjs` for Amazon activation/helper behavior and source-contract assertions; the existing Tool runtime audit also executes that checker. A full real-microphone browser automation suite is not claimed.

## 15. Explicit tool-specific exceptions

- No language exception beyond bilingual single-page mode.
- No additional layout exception.
- Relative level, baseline delta, pitch confidence, and spectrum peak must not be promoted as calibrated measurement accuracy.

### Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/comparison.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/comparison.css`
- `tools/tiny-audio-meter/affiliate-config.js`
- `assets/amazon-affiliate.js`
- `common-spec/amazon-affiliate.md`
