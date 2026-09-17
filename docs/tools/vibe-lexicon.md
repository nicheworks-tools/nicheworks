# Vibe Lexicon — canonical tool specification

- **Slug:** `vibe-lexicon`
- **Display name (JA):** 雰囲気語彙集
- **Display name (EN):** Vibe Lexicon
- **Implementation:** `tools/vibe-lexicon/`
- **Registry state:** active (registered implementation present)
- **Category:** vibe, words, writing, reference
- **Monetization:** `ADS_DONATION`
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `vibe-lexicon` implementation at `/tools/vibe-lexicon/`. It does not authorize a production rewrite.

## 2. Purpose

「modern」「洗練」「trustworthy」等の曖昧なvibe wordingを、AI-assisted workで使いやすい実務的な意図・依頼文へ分解し、似た語の比較やcopy-ready draftを作るreference catalogを提供する。

## 3. Inputs

- search text。
- category / use case / term type filters。
- term selection。
- prompt mode。
- favorite toggle。
- compare add/remove/clear。
- work-pack copy/export actions。

## 4. Processing behavior

- 120+ termsのcatalogをsearchし、category / use case / term typeでfilterする。
- detailではplain explanation、practical intent、use-case wording、common misuse、vague→practical breakdown、bad request / better request、rewrite理由、short AI-ready wording、related termsを表示する。
- prompt modeを切り替えてshort wordingをcopyできる。
- compareは最大2 termsで、difference / when-to-use / practicality guidanceを表示する。
- favoritesとrecent termsをlocalStorageへ保存する。
- full style prompt、brand tone decision memo、avoid list、use-case prompts、compare handoff、Markdown / JSON exportを購入・entitlementなしで提供する。
- compare上限は2件で、収益化状態によって増減しない。
- EN rootとJA pageを分ける。
- monetizationは広告＋任意寄付で、寄付によって機能は解放されない。
- historical `/pro/` routesはnoindexの無料化案内としてのみ残す。

## 5. Outputs

- filtered term catalogとresult count。
- practical wording detail。
- bad→better rewrite guidance。
- short AI-ready wordingのclipboard copy。
- 2-term comparison guidance。
- favorites / recent lists。
- full style prompt / brand tone memo / avoid list / compare handoff。
- Markdown / JSON exports。

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** Implemented required-field constraints and guard clauses prevent the affected action from completing normally and use existing visible feedback.
- **Unsupported or over-limit input:** The two-term compare bound and constrained controls determine what is accepted; a third item receives the documented limit message.
- **Parse or local-file failure:** A failed read/parse produces no fabricated successful derived output.
- **External/network failure:** Not applicable to the core tool-processing path; suite analytics, ads, and optional donation links are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection uses the implemented feedback/fallback path. Download creation is offered only from the currently generated result.
- **Safe fallback/reset:** Clear/reset removes current derived state or restores defaults so the user can retry.
- **Runtime evidence inspected:** `tools/vibe-lexicon/app.js`, `tools/vibe-lexicon/index.html`, `tools/vibe-lexicon/ja/index.html`, `tools/vibe-lexicon/pro/index.html`, `tools/vibe-lexicon/ja/pro/index.html`.

## 7. Privacy/data handling

- search、filter、compare、favorites、recent、basic prompt composition、work-pack generationはbrowser内で処理する。
- tool logicはsearch wordingを専用external AI APIへ送信しない。
- paid entitlement infrastructureは利用しない。
- analytics / ads resourceはpage display時にloadされ得る。
- OFUSE / Ko-fiは任意support先であり、feature gateではない。

Persistence evidence: `localStorage`. Core application processing does not require a network call. No Stripe purchase host belongs to the Vibe Lexicon contract.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- desktopではfilters / catalog / detailのdashboardを主構成とし、mobileではpanel open/close UIへ縮退する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- English rootと`/ja/`を別pageとして提供する。
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/vibe-lexicon/`, and valid `WebApplication` JSON-LD. Historical `/pro/` compatibility pages stay `noindex,follow`. SEO copy must describe the current free feature boundary rather than a retired paid unlock.

## 11. Advertising contract

Preserve existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Ads do not unlock or gate features.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. OFUSE/Ko-fi support is optional and does not change feature availability. Preserve and update support copy in place without converting it into a paid entitlement surface.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `optional-present`. Evidence: `tools/vibe-lexicon/ja/usage/index.html`, `tools/vibe-lexicon/usage/index.html`.
- **FAQ:** `optional-present`; current FAQ must not contain retired purchase/unlock claims.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] catalogをsearch/category/use-case/typeでfilterし、term detailを開ける。
- [ ] detailからshort AI-ready wordingをcopyできる。
- [ ] favoritesとrecent termsがそれぞれlocalStorageに保存され、再訪時に復元される。
- [ ] compareへ最大2 termsを追加し、difference/use guidanceを表示できる。
- [ ] 3件目をcompareへ追加しようとすると上限案内になる。
- [ ] full style prompt、brand tone memo、avoid list、compare handoff、Markdown / JSON exportをpaid entitlementなしで利用できる。
- [ ] JSON exportは`monetization: "ADS_DONATION"`と`paidEntitlementRequired: false`を含み、旧`nicheworks_pro` entitlementを出力しない。
- [ ] main EN/JA and historical `/pro/` pages contain no Stripe purchase URL, fixed paid price, or purchase-to-unlock claim.

Automated source/runtime contract coverage exists through the repository audit scripts. Browser behavior-level coverage should continue to be expanded independently; static contract checks are not counted as full interaction tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.
- The legacy `pro-bridge.js` filename may remain as dormant/free-mode compatibility code, but it is not an entitlement authority and the main page does not need to load it.

### Implementation evidence

- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/ja/index.html`
- `tools/vibe-lexicon/pro/index.html`
- `tools/vibe-lexicon/ja/pro/index.html`
- `tools/vibe-lexicon/app.js`
- `tools/vibe-lexicon/styles.css`
