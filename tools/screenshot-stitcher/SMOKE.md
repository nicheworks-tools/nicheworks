# tools/screenshot-stitcher/SMOKE.md
# IMG-1 Smoke Test（リリース前5分）

対象：
- /tools/screenshot-stitcher/
- /tools/screenshot-stitcher/usage.html
- /tools/screenshot-stitcher/unlock.html

手順（本番URLでOK）：
1. index を開く
   - ヘッダーが固定でない
   - 余計なリンク（Contact/Privacy/Terms/Credits）が無い
   - 寄付エリアが2箇所ある（OFUSE/Ko-fi）
   - ad-top/ad-bottomがある

2. 画像3枚追加 → ↑↓で並べ替え → プレビュー生成
   - 順序が反映される
   - 崩れない/固まったように見えない（Busy表示）

3. 幅揃えを指定幅(720px)にして再プレビュー
   - 出力幅が変わる

4. PNGダウンロード
   - 1枚で保存される

5. usage を開く
   - JP/ENがある
   - FAQがある

6. unlock を開く
   - キー入力UIがある
   - 解除済表示が出る（テストキーで可）
