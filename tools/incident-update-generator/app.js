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

  const STATUS_MAP = {
    Investigating: { ja: "調査中", en: "Investigating" },
    Identified: { ja: "原因特定", en: "Identified" },
    Monitoring: { ja: "監視中", en: "Monitoring" },
    Resolved: { ja: "解消済み", en: "Resolved" },
  };

  const LABELS = {
    ja: {
      status: "現在ステータス",
      start: "発生時刻",
      impact: "影響",
      components: "影響コンポーネント",
      actions: "実施対応",
      nextUpdate: "次回更新",
    },
    en: {
      status: "Current status",
      start: "Start time",
      impact: "Impact",
      components: "Affected components",
      actions: "Actions taken",
      nextUpdate: "Next update",
    },
  };

  const getDefaults = (lang) => ({
    service: lang === "ja" ? "対象サービス" : "the service",
    start: lang === "ja" ? "発生時刻" : "start time",
    impact: lang === "ja" ? "影響範囲" : "impact scope",
    components: lang === "ja" ? "影響コンポーネント" : "affected components",
    mitigation: lang === "ja" ? "対応内容" : "mitigation details",
    nextUpdate: lang === "ja" ? "次回更新予定" : "next update time",
  });

  const getTimelineData = (lang) => {
    const defaults = getDefaults(lang);
    return {
      service: getValue("service") || defaults.service,
      start: getValue("startTime") || defaults.start,
      impact: getValue("impact") || defaults.impact,
      components: getValue("components") || defaults.components,
      mitigation: getValue("mitigation") || defaults.mitigation,
      nextUpdate: getValue("nextUpdate") || defaults.nextUpdate,
    };
  };

  const buildMessage = ({ lang, audience, tone, statusKey, timeline }) => {
    const status = STATUS_MAP[statusKey] ? STATUS_MAP[statusKey][lang] : statusKey;
    const labels = LABELS[lang];
    const titleMap = {
      customer: { ja: "顧客向け", en: "Customer" },
      internal: { ja: "社内向け", en: "Internal" },
      social: { ja: "SNS向け", en: "Social" },
    };
    const toneMap = {
      short: { ja: "短文", en: "Short" },
      standard: { ja: "標準", en: "Standard" },
      polite: { ja: "丁寧", en: "Polite" },
    };

    const header = lang === "ja"
      ? `【${titleMap[audience].ja} / ${toneMap[tone].ja} / ${status}】`
      : `[${titleMap[audience].en} / ${toneMap[tone].en} / ${status}]`;

    const summaryLines = {
      customer: {
        ja: {
          short: `${timeline.service}で障害を確認しました。現在${status}です。`,
          standard: `${timeline.service}で障害が発生しています。現在${status}です。`,
          polite: `${timeline.service}で障害が発生しております。現在${status}です。`,
        },
        en: {
          short: `We are aware of an issue with ${timeline.service}. Status: ${status}.`,
          standard: `We are experiencing an incident with ${timeline.service}. Current status: ${status}.`,
          polite: `We are experiencing an incident with ${timeline.service}. Current status: ${status}.`,
        },
      },
      internal: {
        ja: {
          short: `${timeline.service}で障害。現在${status}。`,
          standard: `${timeline.service}で障害が発生。現在${status}です。`,
          polite: `${timeline.service}で障害が発生しています。現在${status}です。`,
        },
        en: {
          short: `${timeline.service} incident ongoing. Status: ${status}.`,
          standard: `Incident affecting ${timeline.service}. Current status: ${status}.`,
          polite: `Incident affecting ${timeline.service}. Current status: ${status}.`,
        },
      },
      social: {
        ja: {
          short: `${timeline.service}で障害が発生しています。現在${status}です。`,
          standard: `${timeline.service}で障害が発生しています。現在${status}です。`,
          polite: `${timeline.service}で障害が発生しております。現在${status}です。`,
        },
        en: {
          short: `We are investigating an issue with ${timeline.service}. Status: ${status}.`,
          standard: `We are investigating an issue with ${timeline.service}. Status: ${status}.`,
          polite: `We are investigating an issue with ${timeline.service}. Status: ${status}.`,
        },
      },
    };

    const summary = summaryLines[audience][lang][tone];

    const detailLines = [
      `${labels.status}: ${status}`,
      `${labels.start}: ${timeline.start}`,
      `${labels.impact}: ${timeline.impact}`,
      `${labels.components}: ${timeline.components}`,
      `${labels.actions}: ${timeline.mitigation}`,
      `${labels.nextUpdate}: ${timeline.nextUpdate}`,
    ];

    return [header, summary, "", ...detailLines].join("\n");
  };

  const initTool = () => {
    const root = document.getElementById("toolRoot");
    root.innerHTML = `
      <div class="field">
        <label class="label">
          <span data-i18n="ja">サービス名</span>
          <span data-i18n="en" style="display:none;">Service name</span>
        </label>
        <input id="service" class="input js-input" type="text" placeholder="例: API / Webアプリ" />
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">現在ステータス</span>
          <span data-i18n="en" style="display:none;">Current status</span>
        </label>
        <select id="status" class="select js-input">
          <option value="Investigating">Investigating</option>
          <option value="Identified">Identified</option>
          <option value="Monitoring">Monitoring</option>
          <option value="Resolved">Resolved</option>
        </select>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">トーン</span>
          <span data-i18n="en" style="display:none;">Tone</span>
        </label>
        <select id="tone" class="select js-input">
          <option value="short">Short</option>
          <option value="standard" selected>Standard</option>
          <option value="polite">Polite</option>
        </select>
      </div>
      <div class="field">
        <label class="label">
          <span data-i18n="ja">ダウンロード対象</span>
          <span data-i18n="en" style="display:none;">Download audience</span>
        </label>
        <select id="audience" class="select js-input">
          <option value="customer">Customer</option>
          <option value="internal">Internal</option>
          <option value="social">Social</option>
        </select>
      </div>

      <div class="field field-block">
        <div class="block-title" data-i18n="ja">タイムライン入力</div>
        <div class="block-title" data-i18n="en" style="display:none;">Timeline details</div>
        <div class="field">
          <label class="label">
            <span data-i18n="ja">発生時刻</span>
            <span data-i18n="en" style="display:none;">Start time</span>
          </label>
          <input id="startTime" class="input js-input" type="text" placeholder="例: 2024-05-01 10:05" />
        </div>
        <div class="field">
          <label class="label">
            <span data-i18n="ja">影響範囲</span>
            <span data-i18n="en" style="display:none;">Impact</span>
          </label>
          <input id="impact" class="input js-input" type="text" placeholder="例: 一部ユーザーでログイン不可" />
        </div>
        <div class="field">
          <label class="label">
            <span data-i18n="ja">影響コンポーネント</span>
            <span data-i18n="en" style="display:none;">Affected components</span>
          </label>
          <input id="components" class="input js-input" type="text" placeholder="例: 認証API, Web UI" />
        </div>
        <div class="field">
          <label class="label">
            <span data-i18n="ja">対応内容 (実施した対策)</span>
            <span data-i18n="en" style="display:none;">Mitigation (actions taken)</span>
          </label>
          <input id="mitigation" class="input js-input" type="text" placeholder="例: ロールバックを実施" />
        </div>
        <div class="field">
          <label class="label">
            <span data-i18n="ja">次回更新予定</span>
            <span data-i18n="en" style="display:none;">Next update time</span>
          </label>
          <input id="nextUpdate" class="input js-input" type="text" placeholder="例: 2024-05-01 12:00" />
        </div>
      </div>

      <div class="row" style="margin-top:12px;">
        <button class="btn primary" id="generateBtn" type="button">
          <span data-i18n="ja">更新文を生成</span>
          <span data-i18n="en" style="display:none;">Generate updates</span>
        </button>
        <button class="btn" id="downloadBtn" type="button">
          <span data-i18n="ja">選択した対象を .txt で保存</span>
          <span data-i18n="en" style="display:none;">Download selected (.txt)</span>
        </button>
      </div>

      <div class="field">
        <label class="label">
          <span data-i18n="ja">出力</span>
          <span data-i18n="en" style="display:none;">Outputs</span>
        </label>
        <div class="output-grid">
          <div class="output-card" data-audience="customer">
            <div class="output-head">
              <div class="output-title">Customer</div>
              <button class="btn btn-sm" data-copy="customer" type="button">
                <span data-i18n="ja">コピー</span>
                <span data-i18n="en" style="display:none;">Copy</span>
              </button>
            </div>
            <pre id="outputCustomerJa" class="out" data-i18n="ja"></pre>
            <pre id="outputCustomerEn" class="out" data-i18n="en" style="display:none;"></pre>
          </div>
          <div class="output-card" data-audience="internal">
            <div class="output-head">
              <div class="output-title">Internal</div>
              <button class="btn btn-sm" data-copy="internal" type="button">
                <span data-i18n="ja">コピー</span>
                <span data-i18n="en" style="display:none;">Copy</span>
              </button>
            </div>
            <pre id="outputInternalJa" class="out" data-i18n="ja"></pre>
            <pre id="outputInternalEn" class="out" data-i18n="en" style="display:none;"></pre>
          </div>
          <div class="output-card" data-audience="social">
            <div class="output-head">
              <div class="output-title">Social</div>
              <button class="btn btn-sm" data-copy="social" type="button">
                <span data-i18n="ja">コピー</span>
                <span data-i18n="en" style="display:none;">Copy</span>
              </button>
            </div>
            <pre id="outputSocialJa" class="out" data-i18n="ja"></pre>
            <pre id="outputSocialEn" class="out" data-i18n="en" style="display:none;"></pre>
          </div>
        </div>
      </div>
    `;

    const outputNodes = {
      customer: {
        ja: document.getElementById("outputCustomerJa"),
        en: document.getElementById("outputCustomerEn"),
      },
      internal: {
        ja: document.getElementById("outputInternalJa"),
        en: document.getElementById("outputInternalEn"),
      },
      social: {
        ja: document.getElementById("outputSocialJa"),
        en: document.getElementById("outputSocialEn"),
      },
    };

    const updateAudienceFocus = () => {
      const selected = getValue("audience") || "customer";
      document.querySelectorAll(".output-card").forEach((card) => {
        card.classList.toggle("is-selected", card.dataset.audience === selected);
      });
    };

    const refresh = () => {
      const statusKey = getValue("status") || "Investigating";
      const tone = getValue("tone") || "standard";
      const timelineJa = getTimelineData("ja");
      const timelineEn = getTimelineData("en");

      ["customer", "internal", "social"].forEach((audience) => {
        outputNodes[audience].ja.textContent = buildMessage({
          lang: "ja",
          audience,
          tone,
          statusKey,
          timeline: timelineJa,
        });
        outputNodes[audience].en.textContent = buildMessage({
          lang: "en",
          audience,
          tone,
          statusKey,
          timeline: timelineEn,
        });
      });
      updateAudienceFocus();
    };

    const debouncedRefresh = window.NW.debounce(refresh, 120);
    document.querySelectorAll(".js-input").forEach((el) => {
      el.addEventListener("input", debouncedRefresh);
      el.addEventListener("change", refresh);
    });

    document.getElementById("generateBtn").addEventListener("click", refresh);

    document.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const audience = btn.dataset.copy;
        const lang = document.documentElement.lang === "ja" ? "ja" : "en";
        const text = outputNodes[audience][lang].textContent;
        await window.NW.copyToClipboard(text);
      });
    });

    document.getElementById("downloadBtn").addEventListener("click", () => {
      const audience = getValue("audience") || "customer";
      const lang = document.documentElement.lang === "ja" ? "ja" : "en";
      const text = outputNodes[audience][lang].textContent;
      window.NW.downloadText(`incident-update-${audience}-${lang}.txt`, text);
    });

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
