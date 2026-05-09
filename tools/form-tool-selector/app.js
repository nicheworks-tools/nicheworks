(() => {
  "use strict";

  const requirementDefs = [
    {
      key: "upload",
      tag: "upload",
      weight: 3,
      label: { ja: "ファイルアップロード", en: "File upload" },
      caution: {
        ja: "容量上限、保存先、アクセス権限、マルウェア対策、個人情報混入、保存期間を確認してください。",
        en: "Check file size limits, storage location, access control, malware handling, personal data exposure, and retention period."
      }
    },
    {
      key: "payments",
      tag: "payments",
      weight: 3,
      label: { ja: "決済/請求", en: "Payments/Billing" },
      caution: {
        ja: "決済手数料、返金、領収書、税、特商法表示、プラットフォーム規約を確認してください。",
        en: "Check payment fees, refunds, receipts, tax handling, required legal notices, and platform terms."
      }
    },
    {
      key: "notify",
      tag: "notify",
      weight: 2,
      label: { ja: "通知/連携（Slack等）", en: "Notifications/Integrations" },
      caution: {
        ja: "通知漏れ、連携権限、連携先チャンネル、担当者、ログ保存の扱いを確認してください。",
        en: "Check missed notifications, integration permissions, destination channels, owners, and log retention."
      }
    },
    {
      key: "multi",
      tag: "multi",
      weight: 2,
      label: { ja: "多言語フォーム", en: "Multilingual forms" },
      caution: {
        ja: "フォーム文言だけでなく、自動返信、サポート対応、規約、プライバシー説明の言語も確認してください。",
        en: "Check not only form text, but also auto-replies, support language, terms, and privacy notices."
      }
    },
    {
      key: "free",
      tag: "free",
      weight: 1,
      label: { ja: "無料から試したい", en: "Free-first" },
      caution: {
        ja: "無料枠の回答数、保存期間、広告表示、エクスポート制限、有料移行時の料金を確認してください。",
        en: "Check free-tier response limits, retention, ads, export limits, and paid-plan pricing."
      }
    },
    {
      key: "privacy",
      tag: "privacy",
      weight: 2,
      label: { ja: "プライバシー重視", en: "Privacy-first" },
      caution: {
        ja: "保存先の国/地域、データ保持期間、アクセス権限、外部共有設定、削除依頼対応、DPA/委託先、添付ファイル保存先を確認してください。",
        en: "Check storage region, retention period, access permissions, sharing settings, deletion handling, DPA/subprocessors, and attachment storage."
      }
    }
  ];

  const toolList = [
    {
      key: "simple",
      name: { ja: "シンプル収集フォーム", en: "Simple collection form" },
      tags: ["free"],
      reasons: {
        ja: "無料枠から始めやすく、問い合わせ・アンケート・小規模な申込受付に向きます。",
        en: "Easy to start from a free tier and suited for inquiries, surveys, and small intake forms."
      },
      avoid: {
        ja: "決済、ファイル回収、厳密な権限管理、複雑な通知連携が必要な場合は不足しやすいです。",
        en: "Likely insufficient for payments, file collection, strict permissions, or complex notification workflows."
      }
    },
    {
      key: "upload",
      name: { ja: "ファイル回収向けフォーム", en: "File collection form" },
      tags: ["upload"],
      reasons: {
        ja: "応募書類、画像、確認資料など、添付ファイルの提出を前提にした運用に向きます。",
        en: "Suited for workflows that require resumes, images, verification files, or other attachments."
      },
      avoid: {
        ja: "大容量ファイル、機密資料、ウイルス対策、長期保存が必要な場合は専用ストレージ運用も比較してください。",
        en: "For large files, confidential documents, malware controls, or long-term retention, compare dedicated storage workflows too."
      }
    },
    {
      key: "payments",
      name: { ja: "決済連携フォーム", en: "Payment-ready form" },
      tags: ["payments"],
      reasons: {
        ja: "申込、予約、注文、チケットなど、回答と支払いを同時に扱うケースに向きます。",
        en: "Suited for signups, bookings, orders, tickets, and other flows that combine submission and payment."
      },
      avoid: {
        ja: "返金、領収書、税、特商法表示、決済規約、手数料まで含めて確認しないと実運用で詰まりやすいです。",
        en: "Can fail in production if refunds, receipts, taxes, legal notices, payment terms, and fees are not checked."
      }
    },
    {
      key: "automation",
      name: { ja: "通知・自動連携フォーム", en: "Automation & notification form" },
      tags: ["notify"],
      reasons: {
        ja: "Slack、メール、スプレッドシート、CRMなどへ回答後すぐ流したい用途に向きます。",
        en: "Suited for sending submissions to Slack, email, spreadsheets, CRMs, or similar systems quickly."
      },
      avoid: {
        ja: "承認フローや条件分岐が多い場合は、フォーム単体ではなく自動化基盤との組み合わせを検討してください。",
        en: "If approvals or branching rules are complex, compare form-plus-automation setups rather than form-only setups."
      }
    },
    {
      key: "multilang",
      name: { ja: "多言語フォーム", en: "Multilingual form" },
      tags: ["multi"],
      reasons: {
        ja: "日本語/英語など複数言語で、同じ受付導線を使いたいケースに向きます。",
        en: "Suited for sharing one intake flow across Japanese, English, or other languages."
      },
      avoid: {
        ja: "翻訳だけでなく、自動返信、規約、問い合わせ対応まで多言語化できないと運用負担が増えます。",
        en: "Operational load increases if auto-replies, terms, and support are not multilingual too."
      }
    },
    {
      key: "privacy",
      name: { ja: "プライバシー重視フォーム", en: "Privacy-first form" },
      tags: ["privacy"],
      reasons: {
        ja: "個人情報、社内情報、顧客情報など、保存先や権限を慎重に確認したい用途に向きます。",
        en: "Suited for personal, internal, or customer data where storage and permissions need careful review."
      },
      avoid: {
        ja: "外部サービスに預けられない情報なら、フォームサービスではなく自前運用や契約済み基盤を検討してください。",
        en: "If data cannot be stored in an external service, consider self-hosting or an already-approved platform instead."
      }
    }
  ];

  const $ = (id) => document.getElementById(id);
  const nodesByLang = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") return saved;
    } catch (_) {}
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    nodesByLang().forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons().forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const getSelections = () => ({
    upload: $("reqUpload").checked,
    payments: $("reqPayments").checked,
    notify: $("reqNotify").checked,
    multi: $("reqMulti").checked,
    free: $("reqFree").checked,
    privacy: $("reqPrivacy").checked
  });

  const selectedDefs = (req) => requirementDefs.filter((def) => req[def.key]);
  const hasAnySelection = (req) => selectedDefs(req).length > 0;

  const scoreTool = (tool, req) => requirementDefs.reduce((total, def) => {
    if (!req[def.key]) return total;
    return total + (tool.tags.includes(def.tag) ? def.weight : 0);
  }, 0);

  const buildRecommendationData = (lang) => {
    const req = getSelections();
    return toolList
      .map((tool) => ({ tool, score: scoreTool(tool, req) }))
      .filter((pick) => pick.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.key.localeCompare(b.tool.key))
      .slice(0, 3)
      .map((pick) => {
        const tool = pick.tool;
        const matched = requirementDefs
          .filter((def) => req[def.key] && tool.tags.includes(def.tag))
          .map((def) => def.label[lang]);
        const missing = requirementDefs
          .filter((def) => req[def.key] && !tool.tags.includes(def.tag))
          .map((def) => lang === "ja" ? `未対応: ${def.label.ja}` : `Missing: ${def.label.en}`);
        return {
          key: tool.key,
          name: tool.name[lang],
          bestFor: tool.reasons[lang],
          score: pick.score,
          matched,
          tradeoffs: [
            ...missing,
            lang === "ja" ? `注意: ${tool.avoid.ja}` : `Note: ${tool.avoid.en}`
          ]
        };
      });
  };

  const buildRequirementCautions = (lang) => {
    const req = getSelections();
    return selectedDefs(req).map((def) => ({
      label: def.label[lang],
      caution: def.caution[lang]
    }));
  };

  const makeText = (lang, recommendations) => {
    const lines = [];
    lines.push(lang === "ja" ? "候補タイプ（参考）" : "Candidate form types");
    lines.push("-");
    recommendations.forEach((rec, idx) => {
      lines.push(`${idx + 1}. ${rec.name}`);
      lines.push(`   - ${lang === "ja" ? "用途" : "Use case"}: ${rec.bestFor}`);
      lines.push(`   - ${lang === "ja" ? "一致条件" : "Matched"}: ${rec.matched.join(", ") || (lang === "ja" ? "該当なし" : "None")}`);
      lines.push(`   - ${lang === "ja" ? "未一致/注意" : "Missing / notes"}: ${rec.tradeoffs.join("; ")}`);
    });
    lines.push("-");
    lines.push(lang === "ja"
      ? "この結果はフォーム種別の整理であり、特定サービスの推奨や適合保証ではありません。料金、保存先、利用規約、個人情報の扱い、アップロード容量、決済条件、通知連携を必ず確認してください。"
      : "This result organizes form-type candidates only. It is not a recommendation or fit guarantee for a specific service. Always check pricing, storage location, terms, personal data handling, upload limits, payment conditions, and integrations."
    );
    lines.push("");
    lines.push(lang === "ja" ? "要件別の確認事項" : "Requirement-specific checks");
    buildRequirementCautions(lang).forEach((item) => {
      lines.push(`- ${item.label}: ${item.caution}`);
    });
    return lines.join("\n");
  };

  const makeMemo = (lang, recommendations) => {
    const req = getSelections();
    const selected = selectedDefs(req).map((def) => def.label[lang]);
    const top = recommendations[0];
    const cautions = buildRequirementCautions(lang);
    const today = new Date();
    const nextReview = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    if (lang === "ja") {
      return [
        "Decision memo",
        `候補タイプ: ${top.name}`,
        `比較候補数: ${recommendations.length}件`,
        "選定理由:",
        ...top.matched.map((item) => `- ${item}`),
        "選択した要件:",
        ...selected.map((item) => `- ${item}`),
        "確認すべき未決事項:",
        "- 具体サービスごとの料金、無料枠、保存先、利用規約",
        "- 回答データと添付ファイルの保存期間・削除方法",
        "- 管理者/閲覧者/通知先の権限",
        "- 決済、領収書、返金、税、特商法表示の要否",
        "試作フォームで検証する項目:",
        "- 回答送信から通知までの到達確認",
        "- スマホ入力、必須項目、エラー表示、控えメール",
        "- CSV/スプレッドシート/CRMへの出力確認",
        "個人情報/決済/ファイルの注意:",
        ...cautions.map((item) => `- ${item.label}: ${item.caution}`),
        "次回確認日:",
        `- ${nextReview}`,
        "オーナー/担当者:",
        "- 未設定",
        "備考:",
        "- このメモは候補タイプ整理用です。特定サービスの適合保証ではありません。"
      ].join("\n");
    }

    return [
      "Decision memo",
      `Candidate type: ${top.name}`,
      `Number of candidates compared: ${recommendations.length}`,
      "Selection reasons:",
      ...top.matched.map((item) => `- ${item}`),
      "Selected requirements:",
      ...selected.map((item) => `- ${item}`),
      "Open items to verify:",
      "- Pricing, free tier, storage location, and terms for each service",
      "- Retention and deletion process for submissions and attachments",
      "- Permissions for admins, viewers, notification channels, and owners",
      "- Payment, receipt, refund, tax, and legal notice requirements",
      "Prototype checks:",
      "- Confirm submission-to-notification delivery",
      "- Test mobile input, required fields, errors, and confirmation emails",
      "- Confirm CSV/spreadsheet/CRM export path",
      "Personal data / payment / file cautions:",
      ...cautions.map((item) => `- ${item.label}: ${item.caution}`),
      "Next review date:",
      `- ${nextReview}`,
      "Owner:",
      "- Not set",
      "Notes:",
      "- This memo organizes candidate form types only. It does not guarantee fit for any specific service."
    ].join("\n");
  };

  const toMarkdown = (lang, recommendations, memo) => {
    const title = lang === "ja" ? "# フォーム候補タイプ整理" : "# Form candidate type memo";
    return [title, "", makeText(lang, recommendations), "", "## Decision memo", "", memo].join("\n");
  };

  const appendText = (parent, tag, className, text) => {
    const el = document.createElement(tag);
    if (className) el.className = className;
    el.textContent = text;
    parent.appendChild(el);
    return el;
  };

  const buildStateCard = (message) => {
    const card = document.createElement("div");
    card.className = "result-card state-card";
    appendText(card, "p", "result-best", message);
    return card;
  };

  const buildRecommendationCards = (recommendations, lang) => recommendations.map((rec, idx) => {
    const card = document.createElement("div");
    card.className = "result-card";
    appendText(card, "p", "result-rank", `${lang === "ja" ? "候補" : "Candidate"} ${idx + 1}`);
    appendText(card, "h3", "result-name", rec.name);
    appendText(card, "p", "result-best", `${lang === "ja" ? "用途" : "Use case"}: ${rec.bestFor}`);
    appendText(card, "p", "result-section-title", lang === "ja" ? "一致した要件" : "Matched requirements");
    const matchedList = document.createElement("ul");
    (rec.matched.length ? rec.matched : [lang === "ja" ? "該当なし" : "None"]).forEach((item) => appendText(matchedList, "li", "", item));
    card.appendChild(matchedList);
    appendText(card, "p", "result-section-title", lang === "ja" ? "未一致/注意" : "Missing / notes");
    const tradeList = document.createElement("ul");
    rec.tradeoffs.forEach((item) => appendText(tradeList, "li", "", item));
    card.appendChild(tradeList);
    return card;
  });

  const buildCautionList = (items, lang) => {
    const wrap = document.createElement("div");
    wrap.className = "caution-box";
    appendText(wrap, "p", "result-section-title", lang === "ja" ? "要件別の確認事項" : "Requirement-specific checks");
    const list = document.createElement("ul");
    items.forEach((item) => appendText(list, "li", "", `${item.label}: ${item.caution}`));
    wrap.appendChild(list);
    return wrap;
  };

  const copyText = async (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (_) {}
    }
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
    ta.remove();
    return ok;
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

  const showToast = (message) => {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove("show"), 1800);
  };

  const messages = {
    initial: {
      ja: "要件を1つ以上選んでから、候補タイプを出してください。",
      en: "Select at least one requirement, then generate candidate form types."
    },
    noSelection: {
      ja: "要件を1つ以上選んでください。未選択では候補を出しません。",
      en: "Select at least one requirement. No candidates are shown without requirements."
    },
    copyBlocked: {
      ja: "まだ結果がありません。要件を選んで生成してください。",
      en: "No results yet. Select requirements and generate first."
    },
    copyOk: { ja: "コピーしました。", en: "Copied." },
    copyFail: { ja: "コピーに失敗しました。", en: "Copy failed." },
    saveOk: { ja: "保存しました。", en: "Saved." }
  };

  const initTool = () => {
    const resultList = $("resultList");
    const memoOutput = $("memoOutput");
    const copyResults = $("btnCopyResults");
    const copyMemo = $("btnCopyMemo");
    const saveTxt = $("btnSaveTxt");
    const saveMd = $("btnSaveMd");
    let resultsText = "";
    let memoText = "";
    let markdownText = "";
    let hasGenerated = false;

    const lang = () => document.documentElement.lang || "ja";

    const setOutputActions = (enabled) => {
      [copyResults, copyMemo, saveTxt, saveMd].forEach((btn) => {
        btn.disabled = !enabled;
        btn.setAttribute("aria-disabled", String(!enabled));
      });
    };

    const showInitial = () => {
      resultsText = "";
      memoText = "";
      markdownText = "";
      hasGenerated = false;
      setOutputActions(false);
      resultList.replaceChildren(buildStateCard(messages.initial[lang()]));
      memoOutput.textContent = "-";
    };

    const render = () => {
      const current = lang();
      const req = getSelections();
      if (!hasAnySelection(req)) {
        resultsText = "";
        memoText = "";
        markdownText = "";
        hasGenerated = false;
        setOutputActions(false);
        resultList.replaceChildren(buildStateCard(messages.noSelection[current]));
        memoOutput.textContent = messages.copyBlocked[current];
        showToast(messages.noSelection[current]);
        return;
      }

      const recommendations = buildRecommendationData(current);
      resultsText = makeText(current, recommendations);
      memoText = makeMemo(current, recommendations);
      markdownText = toMarkdown(current, recommendations, memoText);
      hasGenerated = true;
      setOutputActions(true);

      const cards = buildRecommendationCards(recommendations, current);
      cards.push(buildCautionList(buildRequirementCautions(current), current));
      resultList.replaceChildren(...cards);
      memoOutput.textContent = memoText;
    };

    const ensureGenerated = () => {
      if (hasGenerated) return true;
      showToast(messages.copyBlocked[lang()]);
      return false;
    };

    $("btnSelect").addEventListener("click", render);
    $("btnQuickStart").addEventListener("click", () => {
      $("reqUpload").checked = true;
      $("reqPayments").checked = false;
      $("reqNotify").checked = true;
      $("reqMulti").checked = false;
      $("reqFree").checked = true;
      $("reqPrivacy").checked = false;
      render();
    });

    copyResults.addEventListener("click", async () => {
      if (!ensureGenerated()) return;
      showToast((await copyText(resultsText)) ? messages.copyOk[lang()] : messages.copyFail[lang()]);
    });
    copyMemo.addEventListener("click", async () => {
      if (!ensureGenerated()) return;
      showToast((await copyText(memoText)) ? messages.copyOk[lang()] : messages.copyFail[lang()]);
    });
    saveTxt.addEventListener("click", () => {
      if (!ensureGenerated()) return;
      const date = new Date().toISOString().slice(0, 10);
      downloadText(`form-tool-selector-${date}.txt`, `${resultsText}\n\n${memoText}`);
      showToast(messages.saveOk[lang()]);
    });
    saveMd.addEventListener("click", () => {
      if (!ensureGenerated()) return;
      const date = new Date().toISOString().slice(0, 10);
      downloadText(`form-tool-selector-${date}.md`, markdownText, "text/markdown;charset=utf-8");
      showToast(messages.saveOk[lang()]);
    });

    langButtons().forEach((btn) => {
      btn.addEventListener("click", () => {
        applyLang(btn.dataset.lang);
        if (hasGenerated) render();
        else showInitial();
      });
    });

    applyLang(getDefaultLang());
    showInitial();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
