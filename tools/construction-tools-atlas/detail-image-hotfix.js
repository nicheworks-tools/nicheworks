(() => {
  "use strict";

  const MANIFEST_URL = "./data/image-pilots.json?v=20260513-asset-5";
  const state = {
    pilots: [],
    loaded: false,
    loading: null,
    lastSignature: ""
  };

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[（）()［］\[\]【】]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  function toPilot(row) {
    if (!Array.isArray(row) || row.length < 6) return null;
    const [keys, ja, en, src, caption_ja, caption_en] = row;
    if (!keys || !ja || !en || !src) return null;
    return {
      keys: String(keys).split("|").map((v) => v.trim()).filter(Boolean),
      ja: String(ja),
      en: String(en),
      src: String(src),
      caption_ja: String(caption_ja || ""),
      caption_en: String(caption_en || "")
    };
  }

  async function loadPilots() {
    if (state.loaded) return state.pilots;
    if (state.loading) return state.loading;
    state.loading = fetch(MANIFEST_URL, { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        const rows = Array.isArray(json?.items) ? json.items : [];
        state.pilots = rows.map(toPilot).filter(Boolean);
        state.loaded = true;
        return state.pilots;
      })
      .catch(() => {
        state.pilots = [];
        state.loaded = true;
        return state.pilots;
      });
    return state.loading;
  }

  function currentRaw() {
    const terms = document.getElementById("detailTerms");
    const title = terms?.querySelector(".termblock__title")?.textContent || "";
    const sub = terms?.querySelector(".termblock__sub")?.textContent || "";
    const aliases = document.getElementById("tabAliases")?.textContent || "";
    return `${title}\n${sub}\n${aliases}`;
  }

  function currentTokens() {
    return currentRaw()
      .split(/[\/\n,、]+/)
      .map(normalize)
      .filter(Boolean);
  }

  function matchPilot() {
    const tokens = new Set(currentTokens());
    if (!tokens.size) return null;
    return state.pilots.find((item) => item.keys.some((key) => tokens.has(normalize(key)))) || null;
  }

  function ensureSlot() {
    const terms = document.getElementById("detailTerms");
    if (!terms) return null;
    let slot = document.getElementById("detailImagePilot");
    if (!slot) {
      slot = document.createElement("figure");
      slot.id = "detailImagePilot";
      slot.className = "detailImagePilot";
      terms.insertAdjacentElement("afterend", slot);
    } else if (slot.previousElementSibling !== terms) {
      terms.insertAdjacentElement("afterend", slot);
    }
    return slot;
  }

  async function render(force = false) {
    const detail = document.getElementById("detailSheet");
    if (!detail || detail.hidden) return;

    await loadPilots();

    const raw = currentRaw();
    const signature = `${document.documentElement.lang || "ja"}::${raw}`;
    if (!force && signature === state.lastSignature) return;
    state.lastSignature = signature;

    const slot = ensureSlot();
    if (!slot) return;

    const item = matchPilot();
    if (!item || !item.src) {
      clear(slot);
      slot.hidden = true;
      return;
    }

    clear(slot);
    const current = lang();
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = current === "ja" ? item.ja : item.en;
    img.loading = "lazy";
    img.decoding = "async";
    img.addEventListener("error", () => {
      clear(slot);
      slot.hidden = true;
    }, { once: true });
    slot.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = current === "ja" ? item.caption_ja : item.caption_en;
    slot.appendChild(figcaption);
    slot.hidden = false;
  }

  function schedule(force = false) {
    window.clearTimeout(schedule.timer);
    schedule.timer = window.setTimeout(() => render(force), 80);
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadPilots().then(() => schedule(true));
    document.addEventListener("click", () => schedule(false), true);
    document.addEventListener("keydown", () => schedule(false), true);
    document.getElementById("langBtn")?.addEventListener("click", () => schedule(true));
  });
})();
