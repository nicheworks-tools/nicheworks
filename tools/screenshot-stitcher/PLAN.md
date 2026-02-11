# tools/screenshot-stitcher/PLAN.md
# Screenshot Stitcher 実装計画（完成版）

## スコープ
- `tools/screenshot-stitcher/` 配下のみ変更。

## ファイル単位実装手順
1. `SPEC.md`
   - 完成仕様をUI/文言/禁止リンク/寄付2箇所/機能一覧で確定。
2. `index.html`
   - ヘッダー、広告枠、寄付2箇所、入力/設定/プレビュー、フッターを構築。
3. `style.css`
   - NicheWorks準拠の余白・カード・ボタン・タイポグラフィを統一。
4. `app.js`
   - 入力（drop/choose/paste）、並べ替え、トリム、幅揃え、プレビュー、出力、ZIP分割を実装。
5. `QA.md`
   - 受け入れ条件を20項目以上に拡張。
6. `SMOKE.md`
   - 5分で終わる最短検証手順を整理。
7. `README.md`
   - 概要、機能、簡易チェック手順を更新。
8. `TODO.md`
   - 今回実装しない将来タスクのみに整理。
9. `CHANGELOG.md`
   - 完成版実装内容を追記。

## 完了条件
- QA全項目を満たす。
- 禁止リンク文言の最終grepが空。
