# Old Kanji Toolkit Pro Feature Matrix

## Status

- Planning spec
- Runtime unchanged
- OCR not implemented yet
- Stripe not implemented yet
- Pro gating not implemented yet
- Based on OKJ-M01 roadmap

## Product Summary

- **Product:** Old Kanji Toolkit Pro
- **Product ID:** `okj.toolkit_pro`
- **Price:** $4.99 one-time
- **Billing foundation:** NicheWorks common billing foundation

Common billing foundation does not mean all products use the same price. OKJ is a toolkit product and can use $4.99 while smaller NicheWorks Pro tools remain $2.99.

## Free / Pro Boundary Summary

**Free**
- look up
- check one item
- compare basic variants
- detect old kanji in one text
- OCR one image
- copy basic results
- send results to related tools

**Pro**
- batch processing
- saved history
- collections
- exports
- reports
- repeated field-use workflows
- crop / zoom / image marking
- advanced comparison set management
- learning progress

## Feature ID Registry

| Feature ID | Feature name | Category | Planned tools | Pro reason |
| --- | --- | --- | --- | --- |
| `okj.batchOcr` | Batch OCR processing for multiple images and continuous scanning. Depends on OCR + billing. | OCR workflow | Old Kanji OCR Scanner | Multi-item operational workflow for repeated field use. |
| `okj.scanHistory` | Save and revisit scan sessions/results. Depends on storage + billing. | History/storage | Old Kanji OCR Scanner | Historical traceability and repeat work efficiency. |
| `okj.oldKanjiCollection` | Store detected old kanji items as reusable collections. Depends on storage + billing. | Collection/storage | Old Kanji OCR Scanner, Old Document Kanji Highlighter | Reusable curation across cases and sessions. |
| `okj.exportCsv` | Export structured results in CSV format. Depends on export + billing. | Export | Old Kanji Reference, Name Old Kanji Checker, Place Old Kanji Checker, Old Document Kanji Highlighter, Unicode Kanji Checker, Variant Kanji Compare, Old Kanji OCR Scanner | Downstream reporting and spreadsheet workflows. |
| `okj.exportMarkdown` | Export results in Markdown format. Depends on export + billing. | Export | Old Kanji Reference, Name Old Kanji Checker, Place Old Kanji Checker, Old Document Kanji Highlighter, Old Kanji OCR Scanner | Reusable documentation workflow for teams and notes. |
| `okj.exportJson` | Export machine-readable JSON results. Depends on export + billing. | Export | Old Kanji Reference, Old Document Kanji Highlighter, Unicode Kanji Checker, Old Kanji OCR Scanner | Structured reuse in technical/automation pipelines. |
| `okj.report` | Generate printable/shareable reports from analysis results. Depends on export + billing. | Reporting | Old Kanji Reference, Name Old Kanji Checker, Place Old Kanji Checker, Old Document Kanji Highlighter, Variant Kanji Compare, Old Kanji OCR Scanner | Formalized summaries for repeated field submissions. |
| `okj.cropOcr` | Run OCR on user-cropped image regions. Depends on OCR + billing. | OCR assist | Old Kanji OCR Scanner | Better targeting for difficult scans and dense documents. |
| `okj.zoomInspect` | Zoom image regions for inspection before/after OCR. Depends on OCR assist + billing. | OCR assist | Old Kanji OCR Scanner | Improves human review workflow accuracy and speed. |
| `okj.imageMarking` | Add visual marks/annotations on scan images tied to findings. Depends on storage/export + billing. | OCR assist | Old Kanji OCR Scanner | Supports inspection notes and collaborative review. |
| `okj.batchNameCheck` | Check multiple names in one run with aggregated output. Depends on storage/export + billing. | Batch checking | Name Old Kanji Checker | Removes repetitive one-by-one processing overhead. |
| `okj.batchPlaceCheck` | Check multiple places/addresses in one run. Depends on storage/export + billing. | Batch checking | Place Old Kanji Checker | Enables field and office batch review workflows. |
| `okj.batchTextHighlight` | Run old-kanji highlight on multiple pasted/imported texts. Depends on storage/export + billing. | Batch analysis | Old Document Kanji Highlighter | Scales document review beyond single text. |
| `okj.savedCompareSets` | Save and reopen comparison sets for variant analysis. Depends on storage + billing. | Comparison management | Variant Kanji Compare | Advanced set management for repeated comparisons. |
| `okj.unicodeAuditExport` | Export Unicode audit tables and warning-focused summaries. Depends on export + billing. | Unicode audit | Unicode Kanji Checker | Needed for technical audits and compatibility reporting. |
| `okj.quizHistory` | Persist quiz attempts and progress signals over time. Depends on storage + billing. | Learning progress | Old Kanji Reference | Supports long-term learning progress and weak-point review. |

## Tool-by-Tool Matrix

### A. Old Kanji Reference

| Free | Pro |
| --- | --- |
| search; filters; details; old → modern mapping; reading / meaning / usage; Unicode / HTML entity; shape notes; stroke notes; compatibility notes; display mode; palette / presets; recent / favorites; quiz | advanced saved sets; quiz history; weak kanji review list; CSV / Markdown / JSON export; printable report |

### B. Name Old Kanji Checker

| Free | Pro |
| --- | --- |
| one-name check; old / variant detection; modern → old candidates; compatibility notes; basic copy; related links | batch name check; name candidate report; CSV / Markdown export; saved check history; memo per checked name |

### C. Place Old Kanji Checker

| Free | Pro |
| --- | --- |
| one place/address check; old / variant detection; modern → old candidates; compatibility notes; basic copy; related links | batch place/address check; place candidate report; CSV / Markdown export; saved place check history; field memo |

### D. Old Document Kanji Highlighter

| Free | Pro |
| --- | --- |
| one pasted text; old kanji highlight; detected list; occurrence count; mechanical modern preview; basic copy | batch text highlight; saved document analysis; CSV / Markdown / JSON export; document report; detected kanji collection |

### E. Unicode Kanji Checker

| Free | Pro |
| --- | --- |
| Unicode; HTML hex / decimal; UTF-16; compatibility warnings; old/modern mapping candidates; basic copy | Unicode audit export; batch character table; compatibility-only extraction; supplementary-plane extraction; CSV / JSON export |

### F. Variant Kanji Compare

| Free | Pro |
| --- | --- |
| presets; free input comparison; glyph comparison; Unicode / HTML / UTF-16; mapping candidates; compatibility notes; basic copy / CSV if already present | saved comparison sets; printable comparison report; larger comparison tables; advanced export; field-use comparison notes |

### G. Old Kanji OCR Scanner

| Free | Pro |
| --- | --- |
| one image OCR; browser-side OCR; OCR text display; manual correction; old kanji detection; detected cards; basic copy; related links | multiple image OCR; continuous scan; scan history; old kanji collection; crop OCR; zoom inspection; image marking; OCR report; CSV / Markdown / JSON export |

## Locked UI Copy Matrix

| Feature | JA locked title | JA locked text | EN locked title | EN locked text |
| --- | --- | --- | --- | --- |
| Batch OCR | 一括OCRは Pro 機能です | 複数画像のOCR、連続スキャン、検出結果のまとめ処理は Old Kanji Toolkit Pro で利用できます。 | Batch OCR is a Pro feature | Multiple-image OCR, continuous scanning, and grouped detection results are available in Old Kanji Toolkit Pro. |
| Exports | エクスポートは Pro 機能です | CSV、Markdown、JSON、調査レポート出力は Old Kanji Toolkit Pro で利用できます。 | Exports are a Pro feature | CSV, Markdown, JSON, and research report exports are available in Old Kanji Toolkit Pro. |
| History | 履歴保存は Pro 機能です | スキャン履歴、チェック履歴、比較セット保存は Old Kanji Toolkit Pro で利用できます。 | Saved history is a Pro feature | Scan history, check history, and saved comparison sets are available in Old Kanji Toolkit Pro. |
| Crop / zoom | トリミング・拡大確認は Pro 機能です | 画像の一部を切り出したOCRや拡大確認は Old Kanji Toolkit Pro で利用できます。 | Crop and zoom tools are Pro features | Crop OCR and zoom inspection are available in Old Kanji Toolkit Pro. |

## Shared CTA Copy

**JA**

Old Kanji Toolkit Pro  
一括OCR、履歴保存、CSV/Markdown/JSON出力、調査レポート、トリミングOCR、比較セット保存を利用できます。  
$4.99 買い切り

Button: Pro を確認する

**EN**

Old Kanji Toolkit Pro  
Unlock batch OCR, saved history, CSV/Markdown/JSON exports, research reports, crop OCR, and saved comparison sets.  
$4.99 one-time

Button: View Pro

No live Stripe links are included at this stage.

## Implementation Dependency Notes

- M02 is documentation-only.
- M03 will define Pro gate UI design.
- M08 / M09 will place locked panels.
- P01–P05 will implement real billing and unlock.
- Pro locked panels may appear before real billing, but must be clearly marked as planned or unavailable until billing is connected.
- No secret keys in client files.
- No entitlement logic in this PR.

## Safety / Disclaimer

- Pro does not improve legal validity.
- Pro does not guarantee OCR accuracy.
- Pro does not verify official registered glyphs.
- Pro adds workflow convenience: batch, save, export, reports, field-use helpers.

## Relationship to OKJ-M01

This document refines:
- `docs/old-kanji-toolkit/free-pro-ocr-billing-roadmap.md`

## Validation Checklist

- Markdown only.
- Runtime files unchanged.
- No SEO / sitemap / tools-index changes.
- No old-kanji data changed.
