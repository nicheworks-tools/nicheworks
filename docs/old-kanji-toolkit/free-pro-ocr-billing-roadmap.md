# Old Kanji Toolkit Free / Pro / OCR / Billing Roadmap

Status:
- Planning spec
- Runtime unchanged
- OCR not implemented yet
- Stripe not implemented yet
- Pro gating not implemented yet

## Current Completed Baseline

The following capabilities and assets are already implemented or established in the Old Kanji Reference / OKJ suite baseline:

- Old Kanji Reference
- Name Old Kanji Checker
- Place Old Kanji Checker
- Old Document Kanji Highlighter
- Unicode Kanji Checker
- Variant Kanji Compare
- Old Kanji Reference data expansion
- metadata coverage
- shape notes
- stroke counts
- compatibility notes
- quiz
- palettes / presets / recent / favorites
- display modes

## Product Positioning

**Suite name:** Old Kanji Toolkit

**Description:**
A toolkit for checking, detecting, comparing, and working with old Japanese kanji, variant kanji, compatibility ideographs, and old/modern kanji mappings.

This suite is **not** positioned as:

- legal name validator
- official registry checker
- historical translation system
- academic paleography tool
- OCR accuracy guarantee system

## Free / Pro Principle

### Free

- look up
- check one item
- compare basic variants
- detect old kanji in one text
- OCR one image
- copy basic results
- send results to related tools

### Pro

- batch processing
- save history
- collections
- exports
- reports
- repeated field-use workflows
- crop / zoom / image marking
- advanced comparison set management
- learning progress

## Free Features by Tool

### Old Kanji Reference

- search
- filters
- detail panel
- old → modern mappings
- reading / meaning / usage
- Unicode / HTML entity
- shape comparison
- stroke reference
- rendering compatibility notes
- display modes
- palette / presets
- recent / favorites
- quiz

### Name Old Kanji Checker

- one-name check
- old / variant detection
- modern → old candidates
- compatibility notes
- basic copy
- links to Old Kanji Reference and related tools

### Place Old Kanji Checker

- one place/address check
- old / variant detection
- modern → old candidates
- compatibility notes
- basic copy
- links to related tools

### Old Document Kanji Highlighter

- one pasted text
- old kanji highlighting
- detected list
- occurrence count
- mechanical modern preview
- basic copy

### Unicode Kanji Checker

- Unicode code point
- HTML hex / decimal entity
- UTF-16
- compatibility / supplementary-plane / variation-selector warnings
- mapping candidates
- basic copy

### Variant Kanji Compare

- presets
- free input comparison
- glyph comparison
- Unicode / HTML / UTF-16
- mapping candidates
- compatibility notes
- basic copy / CSV if already present

### Old Kanji OCR Scanner

- one image OCR
- browser-side OCR
- OCR text display
- manual correction
- old kanji detection
- detected character cards
- basic copy
- related tool links

## Pro Features by Category

### A. Batch processing

- multiple image OCR
- batch text analysis
- batch name check
- batch place check
- batch Unicode table
- batch variant compare

### B. Save / history

- OCR scan history
- check history
- saved comparison sets
- old kanji collection
- scan memo
- field notes
- image + OCR result + detected result saved together

### C. Export

- CSV
- Markdown
- JSON
- printable report
- OCR report
- name candidate report
- place candidate report
- Unicode audit report
- variant comparison report

### D. Mobile field-use

- crop OCR
- zoom inspection
- image marking
- continuous scan
- date/time memo
- location memo if implemented later
- review-later list

### E. Learning

- quiz history
- weak kanji list
- category quiz
- review list

## OCR Roadmap

**Old Kanji OCR Scanner path:** `tools/old-kanji-ocr-scanner/`

### OCR implementation order

#### M04

- shell
- upload UI
- camera image input UI
- privacy and accuracy notes

#### M05

- browser-side OCR
- one image
- OCR text output
- manual correction

#### M06

- old kanji detection from OCR text
- highlight
- detected cards
- related tool links

#### M07

- mobile UX polish
- image preview
- retry OCR
- copy flows

#### M08 and later

- Pro locked panels
- batch OCR
- history
- crop
- report
- marking

### OCR constraints

- no external OCR API in initial version
- no guarantee of OCR accuracy
- old documents, vertical writing, faded signs, cursive forms, and unusual glyphs may fail
- user correction must be supported
- browser-only processing must be clearly stated
- analytics/ad tags may still load as part of the page

## Billing Decision

**Billing foundation:** NicheWorks common billing foundation

**Reason:**

- avoid duplicating Stripe Checkout / webhook / entitlement logic per tool
- support future Pro products across NicheWorks
- keep Pro UI and entitlement handling consistent

**Product:** Old Kanji Toolkit Pro

**Price:** $4.99 one-time

**Other small NicheWorks Pro tools:** $2.99 one-time can remain separate

**Important distinction:**
Common billing foundation does not require a common price. It means shared checkout, entitlement, Pro UI, and unlock logic.

## Product / Feature IDs

**Proposed product id:** `okj.toolkit_pro`

**Display name:** Old Kanji Toolkit Pro

**Price:** 4.99 USD one-time

**Feature IDs:**

- `okj.batchOcr`
- `okj.scanHistory`
- `okj.oldKanjiCollection`
- `okj.exportCsv`
- `okj.exportMarkdown`
- `okj.exportJson`
- `okj.report`
- `okj.cropOcr`
- `okj.zoomInspect`
- `okj.imageMarking`
- `okj.batchNameCheck`
- `okj.batchPlaceCheck`
- `okj.batchTextHighlight`
- `okj.savedCompareSets`
- `okj.unicodeAuditExport`
- `okj.quizHistory`

## Billing Architecture Note

### Initial phase (M01)

- no real Stripe integration in M01
- no secret keys
- no entitlement issuance
- no unlock logic

### Later billing PRs

- OKJ-P01: common billing architecture
- OKJ-P02: config + mock entitlement
- OKJ-P03: Stripe Checkout success / cancel
- OKJ-P04: webhook / entitlement issue
- OKJ-P05: real Pro unlock

## Pro Copy Examples

### JA

Old Kanji Toolkit Pro  
一括OCR、履歴保存、CSV/Markdown/JSON出力、調査レポート、トリミングOCR、比較セット保存を利用できます。

### EN

Old Kanji Toolkit Pro  
Unlock batch OCR, saved history, CSV/Markdown/JSON exports, research reports, crop OCR, and saved comparison sets.

## Safety / Disclaimer

- This toolkit is for reference checking.
- It does not determine legal validity.
- It does not determine official registered glyphs.
- It does not guarantee OCR accuracy.
- It does not replace professional, legal, archival, or academic review.
- For names, addresses, family registers, contracts, banking, insurance, school, workplace, administrative use, or official forms, users must confirm the actual registered glyph and target system rendering.

## PR Roadmap Table

| Phase | PR ID | Scope |
| --- | --- | --- |
| Phase 1 | OKJ-M01 | Free / Pro / OCR / Billing roadmap spec |
| Phase 1 | OKJ-M02 | Old Kanji Toolkit Pro feature matrix |
| Phase 1 | OKJ-M03 | Pro gate UI common design |
| Phase 2 | OKJ-M04 | Old Kanji OCR Scanner shell |
| Phase 2 | OKJ-M05 | Browser OCR integration |
| Phase 2 | OKJ-M06 | OCR result old-kanji detection |
| Phase 2 | OKJ-M07 | OCR mobile UX polish |
| Phase 3 | OKJ-M08 | OCR Pro locked panels |
| Phase 3 | OKJ-M09 | Apply Pro locked panels to existing tools |
| Phase 3 | OKJ-M10 | Export / report format spec |
| Phase 4 | OKJ-P01 | NicheWorks common billing architecture |
| Phase 4 | OKJ-P02 | Billing config and mock entitlement |
| Phase 4 | OKJ-P03 | Stripe Checkout success / cancel flow |
| Phase 4 | OKJ-P04 | Stripe webhook / entitlement issue |
| Phase 4 | OKJ-P05 | Apply real Pro unlock to OKJ tools |
| Phase 5 | OKJ-P06 | OCR history / collection Pro |
| Phase 5 | OKJ-P07 | Export Pro |
| Phase 5 | OKJ-P08 | Report Pro |
| Phase 5 | OKJ-P09 | Batch processing Pro |
| Phase 5 | OKJ-P10 | Crop / zoom / field-use Pro |
| Phase 6 | OKJ-Q01 | All OKJ related links cleanup |
| Phase 6 | OKJ-Q02 | All OKJ q-parameter integration |
| Phase 6 | OKJ-Q03 | All OKJ i18n regression |
| Phase 6 | OKJ-Q04 | All OKJ mobile regression |
| Phase 6 | OKJ-Q05 | All OKJ data fallback regression |
| Phase 7 | OKJ-S01 | SEO fixed landing pages |
| Phase 7 | OKJ-S02 | Major character pages |
| Phase 7 | OKJ-S03 | Common shell / head / footer cleanup |
| Phase 7 | OKJ-S04 | Final release checklist |
