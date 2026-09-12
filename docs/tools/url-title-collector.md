# URL Title Collector — canonical tool specification

- **Slug:** `url-title-collector`
- **Display name (JA):** URLタイトル収集ツール
- **Display name (EN):** URL Title Collector
- **Implementation:** `tools/url-title-collector/`
- **Registry state:** active (registered implementation present)
- **Category:** url, title, collector, docs
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `FIX`

## 1. Identity

This record is the canonical per-tool contract for the registered `url-title-collector` implementation at `/tools/url-title-collector/`. It does not authorize a production rewrite.

## 2. Purpose

複数URLを1行ずつ入力し、各target pageのHTMLから`<title>`を取得してURL / title / status一覧を作り、CSVまたはTSVとしてcopyできるcollectorを提供する。

## 3. Inputs

- 1行1URLのtext list。
- Fetch titles action。
- CSV copy / TSV copy / Reset。

## 4. Processing behavior

- textareaの非空行をURL listとして扱い、上から順番に1件ずつ処理する。
- 各target URLを`https://floral-voice-bfc0.nicheworks-tools.workers.dev/?url=...`へquery parameterとして送信し、NicheWorks Worker経由でHTMLを取得する。
- returned HTMLをbrowser側の正規表現で解析し、最初の`<title>...</title>`内容を抽出する。
- statusは`success` / `no-title` / `http-error` / `network-error`を区別する。
- HTTP non-2xxでもresponse bodyが得られた場合はtitle抽出を試し、statusは`http-error`のまま返す。
- 処理progressとtotal / success / fail countを表示する。
- result table全体をquoted CSVまたはTSVとしてclipboardへcopyできる。
- JP rootとEN pageを分ける。

## 5. Outputs

- URL / Title / Status table。
- progress bar。
- total / success / fail counts。
- clipboard向けCSV / TSV text。

Observed delivery capabilities: clipboard copy **present**; download/export **not found**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **File read or parsing failure:** The implementation’s documented error path applies and no failed parse is represented as a valid output.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

- **入力URLはbrowser内だけで処理されない。各URLはNicheWorks Worker `floral-voice-bfc0.nicheworks-tools.workers.dev`へ送信される。**
- Workerがtarget pageへnetwork requestし、取得HTMLをbrowserへ返す構成である。
- target URLはWorker側およびtarget website側から観測可能になり得る。
- pageにはanalytics / ads resourceもloadされ得る。
- 現在のpage metadata/説明に残る「ローカル処理」「Fully browser-based」という表現はruntime behaviorと一致せず、このSPECではruntimeを正とする。

Persistence evidence: no `localStorage` or `sessionStorage` reference found in inspected implementation text. Network-capable application code: **found**.

## 8. Responsive contract

- **Layout class:** `mobile-oriented` (source classification: `mobile-oriented`).
- URL textarea、single action、progress、result table、copy actionsを縦方向に配置する軽量layout。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- Japanese rootと`/en/`を別pageとして提供する。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/url-title-collector/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **missing**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/url-title-collector/en/usage.html`, `tools/url-title-collector/usage.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-missing`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] 複数URLを1行ずつ入力すると順番にWorkerへ送信してtitle取得を試みる。
- [ ] titleが取れた2xx responseを`success`、titleなしを`no-title`として表示する。
- [ ] non-2xxとnetwork failureをそれぞれ`http-error` / `network-error`として区別する。
- [ ] progressとtotal/success/fail countが処理件数に追随する。
- [ ] result tableをquoted CSVおよびTSVとしてcopyできる。
- [ ] privacy contractが「URLはNicheWorks Workerへ送信される」というruntime事実と一致する。

Automated test evidence: none found. Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/url-title-collector/index.html`
- `tools/url-title-collector/app.js`
- `tools/url-title-collector/en/usage.html`
- `tools/url-title-collector/style.css`
- `tools/url-title-collector/usage.html`
