# EMS-RD-05H: Storm real connection precheck checklist

Last updated: 2026-05-18 (UTC)

## Purpose

This checklist is the final gate that must be satisfied before any real precipitation endpoint is connected to public Storm, Compare, or Card output in Earth Map Suite.

The default state is **blocked**. Real precipitation output must stay disconnected until every required item below is complete, reviewed, and documented.

This document is documentation only. It does not change endpoints, UI, dependencies, or deployment behavior.

## Alignment

This gate follows the Earth Map Suite **Real Data First** direction and the EMS-RD-04 contracts:

- Real output must not be fabricated from metadata, raw pixels, guessed units, or synthetic previews.
- Synthetic preview must remain explicitly labeled and must not hide endpoint failures.
- Public real output must expose data type, source, dataset, license/status, attribution, retrieval time, and processing notes.
- Storm / Compare / Card must remain metadata-only or preview-only until validated real sampling is proven.

## Required decision before connection

Before connecting any public real precipitation UI, the implementation owner must record a single decision:

```text
Storm real connection: APPROVED / BLOCKED
```

The decision may be **APPROVED** only when all checklist sections are satisfied. If any item is incomplete, uncertain, pending, or unverifiable, the decision is **BLOCKED**.

## 1. Endpoint readiness

Storm real connection is blocked until the real sample endpoint is proven safe and explicit.

Required checks:

- [ ] `precipitation-sample-real` exists in the intended runtime environment.
- [ ] The endpoint returns `data_type=real_observation` only after validation of sampled precipitation values, source metadata, units, scale/offset, NoData handling, and provenance.
- [ ] The endpoint returns `data_type=unavailable`, an explicit unavailable status, or an explicit error state when validation fails.
- [ ] The endpoint never returns synthetic values as a fallback for a failed, unavailable, malformed, or unvalidated real request.
- [ ] The endpoint does not relabel metadata-only, range-probe-only, decoder-test-only, or raw-pixel-only output as observed precipitation.
- [ ] Endpoint errors, upstream access failures, decoder failures, malformed payloads, range failures, CORS failures, and unknown units remain visible as failures or blocked states.

Blocking rule:

> If `precipitation-sample-real` cannot return validated `data_type=real_observation` without synthetic fallback, Storm real connection is blocked.

## 2. Data interpretation readiness

Storm real connection is blocked until raw source data can be interpreted as precipitation safely and repeatably.

Required checks:

- [ ] Unit is verified from the source dataset documentation or trusted source metadata.
- [ ] Scale is verified and applied correctly, including whether the stored value is already physical precipitation or requires multiplication.
- [ ] Offset is verified and applied correctly, including confirming whether no offset exists.
- [ ] NoData value or mask behavior is verified and excluded from rainfall calculations.
- [ ] Sample geolocation is verified, including coordinate order, projection assumptions, pixel/window alignment, and date/time alignment.
- [ ] Sample window aggregation is verified, including point sampling versus bbox/window sampling, aggregation method, bounds, and treatment of partial/NoData pixels.
- [ ] Raw pixel values are not displayed or exported as rainfall unless unit, scale, offset, NoData, and geolocation checks have all passed.
- [ ] Validation evidence is retained in notes, endpoint diagnostics, tests, or reviewed documentation.

Blocking rule:

> If unit, scale, offset, NoData, geolocation, or window aggregation is pending or uncertain, Storm real connection is blocked.

## 3. Provenance readiness

Storm real connection is blocked until every real result can carry visible provenance.

Required fields for every real observation response and every public real result block:

- [ ] `source` is present and visible.
- [ ] `dataset_id` is present and visible.
- [ ] `band` is present and visible where the source has banded data or a selected measurement channel.
- [ ] `license_status` is present and visible.
- [ ] `attribution` is present and visible.
- [ ] `retrieved_at` is present and visible.
- [ ] `processing_note` is present and visible.
- [ ] Missing or uncertain provenance prevents real output rendering and produces an unavailable, blocked, research-only, metadata-only, or preview-only state instead.

Blocking rule:

> If any required provenance field is missing, hidden, blank, generic, or uncertain, public real observation output is blocked.

## 4. UI readiness

Storm real connection is blocked until the UI prevents confusion between observed precipitation, unavailable real data, and synthetic preview.

Required checks:

- [ ] The `real_observation` block is visually and semantically separated from any `synthetic_preview` block.
- [ ] The unavailable state is shown clearly when the endpoint returns unavailable, blocked, pending, error, or validation-failed status.
- [ ] Raw pixel values are not shown as rainfall.
- [ ] The UI does not imply emergency, disaster-response, evacuation, life-safety, or operational weather decision suitability.
- [ ] The UI shows source and license information near the result, not only in a remote footer or separate page.
- [ ] Synthetic preview labels remain visible when a real request fails or is unavailable.
- [ ] Real failure states are not hidden behind charts, cards, maps, differences, or summaries generated from synthetic preview.
- [ ] The visible safety context includes a clear non-emergency-use warning such as `not for emergency decision-making` wherever real precipitation values are presented.

Blocking rule:

> If users could confuse preview, raw, unavailable, metadata-only, or research-only output with observed precipitation, Storm real connection is blocked.

## 5. Export readiness

Storm real connection is blocked until exports preserve data type, provenance, licensing, retrieval time, and unavailable states.

Required checks:

- [ ] CSV exports include `data_type` for every row or in machine-readable metadata rows.
- [ ] CSV exports preserve required provenance fields for real output, including source, dataset, band where relevant, license status, retrieved time, and processing note.
- [ ] PNG, PDF, printable report, and generated report outputs include visible source, license status, and `retrieved_at` when real output is included.
- [ ] PNG, PDF, printable report, and generated report outputs include visible processing notes or limitations when transformations, aggregation, validation limits, NoData handling, or uncertainty affect the output.
- [ ] Filenames include `real` for validated real observation output and `preview` for synthetic preview output.
- [ ] Export filenames never imply real observation when the export contains only synthetic preview, unavailable, metadata-only, research-only, or probe-only data.
- [ ] Exports do not hide unavailable status, endpoint failure, validation failure, license uncertainty, or missing provenance.
- [ ] Exports preserve the non-emergency-use disclaimer when real precipitation output appears.

Blocking rule:

> If export artifacts can omit data type, provenance, license, retrieved time, processing note, unavailable status, or safety context, public real export/report connection is blocked.

## 6. Integration order

Real precipitation integration must proceed in this order only:

1. **Storm real first**
2. **Compare real second**
3. **Card real third**
4. **Report / Export / Codegen after the three core modes**

Order rules:

- [ ] Storm must be the first public mode connected to validated real precipitation.
- [ ] Compare must not connect to real precipitation until Storm real is validated, reviewed, and stable.
- [ ] Card must not connect to real precipitation until Compare real is validated, reviewed, and stable.
- [ ] Report, Export, and Codegen must not be connected to public real precipitation until Storm, Compare, and Card have all passed their real-readiness gates.
- [ ] Dataset picker or support pages may describe status only if they do not imply that real sampled precipitation is available before the ordered gates pass.

Blocking rule:

> Any attempt to connect Compare, Card, Report, Export, or Codegen before the earlier ordered gates pass is blocked.

## 7. Blockers

Any of the following conditions blocks Storm real connection and also blocks downstream Compare, Card, Report, Export, and Codegen real connection:

- [ ] `decoder_strategy_required` is returned or recorded and no validated decoder strategy is implemented.
- [ ] Unit handling is pending, unclear, undocumented, or unverified.
- [ ] Scale handling is pending, unclear, undocumented, or unverified.
- [ ] Offset handling is pending, unclear, undocumented, or unverified.
- [ ] NoData handling is pending, unclear, undocumented, or unverified.
- [ ] `license_status` is unclear, blank, generic, disputed, or not visible near output and exports.
- [ ] The endpoint is unstable, intermittently malformed, or returns inconsistent `data_type` or provenance fields.
- [ ] Network, CORS, HTTP range request, upstream availability, timeout, or runtime failures are unresolved.
- [ ] Real failures are hidden behind synthetic preview or generic success states.
- [ ] Any public UI, export, or report would show raw pixel values as rainfall.
- [ ] Any public UI, export, or report could imply emergency-use suitability.

## Final gate checklist

Use this summary immediately before any implementation task connects Storm to real precipitation:

- [ ] Endpoint readiness complete.
- [ ] Data interpretation readiness complete.
- [ ] Provenance readiness complete.
- [ ] UI readiness complete.
- [ ] Export readiness complete.
- [ ] Integration order accepted: Storm → Compare → Card → Report / Export / Codegen.
- [ ] No blockers remain.
- [ ] Decision recorded as `Storm real connection: APPROVED`.

If any item remains unchecked, the only permitted decision is:

```text
Storm real connection: BLOCKED
```

Until the approved decision is recorded, Earth Map Suite must continue to present precipitation-related public output as metadata-only, unavailable, research-only, or explicitly labeled synthetic preview, not as connected real precipitation.
