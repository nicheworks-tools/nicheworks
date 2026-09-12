# Tool Specification — Light Check

- Slug: `light-check`
- Public URL: `https://nicheworks.app/tools/light-check/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Use live camera frames to compare relative brightness, color cast, contrast/shadow characteristics, and brightness variation before shooting or streaming, without presenting the browser camera as a calibrated light meter.

## Current functional contract

- Request browser camera access only after the user starts the tool and provide an explicit Stop action that releases camera use.
- Analyze camera frames locally and present compact B/C/S/F relative metrics plus explanatory result/how-to sheets.
- Treat B as brightness-related comparison, C as color-cast-related comparison, S as contrast/shadow-related comparison, and F as a simple brightness-variation indicator.
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
- [ ] Camera errors are surfaced with recoverable guidance rather than silently failing.
- [ ] JP/EN and Lite/camera controls preserve the relative-measurement disclaimer and local-analysis behavior.

## Implementation evidence

- `tools/light-check/index.html`
- `tools/light-check/app.js`
- `tools/light-check/style.css`
- `tools/light-check/usage.html`
