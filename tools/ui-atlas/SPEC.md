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
- Free compareは最大2件、common NicheWorks Pro active時は最大5件まで比較できる。
- Proはdecision memo、advanced compare checklist、handoff prompts、accessibility review points、export-ready wording等のhandoff layerを提供する。
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

## Outputs

- filtered pattern catalogと件数。
- interactive/extended pattern detail。
- short AI prompt copy。
- local favorites / recent list。
- Free 2-way / Pro最大5-way compare。
- Pro decision/handoff material。

## State and persistence

- favoritesは`ui-atlas:${lang}:favorites`としてlocalStorageへ保存する。
- recent viewsは`ui-atlas:${lang}:recent`としてlocalStorageへ保存する。
- compare selection、current detail、filtersはpage stateであり永続保存を仕様としない。
- Pro active stateは`UIAtlasProBridge`または共通`NWPro` contractに従う。
- favorites/recentはdevice/browser間でsyncしない。

## Privacy and network behavior

- catalog search、filter、detail、favorites、recent、compareはbrowser内で処理する。
- Pro status確認は共通NicheWorks Pro infrastructureのcontractに従う。
- ページ表示時にはanalytics / ads resourceが読み込まれ得る。
- catalog入力として利用者が機密文書をuploadする機能はない。

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
- Pro status取得に失敗した場合はFree compareへfallbackする。

## Acceptance criteria

- [ ] 100-example catalogをsearch/filterし、detailを開ける。
- [ ] detailからshort AI promptをcopyできる。
- [ ] favorite/recentがlanguage-specific localStorageへ保存され、再訪時に復元される。
- [ ] Free状態ではcompareが2件を超えず、上限時にupgrade案内を表示する。
- [ ] Pro active時はcompare上限が5件へ拡張される。
- [ ] EN rootとJA pageの双方で同等のcore catalog workflowを利用できる。

## Implementation evidence

- `tools/ui-atlas/index.html` — 100-example positioning、filters、catalog/detail/compare/favorites/recent/Pro UI。
- `tools/ui-atlas/ja/index.html` — Japanese page。
- `tools/ui-atlas/app.js` — filters、detail、localStorage favorites/recent、Free/Pro compare limits、Pro status handling。
- `tools/ui-atlas/extended-catalog-final.js` — extended example catalog injection。