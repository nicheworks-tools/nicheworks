# Pattern Atlas / 世界の模様辞典 v0.1 正仕様書

作成日：2026-05-25  
対象：NicheWorks 内の大型辞典型ツール  
配置予定：`/tools/pattern-atlas/`  
状態：実装前仕様  
方針：MVP公開を優先し、将来の数百〜数千件化・Pro化・アニメーション出力へ拡張可能な構造で作る。

---

## 0. この仕様書の目的

この仕様書は、NicheWorks 内で新規作成する **Pattern Atlas / 世界の模様辞典** の正仕様である。

対象は、世界中の模様・文様・パターンを、単なる画像素材ではなく、以下を一体化したツールとして扱う。

```txt
文様辞典
+
ビジュアルカタログ
+
色編集ツール
+
素材書き出しツール
+
文化的注意ガイド
```

本仕様書は、実装者 / Codex / 将来の自分が迷わないように、MVP範囲・UI方針・技術構成・データ構造・出力仕様・将来拡張をまとめる。

---

## 1. プロダクト定義

### 1.1 仮名称

英語名：

```txt
Pattern Atlas
```

日本語名：

```txt
世界の模様辞典
```

または、

```txt
Pattern Atlas｜世界の模様辞典
```

### 1.2 一文説明

```txt
世界の伝統文様・民族文様・地域模様を、意味・地域・用途から探し、色を変えて、SVG / PNG / CSS 素材として書き出せる辞典ツール。
```

### 1.3 何を作るか

Pattern Atlas は、以下を提供する。

- 模様・文様を検索できる辞典
- 各模様の意味・由来・地域・文化圏・用途を読める詳細情報
- 各模様をビジュアルで確認できるプレビュー
- 色を変更できるカラーパレット編集
- タイル表示や使用イメージを確認できるプレビュー
- SVG / PNG / CSS として素材を書き出せる機能
- 伝統・宗教・民族・儀礼文様に対する文化的注意表示
- 将来的な高解像度出力・一括出力・アニメーション出力・Pro化への拡張余地

### 1.4 何ではないか

Pattern Atlas は、以下を目的にしない。

- ただの画像素材サイト
- ただのSVGパターン生成サイト
- ただの日本文様辞典
- 博物館DBの転載サイト
- AI画像生成サイト
- 文化的・歴史的に正確な復元素材の公式配布サイト
- 先住民・宗教・儀礼文様を雑に商用素材化するサイト
- 初期段階から数千件を収録する巨大DB
- 初期段階からMP4/GIF/Lottieを出力する動画生成ツール

---

## 2. 勝ち筋と差別化

### 2.1 既存競合の分類

既存競合は大きく以下に分かれる。

| 種別 | 例 | 強み | 弱点 |
|---|---|---|---|
| 研究アーカイブ | 大学・博物館系DB | 資料性が強い | 一般ユーザーが使いにくい |
| 商用文様DB | 文様素材ライセンス系 | 素材品質・数が強い | 有料・B2B寄り |
| パターン生成ツール | SVG背景生成サイト等 | 色変更・出力が強い | 意味・文化的背景が薄い |
| 博物館Open Access | Met / Smithsonian 等 | 元資料が膨大 | 文様単位で整理されていない |
| 汎用デザインツール | Canva等 | UX・テンプレが強い | 文様の意味や文化的注意は主軸ではない |

### 2.2 Pattern Atlas の勝ち筋

勝ち筋は以下。

```txt
既存の辞典より使える。
既存の素材サイトより意味が分かる。
既存の生成ツールより文化的に安全。
```

Pattern Atlas は、単に模様を並べるのではなく、

1. 模様を調べる
2. 意味・背景を理解する
3. 色を変える
4. 用途に合わせてプレビューする
5. 素材として書き出す
6. 文化的に雑な使い方を避ける

という流れを1つのページ群で実現する。

### 2.3 やってはいけない方向

以下の方向は競合に埋もれる。

- 素材数だけで勝とうとする
- ただの模様ジェネレーターにする
- ただの和柄一覧にする
- 画像を大量に並べるだけにする
- 文化的注意を軽視する
- 最初から動画出力を主役にする
- 最初からProロックを前面に出す
- 無料版を使えないものにする

---

## 3. NicheWorks 内での位置づけ

### 3.1 配置

基本配置：

```txt
/tools/pattern-atlas/
```

必要に応じて将来：

```txt
/tools/pattern-atlas/usage.html
/tools/pattern-atlas/usage-en.html
```

日本語URL分離を採る場合の候補：

```txt
/tools/pattern-atlas/
/tools/pattern-atlas/ja/
```

ただし、NicheWorks共通仕様に合わせるなら、MVPでは **同一HTML内のJP/EN切替**を優先候補にする。

### 3.2 NicheWorks内での分類

```txt
NicheWorks
└ Tools
  └ Creative / Design
    └ Pattern Atlas
```

または、

```txt
NicheWorks
└ Atlas Series
  ├ UI Atlas
  ├ Motion Atlas
  ├ Vibe Lexicon
  ├ AI Interaction Atlas
  └ Pattern Atlas
```

### 3.3 ツール種別

Pattern Atlas は小型ツールではない。  
扱いは **大型Atlas系辞典ツール**。

ただし、UIはUI Atlas風にはしない。  
NicheWorks母艦寄りの控えめなデザインにする。

---

## 4. UI / デザイン方針

### 4.1 最重要決定

```txt
UI Atlas などで使っている PC時3カラム構成は採用しない。
```

Pattern Atlas では、以下の3カラム型を禁止する。

```txt
左：検索 / フィルタ
中央：一覧
右：詳細 / 編集
```

理由：

- 見た目が「AIが作った辞典UI」になりやすい
- 情報密度が高すぎて、模様の美しさと辞典性が埋もれる
- スマホ変形が複雑になる
- NicheWorks母艦との視覚的一貫性が崩れる

### 4.2 採用するデザイン

Pattern Atlas は、NicheWorks母艦のトーンを基準にする。

採用する見た目：

```txt
白背景
黒〜グレーの文字
控えめな罫線
控えめな余白
読みやすい本文
薄いグレー背景
過剰でないカード
弱い角丸
影は使ってもかなり薄く
ボタンは標準的
フォームは実用重視
```

### 4.3 禁止する見た目

```txt
UI Atlas風の3カラム
派手なグラデーション
過剰なカード装飾
強いドロップシャドウ
AI生成UIっぽい謎の丸み
過剰な色数
LP風の巨大ヒーロー
意味の薄い装飾アイコン
動きすぎるアニメーション
背景に模様を敷きすぎる
```

### 4.4 PC版の基本画面構成

PCでは広幅を使うが、常時3カラムにはしない。

一覧画面：

```txt
[Header]
Pattern Atlas
世界の模様を、意味から探して、色を変えて、素材として使う

[ad-top]

[簡易説明]
[検索バー]
[フィルタ行]
  地域 / 文化圏 / 分類 / 用途 / 注意タグ / リセット

[模様カードグリッド]
  3〜4列程度。画面幅に応じて自動調整。

[FAQ]
[内部リンク]
[寄付]
[footer]
```

詳細 / 編集画面：

```txt
[戻る]

[大きい模様プレビュー]

[模様名]
[地域・文化圏・分類・用途・注意タグ]

[意味・由来・使用例・文化的注意]

[色編集]
[タイルプレビュー]
[用途別プレビュー]
[出力設定]
[ダウンロード]
```

PCで横幅がある場合のみ、詳細画面内で **最大2カラム** を許可する。

例：

```txt
左：大きなプレビュー
右：基本情報 / 色編集
下：出力設定
```

ただし、一覧・詳細・編集・出力を同時に3カラムで押し込まない。

### 4.5 スマホ版の基本構成

スマホは縦積み。

```txt
[Header]
[ad-top]
[簡易説明]
[検索]
[フィルタ折りたたみ]
[カード一覧]
[詳細]
[色編集]
[プレビュー]
[出力]
[FAQ]
[寄付]
[footer]
```

480px以下では以下を必須とする。

- ボタン群は縦並び
- 複数カラムは禁止
- フィルタは折りたたみ可能
- 出力形式ボタンは1列または2列
- プレビューは画面幅に収める
- 横スクロールを放置しない
- タップ領域を小さくしすぎない

### 4.6 主要画面

MVPで必要な画面 / セクションは以下。

1. トップ / 一覧
2. フィルタ
3. 模様カード
4. 詳細
5. 色編集
6. タイルプレビュー
7. 用途別プレビュー
8. 出力
9. 文化的注意
10. FAQ / usage導線

---

## 5. MVP範囲

### 5.1 MVPの目的

MVPでは、巨大DBではなく、以下の体験が成立するかを検証する。

```txt
模様を探す
↓
意味を読む
↓
色を変える
↓
プレビューする
↓
SVG / PNG / CSS として書き出す
```

### 5.2 MVP収録件数

MVPでは **50〜80件** を目標にする。

初期検証は30件でもよいが、公開候補では50〜80件を目指す。

### 5.3 MVPの地域バランス

MVPでは「世界横断の雰囲気」が分かるように、浅く広く入れる。

候補：

- 日本文様
- アイヌ文様
- 琉球 / 紅型系
- 中国文様
- 韓国文様
- インド文様
- インドネシア / バティック / イカット
- イスラム幾何学 / アラベスク
- ペルシャ / 中央アジア
- ケルト文様
- ギリシャ / 欧州装飾
- 北欧 / バルト系
- アフリカ織物系
- 中南米 / アンデス系
- オセアニア系
- 汎用幾何パターン

### 5.4 MVP必須機能

MVPで必須の機能：

```txt
一覧
検索
フィルタ
詳細表示
SVGプレビュー
タイルプレビュー
色編集
パレットプリセット
SVG出力
PNG出力
CSS出力
解像度選択
タイル数選択
文化的注意表示
出力前注意
日英対応
usage / FAQ
SEO基本設定
```

### 5.5 MVPではやらない機能

MVPでやらない機能：

```txt
数千件化
ログイン
ユーザー投稿
サーバー保存
AI画像生成
サーバー側画像生成
MP4出力
GIF出力
Lottie出力
本格商用ライセンス販売
博物館API連携
ユーザー間共有
クラウド保存
```

---

## 6. 無料版 / Pro版の設計

### 6.1 無料版の思想

無料版は、実際に使える必要がある。

無料版でユーザーができること：

```txt
読む
探す
色を変える
プレビューする
低〜中解像度で出す
SVG / PNG / CSS を使う
```

無料版が弱いと拡散しない。

### 6.2 無料版機能

| 機能 | 無料版 |
|---|---|
| 模様一覧 | 可能 |
| 詳細辞典 | 可能 |
| 地域検索 | 可能 |
| 文化的注意 | 可能 |
| 色編集 | 基本 |
| パレット | 基本プリセット |
| SVG出力 | 可能 |
| PNG出力 | 512 / 1024程度 |
| CSS出力 | 可能 |
| タイル数 | 1 / 2×2 |
| 用途別プレビュー | 基本 |
| AI依頼文コピー | 基本 |
| お気に入り | localStorageで簡易対応可 |

### 6.3 Pro版の思想

Pro版は、無料版の機能を奪うのではなく、制作効率・品質・大量出力を強化する。

Pro版でユーザーができること：

```txt
高解像度で出す
大量に出す
高度に編集する
用途別に最適化する
アニメーション化する
保存・比較・一括管理する
```

### 6.4 Pro版候補機能

| 機能 | Pro版 |
|---|---|
| 高解像度PNG | 2048 / 4096 / 8K |
| カスタム解像度 | 可能 |
| WebP / JPG quality指定 | 可能 |
| PDF / EPS | 後期 |
| 一括ZIP出力 | 可能 |
| 複数パレット一括出力 | 可能 |
| ブランドカラー保存 | 可能 |
| 地域別・伝統色パレット | 可能 |
| 3件以上比較 | 可能 |
| 用途別プリセット | 本格対応 |
| Animated SVG | 候補 |
| CSS animation | 候補 |
| GIF / WebM / MP4 | 後期・実験扱い |
| JSON設定保存 | 本格対応 |
| コレクション管理 | localStorage中心、将来拡張 |

### 6.5 Pro化の注意

MVPでは課金ロックを実装しない。  
ただし、将来Proを差し込めるように、機能フラグを想定しておく。

例：

```js
const FEATURE_LIMITS = {
  free: {
    maxPngSize: 1024,
    maxTileRepeat: 2,
    batchExport: false,
    animationExport: false
  },
  pro: {
    maxPngSize: 8192,
    maxTileRepeat: 16,
    batchExport: true,
    animationExport: true
  }
};
```

---

## 7. 技術構成

### 7.1 基本方針

NicheWorks内ツールとして、MVPでは以下を採用する。

```txt
HTML
CSS
Vanilla JavaScript
ES Modules
JSON / JS data files
SVG renderer
Canvas export
localStorage
Blob download
Clipboard API
Cloudflare Pages
GitHub
```

### 7.2 採用しないもの

MVPでは以下を採用しない。

```txt
React
Vue
Svelte
Next.js
Astro
外部CDNライブラリ
外部API
サーバーサイド生成
DB
ログイン
ユーザーアップロード保存
AI画像生成API
```

理由：

- NicheWorks共通仕様との整合
- 静的サイトとして無料運用しやすい
- Codex修正時に壊れにくい
- 初期実装を軽く保てる
- ユーザーデータを外部送信しない方針に合う

### 7.3 将来の技術拡張余地

将来、独立プロダクト化する場合は以下を検討できる。

```txt
Astro
SvelteKit
Next.js
SQLite / D1 / Supabase
検索インデックス生成
ユーザー保存
Pro認証
Figma plugin
Canva連携
API提供
```

ただし、MVPでは採用しない。

---

## 8. 推奨ディレクトリ構成

MVPの候補構成：

```txt
/tools/pattern-atlas/
  index.html
  usage.html
  app.js
  styles.css

  data/
    patterns.js
    palettes.js
    regions.js
    categories.js
    use-cases.js

  renderers/
    index.js
    geometric.js
    wave.js
    stripe.js
    grid.js
    radial.js
    floral.js
    knot.js

  export/
    svg-export.js
    canvas-export.js
    css-export.js
    json-export.js

  utils/
    i18n.js
    storage.js
    filters.js
    slug.js
    sanitize.js

  checks/
    check-pattern-data.mjs
```

よりNicheWorks既存ツールに合わせてシンプルにする場合：

```txt
/tools/pattern-atlas/
  index.html
  usage.html
  app.js
  styles.css
  patterns.js
```

MVPでは後者でも可。  
ただし、将来の数百件化を考えるなら、最初から `data/` と `renderers/` は分ける方がよい。

---

## 9. データ設計

### 9.1 基本思想

模様は画像ファイルとして大量保存しない。  
保存するのは、以下の3種類。

```txt
辞典データ
描画設定
出力設定
```

### 9.2 PatternEntry

1件の模様データ例：

```js
{
  id: "japanese-seigaiha",
  slug: "seigaiha",
  nameEn: "Seigaiha",
  nameJa: "青海波",
  aliasesEn: ["blue ocean wave", "wave pattern"],
  aliasesJa: ["せいがいは", "波文"],
  regions: ["japan"],
  cultures: ["japanese"],
  traditions: ["traditional-japanese"],
  categories: ["geometric", "wave", "traditional"],
  motifs: ["wave", "water"],
  useCases: ["textile", "web-background", "packaging"],
  materials: ["textile", "ceramic", "paper"],
  summaryEn: "A repeating wave pattern associated with calm seas and good fortune.",
  summaryJa: "穏やかな波や平穏、吉祥を表す日本の伝統文様。",
  meaningEn: "Represents calm waves, continuity, peaceful life, and good fortune.",
  meaningJa: "穏やかな波、永続、平穏な暮らし、吉祥を表す。",
  historyEn: "Commonly used in Japanese decorative arts and textiles.",
  historyJa: "日本の工芸・染織・装飾に広く使われてきた文様。",
  cautionLevel: "low",
  cautionTags: ["traditional"],
  cautionEn: "This is a modern SVG reconstruction inspired by a traditional Japanese pattern.",
  cautionJa: "日本の伝統文様を参考にした現代的なSVG再構成であり、公式な歴史復元素材ではありません。",
  colorSlots: ["background", "primary", "accent"],
  defaultColors: {
    background: "#ffffff",
    primary: "#1f4e79",
    accent: "#8fbcd4"
  },
  tile: {
    width: 240,
    height: 160
  },
  rendererType: "wave-repeat",
  rendererParams: {
    rows: 3,
    strokeWidth: 4,
    arcCount: 4
  },
  relatedIds: ["running-water", "wave-repeat"],
  sourceNotes: [
    "General reference to traditional Japanese seigaiha pattern."
  ],
  exportSafety: {
    allowSvg: true,
    allowPng: true,
    allowCss: true,
    requireWarning: false
  }
}
```

### 9.3 必須項目

MVPで必須の項目：

```txt
id
slug
nameEn
nameJa
regions
cultures
categories
motifs
useCases
summaryEn
summaryJa
meaningEn
meaningJa
cautionLevel
cautionTags
cautionEn
cautionJa
colorSlots
defaultColors
tile
rendererType
rendererParams
relatedIds
sourceNotes
exportSafety
```

### 9.4 cautionLevel

文化的注意レベル：

```txt
low
medium
high
restricted
unknown
```

意味：

| level | 意味 |
|---|---|
| low | 一般装飾として比較的使いやすい |
| medium | 文化的背景説明を推奨 |
| high | 宗教・儀礼・民族性など注意が必要 |
| restricted | 出力制限または強い警告を検討 |
| unknown | 情報不足。商用利用前の追加調査を推奨 |

### 9.5 cautionTags

候補：

```txt
traditional
religious
sacred
ceremonial
indigenous
funerary
royal
tribal
commercial-caution
unknown-origin
modern-reconstruction
```

### 9.6 exportSafety

出力可否と警告制御。

```js
exportSafety: {
  allowSvg: true,
  allowPng: true,
  allowCss: true,
  requireWarning: true,
  blockCommercialLabel: false
}
```

`restricted` なものは、MVPでは出力自体をブロックするより、強い注意を出す。  
ただし将来は出力制限も可能にする。

---

## 10. SVG描画設計

### 10.1 基本方針

完成画像を大量保存しない。

悪い構成：

```txt
pattern-001-red-1024.png
pattern-001-blue-2048.png
pattern-001-green-4096.png
...
```

正しい構成：

```txt
PatternEntry
↓
rendererType
↓
rendererParams
↓
SVG生成
↓
色スロット反映
↓
プレビュー / 出力
```

### 10.2 rendererType

MVPの候補：

```txt
geometric-repeat
wave-repeat
stripe
grid
dot-repeat
diamond-repeat
radial
border
floral-symbol
knot
custom-path
```

### 10.3 renderer API

想定：

```js
function renderPatternSvg(pattern, options) {
  return {
    svg: "<svg ...>...</svg>",
    width: 240,
    height: 160
  };
}
```

options：

```js
{
  colors: {
    background: "#ffffff",
    primary: "#1f4e79",
    accent: "#8fbcd4"
  },
  repeatX: 2,
  repeatY: 2,
  transparent: false,
  scale: 1
}
```

### 10.4 SVG上の注意

- `innerHTML`の乱用は禁止
- 可能な限りSVG文字列生成時に値をサニタイズする
- user input のHEX値は検証する
- 外部画像参照は使わない
- `<script>` を含むSVGは生成しない
- SVG出力時にメタコメントを入れる場合も安全な固定文のみ

---

## 11. 色編集

### 11.1 MVPの色スロット

MVPでは以下を基本にする。

```txt
background
primary
secondary
accent
line
highlight
```

すべての模様が全スロットを使う必要はない。  
各PatternEntryの `colorSlots` に応じてUIを出す。

### 11.2 UI

色編集UI：

```txt
Background [color picker] [HEX]
Primary    [color picker] [HEX]
Accent     [color picker] [HEX]

[初期色に戻す]
[パレットを選ぶ]
```

### 11.3 HEX入力

- `#fff`
- `#ffffff`

を許可。  
不正値は反映しない。

### 11.4 パレットプリセット

MVP候補：

```txt
Default
Monochrome
Muted
Traditional
Dark
Light
Earthy
High contrast
```

将来候補：

```txt
Japanese traditional colors
Islamic tile palette
Indigo textile palette
Earth pigment palette
Festival palette
Brand palette
Custom saved palette
```

---

## 12. プレビュー仕様

### 12.1 基本プレビュー

一覧カードでは軽量なSVGプレビューを表示する。

### 12.2 詳細プレビュー

詳細画面では大型プレビューを表示する。

### 12.3 タイルプレビュー

MVP：

```txt
single
2×2
4×4
```

無料版では `single` と `2×2` を基本にし、`4×4` はMVP時点で無料でも可。  
将来Proでは `8×8` やカスタムを追加。

### 12.4 用途別プレビュー

MVP候補：

```txt
Tile
Website background
Poster
Fabric
Card
```

用途別プレビューは、出力前の確認体験として重要。  
ただし過剰なモック装飾はしない。

---

## 13. 出力仕様

### 13.1 MVP出力形式

MVPで対応する出力：

```txt
SVG
PNG
CSS
```

### 13.2 SVG出力

仕様：

- 現在の色設定を反映
- タイルサイズを反映
- transparent background option
- filename生成
- 安全なメタコメントのみ任意
- `<script>`禁止
- 外部参照禁止

ファイル名例：

```txt
pattern-atlas-seigaiha-1024.svg
pattern-atlas-seigaiha-tile.svg
```

### 13.3 PNG出力

仕様：

- SVGをCanvasへ描画
- `canvas.toBlob()` でPNG化
- 512 / 1024 をMVP対応
- 将来 2048 / 4096 / 8192
- transparent background option
- single / 2×2 tile

ファイル名例：

```txt
pattern-atlas-seigaiha-1024.png
```

### 13.4 CSS出力

仕様：

- SVGをdata URI化
- `background-image` として使えるCSSを生成
- `background-size` を含める
- コピー可能にする
- CSS variables版は将来拡張

例：

```css
.pattern-bg {
  background-image: url("data:image/svg+xml,...");
  background-size: 240px 160px;
  background-repeat: repeat;
}
```

### 13.5 JSON出力

MVP後半またはv0.2候補。

保存対象：

```txt
patternId
colors
tileRepeat
exportFormat
exportSize
previewMode
animationSettings
```

### 13.6 後期出力形式

将来候補：

```txt
WebP
JPG
PDF
EPS
Animated SVG
CSS animation
GIF
WebM
MP4
Lottie JSON
ZIP
```

動画系は端末負荷が高いため、MVPでは対象外。

---

## 14. 文化的注意・安全設計

### 14.1 基本方針

Pattern Atlas は、伝統・民族・宗教・地域文様を扱う。  
そのため、文化的注意は必須機能であり、後付けにしない。

### 14.2 表示位置

文化的注意は以下に表示する。

1. 詳細ページ
2. 出力パネル
3. ダウンロード直前
4. usage / FAQ
5. 必要に応じてカード上のタグ

### 14.3 注意文例

低リスク：

```txt
この文様は伝統文様を参考にした現代的なSVG再構成です。公式・歴史的復元素材ではありません。
```

中リスク：

```txt
この文様は特定の地域・文化圏で使われてきた文様を参考にしています。装飾や商用利用では、背景説明を添えることを推奨します。
```

高リスク：

```txt
この文様は宗教的・儀礼的・民族的文脈を持つ可能性があります。装飾素材としての利用には注意し、商用利用前に追加調査を推奨します。
```

情報不足：

```txt
この文様の由来や使用範囲には未確認の情報があります。商用利用・公的利用では追加調査を行ってください。
```

### 14.4 出力制限

MVPでは基本的に出力ブロックはしない。  
ただし、`restricted` は将来以下を検討する。

- SVG出力のみ制限
- 商用用途注意を強く表示
- AIプロンプトコピーを制限
- 「公式・儀礼用途には使わない」明記
- 詳細ページ閲覧のみ可能にする

---

## 15. AI依頼文コピー

### 15.1 目的

AI画像生成・デザイン依頼・Web制作依頼で、文化的に雑な指示を避けるための補助。

### 15.2 MVP機能

各模様に以下を提供。

- 日本語プロンプト
- 英語プロンプト
- 注意付きプロンプト
- 雑な依頼を避ける書き方

例：

```txt
日本の青海波文様に着想を得た、シームレスな波の幾何学パターンを作成してください。伝統文様を参考にした現代的な装飾として扱い、歴史的に正確な復元とは表現しないでください。
```

英語例：

```txt
Create a seamless geometric wave pattern inspired by traditional Japanese seigaiha. Treat it as a modern decorative reconstruction, not as a historically exact or official cultural artifact.
```

### 15.3 Pro拡張

将来：

- 用途別プロンプト
- Midjourney向け
- Stable Diffusion向け
- SVG生成AI向け
- Web背景向け
- ロゴ用途注意
- 商用利用注意込み

---

## 16. 検索・フィルタ仕様

### 16.1 検索対象

MVPで検索対象にする項目：

```txt
nameEn
nameJa
aliasesEn
aliasesJa
regions
cultures
categories
motifs
useCases
summary
meaning
```

### 16.2 フィルタ

MVPフィルタ：

```txt
地域
文化圏
分類
モチーフ
用途
注意レベル
```

### 16.3 並び替え

MVPでは基本順でよい。  
将来候補：

```txt
名前順
地域順
人気順
最近追加
注意レベル順
素材向き順
```

### 16.4 0件表示

0件時は、次の導線を出す。

```txt
該当する模様がありません。
検索語を減らすか、地域・分類フィルタを解除してください。
```

---

## 17. localStorage仕様

### 17.1 MVPで使う可能性があるもの

```txt
language
favorite pattern ids
recent pattern ids
last selected palette
last export settings
dismissed warnings
```

### 17.2 保存しないもの

```txt
個人情報
アップロード画像
外部送信用データ
ユーザー名
メールアドレス
```

### 17.3 保存説明

UI下部またはFAQで以下を明記する。

```txt
お気に入りや最近見た模様は、このブラウザ内のlocalStorageに保存されます。サーバーには送信されません。
```

---

## 18. SEO / usage / FAQ

### 18.1 SEOタイトル案

```txt
世界の模様辞典｜Pattern Atlas | NicheWorks
```

英語案：

```txt
World Pattern Dictionary｜Pattern Atlas | NicheWorks
```

### 18.2 description案

日本語：

```txt
Pattern Atlasは、世界の伝統文様・民族文様・地域模様を意味や用途から探し、色を編集してSVG・PNG・CSS素材として書き出せる無料ツールです。
```

英語：

```txt
Pattern Atlas is a free visual dictionary for exploring world patterns, editing colors, previewing tiles, and exporting SVG, PNG, and CSS assets.
```

### 18.3 usage.html

MVPで作成推奨。

構成：

```txt
1. このツールでできること
2. 模様の探し方
3. 色編集の使い方
4. SVG / PNG / CSS出力の違い
5. 文化的注意について
6. 商用利用前の注意
7. 保存されるデータ
8. FAQ
9. 戻るリンク
```

### 18.4 FAQ候補

MVPで2〜5件。

候補：

1. 出力した素材は自由に使えますか？
2. このサイトの模様は歴史的に正確な復元ですか？
3. PNGとSVGとCSSの違いは何ですか？
4. 入力や編集内容はサーバーに送られますか？
5. 宗教的・民族的文様は商用利用できますか？

---

## 19. レスポンシブ仕様

### 19.1 ブレイクポイント

```txt
320〜360px：最小幅。崩れ禁止。
375〜414px：主流スマホ幅。
415〜480px：広めスマホ。1カラム。
481〜768px：小型タブレット。2列まで許可。
769px以上：PC。広幅レイアウト。
```

### 19.2 PC

- `.nw-main` は 960〜1200px 程度
- 600px固定は禁止
- 一覧はカードグリッド
- 詳細内では最大2カラムまで許可
- 常時3カラムは禁止

### 19.3 スマホ

- 1カラム
- フィルタ折りたたみ
- ボタン縦並び
- プレビューは幅100%
- 出力設定は縦積み
- 横スクロール放置禁止

---

## 20. アクセシビリティ

MVPで対応する。

- ボタンに明確なラベル
- 色だけで状態を伝えない
- 注意タグはテキスト表示
- 画像プレビューには名前を添える
- reduced motion を考慮
- アニメーション機能は将来でも停止ボタン必須
- キーボード操作で主要ボタンに到達可能
- コントラスト不足を避ける

---

## 21. 実装チェック

### 21.1 データ検証

`check-pattern-data.mjs` で以下を確認。

- 必須項目欠落
- id重複
- slug重複
- relatedIds参照切れ
- rendererType未対応
- colorSlotsとdefaultColorsの不一致
- cautionLevel不正
- exportSafety不正
- sourceNotes空
- nameJa/nameEn欠落

### 21.2 UI確認

- PCで3カラムになっていない
- NicheWorks母艦寄りの見た目
- 480px以下で崩れない
- フィルタが使える
- 詳細が読める
- 色編集が反映される
- 出力前注意が出る

### 21.3 出力確認

- SVGが開ける
- PNGが出る
- CSSがコピーできる
- 透明背景が効く
- 色変更が反映される
- サイズ指定が効く
- 不正なHEX値で壊れない

---

## 22. MVP PR計画

### PR-001：Pattern Atlas初期ページ作成

内容：

- `/tools/pattern-atlas/` 作成
- `index.html`
- `styles.css`
- `app.js`
- 基本レイアウト
- NicheWorks母艦寄りCSS
- ad-top / ad-bottom
- donate
- footer
- SEO基本
- 空の検索UI
- 空のカード一覧
- 空の詳細/編集エリア

合格条件：

- UI Atlas風ではない
- PC 3カラムではない
- NicheWorks内ツールとして見える
- スマホで崩れない

### PR-002：データスキーマと検証

内容：

- `data/patterns.js`
- `data/palettes.js`
- `data/regions.js`
- `checks/check-pattern-data.mjs`
- 必須項目検証

### PR-003：初期文様30件

内容：

- 30件のseed data
- 地域を浅く広く
- 各模様に最低限の辞典情報
- rendererType設定

### PR-004：一覧カードUI

内容：

- カードグリッド
- SVGプレビュー枠
- 名前
- 地域
- 分類
- 注意タグ
- 詳細ボタン
- 編集ボタン

### PR-005：検索・フィルタ

内容：

- キーワード検索
- 地域
- 文化圏
- 分類
- 用途
- 注意タグ
- リセット
- 件数表示
- 0件表示

### PR-006：詳細ビュー

内容：

- 大型プレビュー
- 意味
- 由来
- 使用例
- 類似文様
- 文化的注意
- 編集導線

### PR-007：SVGレンダラー基盤

内容：

- renderer registry
- wave / grid / stripe / geometric など
- 色スロット反映
- fallback

### PR-008：タイル / 用途別プレビュー

内容：

- single
- 2×2
- 4×4
- web background
- poster
- fabric
- card

### PR-009：色編集

内容：

- color picker
- HEX入力
- reset
- 即時反映
- 不正HEX防止

### PR-010：パレットプリセット

内容：

- default
- monochrome
- muted
- traditional
- dark
- light
- earthy
- high contrast

### PR-011：SVG出力

内容：

- 色反映
- transparent background
- filename生成
- Blob download

### PR-012：PNG出力

内容：

- SVG to Canvas
- 512 / 1024
- tile count
- transparent background
- Blob download

### PR-013：CSS出力

内容：

- CSS background生成
- data URI
- copy button
- copy fallback
- サンプルHTML

### PR-014：文化的注意・出力前確認

内容：

- caution UI
- download前表示
- high / unknown の強調
- usageへの導線

### PR-015：AI依頼文コピー

内容：

- 基本プロンプト
- 注意付きプロンプト
- 日本語 / 英語
- copy button

### PR-016：50〜80件化

内容：

- 地域拡張
- カテゴリ拡張
- 全件にプレビュー・注意・sourceNotes

### PR-017：usage / FAQ / SEO補強

内容：

- usage.html
- FAQ
- FAQPage schema
- WebApplication JSON-LD
- canonical
- OGP
- 内部リンク

### PR-018：レスポンシブ最終調整

内容：

- 320〜414px確認
- 480px以下縦積み
- PC広幅維持
- 3カラム禁止確認

### PR-019：MVPリリース候補

内容：

- 全体チェック
- データ検証
- 出力確認
- 文言統一
- sitemap追記用メモ
- 公開前チェックリスト

---

## 23. 将来拡張計画

### v0.2：辞典強化

```txt
100〜300件化
地域別ページ
文化圏別ページ
類似文様比較
お気に入り
最近見た模様
WebP / JPG出力
JSON設定保存
```

### v0.3：制作ツール強化

```txt
高解像度出力
カスタムサイズ
用途別プリセット
ブランドカラーパレット
複数パレット比較
一括出力
ZIP出力
```

### v0.4：アニメーション基盤

```txt
CSS animation preview
Animated SVG export
scroll / rotate / pulse / color shift
reduced motion対応
WebM / GIF実験
```

### v0.5：大型辞典化

```txt
500〜1000件
地域別SEOページ
用語集
出典管理
文化的注意ポリシー強化
比較機能強化
```

### v1.0以降：独立プロダクト化候補

```txt
数千件規模
専用検索DB
Pro認証
ユーザーコレクション
商用ライセンス整理
教育向けページ
API提供
Figma plugin
Canva template連携
VS Code / CSS snippet出力
単独ドメイン化
```

---

## 24. アニメーション将来仕様

### 24.1 MVPでは対象外

MVPではアニメーション出力は行わない。

### 24.2 将来の対応順

1. CSS animation preview
2. CSS animation copy
3. Animated SVG export
4. WebM / GIF 実験
5. MP4 検討
6. Lottie JSON 検討

### 24.3 対応する動き候補

```txt
scroll
rotate
pulse
color shift
wave
fade
scale
kaleidoscope-like
```

### 24.4 注意

- reduced motion対応必須
- pauseボタン必須
- スマホでは重い処理を制限
- 高解像度動画はPro / 後期
- 端末負荷の警告を表示

---

## 25. 独立サイト化の判断基準

NicheWorks内ツールとして開始する。  
ただし、以下に達した場合は単独サイト化を検討する。

```txt
収録数1000件以上
素材出力利用が多い
Pro機能が必要
アニメーション出力が重い
検索DBが必要
ユーザー保存が必要
外部連携が必要
```

単独サイト化後も、NicheWorksには入口ページを残す。

---

## 26. リスクと対策

### 26.1 競合リスク

リスク：

```txt
素材数では勝てない
生成機能だけでは勝てない
```

対策：

```txt
辞典性
文化的注意
意味から探せるUX
AI依頼文
ブラウザ内編集
```

### 26.2 文化的リスク

リスク：

```txt
民族・宗教・神聖文様を雑に扱うと危険
```

対策：

```txt
注意タグ
出力前警告
出典メモ
商用利用前の追加調査推奨
高リスク文様の出力制限検討
```

### 26.3 技術リスク

リスク：

```txt
SVG描画が複雑化
動画出力が重い
数百件で検索が重くなる
```

対策：

```txt
rendererTypeを限定
MVPは静止画のみ
データ検証
検索indexの軽量化
将来は分割読み込み
```

### 26.4 UIリスク

リスク：

```txt
AI生成っぽいUIになる
3カラムでごちゃつく
模様よりUIが目立つ
```

対策：

```txt
NicheWorks母艦寄りCSS
3カラム禁止
白背景
罫線中心
装飾控えめ
1画面1目的
```

---

## 27. 実装禁止事項

実装時に禁止すること。

```txt
UI Atlas風のPC 3カラムにする
React / Vue / Next.js を入れる
外部APIにユーザーデータを送る
AI画像生成を入れる
サーバー側画像生成を前提にする
完成PNGを大量に保存する
文化的注意を省略する
フローティング広告を入れる
NicheWorksロゴをツールごとに複製する
600px固定の小型ツールUIにする
```

---

## 28. MVP完成条件

v0.1公開候補の完成条件。

```txt
50〜80件の模様がある
一覧で模様を探せる
検索・フィルタが動く
詳細で意味・由来・用途・注意が読める
SVGプレビューが出る
色編集ができる
タイルプレビューができる
SVG出力ができる
PNG出力ができる
CSS出力ができる
出力前に文化的注意が出る
スマホで崩れない
PCで3カラムになっていない
NicheWorks母艦寄りの見た目
usage / FAQがある
データ検証が通る
```

---

## 29. 現時点の最終判断

Pattern Atlas は作る価値がある。  
ただし、勝ち筋は「素材数」ではなく、以下である。

```txt
世界の模様を、意味から探して、色を変えて、素材として使う。
```

最初は NicheWorks内の大型Atlas系ツールとして開始する。  
ただし、UIはUI Atlas風ではなく、NicheWorks母艦寄りの控えめな実用UIにする。

MVPでは、

```txt
辞典
検索
詳細
SVGプレビュー
色編集
PNG / SVG / CSS出力
文化的注意
```

までを完成させる。  
動画・数千件・Pro・独立サイト化は将来拡張として設計に残す。
