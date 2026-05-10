(() => {
  "use strict";

  const PILOTS = [
    { keys: ["石膏ボード", "gypsum board", "drywall"], ja: "石膏ボード", en: "Gypsum board", src: "./images/pilot/gypsum-board.svg?v=20260510-asset-1", caption_ja: "壁や天井の下地に使う板材。", caption_en: "Board used for wall and ceiling lining." },
    { keys: ["トルクレンチ", "torque wrench"], ja: "トルクレンチ", en: "Torque wrench", src: "./images/pilot/torque-wrench.svg?v=20260510-asset-1", caption_ja: "指定トルクで締付確認する工具。", caption_en: "Tool used to tighten to a specified torque." },
    { keys: ["アンカーボルト", "anchor bolt", "concrete anchor", "コンクリートアンカー"], ja: "アンカーボルト", en: "Anchor bolt", src: "./images/pilot/concrete-anchor.svg?v=20260510-asset-1", caption_ja: "基礎やコンクリートに部材を固定する金物。", caption_en: "Fixing used to secure members to concrete or foundations." },
    { keys: ["床レベラー", "floor leveler", "floor leveller"], ja: "床レベラー", en: "Floor leveler", src: "./images/pilot/floor-leveler.svg?v=20260510-asset-1", caption_ja: "床の不陸をならす下地調整材。", caption_en: "Material used to level uneven floors." },
    { keys: ["レーザー墨出し", "laser level"], ja: "レーザー墨出し器", en: "Laser level", src: "./images/pilot/laser-level.svg?v=20260510-asset-1", caption_ja: "水平・垂直の基準線を投影する工具。", caption_en: "Tool that projects level and plumb reference lines." },
    { keys: ["コーキングガン", "caulking gun"], ja: "コーキングガン", en: "Caulking gun", src: "./images/pilot/caulking-gun.svg?v=20260510-asset-1", caption_ja: "シーリング材を目地へ押し出す工具。", caption_en: "Tool used to dispense sealant into joints." },
    { keys: ["クランプ", "scaffold clamp"], ja: "クランプ", en: "Scaffold clamp", src: "./images/pilot/scaffold-clamp.svg?v=20260510-asset-1", caption_ja: "単管同士を固定する足場用金具。", caption_en: "Clamp used to connect scaffold pipes." },
    { keys: ["ケーブルトレイ", "cable tray"], ja: "ケーブルトレイ", en: "Cable tray", src: "./images/pilot/cable-tray.svg?v=20260510-asset-1", caption_ja: "ケーブルをまとめて敷設する受け材。", caption_en: "Tray used to support and organize cable runs." },
    { keys: ["サッシ", "window sash"], ja: "サッシ", en: "Window sash", src: "./images/pilot/window-sash.svg?v=20260510-asset-1", caption_ja: "ガラスを納める窓の枠・可動部材。", caption_en: "Window frame or operable unit that holds glazing." },
    { keys: ["保護メガネ", "safety glasses", "ppe eyewear"], ja: "保護メガネ", en: "Safety glasses", src: "./images/pilot/ppe-eyewear.svg?v=20260510-asset-1", caption_ja: "切粉や粉じんから目を守る保護具。", caption_en: "Eye protection used against chips and dust." }
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
