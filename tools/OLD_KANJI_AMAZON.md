# Old Kanji Amazon Affiliate Contract

Status: active across all eight Old Kanji tools.

Decision date: 2026-09-19

This contract replaces the later dormant-state drift that had disabled an earlier approved Old Kanji Amazon implementation. The product decision is that every Old Kanji tool may carry an Amazon Associates surface when the offer is tied to that tool's task and does not leak user-entered content.

## Shared safety/runtime boundary

All eight tools use:
- Associates tracking ID `nicheworks09-22`;
- shared `/assets/amazon-affiliate.js` for Amazon URL validation, `rel="sponsored noopener"`, disclosure, and the canonical `affiliate_outbound` event;
- `/assets/old-kanji-amazon-context.js` for Old Kanji tool-specific offer selection and contextual placement;
- fixed curated Amazon.co.jp searches only.

The shared code is implementation infrastructure only. The actual offer set, copy, placement, and activation rule are different for each tool.

No user-derived value may be inserted into an Amazon URL or affiliate event. This includes searched kanji, names, addresses, OCR text, document text, converted text, filenames, selected image state, Unicode/code-point input, localStorage values, or query strings.

## Active tool-specific surfaces

| Tool | Activation / placement | Curated purchase intent |
| --- | --- | --- |
| Old Kanji Reference | after the main reference/list task | `異体字の世界 最新版`, `くずし字用例辞典`, `日本語の正しい表記と用語の辞典 第三版` |
| Kanji Modernizer | only after a conversion result is visible | notation/usage dictionary, variant-kanji reference, `漢字源` |
| Old Kanji OCR Scanner | only after OCR/manual result text exists | CZUR ET24 Pro, non-destructive book scanners, LED reading magnifiers |
| Old Document Kanji Highlighter | only after document detection produces a result | `くずし字用例辞典`, old-document reading dictionaries, A4 book stands |
| Unicode Kanji Checker | only after character/code analysis produces cards | `プログラマのための文字コード技術入門`, Japanese typography/visual-culture reference, Unicode/encoding books |
| Variant Kanji Compare | only after comparison results exist | `異体字の世界 最新版`, `実例で読み解く名前の漢字辞典`, glyph/form dictionaries |
| Place Old Kanji Checker | only after a place-name result exists | `角川日本地名大辞典`, `日本歴史地名大系`, old-map/historical place-name references |
| Name Old Kanji Checker | only after a name result exists | `実例で読み解く名前の漢字辞典`, `人名の漢字語源辞典 新装版`, `異体字の世界 最新版` |

The book-title searches are intentionally title/ISBN-oriented where a stable bibliographic identity is available. Hardware searches remain model/category-oriented because stock and exact retail listings can change.

## UX rule

Affiliate surfaces must follow the task rather than precede it.

- A user should be able to complete the free tool task without interacting with Amazon.
- Result-dependent tools do not reveal the affiliate panel until a meaningful result exists.
- The Reference page may show its reference-book panel after the reference/list area because browsing the dictionary itself is already the relevant task.
- Affiliate panels must not masquerade as required next steps, official sources, or correctness validation.
- Place/Name panels must not imply that a purchased book establishes current official/registry spelling.
- OCR hardware is presented as optional capture equipment, not as a claim that buying hardware will fix OCR accuracy.

## Measurement

The only Amazon event is the shared `affiliate_outbound` event.

Allowed coarse fields are:
- `tool_slug`
- `affiliate_id`
- `placement`
- `merchant`
- `destination_key`
- `language`

Raw destination URLs and all user content are excluded.

## Expansion and maintenance

All eight current Old Kanji tools are authorized Amazon surfaces. Adding a ninth Old Kanji tool requires an explicit product decision for that tool, but no arbitrary "two-tool only" cap exists.

Offer changes should be reviewed for:
1. task relevance;
2. current bibliographic/product identity;
3. non-misleading copy;
4. privacy-safe fixed destinations;
5. mobile/desktop placement;
6. working disclosure and measurement.
