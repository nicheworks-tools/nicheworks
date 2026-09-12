# Tool Specification — Contract Cleaner

- Slug: `contract-cleaner`
- Public URL: `https://nicheworks.app/tools/contract-cleaner/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Mechanically scan pasted contract or terms text for implemented attention keywords and categories, then organize review points and questions without making legal conclusions.

## Current functional contract

- Accept pasted contract/terms text and detect implemented attention words across categories such as damages, termination, payment, intellectual property, confidentiality, and related review areas.
- Show total matches, matched-category count, High/Medium/Low review-priority counts, prioritized categories, category-level review points, and highlighted matched text.
- Support a matched-categories-only view.
- Generate/copy a summary and review-question template and save a text output.
- Provide example text and clear/reset behavior.
- Switch the same tool between Japanese and English.
- State that severity is a review-priority signal, not a legal risk determination.

## Inputs

- Pasted contract, terms, or agreement text.
- Matched-only filter toggle.
- Example/clear/analyze actions.
- UI language selection.

## Outputs

- Match totals, category counts, priority/severity counts, category cards, highlighted excerpts, and review-question preview.
- Clipboard copies of summary/question material.
- User-triggered TXT download.

## State and persistence

The pasted document and analysis results are working-memory state for the current page. The current contract does not include persistent contract history or server-side document storage.

## Privacy and network behavior

Contract analysis runs in the browser and the pasted text is not intentionally submitted to an application backend by the checker. Suite-wide analytics and advertising may load separately. Users are explicitly warned not to paste sensitive contracts or personal information unnecessarily.

## Language mode

`bilingual single-page`

JP/EN controls switch labels, notices, and review copy on the same tool page.

## Layout class

`hybrid`

The input/result panels benefit from desktop width, while the text-first workflow can stack for narrow-screen use.

## Limits and non-goals

- The tool is not legal advice and does not decide whether a contract is acceptable, enforceable, or safe.
- No-match does not mean no risk; keyword/category detection can miss material clauses.
- Direct PDF ingestion and OCR are not part of this tool; users must paste extractable text.
- High/Medium/Low labels indicate review priority only.

## Acceptance criteria

- [ ] Pasting text containing supported attention terms and running analysis produces category findings and highlighted matches.
- [ ] Match/severity summaries correspond to the current analyzed text and the matched-only toggle changes category visibility without altering source text.
- [ ] Summary/question copy and TXT save operate on generated review material rather than claiming legal conclusions.
- [ ] JP/EN switching preserves analysis behavior and the legal/non-authoritative disclaimer.

## Implementation evidence

- `tools/contract-cleaner/index.html`
- `tools/contract-cleaner/app.js`
- `tools/contract-cleaner/style.css`
