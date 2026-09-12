# Tiny Audio Meter — canonical tool specification

- **Slug:** `tiny-audio-meter`
- **Display name (JA):** 簡易オーディオメーター
- **Display name (EN):** Tiny Audio Meter
- **Implementation:** `tools/tiny-audio-meter/`
- **Registry state:** active (registered implementation present)
- **Category:** audio, meter, sound, browser
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `tiny-audio-meter` implementation at `/tools/tiny-audio-meter/`. It does not authorize a production rewrite.

## 2. Purpose

ブラウザのマイク入力を使い、相対的な音量、単音に近い音の推定周波数・音階、スペクトラム、短い区間の傾向をリアルタイムで確認する。騒音計、法定測定器、業務用音響計、専用チューナーの代替ではない。

## 3. Inputs

- ブラウザのmicrophone permission。
- 端末のマイク入力stream。
- Start / Stop mic。
- Number Snapshot。
- Segment Analysis Start / Stop。
- UI language JA / EN。

## 4. Processing behavior

- 利用者の許可後にブラウザのマイクstreamを開始し、停止操作でtrackを終了する。
- Web Audioのtime-domain dataからRMSを計算し、相対音量を約`-60..0 dB`の範囲で表示する。これはdB SPLではない。
- autocorrelationでpitchを推定し、約60–1200 Hzの範囲で有効な値だけを表示し、A4=440 Hz基準の音名へ変換する。
- frequency dataをcanvas spectrumとして表示する。
- 音量thresholdを使って簡易voice/activity表示を行う。
- 数値snapshotを最大20件までページ内メモリに保持する。音声そのものはsnapshot化しない。
- Segment Analysisでは1秒以上の短い区間について平均音量、平均pitch、安定度・noiseの目安を算出する。
- JA/EN UIを同一ページで切り替える。

## 5. Outputs

- Relative loudness表示とmeter bar。
- 推定Hzと音名。
- spectrum canvas。
- sound activity表示。
- 最大20件の数値snapshot一覧。
- Segment Analysisのduration、average loudness、average pitch、stability/noise目安。

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/tiny-audio-meter/app.js`, `tools/tiny-audio-meter/index.html`.

## 7. Privacy/data handling

- マイク音声の解析はブラウザ内で行い、音声stream/fileをNicheWorksの解析APIへuploadしない。
- マイク利用にはブラウザpermissionが必要で、Stop時にはstream trackを終了する。
- ページ表示時にはGoogle Analytics / AdSense等の外部resourceが読み込まれ得る。
- 会話、個人情報、未公開情報、第三者の声が入る環境での利用は避けるようUIで注意する。

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- 縦方向のmeter、snapshot、segment controlsを中心とし、スマートフォンでも単独操作できる構成。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一ページ内でJA/EN表示を切り替える。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/tiny-audio-meter/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] microphone permissionが得られると相対音量、pitch/note、spectrum表示が更新される。
- [ ] Stop Micでstreamを停止し、meter更新を終了できる。
- [ ] snapshotは音声fileではなく数値だけを保存し、20件を超えて無制限に増えない。
- [ ] Segment Analysisは1秒未満を短すぎるとして扱い、十分な区間では集計値を表示する。
- [ ] refresh後にsnapshotやsegment記録が永続復元されない。
- [ ] JA/EN切替が動作し、選択言語が`nw_lang`へ保存される。

Automated test evidence: none found. Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/tiny-audio-meter/index.html`
- `tools/tiny-audio-meter/app.js`
- `tools/tiny-audio-meter/style.css`
