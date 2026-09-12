# Tool Specification — Tiny Audio Meter

- Slug: `tiny-audio-meter`
- Public URL: `https://nicheworks.app/tools/tiny-audio-meter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

ブラウザのマイク入力を使い、相対的な入力レベル、単音に近い音の推定周波数・音階、自己相関ベースのpitch confidence、スペクトラム、短い区間の傾向をリアルタイムで確認する。騒音計、法定測定器、業務用音響計、専用チューナーの代替ではない。

## Primary workflow

1. 利用者がマイク開始を押し、browser permissionを許可する。
2. ツールは可能な限りmeasurement-orientedな入力を得るため、`echoCancellation=false`、`noiseSuppression=false`、`autoGainControl=false`を要求する。
3. browser/deviceが公開する実際のtrack settingsをEC / NS / AGCとして表示する。要求値と実際の値は一致しない場合がある。
4. relative level、pitch/note/confidence、spectrumをリアルタイム表示する。
5. 必要に応じて数値snapshotまたは1秒以上のsegment analysisを使う。

## Current functional contract

- 利用者の許可後にbrowser microphone streamを開始し、Stop操作で全trackとanimation loopを終了する。
- permission取得後にbrowserが公開する`audioinput`を列挙し、複数入力がある場合は入力マイクを切り替えられる。
- device labelはUI表示にのみ使用し、永続保存・affiliate analytics送信を行わない。
- Web Audio time-domain dataからRMSを計算し、約`-60..0 dB`のrelative input levelとして表示する。これはdB SPLではない。
- pitch解析は毎animation frameではなく約100 ms間隔にthrottleする。
- normalized autocorrelationの探索lagを約60–1200 Hz相当に限定し、relative confidenceを算出する。
- confidenceが低いpitch推定はHz/note表示から除外する。
- pitch confidenceはアルゴリズム上の相対値であり、測定精度・正確性の保証ではない。
- A4=440 Hz基準で推定Hzをnote nameへ変換する。
- frequency dataをcanvas spectrumとして表示する。
- RMS thresholdによる簡易sound activity表示を行う。
- 数値snapshotを最大20件までページ内メモリに保持する。snapshotにはrelative level、pitch/note、confidence等の数値のみを保持し、音声そのものを保存しない。
- Segment Analysisでは1秒以上の区間についてaverage relative level、average pitch、pitch stabilityの目安を算出する。
- JA/EN UIを同一ページで切り替える。

## Inputs

- Browser microphone permission。
- 端末のmicrophone input stream。
- 利用可能な場合のaudio input device selection。
- Start / Stop mic。
- Numeric snapshot。
- Segment Analysis Start / Stop。
- UI language JA / EN。

## Outputs

- Relative input levelとmeter bar。
- 推定Hzとnote name。
- Relative pitch confidence。
- Spectrum canvas。
- Sound activity表示。
- EC / NS / AGCのreported track settings。
- 最大20件のnumeric snapshot一覧。
- Segment Analysisのduration、average relative level、average pitch、pitch stability目安。

## State and persistence

- snapshot、segment data、現在のmeter値、device selectionはpage memoryのみで、refreshすると消える。
- 音声streamや音声fileを保存しない。
- microphone device label / device IDをlocalStorageへ保存しない。
- UI languageのみ`nw_lang`としてlocalStorageへ保存する。

## Privacy and network behavior

- マイク音声の解析はブラウザ内で行い、音声stream/fileをNicheWorksの解析APIへuploadしない。
- Stop時には全media stream trackを終了し、animation frameを停止する。
- ページ表示時にはGoogle Analytics / AdSense等の外部resourceが読み込まれ得る。
- 会話、個人情報、未公開情報、第三者の声が入る環境での利用は避けるようUIで注意する。
- GA4やaffiliate analyticsへmicrophone device label、relative level、pitch、note、confidence、spectrum、snapshot、segment resultを送らない。

## Amazon affiliate readiness

The page loads `/assets/amazon-affiliate.js` plus local `affiliate-config.js`.

Default configuration is deliberately disabled:

- `enabled: false`
- `sound_level_meter: ""`
- `usb_microphone: ""`

While disabled or without valid Amazon HTTPS targets:

- no Amazon CTA is shown;
- no Amazon disclosure is shown;
- no affiliate click event is emitted.

When NicheWorks Amazon Associates is ready, activation requires only verified target URLs plus `enabled: true`.

Planned contextual CTAs:

- `sound_level_meter` — for users who need dedicated/calibrated sound-level measurement rather than the browser relative-level display.
- `usb_microphone` — for users looking for improved audio input/recording hardware.

Allowed affiliate analytics are limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata under `common-spec/amazon-affiliate.md`.

## Language mode

`bilingual single-page`

同一ページ内でJA/EN表示を切り替える。

## Layout class

`mobile-oriented`

Primary measurement controls and live values appear before long-form privacy/accuracy explanations. Snapshot/segment tools are secondary, followed by limitations/FAQ.

## Limits and non-goals

- 表示dBはmicrophone input level由来のrelative valueであり、校正されたdB SPLではない。
- `echoCancellation=false`等を要求してもbrowser / OS / hardwareが無視・上書きする場合がある。
- pitchは単音に近い入力向けの推定で、和音、会話、雑音、環境音では不正確になり得る。
- confidenceはpitch estimateの内部相関強度であり、正解確率ではない。
- 騒音測定、労働安全、法的証明、専門的な音響測定、楽器調律の保証用途に使わない。
- 音声録音、音声file export、長期history、cloud保存を行わない。

## Acceptance criteria

- [ ] microphone permissionが得られるとrelative level、pitch/note/confidence、spectrum表示が更新される。
- [ ] microphone requestはEC / NS / AGCをfalseで要求し、reported settingsを表示する。
- [ ] 複数audioinputがbrowserから得られた場合は入力deviceを切り替えられる。
- [ ] pitch解析は約100 ms cadenceで行い、60–1200 Hz相当のlag範囲を使い、低confidence estimateをHz/note表示から除外する。
- [ ] Stop Micでstream trackとmeter updateを終了できる。
- [ ] snapshotは音声fileではなく数値だけを保存し、20件を超えない。
- [ ] Segment Analysisは1秒未満を短すぎるとして扱い、十分な区間では集計値を表示する。
- [ ] refresh後にsnapshot、segment、device selectionが永続復元されない。
- [ ] JA/EN切替が動作し、選択言語のみ`nw_lang`へ保存される。
- [ ] Default affiliate configurationではAmazon CTA/disclosureが表示されない。
- [ ] Affiliate activation後もmicrophone-derived stateやdevice labelをaffiliate analyticsへ送らない。

## Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/affiliate-config.js`
- `assets/amazon-affiliate.js`
