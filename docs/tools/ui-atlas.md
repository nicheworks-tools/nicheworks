# UI Atlas — canonical tool specification

- **Slug:** `ui-atlas`
- **Display name (JA):** UIアトラス
- **Display name (EN):** UI Atlas
- **Implementation:** `tools/ui-atlas/`
- **Registry state:** active (registered implementation present)
- **Category:** ui, design, atlas, reference
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `ui-atlas` implementation at `/tools/ui-atlas/`. It does not authorize a production rewrite.

## 2. Purpose

実務で使うUI patternを検索・比較し、用途、mobile適性、実装難易度、使い分け、AI prompt wording、implementation noteまで確認できるreference workspaceを提供する。

## 3. Inputs

- search text。
- category filter。
- purpose filter。
- mobile-fit filter。
- implementation difficulty filter。
- pattern card selection。
- favorite toggle。
- compare add/remove/clear。
- Pro generator context fields and compare candidates on the existing generator page。

## 4. Processing behavior

- catalogは100 examplesを扱い、50 interactive examplesと50 extended examplesを提供する。
- search、category、purpose、mobile-fit、implementation difficultyで絞り込める。
- pattern detailではlive sample、what it is、use case、best/not-for、similar patterns、short AI prompt、implementation note、practical intent、beginner wordingを表示する。
- short promptをclipboardへcopyできる。
- favoritesとrecent viewsをbrowser localStorageへ保存する。
- Free compareは最大2件、current legacy common NicheWorks Pro active時は最大5件まで比較できる。
- current Pro layerはfull handoff outputとPro-only sample detailを解放する。
- Pro generatorはinactive時にもPreview-marked outputのcopy / Markdown export / JSON exportを提供するため、export buttonの存在自体はPro専用契約ではない。
- EN root pageとJA pageを分ける。

## 5. Outputs

- filtered pattern catalogと件数。
- interactive/extended pattern detail。
- short AI prompt copy。
- local favorites / recent list。
- Free 2-way / current legacy Pro最大5-way compare。
- Preview-marked handoff/generator output while inactive。
- current legacy Proではfull handoff outputとPro-only sample detail。

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty input:** `NEEDS_DECISION` — the expected user-visible response to empty input is not established by repository evidence.
- **Invalid, unsupported, or over-limit input:** The documented validation, supported-format, and limit rules apply; rejected input must not be represented as a valid result.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

- catalog search、filter、detail、favorites、recent、compareはbrowser内で処理する。
- current live Pro status確認はlegacy共通NicheWorks Pro infrastructureのcontractに従う。
- ページ表示時にはanalytics / ads resourceが読み込まれ得る。
- catalog入力として利用者が機密文書をuploadする機能はない。
- staged product-scoped controllerは固定product/feature entitlement metadataだけを扱い、search text、generator context、compare candidates、favorite/recent、generated outputをbilling/entitlement requestへ追加しない。

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `ko-fi.com`, `ofuse.me`, `buy.stripe.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- desktop-firstのfilters / catalog / detail workspaceを主構成とし、mobileではpanelを縮退・sheet化する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- English rootと`/ja/`を別pageとして提供する。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/ui-atlas/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `recommended-and-present`. Evidence: `tools/ui-atlas/ja/usage/index.html`, `tools/ui-atlas/usage/index.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] 100-example catalogをsearch/filterし、detailを開ける。
- [ ] detailからshort AI promptをcopyできる。
- [ ] favorite/recentがlanguage-specific localStorageへ保存され、再訪時に復元される。
- [ ] Free状態ではcompareが2件を超えず、上限時にupgrade案内を表示する。
- [ ] current legacy Pro active時はcompare上限が5件へ拡張される。
- [ ] Preview-marked generator copy/Markdown/JSON exportはinactive時にもcurrent runtime contractとして利用できる。
- [ ] EN rootとJA pageの双方で同等のcore catalog workflowを利用できる。
- [ ] staged product-scoped wrapperは3 paid operationsをexactly once定義し、entitlement state machineはshared coreへ委譲する。
- [ ] staged wrapperはcommercial configurationが承認されるまでpublic runtimeへ接続しない。

Automated test evidence: `scripts/check-ui-atlas-product-scoped-staging.mjs` (regression/contract test). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/ui-atlas/index.html`
- `tools/ui-atlas/README.md`
- `tools/ui-atlas/app.js`
- `tools/ui-atlas/styles.css`
