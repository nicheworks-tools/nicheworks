# UnitMaster — canonical tool specification

- **Slug:** `unitmaster`
- **Display name (JA):** 単位変換マスター
- **Display name (EN):** UnitMaster
- **Implementation:** `tools/unitmaster/`
- **Registry state:** active (registered implementation present)
- **Category:** unit, converter, calculator, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `unitmaster` implementation at `/tools/unitmaster/`. It does not authorize a production rewrite.

## 2. Purpose

長さ、重さ、温度、体積、面積、速度、圧力の代表的な単位を相互変換し、複数候補への一括換算や最近の換算履歴をbrowser内で確認できるutilityを提供する。

## 3. Inputs

- category。
- numeric value。
- from unit。
- to unit。
- auto calculation toggle。
- JA / EN language。
- theme toggle。

## 4. Processing behavior

- categoryはlength / weight / temperature / volume / area / speed / pressureを提供する。
- 数値、from unit、to unitを選んで換算する。
- auto calculationをONにすると入力・unit変更へ追随し、OFFではCalculate buttonで実行する。
- 一括変換accordionから同category内の複数unitへの換算を確認できる。
- 直近5件のconversion historyを表示・保存する。
- JA/EN UIとlight/dark themeを提供する。
- UnitMaster配下のunit search、unit meaning、priority units pageへ導線を持つ。
- 一般的換算係数を使用し、尺貫法等のtraditional unitsは代表的近似値として扱う。

## 5. Outputs

- 単一conversion result。
- bulk conversion result。
- 直近5件のhistory。
- unit meaning/search/priority referenceへのlink。

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented guard clauses prevent the affected action from completing normally. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** Implemented exception/error handlers surface the failure through the current feedback path and do not present the failed operation as a successful output.
- **Network/API failure:** Implemented response checks, rejection handling, timeout/abort logic, or catch paths expose the unavailable/error state; remote failure is not replaced with fabricated remote data.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/unitmaster/app-json-runtime.js`, `tools/unitmaster/app.js`, `tools/unitmaster/index.html`, `tools/unitmaster/runtime-units-adapter.js`, `tools/unitmaster/units/index.html`, `tools/unitmaster/units/priority/index.html`, `tools/unitmaster/units/search/index.html`.

## 7. Privacy/data handling

- unit conversionはbrowser内で計算する。
- 入力値をconversion APIへ送信しない。
- ページ表示時にはGoogle Analytics / AdSense等の外部resourceが読み込まれ得る。
- unit reference pages/dataはNicheWorks site内resourceを利用する。

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- desktopではcategory tabsとside reference cardsを併用し、mobileではselect/stack layoutへ縮退する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一pageでJA/ENを切り替える。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/unitmaster/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-missing`. Evidence: no usage page found. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** not applicable while no usage page exists.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] 7 categoryのfrom/to unitを選び、数値を相互変換できる。
- [ ] auto calculation ON時はinput/unit変更へ結果が追随し、OFF時はbutton実行になる。
- [ ] bulk conversionが同categoryの複数unit結果を表示する。
- [ ] conversion historyは直近5件を超えず、localStorageから再読込できる。
- [ ] language/theme settingがlocalStorageへ保存される。
- [ ] input valueをexternal conversion APIへ送信しない。

Automated test evidence: `tools/unitmaster/scripts/check-app-units-sync.mjs` (regression/contract test), `tools/unitmaster/scripts/check-json-runtime-structure.mjs` (regression/contract test), `tools/unitmaster/scripts/check-runtime-adapter.mjs` (regression/contract test), `tools/unitmaster/scripts/validate-units-json.mjs` (data validation). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/unitmaster/index.html`
- `tools/unitmaster/app-json-runtime.js`
- `tools/unitmaster/app.js`
- `tools/unitmaster/style.css`
