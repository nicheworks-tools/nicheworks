# WeatherDiff — canonical tool specification

- **Slug:** `weatherdiff`
- **Display name (JA):** 天気比較ツール
- **Display name (EN):** WeatherDiff
- **Implementation:** `tools/weatherdiff/`
- **Registry state:** active (registered implementation present)
- **Category:** weather, compare, life, forecast
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `weatherdiff` implementation at `/tools/weatherdiff/`. It does not authorize a production rewrite.

## 2. Purpose

日本国内の地点についてOpen-MeteoとMET Norwayの予報を並べ、今日・明日の気温、降水、風とAPI間の差分を参考比較する。防災・避難・警報・交通・業務上の意思決定を行うtoolではない。

## 3. Inputs

- 日本国内のlocation name。
- またはbrowser geolocation permissionとcurrent coordinates。
- Compare / Use my location / Reset。
- JA / EN language。

## 4. Processing behavior

- 日本国内の地点名入力からgeocodingし、緯度経度を解決する。
- HTTPS環境ではbrowser Geolocationから現在地の緯度経度を取得できる。
- 現在地利用時はreverse geocodingを試し、表示用のplace nameを補う。
- 緯度経度をOpen-MeteoとMET Norwayへ送り、今日・明日のforecastを取得する。
- 両APIについてhigh/low temperature、precipitation、wind、weather icon相当を表示する。
- high/low temperature、precipitation、windのAPI間differenceを表示する。
- resultからGoogle Weather、Weather.com、AccuWeather、気象庁、tenki.jp、Yahoo天気等へのreference linkを提供する。
- JA/EN UIを切り替え、languageのみlocalStorageへ保存する。

## 5. Outputs

- resolved location name、latitude/longitude等のlocation summary。
- Open-Meteo today/tomorrow forecast。
- MET Norway today/tomorrow forecast。
- temperature / precipitation / wind difference summary。
- processing timeとexternal reference links。

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Network/API failure:** Implemented response checks, rejection handling, timeout/abort logic, or catch paths expose the unavailable/error state; remote failure is not replaced with fabricated remote data.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/weatherdiff/app-final.js`, `tools/weatherdiff/app.js`, `tools/weatherdiff/en/index.html`, `tools/weatherdiff/howto/en/index.html`, `tools/weatherdiff/howto/index.html`, `tools/weatherdiff/index.html`.

## 7. Privacy/data handling

- location-name searchでは入力地点名をexternal geocoding serviceへ送信する。
- weather fetchではlatitude/longitudeをOpen-MeteoとMET Norwayへ送信する。
- current-location利用時はbrowser Geolocationで取得した座標をweather APIへ送信し、表示名取得のためreverse-geocoding requestも発生し得る。
- 自宅、勤務先、学校等のprecise location利用を避けるようUIで注意する。
- analytics / ads resourceもpage display時にloadされ得る。

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `nominatim.openstreetmap.org`, `api.open-meteo.com`, `api.met.no`, `weather.com`, `www.accuweather.com`, `www.jma.go.jp`, `tenki.jp`, `weather.yahoo.co.jp`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- location inputと2-provider forecast cards、difference cardを縦方向中心に配置する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- Japanese rootとEnglish alternate pageを提供し、root runtimeにもJA/EN切替がある。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/weatherdiff/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/weatherdiff/en/usage.html`, `tools/weatherdiff/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] 日本国内location nameから位置を解決し、両weather providerのforecast取得を試みる。
- [ ] HTTPSかつpermission許可時はbrowser geolocationから比較を開始できる。
- [ ] Open-MeteoとMET Norwayのtoday/tomorrow valuesを別cardで表示する。
- [ ] temperature、precipitation、windのprovider間differenceを表示する。
- [ ] location/geolocation dataのexternal transmissionをprivacy説明と一致させる。
- [ ] language選択を`nw_lang`へ保存し、forecast history自体は永続保存しない。

Automated test evidence: none found. Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/weatherdiff/index.html`
- `tools/weatherdiff/app-final.js`
- `tools/weatherdiff/app.js`
- `tools/weatherdiff/en/usage.html`
- `tools/weatherdiff/style.css`
- `tools/weatherdiff/usage.html`
