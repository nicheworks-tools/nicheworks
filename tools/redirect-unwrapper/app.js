/* ============================================================
   Redirect Unwrapper - High Success Version (NicheWorks v2)
   ※ bit.ly / t.co / amzn.to / lnkd.in など対応
============================================================ */

/* ----------------------------
   言語切替
---------------------------- */
document.addEventListener("DOMContentLoaded", () => {
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((b) =>
      b.classList.toggle("active", b.dataset.lang === lang)
    );
    currentLang = lang;
  };

  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  applyLang(currentLang);
});

/* ----------------------------
   結果UI
---------------------------- */

const resultsEl = document.getElementById("results");

function renderError(msg) {
  const div = document.createElement("div");
  div.className = "result-error";
  div.textContent = msg;
  resultsEl.appendChild(div);
}

function renderResult({ input, finalUrl, chain }) {
  const card = document.createElement("div");
  card.className = "result-card";

  const add = (label, value) => {
    const row = document.createElement("div");
    row.className = "result-row";
    const l = document.createElement("div");
    l.className = "result-label";
    l.textContent = label;
    const v = document.createElement("div");
    v.className = "result-value";
    v.textContent = value;
    row.appendChild(l);
    row.appendChild(v);
    card.appendChild(row);
  };

  add("入力URL / Input URL", input);

  if (chain.length === 0) {
    add("中間リダイレクト / Redirect Chain", "なし / None");
  } else {
    add("中間リダイレクト / Redirect Chain", chain.join(" → "));
  }

  add("最終URL / Final URL", finalUrl || "(検出できませんでした)");

  // コピー
  const btn = document.createElement("button");
  btn.className = "copy-btn";
  btn.textContent = "コピー / Copy";
  btn.addEventListener("click", () => {
    navigator.clipboard.writeText(finalUrl || "");
    btn.textContent = "Copied!";
    setTimeout(() => (btn.textContent = "コピー / Copy"), 1000);
  });
  card.appendChild(btn);

  resultsEl.appendChild(card);
}

/* -----------------------------------------------------------
   ★ 新ロジック：リンクを「ユーザー遷移扱い」で開く
   → 新タブを開いて即 close
   → navigation entries から最終URLを取得
----------------------------------------------------------- */

async function resolveRedirectRealClick(url) {
  return new Promise((resolve) => {
    const chain = [];
    let finalUrl = null;

    // 新タブで開く（ユーザー起点扱い）
    const newTab = window.open(url, "_blank");

    if (!newTab) {
      resolve({ finalUrl: null, chain });
      return;
    }

    // すぐ閉じる（即閉じると navigation entry に残る）
    setTimeout(() => {
      try {
        newTab.close();
      } catch (e) {}
    }, 300);

    // 解析開始
    // navigation entry は少し遅れて反映される
    const start = performance.now();

    const check = () => {
      const elapsed = performance.now() - start;
      if (elapsed > 3000) {
        // タイムアウト
        resolve({ finalUrl: null, chain });
        return;
      }

      const nav = performance.getEntriesByType("navigation");
      if (nav && nav.length > 0) {
        const entry = nav[0];
        const dest = entry.name;

        if (dest && dest !== url) {
          finalUrl = dest;
          // chain生成：入力 != 最終 の場合だけ追加
          if (finalUrl !== url) {
            chain.push(finalUrl);
          }
          resolve({ finalUrl, chain });
          return;
        }
      }

      // 再チェック
      requestAnimationFrame(check);
    };

    check();
  });
}

/* -----------------------------------------------------------
   HTML fallback（meta refresh / JS redirect）
----------------------------------------------------------- */

async function simpleHTMLFallback(url) {
  try {
    const res = await fetch(url);
    const text = await res.text();

    // meta refresh
    const meta = text.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*url=(.*?)["']/i);
    if (meta && meta[1]) return meta[1].trim();

    // JS redirect
    const js = text.match(/location\.href\s*=\s*['"](.*?)['"]/i);
    if (js && js[1]) return js[1].trim();

    return null;
  } catch (_) {
    return null;
  }
}

/* -----------------------------------------------------------
   メイン解析フロー
----------------------------------------------------------- */

async function unwrap(inputUrl) {
  let url = inputUrl;
  const chain = [];

  // 安全のため https を補完
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  // ①「本物のリダイレクト」を踏む
  const real = await resolveRedirectRealClick(url);

  if (real.finalUrl) {
    return {
      input: inputUrl,
      chain: real.chain,
      finalUrl: real.finalUrl,
    };
  }

  // ② fallback：HTML解析
  const viaHTML = await simpleHTMLFallback(url);
  if (viaHTML) {
    chain.push(viaHTML);
    return {
      input: inputUrl,
      chain,
      finalUrl: viaHTML,
    };
  }

  // ③ それでも無理ならそのまま
  return {
    input: inputUrl,
    chain,
    finalUrl: url,
  };
}

/* -----------------------------------------------------------
   ボタンイベント
----------------------------------------------------------- */
document.getElementById("analyzeBtn").addEventListener("click", start);
document.getElementById("analyzeBtn-en").addEventListener("click", start);

async function start() {
  resultsEl.innerHTML = "";
  const input = document.getElementById("urlInput").value.trim();

  if (!input) {
    renderError("URLを入力してください / Please enter a URL");
    return;
  }

  const result = await unwrap(input);
  renderResult(result);
}
