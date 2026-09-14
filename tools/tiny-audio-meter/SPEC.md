# Tool Specification — Tiny Audio Meter

- Slug: `tiny-audio-meter`
- Public URL: `https://nicheworks.app/tools/tiny-audio-meter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`
- Affiliate rules when enabled: `common-spec/amazon-affiliate.md`

## Purpose

ブラウザのマイク入力を使い、relative input level、単音に近いpitch/note、pitch confidence、spectrum、短区間傾向、baseline差、2秒ambient relative reference、numeric snapshot/CSV、そしてbefore/after比較時の取得条件を確認する。騒音計、法定測定器、業務用音響計、専用チューナーの代替ではない。

## Primary workflow

1. マイクを開始しbrowser permissionを許可する。
2. EC / NS / AGCをOFFで要求し、実際のreported settingsを表示する。
3. relative level、pitch/note/confidence、spectrum/peakを確認する。
4. 必要に応じbaselineまたは2秒ambient referenceで相対比較する。
5. numeric snapshot / segment analysisを利用し、snapshotはローカルCSV/summaryとして持ち出せる。
6. before/after比較時は測定条件メモでdevice label、sample rate、FFT size、EC / NS / AGCを確認・ローカルコピーする。

## Current functional contract

- Browser microphone streamを開始し、Stopで全trackとanimation loopを終了する。
- permission後に`audioinput`を列挙し、複数入力があれば切り替えられる。
- `echoCancellation=false`、`noiseSuppression=false`、`autoGainControl=false`を要求するが、browser/OS/deviceが無視する可能性があるためreported stateを表示する。
- Web Audio time-domain dataからRMSを計算し約`-60..0 dB`のrelative input levelとして表示する。dB SPLではない。
- pitchは約100ms cadence、概ね60–1200Hzのnormalized autocorrelationで推定し、低confidence結果をHz/noteから除外する。
- A4=440Hzでnoteへ変換する。
- frequency dataをcanvasへ描画し、同じanalyserから40Hz–12kHz内の最大FFT成分をspectrum peakとして表示する。
- comparison hookは同じanalyserから`sampleRate`と`fftSize`もpage-local custom eventへ出す。別stream/analyser acquisitionは作らない。

## Baseline comparison contract

- Baselineは現在のrelative levelと、その時点でvalidなpitch/note/confidenceのみpage memoryへ保存する。
- current minus baselineのrelative level差を表示し、双方valid pitchのときだけpitch差を表示する。
- mic start/stopまたはdevice変更でbaselineを破棄する。
- Baselineは校正済みdB SPL差ではない。

## Ambient relative reference contract

- 約2秒、表示relative dBを約100ms間隔でpage memoryへsampleし、有効値10点以上の中央値をreferenceにする。
- `current relative dB - ambient reference relative dB`を表示する。
- microphone calibration、sensitivity correction、noise-floor SPL、校正済みdB SPLではない。
- mic start/stopまたはdevice変更でsampling/referenceを破棄する。
- Ambient referenceはactivity threshold、pitch detection、spectrum計算を変更しない。
- EC / NS / AGCがONなら自動処理影響を警告する。

## Snapshot / segment contract

- numeric snapshotは最大20件、page memoryのみ。音声は保存しない。
- 現在残っているsnapshotだけを`time,relative_db,pitch_hz,note,pitch_confidence_percent`のCSVへローカル生成できる。
- 削除済みsnapshotは後のCSV/summaryへ復活させない。
- Snapshot summaryは件数、relative dB min/avg/max、有効pitch件数/平均Hzをローカルコピーできる。
- Segment Analysisは1秒以上を対象にaverage relative level、average pitch/confidence、rough pitch stabilityをまとめる。
- Segment result copyにもrelative input valueでありdB SPLではない旨を含める。

## Measurement conditions contract

- マイク稼働中、selected input device label、同じanalyserのsample rate/FFT size、reported EC / NS / AGCを表示する。
- sample rate/FFT sizeは`nw-tiny-audio-spectrum`の既存same-analyser eventから受け取る。
- device labelはページ表示と利用者が明示的に押したlocal clipboard copyだけに使用する。
- conditions copyには「relative browser microphone-input measurementでありcalibrated dB SPLではない」旨を含める。
- mic start/stop/device変更でcached sample rate/FFT stateを破棄し、active analyserから新しい値が来るまで`—`とする。
- conditions機能は`getUserMedia`を呼ばず、新しいstreamを作らない。

## Inputs

- Browser microphone permission / microphone stream。
- Input device selection。
- Start / Stop mic。
- Set / Clear baseline。
- Set / Clear 2-second ambient reference。
- Numeric snapshot / CSV / summary。
- Segment Start / Stop / copy。
- Measurement conditions copy。
- JA / EN。

## Outputs

- Relative level / meter bar。
- Estimated Hz / note / confidence。
- Spectrum / spectrum peak。
- Sound activity。
- EC / NS / AGC reported states / warning。
- Baseline delta、ambient reference/delta。
- Up to 20 numeric snapshots、summary、CSV。
- Segment summary/copy。
- Measurement conditions: active device label、sample rate、FFT size、EC / NS / AGC、local copy。

## State and persistence

- baseline、ambient reference、snapshot、segment、current meter values、device selection、sample rate/FFT conditionsはpage memoryのみ。
- CSV/summary/copy textは利用者操作時にbrowser内で一時生成する。
- audio stream/fileやmeasurement historyを保存しない。
- device label/device IDをlocalStorageへ保存しない。
- UI languageのみ`nw_lang`として保存し得る。

## Privacy and network behavior

- 音声解析はbrowser内で行い、audio stream/fileをNicheWorks解析APIへuploadしない。
- Stop時には全media trackを終了する。
- GA4やaffiliate analyticsへdevice label/ID、relative level、pitch、note、confidence、spectrum peak、sample rate、FFT size、baseline、ambient、snapshot、segment、conditions copyを送らない。
- Device labelはexplicit local conditions copyには含められるが、外部送信は禁止する。
- Snapshot CSV/summary、segment copy、conditions copyはbrowser内だけで生成する。

## Amazon affiliate activation

Shared `/assets/amazon-affiliate.js` plus local `affiliate-config.js` are loaded. Production is active with the user-provided Amazon Special Links:

- `enabled: true`
- `sound_level_meter: "https://amzn.to/4xHeUyd"`
- `usb_microphone: "https://amzn.to/4iZFUF8"`

Valid configuration may expose contextual Amazon navigation for a dedicated sound-level meter or USB microphone and renders the shared Associates disclosure. Disabled/invalid config must still show no CTA/disclosure and emit no affiliate click.

Allowed `affiliate_click` metadata remains coarse `tool`, `affiliate`, `target`, `placement` only. Measurement/device/conditions state is forbidden. The configured URLs do not include live microphone-derived values, device labels, baseline state, CSV/snapshot data, or other user state.

## Language mode

`bilingual single-page`

## Layout class

`mobile-oriented`

Live values remain first. Baseline/ambient/snapshot/segment/conditions are secondary analysis cards. Condition grid collapses on narrow screens.

## Limits and non-goals

- All displayed dB/delta values are relative microphone-input values, not calibrated dB SPL。
- Pitch confidenceは正解確率ではない。
- Spectrum peakはfundamental/pitchを保証しない。
- Measurement conditionsはcalibrationやlaboratory reproducibilityを保証しない。
- `echoCancellation=false`等を要求しても実際にOFFになるとは限らない。
- 異なるdevice間のbaseline/ambient比較を行わない。
- 騒音測定、労働安全、法的証明、専門音響測定には専用機器を使用する。
- 音声録音/audio export/long-term history/cloud保存は行わない。
- Amazon CTA does not claim calibrated performance, price, availability, rating, or review quality.

## Acceptance criteria

- [ ] microphone permission後にrelative level、pitch/note/confidence、spectrum/peakが更新される。
- [ ] EC / NS / AGCをOFF要求し、reported statesを表示する。
- [ ] multiple audioinputを切替でき、device identifierを永続保存しない。
- [ ] baseline/ambientはpage-onlyで、mic start/stop/device変更で破棄される。
- [ ] snapshot max20、segment min1秒、numeric CSV/summary/copyはローカルのみ。
- [ ] measurement conditionsはactive device label、same-analyser sample rate/FFT size、EC / NS / AGCを表示・ローカルコピーする。
- [ ] measurement conditionsはsecond `getUserMedia`を開かず、analytics/affiliateへ条件値を送らない。
- [ ] Baselineやmicrophone-derived valuesは永続保存・affiliate analytics送信されない。
- [ ] Active affiliate configuration uses only the verified sound-level-meter and USB-microphone Special Links with coarse click metadata.

## Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/comparison.js`
- `tools/tiny-audio-meter/ambient-reference.js`
- `tools/tiny-audio-meter/records-export.js`
- `tools/tiny-audio-meter/measurement-conditions.js`
- `tools/tiny-audio-meter/style.css`
- `tools/tiny-audio-meter/comparison.css`
- `tools/tiny-audio-meter/affiliate-config.js`
- `assets/amazon-affiliate.js`
