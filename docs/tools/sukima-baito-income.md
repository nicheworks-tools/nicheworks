# Sukima Baito Income — canonical tool specification

- **Slug:** `sukima-baito-income`
- **Display name (JA):** スキマバイト収入計算
- **Display name (EN):** Sukima Baito Income
- **Implementation:** `tools/sukima-baito-income/`
- **Registry state:** active (registered implementation present)
- **Category:** income, baito, tax, japan
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `sukima-baito-income` implementation at `/tools/sukima-baito-income/`. It does not authorize a production rewrite.

## 2. Purpose

タイミー、出前館、Uber Eats等を含むスキマバイト収入を1件ずつ記録し、月別・年間合計をブラウザ内で整理する。税務判断や確定申告判定ではなく、収入メモとCSV整理の補助を目的とする。

## 3. Inputs

- 日付。
- 就業先。
- 区分: 報酬 / 交通費 / 手当 / その他。
- 金額（円、正の数）。
- 任意メモ。
- CSV file: `date,workplace,category,amount,memo`。
- OCR用画像ファイル。最大10枚、1枚10MBまで。

## 4. Processing behavior

- 日付、就業先、区分、金額、任意メモを入力して収入行を追加・編集・削除できる。
- 区分は`報酬` / `交通費` / `手当` / `その他`。
- 月別に入力をグループ化し、各月と年間の合計を表示する。
- CSVは`date,workplace,category,amount,memo`形式でimport/exportできる。import時は即時追加せずpreviewを表示し、形式不正や既存重複をskipしたうえで選択行だけcommitする。
- 就業先候補は最近使った値を入力補助として保存する。
- スクリーンショットOCRはβ機能。最大10枚、各10MBまでを受け、必要時にTesseract.jsを読み込む。大画像は最大辺1600pxを目安に縮小し、OCRテキストから日付・金額・就業先候補をrule-basedで抽出する。
- OCR候補は自動登録せずpreviewで確認・編集・選択後に追加する。
- theme / font size、月グループの折りたたみを提供する。

## 5. Outputs

- 入力一覧と月別グループ表示。
- 年間合計、今月合計、月別・区分別の集計。
- CSV export。
- CSV import preview、skip理由、duplicate判定。
- OCR候補previewと確認後の追加候補。

Observed delivery capabilities: clipboard copy **not found**; download/export **present**.

## 6. Error behavior

NEEDS_DECISION — no explicit error/empty-state contract could be established from repository documentation; preserve current safe behavior until a product decision is recorded.

## 7. Privacy/data handling

- 手入力、CSV import/export、集計はブラウザ内で処理する。
- 収入entries本体をNicheWorks backendへ送信する実装はない。
- OCRはオンライン接続を必要とし、必要時に`https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js`からTesseract.jsを読み込む。OCR engine/language data等の追加network accessが発生し得るため、OCR機能はfully offlineではない。
- OCR対象画像はブラウザ内で前処理・認識へ渡す実装で、独自NicheWorks OCR APIへ画像をuploadする契約ではない。
- ページ表示時には広告・解析タグ等の外部resourceが読み込まれ得る。
- 実名、住所、口座情報、マイナンバー等の機微情報を入力しないようUIで注意喚起する。

Persistence evidence: `localStorage` and `sessionStorage`. Network-capable application code: **not found**; non-suite hosts observed: `cdn.jsdelivr.net`, `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- スマートフォンでの1件入力と月別確認を主用途としつつ、デスクトップでも利用できる縦長レイアウト。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `Japanese-only`.
- 現行の主要UI・ガイド・集計表示は日本語のみ。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/sukima-baito-income/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **missing**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] 日付・就業先・正の金額を入力するとentryを追加でき、月別・年間集計へ反映される。
- [ ] entryを編集・削除でき、集計結果が追随する。
- [ ] CSV exportが`date,workplace,category,amount,memo`形式で生成される。
- [ ] CSV importはpreviewを経由し、不正行・重複行を理由付きでskipして選択行だけ追加できる。
- [ ] 収入entries本体はlocalStorageへ永続保存されず、就業先候補だけがlocalStorageへ保存される。
- [ ] OCRは10枚/各10MBのguardを持ち、認識候補を自動commitせず確認previewへ出す。
- [ ] offline時にOCRを実行しようとするとオンライン接続が必要である旨を表示する。

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- Japanese-only is an explicit tool-specific language exception.
- No additional layout exception is established.

### Implementation evidence

- `tools/sukima-baito-income/index.html`
- `tools/sukima-baito-income/app.js`
- `tools/sukima-baito-income/style.css`
