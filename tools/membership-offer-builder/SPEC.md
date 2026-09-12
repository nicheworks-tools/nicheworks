# Tool Specification — Membership Offer Builder

- Slug: `membership-offer-builder`
- Public URL: `https://nicheworks.app/tools/membership-offer-builder/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn membership/community assumptions into a draft offer that organizes target members, deliverables, frequency, pricing candidate, operating limits, cancellation/refund terms, onboarding, and retention ideas before launch.

## Current functional contract

- Accept theme/expertise, target members, deliverables, delivery frequency, available operating time, pricing candidate, number of plans, exclusions, cancellation/refund terms, first-month bonus, retention benefits, community presence, and workload limit.
- Generate an offer draft locally from the entered fields and support copying the current result.
- Include pre-launch reminders around recurring billing, cancellation/refunds, seller/legal notices, taxes, payment fees, platform terms, moderation, participation rules, and operating workload.
- Provide JP/EN UI.
- Treat pricing and retention suggestions as draft framing rather than market-validated recommendations.

## Inputs

- Membership topic, audience, deliverables, frequency, time, price, plan count, exclusions, cancellation/refund, bonus, retention, community, and workload fields.
- JP/EN UI selection.

## Outputs

- Structured membership-offer draft and launch/review considerations.
- Clipboard copy of the generated offer.

## State and persistence

Inputs and generated offer are current-page browser state. The current contract does not include membership/customer databases, billing state, or persistent offer-version history.

## Privacy and network behavior

Offer generation runs in the browser and entered business/member information is not intentionally uploaded by the generation workflow. Advertising and analytics resources may load independently. Confidential member counts, revenue, customer information, and private content URLs should be omitted or masked when possible.

## Language mode

`bilingual single-page`

JP/EN controls switch the same offer-building workflow and warnings.

## Layout class

`mobile-oriented`

The experience is a long stacked form followed by a text output, suitable for narrow-screen use.

## Limits and non-goals

- The tool does not validate market demand, pricing fit, churn/retention forecasts, or operating profitability.
- It does not implement recurring billing, payments, memberships, community moderation, or account management.
- It does not certify compliance with cancellation/refund, tax, seller-disclosure, or platform rules.

## Acceptance criteria

- [ ] Entered audience/deliverables/frequency/pricing/terms are represented in the generated membership draft.
- [ ] Copy uses the current generated offer and generation remains browser-local.
- [ ] The output keeps pricing/retention ideas framed as draft planning rather than verified business outcomes.
- [ ] JP/EN switching preserves the form and the recurring-billing/legal/platform review warnings.

## Implementation evidence

- `tools/membership-offer-builder/index.html`
- `tools/membership-offer-builder/app.js`
- `tools/membership-offer-builder/style.css`
