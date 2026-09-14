# Phone QuickCheck — canonical tool specification

- **Slug:** `phone-quickcheck`
- **Display name (JA):** スマホ QuickCheck
- **Display name (EN):** Phone QuickCheck
- **Implementation:** `tools/phone-quickcheck/`
- **Registry state:** active (registered implementation present)
- **Category:** phone, smartphone, charging, size, battery
- **Common specification:** `common-spec/spec-ja.md`
- **Audit state:** `PASS`

## 1. Identity

This record is the canonical per-tool contract for the registered `phone-quickcheck` implementation at `/tools/phone-quickcheck/`. The maintained public dataset contains 182 smartphone records across Apple, Google, Samsung, Sony, SHARP, OPPO, Xiaomi, and Motorola.

The product is a practical Quick Check utility, not a comprehensive smartphone encyclopedia, review database, benchmark service, or live retail catalog.

## 2. Purpose

スマートフォン利用者が、機種名からサイズ・重量・充電端子・充電器条件・ワイヤレス充電・モバイルバッテリー充電回数の概算・メーカー公式仕様／マニュアルを短時間で確認できるようにする。

主要導線は `機種を探す → サイズと充電条件を理解する → 必要なアクセサリーの種類を理解する → Amazonまたは公式情報を確認する` とする。Amazon導線は実用導線の後段に置き、互換性判定を収益都合で変更しない。

## 3. Inputs

- 機種名のフリーテキスト検索。
- メーカー選択。
- 充電端子選択。
- 発売年選択。
- 並び順選択。
- 日本語 / 英語切替。
- 一覧からの機種選択。
- 内部入力として `tools/phone-quickcheck/data/phones.json` と `tools/phone-quickcheck/data/accessories.json` の静的データ。

検索は正規モデル名と管理済みaliasesを対象とする。aliasesは実在する同一モデルの表記揺れに限定し、架空モデルや別機種を生成しない。

## 4. Processing behavior

- 182機種の検証済みデータをブラウザ内で検索・絞り込み・並び替えする。
- 一覧は走査性を優先し、モデル、発売年、サイズ、重量、端子を中心に表示する。通常機は `dimensions`、foldableは `dimensionsFolded` / `dimensionsUnfolded` を使い、一覧と「小さい順」は折りたたみ時寸法、詳細は折りたたみ時／展開時の両方を表示する。メーカー公式が折りたたみ時厚さを範囲で公表する場合は `depthMmMin` / `depthMmMax` の組で保持し、単一の推測値へ潰さない。
- 選択機種の詳細では本体情報、充電条件、モバイルバッテリー目安、アクセサリークラス、公式情報を整理して表示する。
- `wiredRecommendedW` は充電器の推奨／必要クラスとして扱い、端末側の実測・最大入力W数と同一視しない。
- 端末側最大有線充電W数は、その意味を直接支える維持済み根拠がある場合のみ表示する。
- USB PD、PPS、Samsung Super Fast Charging、OPPO SUPERVOOC、Xiaomi HyperCharge/TurboCharge、Motorola TurboPower、Qi、Qi2等は維持済み事実から表示・分類する。
- バッテリー容量が利用可能な場合のみ、`power_bank_mAh × 0.67 ÷ phone_battery_mAh` で5,000 / 10,000 / 20,000mAhの概算充電回数を計算し、小数1桁で表示する。
- バッテリー容量がunknownの場合は概算を生成しない。
- メーカーが通常仕様でmAhを公表していない機種について、第三者値を無断でメーカー公式値として扱わない。
- アクセサリー案内は端末×個別商品マトリクスではなく、USB-Cケーブル、USB-C ⇔ Lightningケーブル、USB-PD、PPS、Samsung Super Fast Charging、OPPO SUPERVOOC、Xiaomi HyperCharge/TurboCharge、Motorola TurboPower、Qi/Qi2、USB-Cモバイルバッテリー等の再利用可能クラスから解決する。
- Amazon導線は共通affiliate helperと固定tracking IDを使い、維持済みアクセサリークラスごとの固定検索語だけからAmazon Japan検索URLを生成する。ユーザーの検索文字列はAmazon URLへ渡さない。

## 5. Outputs

- 検索・フィルター後のスマートフォン一覧。
- 選択機種の高さ × 幅 × 厚さ、重量、画面サイズ等の維持済み本体情報。foldableでは折りたたみ時／展開時の外形寸法を分けて表示する。
- 充電端子、充電器目安、充電規格、PPS状態、ワイヤレス充電情報。
- 維持済みバッテリー容量がある場合の5,000 / 10,000 / 20,000mAh概算充電回数。
- 互換条件から導出した再利用可能アクセサリークラス。
- メーカー公式仕様URL。
- 公式マニュアル／公式サポートURL。
- 最終確認日。

Amazon価格、在庫、評価、レビュー数、配送情報は出力しない。Amazon購入導線は商品詳細の転載ではなく、互換アクセサリークラスからAmazon検索へ明示的に移動するだけとする。

Observed delivery capabilities: clipboard copy **not found**; download/export **not found**.

## 6. Error behavior

- `phones.json` または `accessories.json` の取得に失敗した場合は、正常な空一覧として扱わず、データ読込失敗を明示する。
- 検索条件に該当する機種がない場合は、条件変更を促す空状態を表示する。
- バッテリー容量が不明な場合は0回や推測mAhを作らず、算出不可／未確認として扱う。
- 根拠のない充電規格、最大W数、同梱状態を推測で補完しない。
- 外部リンクが未設定または不正な場合は、ダミーURLへ遷移させない。
- アクセサリー定義が解決できない場合でも、端末スペックと公式情報の表示は可能な範囲で継続する。
- モバイル詳細シートは閉じる操作を維持し、操作不能なモーダル状態を残さない。

## 7. Privacy/data handling

検索、フィルター、並び替え、詳細表示はNicheWorks配下の静的データを使ってブラウザ内で処理する。検索語や選択機種をアプリケーション検索バックエンドへ送信しない。

言語設定は共通方針に従い `nw_lang` のlocalStorageを利用可能な場合に保存する。初期版ではユーザーアカウント、保存済み端末プロフィール、サーバー側履歴を持たない。

外部通信は共通のGA4 / AdSense、支援リンク、ユーザーが明示的に開くメーカー公式リンク、および明示的にクリックしたAmazon Associatesリンク等に限る。Amazon価格・在庫取得やAmazonページのスクレイピングは行わない。affiliate analyticsには共通契約のcoarse metadataだけを送り、モデル名・検索語等は送信しない。

Persistence evidence: `localStorage`. Core phone search and compatibility processing require no application backend.

## 8. Responsive contract

- **Layout class:** `desktop-wide` (source classification: `hybrid`).
- PCでは左側に検索・フィルター済み一覧、右側にstickyな選択機種詳細ペインを配置する。
- モバイルでは一覧を単一列で読みやすく表示し、機種選択時に詳細を縦スクロール可能なボトムシートで開く。
- PC表を単純な横スクロールだけでモバイルへ押し込む設計にしない。
- PCとモバイルで得られる主要な事実情報を一致させる。
- Current audit: no concrete responsive defect was established for the maintained public baseline.

## 9. Language contract

- **Policy:** `bilingual single-page`.
- 日本語と英語は同一canonicalページ上で切り替える。
- メーカー名、モデル名、USB-C、USB PD、PPS、Qi、Qi2等の技術値はcanonicalデータとして共有する。
- UIラベル、説明、注意書き、アクセサリー案内はJP/ENで切り替える。
- 正規寸法・重量はmm / gで保持し、英語UIでinch / ozを出す場合は派生表示とする。

## 10. SEO contract

The main public page must meet common-spec section 9-3: tool-specific title and description, exactly one self-referencing canonical for `https://nicheworks.app/tools/phone-quickcheck/`, one explicit indexable robots directive, and valid `WebApplication` JSON-LD.

The public tool must be registered in `tools/tools-index.json`, `tools/tools-meta.json`, and root `sitemap.xml` according to current repository contracts. Initial launch uses one canonical tool page; mass-generated thin per-model indexable pages are out of scope.

Primary search intent includes smartphone size, charging connector/cable type, charger requirements, power-bank charge estimates, and official manual/specification lookup. SEO copy must not invent unsupported device facts.

## 11. Advertising contract

Preserve the existing NicheWorks GA4 and AdSense identifiers/code and follow common-spec advertising placement rules. Ads must not be inserted into the phone selection flow in a way that obscures the primary controls or masquerades as compatible-accessory recommendations.

Amazon affiliate links are separate from AdSense. Active Phone QuickCheck CTAs must use the shared helper, identify Amazon in the label, show the Associates disclosure, use only canonical accessory-class search terms, and never display scraped or hard-coded Amazon price/availability claims.

## 12. Donation/support contract

Follow common-spec sections 6 and 9-4. Preserve the current OFUSE / Ko-fi support block and do not confuse donation/support links with official manufacturer links or future purchase guidance.

Current main-page donation/support evidence: **present**.

## 13. Help/usage/FAQ contract

- **Main-page concise explanation:** `required-and-present`.
- **Usage documentation:** `recommended-and-present` at `tools/phone-quickcheck/usage.html`.
- **FAQ:** `optional-present` inside the bilingual usage page.
- **Language handling:** the main tool UI and `usage.html` both provide JP/EN on one page and share the `nw_lang` preference.
- Any future usage/FAQ link must remain clearly separated from advertising and purchase CTAs.

## 14. Functional acceptance tests

- [x] 182 maintained models load from the static phone dataset.
- [x] Search matches canonical model names and maintained aliases.
- [x] Manufacturer, connector, and release-year filters operate on canonical data.
- [x] Desktop uses list + right detail pane and mobile uses a detail bottom sheet.
- [x] Unknown battery capacity does not generate a fabricated recharge count.
- [x] Recharge estimates use the single maintained 0.67 approximation and one-decimal display.
- [x] Charger guidance is not intentionally conflated with device-side maximum input.
- [x] Official manufacturer specification/manual links remain distinct from accessory guidance.
- [x] Amazon accessory search CTAs are active through the shared helper with fixed tracking ID, visible disclosure, canonical accessory queries, and coarse analytics only.

Automated test evidence: `scripts/check-tool-runtime-contracts.mjs`, `scripts/check-phone-quickcheck-data.mjs`, `scripts/check-phone-quickcheck-affiliate.mjs`, and `tools/phone-quickcheck/tests/behavior.test.mjs`. Behavior-level status: **behavior-test-present**. The VM behavior suite exercises real `app.js` logic for alias/model search, JP/EN switching, recharge estimates, Apple unknown-capacity handling, Lightning accessory guidance, proprietary charging semantics, and mobile bottom-sheet open/close behavior.

## 15. Explicit tool-specific exceptions

- The product deliberately omits CPU, GPU, RAM, camera, benchmark, exhaustive storage/performance, and exhaustive radio-band data even where obtainable, because the product contract is Quick Check rather than smartphone encyclopedia.
- A manufacturer-nonpublic battery mAh value may remain unknown; coverage completeness does not justify guessing it.
- Recharge counts are approximate full-charge equivalents, not guaranteed real-world charging counts.
- Accessory classes indicate compatibility requirements, not a guarantee that every third-party product in that broad class will work.
- Amazon destinations are limited to reviewed tagged searches derived from maintained accessory classes; they do not override or imply device compatibility beyond the charging facts shown by the tool.
- Per-model indexable landing pages are not part of the initial SEO contract.

### Implementation evidence

- `tools/phone-quickcheck/index.html`
- `tools/phone-quickcheck/usage.html`
- `tools/phone-quickcheck/app.js`
- `tools/phone-quickcheck/style.css`
- `tools/phone-quickcheck/data/phones.json`
- `tools/phone-quickcheck/data/accessories.json`
- `tools/phone-quickcheck/affiliate-config.js`
- `tools/phone-quickcheck/affiliate-runtime.js`
- `scripts/check-phone-quickcheck-affiliate.mjs`
- `scripts/check-phone-quickcheck-data.mjs`
- `scripts/check-phone-quickcheck-source-semantics.mjs`
- `tools/phone-quickcheck/tests/behavior.test.mjs`
- `tools/phone-quickcheck/SPEC.md`
