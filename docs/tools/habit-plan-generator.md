# Habit Plan Generator — canonical tool specification

- **Slug:** `habit-plan-generator`
- **Display name (JA):** 習慣計画ジェネレーター
- **Display name (EN):** Habit Plan Generator
- **Implementation:** `tools/habit-plan-generator/`
- **Registry state:** active (registered implementation present)
- **Category:** habit, plan, goal, template
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `habit-plan-generator` implementation at `/tools/habit-plan-generator/`. It does not authorize a production rewrite.

## 2. Purpose

Turn a habit goal, available time, preferred days, obstacles, and motivation style into a lightweight weekly habit plan with a minimum action, trigger, recovery plan, schedule, and tracking checklist.

## 3. Inputs

- Goal text.
- Available-time text.
- Preferred weekday selections.
- Obstacle text and motivation style.
- Preset selection and checklist-length controls.
- UI language.

## 4. Processing behavior

- Accept a goal, available time, preferred weekdays, obstacles, and motivation style.
- Provide Exercise, Study, and Sleep presets that populate representative inputs.
- Generate a minimum two-minute action, time/day trigger, recovery plan, and weekly do/rest schedule using deterministic rules.
- Generate a configurable tracking checklist and text version of the plan.
- Provide copy and text-download utilities implemented by the tool.
- Switch the same page between Japanese and English and persist the selected display language in browser localStorage.

## 5. Outputs

- Goal sentence, two-minute minimum action, trigger, recovery plan, weekly schedule, and tracking checklist.
- Copyable/downloadable habit-plan text.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Habit-plan generation is deterministic and runs in the browser; user-entered goal/obstacle text is not intentionally submitted to an application backend. Suite-wide advertising and analytics resources may load independently.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The planner is a vertical control-and-result workflow designed to remain usable on narrow screens.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- JP/EN controls switch the same planner, and generated plan text is produced in the active language.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/habit-plan-generator/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-absent`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-absent`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] Goal/time/day/obstacle/motivation changes update the generated deterministic plan and weekly schedule.
- [ ] Each built-in preset populates the corresponding representative inputs and produces a plan without an AI request.
- [ ] Checklist-length changes are reflected in the visible and copied/downloaded plan.
- [ ] JP/EN switching preserves all planner controls and generated-plan functionality.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/habit-plan-generator/index.html`
- `tools/habit-plan-generator/app.js`
- `tools/habit-plan-generator/style.css`
