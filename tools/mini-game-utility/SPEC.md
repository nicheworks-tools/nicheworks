# Tool Specification — Mini Game Utility

- Slug: `mini-game-utility`
- Public URL: `https://nicheworks.app/tools/mini-game-utility/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

Provide a simple browser timer and persistent score log for lightweight games, events, or manual scorekeeping.

## Current functional contract

- Start, pause, and reset a count-up timer displayed as minutes and seconds.
- Increment the timer once per second while running.
- Record player/team name, numeric score, and the browser-local timestamp.
- Use `Player` when the name is blank and `0` when the score is not a finite number.
- Store newest score entries first and retain at most 50 entries.
- Export current score history as CSV with `name,score,time` columns.
- Clear all stored score history.
- Switch JP/EN UI labels.

## Inputs

- Player or team name.
- Numeric score.
- Timer controls.
- JP/EN language selection.

## Outputs

- Live `MM:SS` timer display.
- Human-readable score history.
- `mini-game-scores.csv` export.

## State and persistence

Score history is stored in localStorage under `nw_mini_game_scores` and capped at 50 entries. Language uses `nw_lang`. Timer elapsed state and running/paused state are not persisted across reloads.

## Privacy and network behavior

Timer and score processing are local to the browser. Score entries are not sent to a tool backend. Page-level advertising resources may load separately.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

The timer, two score inputs, actions, and history are a compact single-column utility.

## Limits and non-goals

- This is not a multiplayer synchronization system or authoritative tournament scoring service.
- Timer precision is based on browser `setInterval` behavior and is not a high-precision stopwatch contract.
- CSV values are emitted directly from recorded values rather than through a full spreadsheet-grade CSV quoting layer.
- Timer state is lost on reload; only score history is durable.

## Acceptance criteria

- [ ] Start does not create duplicate intervals when the timer is already running, and pause stops further ticks.
- [ ] Reset returns the timer to `00:00` without deleting score history.
- [ ] Adding more than 50 scores retains only the newest 50 in localStorage.
- [ ] CSV export contains the current stored score history and does nothing when history is empty.

## Implementation evidence

- `tools/mini-game-utility/index.html`
- `tools/mini-game-utility/app.js`
- `tools/mini-game-utility/style.css`
