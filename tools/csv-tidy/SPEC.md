# CSV Tidy — Product Contract

- Slug: `csv-tidy`
- Public URL: `https://nicheworks.app/tools/csv-tidy/`
- Status: **checkpoint; product acceptance is incomplete**. Passing characterization tests do not certify safe completion of the workflow.
- Investigation base: `4f00e990f06fd3bc9332a629859bac09e069ef52`.
- Common specification: `common-spec/spec-ja.md`; sections 9/9-9 supersede conflicting earlier generic layout/language rules. Preserve the later explicit AdSense review rules, privacy constraints, and section 10 explanation hierarchy. No shared-page changes in this checkpoint.

## Primary Job and target user

Office/data users have a CSV exported by one system and need a new CSV for import or reuse in another system. CSV Tidy is a focused, local import-preparation workbench: load → confirm encoding/delimiter/header → adjust columns/cleaning → inspect preview and omissions → download. It must not alter the source or silently corrupt fields.

## Completion Definition

The user can reopen the generated UTF-8 CSV with the intended records, field values, column order, header names and explicit exclusions intact. The output matches the preview and selected delimiter, quoting, BOM and record-newline settings. Any lossy interpretation, rejected input or unresolved ambiguity is apparent before export. Producing a Blob alone is not completion. Destination-specific schema validation and successful import into every external system are not promised.

## Required capabilities and existing surface

Preserve local file loading and built-in samples, UTF-8 and environment-dependent Shift_JIS input, automatic/manual comma/TAB/semicolon selection, header on/off, column reorder/rename/include/exclude, trim, repeated-space normalization, limited full-width/half-width conversion, input/output preview, output summary and separate UTF-8 download. Keep existing search/bulk controls and example templates; templates are not universal accounting/EC schemas.

Current defaults are header ON, trim ON, width conversion ON for headers and data, BOM ON and CRLF output. These are intentional transformations, not a promise of identity output. A no-cleaning workflow must preserve literal values including leading zeroes. Column identities are positional; duplicate names must not merge columns.

### Parsing and input contract

The following are acceptance requirements, with current evidence/status called out explicitly:

| Input concept | Required interpretation | Checkpoint status |
| --- | --- | --- |
| UTF-8 / UTF-8 BOM | Decode UTF-8, consume initial byte-order mark | Tested in Node through actual decoder/load functions |
| Shift_JIS | Decode actual bytes when TextDecoder supports it; otherwise clear unsupported-encoding error | Japanese byte fixture passes in Node; browser support/error path pending |
| Quoted delimiters / doubled quotes / quoted LF or CRLF | Preserve delimiter, quote and newline characters within fields | Explicit-delimiter parser fixtures pass |
| Empty / trailing cells | Preserve field count and empty strings | G2 resolved: explicit empty records/cells preserved |
| Blank records | Do not silently delete actual records; final record terminator alone is not an additional record | G2 resolved: no load-time blank-record removal |
| Empty headers | Retain literal empty header or explicitly disclose a user-selected replacement | G6; current load silently generates `col_N` |
| Duplicate headers | Keep independent positional columns; make ambiguity visible for import preparation | Positional preservation tested; warning behavior incomplete |
| Unequal field counts | Reject clearly before export, identifying the problematic record; do not silently pad or discard fields | G6; parser exposes widths, loader currently pads to maximum width |
| CRLF / LF / comma / TAB / semicolon | Parse logical records without splitting quoted newlines | Explicit-format fixtures pass |
| Unclosed / misplaced quotes | Reject malformed records with actionable error; do not strip quotes to invent a value | G7 resolved: strict start/unquoted/quoted/closed grammar, located errors |
| Auto delimiter | Ignore candidates inside quoted fields; ambiguity must be visible and manually overridable | G1 resolved: compare strict logical-record interpretations; multiple multi-column candidates require manual choice |
| Auto encoding / invalid bytes | No silent replacement-character decoding; invalid selected encoding must fail; valid-but-ambiguous encodings require user confirmation by inspection | G3; current ratio heuristic can misdecode sparse Japanese content |
| Empty input / all columns excluded | No exportable result; explain how to load data/include columns | Empty parser case and zero-column export guard tested; rendered states pending |

UTF-8 BOM is handled at the decoding boundary, not by the string parser. Encoding auto-detection cannot prove the original encoding when bytes are valid under multiple encodings. Explicit selection and readable preview remain necessary. Arbitrary delimiter/encoding values are not supported UI inputs.

### Transformation contract

- Reorder/exclude use source column positions, not names. Rename changes output headers, not source rows. With header OFF, all source rows are data and generated display labels are not exported.
- Active cleaning order: leading/trailing whitespace trim → collapse runs of ASCII spaces/TABs → width conversion. Trim may remove whitespace at field boundaries, including newlines; embedded newlines remain.
- Width conversion uses the implemented ASCII-letter/digit/space/punctuation mapping in `convertZenHan`; it is not comprehensive Unicode normalization or kana transliteration. Header/data targeting remains separate.
- Selected-column cleaning must leave unchecked columns untouched; currently G8. Whole-table cleaning combinations are covered.
- Manual rename/reorder/exclude are tested together. Example-template rename/order is currently G4 and is not a supported guarantee yet.
- Settings that reparse the file currently rebuild columns and edits. Their rendered reset behavior and accidental edit-loss risk require the next phase; no persistence/history promise is made.

## Output guarantees and their evidence boundary

The narrow export correction in this checkpoint joins the production preview model's headers/data into the serialization matrix, uses the resolved input delimiter, honors the existing output controls, and rejects zero included columns. Final results are recorded in `tests/CHECKPOINT.md`.

Required guarantees:

1. Preview rows and exported rows share one transformation path; export contains all accepted data rows, not only the preview's 20/50 rows.
2. UTF-8 output uses the selected BOM ON/OFF; same-as-input uses the resolved comma/TAB/semicolon, never the literal word `auto` or `tab`.
3. Needed quoting encloses delimiters, double quotes and CR/LF; quotes are doubled. Always-quote encloses every field. Selected LF/CRLF controls record separators and the final terminator, without rewriting embedded field newlines.
4. Header OFF emits no synthetic header; header ON emits the transformed header exactly once.
5. Source bytes are read only. No writes to the selected source are performed; download creates a separate Blob/file.
6. Errors must not result in a partial or stale CSV being presented as the latest successful output.

These are **not an unconditional guarantee for today's full UI**: Unresolved gaps below prevent overall acceptance. Unit/integration tests execute production functions with a minimal DOM/FileReader/URL boundary and capture Blob bytes. Python's independent standard-library `csv.reader` reparses those bytes. Browser download handling, rendered preview, download failure recovery and source-file behavior in real browsers remain unverified.

## Required failure and warning behavior

Reject unreadable/empty files, undecodable bytes, malformed quotes, inconsistent widths, invalid internal delimiter selection and zero-column results with a concise bilingual explanation: what failed, source unchanged, and a recovery action (choose encoding/delimiter, fix source CSV, include columns, retry).

A failed new load must invalidate export of the failed input or clearly retain/label a previous successful document; currently G9 retains old rows without a safe export-state distinction. Successful-looking hints must not mask failures. Empty/duplicate header ambiguity and exclusions must remain visible even when column search hides rows. Auto guesses are guesses, not guarantees. A warning does not authorize silent lossy repair.

## Confirmed gaps — deferred acceptance work

All classifications below are based on deterministic tests of current production functions, not speculation. `KNOWN GAP` tests intentionally assert the observed bad behavior; replace each with a desired-behavior regression when fixed.

| ID | Finding | Classification / severity | Next work |
| --- | --- | --- | --- |
| G1 | Semicolon CSV containing many commas inside a quoted field is guessed as comma | RESOLVED (unit/integration) | Strict candidate parses; ambiguous_delimiter requires manual selection |
| G2 | `a,b\n,` loses its last record; loader also removes middle all-empty records | RESOLVED (unit/integration) | Preserve records; quote singleton empty values on export for independent reparse |
| G3 | Invalid UTF-8 becomes U+FFFD; 2,000 ASCII characters plus SJIS Tokyo are guessed UTF-8 | CONFIRMED GAP / BLOCKER | Strict decode and safe encoding selection/failure state |
| G4 | Accounting template writes `outName` while preview uses `name`; Japanese headers do not receive template order | CONFIRMED GAP / CORE GAP | One column-name/mapping source of truth, duplicate-safe matching |
| G5 | Filtering rendered column items hides excluded names from summary and confirmation; input count changes | CONFIRMED GAP / UX GAP | Compute counts/exclusions from full data state, not filtered DOM |
| G6 | Loader silently pads ragged rows and replaces empty header names | CONFIRMED GAP / BLOCKER | Reject ragged records; preserve/disclose empty headers |
| G7 | `b"c"d` and `"b"c` are accepted and rewritten | RESOLVED (unit/integration) | Reject invalid_quote/unclosed_quote with logical record, field and UTF-16 offset |
| G8 | Unchecked selected-scope columns still receive cleaning | CONFIRMED GAP / BLOCKER | Wire scope and honor it in shared transformation path |
| G9 | Loading malformed data after good data retains old rows for export | CONFIRMED GAP / BLOCKER | Transactional load/clear failure state and repeated-load regression |

Additional confirmed export blocker: `downloadCSV` passes the preview model object to an array serializer, throwing `rows.map is not a function`. It also reads BOM/newline from wrong state locations, uses unresolved input delimiter, and ignores the always-quote option. The preserved checkpoint repaired that export path. Current resolved/unresolved statuses are listed above.

Specification gaps corrected here: the previous `complete` label, vague malformed-CSV limitation, missing completion/record-loss policy, missing preview-to-byte acceptance, and absent measured-scale qualifications.

## Feature decisions

REQUIRED work concerns correctness of the current workflow: preserve data/records, reject unsafe interpretations, consistent column state, accurate summary/exclusions, functioning output options and reliable failure state. It does not imply a larger feature set.

| Candidate addition | Decision | Reason |
| --- | --- | --- |
| Remove blank rows | JUSTIFIED, deferred | Common import friction; must be explicit opt-in with count/preview, never unconditional load-time deletion |
| Remove duplicate rows | OPTIONAL | Legitimate repeated records exist; not required for column preparation |
| Deduplicate by selected key | REJECT for this product scope | Needs conflict/survivor/business rules beyond this workbench |
| Find/replace | OPTIONAL | Useful for some datasets; current job can be completed without a general editor |
| Regex replace | REJECT | Adds complex destructive editing and validation burden |
| Null/empty normalization | OPTIONAL | Destination-specific semantics; empty string must not implicitly become null |
| Split columns | OPTIONAL | Some import schemas need it, but not baseline column organization/cleaning |
| Merge columns | OPTIONAL | Destination-specific mapping, not needed to establish this focused job |
| Type conversion | REJECT | Avoid coercing identifiers/leading zeroes or introducing spreadsheet typing |
| Date normalization | OPTIONAL | Requires explicit formats/ambiguity policy; no implicit date guessing |
| Saved presets | OPTIONAL | Potential repeated-use convenience, no demonstrated requirement here |
| Transformation history | REJECT for this wave | General editing infrastructure; source preservation and safe state handling come first |

No optional/rejected additions are implemented. No substantial justified feature is implemented in this checkpoint. Repository evidence and concrete corruption/output findings suffice to define this scope; further competitor research is not necessary to decide these correctness requirements.

## Privacy, language, responsive class and practical limits

- Static/browser-first under `tools/csv-tidy/`; no uploads, backend, accounts, cloud storage or AI. Do not transmit CSV content through analytics/logging. Existing advertising/analytics resources are distinct from CSV processing.
- Current-page state only; reload discards work. JP/EN single-page workflow is retained.
- `pc-oriented`: preserve a wide desktop column workbench and table preview; narrow widths need reachable controls and contained horizontal table scrolling. Common spec 9-2 PC rules override a generic 600px mobile-tool interpretation.
- Preview selects 20/50 data rows. This is **not** a file-size/memory bound: parsing/loading/export remain whole-file operations. No tested maximum bytes/rows/columns, browser freeze guarantee or memory guarantee exists yet.
- Environment-dependent: Shift_JIS TextDecoder support, FileReader/download APIs, sample File/DataTransfer path and clipboard-independent saving. Node coverage is not browser certification.
- Non-goals: spreadsheet/grid editing suite, formulas, database/BI/ETL platform, arbitrary encoding conversion, automatic business-rule repairs, AI cleaning, cloud service, history/accounts. Values are strings; downstream spreadsheet formula evaluation and destination type inference are not neutralized or validated here.

## Acceptance scenarios and checkpoint execution scope

1. Normal UTF-8/BOM input → reorder/rename/exclude/clean → output preview model → actual export Blob → independent Python reparse equals the explicit matrix.
2. Same matrix under comma/TAB/semicolon, BOM ON/OFF and LF/CRLF; header OFF and always-quote preserve Japanese/leading zeroes and embedded comma/newline/quotes.
3. Actual SJIS bytes decode Japanese in a supporting runtime. Browser support and unsupported-decoder error remain later checks.
4. Core parser fixtures preserve ordinary empty/trailing cells, quoted records and positional duplicate headers. Resolved gaps have acceptance tests; remaining KNOWN GAP tests describe unresolved behavior, not acceptance approval.
5. Later phase must replace gap characterizations, verify actual browser workflows/errors/downloads, test 1440/1024/768/375/320 widths and progressively measure realistic larger data before claiming full completion.

Checkpoint plan (kept here to respect the explicitly limited CSV Tidy file scope): finish unread source → reproduce suspicions → establish this contract → apply only small export correction → run original and new tests → commit explicit CSV Tidy paths and remotely preserve the branch. No final PR, UI redesign, broad browser matrix, performance benchmark, SEO or monetization work in this phase.

### Data-integrity repair evidence — group A

G1/G2/G7 now pass desired-behavior regressions. Delimiter detection parses each of comma/TAB/semicolon with strict quote grammar across logical records. Exactly one multi-column interpretation wins; several require manual selection (even when one has more uniform widths). Equivalent single-column interpretations default to comma. No raw-frequency guess is made. Row-width acceptance remains a separate loading concern.

Quoted fields must start at field start; only a delimiter, record terminator or EOF may follow a closing quote. Errors expose 1-based logical `record` and `field`, plus 0-based UTF-16 code-unit `offset`. `state.ui.inputError` retains structured parser/detection details for the later UI phase. Blank lines represent one empty field; singleton empty output fields are quoted so independent readers preserve the record.

Group A: original behavior suite passed; checkpoint 35 passed / 0 failed / 0 skipped, with 6 remaining KNOWN GAP characterizations. Independent Python reparse now covers 25 generated Blobs. Browser verification remains deferred.
