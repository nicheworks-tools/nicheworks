# EMS-RD-04H Source / Dataset / License Display Contract

Last updated: 2026-05-17 (UTC)

## Purpose

This document defines the mandatory source, dataset, license, attribution, and retrieval metadata display rules for every future Earth Map Suite real observation output before any real observation output is connected to public UI, export, report, or code generation flows.

The contract prevents public real output from appearing without visible source, dataset, and license context. It also prevents candidate or unverified datasets from generating real JAXA/EORC API code or being presented as confirmed real observations.

## Scope

This is a documentation-only contract for future Earth Map Suite real-data integrations.

In scope:

- Required metadata fields for all future real observation outputs.
- UI placement rules for source, dataset, license, attribution, retrieval, and processing notes.
- CSV metadata requirements.
- PNG, PDF, and generated report attribution requirements.
- Code generation guardrails for verified enabled datasets versus candidate or unverified datasets.

Out of scope:

- UI connection or public real-output wiring.
- Endpoint implementation or endpoint sampling changes.
- Dataset verification, decoder strategy, sampling strategy, or API probing.
- Payment, checkout, metering, billing, or entitlement changes.
- Changes to synthetic preview behavior except the labeling guardrails in this document.

## Non-negotiable rules

- Public real observation output is blocked unless `source`, `dataset_id`, and `license_status` are visible to the user near the output or export control where the real data is consumed.
- Real observation output must never hide license uncertainty. If license status is unknown, pending, limited, conditional, or otherwise uncertain, that uncertainty must be displayed explicitly.
- Synthetic preview output must never show JAXA, EORC, or any real observation provider as its `source`.
- Candidate, research-only, metadata-only, probe-only, or unverified datasets must not output real JAXA API code, real EORC API code, or any code that implies verified production access to a real observation dataset.
- A future integration that cannot satisfy this contract must remain unavailable, metadata-only, research-only, or synthetic-preview-only.

## 1. Required real data fields

Every future public real observation result, export row, report block, copied payload, or generated integration artifact that contains real observation output must carry the following fields.

| Field | Required rule |
| --- | --- |
| `source` | Required. Human-readable provider and product/source name. Must not be blank. |
| `dataset_id` | Required. Stable dataset identifier for the actual dataset used. Must not be a generic provider name alone. |
| `band` | Required. The observed band or variable used for the output, such as `PRECIP`. |
| `license_status` | Required. Must state confirmed, pending, uncertain, restricted, prohibited, research-only, or equivalent status. Must not be omitted because the status is inconvenient or unresolved. |
| `attribution` | Required. Human-readable attribution text suitable for UI, export, and report display. Must name the required source/provider credit when real data is used. |
| `retrieved_at` | Required. ISO 8601 UTC timestamp indicating when the real source data, metadata, or sampled asset was retrieved. |
| `processing_note` | Required. Human-readable note covering transformations, limitations, validation status, NoData handling, aggregation, or uncertainty relevant to the output. |
| `data_type` | Required. Discriminator such as `real_observation`, `unavailable`, `metadata_only`, `research_probe`, or `synthetic_preview`. Consumers must branch on this before rendering source-sensitive output. |

### Field validity requirements

- `source`, `dataset_id`, `band`, `license_status`, `attribution`, `retrieved_at`, `processing_note`, and `data_type` must be present before a public UI block may label output as real.
- `retrieved_at` must use an ISO 8601 UTC timestamp, for example `2026-05-17T00:00:00Z`.
- `license_status` must preserve uncertainty. Acceptable uncertain statuses include explicit values such as `unverified`, `pending_review`, `research_only`, `restricted`, `conditional`, or `unknown_license`; blank, hidden, or generic `ok` values are not acceptable.
- `attribution` must be visible wherever a user could reasonably copy, export, screenshot, download, or rely on the real result.
- `processing_note` must not be replaced by generic marketing copy. It must describe the relevant data handling or limitation.

## 2. UI display rules

Future UI integrations must display source, dataset, license, attribution, retrieval, and processing metadata in predictable locations.

### Per-result source and dataset display

- Show `source` and `dataset_id` near every real result block.
- A real result block includes any map layer, card, table, chart, comparison panel, storm summary, export preview, report preview, or copied result that contains real observation values or real observation availability status.
- The display must be close enough that a screenshot or copied block cannot reasonably separate the real result from its source and dataset identity.
- Provider-only labels are insufficient. The UI must identify both the human-readable `source` and the stable `dataset_id`.

### License display near output actions

- Show `license_status` near every export, copy, download, share, print, report, code generation, or equivalent output control that acts on real data.
- If the license is uncertain, restricted, conditional, pending, or research-only, the UI must display that status in plain language before the user completes the output action.
- The UI must not hide, collapse, or obscure license uncertainty behind a success icon, tooltip-only note, or generic “data available” label.

### Retrieval and diagnostic display

- Show `retrieved_at` in a detail, debug, status, provenance, or diagnostics area associated with the real result.
- Show `processing_note` in the same detail/status area or in an adjacent limitations/provenance section.
- If a result is unavailable, metadata-only, or research-only, the status area must make that state explicit and must not imply validated public real observation output.

### Synthetic preview source rule

- Never show JAXA, EORC, or another real observation provider as `source` for synthetic preview output.
- Synthetic preview output must use `data_type: "synthetic_preview"` or an equivalent explicit synthetic discriminator.
- Synthetic preview labels must make clear that the output is not observed data and is not sourced from JAXA/EORC.
- Synthetic preview may sit near a real-data unavailable message only if the two blocks are visually and semantically separated.

### Blocking condition

A public real result block must not render as real if any of these are missing or hidden:

- `data_type`
- `source`
- `dataset_id`
- `license_status`
- `attribution`
- `retrieved_at`
- `processing_note`

The UI may instead render an unavailable, metadata-only, research-only, or synthetic-preview state, provided the state is explicitly labeled and does not impersonate real observation output.

## 3. CSV rules

CSV exports that include real observation values, real observation statuses, or real observation-derived summaries must include provenance metadata in either metadata rows at the top of the file or repeated metadata columns in the data table.

### Required CSV metadata fields

The first rows or metadata columns must include:

- `data_type`
- `source`
- `dataset_id`
- `band`
- `license_status`
- `retrieved_at`
- `processing_note`

### CSV placement rules

- If metadata rows are used, they must appear before observation rows and must be machine-readable enough for downstream parsing.
- If metadata columns are used, each row containing real observation output must include the required metadata columns.
- CSV output must not strip or omit `license_status` when a user selects a compact export format.
- CSV output must not replace an uncertain license with a blank cell, a success marker, or a generic `ok` value.
- CSV output containing only synthetic preview data must use a synthetic `data_type` and must not name JAXA/EORC as the source.

## 4. PNG / PDF / report rules

Any generated PNG, PDF, printable view, report, or equivalent human-readable artifact that includes real observation output must include visible provenance and safety context.

### Required visible content

Each PNG, PDF, printable view, report, or equivalent artifact must include:

- Visible `data_type`.
- Dataset and source attribution, including `dataset_id`, `source`, and human-readable `attribution`.
- Visible `license_status`, especially when the status is uncertain, restricted, conditional, pending, or research-only.
- Visible `retrieved_at` timestamp.
- The disclaimer: `not for emergency decision-making`.
- A visible `processing_note` or limitations note when transformations, validation limits, NoData handling, aggregation, or uncertainty affect the output.

### Artifact rules

- The attribution and disclaimer must be visible in the artifact itself, not only in adjacent web UI.
- The disclaimer must remain visible after export, screenshot, print, or download.
- If a report combines real observation and synthetic preview sections, each section must have its own visible `data_type` and source context.
- A report must not imply that synthetic preview content came from JAXA/EORC or another real observation provider.
- An artifact must not be generated as a public real-data artifact if required provenance or license fields are missing.

## 5. Code generation rules

Future code generation features must distinguish verified enabled datasets from candidate, unverified, research-only, metadata-only, and synthetic-preview datasets.

### Verified enabled datasets only

- Generate real endpoint code only for datasets that are verified and explicitly enabled for real output.
- Verification must cover dataset identity, access method, required band, unit/interpretation, NoData handling, attribution, license status, and intended output use.
- Generated real endpoint code must preserve `source`, `dataset_id`, `band`, `license_status`, `attribution`, `retrieved_at`, `processing_note`, and `data_type` in response handling or output metadata.
- Generated code must not downgrade license uncertainty or omit required display fields.

### Candidate and unverified dataset restrictions

- Candidate or unverified datasets must not output real JAXA API code.
- Candidate or unverified datasets must not output real EORC API code.
- Candidate or unverified datasets must not generate code that appears ready for production real observation sampling, public display, export, or report generation.
- Candidate, research-only, probe-only, or metadata-only code may be generated only if it is clearly labeled as non-public, non-sampled, or not validated for real output.
- Example placeholders, pseudocode, or research snippets must not include live provider endpoint wiring that a user could mistake for verified real-data integration.

## 6. Implementation gate for future work

Before any future public real observation UI connection, export connection, report connection, or code generation release, the implementation must demonstrate that:

1. All required real data fields are present in the relevant response or data model.
2. Source and dataset are visible near every real result block.
3. License status is visible near export, copy, download, report, and code generation controls.
4. Retrieval time and processing notes are available in the detail, debug, status, provenance, or diagnostic area.
5. CSV exports include the required metadata rows or metadata columns.
6. PNG, PDF, printable, and report artifacts include visible data type, attribution, license status, retrieval timestamp, processing note where relevant, and the `not for emergency decision-making` disclaimer.
7. Synthetic preview output is clearly labeled and never attributes itself to JAXA/EORC.
8. Candidate or unverified datasets do not emit real JAXA/EORC endpoint code.

If any item is not satisfied, the feature must remain disconnected from public real output.
