(() => {
  "use strict";

  const PILOTS = [
    ["石膏ボード|gypsum board|drywall", "石膏ボード", "Gypsum board", "./images/pilot/gypsum-board.svg?v=20260510-asset-1", "壁や天井の下地に使う板材。", "Board used for wall and ceiling lining."],
    ["トルクレンチ|torque wrench", "トルクレンチ", "Torque wrench", "./images/pilot/torque-wrench.svg?v=20260510-asset-1", "指定トルクで締付確認する工具。", "Tool used to tighten to a specified torque."],
    ["アンカーボルト|anchor bolt|concrete anchor|コンクリートアンカー", "アンカーボルト", "Anchor bolt", "./images/pilot/concrete-anchor.svg?v=20260510-asset-1", "基礎やコンクリートに部材を固定する金物。", "Fixing used to secure members to concrete or foundations."],
    ["床レベラー|floor leveler|floor leveller", "床レベラー", "Floor leveler", "./images/pilot/floor-leveler.svg?v=20260510-asset-1", "床の不陸をならす下地調整材。", "Material used to level uneven floors."],
    ["レーザー墨出し|レーザー墨出し器|laser level", "レーザー墨出し器", "Laser level", "./images/pilot/laser-level.svg?v=20260510-asset-1", "水平・垂直の基準線を投影する工具。", "Tool that projects level and plumb reference lines."],
    ["コーキングガン|caulking gun", "コーキングガン", "Caulking gun", "./images/pilot/caulking-gun.svg?v=20260510-asset-1", "シーリング材を目地へ押し出す工具。", "Tool used to dispense sealant into joints."],
    ["クランプ|scaffold clamp", "クランプ", "Scaffold clamp", "./images/pilot/scaffold-clamp.svg?v=20260510-asset-1", "単管同士を固定する足場用金具。", "Clamp used to connect scaffold pipes."],
    ["ケーブルトレイ|cable tray", "ケーブルトレイ", "Cable tray", "./images/pilot/cable-tray.svg?v=20260510-asset-1", "ケーブルをまとめて敷設する受け材。", "Tray used to support and organize cable runs."],
    ["サッシ|window sash", "サッシ", "Window sash", "./images/pilot/window-sash.svg?v=20260510-asset-1", "ガラスを納める窓の枠・可動部材。", "Window frame or operable unit that holds glazing."],
    ["保護メガネ|safety glasses|ppe eyewear", "保護メガネ", "Safety glasses", "./images/pilot/ppe-eyewear.svg?v=20260510-asset-1", "切粉や粉じんから目を守る保護具。", "Eye protection used against chips and dust."],

    ["インパクトドライバー|インパクト|impact driver", "インパクトドライバー", "Impact driver", "./images/pilot/impact-driver.svg?v=20260510-asset-2", "ビスやボルトを強いトルクで締める電動工具。", "Power tool used for high-torque fastening."],
    ["ドリルドライバー|drill driver", "ドリルドライバー", "Drill driver", "./images/pilot/drill-driver.svg?v=20260510-asset-2", "穴あけと軽いねじ締めに使う電動工具。", "Power tool used for drilling and screw driving."],
    ["振動ドリル|hammer drill", "振動ドリル", "Hammer drill", "./images/pilot/hammer-drill.svg?v=20260510-asset-2", "モルタルやブロックなどの穴あけに使う振動機能付きドリル。", "Drill with hammer action used for masonry drilling."],
    ["脚立|stepladder", "脚立", "Stepladder", "./images/pilot/stepladder.svg?v=20260510-asset-2", "一時的な高所作業や点検に使う自立式の昇降具。", "Self-supporting access tool used for temporary work at height."],
    ["足場|scaffold|scaffolding", "足場", "Scaffold", "./images/pilot/scaffold.svg?v=20260510-asset-2", "高所作業のために組み立てる仮設の作業床・支持構造。", "Temporary work platform and support structure for work at height."],
    ["水準器|水平器|spirit level", "水準器", "Spirit level", "./images/pilot/spirit-level.svg?v=20260510-asset-2", "水平や垂直を確認する測定工具。", "Measuring tool used to check level and plumb."],
    ["コンベックス|巻尺|tape measure", "コンベックス", "Tape measure", "./images/pilot/tape-measure.svg?v=20260510-asset-2", "長さや位置を測る巻き取り式の測定工具。", "Retractable measuring tool used to measure length and layout positions."],
    ["配管支持金物|pipe support", "配管支持金物", "Pipe support", "./images/pilot/pipe-support.svg?v=20260510-asset-2", "配管を所定位置に保持する支持部材。", "Support hardware used to hold piping in position."],
    ["ダクト|duct", "ダクト", "Duct", "./images/pilot/duct.svg?v=20260510-asset-2", "換気や空調の空気を通す通風路。", "Air passage used for ventilation or HVAC airflow."],
    ["一輪車|wheelbarrow", "一輪車", "Wheelbarrow", "./images/pilot/wheelbarrow.svg?v=20260510-asset-2", "土砂、モルタル、廃材などを運ぶ一輪の運搬具。", "One-wheeled cart used to move soil, mortar, or debris."],

    ["ハンマードリル|ロータリーハンマー|rotary hammer", "ハンマードリル", "Rotary hammer", "./images/pilot/rotary-hammer.svg?v=20260510-asset-3", "コンクリート穴あけや軽いはつりに使う強力な電動工具。", "Power tool used for concrete drilling and light chiseling."],
    ["コアドリル|core drill", "コアドリル", "Core drill", "./images/pilot/core-drill.svg?v=20260510-asset-3", "丸い貫通穴を開けるための工具。", "Tool used to make circular penetrations."],
    ["手のこ|手鋸|のこぎり|hand saw", "手のこ", "Hand saw", "./images/pilot/hand-saw.svg?v=20260510-asset-3", "木材や合板を手作業で切る工具。", "Manual saw used to cut wood or panels."],
    ["カッター|utility knife", "カッター", "Utility knife", "./images/pilot/utility-knife.svg?v=20260510-asset-3", "シートや仕上げ材を切る差し替え刃式の工具。", "Replaceable-blade knife used to trim sheets and finishes."],
    ["差し金|指矩|carpenter square", "差し金", "Carpenter square", "./images/pilot/carpenter-square.svg?v=20260510-asset-3", "直角確認や墨付けに使う測定工具。", "Measuring tool used for right-angle marking."],
    ["墨つぼ|チョークライン|chalk line", "墨つぼ", "Chalk line", "./images/pilot/chalk-line.svg?v=20260510-asset-3", "長い直線の墨出しに使う工具。", "Layout tool used to snap long straight lines."],
    ["下げ振り|vertical line check", "下げ振り", "Vertical line check", "./images/pilot/vertical-line-check.svg?v=20260510-asset-3", "垂直方向の基準を確認するための道具。", "Tool used to check vertical alignment."],
    ["レーザー距離計|laser distance meter", "レーザー距離計", "Laser distance meter", "./images/pilot/laser-distance-meter.svg?v=20260510-asset-3", "距離や寸法をレーザーで測る測定工具。", "Measuring tool that uses a laser to measure distance."],
    ["ノギス|caliper", "ノギス", "Caliper", "./images/pilot/caliper.svg?v=20260510-asset-3", "厚みや外径・内径を測る精密測定工具。", "Precision tool used to measure thickness and diameter."],
    ["モンキーレンチ|adjustable wrench", "モンキーレンチ", "Adjustable wrench", "./images/pilot/adjustable-wrench.svg?v=20260510-asset-3", "口幅を調整してナットや継手を回す工具。", "Wrench with an adjustable jaw for nuts and fittings."],
    ["ソケットレンチ|socket wrench", "ソケットレンチ", "Socket wrench", "./images/pilot/socket-wrench.svg?v=20260510-asset-3", "ソケットを使ってボルトやナットを回す工具。", "Wrench used with sockets for bolts and nuts."],
    ["スパナ|open-end wrench", "スパナ", "Open-end wrench", "./images/pilot/open-end-wrench.svg?v=20260510-asset-3", "ナットや継手を回す開口部付きの工具。", "Open-end tool used to turn nuts and fittings."],
    ["作業台|workbench", "作業台", "Workbench", "./images/pilot/workbench.svg?v=20260510-asset-3", "加工や仮置きに使う作業用の台。", "Temporary work surface used for cutting, assembly, or staging."],
    ["台車|platform cart", "台車", "Platform cart", "./images/pilot/platform-cart.svg?v=20260510-asset-3", "資材や工具を運搬するための台車。", "Cart used to move tools and materials."],
    ["カラーコーン|traffic cone", "カラーコーン", "Traffic cone", "./images/pilot/traffic-cone.svg?v=20260510-asset-3", "作業区画や注意箇所を示す保安用品。", "Safety cone used to mark work areas or cautions."],
    ["工具箱|toolbox", "工具箱", "Toolbox", "./images/pilot/toolbox.svg?v=20260510-asset-3", "手工具や小物を収納・運搬する箱。", "Box used to store and carry hand tools."],
    ["作業灯|work light", "作業灯", "Work light", "./images/pilot/work-light.svg?v=20260510-asset-3", "暗所や夜間作業の視認性を確保する照明。", "Portable light used to improve jobsite visibility."],
    ["延長コード|extension cord", "延長コード", "Extension cord", "./images/pilot/extension-cord.svg?v=20260510-asset-3", "仮設電源を離れた場所まで延長するコード。", "Cord used to extend temporary power."],
    ["コードリール|cable reel", "コードリール", "Cable reel", "./images/pilot/cable-reel.svg?v=20260510-asset-3", "電源コードを巻き取って使う仮設電源用品。", "Reel used for temporary power distribution."],
    ["仮囲い|temporary fence", "仮囲い", "Temporary fence", "./images/pilot/temporary-fence.svg?v=20260510-asset-3", "工事区画を周囲から分ける仮設の囲い。", "Temporary barrier used to separate a work area."],

    ["刷毛|paint brush", "刷毛", "Paint brush", "./images/pilot/paint-brush.svg?v=20260510-asset-4", "塗料やプライマーを細部へ塗る手工具。", "Hand tool used to apply paint or primer to detail areas."],
    ["ローラー刷毛|paint roller", "ローラー刷毛", "Paint roller", "./images/pilot/paint-roller.svg?v=20260510-asset-4", "壁や天井など広い面に塗料を塗る工具。", "Tool used to apply coating over wide surfaces."],
    ["パテベラ|putty knife", "パテベラ", "Putty knife", "./images/pilot/putty-knife.svg?v=20260510-asset-4", "パテや補修材を伸ばすためのヘラ。", "Blade tool used to spread filler or repair compound."],
    ["左官鏝|左官こて|plaster trowel", "左官鏝", "Plaster trowel", "./images/pilot/plaster-trowel.svg?v=20260510-asset-4", "モルタルや漆喰を塗り広げて仕上げる鏝。", "Trowel used to apply and finish plaster or mortar."],
    ["目地ゴテ|grout float", "目地ゴテ", "Grout float", "./images/pilot/grout-float.svg?v=20260510-asset-4", "タイル目地材を押し込んでならす工具。", "Tool used to spread grout into tile joints."],
    ["タイルカッター|tile cutter", "タイルカッター", "Tile cutter", "./images/pilot/tile-cutter.svg?v=20260510-asset-4", "タイルを直線的に切るための工具。", "Tool used to score and cut tile."],
    ["タイルスペーサー|tile spacer", "タイルスペーサー", "Tile spacer", "./images/pilot/tile-spacer.svg?v=20260510-asset-4", "タイルの目地幅を一定に保つ部材。", "Spacer used to keep tile joint width consistent."],
    ["シーリング目地|sealant joint", "シーリング目地", "Sealant joint", "./images/pilot/sealant-joint.svg?v=20260510-asset-4", "外装や建具まわりの隙間をシーリング材で塞ぐ目地。", "Joint sealed with sealant around panels or openings."],
    ["プライマー|primer", "プライマー", "Primer", "./images/pilot/primer-can.svg?v=20260510-asset-4", "仕上げ材や接着材の密着を助ける下塗り材。", "Base material used to improve adhesion."],
    ["ローラーバケット|paint tray", "ローラーバケット", "Paint tray", "./images/pilot/paint-tray.svg?v=20260510-asset-4", "ローラー塗装時に塗料を入れて使う容器。", "Tray used to hold coating for roller application."],
    ["床スクレーパー|floor scraper", "床スクレーパー", "Floor scraper", "./images/pilot/floor-scraper.svg?v=20260510-asset-4", "床材や接着剤残りを削り取る工具。", "Tool used to remove flooring or adhesive residue."],
    ["床ポリッシャー|floor polisher", "床ポリッシャー", "Floor polisher", "./images/pilot/floor-polisher.svg?v=20260510-asset-4", "床面を洗浄・研磨する機械。", "Machine used to clean or polish floor surfaces."],
    ["点検口|access panel", "点検口", "Access panel", "./images/pilot/access-panel.svg?v=20260510-asset-4", "天井内や壁内の設備を点検するための開口。", "Panel used to access concealed services for inspection."],
    ["天井吊り金物|ceiling hanger", "天井吊り金物", "Ceiling hanger", "./images/pilot/ceiling-hanger.svg?v=20260510-asset-4", "天井下地を上部構造から吊るための支持金物。", "Hardware used to suspend ceiling members."],
    ["ダクト吊り金物|duct hanger", "ダクト吊り金物", "Duct hanger", "./images/pilot/duct-hanger.svg?v=20260510-asset-4", "ダクトを天井から支持する金物。", "Hardware used to suspend ductwork."],
    ["ガラリ|grille", "ガラリ", "Grille", "./images/pilot/grille.svg?v=20260510-asset-4", "空気の出入口に取り付ける格子状部材。", "Grid or louver component used at air openings."],
    ["吹出口|air diffuser", "吹出口", "Air diffuser", "./images/pilot/diffuser.svg?v=20260510-asset-4", "空調空気を室内へ拡散して吹き出す部材。", "Air terminal that distributes supply air into a room."],
    ["フレキシブルダクト|flexible duct", "フレキシブルダクト", "Flexible duct", "./images/pilot/flexible-duct.svg?v=20260510-asset-4", "曲げやすい蛇腹状の空調・換気ダクト。", "Bendable duct used for HVAC or ventilation connections."],
    ["配管保温材|pipe insulation", "配管保温材", "Pipe insulation", "./images/pilot/pipe-insulation.svg?v=20260510-asset-4", "配管の熱損失や結露を抑える保温材。", "Insulation used to reduce heat loss or condensation on pipes."],
    ["ビニル床タイル|vinyl floor tile", "ビニル床タイル", "Vinyl floor tile", "./images/pilot/vinyl-floor-tile.svg?v=20260510-asset-4", "店舗や施設で使われる塩ビ系の床仕上げ材。", "PVC-based modular floor finish used in shops and facilities."]
  ].map(([keys, ja, en, src, caption_ja, caption_en]) => ({ keys: keys.split("|"), ja, en, src, caption_ja, caption_en }));

  const state = { lastSignature: "" };

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

  function currentRaw() {
    const terms = document.getElementById("detailTerms");
    const title = terms?.querySelector(".termblock__title")?.textContent || "";
    const sub = terms?.querySelector(".termblock__sub")?.textContent || "";
    const aliases = document.getElementById("tabAliases")?.textContent || "";
    return `${title}\n${sub}\n${aliases}`;
  }

  function currentTokens() {
    return currentRaw().split(/[\/\n,、]+/).map(normalize).filter(Boolean);
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

  function render(force = false) {
    const detail = document.getElementById("detailSheet");
    if (!detail || detail.hidden) return;

    const raw = currentRaw();
    const signature = `${document.documentElement.lang || "ja"}::${raw}`;
    if (!force && signature === state.lastSignature) return;
    state.lastSignature = signature;

    const slot = ensureSlot();
    if (!slot) return;

    const item = matchPilot();
    if (!item || !item.src) {
      clear(slot);
      slot.hidden = true;
      return;
    }

    clear(slot);
    const current = lang();
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = current === "ja" ? item.ja : item.en;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      clear(slot);
      slot.hidden = true;
    }, { once: true });
    slot.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = current === "ja" ? item.caption_ja : item.caption_en;
    slot.appendChild(figcaption);
    slot.hidden = false;
  }

  function schedule(force = false) {
    window.clearTimeout(schedule.timer);
    schedule.timer = window.setTimeout(() => render(force), 80);
  }

  document.addEventListener("DOMContentLoaded", () => {
    schedule(true);
    document.addEventListener("click", () => schedule(false), true);
    document.addEventListener("keydown", () => schedule(false), true);
    document.getElementById("langBtn")?.addEventListener("click", () => schedule(true));
  });
})();
