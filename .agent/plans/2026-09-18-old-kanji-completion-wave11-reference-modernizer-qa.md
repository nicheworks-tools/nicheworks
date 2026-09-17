# Old Kanji Completion Wave 11 — Reference + Modernizer functional QA

## Baseline
- Start from current main `aced6c56a670582ee948dd70058e4da625469f7d`.
- Scope is limited to `tools/old-kanji-reference/`, `tools/kanji-modernizer/`, their behavior tests, and directly related Old Kanji runtime-contract evidence.
- Wave 10 data-governance rules remain authoritative. Do not guess or expand dictionary mappings in this wave.

## Objective
Turn the Reference and Modernizer specifications into executable product truth. Verify primary flows, edge/error states, cross-tool handoff behavior, persistence, exports/copy behavior, and dictionary consistency; fix only defects demonstrated by the QA.

## Initial findings to verify
1. Kanji Modernizer currently trims textarea input before conversion, which can destroy leading/trailing spaces and newlines even though the tool accepts arbitrary text.
2. The `?q=` auto-convert path appears to click the Convert button before asynchronous dictionary initialization has re-enabled it, so the Reference → Modernizer handoff may populate text without actually converting it.
3. Old Kanji Reference detector handoff trims text before putting it into `?q=`, which can likewise lose boundary whitespace.
4. Old Kanji Reference export `dataStatus` is derived from metadata presence rather than the record's verified flag; verify and correct if the exported status can contradict the visible verification state.
5. Reference detector lookup is O(text × entry-count); cover a bounded large-input case and remove avoidable repeated full-list scans if needed.
6. Parsed Reference and Modernizer conversion dictionaries should stay synchronized unless a documented product reason says otherwise.

## Required QA
### Old Kanji Reference
- dictionary build/search modes and filters;
- old/new/reading/meaning/Unicode lookup behavior;
- detector hits/counts/highlighting and empty state;
- detector → Modernizer handoff preserving full text;
- favorites/recent/display-mode/quiz storage parsing and persistence boundaries;
- CSV/JSON/Markdown row semantics and escaping;
- no-data/export behavior;
- primary dictionary load failure produces a stable visible error state;
- large detector input remains linear in text length relative to a prebuilt lookup.

### Kanji Modernizer
- Old → Modern replacements and replacement counts;
- Modern → Old Conservative and First-candidate behavior;
- ambiguity review records;
- ASCII/URL/fenced-code exclusions;
- supplementary Unicode text preservation;
- leading/trailing whitespace preservation;
- empty input behavior;
- `?q=` handoff auto-converts after dictionary readiness;
- dictionary load failure disables conversion and Retry can recover;
- reset clears result state and handoff state;
- JP/EN switching does not alter conversion semantics;
- Reference/Modernizer dictionaries remain parsed-equivalent.

## Implementation strategy
- Add `tools/old-kanji-reference/tests/behavior.test.mjs` and `tools/kanji-modernizer/tests/behavior.test.mjs` so the existing discovered behavior-test runner executes both tools in standard CI.
- Expose internal pure helpers to the VM test harness by source transformation inside test files; do not ship public debug APIs.
- Make the smallest implementation changes necessary for confirmed defects.
- Update SPEC acceptance evidence only for criteria actually covered by durable tests/static contracts in this wave; do not mark browser-only criteria complete without proof.
- Record Wave 11 evidence in `tools/OLD_KANJI_COMPLETION_AUDIT.md`.

## Guardrails
- No new individual-kanji pages or SEO inventory.
- No dictionary linguistic repairs without authoritative evidence and a separate data-governance decision.
- Do not weaken existing runtime/SEO/spec CI.
- Do not touch unrelated tools or parallel work.
- Preserve all user text exactly through conversion/handoff except where a documented transform explicitly changes registered kanji.

## Validation
- Run both new behavior tests through `scripts/run-tool-behavior-tests.mjs`.
- Run standard repository CI, including Old Kanji runtime contract and dictionary audit drift checks.
- Verify final diff contains only Wave 11 scoped files.
- Re-read latest main and PR mergeability immediately before squash merge.
