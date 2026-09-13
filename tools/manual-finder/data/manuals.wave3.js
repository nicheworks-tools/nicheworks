(() => {
  const V = "2026-09-13";
  window.MANUALFINDER_WAVE3_BATCHES = ["manuals.wave3.01.js", "manuals.wave3.02.js", "manuals.wave3.03.js"];
  window.MANUALFINDER_WAVE3_NIKON = window.MANUALFINDER_WAVE3_NIKON || [];
  window.MANUALFINDER_WAVE3_BROTHER = window.MANUALFINDER_WAVE3_BROTHER || [];
  window.MANUALFINDER_WAVE3_SONY = window.MANUALFINDER_WAVE3_SONY || [];

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

  const sony = () => {
    const supportUrl = "https://support.sony.jp/electronics/support/interchangeable-lens-cameras-e-mount-body/manuals";
    return lines(window.MANUALFINDER_WAVE3_SONY).map((line) => {
      const [model, manualUrl] = line.split("|");
      return {
        id: `wave3-sony-${slug(model)}`,
        brand: "Sony", maker: "Sony", model, family: "Alpha flagship E-mount camera",
        nameJa: `ソニー ${model}`, nameEn: `Sony ${model}`,
        category: "カメラ・映像", country: "Japan", manualUrl, supportUrl,
        noteJa: "ソニー公式の機種別取扱説明書ページです。",
        noteEn: "Official Sony model-specific manual page.",
        hintJa: `ソニー Sony ${model} α Alpha Eマウント カメラ 取扱説明書`,
        hintEn: `Sony ${model} Alpha E-mount camera manual`,
        aliases: ["ソニー", "Sony", "α", "Alpha", "Eマウント", "カメラ", "取扱説明書"],
        sourceType: "official", sourceLevel: "A", verifiedAt: V, evidenceUrl: manualUrl,
        resolutionState: "direct_manual_page", manualKind: "manual-index", sharedTarget: false,
        linkReview: `official Wave 3C target verified ${V}`
      };
    });
  };

  window.MANUALFINDER_BUILD_WAVE3 = () => [...nikon(), ...brother(), ...sony()];
})();
