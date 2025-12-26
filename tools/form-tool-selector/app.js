/* ================================
 * NicheWorks tool template app.js
 * - JP/EN toggle (data-i18n)
 * - Utilities: copy, downloadText, debounce
 * ================================ */

(() => {
  "use strict";

  // ----------------------------
  // i18n (required)
  // ----------------------------
  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  // ----------------------------
  // Utilities
  // ----------------------------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Expose minimal helpers for tool scripts (Codex can reuse)
  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText,
    debounce,
    hasPro: () => {
      try { return !!localStorage.getItem("nw_pro_key"); } catch (_) { return false; }
    }
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    // Example:
    // initTool();
  });
})();

(() => {
  "use strict";

  const toolList = [
    {
      key: "simple",
      nameJa: "シンプル収集フォーム",
      nameEn: "Simple collection form",
      tags: ["free"],
      reasons: {
        ja: "無料から始めたい・回答数が少ない用途に向きます。",
        en: "Best for free-first and low-volume collection."
      },
      avoid: {
        ja: "決済や複雑な自動化が必要な場合は不向き。",
        en: "Not ideal if you need payments or complex automation."
      }
    },
    {
      key: "upload",
      nameJa: "ファイル回収向けフォーム",
      nameEn: "File collection form",
      tags: ["upload"],
      reasons: {
        ja: "ファイル提出が必須の時に安心。",
        en: "Suited for workflows that require file submission."
      },
      avoid: {
        ja: "ファイル容量や権限管理に厳密さが必要なら専用運用を検討。",
        en: "Avoid if you need strict storage governance and large file handling."
      }
    },
    {
      key: "payments",
      nameJa: "決済連携フォーム",
      nameEn: "Payment-ready form",
      tags: ["payments"],
      reasons: {
        ja: "申込と支払いを同時に行うケース向け。",
        en: "Great for collecting orders and payments together."
      },
      avoid: {
        ja: "領収書発行や税計算が必要なら専用決済と併用を。",
        en: "Not enough if you need invoicing or tax workflows."
      }
    },
    {
      key: "automation",
      nameJa: "通知・自動連携フォーム",
      nameEn: "Automation & notification form",
      tags: ["notify"],
      reasons: {
        ja: "Slack/メール通知や連携を重視する場合に便利。",
        en: "Useful when notifications and integrations are critical."
      },
      avoid: {
        ja: "ワークフローが複雑ならフォーム専用より自動化ツール連携を検討。",
        en: "Avoid if your workflow requires heavy custom logic."
      }
    },
    {
      key: "multilang",
      nameJa: "多言語フォーム",
      nameEn: "Multilingual form",
      tags: ["multi"],
      reasons: {
        ja: "多言語表示や言語切替が必要な場合に最適。",
        en: "Fits use cases requiring language switching."
      },
      avoid: {
        ja: "単一言語で十分なら運用コストが増える可能性。",
        en: "Overkill for single-language use."
      }
    },
    {
      key: "privacy",
      nameJa: "プライバシー重視フォーム",
      nameEn: "Privacy-first form",
      tags: ["privacy"],
      reasons: {
        ja: "個人情報取り扱いが厳しいケース向け。",
        en: "Designed for sensitive data handling."
      },
      avoid: {
        ja: "外部サービスに委ねたくない場合は自前運用を検討。",
        en: "Avoid if you require full self-hosted control."
      }
    }
  ];

  const getSelections = () => ({
    upload: document.getElementById("reqUpload").checked,
    payments: document.getElementById("reqPayments").checked,
    notify: document.getElementById("reqNotify").checked,
    multi: document.getElementById("reqMulti").checked,
    free: document.getElementById("reqFree").checked,
    privacy: document.getElementById("reqPrivacy").checked
  });

  const scoreTool = (tool, req) => {
    let score = 0;
    if (req.upload && tool.tags.includes("upload")) score += 3;
    if (req.payments && tool.tags.includes("payments")) score += 3;
    if (req.notify && tool.tags.includes("notify")) score += 2;
    if (req.multi && tool.tags.includes("multi")) score += 2;
    if (req.free && tool.tags.includes("free")) score += 1;
    if (req.privacy && tool.tags.includes("privacy")) score += 2;
    return score;
  };

  const buildOutput = (lang) => {
    const req = getSelections();
    const picks = toolList
      .map((tool) => ({ tool, score: scoreTool(tool, req) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    const lines = [];
    lines.push(lang === "ja" ? "おすすめタイプ（上位3）" : "Top 3 recommendation types");
    lines.push("-");

    picks.forEach((pick, idx) => {
      const tool = pick.tool;
      const name = lang === "ja" ? tool.nameJa : tool.nameEn;
      const reason = lang === "ja" ? tool.reasons.ja : tool.reasons.en;
      const avoid = lang === "ja" ? tool.avoid.ja : tool.avoid.en;
      lines.push(`${idx + 1}. ${name}`);
      lines.push(`   - ${reason}`);
      lines.push(`   - ${lang === "ja" ? "避けた方が良い条件:" : "Avoid when:"} ${avoid}`);
    });

    lines.push("-");
    lines.push(lang === "ja"
      ? "※具体的なサービス名は要件に合わせて比較検討してください（例: Google Forms / Tally / Typeform など）。"
      : "Choose the actual service based on your constraints (e.g., Google Forms / Tally / Typeform)."
    );

    return lines.join("\n");
  };

  const initTool = () => {
    const out = document.getElementById("output");
    const btnSelect = document.getElementById("btnSelect");
    const btnCopy = document.getElementById("btnCopy");
    const langButtons = Array.from(document.querySelectorAll(".nw-lang-switch button"));

    const render = () => {
      const lang = document.documentElement.lang || "ja";
      out.textContent = buildOutput(lang);
    };

    btnSelect.addEventListener("click", render);
    btnCopy.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(out.textContent.trim());
      if (ok) btnCopy.classList.add("primary");
      setTimeout(() => btnCopy.classList.remove("primary"), 600);
    });
    langButtons.forEach((btn) => btn.addEventListener("click", render));

    render();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
