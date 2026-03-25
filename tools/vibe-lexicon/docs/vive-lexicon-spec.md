# Vibe Lexicon

**改訂版 v2 / English-primary edition**

**製品区分:** 有料化可能な実用Webツール
**運営名義:** Niche Works
**製品カテゴリ:** Vibe coding glossary / ambiguity-to-practical wording dictionary / AI prompting vocabulary tool
**主言語方針:** **英語メイン、日本語補助**
**公開方針:**

* 英語版を正面入口とする
* 日本語版は補助入口とする
* URLは言語ごとに分離する
* 1ページ1言語を原則とする

---

## 1. 製品の定義

Niche Works Vibe Lexicon は、Web制作・UI改善・LP制作・画面設計の場面で使われる
**曖昧な依頼語 / 雰囲気語 / 評価語 / 実務語 / UI関連語**
を整理し、実務で使える形へ変換するための用語集である。

この製品は、単なる流行語集ではない。
単なるプロンプトテンプレ集でもない。
単なる英単語和訳集でもない。

この製品の価値は、1語ごとに次のことを完結させる点にある。

1. その言葉の意味が分かる
2. 似た言葉との違いが分かる
3. 曖昧な依頼を具体語に分解できる
4. AIにそのまま渡せる依頼文へ変換できる
5. 悪い頼み方と良い頼み方を比較できる
6. その語がどの用途で有効か分かる
7. UI / LP / フォーム / ライティング / モバイルなど文脈別に使い分けできる

---

## 2. 改訂方針

この改訂版では、従来の「日本語優先」をやめ、以下に変更する。

### 2-1. 主な変更点

* 英語を主言語にする
* 日本語はローカライズ版として持つ
* ルートURLを英語版にする
* 日本語版は `ja/` 配下に分離する
* 内部データの正本は英語語彙・英語説明を基準に持つ
* SEO・OGP・共有導線は英語版を主軸にする
* 曖昧語分解もまず英語圏の語彙体系で設計し、日本語版へ落とし込む

### 2-2. この変更を行う理由

* “vibe coding” 自体が英語圏の制作文化と強く結びついている
* 主要検索語が英語で流通している
* 収益天井は英語版の方が高い
* 日本語版も維持するが、主戦場は英語圏とする

---

## 3. 製品の約束

英語版トップで伝える製品メッセージはこれで固定する。

**“Turn vague requests into AI-ready design language.”**

補助文言は以下。

* Break fuzzy wording into practical design actions
* Understand the difference between similar terms
* Copy prompts for UI, landing pages, forms, and rewrites
* Learn what not to say
* Translate vague taste words into buildable instructions

日本語版では以下を使う。

**「曖昧な依頼を、AIに通る言葉へ変えるVibe Coding用語集。」**

---

## 4. 想定ユーザー

### 4-1. 英語版の主対象

1. AI-assisted web builders
2. Indie hackers
3. UI / landing page improvers
4. Founders and PMs who describe design in text
5. Designers and frontend beginners
6. No-code / low-code users
7. Freelancers doing small web work

### 4-2. 日本語版の主対象

1. AIでWeb制作を進める日本語圏ユーザー
2. 言いたいことはあるが用語が出てこない人
3. LP改善やUI修正をAIに頼む人
4. ディレクター / PM / ライター
5. 制作初心者

### 4-3. 典型的な利用シーン

* “Make it look more modern” を具体化したい
* “This feels cluttered” を何に分解するべきか分からない
* “Add luxury” が抽象的すぎる
* “Make it easier to read on mobile” を具体的依頼文にしたい
* “Make the CTA stronger” を適切な設計語に変換したい
* “Readable / clear / polished / premium” の違いを理解したい

---

## 5. 公開URL構成

### 5-1. 英語版

* `/tools/vibe-lexicon/`
* `/tools/vibe-lexicon/terms/`
* `/tools/vibe-lexicon/terms/[slug]/`
* `/tools/vibe-lexicon/categories/[slug]/`
* `/tools/vibe-lexicon/compare/`
* `/tools/vibe-lexicon/search/`
* `/tools/vibe-lexicon/topics/[problem]/`
* `/tools/vibe-lexicon/pro/`
* `/tools/vibe-lexicon/about/`
* `/tools/vibe-lexicon/usage/`

### 5-2. 日本語版

* `/tools/vibe-lexicon/ja/`
* `/tools/vibe-lexicon/ja/terms/`
* `/tools/vibe-lexicon/ja/terms/[slug]/`
* `/tools/vibe-lexicon/ja/categories/[slug]/`
* `/tools/vibe-lexicon/ja/compare/`
* `/tools/vibe-lexicon/ja/search/`
* `/tools/vibe-lexicon/ja/topics/[problem]/`
* `/tools/vibe-lexicon/ja/pro/`
* `/tools/vibe-lexicon/ja/about/`
* `/tools/vibe-lexicon/ja/usage/`

### 5-3. 言語切替ルール

* EN / JA 切替リンクを常時表示
* 自動リダイレクトはしない
* 初回訪問時の控えめな提案は可
* 各ページは必ず相互言語リンクを持つ
* 1ページ内動的切替は主方式にしない

---

## 6. ディレクトリ構成

```txt
/tools/
  /vibe-lexicon/
    index.html
    terms/
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
      terms/
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
* 日本語版は英語正本から翻訳・補足する
* `slug` は英語正本基準で固定する
* 共通アセットは `/assets/...` を参照する
* 各ツール内にロゴやfaviconを複製しない

---

## 7. レイアウト方針

Vibe Lexicon も**PC寄りツール**として扱う。
理由は、検索・比較・詳細閲覧・長文理解・用途別切替が主機能だからである。共通仕様のPC寄りツール基準に合わせ、`960〜1200px` 幅を維持し、モバイルでは1カラム化と横スクロールラッパーを使う。 

### 7-1. 幅方針

* PC: `max-width: 960px〜1200px`
* タブレット: 簡易2カラム
* モバイル: 1カラム + 横スクロール対応

### 7-2. 共通レイアウト

* ヘッダー: ツール名 + 1行説明 + 言語切替 + 必要ならHomeリンク1つ
* メイン上部: `ad-top`
* 本体: 左フィルタ / 中央一覧 / 右詳細
* 下部: FAQ / `ad-bottom` / 寄付導線 / フッター

### 7-3. ロゴ運用

* ヘッダーにロゴを常時表示しない
* `/assets/...` を共通参照
* LP風ではなく辞典・ツール風を優先する

---

## 8. デザイン方針

### 8-1. トーン

* practical
* calm
* text-first
* clear
* structured
* tool-first

### 8-2. ビジュアルルール

* 白背景ベース
* ダークモードは初期対象外
* 曖昧語タグと実務語タグを明確に分ける
* bad example は警告色、better example は成功色
* 分解表は表組みを重視
* 読み物サイトではなく、変換装置として見せる

### 8-3. UIの優先順位

1. 検索しやすさ
2. 曖昧語→実務語の変換体験
3. 比較しやすさ
4. 文例コピーのしやすさ
5. 回遊性

---

## 9. 料金設計

旧仕様では無料で全用語閲覧、基本変換例、1対1比較、お気に入り5件までを開放し、Proで複数比較・詳細分解・保存・用途別文例フル解放を提供する前提でした。 

### 9-1. 無料プラン

* All terms viewable
* Search
* Category filtering
* Detail view
* Basic conversion examples
* Basic prompt copy
* 1:1 comparison
* Favorites up to 5
* No saved sets
* Limited deep breakdown visibility

### 9-2. 有料プラン

**名称:** Vibe Lexicon Pro

### 9-3. 価格

* Monthly: USD 5
* Yearly: USD 39

日本語版では参考として

* 月額 480円相当
* 年額 3,980円相当
  を併記してよいが、主課金表記は英語版基準でUSDとする。

### 9-4. Proで解放するもの

* Multi-term comparison
* Full ambiguity breakdown tables
* Full bad / better example sets
* Unlimited favorites / history / saved sets
* Prompt bundles for UI / LP / forms / writing
* Goal-based advanced search
* Batch copy of related term groups
* Future composite transformation mode

### 9-5. 収益の考え方

この製品は知識課金ではなく、

* wording speed
* ambiguity reduction
* reuse
* better prompting
* less back-and-forth with AI
  に課金する。

---

## 10. 情報設計

旧仕様では**最低250語**、かつ「雰囲気語 / 見た目調整語 / レイアウト語 / 余白・密度語 / 視線導線語 / 可読性語 / 強調・CTA語 / フォーム改善語 / 動き・反応語 / レスポンシブ語 / 情報整理語 / AI依頼変換語」の12カテゴリが定義されていました。 

### 10-1. 最上位カテゴリ

1. Tone / vibe words
2. Visual adjustment terms
3. Layout terms
4. Spacing / density terms
5. Visual hierarchy / scan flow terms
6. Readability terms
7. CTA / emphasis terms
8. Form improvement terms
9. Motion / feedback terms
10. Responsive terms
11. Information organization terms
12. AI request transformation terms

### 10-2. 初期収録数

**最低250語**

### 10-3. 英語版での主な収録例

#### Tone / vibe words

* modern
* polished
* premium
* playful
* soft
* cool
* minimal
* stylish
* approachable
* trustworthy

#### Visual adjustment terms

* contrast
* saturation
* brightness
* accent color
* border radius
* shadow
* stroke
* opacity
* visual weight
* density

#### Layout terms

* layout
* container
* column
* grid
* section
* spacing system
* hierarchy
* wrap
* alignment
* max width

#### Spacing / density terms

* whitespace
* spacing
* gap
* padding
* margin
* vertical rhythm
* information density
* airy
* cramped
* breathing room

#### Visual hierarchy / scan flow terms

* visual hierarchy
* priority
* primary vs secondary
* entry point
* CTA path
* scannability
* F-pattern
* visual anchor
* grouping
* section separation

#### Readability terms

* readable
* legible
* line height
* letter spacing
* text volume
* heading hierarchy
* over-emphasis
* noise
* readable width
* paragraph structure

#### CTA / emphasis terms

* emphasize
* CTA
* priority
* highlight
* primary button
* secondary action
* click pull
* inviting
* action cue
* friction reduction

#### Form improvement terms

* easy to fill
* step split
* validation
* helper text
* error messaging
* inline error
* focus state
* placeholder
* label clarity
* input burden

#### Motion / feedback terms

* add motion
* hover
* feedback
* transition
* motion intensity
* subtle
* bounce
* reveal
* loading feedback
* reduce motion

#### Responsive terms

* mobile-first
* breakpoint
* collapse
* rearrange
* one-column
* fixed CTA
* safe area
* overflow
* touch target
* scroll comfort

#### AI request transformation terms

* make it feel nicer
* make it modern
* make it easier to read
* make it look polished
* add premium feel
* it feels cluttered
* it feels flat
* it feels too loud
* simplify it
* make it clearer

### 10-4. 日本語版での見せ方

* 英語語彙を隠さず併記する
* 日本語訳だけで完結させない
* 日本語版でも英語業界語を主見出しの補助として見せる

---

## 11. データ構造

内部データの正本は英語基準で定義する。

### 11-1. 基本情報

* `id`
* `slug`
* `term_en`
* `term_ja`
* `aliases_en`
* `aliases_ja`
* `category_primary`
* `category_secondary`
* `summary_short_en`
* `summary_short_ja`
* `summary_long_en`
* `summary_long_ja`

### 11-2. 意味と位置づけ

* `definition_en`
* `definition_ja`
* `plain_explanation_en`
* `plain_explanation_ja`
* `when_people_use_it_en`
* `when_people_use_it_ja`
* `what_it_often_means_in_practice_en`
* `what_it_often_means_in_practice_ja`
* `common_misuse_en`
* `common_misuse_ja`
* `difficulty_level`

### 11-3. 関連関係

* `similar_terms`
* `confused_with`
* `opposite_terms`
* `related_ui_topics`
* `related_layout_topics`

### 11-4. 変換情報

* `vague_to_practical_map_en`
* `vague_to_practical_map_ja`
* `practical_breakdown_en`
* `practical_breakdown_ja`
* `before_after_examples_en`
* `before_after_examples_ja`
* `bad_request_examples_en`
* `bad_request_examples_ja`
* `better_request_examples_en`
* `better_request_examples_ja`

### 11-5. AI依頼補助

* `ai_prompt_basic_en`
* `ai_prompt_basic_ja`
* `ai_prompt_detailed_en`
* `ai_prompt_detailed_ja`
* `ai_prompt_lp_en`
* `ai_prompt_lp_ja`
* `ai_prompt_ui_en`
* `ai_prompt_ui_ja`
* `ai_prompt_form_en`
* `ai_prompt_form_ja`
* `ai_prompt_mobile_en`
* `ai_prompt_mobile_ja`
* `prompt_keywords_en`
* `prompt_keywords_ja`

### 11-6. 実務補助

* `design_implications_en`
* `design_implications_ja`
* `content_implications_en`
* `content_implications_ja`
* `layout_implications_en`
* `layout_implications_ja`
* `interaction_implications_en`
* `interaction_implications_ja`
* `mobile_implications_en`
* `mobile_implications_ja`
* `accessibility_implications_en`
* `accessibility_implications_ja`
* `implementation_hints_en`
* `implementation_hints_ja`

### 11-7. 編集補助

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

## 12. 各用語ページ構成

### 12-1. ページ上部

* term
* Japanese label
* aliases
* category
* beginner-friendly tag
* vague-word tag / practical-word tag

### 12-2. One-line summary

短く明快に、何を助ける言葉かを示す。

### 12-3. Plain explanation

専門用語に寄りすぎず、「ひらたく言うと何か」を示す。
旧仕様でもここは重要な要素でした。 

### 12-4. What it often means in practice

たとえば “premium” は単なる豪華さではなく、

* more whitespace
* fewer colors
* calmer typography
* reduced visual noise
  のように分解されることを示す。

### 12-5. Common misuse

必須。
例:

* “modern” を大きい角丸だけだと思っている
* “readable” を文字サイズを上げることだけだと思っている
* “premium” を黒金配色だけだと思っている

### 12-6. Similar term comparison

表形式で比較する。
例:

* modern vs polished vs minimal
* readable vs clear vs legible
* premium vs elegant vs trustworthy

### 12-7. Breakdown from vague to practical

このツールの最重要部。
「その語を実務では何に分解するか」を具体要素で見せる。

### 12-8. AI-ready prompts

* Basic
* UI
* LP
* Form
* Mobile
* Rewrite

### 12-9. Bad request examples

* “make it better”
* “make it nicer”
* “make it modern”
* “make it more premium”

### 12-10. Better request examples

悪い依頼文を、具体要素を含む完成文へ変換して見せる。

### 12-11. Practical notes

* where it works best
* what knobs change this impression
* what breaks it
* mobile cautions
* overuse cautions

### 12-12. Related terms

* close terms
* opposite terms
* often compared terms
* related UI topics

---

## 13. 一覧ページ仕様

### 13-1. 目的

一覧ページは、語を眺める場所ではなく、

* 探す
* 比較候補を見つける
* 悩みから変換候補を発見する
  ための画面である。

### 13-2. 表示形式

* Grid view
* List view
* Compare-ready compact table

### 13-3. カードに載せる情報

* term
* Japanese label
* one-line summary
* category
* vague/practical tag
* common use
* AI prompt availability
* Pro depth badge

### 13-4. カード操作

* open detail
* add to compare
* add to favorites
* copy basic prompt
* jump to related term

---

## 14. 検索仕様

旧仕様では、正式語だけでなく、**悩み文そのもの**で引けることが重視されていました。 

### 14-1. 検索対象

* `term_en`
* `term_ja`
* aliases
* one-line summary
* vague wording
* practical wording
* common problems
* use cases
* AI prompt keywords
* bad request examples

### 14-2. 検索で拾うべき英語例

* make it modern
* feels cluttered
* needs premium feel
* easier to read
* make CTA stronger
* feels too noisy
* feels flat
* make it clearer
* make it more polished
* mobile readability

### 14-3. 検索で拾うべき日本語例

* 今っぽくしたい
* ごちゃついてる
* 高級感を出したい
* 読みやすくしたい
* CTAを強くしたい
* もっと分かりやすくしたい

### 14-4. 検索順位

1. exact term match
2. alias match
3. vague wording match
4. problem-intent match
5. related term match

### 14-5. サジェスト

英語版例:

* “readable”

  * readability
  * legibility
  * hierarchy
  * line height
  * scan flow

* “premium”

  * premium
  * polished
  * elegant
  * minimal
  * trust-building

日本語版でも同等候補を返す。

### 14-6. ゼロ件時

* close matches
* popular terms
* vague wording collections
* problem-based entry points
* related categories

---

## 15. 絞り込み仕様

### 15-1. 軸

* Category
* Vague vs practical
* Use case
* Beginner-friendliness
* AI-prompt readiness
* UI / LP / Form / Writing
* Mobile relevance
* Misuse risk
* Search popularity

### 15-2. 用途軸

* UI improvement
* Landing page improvement
* Writing improvement
* CTA improvement
* Form improvement
* Information organization
* Mobile optimization
* Visual tuning

### 15-3. 難易度

* Intro
* Beginner-intermediate
* Intermediate+

### 15-4. 誤用リスク

* Low
* Medium
* High

---

## 16. 比較機能仕様

### 16-1. 比較対象数

* Free: 2 terms
* Pro: 3〜4 terms

### 16-2. 比較項目

* meaning
* common use case
* practical breakdown
* close but different point
* best-fit audience
* bad-fit audience
* AI-promptability
* misuse risk
* related UI implication
* tone strength
* B2B / B2C suitability

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

* viewed terms
* compared terms
* copied prompts
* recently used transformations

### 17-3. 目的

“前に見た便利な言い回し” を再発見できるようにする。

---

## 18. AI依頼文仕様

旧仕様では、用途別に **基本 / 詳細 / UI改善 / LP改善 / フォーム改善 / モバイル / リライト** を用意する前提でした。 

### 18-1. 種類

* Basic
* Detailed
* UI
* LP
* Form
* Mobile
* Rewrite

### 18-2. 悪い依頼例

英語版例:

* “make it nicer”
* “make it modern”
* “make it polished”
* “make it easier to read”
* “give it premium feel”

日本語版例:

* もっと良い感じにして
* 今風にして
* 洗練させて
* 見やすくして
* 高級感を出して

### 18-3. 良い依頼例の方針

* change target
* specific visual or structural change
* priority
* scope
* mobile context
* tone guardrails
  まで含める。

---

## 19. 曖昧語分解仕様

これはこの製品独自の中核機能である。

### 19-1. 主要分解対象

* modern
* premium
* readable
* polished
* playful
* clean
* cluttered
* flat
* clear
* stronger CTA

### 19-2. 分解結果の形式

例えば “modern” なら、

* increase whitespace
* reduce visual noise
* use fewer accent colors
* soften shadows
* unify corner radius
* reduce information density
* simplify CTA hierarchy
* favor one-column on small screens

### 19-3. 表示形式

* short bullet list
* use-case tabs
* transformed full request
* what breaks the intended tone

---

## 20. 実務メモ仕様

### 20-1. 含める内容

* layout implications
* color implications
* typography implications
* UI implications
* CTA implications
* mobile implications
* overuse risks
* when to switch to a different term

### 20-2. 深さ

コード実装の深掘りではなく、
**その印象や改善方向を何で作るか**
が分かる深さを持たせる。

---

## 21. レスポンシブ仕様

### 21-1. モバイル

* 1〜2列一覧
* 詳細は全画面シート
* 比較は横スクロール表
* フィルタはボトムシート

### 21-2. タブレット

* 左一覧 + 右詳細 可

### 21-3. デスクトップ

* 左フィルタ
* 中央一覧
* 右詳細またはモーダル詳細

---

## 22. アクセシビリティ仕様

### 22-1. 必須

* keyboard reachable
* visible focus
* no color-only distinction
* semantic compare tables
* proper heading hierarchy
* search / filter relation clarity

### 22-2. 読みやすさ

このツールは文章量が多いため、

* readable line height
* stable paragraph spacing
* restrained emphasis
* balanced table/text flow
  を重視する。

---

## 23. SEO仕様

### 23-1. 主対象ページ

英語版:

* top
* term pages
* compare pages
* vague-word collections
* problem pages

日本語版:

* 同構造を維持するが、英語版を主軸にする

### 23-2. 英語版タイトル例

* What does “modern” mean in web design? Practical breakdown and AI-ready prompts
* What does “premium” mean in UI design? Common misuse, breakdown, and better requests
* What is the difference between readable, clear, and legible?

### 23-3. 日本語版タイトル例

* 「今っぽい」とは？AIに伝わる具体化・言い換え・依頼文例
* 「高級感」とは？Webデザインでの意味・分解・よくある誤用
* 「見やすい」とは？可読性・視線導線・情報密度への落とし込み方

### 23-4. 狙う検索意図

英語主軸:

* what does [term] mean in design
* [term] UI meaning
* [term] prompt
* [term] wording
* [term] design difference
* how to describe [tone] to AI

日本語補助:

* 〇〇 意味
* 〇〇 言い換え
* 〇〇 AI
* 〇〇 依頼文
* 〇〇 デザイン

### 23-5. 構造化

* FAQ schema
* Breadcrumb schema
* Article / TechArticle
* compare pages with structured comparison blocks
* hreflang pairing between EN and JA

---

## 24. SNS共有仕様

### 24-1. 英語版OGP

* term
* short practical transformation angle
* clear tagline
* readable structure

### 24-2. 日本語版OGP

* 日本語タイトル
* 必要に応じて英語用語併記
* 変換の要点を一目で見せる

### 24-3. 比較ページOGP

* “modern vs polished”
* “readable vs clear vs legible”
* 差分が見える構図

---

## 25. 導線仕様

### 25-1. トップからの主導線

* Search by term
* Search by problem
* Transform vague wording
* Compare similar terms

### 25-2. 問題導線例

* It feels outdated
* It feels cluttered
* It’s hard to read
* CTA is too weak
* It doesn’t feel premium
* It feels too noisy
* Mobile feels cramped
* I can’t describe what I want

日本語版でも同等の悩み導線を持つ。

### 25-3. 回遊導線

* close terms
* opposite terms
* often-compared terms
* related UI topics

---

## 26. 管理画面・運営仕様

### 26-1. 管理機能

* add term
* draft
* schedule publish
* edit mappings
* set comparisons
* SEO input
* OGP generation
* update log
* manage use-case prompt variants

### 26-2. 編集必須項目

* English short summary
* English long summary
* Japanese short summary
* Japanese long summary
* plain explanation
* practical meaning
* ambiguity breakdown
* at least 2 prompt variants
* bad example
* compare target
* at least 5 search aliases in English
* at least 3 search aliases in Japanese

### 26-3. 更新優先順位

1. 英語版正本更新
2. 日本語版追従
3. OGP / SEO / internal links 更新

---

## 27. 品質基準

### 27-1. 項目品質

* meaning is clear
* practice meaning is explicit
* difference from similar terms is clear
* AI prompts are usable
* bad examples exist
* ambiguity breakdown exists
* mobile perspective exists
* misuse is warned

### 27-2. サイト品質

* fast search
* vague problem wording works
* comparison is clear
* reading experience is stable
* Pro value is obvious
* English version stands on its own
* Japanese version is not low-quality translation

---

## 28. 技術方針

### 28-1. 方針

* static-first
* fast loading
* data-driven
* no framework requirement
* minimal JS
* client-side interaction only
* no user text sent to server

### 28-2. 共通仕様準拠

* `tools/` 配下で運用
* 共通ロゴアセット参照
* `ad-top` 必須
* `ad-bottom` 推奨
* 寄付導線は広告と分離
* 横断ナビは原則置かない
* GA4 / Cloudflare analytics 維持

### 28-3. 禁止

* 600px固定
* PC幅の不必要な縮小
* 1ページ内動的言語切替を主方式にすること
* 日本語版のみ更新して英語版を止めること
* 各ツール内にロゴ複製を置くこと

---

## 29. 必須ページ

### 英語版

* top
* terms list
* term detail
* category pages
* compare
* problem pages
* pro
* about
* usage

### 日本語版

* 上記と同構造で維持

---

## 30. 無料と有料の境界

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
* access longer prompt bundles
* access full ambiguity breakdown
* access full bad/better example sets

---

## 31. 初期目玉比較

* modern vs polished
* premium vs elegant
* readable vs clear vs legible
* emphasize vs prioritize
* playful vs approachable
* minimal vs clean
* cluttered vs high-density
* flat vs low visual weight
* noisy vs over-emphasized
* add motion vs add feedback

---

## 32. 失敗条件

* 日本語版の方が厚い
* 英語SEOが弱い
* 比較が浅い
* vague problem wording が拾えない
* Pro理由が弱い
* AI prompt が表面的
* bad example が薄い
* 更新が止まる

---

## 33. この製品で金を取れる理由

この製品が売るものは、用語知識そのものではない。

売るのは、

* wording friction
* ambiguity reduction time
* prompt rewriting time
* comparison time
* repeated lookup cost
* communication mismatch cost

の削減である。

つまりこの製品は、
**glossary ではなく wording decision tool**
として成立させる。

---

