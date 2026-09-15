# Pattern Atlas Vector Lab — 3-pattern experiment

## Goal

Test whether existing Pattern Dictionary PNG references can be converted into editable SVG assets at a quality level that could support Pattern Atlas asset distribution.

This experiment intentionally does not replace the current programmatic Pattern Atlas renderers.

## Samples

The experiment copies the exact repository blobs used by `tools/pattern-dictionary/assets/reference/` for:

- `asanoha.png`
- `seigaiha.png`
- `shippo.png`

The copied files live under `tools/pattern-atlas/assets/vector-lab/` so Pattern Atlas remains self-contained.

## Vector engine

First-pass engine: ImageTracerJS 1.2.6, pinned to upstream commit `cb0c84a309df5e75614d3b5166cdc77a56f12a98`.

The library is loaded only by `vector-lab.html`; the normal Pattern Atlas pages do not depend on it.

Why first: it is a browser-native JavaScript tracer and allows a low-risk test before adding a WASM build such as VTracer.

If the results are promising, the next comparison should run the same three source images through VTracer/WASM with equivalent geometric/balanced/detail presets.

## Test presets

- `geometric`: favors stronger simplification and right-angle preservation.
- `balanced`: general-purpose baseline.
- `detail`: retains more small paths and colors.

## Success criteria

A result is not considered successful merely because an SVG is produced. Review:

1. visual similarity to the source PNG;
2. edge and curve quality at high zoom;
3. path count;
4. SVG byte size;
5. visible seams when repeated;
6. usefulness of extracted fill colors for simple editing;
7. whether the output can be cleaned into a reusable tile rather than a full-image trace.

## Non-goals for this PR

- automatic repeat-unit detection;
- anchor-point editing;
- production catalog replacement;
- claiming the traced result is a historically authoritative reconstruction;
- tracing arbitrary user uploads.

## Next gate

Do not roll this across the Pattern Atlas catalog until at least two of the three samples pass visual quality and editing checks. If ImageTracerJS is insufficient, retain the test harness and swap/add a VTracer/WASM engine for direct A/B comparison.
