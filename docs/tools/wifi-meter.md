# Wi-Fi Meter — canonical tool specification

- **Slug:** `wifi-meter`
- **Display name (JA):** Wi-Fi目安メーター
- **Display name (EN):** Wi-Fi Meter
- **Implementation:** `tools/wifi-meter/`
- **Registry state:** active (registered implementation present)
- **Category:** wifi, network, speed, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `wifi-meter` implementation at `/tools/wifi-meter/`. It does not authorize a production rewrite.

## 2. Purpose

browserのNetwork Information APIが提供する推定RTTと推定downlinkを定期的に読み、通信状態の変化を簡易表示する。Wi-Fi電波強度、RSSI、実ping、実speed testを測定するtoolではない。

## 3. Inputs

- Start / Stop / Reset actions。
- browser-provided Network Information API values。
- JA / EN language。

## 4. Processing behavior

- `navigator.connection`またはbrowser prefix版Network Information APIを利用する。
- Start後は約1秒ごとに`connection.rtt`と`connection.downlink`を読み取る。
- 前回RTTとの差のabsolute valueをfluctuationとして表示する。
- RTT値を最大50 pointsまでpage memoryへ保持し、canvas trend graphを描画する。
- connection estimateはRTT/fluctuationの簡易thresholdでLow / Medium / High loadへ分類する。
- thresholdはLow: RTT<80msかつfluctuation<30ms、Medium: RTT<180msかつfluctuation<80ms、それ以外をHighとして扱う。
- API unsupportedまたはRTT/downlink unavailableの場合はNot supportedを表示する。
- Stopでpollingを止め、Resetは2回確認式でresult/graphをclearする。
- JA/EN UIを同一pageで切り替える。

## 5. Outputs

- browser-estimated RTT in ms。
- 前回RTTとの差分fluctuation in ms。
- browser-estimated downlink in Mbps。
- Low / Medium / High loadの簡易connection estimate。
- 最大50 pointsのRTT trend graph。
- unsupported/status message。

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- [ ] API非対応時は架空の測定値を生成せずNot supportedを表示する。

## 7. Privacy/data handling

- tool本体はSSID、Wi-Fi password、connected-network list、nearby access point listへアクセスしない。
- RTT/downlinkはbrowserのNetwork Information APIが既に保持するestimateを読むだけで、tool独自のping/download speed-test requestを発生させない。
- page display時にはGA4、AdSense、Cloudflare Analytics等のexternal resourceがloadされ得る。

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- Start/Stop、current values、graph、Resetを縦方向中心に配置する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current evidence: viewport meta present; responsive media rules present.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一pageでJA/ENを切り替える。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/wifi-meter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

Common-spec sections 10–11 require concise main-page guidance, an on-page FAQ after the tool area, and usage documentation linked from safe non-input-flow placement. Observed: `usage.html` **present**; `usage-en.html`/equivalent **missing**; FAQ **present**.

## 14. Functional acceptance tests

- [ ] Network Information API対応browserでStartすると約1秒間隔で推定RTT/downlinkを表示する。
- [ ] 2回目以降のRTT取得では前回値との差をfluctuationとして表示する。
- [ ] RTT trendを最大50 pointsに制限してcanvasへ描画する。
- [ ] thresholdに従ってLow / Medium / Highのconnection estimateを表示する。
- [ ] API非対応時は架空の測定値を生成せずNot supportedを表示する。
- [ ] tool独自のping/speed-test requestやSSID/RSSI取得を行わない。

Automated test evidence: none found; a later repair wave must add behavior-level tests rather than file-existence-only checks.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/wifi-meter/index.html`
- `tools/wifi-meter/app.js`
- `tools/wifi-meter/style.css`
- `tools/wifi-meter/usage.html`
