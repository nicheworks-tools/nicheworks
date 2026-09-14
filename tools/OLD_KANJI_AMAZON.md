# Old Kanji Amazon Affiliate Contract

Status: canonical affiliate supplement for the Old Kanji cluster.

## Active scope

Amazon affiliate links are intentionally limited to two Old Kanji tools where the shopping intent is directly adjacent to the task.

### Old Kanji Reference

Tracking ID: `nicheworks09-22`

Fixed Amazon.co.jp searches only:
- `dictionary` → `旧字体 異体字 辞典`
- `magnifier` → `古文書 ルーペ`
- `book_stand` → `書見台 ブックスタンド`

Placement: `reference_resources` after the main reference/list task and before the unavailable Pro area.

### Old Kanji OCR Scanner

Tracking ID: `nicheworks09-22`

Fixed Amazon.co.jp searches only:
- `book_scanner` → `ブックスキャナー 非破壊`
- `magnifier` → `古文書 ルーペ`

Placement: `ocr_resources`. The resource panel is moved to immediately after the OCR result/copy actions so the shopping handoff follows task completion rather than appearing after Pro/caution content.

## Non-expansion rule

No Amazon activation is added in this wave to:
- Kanji Modernizer
- Old Document Kanji Highlighter
- Unicode Kanji Checker
- Variant Kanji Compare
- Place Old Kanji Checker
- Name Old Kanji Checker

A future Amazon surface on one of those tools requires a separate relevance case based on actual user intent; cluster membership alone is not sufficient.

## UI and disclosure

- Links are plain text CTAs; no Amazon product images, prices, ratings, reviews, or availability data.
- The resource copy states that Amazon searches are optional / only for users who need the physical tool.
- Reference uses a one-column Amazon link grid at narrow mobile widths (`max-width: 720px`).
- OCR uses a one-column Amazon link grid at narrow mobile widths (`max-width: 560px`).
- Shared `/assets/amazon-affiliate.js` owns URL validation, `rel="sponsored noopener"`, Associates disclosure, and `affiliate_click`.

## Privacy and measurement

Amazon URLs contain only the fixed search term and `tag=nicheworks09-22`. Searched kanji, OCR text, image names, document text, names, addresses, conversion content, and other user-derived values never enter the link.

The existing `affiliate_click` event is the only Amazon click event. Its coarse parameters remain `tool`, `affiliate`, `target`, and `placement`. The Old Kanji cluster analytics module must not duplicate it.