# Old Kanji Toolkit Pro — canonical Phase 1 Free / Pro matrix

**State: staged, not for sale (2026-10-31).** The prior $4.99 plan and Free-export paywall proposals are superseded and must not be restored. Canonical machine-readable grants: `config/old-kanji-toolkit-pro-phase1.json`.

**One shared product:** `okj.toolkit_pro`, covering all eight tools. Price/currency/payment terms remain undecided. Reuse NicheWorks common Stripe/D1 billing once approved and independently verified.

| Tool | Preserved Free | Added Pro heavy workflow |
| --- | --- | --- |
| Old Kanji Reference | Search, list, detail, favorites, recent, quiz, **CSV, JSON, Markdown, Print** | Research collections, project notes, saved sets, multi-result report, workspace |
| Kanji Modernizer | Single-text conversion both directions, conservative/first-candidate, ambiguity review, copy | Multi-text/file batch, history, diff review, project/export |
| Old Kanji OCR Scanner | Single-image OCR, manual corrections, old-form detection, modern preview, copy | Multiple images, page sequence, saved history, collections, crop and report |
| Old Document Kanji Highlighter | Single document, highlight, mechanical preview, copy | Multi-document projects, history, cross-document aggregation/report |
| Unicode Kanji Checker | Existing Unicode/decimal/entity/UTF-16/VS/compatibility, copy | Large character batch, saved set, technical report, workspace |
| Variant Kanji Compare | Existing multi-character compare, presets, glyph/metadata, existing copy/CSV | Large sets, stored comparisons, project grouping, reports |
| Place Old Kanji Checker | Single-place/address/rail candidate review and Modernizer handoff | CSV list batch, region workspace, candidate summary, reports |
| Name Old Kanji Checker | Single-name/surname candidate review and Modernizer handoff | CSV name batch, research sets, candidate summary, reports |

## Feature IDs

- `okj.batch`
- `okj.history`
- `okj.collections`
- `okj.workspaces`
- `okj.reports`
- `okj.advancedExport`
- `okj.ocr.batch`
- `okj.ocr.crop`
- `okj.modernizer.batch`
- `okj.name.batch`
- `okj.place.batch`
- `okj.unicode.batch`
- `okj.variant.batch`
- `okj.document.batch`

## Phase 1 practical implementation

OCR batch and opt-in local scan history have working browser code on the Phase 1 branch. They stay hidden without server-verified entitlement. Other Pro feature IDs are reserved for later releases; **a listed grant is not proof that its operation has been implemented**. Do not advertise or sell unfinished operations. Existing Free outputs may never be relabeled paid. Names/places are candidates, not legally authoritative determinations.

### Release gate

Only mark Pro complete after approved pricing, production Stripe, applied D1 storage, payment success/cancel/error, refund/revoke, entitlement, restore, cross-tool checks, JP/EN and mobile/desktop browser QA, and passing CI. Amazon affiliate 8/8 is independent and must remain unchanged.
