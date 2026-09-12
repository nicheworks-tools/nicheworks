# Vibe Lexicon — canonical tool specification

- **Slug:** `vibe-lexicon`
- **Display name (JA):** 雰囲気語彙集
- **Display name (EN):** Vibe Lexicon
- **Implementation:** `tools/vibe-lexicon/`
- **Registry state:** active (registered implementation present)
- **Category:** vibe, words, writing, reference
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
- Pro copy/export actions。

## 4. Processing behavior

- 120+ termsのcatalogをsearchし、category / use case / term typeでfilterする。
- detailではplain explanation、practical intent、use-case wording、common misuse、vague→practical breakdown、bad request / better request、rewrite理由、short AI-ready wording、related termsを表示する。
- prompt modeを切り替えてshort wordingをcopyできる。
- Free compareは最大2 termsで、difference / when-to-use / practicality guidanceを表示する。
- favoritesとrecent termsをlocalStorageへ保存する。
- common NicheWorks Pro active時はfull style prompt、brand tone decision memo、avoid list、use-case prompts、compare handoff、Markdown / JSON export等のwork packを解放する。
- 現行runtimeのcompare上限はProでも2件のままで、Proがcompare件数を増やす契約にはしない。
- EN rootとJA pageを分ける。

## 5. Outputs

- filtered term catalogとresult count。
- practical wording detail。
- bad→better rewrite guidance。
- short AI-ready wordingのclipboard copy。
- 2-term comparison guidance。
- favorites / recent lists。
- Pro copy/export work packs。

Observed delivery capabilities: clipboard copy **present**; download/export **present**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally and use the page’s existing visible validation/status feedback. This observed behavior is the canonical contract.
- **Unsupported or over-limit input:** Implemented format/size/count bounds and constrained controls determine what is accepted; out-of-contract values do not acquire a different implied fallback.
- **Parse or local-file failure:** No dedicated recovery branch is implemented; a failed read/parse produces no successful derived output. This current limitation is recorded rather than converted into a product decision.
- **External/network failure:** Not applicable to the core tool-processing path identified by this audit; suite analytics and advertising are not tool-result fallbacks.
- **Copy/download failure:** Clipboard rejection is handled by the implemented feedback/fallback path. Download creation is offered only from the currently generated result; no failed operation is labeled as a successful export.
- **Safe fallback/reset:** The implemented clear/reset path removes current derived state or restores defaults so the user can retry without fabricated success data.
- **Runtime evidence inspected:** `tools/vibe-lexicon/about/index.html`, `tools/vibe-lexicon/app.js`, `tools/vibe-lexicon/index.html`, `tools/vibe-lexicon/ja/about/index.html`, `tools/vibe-lexicon/ja/index.html`, `tools/vibe-lexicon/ja/pro/index.html`, `tools/vibe-lexicon/ja/usage/index.html`, `tools/vibe-lexicon/pro/index.html`.

## 7. Privacy/data handling

- search、filter、compare、favorites、recent、basic prompt compositionはbrowser内で処理する。
- tool logicはsearch wordingを専用external AI APIへ送信しない。
- Pro entitlementはcommon NicheWorks Pro infrastructureを利用する。
- analytics / ads resourceはpage display時にloadされ得る。

Persistence evidence: `localStorage`. Network-capable application code: **not found**; non-suite hosts observed: `ofuse.me`, `ko-fi.com`, `buy.stripe.com`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `pc-oriented`).
- desktopではfilters / catalog / detailのdashboardを主構成とし、mobileではpanel open/close UIへ縮退する。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `separate JA/EN pages`.
- English rootと`/ja/`を別pageとして提供する。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/vibe-lexicon/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Current main-page evidence: GA4 **present**; AdSense **present**.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve and update in place rather than removing or restructuring a support block without specification support. Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present` (the implementation provides title/lead or equivalent purpose copy).
- **Usage documentation:** `optional-present`. Evidence: `tools/vibe-lexicon/ja/usage/index.html`, `tools/vibe-lexicon/usage/index.html`. Missing recommended documentation is an improvement opportunity, not a hard compliance failure.
- **FAQ:** `optional-present`. FAQ is conditional under common-spec sections 10–11; LogFormatter, Rename Wizard, and immediate formatting utilities may omit it. Missing recommended FAQ content is not a hard compliance failure.
- **Language handling for existing usage pages:** Japanese coverage **present**; English coverage **present**. No hard mismatch was established by this static audit.
- Any usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

- [ ] catalogをsearch/category/use-case/typeでfilterし、term detailを開ける。
- [ ] detailからshort AI-ready wordingをcopyできる。
- [ ] favoritesとrecent termsがそれぞれlocalStorageに保存され、再訪時に復元される。
- [ ] compareへ最大2 termsを追加し、difference/use guidanceを表示できる。
- [ ] 3件目をFree compareへ追加しようとすると上限案内になる。
- [ ] Pro active時にwork-pack copy/export actionsが解放されるが、compare件数上限は現行runtimeどおり2件を維持する。

Automated test evidence: none found. Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- The information-dense workflow is desktop-wide; mobile adaptation must not collapse its primary wide workspace into an arbitrary fixed narrow width.

### Implementation evidence

- `tools/vibe-lexicon/index.html`
- `tools/vibe-lexicon/README.md`
- `tools/vibe-lexicon/app.js`
- `tools/vibe-lexicon/styles.css`
