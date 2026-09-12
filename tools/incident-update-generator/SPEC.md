# Tool Specification — Incident Update Generator

- Slug: `incident-update-generator`
- Public URL: `https://nicheworks.app/tools/incident-update-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn confirmed incident facts into draft customer, internal, and social-status updates while preserving human review for factual, legal, PR, security, SLA, and compensation decisions.

## Current functional contract

- Accept service name, incident status, tone, start/recovery time, impact, affected components, mitigation, next-update timing, duration, cause summary, and follow-up notes.
- Support Investigating, Identified, Monitoring, and Resolved status states plus Short, Standard, and Polite tone variants.
- Generate separate customer, internal, and social update drafts in the active language.
- Optionally mark missing optional facts as unconfirmed instead of inventing them.
- Allow individual copy and selected-audience TXT download in free mode.
- With active NicheWorks Pro, generate a Markdown Incident Communication Pack covering Statuspage, Slack/Teams, support macro, public-review checklist, postmortem outline, and related review material.
- Keep all generated text positioned as a draft requiring responsible-owner review before publication.

## Inputs

- Incident/service facts and status/tone selections.
- Selected download audience.
- Optional unconfirmed-field behavior.
- JP/EN UI selection and shared NicheWorks Pro entitlement state.

## Outputs

- Customer-facing, internal, and social update drafts.
- Clipboard copies and selected TXT download.
- Pro-only Incident Communication Pack as copyable/downloadable Markdown.

## State and persistence

Incident facts and generated outputs are current-page state. The current contract does not include persistent incident history or incident-management storage. Shared Pro entitlement is browser-local through the common NicheWorks mechanism.

## Privacy and network behavior

Update generation runs in the browser and incident input is not intentionally uploaded by the generation workflow. Advertising, analytics, and shared Pro resources may load independently. Sensitive incident facts should still be minimized before entry.

## Language mode

`bilingual single-page`

JP/EN controls switch the same incident-drafting interface and generated copy.

## Layout class

`mobile-oriented`

The core interaction is a structured incident-fact form followed by stacked audience-specific outputs and Pro review material.

## Limits and non-goals

- The tool does not verify incident facts, severity, root cause, security impact, or legal-reporting obligations.
- It does not automatically generate SLA credits, refund/compensation commitments, or legal-responsibility statements.
- It is not an incident-management system, status-page publisher, notification service, or postmortem database.

## Acceptance criteria

- [ ] Confirmed incident fields can generate distinct customer, internal, and social drafts for the selected status/tone.
- [ ] Missing optional information can be marked unconfirmed rather than silently fabricated when the option is enabled.
- [ ] Free copy/TXT actions remain usable without Pro while the Incident Communication Pack stays gated by shared entitlement.
- [ ] JP/EN modes retain the same fact fields and mandatory human-review warning.

## Implementation evidence

- `tools/incident-update-generator/index.html`
- `tools/incident-update-generator/app.js`
- `tools/incident-update-generator/pro-bridge.js`
