# Tool Specification — Newsletter Kit Generator

- Slug: `newsletter-kit-generator`
- Public URL: `https://nicheworks.app/tools/newsletter-kit-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a lightweight bilingual newsletter planning kit from a theme, audience, and delivery frequency.

## Current functional contract

- Accept newsletter theme, intended audience, and frequency.
- Generate a deterministic template containing subject ideas, issue structure, CTA ideas, and a sponsor pitch.
- Produce both Japanese and English sections in the generated kit regardless of the current UI language.
- Substitute explicit missing-input placeholders rather than blocking generation.
- Allow the generated kit to be copied to the clipboard.
- Switch the surrounding UI between JP and EN.
- Use local templates only; no AI generation backend is involved.

## Inputs

- Newsletter theme.
- Audience.
- Delivery frequency.
- JP/EN UI selection.

## Outputs

- JP subject ideas, structure, CTA, and sponsor pitch.
- EN subject ideas, structure, CTA, and sponsor pitch.
- Clipboard copy of the full bilingual kit.

## State and persistence

Theme, audience, frequency, and generated output are not persisted. The shared language helper can store `nw_lang` in localStorage.

## Privacy and network behavior

Kit generation is browser-local and does not send the entered newsletter details to an AI or text-generation backend. Ads may load separately.

## Language mode

`bilingual single-page`

The UI language switches, while the generated artifact intentionally contains both JP and EN sections.

## Layout class

`mobile-oriented`

The tool is three text inputs, generate/copy actions, and one output area.

## Limits and non-goals

- Generated copy is fixed-template drafting, not adaptive AI writing.
- The tool does not send newsletters, manage subscriber lists, or integrate with an email service.
- It does not validate advertising disclosures, sponsor contracts, email consent, or deliverability.
- Current implementation provides copy but no dedicated file-download action for the newsletter kit.

## Acceptance criteria

- [ ] Generation works locally with any combination of filled or blank theme/audience/frequency inputs.
- [ ] The output always contains both JP and EN sections even when only one UI language is visible.
- [ ] Missing inputs use explicit placeholder text rather than invented user details.
- [ ] Clipboard copy copies the generated local template without an AI/API request.

## Implementation evidence

- `tools/newsletter-kit-generator/index.html`
- `tools/newsletter-kit-generator/app.js`
- `tools/newsletter-kit-generator/style.css`
