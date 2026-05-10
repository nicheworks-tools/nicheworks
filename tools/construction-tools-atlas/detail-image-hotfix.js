(() => {
  "use strict";

  const PILOTS = [
    { keys: ["石膏ボード", "gypsum board", "drywall"], ja: "石膏ボード", en: "Gypsum board", caption_ja: "壁や天井の下地に使う板材。", caption_en: "Board used for wall and ceiling lining." },
    { keys: ["床レベラー", "floor leveler", "floor leveller"], ja: "床レベラー", en: "Floor leveler", caption_ja: "床の不陸をならす下地調整材。", caption_en: "Material used to level uneven floors." },
    { keys: ["トルクレンチ", "torque wrench"], ja: "トルクレンチ", en: "Torque wrench", caption_ja: "指定トルクで締付確認する工具。", caption_en: "Tool used to tighten to a specified torque." },
    { keys: ["アンカーボルト", "anchor bolt"], ja: "アンカーボルト", en: "Anchor bolt", caption_ja: "基礎やコンクリートに部材を固定するボルト。", caption_en: "Bolt used to fix members to concrete or foundations." },
    { keys: ["レーザー墨出し", "laser level"], ja: "レーザー墨出し器", en: "Laser level", caption_ja: "水平・垂直の基準線を投影する工具。", caption_en: "Tool that projects level and plumb reference lines." },
    { keys: ["コーキングガン", "caulking gun"], ja: "コーキングガン", en: "Caulking gun", caption_ja: "シーリング材を目地へ押し出す工具。", caption_en: "Tool used to dispense sealant into joints." },
    { keys: ["クランプ", "scaffold clamp"], ja: "クランプ", en: "Scaffold clamp", caption_ja: "単管同士を固定する足場用金具。", caption_en: "Clamp used to connect scaffold pipes." },
    { keys: ["ケーブルトレイ", "cable tray"], ja: "ケーブルトレイ", en: "Cable tray", caption_ja: "ケーブルをまとめて敷設する受け材。", caption_en: "Tray used to support and organize cable runs." },
    { keys: ["サッシ", "window sash"], ja: "サッシ", en: "Window sash", caption_ja: "ガラスを納める窓の枠・可動部材。", caption_en: "Window frame or operable unit that holds glazing." },
    { keys: ["保護メガネ", "safety glasses"], ja: "保護メガネ", en: "Safety glasses", caption_ja: "切粉や粉じんから目を守る保護具。", caption_en: "Eye protection used against chips and dust." },
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

  function makeSvg(label) {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 320 180");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);

    const bg = document.createElementNS(ns, "rect");
    bg.setAttribute("width", "320");
    bg.setAttribute("height", "180");
    bg.setAttribute("rx", "18");
    bg.setAttribute("fill", "#f7f7f4");
    svg.appendChild(bg);

    const card = document.createElementNS(ns, "rect");
    card.setAttribute("x", "42");
    card.setAttribute("y", "52");
    card.setAttribute("width", "236");
    card.setAttribute("height", "84");
    card.setAttribute("rx", "14");
    card.setAttribute("fill", "#ffffff");
    card.setAttribute("stroke", "#d4d7dd");
    card.setAttribute("stroke-width", "3");
    svg.appendChild(card);

    const top = document.createElementNS(ns, "path");
    top.setAttribute("d", "M72 84h176");
    top.setAttribute("stroke", "#20242a");
    top.setAttribute("stroke-width", "10");
    top.setAttribute("stroke-linecap", "round");
    svg.appendChild(top);

    const bottom = document.createElementNS(ns, "path");
    bottom.setAttribute("d", "M92 112h136");
    bottom.setAttribute("stroke", "#737a84");
    bottom.setAttribute("stroke-width", "7");
    bottom.setAttribute("stroke-linecap", "round");
    svg.appendChild(bottom);

    const dot1 = document.createElementNS(ns, "circle");
    dot1.setAttribute("cx", "82");
    dot1.setAttribute("cy", "112");
    dot1.setAttribute("r", "5");
    dot1.setAttribute("fill", "#737a84");
    svg.appendChild(dot1);

    const dot2 = document.createElementNS(ns, "circle");
    dot2.setAttribute("cx", "238");
    dot2.setAttribute("cy", "112");
    dot2.setAttribute("r", "5");
    dot2.setAttribute("fill", "#737a84");
    svg.appendChild(dot2);

    const text = document.createElementNS(ns, "text");
    text.setAttribute("x", "30");
    text.setAttribute("y", "35");
    text.setAttribute("font-family", "Arial, sans-serif");
    text.setAttribute("font-size", "16");
    text.setAttribute("font-weight", "700");
    text.setAttribute("fill", "#20242a");
    text.textContent = label;
    svg.appendChild(text);

    return svg;
  }

  function render() {
    const detail = document.getElementById("detailSheet");
    const slot = ensureSlot();
    if (!detail || detail.hidden || !slot) return;

    clear(slot);
    slot.hidden = true;

    const item = matchPilot();
    if (!item) return;

    const current = lang();
    const label = current === "ja" ? item.ja : item.en;
    const caption = current === "ja" ? item.caption_ja : item.caption_en;
    slot.appendChild(makeSvg(label));
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
