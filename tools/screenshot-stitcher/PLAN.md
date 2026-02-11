# tools/screenshot-stitcher/PLAN.md
# IMG-1 Screenshot Stitcher 実装計画（完成形）

目的：SPEC.md を満たす完成形を、破壊的変更なしで一気通貫に作る。

---

## Done（完成条件）
- SPEC.md の「共通仕様」「機能仕様」「無料/Pro」「禁止」全て満たす
- 3ページ（index/usage/unlock）が同じトーンで崩れない
- 320/360/390/428/768/1024/1280で破綻なし
- 外部送信なし（Networkで画像upload無し）
- QA.md の全項目が OK

---

## 実装順序（推奨）
1) UI骨格（index.html）
   - ヘッダー（タイトル＋1行説明、固定禁止）
   - ad-top / donate(1) / main / donate(2) / ad-bottom / footer（最小）
   - JP/EN切替（全UIラベル）

2) CSS（style.css）
   - ライト基調、太字乱用禁止、余白整備
   - リスト行・ボタン・入力の統一
   - スマホで1カラム、PCで2カラム

3) 基本ロジック（app.js）
   - 追加（クリック/D&D）
   - リスト（↑↓/削除/全削除）
   - 幅揃え（最大/指定）
   - トリム（簡易ON/OFF）
   - プレビュー生成（進捗/Busy）
   - PNG出力

4) 業務用機能
   - Per-image trim（Top/Bottom）
   - Redaction（black/pixelate）＋焼き込み

5) 巨大縦長対策
   - 無料制限（枚数/高さ）
   - Proで分割出力（連番PNG）

6) unlock（unlock.html / unlock.js）
   - Proフラグ保存（localStorage）
   - “解除済”表示
   - 本体へ戻る導線

7) usage（usage.html）
   - 使い方手順（JP/EN）
   - FAQ（巨大画像、トリム、モザイク、プライバシー）

8) QA成果物
   - QA.md / SMOKE.md
   - README.md（運用：GitHub公開前提、ローカル必須にしない）

---

## 主要リスクと対策
- canvas上限/メモリ：分割出力、推奨設定、警告UI
- トリム誤検出：安全側（削りすぎ禁止）
- UI崩れ：共通仕様の他ツールと同トーン、太字・濃色を減らす

---

## チェックポイント
- 各段階で「320pxで操作可能か」「寄付2箇所」「余計なリンク無し」を必ず再確認
