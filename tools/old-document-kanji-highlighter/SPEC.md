# Tool Specification — Old Document Kanji Highlighter

- Slug: `old-document-kanji-highlighter`
- Public URL: `https://nicheworks.app/tools/old-document-kanji-highlighter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Highlight registered old/variant kanji in pasted historical-style text and provide a mechanical modern-form reference without claiming translation or scholarly interpretation.

## Current functional contract

- Accept pasted text such as old documents, inscriptions, map descriptions, or sign text.
- Detect characters found in the local Old Kanji reference mapping.
- Highlight detected old forms in the original text.
- Show a detected-character list and old→modern correspondence.
- Produce a mechanical modern-form preview.
- Allow copying detected old forms, the pair table, and the modern-form preview.
- Link to related Old Kanji tools for deeper lookup/conversion.
- Process text locally and load reference data from same-site assets.
- Do not render an unfinished Pro sales panel, fixed Pro price, or disabled purchase CTA while no verified purchase path is connected.

## Inputs

- Pasted text.
- JP/EN display selection.

## Outputs

- Highlighted source text.
- Detected old/variant-character list.
- Old→modern correspondence.
- Mechanical modern-form preview.
- Clipboard outputs for detected forms, pairs, and preview.

## State and persistence

Pasted text and results are current-page state. No document history is persisted by the free tool. No paid entitlement or purchase UI is part of the current public page state.

## Privacy and network behavior

Text analysis is performed in the browser and is not sent to an external analysis API. Same-site reference assets are loaded as needed; ads/analytics can load independently.

## Language mode

`bilingual single-page`

## Layout class

`hybrid`

Long source documents benefit from desktop width, while the input/results are vertically usable on mobile.

## Limits and non-goals

- This is not translation, OCR, kuzushiji recognition, historical interpretation, or scholarly authentication.
- Modern-form preview is mechanical replacement and can be wrong for context, proper nouns, or official spelling.
- Only characters present in the bundled/reference mapping are detected.
- No fixed Pro price or unfinished purchase controls are rendered on the public page while billing is inactive.

## Acceptance criteria

- [ ] Registered old forms in pasted text are highlighted and represented in the detected list.
- [ ] The modern preview is clearly labeled as mechanical replacement rather than authoritative modernization.
- [ ] Copy actions operate on locally derived detection/pair/preview data.
- [ ] Pasted document text is not sent to an external analysis API.
- [ ] The public page does not expose unfinished billing/Pro sales controls until a verified entitlement/purchase path exists.

## Implementation evidence

- `tools/old-document-kanji-highlighter/index.html`
- `tools/old-document-kanji-highlighter/app.js`
- `tools/old-document-kanji-highlighter/style.css`
- `tools/old-kanji-reference/dict.json`
