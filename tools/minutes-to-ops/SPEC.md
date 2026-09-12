# Tool Specification — Minutes to Ops

- Slug: `minutes-to-ops`
- Public URL: `https://nicheworks.app/tools/minutes-to-ops/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn pasted meeting minutes into operational artifacts using deterministic rule-based extraction rather than AI summarization.

## Current functional contract

- Accept meeting notes plus optional meeting title, date, and participants.
- Extract ToDo candidates from rule/keyword patterns and derive owner/due fields when present.
- Extract decision/agreement lines and produce an SOP draft.
- Infer whether output headings should be Japanese or English from the pasted notes; switching the UI does not translate the notes.
- Free mode provides generation, previews, Markdown/SOP copy, CSV download, and Markdown download.
- Pro mode adds saved history, history comparison, a bundled output pack, GitHub Issue format, Codex request text, and SOP handoff Markdown copy/download.
- Cap ToDo extraction rather than attempting unlimited meeting-note interpretation.

## Inputs

- Meeting minutes text.
- Optional meeting title, date, and participants.
- JA/EN UI selection.
- Pro actions when the shared entitlement is active.

## Outputs

- ToDo table with Task, Owner, Due, Priority, and Status fields.
- Decision list.
- SOP draft.
- CSV and Markdown previews/downloads.
- Pro GitHub Issue, Codex task, SOP handoff, history comparison, and output pack.

## State and persistence

Normal pasted notes and generated outputs are page state. Pro history is stored locally under `nw_mto_history_v2`. Shared NicheWorks Pro entitlement is browser-bound and can require reactivation on another browser/device or after site-data removal.

## Privacy and network behavior

Extraction runs in the browser. Meeting text is not sent to an AI summarization service. Ads/analytics and the external Pro purchase flow may communicate independently.

## Language mode

`bilingual single-page`

The UI labels switch JA/EN; source minutes are not translated, and output heading language is inferred from the source text.

## Layout class

`pc-oriented`

The primary workflow uses dense notes input, tabular ToDos, multiple artifact panels, and Pro handoff outputs, although responsive use remains supported.

## Limits and non-goals

- This is rule-based extraction, not semantic AI summarization.
- Important tasks and decisions can be missed or misclassified and must be checked against the source minutes.
- It does not translate meeting content.
- Pro history is browser-local, not an account-synced meeting archive.
- Generated SOP/GitHub/Codex artifacts are drafts, not proof that operational work has been completed.

## Acceptance criteria

- [ ] Free generation works without an AI API and produces ToDo, decision, SOP, CSV, and Markdown artifacts from pasted text.
- [ ] UI language switching does not silently translate the pasted meeting text.
- [ ] Free CSV/Markdown download remains available when Pro is inactive.
- [ ] Pro history and Pro-only output actions remain gated by the shared entitlement and history uses `nw_mto_history_v2`.

## Implementation evidence

- `tools/minutes-to-ops/index.html`
- `tools/minutes-to-ops/app.js`
- `tools/minutes-to-ops/pro-bridge.js`
- `tools/minutes-to-ops/style.css`
