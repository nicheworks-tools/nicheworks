# Tool Specification — Tiny Audio Meter

- Slug: `tiny-audio-meter`
- Public URL: `https://nicheworks.app/tools/tiny-audio-meter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

ブラウザのマイク入力を使い、相対入力レベル、単音に近い音の推定周波数・音階、pitch confidence、スペクトラム、短い区間の傾向を確認し、同一端末・同一マイク内で基準値との差も比較する。騒音計、法定測定器、業務用音響計、専用チューナーの代替ではない。

## Primary workflow

1. 利用者がマイクを開始し、browser permissionを許可する。
2. `echoCancellation=false`、`noiseSuppression=false`、`autoGainControl=false`を要求する。
3. browser/deviceが公開する実際のEC / NS / AGC settingsを表示する。
4. relative level、pitch/note/confidence、spectrum、spectrum peakを表示する。
5. 必要に応じて現在値をbaselineとして保存し、同じマイクでrelative level/pitchの差を比較する。
6. 必要に応じてnumeric snapshotまたは1秒以上のsegment analysisを使う。

## Current functional contract

- Browser microphone streamを開始し、Stop操作で全trackとanimation loopを終了する。
- permission取得後に公開された`audioinput`を列挙し、複数入力がある場合は切り替えられる。
- device label / device IDは永続保存せずaffiliate analyticsにも送らない。
- Web Audio time-domain dataからRMSを計算し、約`-60..0 dB`のrelative input levelとして表示する。これはdB SPLではない。
- pitch解析は約100 ms間隔にthrottleし、約60–1200 Hz相当のnormalized autocorrelationからrelative confidenceを算出する。
- confidenceが低いpitch estimateはHz/note表示から除外する。
- A4=440 Hz基準で推定Hzをnote nameへ変換する。
- frequency dataをcanvas spectrumとして表示し、同じanalyser dataから40 Hz–12 kHz内の最大成分を`spectrum peak`として表示する。spectrum peakとpitch estimateは別指標であり一致を保証しない。
- RMS thresholdによる簡易sound activity表示を行う。

## Baseline comparison contract

- Baselineは現在のrelative levelと、その時点で有効な場合のみpitch/note/confidenceをpage memoryへ保存する。
- Baseline取得後、現在のrelative level minus baseline relative levelを相対差として表示する。
- Baseline/current双方に有効なpitchがある場合のみpitch差をHzで表示する。
- Relative level差は校正済みdB SPL差を意味しない。用途は同じ端末・同じマイク・近い条件でのbefore/after比較に限定する。
- microphone streamの開始/停止、またはinput device変更時はbaselineを破棄する。
- BaselineはlocalStorage等へ永続保存しない。
- reported EC / NS / AGCのいずれかが`true`の場合、比較値が端末側処理の影響を受け得ることを警告する。

## Snapshot / segment contract

- 数値snapshotを最大20件までpage memoryに保持する。音声は保存しない。
- Segment Analysisでは1秒以上の区間についてaverage relative level、average pitch、pitch stabilityの目安を算出する。
- snapshot、segment result、baselineはrefreshすると消える。

## Inputs

- Browser microphone permission。
- Microphone input stream。
- 利用可能な場合のaudio input device selection。
- Start / Stop mic。
- Set / Clear baseline。
- Numeric snapshot。
- Segment Analysis Start / Stop。
- UI language JA / EN。

## Outputs

- Relative input levelとmeter bar。
- 推定Hzとnote name。
- Relative pitch confidence。
- Spectrum canvasとspectrum peak frequency。
- Sound activity表示。
- EC / NS / AGCのreported track settingsと必要時のprocessing warning。
- Baseline summary、relative level delta、validな場合のpitch delta。
- 最大20件のnumeric snapshots。
- Segment Analysis summary。

## State and persistence

- baseline、snapshot、segment data、current meter values、device selectionはpage memoryのみ。
- 音声stream/fileを保存しない。
- microphone device label / device IDをlocalStorageへ保存しない。
- UI languageのみ`nw_lang`としてlocalStorageへ保存する。

## Privacy and network behavior

- マイク音声の解析はbrowser内で行い、audio stream/fileをNicheWorksの解析APIへuploadしない。
- Stop時には全media stream trackを終了する。
- GA4やaffiliate analyticsへdevice label、relative level、pitch、note、confidence、spectrum peak、baseline、snapshot、segment resultを送らない。
- ページ表示時にはGoogle Analytics / AdSense等の外部resourceが読み込まれ得る。

## Amazon affiliate readiness

The page loads `/assets/amazon-affiliate.js` plus local `affiliate-config.js`.

Default configuration remains disabled:

- `enabled: false`
- `sound_level_meter: ""`
- `usb_microphone: ""`

While disabled or without valid Amazon HTTPS targets, no Amazon CTA/disclosure/affiliate click event appears. When Amazon Associates is ready, activation requires only verified target URLs plus `enabled: true`.

Planned contextual targets remain:

- `sound_level_meter` — dedicated/calibrated sound-level measurement.
- `usb_microphone` — improved audio input/recording hardware.

Allowed affiliate analytics remain limited to coarse `tool`, `affiliate`, `target`, and `placement` metadata.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

Live values appear first; baseline/snapshot/segment comparison tools are secondary; limitations and FAQ follow.

## Limits and non-goals

- Displayed dB and baseline dB delta are relative microphone input values, not calibrated dB SPL.
- `echoCancellation=false`等を要求してもbrowser / OS / hardwareが無視する場合がある。
- pitchは単音に近い入力向けで、和音、会話、雑音、環境音では不正確になり得る。
- pitch confidenceは正解確率ではない。
- spectrum peakは最大FFT成分であり、fundamental/pitchを保証しない。
- 異なるdevice間のbaseline比較は行わない。device変更時にbaselineを破棄する。
- 騒音測定、労働安全、法的証明、専門的音響測定、保証用途には専用機器を使用する。
- 音声録音、audio file export、long-term history、cloud保存を行わない。

## Acceptance criteria

- [ ] microphone permission後にrelative level、pitch/note/confidence、spectrum、spectrum peakが更新される。
- [ ] EC / NS / AGCをfalseで要求し、reported settingsを表示する。
- [ ] reported EC / NS / AGCのいずれかがONならprocessing warningが表示される。
- [ ] 複数audioinputがある場合はinput deviceを切り替えられる。
- [ ] Baselineを設定するとrelative level deltaが表示され、pitch deltaは双方にvalid pitchがある場合だけ表示される。
- [ ] microphone start/stopまたはdevice変更でbaselineが破棄される。
- [ ] Baselineやmicrophone-derived valuesは永続保存・affiliate analytics送信されない。
- [ ] snapshotは最大20件、segment analysisは1秒未満を短すぎるとして扱う。
- [ ] JA/EN切替が動作し、選択言語のみ`nw_lang`へ保存される。
- [ ] Default affiliate configurationではAmazon CTA/disclosureが表示されない。

## Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/comparison.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/comparison.css`
- `tools/tiny-audio-meter/affiliate-config.js`
- `assets/amazon-affiliate.js`
