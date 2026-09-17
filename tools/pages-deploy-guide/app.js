(() => {
  "use strict";

  const OFUSE_URL = "https://ofuse.me/nicheworks";
  const KOFI_URL = "https://ko-fi.com/nicheworks";
  let generated = false;
  let combinedText = "";
  let markdownText = "";

  const $ = (id) => document.getElementById(id);
  const isEn = () => document.documentElement.lang === "en";
  const msg = (ja, en) => isEn() ? en : ja;
  const labels = { cloudflare: "Cloudflare Pages", github: "GitHub Pages", repository: "Repository / Folder", static: "Build output / Static files", root: "/ (root)", dist: "dist", public: "public", docs: "docs" };

  function applyLang(lang) {
    document.querySelectorAll("[data-i18n]").forEach((el) => { el.style.display = el.dataset.i18n === lang ? "" : "none"; });
    document.querySelectorAll(".nw-lang-switch button").forEach((button) => button.classList.toggle("active", button.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  }

  function initLang() {
    let lang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
    try { const saved = localStorage.getItem("nw_lang"); if (saved === "ja" || saved === "en") lang = saved; } catch (_) {}
    document.querySelectorAll(".nw-lang-switch button").forEach((button) => button.addEventListener("click", () => { applyLang(button.dataset.lang); if (generated) render(); }));
    applyLang(lang);
  }

  function toast(message) {
    const el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => el.classList.remove("show"), 2200);
  }

  async function copy(value) {
    try { await navigator.clipboard.writeText(value); return true; }
    catch (_) {
      const area = document.createElement("textarea");
      area.value = value;
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
      area.remove();
      return ok;
    }
  }

  function saveFile(filename, value) {
    const blob = new Blob([value], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }

  function selections() {
    return {
      platform: $("platform").value,
      sourceType: $("sourceType").value,
      customDomain: $("customDomain").value === "yes",
      outputFolder: $("outputFolder").value
    };
  }

  function numbered(items) { return items.map((item, index) => `${index + 1}. ${item}`).join("\n"); }
  function bullets(items) { return items.map((item) => `- ${item}`).join("\n"); }

  function platformItems(s) {
    if (isEn()) {
      if (s.platform === "cloudflare") {
        const items = [
          "Check the configured build command and build output directory",
          s.sourceType === "static" ? "If no build is required, Cloudflare Pages documents `exit 0` as the no-build command; confirm the output directory contains the deployable files" : "Confirm the framework build command exits successfully and writes to the configured output directory",
          "Check Preview and Production deployments separately",
          "If using Pages Functions, check the Workers compatibility date/flags and environment-variable configuration"
        ];
        if (s.sourceType === "static") items.push("If using Functions with uploaded static output, note that dashboard Direct Upload does not support a /functions directory; use a supported deployment flow such as Wrangler");
        items.push(s.customDomain
          ? "Check the Pages Custom domains mapping, DNS, and SSL; an apex domain requires the zone/nameservers on Cloudflare, while a subdomain normally uses the configured DNS target"
          : "Check the default *.pages.dev deployment before debugging a custom domain");
        return items;
      }

      const items = [
        "Choose the GitHub Pages publishing source: Deploy from a branch or GitHub Actions",
        "For branch publishing, the source folder can only be /(root) or /docs",
        (s.outputFolder === "dist" || s.outputFolder === "public")
          ? `The selected ${labels[s.outputFolder]} folder is not a branch-publishing source; use GitHub Actions to build/upload the Pages artifact, or copy the publishable files to /(root) or /docs`
          : `If publishing from a branch, confirm ${labels[s.outputFolder]} is the selected Pages source and the entry file is at the top level`,
        "Check the Pages deployment workflow/run for build or deployment failures",
        "Check project-site base paths and asset paths when the site is served under /repository-name/"
      ];
      items.push(s.customDomain
        ? "Configure the custom domain in GitHub Pages settings and verify DNS/HTTPS. A CNAME file applies to branch publishing; custom GitHub Actions publishing does not require it and ignores it"
        : "Check the default github.io URL first");
      return items;
    }

    if (s.platform === "cloudflare") {
      const items = [
        "設定済みのBuild commandとbuild output directoryを確認する",
        s.sourceType === "static" ? "ビルド不要ならCloudflare Pages公式では`exit 0`をno-build commandとして案内しているため、公開ファイルがoutput directoryにあるか確認する" : "frameworkのbuild commandが正常終了し、設定したoutput directoryへ成果物を出しているか確認する",
        "PreviewとProductionの両方を確認する",
        "Pages Functionsを使う場合はWorkersのcompatibility date / flagsと環境変数設定を確認する"
      ];
      if (s.sourceType === "static") items.push("Functions付き静的出力を使う場合、dashboardのDirect Uploadでは/functions directoryを扱えないため、Wranglerなど対応するdeploy方式を確認する");
      items.push(s.customDomain
        ? "PagesのCustom domains紐付け、DNS、SSLを確認する。apex domainはCloudflare zone / nameserver設定、subdomainは設定したDNS向き先を確認する"
        : "custom domainより先に既定の*.pages.dev deploymentで表示を確認する");
      return items;
    }

    const items = [
      "GitHub Pagesの公開方式がDeploy from a branchかGitHub Actionsか確認する",
      "branch公開で選べるsource folderは/(root)または/docsのみ",
      (s.outputFolder === "dist" || s.outputFolder === "public")
        ? `選択した${labels[s.outputFolder]}はbranch公開のsource folderにはできない。GitHub Actionsでbuild成果物をPages artifactとしてdeployするか、公開ファイルを/(root)または/docsへ置く`
        : `branch公開ならPages設定で${labels[s.outputFolder]}をsourceに選び、entry fileがsource直下にあるか確認する`,
      "Pagesのdeployment workflow / Actions runでbuild・deploy失敗を確認する",
      "project siteが/repository-name/配下になる場合はbase pathとasset pathを確認する"
    ];
    items.push(s.customDomain
      ? "GitHub Pages設定でcustom domainを登録し、DNS/HTTPSを確認する。CNAME fileはbranch公開ではsource直下に置かれるが、custom GitHub Actions公開では不要で無視される"
      : "まず既定のgithub.io URLで表示を確認する");
    return items;
  }

  function build() {
    const s = selections();
    const platform = labels[s.platform];
    const checklist = (isEn() ? [
      `Target platform: ${platform}`,
      `Source type: ${labels[s.sourceType]}`,
      `Selected directory: ${labels[s.outputFolder]}`,
      "Confirm the actual publishing/deployment mode before treating a directory as the publish source",
      "Open the deployed URL and check top page, nested pages, CSS/JS/images, and console errors",
      "Check 404 behavior, canonical, OGP, robots.txt, sitemap.xml, GA4, and AdSense IDs",
      "Check mobile layout and hard refresh"
    ] : [
      `対象プラットフォーム: ${platform}`,
      `ソース種別: ${labels[s.sourceType]}`,
      `選択ディレクトリ: ${labels[s.outputFolder]}`,
      "directoryを公開元として扱う前に、実際のpublish / deploy方式を確認する",
      "公開URLでトップ、下層、CSS/JS/画像、console errorを確認する",
      "404、canonical、OGP、robots.txt、sitemap.xml、GA4、AdSense IDを確認する",
      "スマホ表示とハードリロード確認を行う"
    ]).concat(platformItems(s));

    const errors = isEn() ? [
      "Build failed: check the configured build/deploy mode, command, runtime, dependencies, and environment variables",
      "404 after deploy: check the platform's valid publishing source/output rule and entry-file placement",
      "Blank page: check console, base path, asset path, and script errors",
      "Assets fail: check paths, project-site base path, case sensitivity, and cache",
      "Domain pending: check the domain mapping in platform settings, DNS records, and HTTPS/SSL state"
    ] : [
      "ビルド失敗: platformのpublish/deploy方式、command、runtime、依存関係、環境変数を確認",
      "デプロイ後404: platformで有効な公開元/output ruleとentry file配置を確認",
      "白画面: console、base path、asset path、script errorを確認",
      "asset失敗: path、project siteのbase path、大文字小文字、cacheを確認",
      "domain pending: platform側のdomain紐付け、DNS record、HTTPS/SSL状態を確認"
    ];

    const diagnosis = isEn() ? [
      "Symptom: build fails",
      "- Confirm whether the platform is building from a repository/branch or deploying an artifact/output directory, then check command, runtime, dependencies, environment variables, and logs",
      "",
      "Symptom: top page is 404",
      "- Cloudflare Pages: confirm the configured output directory contains a top-level index.html for a static site",
      "- GitHub Pages branch publishing: source must be /(root) or /docs and the entry file must be at the top level",
      "- GitHub Actions publishing: confirm the uploaded Pages artifact contains the entry file at the artifact root",
      "",
      "Symptom: blank page or broken assets",
      "- Check console errors, absolute/relative asset paths, repository-name base paths, case sensitivity, and cache",
      "",
      "Symptom: domain or SSL is pending",
      "- Check the domain mapping in platform settings first, then DNS record type/target and certificate/HTTPS state"
    ] : [
      "症状: ビルドが失敗する",
      "- repository/branchをbuildしているのか、artifact/outputをdeployしているのかを先に確認し、command、runtime、依存関係、環境変数、logを確認",
      "",
      "症状: トップが404",
      "- Cloudflare Pages: static siteなら設定したoutput directory直下にindex.htmlがあるか確認",
      "- GitHub Pages branch公開: sourceは/(root)または/docsで、entry fileがsource直下にあるか確認",
      "- GitHub Actions公開: uploadしたPages artifact直下にentry fileがあるか確認",
      "",
      "症状: 白画面 / assetだけ失敗する",
      "- console error、絶対/相対path、repository-name配下のbase path、大文字小文字、cacheを確認",
      "",
      "症状: domain/SSLがpending",
      "- platform設定のdomain紐付けを先に確認し、その後DNS種別・向き先・certificate / HTTPS状態を確認"
    ];

    const handoff = isEn() ? [
      `Platform: ${platform}`,
      `Source: ${labels[s.sourceType]}`,
      `Selected directory: ${labels[s.outputFolder]}`,
      `Custom domain: ${s.customDomain ? "Yes" : "No"}`,
      "",
      "Handoff pack:",
      "- Record the publishing mode (branch / GitHub Actions / Cloudflare Git integration / Direct Upload or Wrangler)",
      "- Save deploy URL, commit SHA, and production domain together",
      "- Record build command, source/root directory, output directory, and runtime version where applicable",
      "- Record environment variable names only; do not paste secrets",
      "- Keep DNS record type, target, SSL/HTTPS status, and verification date",
      "- Check top, nested pages, mobile, OGP, robots.txt, sitemap.xml, GA4, and AdSense after launch"
    ] : [
      `プラットフォーム: ${platform}`,
      `ソース: ${labels[s.sourceType]}`,
      `選択ディレクトリ: ${labels[s.outputFolder]}`,
      `カスタムドメイン: ${s.customDomain ? "あり" : "なし"}`,
      "",
      "引き継ぎパック:",
      "- publish方式（branch / GitHub Actions / Cloudflare Git integration / Direct UploadまたはWrangler）を記録する",
      "- deploy URL、commit SHA、本番ドメインをセットで記録する",
      "- 該当するbuild command、source/root directory、output directory、runtime versionを記録する",
      "- 環境変数は名前だけ記録し、secret値は貼らない",
      "- DNS種別、向き先、SSL/HTTPS状態、確認日を残す",
      "- 公開後にトップ、下層、スマホ、OGP、robots.txt、sitemap.xml、GA4、AdSenseを確認する"
    ];

    const checklistText = numbered(checklist);
    const errorsText = bullets(errors);
    const diagnosisText = diagnosis.join("\n");
    const handoffText = handoff.join("\n");
    const hChecklist = isEn() ? "Checklist" : "チェックリスト";
    const hErrors = isEn() ? "Common errors" : "よくあるエラー";
    const hDiagnosis = isEn() ? "Diagnosis tree" : "症状別診断ツリー";
    const hHandoff = isEn() ? "Deployment handoff pack" : "デプロイ引き継ぎパック";

    const combined = [
      `# ${platform} Deploy Guide`, "",
      `## ${hChecklist}`, checklistText, "",
      `## ${hErrors}`, errorsText, "",
      `## ${hDiagnosis}`, diagnosisText, "",
      `## ${hHandoff}`, handoffText
    ].join("\n");

    const markdown = [
      `# ${platform} Deploy Guide`, "",
      `## ${hChecklist}`, bullets(checklist), "",
      `## ${hErrors}`, errorsText, "",
      `## ${hDiagnosis}`, diagnosisText, "",
      `## ${hHandoff}`, handoffText
    ].join("\n");

    return { checklist: checklistText, errors: errorsText, diagnosis: diagnosisText, handoff: handoffText, combined, markdown };
  }

  function render() {
    const data = build();
    $("output").value = data.checklist;
    $("errors").value = data.errors;
    $("diagnosis").value = data.diagnosis;
    $("proPack").value = data.handoff;
    combinedText = data.combined;
    markdownText = data.markdown;
    generated = true;
  }

  function fileName() {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    const platform = $("platform").value === "github" ? "github-pages" : "cloudflare-pages";
    return `pages-deploy-guide-${platform}-${y}${m}${d}.md`;
  }

  function init() {
    initLang();
    const initial = msg("条件を選んで『生成する』を押してください。", "Select conditions and click Generate.");
    ["output", "errors", "diagnosis", "proPack"].forEach((id) => { $(id).value = initial; });
    $("generate").addEventListener("click", render);
    $("copyAll").addEventListener("click", async () => {
      if (!generated) return toast(msg("先に生成してください。", "Generate a checklist first."));
      toast(await copy(combinedText) ? msg("全結果をコピーしました。", "Copied all results.") : msg("コピーに失敗しました。", "Copy failed."));
    });
    $("downloadMd").addEventListener("click", () => {
      if (!generated) return toast(msg("先に生成してください。", "Generate a checklist first."));
      saveFile(fileName(), markdownText);
      toast(msg("Markdownを保存しました。", "Markdown saved."));
    });
    ["platform", "sourceType", "customDomain", "outputFolder"].forEach((id) => $(id).addEventListener("change", () => { if (generated) render(); }));
    void OFUSE_URL;
    void KOFI_URL;
  }

  document.addEventListener("DOMContentLoaded", init);
})();
