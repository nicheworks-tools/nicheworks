# Cloudflare Worker Proxy

## セットアップ手順
1. Cloudflare ダッシュボードで新しい Worker を作成します。
2. Worker の Quick Edit で `worker.js` の内容を貼り付けて保存します。
3. Route 設定例：`/cors-proxy*`
4. 公開 URL 例：`https://nicheworks-cors.<cloudflare-domain>.workers.dev/?url=`
