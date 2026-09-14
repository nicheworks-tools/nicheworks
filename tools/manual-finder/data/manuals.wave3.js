(() => {
  const V = "2026-09-13";
  const EPSON_V = "2026-09-14";
  const CANON_V = "2026-09-14";
  window.MANUALFINDER_WAVE3_BATCHES = ["manuals.wave3.01.js", "manuals.wave3.02.js", "manuals.wave3.04.js", "manuals.wave3.05.js"];
  window.MANUALFINDER_WAVE3_NIKON = window.MANUALFINDER_WAVE3_NIKON || [];
  window.MANUALFINDER_WAVE3_BROTHER = window.MANUALFINDER_WAVE3_BROTHER || [];
  window.MANUALFINDER_WAVE3_EPSON = window.MANUALFINDER_WAVE3_EPSON || [];
  window.MANUALFINDER_WAVE3_CANON = window.MANUALFINDER_WAVE3_CANON || [];

  const slug = (v) => String(v || "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const lines = (parts) => parts.flatMap((part) => String(part || "").split("\n").map((x) => x.trim()).filter(Boolean));

  const nikon = () => {
    const supportUrl = "https://onlinemanual.nikonimglib.com/portal/ja/";
    return lines(window.MANUALFINDER_WAVE3_NIKON).flatMap((line) => {
      const [modelsRaw, manualUrl] = line.split("|");
      const models = modelsRaw.split(",").map((x) => x.trim()).filter(Boolean);
      const shared = models.length > 1;
      return models.map((model) => ({
        id: `wave3-nikon-${slug(model)}`,
        brand: "Nikon", maker: "Nikon", model, family: "Mirrorless camera",
        nameJa: `ニコン ${model}`, nameEn: `Nikon ${model}`,
        category: "カメラ・映像", country: "Japan", manualUrl, supportUrl,
        noteJa: shared ? "ニコンが複数機種に共通提供している公式Webマニュアルです。" : "ニコン公式の機種別Webマニュアルです。",
        noteEn: shared ? "Official Nikon Web manual shared by the vendor-defined model group." : "Official Nikon model-specific Web manual.",
        hintJa: `ニコン Nikon ${model} ミラーレス カメラ 取扱説明書`,
        hintEn: `Nikon ${model} mirrorless camera manual`,
        aliases: ["ニコン", "Nikon", "ミラーレス", "カメラ", "取扱説明書"],
        sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: supportUrl,
        resolutionState: shared ? "shared_official_manual_page" : "direct_online_manual",
        manualKind: "online-manual", sharedTarget: shared,
        linkReview: `official Wave 3A target verified ${V}`
      }));
    });
  };

  const brother = () => {
    const supportUrl = "https://support.brother.co.jp/j/b/productsearch.aspx?c=jp&content=ml&lang=ja";
    return lines(window.MANUALFINDER_WAVE3_BROTHER).map((line) => {
      const [model, manualUrl] = line.split("|");
      return {
        id: `wave3-brother-${slug(model)}`,
        brand: "Brother", maker: "Brother", model, family: "Inkjet printer / MFP",
        nameJa: `ブラザー ${model}`, nameEn: `Brother ${model}`,
        category: "プリンター・複合機", country: "Japan", manualUrl, supportUrl,
        noteJa: "ブラザー公式の機種別製品マニュアルページです。",
        noteEn: "Official Brother model-specific product manual page.",
        hintJa: `ブラザー Brother ${model} インクジェット プリンター 複合機 取扱説明書`,
        hintEn: `Brother ${model} inkjet printer MFP manual`,
        aliases: ["ブラザー", "Brother", "インクジェット", "プリンター", "複合機", "取扱説明書"],
        sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: manualUrl,
        resolutionState: "direct_manual_page", manualKind: "manual-index", sharedTarget: false,
        linkReview: `official Wave 3B target verified ${V}`
      };
    });
  };

  const epson = () => lines(window.MANUALFINDER_WAVE3_EPSON).map((line) => {
    const [model, manualUrl, supportUrl] = line.split("|");
    return {
      id: `wave3-epson-${slug(model)}`,
      brand: "Epson", maker: "Epson", model, family: "Colorio inkjet printer / MFP",
      nameJa: `エプソン ${model}`, nameEn: `Epson ${model}`,
      category: "プリンター・複合機", country: "Japan", manualUrl, supportUrl,
      noteJa: "エプソン公式の機種別マニュアルページです。",
      noteEn: "Official Epson model-specific manual page.",
      hintJa: `エプソン Epson ${model} カラリオ プリンター 複合機 取扱説明書`,
      hintEn: `Epson ${model} Colorio printer MFP manual`,
      aliases: ["エプソン", "Epson", "カラリオ", "プリンター", "複合機", "取扱説明書"],
      sourceType: "official", sourceLevel: "A", verifiedAt: EPSON_V, evidenceUrl: manualUrl,
      resolutionState: "direct_manual_page", manualKind: "manual-index", sharedTarget: false,
      linkReview: `official Wave 3D target verified ${EPSON_V}`
    };
  });

  const canon = () => lines(window.MANUALFINDER_WAVE3_CANON).map((line) => {
    const [model, manualUrl, targetMode] = line.split("|");
    const shared = targetMode === "shared";
    return {
      id: `wave3-canon-${slug(model)}`,
      brand: "Canon", maker: "Canon", model, family: "PIXUS inkjet printer / MFP",
      nameJa: `キヤノン ${model}`, nameEn: `Canon ${model}`,
      category: "プリンター・複合機", country: "Japan", manualUrl, supportUrl: manualUrl,
      noteJa: shared ? "キヤノンがこの機種を含むシリーズ向けに提供している公式オンラインマニュアルです。" : "キヤノン公式の機種別オンラインマニュアルです。",
      noteEn: shared ? "Official Canon online manual for the vendor-defined series containing this model." : "Official Canon model-specific online manual.",
      hintJa: `キヤノン Canon PIXUS ${model} プリンター 複合機 取扱説明書`,
      hintEn: `Canon PIXUS ${model} printer MFP manual`,
      aliases: ["キヤノン", "Canon", "PIXUS", "プリンター", "複合機", "取扱説明書"],
      sourceType: "official", sourceLevel: "A", verifiedAt: CANON_V, evidenceUrl: manualUrl,
      resolutionState: shared ? "shared_official_manual_page" : "direct_online_manual",
      manualKind: "online-manual", sharedTarget: shared,
      linkReview: `official Wave 3E target verified ${CANON_V}`
    };
  });

  window.MANUALFINDER_BUILD_WAVE3 = () => [...nikon(), ...brother(), ...epson(), ...canon()];
})();
