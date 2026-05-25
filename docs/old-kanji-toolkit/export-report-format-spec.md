# Old Kanji Toolkit Export and Report Format Spec

Status:
- Planning spec
- Runtime unchanged
- Export not implemented yet
- Report not implemented yet
- Stripe not implemented yet
- Pro unlock not implemented yet
- Based on OKJ-M01 to OKJ-M09-B

## 1. Product context

Product:
Old Kanji Toolkit Pro

Product ID:
okj.toolkit_pro

Price:
$4.99 one-time

Billing foundation:
NicheWorks common billing foundation

Feature IDs covered:
- okj.exportCsv
- okj.exportMarkdown
- okj.exportJson
- okj.report
- okj.unicodeAuditExport
- okj.batchNameCheck
- okj.batchPlaceCheck
- okj.batchTextHighlight
- okj.batchOcr
- okj.savedCompareSets
- okj.oldKanjiCollection
- okj.scanHistory

Clarify:
This document defines output formats only.
It does not unlock or implement Pro features.

## 2. Free / Pro export boundary

Free:
- copy basic result text
- copy single old/modern pair
- copy current OCR result
- copy detected old forms
- copy pair table when already available
- open related tools with q parameter

Pro:
- CSV export
- Markdown export
- JSON export
- printable report
- OCR report
- name candidate report
- place candidate report
- old document report
- Unicode audit report
- variant comparison report
- batch export
- saved history export
- saved set export

Important:
Free copy is not the same as Pro export.
Free copy is lightweight, current-screen only.
Pro export is structured, reusable, multi-result, report-ready output.

## 3. Global export rules

- All exports must be generated client-side unless a future billing/entitlement flow requires server verification.
- User input must not be sent to an external export API.
- Exported files must include a disclaimer.
- Exported files must not claim official/legal validity.
- Exported files must not guarantee OCR accuracy.
- Exports must preserve original input text where relevant.
- Exports must label mechanical modern-form previews as mechanical replacements.
- Exports must include timestamp if available.
- Exports must include tool name and version if available.
- Exports must include language field when generated from JP/EN UI.
- Exports must avoid hidden tracking data.
- Exports must not include analytics/ad identifiers.

## 4. Shared disclaimer text

JA:
この出力は旧字体・異体字の参考確認用です。法的有効性、正式な登録字体、OCR精度、翻刻・翻訳・学術的判定を保証するものではありません。氏名、地名、住所、戸籍、登記、契約、行政手続きなどでは、必ず原資料や登録字体、対象システムでの表示を確認してください。

EN:
This output is for reference checking of old and variant kanji forms. It does not guarantee legal validity, officially registered glyphs, OCR accuracy, transcription, translation, or scholarly judgment. For names, places, addresses, family registers, registrations, contracts, or administrative procedures, always confirm the original source, registered glyph, and rendering in the target system.

## 5. CSV format

Common CSV requirements:

Encoding:
- UTF-8
- optional BOM may be considered later for spreadsheet compatibility

Delimiter:
- comma

Line endings:
- LF or CRLF accepted
- implementation should be consistent per export

Escaping:
- quote fields containing comma, newline, or double quote
- double internal double quotes

Required common columns:
- tool_id
- tool_name
- generated_at
- language
- input_type
- source_text
- old_form
- modern_form
- reading
- meaning
- usage
- category
- count
- unicode
- html_hex
- html_decimal
- utf16
- compatibility_note
- warning
- disclaimer

State:
Not every tool uses every column.
Unused columns may be blank.
Batch exports should repeat one row per detected item or result.

## 6. Markdown format

Markdown report requirements:

Common sections:
- Title
- Generated at
- Tool
- Input summary
- Result summary
- Detected items / candidates / comparison table
- Notes / warnings
- Disclaimer

Markdown should:
- be readable in plain text
- avoid raw HTML unless necessary
- include tables for structured results
- preserve original input snippets where relevant
- clearly label mechanical modern preview
- clearly label OCR uncertainty

## 7. JSON format

Common JSON shape:

```json
{
  "schemaVersion": "okj-export-v1",
  "toolId": "",
  "toolName": "",
  "generatedAt": "",
  "language": "ja|en",
  "input": {
    "type": "",
    "text": "",
    "source": ""
  },
  "summary": {
    "totalMatches": 0,
    "uniqueForms": 0,
    "warnings": []
  },
  "items": [],
  "notes": [],
  "disclaimer": ""
}
```

Rules:
- schemaVersion must be included
- generatedAt should be ISO 8601
- items must use stable field names
- preserve old_form and modern_form separately
- arrays should be used where one old form maps to multiple modern candidates
- do not serialize DOM-only state
- do not include secrets or analytics IDs

## 8. Printable report format

Printable reports should be generated as browser-printable HTML or Markdown-to-print later.
No PDF generation required in this spec.

Sections:
- Report title
- Tool name
- Generated at
- Input
- Result summary
- Detailed findings
- Compatibility/rendering notes
- Manual review checklist
- Disclaimer

Manual review checklist examples:

JA:
- 原資料と照合した
- 正式な登録字体を確認した
- 対象システムで表示確認した
- OCR結果を目視確認した

EN:
- Compared with the original source
- Confirmed the registered glyph
- Checked rendering in the target system
- Visually reviewed OCR results

## 9. Tool-specific specs

### A. Old Kanji Reference export/report

Tool ID:
old-kanji-reference

Pro features:
- okj.exportCsv
- okj.exportMarkdown
- okj.exportJson
- okj.report
- okj.quizHistory
- okj.oldKanjiCollection

Exportable data:
- search query
- filters
- result list
- selected entry
- old form
- modern form
- reading
- meaning
- usage
- category
- Unicode
- HTML entity
- stroke notes
- shape notes
- compatibility notes
- saved set name if future
- quiz history if future

Reports:
- selected character report
- search result report
- saved collection report
- quiz review report

### B. Old Kanji OCR Scanner export/report

Tool ID:
old-kanji-ocr-scanner

Pro features:
- okj.batchOcr
- okj.scanHistory
- okj.oldKanjiCollection
- okj.exportCsv
- okj.exportMarkdown
- okj.exportJson
- okj.report
- okj.cropOcr
- okj.zoomInspect
- okj.imageMarking

Exportable data:
- OCR result text
- manually corrected text
- detected old forms
- old→modern pairs
- occurrence counts
- highlighted text
- mechanical modern preview
- compatibility notes
- image filename if available
- image metadata if available
- crop region if future
- scan memo if future

Reports:
- OCR scan report
- batch OCR summary report
- field inspection report

Must include OCR caution.

### C. Name Old Kanji Checker export/report

Tool ID:
name-old-kanji-checker

Pro features:
- okj.batchNameCheck
- okj.exportCsv
- okj.exportMarkdown
- okj.report

Exportable data:
- input name
- detected old/variant forms
- modern→old candidates
- old→modern mappings
- compatibility notes
- review memo if future
- batch row number if future

Reports:
- name candidate report
- batch name check report

Must include official-name caution.

### D. Place Old Kanji Checker export/report

Tool ID:
place-old-kanji-checker

Pro features:
- okj.batchPlaceCheck
- okj.exportCsv
- okj.exportMarkdown
- okj.report

Exportable data:
- input place/address
- detected old/variant forms
- modern→old candidates
- old→modern mappings
- compatibility notes
- field memo if future
- batch row number if future

Reports:
- place candidate report
- address review report
- field note report

Must include official-address caution.

### E. Old Document Kanji Highlighter export/report

Tool ID:
old-document-kanji-highlighter

Pro features:
- okj.batchTextHighlight
- okj.oldKanjiCollection
- okj.exportCsv
- okj.exportMarkdown
- okj.exportJson
- okj.report

Exportable data:
- source text
- highlighted text
- detected old forms
- occurrence count
- old→modern pairs
- mechanical modern preview
- compatibility notes
- document memo if future

Reports:
- old document detection report
- batch document report
- detected kanji collection report

Must include transcription/translation caution.

### F. Unicode Kanji Checker export/report

Tool ID:
unicode-kanji-checker

Pro features:
- okj.unicodeAuditExport
- okj.exportCsv
- okj.exportJson
- okj.report

Exportable data:
- input character
- code point
- HTML hex entity
- HTML decimal entity
- UTF-16
- compatibility ideograph flag
- supplementary plane flag
- variation selector flag
- old/modern mapping candidates
- rendering note

Reports:
- Unicode audit report
- compatibility risk report
- supplementary-plane report

### G. Variant Kanji Compare export/report

Tool ID:
variant-kanji-compare

Pro features:
- okj.savedCompareSets
- okj.exportCsv
- okj.exportMarkdown
- okj.report

Exportable data:
- compared characters
- glyph display samples
- Unicode
- HTML entities
- UTF-16
- old→modern mappings
- modern→old candidates
- shape notes
- stroke counts
- compatibility notes
- comparison memo if future

Reports:
- variant comparison report
- saved comparison set report

## 10. File naming rules

Future filename examples:
- old-kanji-reference-export-YYYYMMDD-HHMM.csv
- old-kanji-ocr-report-YYYYMMDD-HHMM.md
- name-old-kanji-check-YYYYMMDD-HHMM.csv
- place-old-kanji-check-YYYYMMDD-HHMM.csv
- old-document-kanji-report-YYYYMMDD-HHMM.md
- unicode-kanji-audit-YYYYMMDD-HHMM.json
- variant-kanji-compare-YYYYMMDD-HHMM.md

Rules:
- lowercase
- hyphen-separated
- no user input in filename by default
- timestamps local or UTC must be documented when implemented

## 11. Implementation order

OKJ-P07:
- basic CSV / Markdown / JSON export helpers
- shared client-side export utility if appropriate
- no billing unlock unless P05 is complete

OKJ-P08:
- report generation
- printable report templates
- OCR/name/place/document/Unicode/variant report layouts

OKJ-P09:
- batch processing exports

OKJ-P06 / P10:
- history/crop/field-use data included in exports after those features exist

## 12. Relationship to existing docs

Reference:
- docs/old-kanji-toolkit/free-pro-ocr-billing-roadmap.md
- docs/old-kanji-toolkit/pro-feature-matrix.md
- docs/old-kanji-toolkit/pro-gate-ui-design.md

This document refines the export/report scope described there.

## 13. Validation

This PR is Markdown/docs only.

Validation:
- confirm export-report-format-spec.md exists
- confirm no runtime files changed
- confirm no tool HTML/CSS/JS changed
- confirm no SEO/sitemap/tools-index/tools-meta changed
- confirm no data files changed
