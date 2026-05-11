(() => {
  "use strict";

  const PILOTS = [
    { keys: ["石膏ボード", "gypsum board", "drywall"], ja: "石膏ボード", en: "Gypsum board", src: "./images/pilot/gypsum-board.svg?v=20260510-asset-1", caption_ja: "壁や天井の下地に使う板材。", caption_en: "Board used for wall and ceiling lining." },
    { keys: ["トルクレンチ", "torque wrench"], ja: "トルクレンチ", en: "Torque wrench", src: "./images/pilot/torque-wrench.svg?v=20260510-asset-1", caption_ja: "指定トルクで締付確認する工具。", caption_en: "Tool used to tighten to a specified torque." },
    { keys: ["アンカーボルト", "anchor bolt", "concrete anchor", "コンクリートアンカー"], ja: "アンカーボルト", en: "Anchor bolt", src: "./images/pilot/concrete-anchor.svg?v=20260510-asset-1", caption_ja: "基礎やコンクリートに部材を固定する金物。", caption_en: "Fixing used to secure members to concrete or foundations." },
    { keys: ["床レベラー", "floor leveler", "floor leveller"], ja: "床レベラー", en: "Floor leveler", src: "./images/pilot/floor-leveler.svg?v=20260510-asset-1", caption_ja: "床の不陸をならす下地調整材。", caption_en: "Material used to level uneven floors." },
    { keys: ["レーザー墨出し", "レーザー墨出し器", "laser level"], ja: "レーザー墨出し器", en: "Laser level", src: "./images/pilot/laser-level.svg?v=20260510-asset-1", caption_ja: "水平・垂直の基準線を投影する工具。", caption_en: "Tool that projects level and plumb reference lines." },
    { keys: ["コーキングガン", "caulking gun"], ja: "コーキングガン", en: "Caulking gun", src: "./images/pilot/caulking-gun.svg?v=20260510-asset-1", caption_ja: "シーリング材を目地へ押し出す工具。", caption_en: "Tool used to dispense sealant into joints." },
    { keys: ["クランプ", "scaffold clamp"], ja: "クランプ", en: "Scaffold clamp", src: "./images/pilot/scaffold-clamp.svg?v=20260510-asset-1", caption_ja: "単管同士を固定する足場用金具。", caption_en: "Clamp used to connect scaffold pipes." },
    { keys: ["ケーブルトレイ", "cable tray"], ja: "ケーブルトレイ", en: "Cable tray", src: "./images/pilot/cable-tray.svg?v=20260510-asset-1", caption_ja: "ケーブルをまとめて敷設する受け材。", caption_en: "Tray used to support and organize cable runs." },
    { keys: ["サッシ", "window sash"], ja: "サッシ", en: "Window sash", src: "./images/pilot/window-sash.svg?v=20260510-asset-1", caption_ja: "ガラスを納める窓の枠・可動部材。", caption_en: "Window frame or operable unit that holds glazing." },
    { keys: ["保護メガネ", "safety glasses", "ppe eyewear"], ja: "保護メガネ", en: "Safety glasses", src: "./images/pilot/ppe-eyewear.svg?v=20260510-asset-1", caption_ja: "切粉や粉じんから目を守る保護具。", caption_en: "Eye protection used against chips and dust." },

    { keys: ["インパクトドライバー", "インパクト", "impact driver"], ja: "インパクトドライバー", en: "Impact driver", src: "./images/pilot/impact-driver.svg?v=20260510-asset-2", caption_ja: "ビスやボルトを強いトルクで締める電動工具。", caption_en: "Power tool used for high-torque fastening." },
    { keys: ["ドリルドライバー", "drill driver"], ja: "ドリルドライバー", en: "Drill driver", src: "./images/pilot/drill-driver.svg?v=20260510-asset-2", caption_ja: "穴あけと軽いねじ締めに使う電動工具。", caption_en: "Power tool used for drilling and screw driving." },
    { keys: ["振動ドリル", "hammer drill"], ja: "振動ドリル", en: "Hammer drill", src: "./images/pilot/hammer-drill.svg?v=20260510-asset-2", caption_ja: "モルタルやブロックなどの穴あけに使う振動機能付きドリル。", caption_en: "Drill with hammer action used for masonry drilling." },
    { keys: ["脚立", "stepladder"], ja: "脚立", en: "Stepladder", src: "./images/pilot/stepladder.svg?v=20260510-asset-2", caption_ja: "一時的な高所作業や点検に使う自立式の昇降具。", caption_en: "Self-supporting access tool used for temporary work at height." },
    { keys: ["足場", "scaffold", "scaffolding"], ja: "足場", en: "Scaffold", src: "./images/pilot/scaffold.svg?v=20260510-asset-2", caption_ja: "高所作業のために組み立てる仮設の作業床・支持構造。", caption_en: "Temporary work platform and support structure for work at height." },
    { keys: ["水準器", "水平器", "spirit level", "level"], ja: "水準器", en: "Spirit level", src: "./images/pilot/spirit-level.svg?v=20260510-asset-2", caption_ja: "水平や垂直を確認する測定工具。", caption_en: "Measuring tool used to check level and plumb." },
    { keys: ["コンベックス", "巻尺", "tape measure"], ja: "コンベックス", en: "Tape measure", src: "./images/pilot/tape-measure.svg?v=20260510-asset-2", caption_ja: "長さや位置を測る巻き取り式の測定工具。", caption_en: "Retractable measuring tool used to measure length and layout positions." },
    { keys: ["配管支持金物", "pipe support"], ja: "配管支持金物", en: "Pipe support", src: "./images/pilot/pipe-support.svg?v=20260510-asset-2", caption_ja: "配管を所定位置に保持する支持部材。", caption_en: "Support hardware used to hold piping in position." },
    { keys: ["ダクト", "duct"], ja: "ダクト", en: "Duct", src: "./images/pilot/duct.svg?v=20260510-asset-2", caption_ja: "換気や空調の空気を通す通風路。", caption_en: "Air passage used for ventilation or HVAC airflow." },
    { keys: ["一輪車", "wheelbarrow"], ja: "一輪車", en: "Wheelbarrow", src: "./images/pilot/wheelbarrow.svg?v=20260510-asset-2", caption_ja: "土砂、モルタル、廃材などを運ぶ一輪の運搬具。", caption_en: "One-wheeled cart used to move soil, mortar, or debris." }
  ];

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[（）()［］\[\]【】]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function currentTokens() {
    const terms = document.getElementById("detailTerms");
    const title = terms?.querySelector(".termblock__title")?.textContent || "";
    const sub = terms?.querySelector(".termblock__sub")?.textContent || "";
    const aliases = document.getElementById("tabAliases")?.textContent || "";
    const raw = `${title}\n${sub}\n${aliases}`;
    return raw
      .split(/[\/\n,、]+/)
      .map(normalize)
      .filter(Boolean);
  }

  function matchPilot() {
    const tokens = new Set(currentTokens());
    if (!tokens.size) return null;
    return PILOTS.find((item) => item.keys.some((key) => tokens.has(normalize(key)))) || null;
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
