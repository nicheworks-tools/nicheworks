import fs from "fs";
import crypto from "crypto";

const PACK_PATH  = "tools/construction-tools-atlas/data/packs/pack-001.json";
const BASIC_PATH = "tools/construction-tools-atlas/data/tools.basic.json";

const OUT_MERGED = "tools/construction-tools-atlas/data/tools.basic.merged.json";
const OUT_REPORT = "tools/construction-tools-atlas/data/merge-report.json";
const OUT_PACK_CONVERTED = "tools/construction-tools-atlas/data/packs/pack-001.converted.basic.json";

function loadAny(p){
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  if (Array.isArray(j)) return j;
  if (j && Array.isArray(j.items)) return j.items;
  if (j && Array.isArray(j.data)) return j.data;
  throw new Error(`Unknown JSON shape in ${p}`);
}

function uniq(arr){
  const out = [];
  const seen = new Set();
  for (const v of arr || []){
    const s = String(v);
    if (!seen.has(s)){
      seen.add(s);
      out.push(v);
    }
  }
  return out;
}

function norm(s){
  if (!s) return "";
  return String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function slugifyAscii(s){
  return String(s)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_{2,}/g, "_");
}

function shortHash(s){
  return crypto.createHash("sha1").update(String(s)).digest("hex").slice(0, 8);
}

function makeId(entry){
  const cand = entry?.id || entry?.slug || entry?.key;
  if (typeof cand === "string" && /^[a-z0-9_]+$/.test(cand)) return cand;

  const en = entry?.term?.en || entry?.en || entry?.english || entry?.term_en;
  const ja = entry?.term?.ja || entry?.ja || entry?.japanese || entry?.term_ja;

  if (en){
    const s = slugifyAscii(en);
    if (s) return s;
  }
  return `ja_${shortHash(ja || JSON.stringify(entry))}`;
}

function toBasic(raw){
  const hasTermObj = raw && raw.term && typeof raw.term === "object";
  const termJa = hasTermObj ? raw.term.ja : (raw.term_ja ?? raw.ja ?? raw.jp ?? raw.japanese ?? raw.name_ja);
  const termEn = hasTermObj ? raw.term.en : (raw.term_en ?? raw.en ?? raw.eng ?? raw.english ?? raw.name_en);

  const descJa = raw?.description?.ja ?? raw?.desc_ja ?? raw?.description_ja ?? raw?.ja_desc ?? raw?.meaning_ja;
  const descEn = raw?.description?.en ?? raw?.desc_en ?? raw?.description_en ?? raw?.en_desc ?? raw?.meaning_en;

  const aliasesJa = raw?.aliases?.ja ?? raw?.alias_ja ?? raw?.aliasesJa ?? raw?.aka_ja ?? [];
  const aliasesEn = raw?.aliases?.en ?? raw?.alias_en ?? raw?.aliasesEn ?? raw?.aka_en ?? [];

  const categories = raw?.categories ?? raw?.category ?? raw?.tags ?? [];
  const tasks      = raw?.tasks ?? raw?.task ?? [];
  const fuzzy      = raw?.fuzzy ?? raw?.keywords ?? [];
  const region     = raw?.region ?? raw?.regions ?? [];
  const image      = raw?.image ?? raw?.icon ?? raw?.svg ?? undefined;

  const examples = raw?.examples ?? raw?.example ?? raw?.usage ?? raw?.usages ?? undefined;

  const entry = {
    id: makeId(raw),
    type: raw?.type ?? "tool",
    term: { ja: termJa ?? "", en: termEn ?? "" },
    aliases: {
      ja: uniq(Array.isArray(aliasesJa) ? aliasesJa : [aliasesJa]).filter(Boolean),
      en: uniq(Array.isArray(aliasesEn) ? aliasesEn : [aliasesEn]).filter(Boolean)
    },
    description: { ja: descJa ?? "", en: descEn ?? "" },
    categories: uniq(Array.isArray(categories) ? categories : [categories]).filter(Boolean),
    tasks: uniq(Array.isArray(tasks) ? tasks : [tasks]).filter(Boolean),
    fuzzy: uniq(Array.isArray(fuzzy) ? fuzzy : [fuzzy]).filter(Boolean),
    region: uniq(Array.isArray(region) ? region : [region]).filter(Boolean),
    ...(image ? { image } : {}),
  };

  if (!entry.term.ja) entry.term.ja = "";
  if (!entry.term.en) entry.term.en = "";

  if (examples != null){
    entry.detail = entry.detail || {};
    entry.detail.examples = examples;
    entry.detail._from = "pack-001";
  }

  if (!entry.term.ja && !entry.term.en){
    entry.detail = entry.detail || {};
    entry.detail._needs_manual = true;
    entry.detail._raw = raw;
  }

  return entry;
}

function gatherKeys(e){
  const keys = [];
  if (e?.id) keys.push(`id:${String(e.id)}`);

  const ja = e?.term?.ja;
  const en = e?.term?.en;
  if (ja) keys.push(`tja:${String(ja)}`);
  if (en) keys.push(`ten:${String(en)}`);

  const aJa = e?.aliases?.ja || [];
  const aEn = e?.aliases?.en || [];
  for (const v of aJa) keys.push(`aja:${String(v)}`);
  for (const v of aEn) keys.push(`aen:${String(v)}`);

  const n = [];
  if (ja) n.push(norm(ja));
  if (en) n.push(norm(en));
  for (const v of aJa) n.push(norm(v));
  for (const v of aEn) n.push(norm(v));

  return { rawKeys: keys, normKeys: uniq(n).filter(Boolean) };
}

function mergeInto(base, incoming){
  const out = structuredClone(base);

  out.type = out.type || incoming.type || "tool";

  out.term = out.term || { ja:"", en:"" };
  out.term.ja = out.term.ja || incoming?.term?.ja || "";
  out.term.en = out.term.en || incoming?.term?.en || "";

  out.description = out.description || { ja:"", en:"" };
  out.description.ja = out.description.ja || incoming?.description?.ja || "";
  out.description.en = out.description.en || incoming?.description?.en || "";

  out.aliases = out.aliases || { ja:[], en:[] };
  out.aliases.ja = uniq([...(out.aliases.ja || []), ...(incoming?.aliases?.ja || [])]).filter(Boolean);
  out.aliases.en = uniq([...(out.aliases.en || []), ...(incoming?.aliases?.en || [])]).filter(Boolean);

  out.categories = uniq([...(out.categories || []), ...(incoming?.categories || [])]).filter(Boolean);
  out.tasks      = uniq([...(out.tasks || []),      ...(incoming?.tasks || [])]).filter(Boolean);
  out.fuzzy      = uniq([...(out.fuzzy || []),      ...(incoming?.fuzzy || [])]).filter(Boolean);
  out.region     = uniq([...(out.region || []),     ...(incoming?.region || [])]).filter(Boolean);

  if (!out.image && incoming?.image) out.image = incoming.image;

  if (incoming?.detail?.examples != null){
    out.detail = out.detail || {};
    const cur = out.detail.examples;
    const add = incoming.detail.examples;
    if (cur == null) out.detail.examples = add;
    else if (Array.isArray(cur)) out.detail.examples = uniq([...cur, ...(Array.isArray(add) ? add : [add])]);
    else out.detail.examples = uniq([cur, ...(Array.isArray(add) ? add : [add])]);

    const from = out.detail._from;
    const fromArr = Array.isArray(from) ? from : (from ? [from] : []);
    out.detail._from = uniq([...fromArr, "pack-001"]);
  }

  return out;
}

function isNear(a, b){
  if (!a || !b) return false;
  if (a === b) return true;
  if (a.length >= 4 && b.length >= 4){
    if (a.includes(b) || b.includes(a)) return true;
  }
  const min = Math.min(a.length, b.length);
  if (min >= 6){
    const prefix = Math.floor(min * 0.8);
    if (a.slice(0, prefix) === b.slice(0, prefix)) return true;
  }
  return false;
}

const basic = loadAny(BASIC_PATH);
const packRaw = loadAny(PACK_PATH);
const pack = packRaw.map(toBasic);

const byId = new Map();
for (const e of basic){
  if (e?.id) byId.set(String(e.id), e);
}

const normIndex = new Map();
function indexEntry(e){
  const { normKeys } = gatherKeys(e);
  for (const k of normKeys){
    if (!normIndex.has(k)) normIndex.set(k, []);
    normIndex.get(k).push(e);
  }
}
for (const e of basic) indexEntry(e);

const report = {
  packCount: pack.length,
  basicCount: basic.length,
  addedAsNew: 0,
  mergedIntoExisting: 0,
  duplicatesExact: [],
  ambiguous: [],
  packNeedsManual: [],
};

const merged = [...basic];
const mergedById = new Map(merged.filter(e=>e?.id).map(e=>[String(e.id), e]));

function termLabel(e){
  const ja = e?.term?.ja ? `ja:${e.term.ja}` : "";
  const en = e?.term?.en ? `en:${e.term.en}` : "";
  return [ja,en].filter(Boolean).join(" / ");
}

for (const pe of pack){
  const pid = String(pe.id);

  if (pe?.detail?._needs_manual){
    report.packNeedsManual.push({ packId: pid, note: "term missing", rawKept: true });
    merged.push(pe);
    mergedById.set(pid, pe);
    report.addedAsNew++;
    indexEntry(pe);
    continue;
  }

  const direct = mergedById.get(pid) || byId.get(pid);
  if (direct){
    const idx = merged.findIndex(x => String(x?.id) === String(direct.id));
    merged[idx] = mergeInto(direct, pe);
    mergedById.set(String(direct.id), merged[idx]);
    report.duplicatesExact.push({ packId: pid, basicId: String(direct.id), reason: "id_match", key: `id:${pid}` });
    report.mergedIntoExisting++;
    indexEntry(merged[idx]);
    continue;
  }

  const { normKeys: pKeys } = gatherKeys(pe);
  const hitSet = new Set();
  for (const k of pKeys){
    const cands = normIndex.get(k) || [];
    for (const c of cands) hitSet.add(String(c.id));
  }

  if (hitSet.size === 1){
    const bid = [...hitSet][0];
    const be = mergedById.get(bid) || basic.find(x => String(x?.id) === bid);
    const idx = merged.findIndex(x => String(x?.id) === bid);
    merged[idx] = mergeInto(be, pe);
    mergedById.set(bid, merged[idx]);
    report.duplicatesExact.push({ packId: pid, basicId: bid, reason: "normalized_exact", key: pKeys[0] });
    report.mergedIntoExisting++;
    indexEntry(merged[idx]);
    continue;
  }

  const near = [];
  if (hitSet.size > 1){
    for (const bid of hitSet){
      const be = mergedById.get(bid) || basic.find(x => String(x?.id) === bid);
      near.push({ basicId: bid, basicTerm: termLabel(be), why: "multiple_norm_hits" });
    }
  } else {
    const cands = [];
    for (const [k, arr] of normIndex.entries()){
      for (const pk of pKeys){
        if (isNear(pk, k)){
          for (const e of arr) cands.push(e);
        }
      }
    }
    const uniqById = new Map();
    for (const e of cands){
      const id = String(e.id);
      if (!uniqById.has(id)) uniqById.set(id, e);
    }
    for (const [bid, be] of [...uniqById.entries()].slice(0, 5)){
      near.push({ basicId: bid, basicTerm: termLabel(be), why: "near_match" });
    }
  }

  if (near.length){
    report.ambiguous.push({ packId: pid, packTerm: termLabel(pe), candidates: near });
    continue;
  }

  merged.push(pe);
  mergedById.set(pid, pe);
  report.addedAsNew++;
  indexEntry(pe);
}

const idSeen = new Set();
const idDups = [];
for (const e of merged){
  const id = String(e?.id || "");
  if (!id) continue;
  if (idSeen.has(id)) idDups.push(id);
  else idSeen.add(id);
}
if (idDups.length){
  report.finalIdDuplicates = uniq(idDups);
}

fs.writeFileSync(OUT_PACK_CONVERTED, JSON.stringify(pack, null, 2) + "\n", "utf8");
fs.writeFileSync(OUT_MERGED, JSON.stringify(merged, null, 2) + "\n", "utf8");
fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log("WROTE:", OUT_PACK_CONVERTED);
console.log("WROTE:", OUT_MERGED);
console.log("WROTE:", OUT_REPORT);
console.log("report:", {
  packCount: report.packCount,
  basicCount: report.basicCount,
  addedAsNew: report.addedAsNew,
  mergedIntoExisting: report.mergedIntoExisting,
  duplicatesExact: report.duplicatesExact.length,
  ambiguous: report.ambiguous.length,
  packNeedsManual: report.packNeedsManual.length,
  finalIdDuplicates: report.finalIdDuplicates?.length || 0,
});
