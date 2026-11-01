# Tool Specification — Habit Plan Generator

- Slug: `habit-plan-generator`
- Public URL: `https://nicheworks.app/tools/habit-plan-generator/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Turn a habit goal, available time, preferred days, obstacles, and motivation style into a lightweight weekly habit plan with a minimum action, trigger, recovery plan, schedule, and tracking checklist.

## Current functional contract

- Accept a goal, available time, preferred weekdays, obstacles, and motivation style.
- Provide Exercise, Study, and Sleep presets that populate representative inputs.
- Generate a minimum two-minute action, time/day trigger, recovery plan, and weekly do/rest schedule using deterministic rules.
- Generate a configurable tracking checklist and text version of the plan.
- Provide copy and text-download utilities implemented by the tool.
- Support an explicit Print / Save as PDF browser action that refreshes the current plan from the inputs and prints only the selected-language plan, weekly schedule, and chosen 7/14/30-day checklist (not the form, ads, or donation controls).
- Switch the same page between Japanese and English and persist the selected display language in browser localStorage. Re-apply the selected language after creating the dynamic toolRoot controls, so first-load English is not stuck with Japanese input labels.

## Inputs

- Goal text.
- Available-time text.
- Preferred weekday selections.
- Obstacle text and motivation style.
- Preset selection and checklist-length controls.
- UI language.

## Outputs

- Goal sentence, two-minute minimum action, trigger, recovery plan, weekly schedule, and tracking checklist.
- Copyable/downloadable habit-plan text.
- Print/PDF-ready plan and checklist via the native browser print interface, without creating or uploading a document server-side.

## State and persistence

Current habit inputs and generated plan are page-session state. The selected language is stored using the shared `nw_lang` localStorage key. The current contract does not include persistent habit completion history.

## Privacy and network behavior

Habit-plan generation is deterministic and runs in the browser; user-entered goal/obstacle text is not intentionally submitted to an application backend. Suite-wide advertising and analytics resources may load independently.

## Language mode

`bilingual single-page`

JP/EN controls switch the same planner, and generated plan text is produced in the active language.

## Layout class

`mobile-oriented`

The planner is a vertical control-and-result workflow designed to remain usable on narrow screens.

## Limits and non-goals

- The tool provides planning prompts, not medical, mental-health, coaching, or behavior-change guarantees.
- It does not send reminders or notifications and does not track actual completion over time.
- Presets and recovery suggestions are deterministic examples rather than personalized professional advice.

## Acceptance criteria

- [ ] Initial English is correctly applied after dynamic controls render, and native Print/PDF outputs only the active-language plan and checklist (no form/ads/donations).

- [ ] Goal/time/day/obstacle/motivation changes update the generated deterministic plan and weekly schedule.
- [ ] Each built-in preset populates the corresponding representative inputs and produces a plan without an AI request.
- [ ] Checklist-length changes are reflected in the visible and copied/downloaded plan.
- [ ] JP/EN switching preserves all planner controls and generated-plan functionality.

## Implementation evidence

- `tools/habit-plan-generator/index.html`
- `tools/habit-plan-generator/app.js`
- `tools/habit-plan-generator/tests/behavior.test.mjs`
- `tools/habit-plan-generator/style.css`
