(() => {
  const V = "2026-09-12";
  window.MANUALFINDER_WAVE2_BATCHES = [
    "manuals.wave2.01.js",
    "manuals.wave2.02.js",
    "manuals.wave2.03.js"
  ];
  window.MANUALFINDER_WAVE2_TFAL = window.MANUALFINDER_WAVE2_TFAL || [];
  window.MANUALFINDER_WAVE2_OM = window.MANUALFINDER_WAVE2_OM || [];
  window.MANUALFINDER_WAVE2_FUJI = window.MANUALFINDER_WAVE2_FUJI || [];
  window.MANUALFINDER_WAVE2_HISENSE = window.MANUALFINDER_WAVE2_HISENSE || [];

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
        brand: "T-fal",
        maker: "T-fal",
        model,
        family: `Electric kettle / ${productName}`,
        nameJa: `ティファール ${productName} ${model}`,
        nameEn: `T-fal ${productName} ${model}`,
        category: "家電",
        country: "Japan",
        manualUrl,
        supportUrl,
        noteJa: shared ? "複数の製品品番に対してメーカーが共通提供している公式取扱説明書PDFです。" : "ティファール公式の取扱説明書PDFです。",
        noteEn: shared ? "Official T-fal instruction manual PDF shared by the vendor-defined model group." : "Official T-fal instruction manual PDF.",
        hintJa: `ティファール T-fal ${model} 電気ケトル ${productName}`,
        hintEn: `T-fal ${model} electric kettle`,
        aliases: ["ティファール", "電気ケトル", productName],
        sourceType: "official",
        sourceLevel: "A",
        verifiedAt: V,
        evidenceUrl: supportUrl,
        resolutionState: shared ? "shared_official_manual_page" : "direct_manual_page",
        manualKind: "manual",
        sharedTarget: shared,
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
        id: `wave2-omsystem-${slug(model)}`,
        brand: "OM SYSTEM",
        maker: "OM SYSTEM",
        model,
        family: tough ? "Tough compact camera" : "Interchangeable-lens camera body",
        nameJa: `OM SYSTEM ${model}`,
        nameEn: `OM SYSTEM ${model}`,
        category: "カメラ・映像",
        country: "Global",
        manualUrl: `https://download.omsystem.com/pages/inst/${path}/index.html`,
        supportUrl,
        noteJa: "OM SYSTEM公式の機種別マニュアルページです。",
        noteEn: "Official OM SYSTEM model-specific manual page.",
        hintJa: `OM SYSTEM オリンパス ${model} カメラ 取扱説明書`,
        hintEn: `OM SYSTEM ${model} camera manual`,
        aliases: ["OM SYSTEM", "オリンパス", "カメラ", "取扱説明書", tough ? "Tough" : "OM-D", tough ? "TG" : "PEN"],
        sourceType: "official",
        sourceLevel: "A",
        verifiedAt: V,
        evidenceUrl: supportUrl,
        resolutionState: "direct_manual_page",
        manualKind: "manual",
        sharedTarget: false,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  const fuji = () => {
    return lines(window.MANUALFINDER_WAVE2_FUJI).flatMap((line) => {
      const [modelsRaw, path, family] = line.split("|");
      const models = modelsRaw.split(",").map((x) => x.trim()).filter(Boolean);
      const manualUrl = `https://www.fujifilm.com/fb/ja/${path}`;
      return models.map((model) => ({
        id: `wave2-fujifilm-bi-${slug(model)}`,
        brand: "FUJIFILM Business Innovation",
        maker: "FUJIFILM Business Innovation",
        model,
        family,
        nameJa: `富士フイルムビジネスイノベーション ${model}`,
        nameEn: `FUJIFILM Business Innovation ${model}`,
        category: "プリンター・複合機",
        country: "Japan",
        manualUrl,
        supportUrl: manualUrl,
        noteJa: "メーカーが複数型番をまとめて提供している公式取扱説明書ページです。",
        noteEn: "Official FUJIFILM Business Innovation manual page shared by the vendor-defined model group.",
        hintJa: `富士フイルムビジネスイノベーション FUJIFILM BI ${model} 複合機 取扱説明書`,
        hintEn: `FUJIFILM Business Innovation ${model} multifunction printer manual`,
        aliases: ["富士フイルムビジネスイノベーション", "FUJIFILM BI", "複合機", "プリンター"],
        sourceType: "official",
        sourceLevel: "A",
        verifiedAt: V,
        evidenceUrl: manualUrl,
        resolutionState: "shared_official_manual_page",
        manualKind: "manual",
        sharedTarget: true,
        linkReview: `official Wave 2 target verified ${V}`
      }));
    });
  };

  const hisense = () => {
    const supportUrl = "https://www.hisense.co.jp/search-manual/";
    return lines(window.MANUALFINDER_WAVE2_HISENSE).map((line) => {
      const [model, path] = line.split("|");
      return {
        id: `wave2-hisense-${slug(model)}`,
        brand: "Hisense",
        maker: "Hisense",
        model,
        family: "Television",
        nameJa: `ハイセンス ${model}`,
        nameEn: `Hisense ${model}`,
        category: "家電",
        country: "Japan",
        manualUrl: `https://www.hisense.co.jp/${path}`,
        supportUrl,
        noteJa: "ハイセンス公式のテレビ機能取扱説明書PDFです。",
        noteEn: "Official Hisense television function manual PDF.",
        hintJa: `ハイセンス Hisense ${model} テレビ TV 取扱説明書`,
        hintEn: `Hisense ${model} television TV manual`,
        aliases: ["ハイセンス", "テレビ", "TV"],
        sourceType: "official",
        sourceLevel: "A",
        verifiedAt: V,
        evidenceUrl: supportUrl,
        resolutionState: "direct_manual_page",
        manualKind: "manual",
        sharedTarget: false,
        linkReview: `official Wave 2 target verified ${V}`
      };
    });
  };

  window.MANUALFINDER_BUILD_WAVE2 = () => [...tfal(), ...om(), ...fuji(), ...hisense()];
})();
