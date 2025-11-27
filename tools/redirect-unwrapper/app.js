/* ============================================================
   Redirect Unwrapper - app.js (NicheWorks v2 準拠)
   完全クライアントサイドで最終URLを判定する
============================================================ */

/* ---------------------------------------
   言語切替（仕様 v2 準拠）
----------------------------------------- */
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

/* ---------------------------------------
   結果描画ヘルパー
----------------------------------------- */

const resultsEl = document.getElementById("results");

/* エラーカード */
function renderErrorCard(msg) {
  const div = document.createElement("div");
  div.className = "result-error";
  div.textContent = msg;
  resultsEl.appendChild(div);
}

/* 結果カード */
function renderResultCard({ input, chain, finalUrl, status }) {
  const card = document.createElement("div");
  card.className = "result-card";

  const addRow = (label, value) => {
    const row = document.createElement("div");
    row.className = "result-row";

    const labelEl = document.createElement("div");
    labelEl.className = "result-label";
    labelEl.textContent = label;

    const valEl = document.createElement("div");
    valEl.className = "result-value";
    valEl.textContent = value;

    row.appendChild(labelEl);
    row.appendChild(valEl);
    card.appendChild(row);
  };

  addRow("入力URL / Input URL", input);

  /* 中間リダイレクト */
  if (chain.length > 0) {
    addRow("中間リダイレクト / Redirect Chain", chain.join(" → "));
  } else {
    addRow("中間リダイレクト / Redirect Chain", "なし / None");
  }

  /* 最終URL */
  addRow("最終URL / Final URL", finalUrl);

  /* HTTPステータス（推測ベース） */
  addRow("HTTPステータス / HTTP Status", status || "不明 / Unknown");

  /* コピー */
  const copyBtn = document.createElement("button");
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "コピー / Copy";
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(finalUrl);
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "コピー / Copy"), 1200);
  });
  card.appendChild(copyBtn);

  resultsEl.appendChild(card);
}

/* ---------------------------------------
   方式1：iframe sandbox 解析
   → 中間URLやJSリダイレクトの捕捉に強い
----------------------------------------- */
function iframeUnwrap(url, timeout = 5000) {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("sandbox", "allow-scripts allow-top-navigation-by-user-activation");

    let settled = false;

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        document.body.removeChild(iframe);
        resolve(null);
      }
    }, timeout);

    iframe.onload = () => {
      if (settled) return;
      settled = true;

      try {
        // location.href が取れれば最終URL
        const finalUrl = iframe.contentWindow.location.href;
        document.body.removeChild(iframe);
        clearTimeout(timer);
        resolve(finalUrl);
      } catch (e) {
        // クロスオリジン → 判定不可
        document.body.removeChild(iframe);
        clearTimeout(timer);
        resolve(null);
      }
    };

    iframe.src = url;
    document.body.appendChild(iframe);
  });
}

/* ---------------------------------------
   方式2：fetch(no-cors) → opaque redirect
----------------------------------------- */
async function fetchUnwrap(url) {
  try {
    const res = await fetch(url, { redirect: "follow", mode: "no-cors" });
    // no-cors → opaque になるが response.url に最終URLが入るケースがある
    return res.url || null;
  } catch (e) {
    return null;
  }
}

/* ---------------------------------------
   方式3：HTMLテキストから meta refresh / JS redirect を解析
----------------------------------------- */
async function htmlFallbackUnwrap(url) {
  try {
    const res = await fetch(url, { redirect: "follow" });
    const text = await res.text();

    /* meta refresh */
    const metaMatch = text.match(/<meta[^>]*http-equiv=["']refresh["'][^>]*content=["']\d+;\s*url=(.*?)["']/i);
    if (metaMatch && metaMatch[1]) {
      return metaMatch[1].trim();
    }

    /* JS redirect (簡易) */
    const jsMatch = text.match(/location\.href\s*=\s*['"](.*?)['"]/i);
    if (jsMatch && jsMatch[1]) {
      return jsMatch[1].trim();
    }

    return null;
  } catch (e) {
    return null;
  }
}

/* ---------------------------------------
   メイン解析フロー
----------------------------------------- */
async function unwrapURL(inputUrl) {
  const chain = [];
  let current = inputUrl;
  let finalUrl = null;
  let status = null;

  // 3段階まで多段リダイレクト追跡
  for (let i = 0; i < 3; i++) {
    /* 方式1：iframe */
    const viaIframe = await iframeUnwrap(current);
    if (viaIframe && viaIframe !== current) {
      chain.push(viaIframe);
      current = viaIframe;
      finalUrl = viaIframe;
      continue;
    }

    /* 方式2：fetch opaque */
    const viaFetch = await fetchUnwrap(current);
    if (viaFetch && viaFetch !== current) {
      chain.push(viaFetch);
      current = viaFetch;
      finalUrl = viaFetch;
      continue;
    }

    /* 方式3：HTML fallback */
    const viaHTML = await htmlFallbackUnwrap(current);
    if (viaHTML && viaHTML !== current) {
      chain.push(viaHTML);
      current = viaHTML;
      finalUrl = viaHTML;
      continue;
    }

    break;
  }

  finalUrl = finalUrl || current;
  return {
    input: inputUrl,
    chain,
    finalUrl,
    status
  };
}

/* ---------------------------------------
   ボタンイベント
----------------------------------------- */
document.getElementById("analyzeBtn").addEventListener("click", () => startAnalyze());
document.getElementById("analyzeBtn-en").addEventListener("click", () => startAnalyze());

async function startAnalyze() {
  resultsEl.innerHTML = "";

  const url = document.getElementById("urlInput").value.trim();
  if (!url) {
    renderErrorCard("URLを入力してください / Please enter a URL");
    return;
  }

  let safeUrl = url;
  if (!/^https?:\/\//i.test(url)) {
    safeUrl = "https://" + url;
  }

  try {
    const res = await unwrapURL(safeUrl);
    renderResultCard(res);
  } catch (e) {
    renderErrorCard("URLを解析できませんでした / Failed to unwrap this URL");
  }
}
