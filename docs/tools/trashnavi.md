# TrashNavi — canonical tool specification

- **Slug:** `trashnavi`
- **Display name (JA):** 自治体ごみ分別リンクナビ
- **Display name (EN):** TrashNavi
- **Implementation:** `tools/trashnavi/`
- **Registry state:** active (registered implementation present)
- **Category:** trash, garbage, local, life
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `trashnavi` implementation at `/tools/trashnavi/`. It reflects the current Wave 4 municipality/publication and link-health runtime contract and does not authorize unrelated production rewrites.

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
- municipality page publication is allowlist-driven and generated only when the municipality still satisfies the preferred 3-distinct-waste-type gate.

## 5. Outputs

- 条件に一致するofficial link件数。
- 自治体名、link title/type、URL、official-page button。
- 現在のfilter条件表示。
- datasetの登録件数表示。
- Published municipality landing pages containing verified official-source links for the current allowlisted municipalities.

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- **Empty or incomplete input:** The implemented required-field constraints and guard clauses prevent the affected action from completing normally.
- **Invalid or unsupported input:** Unsupported filter/data states follow the current visible validation path; TrashNavi does not fabricate municipality rules.
- **Network/data-load failure:** Same-site dataset loading and external-link navigation failures are surfaced through the current failure/report path rather than replaced with invented official data.
- **Direct-link health check:** only HTTP 404/410 is treated as hard broken-link evidence; blocks, timeouts, rate limits, and transient server errors remain warnings and never auto-mutate source records.
- **Safe fallback/reset:** The clear/reset path removes current filter-derived state or restores defaults so the user can retry.
- **Runtime evidence inspected:** `tools/trashnavi/index.html`, `tools/trashnavi/app.js`, `tools/trashnavi/municipality-page-manifest.json`, generated municipality pages, `tools/trashnavi/scripts/generate-municipality-pages.mjs`, `tools/trashnavi/scripts/audit-coverage.mjs`, `scripts/check-trashnavi-direct-links.mjs`, `scripts/check-trashnavi-runtime-contract.mjs`.

## 7. Privacy/data handling

- prefecture/city/type/keyword filteringはbrowser内で行い、検索条件を検索APIへ送信しない。
- data loadはNicheWorks配下のsame-site JSON resourceをfetchする。
- official linkを開くと各自治体等のexternal siteへ移動し、そのsite側のprivacy/termsが適用される。
- ページ表示時にはanalytics / ads resourceが読み込まれ得る。
- Scheduled/manual link-health probes may request official municipality URLs, but PR inventory validation does not make live municipality requests and probe results do not automatically rewrite source metadata.

Current filter/search state is page-local; the current runtime contract does not require persistence of filter terms or UI language.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- filter formとresult cardsをdesktop/mobile両方で利用できるdirectory layout。
- The implementation must preserve its functional width class and follow common-spec section 9-2 breakpoints/adaptation rules; it must not be forced into a universal 600px layout.
- Current audit: no concrete responsive defect was established by static inspection.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 同一ページでJA/EN表示を切り替える。自治体固有名称やlink typeのsource data自体は日本語中心である。
- Existing languages must not be removed.

## 10. SEO contract

The main public page must meet common-spec section 9-3 with tool-specific title/description, self-referencing canonical, and valid `WebApplication` JSON-LD. Generated municipality pages must have municipality-specific title/description/canonical/OGP plus `WebPage` / `BreadcrumbList` structured data, and every allowlisted generated URL must be present exactly once in the root sitemap and in the TrashNavi supplemental sitemap.

Current publication baseline: **11 municipality pages**.

- Tokyo: 千代田区、中央区、港区、新宿区、世田谷区、渋谷区、杉並区、練馬区
- 三重県 御浜町
- 岐阜県 海津市
- 茨城県 結城市

## 11. Advertising contract

Preserve all existing GA4 and AdSense identifiers/code. Advertising must follow common-spec sections 1.1 and 9-5: no ad inserted into the input flow or directly beneath the principal action button. Municipality pages retain site-wide analytics/advertising hooks but must keep official municipality information semantically separate from any future affiliate surface.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Current main-page donation/support evidence: **present**. Preserve and update in place rather than removing or restructuring a support block without specification support.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-missing`. Missing recommended documentation remains an improvement opportunity, not a hard compliance failure.
- **FAQ:** `recommended-and-present`.
- Any future usage link must remain a subdued text link, separated from advertising as required by common-spec section 10-6.

## 14. Functional acceptance tests

### Current runtime

- [x] repository内自治体dataを読み込み、prefecture/municipality選択肢とresult listを生成できる。
- [x] prefecture、municipality、type、keywordを組み合わせてbrowser-sideで絞り込める。
- [x] result linkは該当official external pageへ遷移し、NicheWorks内で分別を確定しない。
- [x] resetでfilterを解除し、全件表示へ戻せる。
- [x] missing/broken link報告導線がGitHub Issueへ接続する。
- [x] JA/EN表示を切り替えられる。

These six runtime contracts are permanently checked by `scripts/check-trashnavi-runtime-contract.mjs` in TrashNavi coverage CI.

### Gateway / municipality publication

- [x] forward data modelとcanonical link taxonomyがdocument化されている。
- [x] repository dataだけからcoverage auditを実行できる。
- [x] auditがmunicipality / prefecture / link type単位のcoverageを出せる。
- [x] runtime-declared missing datasetとunloaded direct-link datasetを検出できる。
- [x] landing-page readinessがraw URL数ではなくdistinct waste-specific link type数で判定される。
- [x] preferred readiness 3種類以上を生成時に再検証する。
- [x] 公開11自治体をmanifest allowlistで管理する。
- [x] generator `--check` で11ページの生成driftを検出する。
- [x] 公開URLをroot sitemapと専用sitemapへ収録する。
- [x] Wave 4で東京都中央区をpreferred candidateへ引き上げ、公開対象へ追加する。

### Wave 4 verified coverage baseline — 2026-09-13

- municipalities: **1,916**
- records: **2,185 / 2,185 valid HTTP(S)**
- municipalities with any waste-specific direct link: **77**
- publish candidates (2+ types): **11**
- preferred candidates (3+ types): **11**
- collection calendar coverage: **11 municipalities**
- bulky-waste coverage: **10 municipalities**
- drop-off facility coverage: **1 municipality**
- waste-app coverage: **1 municipality**
- invalid records: **0**
- unknown type labels: **0**

### Direct-link health monitoring — Phase 4

`scripts/check-trashnavi-direct-links.mjs` discovers every `tools/trashnavi/data/direct-waste-links*.json` dataset rather than relying on a fixed file list. It validates array roots and HTTP(S) URLs, deduplicates actual URL requests while retaining source file/row provenance, uses HEAD first with GET fallback for status 0/403/405/429, treats only 404/410 as hard broken links, reports redirects without rewriting source URLs, and leaves timeout/block/transient errors as warnings.

`--inventory` performs dataset discovery/URL validation with no external municipality requests and is used in PR coverage CI. Scheduled/manual direct-link health CI performs network checks and can save a machine-readable report through `TRASHNAVI_LINK_REPORT`. `TRASHNAVI_STRICT_LINK_CHECK=1` still fails only on hard errors. Probe output must never automatically update source `last_checked`, `status`, or `final_url`; source changes require official-page verification.

Automated evidence: `scripts/check-trashnavi-runtime-contract.mjs` (runtime behavior/contract test), `tools/trashnavi/scripts/audit-coverage.mjs` (audit script), `tools/trashnavi/scripts/generate-municipality-pages.mjs` (generator), `scripts/check-trashnavi-direct-links.mjs` (regression/contract test), `scripts/validate-trashnavi-data.mjs` (data validation).

## 15. Explicit tool-specific exceptions

- No language exception is established beyond the bilingual single-page mode.
- No additional layout exception is established.
- Municipality landing pages are generated only from verified repository data and may not be bulk-expanded ahead of coverage.

### Implementation evidence

- `tools/trashnavi/index.html`
- `tools/trashnavi/app.js`
- `tools/trashnavi/style.css`
- `tools/trashnavi/DATA_MODEL.md`
- `tools/trashnavi/municipality-page-manifest.json`
- `tools/trashnavi/scripts/audit-coverage.mjs`
- `tools/trashnavi/scripts/generate-municipality-pages.mjs`
- `scripts/check-trashnavi-runtime-contract.mjs`
- `scripts/check-trashnavi-direct-links.mjs`
- `scripts/validate-trashnavi-data.mjs`
- `tools/trashnavi/tokyo/chuo/index.html`
