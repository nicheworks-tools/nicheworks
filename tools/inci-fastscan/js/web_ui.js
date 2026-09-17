const RESULT_TEXT = {
  emptyTitle: { ja: "成分が見つかりません", en: "No ingredients found" },
  emptyHelp: { ja: "カンマ区切り、または改行区切りで成分を貼り付けてから確認してください。", en: "Paste comma-separated or line-separated ingredients, then run the check." },
  summaryTitle: { ja: "この成分表の概要", en: "Ingredient overview" },
  summaryNote: { ja: "各成分の主な役割と説明を表示します。濃度や製品全体の安全性を判定するものではありません。", en: "Shows the main role and explanation for each ingredient. It does not determine concentration or overall product safety." },
  total: { ja: "成分", en: "Ingredients" },
  known: { ja: "役割情報あり", en: "Role identified" },
  unknown: { ja: "情報未登録", en: "Information unavailable" },
  filterAll: { ja: "すべて", en: "All" },
  filterMatched: { ja: "役割あり", en: "Role identified" },
  filterReview: { ja: "補足確認", en: "Additional review" },
  filterUnknown: { ja: "情報未登録", en: "Information unavailable" },
  filterCount: { ja: (visible, total) => `${visible} / ${total} 件を表示`, en: (visible, total) => `Showing ${visible} / ${total}` },
  reviewQueuePrev: { ja: "前の確認項目", en: "Previous review item" },
  reviewQueueNext: { ja: "次の確認項目", en: "Next review item" },
  reviewQueuePosition: { ja: (current, total) => `確認項目 ${current} / ${total}`, en: (current, total) => `Review item ${current} / ${total}` },
  reviewQueueReady: { ja: total => `確認する項目 ${total} 件`, en: total => `${total} items to review` },
  reviewQueueEmpty: { ja: "確認が必要な項目はありません", en: "No review items" },
  unknownMany: { ja: "役割情報を確認できない成分が多いです。OCRの誤認識、カンマ区切り、表記ゆれを確認してください。", en: "Role information is unavailable for many items. Check OCR mistakes, comma separation, and spelling variants." },
  inci: { ja: "INCI", en: "INCI" },
  japaneseName: { ja: "日本語名", en: "Japanese name" },
  role: { ja: "主な役割", en: "Main role" },
  whatItDoes: { ja: "説明", en: "What it does" },
  unknownLabel: { ja: "情報未登録", en: "Information unavailable" },
  unknownReason: { ja: "この表記から役割情報を確認できませんでした。OCRの読み違い、表記ゆれ、または未登録の成分である可能性があります。", en: "Role information is not available for this spelling. It may be an OCR error, spelling variant, or an ingredient not yet covered." },
  reviewHint: { ja: "使用条件などの補足情報も確認してください。", en: "Check any relevant usage conditions or additional information." },
  ocrSuspected: { ja: "OCR文字誤認識の可能性", en: "Possible OCR character confusion" },
  ocrSuspectedHint: { ja: candidate => `I / l / 1 または O / 0 の読み違いだけで「${candidate}」に近づきます。元画像を確認し、必要なら入力欄を手で修正してください。`, en: candidate => `Only common I / l / 1 or O / 0 OCR confusions separate this from “${candidate}”. Check the image and edit the input manually if appropriate.` },
  suggestionTitle: { ja: "近い表記候補", en: "Possible close matches" },
  suggestionHint: { ja: "候補は自動置換しません。元のラベルを確認し、使う候補を押した場合だけ入力欄を書き換えます。再解析も自動では行いません。", en: "Suggestions are never applied automatically. Only a candidate you explicitly press can edit the input, and analysis will not rerun automatically." },
  applySuggestion: { ja: "入力欄へ反映", en: "Apply to input" },
  appliedSuggestion: { ja: candidate => `入力欄を「${candidate}」に修正しました。確認後、もう一度チェックしてください。`, en: candidate => `Updated the input to “${candidate}”. Review it, then run the check again.` },
  applyFailed: { ja: "元の表記を入力欄で見つけられませんでした。入力欄を直接修正してください。", en: "The original text was not found in the input. Edit the input manually." },
  tipSpell: { ja: "スペルやカンマ区切りを確認してください。", en: "Check spelling and comma separation." },
  tipOcr: { ja: "画像OCRの場合は読み取り結果を手で修正してください。", en: "If this came from OCR, manually correct the recognized text." },
  tipOfficial: { ja: "必要ならメーカー公式の成分表示でも確認してください。", en: "Check the manufacturer's official ingredient label when needed." }
};

const ROLE_LABELS = {
  humectant: { ja: "保湿", en: "Humectant" },
  moisturizer: { ja: "保湿", en: "Moisturizer" },
  soothing: { ja: "整肌", en: "Soothing" },
  active: { ja: "機能性成分", en: "Active" },
  "amino acid": { ja: "アミノ酸", en: "Amino acid" },
  silicone: { ja: "シリコーン", en: "Silicone" },
  "film former": { ja: "皮膜形成", en: "Film former" },
  emollient: { ja: "エモリエント", en: "Emollient" },
  oil: { ja: "油性成分", en: "Oil" },
  solvent: { ja: "溶剤", en: "Solvent" },
  preservative: { ja: "保存", en: "Preservative" },
  fragrance: { ja: "香料", en: "Fragrance" },
  surfactant: { ja: "界面活性剤", en: "Surfactant" },
  cleanser: { ja: "洗浄", en: "Cleanser" },
  "uv filter": { ja: "UVフィルター", en: "UV filter" },
  sunscreen: { ja: "UVフィルター", en: "UV filter" },
  colorant: { ja: "着色", en: "Colorant" },
  pigment: { ja: "着色", en: "Pigment" },
  antioxidant: { ja: "酸化防止", en: "Antioxidant" },
  botanical: { ja: "植物由来", en: "Botanical" },
  extract: { ja: "植物エキス", en: "Extract" },
  "plant extract": { ja: "植物エキス", en: "Plant extract" },
  peptide: { ja: "ペプチド", en: "Peptide" },
  ferment: { ja: "発酵由来", en: "Ferment" },
  thickener: { ja: "増粘", en: "Thickener" },
  emulsifier: { ja: "乳化", en: "Emulsifier" },
  chelator: { ja: "キレート", en: "Chelating agent" },
  "chelating agent": { ja: "キレート", en: "Chelating agent" },
  ph: { ja: "pH調整", en: "pH adjuster" },
  "ph adjuster": { ja: "pH調整", en: "pH adjuster" },
  "viscosity adjuster": { ja: "粘度調整", en: "Viscosity adjuster" },
  buffer: { ja: "pH安定化", en: "Buffer" },
  conditioning: { ja: "コンディショニング", en: "Conditioning" },
  "skin conditioning": { ja: "整肌", en: "Skin conditioning" },
  "hair conditioning": { ja: "毛髪コンディショニング", en: "Hair conditioning" },
  general: { ja: "役割情報整理中", en: "Role pending" }
};

const ROLE_DESCRIPTIONS = {
  humectant: { ja: "水分を保持し、乾燥を防ぐ目的で使われる成分です。", en: "Helps attract and retain moisture." },
  moisturizer: { ja: "肌のうるおいを保つ目的で使われる成分です。", en: "Used to help maintain skin moisture." },
  soothing: { ja: "肌を整える目的で使われる成分です。", en: "Used for skin-conditioning and soothing." },
  active: { ja: "製品の機能性を担う目的で配合される成分です。", en: "Used as a functional ingredient in the formula." },
  "amino acid": { ja: "保湿やコンディショニングなどに使われるアミノ酸系成分です。", en: "An amino-acid ingredient used for conditioning or moisture support." },
  silicone: { ja: "感触をなめらかにしたり、表面を整える目的で使われるシリコーン系成分です。", en: "A silicone used to improve feel and surface smoothness." },
  "film former": { ja: "肌や毛髪の表面に膜を作る目的で使われる成分です。", en: "Used to form a film on skin or hair." },
  emollient: { ja: "肌をなめらかにし、うるおいを保つ目的で使われる油性成分です。", en: "An emollient used to soften skin and reduce moisture loss." },
  oil: { ja: "肌をなめらかにし、うるおいを保つ目的で使われる油性成分です。", en: "An oil used for emollience and moisture retention." },
  solvent: { ja: "他の成分を溶かしたり、処方のベースとして使われる成分です。", en: "Used as a solvent or formula base." },
  preservative: { ja: "製品の品質を保つために使われる保存成分です。", en: "Used to help preserve product quality." },
  fragrance: { ja: "製品に香りをつける目的で使われる成分です。", en: "Used to add fragrance to the product." },
  surfactant: { ja: "水と油をなじませたり、洗浄などに使われる界面活性剤です。", en: "A surfactant used for cleansing, emulsifying, or dispersing." },
  cleanser: { ja: "汚れを落とす目的で使われる洗浄成分です。", en: "Used as a cleansing ingredient." },
  "uv filter": { ja: "紫外線から肌を保護する目的で使われるUVフィルターです。", en: "A UV filter used to help protect skin from ultraviolet radiation." },
  sunscreen: { ja: "紫外線から肌を保護する目的で使われるUVフィルターです。", en: "A UV filter used to help protect skin from ultraviolet radiation." },
  colorant: { ja: "製品や肌に色をつける目的で使われる成分です。", en: "Used to provide color." },
  pigment: { ja: "製品や肌に色をつける目的で使われる顔料です。", en: "A pigment used to provide color." },
  antioxidant: { ja: "成分や処方の酸化を抑える目的で使われる成分です。", en: "Used to help limit oxidation in the formula or on skin." },
  botanical: { ja: "植物由来の成分として配合されています。", en: "A botanical-derived ingredient." },
  extract: { ja: "植物などから得られたエキス成分です。", en: "An extract-derived ingredient." },
  "plant extract": { ja: "植物などから得られたエキス成分です。", en: "A plant-derived extract ingredient." },
  peptide: { ja: "ペプチド系のコンディショニング成分です。", en: "A peptide used for conditioning functions." },
  ferment: { ja: "発酵由来の成分として配合されています。", en: "A ferment-derived ingredient." },
  thickener: { ja: "製品の粘度やテクスチャーを調整する目的で使われる成分です。", en: "Used to adjust viscosity and texture." },
  emulsifier: { ja: "水と油を均一に混ぜやすくする目的で使われる乳化成分です。", en: "Used to help oil and water remain mixed." },
  chelator: { ja: "金属イオンを捕捉し、処方を安定させる目的で使われる成分です。", en: "Used to bind metal ions and support formula stability." },
  "chelating agent": { ja: "金属イオンを捕捉し、処方を安定させる目的で使われる成分です。", en: "Used to bind metal ions and support formula stability." },
  ph: { ja: "製品のpHを調整する目的で使われる成分です。", en: "Used to adjust product pH." },
  "ph adjuster": { ja: "製品のpHを調整する目的で使われる成分です。", en: "Used to adjust product pH." },
  "viscosity adjuster": { ja: "製品の粘度を調整する目的で使われる成分です。", en: "Used to adjust product viscosity." },
  buffer: { ja: "製品のpHを安定させる目的で使われる成分です。", en: "Used to help stabilize product pH." },
  conditioning: { ja: "肌や毛髪の感触を整える目的で使われる成分です。", en: "Used for skin or hair conditioning." },
  "skin conditioning": { ja: "肌の状態や感触を整える目的で使われる成分です。", en: "Used for skin conditioning." },
  "hair conditioning": { ja: "毛髪の感触やまとまりを整える目的で使われる成分です。", en: "Used for hair conditioning." },
  general: { ja: "この成分の主な役割情報は現在整理中です。", en: "The primary role for this ingredient is still being organized." }
};

function roleKey(category) {
  return String(category || "general").trim().toLowerCase() || "general";
}

function roleLabel(category, lang) {
  const key = roleKey(category);
  const label = ROLE_LABELS[key];
  if (label) return label[lang] || label.ja;
  return category || (lang === "en" ? "Role pending" : "役割情報整理中");
}

function ingredientDescription(item, lang) {
  const key = roleKey(item?.category);
  if (lang === "en" && item?.note_short) return item.note_short;
  const description = ROLE_DESCRIPTIONS[key] || ROLE_DESCRIPTIONS.general;
  return description[lang] || description.ja;
}

function renderResults(container, results, lang = "ja") {
  const uiLang = lang === "en" ? "en" : "ja";
  container.innerHTML = "";

  if (!Array.isArray(results) || results.length === 0) {
    container.innerHTML = `<div class="empty-state"><strong>${escapeHtml(rt("emptyTitle", uiLang))}</strong><div class="small">${escapeHtml(rt("emptyHelp", uiLang))}</div></div>`;
    return;
  }

  const summary = summarizeResults(results);
  const hasReviewQueue = summary.review + summary.unknown > 0;
  const summaryEl = document.createElement("div");
  summaryEl.className = "result-summary";
  summaryEl.innerHTML = `
    <strong>${escapeHtml(rt("summaryTitle", uiLang))}</strong>
    <div class="summary-grid">
      <span>${escapeHtml(rt("total", uiLang))}: ${results.length}</span>
      <span>${escapeHtml(rt("known", uiLang))}: ${summary.known}</span>
      <span>${escapeHtml(rt("unknown", uiLang))}: ${summary.unknown}</span>
    </div>
    <div class="small">${escapeHtml(rt("summaryNote", uiLang))}</div>
    <div class="fastscan-result-filters" role="group" aria-label="Result filters">
      <button type="button" class="fastscan-filter-btn is-active" data-result-filter="all">${escapeHtml(rt("filterAll", uiLang))}</button>
      <button type="button" class="fastscan-filter-btn" data-result-filter="matched">${escapeHtml(rt("filterMatched", uiLang))}</button>
      <button type="button" class="fastscan-filter-btn" data-result-filter="unknown">${escapeHtml(rt("filterUnknown", uiLang))}</button>
      <button type="button" class="fastscan-filter-btn" data-result-filter="review" ${summary.review ? "" : "hidden"}>${escapeHtml(rt("filterReview", uiLang))}</button>
    </div>
    ${hasReviewQueue ? `<div class="fastscan-review-queue" role="group" aria-label="Review queue"><button type="button" class="fastscan-review-nav" data-review-nav="prev">${escapeHtml(rt("reviewQueuePrev", uiLang))}</button><span class="small fastscan-review-position" aria-live="polite"></span><button type="button" class="fastscan-review-nav" data-review-nav="next">${escapeHtml(rt("reviewQueueNext", uiLang))}</button></div>` : ""}
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
    div.tabIndex = -1;

    if (r.found) {
      const reviewState = isReviewState(r.safety) ? "review" : "matched";
      div.dataset.resultState = reviewState;
      const displayName = r.input || r.en;
      const role = roleLabel(r.category, uiLang);
      const description = ingredientDescription(r, uiLang);
      div.classList.add("result-known");
      div.innerHTML = `
        <div class="result-card-head">
          <strong>${escapeHtml(displayName)}</strong>
          <span class="review-label">${escapeHtml(role)}</span>
        </div>
        <div class="small"><strong>${escapeHtml(rt("role", uiLang))}:</strong> ${escapeHtml(role)}</div>
        <div class="result-note"><strong>${escapeHtml(rt("whatItDoes", uiLang))}:</strong> ${escapeHtml(description)}</div>
        ${r.en ? `<div class="small">${escapeHtml(rt("inci", uiLang))}: ${escapeHtml(r.en)}</div>` : ""}
        ${Array.isArray(r.jp) && r.jp.length ? `<div class="small">${escapeHtml(rt("japaneseName", uiLang))}: ${escapeHtml(r.jp.join(" / "))}</div>` : ""}
        ${isReviewState(r.safety) ? `<div class="small">${escapeHtml(rt("reviewHint", uiLang))}</div>` : ""}
      `;
    } else {
      div.dataset.resultState = "unknown";
      div.classList.add("result-unknown");
      div.innerHTML = `
        <div class="result-card-head"><strong>${escapeHtml(r.input)}</strong><span class="review-label">${escapeHtml(rt("unknownLabel", uiLang))}</span></div>
        <div class="result-note">${escapeHtml(rt("unknownReason", uiLang))}</div>
        ${renderOcrConfusion(r.ocr_confusion, uiLang)}
        ${renderSuggestions(r.suggestions, uiLang, r.input)}
        <ul class="unknown-tips"><li>${escapeHtml(rt("tipSpell", uiLang))}</li><li>${escapeHtml(rt("tipOcr", uiLang))}</li><li>${escapeHtml(rt("tipOfficial", uiLang))}</li></ul>
      `;
    }
    container.appendChild(div);
  });

  setupResultInteractions(container, uiLang);
}

function renderOcrConfusion(confusion, lang) {
  if (!confusion?.en) return "";
  return `<div class="status-note status-warn"><strong>${escapeHtml(rt("ocrSuspected", lang))}</strong><div class="small">${escapeHtml(rt("ocrSuspectedHint", lang, confusion.en))}</div></div>`;
}

function renderSuggestions(suggestions, lang, originalInput) {
  if (!Array.isArray(suggestions) || suggestions.length === 0) return "";
  const chips = suggestions.map(item => {
    const replacement = item.matchedName || item.en;
    const jp = Array.isArray(item.jp) && item.jp.length ? ` / ${item.jp[0]}` : "";
    return `<button type="button" class="suggestion-chip suggestion-action" data-suggestion-value="${escapeHtml(replacement)}" data-original-value="${escapeHtml(originalInput)}"><span>${escapeHtml(item.en + jp)}</span><small>${escapeHtml(rt("applySuggestion", lang))}</small></button>`;
  }).join("");
  return `<div class="suggestion-box"><div class="suggestion-title">${escapeHtml(rt("suggestionTitle", lang))}</div><div class="suggestion-list">${chips}</div><div class="small suggestion-hint">${escapeHtml(rt("suggestionHint", lang))}</div></div>`;
}

function setupResultInteractions(container, lang) {
  let activeFilter = "all";
  let reviewIndex = -1;
  const status = container.querySelector(".fastscan-result-action-status");
  const reviewPosition = container.querySelector(".fastscan-review-position");
  const reviewNavButtons = [...container.querySelectorAll("[data-review-nav]")];
  const cards = () => [...container.querySelectorAll(".result-card[data-result-state]")];
  const reviewCards = () => cards().filter(card => !card.hidden && (card.dataset.resultState === "review" || card.dataset.resultState === "unknown"));

  const clearReviewHighlight = () => { for (const card of cards()) card.classList.remove("is-current-review"); };
  const syncReviewQueue = () => {
    const queue = reviewCards();
    const disabled = queue.length === 0;
    for (const button of reviewNavButtons) button.disabled = disabled;
    if (!queue.length) {
      reviewIndex = -1;
      clearReviewHighlight();
      if (reviewPosition) reviewPosition.textContent = rt("reviewQueueEmpty", lang);
      return;
    }
    if (reviewIndex >= queue.length) reviewIndex = -1;
    clearReviewHighlight();
    if (reviewIndex >= 0) {
      queue[reviewIndex].classList.add("is-current-review");
      if (reviewPosition) reviewPosition.textContent = rt("reviewQueuePosition", lang, reviewIndex + 1, queue.length);
    } else if (reviewPosition) reviewPosition.textContent = rt("reviewQueueReady", lang, queue.length);
  };

  const moveReview = (direction) => {
    const queue = reviewCards();
    if (!queue.length) { syncReviewQueue(); return; }
    if (reviewIndex < 0) reviewIndex = direction < 0 ? queue.length - 1 : 0;
    else reviewIndex = (reviewIndex + direction + queue.length) % queue.length;
    clearReviewHighlight();
    const card = queue[reviewIndex];
    card.classList.add("is-current-review");
    if (reviewPosition) reviewPosition.textContent = rt("reviewQueuePosition", lang, reviewIndex + 1, queue.length);
    if (typeof card.scrollIntoView === "function") card.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof card.focus === "function") card.focus({ preventScroll: true });
  };

  const applyFilter = () => {
    const allCards = cards();
    let visible = 0;
    for (const card of allCards) {
      const state = card.dataset.resultState;
      const show = activeFilter === "all" || (activeFilter === "matched" ? state === "matched" || state === "review" : state === activeFilter);
      card.hidden = !show;
      if (show) visible += 1;
    }
    container.querySelectorAll("[data-result-filter]").forEach(button => {
      const active = button.dataset.resultFilter === activeFilter;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
    });
    if (status) status.textContent = rt("filterCount", lang, visible, allCards.length);
    syncReviewQueue();
  };

  container.querySelectorAll("[data-result-filter]").forEach(button => {
    if (button.hidden) return;
    button.addEventListener("click", () => { activeFilter = button.dataset.resultFilter || "all"; reviewIndex = -1; applyFilter(); });
  });
  reviewNavButtons.forEach(button => { button.addEventListener("click", () => moveReview(button.dataset.reviewNav === "prev" ? -1 : 1)); });

  container.querySelectorAll(".suggestion-action[data-suggestion-value]").forEach(button => {
    button.addEventListener("click", () => {
      const input = resultInputForContainer(container);
      const original = button.dataset.originalValue || "";
      const replacement = button.dataset.suggestionValue || "";
      if (!input || !original || !replacement) return;
      const index = input.value.indexOf(original);
      if (index < 0) { if (status) status.textContent = rt("applyFailed", lang); return; }
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

function rt(key, lang, ...args) {
  const value = RESULT_TEXT[key]?.[lang] || RESULT_TEXT[key]?.ja || "";
  return typeof value === "function" ? value(...args) : value;
}

function summarizeResults(results) {
  return results.reduce((acc, item) => {
    if (!item.found) { acc.unknown += 1; return acc; }
    acc.known += 1;
    if (isReviewState(item.safety)) acc.review += 1;
    return acc;
  }, { known: 0, review: 0, unknown: 0 });
}

function isReviewState(value) {
  const key = String(value || "").toLowerCase();
  return key === "caution" || key === "risk";
}

// Matching route metadata remains available in core_matcher for QA/debugging, but is intentionally not shown in the public result UI.
// Public results no longer present “辞書一致”, Canonical INCI duplication, 照合方法, or 一致表記 as user value.

document.addEventListener("DOMContentLoaded", () => {
  const supportButton = document.getElementById("support-button");
  const supportOverlay = document.getElementById("support-overlay");
  const supportClose = document.getElementById("support-close");
  if (!supportButton || !supportOverlay) return;
  const openSupport = () => { supportOverlay.hidden = false; };
  const closeSupport = () => { supportOverlay.hidden = true; };
  supportButton.addEventListener("click", openSupport);
  supportClose?.addEventListener("click", closeSupport);
  supportOverlay.addEventListener("click", (event) => { if (event.target === supportOverlay) closeSupport(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !supportOverlay.hidden) closeSupport(); });
});

function escapeHtml(str) {
  return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
