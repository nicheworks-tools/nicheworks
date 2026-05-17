# EMS-RD-04C probe-status branch decision

Last updated: 2026-05-17 (UTC)

## Purpose

This document is the source-of-truth decision table for what happens after the EMS-RD-04 probe-status endpoint returns its branch decision.

The probe-status result is a research gate only. It does not, by itself, make Earth Map Suite a real precipitation product and does not enable any public real-data UI.

## Non-negotiable guardrails

- Do not change public Storm / Compare / Card UI from metadata-only to real sampled precipitation until validated sampling exists.
- Storm / Compare / Card remain **metadata-only** for real-data status until validated raster sampling exists.
- Synthetic previews may remain visible only as clearly labeled previews; they must not be described as observed precipitation, real rainfall, or validated sample values.
- Synthetic fallback must **not** hide real-data failures. Endpoint errors, upstream access failures, decoder failures, invalid payloads, and unknown units must remain visible as failures or blocked states.
- Do not fabricate precipitation values, units, scale factors, NoData behavior, or validation status.
- Do not add dependencies, checkout/payment flows, or public UI changes as part of branch follow-up unless a separate task explicitly approves them.

## Branch outcomes and required next steps

| probe-status branch | Next step | Public UI status | Required constraints |
| --- | --- | --- | --- |
| `raw_pixel_read` | Proceed to **EMS-RD-04D real sample endpoint skeleton**. | Still not public UI. Storm / Compare / Card remain metadata-only. | Unit, scale, and NoData behavior are still unverified. Requires validation before any real precipitation claim. |
| `decoder_strategy_required` | Start **decoder strategy research**. | Still not public UI. Storm / Compare / Card remain metadata-only. | Compare decoder approaches and preserve zero fixed cost condition. |
| `blocked` | Inspect payload and determine why the branch cannot proceed. | Do not proceed to real UI. | Do not fabricate values. Keep the blocked state visible in research notes or endpoint output. |
| `inconclusive` | Fix the probe endpoint first. | Do not proceed to sample endpoint or real UI. | Treat the result as not enough evidence for sampling work. |
| `endpoint_error` | Fix endpoint behavior or upstream access first. | Do not proceed to sample endpoint or real UI. | Treat endpoint/upstream access failure as a blocker, not as a fallback-to-synthetic success. |

## Branch detail

### 1. `raw_pixel_read`

A `raw_pixel_read` branch means the probe reached a raw pixel read path strongly enough to justify building the next internal skeleton.

Required next step:

```text
EMS-RD-04D real sample endpoint skeleton
```

Required interpretation:

- This is still **not** a public UI decision.
- Storm / Compare / Card remain metadata-only until validated sampling exists.
- The sample endpoint skeleton may expose internal/research sample fields only after a separate implementation task.
- Unit, scale, and NoData behavior remain unverified at this point.
- Validation is required before any real precipitation claim, chart, card, map, CSV value, or A/B difference is presented as observed precipitation.

The `raw_pixel_read` branch is therefore permission to build an internal endpoint skeleton, not permission to claim real precipitation values.

### 2. `decoder_strategy_required`

A `decoder_strategy_required` branch means the probe could not safely produce validated sample values through the current path, and the next work is decoder strategy research.

Required next step:

```text
decoder strategy research
```

The research must compare these approaches:

| Approach | Current decision posture | Notes |
| --- | --- | --- |
| No dependency raw parser | Blocked | Do not proceed if the raw COG/TIFF structure cannot be safely parsed without format mistakes, scale mistakes, or NoData mistakes. |
| Lightweight decoder dependency | Candidate for research | Must be evaluated for bundle/server fit, maintenance risk, licensing, cold-start/runtime behavior, and whether it preserves zero fixed cost. |
| Server-side preprocessing | Candidate for research | Must preserve zero fixed cost condition and avoid creating standing infrastructure, scheduled jobs, storage bills, or paid processing requirements. |
| Metadata-only fallback | Safe fallback | Keeps the current metadata-only product posture. Must not claim sampled precipitation and must not hide real-data failures. |

Required constraints:

- Preserve the zero fixed cost condition.
- Do not add a decoder dependency until a separate task explicitly approves the dependency choice.
- Do not connect unvalidated decoder output to public Storm / Compare / Card UI.
- Do not replace decoder failure with synthetic values that look like successful real samples.

### 3. `blocked`

A `blocked` branch means the probe returned enough information to know that progress is blocked, but not enough to safely proceed.

Required next step:

```text
Inspect payload
```

Required constraints:

- Do not proceed to real UI.
- Do not proceed to real precipitation claims.
- Do not fabricate values from partial metadata, byte offsets, image dimensions, guessed scale, guessed units, or synthetic preview data.
- Record the blocking payload fields and decide whether the next task is endpoint repair, upstream access repair, decoder research, or metadata-only continuation.

### 4. `inconclusive`

An `inconclusive` branch means the probe did not produce a reliable enough result to choose a sample path or decoder path.

Required next step:

```text
Fix probe endpoint first
```

Required constraints:

- Do not proceed to the sample endpoint.
- Do not proceed to public real UI.
- Do not treat missing, unreachable, malformed, or insufficient probe output as evidence that raw sampling works.
- Re-run probe-status after the probe endpoint is fixed and only then re-enter this decision table.

### 5. `endpoint_error`

An `endpoint_error` branch means the endpoint itself or upstream access failed.

Required next step:

```text
Fix endpoint or upstream access
```

Required constraints:

- Do not proceed to the sample endpoint.
- Do not proceed to public real UI.
- Do not hide the failure behind synthetic fallback.
- Keep endpoint/upstream failure visible so operators and users do not mistake synthetic preview output for validated real precipitation output.

## Public product state after any branch

Until a validated sampling path exists, the public product state remains:

```text
Earth Map Suite v0.1 metadata-only MVP
```

Storm / Compare / Card may display real metadata reachability, source/license/dataset fields, matched dates, item counts, asset counts, and metadata-only status. Their maps, charts, cards, CSV numeric values, summaries, and differences remain synthetic previews unless a later validated sampling task explicitly changes that status.

No branch in this document authorizes checkout/payment, dependency installation, public UI conversion, hidden fallback, or fabricated observed precipitation values.
