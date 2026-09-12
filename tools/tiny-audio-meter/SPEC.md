# Tool Specification — Tiny Audio Meter

- Slug: `tiny-audio-meter`
- Public URL: `https://nicheworks.app/tools/tiny-audio-meter/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

ブラウザのマイク入力を使い、相対的な音量、単音に近い音の推定周波数・音階、スペクトラム、短い区間の傾向をリアルタイムで確認する。騒音計、法定測定器、業務用音響計、専用チューナーの代替ではない。

## Current functional contract

- 利用者の許可後にブラウザのマイクstreamを開始し、停止操作でtrackを終了する。
- Web Audioのtime-domain dataからRMSを計算し、相対音量を約`-60..0 dB`の範囲で表示する。これはdB SPLではない。
- autocorrelationでpitchを推定し、約60–1200 Hzの範囲で有効な値だけを表示し、A4=440 Hz基準の音名へ変換する。
- frequency dataをcanvas spectrumとして表示する。
- 音量thresholdを使って簡易voice/activity表示を行う。
- 数値snapshotを最大20件までページ内メモリに保持する。音声そのものはsnapshot化しない。
- Segment Analysisでは1秒以上の短い区間について平均音量、平均pitch、安定度・noiseの目安を算出する。
- JA/EN UIを同一ページで切り替える。

## Inputs

- ブラウザのmicrophone permission。
- 端末のマイク入力stream。
- Start / Stop mic。
- Number Snapshot。
- Segment Analysis Start / Stop。
- UI language JA / EN。

## Outputs

- Relative loudness表示とmeter bar。
- 推定Hzと音名。
- spectrum canvas。
- sound activity表示。
- 最大20件の数値snapshot一覧。
- Segment Analysisのduration、average loudness、average pitch、stability/noise目安。

## State and persistence

- snapshot、segment data、現在のmeter値はページメモリのみで、refreshすると消える。
- 音声streamや音声fileを保存しない。
- UI languageは`nw_lang`としてlocalStorageへ保存する。

## Privacy and network behavior

- マイク音声の解析はブラウザ内で行い、音声stream/fileをNicheWorksの解析APIへuploadしない。
- マイク利用にはブラウザpermissionが必要で、Stop時にはstream trackを終了する。
- ページ表示時にはGoogle Analytics / AdSense等の外部resourceが読み込まれ得る。
- 会話、個人情報、未公開情報、第三者の声が入る環境での利用は避けるようUIで注意する。

## Language mode

`bilingual single-page`

同一ページ内でJA/EN表示を切り替える。

## Layout class

`mobile-oriented`

縦方向のmeter、snapshot、segment controlsを中心とし、スマートフォンでも単独操作できる構成。

## Limits and non-goals

- 表示dBはマイクinput level由来の相対値であり、dB SPLではない。
- pitchは単音に近い入力向けの推定で、和音、会話、雑音、環境音では不正確になり得る。
- マイク・ブラウザ・OSの自動gainやfilterの影響を受ける。
- 騒音測定、労働安全、法的証明、専門的な音響測定、楽器調律の保証用途に使わない。
- 音声録音、音声file export、長期history、cloud保存を行わない。

## Acceptance criteria

- [ ] microphone permissionが得られると相対音量、pitch/note、spectrum表示が更新される。
- [ ] Stop Micでstreamを停止し、meter更新を終了できる。
- [ ] snapshotは音声fileではなく数値だけを保存し、20件を超えて無制限に増えない。
- [ ] Segment Analysisは1秒未満を短すぎるとして扱い、十分な区間では集計値を表示する。
- [ ] refresh後にsnapshotやsegment記録が永続復元されない。
- [ ] JA/EN切替が動作し、選択言語が`nw_lang`へ保存される。

## Implementation evidence

- `tools/tiny-audio-meter/index.html` — microphone controls、measurement disclaimers、snapshot/segment UI、privacy説明。
- `tools/tiny-audio-meter/app.js` — Web Audio解析、RMS→relative dB、autocorrelation pitch、60–1200 Hz制限、20 snapshot上限、segment analysis、`nw_lang`保存。