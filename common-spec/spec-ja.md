# 🧩 NicheWorks 共通仕様（2025-11 暫定版）

## 0. 対象

* 母艦 `nicheworks.pages.dev`
* 解約どこナビ / ManualFinder / TrashNavi / CivicDoc / Contract Cleaner / etc.
* その他：NicheWorks名義の静的ツール（ブラウザ完結系）

※レイアウトが特殊なツール(LogFormatter等)は「可能な範囲で適用」。

**公式アセット**

* プロジェクトファイルにアップロード済みの `nicheworks-logo.png` を暫定公式ロゴとする。
* favicon / OGP / 各種バナー生成時は、このロゴをベースにする。

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
.nw-donate-links a {
  display: inline-block;
  margin-top: 4px;
  padding: 6px 12px;
  background: #f3f4f6;
  border-radius: 8px;
  font-size: 12px;
  color: #374151;
  text-decoration: none;
}
.nw-donate-links a:hover {
  background: #e5e7eb;
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
<meta property="og:image" content="https://nicheworks.pages.dev/ogp.png">

<meta name="twitter:card" content="summary_large_image">
```

運用ルール：

* `title` / `og:title` / `description` / `og:url` は必ずツールごとに個別設定。
* `og:image` は当面 `https://nicheworks.pages.dev/ogp.png` 共通でOK（後日ツール別可）。

---

## 4. 共通ファビコン

方針：

* `nicheworks-logo.png` を元にした `favicon.png` を母艦・各ツールで共通利用。
* 各プロジェクトのルート or `public/` に `favicon.png` を配置。

```html
<link rel="icon" type="image/png" href="/favicon.png">
<link rel="apple-touch-icon" href="/favicon.png">
```

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

* `YOUR_TOKEN_HERE` は NicheWorks共通トークン。
* 母艦＋全ツールで同一トークン利用可。

---


## 6. 共通寄付ボタン／支援リンク（全面改訂）

### 6-1. 方針

* NicheWorks全ツール共通で、**OFUSE と Ko-fi の両方を並列表示する**。
* 言語や地域による自動出し分けは行わない（JSでの切替廃止）。
* ユーザーが好み・居住地域・支払いしやすさで**自由に選べる形**をとる。
* 寄付導線は「控えめだが明確にボタンとして見える」ことを重視する。

記号の扱い（推奨）:

* **💌 OFUSE**：メッセージ付き・日本発サービスのニュアンス
* **☕ Ko-fi**：軽いチップ文化・グローバル向けのニュアンス

---

### 6-2. インライン寄付導線（基本形）

以下のいずれかの位置に配置（**最大2箇所まで**）:

1. ヘッダー直下（コンパクトな支援リンク）
2. メイン操作（検索フォーム等）の直下
3. フッター直前（標準）

#### パターンA：テキスト＋2ボタン（標準推奨）

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

#### パターンB：2ボタンのみ（本文に支援文言があるツール用）

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
* Rename Wizardのように本文中で支援について触れている場合はパターンBでOK。
* 「広告のすぐ近く」には置かず、独立したセクションとして扱う。

---

### 6-3. ボタンデザイン（共通CSS）

※既存 `.nw-donate` ブロックをそのまま利用し、`.nw-donate-links a` を以下のように統一する。

```css
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
```

ポイント:

* 2ボタンが横並びでも、スマホで折り返しても自然な見た目。
* 広告枠より少し上品に、だがきちんと「押せるボタン」に見えるレベルの目立ち方。

---

### 6-4. フローティング寄付ピル（例外的オプション）

対象ツール:

* 極端に縦長のページ
* 無限スクロールやログビューアなど、インライン寄付が埋もれやすいもの

役割:

* 「ちゃんと使ってくれているユーザー」にだけ、**一度だけそっと出る**案内。
* 寄付サービスへの直接リンクではなく、**ページ内の寄付セクションへの誘導**に使うことを推奨。

HTML例（ページ末尾付近に設置）:

```html
<div class="nw-donate-float" id="nw-donate-float">
  ☕ Support NicheWorks
  <button class="nw-donate-close" aria-label="Close">×</button>
</div>
```

JS例:

```js
document.addEventListener("DOMContentLoaded", () => {
  const float = document.getElementById("nw-donate-float");
  if (!float) return;

  const storageKey = "nw_donate_float_seen";
  if (localStorage.getItem(storageKey) === "1") return;

  const showAt = 800; // px: ツールごとに調整OK

  window.addEventListener("scroll", () => {
    if (window.scrollY > showAt && float.style.display !== "inline-flex") {
      float.style.display = "inline-flex";
    }
  });

  float.addEventListener("click", (e) => {
    if (e.target.classList.contains("nw-donate-close")) {
      localStorage.setItem(storageKey, "1");
      float.style.display = "none";
      return;
    }

    // クリック時はページ内の寄付セクションへスクロール（推奨）
    const target = document.querySelector(".nw-donate");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      // 保険としてKo-fiページなどに飛ばしてもよいが、基本はセクション誘導
      window.open("https://ko-fi.com/nicheworks", "_blank", "noopener");
    }

    localStorage.setItem(storageKey, "1");
    float.style.display = "none";
  });
});
```

運用ルール:

* **寄付専用のみ**。広告のフローティングは禁止。
* 長尺／無限系ツールでのみ使用可（必須ではない）。
* インライン寄付導線も必ず併用する（フローティング単独は禁止）。
* ✕で即閉じられ、その後は同ブラウザで表示しない。
* 点滅・派手な色・巨大サイズなどの過度な主張は禁止。


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
* ナビ・フッターに相互リンクを設置
* 実装コスト高のため、要件がある場合のみ採用。

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

---
