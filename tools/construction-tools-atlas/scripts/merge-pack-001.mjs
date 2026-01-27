import fs from "fs";
import crypto from "crypto";

const PACK_PATH  = "tools/construction-tools-atlas/data/packs/pack-001.json";
const BASIC_PATH = "tools/construction-tools-atlas/data/tools.basic.json";

const OUT_MERGED = "tools/construction-tools-atlas/data/tools.basic.merged.json";
const OUT_REPORT = "tools/construction-tools-atlas/data/merge-report.json";
const OUT_PACK_CONVERTED = "tools/construction-tools-atlas/data/packs/pack-001.converted.basic.json";

const MANUAL_PATH = "tools/construction-tools-atlas/data/manual-resolve.pack001.json";

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
  };

  if (examples != null){
    entry.detail = entry.detail || {};
    entry.detail.examples = examples;
    entry.detail._from = "pack-001";
  }

  return entry;
}

function gatherKeys(e){
  const ja = e?.term?.ja;
  const en = e?.term?.en;
  const aJa = e?.aliases?.ja || [];
  const aEn = e?.aliases?.en || [];

  const n = [];
  if (ja) n.push(norm(ja));
  if (en) n.push(norm(en));
  for (const v of aJa) n.push(norm(v));
  for (const v of aEn) n.push(norm(v));

  return { normKeys: uniq(n).filter(Boolean) };
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

function loadManual(){
  if (!fs.existsSync(MANUAL_PATH)) return { merge:{}, asNew:[] };
  const j = JSON.parse(fs.readFileSync(MANUAL_PATH,"utf8"));
  return { merge: j.merge || {}, asNew: j.asNew || [] };
}

const manual = loadManual();
const manualAsNew = new Set((manual.asNew || []).map(String));
const manualMerge = new Map(Object.entries(manual.merge || {}).map(([k,v])=>[String(k), String(v)]));

const basic = loadAny(BASIC_PATH);
const packRaw = loadAny(PACK_PATH);
const pack = packRaw.map(toBasic);

const merged = [...basic];
const mergedById = new Map(merged.filter(e=>e?.id).map(e=>[String(e.id), e]));

const normIndex = new Map();
function indexEntry(e){
  const { normKeys } = gatherKeys(e);
  for (const k of normKeys){
    if (!normIndex.has(k)) normIndex.set(k, []);
    normIndex.get(k).push(e);
  }
}
for (const e of merged) indexEntry(e);

const report = {
  packCount: pack.length,
  basicCount: basic.length,
  addedAsNew: 0,
  mergedIntoExisting: 0,
  duplicatesExact: [],
  ambiguous: [],
  manualAsNewApplied: 0,
  manualMergeApplied: 0
};

for (const pe of pack){
  const pid = String(pe.id);

  // 手動: 新規採用
  if (manualAsNew.has(pid)){
    merged.push(pe);
    mergedById.set(pid, pe);
    report.addedAsNew++;
    report.manualAsNewApplied++;
    indexEntry(pe);
    continue;
  }

  // 手動: 既存へ統合
  if (manualMerge.has(pid)){
    const targetId = manualMerge.get(pid);
    const be = mergedById.get(targetId);
    if (!be){
      report.ambiguous.push({ packId: pid, packTerm: pe?.term, candidates: [{ basicId: targetId, basicTerm: "NOT_FOUND", why:"manual_merge_target_missing" }]});
      continue;
    }
    const idx = merged.findIndex(x => String(x?.id) === targetId);
    merged[idx] = mergeInto(be, pe);
    mergedById.set(targetId, merged[idx]);
    report.mergedIntoExisting++;
    report.manualMergeApplied++;
    report.duplicatesExact.push({ packId: pid, basicId: targetId, reason: "manual_merge" });
    indexEntry(merged[idx]);
    continue;
  }

  // 自動判定（前と同じ思想：一致が1つに絞れないなら ambiguous）
  const { normKeys: pKeys } = gatherKeys(pe);
  const hitSet = new Set();
  for (const k of pKeys){
    const cands = normIndex.get(k) || [];
    for (const c of cands) hitSet.add(String(c.id));
  }

  if (hitSet.size === 1){
    const bid = [...hitSet][0];
    const be = mergedById.get(bid);
    const idx = merged.findIndex(x => String(x?.id) === bid);
    merged[idx] = mergeInto(be, pe);
    mergedById.set(bid, merged[idx]);
    report.mergedIntoExisting++;
    report.duplicatesExact.push({ packId: pid, basicId: bid, reason: "normalized_exact" });
    indexEntry(merged[idx]);
    continue;
  }

  if (hitSet.size === 0){
    merged.push(pe);
    mergedById.set(pid, pe);
    report.addedAsNew++;
    indexEntry(pe);
    continue;
  }

  report.ambiguous.push({ packId: pid, packTerm: pe?.term, candidates: [...hitSet].slice(0,5).map(id=>({basicId:id, why:"multiple_hits"})) });
}

fs.writeFileSync(OUT_PACK_CONVERTED, JSON.stringify(pack, null, 2) + "\n", "utf8");
fs.writeFileSync(OUT_MERGED, JSON.stringify(merged, null, 2) + "\n", "utf8");
fs.writeFileSync(OUT_REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");

console.log("WROTE:", OUT_MERGED);
console.log("WROTE:", OUT_REPORT);
console.log("report:", {
  packCount: report.packCount,
  basicCount: report.basicCount,
  addedAsNew: report.addedAsNew,
  mergedIntoExisting: report.mergedIntoExisting,
  ambiguous: report.ambiguous.length,
  manualAsNewApplied: report.manualAsNewApplied,
  manualMergeApplied: report.manualMergeApplied
});
