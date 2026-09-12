(() => {
  const V = "2026-09-12";
  window.MANUALFINDER_WAVE2_BATCHES = [
    "manuals.wave2.01.js",
    "manuals.wave2.02.js",
    "manuals.wave2.03.js",
    "manuals.wave2.04.js",
    "manuals.wave2.05.js"
  ];
  window.MANUALFINDER_WAVE2_TFAL = window.MANUALFINDER_WAVE2_TFAL || [];
  window.MANUALFINDER_WAVE2_OM = window.MANUALFINDER_WAVE2_OM || [];
  window.MANUALFINDER_WAVE2_FUJI = window.MANUALFINDER_WAVE2_FUJI || [];
  window.MANUALFINDER_WAVE2_HISENSE = window.MANUALFINDER_WAVE2_HISENSE || [];
  window.MANUALFINDER_WAVE2_SEIKO = window.MANUALFINDER_WAVE2_SEIKO || [];
  window.MANUALFINDER_WAVE2_ROLAND = window.MANUALFINDER_WAVE2_ROLAND || [];
  window.MANUALFINDER_WAVE2_HAIER = window.MANUALFINDER_WAVE2_HAIER || [];

  const slug = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const lines = (parts) => parts.flatMap((part) => String(part || "").split("\n").map((x) => x.trim()).filter(Boolean));

  const tfal = () => {
    const supportUrl = "https://www.t-fal.co.jp/consumer-services/instructions-for-use/";
    return lines(window.MANUALFINDER_WAVE2_TFAL).flatMap((line) => {
      const [modelsRaw, path, productName] = line.split("|");
      const models = modelsRaw.split(",").map((x) => x.trim()).filter(Boolean);
      const manualUrl = `https://www.t-fal.co.jp/${path}`;
      const shared = models.length > 1;
      return models.map((model) => ({
        id: `wave2-tfal-${slug(model)}`,
        brand: "T-fal", maker: "T-fal", model,
        family: `Electric kettle / ${productName}`,
        nameJa: `ティファール ${productName} ${model}`,
        nameEn: `T-fal ${productName} ${model}`,
        category: "家電", country: "Japan", manualUrl, supportUrl,
        noteJa: shared ? "複数の製品品番に対してメーカーが共通提供している公式取扱説明書PDFです。" : "ティファール公式の取扱説明書PDFです。",
        noteEn: shared ? "Official T-fal instruction manual PDF shared by the vendor-defined model group." : "Official T-fal instruction manual PDF.",
        hintJa: `ティファール T-fal ${model} 電気ケトル ${productName}`,
        hintEn: `T-fal ${model} electric kettle`,
        aliases: ["ティファール", "電気ケトル", productName],
        sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: supportUrl,
        resolutionState: shared ? "shared_official_manual_page" : "direct_manual_page",
        manualKind: "manual", sharedTarget: shared,
        linkReview: `official Wave 2 target verified ${V}`
      }));
    });
  };

  const om = () => {
    const bodySupport = "https://support.jp.omsystem.com/en/support/imsg/digicamera/download/manual/pen.html";
    const tgSupport = "https://support.jp.omsystem.com/en/support/imsg/digicamera/download/manual/tg.html";
    return lines(window.MANUALFINDER_WAVE2_OM).map((line) => {
      const [model, path] = line.split("|");
      const tough = model.startsWith("TG-");
      const supportUrl = tough ? tgSupport : bodySupport;
      return {
        id: `wave2-omsystem-${slug(model)}`, brand: "OM SYSTEM", maker: "OM SYSTEM", model,
        family: tough ? "Tough compact camera" : "Interchangeable-lens camera body",
        nameJa: `OM SYSTEM ${model}`, nameEn: `OM SYSTEM ${model}`,
        category: "カメラ・映像", country: "Global",
        manualUrl: `https://download.omsystem.com/pages/inst/${path}/index.html`, supportUrl,
        noteJa: "OM SYSTEM公式の機種別マニュアルページです。",
        noteEn: "Official OM SYSTEM model-specific manual page.",
        hintJa: `OM SYSTEM オリンパス ${model} カメラ 取扱説明書`, hintEn: `OM SYSTEM ${model} camera manual`,
        aliases: ["OM SYSTEM", "オリンパス", "カメラ", "取扱説明書", tough ? "Tough" : "OM-D", tough ? "TG" : "PEN"],
        sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: supportUrl,
        resolutionState: "direct_manual_page", manualKind: "manual", sharedTarget: false,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  const fuji = () => lines(window.MANUALFINDER_WAVE2_FUJI).flatMap((line) => {
    const [modelsRaw, path, family] = line.split("|");
    const models = modelsRaw.split(",").map((x) => x.trim()).filter(Boolean);
    const manualUrl = `https://www.fujifilm.com/fb/ja/${path}`;
    return models.map((model) => ({
      id: `wave2-fujifilm-bi-${slug(model)}`, brand: "FUJIFILM Business Innovation", maker: "FUJIFILM Business Innovation", model, family,
      nameJa: `富士フイルムビジネスイノベーション ${model}`, nameEn: `FUJIFILM Business Innovation ${model}`,
      category: "プリンター・複合機", country: "Japan", manualUrl, supportUrl: manualUrl,
      noteJa: "メーカーが複数型番をまとめて提供している公式取扱説明書ページです。",
      noteEn: "Official FUJIFILM Business Innovation manual page shared by the vendor-defined model group.",
      hintJa: `富士フイルムビジネスイノベーション FUJIFILM BI ${model} 複合機 取扱説明書`,
      hintEn: `FUJIFILM Business Innovation ${model} multifunction printer manual`,
      aliases: ["富士フイルムビジネスイノベーション", "FUJIFILM BI", "複合機", "プリンター"],
      sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: manualUrl,
      resolutionState: "shared_official_manual_page", manualKind: "manual", sharedTarget: true,
      linkReview: `official Wave 2 target verified ${V}`
    }));
  });

  const hisense = () => {
    const supportUrl = "https://www.hisense.co.jp/search-manual/";
    return lines(window.MANUALFINDER_WAVE2_HISENSE).map((line) => {
      const [model, path] = line.split("|");
      return {
        id: `wave2-hisense-${slug(model)}`, brand: "Hisense", maker: "Hisense", model, family: "Television",
        nameJa: `ハイセンス ${model}`, nameEn: `Hisense ${model}`, category: "家電", country: "Japan",
        manualUrl: `https://www.hisense.co.jp/${path}`, supportUrl,
        noteJa: "ハイセンス公式のテレビ機能取扱説明書PDFです。", noteEn: "Official Hisense television function manual PDF.",
        hintJa: `ハイセンス Hisense ${model} テレビ TV 取扱説明書`, hintEn: `Hisense ${model} television TV manual`,
        aliases: ["ハイセンス", "テレビ", "TV"], sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: supportUrl,
        resolutionState: "direct_manual_page", manualKind: "manual", sharedTarget: false,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  const seiko = () => {
    const supportUrl = "https://www.seikowatches.com/jp-ja/customerservice/instruction?caliberNumber=&idx=H&language=ja-JP";
    return lines(window.MANUALFINDER_WAVE2_SEIKO).map((line) => {
      const [model, manualUrl] = line.split("|");
      return {
        id: `wave2-seiko-${slug(model)}`, brand: "Seiko", maker: "Seiko", model, family: "Watch caliber",
        nameJa: `セイコー キャリバー ${model}`, nameEn: `Seiko caliber ${model}`, category: "その他", country: "Japan",
        manualUrl, supportUrl, noteJa: "セイコー公式のキャリバー別取扱説明書です。", noteEn: "Official Seiko instruction manual for this caliber code.",
        hintJa: `セイコー SEIKO ${model} キャリバー 腕時計 時計 取扱説明書`, hintEn: `Seiko ${model} caliber watch manual`,
        aliases: ["セイコー", "SEIKO", "キャリバー", "腕時計", "時計"], sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: supportUrl,
        resolutionState: "direct_manual_page", manualKind: manualUrl.includes("/instructions/html/") ? "online-manual" : "manual", sharedTarget: false,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  const roland = () => {
    const supportUrl = "https://www.roland.com/jp/support/archives/archive_manuals_n-s/";
    return lines(window.MANUALFINDER_WAVE2_ROLAND).map((line) => {
      const [model, manualUrl] = line.split("|");
      return {
        id: `wave2-roland-${slug(model)}`, brand: "Roland", maker: "Roland", model, family: "Legacy music/audio product",
        nameJa: `ローランド ${model}`, nameEn: `Roland ${model}`, category: "その他", country: "Japan",
        manualUrl, supportUrl, noteJa: "ローランド公式の旧製品取扱説明書PDFです。", noteEn: "Official Roland legacy-product instruction manual PDF.",
        hintJa: `ローランド Roland ${model} 楽器 音響 取扱説明書`, hintEn: `Roland ${model} legacy product manual`,
        aliases: ["ローランド", "Roland", "楽器", "音響", "旧製品"], sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: supportUrl,
        resolutionState: "direct_manual_page", manualKind: "manual", sharedTarget: false,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  const haier = () => {
    const supportUrl = "https://www.haier.com/jp/service-support/product-guide/";
    const familyAliases = {
      Refrigerator: ["冷蔵庫", "冷凍冷蔵庫"],
      "Washing machine": ["洗濯機", "全自動洗濯機"],
      "Washer-dryer": ["洗濯乾燥機", "ドラム式洗濯乾燥機"],
      Freezer: ["冷凍庫"]
    };
    return lines(window.MANUALFINDER_WAVE2_HAIER).map((line) => {
      const [model, path, family, sharedFlag] = line.split("|");
      const shared = sharedFlag === "1";
      const manualUrl = `https://www.haier.com/jp/${path}`;
      const aliases = familyAliases[family] || [];
      return {
        id: `wave2-haier-${slug(model)}`, brand: "Haier", maker: "Haier", model, family,
        nameJa: `ハイアール ${model}`, nameEn: `Haier ${model}`, category: "家電", country: "Japan",
        manualUrl, supportUrl,
        noteJa: shared ? "ハイアールが複数型番をまとめて提供している公式製品・取扱説明書ページです。" : "ハイアール公式の型番別製品・取扱説明書ページです。",
        noteEn: shared ? "Official Haier product/manual page shared by the vendor-defined model group." : "Official Haier model-specific product and manual page.",
        hintJa: `ハイアール Haier ${model} ${aliases.join(" ")} 取扱説明書`, hintEn: `Haier ${model} ${family} manual`,
        aliases: ["ハイアール", "Haier", ...aliases, "取扱説明書"], sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: manualUrl,
        resolutionState: shared ? "shared_official_manual_page" : "direct_model_support", manualKind: "product-support", sharedTarget: shared,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  window.MANUALFINDER_BUILD_WAVE2 = () => [...tfal(), ...om(), ...fuji(), ...hisense(), ...seiko(), ...roland(), ...haier()];
})();
