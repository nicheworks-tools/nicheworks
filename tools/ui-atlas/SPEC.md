# Tool Specification — UI Atlas

- Slug: `ui-atlas`
- Public URL: `https://nicheworks.app/tools/ui-atlas/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

実務で使うUI patternを検索・比較し、用途、mobile適性、実装難易度、使い分け、AI prompt wording、implementation noteまで確認できるreference workspaceを提供する。

## Current functional contract

- catalogは100 examplesを扱い、50 interactive examplesと50 extended examplesを提供する。
- search、category、purpose、mobile-fit、implementation difficultyで絞り込める。
- pattern detailではlive sample、what it is、use case、best/not-for、similar patterns、short AI prompt、implementation note、practical intent、beginner wordingを表示する。
- short promptをclipboardへcopyできる。
- favoritesとrecent viewsをbrowser localStorageへ保存する。
- Free compareは最大2件、current legacy common NicheWorks Pro active時は最大5件まで比較できる。
- current Pro layerはfull handoff outputとPro-only sample detailを解放する。
- Pro generatorはinactive時にもPreview-marked outputのcopy / Markdown export / JSON exportを提供するため、export buttonの存在自体はPro専用契約ではない。
- EN root pageとJA pageを分ける。

## Inputs

- search text。
- category filter。
- purpose filter。
- mobile-fit filter。
- implementation difficulty filter。
- pattern card selection。
- favorite toggle。
- compare add/remove/clear。
- Pro generator context fields and compare candidates on the existing generator page。

## Outputs

- filtered pattern catalogと件数。
- interactive/extended pattern detail。
- short AI prompt copy。
- local favorites / recent list。
- Free 2-way / current legacy Pro最大5-way compare。
- Preview-marked handoff/generator output while inactive。
- current legacy Proではfull handoff outputとPro-only sample detail。

## State and persistence

- favoritesは`ui-atlas:${lang}:favorites`としてlocalStorageへ保存する。
- recent viewsは`ui-atlas:${lang}:recent`としてlocalStorageへ保存する。
- compare selection、current detail、filtersはpage stateであり永続保存を仕様としない。
- current live Pro active stateは`UIAtlasProBridge`または共通`NWPro` legacy contractに従う。
- favorites/recentはdevice/browser間でsyncしない。

## Paid-operation boundary

現行runtimeの実装証拠から、product-scoped migrationでpaid operationとして扱う境界は次の3つに限定する。

1. **five-way compare** — Free上限2件を最大5件へ拡張する。
2. **full handoff output** — Preview marker / Preview制約のないfull handoff layerを利用する。
3. **Pro sample details** — Pro-only sample bankのlocked previewではなくfull detail/useを解放する。

現行generatorはPro inactive時にもPreview marker付きのcopy、Markdown export、JSON exportを実行できる。このため`copy` / `export Markdown` / `export JSON`という操作そのものをpaid-only featureへ再分類してFreeから取り上げてはならない。

## Product-scoped migration staging

`tools/ui-atlas/product-scoped-controller.mjs`は**non-live staging module**であり、現在の公開gateを置き換えていない。

このwrapperは共通`assets/nw-product-scoped-controller.mjs`へ委譲し、次を要求する。

- explicit future `productId`。default productは持たない。
- 上記3 paid operationsに対するcomplete / unique feature-ID mapping。
- common server-backed entitlement clientによる`refreshProState({ productId })`。
- exact product match。
- `active: true`。
- `source: "server"`。
- `reason: "verified_entitlement"`。
- verified server responseのfeature listに含まれるoperationだけの解放。

wrong-product、local-only、unverified、missing/duplicate mapping、refresh failureは共通coreでfail closedする。

このstaging moduleはcurrent public pageからloadされず、`pro-bridge.js` / `NWPro` legacy gateもまだ置き換えない。product ID、display name、price、currency、billing model、price tier、Stripe Price env、production feature namespace、test/live policyは明示的に承認されるまで未確定とする。

現行UIに残る`$2.99`およびhistorical shared Payment Linkはlegacy commerce copyであり、future UI Atlas productの価格根拠ではない。

## Privacy and network behavior

- catalog search、filter、detail、favorites、recent、compareはbrowser内で処理する。
- current live Pro status確認はlegacy共通NicheWorks Pro infrastructureのcontractに従う。
- ページ表示時にはanalytics / ads resourceが読み込まれ得る。
- catalog入力として利用者が機密文書をuploadする機能はない。
- staged product-scoped controllerは固定product/feature entitlement metadataだけを扱い、search text、generator context、compare candidates、favorite/recent、generated outputをbilling/entitlement requestへ追加しない。

## Language mode

`separate JA/EN pages`

English rootと`/ja/`を別pageとして提供する。

## Layout class

`pc-oriented`

desktop-firstのfilters / catalog / detail workspaceを主構成とし、mobileではpanelを縮退・sheet化する。

## Limits and non-goals

- catalogはUI選定のreferenceであり、特定patternが常に最適と保証しない。
- accessibility、security、legal/compliance適合を自動認証しない。
- live sampleはproduction implementationそのものではない。
- favorites/historyはlocalStorageのみでaccount syncしない。
- current Pro status取得に失敗した場合はFree compareへfallbackする。
- staged product-scoped contractはproduct ID、price、Stripe Price ID、production feature namespace、live checkoutを承認しない。

## Acceptance criteria

- [ ] 100-example catalogをsearch/filterし、detailを開ける。
- [ ] detailからshort AI promptをcopyできる。
- [ ] favorite/recentがlanguage-specific localStorageへ保存され、再訪時に復元される。
- [ ] Free状態ではcompareが2件を超えず、上限時にupgrade案内を表示する。
- [ ] current legacy Pro active時はcompare上限が5件へ拡張される。
- [ ] Preview-marked generator copy/Markdown/JSON exportはinactive時にもcurrent runtime contractとして利用できる。
- [ ] EN rootとJA pageの双方で同等のcore catalog workflowを利用できる。
- [ ] staged product-scoped wrapperは3 paid operationsをexactly once定義し、entitlement state machineはshared coreへ委譲する。
- [ ] staged wrapperはcommercial configurationが承認されるまでpublic runtimeへ接続しない。

## Implementation evidence

- `tools/ui-atlas/index.html` — 100-example positioning、filters、catalog/detail/compare/favorites/recent/Pro UI。
- `tools/ui-atlas/ja/index.html` — Japanese page。
- `tools/ui-atlas/app.js` — filters、detail、localStorage favorites/recent、Free 2 / legacy Pro 5 compare limits、legacy Pro status handling。
- `tools/ui-atlas/pro-generator.js` — Preview/full output、2/5 candidate behavior、Pro-only sample bank behavior。
- `tools/ui-atlas/pro-bridge.js` — current live legacy shared gate。
- `tools/ui-atlas/product-scoped-controller.mjs` — staged non-live product-scoped wrapper using the shared core。
- `tools/ui-atlas/extended-catalog-final.js` — extended example catalog injection。
- `scripts/check-ui-atlas-product-scoped-staging.mjs`。
- `docs/billing/pro-product-contracts-wave1.md`。
