# UI Atlas

**改訂版 v2 / English-primary edition**

**製品区分:** 有料化可能な実用Webツール
**運営名義:** Niche Works
**製品カテゴリ:** UI pattern dictionary / UI comparison tool / AI prompting support tool
**主言語方針:** **英語メイン、日本語補助**
**公開方針:**

* 英語版を正面入口とする
* 日本語版は補助入口とする
* URLは言語ごとに分離する
* 1ページ1言語を原則とする

---

## 1. 製品の定義

Niche Works UI Atlas は、Web制作やUI設計で頻出するUIパターンを、**名称・見た目・用途・非推奨用途・類似UIとの差分・AIへの依頼例・実装メモ**まで一体化して整理した実用辞典である。

この製品は、単なるUIギャラリーではない。
単なる用語辞典でもない。
単なるAIプロンプト集でもない。

この製品の価値は、1項目ごとに次のことを完結させる点にある。

1. そのUIの名前が分かる
2. 何のためのUIか分かる
3. どんな場面で使うべきか分かる
4. どんな場面では使うべきでないか分かる
5. 似たUIと何が違うか分かる
6. AIにどう依頼すればよいか分かる
7. 実装時に何を意識すべきか分かる

---

## 2. 改訂方針

この改訂版では、従来の「日本語優先」をやめ、以下に変更する。

### 2-1. 主な変更点

* 英語を主言語にする
* 日本語はローカライズ版として持つ
* ルートURLを英語版にする
* 日本語版は `ja/` 配下に分離する
* 内部データの正本は英語名・英語説明を基準に持つ
* SEO・OGP・シェア導線も英語版を主軸に設計する

### 2-2. この変更を行う理由

* UI名そのものが英語圏の制作文脈で流通している
* 世界全体で見た検索母数が英語の方が大きい
* 収益化を考えると英語版が広告・課金の天井を押し上げやすい
* 日本語版も維持するが、主戦場は英語圏とする

---

## 3. 製品の約束

英語版トップで伝える製品メッセージはこれで固定する。

**“More than names. A UI pattern atlas you can actually use with AI.”**

補助文言は以下。

* Understand when to use a pattern
* Understand when not to use it
* Compare similar UI patterns side by side
* Copy AI-ready prompts
* Learn implementation cautions before building

日本語版では以下を使う。

**「名前が分かるだけで終わらない。AIに正確に依頼できるUI辞典。」**

---

## 4. 想定ユーザー

### 4-1. 英語版の主対象

1. AI-assisted builders
2. Indie hackers
3. Frontend beginners
4. Designers who need naming clarity
5. PMs / founders who specify UI in text
6. Landing page builders
7. No-code / low-code users

### 4-2. 日本語版の主対象

1. 日本語圏のWeb制作初心者
2. AIにUI制作を頼む人
3. ディレクターやPM
4. フロントエンド初中級者
5. LP制作者

### 4-3. 典型的な利用シーン

* “What is that bottom panel called?”
* “Should this be a modal or a bottom sheet?”
* “What UI pattern should I use for FAQ?”
* “How do I ask AI to make this more mobile-friendly?”
* “Which option is better: tabs, accordion, or segmented control?”

---

## 5. 公開URL構成

この製品では、言語分離を明示的に行う。

### 5-1. 英語版

* `/tools/ui-atlas/`
* `/tools/ui-atlas/patterns/`
* `/tools/ui-atlas/patterns/[slug]/`
* `/tools/ui-atlas/categories/[slug]/`
* `/tools/ui-atlas/compare/`
* `/tools/ui-atlas/search/`
* `/tools/ui-atlas/topics/[problem]/`
* `/tools/ui-atlas/pro/`
* `/tools/ui-atlas/about/`
* `/tools/ui-atlas/usage/`

### 5-2. 日本語版

* `/tools/ui-atlas/ja/`
* `/tools/ui-atlas/ja/patterns/`
* `/tools/ui-atlas/ja/patterns/[slug]/`
* `/tools/ui-atlas/ja/categories/[slug]/`
* `/tools/ui-atlas/ja/compare/`
* `/tools/ui-atlas/ja/search/`
* `/tools/ui-atlas/ja/topics/[problem]/`
* `/tools/ui-atlas/ja/pro/`
* `/tools/ui-atlas/ja/about/`
* `/tools/ui-atlas/ja/usage/`

### 5-3. 言語切替ルール

* 画面上に EN / JA の切替リンクを常時置く
* 自動リダイレクトはしない
* 初回訪問時に控えめな言語提案は許可
* ただしURL自体は必ず明示的に分ける
* 各ページには相互言語リンクを置く

---

## 6. ディレクトリ構成

```txt
/tools/
  /ui-atlas/
    index.html
    patterns/
    categories/
    compare/
    search/
    topics/
    pro/
    about/
    usage/
    styles.css
    app.js
    data/
    /ja/
      index.html
      patterns/
      categories/
      compare/
      search/
      topics/
      pro/
      about/
      usage/
      styles-ja.css
      app-ja.js
```

### 6-1. 運用原則

* 英語版を先に更新する
* 日本語版は英語正本から翻訳・要約・補足する
* アイテムIDと slug は英語正本基準で共有する
* UI画像やロゴは `/assets/` を参照する
* 各ツール内でロゴ画像を複製しない

---

## 7. レイアウト方針

このツールは**PC寄りツール**として扱う。
大量表示・比較・検索・詳細閲覧を主機能とするため、狭幅1カラム前提にはしない。

### 7-1. 幅方針

* PC: `max-width: 960px〜1200px`
* タブレット: 簡易2カラムまたは折りたたみ
* モバイル: 1カラム + 横スクロールラッパー適用

### 7-2. 共通レイアウト

* ヘッダー: ツール名 + 1行説明 + 言語切替 + 必要ならHomeリンク1つ
* メイン上部: `ad-top`
* 本体: 左フィルタ / 中央一覧 / 右詳細
* ページ下部: FAQ / `ad-bottom` / 寄付導線 / フッター

### 7-3. ロゴ運用

* ヘッダーにロゴ画像を常時表示しない
* favicon / OGP は共通アセット参照
* ツールらしさを優先し、LP的演出はしない

---

## 8. デザイン方針

### 8-1. トーン

* practical
* quiet
* light
* neutral
* tool-first
* non-showcase

### 8-2. ビジュアルルール

* 白背景ベース
* ダークモードは初期対象外
* カテゴリ色は薄く差をつける
* CTA色は1色に絞る
* 比較差分は視認性高く出す
* カードは見本と情報のバランス重視
* 観賞サイトではなく辞典サイトとして見せる

### 8-3. UIの優先順位

1. 検索のしやすさ
2. 比較のしやすさ
3. 一覧視認性
4. 詳細理解のしやすさ
5. 回遊性

---

## 9. 料金設計

### 9-1. 無料プラン

* 全UI項目の閲覧
* 検索
* カテゴリ絞り込み
* 詳細閲覧
* 2件までの比較
* 短文AIプロンプトコピー
* 要約実装メモ閲覧
* お気に入り5件まで
* 履歴保存なし
* 比較保存なし

### 9-2. 有料プラン

**名称:** UI Atlas Pro

### 9-3. 価格

* Monthly: USD 5
* Yearly: USD 39

日本語版では参考表示として

* 月額 480円相当
* 年額 3,980円相当
  を出してよいが、主課金表記は英語版基準でUSDにする

### 9-4. Proで解放するもの

* 3〜4件比較
* 詳細AIプロンプト
* 用途別プロンプトバリエーション
* 実装メモ全文
* 実装上の落とし穴全文
* お気に入り無制限
* 閲覧履歴保存
* 比較セット保存
* 印刷ビュー
* 保存用ビュー
* 類似UI提案
* 誤用警告の強化表示

### 9-5. 収益の考え方

この製品は、辞典知識そのものではなく、

* 比較の速さ
* 検索の速さ
* AI依頼の速さ
* 判断ミスの削減
* 再利用性
  に課金する。

---

## 10. 情報設計

### 10-1. 最上位カテゴリ

1. Page structure
2. Navigation
3. Content display
4. Forms
5. Feedback / states
6. Layout
7. Mobile-specific patterns
8. Data display
9. Conversion / action
10. Support UI

### 10-2. 初期収録数

**最低120項目**

### 10-3. 英語版での主な収録例

#### Page structure

* Hero
* Feature section
* CTA section
* FAQ
* Pricing table
* Testimonial
* Footer
* Contact section
* Comparison table
* Timeline

#### Navigation

* Navbar
* Hamburger menu
* Drawer
* Sidebar
* Breadcrumb
* Tabs
* Segmented control
* Pagination
* Anchor nav
* Mega menu

#### Content display

* Card
* Accordion
* Carousel
* Masonry
* Table
* List view
* Detail panel
* Split view
* Gallery
* Timeline list

#### Forms

* Text input
* Textarea
* Select
* Combobox
* Radio button
* Checkbox
* Switch
* OTP input
* Date picker
* Step form

#### States

* Empty state
* Skeleton loader
* Progress bar
* Toast
* Alert banner
* Inline validation
* Success screen
* Error state
* Loading spinner
* Retry panel

#### Mobile-specific

* Bottom sheet
* FAB
* Sticky bottom CTA
* Tab bar
* Pull to refresh
* Swipe actions
* Full-screen modal
* Mobile drawer

### 10-4. 日本語版での見せ方

* 英語名称を主見出しの下に日本語補足で出してもよい
* ただし日本語版でも英語名を必ず併記する
* UI業界標準の英語名を隠さない

---

## 11. データ構造

内部データの正本は英語基準で定義する。

### 11-1. 基本情報

* `id`
* `slug`
* `name_en`
* `name_ja`
* `aliases_en`
* `aliases_ja`
* `category_primary`
* `category_secondary`
* `summary_short_en`
* `summary_short_ja`
* `summary_long_en`
* `summary_long_ja`

### 11-2. 視覚情報

* `thumbnail_type`
* `thumbnail_variant_ids`
* `preview_component`
* `preview_notes_en`
* `preview_notes_ja`

### 11-3. 利用判断

* `best_for_en`
* `best_for_ja`
* `not_for_en`
* `not_for_ja`
* `common_contexts_en`
* `common_contexts_ja`
* `device_fit`
* `content_density_fit`
* `interaction_cost`
* `discoverability_level`

### 11-4. 比較情報

* `similar_patterns`
* `confused_with`
* `difference_points_en`
* `difference_points_ja`
* `replacement_candidates`
* `tradeoffs_en`
* `tradeoffs_ja`

### 11-5. AI依頼補助

* `ai_prompt_basic_en`
* `ai_prompt_basic_ja`
* `ai_prompt_detailed_en`
* `ai_prompt_detailed_ja`
* `ai_prompt_mobile_en`
* `ai_prompt_mobile_ja`
* `ai_prompt_accessibility_en`
* `ai_prompt_accessibility_ja`
* `ai_prompt_refactor_en`
* `ai_prompt_refactor_ja`
* `bad_prompt_examples_en`
* `bad_prompt_examples_ja`
* `prompt_keywords_en`
* `prompt_keywords_ja`

### 11-6. 実装補助

* `implementation_keywords`
* `accessibility_notes_en`
* `accessibility_notes_ja`
* `responsive_notes_en`
* `responsive_notes_ja`
* `performance_notes_en`
* `performance_notes_ja`
* `state_requirements_en`
* `state_requirements_ja`
* `keyboard_behavior_en`
* `keyboard_behavior_ja`
* `focus_behavior_en`
* `focus_behavior_ja`
* `animation_guidance_en`
* `animation_guidance_ja`

### 11-7. SEO補助

* `seo_title_en`
* `seo_title_ja`
* `seo_description_en`
* `seo_description_ja`
* `search_terms_en`
* `search_terms_ja`
* `status`
* `last_updated_at`
* `editor_notes`

---

## 12. 各UI項目ページ構成

### 12-1. ページ上部

* UI name
* Japanese label
* aliases
* category
* difficulty tag
* mobile fit tag
* AI-friendly tag

### 12-2. One-line summary

20〜40文字相当。英語版では短く明快に。

### 12-3. Mini preview

* 軽量な簡易インタラクティブ見本
* 重い実装は禁止
* ぱっと見で構造が分かることを優先

### 12-4. Best for

* 3〜5行程度
* 箇条書きより短文優先

### 12-5. Not for

* 必須
* 曖昧な「注意」ではなく、明確な非推奨場面を書く

### 12-6. Similar pattern comparison

表で見せる。例:

* Modal vs Bottom Sheet
* Tabs vs Accordion
* Select vs Combobox

### 12-7. AI-ready prompts

* Basic
* Mobile
* Accessibility
* Refactor

### 12-8. Implementation notes

* required states
* keyboard behavior
* focus handling
* body scroll lock
* aria concerns
* responsive cautions
* performance cautions

### 12-9. Common mistakes

* FAQなのにPopoverを選ぶ
* destructive confirmをBottom Sheetで済ませる
* モバイルでMega menuを乱用する
  など

### 12-10. Related patterns

* close alternatives
* more mobile-friendly alternatives
* simpler alternatives
* stronger alternatives

---

## 13. 一覧ページ仕様

### 13-1. 目的

一覧ページは、UIを眺める場所ではなく、

* 探す
* 比較候補を見つける
* 関連UIを発見する
  ための画面である。

### 13-2. 表示形式

* Grid view
* List view
* Compare-ready compact table

### 13-3. カードに載せる情報

* UI名
* 日本語補足名
* small preview
* one-line summary
* category
* main use tag
* number of similar patterns
* mobile fit
* Pro depth badge

### 13-4. カード操作

* 詳細を開く
* 比較に追加
* お気に入りに追加
* 短文AIプロンプトをコピー
* 関連項目へ移動

---

## 14. 検索仕様

検索はこの製品の主機能である。

### 14-1. 検索対象

* `name_en`
* `name_ja`
* `aliases_en`
* `aliases_ja`
* one-line summary
* use cases
* similar pattern names
* confusion words
* novice wording
* intent phrasing

### 14-2. 検索で拾うべき英語例

* “panel from bottom”
* “confirm dialog in center”
* “faq thing”
* “grey loading bones”
* “fixed button at bottom on mobile”

### 14-3. 検索で拾うべき日本語例

* 下から出る
* 真ん中に出る確認画面
* FAQみたいなやつ
* 読み込み中の灰色の骨
* スマホの下固定ボタン

### 14-4. 検索順位

1. exact official name
2. alias match
3. use-case match
4. novice wording match
5. related pattern match

### 14-5. サジェスト

英語版の例:

* “bottom”

  * Bottom Sheet
  * Drawer
  * Sticky Bottom CTA

* “faq”

  * Accordion
  * Expandable Panel
  * Tabs

日本語版でも同等の候補を返す。

### 14-6. ゼロ件時

* close matches
* popular patterns
* beginner wording list
* problem-based entries
* related categories

---

## 15. 絞り込み仕様

### 15-1. 軸

* Category
* Device fit
* Purpose
* Complexity
* AI-friendliness
* Implementation difficulty
* Accessibility load
* Mobile-friendliness
* Common vs uncommon

### 15-2. 目的軸

* Navigation
* Input
* Confirmation
* Comparison
* Warning
* State display
* Conversion
* Content organization

### 15-3. 実装難易度

* Low
* Medium
* High

### 15-4. 複雑さ

* Intuitive
* Needs slight learning
* Needs explanation

---

## 16. 比較機能仕様

### 16-1. 比較対象数

* Free: 2 patterns
* Pro: 3〜4 patterns

### 16-2. 比較項目

* primary purpose
* display position
* device fit
* best use cases
* bad use cases
* forcefulness
* information volume suitability
* implementation difficulty
* accessibility cautions
* AI-prompting clarity
* common misuse

### 16-3. 比較画面挙動

* add / remove
* reorder
* highlight differences only
* save compare set
* generate share link
* print layout

---

## 17. お気に入り・履歴

### 17-1. お気に入り

* Free: 5
* Pro: unlimited

### 17-2. 履歴

* viewed patterns
* compared patterns
* copied prompts

### 17-3. 目的

“前に見たあれ” を再発見できるようにする。

---

## 18. AI依頼文仕様

### 18-1. 種類

* Basic
* Detailed
* Mobile
* Accessibility
* Refactor

### 18-2. 悪い依頼例

英語版例:

* “make it modern”
* “add a nice popup”
* “make it mobile friendly”
* “add some better UI”

日本語版例:

* 今風にして
* いい感じの確認画面にして
* スマホ向きにして

### 18-3. 良い依頼例の方針

* 部位
* 表示位置
* 操作条件
* 閉じ方
* モバイル配慮
* a11y配慮
* 状態変化
  まで入れる。

---

## 19. 実装メモ仕様

### 19-1. 含める内容

* state model
* open / close conditions
* escape key behavior
* focus trap
* body scroll lock
* aria roles
* mobile cautions
* animation cautions
* performance cautions

### 19-2. 深さ

コード全文配布ではなく、実装判断に十分な深さを持たせる。

---

## 20. レスポンシブ仕様

### 20-1. モバイル

* 1列または2列一覧
* 詳細は全画面シート
* 比較は横スクロール
* フィルタはボトムシートまたはドロワー

### 20-2. タブレット

* 条件付きで左一覧 + 右詳細

### 20-3. デスクトップ

* 左フィルタ
* 中央一覧
* 右詳細
* 必要ならモーダル詳細

---

## 21. アクセシビリティ仕様

### 21-1. 必須

* keyboard reachable
* visible focus
* meaningful labels
* no color-only differentiation
* semantic compare tables
* search/filter relation clarity

### 21-2. ミニデモ

* 説明補助として扱う
* 装飾や観賞を主目的にしない
* テキスト説明を必ず付ける

---

## 22. SEO仕様

### 22-1. 主対象ページ

英語版:

* top
* category pages
* pattern pages
* compare pages
* problem pages

日本語版:

* 同構造で維持するが、英語版の補助とする

### 22-2. 英語版タイトル例

* What is a Bottom Sheet? Uses, differences from modal, and AI prompt examples
* What is an Accordion? When to use it for FAQ and when not to
* What is a Skeleton Loader? UI loading pattern guide with implementation notes

### 22-3. 日本語版タイトル例

* ボトムシートとは？モーダルとの違い・使いどころ・AI依頼例
* アコーディオンとは？FAQでの使い方・タブとの違い
* Skeleton Loaderとは？読み込み中UIの使い方と注意点

### 22-4. 狙う検索意図

英語主軸:

* what is [pattern]
* [pattern] vs [pattern]
* [pattern] UI
* [pattern] examples
* [pattern] AI prompt
* [pattern] mobile
* [pattern] accessibility
* [pattern] implementation

日本語補助:

* 〇〇とは
* 〇〇 違い
* 〇〇 使い方
* 〇〇 AI
* 〇〇 モバイル
* 〇〇 実装

### 22-5. 構造化

* FAQ schema
* Breadcrumb schema
* Article / TechArticle
* Compare pages with structured table-like content
* hreflang equivalent pairing between EN and JA

---

## 23. SNS共有仕様

### 23-1. 英語版OGP

* UI name
* short comparison angle
* simple preview
* strong readability

### 23-2. 日本語版OGP

* 日本語補助タイトル
* 英語名称併記可
* 日本語読者向けの比較訴求

### 23.3. 比較ページOGP

* “Modal vs Bottom Sheet”
* “Tabs vs Accordion”
* 差分がひと目で分かる構図

---

## 24. 導線仕様

### 24-1. トップからの主導線

* Search by name
* Browse by use case
* Solve a problem
* Compare patterns

### 24-2. 問題導線例

* I need a confirmation UI
* I need a mobile-friendly action entry
* I need a loading pattern
* I need a better FAQ pattern
* I need a way to switch between options

日本語版でも同等の悩み導線を持つ。

### 24-3. 回遊導線

* similar patterns
* simpler alternatives
* stronger alternatives
* mobile-first alternatives
* often viewed together

---

## 25. 管理画面・運営仕様

### 25-1. 管理機能

* add pattern
* draft
* schedule publish
* set comparison relations
* edit novice wording mappings
* SEO input
* OGP generation
* update log

### 25-2. 編集必須項目

* English short summary
* English long summary
* Japanese short summary
* Japanese long summary
* best for
* not for
* similar patterns
* at least 2 prompt variants
* implementation notes
* at least 5 search aliases in English
* at least 3 search aliases in Japanese

### 25-3. 更新優先順位

1. 英語版の正本更新
2. 日本語版の追従更新
3. OGP / SEO / internal links 更新

---

## 26. 品質基準

### 26-1. 項目品質

* difference is clear
* best-for is useful
* not-for is explicit
* AI prompt is usable
* implementation note is not shallow
* mobile perspective exists
* misuse warning exists

### 26-2. サイト品質

* fast search
* good novice wording match
* clear comparison
* mobile usability retained
* Pro value is obvious
* English version stands on its own
* Japanese version is not machine-translation quality

---

## 27. 技術方針

### 27-1. 方針

* static-first
* fast loading
* data-driven
* no framework requirement
* minimal JS
* client-side interaction only
* no user input sent to server

### 27-2. 共通仕様準拠

* `tools/` 配下で運用
* 共通ロゴアセット参照
* `ad-top` 必須
* `ad-bottom` 推奨
* 寄付導線は広告と分離
* 横断ナビは原則置かない
* GA4 / Cloudflare analytics を維持

### 27-3. 禁止

* 600px固定化
* PC幅の不必要な縮小
* 1ページ内動的言語切替を主方式にすること
* 日本語版のみ更新して英語版を止めること
* ツール内部にロゴ複製を置くこと

---

## 28. 必須ページ

### 英語版

* top
* patterns list
* pattern detail
* category pages
* compare
* problem pages
* pro
* about
* usage

### 日本語版

* 上記と同構造で維持

---

## 29. 無料と有料の境界

### 無料

* discover
* read
* search
* basic compare
* copy short prompts

### 有料

* deep compare
* save
* reuse
* print
* access longer prompts
* access deeper implementation notes

---

## 30. 初期目玉比較

* Modal vs Bottom Sheet
* Tabs vs Accordion
* Select vs Combobox
* Radio Button vs Segmented Control
* Toast vs Alert Banner
* Drawer vs Sidebar
* Skeleton Loader vs Spinner
* Card Grid vs Table
* FAB vs Sticky Bottom CTA
* Hero vs Feature Section

---

## 31. 失敗条件

* 日本語版だけが厚く、英語版が薄い
* 英語SEOが弱い
* 比較が浅い
* novice wording を拾えない
* Pro理由が弱い
* モバイルで比較が壊れる
* not-for が薄い
* AI prompt が表面的
* 更新が止まる

---

## 32. この製品で金を取れる理由

この製品が売るものは、UI知識そのものではない。

売るのは、

* naming friction
* comparison time
* AI prompting time
* implementation hesitation
* repeated lookup cost
* decision mistakes

の削減である。

つまりこの製品は、
**UI knowledge product ではなく UI decision tool**
として成立させる。

---

