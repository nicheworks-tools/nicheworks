# Tool Specification — JSON Repair

- Slug: `json-repair`
- Public URL: `https://nicheworks.app/tools/json-repair/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Validate, format, minify, and repair common broken-JSON cases in the browser, with stronger repair, candidate/schema/history, and report tooling gated behind shared NicheWorks Pro.

## Current functional contract

- Accept pasted or loaded `.json` / text input and support Auto, JSON, and JSONC interpretation modes.
- Validate syntax and show error/explanation information.
- Provide free Safe and Standard repair levels for supported issues such as trailing commas, comments, and log-mixed JSON.
- Provide Pretty and Minify formatting, repaired/formatted/validate result tabs, repair log, simple diff, copy, and `.json` download in free mode.
- Keep Aggressive repair and related single-quote, unquoted-key, Python-literal examples gated by Pro.
- With active Pro, expose repair candidates, simple schema rules/checking, local repair history, report generation, Markdown export, and JSON export.
- The active Pro integration is implemented directly in `app.js`, which reads the shared `NWPro` status loaded by the public page; there is no tool-local `pro-bridge.js` in the current runtime.
- Switch the same interface between Japanese and English.

## Inputs

- JSON/JSONC-like text or local `.json` / text file.
- Parsing mode, repair level, indentation, sample, schema rules, and Pro actions where available.
- JP/EN UI selection and shared Pro entitlement state.

## Outputs

- Validation result and explanation.
- Repaired, pretty, or minified JSON text.
- Repair log and simple diff.
- Free copy/JSON download plus Pro candidate/schema/history/report and Markdown/JSON export outputs.

## State and persistence

Current input/results are page-session state. Pro history is browser-local when available. Shared Pro entitlement is managed by the common NicheWorks browser entitlement mechanism; user-triggered downloads are saved locally.

## Privacy and network behavior

JSON validation and repair run in the browser and input text is not intentionally uploaded by the repair workflow. Advertising, analytics, and shared Pro resources may load independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the same JSON workbench.

## Layout class

`pc-oriented`

The paired input/output editors, tabs, diff/log, schema, history, and report panels are information-dense and benefit from desktop width.

## Limits and non-goals

- Repair is heuristic and cannot guarantee preservation of the intended data semantics.
- Aggressive repair can make stronger assumptions and therefore remains explicitly separate/gated.
- Simple schema checking is not a full JSON Schema implementation unless the implementation is intentionally expanded.
- The tool does not execute code embedded in JSON-like input.

## Acceptance criteria

- [ ] Valid/invalid JSON can be checked and syntax failure is surfaced without executing input content.
- [ ] Safe/Standard repair, Pretty, Minify, copy, download, log, and simple diff remain available in free mode.
- [ ] Aggressive repair and candidate/schema/history/report/export features remain gated by shared Pro state.
- [ ] JP/EN switching preserves the same repair levels and privacy warning.

## Implementation evidence

- `tools/json-repair/index.html`
- `tools/json-repair/app.js`
