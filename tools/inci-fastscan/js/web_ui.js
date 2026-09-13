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
  summaryNote: {
    ja: "照合結果は辞書上の整理です。安全性・刺激性・製品適合性の判定ではありません。",
    en: "These are dictionary matching results, not a safety, irritation, or product-suitability judgment."
  },
  known: {
    ja: "辞書一致",
    en: "Dictionary match"
  },
  reviewNeeded: {
    ja: "追加確認",
    en: "Additional review"
  },
  unknown: {
    ja: "未一致",
    en: "Unmatched"
  },
  filterAll: {
    ja: "すべて",
    en: "All"
  },
  filterMatched: {
    ja: "辞書一致",
    en: "Matched"
  },
  filterReview: {
    ja: "追加確認",
    en: "Review"
  },
  filterUnknown: {
    ja: "未一致",
    en: "Unmatched"
  },
  filterCount: {
    ja: (visible, total) => `${visible} / ${total} 件を表示`,
    en: (visible, total) => `Showing ${visible} / ${total}`
  },
  unknownMany: {
    ja: "未一致の成分が多いです。OCRの誤認識、カンマ区切り、表記ゆれを確認してから再チェックしてください。",
    en: "Many items are unmatched. Check OCR mistakes, comma separation, and spelling variants before running the check again."
  },
  canonical: {
    ja: "Canonical INCI",
    en: "Canonical INCI"
  },
  input: {
    ja: "入力表記",
    en: "Input"
  },
  matchRoute: {
    ja: "照合方法",
    en: "Match route"
  },
  routeCanonical: {
    ja: "INCI名一致",
    en: "Canonical INCI"
  },
  routeJapanese: {
    ja: "日本語名一致",
    en: "Japanese name"
  },
  routeAlias: {
    ja: "別名一致",
    en: "Declared alias"
  },
  routeSharedAlias: {
    ja: "表記ゆれ一致",
    en: "Normalized name variant"
  },
  matchedName: {
    ja: "一致表記",
    en: "Matched name"
  },
  jpNames: {
    ja: "日本語名候補",
    en: "Japanese names"
  },
  category: {
    ja: "分類",
    en: "Category"
  },
  defaultNote: {
    ja: "ローカル辞書に一致しました。必要に応じてメーカー等の公式情報も確認してください。",
    en: "Matched the local dictionary. Check official manufacturer information when needed."
  },
  unknownLabel: {
    ja: "未一致",
    en: "Unmatched"
  },
  unknownReason: {
    ja: "辞書に一致しませんでした。OCR崩れ、表記ゆれ、辞書未登録、または曖昧なカテゴリ名の可能性があります。",
    en: "No exact dictionary match was found. This may be an OCR issue, spelling variant, missing dictionary item, or an intentionally ambiguous group label."
  },
  ocrSuspected: {
    ja: "OCR文字誤認識の可能性",
    en: "Possible OCR character confusion"
  },
  ocrSuspectedHint: {
    ja: candidate => `I / l / 1 または O / 0 の読み違いだけで「${candidate}」に近づきます。元画像を確認し、必要なら入力欄を手で修正してください。`,
    en: candidate => `Only common I / l / 1 or O / 0 OCR confusions separate this from “${candidate}”. Check the image and edit the input manually if appropriate.`
  },
  suggestionTitle: {
    ja: "近い表記候補",
    en: "Possible close matches"
  },
  suggestionHint: {
    ja: "候補は自動置換しません。元のラベルを確認し、使う候補を押した場合だけ入力欄を書き換えます。再解析も自動では行いません。",
    en: "Suggestions are never applied automatically. Only a candidate you explicitly press can edit the input, and analysis will not rerun automatically."
  },
  applySuggestion: {
    ja: "入力欄へ反映",
    en: "Apply to input"
  },
  appliedSuggestion: {
    ja: candidate => `入力欄を「${candidate}」に修正しました。確認後、もう一度チェックしてください。`,
    en: candidate => `Updated the input to “${candidate}”. Review it, then run the check again.`
  },
  applyFailed: {
    ja: "元の表記を入力欄で見つけられませんでした。入力欄を直接修正してください。",
    en: "The original text was not found in the input. Edit the input manually."
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
    ja: "追加確認",
    en: "Additional review"
  },
  labelCaution: {
    ja: "追加確認",
    en: "Additional review"
  },
  labelCommon: {
    ja: "辞書一致",
    en: "Dictionary match"
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
    <div class="small">${escapeHtml(rt("summaryNote", uiLang))}</div>
    <div class="fastscan-result-filters" role="group" aria-label="Result filters">
      <button type="button" class="fastscan-filter-btn is-active" data-result-filter="all">${escapeHtml(rt("filterAll", uiLang))}</button>
      <button type="button" class="fastscan-filter-btn" data-result-filter="matched">${escapeHtml(rt("filterMatched", uiLang))}</button>
      <button type="button" class="fastscan-filter-btn" data-result-filter="review">${escapeHtml(rt("filterReview", uiLang))}</button>
      <button type="button" class="fastscan-filter-btn" data-result-filter="unknown">${escapeHtml(rt("filterUnknown", uiLang))}</button>
    </div>
    <div class="small fastscan-result-action-status" aria-live="polite"></div>
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
      const reviewState = isReviewState(r.safety) ? "review" : "matched";
      div.dataset.resultState = reviewState;
      const label = getReviewLabel(r.safety, uiLang);
      const route = getMatchRouteLabel(r.match_kind, uiLang);
      div.classList.add("result-" + normalizeSafetyClass(r.safety));
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(r.en)}</strong>
          <span class="review-label">${escapeHtml(label)}</span>
        </div>
        <div class="small">${escapeHtml(rt("canonical", uiLang))}: ${escapeHtml(r.en)}</div>
        <div class="small">${escapeHtml(rt("input", uiLang))}: ${escapeHtml(r.input)}</div>
        <div class="small">${escapeHtml(rt("matchRoute", uiLang))}: ${escapeHtml(route)}</div>
        ${r.matched_name ? `<div class="small">${escapeHtml(rt("matchedName", uiLang))}: ${escapeHtml(r.matched_name)}</div>` : ""}
        ${Array.isArray(r.jp) && r.jp.length ? `<div class="small">${escapeHtml(rt("jpNames", uiLang))}: ${escapeHtml(r.jp.join(" / "))}</div>` : ""}
        ${r.category ? `<div class="small">${escapeHtml(rt("category", uiLang))}: ${escapeHtml(r.category)}</div>` : ""}
        <div class="result-note">${escapeHtml(r.note_short || rt("defaultNote", uiLang))}</div>
      `;
    } else {
      div.dataset.resultState = "unknown";
      div.classList.add("result-unknown");
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(r.input)}</strong>
          <span class="review-label">${escapeHtml(rt("unknownLabel", uiLang))}</span>
        </div>
        <div class="result-note">${escapeHtml(rt("unknownReason", uiLang))}</div>
        ${renderOcrConfusion(r.ocr_confusion, uiLang)}
        ${renderSuggestions(r.suggestions, uiLang, r.input)}
        <ul class="unknown-tips">
          <li>${escapeHtml(rt("tipSpell", uiLang))}</li>
          <li>${escapeHtml(rt("tipOcr", uiLang))}</li>
          <li>${escapeHtml(rt("tipOfficial", uiLang))}</li>
        </ul>
      `;
    }

    container.appendChild(div);
  });

  setupResultInteractions(container, uiLang);
}

function renderOcrConfusion(confusion, lang) {
  if (!confusion?.en) return "";
  return `
    <div class="status-note status-warn">
      <strong>${escapeHtml(rt("ocrSuspected", lang))}</strong>
      <div class="small">${escapeHtml(rt("ocrSuspectedHint", lang, confusion.en))}</div>
    </div>
  `;
}

function renderSuggestions(suggestions, lang, originalInput) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return "";

  const chips = suggestions.map(item => {
    const replacement = item.matchedName || item.en;
    const jp = Array.isArray(item.jp) && item.jp.length ? ` / ${item.jp[0]}` : "";
    return `<button type="button" class="suggestion-chip suggestion-action" data-suggestion-value="${escapeHtml(replacement)}" data-original-value="${escapeHtml(originalInput)}"><span>${escapeHtml(item.en + jp)}</span><small>${escapeHtml(rt("applySuggestion", lang))}</small></button>`;
  }).join("");

  return `
    <div class="suggestion-box">
      <div class="suggestion-title">${escapeHtml(rt("suggestionTitle", lang))}</div>
      <div class="suggestion-list">${chips}</div>
      <div class="small suggestion-hint">${escapeHtml(rt("suggestionHint", lang))}</div>
    </div>
  `;
}

function setupResultInteractions(container, lang) {
  let activeFilter = "all";
  const status = container.querySelector(".fastscan-result-action-status");
  const cards = () => [...container.querySelectorAll(".result-card[data-result-state]")];

  const applyFilter = () => {
    const allCards = cards();
    let visible = 0;
    for (const card of allCards) {
      const show = activeFilter === "all" || card.dataset.resultState === activeFilter;
      card.hidden = !show;
      if (show) visible += 1;
    }
    container.querySelectorAll("[data-result-filter]").forEach(button => {
      const active = button.dataset.resultFilter === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (status) status.textContent = rt("filterCount", lang, visible, allCards.length);
  };

  container.querySelectorAll("[data-result-filter]").forEach(button => {
    button.addEventListener("click", () => {
      activeFilter = button.dataset.resultFilter || "all";
      applyFilter();
    });
  });

  container.querySelectorAll(".suggestion-action[data-suggestion-value]").forEach(button => {
    button.addEventListener("click", () => {
      const input = resultInputForContainer(container);
      const original = button.dataset.originalValue || "";
      const replacement = button.dataset.suggestionValue || "";
      if (!input || !original || !replacement) return;
      const index = input.value.indexOf(original);
      if (index < 0) {
        if (status) status.textContent = rt("applyFailed", lang);
        return;
      }
      input.value = `${input.value.slice(0, index)}${replacement}${input.value.slice(index + original.length)}`;
      input.focus();
      const start = index;
      const end = index + replacement.length;
      if (typeof input.setSelectionRange === "function") input.setSelectionRange(start, end);
      if (status) status.textContent = rt("appliedSuggestion", lang, replacement);
    });
  });

  applyFilter();
}

function resultInputForContainer(container) {
  if (container.id === "fast-results") return document.getElementById("fast-input");
  if (container.id === "jb-results") return document.getElementById("jb-input");
  return null;
}

function getMatchRouteLabel(kind, lang) {
  if (kind === "jp") return rt("routeJapanese", lang);
  if (kind === "alias") return rt("routeAlias", lang);
  if (kind === "shared_alias") return rt("routeSharedAlias", lang);
  return rt("routeCanonical", lang);
}

function rt(key, lang, ...args) {
  const value = RESULT_TEXT[key]?.[lang] || RESULT_TEXT[key]?.ja || "";
  return typeof value === "function" ? value(...args) : value;
}

function summarizeResults(results) {
  return results.reduce((acc, item) => {
    if (!item.found) {
      acc.unknown += 1;
      return acc;
    }
    if (isReviewState(item.safety)) {
      acc.review += 1;
      return acc;
    }
    acc.known += 1;
    return acc;
  }, { known: 0, review: 0, unknown: 0 });
}

function isReviewState(value) {
  const key = String(value || "").toLowerCase();
  return key === "caution" || key === "risk";
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
