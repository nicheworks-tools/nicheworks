# Tool Specification — Light Check

- Slug: `light-check`
- Public URL: `https://nicheworks.app/tools/light-check/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Use live camera frames to compare relative brightness, color cast, contrast/shadow characteristics, and brightness variation before shooting or streaming, without presenting the browser camera as a calibrated light meter.

## Affiliate boundary

The canonical monetization class is `AFFILIATE`. The live commerce block uses the validated NicheWorks Amazon Japan tagged-search template with tracking ID `nicheworks09-22` and fixed shooting/streaming equipment queries only. Camera frames and B/C/S/F values never enter an Amazon URL.

Contextually acceptable future product areas are shooting/streaming lighting equipment such as LED/video lights, ring lights, light stands, or diffusion accessories. The placement must be framed as general equipment discovery for shooting/streaming, not as a calibrated recommendation derived from B/C/S/F values.

The tool MUST NOT use B/C/S/F values to claim a specific light is required, infer lux/color-temperature/flicker performance, or imply that a purchase will correct a measured professional lighting defect. If no verified affiliate configuration exists, the correct commerce state is no affiliate offer.

## Current functional contract

- Request browser camera access only after the user starts the tool and provide an explicit Stop action that releases camera use.
- Analyze camera frames locally and present compact B/C/S/F relative metrics plus explanatory result/how-to sheets.
- Treat B as brightness-related comparison, C as color-cast-related comparison, S as contrast/shadow-related comparison, and F as a simple brightness-variation indicator.
- Keep a crawlable static lighting-comparison guide in the initial HTML that explains how to compare conditions and what B/C/S/F represent while preserving the non-calibrated measurement boundary.
- Provide camera flip where supported and a Lite mode for reduced processing/load as implemented.
- Show camera-permission/startup error guidance for common mobile/browser cases.
- Provide JP/EN UI and explicit warnings that the metrics are relative camera-derived indicators.

## Inputs

- Live camera permission/video frames.
- Start, Stop, camera-flip, Lite-mode, and result/how-to controls.
- JP/EN UI selection.

## Outputs

- Relative B/C/S/F metrics and supporting status/details.
- Camera/startup error guidance and comparison-oriented interpretation.

## State and persistence

Camera frames and metrics are transient current-session state. The current contract does not store camera recordings, captured frames, or measurement history.

## Privacy and network behavior

Frame analysis runs in the browser and the tool does not intentionally upload camera video. Advertising and analytics resources may load separately. Users are warned not to place faces, confidential material, or personal information in view unnecessarily.

## Language mode

`bilingual single-page`

JP/EN controls switch the same camera-analysis workflow and limitations.

## Layout class

`mobile-oriented`

The camera preview, compact metrics, bottom controls, and sheets are explicitly designed for phone use while still working on desktop cameras.

## Limits and non-goals

- The tool is not a lux meter, color-temperature meter, calibrated photometer, or flicker meter.
- F is a camera-derived brightness-variation indicator affected by FPS, automatic exposure, shutter behavior, and PWM lighting; it is not direct flicker measurement.
- It is not suitable as the sole instrument for professional lighting inspection, building compliance, workplace safety, or calibrated production measurement.

## Acceptance criteria

- [ ] Camera analysis starts only after permission/user action and Stop ends active camera use.
- [ ] Active video analysis produces the implemented relative B/C/S/F indicators without claiming lux or calibrated flicker values.
- [ ] Initial HTML exposes a visible JP/EN guide for camera-lighting comparison and B/C/S/F meanings without presenting those indicators as calibrated measurements.
- [ ] Camera errors are surfaced with recoverable guidance rather than silently failing.
- [ ] JP/EN and Lite/camera controls preserve the relative-measurement disclaimer and local-analysis behavior.
- [ ] The active Amazon block uses only fixed general shooting/streaming equipment queries and the shared `nicheworks09-22` tagged-search template.
- [ ] Affiliate placement remains a general equipment path and is not presented as a calibrated recommendation from B/C/S/F.

## Implementation evidence

- `tools/light-check/index.html`
- `tools/light-check/app.js`
- `tools/light-check/style.css`
- `tools/light-check/affiliate-config.js`
- `tools/light-check/usage.html`
