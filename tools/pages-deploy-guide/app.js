(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons().forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((button) => {
      button.addEventListener("click", () => applyLang(button.dataset.lang));
    });
    applyLang(lang);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      try {
        return document.execCommand("copy");
      } catch (error) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const toast = (message) => {
    const el = document.getElementById("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
  };

  window.NW = { applyLang, copyToClipboard, downloadText, toast };
  document.addEventListener("DOMContentLoaded", initLang);
})();

(() => {
  "use strict";

  const PRO_KEY = "pdg_pro_key";
  let hasGenerated = false;
  let hasPro = false;
  let latestFreeText = "";
  let latestProText = "";
  let latestMarkdown = "";

  const $ = (id) => document.getElementById(id);
  const currentLang = () => document.documentElement.lang === "en" ? "en" : "ja";

  const labels = {
    cloudflare: "Cloudflare Pages",
    github: "GitHub Pages",
    repository: { ja: "Repository / Folder", en: "Repository / Folder" },
    static: { ja: "Build output / Static files", en: "Build output / Static files" },
    root: "/ (root)",
    dist: "dist",
    public: "public",
    docs: "docs"
  };

  const t = (ja, en) => currentLang() === "en" ? en : ja;
  const lineList = (items) => items.map((item, index) => `${index + 1}. ${item}`).join("\n");
  const bullets = (items) => items.map((item) => `- ${item}`).join("\n");

  const checksum97 = (value) => {
    let sum = 0;
    for (let i = 0; i < value.length; i += 1) {
      sum = (sum + value.charCodeAt(i)) % 97;
    }
    return sum;
  };

  const normalizeKey = (value) => String(value || "").toUpperCase().replace(/\s+/g, "").trim();

  const validProKey = (value) => {
    const key = normalizeKey(value);
    const match = /^NW-PDG-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{2})$/.exec(key);
    if (!match) return null;
    const expected = checksum97(`${match[1]}${match[2]}PDG`).toString(36).toUpperCase().padStart(2, "0").slice(-2);
    return match[3] === expected ? key : null;
  };

  const loadPro = () => {
    try {
      hasPro = !!validProKey(localStorage.getItem(PRO_KEY));
    } catch (_) {
      hasPro = false;
    }
  };

  const setPro = (enabled, key = "") => {
    if (enabled) {
      const valid = validProKey(key);
      if (!valid) {
        window.NW.toast(t("Proキーが無効です。", "Invalid Pro key."));
        return;
      }
      try { localStorage.setItem(PRO_KEY, valid); } catch (_) {}
      hasPro = true;
      window.NW.toast(t("Proを有効化しました。", "Pro activated."));
    } else {
      try { localStorage.removeItem(PRO_KEY); } catch (_) {}
      hasPro = false;
      window.NW.toast(t("Proを解除しました。", "Pro cleared."));
    }
    renderProState();
    if (hasGenerated) render();
  };

  const getSelections = () => ({
    platform: $("platform").value,
    sourceType: $("sourceType").value,
    customDomain: $("customDomain").value === "yes",
    outputFolder: $("outputFolder").value,
    lang: currentLang()
  });

  const platformSpecificJa = ({ platform, sourceType, outputFolder, customDomain }) => {
    if (platform === "cloudflare") {
      const items = [
        "Build commandが必要か確認する。静的HTMLのみなら空欄、Vite/Next等ならnpm run buildなどを指定する",
        `Output directoryが ${labels[outputFolder]} で正しいか確認する。dist/public/rootの取り違えを先に潰す`,
        "Functionsを使う場合は /functions 配置、ルーティング、環境変数、compatibility date を確認する",
        "Production deploymentだけでなくPreview deploymentでも表示・リンク・フォームを確認する",
        "Environment variablesはProduction / Previewで必要な値が分かれていないか確認する"
      ];
      if (sourceType === "static") {
        items.push("ビルド済み静的ファイル一式を使う場合は、index.htmlが出力ディレクトリ直下にあるか確認する");
      }
      if (customDomain) {
        items.push("Custom domain追加後、DNSレコード、SSL status、Cloudflare側のドメイン紐付けを確認する");
      }
      return items;
    }

    const items = [
      "Pages sourceのbranch/folderを確認する。main/docs、gh-pages、GitHub Actionsのどれで公開するか混同しない",
      `公開対象フォルダが ${labels[outputFolder]} で正しいか確認する。GitHub Pagesではdocs運用かActions成果物かを切り分ける`,
      "リポジトリ名配下で公開する場合は base path とアセットパスを確認する",
      "SPAの場合、GitHub Pagesの直接URL 404制限を前提に、404.html fallback等の必要性を確認する",
      "Actions / Pages build log でビルド失敗、権限、成果物アップロード失敗を確認する"
    ];
    if (sourceType === "static") {
      items.push("ビルド済み静的ファイル一式を使う場合は、Pagesが実際に読むbranch/folderへ成果物が置かれているか確認する");
    }
    if (customDomain) {
      items.push("Custom domainのCNAMEファイル、DNS CNAME/A/AAAA、HTTPS enforcementを確認する");
    }
    return items;
  };

  const platformSpecificEn = ({ platform, sourceType, outputFolder, customDomain }) => {
    if (platform === "cloudflare") {
      const items = [
        "Check whether a build command is required. Leave it empty for plain static HTML, or set commands such as npm run build for Vite/Next-style builds",
        `Confirm that the output directory is ${labels[outputFolder]}. Eliminate dist/public/root mismatches first`,
        "If Functions are used, verify /functions placement, routing, environment variables, and compatibility date",
        "Check rendered pages, links, and forms on both Preview and Production deployments",
        "Confirm that required environment variables are set correctly for both Production and Preview"
      ];
      if (sourceType === "static") {
        items.push("For pre-built static files, confirm that index.html exists directly inside the selected output directory");
      }
      if (customDomain) {
        items.push("After adding a custom domain, check DNS records, SSL status, and the Cloudflare-side domain mapping");
      }
      return items;
    }

    const items = [
      "Check the Pages source branch/folder. Do not mix up main/docs, gh-pages, and GitHub Actions deployments",
      `Confirm that the publish target is ${labels[outputFolder]}. Separate docs-based publishing from Actions artifact publishing`,
      "If publishing under a repository path, verify the base path and asset paths",
      "For SPAs, account for GitHub Pages direct-route 404 limitations and confirm whether a 404.html fallback is needed",
      "Check Actions / Pages build logs for build failures, permissions, and artifact upload issues"
    ];
    if (sourceType === "static") {
      items.push("For pre-built static files, confirm that the built files are placed in the branch/folder GitHub Pages actually reads");
    }
    if (customDomain) {
      items.push("Check the CNAME file, DNS CNAME/A/AAAA records, and HTTPS enforcement");
    }
    return items;
  };

  const diagnosisJa = (platform) => [
    "症状: ビルドが失敗する",
    "- build command、package manager、Node/runtime version、lockfile、environment variablesを確認",
    "- ローカルのビルド結果とホスティング側ログを比較",
    "",
    "症状: デプロイは成功したがトップが404",
    "- output directoryとindex.htmlの配置を確認",
    "- source branch/folderまたはdeployment artifactを確認",
    "",
    "症状: 白画面になる",
    "- ブラウザコンソールを開く",
    "- base path、asset path、runtime errorを確認",
    "",
    "症状: CSS/JSが読み込めない",
    "- 絶対パスと相対パスを確認",
    "- ビルド済みassetが公開フォルダ内に存在するか確認",
    "- ハードリロードとキャッシュ削除を試す",
    "",
    "症状: SPAの下層ルートだけ404",
    "- 平台のfallback対応を確認",
    platform === "cloudflare" ? "- Cloudflare Pagesでは _redirects / routing / Functions の競合を確認" : "- GitHub Pagesでは404.html fallbackの限界を前提に確認",
    "",
    "症状: カスタムドメイン/SSLがpending",
    "- DNSレコード種別と向き先を確認",
    "- CNAMEファイルまたは平台側ドメイン紐付けを確認",
    "- 設定ミスを潰してからTTL反映待ちと判断する"
  ].join("\n");

  const diagnosisEn = (platform) => [
    "Symptom: build fails",
    "- Check build command, package manager, Node/runtime version, lockfile, and environment variables",
    "- Compare local build output with hosting logs",
    "",
    "Symptom: deployment succeeds but the top page is 404",
    "- Check output directory and index.html placement",
    "- Confirm source branch/folder or deployment artifact",
    "",
    "Symptom: blank page",
    "- Open the browser console",
    "- Check base path, asset path, and runtime errors",
    "",
    "Symptom: CSS/JS does not load",
    "- Check absolute vs relative paths",
    "- Confirm built asset files exist in the published directory",
    "- Hard refresh and clear cache",
    "",
    "Symptom: nested SPA route is 404",
    "- Confirm platform fallback support",
    platform === "cloudflare" ? "- On Cloudflare Pages, check _redirects, routing, and Functions conflicts" : "- On GitHub Pages, account for 404.html fallback limitations",
    "",
    "Symptom: custom domain or SSL is pending",
    "- Check DNS record type and target",
    "- Check CNAME file or platform-side domain mapping",
    "- Wait for TTL only after configuration mistakes are ruled out"
  ].join("\n");

  const buildGuide = () => {
    const selections = getSelections();
    const platformName = labels[selections.platform];
    const outputName = labels[selections.outputFolder];
    const sourceName = labels[selections.sourceType][selections.lang];

    if (selections.lang === "en") {
      const checklist = [
        `Target platform: ${platformName}`,
        `Source type: ${sourceName}`,
        `Output directory: ${outputName}`,
        "Confirm the build command, output directory, Node/runtime version, and dependency lockfile before deploying",
        "Confirm that required environment variables are set in the hosting platform and are not exposed to the client by mistake",
        "Open the deployed URL and check the top page, nested pages, CSS/JS/image loading, and browser console errors",
        "Check 404 fallback behavior, especially for SPA routes and direct access to nested URLs",
        "Verify canonical URL, OGP/Twitter image, robots.txt, sitemap.xml, GA4, and AdSense IDs",
        "Check mobile layout around 360px and 390px width, then test desktop layout",
        "Hard refresh or use an incognito window to avoid judging an old cached deployment"
      ].concat(platformSpecificEn(selections));

      const errors = [
        "Build failed: check build command, package manager, Node version, missing dependencies, and environment variables",
        "Deploy succeeded but top page is 404: check output directory, index.html placement, branch/folder source, and publish target",
        "Blank page: check browser console, base path, JavaScript errors, and framework build settings",
        "CSS/JS/images do not load: check absolute paths, repository base path, output file placement, and cache",
        "SPA nested URL is 404: check fallback routing limits, _redirects/404.html behavior, and platform support",
        "Custom domain stays pending: check DNS records, CNAME/A/AAAA values, SSL status, TTL, and platform domain settings",
        "Old content keeps appearing: purge hosting cache, hard refresh, and confirm that the latest commit/deployment is active"
      ];

      const proPack = [
        `Platform: ${platformName}`,
        `Source: ${sourceName}`,
        `Output directory: ${outputName}`,
        "",
        "Handoff pack:",
        "- Capture the final build command and output directory in the release note",
        "- Save the latest deploy URL, commit SHA, and production domain together",
        "- Record required environment variables by name only; do not paste secret values",
        "- Keep DNS record type, target, SSL status, and verification date in the launch memo",
        "- After deployment, check top page, nested pages, mobile width, OGP preview, robots.txt, sitemap.xml, GA4, and AdSense",
        "- If a rollback is needed, identify the previous good deployment or commit before changing DNS"
      ].join("\n");

      return buildResult({ platformName, checklist, errors, diagnosis: diagnosisEn(selections.platform), proPack, lang: "en" });
    }

    const checklist = [
      `対象プラットフォーム: ${platformName}`,
      `ソース種別: ${sourceName}`,
      `公開フォルダ: ${outputName}`,
      "デプロイ前に build command、output directory、Node/runtime version、依存関係ロックファイルを確認する",
      "必要なenvironment variablesがホスティング側に設定済みか、クライアントへ漏れていないか確認する",
      "公開URLでトップ、下層ページ、CSS/JS/画像、ブラウザコンソールを確認する",
      "SPAルーティングや下層URLの直接アクセスで404 fallbackが必要か確認する",
      "canonical、OGP/Twitter画像、robots.txt、sitemap.xml、GA4、AdSense IDを確認する",
      "360px/390px前後のスマホ表示とPC表示を確認する",
      "古いキャッシュを見て判断しないよう、ハードリロードまたはシークレットウィンドウで確認する"
    ].concat(platformSpecificJa(selections));

    const errors = [
      "ビルド失敗: build command、package manager、Node version、依存関係、environment variablesを確認",
      "デプロイ成功後にトップが404: output directory、index.html配置、branch/folder source、公開対象を確認",
      "白画面: ブラウザコンソール、base path、JavaScriptエラー、フレームワーク設定を確認",
      "CSS/JS/画像が読み込めない: 絶対パス、リポジトリbase path、成果物配置、キャッシュを確認",
      "SPAの下層URLが404: fallback routing、_redirects/404.html、平台側の制限を確認",
      "カスタムドメインがpendingのまま: DNSレコード、CNAME/A/AAAA、SSL状態、TTL、平台側設定を確認",
      "古い内容が出る: ホスティングキャッシュ、ハードリロード、最新commit/deploymentの反映を確認"
    ];

    const proPack = [
      `平台: ${platformName}`,
      `ソース: ${sourceName}`,
      `公開フォルダ: ${outputName}`,
      "",
      "引き継ぎパック:",
      "- 最終build commandとoutput directoryをリリースメモに残す",
      "- 最新deploy URL、commit SHA、本番ドメインをセットで記録する",
      "- environment variablesは名前だけ記録し、secret値は貼り付けない",
      "- DNSレコード種別、向き先、SSL状態、確認日をローンチメモに残す",
      "- 公開後にトップ、下層、スマホ幅、OGP preview、robots.txt、sitemap.xml、GA4、AdSenseを確認する",
      "- rollbackが必要な場合、DNS変更前に直前の正常deploymentまたはcommitを特定する"
    ].join("\n");

    return buildResult({ platformName, checklist, errors, diagnosis: diagnosisJa(selections.platform), proPack, lang: "ja" });
  };

  const buildResult = ({ platformName, checklist, errors, diagnosis, proPack, lang }) => {
    const checklistText = lineList(checklist);
    const errorsText = bullets(errors);
    const headingChecklist = lang === "en" ? "Checklist" : "チェックリスト";
    const headingErrors = lang === "en" ? "Common errors" : "よくあるエラー";
    const headingDiagnosis = lang === "en" ? "Diagnosis tree (Pro)" : "症状別診断ツリー（Pro）";
    const headingPack = lang === "en" ? "Deployment handoff pack (Pro)" : "デプロイ引き継ぎパック（Pro）";

    const markdown = [
      `# ${platformName} Deploy Guide`,
      "",
      `## ${headingChecklist}`,
      checklist.map((item) => `- ${item}`).join("\n"),
      "",
      `## ${headingErrors}`,
      bullets(errors),
      "",
      `## ${headingDiagnosis}`,
      diagnosis,
      "",
      `## ${headingPack}`,
      proPack
    ].join("\n");

    return {
      checklist: checklistText,
      errors: errorsText,
      diagnosis,
      proPack,
      markdown,
      freeText: [
        `# ${platformName} Deploy Guide`,
        "",
        `## ${headingChecklist}`,
        checklistText,
        "",
        `## ${headingErrors}`,
        errorsText
      ].join("\n"),
      proText: [
        `# ${platformName} Deploy Guide Pro`,
        "",
        `## ${headingChecklist}`,
        checklistText,
        "",
        `## ${headingErrors}`,
        errorsText,
        "",
        `## ${headingDiagnosis}`,
        diagnosis,
        "",
        `## ${headingPack}`,
        proPack
      ].join("\n")
    };
  };

  const today = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}${month}${day}`;
  };

  const platformSlug = () => $("platform").value === "github" ? "github-pages" : "cloudflare-pages";

  const setInitialState = () => {
    const message = "条件を選んで『生成する』を押してください。\nSelect conditions and click Generate.";
    $("output").value = message;
    $("errors").value = message;
    $("diagnosis").value = t("Pro解除後、生成すると症状別診断ツリーが表示されます。", "After Pro unlock, generate to show the diagnosis tree.");
    $("proPack").value = t("Pro解除後、生成すると引き継ぎパックが表示されます。", "After Pro unlock, generate to show the handoff pack.");
  };

  const render = () => {
    const data = buildGuide();
    $("output").value = data.checklist;
    $("errors").value = data.errors;
    latestFreeText = data.freeText;
    latestProText = data.proText;
    latestMarkdown = data.markdown;
    hasGenerated = true;

    if (hasPro) {
      $("diagnosis").value = data.diagnosis;
      $("proPack").value = data.proPack;
    } else {
      $("diagnosis").value = t("Pro解除後に表示されます。", "Visible after Pro unlock.");
      $("proPack").value = t("Pro解除後に表示されます。", "Visible after Pro unlock.");
    }
  };

  const renderProState = () => {
    const state = $("proState");
    if (state) {
      state.textContent = hasPro ? "Pro Active" : "Pro Inactive";
      state.className = `pro-status ${hasPro ? "active" : "inactive"}`;
    }
    const locked = $("proLocked");
    const area = $("proArea");
    if (locked) locked.style.display = hasPro ? "none" : "";
    if (area) area.style.display = hasPro ? "" : "none";
  };

  const handleCopyFree = async () => {
    if (!hasGenerated) {
      window.NW.toast(t("先に生成してください。", "Generate a checklist first."));
      return;
    }
    const ok = await window.NW.copyToClipboard(latestFreeText);
    window.NW.toast(ok ? t("コピーしました。", "Copied.") : t("コピーに失敗しました。", "Copy failed."));
  };

  const handleCopyPro = async () => {
    if (!hasPro) {
      window.NW.toast(t("Pro解除後に使えます。", "Available after Pro unlock."));
      return;
    }
    if (!hasGenerated) {
      window.NW.toast(t("先に生成してください。", "Generate a checklist first."));
      return;
    }
    const ok = await window.NW.copyToClipboard(latestProText);
    window.NW.toast(ok ? t("Pro出力をコピーしました。", "Copied Pro output.") : t("コピーに失敗しました。", "Copy failed."));
  };

  const handleDownload = () => {
    if (!hasPro) {
      window.NW.toast(t("Markdown出力はPro解除後に使えます。", "Markdown export is available after Pro unlock."));
      return;
    }
    if (!hasGenerated) {
      window.NW.toast(t("先に生成してください。", "Generate a checklist first."));
      return;
    }
    const filename = `pages-deploy-guide-${platformSlug()}-${today()}.md`;
    window.NW.downloadText(filename, latestMarkdown);
    window.NW.toast(t("Markdownを保存しました。", "Markdown saved."));
  };

  const initTool = () => {
    loadPro();
    setInitialState();
    renderProState();

    $("generate").addEventListener("click", render);
    $("copyAll").addEventListener("click", handleCopyFree);
    $("copyPro").addEventListener("click", handleCopyPro);
    $("downloadMd").addEventListener("click", handleDownload);
    $("activatePro").addEventListener("click", () => setPro(true, $("proKey").value));
    $("clearPro").addEventListener("click", () => setPro(false));

    ["platform", "sourceType", "customDomain", "outputFolder"].forEach((id) => {
      $(id).addEventListener("change", () => {
        if (hasGenerated) render();
      });
    });
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
