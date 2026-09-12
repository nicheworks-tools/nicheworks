# JSON to Mermaid — canonical tool specification

- **Slug:** `json2mermaid`
- **Display name (JA):** JSONからMermaid図
- **Display name (EN):** JSON to Mermaid
- **Implementation:** `tools/json2mermaid/`
- **Registry state:** active (registered implementation present)
- **Category:** json, mermaid, diagram, docs
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `json2mermaid` implementation at `/tools/json2mermaid/`. It does not authorize a production rewrite.

## 2. Purpose

Convert JSON structure into Mermaid `flowchart` source code locally so users can inspect, copy, and save a diagram definition for use in Mermaid-compatible tools.

## 3. Inputs

- JSON text or built-in preset.
- Direction, leaf-value mode, and array mode.
- JP/EN UI selection.

## 4. Processing behavior

- Accept pasted JSON and built-in simple-tree, nested-object, and array-object presets.
- Support top-down (`TD`) and left-to-right (`LR`) directions.
- Support separate or inline leaf values and expanded or summarized array handling.
- Enforce the implemented safety/size limits: approximately 300 KB input, maximum depth 12, and up to 50 expanded array items.
- Parse JSON and emit Mermaid flowchart source with node/edge/depth/omission statistics plus warning/error states.
- Copy generated Mermaid source and download it as `.mmd` or `.txt`.
- Link to Mermaid Live Editor only as an external preview option; the current tool does not render the Mermaid diagram itself.

## 5. Outputs

- Mermaid `flowchart TD` or `flowchart LR` source text.
- Generation statistics and limit warnings.
- Clipboard copy and `.mmd` / `.txt` downloads.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

JSON parsing and Mermaid-source generation run in the browser; input JSON is not intentionally uploaded by the conversion workflow. Opening or pasting into Mermaid Live Editor is an explicit external-site action governed by that site. Suite-wide analytics/advertising may load separately.

For future Pro implementation, batch processing, embedded rendering, exports, and style presets must remain local unless a later specification explicitly changes that contract. Billing/analytics payloads must not contain JSON content, generated Mermaid source, filenames, node labels, or values derived from user input.

The staged Pro engine, shared-converter integration, workspace, and Mermaid adapter contain no built-in network transport. Raw batch JSON is passed to the shared converter only and is not copied into the engine's result records.

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **not found**; non-suite hosts observed: `mermaid.live`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- Large JSON/Mermaid text areas benefit from wider screens, while the conversion controls and output remain usable when stacked on mobile.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same converter and guidance.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/json2mermaid/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **present**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Valid JSON within the implemented limits produces Mermaid flowchart source and generation statistics.
- [ ] Direction, leaf, and array options change the generated source according to the selected behavior.
- [ ] Oversize, over-depth, or heavily expanded arrays surface limit/warning behavior rather than silently claiming complete representation.
- [ ] Copy and `.mmd` / `.txt` downloads use the currently generated source and JP/EN switching preserves the workflow.
- [ ] The visible Free converter and staged Pro batch path use the same browser-local converter API rather than duplicated JSON→Mermaid implementations.
- [ ] The staged Pro workspace can compose batch conversion, saved style preset application, local Mermaid rendering, and SVG/PNG export without adding network transport.
- [ ] Future Pro implementation does not move any current Free contract feature behind a paid gate.
- [ ] Future batch/render/export/style features do not silently upload user JSON or generated Mermaid to a third-party rendering backend.
- [ ] The staged Pro modules remain disconnected from public Pro UI until product-scoped entitlement, Mermaid bundle delivery, and UI wiring are explicitly implemented.

Automated test evidence: `scripts/check-json2mermaid-pro-engine.mjs`, `scripts/check-json2mermaid-pro-workspace.mjs`, `scripts/check-json2mermaid-shared-converter.mjs`.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/json2mermaid/index.html`
- `tools/json2mermaid/app.js`
- `tools/json2mermaid/style.css`
- `tools/json2mermaid/usage-en.html`
- `tools/json2mermaid/usage.html`
