# Tool Specification — WebP / AVIF Converter

- Slug: `webp-avif-converter`
- Public URL: `https://nicheworks.app/tools/webp-avif-converter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

WebPまたはAVIF画像をbrowser native decodeとCanvasでPNGまたはJPEGへ1枚ずつ変換し、previewしてdownloadできるlocal image utilityを提供する。

## Current functional contract

- file pickerまたはdrag & dropで1枚のWebP/AVIFを受け付ける。
- MIME typeまたはfilename extensionでWebP/AVIF候補をcheckする。
- browserのImage decodeでsourceを読み、Canvasへ描画する。
- PNGは`image/png`として書き出し、browser/Canvasが保持できるtransparencyを維持する。
- JPEGはCanvasをwhiteでfillしてから描画し、`image/jpeg` quality 0.92で書き出すためtransparencyはwhite backgroundになる。
- original/converted file sizeとdimensionsを表示し、converted Blobをpreview/downloadできる。
- reset時にobject URLをrevokeし、page-memory stateをclearする。
- JA/EN UIを同一pageで切り替える。

## Inputs

- 1枚のWebPまたはAVIF image file。
- PNG conversion actionまたはJPEG conversion action。
- JA / EN language。
- Download / Reset。

## Outputs

- converted PNGまたはJPEG Blob。
- converted image preview。
- original/converted byte size。
- image dimensions。
- downloadable local file。

## State and persistence

- source file、converted Blob、object URLはpage memoryのみで永続保存しない。
- UI languageは`webpAvifConverterLang`としてlocalStorageへ保存する。
- image contentやconversion historyをlocalStorage/cloudへ保存しない。

## Privacy and network behavior

- selected imageのdecode、Canvas processing、encodingはbrowser内で行い、image fileをNicheWorks conversion APIへuploadしない。
- page display時にはanalytics / ads resourceがloadされ得る。
- AVIF decodeはbrowser自身のformat supportへ依存し、fallback conversion serviceへimageを送信しない。

## Language mode

`bilingual single-page`

同一page上でJA/ENを切り替える。

## Layout class

`mobile-oriented`

single-file drop zone、conversion buttons、preview/downloadを縦方向中心に配置する。

## Limits and non-goals

- 現行版は1枚ずつのみでbatch conversionしない。
- AVIF decode可否はbrowser supportに依存する。
- 大きなimageはdevice memory不足で失敗し得る。
- resize、crop、rotate、quality slider等のimage editor機能は提供しない。
- Canvas再生成で多くのmetadataは引き継がれないが、完全なmetadata sanitizationを保証しない。
- filename extension/MIME checkだけでfileの安全性を保証しない。

## Acceptance criteria

- [ ] WebPまたはbrowserがdecode可能なAVIFを1枚選び、PNGへ変換・preview・downloadできる。
- [ ] 同じsourceをJPEGへ変換でき、transparent areaはwhite backgroundになる。
- [ ] 複数file選択時は1枚のみ対応であることをerror表示する。
- [ ] unsupported/broken/undecodable imageで変換を偽成功させずerror表示する。
- [ ] original/converted sizeとdimensionsを表示する。
- [ ] selected imageをserver-side conversion APIへuploadしない。

## Implementation evidence

- `tools/webp-avif-converter/index.html` — single-file WebP/AVIF input、PNG/JPEG actions、privacy/format/metadata limitations。
- `tools/webp-avif-converter/app.js` — file validation、native decode、Canvas PNG/JPEG conversion、JPEG white fill/0.92 quality、object URL cleanup、language persistence。