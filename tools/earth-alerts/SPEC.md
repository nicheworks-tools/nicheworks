# Tool Specification — Earth Alerts

- Slug: `earth-alerts`
- Public URL: `https://nicheworks.app/tools/earth-alerts/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Publish an explicit coming-soon status page for the planned Earth-observation alert-rule tool without implying that notifications or real-data alert evaluation already exist.

## Current functional contract

- State that Earth Alerts is not currently usable as an alerting tool.
- Describe the planned future scope as previewing thresholds and alert rules for Earth-observation workflows.
- Explicitly state that no notifications are sent, Discord/email integrations are inactive, and real-data alert logic is not implemented.
- Link users to the currently active Earth Map Suite for storm-mode metadata reachability status.
- Provide JP/EN copy on the same page.

## Inputs

Only UI language selection and normal page navigation. There is no current alert-rule input form.

## Outputs

- Coming-soon/current-status information.
- Link to Earth Map Suite as the related active tool.

## State and persistence

The current page does not create alert rules, notification subscriptions, or persistent alert state.

## Privacy and network behavior

No alert data is submitted because alert creation/evaluation is not implemented. Suite-wide advertising and analytics resources may load normally.

## Language mode

`bilingual single-page`

JP/EN controls switch the same status page.

## Layout class

`mobile-oriented`

The current experience is a simple informational status page with stacked sections.

## Limits and non-goals

- No notifications are sent.
- No Discord/email integration is active.
- No real-data alert evaluation, threshold monitoring, background job, or subscription management exists.
- Planned future behavior must not be described as current functionality.

## Acceptance criteria

- [ ] The page clearly labels Earth Alerts as coming soon/not currently usable.
- [ ] The page does not expose a working notification, Discord, email, or real-data alert workflow.
- [ ] JP/EN modes communicate the same non-active status and link to the related active Earth Map Suite page.

## Implementation evidence

- `tools/earth-alerts/index.html`
- shared presentation from `tools/earth-map-suite/style.css`
