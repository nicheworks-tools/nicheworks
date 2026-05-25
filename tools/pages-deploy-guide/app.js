(() => {
  "use strict";

  const PRO_KEY = "pdg_pro_key";
  const PRO_URL = atob("aHR0cHM6Ly9idXkuc3RyaXBlLmNvbS8xNEE2b0ozVVoxTTFlV2hiSUhjVjIwOQ==");
  const OFUSE_URL = atob("aHR0cHM6Ly9vZnVzZS5tZS9uaWNoZXdvcmtz");
  const KOFI_URL = atob("aHR0cHM6Ly9rby1maS5jb20vbmljaGV3b3Jrcw==");
  let generated = false;
  let pro = false;
  let freeText = "";
  let proText = "";
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

  function checksum(value) {
    let sum = 0;
    for (let i = 0; i < value.length; i += 1) sum = (sum + value.charCodeAt(i)) % 97;
    return sum;
  }

  function validCode(value) {
    const code = String(value || "").toUpperCase().replace(/\s+/g, "").trim();
    const match = /^NW-PDG-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{2})$/.exec(code);
    if (!match) return null;
    const expected = checksum(`${match[1]}${match[2]}PDG`).toString(36).toUpperCase().padStart(2, "0").slice(-2);
    return match[3] === expected ? code : null;
  }

  function loadPro() { try { pro = !!validCode(localStorage.getItem(PRO_KEY)); } catch (_) { pro = false; } }

  function setPro(enabled) {
    if (enabled) {
      const ok = validCode($("proKey").value);
      if (!ok) return toast(msg("Proコードが無効です。", "Invalid Pro code."));
      try { localStorage.setItem(PRO_KEY, ok); } catch (_) {}
      pro = true;
      toast(msg("Proを有効化しました。", "Pro activated."));
    } else {
      try { localStorage.removeItem(PRO_KEY); } catch (_) {}
      pro = false;
      toast(msg("Proを解除しました。", "Pro cleared."));
    }
    updatePro();
    if (generated) render();
  }

  function selections() { return { platform: $("platform").value, sourceType: $("sourceType").value, customDomain: $("customDomain").value === "yes", outputFolder: $("outputFolder").value }; }
  function numbered(items) { return items.map((item, index) => `${index + 1}. ${item}`).join("\n"); }
  function bullets(items) { return items.map((item) => `- ${item}`).join("\n"); }

  function platformItems(s) {
    if (isEn()) {
      if (s.platform === "cloudflare") return ["Check build command and output directory", "Check Preview and Production deployments", "Check Functions, compatibility date, and environment variables if used", s.customDomain ? "Check custom domain, DNS, and SSL" : "Check the default Pages domain first"];
      return ["Check Pages source branch/folder", "Check repository base path and asset paths", "Check Actions / Pages build logs", s.customDomain ? "Check CNAME, DNS, and HTTPS enforcement" : "Check the default GitHub Pages URL first"];
    }
    if (s.platform === "cloudflare") return ["Build commandとoutput directoryを確認する", "PreviewとProductionの両方を確認する", "Functions使用時はcompatibility dateと環境変数を確認する", s.customDomain ? "カスタムドメイン、DNS、SSLを確認する" : "まず既定のPagesドメインで確認する"];
    return ["Pages sourceのbranch/folderを確認する", "repository base pathとasset pathを確認する", "Actions / Pages build logを確認する", s.customDomain ? "CNAME、DNS、HTTPS enforcementを確認する" : "まず既定のGitHub Pages URLで確認する"];
  }

  function build() {
    const s = selections();
    const platform = labels[s.platform];
    const checklist = (isEn() ? [`Target platform: ${platform}`, `Source type: ${labels[s.sourceType]}`, `Output directory: ${labels[s.outputFolder]}`, "Check build command, output directory, runtime version, and dependency lockfile", "Open deployed URL and check top page, nested pages, CSS/JS/images, and console errors", "Check 404 fallback, canonical, OGP, robots.txt, sitemap.xml, GA4, and AdSense IDs", "Check mobile layout and hard refresh"] : [`対象プラットフォーム: ${platform}`, `ソース種別: ${labels[s.sourceType]}`, `公開フォルダ: ${labels[s.outputFolder]}`, "build command、output directory、runtime version、依存関係を確認する", "公開URLでトップ、下層、CSS/JS/画像、console errorを確認する", "404 fallback、canonical、OGP、robots.txt、sitemap.xml、GA4、AdSense IDを確認する", "スマホ表示とハードリロード確認を行う"]).concat(platformItems(s));
    const errors = isEn() ? ["Build failed: check command, runtime, dependencies, and environment variables", "404 after deploy: check output directory and index.html placement", "Blank page: check console, base path, and script errors", "Assets fail: check paths and cache", "Domain pending: check DNS and SSL"] : ["ビルド失敗: command、runtime、依存関係、環境変数を確認", "デプロイ後404: output directoryとindex.html配置を確認", "白画面: console、base path、script errorを確認", "asset失敗: pathとcacheを確認", "domain pending: DNSとSSLを確認"];
    const diag = isEn() ? ["Symptom: build fails", "- Check command, runtime, dependency lockfile, and hosting logs", "", "Symptom: top page is 404", "- Check output directory and index.html placement", "", "Symptom: blank page", "- Check console, base path, asset path, and runtime errors", "", "Symptom: domain or SSL is pending", "- Check DNS record type, target, SSL status, and platform mapping"].join("\n") : ["症状: ビルドが失敗する", "- command、runtime、lockfile、hosting logを確認", "", "症状: トップが404", "- output directoryとindex.html配置を確認", "", "症状: 白画面", "- console、base path、asset path、runtime errorを確認", "", "症状: domain/SSLがpending", "- DNS種別、向き先、SSL状態、平台側紐付けを確認"].join("\n");
    const pack = isEn() ? [`Platform: ${platform}`, `Source: ${labels[s.sourceType]}`, `Output directory: ${labels[s.outputFolder]}`, "", "Handoff pack:", "- Save deploy URL, commit SHA, and production domain together", "- Record environment variable names only", "- Keep DNS record type, target, SSL status, and verification date", "- Check top, nested pages, mobile, OGP, robots.txt, sitemap.xml, GA4, and AdSense after launch"].join("\n") : [`平台: ${platform}`, `ソース: ${labels[s.sourceType]}`, `公開フォルダ: ${labels[s.outputFolder]}`, "", "引き継ぎパック:", "- deploy URL、commit SHA、本番ドメインをセットで記録する", "- 環境変数は名前だけ記録する", "- DNS種別、向き先、SSL状態、確認日を残す", "- 公開後にトップ、下層、スマホ、OGP、robots.txt、sitemap.xml、GA4、AdSenseを確認する"].join("\n");
    const checklistText = numbered(checklist);
    const errorsText = bullets(errors);
    const hChecklist = isEn() ? "Checklist" : "チェックリスト";
    const hErrors = isEn() ? "Common errors" : "よくあるエラー";
    const hDiag = isEn() ? "Diagnosis tree (Pro)" : "症状別診断ツリー（Pro）";
    const hPack = isEn() ? "Deployment handoff pack (Pro)" : "デプロイ引き継ぎパック（Pro）";
    return { checklist: checklistText, errors: errorsText, diag, pack, free: [`# ${platform} Deploy Guide`, "", `## ${hChecklist}`, checklistText, "", `## ${hErrors}`, errorsText].join("\n"), pro: [`# ${platform} Deploy Guide Pro`, "", `## ${hChecklist}`, checklistText, "", `## ${hErrors}`, errorsText, "", `## ${hDiag}`, diag, "", `## ${hPack}`, pack].join("\n"), markdown: [`# ${platform} Deploy Guide`, "", `## ${hChecklist}`, bullets(checklist), "", `## ${hErrors}`, errorsText, "", `## ${hDiag}`, diag, "", `## ${hPack}`, pack].join("\n") };
  }

  function updatePro() { if ($("proState")) { $("proState").textContent = pro ? "Pro Active" : "Pro Inactive"; $("proState").className = `pro-status ${pro ? "active" : "inactive"}`; } if ($("proLocked")) $("proLocked").style.display = pro ? "none" : ""; if ($("proArea")) $("proArea").style.display = pro ? "" : "none"; }
  function render() { const data = build(); $("output").value = data.checklist; $("errors").value = data.errors; freeText = data.free; proText = data.pro; markdownText = data.markdown; generated = true; if (pro) { $("diagnosis").value = data.diag; $("proPack").value = data.pack; } else { $("diagnosis").value = msg("Pro解除後に表示されます。", "Visible after Pro unlock."); $("proPack").value = msg("Pro解除後に表示されます。", "Visible after Pro unlock."); } }

  function addLink(parent, label, href, primary) { const a = document.createElement("a"); a.className = primary ? "btn primary" : "btn"; a.href = href; a.target = href.startsWith("http") ? "_blank" : ""; a.rel = href.startsWith("http") ? "noopener" : ""; a.textContent = label; parent.appendChild(a); }
  function patchLinks() { const actions = document.querySelector("#proLocked .pro-actions"); if (actions) { actions.innerHTML = ""; addLink(actions, "Buy Pro - $2.99", PRO_URL, true); addLink(actions, "Pro unlock page", "/pro/unlock/", false); } const donate = $("donateLinks"); if (donate) { donate.innerHTML = ""; addLink(donate, "💌 OFUSE", OFUSE_URL, false); addLink(donate, "☕ Ko-fi", KOFI_URL, false); } const input = $("proKey"); if (input) { input.removeAttribute("stable"); input.removeAttribute("content"); input.placeholder = "NW-PDG-XXXX-XXXX-XX"; } }
  function fileName() { const now = new Date(); const y = now.getFullYear(); const m = String(now.getMonth() + 1).padStart(2, "0"); const d = String(now.getDate()).padStart(2, "0"); const platform = $("platform").value === "github" ? "github-pages" : "cloudflare-pages"; return `pages-deploy-guide-${platform}-${y}${m}${d}.md`; }

  function init() {
    initLang(); patchLinks(); loadPro(); updatePro();
    const initial = "条件を選んで『生成する』を押してください。\nSelect conditions and click Generate.";
    $("output").value = initial; $("errors").value = initial; if ($("diagnosis")) $("diagnosis").value = msg("Pro解除後、生成すると症状別診断ツリーが表示されます。", "After Pro unlock, generate to show the diagnosis tree."); if ($("proPack")) $("proPack").value = msg("Pro解除後、生成すると引き継ぎパックが表示されます。", "After Pro unlock, generate to show the handoff pack.");
    $("generate").addEventListener("click", render);
    $("copyAll").addEventListener("click", async () => { if (!generated) return toast(msg("先に生成してください。", "Generate a checklist first.")); toast(await copy(freeText) ? msg("コピーしました。", "Copied.") : msg("コピーに失敗しました。", "Copy failed.")); });
    $("activatePro").addEventListener("click", () => setPro(true)); $("clearPro").addEventListener("click", () => setPro(false));
    $("copyPro").addEventListener("click", async () => { if (!pro) return toast(msg("Pro解除後に使えます。", "Available after Pro unlock.")); if (!generated) return toast(msg("先に生成してください。", "Generate a checklist first.")); toast(await copy(proText) ? msg("Pro出力をコピーしました。", "Copied Pro output.") : msg("コピーに失敗しました。", "Copy failed.")); });
    $("downloadMd").addEventListener("click", () => { if (!pro) return toast(msg("Markdown出力はPro解除後に使えます。", "Markdown export is available after Pro unlock.")); if (!generated) return toast(msg("先に生成してください。", "Generate a checklist first.")); saveFile(fileName(), markdownText); toast(msg("Markdownを保存しました。", "Markdown saved.")); });
    ["platform", "sourceType", "customDomain", "outputFolder"].forEach((id) => $(id).addEventListener("change", () => { if (generated) render(); }));
  }
  document.addEventListener("DOMContentLoaded", init);
})();
