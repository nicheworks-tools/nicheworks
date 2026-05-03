const RESULT_TEXT = {
  emptyTitle: {
    ja: "成分が見つかりません",
    en: "No ingredients found"
  },
  emptyHelp: {
    ja: "カンマ区切り、または改行区切りで成分を貼り付けてから確認してください。",
    en: "Paste comma-separated or line-separated ingredients, then run the check."
  },
  summaryTitle: {
    ja: "解析結果",
    en: "Result summary"
  },
  known: {
    ja: "既知",
    en: "Known"
  },
  reviewNeeded: {
    ja: "要確認",
    en: "Review needed"
  },
  unknown: {
    ja: "不明",
    en: "Unknown"
  },
  unknownMany: {
    ja: "不明成分が多いです。OCRの誤認識、カンマ区切り、表記ゆれを確認してから再チェックしてください。",
    en: "Many items are unknown. Check OCR mistakes, comma separation, and spelling variants before running the check again."
  },
  input: {
    ja: "入力",
    en: "Input"
  },
  jpNames: {
    ja: "日本語名候補",
    en: "Japanese names"
  },
  defaultNote: {
    ja: "辞書に一致しました。アレルギーや肌トラブルがある場合は公式情報を確認してください。",
    en: "Dictionary match. Check official information if you have allergies or skin concerns."
  },
  unknownLabel: {
    ja: "不明",
    en: "Unknown"
  },
  unknownReason: {
    ja: "辞書に見つかりませんでした。OCR崩れ、表記ゆれ、辞書未登録の可能性があります。",
    en: "This was not found in the dictionary. It may be an OCR issue, spelling variant, or missing dictionary item."
  },
  tipSpell: {
    ja: "スペルやカンマ区切りを確認してください。",
    en: "Check spelling and comma separation."
  },
  tipOcr: {
    ja: "画像OCRの場合は読み取り結果を手で修正してください。",
    en: "If this came from OCR, manually correct the recognized text."
  },
  tipOfficial: {
    ja: "最終確認はメーカー公式の成分表示で行ってください。",
    en: "Use the manufacturer's official ingredient label for final confirmation."
  },
  labelRisk: {
    ja: "要確認",
    en: "Needs review"
  },
  labelCaution: {
    ja: "注意して確認",
    en: "Review if sensitive"
  },
  labelCommon: {
    ja: "一般的に使用",
    en: "Commonly used"
  }
};

function renderResults(container, results, lang = "ja") {
  const uiLang = lang === "en" ? "en" : "ja";
  container.innerHTML = "";

  if (!Array.isArray(results) || results.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <strong>${escapeHtml(rt("emptyTitle", uiLang))}</strong>
        <div class="small">${escapeHtml(rt("emptyHelp", uiLang))}</div>
      </div>
    `;
    return;
  }

  const summary = summarizeResults(results);
  const summaryEl = document.createElement("div");
  summaryEl.className = "result-summary";
  summaryEl.innerHTML = `
    <strong>${escapeHtml(rt("summaryTitle", uiLang))}</strong>
    <div class="summary-grid">
      <span>${escapeHtml(rt("known", uiLang))}: ${summary.known}</span>
      <span>${escapeHtml(rt("reviewNeeded", uiLang))}: ${summary.review}</span>
      <span>${escapeHtml(rt("unknown", uiLang))}: ${summary.unknown}</span>
    </div>
  `;
  container.appendChild(summaryEl);

  if (summary.unknown >= Math.max(3, Math.ceil(results.length / 2))) {
    const warning = document.createElement("div");
    warning.className = "status-note status-warn";
    warning.textContent = rt("unknownMany", uiLang);
    container.appendChild(warning);
  }

  results.forEach(r => {
    const div = document.createElement("div");
    div.className = "result-card";

    if (r.found) {
      const label = getReviewLabel(r.safety, uiLang);
      div.classList.add("result-" + normalizeSafetyClass(r.safety));
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(r.en)}</strong>
          <span class="review-label">${escapeHtml(label)}</span>
        </div>
        <div class="small">${escapeHtml(rt("input", uiLang))}: ${escapeHtml(r.input)}</div>
        ${Array.isArray(r.jp) && r.jp.length ? `<div class="small">${escapeHtml(rt("jpNames", uiLang))}: ${escapeHtml(r.jp.join(" / "))}</div>` : ""}
        <div class="result-note">${escapeHtml(r.note_short || rt("defaultNote", uiLang))}</div>
      `;
    } else {
      div.classList.add("result-unknown");
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(r.input)}</strong>
          <span class="review-label">${escapeHtml(rt("unknownLabel", uiLang))}</span>
        </div>
        <div class="result-note">${escapeHtml(rt("unknownReason", uiLang))}</div>
        <ul class="unknown-tips">
          <li>${escapeHtml(rt("tipSpell", uiLang))}</li>
          <li>${escapeHtml(rt("tipOcr", uiLang))}</li>
          <li>${escapeHtml(rt("tipOfficial", uiLang))}</li>
        </ul>
      `;
    }

    container.appendChild(div);
  });
}

function rt(key, lang) {
  return RESULT_TEXT[key]?.[lang] || RESULT_TEXT[key]?.ja || "";
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

function getReviewLabel(value, lang = "ja") {
  const key = String(value || "").toLowerCase();
  if (key === "risk") return rt("labelRisk", lang);
  if (key === "caution") return rt("labelCaution", lang);
  return rt("labelCommon", lang);
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
