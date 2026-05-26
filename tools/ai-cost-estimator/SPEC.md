# AI Cost Estimator 仕様書 v0.1

## 1. 製品定義

AI Cost Estimator は、ChatGPT / Claude / Gemini / API / Local AI に作業を依頼する前に、想定トークン消費量、API料金、Web版の上限到達リスク、ローカルAIの負荷、分割案を概算する NicheWorks の無料ブラウザツール。

## 2. 価格方針

当面は無料版のみ。Pro分けは行わない。

無料版に含めるもの：

- Quick Estimate
- Detailed Estimate
- Prompt Analyzer
- 推定トークン範囲
- API料金概算
- Web版の上限リスク表示
- Local AIの負荷表示
- 分割案
- 節約案
- 結果コピー
- 日本語 / 英語切替

## 3. 公開パス

- `/tools/ai-cost-estimator/`

## 4. 実装方針

- 静的HTML / CSS / JavaScript
- React / Vue などのフレームワークは使わない
- 外部API通信なし
- ユーザー入力はサーバー送信しない
- localStorage は言語・最後の入力・直近結果程度に限定
- 料金表・プリセット・ルールは JSON 分離

## 5. 対象モード

### 5.1 Quick Estimate

選択式で大まかな作業量を見積もる。

入力：

- Platform
- Model class
- Task type
- Input size
- Output length
- Attachments
- Tool usage

### 5.2 Detailed Estimate

数値入力で見積もる。

入力：

- 日本語文字数
- 英語単語数
- コード行数
- PDFページ数
- 画像枚数
- スクショ枚数
- Web検索有無
- GitHub / PR確認有無
- 再生成回数

### 5.3 Prompt Analyzer

依頼文を貼り付け、キーワードベースで用途・重さ・分割案を推定する。AI/APIは使わない。

## 6. 対象用途

- 通常会話
- 長文相談
- 文章作成
- 要約
- 翻訳
- 仕様書作成
- コード生成
- コードレビュー
- GitHub / PR確認
- PDF解析
- スクショ / UI解析
- Web調査
- 画像生成
- 画像編集
- 動画生成
- 音声文字起こし
- 音声合成
- ローカルAI実行

## 7. 計算式

```text
baseInput = textTokens + codeTokens + pdfTokens + imageTokens + screenshotTokens
adjustedInput = baseInput * taskMultiplier
toolOverhead = historyOverhead + webSearchOverhead + githubOverhead + citationOverhead
subtotal = adjustedInput + toolOverhead + expectedOutputTokens
final = subtotal * retryMultiplier * safetyBuffer
```

## 8. 変換ルール初期値

- 日本語文字数 × 0.8〜1.4 tokens
- 英語単語数 × 1.3〜1.8 tokens
- コード行数 × 8〜25 tokens
- PDFページ数 × 500〜1,800 tokens
- 画像解析 1枚 × 1,000〜5,000 tokens
- スクショ/UI解析 1枚 × 2,000〜8,000 tokens

## 9. リスク判定

- 0〜5,000: 小
- 5,001〜20,000: 中
- 20,001〜60,000: 大
- 60,001〜150,000: 特大
- 150,001以上: 危険

## 10. API / Web / Local の扱い

### API

入力・出力トークンと `pricing.json` の単価から概算料金を表示する。

### Web版

ChatGPT / Claude / Gemini などのWeb版には非公開の利用制限があるため、正確な残り回数は表示しない。作業量リスクのみ表示する。

### Local AI

料金ではなく、RAM / VRAM / 処理速度 / context window リスクを表示する。

## 11. 結果表示

- Estimate Summary
- Token Breakdown
- Cost Estimate
- Limit Risk
- Why it may be heavy
- Split Plan
- Cost-saving Tips
- Copy Result

## 12. 注意書き

このツールは概算であり、正確な請求額、残り利用回数、各社Webアプリの内部制限を保証しない。実際の消費量は、モデル、会話履歴、添付ファイル、ツール利用、内部処理、出力長で変動する。

## 13. v0.1 完了条件

- ページが表示される
- Quick Estimate が動く
- Detailed Estimate が動く
- Prompt Analyzer が動く
- API / Web / Local で結果表示が分かれる
- 推定トークン範囲が出る
- 重さランクが出る
- API料金概算が出る
- 上限リスクが出る
- 分割案が出る
- 結果コピーができる
- 日本語 / 英語切替ができる
- 入力内容を外部送信しない
- FAQとusageページがある
- スマホで崩れない

## 14. v0.1でやらないこと

- Pro版
- ログイン
- サーバー保存
- APIキー入力
- 正確な各社token count API連携
- 自動料金取得
- Chrome拡張
- VS Code拡張
- ChatGPTの残り回数推定
- 実モデル価格の完全網羅
