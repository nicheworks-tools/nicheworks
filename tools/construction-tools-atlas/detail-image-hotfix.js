(() => {
  "use strict";

  const PILOTS = [
    {
      keys: ["石膏ボード", "gypsum board", "drywall"],
      ja: "石膏ボード",
      en: "Gypsum board",
      src: "./images/pilot/gypsum-board.svg?v=20260510-asset-1",
      caption_ja: "壁や天井の下地に使う板材。",
      caption_en: "Board used for wall and ceiling lining."
    }
  ];

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function currentText() {
    const title = document.getElementById("detailTerms")?.textContent || "";
    const meta = document.getElementById("tabMeta")?.textContent || "";
    const aliases = document.getElementById("tabAliases")?.textContent || "";
    return `${title}\n${meta}\n${aliases}`.toLowerCase();
  }

  function matchPilot() {
    const hay = currentText();
    if (!hay.trim()) return null;
    return PILOTS.find((item) => item.keys.some((key) => hay.includes(String(key).toLowerCase()))) || null;
  }

  function ensureSlot() {
    const terms = document.getElementById("detailTerms");
    if (!terms) return null;
    let slot = document.getElementById("detailImagePilot");
    if (!slot) {
      slot = document.createElement("figure");
      slot.id = "detailImagePilot";
      slot.className = "detailImagePilot";
      terms.insertAdjacentElement("afterend", slot);
    } else if (slot.previousElementSibling !== terms) {
      terms.insertAdjacentElement("afterend", slot);
    }
    return slot;
  }

  function render() {
    const detail = document.getElementById("detailSheet");
    const slot = ensureSlot();
    if (!detail || detail.hidden || !slot) return;

    clear(slot);
    slot.hidden = true;

    const item = matchPilot();
    if (!item || !item.src) return;

    const current = lang();
    const label = current === "ja" ? item.ja : item.en;
    const caption = current === "ja" ? item.caption_ja : item.caption_en;

    const img = document.createElement("img");
    img.src = item.src;
    img.alt = label;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      clear(slot);
      slot.hidden = true;
    }, { once: true });
    slot.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = caption;
    slot.appendChild(figcaption);
    slot.hidden = false;
  }

  function schedule() {
    setTimeout(render, 0);
    setTimeout(render, 120);
    setTimeout(render, 300);
  }

  document.addEventListener("DOMContentLoaded", () => {
    schedule();
    document.addEventListener("click", schedule, true);
    document.addEventListener("keydown", schedule, true);
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
  });
})();
