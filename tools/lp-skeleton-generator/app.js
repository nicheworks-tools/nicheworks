(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    let lang = browserLang.startsWith("ja") ? "ja" : "en";
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try { return document.execCommand("copy"); }
      catch (e) { return false; }
      finally { document.body.removeChild(ta); }
    }
  };

  const downloadText = (filename, text, type = "text/plain;charset=utf-8") => {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const toast = (message) => {
    let el = document.getElementById("nwToast");
    if (!el) {
      el = document.createElement("div");
      el.id = "nwToast";
      el.className = "nw-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
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

  let hasGenerated = false;
  let lastBuild = null;

  const val = (id) => (document.getElementById(id)?.value || "").trim();
  const lines = (id) => (document.getElementById(id)?.value || "").split("\n").map((v) => v.trim()).filter(Boolean);
  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const mdList = (items, fallback) => items.length ? items.map((item) => `- ${item}`).join("\n") : `- ${fallback}`;
  const htmlList = (items, fallback) => (items.length ? items : [fallback]).map((item) => `    <li>${escapeHtml(item)}</li>`).join("\n");

  const buildOutput = () => {
    const product = val("productName") || "(商品・サービス名)";
    const target = val("target") || "(ターゲット)";
    const problem = val("problem") || "今の悩み・課題を提示";
    const benefits = lines("benefits");
    const differentiators = lines("differentiators");
    const price = val("price");
    const proof = val("proof");
    const steps = lines("steps");
    const faq = lines("faq");
    const guarantee = val("guarantee");
    const notes = val("notes");
    const cta = val("cta") || "(CTA)";

    const jp = [
      `# ${product} LP骨子`,
      "", "## 1. Hero", `- キャッチ: ${product}`, `- ターゲット: ${target}`, `- CTA: ${cta}`,
      "", "## 2. Problem / 課題", `- ${problem}`,
      "", "## 3. Solution / 提案", `- ${product}で、上記の課題をどう軽くするかを説明する`,
      "", "## 4. Benefits / ベネフィット", mdList(benefits, "ベネフィットを入力"),
      "", "## 5. Differentiators / 差別化ポイント", mdList(differentiators, "競合との違いや選ばれる理由を入力"),
      "", "## 6. Pricing / 料金", price ? `- 価格: ${price}` : "- 価格は未入力。公開前に税込/税別、期間、条件を確認する。",
      "", "## 7. Proof / 信頼材料", proof ? `- 実績・証拠: ${proof}` : "- 導入事例、利用者の声、根拠資料などを追加する。数値は根拠がある場合のみ使う。",
      "", "## 8. How it works / 導入手順", mdList(steps, "利用開始までの手順を入力"),
      "", "## 9. FAQ", mdList(faq, "想定質問と回答を入力"),
      "", "## 10. Guarantee / 返金・保証条件", guarantee ? `- ${guarantee}` : "- 条件がある場合のみ、対象範囲・期限・例外を明記する。",
      "", "## 11. Notes / 対象外・注意事項", notes ? `- ${notes}` : "- 対象外、注意事項、業種規制、広告媒体ポリシー確認を記載する。",
      "", "## 12. CTA", `- ${cta}`,
      "", "## 公開前チェック", "- 数値実績に根拠があるか", "- 価格表示が正しいか", "- 効果効能を断定していないか", "- 比較表現に根拠があるか", "- 返金/保証条件が明確か", "- CTAの遷移先が正しいか", "- 業種規制と広告媒体ポリシーを確認したか"
    ].join("\n");

    const en = [
      `# ${product} LP Skeleton`,
      "", "## 1. Hero", `- Headline: ${product}`, `- Audience: ${target}`, `- CTA: ${cta}`,
      "", "## 2. Problem", `- ${problem}`,
      "", "## 3. Solution", `- Explain how ${product} helps reduce the problem above.`,
      "", "## 4. Benefits", mdList(benefits, "Add benefits"),
      "", "## 5. Differentiators", mdList(differentiators, "Add what makes this different"),
      "", "## 6. Pricing", price ? `- Price: ${price}` : "- Pricing not set. Check tax, period, and conditions before publishing.",
      "", "## 7. Proof", proof ? `- Proof: ${proof}` : "- Add proof only when substantiated.",
      "", "## 8. How it works", mdList(steps, "Add onboarding or usage steps"),
      "", "## 9. FAQ", mdList(faq, "Add expected questions and answers"),
      "", "## 10. Guarantee / Refund terms", guarantee ? `- ${guarantee}` : "- If applicable, clarify scope, deadline, and exceptions.",
      "", "## 11. Notes / Exclusions", notes ? `- ${notes}` : "- Add exclusions, cautions, regulations, or ad policy checks.",
      "", "## 12. CTA", `- ${cta}`,
      "", "## Pre-publish checklist", "- Are numerical claims substantiated?", "- Is pricing accurate?", "- Are effect or performance claims not overstated?", "- Are comparison claims supported?", "- Are refund or guarantee terms clear?", "- Does the CTA link to the correct destination?", "- Have regulations and ad policies been checked?"
    ].join("\n");

    const html = [
      "<!doctype html>", "<html lang=\"ja\">", "<head>", "  <meta charset=\"utf-8\">", "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">", `  <title>${escapeHtml(product)} LP Skeleton</title>`, "</head>", "<body>", "  <main>",
      "    <section>", `      <h1>${escapeHtml(product)}</h1>`, `      <p>${escapeHtml(target)}</p>`, `      <p><a href=\"#cta\">${escapeHtml(cta)}</a></p>`, "    </section>",
      "    <section>", "      <h2>Problem</h2>", `      <p>${escapeHtml(problem)}</p>`, "    </section>",
      "    <section>", "      <h2>Benefits</h2>", "      <ul>", htmlList(benefits, "Add benefits"), "      </ul>", "    </section>",
      "    <section>", "      <h2>Differentiators</h2>", "      <ul>", htmlList(differentiators, "Add differentiators"), "      </ul>", "    </section>",
      "    <section>", "      <h2>Pricing / Proof</h2>", `      <p>${escapeHtml(price || "Pricing not set.")}</p>`, `      <p>${escapeHtml(proof || "Add proof only when substantiated.")}</p>`, "    </section>",
      "    <section>", "      <h2>How it works</h2>", "      <ol>", htmlList(steps, "Add onboarding or usage steps"), "      </ol>", "    </section>",
      "    <section>", "      <h2>FAQ</h2>", "      <ul>", htmlList(faq, "Add expected questions and answers"), "      </ul>", "    </section>",
      "    <section>", "      <h2>Notes</h2>", `      <p>${escapeHtml(guarantee || "Clarify guarantee or refund terms when applicable.")}</p>`, `      <p>${escapeHtml(notes || "Check regulations and ad policies before publishing.")}</p>`, "    </section>",
      "    <section id=\"cta\">", `      <button type=\"button\">${escapeHtml(cta)}</button>`, "    </section>",
      "  </main>", "</body>", "</html>"
    ].join("\n");

    return { output: `${jp}\n\n---\n\n${en}`, markdown: `${jp}\n\n---\n\n${en}`, html };
  };

  const ensureGenerated = () => {
    if (!hasGenerated || !lastBuild) {
      window.NW.toast("入力後に生成してください / Click Generate first");
      return false;
    }
    return true;
  };

  const initTool = () => {
    const output = document.getElementById("output");
    output.value = "";

    document.getElementById("generate").addEventListener("click", () => {
      lastBuild = buildOutput();
      hasGenerated = true;
      output.value = lastBuild.output;
      window.NW.toast("生成しました / Generated");
    });

    document.getElementById("copyAll").addEventListener("click", async () => {
      if (!ensureGenerated() || !output.value.trim()) return;
      const ok = await window.NW.copyToClipboard(output.value);
      window.NW.toast(ok ? "コピーしました / Copied" : "コピーに失敗しました / Copy failed");
    });

    document.getElementById("downloadMd").addEventListener("click", () => {
      if (!ensureGenerated()) return;
      window.NW.downloadText("lp-skeleton.md", lastBuild.markdown, "text/markdown;charset=utf-8");
      window.NW.toast("Markdownを保存しました / Markdown saved");
    });

    document.getElementById("downloadHtml").addEventListener("click", () => {
      if (!ensureGenerated()) return;
      window.NW.downloadText("lp-skeleton.html", lastBuild.html, "text/html;charset=utf-8");
      window.NW.toast("HTMLを保存しました / HTML saved");
    });
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
