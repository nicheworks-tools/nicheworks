# CSV Tidy correctness checkpoint — 2026-09-17 UTC

Latest result: G9-only continuation below (2026-09-18): 49 passing tests, 2 remaining KNOWN GAP cases. Earlier sections retain historical evidence.

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

## G3-only continuation — 2026-09-18 UTC

Workspace recovery found local HEAD `4f00e990f06fd3bc9332a629859bac09e069ef52`, no staged changes, and no partial CSV Tidy G3/G6 work. Remote branch remained `ca1df30427d4ce9ecec8697382a4597e94b783d9`. Local branch was fast-forwarded to that preserved checkpoint without changing unrelated working-tree deletion. No commits after that checkpoint existed at recovery.

G3 root cause: nonfatal decoding silently inserted replacement characters, and replacement-character frequency was used as an encoding heuristic. The strict decoder now distinguishes malformed bytes from unsupported decoder construction. AUTO honors UTF-8 BOM, strictly validates fallback, and rejects differing valid interpretations pending explicit selection. The original sparse-Japanese and malformed-byte fixtures were retained as desired-behavior assertions.

Before source correction, focused G3 tests: 5 executed, 2 passed / 3 failed. Initial full run after correction: 38 passed / 1 failed, because the new UTF-8 Japanese test incorrectly assumed AUTO could uniquely identify BOM-less bytes. Native strict decoders demonstrated both interpretations are valid with different text. The test now requires the policy's ambiguity error, then verifies manual UTF-8 preserves the expected matrix; the implementation was not weakened to accept ambiguous bytes.

Final executed commands:

```sh
node tools/csv-tidy/tests/behavior.test.mjs
node --test tools/csv-tidy/tests/checkpoint.test.mjs
git diff --check
```

Original suite passed. **39 checkpoint tests passed / 0 failed / 0 skipped / 0 todo**: 34 desired-behavior tests, 5 KNOWN GAP characterizations (G4/G5/G6/G8/G9). Independent Python `csv.reader` checks passed for **26 Blobs**: the preserved 25 plus one actual AUTO SJIS → UTF-8 output. BOM/newline/quoting/leading-zero/source-byte assertions continue passing.

New G3 tests cover actual UTF-8 ASCII/Japanese/BOM bytes, invalid UTF-8 `ff`, truncated SJIS `81`, SJIS Japanese bytes, sparse SJIS following 2,000 ASCII characters, `c2a9` ambiguity, BOM authority, explicit encoding selection and AUTO. A test-only decoder constructor double verifies unsupported SJIS is distinct from invalid bytes and does not prevent valid UTF-8 use. Real browser support is unverified.

No G6 implementation/tests/status changes were made. G1/G2/G7 were not reimplemented. G4/G5/G8/G9, browser/responsive/performance/SEO work and final PR are outside this session.

## G6-only continuation — 2026-09-18 UTC

Local and remote starting HEAD both `12512320d0e941c3246fb9af0f7f009b1d05a73f`; no staged changes, partial CSV Tidy work, or later commits at recovery. Only the previously known unrelated working-tree deletion existed and was untouched. Remote main observed at `3f0760aa4da260225a1d1c82961a45a0365b2f8b`; no main integration.

Root causes: load padded every row to maximum width and substituted `col_N` for empty source headers. Only those G6 paths and a dedicated width-error export guard changed. The G6 bad-behavior characterization was replaced by four acceptance tests. Before repair, focused G6 run: **1 pass / 3 failures**. After repair, full original behavior suite passed; checkpoint **42 pass / 0 fail / 0 skip / 0 todo**. Four KNOWN GAP characterizations remain: G4/G5/G8/G9.

Executed:

```sh
node tools/csv-tidy/tests/behavior.test.mjs
node --test tools/csv-tidy/tests/checkpoint.test.mjs
git diff --check
```

Coverage:

- Too-short, too-wide and actual blank logical records under both header modes and all three explicit delimiters (18 combinations). Quoted comma and embedded newline in the preceding valid record verify logical record numbering. Expected/actual field counts, no accepted normalized matrix, no export, and source byte equality are asserted. The original `,b\nx\ny,z,extra\n` fixture is retained and now rejects logical record 2.
- Single empty header, multiple empty headers, duplicate names mixed with an empty name: positional IDs/indices, preview model, output, explicit rename and reverse order are checked independently.
- Header OFF retains every source record, preserves correct-width empty-field records, and exports no generated labels.
- Width rejection cannot be bypassed by clearing displayed text; a valid reload resumes export. This is the narrow G6 gate only. The general G9 characterization remains unchanged and passing as an unresolved finding.

**34 independent Python Blob reparses matched**: preserved 26 plus six empty/duplicate-header outputs (three fixtures before/after editing), one header-OFF empty-record output and one valid reload after width rejection. G1/G2/G3/G7 regressions were not edited and remain passing. No browser/responsive/performance/SEO work or overall acceptance claim.


## G8-only continuation — 2026-09-18

Recovered local/remote branch HEAD `881b23eeb4761515650d554c7c88227f4a7c02dc`; no partial CSV Tidy changes or later commits. Local/live main `3f0760aa4da260225a1d1c82961a45a0365b2f8b`. Unrelated deletion left untouched.

Replaced the G8 bad-behavior characterization with five acceptance tests. Initial focused run failed all five on the original implementation. Scope now updates options, and the existing selection predicate gates the shared header/data transformation. Final behavior suite PASS; checkpoint **46 PASS / 0 FAIL / 0 SKIP / 0 TODO**. Remaining KNOWN GAP count **3: G4/G5/G9**.

Acceptance covers first/reversed/no selection and ALL scope; trim, repeated spaces/TAB, both width directions and combined rules; duplicate/empty headers; reorder + manual rename + exclusion; separate header/data width targeting; header OFF; Japanese text, leading zeroes, embedded quotes/newlines and unchanged source bytes. The scope-control change event is exercised. This is VM/model integration evidence, not browser certification.

The 16 new actual export Blobs match preview/full output models and independent Python `csv.reader` expectations: four trim/scope cases, four rule combinations, four positional-header/edit cases, three width-target combinations and one header-OFF case. Together with the preserved 34, **50 independent reparses match**. Existing G1/G2/G3/G6/G7 regressions remain unchanged and passing. No G4/G5/G9, browser, responsive, performance or SEO work.


## G9-only continuation — 2026-09-18

Local and remote checkpoint `ce11d6413c2656b6eb062f6d6d286a41b13bc97a` matched, with no partial CSV Tidy changes, staged changes or later commits. Initial behavior suite PASS and checkpoint 46 PASS / 0 FAIL / 0 SKIP / 0 TODO. Fetched origin/main `f4ca9c241e5f1e1666b6648d3f3c7283ca8fc5fa`; no merge/rebase. Unrelated old-kanji deletion remains untouched.

Root cause: load updated filename/raw text/resolved delimiter before validation while retaining old rows on failures. Candidate preparation now remains local until complete acceptance. Explicit load state gates the output model and production download; button state or cleared error text cannot bypass it. Structured failure details survive attempted downloads. Successful replacement resets errors. Reset clears document identity/data and invalidates pending reads. A generation token prevents obsolete read callbacks from accepting data or changing the newer load state.

Replaced G9 characterization with four acceptance tests covering eight validation-failure cases, three FileReader double failure modes (error/abort/synchronous throw), metadata coherence, repeated recovery, in-flight export rejection, reversed read completion, reset while pending and recovery after reset. FileReader callbacks are exercised with controlled doubles; this does not certify native browser file IO. Built-in samples use the same file-input change handler by source inspection.

Final behavior suite PASS; **49 PASS / 0 FAIL / 0 SKIP / 0 TODO**. **55 Python independent Blob reparses matched** (preserved 50 plus A/B/C, latest-read output and post-reset output). G1/G2/G3/G6/G7/G8 tests remain unchanged and pass. Remaining KNOWN GAP: **G4/G5 only**. No browser, responsive, performance, SEO or final PR work.
