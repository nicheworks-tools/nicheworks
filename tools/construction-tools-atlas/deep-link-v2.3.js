(() => {
  "use strict";

  const ENTRY_PARAM = "entry";
  const TOOL_PATH = "/tools/construction-tools-atlas/";
  const byId = new Map();
  let directOpening = false;
  let closingFromHistory = false;
  let currentId = "";

  const $ = (selector, root = document) => root.querySelector(selector);
  const text = (value) => typeof value === "string" ? value.trim() : "";
  const pair = (obj, ja, en) => ({ ja: text(obj?.ja) || text(ja), en: text(obj?.en) || text(en) });

  function normalize(raw) {
    const summary = pair(raw?.summary, raw?.summary_ja || raw?.description_ja, raw?.summary_en || raw?.description_en);
    return {
      id: text(raw?.id || raw?.slug),
      term: pair(raw?.term, raw?.ja || raw?.jp, raw?.en),
      summary
    };
  }

  function baseUrl() {
    const url = new URL(window.location.href);
    url.pathname = TOOL_PATH;
    url.search = "";
    url.hash = "";
    return url;
  }

  function entryUrl(id) {
    const url = baseUrl();
    url.searchParams.set(ENTRY_PARAM, id);
    return url.toString();
  }

  function requestedEntryId() {
    return new URL(window.location.href).searchParams.get(ENTRY_PARAM) || "";
  }

  function selectedId() {
    const selected = $("#resultList .row--selected[data-entry-id]");
    if (selected?.dataset.entryId) return selected.dataset.entryId;
    return currentId || requestedEntryId();
  }

  function sleep(ms = 0) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function dispatchInput(input) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
  }

  function rowFor(entry) {
    const expected = `${entry.term.en || "—"} / ${entry.term.ja || "—"}`;
    return Array.from(document.querySelectorAll("#resultList .row")).find((row) => {
      const title = row.querySelector(".row__title")?.textContent?.trim() || "";
      return title === expected || (entry.term.ja && entry.term.en && title.includes(entry.term.ja) && title.includes(entry.term.en));
    }) || null;
  }

  async function exposeEntryToRuntime(entry) {
    const input = $("#searchInput");
    if (!input) return null;
    const original = input.value || "";
    const lookup = entry.term.en || entry.term.ja || entry.id;
    input.value = lookup;
    dispatchInput(input);
    await sleep(40);
    let row = rowFor(entry);

    if (!row) {
      $("#filterResetBtn")?.click();
      input.value = lookup;
      dispatchInput(input);
      await sleep(40);
      row = rowFor(entry);
    }

    if (!row) {
      input.value = original;
      dispatchInput(input);
      return null;
    }

    row.click();
    await sleep(20);
    input.value = original;
    dispatchInput(input);
    return row;
  }

  function showInvalidEntryMessage(id) {
    const hint = $("#hintText");
    if (!hint) return;
    hint.textContent = document.documentElement.lang === "en"
      ? `Entry not found: ${id}`
      : `項目が見つかりません: ${id}`;
  }

  function ensureShareUi() {
    const star = $("#detailStar");
    if (!star?.parentNode) return;
    if ($("#detailHeaderActions")) return;
    const group = document.createElement("div");
    group.id = "detailHeaderActions";
    group.className = "detailHeaderActions";
    const share = document.createElement("button");
    share.id = "detailShare";
    share.type = "button";
    share.className = "pillbtn detailShareBtn";
    share.addEventListener("click", async (event) => {
      event.stopPropagation();
      await shareCurrentEntry();
    });
    star.parentNode.insertBefore(group, star);
    group.appendChild(share);
    group.appendChild(star);
    updateShareLabel();
  }

  function updateShareLabel(copied = false) {
    const button = $("#detailShare");
    if (!button) return;
    if (copied) {
      button.textContent = document.documentElement.lang === "en" ? "Copied" : "コピー済み";
      return;
    }
    button.textContent = document.documentElement.lang === "en" ? "Share" : "共有";
  }

  function sharePayload(id) {
    const entry = byId.get(id);
    if (!entry) return null;
    const lang = document.documentElement.lang === "en" ? "en" : "ja";
    const name = entry.term[lang] || entry.term.ja || entry.term.en || id;
    const atlasName = lang === "en" ? "Construction Tools Atlas" : "建設工具・現場用語辞典";
    const summary = entry.summary[lang] || entry.summary.ja || entry.summary.en || "";
    return {
      title: `${name} | ${atlasName}`,
      text: summary,
      url: entryUrl(id)
    };
  }

  async function shareCurrentEntry() {
    const id = selectedId() || currentId;
    const payload = sharePayload(id);
    if (!payload) return false;
    if (navigator.share) {
      try {
        await navigator.share(payload);
        return true;
      } catch (error) {
        if (error?.name === "AbortError") return false;
      }
    }
    try {
      await navigator.clipboard.writeText(payload.url);
      updateShareLabel(true);
      window.setTimeout(() => updateShareLabel(false), 1400);
      return true;
    } catch (_) {
      return false;
    }
  }

  function pushEntryState(id) {
    const current = requestedEntryId();
    if (current === id && history.state?.ctaEntry === id) return;
    history.pushState({ ctaEntry: id }, "", entryUrl(id));
  }

  function prepareInitialEntryState(id) {
    history.replaceState({ ctaAtlasBase: true }, "", baseUrl().toString());
    history.pushState({ ctaEntry: id }, "", entryUrl(id));
  }

  async function openEntry(id, options = {}) {
    const entry = byId.get(id);
    if (!entry) {
      history.replaceState({ ctaAtlasBase: true }, "", baseUrl().toString());
      showInvalidEntryMessage(id);
      return false;
    }

    directOpening = true;
    const row = await exposeEntryToRuntime(entry);
    directOpening = false;
    if (!row) {
      showInvalidEntryMessage(id);
      return false;
    }

    currentId = id;
    ensureShareUi();
    updateShareLabel();
    if (!options.historyPrepared && !options.fromPopState) pushEntryState(id);
    window.dispatchEvent(new CustomEvent("cta:entry-open", { detail: { id, source: options.source || "runtime" } }));
    return true;
  }

  function closeForPopState() {
    closingFromHistory = true;
    const close = $("#detailClose");
    if (close && !$("#detailSheet")?.hidden) close.click();
    currentId = "";
    window.setTimeout(() => { closingFromHistory = false; }, 0);
  }

  function bindSelectionHistory() {
    document.addEventListener("click", (event) => {
      if (event.target.closest("#detailShare")) return;
      const row = event.target.closest("#resultList .row");
      if (row) {
        window.setTimeout(() => {
          const id = selectedId();
          if (!id) return;
          currentId = id;
          ensureShareUi();
          updateShareLabel();
          if (!directOpening) pushEntryState(id);
        }, 0);
      }
    }, true);

    $("#detailClose")?.addEventListener("click", () => {
      if (closingFromHistory) return;
      if (history.state?.ctaEntry || requestedEntryId()) history.back();
      else history.replaceState({ ctaAtlasBase: true }, "", baseUrl().toString());
      currentId = "";
    });

    window.addEventListener("popstate", async () => {
      const id = requestedEntryId();
      if (!id) {
        closeForPopState();
        return;
      }
      if (byId.has(id)) await openEntry(id, { fromPopState: true, source: "history" });
      else {
        showInvalidEntryMessage(id);
        closeForPopState();
      }
    });

    window.addEventListener("cta:language-mode", () => updateShareLabel());
  }

  async function loadEntries() {
    const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
    if (!Array.isArray(raw)) return;
    raw.map(normalize).forEach((entry) => {
      if (entry.id && !byId.has(entry.id)) byId.set(entry.id, entry);
    });
  }

  async function init() {
    ensureShareUi();
    bindSelectionHistory();
    try {
      await loadEntries();
      const id = requestedEntryId();
      if (id) {
        if (byId.has(id)) {
          prepareInitialEntryState(id);
          await openEntry(id, { historyPrepared: true, source: "deep-link" });
        } else {
          history.replaceState({ ctaAtlasBase: true }, "", baseUrl().toString());
          showInvalidEntryMessage(id);
        }
      } else if (!history.state) {
        history.replaceState({ ctaAtlasBase: true }, "", baseUrl().toString());
      }
    } catch (error) {
      console.warn("CTA deep-link controller unavailable", error);
    }

    window.CTA_DEEP_LINK = Object.freeze({
      version: "2.3",
      entryUrl,
      openEntry,
      shareCurrentEntry,
      getCurrentId: () => selectedId() || currentId
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
