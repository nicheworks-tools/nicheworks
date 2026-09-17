# CSV Tidy correctness checkpoint — 2026-09-17 UTC

Base: `4f00e990f06fd3bc9332a629859bac09e069ef52`.
Branch: `feat/csv-tidy-product-quality-20260917`.
One live API check found main at `02c677f09e2b7c4ee61392c529b03c532a0dbafb`; no rebase/merge performed. This evidence applies to the base above plus the scoped checkpoint changes, not newer main.

## Executed evidence

Runtime: Node v24.19.0, Python 3.12.14.

```sh
node tools/csv-tidy/tests/behavior.test.mjs
node --test tools/csv-tidy/tests/checkpoint.test.mjs
git diff --check
```

- Original behavior suite: `CSV Tidy behavior test passed.`
- First new-suite run before the narrow source fix: 29 tests, 26 passed, 3 failed. The combined export, header-OFF Japanese export, and all-excluded cases all failed with `TypeError: rows.map is not a function` from `stringifyCSV` called by `downloadCSV`.
- After export correction and three additional boundary/encoding scenarios: **32 tests passed, 0 failed, 0 skipped, 0 todo**.
- Of these 32, **9 are KNOWN GAP characterizations**, deliberately proving the current bad behavior described as G1–G9 in SPEC. The other 23 assert supported behavior/guards. This is not full product acceptance. Replace each characterization with a desired-behavior test when repairing its gap; do not preserve the bug merely to keep the characterization green.
- `git diff --check`: no errors.

## Fixtures and output oracle

`core-fixtures.json` contains 13 explicit input/expected-matrix parser cases: UTF-8 Japanese/leading zeroes, CRLF, quoted delimiter, escaped quotes, embedded LF and CRLF, empty/trailing cells, blank row, empty header, duplicate header, ragged records, TAB and semicolon. Other minimal byte/invalid/transform fixtures are inline in `checkpoint.test.mjs`.

Actual SJIS bytes `96bc914f2c926c0a938c8b9e2c3030310a` decode to `名前,値\n東京,001\n` in this Node runtime. A second fixture with 2,000 ASCII characters and SJIS Tokyo proves that auto-detection can incorrectly select UTF-8. These are actual byte fixtures, not UTF-8 strings labeled SJIS.

Twenty-two generated Blobs are independently reparsed with Python standard-library `csv.reader(strict=True)` via UTF-8-SIG decoding and `newline=''`:

- 16 combined reorder/rename/exclude/trim/repeated-space/width-conversion outputs: 4 delimiter control modes × BOM ON/OFF × CRLF/LF. Exact bytes/record separators and parsed matrix checked; embedded comma, newline, doubled quotes and leading zeroes included.
- 1 header-OFF Japanese TAB output with resolved auto delimiter and always-quote.
- 1 output of 23 records, exceeding the 20-row preview limit; full matrix checked.
- 3 outputs checking disabled cleaning, half-to-full width and separate header targeting.
- 1 SJIS-input-to-UTF-8 output with Japanese text and renamed header.

The fixture source byte buffer remains identical after combined transformation/export. This verifies the programmatic boundary, not operating-system file handling in a rendered browser.

## Harness scope

`checkpoint-harness.mjs` executes the actual production `app.js`/`complete.js` in Node VM contexts and exposes internal functions only in test-loaded source. It uses persistent small element doubles, a read-only FileReader double, and URL capture of real Blobs. Production transformations and serialization are not reimplemented in the test.

The summary test calls production `renderSummary`/`excludedNames` with a deliberately filtered column DOM fixture. It proves those functions change input/exclusion counts when DOM items are hidden by filtering; it does not simulate browser layout or certify event timing.

No timers/layout/navigation/download UI are simulated as proof of browser completion. No remote upload, new framework or dependency was introduced. Python 3 is required for the new independent-reparse tests; failure to start it is a test failure, not a skipped pass.

## Narrow fix and unresolved work

Only export assembly/options were repaired: model object → header/data matrix, actual resolved input delimiter, existing output select values, nested BOM/newline settings, always-quote, zero-column/invalid-delimiter guards. No parsing/loading/template/summary rewrite occurred.

Next implementation phase: G1 quote-aware detection; G2 record preservation; G3 strict decoding; G4 template naming/order; G5 data-driven summary/exclusions; G6 ragged/empty-header policy; G7 strict quotes; G8 selected-column scope; G9 safe failure/reload state. Required output/failure guarantees in SPEC remain incomplete until these are resolved.

Later verification: real FileReader/sample paths, browser download/reopen, unsupported-decoder and unreadable-file messages, repeated execution/reset state, keyboard/focus, desktop and 768/375/320 controls, progressive realistic size/column tests and memory/UI responsiveness. No scale limit or performance claim was established. No competitor research was needed to decide the evidenced correctness requirements. No final product-quality PR in this checkpoint.

## Data-integrity continuation — group A (2026-09-17 UTC)

Starting checkpoint `eda8db404b12b0f741e34a9203a69f8e93ce2ec9` was verified unchanged locally and remotely: original suite passed; 32 checkpoint tests passed including 9 KNOWN GAP cases. Live main was `7e517e07d407eb4e358efba95214d46c03f4add8`; all CSV Tidy file/subtree SHAs still matched the original base. No integration of main.

Replaced G1/G2/G7 characterizations with desired behavior and added ambiguity/quoted-logical-record/independent empty-record output checks. Before source repair: 35 tests, 30 passed / 5 failed. After repair: original suite passed; 35 tests passed / 0 failed / 0 skipped. Six KNOWN GAP cases remain (G3/G4/G5/G6/G8/G9). There are now 25 independent Python Blob reparses. The original failing fixtures remain in the acceptance tests, not deleted or weakened.

Parser now enforces quote grammar and reports logical record/field/offset. AUTO compares valid logical-record interpretations and rejects ambiguity. Loader no longer deletes blank records. A single empty output cell is quoted to preserve a one-field empty record for independent CSV readers. No browser, responsive or performance checks were performed.
