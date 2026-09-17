# Astra product-quality baseline — evidence recovery

Recovery date (UTC): 2026-09-17T10:50:50.372389+00:00

Repository: `nicheworks-tools/nicheworks`; branch: `main`; HEAD: `59c95840bdff50cb2660eda12605d0ee1b071dc2`.

Original scratch directory: `/workspace/scratch/0490b207d766/`.

Destination: `.agent/evidence/astra-product-quality-baseline/`.

These are **audit evidence, not production/runtime files**. The seven copied artifacts are byte-for-byte copies, not regenerated output. Python scripts were syntax-checked only and were not executed. Their original absolute scratch paths were deliberately preserved. No product audit, browser evaluation, test rerun, pilot implementation, repair, staging, commit or push was performed in this preservation task.

## Preservation manifest

SHA-256 hashes are of file contents. Source and destination bytes and hashes were verified equal after copy. Source files remain untouched.

| Copied file | Bytes | SHA-256 | Validation |
| --- | ---: | --- | --- |
| [audit-index.json](audit-index.json) | 801680 | `ff0463b34f7755202b69392a12e83caa30ced743e066409c9c226a9692be8dfa` | PASS: complete JSON parses; 88 unique records match current registry; required record fields present. Final newline is absent but not required for JSON. |
| [contracts.tsv](contracts.tsv) | 44046 | `6070b23f7e6e5629fdecaaba612175bad339ce80ddfb84127222b6d53ea6c300` | PASS: existing pipe-delimited format (not tab-separated despite .tsv name); 88 unique rows, 8 nonempty fields; registry matches. |
| [browser-observations.json](browser-observations.json) | 659845 | `ddea4a632d7428cf5708c1521c8954e6203258ed459d9b6c20cd7e003c10e958` | PASS: complete JSON parses; 88 unique records match current registry; required record fields present. Final newline is absent but not required for JSON. |
| [behavior-tests.log](behavior-tests.log) | 8395 | `bd45826c28c6c858dfc2eda057e9c80d1d982bf70e9e49bd392d201f038115d0` | PASS: 19 distinct suite headers and final 19-pass completion sentinel. Tests not rerun. |
| [adsense-check.log](adsense-check.log) | 78 | `1db8eb9a38ae409ad902f5b6e6b8dc379954b8ac5664f10f8986e55adc799ce3` | PASS: complete success record for 2 staged / 88 public tools. Check not rerun. |
| [audit_index.py](audit_index.py) | 2393 | `f2c5129690a1169c641fbb6e3590dd8077d2b4f168672b3cc561c7cef3e3d6ca` | PASS: UTF-8 and Python AST syntax validation; script not executed or regenerated. |
| [build_report.py](build_report.py) | 47123 | `04cd32a1ed1020617d8551a8dc36133dafc205fc5dd6e7670edb3195b7f42546` | PASS: UTF-8 and Python AST syntax validation; script not executed or regenerated. |

All seven requested scratch artifacts were available and preserved; none failed. The copies and this manifest are new, untracked repository files. This task does not claim a remote Git backup or commit.

## Existing baseline artifacts, validated in place

These two files were not rewritten or regenerated. Their hashes establish the preserved versions.

| Artifact | Bytes | SHA-256 | Validation |
| --- | ---: | --- | --- |
| `docs/astra-product-quality-baseline.md` | 188507 | `a1dc25633398d8e58b7d7b3266fbceb688a9557a4517da73e3103ae82a43fbfd` | PASS: UTF-8; 13 sequential sections; 88 unique inventory rows and 88 job cards through A88 Wi-Fi Meter; totals and pilots verified; Appendix B ending intact. Current-worktree assertion is inconsistent, not truncation. |
| `.agent/plans/astra-product-quality-baseline.md` | 3603 | `0e6d7effaee48ddf2936c0ad18168353da630b0d2640d3259a2317dde58e24ba` | PASS: UTF-8; complete seven-section plan and final rollback paragraph. |

## Baseline completeness

The current registry was used only to validate recovered coverage; tools were not re-inventoried. Registered tools: 88. Recovered inventory: 88 unique matching slugs. Appendix A: 88 job cards ending at A88 / Wi-Fi Meter. Report: all 13 requested numbered sections, plus Appendix B ending. Both saved JSON collections have 88 matching records.

Specification confidence: HIGH 17 + MEDIUM 68 + LOW 3 = 88. Product disposition: BLOCKER 2 + CORE GAP 2 + UX GAP 14 + SAMPLE 3 + OPEN 67 = 88. Pilots remain Mini Game Utility, CSV Tidy, ManualFinder.

The logs contain a complete 19-suite behavior-test success record and the AdSense check success record. Three other check successes are recorded in report/plan prose; separate raw logs for those were not among the recovered files.

Evidence still incomplete: rendered 375px/320px checks; full desktop/language/help/detail coverage; download/reopen and downstream output reuse; end-to-end work for all tools; device camera/microphone/codec/network behavior; realistic large-input, repeated-run and persistence cases; public deployment-to-HEAD identity; actual network/privacy/hosting settings; official-link/data freshness. Initial DOM snapshots do not demonstrate full completion. Screenshot files were not among the seven supplied artifacts; visual/interaction observations also survive as report notes rather than a complete raw interaction trace.

`contracts.tsv` is actually pipe-delimited with eight fields, not tab-delimited. The format is intact and preserved without correction.

## Working tree at recovery start

```text
 M tools/construction-tools-atlas/data/tools.basic.json
 D tools/old-kanji-reference/dict.json
?? .agent/plans/astra-product-quality-baseline.md
?? docs/astra-product-quality-baseline.md
```

No staged changes. Available reflogs contain only the clone entry; there is no recorded audit-created commit. Reflogs do not record ordinary working-file writes/deletes.

## Tracked anomalies: inspection only

### Construction Tools Atlas data

Path: `tools/construction-tools-atlas/data/tools.basic.json`. HEAD mode: `100644`, blob `da6dd7e10dc8f4227ea8993523ddce0a13726879`. HEAD has 14,177,079 bytes and parses as a JSON array. The working file has 11,088,896 bytes and is **exactly the first 11,088,896 bytes of HEAD**, missing the final 3,088,183 bytes. It ends inside an English string; JSON parsing fails with `Unterminated string starting at: line 329249 column 13 (char 8883917)`. Git numstat: 1 insertion / 91,238 deletions (line-oriented representation of the truncated tail). It is a truncated, malformed current file; the mechanism is unproven.

HEAD SHA-256: `d9c8317a365b8aba7d943eaf3d27abf61ba131f6b63063ede31dae9063fd7b58`. Current SHA-256: `ae0c5de21929f63eed305b9a62c7a25355d9597faafc6b3bebb5bf569f2aa64d`.

Observed current metadata (UTC): mtime `2026-09-17T10:36:30.999702+00:00`; ctime `2026-09-17T10:36:33.148803+00:00`; mode `0600`. A timestamp is not evidence of which actor/process changed the bytes.

**Attribution: UNKNOWN.** No recovered writer, command record or deletion/regeneration instruction directly connects the audit to this path. The surviving scripts write only their scratch index and the baseline report. There is also no evidence establishing an independently pre-existing change. Do not infer cause from truncation or timestamps alone.

### Old Kanji Reference dictionary link

Path: `tools/old-kanji-reference/dict.json`. This existed at HEAD as a **symbolic link**, Git mode `120000`, blob `b3cba3b761ccd9d8885541ac87edb1c19c56ef43`, whose exact 29 bytes are `../kanji-modernizer/dict.json` (no trailing newline). It was not a 29-byte JSON dictionary. HEAD link-blob SHA-256: `e09ef65613a7cf7cc60ba0c5206c3907b3a70231d633526c59195665c74b38c2`.

The link is absent in the working tree (`lexists` false); Git records one deleted line. Its target `tools/kanji-modernizer/dict.json` exists and parses as a JSON object. No current link inode/mtime exists from which deletion time could be derived. The link has not been restored or replaced.

**Attribution: UNKNOWN.** Six mentions in `audit-index.json` are copied specification evidence references, not write/delete operations. Neither recovered Python script targets this path; no available command history directly records its deletion. There is also no positive evidence proving it predated or was unrelated to the audit.

## Attribution evidence and limits

Reviewed both recovered Python scripts, recovered plan/report text, both logs, structured notes and exact-path references. `audit_index.py` writes only `/workspace/scratch/0490b207d766/audit-index.json`; `build_report.py` writes only `docs/astra-product-quality-baseline.md`. Neither contains a write, truncate, unlink, restore, checkout, reset or generation operation targeting either anomaly. This rules out those recovered script bodies as direct writers, not every possible unrecorded action.

Standard root bash/zsh history and workspace bash history were absent. The workspace does not supply a complete shell/tool execution or file-mutation journal. Existing report/plan claims that no implementation changed are not independent attribution evidence.

Several recovered artifacts have ctime clustered around 10:36 UTC while their retained mtimes precede that by hours; this is compatible with copied/reconstituted files but does **not** establish a restoration mechanism or responsibility. No actor/process attribution can be made from this metadata.

| Source artifact | Original mtime UTC | Observed ctime UTC |
| --- | --- | --- |
| `nicheworks/docs/astra-product-quality-baseline.md` | `2026-09-17T02:18:15.110309+00:00` | `2026-09-17T10:36:30.927703+00:00` |
| `nicheworks/.agent/plans/astra-product-quality-baseline.md` | `2026-09-17T02:19:11.045115+00:00` | `2026-09-17T10:36:28.939717+00:00` |
| `audit-index.json` | `2026-09-17T01:58:15.900977+00:00` | `2026-09-17T10:36:28.931717+00:00` |
| `contracts.tsv` | `2026-09-17T02:11:10.305978+00:00` | `2026-09-17T10:36:28.931717+00:00` |
| `browser-observations.json` | `2026-09-17T02:00:28.464906+00:00` | `2026-09-17T10:36:28.931717+00:00` |
| `behavior-tests.log` | `2026-09-17T01:55:16.401010+00:00` | `2026-09-17T10:36:28.931717+00:00` |
| `adsense-check.log` | `2026-09-17T02:01:04.602511+00:00` | `2026-09-17T10:36:28.928042+00:00` |
| `audit_index.py` | `2026-09-17T01:55:47.608761+00:00` | `2026-09-17T10:36:28.931717+00:00` |
| `build_report.py` | `2026-09-17T02:18:15.074995+00:00` | `2026-09-17T10:36:28.931717+00:00` |

## Report consistency and safe next state

Do not treat the report ending (only report/plan added, no tracked changes) as an accurate description of the current working tree. In a later authorized documentation update, retain the original baseline as a historical statement and add a dated recovery addendum describing both UNKNOWN-origin anomalies and these evidence additions. Do not rewrite that statement to assert audit causation or pre-existing changes without new evidence. The baseline report and plan remain byte-identical in this task.

Naming discrepancy: the recovered report title says **Wave 1**, whereas the recovery request refers to **Wave 0**. This is recorded only; neither title nor report has been rewritten.

Evidence is reusable, but the present working tree is not an approved clean starting point for a product-quality implementation wave. First preserve/review the two UNKNOWN-origin anomalies and agree on their disposition; no restoration, deletion, formatting or regeneration is performed here. A later commit/remote backup of audit-only files would provide Git-backed durability; none is claimed by this copy-only task. Stop before pilot work.
