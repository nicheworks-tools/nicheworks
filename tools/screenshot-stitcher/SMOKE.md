# tools/screenshot-stitcher/SMOKE.md
# 5分スモーク手順

1. 表示確認（1分）
   - `index.html` を開く。
   - ヘッダーが固定されていないこと。
   - 寄付導線が上下2箇所あり、各々OFUSE/Ko-fiがあること。
   - ad-top / ad-bottom があること。

2. 入力確認（1分）
   - 画像を3枚追加（choose or drop）。
   - 追加後、↑↓で順序が入れ替わること。

3. 設定反映（1分）
   - 幅揃えを custom=720 に変更してプレビュー生成。
   - trimをONにして再生成。

4. 出力確認（1分）
   - format=PNG でダウンロード成功。
   - format=WebP/JPEGでも再生成してダウンロード成功。

5. 分割ZIPと文言（1分）
   - split height に 1000 を入れて分割ZIP出力。
   - JP/EN切替が動き、外部送信なし文言が見えること。
