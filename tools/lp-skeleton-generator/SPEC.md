# Tool Specification — LP Skeleton Generator

- Slug: `lp-skeleton-generator`
- Public URL: `https://nicheworks.app/tools/lp-skeleton-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn product/service information into a draft landing-page structure, headings, and copy skeleton for review before publication, without claiming advertising, legal, or claim-substantiation compliance.

## Current functional contract

- Accept product/service name, target audience, problem, benefits, differentiators, optional price/proof, process steps, FAQ, optional guarantee/refund terms, exclusions/notes, and CTA.
- Generate a structured LP draft in the browser from the entered fields.
- Provide Markdown and escaped-HTML output paths plus copy behavior implemented by the tool.
- Preserve user-entered benefit/proof/price/guarantee information as draft content rather than independently validating it.
- Provide JP/EN UI and explicit warnings around regulated industries, unsupported performance claims, comparison wording, refund terms, and pricing accuracy.

## Inputs

- Product/service positioning and copy inputs.
- Optional proof/price/guarantee information.
- JP/EN UI selection.

## Outputs

- LP section/headline/copy skeleton.
- Copyable result plus Markdown and HTML downloads/outputs.

## State and persistence

Inputs and generated draft are current-page state. The current contract does not include cloud project storage or persistent LP-version history.

## Privacy and network behavior

LP generation runs in the browser and the entered campaign/product content is not intentionally uploaded by the generation workflow. Advertising and analytics resources may load separately. Users are warned to mask unreleased product names, internal URLs, and confidential campaign details when appropriate.

## Language mode

`bilingual single-page`

JP/EN controls switch the same LP drafting form and result experience.

## Layout class

`mobile-oriented`

The tool is a long structured form followed by text-oriented output and naturally works as a stacked narrow-screen workflow.

## Limits and non-goals

- Output is a draft, not a legal/ad-platform compliance check.
- The tool does not verify that numerical performance claims, testimonials, comparison claims, prices, or guarantees are substantiated or current.
- Medical, finance, investment, beauty, supplement, hiring, and other regulated/sensitive categories require separate review.
- Escaping generated HTML reduces direct injection from form fields but does not replace final content/link/security review before publishing.

## Acceptance criteria

- [ ] Entered product/audience/problem/benefit/CTA information is represented in the generated LP skeleton.
- [ ] Markdown and HTML output paths are generated from the current draft, with input values escaped in the implemented HTML path.
- [ ] Optional proof/price/guarantee content is treated as user-supplied draft material rather than verified fact.
- [ ] JP/EN switching preserves the drafting workflow and advertising/legal disclaimer.

## Implementation evidence

- `tools/lp-skeleton-generator/index.html`
- `tools/lp-skeleton-generator/app.js`
- `tools/lp-skeleton-generator/style.css`
