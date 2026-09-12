# Tool Specification — Analytics Privacy Kit

- Slug: `analytics-privacy-kit`
- Public URL: `https://nicheworks.app/tools/analytics-privacy-kit/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate draft privacy-policy add-on text and analytics/advertising notices for small sites using services such as GA4, Cloudflare Web Analytics, Plausible, Google AdSense, Google Tag Manager, Microsoft Clarity, and Meta Pixel.

## Current functional contract

- Accept a site name plus optional site URL and contact email.
- Let the user select which supported analytics/advertising providers are used.
- Let the user choose Japanese or English output language independently of the UI language.
- Generate short, standard, and detailed draft text variants from the selected inputs.
- Support copying each generated variant, clearing the form, and downloading generated text as TXT.
- Show explicit legal/compliance disclaimers: generated text is a draft and does not guarantee legal or platform compliance.

## Inputs

- Site name.
- Optional site URL.
- Optional contact email.
- Provider checkboxes for GA4, Cloudflare Web Analytics, Plausible, AdSense, GTM, Clarity, and Meta Pixel.
- Output language selection.
- UI language selection.

## Outputs

- Short, standard, and detailed draft notice/policy text.
- Clipboard copies of generated text.
- User-triggered TXT download.

## State and persistence

The generation workflow is ephemeral in page memory. The current implementation does not promise persistence of entered site information across reloads.

## Privacy and network behavior

Draft generation runs in the browser; the entered site name, URL, and email are not submitted to an application backend by this tool. Advertising and analytics tags used by the NicheWorks page may still load independently of the drafting workflow.

## Language mode

`bilingual single-page`

JP/EN controls switch the same page UI, and the output language selector controls the generated draft language.

## Layout class

`mobile-oriented`

The primary workflow is a vertical form followed by generated text blocks and remains naturally usable as a single-column tool on narrow screens.

## Limits and non-goals

- Generated wording is not legal advice and does not certify compliance with privacy laws, cookie-consent rules, or advertising-platform policies.
- The tool does not inspect the user's live site or automatically discover installed trackers.
- Provider coverage is limited to the options implemented in the current form.

## Acceptance criteria

- [ ] Selecting providers and generating output produces short, standard, and detailed drafts in the selected output language.
- [ ] Copy and TXT download operate only on generated text and do not require sending the entered policy inputs to an application backend.
- [ ] Switching JP/EN UI does not remove the legal disclaimer or provider controls.
- [ ] Clear resets user-entered drafting state without creating stored history.

## Implementation evidence

- `tools/analytics-privacy-kit/index.html`
- `tools/analytics-privacy-kit/app.js`
- `tools/analytics-privacy-kit/style.css`
