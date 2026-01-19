import { readdirSync, statSync, writeFileSync, existsSync, readFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TOOLS_DIR = path.join(ROOT, "tools");

const EXCLUDE = new Set(["_codex", "_template"]);

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
  const metaPath = path.join(TOOLS_DIR, slug, "meta.json");
  if (existsSync(metaPath)) {
    try {
      const meta = JSON.parse(readFileSync(metaPath, "utf-8"));
      return {
        slug,
        title_en: meta.title_en || slug,
        title_ja: meta.title_ja || slug,
        desc_en: meta.desc_en || "",
        desc_ja: meta.desc_ja || "",
        tags: Array.isArray(meta.tags) ? meta.tags : []
      };
    } catch {
      // ignore broken meta
    }
  }
  return { slug, title_en: slug, title_ja: slug, desc_en: "", desc_ja: "", tags: [] };
});

const out = {
  generatedAt: new Date().toISOString(),
  total: items.length,
  items
};

writeFileSync(path.join(TOOLS_DIR, "tools-index.json"), JSON.stringify(out, null, 2) + "\n", "utf-8");
console.log(`OK: tools/tools-index.json updated. total=${items.length}`);
