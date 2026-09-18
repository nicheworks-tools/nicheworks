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
| Empty headers | Retain literal empty header or explicitly disclose a user-selected replacement | G6 resolved: literal empty names retained with positional identity |
| Duplicate headers | Keep independent positional columns; make ambiguity visible for import preparation | Positional preservation tested; warning behavior incomplete |
| Unequal field counts | Reject clearly before export, identifying the problematic record; do not silently pad or discard fields | G6 resolved: loader rejects the first mismatch with structured record/width details |
| CRLF / LF / comma / TAB / semicolon | Parse logical records without splitting quoted newlines | Explicit-format fixtures pass |
| Unclosed / misplaced quotes | Reject malformed records with actionable error; do not strip quotes to invent a value | G7 resolved: strict start/unquoted/quoted/closed grammar, located errors |
| Auto delimiter | Ignore candidates inside quoted fields; ambiguity must be visible and manually overridable | G1 resolved: compare strict logical-record interpretations; multiple multi-column candidates require manual choice |
| Auto encoding / invalid bytes | No silent replacement-character decoding; invalid selected encoding must fail; valid-but-ambiguous encodings require user confirmation by inspection | G3 resolved: fatal decoding, validated fallback, explicit selection for differing valid interpretations |
| Empty input / all columns excluded | No exportable result; explain how to load data/include columns | Empty parser case and zero-column export guard tested; rendered states pending |

UTF-8 BOM is handled at the decoding boundary, not by the string parser. Encoding auto-detection cannot prove the original encoding when bytes are valid under multiple encodings. Explicit selection and readable preview remain necessary. Arbitrary delimiter/encoding values are not supported UI inputs.

### Transformation contract

- Reorder/exclude use source column positions, not names. Rename changes output headers, not source rows. With header OFF, all source rows are data and generated display labels are not exported.
- Active cleaning order: leading/trailing whitespace trim → collapse runs of ASCII spaces/TABs → width conversion. Trim may remove whitespace at field boundaries, including newlines; embedded newlines remain.
- Width conversion uses the implemented ASCII-letter/digit/space/punctuation mapping in `convertZenHan`; it is not comprehensive Unicode normalization or kana transliteration. Header/data targeting remains separate.
- Selected-column cleaning leaves unchecked columns literal in the shared preview/export model (G8 resolved at unit/integration level). ALL scope cleans every included column; selected scope uses each column entity’s cleaning selection, independent of its name or output position.
- Manual rename/reorder/exclude are tested together. Existing-template rename/order is verified at unit/integration level (G4 resolved).
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
| G3 | Invalid UTF-8 becomes U+FFFD; 2,000 ASCII characters plus SJIS Tokyo are guessed UTF-8 | RESOLVED (unit/integration) | Fatal decoding and explicit encoding ambiguity; general failed-load state remains G9 |
| G4 | Accounting template writes `outName` while preview uses `name`; Japanese headers do not receive template order | RESOLVED (unit/integration) | Shared current name; per-entity alias mapping and stable canonical grouping |
| G5 | Filtering rendered column items hides excluded names from summary and confirmation; input count changes | RESOLVED (unit/integration) | Shared read-only accepted-state summary for rendering and confirmation |
| G6 | Loader silently pads ragged rows and replaces empty header names | RESOLVED (unit/integration) | First-record width validation, dedicated export gate, literal empty headers |
| G7 | `b"c"d` and `"b"c` are accepted and rewritten | RESOLVED (unit/integration) | Reject invalid_quote/unclosed_quote with logical record, field and UTF-16 offset |
| G8 | Unchecked selected-scope columns still receive cleaning | RESOLVED (unit/integration) | Scope control updates state; shared header/data transformation honors positional column selection |
| G9 | Loading malformed data after good data retains old rows for export | RESOLVED (unit/integration) | Candidate validation, explicit validity/export guard, recovery and stale-read protection |

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

### G3-only continuation — 2026-09-18

Resumed remote `ca1df30427d4ce9ecec8697382a4597e94b783d9`. Only G3 is newly resolved; G4/G5/G6/G8/G9 statuses and behavior remain unchanged. No browser certification or overall acceptance is claimed.

- Explicit UTF-8/Shift_JIS use native `TextDecoder` with `fatal: true`. Invalid bytes produce `decoding_failed` with the selected encoding; unsupported Shift_JIS construction produces `unsupported_shift_jis`, never UTF-8 reinterpretation. Literal correctly encoded U+FFFD remains valid data.
- AUTO strictly validates UTF-8. A UTF-8 BOM is authoritative; malformed subsequent UTF-8 bytes fail without SJIS fallback.
- Without BOM, failed UTF-8 validation permits only a successfully strict-decoded Shift_JIS fallback. The load hint identifies inference and asks users to verify text. Failure of both decoders rejects input.
- If both supported encodings strictly decode to different text, AUTO reports `ambiguous_encoding` and requires manual selection. Identical interpretations (ASCII) use UTF-8. Valid UTF-8 remains usable when the environment lacks Shift_JIS support, with an inference notice.
- Bytes `c2a9` can mean UTF-8 `©` or SJIS `ﾂｩ`. The tested BOM-less UTF-8 `名前,値 / 東京,001` fixture is also valid SJIS with different text, so AUTO correctly requires selection. No perfect detection claim is made; explicit selection can still be semantically wrong even with valid bytes.
- Encoding error details are retained in `state.ui.inputError`. General prior-document retention after a failed load is still unresolved G9, not repaired by this change.

Validation: original behavior suite passes; **39 checkpoint tests pass, 0 fail, 0 skipped, 0 todo**, including **5 remaining KNOWN GAP characterizations**. Actual UTF-8/BOM/SJIS/malformed/ambiguous byte fixtures and a test-only unavailable-decoder double are covered. **26** generated Blobs independently reparse with Python to the expected matrices; source byte fixtures remain unchanged. G1/G2/G7 acceptance regressions remain passing.

### G6-only continuation — 2026-09-18

Starting checkpoint: `12512320d0e941c3246fb9af0f7f009b1d05a73f`. G6 is now **RESOLVED (unit/integration)**. G4/G5/G8/G9 remain unresolved; overall product acceptance and browser verification remain incomplete.

- Header ON: the literal header record establishes expected width. Header OFF: the first data record establishes it. Every later logical record must match, regardless of physical newlines inside quoted cells.
- The low-level parser still returns literal records. Before accepting a loaded matrix, the loader rejects the first width mismatch without padding, truncating or removing records. `state.ui.inputError` retains `{code: 'inconsistent_fields', record, expectedFields, actualFields}`, with a 1-based logical record number.
- A blank line is one empty field. It remains preserved for one-column files and is a width error in a multi-column file, not silently deleted/expanded. Correct-width rows of empty fields remain accepted, including at EOF.
- The dedicated `state.data.widthError` gate prevents export after width rejection until successful load or reset, even if displayed error text changes. This narrow G6 safeguard does not implement general previous-document/failed-new-load transaction management (G9).
- Empty header values remain empty strings in the output model and exported bytes until explicitly renamed. Independent column IDs/source positions preserve duplicate and empty columns. Header-OFF generated `col_N` labels remain display/internal labels and never become an exported header.

Evidence: original behavior suite passes; **42 checkpoint tests pass / 0 fail / 0 skipped / 0 todo**, with **4 KNOWN GAP characterizations** (G4/G5/G8/G9). **34 generated Blobs** independently reparse with Python to expected matrices. No G1/G2/G3/G7 implementation changes, browser work, performance work or final PR.


## G8 selected-column scope continuation — 2026-09-18

Starting checkpoint: `881b23eeb4761515650d554c7c88227f4a7c02dc`. Only G8 is newly resolved. G4/G5/G9 remain unresolved; no overall acceptance or browser verification is claimed.

Root cause: the existing column-selection predicate was unused by the common output model, and the scope control had no state binding. Both are now connected. Selected scope gates trim, repeated ASCII space/TAB normalization and width conversion for both headers and data. The existing header/data target switches still control width conversion separately; they do not disable trim or space normalization. ALL scope ignores per-column cleaning checkboxes, as intended. Existing checked-by-default column behavior is retained.

Cleaning selection stays with the positional column entity through reorder, manual rename and exclusion. Empty/duplicate header values and header-OFF display labels do not determine identity. Excluded columns do not affect included-column targeting. Preview and export continue using the same transformation path; unchecked values remain literal. Source bytes are unchanged.

Evidence: behavior suite PASS; checkpoint **46 pass / 0 fail / 0 skip / 0 todo**, including **3 remaining KNOWN GAP characterizations** (G4/G5/G9). **50 generated Blobs** match expected matrices through independent Python CSV parsing. No parsing/decoding or G4/G5/G9 implementation changes.


## G9 replacement-load safety — 2026-09-18

Starting checkpoint `ce11d6413c2656b6eb062f6d6d286a41b13bc97a`. G9 is **RESOLVED (unit/integration)**. G4/G5 remain unresolved; overall acceptance and browser verification are not claimed.

Load status is explicit: empty, loading, valid or invalid. Input settings are captured for each candidate. Bytes, decoded text, delimiter, parsed rows and columns are validated locally before the accepted filename, raw text, resolved encoding/delimiter, rows and columns are committed together. Input controls remain settings; resolved metadata describes only the accepted document. Earlier accepted data may remain internally after failure but is not a current valid document: its preview is cleared, output model is empty and the production download function refuses output independently of button/error text.

All candidate failure paths retain structured inputError information and invalidate export, including read error/abort, decode failure/ambiguity, delimiter/quote errors, empty input and G6 width rejection. G3 policy and G6 structured width guard remain intact. A fully successful load clears errors and permits only the new document to export. Generation identity ignores superseded asynchronous reads; reset invalidates pending reads and clears data/identity/errors. Built-in sample insertion dispatches the same file-input change path; no sample browser behavior is certified here.

Evidence: behavior suite PASS; checkpoint **49 PASS / 0 FAIL / 0 SKIP / 0 TODO**, including **2 remaining KNOWN GAP cases (G4/G5)**. **55 actual export Blobs** independently reparse to expected matrices using Python, including repeated A/failure/B/failure/C recovery, latest-read acceptance and recovery after reset. Source byte fixtures remain unchanged. No browser/responsive/performance/SEO work.


## G4 template mapping — 2026-09-18

Starting checkpoint `4b425020e6d7cb31f25018ff900f114bbe99bba1`. G4 is **RESOLVED (unit/integration)**; G5 alone remains KNOWN GAP. Overall product acceptance/browser verification remain pending.

`c.name` is the single current output-header value used by the editor, manual/template rename, preview/export and mapping warnings (including active header cleaning). Template aliases match current names, not immutable historical names: a manually changed matching alias maps, an unrelated custom name remains unchanged, and later manual edits replace the same value. Column IDs/source positions remain unchanged.

Every matching column is renamed independently, including duplicate aliases. Ordering groups all canonical matches in template order, preserving pre-application relative order within each group. Unmatched/empty columns follow in their existing relative order. Excluded entities participate in mapping/order without being emitted; no non-listed column is automatically excluded. Reapplying an existing template is stable. Header OFF is an explicit warned no-op and does not consume data or generate exported headers.

Evidence: behavior PASS; **52 checkpoint PASS / 0 FAIL / 0 SKIP / 0 TODO**, with **1 KNOWN GAP (G5)**. **64 Blob outputs** independently matched Python CSV matrices. Accounting canonical/shuffled Japanese, EC canonical/shuffled Japanese, generic/manual edits, duplicates/alias collisions, empty/unknown/excluded columns and header OFF are covered. Correctly mapped Accounting/EC has no false missing warning. No templates/features or browser/responsive/performance/SEO work added.


## G5 state-derived summary — 2026-09-18

Starting checkpoint `f58f764aea893fbda56af3fd327c1d559737cd22`. G5 is **RESOLVED (unit/integration)**. **KNOWN GAP: 0 does not equal Product accepted.**

The app exposes a read-only summary snapshot consumed by complete.js. Input columns count all accepted column entities; output columns count non-excluded entities; exclusions retain every excluded entity in current output order. Names use the same current header and cleaning semantics as output. Empty names have a display-only, source-position fallback (Column N / 列 N); duplicate names remain repeated and actual headers are unchanged. Cleaning selection is independent of inclusion. Search only filters the editor view and cannot change summary or confirmation.

Rows mean actual preview data rows, bounded by previewN and accepted data row count, excluding the source header when enabled. They are not total-file counts. Header OFF counts all records as data and exports no synthetic header. Loading/invalid/empty state returns no current summary or stale exclusions; G9 still guards download. Existing UI structure, output-option labels and refresh hooks remain in place.

Evidence: behavior PASS; **55 checkpoint PASS / 0 FAIL / 0 SKIP / 0 TODO** and **68 independent Python Blob reparses matched**. Search/clear invariance, hidden-exclusion confirmation/cancel, template/manual names, duplicates, empty fallback, reorder, language, header OFF and failed-load/reset/recovery are covered. Remaining verification: real browser file workflow, download/reopen, error/recovery UI, keyboard/focus/accessibility, 1440/1024/768/375/320 operation, realistic scale/performance/memory. No browser or performance verification is claimed.
