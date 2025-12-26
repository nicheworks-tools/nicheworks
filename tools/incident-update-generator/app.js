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

  const getValue = (id) => document.getElementById(id).value.trim();

  const buildUpdates = (lang) => {
    const service = getValue("service") || (lang === "ja" ? "対象サービス" : "the service");
    const impact = getValue("impact") || (lang === "ja" ? "影響範囲" : "impact scope");
    const start = getValue("startTime") || (lang === "ja" ? "発生時刻" : "start time");
    const statusKey = getValue("status") || "Investigating";
    const statusMap = {
      Investigating: { ja: "調査中", en: "Investigating" },
      Identified: { ja: "原因特定", en: "Identified" },
      Monitoring: { ja: "監視中", en: "Monitoring" },
      Resolved: { ja: "解消済み", en: "Resolved" },
    };
    const status = statusMap[statusKey] ? statusMap[statusKey][lang] : statusKey;
    const nextUpdate = getValue("nextUpdate") || (lang === "ja" ? "次回更新" : "next update time");
    const contact = getValue("contact") || (lang === "ja" ? "連絡先" : "contact info");

    if (lang === "ja") {
      return [
        `【Investigating】\n${service}で障害を検知しました。現在調査中です。\n影響: ${impact}\n発生: ${start}\n次回更新: ${nextUpdate}`,
        `【Identified】\n原因を特定しました。対応を進めています。\n影響: ${impact}\n発生: ${start}\n次回更新: ${nextUpdate}`,
        `【Monitoring】\n修正を適用しました。現在モニタリング中です。\n影響: ${impact}\n発生: ${start}\n次回更新: ${nextUpdate}`,
        `【Resolved】\n${service}の障害は解消しました。ご迷惑をおかけしました。\n影響: ${impact}\n発生: ${start}\n連絡先: ${contact}`,
        "",
        `現在ステータス: ${status}`,
      ].join("\n\n");
    }

    return [
      `[Investigating]\nWe detected an issue with ${service} and are investigating.\nImpact: ${impact}\nStart: ${start}\nNext update: ${nextUpdate}`,
      `[Identified]\nWe have identified the cause and are working on a fix.\nImpact: ${impact}\nStart: ${start}\nNext update: ${nextUpdate}`,
      `[Monitoring]\nA fix has been deployed and we are monitoring the results.\nImpact: ${impact}\nStart: ${start}\nNext update: ${nextUpdate}`,
      `[Resolved]\nThe incident affecting ${service} has been resolved.\nImpact: ${impact}\nStart: ${start}\nContact: ${contact}`,
      "",
      `Current status: ${status}`,
    ].join("\n\n");
  };

  const formatTimeline = (lang, raw) => {
    const rows = raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    if (!rows.length) {
      return lang === "ja" ? "- 例: 10:05 影響検知" : "- e.g. 10:05 Issue detected";
    }
    return rows.map((line) => `- ${line}`).join("\n");
  };

  const buildPostmortem = (lang) => {
    if (lang === "ja") {
      return [
        "【ポストモーテム】",
        "概要: ",
        "原因: ",
        "影響: ",
        "検知方法: ",
        "対応: ",
        "再発防止策: ",
        "",
        "【タイムライン】",
      ].join("\n");
    }
    return [
      "[Postmortem]",
      "Summary: ",
      "Root cause: ",
      "Impact: ",
      "Detection: ",
      "Mitigation: ",
      "Prevention: ",
      "",
      "[Timeline]",
    ].join("\n");
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">サービス名</span>
          <span data-i18n="en" style="display:none;">Service name</span>
        </label>
        <input id="service" class="input" type="text" placeholder="例: API / Webアプリ" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">影響範囲</span>
          <span data-i18n="en" style="display:none;">Impact</span>
        </label>
        <input id="impact" class="input" type="text" placeholder="例: 一部ユーザーでログイン不可" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">発生時刻</span>
          <span data-i18n="en" style="display:none;">Start time</span>
        </label>
        <input id="startTime" class="input" type="text" placeholder="例: 2024-05-01 10:05" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">現在ステータス</span>
          <span data-i18n="en" style="display:none;">Current status</span>
        </label>
        <select id="status" class="select">
          <option value="Investigating">Investigating</option>
          <option value="Identified">Identified</option>
          <option value="Monitoring">Monitoring</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">次回更新予定</span>
          <span data-i18n="en" style="display:none;">Next update</span>
        </label>
        <input id="nextUpdate" class="input" type="text" placeholder="例: 2024-05-01 12:00" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">連絡先 (任意)</span>
          <span data-i18n="en" style="display:none;">Contact (optional)</span>
        </label>
        <input id="contact" class="input" type="text" placeholder="例: support@example.com" />
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">更新文を生成</span>
          <span data-i18n="en" style="display:none;">Generate updates</span>
        </button>
        <button class="btn" id="copyBtn" type="button">
          <span data-i18n="ja">コピー</span>
          <span data-i18n="en" style="display:none;">Copy</span>
        </button>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">出力</span>
          <span data-i18n="en" style="display:none;">Output</span>
        </label>
        <pre id="outputJa" class="out" data-i18n="ja"></pre>
        <pre id="outputEn" class="out" data-i18n="en" style="display:none;"></pre>
      </div>

      <hr class="hr" />

      <div class="field">
        <label class="label">
          <span data-i18n="ja">タイムライン入力 (Pro)</span>
          <span data-i18n="en" style="display:none;">Timeline input (Pro)</span>
        </label>
        <textarea id="timeline" class="textarea" placeholder="10:05 影響検知\n10:20 原因特定\n10:40 修正適用"></textarea>
        <div id="proNotice" class="nw-note" style="display:none;">
          <span data-i18n="ja">Pro機能です。無料でも更新文は利用できます。</span>
          <span data-i18n="en" style="display:none;">Pro feature. Updates are available for free.</span>
        </div>
      </div>

      <div class="row">
        <button class="btn" id="timelineBtn" type="button">
          <span data-i18n="ja">タイムライン整形</span>
          <span data-i18n="en" style="display:none;">Format timeline</span>
        </button>
        <button class="btn" id="postmortemBtn" type="button">
          <span data-i18n="ja">ポストモーテム生成</span>
          <span data-i18n="en" style="display:none;">Generate postmortem</span>
        </button>
        <button class="btn" id="exportBtn" type="button">
          <span data-i18n="ja">Markdown出力</span>
          <span data-i18n="en" style="display:none;">Export Markdown</span>
        </button>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">Pro出力</span>
          <span data-i18n="en" style="display:none;">Pro output</span>
        </label>
        <pre id="proOutputJa" class="out" data-i18n="ja"></pre>
        <pre id="proOutputEn" class="out" data-i18n="en" style="display:none;"></pre>
      </div>
    `;

    const outputJa = document.getElementById("outputJa");
    const outputEn = document.getElementById("outputEn");
    const proOutputJa = document.getElementById("proOutputJa");
    const proOutputEn = document.getElementById("proOutputEn");
    const hasPro = window.NW.hasPro();

    const refresh = () => {
      outputJa.textContent = buildUpdates("ja");
      outputEn.textContent = buildUpdates("en");
    };

    document.getElementById("generateBtn").addEventListener("click", refresh);
    document.getElementById("copyBtn").addEventListener("click", async () => {
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      await window.NW.copyToClipboard(text);
    });

    document.getElementById("timelineBtn").addEventListener("click", () => {
      if (!hasPro) return;
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const raw = document.getElementById("timeline").value;
      const formatted = formatTimeline(lang, raw);
      proOutputJa.textContent = `${buildPostmortem("ja")}\n${formatted}`;
      proOutputEn.textContent = `${buildPostmortem("en")}\n${formatTimeline("en", raw)}`;
    });

    document.getElementById("postmortemBtn").addEventListener("click", () => {
      if (!hasPro) return;
      proOutputJa.textContent = buildPostmortem("ja");
      proOutputEn.textContent = buildPostmortem("en");
    });

    document.getElementById("exportBtn").addEventListener("click", () => {
      if (!hasPro) return;
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const base = lang === "ja" ? outputJa.textContent : outputEn.textContent;
      const pro = lang === "ja" ? proOutputJa.textContent : proOutputEn.textContent;
      const text = `${base}\n\n${pro}`.trim();
      window.NW.downloadText(`incident-update-${lang}.md`, text);
    });

    if (!hasPro) {
      document.getElementById("proNotice").style.display = "";
      document.getElementById("timelineBtn").disabled = true;
      document.getElementById("postmortemBtn").disabled = true;
      document.getElementById("exportBtn").disabled = true;
      proOutputJa.textContent = "(Pro機能)";
      proOutputEn.textContent = "(Pro feature)";
    } else {
      proOutputJa.textContent = buildPostmortem("ja");
      proOutputEn.textContent = buildPostmortem("en");
    }

    refresh();
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    initTool();
  });
})();
