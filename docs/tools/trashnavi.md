# TrashNavi — canonical tool specification

- **Slug:** `trashnavi`
- **Display name (JA):** 自治体ごみ分別リンクナビ
- **Display name (EN):** TrashNavi
- **Implementation:** `tools/trashnavi/`
- **Registry state:** active (registered implementation present)
- **Category:** trash, garbage, local, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `NEEDS_DECISION`

## 1. Identity

This record is the canonical per-tool contract for the registered `trashnavi` implementation at `/tools/trashnavi/`. It does not authorize a production rewrite.

## 2. Purpose

日本の自治体公式ごみ関連ページを、都道府県・市区町村・link type・keywordから探すためのdirectoryを提供する。ごみの分別可否をNicheWorks自身が判定したり、粗大ごみ申込みを代行したりするものではない。

中長期的には、単一のlink検索pageだけでなく、確認済みofficial linkを自治体単位で整理し、十分なcoverageを持つ自治体のみindexable landing pageへ展開できる「全国自治体の公式ごみ情報gateway」を目指す。この拡張でも自治体official sourceが正本であり、TrashNavi自身が自治体固有ルールのauthorityにはならない。

## 3. Inputs

- 都道府県。
- 市区町村。
- link type。
- 任意keyword。
- quick prefecture button。
- UI language JA / EN。

## 4. Processing behavior

- 自サイト内の自治体JSON dataを読み込み、全国の自治体top pageと確認済みのごみ分別・収集calendar・粗大ごみ・検索page等を一覧化する。
- prefecture、municipality、link type、keywordでbrowser-side filteringする。
- quick prefecture filterとして東京都、大阪府、神奈川県、愛知県、福岡県を提供する。
- runtimeのlink type filterは自治体公式ページ、ごみ分別ページ、収集カレンダー、粗大ごみ、粗大ごみ申込み、検索ページ、持込施設、ごみ分別アプリを扱う。
- duplicateはlgcode/type/URLの組合せを基準に除外する。
- 結果から自治体公式external pageを新しいtabで開く。
- missing/broken linkはGitHub Issue templateへの報告導線を持つ。
- JA/EN UIを同一ページで切り替える。

## 5. Outputs

- 条件に一致するofficial link件数。
- 自治体名、link title/type、URL、official-page button。
- 現在のfilter条件表示。
- datasetの登録件数表示。

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty input:** Required or blank inputs use the implementation’s documented validation path and must not be presented as a successful completed result.
- **Invalid/unsupported input:** `NEEDS_DECISION` — the response to invalid, unsupported, or over-limit input is not established by repository evidence.
- **Network/API failure:** The documented unavailable/error state is shown without substituting fabricated remote data.
- **Safe fallback:** Existing user data must not be silently replaced by fabricated success data; where the exact recovery UI is not stated above, that UI remains outside this contract until evidence or a product decision exists.

## 7. Privacy/data handling

- prefecture/city/type/keyword filteringはbrowser内で行い、検索条件を検索APIへ送信しない。
- data loadはNicheWorks配下のsame-site JSON resourceをfetchする。
- official linkを開くと各自治体等のexternal siteへ移動し、そのsite側のprivacy/termsが適用される。
- ページ表示時にはanalytics / ads resourceが読み込まれ得る。

Persistence evidence: `localStorage`. Network-capable application code: **found**; non-suite hosts observed: `www.city.chiyoda.lg.jp`, `www.city.chuo.lg.jp`, `www.city.minato.tokyo.jp`, `www.city.shinjuku.lg.jp`, `www.city.setagaya.lg.jp`, `www.city.shibuya.tokyo.jp`, `www.city.suginami.tokyo.jp`, `www.city.nerima.tokyo.jp`.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- filter formとresult cardsをdesktop/mobile両方で利用できるdirectory layout。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection. Absence of a media query alone is not treated as failure; viewport, fluid sizing, wrapping, and the tool-specific interaction shape must be evaluated together.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一ページでJA/EN表示を切り替える。自治体固有名称やlink typeのsource data自体は日本語中心である。
- Existing languages must not be removed. English UI must not be added to an explicit Japanese-only exception without a specification change.

## 10. SEO contract

The main public page must meet common-spec section 9-3: a tool-specific title and meaningful description, exactly one self-referencing canonical for `https://nicheworks.app/tools/trashnavi/`, and valid `WebApplication` JSON-LD. Current audit: canonical **present**; WebApplication JSON-LD **present**. SEO prose must remain evidence-based rather than being padded arbitrarily.

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

### Current runtime

- [ ] repository内自治体dataを読み込み、prefecture/municipality選択肢とresult listを生成できる。
- [ ] prefecture、municipality、type、keywordを組み合わせてbrowser-sideで絞り込める。
- [ ] result linkは該当official external pageへ遷移し、NicheWorks内で分別を確定しない。
- [ ] resetでfilterを解除し、全件表示へ戻せる。
- [ ] missing/broken link報告導線がGitHub Issueへ接続する。
- [ ] JA/EN表示を切り替えられる。

### Gateway Phase 1

- [x] forward data modelとcanonical link taxonomyがdocument化されている。
- [x] repository dataだけからcoverage auditを実行できる。
- [x] auditがmunicipality / prefecture / link type単位のcoverageを出せる。
- [x] runtime-declared missing datasetとunloaded direct-link datasetを検出できる。
- [x] landing-page readinessがraw URL数ではなくdistinct waste-specific link type数で判定される。
- [x] Phase 1では自治体固有ルールを新たに推測・転載しない。

### Municipality page expansion

- [x] preferred readiness 3種類以上を生成時に再検証する。
- [x] 公開10自治体をmanifest allowlistで管理する。
- [x] 自治体pageをgeneratorから静的生成する。
- [x] generator `--check` で10ページの生成driftを検出する。
- [x] 公開URLをroot sitemapと専用sitemapへ収録する。
- [x] robotsの既存root sitemap契約を維持し、sitemap indexから専用sitemapを発見可能にする。
- [x] Wave 3で御浜町・海津市・結城市をpreferred candidateへ引き上げる。
- [ ] PR CIでcoverage strict / generated-page check / repository SEO auditがすべてgreenになる。

Automated test evidence: `tools/trashnavi/scripts/audit-coverage.mjs` (audit script), `tools/trashnavi/scripts/generate-municipality-pages.mjs` (generator), `scripts/check-trashnavi-direct-links.mjs` (regression/contract test), `scripts/validate-trashnavi-data.mjs` (data validation). Behavior-level status: **behavior-test-missing**; build, generator, data-validation, audit, and source-contract checks are not silently counted as behavior tests.

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the language mode above.
- No additional layout exception is established.

### Implementation evidence

- `tools/trashnavi/index.html`
- `tools/trashnavi/app.js`
- `tools/trashnavi/style.css`
