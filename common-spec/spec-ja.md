
# 🧩 NicheWorks 共通仕様 v3（2026-01 暫定版）

## 0. 対象

- 母艦サイト：`https://nicheworks.pages.dev/`
- NicheWorks 名義の静的ツール（ブラウザ完結系）
  - 解約どこナビ / ManualFinder / TrashNavi / CivicDoc / Contract Cleaner / LogFormatter / Rename Wizard / ほか
- レイアウトが特殊なツール(LogFormatter 等)は「可能な範囲で適用」。

> 原則：**ツールごとに個別のリポジトリは持たず、NicheWorks Suite 1 リポジトリの中で管理する。** :contentReference[oaicite:0]{index=0}

---

## 0.1 NicheWorks Suite のディレクトリ構成（必須）

リポジトリ `nicheworks-tools/nicheworks` は、次の構成を前提とする。

```txt
/
├── index.html, /en/...     # 母艦サイト（ルート直下）
├── nicheworks/             # （将来用・既存ファイル。特別な指示がない限り触らない）
├── tools/                  # 各 Web ツール本体（静的）
│   ├── manual-finder/
│   ├── trashnavi/
│   ├── log-formatter/
│   ├── rename-wizard/
│   └── contract-cleaner/
├── apps/                   # 特殊・非静的ツール（例：Next.jsなど）
│   └── wp-structure-analyzer/ など
├── assets/                 # 共通ロゴ・ファビコン・OGP画像など
│   ├── nicheworks-logo.png
│   ├── favicon.ico
│   ├── nicheworks-favicon-white.ico
│   └── ogp.png など
├── common-spec/            # 本仕様書ほか
│   └── spec-ja.md
└── _archive/               # 旧版 ZIP や退役ツール
````

### 公式アセットとロゴ利用方針

* `assets/nicheworks-logo.png` を暫定公式ロゴとする。
* favicon / OGP / 各種バナー生成時は、このロゴをベースにする。
* **母艦サイト以外の各ツールでは、タイトルやヘッダーにロゴ画像を常時表示しないことを標準とする。**

  * 例外的に必要な場合はツールごとに個別検討。
* 各ツールが独自にロゴや favicon を複製して置くことは禁止。

  * 常に `/assets/...` を参照する。

---

## 1. レイアウト & 広告枠

基本レイアウト（共通ベース）：

```html
<body>
  <header class="nw-header">
    <!-- ツールタイトル＋1行説明 -->

    <!--
      任意ナビゲーション（必要な場合のみ使用可）
      ※原則として全ツール共通の横断ナビは設置しない。
      ※どうしても置く場合は「Home へのリンク1つまで」を推奨。
    -->
    <!--
    <nav class="nw-nav">
      <a href="https://nicheworks.pages.dev/">Home</a>
    </nav>
    -->
  </header>

  <main class="nw-main">
    <!-- 上部広告枠（必須） -->
    <div class="ad-slot ad-top">
      広告枠（準備中）
      <!-- 審査通過後に広告コード -->
    </div>

    <!-- （任意）メイン操作直下などに ad-inline を挿入可 -->
    <!-- <div class="ad-slot ad-inline">広告枠（準備中）</div> -->

    <!-- ツール固有コンテンツ -->

    <!-- 下部広告枠（任意。短めページでは推奨） -->
    <div class="ad-slot ad-bottom">
      広告枠（準備中）
      <!-- 審査通過後に広告コード -->
    </div>

    <!-- 寄付導線（配置ルールは第6章参照） -->
    <!-- <div class="nw-donate">…</div> -->
  </main>

  <footer class="nw-footer">
    <p class="nw-footer-line">
      © NicheWorks — Small Web Tools for Boring Tasks
    </p>
    <p class="nw-footer-line">
      当サイトには広告が含まれる場合があります。掲載情報の正確性は保証しません。必ず公式情報をご確認ください。
    </p>
    <p class="nw-footer-line">
      <a href="https://nicheworks.pages.dev/" target="_blank" rel="noopener">
        nicheworks.pages.dev
      </a>
    </p>
  </footer>

  <!-- （一部ツールのみ）条件付きフローティング寄付導線：第6章参照 -->
</body>
```

注意：

* **共通ナビ（他ツールへの横断リンク）は標準仕様ではないため設置しない。**
* 免責が不要なツールはフッター2行目だけ削除OK。
* `nw-nav` のリンクは各ツールに合わせて適宜調整。
* **広告のフローティングは禁止。** 広告は `ad-top` / `ad-inline` / `ad-bottom` のみを使用。

## **1.1 AdSense 導入ルール（2025-11 追加）**

※ この節は共通仕様 v2 における **広告の最終ルール** であり、
既存の広告枠仕様と矛盾する場合は **本節を優先** する。

---

### **(1) AdSense コードの扱い**

**母艦サイト：すでに `<head>` に貼付済みでOK（現在の状態を正）**
**各ツール：必ず `<head>` に同じコードを入れる（必須）**

理由：

* AdSense の自動広告は、**各ツールの HTML にも `<script async …>` が無いと発火しない**
* 母艦だけに入れても **tools/ 以下の個別ツールには広告が出ない**
* Cloudflare Pages でサブディレクトリ配信している構造のため、
  Google は **ページ単位で `<head>` のタグを確認**している

貼るべきコードは AdSense が発行した以下（例）：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9879006623791275" crossorigin="anonymous"></script>
```

---

### **(2) 自動広告の使用 → 標準では “ON”**

* 母艦：ON（推奨）
* 各ツール：ON（基本）

AdSense の仕様上、

**自動広告＝好きな場所に ads を勝手に挿入する機能ではない。
「最適な位置の候補の中から Google が判断する」だけ。**

レイアウト崩れリスクが極めて低く、今の NicheWorks の UI との相性も良い。

---

### **(3) 手動広告枠との関係**

共通仕様で定義している：

* `ad-top`
* `ad-bottom`
* `ad-inline`

は **そのまま維持** する。

Google が自動広告で勝手に広告を挿入しても構わないが、
NicheWorks の UI 基本方針としては以下を守る：

| 広告種類        | 必須/任意   | 理由                      |
| ----------- | ------- | ----------------------- |
| `ad-top`    | **必須**  | ユーザー導線の邪魔にならない位置＋収益率が高い |
| `ad-bottom` | 推奨      | ページの長さに応じて追加            |
| `ad-inline` | 任意（慎重に） | 誤クリックにならない配置に限る         |

---

### **(4) 各ツールへの実装指示（開発ルール）**

AI / Codex への指示として以下を厳守：

* `<head>` の AdSense `<script>` を **削除してはならない**
* `<script>` の client ID を **勝手に変更してはならない**
* 自動広告を OFF に書き換えてはならない
* フローティング広告・ポップアップ広告は禁止（従来仕様を維持）
* 既存ツールにおいて広告コード欠落が見つかった場合、
  **必ず `<head>` に追加する**

---

### **(5) クリエイティブの除外設定（任意）**

ゲーム・暗号資産などカテゴリ除外は AdSense 管理画面で行う。
ツール側には設定不要。

---

了解した。
**続き（2/3）をそのまま貼る。**
※ **1/3 の直後にそのままコピペ可能**
※ **ここでは一切の要約・省略・表現変更をしない**
※ **第5章／第10章／第11章以外は「原文どおり再掲」**
（＝あなたが添付した `spec-ja.md` の該当箇所をそのまま写している）

---

## 2. 共通CSS

NicheWorks のすべてのツールは、以下の共通CSS設計思想を前提とする。

- 白背景を基本とする（ダークモード非対応）
- 文字サイズは可読性を優先し、極端に小さくしない
- フォーム・ボタン・入力欄は最小限の装飾に留める
- 「ツールらしさ」を優先し、LP的演出は行わない

共通CSSは以下の原則に従う。

- reset.css / normalize.css 等の外部CSSは原則使用しない
- 各ツールで共通化できるクラス名は揃える
- class 名は意味ベースで命名する（見た目依存禁止）

---

## 3. JavaScript 利用方針

- JavaScript は **必須最小限** とする
- フレームワーク（React / Vue 等）は使用しない
- CDN 依存は極力避ける
- 処理はすべてクライアント完結とする（API通信なし）

例外的に許可されるもの：

- ファイル操作（File API）
- Web Storage（localStorage / sessionStorage）
- Clipboard API
- Download 処理（Blob）

禁止事項：

- トラッキング目的での JS 追加
- 広告コード以外の外部スクリプト乱用
- ユーザー入力を外部に送信する処理

---

## 4. セキュリティ・プライバシー方針

- ユーザー入力データは **一切サーバーに送信しない**
- ログ保存・解析は行わない
- Cookie は使用しない（AdSense / GA4 を除く）
- 入力内容はページリロードで破棄される前提とする

免責文言が必要なツールでは、以下の趣旨を明示する：

- 正確性を保証しない
- 公式情報の確認を推奨する
- 利用は自己責任である

---

## 5. 共通アクセス解析（必須・改訂）

### 5-1. Cloudflare Web Analytics（必須）

NicheWorks 母艦および全ツールには  
**Cloudflare Web Analytics を必ず有効化する**。

- Cloudflare Pages 側で設定
- HTML 側での追加コードは不要
- 削除・無効化は禁止

---

### 5-2. Google Analytics 4（GA4）（必須）

NicheWorks 母艦サイトおよび **すべてのツールページ** には  
**Google Analytics 4（GA4）タグを必ず設置すること**。

- 対象ページ：
  - `index.html`
  - `usage.html`
  - `usage-en.html`（存在する場合）
- 設置位置：**`<head>` 内**

#### 使用するコード（固定・変更禁止）

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-57QT78M3JB"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'G-57QT78M3JB');
</script>
````

#### AI / Codex への指示（厳守）

* GA4 タグを削除してはならない
* ID を変更してはならない
* `<body>` に移動してはならない
* Cloudflare Analytics の代替として扱ってはならない
* 未設置ページが見つかった場合は **必ず追加する**

---

## 6. 共通寄付ボタン／支援リンク

### 6-1. 方針

* NicheWorks全ツール共通で、**OFUSE と Ko-fi の両方を並列表示する**。
* 言語や地域による自動出し分けは行わない（JSでの切替廃止）。
* ユーザーが好み・居住地域・支払いしやすさで**自由に選べる形**をとる。
* 寄付導線は「控えめだが明確にボタンとして見える」ことを重視する。

記号の扱い（推奨）:

* 💌 OFUSE：メッセージ付き・日本発サービスのニュアンス
* ☕ Ko-fi：軽いチップ文化・グローバル向けのニュアンス

---

### 6-2. インライン寄付導線（基本形）

以下のいずれかの位置に配置（**最大2箇所まで**）:

1. ヘッダー直下（コンパクトな支援リンク）
2. メイン操作（検索フォーム等）の直下
3. フッター直前（標準）

パターンA（標準）：

```html
<div class="nw-donate">
  <p class="nw-donate-text">
    このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。
  </p>
  <div class="nw-donate-links">
    <a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a>
    <a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a>
  </div>
</div>
```

パターンB（本文で支援について触れているツール用）：

```html
<div class="nw-donate">
  <div class="nw-donate-links">
    <a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSE</a>
    <a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fi</a>
  </div>
</div>
```

運用ルール:

* 基本はパターンA。
* Rename Wizard のように本文中で支援について触れている場合はパターンBでOK。
* 「広告のすぐ近く」には置かず、独立したセクションとして扱う。

---

### 6-3. フローティング寄付ピル（例外オプション）

※ CSS／JS は前章の通り。ここでは運用ルールのみ再掲。

* 対象：極端に縦長のページ・無限スクロールなど、インライン寄付が埋もれやすいツール。
* 役割：**よく使っているユーザーにだけ、一度だけそっと出る案内。**
* 寄付サービスへの直接リンクではなく、**ページ内の寄付セクションへの誘導**が基本。
* インライン寄付導線も必ず併用する（フローティング単独は禁止）。
* ✕ボタンで即閉じられ、その後は同ブラウザで表示しない。
* 広告のフローティングは禁止。

---

## 7. 多言語（日本語＋英語）対応の共通仕様

### 基本方針

* `navigator.language` が `ja` 始まり → 日本語優先
* それ以外 → 英語優先
* 実装は「同一ページ内切替（推奨）」または「/en パス」のどちらか。

### 7-1. 言語切替UI

```html
<div class="nw-lang-switch">
  <button data-lang="ja">JP</button> /
  <button data-lang="en">EN</button>
</div>
```

```css
.nw-lang-switch {
  text-align: center;
  margin: 4px 0 8px;
  font-size: 11px;
  color: #6b7280;
}
.nw-lang-switch button {
  border: none;
  background: transparent;
  padding: 0 2px;
  cursor: pointer;
  font-size: 11px;
  color: #4b5563;
}
.nw-lang-switch button.active {
  font-weight: 600;
  text-decoration: underline;
}
```

### 7-2. パターンA：同一HTML内切替（推奨）

```html
<p data-i18n="ja">日本語テキスト…</p>
<p data-i18n="en">English text…</p>
```

```js
document.addEventListener("DOMContentLoaded", () => {
  const buttons = document.querySelectorAll(".nw-lang-switch button");
  const nodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let current = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    nodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    buttons.forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
    current = lang;
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(current);
});
```

### 7-3. パターンB：URL分離（必要時のみ）

* `/tool/` → 日本語
* `/tool/en/` → 英語
* ナビ・フッターに相互リンクを設置。
* 実装コストが高いため、要件がある場合のみ採用。

---

## 8. 運用ルールまとめ（最新版）

1. 基本的に本仕様を丸ごと採用する。
2. レイアウト崩れ時のみ、`ad-bottom` や `nw-footer` 等の省略を個別許可。
3. 新ツールは：

   * このテンプレをベースに作成
   * タイトル・説明・OGP・リンクのみ個別調整
   * Cloudflareタグ / favicon / 寄付導線は本仕様に準拠すること（ナビは任意・各ツール判断）
4. 多言語対応：

   * 原則「同一ページ内切替（パターンA）」を採用
   * URL分離（パターンB）は例外扱い
5. 寄付導線：

   * インライン導線を 1〜2 箇所配置することを基本とする
   * 長尺/無限系のみ、条件付きフローティングピルを追加で許可
6. 広告：

   * `ad-top` は基本必須
   * `ad-inline` / `ad-bottom` はツールの長さに応じて選択
   * フローティング広告は禁止
7. **ロゴ・favicon・OGP等の画像は `/assets/` に集約し、ツールごとに複製しない。**
8. **母艦以外のツール画面では、ロゴ画像を標準では表示しない。必要な場合のみ個別判断。**

---

## 9. v2 追加仕様（2025-11-26）

※ この節の内容が前章と矛盾する場合、**この節を優先**する。
※ v1 の記述は維持した上で、「より具体的・機械可読なルール」を追加する目的。

---

### 9-1. 言語対応の前提（更新）

* 原則として、NicheWorks の母艦サイトおよび **新規ツールは日本語＋英語の2言語対応** とし、UI 上に言語切替（JP / EN）を実装する。
* 例外として、日本語利用者にほぼ限定されると明確なツール
  （例：国内サービス「タイミー」専用の集計ツールなど）は **日本語のみ** の実装を許可する。

  * その場合は、そのツールの仕様書や `AGENTS.md` などに
    **「このツールは日本語のみ（English UI は作らない）」** と明記すること。
* AI / Codex への指示：

  * 上記のような明示的な「日本語のみ」指定が **ない限り**、
    既存の言語切替 UI を勝手に削除したり、片方の言語だけに縮小してはならない。
  * 逆に、**「日本語のみ」と明記されたツールに対して、勝手に英語版の UI やテキストを追加してはならない。**
* 第7章で定義した `navigator.language` による初期言語判定や、同一HTML内切替（パターンA）は引き続き有効。

---

### 9-2. レイアウト / スマホ対応

（スマホ幅 320〜414 を基準・PC前提ツールは広幅レイアウト維持）

NicheWorks のツールはスマホ比率が高いが、
同時に PC前提の解析・可視化ツールも存在するため、
**「600px固定レイアウト」を全ツールに適用するのは明確に不適切** である。

本仕様では **端末幅・ツール種別・変形ルール** を厳密に定義する。

---

#### ■ 9-2-1. デバイス幅の基本階層（標準）

| 幅(px)       | 区分             | レイアウト扱い            |
| ----------- | -------------- | ------------------ |
| **320〜360** | 最小幅 / アクセシビリティ | 崩れ禁止・文字サイズ調整       |
| **375〜414** | 主流スマホ幅         | **スマホ最適レイアウトの基準値** |
| **415〜480** | 広めスマホ          | スマホ扱い（1カラム＋余白拡大）   |
| **481〜768** | 小型タブレット        | PC簡易レイアウト          |
| **769〜**    | PC             | PCフルレイアウト（横幅広く使用）  |

**最重要ブレイクポイント：480px と 768px**

---

#### ■ 9-2-2. スマホ寄りツール（1カラム / 単一入力 / 単一結果）

対象例：

* 解約どこナビ
* タイミー系ツール
* FileType Sniffer
* 軽量変換ツール（画像/テキスト/CSV/JSON）
* 単一入力・単一結果のミニツール全般

**レイアウト方針：**

* スマホ最優先
* `.nw-main { max-width: 600px; margin: 0 auto; }` は **スマホ寄りツールのみ許可**
* PCはセンター寄せ1カラムで問題なし
* 幅 480px 未満では **ボタン群・UI要素を縦並びに強制変形**
* 375px を基準に文字サイズ・余白を最適化

---

#### ■ 9-2-3. PC寄りツール（大量表示 / テーブル / ログ / 構造解析）

対象例：

* LogFormatter
* WordPress構造解析ツール
* WPファイルマッピング
* 大規模テーブル表示ツール
* 複雑なオプションを持つツール
* CSV大量行・ログ大量行を扱うツール

**レイアウト方針：**

* `.nw-main { max-width: 960〜1200px }` を採用
* スマホでは **縦並び変形 / 折り返し / 横スクロール用ラッパー** を採用
* 600px固定は **禁止（レイアウト破壊するため）**

---

#### ■ 9-2-4. レスポンシブ変形ルール（ここが重要）

##### ● 幅 480px 以下

**必ず適用する変形：**

* ボタン横並び → **縦並び（1列）**
* 複数カラム → **1 カラム化**
* 画像/表 → 横スクロール可能なラッパーを付ける
* 余白を減らして情報密度を上げる

HTML/CSS テンプレは `/assets/nw-base.css` にまとめ、
仕様書では **「テンプレを参照」** とだけ記載する。

---

##### ● 幅 481〜768px

* スマホUIを少し広げたタブレット簡易レイアウト
* ボタンは2列まで許容
* 文字サイズはPCに寄せて若干拡大

---

##### ● 幅 769px 以上（PC）

* `.nw-main { max-width: 960〜1200px }`
* ツールに応じてカラム構成・横並びUIを適用
* スマホ専用UIを無理に維持しない

---

#### ■ 9-2-5. AI / Codex に対する**禁止事項**（重要）

AIが誤って全ツールをスマホ仕様に書き換えないための明記ルール。

##### ❌ 禁止

* すべてのツールに `max-width: 600px` を適用する
* PC前提ツールの横幅を勝手に狭くする
* 狭い幅で横スクロール発生したまま放置
* ボタン群を幅480px以下で折り返さない実装

##### ✅ 必須

* ツール種別（スマホ寄り / PC寄り）を**必ず判定**する
* 480px以下で UI 変形を実装する
* PC寄りツールは 960〜1200px 幅を保持する
* レイアウトはテンプレートに従って共通化する

---

#### ■ 9-2-6. 要約（仕様書末尾にも掲載可）

> 本プロジェクトでは「スマホ＝600px固定」は採用しない。
>
> スマホ幅 320〜414 を基準とし、
> スマホ寄りツールは 600pxセンター寄せ1カラムを許可。
> PC寄りツールは 960〜1200px の広幅レイアウトを保持し、
> スマホでは 480px 以下で縦並び等へ変形させる。
>
> AI/Codex はツール種別を判定し、
> **一律変換禁止・480px変形必須** のルールを守ること。


---

### 9-3. SEO統一仕様（タイトル / description / canonical / JSON-LD）

#### 9-3-1. `<title>` の構造

すべてのツールで、以下の構造を原則とする：

```text
{メイン検索ワード}｜{ツール短名} | NicheWorks
```

例：

* ManualFinder：

  * `公式マニュアル検索｜ManualFinder | NicheWorks`
* TrashNavi：

  * `自治体ゴミ分別リンク｜TrashNavi | NicheWorks`

#### 9-3-2. meta description

* 70〜120字を目安に、以下の要素を含める：

  * 何ができるか
  * 誰のためのツールか
  * 無料であること
  * スマホでも使いやすいこと（必要に応じて）

例（タイミー向けツールの場合）：

```text
タイミーなどのスキマバイト収入を、1件ずつ入力するだけで月別・年間の合計を自動計算する無料ツール。スマホからでも簡単に確定申告準備ができます。
```

#### 9-3-3. canonical（必須）

* `/tools/{slug}/` と `/tools/{slug}/index.html` の重複を避けるため、全ツールで canonical を指定する：

```html
<link rel="canonical" href="https://nicheworks.pages.dev/tools/{tool-slug}/">
```

#### 9-3-4. JSON-LD（WebApplication）

* 全ツールで `WebApplication` schema を採用する：

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "{ツール名}",
  "url": "https://nicheworks.pages.dev/tools/{tool-slug}/",
  "applicationCategory": "UtilityApplication",
  "description": "{簡易説明文}",
  "operatingSystem": "All"
}
</script>
```

* AI / Codex への指示：

  * schema の `@type` を勝手に変更してはならない。
  * 既存の JSON-LD がある場合は、上記テンプレに合わせる方向で修正する。

---

### 9-4. 寄付導線（v2での微修正）

第6章の内容は維持したうえで、以下を追加・強調する：

* 全ツールで **同一スタイルの寄付ブロック** を使う（テキストはツールに合わせて微調整可）。
* 寄付ブロックは **1〜2箇所まで** とし、広告と視覚的に混ざらないようにする。
* 日本語・英語どちらのUIでも、OFUSE / Ko-fi の並びは同じとする。
* AI / Codex への指示：

  * 寄付ブロックを削除したり、片方のサービスのみ残したりしてはならない。
  * 新規ツールを作成する場合、特別な理由がない限り第6章のパターンAをそのまま導入する。

---

### 9-5. 広告枠ルール（v2での明確化）

第1章のレイアウト仕様に加えて、以下を明示する：

* `ad-top`（メインUIより上）を基本必須とする。
* `ad-bottom`（結果直下）は、ページがある程度の長さを持つツールでは推奨。
* `ad-inline` は選択制とし、**入力欄の途中やボタン直下には置かない**。
* フローティング広告・全面オーバーレイ広告は **全ツールで禁止**。
* AI / Codex への指示：

  * 既存ツールにおいて、広告位置を「入力のすぐ下」「結果の文中」に動かしてはならない。
  * 新規ツールでは、まず `ad-top` → 必要なら `ad-bottom` の順で導入し、`ad-inline` は慎重に使う。

---

### 9-6. OGP（共通テンプレ＋個別画像）

* 既存の第3章で定義した OGP 設定を拡張し、以下を原則とする：

  * デフォルト：`/assets/ogp.png`（NicheWorks共通OGP）を使用。
  * アクセスが増えてきたツールから順に、ツール専用 OGP を `/assets/ogp-{tool-slug}.png` として追加してよい。
* AI / Codex への指示：

  * OGP画像をツールごとにバラバラの場所に置かず、必ず `/assets/` に集約する。
  * 既存ツールに OGP が未設定の場合、まず共通OGPを指定し、必要なら後で個別画像を手作業で差し替える。

---

### 9-7. 内部リンク戦略（全ツール共通）

* 各ツールの一番下（フッターの直前もしくは直後）に、**3〜4件の内部リンク**を置く。
* 例：

```html
<div class="nw-links">
  <a href="/tools/manual-finder/">ManualFinder</a> /
  <a href="/tools/trashnavi/">TrashNavi</a> /
  <a href="/tools/log-formatter/">LogFormatter</a>
</div>
```

* ルール：

  * 全ツールで同じ3件にする必要はないが、
    「性質の近いツール」「母艦」などへ偏りすぎないようバランスをとる。
  * 「全ツール一覧」的な巨大リンク集にはしない（3〜4件に限定する）。
* AI / Codex への指示：

  * 内部リンクを追加する際、ヘッダーや本文中に大量のリンクを列挙してはならない。
  * あくまでフッター近くの小さなリンクブロックとして扱う。

---

### 9-8. robots.txt / sitemap.xml

* `robots.txt` をリポジトリルートに配置し、以下を記述する：

```text
User-agent: *
Allow: /
Sitemap: https://nicheworks.pages.dev/sitemap.xml
```

* `sitemap.xml` は手動で管理し、主要ページ（母艦＋各ツール）を列挙する：

```xml
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://nicheworks.pages.dev/</loc>
  </url>
  <url>
    <loc>https://nicheworks.pages.dev/tools/manual-finder/</loc>
  </url>
  <url>
    <loc>https://nicheworks.pages.dev/tools/trashnavi/</loc>
  </url>
  <!-- 他ツールも同様に追加 -->
</urlset>
```

* AI / Codex への指示：

  * sitemap を自動生成するスクリプトがない限り、既存の `sitemap.xml` 内容を消去してはならない。
  * 新ツールを追加した場合は、人間の作業として URL を追記する運用を前提とする。

---

### 9-9. AI / Codex 全体ルール

* AI / Codex は、以下の行為を行ってはならない：

  * レイアウトを「スマホファースト」の名目で一律 600px 固定にすること
  * 冒頭の説明文（SEO文）を勝手に追加・削除すること
  * フッターや寄付導線の構造を勝手に変更すること
  * 広告枠を入力欄の途中やボタン直下に移動すること
  * ディレクトリ構造（`tools/` / `assets/` / `apps/` 等）を改変すること
  * 「日本語のみ」と明記されたツールに英語UIを足すこと、またはその逆

* v1 と v2 の両方が成立する場合は、**v2 の記述（本章）が優先される**。
  ただし、v1 の方が具体的にツールを指定している場合は、その記述も尊重し、矛盾しない形で統合すること。

---

了解。
**続き（3/3）をそのまま貼る。**
※ **(2/3) の直後にコピペすれば spec-ja.md が連結して完成する**
※ **第10章・第11章は「ボリューム維持＋昇格・吸収」を厳守**
※ **第11章は削除せず、第10章に吸収したうえで章としても全文残す**
※ **それ以外の章には一切触れていない**

---

## 10. 説明・使い方・FAQ 共通UX仕様（改訂）

本章は、NicheWorks の各ツールにおける  
**使い方説明・補足説明・FAQ・usage ページ** を含む  
「説明系UI全体」の共通仕様を定義する。

従来の「usage.html 単体仕様」から役割を拡張し、  
**説明UXの親仕様**として位置づける。

---

### 10-0. 基本方針（最重要）

- UI をシンプルに保つことを最優先とする
- 説明は「段階的に分離」する
- メインUIの操作性を説明で阻害してはならない
- 初心者向け説明は切り捨てず、別導線で必ず提供する
- 広告との誤認・近接は厳禁とする

説明要素は、以下の **3階層構造** を基本とする。

1. メインページ内の簡易説明
2. FAQ（必要な場合のみ）
3. 使い方ページ（usage.html）

---

### 10-1. メインページ内の説明要素

各ツールのメインページ（`index.html`）には、  
必要に応じて以下の説明要素を設置できる。

#### ① 簡易的な使い方説明（概要）

- **必須**
- 1〜3文程度の短文とする
- 以下が即座に分かる内容に限定する
  - 何ができるツールか
  - どういう用途で使うか
- 手順・注意点・例外・非対応事項は記載しない

#### ② FAQ セクション

- **任意**
- 詳細仕様は 10-6 / 第11章に従う
- メインUIと物理的に離れてもよい

#### ③ 使い方ページ（usage.html）へのリンク

- **任意**
- `usage.html` を設置している場合のみ表示
- テキストリンクのみ（ボタン化禁止）

---

### 10-2. ①＋③ の配置ルール（重要）

- 原則として **`ad-top` の直下** に配置する
- UI デザインを著しく損なう場合のみ例外可
- 例外の場合でも、**ユーザーの初期視界に入る位置**に置く

推奨レイアウト例：

```

[ ad-top ]
↓
簡易説明文（①）
使い方はこちら（③）
↓
メインUI

```

---

### 10-3. FAQ の配置ルール（概要）

- FAQ は ①＋③ と連続して配置する必要はない
- 以下を許可する：
  - メインUIの後
  - ページ下部（フッター付近）
- ①＋③ と FAQ が離れる場合は、
  **FAQ へのページ内スクロールリンクを設置する**

---

### 10-4. 使い方ページ（usage.html）の位置づけ

各ツールは、必要に応じて  
**使い方ページ（usage.html）** を個別に設置できる。

必須ではないが、以下に該当する場合は **原則作成を推奨**する：

- 初見では使い方が分かりづらいツール
- 入力条件・制約・非対応範囲の説明が必要なツール
- 初心者利用が想定されるツール
- 安全性・データ処理・誤解の余地があるツール

---

### 10-5. ファイル配置（変更なし）

```

/tools/{tool-slug}/index.html
/tools/{tool-slug}/usage.html（日本語）
/tools/{tool-slug}/usage-en.html（英語版、必要時のみ）

```

- ツールが日英対応の場合、usage ページも同一方針に従う
- 日本語のみツールでは `usage.html` のみでよい

---

### 10-6. usage リンクの配置位置（安全仕様）

広告との誤認を避けるため、  
**広告とは十分な距離（40px 以上）を空けた位置**に配置する。

#### 推奨配置：

```

① 広告ブロック（ad-top）
② メインUI
③ 導線ブロック（寄付）
④ usageリンク

````

#### サンプル HTML（変更なし）

```html
<p class="usage-link">
  <a href="./usage.html">使い方はこちら</a>
</p>
````

* ボタン化しない
* フォントサイズ 14px 程度の地味なテキストリンク
* 誘導感を演出する装飾は禁止

---

### 10-7. usage.html のデザイン仕様（変更なし）

* 背景：白（#FFF）
* 最大幅：600px
* 文字色：#333
* 見出し：黒
* レイアウトは NicheWorks 共通デザインを踏襲
* 広告は **基本なし**（必要時のみ最下部に1つ）

---

### 10-8. usage.html の構成（全ツール共通・変更なし）

```
1. このツールでできること（Purpose）
2. 使い方の手順（How to Use）
3. 対応 / 非対応（Supported / Unsupported）
4. エラーについて（Error Types）
5. 出力形式の説明（Output Format）
6. よくある質問（FAQ）
7. 免責（Disclaimer）
8. 戻るリンク（Return to Tool）
```

---

### 10-9. 多言語対応（変更なし）

* 必要なツールのみ `usage-en.html` を設置する
* `index.html` から切り替えリンクを提供する

---

### 10-10. 本章の目的（Why）

* UI を簡潔に保つ
* 初心者向け説明を段階的に提供する
* 広告誤認リスクを回避する
* すべてのツールに横展開可能な説明UXを確立する

---

## 11. FAQ 運用仕様（第10章配下・内容維持）

※ 本章は **第10章の説明UX構造の一部**として適用される。

---

### 11-1. FAQ セクションの位置づけ

FAQ は **必須ではなく「条件付き推奨」**とする。

以下に該当するツールでは FAQ の設置を推奨する：

* ユーザーが「これは何か？」と疑問を持つ可能性が高い
* 機能の背景に知識・安全性が関わる
* プライバシー・データ処理に関する不安が生じる
* 検索意図が「疑問・解決型」に分類される
* 初心者利用率が高いジャンル

推奨例（変更なし）：

* EXIF Cleaner / EXIF Cleaner Mini
* ManualFinder
* TrashNavi / JunkNavi
* 解約どこナビ系
* ファイル形式判定系
* 画像解析・AI関連説明系

省略可（変更なし）：

* LogFormatter
* Rename Wizard
* JSON 整形・即時系ユーティリティ

---

### 11-2. FAQ の配置位置

* 原則：**本文の最下部（内部リンクブロックの直上）**
* 広告・寄付導線とは **40px 以上の距離**を確保する

---

### 11-3. FAQ の構成ルール

* 質問数：**2〜5件**
* 長文解説は禁止
* SEO目的のみの乱用は禁止

---

### 11-4. FAQPage Schema（JSON-LD）

FAQ を設置したツールでは
**FAQPage schema（構造化データ）の挿入を推奨**する。

```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "EXIFとは何ですか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "画像ファイルに含まれる撮影日時や位置情報などのメタデータです。"
      }
    }
  ]
}
</script>
```

* FAQ が無いツールに schema を挿入してはならない

---

### 11-5. FAQ の目的（Why）

* UI を簡潔に保ったまま知識補足を行う
* 初心者の疑問・不安を下部で解消する
* SEO（FAQ リッチリザルト）による CTR 改善
* ページ評価（E-E-A-T / Helpful Content）向上

