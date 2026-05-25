(() => {
  "use strict";

  const PILOTS = [
    { keys: ["刷毛", "paint brush"], ja: "刷毛", en: "Paint brush", src: "./images/pilot/paint-brush.svg?v=20260510-asset-4", caption_ja: "塗料やプライマーを細部へ塗る手工具。", caption_en: "Hand tool used to apply paint or primer to detail areas." },
    { keys: ["ローラー刷毛", "paint roller"], ja: "ローラー刷毛", en: "Paint roller", src: "./images/pilot/paint-roller.svg?v=20260510-asset-4", caption_ja: "壁や天井など広い面に塗料を塗る工具。", caption_en: "Tool used to apply coating over wide surfaces." },
    { keys: ["パテベラ", "putty knife"], ja: "パテベラ", en: "Putty knife", src: "./images/pilot/putty-knife.svg?v=20260510-asset-4", caption_ja: "パテや補修材を伸ばすためのヘラ。", caption_en: "Blade tool used to spread filler or repair compound." },
    { keys: ["左官鏝", "左官こて", "plaster trowel"], ja: "左官鏝", en: "Plaster trowel", src: "./images/pilot/plaster-trowel.svg?v=20260510-asset-4", caption_ja: "モルタルや漆喰を塗り広げて仕上げる鏝。", caption_en: "Trowel used to apply and finish plaster or mortar." },
    { keys: ["目地ゴテ", "grout float"], ja: "目地ゴテ", en: "Grout float", src: "./images/pilot/grout-float.svg?v=20260510-asset-4", caption_ja: "タイル目地材を押し込んでならす工具。", caption_en: "Tool used to spread grout into tile joints." },
    { keys: ["タイルカッター", "tile cutter"], ja: "タイルカッター", en: "Tile cutter", src: "./images/pilot/tile-cutter.svg?v=20260510-asset-4", caption_ja: "タイルを直線的に切るための工具。", caption_en: "Tool used to score and cut tile." },
    { keys: ["タイルスペーサー", "tile spacer"], ja: "タイルスペーサー", en: "Tile spacer", src: "./images/pilot/tile-spacer.svg?v=20260510-asset-4", caption_ja: "タイルの目地幅を一定に保つ部材。", caption_en: "Spacer used to keep tile joint width consistent." },
    { keys: ["シーリング目地", "sealant joint"], ja: "シーリング目地", en: "Sealant joint", src: "./images/pilot/sealant-joint.svg?v=20260510-asset-4", caption_ja: "外装や建具まわりの隙間をシーリング材で塞ぐ目地。", caption_en: "Joint sealed with sealant around panels or openings." },
    { keys: ["プライマー", "primer"], ja: "プライマー", en: "Primer", src: "./images/pilot/primer-can.svg?v=20260510-asset-4", caption_ja: "仕上げ材や接着材の密着を助ける下塗り材。", caption_en: "Base material used to improve adhesion." },
    { keys: ["ローラーバケット", "paint tray"], ja: "ローラーバケット", en: "Paint tray", src: "./images/pilot/paint-tray.svg?v=20260510-asset-4", caption_ja: "ローラー塗装時に塗料を入れて使う容器。", caption_en: "Tray used to hold coating for roller application." },
    { keys: ["床スクレーパー", "floor scraper"], ja: "床スクレーパー", en: "Floor scraper", src: "./images/pilot/floor-scraper.svg?v=20260510-asset-4", caption_ja: "床材や接着剤残りを削り取る工具。", caption_en: "Tool used to remove flooring or adhesive residue." },
    { keys: ["床ポリッシャー", "floor polisher"], ja: "床ポリッシャー", en: "Floor polisher", src: "./images/pilot/floor-polisher.svg?v=20260510-asset-4", caption_ja: "床面を洗浄・研磨する機械。", caption_en: "Machine used to clean or polish floor surfaces." },
    { keys: ["点検口", "access panel"], ja: "点検口", en: "Access panel", src: "./images/pilot/access-panel.svg?v=20260510-asset-4", caption_ja: "天井内や壁内の設備を点検するための開口。", caption_en: "Panel used to access concealed services for inspection." },
    { keys: ["天井吊り金物", "ceiling hanger"], ja: "天井吊り金物", en: "Ceiling hanger", src: "./images/pilot/ceiling-hanger.svg?v=20260510-asset-4", caption_ja: "天井下地を上部構造から吊るための支持金物。", caption_en: "Hardware used to suspend ceiling members." },
    { keys: ["ダクト吊り金物", "duct hanger"], ja: "ダクト吊り金物", en: "Duct hanger", src: "./images/pilot/duct-hanger.svg?v=20260510-asset-4", caption_ja: "ダクトを天井から支持する金物。", caption_en: "Hardware used to suspend ductwork." },
    { keys: ["ガラリ", "grille"], ja: "ガラリ", en: "Grille", src: "./images/pilot/grille.svg?v=20260510-asset-4", caption_ja: "空気の出入口に取り付ける格子状部材。", caption_en: "Grid or louver component used at air openings." },
    { keys: ["吹出口", "air diffuser"], ja: "吹出口", en: "Air diffuser", src: "./images/pilot/diffuser.svg?v=20260510-asset-4", caption_ja: "空調空気を室内へ拡散して吹き出す部材。", caption_en: "Air terminal that distributes supply air into a room." },
    { keys: ["フレキシブルダクト", "flexible duct"], ja: "フレキシブルダクト", en: "Flexible duct", src: "./images/pilot/flexible-duct.svg?v=20260510-asset-4", caption_ja: "曲げやすい蛇腹状の空調・換気ダクト。", caption_en: "Bendable duct used for HVAC or ventilation connections." },
    { keys: ["配管保温材", "pipe insulation"], ja: "配管保温材", en: "Pipe insulation", src: "./images/pilot/pipe-insulation.svg?v=20260510-asset-4", caption_ja: "配管の熱損失や結露を抑える保温材。", caption_en: "Insulation used to reduce heat loss or condensation on pipes." },
    { keys: ["ビニル床タイル", "vinyl floor tile"], ja: "ビニル床タイル", en: "Vinyl floor tile", src: "./images/pilot/vinyl-floor-tile.svg?v=20260510-asset-4", caption_ja: "店舗や施設で使われる塩ビ系の床仕上げ材。", caption_en: "PVC-based modular floor finish used in shops and facilities." }
  ];

  const normalize = (value) => String(value || "").toLowerCase().replace(/[（）()［］\[\]【】]/g, " ").replace(/\s+/g, " ").trim();
  const lang = () => document.documentElement.lang === "en" ? "en" : "ja";
  const clear = (node) => { if (!node) return; while (node.firstChild) node.removeChild(node.firstChild); };

  function currentTokens() {
    const terms = document.getElementById("detailTerms");
    const raw = [
      terms?.querySelector(".termblock__title")?.textContent || "",
      terms?.querySelector(".termblock__sub")?.textContent || "",
      document.getElementById("tabAliases")?.textContent || ""
    ].join("\n");
    return raw.split(/[\/\n,、]+/).map(normalize).filter(Boolean);
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

    const item = matchPilot();
    if (!item) {
      if (slot.dataset.ctaExtraImage === "1") {
        clear(slot);
        slot.hidden = true;
        delete slot.dataset.ctaExtraImage;
      }
      return;
    }

    clear(slot);
    slot.dataset.ctaExtraImage = "1";
    const current = lang();
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = current === "ja" ? item.ja : item.en;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => { clear(slot); slot.hidden = true; delete slot.dataset.ctaExtraImage; }, { once: true });
    slot.appendChild(img);
    const caption = document.createElement("figcaption");
    caption.textContent = current === "ja" ? item.caption_ja : item.caption_en;
    slot.appendChild(caption);
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
