# Tool Specification — Message Generator

- Slug: `message-generator`
- Public URL: `https://nicheworks.app/tools/message-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a short message draft from purpose, culture, formality, optional relationship, and optional keywords using a local phrase/template dictionary with small randomized wording variation.

## Current functional contract

- Require purpose, culture, and formality before generation is enabled.
- Support wedding, funeral, thank-you, apology, seasonal greeting, business greeting, and casual-message purposes.
- Support Japan, English-speaking, and EU culture selections plus high/medium/casual formality.
- Optionally incorporate relationship context for friend, family, boss, or client and user-supplied keywords.
- Build the result from local opening/closing dictionaries, purpose body templates, relationship phrases, and randomized lead/ending variants.
- Support regenerate using the same last input context and clipboard copy of the current result.
- Provide JP/EN UI, while generated phrase content can still reflect the selected culture dictionary rather than acting as a general translation engine.

## Inputs

- Purpose, culture, and formality.
- Optional relationship and keyword text.
- JP/EN UI selection.

## Outputs

- Locally generated message draft.
- Regenerated variant from the same input context.
- Clipboard copy.

## State and persistence

Current form context and generated message are in-memory page state. The current contract does not include saved message history or cloud persistence.

## Privacy and network behavior

Message generation runs locally from fixed dictionaries/templates and does not call an AI model or send the entered context to a generation backend. Advertising and analytics resources may load independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the same generator UI. Culture selection is a separate content parameter and should not be confused with the interface-language setting.

## Layout class

`mobile-oriented`

The selector form and single generated-result block are compact and suitable for a narrow stacked layout.

## Limits and non-goals

- Output is template/dictionary based, not AI-generated, translated, culturally validated, or professionally reviewed.
- Randomized variants can change wording without improving factual/cultural appropriateness.
- Funeral, apology, business, and other sensitive messages require human review before sending.
- The tool does not send messages to recipients or external services.

## Acceptance criteria

- [ ] Generate remains unavailable until purpose, culture, and formality are selected.
- [ ] Generation uses the selected culture/formality dictionaries and current purpose/relationship/keyword context without an AI API request.
- [ ] Regenerate keeps the same input context while allowing the implemented randomized phrasing to vary.
- [ ] Copy uses the current message and JP/EN switching preserves the generator behavior.

## Implementation evidence

- `tools/message-generator/index.html`
- `tools/message-generator/app.js`
- `tools/message-generator/style.css`
