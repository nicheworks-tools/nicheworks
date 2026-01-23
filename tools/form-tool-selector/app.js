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

  const requirementDefs = [
    {
      key: "upload",
      tag: "upload",
      weight: 3,
      label: { ja: "ファイルアップロード", en: "File upload" }
    },
    {
      key: "payments",
      tag: "payments",
      weight: 3,
      label: { ja: "決済/請求", en: "Payments/Billing" }
    },
    {
      key: "notify",
      tag: "notify",
      weight: 2,
      label: { ja: "通知/連携（Slack等）", en: "Notifications/Integrations" }
    },
    {
      key: "multi",
      tag: "multi",
      weight: 2,
      label: { ja: "多言語フォーム", en: "Multilingual forms" }
    },
    {
      key: "free",
      tag: "free",
      weight: 1,
      label: { ja: "無料から試したい", en: "Free-first" }
    },
    {
      key: "privacy",
      tag: "privacy",
      weight: 2,
      label: { ja: "プライバシー重視", en: "Privacy-first" }
    }
  ];

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
    return requirementDefs.reduce((total, def) => {
      if (req[def.key] && tool.tags.includes(def.tag)) {
        return total + def.weight;
      }
      return total;
    }, 0);
  };

  const buildRecommendationData = (lang) => {
    const req = getSelections();
    const picks = toolList
      .map((tool) => ({ tool, score: scoreTool(tool, req) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return picks.map((pick) => {
      const tool = pick.tool;
      const name = lang === "ja" ? tool.nameJa : tool.nameEn;
      const bestFor = lang === "ja" ? tool.reasons.ja : tool.reasons.en;
      const matched = requirementDefs
        .filter((def) => req[def.key] && tool.tags.includes(def.tag))
        .map((def) => def.label[lang]);
      const missing = requirementDefs
        .filter((def) => req[def.key] && !tool.tags.includes(def.tag))
        .map((def) => lang === "ja" ? `未対応: ${def.label.ja}` : `Missing: ${def.label.en}`);
      const tradeoffs = [
        ...missing,
        lang === "ja" ? `注意: ${tool.avoid.ja}` : `Note: ${tool.avoid.en}`
      ];

      return {
        name,
        bestFor,
        matched,
        tradeoffs
      };
    });
  };

  const buildResultsText = (lang, recommendations) => {
    const bestLabel = lang === "ja" ? "おすすめ用途" : "Best for";
    const lines = [];
    lines.push(lang === "ja" ? "おすすめタイプ（上位3）" : "Top 3 recommendation types");
    lines.push("-");

    recommendations.forEach((rec, idx) => {
      const matchedText = rec.matched.length
        ? rec.matched.join(", ")
        : (lang === "ja" ? "該当なし" : "None");
      const tradeoffText = rec.tradeoffs.length
        ? rec.tradeoffs.join("; ")
        : (lang === "ja" ? "特になし" : "None");
      lines.push(`${idx + 1}. ${rec.name}`);
      lines.push(`   - ${bestLabel}: ${rec.bestFor}`);
      lines.push(`   - ${lang === "ja" ? "一致条件" : "Matched"}: ${matchedText}`);
      lines.push(`   - ${lang === "ja" ? "未一致/トレードオフ" : "Not matched / tradeoffs"}: ${tradeoffText}`);
    });

    lines.push("-");
    lines.push(lang === "ja"
      ? "※具体的なサービス名は要件に合わせて比較検討してください（例: Google Forms / Tally / Typeform など）。"
      : "Choose the actual service based on your constraints (e.g., Google Forms / Tally / Typeform)."
    );

    return lines.join("\n");
  };

  const buildMemoText = (lang, topRec) => {
    const matched = topRec.matched.length
      ? topRec.matched
      : [lang === "ja" ? "該当なし" : "None"];
    const tradeoffs = topRec.tradeoffs.length
      ? topRec.tradeoffs
      : [lang === "ja" ? "特になし" : "None"];

    if (lang === "ja") {
      return [
        "Decision memo",
        `選定ツール: ${topRec.name}`,
        "理由:",
        ...matched.map((item) => `- ${item}`),
        "リスク/懸念:",
        ...tradeoffs.map((item) => `- ${item}`),
        "次のアクション:",
        "- 候補サービスを2〜3件比較（料金、容量、通知/連携、決済の対応可否）",
        "- 試作フォームで回答〜通知までの動線を検証",
        "- 法務/セキュリティ観点でプライバシーポリシーと保存期間を確認",
        "事前に用意するもの:",
        "- 質問項目一覧（必須/任意）",
        "- 想定回答数・ファイル容量・決済条件",
        "- 通知先（メール/Slack）と担当者"
      ].join("\n");
    }

    return [
      "Decision memo",
      `Chosen tool: ${topRec.name}`,
      "Reasons:",
      ...matched.map((item) => `- ${item}`),
      "Risks / tradeoffs:",
      ...tradeoffs.map((item) => `- ${item}`),
      "Next steps:",
      "- Compare 2–3 services (pricing, storage limits, notifications, payment support).",
      "- Build a prototype form to validate submission-to-notification flow.",
      "- Review privacy policy and data retention with security/legal.",
      "What to prepare:",
      "- Question list (required/optional).",
      "- Expected volume, file size limits, payment terms.",
      "- Notification channels and owners."
    ].join("\n");
  };

  const buildRecommendationCards = (recommendations, lang) => {
    const bestLabel = lang === "ja" ? "おすすめ用途" : "Best for";
    return recommendations.map((rec, idx) => {
      const card = document.createElement("div");
      card.className = "result-card";

      const rank = document.createElement("p");
      rank.className = "result-rank";
      rank.textContent = `${lang === "ja" ? "順位" : "Rank"} ${idx + 1}`;

      const name = document.createElement("h3");
      name.className = "result-name";
      name.textContent = rec.name;

      const best = document.createElement("p");
      best.className = "result-best";
      best.textContent = `${bestLabel}: ${rec.bestFor}`;

      const matchedTitle = document.createElement("p");
      matchedTitle.className = "result-section-title";
      matchedTitle.textContent = lang === "ja" ? "一致した要件" : "Matched requirements";

      const matchedList = document.createElement("ul");
      (rec.matched.length ? rec.matched : [lang === "ja" ? "該当なし" : "None"])
        .forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          matchedList.appendChild(li);
        });

      const tradeTitle = document.createElement("p");
      tradeTitle.className = "result-section-title";
      tradeTitle.textContent = lang === "ja" ? "未一致/トレードオフ" : "Not matched / tradeoffs";

      const tradeList = document.createElement("ul");
      (rec.tradeoffs.length ? rec.tradeoffs : [lang === "ja" ? "特になし" : "None"])
        .forEach((item) => {
          const li = document.createElement("li");
          li.textContent = item;
          tradeList.appendChild(li);
        });

      card.append(rank, name, best, matchedTitle, matchedList, tradeTitle, tradeList);
      return card;
    });
  };

  const initTool = () => {
    const btnSelect = document.getElementById("btnSelect");
    const btnQuickStart = document.getElementById("btnQuickStart");
    const btnCopyResults = document.getElementById("btnCopyResults");
    const btnCopyMemo = document.getElementById("btnCopyMemo");
    const resultList = document.getElementById("resultList");
    const memoOutput = document.getElementById("memoOutput");
    const langButtons = Array.from(document.querySelectorAll(".nw-lang-switch button"));
    let resultsText = "-";
    let memoText = "-";

    const render = () => {
      const lang = document.documentElement.lang || "ja";
      const recommendations = buildRecommendationData(lang);
      resultsText = buildResultsText(lang, recommendations);
      memoText = buildMemoText(lang, recommendations[0]);

      resultList.innerHTML = "";
      buildRecommendationCards(recommendations, lang).forEach((card) => resultList.appendChild(card));
      memoOutput.textContent = memoText;
    };

    btnSelect.addEventListener("click", render);
    btnQuickStart.addEventListener("click", () => {
      document.getElementById("reqUpload").checked = true;
      document.getElementById("reqPayments").checked = false;
      document.getElementById("reqNotify").checked = true;
      document.getElementById("reqMulti").checked = false;
      document.getElementById("reqFree").checked = true;
      document.getElementById("reqPrivacy").checked = false;
      render();
    });
    btnCopyResults.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(resultsText.trim());
      if (ok) btnCopyResults.classList.add("primary");
      setTimeout(() => btnCopyResults.classList.remove("primary"), 600);
    });
    btnCopyMemo.addEventListener("click", async () => {
      const ok = await window.NW.copyToClipboard(memoText.trim());
      if (ok) btnCopyMemo.classList.add("primary");
      setTimeout(() => btnCopyMemo.classList.remove("primary"), 600);
    });
    langButtons.forEach((btn) => btn.addEventListener("click", render));

    render();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
