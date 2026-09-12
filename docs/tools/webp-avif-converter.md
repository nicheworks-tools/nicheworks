# WebP AVIF Converter — canonical tool specification

- **Slug:** `webp-avif-converter`
- **Display name (JA):** WebP・AVIF変換ツール
- **Display name (EN):** WebP AVIF Converter
- **Implementation:** `tools/webp-avif-converter/`
- **Registry state:** active (registered implementation present)
- **Category:** webp, avif, image, converter
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `webp-avif-converter` implementation at `/tools/webp-avif-converter/`. It does not authorize a production rewrite.

## 2. Purpose

WebPまたはAVIF画像をbrowser native decodeとCanvasでPNGまたはJPEGへ1枚ずつ変換し、previewしてdownloadできるlocal image utilityを提供する。

## 3. Inputs

- 1枚のWebPまたはAVIF image file。
- PNG conversion actionまたはJPEG conversion action。
- JA / EN language。
- Download / Reset。

## 4. Processing behavior

- file pickerまたはdrag & dropで1枚のWebP/AVIFを受け付ける。
- MIME typeまたはfilename extensionでWebP/AVIF候補をcheckする。
- browserのImage decodeでsourceを読み、Canvasへ描画する。
- PNGは`image/png`として書き出し、browser/Canvasが保持できるtransparencyを維持する。
- JPEGはCanvasをwhiteでfillしてから描画し、`image/jpeg` quality 0.92で書き出すためtransparencyはwhite backgroundになる。
- original/converted file sizeとdimensionsを表示し、converted Blobをpreview/downloadできる。
- reset時にobject URLをrevokeし、page-memory stateをclearする。
- JA/EN UIを同一pageで切り替える。

## 5. Outputs

- converted PNGまたはJPEG Blob。
- converted image preview。
- original/converted byte size。
- image dimensions。
- downloadable local file。

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **External/network failure:** Not applicable to the core processing path identified by this audit; suite analytics and advertising are outside tool-result error handling.
- **File read or parsing failure:** The implementation’s documented error path applies and no failed parse is represented as a valid output.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

- selected imageのdecode、Canvas processing、encodingはbrowser内で行い、image fileをNicheWorks conversion APIへuploadしない。
- page display時にはanalytics / ads resourceがloadされ得る。
- AVIF decodeはbrowser自身のformat supportへ依存し、fallback conversion serviceへimageを送信しない。

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- single-file drop zone、conversion buttons、preview/downloadを縦方向中心に配置する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一page上でJA/ENを切り替える。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/webp-avif-converter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/webp-avif-converter/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **not found**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] WebPまたはbrowserがdecode可能なAVIFを1枚選び、PNGへ変換・preview・downloadできる。
- [ ] 同じsourceをJPEGへ変換でき、transparent areaはwhite backgroundになる。
- [ ] 複数file選択時は1枚のみ対応であることをerror表示する。
- [ ] unsupported/broken/undecodable imageで変換を偽成功させずerror表示する。
- [ ] original/converted sizeとdimensionsを表示する。
- [ ] selected imageをserver-side conversion APIへuploadしない。

Automated test evidence: none found. Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/webp-avif-converter/index.html`
- `tools/webp-avif-converter/app.js`
- `tools/webp-avif-converter/style.css`
- `tools/webp-avif-converter/usage.html`
