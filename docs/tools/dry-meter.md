# Dry Meter — canonical tool specification

- **Slug:** `dry-meter`
- **Display name (JA):** 乾燥目安メーター
- **Display name (EN):** Dry Meter
- **Implementation:** `tools/dry-meter/`
- **Registry state:** active (registered implementation present)
- **Category:** dryness, weather, home, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `dry-meter` implementation at `/tools/dry-meter/`. It does not authorize a production rewrite.

## 2. Purpose

Estimate how easy it may be to dry ordinary laundry, thick items, or bedding from current weather or manually entered temperature, humidity, and wind conditions.

## 3. Inputs

- Optional browser geolocation or latitude/longitude.
- Target item and outdoor/indoor method.
- Temperature, humidity, wind, and preset/manual adjustments.
- UI language.

## 4. Processing behavior

- Obtain current weather using browser geolocation or manually entered latitude/longitude and the Open-Meteo service.
- Allow fully manual temperature, humidity, and wind input when weather lookup is not used.
- Support ordinary laundry, thick items, and bedding plus outdoor/indoor drying modes.
- Provide quick condition presets for representative indoor/humid/dry scenarios.
- Calculate a 0–100 Dry Score and classify it into easier/average/harder drying guidance with reasons and score breakdown.
- Include weather factors such as temperature, humidity, wind and, when fetched, precipitation/cloud context in the implemented scoring logic.
- Persist selected settings such as target, drying method, manual weather values, and coordinates in browser localStorage as implemented.

## 5. Outputs

- Dry Score, classification, suggestion, reasons, and score breakdown.
- Weather-source/status information when remote weather is fetched.

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **Network/API failure:** `NEEDS_DECISION` — the network/API failure fallback is not established by repository evidence.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Manual scoring runs in the browser. When current-location or coordinate weather lookup is used, latitude and longitude are sent to Open-Meteo to retrieve weather data. Browser geolocation requires user permission. Advertising/analytics resources may also load independently.

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `api.open-meteo.com`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- The control/result grid benefits from desktop width while controls and result cards can stack for mobile use.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same calculator and weather controls.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/dry-meter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Manual temperature/humidity/wind values produce a Dry Score without requiring geolocation or remote weather lookup.
- [ ] Current-location/coordinate lookup clearly requires/sends coordinates for Open-Meteo weather retrieval and updates the weather-backed result when successful.
- [ ] Target-item and drying-method changes affect the resulting guidance according to the implemented scoring rules.
- [ ] Browser-local settings survive a normal reload where localStorage is available and JP/EN switching preserves the calculator behavior.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/dry-meter/index.html`
- `tools/dry-meter/app.js`
- `tools/dry-meter/style.css`
