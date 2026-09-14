(() => {
  "use strict";

  const REGISTRY_URL = "./data/image-registry-v2.3.json?v=20260914-wave2a-1";
  const MANIFEST_URLS = [
    "./data/image-pilots.json?v=20260513-asset-5",
    "./data/image-pilots-002.json?v=20260513-asset-6",
    "./data/image-pilots-003.json?v=20260513-asset-7",
    "./data/image-pilots-004.json?v=20260513-asset-8",
    "./data/image-pilots-005.json?v=20260513-asset-9",
    "./data/image-pilots-006.json?v=20260513-asset-10",
    "./data/image-pilots-007.json?v=20260513-asset-11",
    "./data/image-pilots-008.json?v=20260513-asset-12",
    "./data/image-pilots-009.json?v=20260513-asset-13",
    "./data/image-pilots-010.json?v=20260513-asset-14",
    "./data/image-pilots-011.json?v=20260513-asset-15",
    "./data/image-pilots-012.json?v=20260513-asset-16"
  ];

  const FORMAL_STATES = new Set(["reviewed", "verified"]);
  const state = {
    pilots: [],
    registry: new Map(),
    loaded: false,
    loading: null,
    lastSignature: "",
    lastSource: "none"
  };

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
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

  function toCanonical(item) {
    const id = text(item?.entry_id);
    const display = text(item?.primary?.display);
    if (!id || !display) return null;
    if (!FORMAL_STATES.has(item.image_state)) return null;
    if (item.subject_match !== "matched") return null;
    if (item.migration_state !== "promoted") return null;
    return {
      id,
      alt_ja: text(item.alt_ja),
      alt_en: text(item.alt_en),
      display,
      thumbnail: text(item?.primary?.thumbnail),
      source: item?.source && typeof item.source === "object" ? item.source : {}
    };
  }

  async function fetchManifest(url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const json = await res.json();
      return Array.isArray(json?.items) ? json.items : [];
    } catch (_) {
      return [];
    }
  }

  async function fetchRegistry() {
    try {
      const res = await fetch(REGISTRY_URL, { cache: "no-store" });
      if (!res.ok) return [];
      const json = await res.json();
      if (json?.schema !== "cta-image-registry-v2.3" || !Array.isArray(json.items)) return [];
      return json.items;
    } catch (_) {
      return [];
    }
  }

  function updateDiagnostics() {
    window.CTA_IMAGE_DIAGNOSTICS = {
      registry: REGISTRY_URL,
      registryPromoted: state.registry.size,
      manifests: MANIFEST_URLS.length,
      pilots: state.pilots.length,
      lastSource: state.lastSource
    };
  }

  async function loadAssets() {
    if (state.loaded) return state;
    if (state.loading) return state.loading;
    state.loading = Promise.all([
      fetchRegistry(),
      Promise.all(MANIFEST_URLS.map(fetchManifest))
    ]).then(([registryItems, groups]) => {
      state.registry = new Map(
        registryItems
          .map(toCanonical)
          .filter(Boolean)
          .map((item) => [item.id, item])
      );

      const seen = new Set();
      state.pilots = groups
        .flat()
        .map(toPilot)
        .filter(Boolean)
        .filter((pilot) => {
          const key = `${normalize(pilot.ja)}::${normalize(pilot.en)}::${pilot.src}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });
      state.loaded = true;
      updateDiagnostics();
      return state;
    }).catch(() => {
      state.registry = new Map();
      state.pilots = [];
      state.loaded = true;
      updateDiagnostics();
      return state;
    });
    return state.loading;
  }

  function currentEntryId() {
    try {
      const deepLinked = window.CTA_DEEP_LINK?.getCurrentId?.();
      if (text(deepLinked)) return text(deepLinked);
    } catch (_) {
      // Fall through to the canonical ID already rendered in the detail metadata.
    }
    const meta = document.getElementById("tabMeta")?.textContent || "";
    const found = meta.match(/id:\s*([^\n]+)/);
    return found ? found[1].trim() : "";
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

  function matchCanonical() {
    const id = currentEntryId();
    return id ? state.registry.get(id) || null : null;
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

  function appendCanonicalCaption(slot, item) {
    const source = item.source || {};
    const author = text(source.author);
    const attribution = text(source.attribution);
    const license = text(source.license);
    const sourcePage = text(source.source_page);
    const licenseUrl = text(source.license_url);
    if (!attribution && !author && !license && !sourcePage) return;

    const current = lang();
    const figcaption = document.createElement("figcaption");
    figcaption.append(`${current === "ja" ? "写真" : "Photo"}: ${attribution || author || "—"}`);
    if (licenseUrl || (license && !attribution.includes(license))) {
      figcaption.append(" · ");
      if (licenseUrl) {
        const licenseLink = document.createElement("a");
        licenseLink.href = licenseUrl;
        licenseLink.target = "_blank";
        licenseLink.rel = "noopener noreferrer license";
        licenseLink.textContent = current === "ja" ? "利用条件" : "license";
        figcaption.appendChild(licenseLink);
      } else {
        figcaption.append(license);
      }
    }
    if (sourcePage) {
      figcaption.append(" · ");
      const sourceLink = document.createElement("a");
      sourceLink.href = sourcePage;
      sourceLink.target = "_blank";
      sourceLink.rel = "noopener noreferrer";
      sourceLink.textContent = current === "ja" ? "出典" : "source";
      figcaption.appendChild(sourceLink);
    }
    figcaption.append(current === "ja" ? " · WebP派生（上記利用条件）" : " · WebP derivative (terms above)");
    slot.appendChild(figcaption);
  }

  function renderCanonical(slot, item) {
    clear(slot);
    const current = lang();
    const img = document.createElement("img");
    img.src = item.display;
    img.alt = current === "ja" ? item.alt_ja : item.alt_en;
    img.loading = "lazy";
    img.decoding = "async";
    img.dataset.imageSource = "canonical-registry";
    img.addEventListener("error", () => {
      clear(slot);
      slot.hidden = true;
      state.lastSource = "canonical-error";
      updateDiagnostics();
    }, { once: true });
    slot.appendChild(img);
    appendCanonicalCaption(slot, item);
    slot.hidden = false;
    state.lastSource = "canonical";
    updateDiagnostics();
  }

  function renderLegacy(slot, item) {
    clear(slot);
    const current = lang();
    const img = document.createElement("img");
    img.src = item.src;
    img.alt = current === "ja" ? item.ja : item.en;
    img.loading = "lazy";
    img.decoding = "async";
    img.dataset.imageSource = "legacy-svg-pilot";
    img.addEventListener("error", () => {
      clear(slot);
      slot.hidden = true;
      state.lastSource = "legacy-error";
      updateDiagnostics();
    }, { once: true });
    slot.appendChild(img);

    const figcaption = document.createElement("figcaption");
    figcaption.textContent = current === "ja" ? item.caption_ja : item.caption_en;
    slot.appendChild(figcaption);
    slot.hidden = false;
    state.lastSource = "legacy";
    updateDiagnostics();
  }

  async function render(force = false) {
    const detail = document.getElementById("detailSheet");
    if (!detail || detail.hidden) return;

    await loadAssets();

    const id = currentEntryId();
    const raw = currentRaw();
    const signature = `${document.documentElement.lang || "ja"}::${id}::${raw}`;
    if (!force && signature === state.lastSignature) return;
    state.lastSignature = signature;

    const slot = ensureSlot();
    if (!slot) return;

    // Canonical ID ownership is authoritative. A promoted registry item suppresses
    // the legacy label-based SVG path even if its raster file later fails to load.
    const canonical = matchCanonical();
    if (canonical) {
      renderCanonical(slot, canonical);
      return;
    }

    const legacy = matchPilot();
    if (legacy?.src) {
      renderLegacy(slot, legacy);
      return;
    }

    clear(slot);
    slot.hidden = true;
    state.lastSource = "none";
    updateDiagnostics();
  }

  function schedule(force = false) {
    window.clearTimeout(schedule.timer);
    schedule.timer = window.setTimeout(() => render(force), 80);
  }

  document.addEventListener("DOMContentLoaded", () => {
    loadAssets().then(() => schedule(true));
    document.addEventListener("click", () => schedule(false), true);
    document.addEventListener("keydown", () => schedule(false), true);
    window.addEventListener("cta:entry-open", () => schedule(true));
    window.addEventListener("cta:language-mode", () => schedule(true));
    document.getElementById("langBtn")?.addEventListener("click", () => schedule(true));
  });
})();
