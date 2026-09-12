# Tool Specification — Logistics Compliance Kit JP

- Slug: `logistics-compliance-kit-jp`
- Public URL: `https://nicheworks.app/tools/logistics-compliance-kit-jp/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Help Japanese shippers organize logistics-efficiency conditions such as waiting time, delivery-window constraints, visibility gaps, outsourcing, and congestion into a practical review level, next actions, and planning draft without presenting the result as a legal/compliance determination.

## Current functional contract

- Collect the implemented logistics-efficiency conditions and generate a simple review/priority level with supporting signals.
- Generate next-action guidance and a medium/long-term improvement-plan draft.
- Preserve a freeform current-state memo in output without using that memo as an input to the scoring/decision logic.
- Provide free on-screen result, evidence signals, next actions, planning draft, current-state memo, and Markdown preview.
- With active NicheWorks Pro, unlock the implemented Markdown save, internal-share memo, contractor/vendor confirmation memo, improvement plan, GitHub Issue draft, Codex task, handoff Markdown, and JSON export.
- Keep official/regulatory/legal interpretation outside the tool and point users to government, legal, logistics, and internal responsible teams.

## Inputs

- Implemented shipper/logistics condition fields rendered by the application.
- Optional current-state memo.
- Shared NicheWorks Pro entitlement state.

## Outputs

- Review/priority level and supporting signals.
- Next actions and medium/long-term planning draft.
- Current-state memo in the generated output.
- Free Markdown preview and Pro-only operational/export artifacts.

## State and persistence

Current inputs and generated result are page-session state unless the implementation explicitly exposes user-controlled exports. Shared Pro entitlement is browser-local. The current contract does not define cloud storage of logistics assessments.

## Privacy and network behavior

Assessment/draft generation runs in the browser and the entered logistics information is not intentionally uploaded by that workflow. Advertising, analytics, and shared Pro resources may load separately.

## Language mode

`Japanese-only`

The tool is scoped to Japanese logistics/business context and the current public UI is Japanese-only.

## Layout class

`hybrid`

The experience is document/form oriented and usable on narrow screens, while detailed output and Pro handoff material benefit from wider layouts.

## Limits and non-goals

- The result is not a legal-compliance, shipper-liability, administrative-filing, or contract-obligation determination.
- Generated material is not an official government submission document.
- The freeform current-state memo is recorded in output but does not affect the implemented decision logic.
- Users must verify制度・法令・契約 requirements against official sources and responsible specialists.

## Acceptance criteria

- [ ] Entered implemented logistics conditions produce the current review level/signals, next actions, and planning draft locally.
- [ ] The current-state memo appears in output but does not alter the scoring/decision result.
- [ ] Free result/Markdown preview remains available without Pro while operational handoff/export artifacts stay gated.
- [ ] The page remains Japanese-only and clearly states that the result is not a legal or administrative determination.

## Implementation evidence

- `tools/logistics-compliance-kit-jp/index.html`
- `tools/logistics-compliance-kit-jp/app.js`
- `tools/logistics-compliance-kit-jp/pro-bridge.js`
- `tools/logistics-compliance-kit-jp/usage.html`
