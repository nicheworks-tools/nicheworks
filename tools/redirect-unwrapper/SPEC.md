# Tool Specification — Redirect Unwrapper

- Slug: `redirect-unwrapper`
- Public URL: `https://nicheworks.app/tools/redirect-unwrapper/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Inspect redirect/tracking URL strings locally and extract embedded destination URL candidates without opening or following the URL.

## Current functional contract

- Accept a URL string and parse its components in the browser.
- Inspect common redirect/tracking query parameters and decoded/nested URL strings for destination candidates.
- Surface URL details, extracted candidates, and warnings/check points.
- Provide sample redirect/tracking URL strings for testing.
- Copy candidate URLs or a summarized analysis result.
- Never navigate to or fetch the entered URL as part of analysis.
- Do not follow server-side 301/302 redirect chains.
- Switch JP/EN UI.

## Inputs

- One URL/tracking-link string.
- Optional built-in sample selection.
- JP/EN display language.

## Outputs

- Parsed URL detail.
- Extracted destination-candidate list.
- Warnings/check points.
- Clipboard copy of candidates or summary.

## State and persistence

Entered URLs and analysis results are current-page state and are not stored as history by the tool.

## Privacy and network behavior

The entered URL string is analyzed locally and is not fetched/opened or sent to a redirect-resolution backend. Advertising and analytics resources may load independently from the page.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The main flow is one text input followed by result cards and copy actions.

## Limits and non-goals

- The tool cannot resolve shorteners such as bit.ly or t.co when the destination is only available through server-side redirects.
- Extracted candidates are not guaranteed safe, trustworthy, or final.
- It is not a malware/phishing scanner, reputation service, DNS/HTTP inspector, or link sandbox.
- Encoded/nested URLs can be ambiguous and must be reviewed manually before opening.

## Acceptance criteria

- [ ] Analysis does not issue a network request to the entered URL or follow redirect chains.
- [ ] Embedded/encoded destination candidates are surfaced without claiming they are safe or final.
- [ ] Candidate and summary copy actions operate on the locally derived result.
- [ ] Shortener/server-side redirect limitations remain explicit in the UI and specification.

## Implementation evidence

- `tools/redirect-unwrapper/index.html`
- `tools/redirect-unwrapper/app.js`
- `tools/redirect-unwrapper/style.css`
