# Unicode Kanji Checker — canonical tool specification

- **Slug:** `unicode-kanji-checker`
- **Display name (JA):** Unicode漢字チェッカー | Unicode Kanji Checker
- **Display name (EN):** Unicode Kanji Checker
- **Implementation:** `tools/unicode-kanji-checker/`
- **Registry state:** active (registered implementation present)
- **Category:** unicode, kanji, checker
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `unicode-kanji-checker` implementation at `/tools/unicode-kanji-checker/`. It does not authorize a production rewrite.

## 2. Purpose

漢字、旧字体、異体字についてUnicode code point、HTML entity、UTF-16、旧字体対応、表示環境上の注意をbrowser内で確認するreference toolを提供する。

## 3. Inputs

- 任意の文字列。
- JA / EN UI language。
- Analyze、Copy all、Copy CSV、各value copy action。

## 4. Processing behavior

- 入力文字列からwhitespaceを除き、unique character単位で解析する。
- 各文字についてUnicode `U+...`、decimal code point、HTML hexadecimal/decimal entity、UTF-16 code unitsを表示する。
- CJK Compatibility Ideographs、supplementary-plane character、variation selectorの該当数と注意を表示する。
- Old Kanji Referenceのsame-site dataを読み込み、old→modern mapping、modern→old candidates、reading、meaning、category、usage、compatibility noteを補足する。
- character / Unicode / HTML entity / UTF-16を個別copyでき、全結果とCSV形式もcopyできる。
- Kanji Modernizerへ入力文字列をquery付きで引き継ぐlinkを提供する。
- Old Kanji Toolkit Pro panelは現状`billing-unavailable`で、CTAはdisabled。利用可能な課金機能として扱わない。

## 5. Outputs

- total character countとunique count。
- compatibility ideograph / supplementary-plane / variation-selector counts。
- characterごとのUnicode、decimal、HTML entities、UTF-16。
- old/modern mappingとvariant candidates。
- reading、meaning、category、usage、rendering notes。
- clipboard向けsummary / CSV。

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- [ ] billing-unavailableのPro CTAを有効な購入済み機能として扱わない。

## 7. Privacy/data handling

- 入力文字列の解析はbrowser内で行い、外部character APIへ送信しない。
- 辞書・metadataは`tools/old-kanji-reference/`配下のsame-site JSONをfetchする。
- analytics / ads resourceはpage display時にloadされ得る。

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- 入力後にcharacter cardsを縦・grid状に表示し、desktop/mobile双方で利用する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一page上でJA/ENを切り替える。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/unicode-kanji-checker/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] 入力したunique characterごとにUnicode、decimal、HTML hex/decimal、UTF-16を表示する。
- [ ] Compatibility Ideograph、supplementary-plane、variation-selectorを該当rangeに基づき識別する。
- [ ] Old Kanji Reference dataに対応がある文字ではold/modern mappingやmetadataを表示する。
- [ ] 全結果とCSVをclipboardへcopyできる。
- [ ] 入力内容をexternal character APIへ送信しない。
- [ ] billing-unavailableのPro CTAを有効な購入済み機能として扱わない。

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/unicode-kanji-checker/index.html`
- `tools/unicode-kanji-checker/app.js`
- `tools/unicode-kanji-checker/style.css`
