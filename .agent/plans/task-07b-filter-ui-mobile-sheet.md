1. **Goal**
   - MobileでフィルタUIを「Filter▼」1ボタン＋シートに統一し、360px幅での横溢れを防止する。
   - 既存の openSheet/closeAllSheets に統一してスクロール復帰回帰を防ぐ。

2. **Scope**
   - targets: `tools/construction-tools-atlas/index.html`, `tools/construction-tools-atlas/style.css`, `tools/construction-tools-atlas/app.js`
   - excluded: everything else

3. **Rules / Prohibitions**
   - クロスツールの共通ナビ追加禁止。
   - 指定スコープ外の編集禁止。
   - `common-spec/spec-ja.md` は変更しない。
   - 新規依存追加禁止。

4. **Change List**
   - `index.html`: Mobile用「Filter▼」ボタンと filterSheet を追加（カテゴリ/工種相当のフィルタ、Apply/Reset）。
   - `style.css`: 360px付近でチップ列を非表示/折りたたみし横溢れゼロ。Filterボタンのタップ領域確保。filterSheetをモバイルでスクロール可能に。
   - `app.js`: Filterボタンで openSheet(filterSheet)。Apply/Reset を既存フィルタ状態に接続し、closeAllSheets で閉じる。UI同期。
   - 既存の言語仕様は変更しない。

5. **Step-by-step Procedure**
   1. 既存HTML/CSS/JSのフィルタUIとシート構造、openSheet/closeAllSheetsの利用箇所を確認。
   2. HTMLにFilterボタンとfilterSheetを追加。
   3. CSSでモバイルのチップ列を折りたたみ/非表示、FilterボタンとシートUI調整。
   4. JSでFilterボタン・Apply/Resetを既存フィルタ状態に配線。
   5. 360px相当での横溢れがないことと、シート開閉後スクロール復帰を確認。

6. **Test Plan**
   - ブラウザで360px幅相当を確認（横スクロールが出ないこと）。
   - Filter▼ → シート開閉 → Apply/Reset の動作確認。
   - シート開閉を複数回繰り返してスクロールが復帰することを確認。

7. **Rollback Plan**
   - 変更した3ファイルをgitで元に戻す。
