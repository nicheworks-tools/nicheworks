# EMS-RD-05C decoder strategy decision

Date: 2026-05-17 (UTC)

## Scope

This document defines the decoder-path decision for Earth Map Suite if the deployed `probe-status` result returns one of the following phases:

- `decoder_strategy_required`
- `blocked`
- `inconclusive`
- `endpoint_error`

This is a documentation-only decision record. It does not authorize endpoint changes, UI changes, dependency changes, public sampled-value output, or any public claim that NicheWorks has computed real precipitation values.

## Hard constraints

Zero fixed cost is a hard requirement for every option considered here.

The decoder path must not require:

- a paid server,
- a paid queue,
- a paid database,
- paid object storage,
- paid scheduled compute,
- or any other fixed monthly infrastructure cost.

No public Storm / Compare / Card UI may be connected to real precipitation values until validated real sampling exists. Metadata-only displays, source metadata, status fields, and external source links may continue, but they must not imply that NicheWorks computed real sampled precipitation.

## Trigger conditions

Use this document only after a deployed `probe-status` response can be read and classified, or after a probe failure is explicitly classified as one of the listed non-raw branches.

| `probe-status` phase | Decoder-strategy action |
| --- | --- |
| `decoder_strategy_required` | Evaluate decoder feasibility outside the public UI. Do not connect public UI. |
| `blocked` | Inspect and fix the blocking condition first. Do not infer decoder feasibility from partial output. |
| `inconclusive` | Fix the probe endpoint first. Do not choose a decoder path from inconclusive evidence. |
| `endpoint_error` | Fix endpoint or upstream access first. Do not mask the error with synthetic or guessed values. |

## Strategy options

### 1. No-dependency raw parser

A no-dependency parser is allowed only for the narrow raw-pixel case already covered by the pixel-probe scaffold.

Allowed constraints:

- `Compression=1` only.
- `Predictor=1` only.
- `SamplesPerPixel=1` only.
- `BitsPerSample` must be one of the explicitly supported bit depths in the probe implementation.
- Byte order, strip/tile offsets, no-data handling, scale/offset, and sample layout must be validated by the probe before use.

This path is useful only when the asset is directly readable as an uncompressed single-band sample layout. It is not enough for compressed Cloud Optimized GeoTIFF (COG) assets and must not be presented as a general decoder solution.

### 2. Lightweight JavaScript decoder dependency

A lightweight JavaScript decoder may be researched only in an isolated endpoint or local research branch. This task does not add such a dependency.

Feasibility checks must include:

- Cloudflare Pages Functions runtime support, including ESM/CJS compatibility and Web API availability.
- Bundle size impact and whether the dependency would threaten deploy size or cold-start behavior.
- Cold-start and per-request runtime cost under small-window sampling.
- Range request behavior against the upstream asset host.
- Memory behavior when decoding only the needed tile/window.
- Decoder support for the actual compression, predictor, sample format, no-data, scale, and tile/strip layout observed in the source assets.
- Maintenance risk, including package activity, transitive dependencies, security posture, and long-term compatibility with the Cloudflare runtime.

A decoder dependency is not public-UI-ready until it returns validated numeric samples with source URL, date, units, no-data behavior, and visible error states. It must not be installed or wired into production as part of this decision document.

### 3. Server-side preprocessing

Server-side preprocessing is acceptable only if it preserves zero fixed cost.

Allowed only when all of the following remain true:

- No paid server is required.
- No paid queue is required.
- No paid storage is required.
- No always-on service is required.
- Reproducibility and source attribution remain clear.
- Outputs are labeled so users understand whether they are live sampled results or precomputed examples.

A static sample cache may be considered only as a clearly labeled example or research artifact. It must not be described as live user-request sampling, and it must not be used to imply that arbitrary public UI requests are backed by real computed precipitation values.

### 4. Metadata-only fallback

If reliable decoding is not feasible within zero fixed cost, Earth Map Suite should remain metadata-only for public output.

In this fallback:

- The UI may show source reachability, matched items, dates, licenses, attribution, and metadata-only status.
- The UI must not claim real sampled precipitation.
- Numeric maps, charts, cards, differences, summaries, or CSV values must remain clearly synthetic/preview-only unless a later validated sampling task explicitly changes them.
- Failed or unsupported decoding must be visible as status, not hidden behind fake precision.

This is the safest default when decoder feasibility, runtime behavior, or data integrity cannot be proven.

### 5. External reference / source link-out

External source links are allowed as a support path.

Link-out can help users inspect official source datasets, assets, documentation, or download locations. However:

- It must not imply NicheWorks computed real precipitation values.
- It must not be mixed with synthetic preview values in a way that suggests observed output.
- It must preserve source/license/attribution context.
- It should be presented as a reference path, not as a substitute for validated NicheWorks sampling.

## Decision matrix

| Option | Implementation cost | Runtime risk | Zero fixed cost compatibility | Public UI readiness | Data integrity risk | Recommended use |
| --- | --- | --- | --- | --- | --- | --- |
| No-dependency raw parser | Low for the already-scaffolded raw case; high if expanded beyond the narrow TIFF subset. | Low only for validated `Compression=1`, `Predictor=1`, `SamplesPerPixel=1`, supported `BitsPerSample`; otherwise unacceptable. | Strong, because it requires no new service or dependency. | Not ready for broad public UI; ready only after `raw_pixel_read` is confirmed and samples are validated. | Low in the narrow supported case; high if applied to compressed COG or unsupported layouts. | Use only for confirmed raw-pixel assets, then proceed to validated sample prototype. |
| Lightweight JavaScript decoder dependency | Medium to high; requires package evaluation, isolated endpoint work, validation, and maintenance review. | Medium to high; bundle size, cold start, runtime API support, memory, and range decoding may fail on Cloudflare Pages Functions. | Possible only if it runs within Pages Functions free-tier/static deployment assumptions and does not require paid infrastructure. | Not ready; must not connect public UI until isolated feasibility and sample validation pass. | Medium; decoder bugs, unsupported compression, no-data, scale/offset, or tile interpretation errors could create wrong values. | Research only when `decoder_strategy_required` is confirmed; do not add dependency in this task. |
| Server-side preprocessing | Medium for static examples; high for generalized preprocessing workflows. | Low at request time for static artifacts, but operational risk increases if generation becomes a service. | Acceptable only with no paid server, queue, storage, scheduled compute, or fixed monthly cost. | Limited; public UI may show clearly labeled static examples, not arbitrary live sampled results. | Medium; stale, partial, or poorly labeled cache output could be mistaken for live computed values. | Consider only for clearly labeled static sample cache or demos; do not require paid infrastructure. |
| Metadata-only fallback | Low; preserves current product boundary. | Low; avoids decode/runtime failure paths. | Strong; no new fixed-cost infrastructure. | Ready for metadata/status displays only; not ready for real sampled precipitation values. | Low if labels remain explicit; high only if synthetic preview is mislabeled as observed. | Default fallback when validated decoding cannot be proven within zero fixed cost. |
| External reference / source link-out | Low to medium, depending on source metadata quality. | Low for static links; depends on upstream availability. | Strong if implemented as links only. | Ready only as support/reference UI, not as computed-value UI. | Low if labeled as external reference; high if users could confuse links with NicheWorks-computed values. | Use as supporting path alongside metadata-only or validated sampling status. |

## Required final recommendation

### If `raw_pixel_read` is confirmed

Proceed to **EMS-RD-05D validated sample prototype**.

Before public UI connection, the prototype must validate real samples, units, no-data behavior, scale/offset handling, source asset URL, date alignment, bounded request size, and visible error states. Public output must remain disconnected until the prototype proves real sampling integrity.

### If `decoder_strategy_required` is confirmed

Do **not** connect Storm / Compare / Card UI to real precipitation values.

First test decoder feasibility in an isolated research endpoint. The research endpoint must evaluate Cloudflare Pages Functions compatibility, bundle size, cold start, runtime API support, maintenance risk, source compression support, no-data handling, scale/offset handling, and range-window decoding. Dependency installation and production wiring require a later explicitly scoped task.

### If `blocked`, `inconclusive`, or `endpoint_error` is confirmed

Fix probes first.

Do not proceed to decoder selection, sample endpoint work, public UI connection, or public real-value claims until the probe returns reliable evidence. Endpoint errors and inconclusive states must remain visible and must not be hidden behind synthetic values, guessed values, or static sample examples.

## Public UI gate

Public UI connection is blocked until validated real sampling exists.

The minimum gate for public real values is:

- a confirmed valid sampling path (`raw_pixel_read` plus validated sample prototype, or a later approved decoder path),
- numeric sample validation against known source behavior,
- explicit source URL/date/unit/no-data/status output,
- bounded request behavior,
- clear error handling,
- and labels that distinguish real sampled values from synthetic preview values.

Until all of those are satisfied, Earth Map Suite remains metadata-only / preview-only for public precipitation output.
