(() => {
  "use strict";

  const IMAGE_MANIFEST = "./data/image-pilot.json";
  const byId = new Map();
  let loaded = false;

  function lang() {
    return document.documentElement.lang === "en" ? "en" : "ja";
  }

  function text(value) {
    return typeof value === "string" ? value.trim() : "";
  }

  function clear(node) {
    if (!node) return;
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  async function loadManifest() {
    if (loaded) return;
    loaded = true;
    try {
      const response = await fetch(IMAGE_MANIFEST, { cache: "no-store" });
      if (!response.ok) return;
      const data = await response.json();
      const items = Array.isArray(data?.items) ? data.items : [];
      items.forEach((item) => {
        const id = text(item?.id);
        if (id) byId.set(id, item);
      });
    } catch (_) {
      // Images are optional. Never break dictionary rendering.
    }
  }

  function selectedId() {
    const sheet = document.getElementById("detailSheet");
    if (!sheet || sheet.hidden) return "";
    const meta = document.getElementById("tabMeta");
    const value = meta?.textContent || "";
    const found = value.match(/id:\s*([^\n]+)/);
    return found ? found[1].trim() : "";
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
    }
    return slot;
  }

  function renderImage() {
    const slot = ensureSlot();
    if (!slot) return;
    clear(slot);
    slot.hidden = true;

    const id = selectedId();
    if (!id || !byId.has(id)) return;

    const item = byId.get(id);
    const src = text(item?.src);
    if (!src) return;

    const current = lang();
    const alt = current === "ja" ? text(item?.alt_ja || item?.alt_en) : text(item?.alt_en || item?.alt_ja);
    const caption = current === "ja" ? text(item?.caption_ja || item?.caption_en) : text(item?.caption_en || item?.caption_ja);

    const image = document.createElement("img");
    image.src = src;
    image.alt = alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      clear(slot);
      slot.hidden = true;
    }, { once: true });
    slot.appendChild(image);

    if (caption) {
      const figcaption = document.createElement("figcaption");
      figcaption.textContent = caption;
      slot.appendChild(figcaption);
    }

    slot.hidden = false;
  }

  function scheduleRender() {
    setTimeout(renderImage, 0);
    setTimeout(renderImage, 100);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadManifest();
    scheduleRender();
    document.addEventListener("click", scheduleRender, true);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") scheduleRender();
    }, true);
    new MutationObserver(scheduleRender).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });
  });
})();
