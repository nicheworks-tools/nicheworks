function renderResults(container, results) {
  container.innerHTML = "";

  if (!Array.isArray(results) || results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>No ingredients found / 成分が見つかりません</strong>
        <div class="small">Paste comma-separated or line-separated ingredients, then run the check.</div>
      </div>
    `;
    return;
  }

  const summary = summarizeResults(results);
  const summaryEl = document.createElement("div");
  summaryEl.className = "result-summary";
  summaryEl.innerHTML = `
    <strong>解析結果 / Result summary</strong>
    <div class="summary-grid">
      <span>Known: ${summary.known}</span>
      <span>Review needed: ${summary.review}</span>
      <span>Unknown: ${summary.unknown}</span>
    </div>
  `;
  container.appendChild(summaryEl);

  if (summary.unknown >= Math.max(3, Math.ceil(results.length / 2))) {
    const warning = document.createElement("div");
    warning.className = "status-note status-warn";
    warning.textContent = "不明成分が多いです。OCRの誤認識、カンマ区切り、表記ゆれを確認してから再チェックしてください。";
    container.appendChild(warning);
  }

  results.forEach(r => {
    const div = document.createElement("div");
    div.className = "result-card";

    if (r.found) {
      const label = getReviewLabel(r.safety);
      div.classList.add("result-" + normalizeSafetyClass(r.safety));
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(r.en)}</strong>
          <span class="review-label">${escapeHtml(label)}</span>
        </div>
        <div class="small">Input: ${escapeHtml(r.input)}</div>
        ${Array.isArray(r.jp) && r.jp.length ? `<div class="small">日本語名候補: ${escapeHtml(r.jp.join(" / "))}</div>` : ""}
        <div class="result-note">${escapeHtml(r.note_short || "Dictionary match. Check official information if you have allergies or skin concerns.")}</div>
      `;
    } else {
      div.classList.add("result-unknown");
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(r.input)}</strong>
          <span class="review-label">Unknown / 不明</span>
        </div>
        <div class="result-note">辞書に見つかりませんでした。OCR崩れ、表記ゆれ、辞書未登録の可能性があります。</div>
        <ul class="unknown-tips">
          <li>スペルやカンマ区切りを確認してください。</li>
          <li>画像OCRの場合は読み取り結果を手で修正してください。</li>
          <li>最終確認はメーカー公式の成分表示で行ってください。</li>
        </ul>
      `;
    }

    container.appendChild(div);
  });
}

function summarizeResults(results) {
  return results.reduce((acc, item) => {
    if (!item.found) {
      acc.unknown += 1;
      return acc;
    }
    if (String(item.safety || "").toLowerCase() === "caution" || String(item.safety || "").toLowerCase() === "risk") {
      acc.review += 1;
      return acc;
    }
    acc.known += 1;
    return acc;
  }, { known: 0, review: 0, unknown: 0 });
}

function normalizeSafetyClass(value) {
  const key = String(value || "").toLowerCase();
  if (key === "risk") return "risk";
  if (key === "caution") return "caution";
  return "safe";
}

function getReviewLabel(value) {
  const key = String(value || "").toLowerCase();
  if (key === "risk") return "Needs review / 要確認";
  if (key === "caution") return "Review if sensitive / 注意して確認";
  return "Commonly used / 一般的に使用";
}

document.addEventListener("DOMContentLoaded", () => {
  const supportButton = document.getElementById("support-button");
  const supportOverlay = document.getElementById("support-overlay");
  const supportClose = document.getElementById("support-close");

  if (!supportButton || !supportOverlay) return;

  const openSupport = () => {
    supportOverlay.hidden = false;
  };

  const closeSupport = () => {
    supportOverlay.hidden = true;
  };

  supportButton.addEventListener("click", openSupport);
  supportClose?.addEventListener("click", closeSupport);
  supportOverlay.addEventListener("click", (event) => {
    if (event.target === supportOverlay) {
      closeSupport();
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !supportOverlay.hidden) {
      closeSupport();
    }
  });
});

function escapeHtml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
