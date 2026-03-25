# Motion Atlas

**改訂版 v2 / English-primary edition**

**製品区分:** 有料化可能な実用Webツール
**運営名義:** Niche Works
**製品カテゴリ:** motion pattern atlas / animation dictionary / motion selection tool / AI prompting support tool
**主言語方針:** **英語メイン、日本語補助**
**公開方針:**

* 英語版を正面入口とする
* 日本語版は補助入口とする
* URLは言語ごとに分離する
* 1ページ1言語を原則とする

---

## 1. 製品の定義

Niche Works Motion Atlas は、WebサイトやUIで使うアニメーションを、
**見本・用途・非推奨用途・強さ・軽さ・モバイル相性・アクセシビリティ配慮・AI依頼文・実装メモ**
まで一体化して整理した実用モーション一覧である。

この製品は、単なるアニメーション見本集ではない。
単なるCSSスニペット集でもない。
単なるコードコピーツールでもない。

この製品の価値は、1項目ごとに次のことを完結させる点にある。

1. どういう動きか、その場で見て分かる
2. 何に向いている動きか分かる
3. どんな場面では使うべきでないか分かる
4. 似た動きとの違いが分かる
5. 派手さ・軽さ・スマホ相性が分かる
6. AIにどう依頼すればよいか分かる
7. 実装時に何を意識すべきか分かる
8. reduce motion を含めた代替判断ができる

---

## 2. 改訂方針

この改訂版では、従来の「日本語優先」をやめ、以下に変更する。

### 2-1. 主な変更点

* 英語を主言語にする
* 日本語はローカライズ版として持つ
* ルートURLを英語版にする
* 日本語版は `ja/` 配下に分離する
* 内部データの正本は英語名・英語説明を基準に持つ
* SEO・OGP・共有導線は英語版を主軸にする
* モーション名・印象語・検索語も英語系を正本として持つ

### 2-2. この変更を行う理由

* モーション名そのものが英語圏の制作文脈で流通している
* 検索母数と共有母数が英語の方が大きい
* 収益の天井は英語版の方が高い
* 日本語版も維持するが、主戦場は英語圏とする

---

## 3. 製品の約束

英語版トップで伝える製品メッセージはこれで固定する。

**“Choose motion by purpose, not guesswork.”**

補助文言は以下。

* See how it moves before you build
* Know when to use it and when not to
* Compare similar motions side by side
* Copy AI-ready motion prompts
* Check performance and reduced-motion cautions first

日本語版では以下を使う。

**「見るだけで終わらない。目的から選べて、AIにも正確に頼めるアニメーション一覧。」**

---

## 4. 想定ユーザー

### 4-1. 英語版の主対象

1. AI-assisted web builders
2. Indie hackers
3. Landing page builders
4. Frontend beginners
5. UI improvers
6. No-code / low-code users
7. Freelancers and solo makers

### 4-2. 日本語版の主対象

1. AIでWebサイト制作を進める日本語圏ユーザー
2. 動きは入れたいが、何を選べばよいか分からない人
3. LP制作者
4. フロントエンド初中級者
5. 個人開発者

### 4-3. 典型的な利用シーン

* 見出しに控えめな動きを入れたい
* CTAを目立たせたいが、うるさくしたくない
* カードホバーを付けたい
* FAQやタブ切替に自然な動きを入れたい
* ローディング表示を少し気持ちよくしたい
* AIに「タイプライターみたいな動き」と頼みたい
* スマホで不快にならない程度の動きを選びたい
  これらは旧仕様でも主な利用シーンとして定義されていました。 

---

## 5. 公開URL構成

### 5-1. 英語版

* `/tools/motion-atlas/`
* `/tools/motion-atlas/motions/`
* `/tools/motion-atlas/motions/[slug]/`
* `/tools/motion-atlas/categories/[slug]/`
* `/tools/motion-atlas/compare/`
* `/tools/motion-atlas/search/`
* `/tools/motion-atlas/topics/[problem]/`
* `/tools/motion-atlas/pro/`
* `/tools/motion-atlas/about/`
* `/tools/motion-atlas/usage/`

### 5-2. 日本語版

* `/tools/motion-atlas/ja/`
* `/tools/motion-atlas/ja/motions/`
* `/tools/motion-atlas/ja/motions/[slug]/`
* `/tools/motion-atlas/ja/categories/[slug]/`
* `/tools/motion-atlas/ja/compare/`
* `/tools/motion-atlas/ja/search/`
* `/tools/motion-atlas/ja/topics/[problem]/`
* `/tools/motion-atlas/ja/pro/`
* `/tools/motion-atlas/ja/about/`
* `/tools/motion-atlas/ja/usage/`

### 5-3. 言語切替ルール

* EN / JA 切替リンクを常時表示
* 自動リダイレクトはしない
* 初回訪問時の控えめな言語提案は可
* 各ページは必ず相互言語リンクを持つ
* 1ページ内動的言語切替は主方式にしない

---

## 6. ディレクトリ構成

```txt
/tools/
  /motion-atlas/
    index.html
    motions/
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
      motions/
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

Motion Atlas は**PC寄りツール**として扱う。
理由は、一覧・デモ比較・用途別絞り込み・詳細パネル・比較トレイ・コード/プロンプト導線を同時に持つためである。共通仕様のPC寄りツール基準に従い、**`max-width: 960〜1200px`** を採用し、**600px固定は禁止**とする。スマホでは**1カラム化・横スクロールラッパー・ボタン縦並び**を必須とする。   

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
* 演出サイトではなく辞典・選定ツールとして見せる

---

## 8. デザイン方針

### 8-1. トーン

* practical
* clean
* motion-first
* comparison-friendly
* slightly futuristic but restrained
* tool-first

### 8-2. ビジュアルルール

* 白背景ベース
* ダークモードは初期対象外
* 強さタグ、軽さタグ、モバイル向きタグ、a11yタグを明確に表示
* デモ背景は切替可能にしてもよい
* デモが主役だが、派手な演出サイトにはしない
* 比較と検索のしやすさを優先する

### 8-3. UIの優先順位

1. 目的から選びやすいこと
2. デモ比較しやすいこと
3. 軽さ / 強さ / a11yが一目で分かること
4. AI依頼文と実装導線が分かりやすいこと
5. 回遊しやすいこと

---

## 9. 料金設計

旧仕様では、無料で**全項目閲覧・検索・カテゴリ絞り込み・簡易デモ再生・基本AI依頼文コピー・一部CSS例・1対1比較**を開放し、Proで**複数比較・詳細調整・複数コード出力・reduce motion代替案・保存**などを解放する設計でした。 

### 9-1. 無料プラン

* All motion items viewable
* Search
* Category filtering
* Detail view
* Basic demo playback
* Basic AI prompt copy
* Limited basic CSS example view
* 1:1 comparison
* Favorites up to 5
* No saved sets
* Limited parameter adjustment

### 9-2. 有料プラン

**名称:** Motion Atlas Pro

### 9-3. 価格

* Monthly: USD 5
* Yearly: USD 39

日本語版では参考として

* 月額 480円相当
* 年額 3,980円相当
  を併記してよいが、主課金表記は英語版基準でUSDとする。

### 9-4. Proで解放するもの

* Multi-motion comparison
* Detailed tuning for speed / distance / delay / easing
* More AI prompt variants by use case
* Multiple output formats for CSS / JS / Tailwind
* Reduced-motion alternatives
* Unlimited favorites / history / saved sets
* Saved compare sets
* Advanced purpose-based filtering
* Related motion suggestions
* Full implementation pitfalls
* Future composite motion builder

### 9-5. 収益の考え方

この製品は知識課金ではなく、

* selection speed
* comparison clarity
* prompt reuse
* implementation reuse
* fewer motion mistakes
  に課金する。

---

## 10. 情報設計

旧仕様では**最低180項目**、カテゴリは**テキスト導入 / 強調 / 連続 / カード導入 / ホバー / CTA / UI遷移 / ローディング / スクロール連動 / ナビ補助 / 軽量 / a11y配慮**の12群でした。 

### 10-1. 最上位カテゴリ

1. Text entrance motions
2. Text emphasis motions
3. Continuous text motions
4. Card / content entrance motions
5. Hover / feedback motions
6. Button / CTA motions
7. Modal / sheet / UI transition motions
8. Loading / state motions
9. Scroll-linked motions
10. Navigation support motions
11. Lightweight motion picks
12. Accessibility-conscious motion picks

### 10-2. 初期収録数

**最低180項目**

### 10-3. 英語版での主な収録例

#### Text entrance

* Fade in
* Fade up
* Fade down
* Fade left
* Fade right
* Blur in
* Soft reveal
* Mask reveal
* Clip reveal
* Tracking reveal
* Luxury rise
* Typewriter
* Character stagger
* Word stagger
* Decode text
* Scramble text

#### Text emphasis

* Pulse headline
* Glow highlight
* Underline reveal
* Accent sweep
* Gradient shift text
* Focus flash
* Counter pop
* Emphasis bounce

#### Card / content entrance

* Card fade up
* Card stagger grid
* Section slide in
* Masonry reveal
* Split panel reveal
* Skeleton settle
* Feature block lift

#### Hover / feedback

* Hover lift
* Hover scale
* Hover shadow deepen
* Hover border glow
* Hover icon nudge
* Hover underline sweep
* Hover tilt light
* Press feedback

#### Button / CTA

* CTA pulse
* CTA subtle glow
* CTA arrow nudge
* CTA fill sweep
* CTA ripple
* Sticky CTA reveal
* Success morph

#### UI transition

* Modal scale in
* Modal fade in
* Bottom sheet rise
* Drawer slide in
* Accordion expand ease
* Tab underline travel
* Toast slide in
* Tooltip soft appear

#### Loading / states

* Spinner minimal
* Dots bounce
* Progress shimmer
* Skeleton shimmer
* Status flash
* Success check draw
* Error shake subtle
* Retry pulse

#### Scroll-linked

* Scroll fade up
* Section reveal
* Sticky title reveal
* Parallax text
* Marquee
* Loop ticker
* Scroll mask wipe
* Section progress highlight

### 10-4. 日本語版での見せ方

* 英語名称を主として必ず併記する
* 日本語だけで完結させず、業界標準の英語名を隠さない
* 日本語版でも検索キーとして英語名を拾えるようにする

---

## 11. データ構造

旧仕様では `name_ja / name_en`、再生情報、利用判断、比較情報、AI依頼補助、実装補助、SEO補助を持つ前提でした。  

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

### 11-2. 見た目 / 再生情報

* `demo_type`
* `demo_target_type`
* `preview_component`
* `default_duration_ms`
* `default_delay_ms`
* `default_distance_px`
* `default_scale_value`
* `default_easing`
* `looping`
* `trigger_type`

### 11-3. 利用判断

* `best_for_en`
* `best_for_ja`
* `not_for_en`
* `not_for_ja`
* `common_contexts_en`
* `common_contexts_ja`
* `motion_intensity`
* `attention_strength`
* `device_fit`
* `mobile_fit`
* `performance_cost`
* `accessibility_risk`

### 11-4. 比較情報

* `similar_motions`
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
* `ai_prompt_landing_page_en`
* `ai_prompt_landing_page_ja`
* `ai_prompt_ui_component_en`
* `ai_prompt_ui_component_ja`
* `ai_prompt_mobile_en`
* `ai_prompt_mobile_ja`
* `ai_prompt_reduce_motion_en`
* `ai_prompt_reduce_motion_ja`
* `bad_prompt_examples_en`
* `bad_prompt_examples_ja`
* `prompt_keywords_en`
* `prompt_keywords_ja`

### 11-6. 実装補助

* `implementation_keywords`
* `css_properties_used`
* `js_required_level`
* `scroll_dependency`
* `repaint_risk`
* `gpu_friendly_score`
* `reduced_motion_alternative_en`
* `reduced_motion_alternative_ja`
* `trigger_notes_en`
* `trigger_notes_ja`
* `state_requirements_en`
* `state_requirements_ja`

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

## 12. 各アニメーションページ構成

### 12-1. ページ上部

* motion name
* Japanese label
* aliases
* category
* intensity tag
* lightweight tag
* mobile-fit tag
* a11y tag

### 12-2. One-line summary

短く明快に、どういう場面向けの動きかを示す。

### 12-3. Main demo

* 静止画ではなく必ず動く
* 演出を盛るのではなく、動きの本質が瞬時に分かることを優先
* 可能なら replay / pause / speed toggle を持つ

### 12-4. Best for

短文3〜5行で示す。
旧仕様でも「ヒーロー見出しに控えめな存在感」「LPの最初の印象を少し高めたい時」など、具体場面で示す方針でした。 

### 12-5. Not for

必須。
例:

* long-form body text
* too many repeated elements on the same screen
* frequently rerendered areas
* strong accessibility-sensitive UI

### 12-6. Similar motion comparison

表で見せる。
例:

* Fade up vs Slide up vs Mask reveal
* Hover lift vs Hover scale
* CTA pulse vs CTA glow

### 12-7. AI-ready prompts

* Basic
* Landing page
* UI component
* Mobile
* Reduced motion

### 12-8. Implementation notes

* main properties used
* transform-based or not
* opacity-based or not
* layout shift risk
* loop suitability
* hover suitability
* scroll performance cautions
* safe duration range

### 12-9. Common mistakes

* 本文全体をタイプライターにする
* CTAに常時強いパルスを付ける
* スマホで長距離スライドを多用する
* 重要通知を派手なバウンスで見せる
  こうした誤用防止は、旧仕様でも必須の観点でした。 

### 12-10. Related motions

* close alternatives
* quieter alternatives
* stronger alternatives
* a11y-safer alternatives

---

## 13. 一覧ページ仕様

### 13-1. 目的

一覧ページは、動きを眺める場所ではなく、

* 探す
* 比較候補を見つける
* 目的に合う候補を絞る
  ための画面である。

### 13-2. 表示形式

* Grid view
* List view
* Compare-ready compact table
  これは旧仕様の3表示形式を継承する。 

### 13-3. カードに載せる情報

* motion name
* Japanese label
* small loop demo
* one-line summary
* category
* intensity
* lightweight level
* main purpose
* mobile fit
* Pro depth badge

### 13-4. カード操作

* hover/tap to preview
* open detail
* add to compare
* add to favorites
* copy basic AI prompt
* copy basic code example
  旧仕様でも、再生・詳細・比較・お気に入り・基本プロンプト・基本コードコピーが主なカード操作でした。 

---

## 14. 検索仕様

旧仕様では、正式名称ではなく**見た目や目的の言い方**でも引けることが重要でした。 

### 14-1. 検索対象

* `name_en`
* `name_ja`
* aliases
* one-line summary
* use cases
* vibe / impression words
* misuse wording
* AI prompt keywords
* target UI type
* motion characteristics

### 14-2. 検索で拾うべき英語例

* letters appear one by one
* soft rise from below
* subtle CTA motion
* luxury text reveal
* quiet hover animation
* loading motion
* card floats slightly
* reveal on scroll
* not too flashy
* reduced motion friendly

### 14-3. 検索で拾うべき日本語例

* 文字が1文字ずつ出る
* 下からふわっと
* キラッとする
* 押したくなるボタン
* 控えめな動き
* 高級感のある文字アニメ
* ローディング
* カードが少し浮く
* スクロールで出る
* うるさくないCTA
  これらは旧仕様でも代表例として定義されていました。 

### 14-4. 検索順位

1. exact official name
2. alias match
3. use-case match
4. vibe/impression wording match
5. related motion match

### 14-5. サジェスト

英語版例:

* “subtle”

  * Fade up
  * Soft reveal
  * Underline reveal
  * Hover lift
  * Bottom sheet rise

* “flashy”

  * Glitch
  * Bounce in
  * Neon flicker
  * Ripple CTA
  * Electric flicker

日本語版でも同等候補を返す。

### 14-6. ゼロ件時

* close matches
* popular categories
* browse by use case
* lightweight picks
* beginner-friendly picks

---

## 15. 絞り込み仕様

### 15-1. 軸

* Category
* Purpose
* Intensity
* Lightweight level
* Mobile fit
* Accessibility-conscious
* Loop / hover / scroll / load / click trigger
* Implementation difficulty
* Target UI type

### 15-2. 目的軸

* Make headings more memorable
* Make CTA stand out
* Add response to cards
* Improve loading feel
* Smooth section transitions
* Reveal on scroll
* Improve form feedback
* Make success/error states clearer

### 15-3. 強さ

* Subtle
* Medium
* Strong
* Dramatic

### 15-4. 軽さ

* Lightweight
* Medium
* Heavy

### 15-5. 実装難易度

* Low
* Medium
* High

---

## 16. 比較機能仕様

### 16-1. 比較対象数

* Free: 2 motions
* Pro: 3〜4 motions

### 16-2. 比較項目

* main purpose
* intensity
* visual loudness
* lightweight level
* mobile fit
* a11y friendliness
* implementation difficulty
* best use cases
* bad use cases
* AI-promptability
* misuse risk
* quieter / louder alternatives

### 16-3. 比較画面挙動

* add / remove
* reorder
* play all under same conditions
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

* viewed motions
* compared motions
* copied prompts
* copied code
* tuned parameter history

### 17-3. 目的

“前に見たちょうどいい動き” を再発見できるようにする。

---

## 18. AI依頼文仕様

旧仕様では **基本 / 詳細 / LP / UIコンポーネント / モバイル / reduce motion / リファクタ** を想定し、悪い依頼文から具体条件付き依頼文へ変換する方針でした。 

### 18-1. 種類

* Basic
* Detailed
* Landing page
* UI component
* Mobile
* Reduced motion
* Refactor

### 18-2. 悪い依頼例

英語版例:

* “add some animation”
* “make it flashy”
* “make it stand out”
* “make the button feel alive”
* “add cool motion”

日本語版例:

* なんか動きを付けて
* 派手にして
* 目立つ感じで
* ボタンをいい感じに動かして

### 18-3. 良い依頼例の方針

* target element
* trigger condition
* intensity
* duration
* distance
* mobile caution
* reduced-motion fallback
  まで含める。

---

## 19. デモ再生・コード出力仕様

旧仕様では、**再生 / 一時停止 / リプレイ / 速度変更 / ループ切替 / 背景切替 / テキスト/ボタン/カード対象切替**、および**CSS / JS / Tailwind / Framer Motion / WAAPI への入口**が想定されていました。 

### 19-1. デモ再生

* play
* pause
* replay
* speed change
* loop on/off
* background switch
* target preview switch

### 19-2. パラメータ調整

* duration
* delay
* distance
* scale
* easing
* stagger amount
* blur amount
* starting opacity

無料は一部固定、Proで詳細調整可能。

### 19-3. コード出力

* Basic CSS direction
* Basic JS direction
* Tailwind-oriented notes
* Framer Motion notes
* Web Animations API notes

コード全文生成が主役ではなく、**実装に入る前の入口**として機能させる。

### 19-4. Reduced motion preview

* デモ自体を reduced motion 版で確認できる
* 強い動きの代替案をその場で見比べられる

---

## 20. 実装メモ仕様

### 20-1. 含める内容

* transform-based or not
* opacity-based or not
* layout shift risk
* repaint risk
* loop annoyance risk
* good for hover / load / scroll / click
* bad for long text or dense UI
* mobile motion sickness risk
* reduced motion alternative
* safe duration range
* easing compatibility
* cautions when many elements animate together

### 20-2. 深さ

コード実装を丸ごと教えるのではなく、
**何が軽くて、何が危険で、何がズレやすいか**
が分かる深さを持たせる。

---

## 21. レスポンシブ仕様

### 21-1. モバイル

* 1〜2列一覧
* 詳細は全画面シート
* 比較は横スクロール表
* デモはスマホ幅に応じて縮小
* フィルタはボトムシート
* 自動再生は控えめにし、負荷を下げる

### 21-2. タブレット

* 左一覧 + 右詳細 可
* 比較表の視認性を高める

### 21-3. デスクトップ

* 左フィルタ
* 中央一覧
* 右詳細またはモーダル詳細
* 同時比較の視認性を最大化する

---

## 22. アクセシビリティ仕様

### 22-1. 必須

* keyboard reachable
* visible focus
* autoplay controllable
* reduced motion respected
* no color-only distinction
* semantic compare tables
* descriptive demo text

### 22-2. モーション配慮

* 過剰なループを避ける
* 強い点滅やフラッシュに警告を付ける
* 移動量の大きい動きに注意ラベルを付ける
* reduced motion 代替を必ず持つ

### 22-3. Reduced motion 方針

* OS設定を尊重
* 自前トグルも用意する
* 各モーションに代替案を持つ
* ループ演出は控えめにする

---

## 23. SEO仕様

### 23-1. 主対象ページ

英語版:

* top
* motion detail pages
* compare pages
* use-case collections
* problem pages

日本語版:

* 同構造で維持するが、英語版を主軸にする

### 23-2. 英語版タイトル例

* What is Fade Up? Best use cases, AI prompts, and motion cautions
* What is Typewriter Animation? Where it works and where it fails
* CTA Pulse vs CTA Glow: which button motion should you use?

### 23-3. 日本語版タイトル例

* Fade Upとは？使いどころ・控えめな導入アニメーションの実例と依頼文
* Typewriter Animationとは？向いている場面・向いていない場面・実装注意点
* CTA Pulseとは？ボタンを目立たせる動きの使い方とやりすぎ防止

### 23-4. 狙う検索意図

英語主軸:

* [motion] animation
* [motion] UI
* [motion] CSS
* [motion] example
* subtle animation for heading
* CTA button motion
* loading animation pattern
* reduced motion alternative

日本語補助:

* 〇〇 アニメーション
* 〇〇 動き
* 〇〇 使い方
* 控えめ アニメーション
* ボタン 目立たせる 動き
* テキストアニメーション 一覧

### 23-5. 構造化

* FAQ schema
* Breadcrumb schema
* Article / TechArticle
* compare pages with structured comparison blocks
* hreflang pairing between EN and JA

---

## 24. SNS共有仕様

### 24-1. 英語版OGP

* motion name
* core use case
* intensity / lightweight summary
* simple visual demo still

### 24-2. 日本語版OGP

* 日本語タイトル
* 英語名称併記可
* 用途と注意点がひと目で分かる構図

### 24-3. 比較ページOGP

* “Fade Up vs Slide Up”
* “Typewriter vs Character Stagger”
* 差分が見える構図

---

## 25. 導線仕様

### 25-1. トップからの主導線

* Search by motion name
* Browse by purpose
* Solve a motion problem
* Compare similar motions
* Show lightweight motions only
* Show accessibility-conscious motions only

### 25-2. 問題導線例

* I want subtle emphasis
* I need CTA motion without annoyance
* I want a luxury-feeling text entrance
* I need a hover reaction
* I want scroll reveal without heaviness
* I need better loading feedback
* I want motion that feels premium, not loud

日本語版でも同等の悩み導線を持つ。

### 25-3. 回遊導線

* close alternatives
* quieter alternatives
* stronger alternatives
* same-purpose alternatives
* accessibility-safer alternatives

---

## 26. 管理画面・運営仕様

### 26-1. 管理機能

* add motion item
* draft
* schedule publish
* set comparison relations
* edit search mappings
* SEO input
* OGP generation
* code template editing
* update log

### 26-2. 編集必須項目

* English short summary
* English long summary
* Japanese short summary
* Japanese long summary
* best for
* not for
* intensity
* lightweight level
* mobile fit
* at least 2 prompt variants
* implementation notes
* at least 5 search aliases in English
* at least 3 search aliases in Japanese
* reduced-motion alternative

### 26-3. 更新優先順位

1. 英語版正本更新
2. 日本語版追従
3. OGP / SEO / internal links 更新

---

## 27. 品質基準

### 27-1. 項目品質

* motion difference is clear
* use case is explicit
* non-recommended use exists
* AI prompts are usable
* implementation notes are not shallow
* mobile perspective exists
* a11y cautions exist
* similar motions are clearly distinguished

### 27-2. サイト品質

* demos are lightweight
* search is fast
* purpose-based filtering is useful
* comparison is clear
* free tier is useful
* Pro reason is obvious
* autoplay is not annoying
* mobile experience is not heavy
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
  共通仕様では寄付導線は広告近接を避けた独立セクションとする前提です。 
* 横断ナビは原則置かない
* GA4 / Cloudflare analytics を維持
* `usage` は共通の構成を守る
  共通仕様では `usage` は Purpose / How to Use / Supported / Unsupported / Error Types / Output Format / FAQ / Disclaimer / Return to Tool の順を標準とします。 

### 28-3. 禁止

* 600px固定
* PC幅の不必要な縮小
* 1ページ内動的言語切替を主方式にすること
* 日本語版のみ更新して英語版を止めること
* 各ツール内にロゴ複製を置くこと
* デモを重い動画依存にすること

---

## 29. 必須ページ

### 英語版

* top
* motions list
* motion detail
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
* watch demos
* search
* basic compare
* copy short prompts
* read basic implementation direction

### 有料

* deep compare
* save
* reuse
* tune parameters
* access more prompt variants
* access reduced-motion alternatives in depth
* access deeper implementation notes
* export / print compare sets

---

## 31. 初期目玉比較

旧仕様でも、次のような比較テーマが主軸でした。 

* Fade Up vs Slide Up
* Typewriter vs Character Stagger vs Word Stagger
* Hover Lift vs Hover Scale vs Hover Shadow Deepen
* CTA Pulse vs CTA Glow vs Arrow Nudge
* Modal Scale In vs Modal Fade In
* Bottom Sheet Rise vs Drawer Slide In
* Skeleton Shimmer vs Spinner Minimal
* Underline Reveal vs Accent Sweep
* Scroll Reveal vs Parallax Text
* Soft Reveal vs Mask Reveal vs Clip Reveal

---

## 32. 失敗条件

* 日本語版の方が厚い
* 英語SEOが弱い
* ただの見本集で終わる
* 用途が薄い
* 非推奨用途がない
* AI依頼文が弱い
* 比較が浅い
* 検索が正式名称依存
* デモが重い
* モバイルで不快
* a11y配慮が薄い
* Pro理由が弱い
* 更新が止まる

---

## 33. この製品で金を取れる理由

この製品が売るものは、アニメーション知識そのものではない。

売るのは、

* motion selection time
* comparison time
* prompt rewriting time
* trial-and-error cost
* repeated lookup cost
* implementation hesitation
* motion mistake cost

の削減である。

つまりこの製品は、
**animation gallery ではなく motion decision tool**
として成立させる。

---

これで、**Motion Atlas の英語メイン改訂版**です。
これで3本とも、**英語メイン・日本語補助・root=EN / ja=JP** の方針で揃いました。
