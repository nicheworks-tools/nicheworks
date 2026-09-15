(() => {
  "use strict";

  const ENTRY_PARAM = "entry";
  const TOOL_PATH = "/tools/construction-tools-atlas/";
  const byId = new Map();
  let currentId = "";
  let openingDirect = false;

  const $ = (selector, root = document) => root.querySelector(selector);
  const text = (value) => typeof value === "string" ? value.trim() : "";

  function resolveId(id) {
    return window.CTA_DATA_LOADER?.resolveCanonicalId?.(id) || text(id);
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
    url.searchParams.set(ENTRY_PARAM, resolveId(id));
    return url.toString();
  }

  function requestedEntryId() {
    return new URL(window.location.href).searchParams.get(ENTRY_PARAM) || "";
  }

  function canonicalizeRequestedUrl() {
    const raw = requestedEntryId();
    if (!raw) return "";
    const canonical = resolveId(raw);
    if (canonical && canonical !== raw) {
      history.replaceState({ ctaEntry: canonical, redirectedFrom: raw }, "", entryUrl(canonical));
    }
    return canonical || raw;
  }

  function normalize(raw) {
    const term = raw?.term || {};
    const summary = raw?.summary || {};
    return {
      id: text(raw?.id || raw?.slug),
      term: {
        ja: text(term.ja || raw?.ja || raw?.jp),
        en: text(term.en || raw?.en)
      },
      summary: {
        ja: text(summary.ja || raw?.summary_ja || raw?.description_ja),
        en: text(summary.en || raw?.summary_en || raw?.description_en)
      }
    };
  }

  function rowFor(id) {
    return Array.from(document.querySelectorAll("#resultList .row")).find((row) => row.dataset.entryId === id) || null;
  }

  function sleep(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  async function waitForRow(id) {
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const row = rowFor(id);
      if (row) return row;
      await sleep(50);
    }
    return null;
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
    if (!star?.parentNode || $("#detailShare")) return;
    const share = document.createElement("button");
    share.id = "detailShare";
    share.type = "button";
    share.className = "pillbtn detailShareBtn";
    share.textContent = document.documentElement.lang === "en" ? "Share" : "共有";
    share.addEventListener("click", async (event) => {
      event.stopPropagation();
      await shareCurrentEntry();
    });
    star.parentNode.insertBefore(share, star);
  }

  function updateShareLabel(copied = false) {
    const button = $("#detailShare");
    if (!button) return;
    if (copied) button.textContent = document.documentElement.lang === "en" ? "Copied" : "コピー済み";
    else button.textContent = document.documentElement.lang === "en" ? "Share" : "共有";
  }

  function sharePayload(id) {
    const canonical = resolveId(id);
    const entry = byId.get(canonical);
    if (!entry) return null;
    const lang = document.documentElement.lang === "en" ? "en" : "ja";
    const name = entry.term[lang] || entry.term.ja || entry.term.en || canonical;
    const atlasName = lang === "en" ? "Construction Tools Atlas" : "建設工具・現場用語辞典";
    return {
      title: `${name} | ${atlasName}`,
      text: entry.summary[lang] || entry.summary.ja || entry.summary.en || "",
      url: entryUrl(canonical)
    };
  }

  async function shareCurrentEntry() {
    const payload = sharePayload(currentId || requestedEntryId());
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

  function setEntryUrl(id, mode = "push") {
    const canonical = resolveId(id);
    if (!canonical) return;
    const url = entryUrl(canonical);
    const state = { ctaEntry: canonical };
    if (mode === "replace") history.replaceState(state, "", url);
    else if (requestedEntryId() !== canonical) history.pushState(state, "", url);
  }

  async function openEntry(id, options = {}) {
    const canonical = resolveId(id);
    if (!canonical || !byId.has(canonical)) {
      showInvalidEntryMessage(id);
      return false;
    }
    const row = await waitForRow(canonical);
    if (!row) {
      showInvalidEntryMessage(canonical);
      return false;
    }
    openingDirect = true;
    row.click();
    openingDirect = false;
    currentId = canonical;
    ensureShareUi();
    updateShareLabel();
    if (!options.keepHistory) setEntryUrl(canonical, options.replace ? "replace" : "push");
    return true;
  }

  function bindRuntimeHistory() {
    document.addEventListener("click", (event) => {
      const row = event.target.closest?.("#resultList .row");
      if (!row?.dataset.entryId) return;
      const id = resolveId(row.dataset.entryId);
      currentId = id;
      ensureShareUi();
      updateShareLabel();
      if (!openingDirect) setEntryUrl(id, "push");
    }, true);

    $("#detailClose")?.addEventListener("click", () => {
      currentId = "";
      if (requestedEntryId()) history.replaceState({ ctaAtlasBase: true }, "", baseUrl().toString());
    });

    $("#langBtn")?.addEventListener("click", () => window.setTimeout(() => updateShareLabel(), 0));

    window.addEventListener("popstate", async () => {
      const raw = requestedEntryId();
      if (!raw) return;
      const canonical = resolveId(raw);
      if (canonical !== raw) history.replaceState({ ctaEntry: canonical, redirectedFrom: raw }, "", entryUrl(canonical));
      await openEntry(canonical, { keepHistory: true });
    });
  }

  function bindImportedFavoriteMigration() {
    $("#importFavsBtn")?.addEventListener("click", () => {
      window.setTimeout(() => {
        try {
          const raw = window.localStorage?.getItem?.("cta_favs");
          if (!raw) return;
          const ids = JSON.parse(raw);
          if (!Array.isArray(ids)) return;
          const migrated = window.CTA_DATA_LOADER?.resolveCanonicalIds?.(ids) || ids;
          if (JSON.stringify(ids) !== JSON.stringify(migrated)) {
            window.localStorage.setItem("cta_favs", JSON.stringify(migrated));
            window.location.reload();
          }
        } catch (_) {
          // Import compatibility is best effort.
        }
      }, 0);
    });
  }

  async function init() {
    ensureShareUi();
    bindRuntimeHistory();
    bindImportedFavoriteMigration();
    try {
      const raw = await window.CTA_DATA_LOADER?.loadEntries?.();
      if (!Array.isArray(raw)) return;
      raw.map(normalize).forEach((entry) => {
        if (entry.id && !byId.has(entry.id)) byId.set(entry.id, entry);
      });
      const requested = canonicalizeRequestedUrl();
      if (requested) await openEntry(requested, { keepHistory: true });
    } catch (error) {
      console.warn("CTA canonical deep-link runtime unavailable", error);
    }
    window.CTA_DEEP_LINK = Object.freeze({
      version: "2.3-canonical",
      entryUrl,
      openEntry,
      shareCurrentEntry,
      resolveCanonicalId: resolveId,
      getCurrentId: () => currentId || resolveId(requestedEntryId())
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();