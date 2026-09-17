# Tool Specification — Dry Meter

- Slug: `dry-meter`
- Public URL: `https://nicheworks.app/tools/dry-meter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Estimate how easy it may be to dry ordinary laundry, thick items, or bedding from current weather or manually entered temperature, humidity, and wind conditions.

## Affiliate boundary

The canonical monetization class is `AFFILIATE`, but classification alone does not authorize a live commerce block. No Amazon CTA may render until a verified Amazon Special Link/configuration has been supplied for this tool.

Contextually acceptable future product areas are limited to optional laundry-drying support such as a room temperature/humidity meter for users who want measured manual input, air-circulation/drying equipment, or drying-rack accessories. These must be framed as general equipment discovery, not as a consequence of a Dry Score.

The tool MUST NOT claim that it measures humidity, moisture, or indoor conditions; MUST NOT infer from a score that a user needs to buy a dehumidifier/fan/other product; and MUST NOT present outdoor Open-Meteo values as a substitute for an indoor sensor. If no verified affiliate configuration exists, the correct commerce state is no affiliate offer.

## Current functional contract

- Obtain current weather using browser geolocation or manually entered latitude/longitude and the Open-Meteo service.
- Allow fully manual temperature, humidity, and wind input when weather lookup is not used.
- Support ordinary laundry, thick items, and bedding plus outdoor/indoor drying modes.
- Provide quick condition presets for representative indoor/humid/dry scenarios.
- Calculate a 0–100 Dry Score and classify it into easier/average/harder drying guidance with reasons and score breakdown.
- Include weather factors such as temperature, humidity, wind and, when fetched, precipitation/cloud context in the implemented scoring logic.
- Persist selected settings such as target, drying method, manual weather values, and coordinates in browser localStorage as implemented.

## Inputs

- Optional browser geolocation or latitude/longitude.
- Target item and outdoor/indoor method.
- Temperature, humidity, wind, and preset/manual adjustments.
- UI language.

## Outputs

- Dry Score, classification, suggestion, reasons, and score breakdown.
- Weather-source/status information when remote weather is fetched.

## State and persistence

The implementation stores selected Dry Meter settings in browser `localStorage`; this state does not synchronize to other browsers/devices and can be removed with browser data.

## Privacy and network behavior

Manual scoring runs in the browser. When current-location or coordinate weather lookup is used, latitude and longitude are sent to Open-Meteo to retrieve weather data. Browser geolocation requires user permission. Advertising/analytics resources may also load independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the same calculator and weather controls.

## Layout class

`hybrid`

The control/result grid benefits from desktop width while controls and result cards can stack for mobile use.

## Limits and non-goals

- Dry Score is a heuristic guide, not a guarantee that laundry will dry.
- Sunlight, material, thickness, spacing, cover, time of day, and retrieval timing can materially change real results.
- The tool is not a weather forecast service and should not be used as a safety-critical outdoor decision system.
- Location lookup is optional; the tool remains usable with manual inputs.

## Acceptance criteria

- [ ] Manual temperature/humidity/wind values produce a Dry Score without requiring geolocation or remote weather lookup.
- [ ] Current-location/coordinate lookup clearly requires/sends coordinates for Open-Meteo weather retrieval and updates the weather-backed result when successful.
- [ ] Target-item and drying-method changes affect the resulting guidance according to the implemented scoring rules.
- [ ] Browser-local settings survive a normal reload where localStorage is available and JP/EN switching preserves the calculator behavior.
- [ ] No Amazon affiliate CTA renders unless a verified tool-specific affiliate configuration exists.
- [ ] Any future affiliate placement remains non-diagnostic and does not claim that Dry Score determines a product need.

## Implementation evidence

- `tools/dry-meter/index.html`
- `tools/dry-meter/app.js`
- `tools/dry-meter/style.css`
