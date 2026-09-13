(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const category = $("categorySelect");
  const gender = $("genderSelect");
  const base = $("baseSelect");
  const input = $("sizeInput");
  const quick = $("quickResult");
  const shoeResult = $("shoeFitResult");
  const clothingResult = $("clothFitResult");
  if (!category || !gender || !base || !input || !quick || !shoeResult || !clothingResult) return;

  const HANDOFF_CLASS = "fit-handoff-action";

  function isEnglish() {
    return (document.documentElement.lang || "ja").toLowerCase().startsWith("en");
  }

  function shoeJpValue(target) {
    const pills = [...target.querySelectorAll(".fit-size-pill")];
    const jp = pills.find((pill) => pill.querySelector("span")?.textContent?.trim()?.toUpperCase() === "JP");
    return jp?.querySelector("strong")?.textContent?.trim() || null;
  }

  function clothingJpValue(target) {
    return target.querySelector(".clothing-fit-size")?.textContent?.trim() || null;
  }

  function recommendedJp(target, kind) {
    if (!target.querySelector(".fit-card") || target.querySelector(".fit-card.error")) return null;
    return kind === "shoes" ? shoeJpValue(target) : clothingJpValue(target);
  }

  function handoff(kind, chart, jpSize) {
    if (!jpSize) return;

    category.value = kind;
    category.dispatchEvent(new Event("change", { bubbles: true }));
    gender.value = chart;
    gender.dispatchEvent(new Event("change", { bubbles: true }));
    base.value = "jp";
    base.dispatchEvent(new Event("change", { bubbles: true }));
    input.value = `JP ${jpSize}`;
    input.dispatchEvent(new Event("input", { bubbles: true }));

    quick.scrollIntoView({ behavior: "smooth", block: "start" });
    input.focus({ preventScroll: true });
  }

  function applyLabels(wrap, jpSize) {
    const en = isEnglish();
    const button = wrap.querySelector("button");
    const note = wrap.querySelector(".fit-handoff-note");
    if (button) button.textContent = en ? "Use this estimate in the converter" : "この目安を換算欄で使う";
    if (note) {
      note.textContent = en
        ? `Only the estimated JP size (${jpSize}) is copied into the direct converter. Measurement values stay on this page.`
        : `目安として出たJPサイズ（${jpSize}）だけを直接換算欄へ渡します。入力した実寸値はこのページ内に残ります。`;
    }
  }

  function renderHandoff(target, kind) {
    const jpSize = recommendedJp(target, kind);
    const existing = target.querySelector(`.${HANDOFF_CLASS}`);

    if (!jpSize) {
      if (existing) existing.remove();
      return;
    }

    const chart = gender.value;
    if (existing && existing.dataset.kind === kind && existing.dataset.chart === chart && existing.dataset.jp === jpSize) {
      applyLabels(existing, jpSize);
      return;
    }

    if (existing) existing.remove();
    const wrap = document.createElement("div");
    wrap.className = HANDOFF_CLASS;
    wrap.dataset.kind = kind;
    wrap.dataset.chart = chart;
    wrap.dataset.jp = jpSize;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "primary-btn";
    button.addEventListener("click", () => handoff(kind, chart, jpSize));

    const note = document.createElement("p");
    note.className = "fit-handoff-note";

    wrap.append(button, note);
    applyLabels(wrap, jpSize);
    target.querySelector(".fit-card")?.appendChild(wrap);
  }

  function refresh() {
    renderHandoff(shoeResult, "shoes");
    renderHandoff(clothingResult, "clothing");
  }

  const shoeObserver = new MutationObserver(() => renderHandoff(shoeResult, "shoes"));
  const clothingObserver = new MutationObserver(() => renderHandoff(clothingResult, "clothing"));
  shoeObserver.observe(shoeResult, { childList: true, subtree: true });
  clothingObserver.observe(clothingResult, { childList: true, subtree: true });

  const languageObserver = new MutationObserver(refresh);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const style = document.createElement("style");
  style.textContent = `
    .fit-handoff-action{margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0}
    .fit-handoff-note{margin:8px 0 0;font-size:.84rem;line-height:1.5;color:#64748b}
  `;
  document.head.appendChild(style);

  refresh();
  window.addEventListener("pagehide", () => {
    shoeObserver.disconnect();
    clothingObserver.disconnect();
    languageObserver.disconnect();
  }, { once: true });
})();
