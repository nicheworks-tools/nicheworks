# Tool Specification — URL Title Collector

- Slug: `url-title-collector`
- Public URL: `https://nicheworks.app/tools/url-title-collector/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

複数URLを1行ずつ入力し、各target pageのHTMLから`<title>`を取得してURL / title / status一覧を作り、CSVまたはTSVとしてcopyできるcollectorを提供する。

## Current functional contract

- textareaの非空行をURL listとして扱い、上から順番に1件ずつ処理する。
- 各target URLを`https://floral-voice-bfc0.nicheworks-tools.workers.dev/?url=...`へquery parameterとして送信し、NicheWorks Worker経由でHTMLを取得する。
- returned HTMLをbrowser側の正規表現で解析し、最初の`<title>...</title>`内容を抽出する。
- statusは`success` / `no-title` / `http-error` / `network-error`を区別する。
- HTTP non-2xxでもresponse bodyが得られた場合はtitle抽出を試し、statusは`http-error`のまま返す。
- 処理progressとtotal / success / fail countを表示する。
- result table全体をquoted CSVまたはTSVとしてclipboardへcopyできる。
- JP rootとEN pageを分ける。

## Inputs

- 1行1URLのtext list。
- Fetch titles action。
- CSV copy / TSV copy / Reset。

## Outputs

- URL / Title / Status table。
- progress bar。
- total / success / fail counts。
- clipboard向けCSV / TSV text。

## State and persistence

- URL input、取得結果、progressはpage memoryのみで永続保存しない。
- browser reload後にresult historyを復元しない。
- account/cloud historyを持たない。

## Privacy and network behavior

- **入力URLはbrowser内だけで処理されない。各URLはNicheWorks Worker `floral-voice-bfc0.nicheworks-tools.workers.dev`へ送信される。**
- Workerがtarget pageへnetwork requestし、取得HTMLをbrowserへ返す構成である。
- target URLはWorker側およびtarget website側から観測可能になり得る。
- pageにはanalytics / ads resourceもloadされ得る。
- 現在のJP/EN page metadataとvisible privacy説明は、入力URLがtitle取得のためNicheWorks Workerへ送信され、Workerからtarget siteへのnetwork requestが発生するruntime behaviorと一致している。

## Language mode

`separate JA/EN pages`

Japanese rootと`/en/`を別pageとして提供する。

## Layout class

`mobile-oriented`

URL textarea、single action、progress、result table、copy actionsを縦方向に配置する軽量layout。

## Limits and non-goals

- Worker/target website/network availabilityに依存する。
- authentication必須page、bot protection、redirect/cookie/session等によって取得に失敗し得る。
- full DOM/browser renderingを行わず、returned HTML textの`<title>`をregexで抽出するだけである。
- JavaScript実行後にのみ生成されるtitleを保証して取得しない。
- URLの安全性・正当性・content trustworthinessを判定しない。
- resultのfile downloadやlong-term historyは提供しない。

## Acceptance criteria

- [ ] 複数URLを1行ずつ入力すると順番にWorkerへ送信してtitle取得を試みる。
- [ ] titleが取れた2xx responseを`success`、titleなしを`no-title`として表示する。
- [ ] non-2xxとnetwork failureをそれぞれ`http-error` / `network-error`として区別する。
- [ ] progressとtotal/success/fail countが処理件数に追随する。
- [ ] result tableをquoted CSVおよびTSVとしてcopyできる。
- [ ] privacy contractが「URLはNicheWorks Workerへ送信される」というruntime事実と一致する。

## Implementation evidence

- `tools/url-title-collector/index.html` — JP input/result/export UI。現行copyにruntimeと異なるlocal-processing表現が残る。
- `tools/url-title-collector/en/index.html` — English page。
- `tools/url-title-collector/app.js` — Worker URL、sequential fetch、title regex、status classification、CSV/TSV copy。
