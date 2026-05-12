(() => {
  const C = { pc:"PC・スマホ", home:"家電", printer:"プリンター・複合機", camera:"カメラ・映像", audio:"オーディオ", game:"ゲーム", net:"ネットワーク機器", other:"その他" };
  const note = (c) => `${c} の公式マニュアル／サポート入口です。`;
  const brands = [
    ["Apple","Apple","Global","https://support.apple.com/",["iPhone:pc","Mac:pc","iPad:pc","Apple Watch:other","AirPods:audio","Apple TV:home","HomePod:audio","Magic Keyboard:pc","Magic Mouse:pc","Studio Display:pc"]],
    ["Sony","ソニー","Japan","https://www.sony.jp/support/",["BRAVIA:home","Xperia:pc","Alpha:camera","Cyber-shot:camera","Handycam:camera","Walkman:audio","WH Headphones:audio","WF Earbuds:audio","PlayStation:game","SRS Speaker:audio"]],
    ["Panasonic","パナソニック","Japan","https://panasonic.jp/support/",["VIERA:home","DIGA:home","LUMIX:camera","Let's note:pc","Washing Machine:home","Refrigerator:home","Microwave Oven:home","Air Conditioner:home","Rice Cooker:home","Hair Dryer:home"]],
    ["Sharp","シャープ","Japan","https://jp.sharp/support/",["AQUOS TV:home","AQUOS Phone:pc","Plasmacluster:home","Microwave Oven:home","Washing Machine:home","Refrigerator:home","Calculator:other","Air Conditioner:home","Humidifier:home","Cleaner:home"]],
    ["Hitachi","日立","Japan","https://kadenfan.hitachi.co.jp/support/",["Washing Machine:home","Refrigerator:home","Vacuum Cleaner:home","Air Conditioner:home","Microwave Oven:home","Rice Cooker:home","IH Cooker:home","Dryer:home","Air Purifier:home","Lighting:home"]],
    ["Toshiba","東芝","Japan","https://www.toshiba-lifestyle.com/jp/support/",["REGZA:home","Washing Machine:home","Refrigerator:home","Vacuum Cleaner:home","Microwave Oven:home","Rice Cooker:home","Air Conditioner:home","Lighting:home","Cleaner:home","Battery:other"]],
    ["Canon","キヤノン","Japan","https://canon.jp/support",["EOS:camera","PowerShot:camera","RF Lens:camera","EF Lens:camera","PIXUS:printer","imageRUNNER:printer","CanoScan:printer","SELPHY:printer","Projector:camera","Calculator:other"]],
    ["Nikon","ニコン","Japan","https://downloadcenter.nikonimglib.com/",["Z Camera:camera","D Camera:camera","COOLPIX:camera","NIKKOR Lens:camera","Speedlight:camera","Binoculars:other","NX Studio:camera","Battery Charger:camera","Rangefinder:other","Film Scanner:printer"]],
    ["Fujifilm","富士フイルム","Japan","https://www.fujifilm.com/jp/ja/consumer/support",["X Camera:camera","GFX:camera","XF Lens:camera","GF Lens:camera","instax:camera","instax Printer:printer","Binoculars:other","Apeos:printer","DocuPrint:printer","Scanner:printer"]],
    ["Epson","エプソン","Japan","https://www.epson.jp/support/",["Inkjet Printer:printer","Business Printer:printer","Scanner:printer","Projector:camera","Label Printer:printer","Large Format Printer:printer","Receipt Printer:printer","MOVERIO:other","Photo Printer:printer","Smart Glasses:other"]],
    ["Brother","ブラザー","Japan","https://support.brother.co.jp/",["Inkjet Printer:printer","Laser Printer:printer","MFC:printer","Label Writer:printer","Sewing Machine:other","Scanner:printer","Fax:printer","ScanNCut:other","Embroidery Machine:other","Mobile Printer:printer"]],
    ["HP","日本HP","Global","https://support.hp.com/",["Laptop:pc","Desktop:pc","Printer:printer","Monitor:pc","Workstation:pc","Dock:pc","Scanner:printer","Gaming PC:game","Keyboard:pc","Mouse:pc"]],
    ["Dell","デル","Global","https://www.dell.com/support/home/",["XPS:pc","Inspiron:pc","Latitude:pc","Precision:pc","Alienware:game","Monitor:pc","PowerEdge:pc","Dock:pc","Keyboard:pc","Mouse:pc"]],
    ["Lenovo","レノボ","Global","https://support.lenovo.com/",["ThinkPad:pc","IdeaPad:pc","Yoga:pc","Legion:game","Tablet:pc","ThinkVision:pc","Dock:pc","Workstation:pc","Chromebook:pc","Server:pc"]],
    ["ASUS","ASUS","Global","https://www.asus.com/support/",["Zenbook:pc","Vivobook:pc","ROG Laptop:game","ROG Ally:game","Router:net","Monitor:pc","Motherboard:other","Zenfone:pc","Mini PC:pc","Graphics Card:other"]],
    ["Acer","Acer","Global","https://www.acer.com/support",["Aspire:pc","Swift:pc","Predator:game","Nitro:game","Monitor:pc","Projector:camera","Chromebook:pc","Desktop:pc","Tablet:pc","Accessory:other"]],
    ["MSI","MSI","Global","https://www.msi.com/support",["Laptop:pc","Motherboard:other","Graphics Card:other","Monitor:pc","Desktop:pc","Gaming Handheld:game","Keyboard:game","Mouse:game","Router:net","AIO PC:pc"]],
    ["LG","LG","Global","https://www.lg.com/support",["TV:home","Monitor:pc","Washing Machine:home","Refrigerator:home","Soundbar:audio","Air Conditioner:home","Projector:camera","Styler:home","Vacuum:home","Dishwasher:home"]],
    ["Samsung","Samsung","Global","https://www.samsung.com/support/",["Galaxy:pc","Galaxy Tab:pc","Galaxy Watch:other","TV:home","Monitor:pc","SSD:other","Soundbar:audio","Home Appliance:home","Projector:camera","Buds:audio"]],
    ["Google","Google","Global","https://support.google.com/",["Pixel:pc","Pixel Buds:audio","Pixel Watch:other","Nest Hub:other","Nest Cam:camera","Chromecast:home","Nest Wifi:net","Fitbit:other","Tablet:pc","Doorbell:other"]],
    ["Nintendo","任天堂","Japan","https://www.nintendo.co.jp/support/",["Switch:game","Switch Lite:game","Switch OLED:game","Joy-Con:game","Pro Controller:game","3DS:game","Wii U:game","Amiibo:game","Dock:game","Ring-Con:game"]],
    ["DJI","DJI","Global","https://www.dji.com/support",["Mavic:camera","Mini:camera","Air:camera","Avata:camera","Osmo:camera","Action Camera:camera","Ronin:camera","DJI Mic:audio","Power Station:other","Goggles:camera"]],
    ["Yamaha","ヤマハ","Japan","https://jp.yamaha.com/support/",["AV Receiver:audio","Soundbar:audio","Piano:other","Keyboard:other","Mixer:audio","Router:net","Speaker:audio","Guitar Amp:audio","Synthesizer:other","Recorder:audio"]],
    ["Bose","Bose","Global","https://support.bose.com/",["QuietComfort:audio","SoundLink:audio","Soundbar:audio","Earbuds:audio","Speaker:audio","Amplifier:audio","Aviation:audio","Sleepbuds:audio","Portable Speaker:audio","Home Speaker:audio"]],
    ["TP-Link","TP-Link","Global","https://www.tp-link.com/support/",["Archer:net","Deco:net","Tapo:other","Kasa:other","Switch:net","Adapter:net","Omada:net","Camera:camera","Repeater:net","Powerline:net"]],
    ["Buffalo","バッファロー","Japan","https://www.buffalo.jp/support/",["AirStation:net","LinkStation:net","TeraStation:net","HDD:other","SSD:other","Keyboard:pc","Mouse:pc","Hub:net","USB Memory:other","NAS:net"]]
  ];
  const batch = brands.flatMap(([brand,nameJa,country,support,lines]) => lines.map((spec) => { const [line,key] = spec.split(":"); const category = C[key]; return {brand:`${brand} ${line}`,nameJa:`${nameJa} ${line}`,nameEn:`${brand} ${line}`,category,country,manualUrl:support,supportUrl:support,hint:`${line} 型番、製品名、シリーズ名`,note:note(category),tags:String(`${brand} ${nameJa} ${line} ${category}`).toLowerCase().split(/\s+/),sourceType:"official",linkReview:"batch2a product-line entry 2026-05-12"}; }));
  const prev = window.fetch.bind(window);
  window.fetch = function(input, init) {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    if (!/manuals\.json(?:$|[?#])/.test(url)) return prev(input, init);
    return prev(input, init).then(async (res) => { if (!res.ok) return res; const base = await res.clone().json(); const seen = new Set(); const merged = base.concat(batch).filter((item) => { const key = `${item.brand}|${item.category}`.toLowerCase(); if (seen.has(key)) return false; seen.add(key); return true; }); return new Response(JSON.stringify(merged), {status:200,statusText:"OK",headers:{"Content-Type":"application/json; charset=utf-8"}}); });
  };
})();
