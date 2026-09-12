# Tool Specification — Contract Risk Highlighter

- Slug: `contract-risk-highlighter`
- Public URL: `https://nicheworks.app/tools/contract-risk-highlighter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Highlight implemented contract-clause risk patterns in pasted contract text and organize them into a preliminary review result, with optional Pro handoff material for human consultation and follow-up.

## Current functional contract

- Accept pasted contract text and a supported contract type such as services, NDA, or sales.
- Analyze text for implemented clause/risk patterns and display an overall risk badge, explanation, and findings.
- Provide free Markdown preview/copy behavior for the current result.
- With active NicheWorks Pro, expose the full findings set and generate/download review artifacts including Full Review Markdown, consultation memo, counterparty questions, missing-clause checklist, Next Action Memo, Markdown download, and browser Print/Save PDF.
- Provide example text, clear behavior, JP/EN UI, usage pages, and explicit legal/privacy disclaimers.

## Inputs

- Pasted contract text.
- Contract type selection.
- Analyze/clear/example actions.
- JP/EN mode selection.
- Shared NicheWorks Pro entitlement state.

## Outputs

- Overall risk badge/explanation and clause-pattern findings.
- Free Markdown-oriented preview/copy output.
- Pro-only full review pack, consultation/questions/checklist/next-action outputs, Markdown download, and print-to-PDF path.

## State and persistence

The current contract text and analysis result are page-session state. Shared Pro entitlement is browser-local through the common NicheWorks Pro mechanism. Explicit downloads/printed PDFs are user-controlled outputs; contract history is not part of the current contract.

## Privacy and network behavior

Text analysis runs in the browser; pasted contract content is not intentionally uploaded by the analysis workflow. The page may load analytics, advertising, and shared Pro resources independently. Users are warned not to paste confidential or personal data unnecessarily.

## Language mode

`bilingual single-page`

The main tool switches JP/EN in place, with supporting usage pages for both languages.

## Layout class

`hybrid`

The paired input/result and review-pack areas benefit from desktop width while remaining stackable for narrow screens.

## Limits and non-goals

- The tool does not provide legal advice, determine enforceability, or guarantee the correctness of suggested review actions.
- Risk labels are heuristic review signals, not legal conclusions.
- The UI text refers to PDF extraction/readiness inconsistently; the operative input contract is pasted contract text, while Pro PDF output is browser print/save of results.
- Important agreements require qualified human review.

## Acceptance criteria

- [ ] Analyzing supported sample/pasted text produces an overall result and clause-pattern findings without transmitting the contract to an application backend.
- [ ] Free mode exposes the implemented limited review output while Pro-only full findings/artifacts remain gated by shared entitlement.
- [ ] Pro review outputs are derived from the current analysis and Print/Save PDF uses the browser printing path rather than claiming direct contract-PDF analysis.
- [ ] JP/EN switching retains the legal disclaimer, privacy warning, and analysis controls.

## Implementation evidence

- `tools/contract-risk-highlighter/index.html`
- `tools/contract-risk-highlighter/app.js`
- `tools/contract-risk-highlighter/usage.html`
- `tools/contract-risk-highlighter/usage-en.html`
