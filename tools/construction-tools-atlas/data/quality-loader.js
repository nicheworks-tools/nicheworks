(() => {
  "use strict";

  const originalFetch = window.fetch.bind(window);
  const DEFAULT_BASE_PATHS = ["./data/tools.basic.json"];
  const DEFAULT_MANIFEST_PATH = "./data/quality-manifest.json";

  function asEntries(raw) {
    if (Array.isArray(raw)) return raw;
    if (Array.isArray(raw?.entries)) return raw.entries;
    if (Array.isArray(raw?.data)) return raw.data;
    return [];
  }

  function packPath(item) {
    if (typeof item === "string") return item.trim();
    if (item && typeof item.path === "string") return item.path.trim();
    return "";
  }

  async function fetchJson(path) {
    if (!path) return null;
    try {
      const response = await originalFetch(path, { cache: "no-store" });
      if (!response.ok) return null;
      return await response.json();
    } catch (_) {
      return null;
    }
  }

  function manifestPaths(manifest) {
    const packs = Array.isArray(manifest?.packs) ? manifest.packs : [];
    const paths = [];
    const seen = new Set();

    packs.forEach((pack) => {
      const path = packPath(pack);
      if (!path || seen.has(path)) return;
      seen.add(path);
      paths.push(path);
    });

    return paths;
  }

  function addUnique(merged, seen, entries) {
    asEntries(entries).forEach((entry) => {
      const id = typeof entry?.id === "string" ? entry.id.trim() : "";
      if (!id || seen.has(id)) return;
      seen.add(id);
      merged.push(entry);
    });
  }

  async function loadEntries(options = {}) {
    const manifestPath = options.manifestPath || DEFAULT_MANIFEST_PATH;
    const basePaths = Array.isArray(options.basePaths) ? options.basePaths : DEFAULT_BASE_PATHS;
    const manifest = await fetchJson(manifestPath);
    const packPaths = manifestPaths(manifest);
    const merged = [];
    const seen = new Set();

    for (const path of packPaths) {
      const pack = await fetchJson(path);
      addUnique(merged, seen, pack);
    }

    for (const path of basePaths) {
      const base = await fetchJson(path);
      addUnique(merged, seen, base);
    }

    return merged;
  }

  window.CTA_DATA_LOADER = {
    loadEntries,
  };
})();
