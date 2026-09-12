# Tool Specification — WiFi Meter

- Slug: `wifi-meter`
- Public URL: `https://nicheworks.app/tools/wifi-meter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

browserのNetwork Information APIが提供する推定RTTと推定downlinkを定期的に読み、通信状態の変化を簡易表示する。Wi-Fi電波強度、RSSI、実ping、実speed testを測定するtoolではない。

## Current functional contract

- `navigator.connection`またはbrowser prefix版Network Information APIを利用する。
- Start後は約1秒ごとに`connection.rtt`と`connection.downlink`を読み取る。
- 前回RTTとの差のabsolute valueをfluctuationとして表示する。
- RTT値を最大50 pointsまでpage memoryへ保持し、canvas trend graphを描画する。
- connection estimateはRTT/fluctuationの簡易thresholdでLow / Medium / High loadへ分類する。
- thresholdはLow: RTT<80msかつfluctuation<30ms、Medium: RTT<180msかつfluctuation<80ms、それ以外をHighとして扱う。
- API unsupportedまたはRTT/downlink unavailableの場合はNot supportedを表示する。
- Stopでpollingを止め、Resetは2回確認式でresult/graphをclearする。
- JA/EN UIを同一pageで切り替える。

## Inputs

- Start / Stop / Reset actions。
- browser-provided Network Information API values。
- JA / EN language。

## Outputs

- browser-estimated RTT in ms。
- 前回RTTとの差分fluctuation in ms。
- browser-estimated downlink in Mbps。
- Low / Medium / High loadの簡易connection estimate。
- 最大50 pointsのRTT trend graph。
- unsupported/status message。

## State and persistence

- RTT history、previous RTT、graph、measurement stateはpage memoryのみで永続保存しない。
- languageは`nw_lang`としてlocalStorageへ保存する。
- legacy `wifi-meter-lang`があれば`nw_lang`へ移行して削除する。
- network measurement historyをcloud/accountへ保存しない。

## Privacy and network behavior

- tool本体はSSID、Wi-Fi password、connected-network list、nearby access point listへアクセスしない。
- RTT/downlinkはbrowserのNetwork Information APIが既に保持するestimateを読むだけで、tool独自のping/download speed-test requestを発生させない。
- page display時にはGA4、AdSense、Cloudflare Analytics等のexternal resourceがloadされ得る。

## Language mode

`bilingual single-page`

同一pageでJA/ENを切り替える。

## Layout class

`mobile-oriented`

Start/Stop、current values、graph、Resetを縦方向中心に配置する。

## Limits and non-goals

- Wi-Fi signal strength/RSSIを測定しない。
- SSID、channel、router/AP、nearby Wi-Fi、passwordを取得しない。
- 実際のping、packet loss、jitter test、download/upload speed testではない。
- Network Information APIはbrowser supportが限定され、Safari/iOS等では値が得られない場合がある。
- browser推定RTT/downlinkは実network performanceと異なる場合がある。
- Low/Medium/Highはtool独自thresholdによる参考分類であり、通信品質保証ではない。

## Acceptance criteria

- [ ] Network Information API対応browserでStartすると約1秒間隔で推定RTT/downlinkを表示する。
- [ ] 2回目以降のRTT取得では前回値との差をfluctuationとして表示する。
- [ ] RTT trendを最大50 pointsに制限してcanvasへ描画する。
- [ ] thresholdに従ってLow / Medium / Highのconnection estimateを表示する。
- [ ] API非対応時は架空の測定値を生成せずNot supportedを表示する。
- [ ] tool独自のping/speed-test requestやSSID/RSSI取得を行わない。

## Implementation evidence

- `tools/wifi-meter/index.html` — Network Information API基準の説明、SSID/RSSI非取得、Start/Stop/result/graph UI、browser-support disclaimer。
- `tools/wifi-meter/app.js` — `navigator.connection` reading、1-second polling、RTT fluctuation、50-point graph、classification thresholds、language migration/persistence。