(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const all = (sel) => Array.from(document.querySelectorAll(sel));
  const lang = () => (document.documentElement.lang === "en" ? "en" : "ja");

  const L = {
    ja: {
      full: "デザイン依頼文（制作ブリーフ）",
      key: "要点まとめ",
      tier: { short: "短い", standard: "標準", detailed: "詳細" },
      label: {
        projectType: "プロジェクト種別",
        purpose: "目的",
        deliverables: "納品物",
        size: "サイズ/仕様",
        deadline: "納期",
        budget: "予算",
        references: "参考/素材",
        mustHave: "必須要素",
        audience: "ターゲット",
        tone: "トーン/雰囲気",
        avoid: "避けたい表現",
        constraints: "制約/NG",
        deliverablesFormat: "納品形式",
        revisions: "修正回数",
        contact: "連絡先"
      },
      section: {
        summary: "概要",
        deliverables: "納品物",
        specs: "仕様・必須要素",
        timeline: "スケジュール",
        budget: "予算",
        references: "参考素材",
        constraints: "制約・NG事項",
        format: "納品形式",
        revisions: "修正回数",
        contact: "連絡先",
        missing: "未提供の推奨項目",
        before: "送付前の確認事項",
        key: "要点"
      },
      msg: {
        missingTitle: "未入力があります",
        readyTitle: "必要項目は入力済み",
        missingDetail: "必須項目を入力してから生成してください。",
        readyDetail: "送信前に権利、納品形式、修正回数、素材利用可否を確認してください。",
        recommended: "強く推奨：サイズ・仕様 / 参考素材 / 納品形式 / 修正回数 / 連絡先",
        initial: "入力後に生成してください",
        generateFirst: "先に出力を生成してください",
        fillRequired: "必須項目を入力してください",
        copied: "コピーしました",
        copyFailed: "コピーに失敗しました",
        downloaded: "TXTを保存しました"
      },
      mark: { blank: "(未記入)", dash: "—", none: "未提供" },
      checks: ["納品形式", "修正回数", "商用利用範囲", "素材・フォント・画像の権利", "追加費用が発生する条件", "実績公開の可否"]
    },
    en: {
      full: "Design Request Brief",
      key: "Key Points",
      tier: { short: "Short", standard: "Standard", detailed: "Detailed" },
      label: {
        projectType: "Project type",
        purpose: "Purpose",
        deliverables: "Deliverables",
        size: "Size/Specs",
        deadline: "Deadline",
        budget: "Budget",
        references: "References/Assets",
        mustHave: "Must-have items",
        audience: "Target audience",
        tone: "Tone/Style",
        avoid: "Avoid",
        constraints: "Constraints/NG",
        deliverablesFormat: "Deliverables format",
        revisions: "Revisions",
        contact: "Contact"
      },
      section: {
        summary: "Summary",
        deliverables: "Deliverables",
        specs: "Specs / Must-have items",
        timeline: "Timeline",
        budget: "Budget",
        references: "References / Assets",
        constraints: "Constraints / NG",
        format: "Deliverables format",
        revisions: "Revisions",
        contact: "Contact",
        missing: "Recommended items not provided",
        before: "Before sending",
        key: "Key points"
      },
      msg: {
        missingTitle: "Required fields missing",
        readyTitle: "Required fields filled",
        missingDetail: "Complete the required fields before generating.",
        readyDetail: "Before sending, confirm rights, formats, revisions and asset use.",
        recommended: "Strongly recommended: size/specs / references / deliverables format / revisions / contact",
        initial: "Generate after entering the required fields.",
        generateFirst: "Generate the output first",
        fillRequired: "Complete the required fields first",
        copied: "Copied",
        copyFailed: "Copy failed",
        downloaded: "TXT saved"
      },
      mark: { blank: "(missing)", dash: "—", none: "Not provided" },
      checks: ["File format", "Revision rounds", "Usage scope", "Asset, font and image rights", "When extra fees apply", "Portfolio use"]
    }
  };

  const req = [["projectType", "warnProjectType"], ["purpose", "warnPurpose"], ["deliverables", "warnDeliverables"], ["deadline", "warnDeadline"], ["budget", "warnBudget"]];
  const opt = ["size", "references", "deliverablesFormat", "revisions", "contact", "mustHave", "audience", "tone", "avoid", "constraints"];
  const ids = ["projectType", "purpose", "deliverables", "size", "deadline", "budget", "references", "mustHave", "audience", "tone", "avoid", "constraints", "deliverablesFormat", "revisions", "contact"];

  const isReq = (key) => req.some(([id]) => id === key);
  const val = (key, data, t) => data[key] || (isReq(key) ? t.mark.blank : t.mark.dash);
  const linesOf = (text) => text.split(/\n+/).map((v) => v.trim()).filter(Boolean);

  const debounce = (fn, ms = 150) => {
    let timer = null;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms);
    };
  };

  const copyText = async (text) => {
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

  const saveText = (name, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const placeholderText = (el, next) => {
    if (el.dataset.phJa || el.dataset.phEn) return el.dataset[next === "ja" ? "phJa" : "phEn"] || "";
    return el.getAttribute(next === "ja" ? "content-ja" : "content-en") || "";
  };

  const applyLang = (next) => {
    all("[data-i18n]").forEach((el) => { el.style.display = el.dataset.i18n === next ? "" : "none"; });
    all(".nw-lang-switch button").forEach((btn) => { btn.classList.toggle("active", btn.dataset.lang === next); });
    all("[data-ph-ja][data-ph-en], [content-ja][content-en]").forEach((el) => { el.placeholder = placeholderText(el, next); });
    document.documentElement.lang = next;
    try { localStorage.setItem("nw_lang", next); } catch (_) {}
  };

  const initLang = () => {
    let current = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") current = saved;
    } catch (_) {}
    all(".nw-lang-switch button").forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(current);
  };

  const clear = (node) => { while (node.firstChild) node.removeChild(node.firstChild); };

  const addChecks = (out, t) => {
    out.push("", `■ ${t.section.before}`);
    t.checks.forEach((item) => out.push(`- ${item}`));
  };

  const fullText = (locale, data, tier, missingOpt) => {
    const t = L[locale];
    const out = [`${t.full} [${t.tier[tier]}]`, ""];
    const section = (title, keys) => {
      out.push(`■ ${title}`);
      if (tier === "short") {
        out.push(keys.map((key) => `${t.label[key]}: ${val(key, data, t)}`).join(" / "));
        out.push("");
        return;
      }
      keys.forEach((key) => {
        if (tier === "detailed") {
          out.push(`${t.label[key]}:`);
          linesOf(val(key, data, t)).forEach((item) => out.push(`- ${item}`));
        } else {
          out.push(`${t.label[key]}: ${val(key, data, t)}`);
        }
      });
      out.push("");
    };
    section(t.section.summary, ["projectType", "purpose", "audience", "tone"]);
    section(t.section.deliverables, ["deliverables"]);
    section(t.section.specs, ["size", "mustHave"]);
    section(t.section.timeline, ["deadline"]);
    section(t.section.budget, ["budget"]);
    section(t.section.references, ["references"]);
    section(t.section.constraints, ["avoid", "constraints"]);
    section(t.section.format, ["deliverablesFormat"]);
    section(t.section.revisions, ["revisions"]);
    section(t.section.contact, ["contact"]);
    if (missingOpt.length) {
      out.push(`■ ${t.section.missing}`);
      missingOpt.forEach((key) => out.push(`- ${t.label[key]}: ${t.mark.none}`));
    }
    addChecks(out, t);
    return out.join("\n").replace(/\n{3,}/g, "\n\n");
  };

  const keyText = (locale, data) => {
    const t = L[locale];
    const out = [t.key, "", `■ ${t.section.key}`];
    ["projectType", "purpose", "deliverables", "deadline", "budget", "references", "deliverablesFormat", "revisions", "contact"].forEach((key) => {
      out.push(`- ${t.label[key]}: ${val(key, data, t)}`);
    });
    addChecks(out, t);
    return out.join("\n");
  };

  const initTool = () => {
    initLang();

    const tier = $("outputTier");
    const field = Object.fromEntries(ids.map((id) => [id, $(id)]));
    const output = { jaFull: $("outputJa"), jaKey: $("outputJaKey"), enFull: $("outputEn"), enKey: $("outputEnKey") };
    const banner = $("readyBanner");
    const missingList = $("missingList");
    const recommend = $("recommendedFields");
    const toast = $("toast");
    let generated = false;

    const showToast = (message) => {
      if (!toast) return;
      toast.textContent = message;
      toast.classList.add("is-visible");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => toast.classList.remove("is-visible"), 2200);
    };

    const data = () => Object.fromEntries(ids.map((id) => [id, field[id].value.trim()]));
    const missingReq = (d) => req.filter(([id]) => !d[id]);
    const missingOpt = (d) => opt.filter((id) => !d[id]);

    const updateTierLabels = () => {
      const current = lang();
      tier.querySelectorAll("option").forEach((option) => {
        option.textContent = option.dataset[current === "ja" ? "labelJa" : "labelEn"] || option.textContent;
      });
    };

    const validate = () => {
      const current = lang();
      const d = data();
      const missing = missingReq(d);
      const ready = missing.length === 0;
      banner.querySelectorAll(".status-title [data-i18n]").forEach((node) => {
        const text = L[node.dataset.i18n].msg;
        node.textContent = ready ? text.readyTitle : text.missingTitle;
      });
      $("readyDetailJa").textContent = ready ? L.ja.msg.readyDetail : L.ja.msg.missingDetail;
      $("readyDetailEn").textContent = ready ? L.en.msg.readyDetail : L.en.msg.missingDetail;
      recommend.textContent = L[current].msg.recommended;
      banner.classList.toggle("ready", ready);
      banner.classList.toggle("not-ready", !ready);
      clear(missingList);
      missingList.classList.toggle("is-hidden", ready);
      missing.forEach(([id]) => {
        const item = document.createElement("li");
        item.textContent = L[current].label[id];
        missingList.appendChild(item);
      });
      req.forEach(([id, warn]) => {
        const node = $(warn);
        if (node) node.classList.toggle("is-hidden", !!d[id]);
      });
      return { d, missing, optMissing: missingOpt(d) };
    };

    const render = () => {
      const checked = validate();
      updateTierLabels();
      if (checked.missing.length) return false;
      output.jaFull.textContent = fullText("ja", checked.d, tier.value, checked.optMissing);
      output.jaKey.textContent = keyText("ja", checked.d);
      output.enFull.textContent = fullText("en", checked.d, tier.value, checked.optMissing);
      output.enKey.textContent = keyText("en", checked.d);
      generated = true;
      return true;
    };

    const canUseOutput = () => {
      const current = lang();
      const checked = validate();
      if (checked.missing.length) {
        showToast(L[current].msg.fillRequired);
        return false;
      }
      if (!generated) {
        showToast(L[current].msg.generateFirst);
        return false;
      }
      return true;
    };

    const copyOutput = async (node) => {
      if (!canUseOutput()) return;
      const ok = await copyText(node.textContent.trim());
      showToast(ok ? L[lang()].msg.copied : L[lang()].msg.copyFailed);
    };

    const saveOutput = (locale, node) => {
      if (!canUseOutput()) return;
      saveText(`design-request-${locale}-${tier.value}.txt`, node.textContent.trim());
      showToast(L[lang()].msg.downloaded);
    };

    $("btnBuild").addEventListener("click", () => { if (!render()) showToast(L[lang()].msg.fillRequired); });
    [tier, ...Object.values(field)].forEach((node) => {
      const update = debounce(() => { validate(); if (generated) render(); });
      node.addEventListener("input", update);
      node.addEventListener("change", update);
    });
    $("btnCopyJaFull").addEventListener("click", () => copyOutput(output.jaFull));
    $("btnCopyJaKey").addEventListener("click", () => copyOutput(output.jaKey));
    $("btnCopyEnFull").addEventListener("click", () => copyOutput(output.enFull));
    $("btnCopyEnKey").addEventListener("click", () => copyOutput(output.enKey));
    $("btnDownloadJa").addEventListener("click", () => saveOutput("ja", output.jaFull));
    $("btnDownloadEn").addEventListener("click", () => saveOutput("en", output.enFull));

    new MutationObserver(() => { updateTierLabels(); validate(); if (generated) render(); }).observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

    output.jaFull.textContent = L.ja.msg.initial;
    output.jaKey.textContent = L.ja.msg.initial;
    output.enFull.textContent = L.en.msg.initial;
    output.enKey.textContent = L.en.msg.initial;
    updateTierLabels();
    validate();
  };

  document.addEventListener("DOMContentLoaded", initTool);
})();
