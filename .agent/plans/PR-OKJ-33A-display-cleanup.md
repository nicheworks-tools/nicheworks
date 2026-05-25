# ExecPlan — PR-OKJ-33A Old Kanji card display cleanup

1. **Goal**
   - 旧字体一覧カードの表示を、JP/ENの言語切替に整合しつつ、主情報（意味・読み・対応関係）中心に再構成する。
   - `tools/old-kanji-reference/` の既存ロジックを維持したまま、カード情報密度とモバイル縦長化を改善する。

2. **Scope**
   - targets:
     - `tools/old-kanji-reference/app-meaning-v4.js`
     - `tools/old-kanji-reference/style.css`
   - excluded:
     - 上記以外すべて（spec、apps、他tool）

3. **Rules / Prohibitions**
   - ツール間のヘッダーナビ追加禁止（既存のフッター付近リンクは維持のみ）。
   - スコープ外ファイルを編集しない。
   - `common-spec/spec-ja.md` は編集しない。
   - 既存のJP/EN切替を維持し、JP表示中の英語混在・EN表示中の日本語混在を解消する。

4. **Change List**
   - `app-meaning-v4.js`
     - 一覧カードのラベル文言を言語別に整理（JP/EN混在を解消）。
     - Unicode表示を一覧カードから外し、detail panelへ集約。
     - Category / Status / Verified の主張を弱める（カードでは強調しない構造へ）。
     - `対応のみ` / `確認済み` 等をユーザー向け自然文言へ調整。
     - pair-onlyエントリは「意味未整備」ではなく旧字→新字対応のみ簡潔表示へ変更。
     - Copy old / Copy modern の文言・表示ルールを統一。
   - `style.css`
     - カード内情報ブロックの余白・フォントサイズ・行間を調整し、モバイルで縦長化しにくいレイアウトへ改善。

5. **Step-by-step Procedure**
   1. 既存カード描画関数・detail panel描画関数・文言辞書を確認。
   2. 一覧カードの表示項目と文言を要件に合わせて整理。
   3. Unicode情報をdetail panel表示へ移設。
   4. モバイル向けカードスタイルを調整。
   5. 差分確認、静的チェック（必要最小限）実施。

6. **Test Plan**
   - `git diff` でスコープ内のみ変更確認。
   - JP/ENテキスト混在がないか、カード生成ロジックを目視確認。
   - モバイル向けスタイル差分（メディアクエリ含む）確認。

7. **Rollback Plan**
   - 問題時は `git checkout -- tools/old-kanji-reference/app-meaning-v4.js tools/old-kanji-reference/style.css` で戻す。
