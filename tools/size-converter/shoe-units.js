(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const shoeSection = $("shoeFitSection");
  const footLength = $("footLength");
  const footWidth = $("footWidth");
  const run = $("shoeFitRun");
  const result = $("shoeFitResult");
  if (!shoeSection || !footLength || !footWidth || !run || !result) return;

  let lastConverted = null;

  function isEnglish() {
    return (document.documentElement.lang || "ja").toLowerCase().startsWith("en");
  }

  function parseNumber(value) {
    const raw = String(value || "").trim().replace(",", ".");
    if (!raw) return null;
    const number = Number(raw);
    return Number.isFinite(number) ? number : NaN;
  }

  function ensureUnitControl() {
    let select = $("shoeMeasureUnit");
    if (select) return select;
    const grid = shoeSection.querySelector(".measure-grid");
    if (!grid) return null;

    const label = document.createElement("label");
    label.id = "shoeMeasureUnitLabel";
    label.innerHTML = `<span class="shoe-unit-label"></span><select id="shoeMeasureUnit"><option value="cm">cm</option><option value="inch">inch</option></select><small class="shoe-unit-note"></small>`;
    grid.prepend(label);
    select = $("shoeMeasureUnit");
    select.addEventListener("change", () => {
      lastConverted = null;
      updateLabels();
    });
    return select;
  }

  function updateLabels() {
    const select = ensureUnitControl();
    if (!select) return;
    const en = isEnglish();
    $("shoeMeasureUnitLabel")?.querySelector(".shoe-unit-label")?.replaceChildren(document.createTextNode(en ? "Measurement unit" : "実寸の単位"));
    const note = $("shoeMeasureUnitLabel")?.querySelector(".shoe-unit-note");
    if (note) {
      note.textContent = select.value === "inch"
        ? (en ? "Inch values are converted locally to cm only for the existing fit calculation." : "inch入力は既存の判定時だけブラウザ内でcmへ換算します。")
        : (en ? "The core fit calculation uses cm." : "判定の正本はcmです。");
    }
    const lengthLabel = footLength.closest("label")?.querySelector('[data-i18n="ja"]');
    const lengthLabelEn = footLength.closest("label")?.querySelector('[data-i18n="en"]');
    const widthLabel = footWidth.closest("label")?.querySelector('[data-i18n="ja"]');
    const widthLabelEn = footWidth.closest("label")?.querySelector('[data-i18n="en"]');
    const unit = select.value === "inch" ? "inch" : "cm";
    if (lengthLabel) lengthLabel.textContent = `足長（${unit}・必須）`;
    if (lengthLabelEn) lengthLabelEn.textContent = `Foot length (${unit}, required)`;
    if (widthLabel) widthLabel.textContent = `足幅（${unit}・任意）`;
    if (widthLabelEn) widthLabelEn.textContent = `Foot width (${unit}, optional)`;
  }

  function prepareInchForCore() {
    const select = ensureUnitControl();
    lastConverted = null;
    if (!select || select.value !== "inch") return;

    const originalLength = footLength.value;
    const originalWidth = footWidth.value;
    const length = parseNumber(originalLength);
    const width = parseNumber(originalWidth);
    if (Number.isFinite(length)) footLength.value = String(length * 2.54);
    if (Number.isFinite(width)) footWidth.value = String(width * 2.54);

    lastConverted = {
      originalLength,
      originalWidth,
      lengthInch: Number.isFinite(length) ? length : null,
      widthInch: Number.isFinite(width) ? width : null
    };

    queueMicrotask(() => {
      footLength.value = originalLength;
      footWidth.value = originalWidth;
      appendConversionNote();
    });
  }

  function appendConversionNote() {
    result.querySelectorAll(".shoe-unit-result-note").forEach((node) => node.remove());
    if (!lastConverted || !Number.isFinite(lastConverted.lengthInch)) return;
    const card = result.querySelector(".fit-card");
    if (!card) return;

    const note = document.createElement("p");
    note.className = "fit-note subtle shoe-unit-result-note";
    const cmLength = lastConverted.lengthInch * 2.54;
    const widthText = Number.isFinite(lastConverted.widthInch)
      ? ` / ${lastConverted.widthInch.toFixed(2)} in → ${(lastConverted.widthInch * 2.54).toFixed(1)} cm`
      : "";
    note.textContent = isEnglish()
      ? `Local conversion used for this check: ${lastConverted.lengthInch.toFixed(2)} in → ${cmLength.toFixed(1)} cm${widthText}. Your input fields remain in inches.`
      : `この判定ではローカル換算: ${lastConverted.lengthInch.toFixed(2)} in → ${cmLength.toFixed(1)} cm${widthText}。入力欄はinchのまま保持します。`;
    card.appendChild(note);
  }

  const unit = ensureUnitControl();
  run.addEventListener("click", prepareInchForCore, { capture: true });

  const languageObserver = new MutationObserver(updateLabels);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  const style = document.createElement("style");
  style.textContent = `
    #shoeMeasureUnitLabel small{display:block;margin-top:5px;font-size:.78rem;line-height:1.4;color:#64748b}
    .shoe-unit-result-note{margin-top:10px}
  `;
  document.head.appendChild(style);

  if (unit) updateLabels();
  window.addEventListener("pagehide", () => languageObserver.disconnect(), { once: true });
})();
