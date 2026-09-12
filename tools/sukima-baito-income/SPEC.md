# Tool Specification — Sukima Baito Income

- Slug: `sukima-baito-income`
- Public URL: `https://nicheworks.app/tools/sukima-baito-income/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

タイミー、出前館、Uber Eats等を含むスキマバイト収入を1件ずつ記録し、月別・年間合計をブラウザ内で整理する。税務判断や確定申告判定ではなく、収入メモとCSV整理の補助を目的とする。

## Current functional contract

- 日付、就業先、区分、金額、任意メモを入力して収入行を追加・編集・削除できる。
- 区分は`報酬` / `交通費` / `手当` / `その他`。
- 月別に入力をグループ化し、各月と年間の合計を表示する。
- CSVは`date,workplace,category,amount,memo`形式でimport/exportできる。import時は即時追加せずpreviewを表示し、形式不正や既存重複をskipしたうえで選択行だけcommitする。
- 就業先候補は最近使った値を入力補助として保存する。
- スクリーンショットOCRはβ機能。最大10枚、各10MBまでを受け、必要時にTesseract.jsを読み込む。大画像は最大辺1600pxを目安に縮小し、OCRテキストから日付・金額・就業先候補をrule-basedで抽出する。
- OCR候補は自動登録せずpreviewで確認・編集・選択後に追加する。
- theme / font size、月グループの折りたたみを提供する。

## Inputs

- 日付。
- 就業先。
- 区分: 報酬 / 交通費 / 手当 / その他。
- 金額（円、正の数）。
- 任意メモ。
- CSV file: `date,workplace,category,amount,memo`。
- OCR用画像ファイル。最大10枚、1枚10MBまで。

## Outputs

- 入力一覧と月別グループ表示。
- 年間合計、今月合計、月別・区分別の集計。
- CSV export。
- CSV import preview、skip理由、duplicate判定。
- OCR候補previewと確認後の追加候補。

## State and persistence

- 収入entries本体はページメモリ上で保持し、localStorageへ永続保存しない。必要な記録はCSV exportで利用者が保存する。
- 就業先候補は`nw-sukima-workplaces-v1`としてlocalStorageに保存する。
- themeは`nw-theme`、font sizeは`nw-font`としてlocalStorageに保存する。
- 月グループの折りたたみ状態は`nw-sukima-collapse-months`としてsessionStorageに保存する。
- CSV/OCR preview状態は現在ページのメモリ上のみで扱う。

## Privacy and network behavior

- 手入力、CSV import/export、集計はブラウザ内で処理する。
- 収入entries本体をNicheWorks backendへ送信する実装はない。
- OCRはオンライン接続を必要とし、必要時に`https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js`からTesseract.jsを読み込む。OCR engine/language data等の追加network accessが発生し得るため、OCR機能はfully offlineではない。
- OCR対象画像はブラウザ内で前処理・認識へ渡す実装で、独自NicheWorks OCR APIへ画像をuploadする契約ではない。
- ページ表示時には広告・解析タグ等の外部resourceが読み込まれ得る。
- 実名、住所、口座情報、マイナンバー等の機微情報を入力しないようUIで注意喚起する。

## Language mode

`Japanese-only`

現行の主要UI・ガイド・集計表示は日本語のみ。

## Layout class

`mobile-oriented`

スマートフォンでの1件入力と月別確認を主用途としつつ、デスクトップでも利用できる縦長レイアウト。

## Limits and non-goals

- 税務申告、所得区分、扶養、住民税、社会保険、源泉徴収、必要経費の判断を行わない。
- entriesは永続保存されないため、ブラウザ終了・reload等で失われ得る。CSVが保存手段である。
- OCRはβで誤読があり、日付・金額・就業先を公式明細等と照合する必要がある。
- OCRの短い日付は現在年を補う場合があり、`年要確認`扱いになる。
- OCRは画像から得た候補を自動確定せず、利用者の確認を必須とする。
- 収入や税額の正確性、公式記録としての適格性を保証しない。

## Acceptance criteria

- [ ] 日付・就業先・正の金額を入力するとentryを追加でき、月別・年間集計へ反映される。
- [ ] entryを編集・削除でき、集計結果が追随する。
- [ ] CSV exportが`date,workplace,category,amount,memo`形式で生成される。
- [ ] CSV importはpreviewを経由し、不正行・重複行を理由付きでskipして選択行だけ追加できる。
- [ ] 収入entries本体はlocalStorageへ永続保存されず、就業先候補だけがlocalStorageへ保存される。
- [ ] OCRは10枚/各10MBのguardを持ち、認識候補を自動commitせず確認previewへ出す。
- [ ] offline時にOCRを実行しようとするとオンライン接続が必要である旨を表示する。

## Implementation evidence

- `tools/sukima-baito-income/index.html` — input fields、CSV/OCR controls、privacy/tax notices、Japanese-only UI。
- `tools/sukima-baito-income/app.js` — non-persistent entries、monthly totals、CSV preview/import/export、workplace/theme/font storage、session collapse state、Tesseract.js lazy load、OCR guards/downscale/candidate confirmation。