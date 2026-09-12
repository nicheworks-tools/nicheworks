# Tool Specification — Microtool Launch Checklist

- Slug: `microtool-launch-checklist`
- Public URL: `https://nicheworks.app/tools/microtool-launch-checklist/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Generate a lightweight pre-launch checklist for small web tools so a publisher can review common release concerns before shipping.

## Current functional contract

- Classify the tool as converter, checker, generator, or directory.
- Generate a checklist tailored to the selected class.
- Cover common launch concerns such as SEO, ads, donation/support links, mobile layout, error states, disclaimers, and related links.
- Allow generated checklist text to be copied or saved as Markdown or TXT.
- Provide JP/EN display switching.
- Act as a manual review aid; it does not execute repository checks or validate a live deployment.

## Inputs

- Tool type: converter, checker, generator, or directory.
- JP/EN display language.

## Outputs

- A generated pre-launch checklist.
- Clipboard copy.
- Markdown download.
- TXT download.

## State and persistence

Generated checklist content is page state and is not stored as checklist history. Display language may be retained in this browser by the shared language layer.

## Privacy and network behavior

Checklist generation runs in the browser and does not require sending checklist inputs to an application backend. Advertising and analytics resources may load separately as part of the page.

## Language mode

`bilingual single-page`

JP/EN content is switched on the same page.

## Layout class

`mobile-oriented`

The primary flow is one select control followed by actions and a single output block.

## Limits and non-goals

- The checklist is not a substitute for real functional testing, legal review, privacy review, or advertising-policy review.
- It does not guarantee AdSense approval or ad delivery.
- It does not inspect a repository or deployment automatically.
- It supports only the four current coarse tool classes.
- Release Guardian remains a separate repository-oriented release asset.

## Acceptance criteria

- [ ] Each of the four supported tool classes can produce a checklist without a server-side generation dependency.
- [ ] Generated content can be copied and downloaded as both Markdown and TXT.
- [ ] The UI does not imply that checklist completion guarantees legal, privacy, ad, or deployment correctness.
- [ ] JP/EN switching preserves the tool flow on the same page.

## Implementation evidence

- `tools/microtool-launch-checklist/index.html`
- `tools/microtool-launch-checklist/app.js`
- `tools/microtool-launch-checklist/style.css`
