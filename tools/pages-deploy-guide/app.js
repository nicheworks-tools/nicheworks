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
      if (s.platform === "cloudflare") return [
        "Check build command and output directory",
        "Check Preview and Production deployments",
        "Check Functions, compatibility date, and environment variables if used",
        s.customDomain ? "Check custom domain, DNS, and SSL" : "Check the default Pages domain first"
      ];
      return [
        "Check Pages source branch/folder",
        "Check repository base path and asset paths",
        "Check Actions / Pages build logs",
        s.customDomain ? "Check CNAME, DNS, and HTTPS enforcement" : "Check the default GitHub Pages URL first"
      ];
    }
    if (s.platform === "cloudflare") return [
      "Build commandとoutput directoryを確認する",
      "PreviewとProductionの両方を確認する",
      "Functions使用時はcompatibility dateと環境変数を確認する",
      s.customDomain ? "カスタムドメイン、DNS、SSLを確認する" : "まず既定のPagesドメインで確認する"
    ];
    return [
      "Pages sourceのbranch/folderを確認する",
      "repository base pathとasset pathを確認する",
      "Actions / Pages build logを確認する",
      s.customDomain ? "CNAME、DNS、HTTPS enforcementを確認する" : "まず既定のGitHub Pages URLで確認する"
    ];
  }

  function build() {
    const s = selections();
    const platform = labels[s.platform];
    const checklist = (isEn() ? [
      `Target platform: ${platform}`,
      `Source type: ${labels[s.sourceType]}`,
      `Output directory: ${labels[s.outputFolder]}`,
      "Check build command, output directory, runtime version, and dependency lockfile",
      "Open deployed URL and check top page, nested pages, CSS/JS/images, and console errors",
      "Check 404 fallback, canonical, OGP, robots.txt, sitemap.xml, GA4, and AdSense IDs",
      "Check mobile layout and hard refresh"
    ] : [
      `対象プラットフォーム: ${platform}`,
      `ソース種別: ${labels[s.sourceType]}`,
      `公開フォルダ: ${labels[s.outputFolder]}`,
      "build command、output directory、runtime version、依存関係を確認する",
      "公開URLでトップ、下層、CSS/JS/画像、console errorを確認する",
      "404 fallback、canonical、OGP、robots.txt、sitemap.xml、GA4、AdSense IDを確認する",
      "スマホ表示とハードリロード確認を行う"
    ]).concat(platformItems(s));

    const errors = isEn() ? [
      "Build failed: check command, runtime, dependencies, and environment variables",
      "404 after deploy: check output directory and index.html placement",
      "Blank page: check console, base path, and script errors",
      "Assets fail: check paths and cache",
      "Domain pending: check DNS and SSL"
    ] : [
      "ビルド失敗: command、runtime、依存関係、環境変数を確認",
      "デプロイ後404: output directoryとindex.html配置を確認",
      "白画面: console、base path、script errorを確認",
      "asset失敗: pathとcacheを確認",
      "domain pending: DNSとSSLを確認"
    ];

    const diagnosis = isEn() ? [
      "Symptom: build fails",
      "- Check command, runtime, dependency lockfile, environment variables, and hosting logs",
      "",
      "Symptom: top page is 404",
      "- Check output directory, source settings, and index.html placement",
      "",
      "Symptom: blank page",
      "- Check console, base path, asset path, and runtime errors",
      "",
      "Symptom: assets fail",
      "- Check absolute/relative paths, base path, case sensitivity, and cache",
      "",
      "Symptom: domain or SSL is pending",
      "- Check DNS record type, target, platform mapping, and SSL status"
    ] : [
      "症状: ビルドが失敗する",
      "- command、runtime、lockfile、環境変数、hosting logを確認",
      "",
      "症状: トップが404",
      "- output directory、source設定、index.html配置を確認",
      "",
      "症状: 白画面",
      "- console、base path、asset path、runtime errorを確認",
      "",
      "症状: CSS/JS/画像だけ失敗する",
      "- 絶対/相対path、base path、大文字小文字、cacheを確認",
      "",
      "症状: domain/SSLがpending",
      "- DNS種別、向き先、平台側紐付け、SSL状態を確認"
    ];

    const handoff = isEn() ? [
      `Platform: ${platform}`,
      `Source: ${labels[s.sourceType]}`,
      `Output directory: ${labels[s.outputFolder]}`,
      `Custom domain: ${s.customDomain ? "Yes" : "No"}`,
      "",
      "Handoff pack:",
      "- Save deploy URL, commit SHA, and production domain together",
      "- Record build command, output directory, and runtime version",
      "- Record environment variable names only; do not paste secrets",
      "- Keep DNS record type, target, SSL status, and verification date",
      "- Check top, nested pages, mobile, OGP, robots.txt, sitemap.xml, GA4, and AdSense after launch"
    ] : [
      `プラットフォーム: ${platform}`,
      `ソース: ${labels[s.sourceType]}`,
      `公開フォルダ: ${labels[s.outputFolder]}`,
      `カスタムドメイン: ${s.customDomain ? "あり" : "なし"}`,
      "",
      "引き継ぎパック:",
      "- deploy URL、commit SHA、本番ドメインをセットで記録する",
      "- build command、output directory、runtime versionを記録する",
      "- 環境変数は名前だけ記録し、secret値は貼らない",
      "- DNS種別、向き先、SSL状態、確認日を残す",
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
