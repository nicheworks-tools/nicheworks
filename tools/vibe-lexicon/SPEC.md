# Tool Specification — Vibe Lexicon

- Slug: `vibe-lexicon`
- Public URL: `https://nicheworks.app/tools/vibe-lexicon/`
- Specification status: `complete`
- Common specification: `common-spec/spec-ja.md`

## Purpose

「modern」「洗練」「trustworthy」等の曖昧なvibe wordingを、AI-assisted workで使いやすい実務的な意図・依頼文へ分解し、似た語の比較やcopy-ready draftを作るreference catalogを提供する。

## Current functional contract

- 120+ termsのcatalogをsearchし、category / use case / term typeでfilterする。
- detailではplain explanation、practical intent、use-case wording、common misuse、vague→practical breakdown、bad request / better request、rewrite理由、short AI-ready wording、related termsを表示する。
- prompt modeを切り替えてshort wordingをcopyできる。
- Free compareは最大2 termsで、difference / when-to-use / practicality guidanceを表示する。
- favoritesとrecent termsをlocalStorageへ保存する。
- common NicheWorks Pro active時はfull style prompt、brand tone decision memo、avoid list、use-case prompts、compare handoff、Markdown / JSON export等のwork packを解放する。
- 現行runtimeのcompare上限はProでも2件のままで、Proがcompare件数を増やす契約にはしない。
- EN rootとJA pageを分ける。

## Inputs

- search text。
- category / use case / term type filters。
- term selection。
- prompt mode。
- favorite toggle。
- compare add/remove/clear。
- Pro copy/export actions。

## Outputs

- filtered term catalogとresult count。
- practical wording detail。
- bad→better rewrite guidance。
- short AI-ready wordingのclipboard copy。
- 2-term comparison guidance。
- favorites / recent lists。
- Pro copy/export work packs。

## State and persistence

- favoritesは`nw-vl-favorites`としてlocalStorageへ保存する。
- recent termsは`nw-vl-recent`としてlocalStorageへ保存する。
- search/filter/current detail/compare selectionはpage stateで、永続保存しない。
- Pro active stateは共通`NWPro` infrastructureのcontractに従い、`active && entitlement === "nicheworks_pro"`を必須とする。旧tool-local `nw_pro_vibe-lexicon` flag単独ではpaid operationを解放せず、bridge初期化時にlegacy flagを削除する。
- favorites/recentはcross-device syncしない。

## Privacy and network behavior

- search、filter、compare、favorites、recent、basic prompt compositionはbrowser内で処理する。
- tool logicはsearch wordingを専用external AI APIへ送信しない。
- Pro entitlementはcommon NicheWorks Pro infrastructureを利用する。
- analytics / ads resourceはpage display時にloadされ得る。

## Language mode

`separate JA/EN pages`

English rootと`/ja/`を別pageとして提供する。

## Layout class

`pc-oriented`

desktopではfilters / catalog / detailのdashboardを主構成とし、mobileではpanel open/close UIへ縮退する。

## Limits and non-goals

- AI-ready wordingはdraft starting pointであり、生成結果やbusiness outcomeを保証しない。
- compareは自動で「最良の語」を決定しない。
- project context、audience、tone、legal/compliance requirementは利用者が確認する。
- favorites/recentはlocalStorageのみでaccount syncしない。
- 現行compare上限はFree/Proともruntime上2 termsである。

## Acceptance criteria

- [ ] catalogをsearch/category/use-case/typeでfilterし、term detailを開ける。
- [ ] detailからshort AI-ready wordingをcopyできる。
- [ ] favoritesとrecent termsがそれぞれlocalStorageに保存され、再訪時に復元される。
- [ ] compareへ最大2 termsを追加し、difference/use guidanceを表示できる。
- [ ] 3件目をFree compareへ追加しようとすると上限案内になる。
- [ ] `active && entitlement === "nicheworks_pro"`の場合だけwork-pack copy/export actionsが解放され、別entitlementや旧tool-local flagだけでは解放されない。compare件数上限は現行runtimeどおり2件を維持する。

## Implementation evidence

- `tools/vibe-lexicon/index.html` — catalog/detail/compare/favorites/recent/Pro UIとEN page。
- `tools/vibe-lexicon/ja/index.html` — Japanese page。
- `tools/vibe-lexicon/app.js` — 2-term compare、localStorage keys、filters/detail、Pro work packs。
- `tools/vibe-lexicon/data/terms.js` and `tools/vibe-lexicon/data/extra-terms.js` — catalog data。