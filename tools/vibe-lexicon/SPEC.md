# Tool Specification — Vibe Lexicon

- Slug: `vibe-lexicon`
- Public URL: `https://nicheworks.app/tools/vibe-lexicon/`
- Specification status: `complete`
- Monetization class: `ADS_DONATION`
- Common specification: `common-spec/spec-ja.md`

## Purpose

「modern」「洗練」「trustworthy」等の曖昧なvibe wordingを、AI-assisted workで使いやすい実務的な意図・依頼文へ分解し、似た語の比較やcopy-ready draftを作るreference catalogを提供する。

## Current functional contract

- 120+ termsのcatalogをsearchし、category / use case / term typeでfilterする。
- detailではplain explanation、practical intent、use-case wording、common misuse、vague→practical breakdown、bad request / better request、rewrite理由、short AI-ready wording、related termsを表示する。
- prompt modeを切り替えてshort wordingをcopyできる。
- compareは最大2 termsで、difference / when-to-use / practicality guidanceを表示する。
- favoritesとrecent termsをlocalStorageへ保存する。
- full style prompt、brand tone decision memo、avoid list、use-case prompts、compare handoff、Markdown / JSON exportを購入・entitlementなしで利用できる。
- 現行runtimeのcompare上限は2件で、課金有無によって件数を変えない。
- EN rootとJA pageを分ける。
- monetizationは広告＋任意寄付で、寄付によって機能は解放されない。
- historical `/pro/` pagesは無料化案内の互換ページであり、購入導線を持たない。

## Inputs

- search text。
- category / use case / term type filters。
- term selection。
- prompt mode。
- favorite toggle。
- compare add/remove/clear。
- work-pack copy/export actions。

## Outputs

- filtered term catalogとresult count。
- practical wording detail。
- bad→better rewrite guidance。
- short AI-ready wordingのclipboard copy。
- 2-term comparison guidance。
- favorites / recent lists。
- full style prompt / brand tone memo / avoid list / compare handoff。
- Markdown / JSON exports。

## State and persistence

- favoritesは`nw-vl-favorites`としてlocalStorageへ保存する。
- recent termsは`nw-vl-recent`としてlocalStorageへ保存する。
- search/filter/current detail/compare selectionはpage stateで、永続保存しない。
- paid entitlementは利用しない。
- favorites/recentはcross-device syncしない。

## Privacy and network behavior

- search、filter、compare、favorites、recent、prompt/work-pack compositionはbrowser内で処理する。
- tool logicはsearch wordingを専用external AI APIへ送信しない。
- analytics / ads resourceはpage display時にloadされ得る。
- optional OFUSE / Ko-fi linksは外部support先だが、機能解放には関与しない。
- Stripe purchase flowはVibe Lexiconのruntime contractに含めない。

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
- compare上限は2 termsである。
- historical Pro infrastructureをauthorization gateやpurchase surfaceとして復活させない。

## Acceptance criteria

- [ ] catalogをsearch/category/use-case/typeでfilterし、term detailを開ける。
- [ ] detailからshort AI-ready wordingをcopyできる。
- [ ] favoritesとrecent termsがそれぞれlocalStorageに保存され、再訪時に復元される。
- [ ] compareへ最大2 termsを追加し、difference/use guidanceを表示できる。
- [ ] 3件目をcompareへ追加しようとすると上限案内になる。
- [ ] full style prompt、brand tone memo、avoid list、compare handoff、Markdown / JSON exportをpaid entitlementなしで利用できる。
- [ ] JSON exportは`monetization: "ADS_DONATION"`と`paidEntitlementRequired: false`を記録し、旧`nicheworks_pro` entitlementを正として出力しない。
- [ ] EN/JA main pagesとhistorical `/pro/` pagesにStripe購入URL、固定価格、購入後unlock claimが存在しない。

## Implementation evidence

- `tools/vibe-lexicon/index.html` — catalog/detail/compare/favorites/recent/free work-pack UIとEN page。
- `tools/vibe-lexicon/ja/index.html` — Japanese page。
- `tools/vibe-lexicon/app.js` — 2-term compare、localStorage keys、filters/detail、free work packs。
- `tools/vibe-lexicon/pro/index.html` / `ja/pro/index.html` — historical route compatibility notices。
- `tools/vibe-lexicon/data/terms.js` and `tools/vibe-lexicon/data/extra-terms.js` — catalog data。
