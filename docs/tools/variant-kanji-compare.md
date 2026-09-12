# Variant Kanji Compare — canonical tool specification

- **Slug:** `variant-kanji-compare`
- **Display name (JA):** 異体字比較ツール | Variant Kanji Compare
- **Display name (EN):** Variant Kanji Compare
- **Implementation:** `tools/variant-kanji-compare/`
- **Registry state:** active (registered implementation present)
- **Category:** variant, kanji, compare
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `variant-kanji-compare` implementation at `/tools/variant-kanji-compare/`. It does not authorize a production rewrite.

## 2. Purpose

見た目が近い漢字、旧字体、異体字を並べ、glyph、Unicode、HTML entity、UTF-16、旧新対応、画数・字形note、表示環境上の注意を比較するreference toolを提供する。

## 3. Inputs

- 比較したいcharacter群。
- preset selection。
- JA / EN UI language。
- Compare、Copy comparison、Copy CSV、各value copy。

## 4. Processing behavior

- 入力からwhitespace、comma、slash等を除き、unique characterとして比較する。
- preset comparisonとして`崎 﨑`、`高 髙`、`吉 𠮷`、`辺 邊 邉`、`斎 齋 齊`、`浜 濱`、`沢 澤`、`国 國`、`学 學`を提供する。
- 各characterをserif / sans-serif / system fontで拡大表示する。
- Unicode、HTML hex/decimal entity、UTF-16 code unitsを表示する。
- Old Kanji Referenceのsame-site dataからold→modern mapping、modern candidates、reading、meaning、usage、category、shape hint、stroke count、compatibility/rendering noteを補足する。
- comparison summaryとdifference hintsを生成する。
- comparison全体、CSV、各character/code valueをclipboardへcopyできる。
- Old Kanji Reference / Unicode Kanji Checkerへのlinkを提供する。
- Old Kanji Toolkit Proは現状`billing-unavailable`でCTA disabled。

## 5. Outputs

- compared character count、compatibility/supplementary/mapping/rendering summary。
- multi-font glyph comparison。
- Unicode / HTML entity / UTF-16 details。
- mapping、metadata、shape/stroke/rendering notes。
- difference hints。
- clipboard comparison / CSV output。

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- [ ] Pro panelをbilling unavailableとして扱い、disabled CTAを有効機能と誤認させない。

## 7. Privacy/data handling

- user input comparisonはbrowser内で行い、external character APIへ送信しない。
- `tools/old-kanji-reference/`配下のsame-site dict/metadata/shape/stroke/compatibility JSONをfetchする。
- analytics / ads resourceはpage display時にloadされ得る。

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- comparison cardsはscreen幅に応じてgrid/stack化し、desktop/mobile双方で確認できる。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一pageでJA/ENを切り替える。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/variant-kanji-compare/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **missing**.

## 14. Functional acceptance tests

- [ ] 任意character群をdedupeしてcomparison gridへ表示できる。
- [ ] preset buttonから代表的variant pair/groupを即時比較できる。
- [ ] 各characterについてmulti-font glyphとUnicode/HTML/UTF-16を表示する。
- [ ] reference dataに存在するmapping、shape、stroke、metadataを補足表示する。
- [ ] comparison結果とCSVをclipboardへcopyできる。
- [ ] Pro panelをbilling unavailableとして扱い、disabled CTAを有効機能と誤認させない。

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/variant-kanji-compare/index.html`
- `tools/variant-kanji-compare/app.js`
- `tools/variant-kanji-compare/style.css`
