(() => {
const V="2026-09-12";
const C=["その他","オーディオ","カメラ・映像","ネットワーク機器","プリンター・複合機"];
const F=["5G/4G mobile router","Ace Series","Action camera","Air","Avata/FPV","Casiotone","Color LED MFP","Color LED printer","Color MFP","Color printer","Current color MFP","Current mono MFP","Current wide MFP","DJI Mic","Dot impact printer","EX-word","Flip","G-SHOCK","GO Series","ISDN terminal adapter","Inspire","Link Series","Mavic","Mini","Mono MFP/copier","Mono printer","NAME LAND","Neo","Osmo 360","Osmo Action","Osmo Mobile","Osmo Nano","Osmo Pocket","Phantom","Power","RC","Ronin","Wi-Fi home router","Wi-Fi repeater","Wide MFP","X Series"];
const FA={"2":["アクションカメラ"],"37":["Wi-Fiルーター","無線LANルーター","ホームルーター"],"38":["Wi-Fi中継機","無線LAN中継機","中継機"],"0":["モバイルルーター","5Gルーター","4Gルーター"],"19":["ISDN","ターミナルアダプター"],"9":["カラープリンター"],"25":["モノクロプリンター"],"8":["カラー複合機","複合機"],"24":["モノクロ複合機","複合機","コピー機"],"39":["広幅複合機","複合機"],"7":["カラーLEDプリンター","プリンター"],"6":["カラーLED複合機","複合機"],"14":["ドットインパクトプリンター","ドットプリンター"],"22":["ドローン"],"3":["ドローン"],"23":["ドローン"],"16":["ドローン"],"27":["ドローン"],"4":["FPVドローン","ドローン"],"20":["ドローン"],"33":["ドローン"],"35":["送信機","リモートコントローラー"],"29":["アクションカメラ"],"28":["360度カメラ","360カメラ"],"31":["カメラ"],"32":["ジンバルカメラ","カメラ"],"30":["スマホジンバル","ジンバル"],"13":["ワイヤレスマイク","マイク"],"36":["ジンバル","カメラスタビライザー"],"34":["ポータブル電源","充電器","電源"],"10":["カラー複合機","複合機"],"11":["モノクロ複合機","複合機"],"12":["広幅複合機","複合機"],"17":["Gショック","腕時計","時計"],"15":["エクスワード","電子辞書"],"26":["ネームランド","ラベルライター"],"5":["カシオトーン","電子キーボード","楽器"],"40":["360度カメラ","360カメラ"],"21":["ウェブカメラ","Webカメラ"],"18":["アクションカメラ","ウェアラブルカメラ"],"1":["アクションカメラ"]};
const M=[["GoPro","https://gopro.com/","Global",["ゴープロ"],"https://gopro.com/ja/jp/update"],["Aterm","https://www.aterm.jp/","Japan",["エーターム","NEC Aterm","NEC"],"https://www.aterm.jp/support/"],["KYOCERA Document Solutions","https://www.kyoceradocumentsolutions.co.jp/","Japan",["KYOCERA","京セラ","京セラドキュメントソリューションズ"],"https://www.kyoceradocumentsolutions.co.jp/manual/past.html"],["OKI","https://www.oki.com/","Japan",["沖電気","OKIデータ"],null],["DJI","https://www.dji.com/","Global",["ディージェイアイ"],"https://www.dji.com/downloads"],["RICOH","https://www.ricoh.co.jp/","Japan",["Ricoh","リコー"],"https://www.ricoh.co.jp/support/manual"],["CASIO","https://www.casio.com/","Japan",["Casio","カシオ"],"https://www.casio.com/jp/support/manual/"],["Insta360","https://onlinemanual.insta360.com/","Global",["インスタ360"],"https://onlinemanual.insta360.com/"]];
const OS={"c":"jp/printing/support/user-manual/color/index.html","m":"jp/printing/support/user-manual/colormfp/index.html","d":"jp/printing/support/user-manual/dot/index.html"};
const R={p:"direct_model_support",m:"direct_manual_page",o:"direct_online_manual",s:"shared_official_manual_page"};
window.MANUALFINDER_WAVE1_BATCHES=["manuals.wave1.01.js","manuals.wave1.02.js","manuals.wave1.03.js","manuals.wave1.04.js","manuals.wave1.05.js","manuals.wave1.06.js"];
window.MANUALFINDER_WAVE1_RAW=[];
window.MANUALFINDER_BUILD_WAVE1=()=>{
  const lines=window.MANUALFINDER_WAVE1_RAW.flatMap((part)=>String(part||"").split("\n").filter(Boolean));
  return lines.map((line)=>{
    const [idx,mi,ci,fi,rsc,model,path]=line.split("~");
    const [maker,base,country,makerAliases,supportBase]=M[Number(mi)];
    const category=C[Number(ci)],family=F[Number(fi)],rc=rsc[0],sourceCode=rsc.slice(1),resolutionState=R[rc],shared=rc==="s";
    const aliases=[...(makerAliases||[]),...(FA[String(fi)]||[])];
    const supportUrl=supportBase||(base+OS[sourceCode]);
    const manualUrl=base+path;
    return {
      id:`wave1-${String(idx).padStart(3,"0")}`,brand:maker,maker,model,family,
      nameJa:`${maker} ${model}`,nameEn:`${maker} ${model}`,category,country,
      manualUrl,supportUrl,
      noteJa:shared?"メーカーが複数機種をまとめて提供している公式共通ページです。":"メーカー公式の機種別マニュアル／製品サポート先です。",
      noteEn:shared?"Official vendor page intentionally shared by multiple models.":"Verified official model manual or product-support destination.",
      hintJa:`${maker} ${model} ${family} ${aliases.join(" ")}`.trim(),
      hintEn:`${maker} ${model} ${family}`.trim(),aliases,
      tags:[maker,model,family,category,...aliases].join(" ").toLowerCase().split(/\s+/).filter(Boolean),
      sourceType:"official",sourceLevel:"A",verifiedAt:V,evidenceUrl:supportUrl,resolutionState,
      manualKind:rc==="m"?"manual":rc==="o"?"online-manual":shared?"shared-official":"product-support",
      sharedTarget:shared,linkReview:`official Wave 1 target verified ${V}`
    };
  }).sort((a,b)=>a.id.localeCompare(b.id));
};
})();
