# Tool Specification — JSON2Mermaid Lite

- Slug: `json2mermaid`
- Public URL: `https://nicheworks.app/tools/json2mermaid/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Convert JSON structure into Mermaid `flowchart` source code locally so users can inspect, copy, and save a diagram definition for use in Mermaid-compatible tools.

## Current functional contract

- Accept pasted JSON and built-in simple-tree, nested-object, and array-object presets.
- Support top-down (`TD`) and left-to-right (`LR`) directions.
- Support separate or inline leaf values and expanded or summarized array handling.
- Enforce the implemented safety/size limits: approximately 300 KB input, maximum depth 12, and up to 50 expanded array items.
- Parse JSON and emit Mermaid flowchart source with node/edge/depth/omission statistics plus warning/error states.
- Copy generated Mermaid source and download it as `.mmd` or `.txt`.
- Link to Mermaid Live Editor only as an external preview option; the current tool does not render the Mermaid diagram itself.

## Inputs

- JSON text or built-in preset.
- Direction, leaf-value mode, and array mode.
- JP/EN UI selection.

## Outputs

- Mermaid `flowchart TD` or `flowchart LR` source text.
- Generation statistics and limit warnings.
- Clipboard copy and `.mmd` / `.txt` downloads.

## State and persistence

Input, conversion settings, generated source, and statistics are current-page state. The current contract does not include saved diagram projects or cloud persistence.

## Privacy and network behavior

JSON parsing and Mermaid-source generation run in the browser; input JSON is not intentionally uploaded by the conversion workflow. Opening or pasting into Mermaid Live Editor is an explicit external-site action governed by that site. Suite-wide analytics/advertising may load separately.

## Language mode

`bilingual single-page`

JP/EN controls switch the same converter and guidance.

## Layout class

`hybrid`

Large JSON/Mermaid text areas benefit from wider screens, while the conversion controls and output remain usable when stacked on mobile.

## Limits and non-goals

- The current page generates Mermaid source; it does not provide an embedded rendered-diagram preview.
- Large/deep JSON is intentionally truncated/rejected according to the implemented limits.
- External Mermaid rendering can expose pasted content to that external service, so confidential JSON-derived output should not be pasted there.

## Acceptance criteria

- [ ] Valid JSON within the implemented limits produces Mermaid flowchart source and generation statistics.
- [ ] Direction, leaf, and array options change the generated source according to the selected behavior.
- [ ] Oversize, over-depth, or heavily expanded arrays surface limit/warning behavior rather than silently claiming complete representation.
- [ ] Copy and `.mmd` / `.txt` downloads use the currently generated source and JP/EN switching preserves the workflow.

## Implementation evidence

- `tools/json2mermaid/index.html`
- `tools/json2mermaid/app.js`
- `tools/json2mermaid/usage.html`
- `tools/json2mermaid/usage-en.html`
