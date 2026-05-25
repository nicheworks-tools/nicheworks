# tools/screenshot-stitcher/README.md
# Screenshot Stitcher（スクショ縦結合）

複数画像を縦に連結して保存する、ブラウザ内処理専用ツールです。

## ページ
- `index.html` 本体

## 主な機能
- 画像追加（choose / drop / paste）
- 並べ替え（↑↓）
- 幅揃え（max / custom / min）
- 上下余白トリム（threshold指定）
- PNG / WebP / JPEG 出力
- 指定高さで分割しZIP出力
- JP / EN 切替

## ポリシー
- 画像データはブラウザ内のみで処理し、外部送信しません。
- 寄付導線は2箇所（OFUSE / Ko-fi）を固定URLで表示します。
- 不要リンク（問い合わせ / プライバシー / 利用規約 / クレジット）は表示しません。

## クイックチェック
1. 画像3枚を追加
2. 並べ替え
3. プレビュー生成
4. PNG/WebP/JPEGを各1回出力
5. 分割ZIPを1回出力
