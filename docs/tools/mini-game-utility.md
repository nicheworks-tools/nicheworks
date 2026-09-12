# Mini Game Utility — canonical tool specification

- **Slug:** `mini-game-utility`
- **Display name (JA):** ミニゲーム補助ツール
- **Display name (EN):** Mini Game Utility
- **Implementation:** `tools/mini-game-utility/`
- **Registry state:** active (registered implementation present)
- **Category:** game, utility, planning, browser
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `mini-game-utility` implementation at `/tools/mini-game-utility/`. It does not authorize a production rewrite.

## 2. Purpose

Provide a simple browser timer and persistent score log for lightweight games, events, or manual scorekeeping.

## 3. Inputs

- Player or team name.
- Numeric score.
- Timer controls.
- JP/EN language selection.

## 4. Processing behavior

- Start, pause, and reset a count-up timer displayed as minutes and seconds.
- Increment the timer once per second while running.
- Record player/team name, numeric score, and the browser-local timestamp.
- Use `Player` when the name is blank and `0` when the score is not a finite number.
- Store newest score entries first and retain at most 50 entries.
- Export current score history as CSV with `name,score,time` columns.
- Clear all stored score history.
- Switch JP/EN UI labels.

## 5. Outputs

- Live `MM:SS` timer display.
- Human-readable score history.
- `mini-game-scores.csv` export.

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

Timer and score processing are local to the browser. Score entries are not sent to a tool backend. Page-level advertising resources may load separately.

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- The timer, two score inputs, actions, and history are a compact single-column utility.
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- NEEDS_DECISION — language switching details are not documented.
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/mini-game-utility/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

- [ ] Start does not create duplicate intervals when the timer is already running, and pause stops further ticks.
- [ ] Reset returns the timer to `00:00` without deleting score history.
- [ ] Adding more than 50 scores retains only the newest 50 in localStorage.
- [ ] CSV export contains the current stored score history and does nothing when history is empty.

Automated test evidence: `scripts/check-tool-runtime-contracts-wave4.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/mini-game-utility/index.html`
- `tools/mini-game-utility/app.js`
- `tools/mini-game-utility/style.css`
