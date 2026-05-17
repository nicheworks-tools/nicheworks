(() => {
  const C = { pc:"PC・スマホ", home:"家電", printer:"プリンター・複合機", camera:"カメラ・映像", audio:"オーディオ", game:"ゲーム", net:"ネットワーク機器", other:"その他" };
  const notes = {
    [C.pc]:"PC・スマートフォン・タブレット等の公式マニュアル／サポート入口です。",
    [C.home]:"生活家電・AV家電・キッチン家電等の公式マニュアル／サポート入口です。",
    [C.printer]:"プリンター・複合機・ラベル機器等の公式マニュアル／サポート入口です。",
    [C.camera]:"カメラ・映像機器・配信機材等の公式マニュアル／サポート入口です。",
    [C.audio]:"オーディオ機器・ヘッドホン・楽器等の公式マニュアル／サポート入口です。",
    [C.game]:"ゲーム機・VR機器・ゲーム周辺機器等の公式マニュアル／サポート入口です。",
    [C.net]:"ルーター・NAS・ネットワーク機器等の公式マニュアル／サポート入口です。",
    [C.other]:"時計・工具・車載機器・健康機器等の公式マニュアル／サポート入口です。"
  };
  const makers = {
    Apple:["Apple","Global","https://support.apple.com/"], Sony:["ソニー","Japan","https://www.sony.jp/support/"], Panasonic:["パナソニック","Japan","https://panasonic.jp/support/"], Sharp:["シャープ","Japan","https://jp.sharp/support/"], Hitachi:["日立","Japan","https://kadenfan.hitachi.co.jp/support/"], Toshiba:["東芝","Japan","https://www.toshiba-lifestyle.com/jp/support/"], Mitsubishi:["三菱電機","Japan","https://www.mitsubishielectric.co.jp/support/"], Daikin:["ダイキン","Japan","https://www.daikin.co.jp/support/"], Iris:["アイリスオーヤマ","Japan","https://www.irisohyama.co.jp/support/"], Yamazen:["山善","Japan","https://book.yamazen.co.jp/"], Balmuda:["バルミューダ","Japan","https://www.balmuda.com/jp/support/"], Zojirushi:["象印マホービン","Japan","https://www.zojirushi.co.jp/toiawase/"], Tiger:["タイガー魔法瓶","Japan","https://www.tiger-corporation.com/ja/jpn/support/"], Canon:["キヤノン","Japan","https://canon.jp/support"], Nikon:["ニコン","Japan","https://downloadcenter.nikonimglib.com/"], Fujifilm:["富士フイルム","Japan","https://www.fujifilm.com/jp/ja/consumer/support"], Epson:["エプソン","Japan","https://www.epson.jp/support/"], Brother:["ブラザー","Japan","https://support.brother.co.jp/"], HP:["日本HP","Global","https://support.hp.com/"], Dell:["デル","Global","https://www.dell.com/support/home/"], Lenovo:["レノボ","Global","https://support.lenovo.com/"], ASUS:["ASUS","Global","https://www.asus.com/support/"], Acer:["Acer","Global","https://www.acer.com/support"], MSI:["MSI","Global","https://www.msi.com/support"], LG:["LG","Global","https://www.lg.com/support"], Samsung:["Samsung","Global","https://www.samsung.com/support/"], Google:["Google","Global","https://support.google.com/"], Microsoft:["Microsoft","Global","https://support.microsoft.com/"], Nintendo:["任天堂","Japan","https://www.nintendo.co.jp/support/"], PlayStation:["PlayStation","Global","https://www.playstation.com/support/"], Valve:["Valve","Global","https://help.steampowered.com/"], Meta:["Meta","Global","https://www.meta.com/help/quest/"], Yamaha:["ヤマハ","Japan","https://jp.yamaha.com/support/"], Bose:["Bose","Global","https://support.bose.com/"], JBL:["JBL","Global","https://support.jbl.com/"], Sennheiser:["Sennheiser","Global","https://www.sennheiser-hearing.com/support/"], AudioTechnica:["オーディオテクニカ","Japan","https://www.audio-technica.co.jp/support/"], Denon:["デノン","Global","https://support.denon.com/"], Marantz:["マランツ","Global","https://support.marantz.com/"], TPLink:["TP-Link","Global","https://www.tp-link.com/support/"], Buffalo:["バッファロー","Japan","https://www.buffalo.jp/support/"], Synology:["Synology","Global","https://www.synology.com/support"], QNAP:["QNAP","Global","https://www.qnap.com/en/support"], Ubiquiti:["Ubiquiti","Global","https://help.ui.com/"], Garmin:["Garmin","Global","https://support.garmin.com/"], Fitbit:["Fitbit","Global","https://help.fitbit.com/"], Anker:["Anker","Global","https://support.anker.com/"], Eufy:["Eufy","Global","https://support.eufy.com/"], Ring:["Ring","Global","https://ring.com/support"], Amazon:["Amazon Devices","Global","https://www.amazon.com/gp/help/customer/display.html"], Makita:["マキタ","Japan","https://www.makita.co.jp/product/support/"], HiKOKI:["HiKOKI","Japan","https://www.hikoki-powertools.jp/manual/"], BoschTools:["ボッシュ工具","Global","https://www.boschtools.com/us/en/service/product-manuals/"], Karcher:["ケルヒャー","Global","https://www.kaercher.com/int/services/support/manuals.html"], Dyson:["ダイソン","Global","https://www.dyson.com/support"], iRobot:["iRobot","Global","https://homesupport.irobot.com/"], Roborock:["Roborock","Global","https://support.roborock.com/"], Omron:["オムロンヘルスケア","Japan","https://www.healthcare.omron.co.jp/support/"], Tanita:["タニタ","Japan","https://www.tanita.co.jp/support/"], Withings:["Withings","Global","https://support.withings.com/"], Tesla:["Tesla","Global","https://www.tesla.com/ownersmanual"], Toyota:["トヨタ","Japan","https://manual.toyota.jp/"], Honda:["ホンダ","Japan","https://www.honda.co.jp/ownersmanual/"], Nissan:["日産","Japan","https://www.nissan.co.jp/OPTIONAL-PARTS/NAVIOM/"], Mazda:["マツダ","Japan","https://www.mazda.co.jp/carlife/owner/manual/"], Subaru:["スバル","Japan","https://www.subaru.jp/afterservice/tnst/"], Kenwood:["JVCケンウッド","Japan","https://www.kenwood.com/jp/cs/"], Pioneer:["パイオニア","Japan","https://jpn.pioneer/ja/support/manual/"], Eizo:["EIZO","Japan","https://www.eizo.co.jp/support/db/"], BenQ:["BenQ","Global","https://www.benq.com/en-us/support/downloads-faq.html"], Wacom:["ワコム","Global","https://www.wacom.com/support/product-support/manuals"]
  };
  const groups = [
    [C.pc,["Apple","Sony","Panasonic","Sharp","HP","Dell","Lenovo","ASUS","Acer","MSI","LG","Samsung","Google","Microsoft","Anker","Eizo","BenQ","Wacom"],["Phone","Tablet","Laptop","Desktop","Monitor","Dock","Keyboard","Mouse","Workstation","Chromebook"]],
    [C.home,["Sony","Panasonic","Sharp","Hitachi","Toshiba","Mitsubishi","Daikin","Iris","Yamazen","Balmuda","Zojirushi","Tiger","LG","Samsung","Dyson","iRobot","Roborock","Karcher"],["TV","Recorder","Refrigerator","Washing Machine","Microwave Oven","Air Conditioner","Vacuum Cleaner","Air Purifier","Rice Cooker","Lighting","Fan","Heater"]],
    [C.printer,["Canon","Epson","Brother","Fujifilm","HP","Ricoh","Panasonic","Sharp"],["Inkjet Printer","Laser Printer","Business Printer","Scanner","Label Printer","Photo Printer","MFP","Fax","Large Format Printer","Receipt Printer"]],
    [C.camera,["Sony","Canon","Nikon","Fujifilm","Ricoh","DJI","GoPro","Insta360","Panasonic","Epson","LG","Google","Eufy","Ring","Kenwood","Pioneer","BenQ"],["Camera","Lens","Projector","Action Camera","Dash Cam","Gimbal","Webcam","Drone","Security Camera","Video Recorder"]],
    [C.audio,["Apple","Sony","Yamaha","Bose","JBL","Sennheiser","AudioTechnica","Denon","Marantz","LG","Samsung","DJI","Anker","Kenwood","Pioneer"],["Headphones","Earbuds","Speaker","Soundbar","AV Receiver","Microphone","Turntable","Mixer","Amplifier","Recorder"]],
    [C.game,["Sony","Nintendo","PlayStation","Valve","Meta","Microsoft","ASUS","Acer","MSI","Dell","Lenovo","JBL","AudioTechnica","Eizo","BenQ"],["Game Console","Controller","Gaming Monitor","Gaming Headset","VR Headset","Arcade Controller","Handheld","Dock","Racing Wheel","Streaming Device"]],
    [C.net,["TPLink","Buffalo","Synology","QNAP","Ubiquiti","ASUS","Yamaha","Google","Amazon","Anker","Microsoft"],["Router","Mesh Wi-Fi","NAS","Switch","Access Point","Repeater","Powerline","Modem","Network Camera","Gateway"]],
    [C.other,["Apple","Samsung","Google","Garmin","Fitbit","Anker","Eufy","Amazon","Makita","HiKOKI","BoschTools","Omron","Tanita","Withings","Tesla","Toyota","Honda","Nissan","Mazda","Subaru","Wacom","Brother","Canon","Nikon","Yamaha"],["Watch","Scale","Thermometer","Power Tool","Battery Charger","Car Navigation","EV Charger","Smart Home","Fitness Tracker","Kitchen Scale","Sewing Machine","Electronic Dictionary"]]
  ];
  const records = [];
  groups.forEach(([category, makerKeys, lines]) => {
    makerKeys.forEach((key) => {
      const m = makers[key];
      if (!m) return;
      const [nameJa,country,url] = m;
      lines.forEach((line) => {
        records.push({
          brand:`${key} ${line}`,
          nameJa:`${nameJa} ${line}`,
          nameEn:`${key} ${line}`,
          category,
          country,
          manualUrl:url,
          supportUrl:url,
          note:notes[category],
          hint:`${line} 型番、製品名、シリーズ名`,
          tags:`${key} ${nameJa} ${line} ${category}`.toLowerCase().split(/\s+/),
          sourceType:"official",
          linkReview:"category-curated support entry 2026-05-13"
        });
      });
    });
  });
  const seen = new Set();
  window.MANUALFINDER_FULL_RECORDS = records.filter((item) => {
    const k = `${item.brand}|${item.category}`.toLowerCase();
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
})();
