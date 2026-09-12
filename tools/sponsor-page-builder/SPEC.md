# Tool Specification — Sponsor Page Builder

- Slug: `sponsor-page-builder`
- Public URL: `https://nicheworks.app/tools/sponsor-page-builder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Draft sponsor/support page copy for an OSS or independent project, including funding use, tier ideas, benefit boundaries, FAQ content, and pre-publication cautions.

## Current functional contract

- Accept project name/summary, target supporters, reason for support, use of funds, offered/not-offered benefits, tier count, optional price ideas, corporate-support handling, contact method, logo policy, and refund/cancellation policy.
- Generate Japanese and English sponsor-page drafts from the entered details.
- Generate the requested number of tier suggestions and mark missing price ideas as needing adjustment rather than inventing exact prices.
- Include cautions around rewards, refunds, invoices, logo/trademark use, corporate handling, and sponsorship-platform terms.
- Allow the active-language draft to be copied and downloaded as text.
- Switch JP/EN UI.
- Generate locally in the browser without an AI copywriting backend.

## Inputs

- Project/support narrative fields.
- Offered and unavailable benefits.
- Tier count and optional pricing ideas.
- Corporate support, contact, logo, and refund/cancellation policy settings.
- JP/EN display language.

## Outputs

- Japanese sponsor/support page draft.
- English sponsor/support page draft.
- Tier ideas and FAQ/pre-publication checks.
- Clipboard copy and text download.

## State and persistence

Form fields and generated drafts are current-page state and are not stored as sponsor-page history.

## Privacy and network behavior

Draft generation is browser-local and does not send project details to a copy-generation service. Ads/analytics and external support links may communicate independently.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The page is a vertically stacked drafting form followed by a single-language visible output.

## Limits and non-goals

- Generated sponsor copy is a draft and does not guarantee platform-policy, tax, invoicing, refund, trademark/logo, or commercial-law compliance.
- Benefits should be included only when the operator can actually provide them.
- The tool does not create or configure GitHub Sponsors, Stripe, Ko-fi, OFUSE, or another payment/sponsorship account.
- It does not promise sponsor acquisition or revenue.

## Acceptance criteria

- [ ] Tier generation respects the selected tier count and does not fabricate exact prices for missing price inputs.
- [ ] Both JP and EN drafts derive from user-entered project/support facts rather than an external generation service.
- [ ] Copy and text-download actions use the current generated draft.
- [ ] Public copy retains warnings about rewards, refunds, logo/trademark use, invoices, and platform terms.

## Implementation evidence

- `tools/sponsor-page-builder/index.html`
- `tools/sponsor-page-builder/app.js`
- `tools/sponsor-page-builder/style.css`
