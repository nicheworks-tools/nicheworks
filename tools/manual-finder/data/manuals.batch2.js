(() => {
  const categories = {
    pc: "PC・スマホ",
    home: "家電",
    printer: "プリンター・複合機",
    camera: "カメラ・映像",
    audio: "オーディオ",
    game: "ゲーム",
    net: "ネットワーク機器",
    other: "その他"
  };
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
  const vendors = [
    ["Apple","Apple","Global","https://support.apple.com/",[["iPhone",categories.pc],["Mac",categories.pc],["iPad",categories.pc],["Apple Watch",categories.other],["AirPods",categories.audio],["Apple TV",categories.home],["HomePod",categories.audio],["Magic Keyboard",categories.pc]]],
    ["Sony","ソニー","Japan","https://www.sony.jp/support/",[["BRAVIA",categories.home],["Xperia",categories.pc],["Alpha",categories.camera],["Cyber-shot",categories.camera],["Handycam",categories.camera],["Walkman",categories.audio],["Headphones",categories.audio],["PlayStation",categories.game]]],
    ["Panasonic","パナソニック","Japan","https://panasonic.jp/support/",[["VIERA",categories.home],["DIGA",categories.home],["LUMIX",categories.camera],["Let's note",categories.pc],["Washing Machine",categories.home],["Refrigerator",categories.home],["Microwave Oven",categories.home],["Air Conditioner",categories.home]]],
    ["Sharp","シャープ","Japan","https://jp.sharp/support/",[["AQUOS TV",categories.home],["AQUOS Phone",categories.pc],["Plasmacluster",categories.home],["Microwave Oven",categories.home],["Washing Machine",categories.home],["Refrigerator",categories.home],["Calculator",categories.other],["Air Conditioner",categories.home]]],
    ["Hitachi","日立","Japan","https://kadenfan.hitachi.co.jp/support/",[["Washing Machine",categories.home],["Refrigerator",categories.home],["Vacuum Cleaner",categories.home],["Air Conditioner",categories.home],["Microwave Oven",categories.home],["Rice Cooker",categories.home],["IH Cooker",categories.home],["Dryer",categories.home]]],
    ["Toshiba","東芝","Japan","https://www.toshiba-lifestyle.com/jp/support/",[["REGZA",categories.home],["Washing Machine",categories.home],["Refrigerator",categories.home],["Vacuum Cleaner",categories.home],["Microwave Oven",categories.home],["Rice Cooker",categories.home],["Air Conditioner",categories.home],["Lighting",categories.home]]],
    ["Mitsubishi Electric","三菱電機","Japan","https://www.mitsubishielectric.co.jp/support/",[["Air Conditioner",categories.home],["Refrigerator",categories.home],["LCD Display",categories.pc],["IH Cooker",categories.home],["Ventilation Fan",categories.home],["Projector",categories.camera],["Elevator",categories.other],["EcoCute",categories.home]]],
    ["Daikin","ダイキン","Japan","https://www.daikin.co.jp/support/",[["Air Conditioner",categories.home],["Air Purifier",categories.home],["Remote Controller",categories.home],["Humidifier",categories.home],["EcoCute",categories.home],["Commercial AC",categories.home],["Ventilation",categories.home],["App",categories.other]]],
    ["Canon","キヤノン","Japan","https://canon.jp/support",[["EOS",categories.camera],["PowerShot",categories.camera],["Lens",categories.camera],["PIXUS",categories.printer],["imageRUNNER",categories.printer],["CanoScan",categories.printer],["SELPHY",categories.printer],["Projector",categories.camera]]],
    ["Nikon","ニコン","Japan","https://downloadcenter.nikonimglib.com/",[["Z Camera",categories.camera],["D Camera",categories.camera],["COOLPIX",categories.camera],["NIKKOR Lens",categories.camera],["Speedlight",categories.camera],["Binoculars",categories.other],["Software",categories.camera],["Battery Charger",categories.camera]]],
    ["Fujifilm","富士フイルム","Japan","https://www.fujifilm.com/jp/ja/consumer/support",[["X Camera",categories.camera],["GFX",categories.camera],["XF Lens",categories.camera],["GF Lens",categories.camera],["instax",categories.camera],["instax Printer",categories.printer],["Binoculars",categories.other],["Business Printer",categories.printer]]],
    ["Epson","エプソン","Japan","https://www.epson.jp/support/",[["Inkjet Printer",categories.printer],["Business Printer",categories.printer],["Scanner",categories.printer],["Projector",categories.camera],["Label Printer",categories.printer],["Large Format Printer",categories.printer],["MOVERIO",categories.other],["Receipt Printer",categories.printer]]],
    ["Brother","ブラザー","Japan","https://support.brother.co.jp/",[["Inkjet Printer",categories.printer],["Laser Printer",categories.printer],["MFC",categories.printer],["Label Writer",categories.printer],["Sewing Machine",categories.other],["Scanner",categories.printer],["Fax",categories.printer],["ScanNCut",categories.other]]],
    ["HP","日本HP","Global","https://support.hp.com/",[["Laptop",categories.pc],["Desktop",categories.pc],["Printer",categories.printer],["Monitor",categories.pc],["Workstation",categories.pc],["Dock",categories.pc],["Scanner",categories.printer],["Gaming PC",categories.game]]],
    ["Dell","デル","Global","https://www.dell.com/support/home/",[["XPS",categories.pc],["Inspiron",categories.pc],["Latitude",categories.pc],["Alienware",categories.game],["Monitor",categories.pc],["PowerEdge",categories.pc],["Dock",categories.pc],["Keyboard",categories.pc]]],
    ["Lenovo","レノボ","Global","https://support.lenovo.com/",[["ThinkPad",categories.pc],["IdeaPad",categories.pc],["Yoga",categories.pc],["Legion",categories.game],["Tablet",categories.pc],["ThinkVision",categories.pc],["Dock",categories.pc],["Workstation",categories.pc]]],
    ["ASUS","ASUS","Global","https://www.asus.com/support/",[["Zenbook",categories.pc],["Vivobook",categories.pc],["ROG",categories.game],["Router",categories.net],["Monitor",categories.pc],["Motherboard",categories.other],["Zenfone",categories.pc],["Mini PC",categories.pc]]],
    ["Acer","Acer","Global","https://www.acer.com/support",[["Aspire",categories.pc],["Swift",categories.pc],["Predator",categories.game],["Nitro",categories.game],["Monitor",categories.pc],["Projector",categories.camera],["Chromebook",categories.pc],["Desktop",categories.pc]]],
    ["MSI","MSI","Global","https://www.msi.com/support",[["Laptop",categories.pc],["Motherboard",categories.other],["Graphics Card",categories.other],["Monitor",categories.pc],["Desktop",categories.pc],["Gaming Handheld",categories.game],["Keyboard",categories.game],["Mouse",categories.game]]],
    ["LG","LG","Global","https://www.lg.com/support",[["TV",categories.home],["Monitor",categories.pc],["Washing Machine",categories.home],["Refrigerator",categories.home],["Soundbar",categories.audio],["Air Conditioner",categories.home],["Projector",categories.camera],["Styler",categories.home]]],
    ["Samsung","Samsung","Global","https://www.samsung.com/support/",[["Galaxy",categories.pc],["TV",categories.home],["Monitor",categories.pc],["SSD",categories.other],["Galaxy Watch",categories.other],["Soundbar",categories.audio],["Tablet",categories.pc],["Home Appliance",categories.home]]],
    ["Google","Google","Global","https://support.google.com/",[["Pixel",categories.pc],["Pixel Buds",categories.audio],["Pixel Watch",categories.other],["Nest",categories.other],["Chromecast",categories.home],["Nest Wifi",categories.net],["Fitbit",categories.other],["Tablet",categories.pc]]],
    ["Microsoft","Microsoft","Global","https://support.microsoft.com/",[["Surface",categories.pc],["Xbox",categories.game],["Windows",categories.pc],["Keyboard",categories.pc],["Mouse",categories.pc],["HoloLens",categories.other],["Adaptive Controller",categories.game],["Dock",categories.pc]]],
    ["Nintendo","任天堂","Japan","https://www.nintendo.co.jp/support/",[["Switch",categories.game],["Switch Lite",categories.game],["Switch OLED",categories.game],["Joy-Con",categories.game],["Pro Controller",categories.game],["3DS",categories.game],["Wii U",categories.game],["Amiibo",categories.game]]],
    ["DJI","DJI","Global","https://www.dji.com/support",[["Mavic",categories.camera],["Mini",categories.camera],["Air",categories.camera],["Osmo",categories.camera],["Action Camera",categories.camera],["Ronin",categories.camera],["DJI Mic",categories.audio],["Power Station",categories.other]]],
    ["GoPro","GoPro","Global","https://community.gopro.com/",[["HERO",categories.camera],["MAX",categories.camera],["Media Mod",categories.camera],["Remote",categories.camera],["Battery",categories.other],["Mount",categories.other],["Subscription",categories.other],["App",categories.other]]],
    ["Yamaha","ヤマハ","Japan","https://jp.yamaha.com/support/",[["AV Receiver",categories.audio],["Soundbar",categories.audio],["Piano",categories.other],["Keyboard",categories.other],["Mixer",categories.audio],["Router",categories.net],["Speaker",categories.audio],["Guitar Amp",categories.audio]]],
    ["Bose","Bose","Global","https://support.bose.com/",[["QuietComfort",categories.audio],["SoundLink",categories.audio],["Soundbar",categories.audio],["Earbuds",categories.audio],["Speaker",categories.audio],["Amplifier",categories.audio],["Aviation",categories.audio],["Sleepbuds",categories.audio]]],
    ["JBL","JBL","Global","https://support.jbl.com/",[["Headphones",categories.audio],["Speaker",categories.audio],["Soundbar",categories.audio],["PartyBox",categories.audio],["Quantum",categories.game],["Microphone",categories.audio],["Earbuds",categories.audio],["Car Audio",categories.audio]]],
    ["Sennheiser","Sennheiser","Global","https://www.sennheiser-hearing.com/support/",[["MOMENTUM",categories.audio],["HD",categories.audio],["Earbuds",categories.audio],["AMBEO",categories.audio],["Microphone",categories.audio],["Wireless",categories.audio],["Hearing",categories.other],["TV Audio",categories.audio]]],
    ["Audio-Technica","オーディオテクニカ","Japan","https://www.audio-technica.co.jp/support/",[["Headphones",categories.audio],["Microphone",categories.audio],["Turntable",categories.audio],["Cartridge",categories.audio],["Wireless",categories.audio],["Mixer",categories.audio],["Speaker",categories.audio],["Gaming",categories.game]]],
    ["TP-Link","TP-Link","Global","https://www.tp-link.com/support/",[["Archer",categories.net],["Deco",categories.net],["Tapo",categories.other],["Kasa",categories.other],["Switch",categories.net],["Adapter",categories.net],["Omada",categories.net],["Camera",categories.camera]]],
    ["Buffalo","バッファロー","Japan","https://www.buffalo.jp/support/",[["AirStation",categories.net],["LinkStation",categories.net],["TeraStation",categories.net],["HDD",categories.other],["SSD",categories.other],["Keyboard",categories.pc],["Mouse",categories.pc],["Hub",categories.net]]],
    ["Garmin","Garmin","Global","https://support.garmin.com/",[["Forerunner",categories.other],["fenix",categories.other],["Edge",categories.other],["Venu",categories.other],["Dash Cam",categories.camera],["Marine",categories.other],["GPS",categories.other],["Scale",categories.other]]]
  ];
  const notes = Object.fromEntries(Object.values(categories).map(c => [c, `${c} の公式マニュアル／サポート入口です。`]));
  const batch = vendors.flatMap(([brand,nameJa,country,support,lines]) => lines.map(([line,category]) => ({brand:`${brand} ${line}`,nameJa:`${nameJa} ${line}`,nameEn:`${brand} ${line}`,category,country,manualUrl:support,supportUrl:support,hint:`${line} 型番、製品名、シリーズ名`,note:notes[category],tags:String(`${brand} ${nameJa} ${line} ${category}`).toLowerCase().split(/\s+/),sourceType:"official",linkReview:"batch2 product-line entry 2026-05-12"})));
  const prev = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (!/manuals\.json(?:$|[?#])/.test(url)) return prev(input, init);
    return prev(input, init).then(async (res) => {
      if (!res.ok) return res;
      const base = await res.clone().json();
      const seen = new Set();
      const merged = base.concat(batch).filter((item) => { const key = `${item.brand}|${item.category}`.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; });
      return new Response(JSON.stringify(merged), {status:200,statusText:"OK",headers:{"Content-Type":"application/json; charset=utf-8"}});
    });
  };
})();
