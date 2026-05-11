(() => {
  const EXTRA = [
    ["Microsoft Surface","Microsoft Surface","Microsoft Corporation","PC・スマホ","Global","https://support.microsoft.com/surface","https://support.microsoft.com/","Surface Pro / Laptop / Go / Studio 型番、Windows バージョン","surface windows tablet laptop"],
    ["Sony Xperia","ソニー Xperia","Sony Corporation","PC・スマホ","Japan","https://www.sony.jp/support/xperia/","https://www.sony.jp/support/","Xperia 1 / 5 / 10、SO / SOG / XQ 型番","xperia android sony smartphone"],
    ["Sharp AQUOS Mobile","シャープ AQUOSスマートフォン","SHARP Corporation","PC・スマホ","Japan","https://jp.sharp/k-tai/support/","https://jp.sharp/support/","AQUOS sense / wish / R、SH- / A 型番","aquos smartphone sharp"],
    ["FCNT arrows","FCNT arrows","FCNT LLC","PC・スマホ","Japan","https://www.fcnt.com/support/","https://www.fcnt.com/support/","arrows 型番、F- から始まる型番、らくらくスマートフォン","arrows fcnt smartphone"],
    ["Nothing","Nothing Phone","Nothing Technology Limited","PC・スマホ","Global","https://nothing.tech/pages/support-centre","https://nothing.tech/pages/support-centre","Phone (1)(2)(2a)、Ear 型番","nothing phone ear smartphone"],
    ["Razer","Razer","Razer Inc.","PC・スマホ","Global","https://support.razer.com/","https://support.razer.com/","Razer Blade、BlackWidow、DeathAdder、型番","razer gaming laptop keyboard mouse"],
    ["Mouse Computer","マウスコンピューター","Mouse Computer Co., Ltd.","PC・スマホ","Japan","https://www.mouse-jp.co.jp/store/r/rasmanual/","https://www.mouse-jp.co.jp/store/brand/support/","mouse / G-Tune / DAIV 型番、シリアル番号","mouse computer gtune daiv bto pc"],
    ["REGZA","TVS REGZA","TVS REGZA Corporation","家電","Japan","https://www.regza.com/support/manual","https://www.regza.com/support","REGZA 型番、テレビ、レコーダー DBR 型番","regza tv recorder"],
    ["Iris Ohyama","アイリスオーヤマ","IRIS OHYAMA Inc.","家電","Japan","https://www.irisohyama.co.jp/support/manual/","https://www.irisohyama.co.jp/support/","アイリス 型番、炊飯器、掃除機、照明","iris ohyama appliance"],
    ["Yamazen","山善","Yamazen Corporation","家電","Japan","https://book.yamazen.co.jp/","https://www.yamazen.co.jp/support/","YAMAZEN 型番、扇風機、ヒーター、家電","yamazen appliance manual"],
    ["Balmuda","バルミューダ","BALMUDA Inc.","家電","Japan","https://www.balmuda.com/jp/support/","https://www.balmuda.com/jp/support/","The Toaster、The Range、型番","balmuda toaster range"],
    ["Hisense","ハイセンス","Hisense Group","家電","Global","https://global.hisense.com/support/manuals","https://global.hisense.com/support","Hisense TV 型番、冷蔵庫、エアコン","hisense tv appliance"],
    ["TCL","TCL","TCL Technology","家電","Global","https://www.tcl.com/global/en/support","https://www.tcl.com/global/en/support","TCL TV 型番、Google TV、型番","tcl tv appliance"],
    ["SharkNinja","シャークニンジャ","SharkNinja Operating LLC","家電","Global","https://support.sharkclean.com/hc/en-us","https://support.sharkclean.com/","Shark / Ninja 型番、掃除機、ブレンダー","shark ninja vacuum blender"],
    ["Canon Printer","キヤノン プリンター","Canon Inc.","プリンター・複合機","Japan","https://ij.manual.canon/","https://canon.jp/support","PIXUS TS / TR、Gシリーズ、プリンター型番","canon printer pixus ij"],
    ["Fujifilm Business Innovation","富士フイルムビジネスイノベーション","FUJIFILM Business Innovation Corp.","プリンター・複合機","Japan","https://www.fujifilm.com/fb/support/manual","https://www.fujifilm.com/fb/support","Apeos / DocuCentre / DocuPrint 型番","fujifilm business printer xerox apeos"],
    ["OKI","沖電気工業 OKI","Oki Electric Industry Co., Ltd.","プリンター・複合機","Japan","https://www.oki.com/jp/printing/support/user-manual/","https://www.oki.com/jp/printing/support/","C / MC / B シリーズ型番","oki printer mfp"],
    ["Casio Printer","カシオ プリンター","Casio Computer Co., Ltd.","プリンター・複合機","Japan","https://support.casio.jp/manualfile.php","https://support.casio.jp/","NAME LAND、ラベルライター型番","casio label printer"],
    ["Leica","ライカ","Leica Camera AG","カメラ・映像","Global","https://leica-camera.com/en-int/service-support/support/downloads","https://leica-camera.com/en-int/service-support","M / Q / SL / D-Lux 型番","leica camera lens"],
    ["Insta360","Insta360","Arashi Vision Inc.","カメラ・映像","Global","https://www.insta360.com/download","https://www.insta360.com/support","X3 / X4 / ONE RS / GO 型番","insta360 camera action"],
    ["Blackmagic Design","Blackmagic Design","Blackmagic Design Pty Ltd","カメラ・映像","Global","https://www.blackmagicdesign.com/support","https://www.blackmagicdesign.com/support","Pocket Cinema Camera、ATEM、DaVinci","blackmagic camera video atem"],
    ["Elgato","Elgato","Corsair Gaming, Inc.","カメラ・映像","Global","https://help.elgato.com/","https://help.elgato.com/","Stream Deck、Game Capture、Facecam 型番","elgato stream deck capture"],
    ["Sony Camera","ソニー カメラ","Sony Corporation","カメラ・映像","Japan","https://www.sony.jp/ServiceArea/impdf/manual/","https://www.sony.jp/support/","α7 / α6000 / ZV / Cyber-shot 型番","sony camera alpha cyber-shot handycam"],
    ["Sony Audio","ソニー オーディオ","Sony Corporation","オーディオ","Japan","https://www.sony.jp/support/manual.html","https://www.sony.jp/support/","WH / WF / SRS / HT 型番","sony audio headphone speaker"],
    ["Beats","Beats by Dre","Apple Inc.","オーディオ","Global","https://support.apple.com/beats","https://support.apple.com/beats","Beats Studio、Solo、Fit Pro、型番","beats headphones apple"],
    ["Anker Soundcore","Anker Soundcore","Anker Innovations","オーディオ","Global","https://support.soundcore.com/s/product/a085g0000047qFsAAI/manuals","https://support.soundcore.com/","Soundcore Life / Liberty / Space 型番","soundcore anker headphones speaker"],
    ["FiiO","FiiO","FiiO Electronics Technology Co., Ltd.","オーディオ","Global","https://www.fiio.com/supports","https://www.fiio.com/supports","M / K / BTR / KA 型番","fiio audio dac dap"],
    ["Xbox","Xbox","Microsoft Corporation","ゲーム","Global","https://support.xbox.com/","https://support.xbox.com/","Xbox Series X/S、One、Elite Controller","xbox console controller"],
    ["Steam Deck","Steam Deck","Valve Corporation","ゲーム","Global","https://help.steampowered.com/en/faqs/view/4C18-08B5-DEC9-3AF4","https://help.steampowered.com/","Steam Deck OLED、LCD、シリアル番号","steam deck valve handheld"],
    ["Meta Quest","Meta Quest","Meta Platforms, Inc.","ゲーム","Global","https://www.meta.com/help/quest/","https://www.meta.com/help/quest/","Quest 2 / 3 / Pro、コントローラー","meta quest vr headset"],
    ["Logitech G","Logicool G / Logitech G","Logitech International S.A.","ゲーム","Global","https://support.logi.com/","https://support.logi.com/","G PRO、G502、G29、型番","logitech logicool gaming mouse keyboard"],
    ["HORI","ホリ","HORI Co., Ltd.","ゲーム","Japan","https://hori.jp/manual/","https://hori.jp/support/","HORI コントローラー、アケコン、型番","hori controller gaming"],
    ["NEC Aterm","NEC Aterm","NEC Platforms, Ltd.","ネットワーク機器","Japan","https://www.aterm.jp/support/manual/","https://www.aterm.jp/support/","Aterm WX / WG / MR 型番","aterm nec router wifi"],
    ["ELECOM","エレコム","ELECOM CO., LTD.","ネットワーク機器","Japan","https://www.elecom.co.jp/support/manual/","https://www.elecom.co.jp/support/","WRC、LAN、型番、製品カテゴリ","elecom router accessory"],
    ["I-O DATA","アイ・オー・データ","I-O DATA DEVICE, INC.","ネットワーク機器","Japan","https://www.iodata.jp/lib/","https://www.iodata.jp/support/","WN / HDL / LCD 型番","iodata nas router monitor"],
    ["NETGEAR","NETGEAR","NETGEAR, Inc.","ネットワーク機器","Global","https://www.netgear.com/support/download/","https://www.netgear.com/support/","Orbi、Nighthawk、型番","netgear router orbi nighthawk"],
    ["ASUS Networking","ASUS ルーター","ASUSTeK Computer Inc.","ネットワーク機器","Global","https://www.asus.com/support/","https://www.asus.com/support/","RT / ROG Rapture / ZenWiFi 型番","asus router zenwifi"],
    ["Synology","Synology","Synology Inc.","ネットワーク機器","Global","https://www.synology.com/support/download","https://www.synology.com/support","DiskStation、DS 型番、Router 型番","synology nas router"],
    ["QNAP","QNAP","QNAP Systems, Inc.","ネットワーク機器","Global","https://www.qnap.com/en/download","https://www.qnap.com/en/support","TS / TVS / QSW 型番","qnap nas switch"],
    ["Ubiquiti","Ubiquiti UniFi","Ubiquiti Inc.","ネットワーク機器","Global","https://help.ui.com/","https://help.ui.com/","UniFi Dream Machine、AP、switch 型番","ubiquiti unifi router access point"],
    ["Seiko Watch","セイコーウオッチ","Seiko Watch Corporation","その他","Japan","https://www.seikowatches.com/jp-ja/customerservice/instruction","https://www.seikowatches.com/jp-ja/customerservice","キャリバー番号、裏ぶた番号、Prospex","seiko watch caliber"],
    ["Citizen Watch","シチズン時計","Citizen Watch Co., Ltd.","その他","Japan","https://citizen.jp/support/guide/","https://citizen.jp/support/","キャリバー番号、Eco-Drive、型番","citizen watch caliber"],
    ["Garmin","Garmin","Garmin Ltd.","その他","Global","https://www.garmin.com/manuals/","https://support.garmin.com/","Forerunner、fēnix、Edge、型番","garmin watch gps"],
    ["Fitbit","Fitbit","Google LLC","その他","Global","https://help.fitbit.com/manuals/","https://help.fitbit.com/","Charge、Versa、Sense、Inspire 型番","fitbit wearable watch"],
    ["Anker","Anker","Anker Innovations","その他","Global","https://support.anker.com/s/product/a085g0000047qFsAAI/manuals","https://support.anker.com/","Anker 型番、PowerCore、PowerPort、充電器","anker charger battery"],
    ["Eufy","Eufy","Anker Innovations","その他","Global","https://support.eufy.com/s/product/a085g000000NmD9AAK/manuals","https://support.eufy.com/","eufyCam、RoboVac、型番","eufy camera robovac smart home"],
    ["Tapo","Tapo","TP-Link","その他","Global","https://www.tapo.com/support/download/","https://www.tapo.com/support/","Tapo C / P / L 型番","tapo smart camera plug"],
    ["Ring","Ring","Amazon.com, Inc.","その他","Global","https://ring.com/support","https://ring.com/support","Ring Video Doorbell、Camera 型番","ring doorbell security camera"],
    ["Amazon Devices","Amazon Devices","Amazon.com, Inc.","その他","Global","https://www.amazon.com/gp/help/customer/display.html?nodeId=200127470","https://www.amazon.com/gp/help/customer/display.html","Kindle、Echo、Fire TV、モデル名","amazon kindle echo fire tv"],
    ["Kobo","楽天Kobo","Rakuten Kobo Inc.","その他","Global","https://help.kobo.com/","https://help.kobo.com/","Kobo Clara、Libra、Elipsa 型番","kobo ereader rakuten"],
    ["Wacom","ワコム","Wacom Co., Ltd.","その他","Global","https://www.wacom.com/support/product-support/manuals","https://support.wacom.com/","Intuos、Cintiq、One、型番","wacom tablet pen"],
    ["Roland","ローランド","Roland Corporation","その他","Japan","https://www.roland.com/jp/support/manuals/","https://www.roland.com/jp/support/","Roland 型番、電子ピアノ、シンセ、アンプ","roland instrument keyboard"],
    ["Korg","コルグ","Korg Inc.","その他","Japan","https://www.korg.com/jp/support/download/manual/","https://www.korg.com/jp/support/","KORG 型番、minilogue、microKORG","korg instrument synth"],
    ["BOSS","BOSS","Roland Corporation","その他","Global","https://www.boss.info/global/support/by_product/","https://www.boss.info/global/support/","BOSS 型番、GT、Katana、コンパクトエフェクター","boss guitar effects amp"]
  ];

  const notes = {
    "PC・スマホ": "PC・スマートフォン・タブレット等の公式マニュアル／サポート入口です。",
    "家電": "生活家電・AV家電・キッチン家電等の公式マニュアル／サポート入口です。",
    "プリンター・複合機": "プリンター・複合機・ラベル機器等の公式マニュアル／サポート入口です。",
    "カメラ・映像": "カメラ・映像機器・配信機材等の公式マニュアル／サポート入口です。",
    "オーディオ": "オーディオ機器・ヘッドホン・楽器等の公式マニュアル／サポート入口です。",
    "ゲーム": "ゲーム機・VR機器・ゲーム周辺機器等の公式マニュアル／サポート入口です。",
    "ネットワーク機器": "ルーター・NAS・ネットワーク機器等の公式マニュアル／サポート入口です。",
    "その他": "時計・電子文具・周辺機器等の公式マニュアル／サポート入口です。"
  };
  const categoryOverrides = {
    "Yamaha Audio": "オーディオ",
    "Pioneer": "オーディオ",
    "Denon": "オーディオ",
    "Marantz": "オーディオ",
    "Bose": "オーディオ",
    "JBL": "オーディオ",
    "Sennheiser": "オーディオ",
    "Audio-Technica": "オーディオ",
    "Shure": "オーディオ",
    "Nintendo": "ゲーム",
    "PlayStation": "ゲーム",
    "TP-Link": "ネットワーク機器",
    "Buffalo": "ネットワーク機器"
  };
  const toRecord = (r) => ({
    brand: r[0], nameJa: r[1], nameEn: r[2], category: r[3], country: r[4],
    manualUrl: r[5], supportUrl: r[6], note: notes[r[3]] || "公式マニュアル／サポート入口です。",
    hint: r[7], tags: r[8] ? r[8].split(" ") : [], sourceType: "official",
    linkReview: "official manual/support entry normalized 2026-05-11"
  });
  const extraRecords = EXTRA.map(toRecord);
  const originalFetch = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (!/manuals\.json(?:$|[?#])/.test(url)) return originalFetch(input, init);
    return originalFetch(input, init).then(async (res) => {
      if (!res.ok) return res;
      const base = await res.clone().json();
      const normalized = base.map((item) => {
        const category = categoryOverrides[item.brand] || item.category;
        return {
          ...item,
          category,
          hint: item.hint || "型番、製品名、シリーズ名、シリアル番号",
          tags: Array.isArray(item.tags) ? item.tags : String(item.brand || "").toLowerCase().split(/\s+/),
          sourceType: item.sourceType || "official",
          linkReview: item.linkReview || "official manual/support entry normalized 2026-05-11"
        };
      });
      const seen = new Set();
      const merged = normalized.concat(extraRecords).filter((item) => {
        const key = `${item.brand}|${item.category}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return new Response(JSON.stringify(merged), {
        status: 200,
        statusText: "OK",
        headers: { "Content-Type": "application/json; charset=utf-8" }
      });
    });
  };
})();
