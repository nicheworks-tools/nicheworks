# Old Kanji Toolkit Pro Gate UI Design

## Status

- Planning spec
- Runtime unchanged
- Stripe not implemented yet
- Pro gating not implemented yet
- OCR not implemented yet
- Based on OKJ-M01 and OKJ-M02

## Product identity

- Product: Old Kanji Toolkit Pro
- Product ID: `okj.toolkit_pro`
- Price: $4.99 one-time
- Billing foundation: NicheWorks common billing foundation

This UI design must not assume live Stripe access yet. All live checkout links are future work.

## Pro gate UI components

### A. Pro badge

**Purpose**  
Small label used beside Pro-only features.

- JA: Pro
- EN: Pro
- Suggested text: Old Kanji Toolkit Pro

**Rules**

- Must not hide free functionality.
- Must not imply legal/OCR accuracy improvement.
- Must be compact and non-invasive.

### B. Locked panel

**Purpose**  
A visible block explaining a Pro feature that is not available in Free.

**Required fields**

- title
- description
- feature list
- price line
- CTA button
- unavailable/planned note if billing is not connected

### C. Inline locked row

**Purpose**  
For small Pro-only actions such as export buttons or saved sets.

### D. Pro CTA card

**Purpose**  
Reusable upgrade card shown near Pro feature groups.

### E. Billing unavailable note

**Purpose**  
Before Stripe is connected, Pro locked panels must say the feature is planned or unavailable.

## Global CTA copy

### JA

- Title: Old Kanji Toolkit Pro
- Body: 一括OCR、履歴保存、CSV/Markdown/JSON出力、調査レポート、トリミングOCR、比較セット保存を利用できます。
- Price: $4.99 買い切り
- Button: Pro を確認する
- Unavailable note before Stripe: 現在、Pro機能は準備中です。課金導線はまだ接続されていません。

### EN

- Title: Old Kanji Toolkit Pro
- Body: Unlock batch OCR, saved history, CSV/Markdown/JSON exports, research reports, crop OCR, and saved comparison sets.
- Price: $4.99 one-time
- Button: View Pro
- Unavailable note before Stripe: Pro features are being prepared. Billing is not connected yet.

## Locked panel copy by feature category

| Category | Feature IDs | JA title | JA text | EN title | EN text |
| --- | --- | --- | --- | --- | --- |
| Batch OCR | `okj.batchOcr` | 一括OCRは Pro 機能です | 複数画像のOCR、連続スキャン、検出結果のまとめ処理は Old Kanji Toolkit Pro で利用できます。 | Batch OCR is a Pro feature | Multiple-image OCR, continuous scanning, and grouped detection results are available in Old Kanji Toolkit Pro. |
| History / collection | `okj.scanHistory`, `okj.oldKanjiCollection`, `okj.savedCompareSets` | 履歴保存は Pro 機能です | スキャン履歴、チェック履歴、旧字体コレクション、比較セット保存は Old Kanji Toolkit Pro で利用できます。 | Saved history is a Pro feature | Scan history, check history, old kanji collections, and saved comparison sets are available in Old Kanji Toolkit Pro. |
| Export | `okj.exportCsv`, `okj.exportMarkdown`, `okj.exportJson`, `okj.unicodeAuditExport` | エクスポートは Pro 機能です | CSV、Markdown、JSON、Unicode監査表の出力は Old Kanji Toolkit Pro で利用できます。 | Exports are a Pro feature | CSV, Markdown, JSON, and Unicode audit exports are available in Old Kanji Toolkit Pro. |
| Reports | `okj.report` | 調査レポートは Pro 機能です | OCR結果、旧字体検出、人名・地名候補、異体字比較のレポート出力は Old Kanji Toolkit Pro で利用できます。 | Reports are a Pro feature | Reports for OCR results, old-kanji detection, name/place candidates, and variant comparisons are available in Old Kanji Toolkit Pro. |
| Crop / zoom / image marking | `okj.cropOcr`, `okj.zoomInspect`, `okj.imageMarking` | トリミング・拡大確認は Pro 機能です | 画像の一部を切り出したOCR、拡大確認、画像内マーキングは Old Kanji Toolkit Pro で利用できます。 | Crop, zoom, and image marking are Pro features | Crop OCR, zoom inspection, and image marking are available in Old Kanji Toolkit Pro. |
| Batch checks | `okj.batchNameCheck`, `okj.batchPlaceCheck`, `okj.batchTextHighlight` | 一括チェックは Pro 機能です | 複数の人名、地名、文章をまとめて確認する機能は Old Kanji Toolkit Pro で利用できます。 | Batch checks are Pro features | Batch checks for names, places, and texts are available in Old Kanji Toolkit Pro. |
| Learning | `okj.quizHistory` | 学習履歴は Pro 機能です | クイズ履歴、苦手文字、復習リストは Old Kanji Toolkit Pro で利用できます。 | Learning history is a Pro feature | Quiz history, weak kanji, and review lists are available in Old Kanji Toolkit Pro. |

## UI states

### A. `free`

- Pro feature is locked.
- Show locked panel.
- CTA visible.
- No feature execution.

### B. `pro-active`

- Pro feature is unlocked.
- Show normal feature UI.
- Optional small Pro badge.

### C. `billing-unavailable`

- Stripe not connected yet.
- CTA either disabled or points to future placeholder.
- Must clearly say billing is not connected.

### D. `mock-pro`

- For future development/testing only.
- Must not be exposed as real purchase state.
- Must be clearly labeled in dev docs.

## Placement rules

- **Old Kanji Reference**
  - export/report Pro panel near export area
  - quiz history Pro panel near quiz area
  - saved sets Pro panel near favorites/recent area
- **Name Old Kanji Checker**
  - batch name check Pro panel below single-name result
- **Place Old Kanji Checker**
  - batch place check Pro panel below single-place result
- **Old Document Kanji Highlighter**
  - batch text highlight / export / report Pro panel after result section
- **Unicode Kanji Checker**
  - Unicode audit export Pro panel near CSV/copy area
- **Variant Kanji Compare**
  - saved compare sets / printable report Pro panel after comparison grid
- **Old Kanji OCR Scanner**
  - batch OCR / history / crop / zoom / marking Pro panels after free OCR result

## Design constraints

- Do not block free search/check/OCR-one-image flows.
- Do not make the page feel like a paywall before the user sees free value.
- Pro panels should be compact.
- Mobile 360px must stack without horizontal overflow.
- Buttons must wrap.
- Price text must remain readable.
- JP/EN labels must not mix.
- No fake urgency.
- No legal/OCR accuracy claims.
- No “officially verified” wording.

## Suggested CSS class names

Proposed classes only (not implemented in this phase):

- `.okj-pro-badge`
- `.okj-pro-panel`
- `.okj-pro-panel__title`
- `.okj-pro-panel__body`
- `.okj-pro-panel__features`
- `.okj-pro-panel__price`
- `.okj-pro-panel__cta`
- `.okj-pro-panel__note`
- `.okj-pro-inline-lock`
- `.okj-pro-locked-button`
- `.okj-pro-state-free`
- `.okj-pro-state-active`
- `.okj-pro-state-billing-unavailable`

## Suggested data attributes

Proposed attributes only (not implemented in this phase):

- `data-okj-feature-id`
- `data-okj-pro-state`
- `data-okj-pro-cta`
- `data-okj-pro-price`

## Accessibility notes

- Locked panels must have readable text, not icon-only.
- Disabled buttons must explain why.
- CTA buttons must have clear labels.
- Color must not be the only indicator.
- `aria-disabled` may be used for unavailable actions.
- Do not hide information behind hover-only UI.

## Safety / disclaimer

- Pro features improve workflow convenience only.
- Pro does not guarantee OCR accuracy.
- Pro does not validate legal names, addresses, or official glyph registration.
- Users must verify official glyphs and target system rendering where needed.

## Relationship to existing docs

- [free-pro-ocr-billing-roadmap.md](./free-pro-ocr-billing-roadmap.md)
- [pro-feature-matrix.md](./pro-feature-matrix.md)

## Future implementation mapping

- M03: this design spec only
- M08: OCR locked panels
- M09: existing-tool locked panels
- P01-P05: real billing/entitlement
- P06-P10: actual Pro feature implementation

## Validation checklist

- Markdown only.
- Confirm no runtime files changed.
- Confirm no SEO / sitemap / tools-index changes.
- Confirm no old-kanji data changed.
