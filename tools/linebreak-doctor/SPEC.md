# Tool Specification — LineBreak Doctor

- Slug: `linebreak-doctor`
- Public URL: `https://nicheworks.app/tools/linebreak-doctor/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate platform-oriented copies of social-post text with adjusted line breaks, blank lines, and spacing before the user pastes the text into X, Instagram, LINE, Facebook, or LinkedIn.

## Current functional contract

- Accept pasted source text and show its current character count.
- Generate platform-specific formatted variants using the current local formatting rules.
- Support a `platform-safe` policy that may insert zero-width spaces to help preserve blank lines and a `plain-text` policy that does not insert invisible characters.
- Explain the per-platform formatting rules and warn that platform behavior can change.
- Allow the user to review/copy the generated platform result before posting.
- Reset the current working state.
- Provide JP/EN UI.

## Inputs

- Source post text.
- Invisible-character policy: platform-safe or plain-text.
- JP/EN UI selection.

## Outputs

- Platform-specific formatted post-text variants.
- Character count, rule explanations, status, and clipboard copies.

## State and persistence

Input and generated variants are current-page state. The current contract does not store social-post history or submit posts to any platform.

## Privacy and network behavior

Formatting runs in the browser and source post text is not intentionally uploaded by the formatting workflow. Advertising and analytics resources may load separately.

## Language mode

`bilingual single-page`

JP/EN controls switch the same formatter and platform guidance.

## Layout class

`mobile-oriented`

The primary use case is preparing short/medium social text for copying, with a vertical input → policy → results flow suitable for phones.

## Limits and non-goals

- Platform rendering rules can change and the tool cannot guarantee that blank lines/spacing will survive after posting.
- Zero-width spaces are invisible characters that can affect search, character limits, copy/paste, and downstream applications.
- The tool does not publish to social networks or validate each platform's current content policy.

## Acceptance criteria

- [ ] Source text can generate the implemented per-platform variants without an application-backend request.
- [ ] Platform-safe and plain-text policies visibly differ in invisible-character behavior where the formatting rules require it.
- [ ] Generated variants remain reviewable/copyable and the UI tells users to confirm the actual post preview before publishing.
- [ ] JP/EN switching preserves the formatter, rule explanations, and invisible-character warning.

## Implementation evidence

- `tools/linebreak-doctor/index.html`
- `tools/linebreak-doctor/app.js`
- `tools/linebreak-doctor/style.css`
