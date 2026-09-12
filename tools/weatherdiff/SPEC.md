# Tool Specification — WeatherDiff

- Slug: `weatherdiff`
- Public URL: `https://nicheworks.app/tools/weatherdiff/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

日本国内の地点についてOpen-MeteoとMET Norwayの予報を並べ、今日・明日の気温、降水、風とAPI間の差分を参考比較する。防災・避難・警報・交通・業務上の意思決定を行うtoolではない。

## Current functional contract

- 日本国内の地点名入力からgeocodingし、緯度経度を解決する。
- HTTPS環境ではbrowser Geolocationから現在地の緯度経度を取得できる。
- 現在地利用時はreverse geocodingを試し、表示用のplace nameを補う。
- 緯度経度をOpen-MeteoとMET Norwayへ送り、今日・明日のforecastを取得する。
- 両APIについてhigh/low temperature、precipitation、wind、weather icon相当を表示する。
- high/low temperature、precipitation、windのAPI間differenceを表示する。
- resultからGoogle Weather、Weather.com、AccuWeather、気象庁、tenki.jp、Yahoo天気等へのreference linkを提供する。
- JA/EN UIを切り替え、languageのみlocalStorageへ保存する。

## Inputs

- 日本国内のlocation name。
- またはbrowser geolocation permissionとcurrent coordinates。
- Compare / Use my location / Reset。
- JA / EN language。

## Outputs

- resolved location name、latitude/longitude等のlocation summary。
- Open-Meteo today/tomorrow forecast。
- MET Norway today/tomorrow forecast。
- temperature / precipitation / wind difference summary。
- processing timeとexternal reference links。

## State and persistence

- current forecast resultsはpage memoryに保持し、language switch時の再renderに利用する。
- forecast history、location historyを永続保存しない。
- UI languageは`nw_lang`としてlocalStorageへ保存し、旧`weatherdiffLang`があれば移行・削除する。

## Privacy and network behavior

- location-name searchでは入力地点名をexternal geocoding serviceへ送信する。
- weather fetchではlatitude/longitudeをOpen-MeteoとMET Norwayへ送信する。
- current-location利用時はbrowser Geolocationで取得した座標をweather APIへ送信し、表示名取得のためreverse-geocoding requestも発生し得る。
- 自宅、勤務先、学校等のprecise location利用を避けるようUIで注意する。
- analytics / ads resourceもpage display時にloadされ得る。

## Language mode

`separate JA/EN pages`

Japanese rootとEnglish alternate pageを提供し、root runtimeにもJA/EN切替がある。

## Layout class

`mobile-oriented`

location inputと2-provider forecast cards、difference cardを縦方向中心に配置する。

## Limits and non-goals

- 現行toolは日本国内locationを対象とする。
- forecastはproviderごとの更新時刻、aggregation、単位変換、model差により一致しない。
- 最低気温等、一部値はAPI仕様上比較精度が低い場合がある。
- 防災、避難、警報、交通、生命安全、business-critical decisionには使用しない。
- forecast accuracyやprovider availabilityを保証しない。

## Acceptance criteria

- [ ] 日本国内location nameから位置を解決し、両weather providerのforecast取得を試みる。
- [ ] HTTPSかつpermission許可時はbrowser geolocationから比較を開始できる。
- [ ] Open-MeteoとMET Norwayのtoday/tomorrow valuesを別cardで表示する。
- [ ] temperature、precipitation、windのprovider間differenceを表示する。
- [ ] location/geolocation dataのexternal transmissionをprivacy説明と一致させる。
- [ ] language選択を`nw_lang`へ保存し、forecast history自体は永続保存しない。

## Implementation evidence

- `tools/weatherdiff/index.html` — location/geolocation UI、two-provider cards、privacy/safety disclaimers、alternate language page。
- `tools/weatherdiff/app.js` — finalized coreのentry point。
- `tools/weatherdiff/app-final.js` — language persistence、geolocation/geocoding、Open-Meteo/MET Norway fetch、comparison rendering、external links。