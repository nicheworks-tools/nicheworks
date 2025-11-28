# 🧩 NicheWorks 共通仕様 v2（2025-11 暫定版）

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
共通仕様書の範囲外とする。


---

## 2. 共通CSS

```css
/* レイアウト */
.nw-main {
  max-width: 960px;
  margin: 0 auto;
}

/* 任意ナビ（必要なツールのみ使用）
 ※全ツール共通の横断ナビとしては利用しないこと。
 */
.nw-nav {
  text-align: center;
  margin: 8px 0 12px;
  font-size: 12px;
}
.nw-nav a {
  color: #4b5563;
  text-decoration: none;
  margin: 0 4px;
}
.nw-nav a:hover {
  text-decoration: underline;
}

/* 広告枠（共通） */
.ad-slot {
  margin: 12px 0 16px;
  padding: 8px;
  border: 1px dashed #d4d4d4;
  font-size: 11px;
  color: #9ca3af;
  text-align: center;
  min-height: 60px;
}
.ad-top {
  margin-top: 4px;
}
.ad-bottom {
  margin-bottom: 8px;
}
.ad-inline {
  margin: 24px 0;
}

/* フッター */
.nw-footer {
  margin-top: 24px;
  padding: 16px 8px 12px;
  border-top: 1px solid #e5e7eb;
  font-size: 11px;
  color: #6b7280;
  text-align: center;
  line-height: 1.6;
}
.nw-footer-line {
  margin: 2px 0;
}
.nw-footer a {
  color: #6b7280;
  text-decoration: underline;
}

/* 寄付導線（インライン） */
.nw-donate {
  text-align: center;
  margin: 16px 0 8px;
  padding: 8px 0;
  font-size: 12px;
  color: #6b7280;
}
.nw-donate-text {
  margin: 4px 0;
  font-size: 12px;
}
.nw-donate-links {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}
.nw-donate-links a {
  display: inline-block;
  padding: 8px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: #ffffff;
  font-size: 13px;
  color: #111827;
  text-decoration: none;
  transition: all 0.2s ease;
}
.nw-donate-links a:hover {
  background: #f9fafb;
  transform: translateY(-1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* 寄付フローティングピル（必要ツールのみ） */
.nw-donate-float {
  position: fixed;
  right: 16px;
  bottom: 16px;
  padding: 6px 10px;
  background: rgba(17, 24, 39, 0.96);
  color: #f9fafb;
  font-size: 11px;
  border-radius: 999px;
  cursor: pointer;
  z-index: 9999;
  display: none; /* JSで制御 */
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.nw-donate-float span {
  text-decoration: underline;
}
.nw-donate-close {
  border: none;
  background: transparent;
  color: #9ca3af;
  font-size: 11px;
  cursor: pointer;
  padding: 0 2px;
}
@media (max-width: 640px) {
  .nw-donate-float {
    right: 8px;
    bottom: 8px;
    font-size: 10px;
  }
}
```

---

## 3. 共通メタ & カード表示

```html
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>ツール名 | NicheWorks</title>
<meta name="description" content="そのツール専用の説明文。">

<meta property="og:type" content="website">
<meta property="og:title" content="ツール名 | NicheWorks">
<meta property="og:description" content="同上。">
<meta property="og:url" content="正式URLを書く">
<meta property="og:image" content="https://nicheworks.pages.dev/assets/ogp.png">

<meta name="twitter:card" content="summary_large_image">
```

運用ルール：

* `title` / `og:title` / `description` / `og:url` は必ずツールごとに個別設定。
* `og:image` は当面 `https://nicheworks.pages.dev/assets/ogp.png` 共通でOK（後日ツール別可）。
* **ツール本体の画面にはロゴ画像を必須表示しない。** 必要に応じて個別に検討。 

---

## 4. 共通ファビコン & ロゴ参照ルール

方針：

* `assets/` 配下のファイルを **単一ソース** として使用する。
* 母艦・各ツールで favicon / ロゴを複製しない。

```html
<!-- すべてのページ共通で推奨 -->
<link rel="icon" type="image/x-icon" href="/assets/favicon.ico">
<link rel="apple-touch-icon" href="/assets/favicon.ico">
```

ロゴ画像を使う場合の例：

```html
<img src="/assets/nicheworks-logo.png" alt="NicheWorks">
```

* ロゴを UI に出すのは **母艦または特別に許可したページのみ**。
* 各ツールでは OGP / タブアイコン目的での利用が中心。

---

## 5. 共通アクセス解析（NicheWorks系）

* デフォルト：**Cloudflare Web Analytics**（JavaScript beacon方式）
* 完全無料・Cookieレス・全ツール共通トークン利用OK。
* GA4は原則使わない（必要なツールのみ別途検討）。

```html
<script
  defer
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN_HERE"}'>
</script>
```

* `YOUR_TOKEN_HERE` は NicheWorks 共通トークン。
* 母艦＋全ツールで同一トークン利用可。

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

### 9-2. レイアウト / スマホ対応（600px原則とPC例外）

* 基本レイアウト：

  ```css
  .nw-main {
    max-width: 960px;
    margin: 0 auto;
  }
  ```

  は第2章の通り維持する。

* 方針：

  * NicheWorks の多くのツールはスマホ利用比率が高いため、
    **スマホでの可読性・操作性を最優先**する。
  * ただし、「スマホ専用」にするのではなく、**レスポンシブ前提**とする。

* 具体ルール：

  * 以下のような **スマホ寄りツール** では、`max-width: 600px` 程度に制限した1カラムUIを採用してよい：

    * 解約どこナビ系
    * タイミー等スキマバイト補助ツール
    * 簡易計算・チェック系ツール
  * 一方、以下のような **PC寄りツール** では、横幅を広く使うPCレイアウトを優先する：

    * LogFormatter のような大量ログビューア
    * WordPress構造解析ツール
    * 大きな表・テーブルを主に扱うツール
    * コード断片や長文を扱うツール

* AI / Codex への指示：

  * 「スマホファースト」を理由に、**既存ツールを一律 600px 固定レイアウトに書き換えてはならない。**
  * まず対象ツールが PC 前提かどうかを確認し、PC前提ツールでは **幅を減らすのではなく、メディアクエリ追加によるスマホ時の調整**に留めること。
  * 第1章・第2章で定義した広告枠・寄付導線・`nw-footer` の構造は維持したまま、余白やフォントサイズのみを調整する方針とする。

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

## 10. 使い方ページ（usage.html）安全仕様

NicheWorks のすべてのツールは、必要に応じて
**使い方ページ（usage.html）** を個別に設置できる。

このページは UI を簡潔に保ちつつ、
追加説明・FAQ・非対応範囲を掲載するためのもの。

---

### 10-1. ファイル配置

```
/tools/{tool-slug}/index.html
/tools/{tool-slug}/usage.html（日本語）
/tools/{tool-slug}/usage-en.html（英語版、必要時のみ）
```

---

### 10-2. usage リンクの配置位置（安全仕様）

広告との誤認を避けるため、
**広告とは十分な距離（40px 以上）を空けた位置**
に配置する。

#### ▼ 推奨配置：

```
① 広告ブロック（ad-top）
② メインUI
③ 導線ブロック（寄付）
④ usageリンク ← ★ここが安全
```

#### ▼ サンプル HTML

```html
<p class="usage-link">
  <a href="./usage.html">使い方はこちら</a>
</p>
```

※ ボタン化しない。
※ フォントサイズ 14px・地味なテキストリンク。
※ 誘導感を演出する装飾は禁止。

---

### 10-3. デザイン仕様（usage.html）

* 背景：白 (#FFF)
* 最大幅：600px
* 文字色：#333
* 見出し：黒
* レイアウトは NicheWorks 共通デザインを踏襲
* 広告は **基本なし**（必要時のみ最下部に1つ）

---

### 10-4. usage.html の構成（全ツール共通）

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

### 10-5. 多言語対応

必要なツールのみ usage-en.html を設置し、
index.html から切り替えリンクを提供。

---

### 10-6. 目的（Why）**

* UI をシンプルに保つ
* 初心者向け説明を別ページに分離
* AdSense 安全性の向上
* すべてのツールに横展開できる共通仕様

---


##11 **第11章：FAQ 運用仕様（2025-11 追加）**

### **11-1. FAQ セクションの位置づけ**

FAQ は **必須ではなく “条件付き推奨”** とする。

以下のいずれかに該当するツールでは FAQ の設置を推奨する：

* ユーザーが「これは何か？」と疑問を持つ可能性が高い
* 機能の背景に知識・安全性が関わる
* プライバシー・データ処理に関する不安が生じる
* 検索意図が “疑問・解決型” に分類される
* 初心者利用率が高く、説明が必要なジャンル

例（推奨対象）：

* EXIF Cleaner / EXIF Cleaner Mini
* ManualFinder
* TrashNavi / JunkNavi（廃棄物ジャンル）
* 解約どこナビ系
* ファイル形式判定系
* 画像解析・AI関連説明系
* 天気比較ツール（予定）

以下のツールでは FAQ を省略してもよい（推奨しない）：

* URL Title Collector
* LogFormatter
* Rename Wizard
* 改行修復ツール
* JSON整形・軽量即時系ユーティリティ

理由：冗長化し UX / SEO の両面で逆効果。

---

### **11-2. FAQ の配置位置**

FAQ は **本文の最下部（内部リンクブロックの直上）** に置く。

広告との誤認を避けるため
**広告・寄付導線とは最低 40px の距離を確保すること。**

---

### **11-3. FAQ の構成ルール**

* 質問数：**2〜5件に制限**
* 文章量：過度に長い解説は書かない
* SEO目的の乱用は禁止
* 検索意図とユーザー不安に直接関係する内容のみを書く

---

### **11-4. FAQPage Schema（JSON-LD）を推奨**

FAQ を設置したツールでは
**FAQPage schema（構造化データ）を挿入することを推奨する**。

例：

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
    },
    {
      "@type": "Question",
      "name": "どの画像形式に対応していますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "JPEG・PNG・WebP に対応しています。"
      }
    }
  ]
}
</script>
```

※ AI / Codex への指示：
FAQ が無いツールに schema を挿入してはならない。

---

### **11-5. FAQ の目的（Why）**

FAQ セクションは以下の目的で設置する：

* UI をシンプルに保ったまま、知識補足を追加
* 初心者の疑問や不安を下部で解消
* SEO（FAQ リッチリザルト）による CTR 改善
* ページ評価（E-E-A-T / Helpful Content）向上

---


## ■ **第12章：解析・変換系 UX 共通仕様（v2.2 / 2025-11 追加）**

本章は、以下のいずれかを行うツールを対象とする：

* 画像アップロード（EXIF削除・フォーマット変換など）
* ファイル解析（FileType Sniffer など）
* AI または外部APIによる解析処理
* テキスト解析（ログ変換系も該当）
* 時間がかかる可能性のある処理を伴うもの

※ 形式的・単機能ツール（改行修復・タイトル抽出など）は対象外でもよい。

---

### **12-1. プログレスバー（必須）**

解析処理を開始した時点で **必ずプログレス表示を開始する**。

**ルール：**

* 解析開始時：表示
* 完了 or エラー：非表示
* モバイルで隠れない位置に配置
* indeterminate（進捗不明）でも問題なし
* ボタン付近 or 中央に配置（ツールごとに適宜）

**AI/Codex禁止事項：**

* 処理中もバーを出さない実装
* エラー時にバーを残す
* 位置を広告の近くに移動する

---

### **12-2. リセットボタン（必須）**

解析結果が表示されたら **自動で “リセット” ボタンを出す**。

**クリック時の挙動：**

* 入力値の全消去
* 結果エリアの消去
* プログレスバーの消去
* ファイルプレビューやステータスも初期化

**配置：**

* 結果セクションの直下（広告と混ざらない位置）

---

### **12-3. 処理時間の通知（推奨）**

1秒以上の処理が想定される場合、
実行ボタン付近に以下のような文言を入れる：

> ⏳ この処理は最大3秒ほどかかる場合があります。

UX改善に効果が大きい。

---

### **12-4. 結果への自動スクロール（推奨）**

モバイルでは結果が画面外に行くため、
結果生成後は **自動で結果ブロックへスクロール** する。

---

### **12-5. エラー表示の共通ルール（推奨）**

すべての解析系ツールは **赤枠＋簡潔な説明** を採用する。

**形式：**

* 赤枠のブロック
* 原因（What）＋対処法（How）を短く
* エラー発生時はプログレスバー即消去

---

### **12-6. プレースホルダー（入力例）の必須化**

解析系ツールでは入力例（placeholder）を必ず入れる。

例：

* URL例：`https://example.com/img.png`
* JSON例：`{"key": "value"}`
* 対応画像例：PNG / JPEG / WebP

誤入力防止および UX 向上のため **必須**。

---

### **12-7. アップロード時の即時バリデーション（推奨）**

ファイル選択後すぐに：

* 拡張子チェック
* サイズオーバー判定
* 破損ファイル検出
* 禁止形式判定

を行う。

不正な場合は解析ボタンを **disabled** にする。

---

### **12-8. ドラッグ＆ドロップ対応（任意・推奨）**

可能な場合は D&D 対応エリアを提供し UX を向上する。

---

### **12-9. 結果コピー / ダウンロード機能（推奨）**

テキスト解析系では：

* 「コピー」📋
* 「ダウンロード」⬇️

の2つを標準搭載する。

---

### **12-10. AI / Codex 指示（最重要）**

以下の行為は禁止：

* 解析系ツールでプログレスバーを欠落させる
* リセットボタンを省略する
* 広告直下に進捗UIやボタンを置く
* レイアウトを勝手に 600px 固定に変更
* 解析後にバーが消えない状態を許容

以下の行為は推奨：

* エラー後はバーを即消去
* 解析中は実行ボタンを disable
* 結果生成後は自動スクロール


了解。
**やるべきことは 3つに分離して仕上げるのが最適** だ。

---


# 🧩 **付録：NicheWorks 新ツール共通テンプレ & 共通CSS（v2.2）**

以下は **2025年11月以降に新規作成する全ツール**に適用される共通テンプレートおよびデザイン仕様である。

既存ツールには適用しない。
（必要であれば後日移行する）

---

## ■ **付録0：基本方針**

1. すべての新ツールは以下の構成からスタートする：

```
/tools/{tool-slug}/
  ├─ index.html
  ├─ usage.html（必要なツールのみ）
  ├─ style.css
  └─ app.js
/assets/
  └─ nw-base.css
```

2. 共通デザイン・レイアウト・コンポーネントは **nw-base.css に100%集約**する。

3. 各ツール側の style.css は **最小限（色変更・専用UI）だけ**。

4. HTML構造は index.html / usage.html の共通テンプレからコピーして作る。

5. Codex に開発させる場合も **このテンプレを前提に必ず使用させる**。

---

## ■ **付録1：index.html 共通テンプレ（コード挿入欄）**

```
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>【ツール名】｜{短い説明文} | NicheWorks</title>

  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="ここに70〜120字程度の説明文。何ができるか／誰向けか／無料であることを簡潔に書く。">
  <link rel="canonical" href="https://nicheworks.pages.dev/tools/{tool-slug}/" />

  <!-- OGP（必要に応じて各ツールで差し替えOK） -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="【ツール名】｜{短い説明文}">
  <meta property="og:description" content="↑descriptionとほぼ同じでOK。">
  <meta property="og:url" content="https://nicheworks.pages.dev/tools/{tool-slug}/">
  <meta property="og:image" content="https://nicheworks.pages.dev/assets/og-default.png">

  <link rel="icon" href="/assets/nicheworks-favicon-white.ico">

  <!-- NicheWorks 共通スタイル -->
  <link rel="stylesheet" href="/assets/nw-base.css">
  <!-- ツール固有の追加CSS -->
  <link rel="stylesheet" href="./style.css">

  <!-- AdSense / Cloudflare Analytics は共通仕様に従って別途挿入 -->
</head>
<body>
  <div class="nw-page">
    <!-- Header -->
    <header class="nw-header">
      <div class="nw-header-inner">
        <h1 class="nw-header-title">【ツール名】</h1>
        <p class="nw-header-sub">一言キャッチ（20〜30字程度）。</p>
      </div>
    </header>

    <!-- Main -->
    <main class="nw-main">

      <!-- 上部広告枠（中身はAdSenseタグ） -->
      <section class="nw-ad nw-ad-top">
        <!-- ad-top slot -->
      </section>

      <section class="nw-card">
        <!-- 導入説明 -->
        <section class="nw-section">
          <p>
            ここに簡単な説明文（2〜3文）。<br>
            何ができるか／どんな時に使うか／スマホで完結することを書く。
          </p>
        </section>

        <!-- 入力エリア -->
        <section class="nw-section">
          <h2 class="nw-section-title">入力</h2>

          <div class="nw-field">
            <label class="nw-label" for="input-main">入力ラベル</label>
            <input id="input-main" class="nw-input" type="text" placeholder="ここに入力" />
          </div>

          <!-- 必要に応じて他のフィールド -->

          <div class="nw-btn-row">
            <button id="btn-run" class="nw-btn" type="button">
              <span>▶️</span><span>実行する</span>
            </button>
            <!-- リセットボタン（必要なツールのみ有効化）
            <button id="btn-clear" class="nw-btn nw-btn-ghost" type="button">
              <span>🧹</span><span>リセット</span>
            </button>
            -->
          </div>
        </section>

        <!-- 結果エリア -->
        <section class="nw-section">
          <h2 class="nw-section-title">結果</h2>
          <div id="result" class="nw-result">
            <div class="nw-result-title">まだ結果はありません</div>
            <p class="nw-muted">入力して「実行する」を押すとここに結果が出ます。</p>
          </div>
        </section>

        <!-- 使い方ページリンク（広告から距離を置く仕様） -->
        <section class="nw-section">
          <p class="nw-usage">
            <a href="./usage.html">詳しい使い方・対応範囲はこちら</a>
          </p>
        </section>

        <!-- 下部広告 -->
        <section class="nw-ad nw-ad-bottom">
          <!-- ad-bottom slot -->
        </section>

        <!-- 寄付導線 -->
        <section class="nw-donate">
          <p class="nw-donate-text">
            このツールがお役に立ったら、ご支援いただけると嬉しいです。
          </p>
          <div class="nw-donate-links">
            <a href="https://ofuse.me/nicheworks" target="_blank" rel="noopener">💌 OFUSEで支援</a>
            <a href="https://ko-fi.com/nicheworks" target="_blank" rel="noopener">☕ Ko-fiで支援</a>
          </div>
          <p class="nw-small nw-muted">
            寄付は任意です。サーバー費・開発・データ整備に使われます。
          </p>
        </section>

        <!-- 内部リンク -->
        <section class="nw-links">
          他のツール：
          <a href="/tools/manual-finder/">ManualFinder</a> /
          <a href="/tools/trashnavi/">TrashNavi</a> /
          <a href="/tools/log-formatter/">LogFormatter</a>
        </section>
      </section>
    </main>

    <!-- Footer -->
    <footer class="nw-footer">
      <div class="nw-footer-inner">
        <p class="nw-footer-copy">© NicheWorks — Small Web Tools for Boring Tasks</p>
        <p class="nw-footer-note">掲載情報の正確性は保証しません。</p>
      </div>
    </footer>
  </div>

  <script src="./app.js"></script>
</body>
</html>

```


---

## ■ **付録2：usage.html 共通テンプレ（コード挿入欄）**

```
<!doctype html>
<html lang="ja">
<head>
  <meta charset="utf-8" />
  <title>【ツール名】の使い方｜NicheWorks</title>

  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="description" content="【ツール名】の使い方・対応範囲・よくある質問（FAQ）などをまとめた説明ページです。">
  <link rel="canonical" href="https://nicheworks.pages.dev/tools/{tool-slug}/usage.html" />

  <link rel="icon" href="/assets/nicheworks-favicon-white.ico">
  <link rel="stylesheet" href="/assets/nw-base.css">
  <link rel="stylesheet" href="./style.css">
</head>

<body>
  <div class="nw-page">
    <header class="nw-header">
      <div class="nw-header-inner">
        <h1 class="nw-header-title">【ツール名】の使い方</h1>
        <p class="nw-header-sub">詳細な手順・対応範囲・FAQ。</p>
      </div>
    </header>

    <main class="nw-main">
      <section class="nw-card">

        <section class="nw-section">
          <h2 class="nw-section-title">1. このツールでできること</h2>
          <p>ここに「どんな問題を解決するツールか」を2〜3文で書く。</p>
        </section>

        <section class="nw-section">
          <h2 class="nw-section-title">2. 使い方の手順</h2>
          <ol>
            <li>ステップ1：〜〜を入力</li>
            <li>ステップ2：ボタンを押す</li>
            <li>ステップ3：結果を確認する</li>
          </ol>
        </section>

        <section class="nw-section">
          <h2 class="nw-section-title">3. 対応しているケース / 対応していないケース</h2>
          <p>仕様上の注意点・制約を書く。</p>
        </section>

        <section class="nw-section">
          <h2 class="nw-section-title">4. エラーについて</h2>
          <p>よくあるエラーと原因を書く。</p>
        </section>

        <section class="nw-section">
          <h2 class="nw-section-title">5. 出力形式について</h2>
          <p>CSV・テキストなど、出力の説明を記載する。</p>
        </section>

        <!-- FAQ（条件付き推奨） -->
        <section class="nw-section">
          <h2 class="nw-section-title">6. よくある質問（FAQ）</h2>
          <p class="nw-muted">※必要なツールのみ実装。それ以外はこのセクションを削除してよい。</p>
        </section>

        <section class="nw-section">
          <h2 class="nw-section-title">7. 免責</h2>
          <p class="nw-small nw-muted">
            本ツールの結果は正確性を保証するものではありません。
            重要な判断には必ず公式情報をご確認ください。
          </p>
        </section>

        <section class="nw-section">
          <p class="nw-usage">
            <a href="./index.html">← ツール本体に戻る</a>
          </p>
        </section>

      </section>
    </main>

    <footer class="nw-footer">
      <div class="nw-footer-inner">
        <p class="nw-footer-copy">© NicheWorks — Small Web Tools for Boring Tasks</p>
        <p class="nw-footer-note">掲載情報の正確性は保証しません。</p>
      </div>
    </footer>
  </div>
</body>
</html>

```

---

## ■ **付録3：共通CSS（nw-base.css）挿入欄**

```
/* ==================================
 * NicheWorks 共通CSS（nw-base.css）
 * ================================== */

/* ------------------------------
 * 基本テーマ
 * ------------------------------ */
:root {
  --nw-bg: #ffffff;
  --nw-bg-soft: #f9fafb;
  --nw-border: #e5e7eb;
  --nw-border-soft: #f3f4f6;
  --nw-text: #111827;
  --nw-muted: #6b7280;
  --nw-accent: #111827;
  --nw-accent-soft: #f3f4ff;
  --nw-danger: #b91c1c;
  --nw-radius: 14px;
  --nw-radius-sm: 10px;
  --nw-shadow-soft: 0 10px 25px rgba(15, 23, 42, 0.08);
  --nw-font: -apple-system, BlinkMacSystemFont, system-ui, -system-ui, "Segoe UI", sans-serif;
}

/* reset */
*,
*::before,
*::after {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
  background: var(--nw-bg);
  color: var(--nw-text);
  font-family: var(--nw-font);
  -webkit-font-smoothing: antialiased;
}

body {
  min-height: 100vh;
}

/* ------------------------------
 * Layout
 * ------------------------------ */
.nw-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.nw-header,
.nw-footer {
  padding: 16px 16px 8px;
}

.nw-header-inner,
.nw-footer-inner,
.nw-main {
  max-width: 640px;
  margin: 0 auto;
}

.nw-header-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0;
}

.nw-header-sub {
  margin: 4px 0 0;
  font-size: 13px;
  color: var(--nw-muted);
}

.nw-main {
  flex: 1;
  width: 100%;
  padding: 0 16px 32px;
}

.nw-card {
  background: var(--nw-bg-soft);
  border-radius: var(--nw-radius);
  padding: 16px 16px 20px;
  box-shadow: var(--nw-shadow-soft);
  border: 1px solid var(--nw-border-soft);
}

/* ------------------------------
 * Typography
 * ------------------------------ */
p {
  margin: 0 0 10px;
  font-size: 14px;
  line-height: 1.6;
}

.nw-muted {
  color: var(--nw-muted);
  font-size: 13px;
}

.nw-small {
  font-size: 12px;
}

/* ------------------------------
 * Sections
 * ------------------------------ */
.nw-section {
  margin-top: 16px;
}

.nw-section-title {
  font-size: 15px;
  font-weight: 600;
  margin: 0 0 8px;
}

/* ------------------------------
 * Forms
 * ------------------------------ */
.nw-field {
  margin-bottom: 12px;
}

.nw-label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}

.nw-input,
.nw-textarea,
.nw-select {
  width: 100%;
  border-radius: 10px;
  border: 1px solid var(--nw-border);
  padding: 8px 10px;
  font-size: 14px;
  font-family: var(--nw-font);
  background: #ffffff;
}

.nw-textarea {
  min-height: 100px;
  resize: vertical;
}

/* ------------------------------
 * Buttons
 * ------------------------------ */
.nw-btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 12px 0;
}

.nw-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  border-radius: 999px;
  border: 1px solid #111827;
  padding: 6px 14px;
  font-size: 14px;
  font-weight: 500;
  background: #111827;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.08s, box-shadow 0.08s;
}

.nw-btn:hover {
  background: #000000;
  transform: translateY(-1px);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.18);
}

.nw-btn:active {
  transform: none;
  box-shadow: none;
}

.nw-btn-ghost {
  background: #ffffff;
  color: #111827;
  border-color: var(--nw-border);
}

.nw-btn-ghost:hover {
  background: var(--nw-bg-soft);
}

/* ------------------------------
 * Result
 * ------------------------------ */
.nw-result {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px solid var(--nw-border-soft);
  background: #ffffff;
  font-size: 13px;
}

.nw-result-title {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
}

/* ------------------------------
 * Ads
 * ------------------------------ */
.nw-ad {
  margin: 16px 0;
  padding: 8px 0;
}

.nw-ad-top {
  margin-bottom: 16px;
}

.nw-ad-bottom {
  margin-top: 20px;
}

/* ------------------------------
 * Donate block
 * ------------------------------ */
.nw-donate {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px dashed var(--nw-border-soft);
}

.nw-donate-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.nw-donate-links a {
  font-size: 13px;
  text-decoration: none;
  border: 1px solid var(--nw-border);
  padding: 5px 10px;
  border-radius: 999px;
}

.nw-donate-links a:hover {
  background: var(--nw-bg-soft);
}

/* ------------------------------
 * Usage link
 * ------------------------------ */
.nw-usage {
  margin: 16px 0 0;
  text-align: center;
  font-size: 13px;
}

.nw-usage a {
  text-decoration: underline;
  color: #374151;
}

/* ------------------------------
 * Internal links
 * ------------------------------ */
.nw-links {
  margin-top: 20px;
  font-size: 13px;
  color: var(--nw-muted);
  text-align: center;
}

.nw-links a {
  color: #374151;
  text-decoration: none;
}

.nw-links a:hover {
  text-decoration: underline;
}

/* ------------------------------
 * Footer
 * ------------------------------ */
.nw-footer {
  border-top: 1px solid var(--nw-border-soft);
  margin-top: auto;
}

.nw-footer-copy {
  font-size: 12px;
  color: var(--nw-muted);
}

.nw-footer-note {
  font-size: 11px;
  color: var(--nw-muted);
}

/* ------------------------------
 * Progress bar / Loading
 * ------------------------------ */
.nw-progress {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: #e5e7eb;
  margin: 10px 0;
  display: none;
}

.nw-progress-inner {
  width: 100%;
  height: 100%;
  background: #111827;
  animation: nw-progress-anim 1.1s infinite linear;
}

@keyframes nw-progress-anim {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* ------------------------------
 * Error block
 * ------------------------------ */
.nw-error {
  margin-top: 12px;
  padding: 10px 12px;
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
  border-radius: 10px;
  font-size: 13px;
  display: none;
}

```

---


