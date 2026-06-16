import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, "tools");
const INDEX_PATH = path.join(TOOLS_DIR, "tools-index.json");
const CENTRAL_META_PATH = path.join(TOOLS_DIR, "tools-meta.json");

const EXCLUDE = new Set(["_codex", "_template"]);

const readJson = (file, fallback) => {
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, "utf-8"));
  } catch {
    return fallback;
  }
};

const existingIndex = readJson(INDEX_PATH, { items: [] });
const existingBySlug = new Map(
  Array.isArray(existingIndex.items)
    ? existingIndex.items.filter((item) => item?.slug).map((item) => [item.slug, item])
    : []
);
const centralMeta = readJson(CENTRAL_META_PATH, { items: {} });
const centralItems = centralMeta && typeof centralMeta.items === "object" ? centralMeta.items : {};

const isToolDir = (name) => {
  if (!name) return false;
  if (name.startsWith(".")) return false;
  if (name.startsWith("_")) return false;
  if (EXCLUDE.has(name)) return false;
  const p = path.join(TOOLS_DIR, name);
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
};

const dirs = readdirSync(TOOLS_DIR).filter(isToolDir).sort((a, b) => a.localeCompare(b));

const items = dirs.map((slug) => {
  const localMeta = readJson(path.join(TOOLS_DIR, slug, "meta.json"), {});
  const sharedMeta = centralItems[slug] || {};
  const existingMeta = existingBySlug.get(slug) || {};
  const merged = { ...existingMeta, ...sharedMeta, ...localMeta };

  return {
    slug,
    title_en: merged.title_en || slug,
    title_ja: merged.title_ja || merged.title_en || slug,
    desc_en: merged.desc_en || "",
    desc_ja: merged.desc_ja || merged.desc_en || "",
    tags: Array.isArray(merged.tags) ? merged.tags : []
  };
});

const out = {
  generatedAt: existingIndex.generatedAt || centralMeta.updatedAt || new Date().toISOString(),
  total: items.length,
  items
};

writeFileSync(INDEX_PATH, JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log(`OK: tools/tools-index.json updated. total=${items.length}`);
