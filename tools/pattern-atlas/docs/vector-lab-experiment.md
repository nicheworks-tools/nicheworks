# Pattern Atlas Vector Lab experiment

Status: active experiment, not the production renderer.

## Purpose

Test whether the existing Pattern Dictionary PNG references can be converted into compact, editable, seamless SVG pattern assets suitable for Pattern Atlas distribution.

## v1 result

The first experiment traced the entire 1536×1536 reference PNG with ImageTracerJS. Visual similarity was acceptable, but the output was structurally unsuitable as a reusable pattern asset. For example, Asanoha / Balanced produced thousands of repeated paths and an SVG over 1 MB because the same motif was vectorized repeatedly across the full reference image.

Conclusion: whole-image tracing is a comparison baseline only, not the target production architecture.

## v2 hypothesis

The intended pipeline is:

1. Load the existing Pattern Dictionary reference PNG locally.
2. Detect the horizontal and vertical repeat period from pixel similarity.
3. Crop one repeat tile candidate.
4. Allow manual X / Y / width / height correction when automatic detection is wrong.
5. Vectorize only that tile.
6. Compare two tracing engines on the exact same tile.
7. Reconstruct repetition with SVG `<pattern>` instead of duplicating every motif as paths.
8. Allow basic fill-color editing and export both the tile SVG and repeatable Pattern SVG.

## Test samples

- Asanoha
- Seigaiha
- Shippo

The PNG files under `assets/vector-lab/` reuse the exact existing Git blobs from `tools/pattern-dictionary/assets/reference/`.

## Engines

### ImageTracerJS

Pinned browser build:

`jankovicsandras/imagetracerjs@cb0c84a309df5e75614d3b5166cdc77a56f12a98` / ImageTracerJS 1.2.6.

Used as the lightweight JavaScript baseline.

### VTracer WASM

Browser experiment uses `vtracer-webapp@0.4.0` from jsDelivr and loads its WebAssembly module only when VTracer is requested.

This is an experiment surface. It is not yet a production dependency for Pattern Atlas.

## Metrics

Each generated result reports:

- SVG byte size
- SVG path count
- path command count
- detected fill-color count
- conversion time
- tile area as a percentage of the source image

The repeat preview must also be visually inspected for boundary seams.

## Evaluation gate

Do not roll automatic raster-to-vector conversion across the Pattern Atlas catalog until at least two of the three test patterns are acceptable on all of the following:

- close visual match to the reference PNG
- clean enlarged contours
- no obvious repeat seam
- materially smaller SVG than whole-image tracing
- path structure small enough for practical editing
- stable color replacement
- acceptable browser conversion time

A rough preferred target for simple geometric patterns is under 100 KB and under a few hundred paths per tile. This is a heuristic, not a hard contract for every pattern family.

## Production boundary

Vector Lab remains `noindex,nofollow`. It does not replace the current Pattern Atlas renderers, catalog, detail editor, or existing export contract. A production migration requires a separate decision after this experiment.
