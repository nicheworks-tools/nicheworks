(() => {
  const C = { pc:"PC・スマホ", home:"家電", printer:"プリンター・複合機", camera:"カメラ・映像", audio:"オーディオ", game:"ゲーム", net:"ネットワーク機器", other:"その他" };
  const notes = Object.fromEntries(Object.values(C).map(c => [c, `${c} の公式マニュアル／サポート入口です。`]));
  const vendors = [
    ["Makita","マキタ","Japan","https://www.makita.co.jp/product/support/",[["Impact Driver",C.other],["Drill",C.other],["Circular Saw",C.other],["Vacuum Cleaner",C.home],["Battery Charger",C.other],["Radio",C.audio]]],
    ["HiKOKI","HiKOKI","Japan","https://www.hikoki-powertools.jp/manual/",[["Impact Driver",C.other],["Drill",C.other],["Grinder",C.other],["Circular Saw",C.other],["Battery Charger",C.other],["Dust Collector",C.home]]],
    ["Bosch Tools","ボッシュ工具","Global","https://www.boschtools.com/us/en/service/product-manuals/",[["Drill",C.other],["Driver",C.other],["Measuring Tool",C.other],["Sander",C.other],["Saw",C.other],["Laser Measure",C.other]]],
    ["DeWalt","DeWalt","Global","https://support.dewalt.com/",[["Drill",C.other],["Driver",C.other],["Saw",C.other],["Grinder",C.other],["Battery",C.other],["Charger",C.other]]],
    ["Milwaukee","Milwaukee Tool","Global","https://www.milwaukeetool.com/Support",[["Drill",C.other],["Driver",C.other],["Saw",C.other],["Light",C.other],["Battery",C.other],["Packout",C.other]]],
    ["Ryobi","リョービ / 京セラ","Japan","https://www.kyocera-industrialtools.co.jp/support/",[["Drill",C.other],["Sander",C.other],["Garden Tool",C.other],["Cleaner",C.home],["Saw",C.other],["Charger",C.other]]],
    ["Karcher","ケルヒャー","Global","https://www.kaercher.com/int/services/support/manuals.html",[["Pressure Washer",C.home],["Steam Cleaner",C.home],["Vacuum",C.home],["Window Cleaner",C.home],["Floor Cleaner",C.home],["Accessory",C.other]]],
    ["Dyson","ダイソン","Global","https://www.dyson.com/support",[["Vacuum Cleaner",C.home],["Air Purifier",C.home],["Hair Dryer",C.home],["Airwrap",C.home],["Fan",C.home],["Light",C.home]]],
    ["iRobot","iRobot","Global","https://homesupport.irobot.com/",[["Roomba",C.home],["Braava",C.home],["Combo",C.home],["Dock",C.home],["Battery",C.other],["App",C.other]]],
    ["Roborock","Roborock","Global","https://support.roborock.com/",[["Robot Vacuum",C.home],["Dock",C.home],["Wet Dry Vacuum",C.home],["App",C.other],["Accessory",C.other],["Maintenance",C.home]]],
    ["Ecovacs","Ecovacs","Global","https://www.ecovacs.com/global/support",[["DEEBOT",C.home],["WINBOT",C.home],["AIRBOT",C.home],["Dock",C.home],["App",C.other],["Accessory",C.other]]],
    ["Tineco","Tineco","Global","https://support.tineco.com/",[["Wet Dry Vacuum",C.home],["Cordless Vacuum",C.home],["Floor Washer",C.home],["Carpet Cleaner",C.home],["Charger",C.other],["Accessory",C.other]]],
    ["Omron Healthcare","オムロンヘルスケア","Japan","https://www.healthcare.omron.co.jp/support/",[["Blood Pressure Monitor",C.other],["Thermometer",C.other],["Nebulizer",C.other],["Scale",C.other],["Activity Meter",C.other],["Low Frequency Therapy",C.other]]],
    ["Tanita","タニタ","Japan","https://www.tanita.co.jp/support/",[["Scale",C.other],["Body Composition Monitor",C.other],["Thermometer",C.other],["Timer",C.other],["Pedometer",C.other],["Kitchen Scale",C.home]]],
    ["Withings","Withings","Global","https://support.withings.com/",[["Smart Scale",C.other],["Watch",C.other],["Blood Pressure Monitor",C.other],["Thermometer",C.other],["Sleep Analyzer",C.other],["App",C.other]]],
    ["Braun Healthcare","ブラウンヘルスケア","Global","https://www.braunhealthcare.com/support",[["Thermometer",C.other],["Blood Pressure Monitor",C.other],["Pulse Oximeter",C.other],["Air Purifier",C.home],["Humidifier",C.home],["Accessory",C.other]]],
    ["Philips","フィリップス","Global","https://www.philips.com/support",[["Electric Shaver",C.home],["Sonicare",C.home],["Air Fryer",C.home],["Hue",C.other],["Monitor",C.pc],["CPAP",C.other]]],
    ["Braun","ブラウン","Global","https://www.service.braun.com/",[["Shaver",C.home],["Toothbrush",C.home],["Thermometer",C.other],["Hair Clipper",C.home],["Epilator",C.home],["Kitchen",C.home]]],
    ["Oral-B","Oral-B","Global","https://oralb.com/support/",[["Electric Toothbrush",C.home],["iO",C.home],["Kids Toothbrush",C.home],["Charger",C.other],["App",C.other],["Replacement Head",C.other]]],
    ["Tesla","Tesla","Global","https://www.tesla.com/ownersmanual",[["Model 3",C.other],["Model Y",C.other],["Model S",C.other],["Model X",C.other],["Wall Connector",C.other],["Mobile Connector",C.other]]],
    ["Toyota","トヨタ","Japan","https://manual.toyota.jp/",[["Aqua",C.other],["Prius",C.other],["Corolla",C.other],["Yaris",C.other],["Sienta",C.other],["Navigation",C.other]]],
    ["Honda","ホンダ","Japan","https://www.honda.co.jp/ownersmanual/",[["N-BOX",C.other],["Fit",C.other],["Civic",C.other],["Vezel",C.other],["Freed",C.other],["Navigation",C.other]]],
    ["Nissan","日産","Japan","https://www.nissan.co.jp/OPTIONAL-PARTS/NAVIOM/",[["Note",C.other],["Serena",C.other],["Leaf",C.other],["Sakura",C.other],["X-Trail",C.other],["Navigation",C.other]]],
    ["Mazda","マツダ","Japan","https://www.mazda.co.jp/carlife/owner/manual/",[["Mazda2",C.other],["Mazda3",C.other],["CX-5",C.other],["CX-30",C.other],["Roadster",C.other],["Navigation",C.other]]],
    ["Subaru","スバル","Japan","https://www.subaru.jp/afterservice/tnst/",[["Impreza",C.other],["Forester",C.other],["Outback",C.other],["Levorg",C.other],["Crosstrek",C.other],["Navigation",C.other]]],
    ["Kenwood","JVCケンウッド","Japan","https://www.kenwood.com/jp/cs/car/",[["Car Navigation",C.other],["Dash Cam",C.camera],["Car Audio",C.audio],["Receiver",C.audio],["Speaker",C.audio],["Transceiver",C.other]]],
    ["Pioneer Carrozzeria","カロッツェリア","Japan","https://jpn.pioneer/ja/support/manual/",[["Car Navigation",C.other],["Dash Cam",C.camera],["Car Audio",C.audio],["Speaker",C.audio],["Subwoofer",C.audio],["ETC",C.other]]],
    ["Alpine","アルパイン","Japan","https://www.alpine.co.jp/support/download",[["Car Navigation",C.other],["Display Audio",C.other],["Dash Cam",C.camera],["Speaker",C.audio],["Rear Vision",C.camera],["ETC",C.other]]],
    ["Eizo","EIZO","Japan","https://www.eizo.co.jp/support/db/",[["FlexScan",C.pc],["ColorEdge",C.pc],["FORIS",C.game],["RadiForce",C.pc],["DuraVision",C.pc],["Accessory",C.other]]],
    ["BenQ","BenQ","Global","https://www.benq.com/en-us/support/downloads-faq.html",[["Monitor",C.pc],["Projector",C.camera],["Gaming Monitor",C.game],["Lamp",C.other],["ScreenBar",C.home],["Speaker",C.audio]]],
    ["ViewSonic","ViewSonic","Global","https://www.viewsonic.com/support/",[["Monitor",C.pc],["Projector",C.camera],["Pen Display",C.pc],["Gaming Monitor",C.game],["Digital Signage",C.pc],["Accessory",C.other]]],
    ["Wacom","ワコム","Global","https://www.wacom.com/support/product-support/manuals",[["Intuos",C.other],["Cintiq",C.other],["One",C.other],["MobileStudio",C.pc],["Pen",C.other],["Tablet Driver",C.pc]]],
    ["XP-Pen","XP-Pen","Global","https://www.xp-pen.com/download",[["Artist",C.other],["Deco",C.other],["Star",C.other],["Pen",C.other],["Driver",C.pc],["Accessory",C.other]]],
    ["Huion","Huion","Global","https://www.huion.com/download/",[["Kamvas",C.other],["Inspiroy",C.other],["Pen",C.other],["Driver",C.pc],["Tablet",C.other],["Accessory",C.other]]]
  ];
  const batch = vendors.flatMap(([brand,nameJa,country,support,lines]) => lines.map(([line,category]) => ({brand:`${brand} ${line}`,nameJa:`${nameJa} ${line}`,nameEn:`${brand} ${line}`,category,country,manualUrl:support,supportUrl:support,hint:`${line} 型番、製品名、シリーズ名`,note:notes[category],tags:String(`${brand} ${nameJa} ${line} ${category}`).toLowerCase().split(/\s+/),sourceType:"official",linkReview:"batch3 extended entry 2026-05-12"})));
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
