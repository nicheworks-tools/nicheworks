# ExecPlan: codex-product-shipping-playbooks SEO基盤修正

## Scope
- tools/codex-product-shipping-playbooks/index.html
- tools/codex-product-shipping-playbooks/ja/index.html
- tools/codex-product-shipping-playbooks/style.css
- sitemap.xml
- 参照のみ: common-spec/spec-ja.md

## Non-goals / 禁止
- AdSense script追加しない
- ad-top/ad-bottom等広告枠追加しない
- URL構成変更しない
- 本文/見出し/FAQ/寄付/ボタン/既存meta文言変更しない

## Steps
1. 仕様確認（GA4 ID、OGP共通画像、JSON-LD方針、内部リンク方針）
2. HTML headへGA4・favicon・og:image/twitter:image・JSON-LD追加
3. フッター近傍に内部リンク3件を控えめ表示で追加（英日）
4. sitemap.xmlへ英日URL追加（重複回避）
5. 差分検証（禁止変更混入チェック）
6. ローカル表示確認とスクリーンショット取得

## Manual verification
- 英語版/日本語版で本文・既存文言が不変
- 追加内部リンクが下部に3件のみ表示
- DevTools/ソースでGA4, og:image, JSON-LD, favicon存在
- sitemapに英日URLが1回ずつ存在
