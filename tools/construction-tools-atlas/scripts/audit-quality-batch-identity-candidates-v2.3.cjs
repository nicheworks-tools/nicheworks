const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const args = process.argv.slice(2);
const batchArg = args.find((v) => v.startsWith('--batch='));
const batch = batchArg ? batchArg.split('=')[1] : '';
if (!/^\d{3}$/.test(batch)) {
  console.error('Usage: node audit-quality-batch-identity-candidates-v2.3.cjs --batch=014');
  process.exit(2);
}

const TARGET = path.join(DATA, `tools.quality-${batch}.json`);
const REDIRECTS = path.join(DATA, 'canonical-redirects-v2.3.json');
const LOADER = path.join(DATA, 'quality-loader.js');
const read = (p) => JSON.parse(fs.readFileSync(p, 'utf8'));
const text = (v) => typeof v === 'string' ? v.trim() : '';
const arr = (v) => Array.isArray(v) ? v : [];
const normJa = (v) => text(v).normalize('NFKC').replace(/[\s・･\-‐‑‒–—―_()（）/]/g, '').toLowerCase();
const normEn = (v) => text(v).normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
const stop = new Set(['a','an','the','for','of','to','and','or','used','use','tool','tools','material','materials','construction','site']);
const words = (v) => new Set(normEn(v).split(/\s+/).filter((x) => x && x.length > 2 && !stop.has(x)));
const idTokens = (v) => text(v).toLowerCase().replace(/^q\d+_/, '').split('_').filter((x) => x.length > 2);
const intersection = (a, b) => { let n = 0; for (const x of a) if (b.has(x)) n += 1; return n; };

function rowsFrom(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows;
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}
function localFile(runtimePath) {
  return path.resolve(ROOT, String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, ''));
}
function names(e) {
  return {
    ja: text(e?.term?.ja || e?.ja || e?.name_ja),
    en: text(e?.term?.en || e?.en || e?.name_en),
    aja: arr(e?.aliases?.ja || e?.aliases_ja || e?.aj).map(text).filter(Boolean),
    aen: arr(e?.aliases?.en || e?.aliases_en || e?.ae).map(text).filter(Boolean),
    type: text(e?.type || e?.t),
    dja: text(e?.description?.ja || e?.summary?.ja || e?.dj),
    den: text(e?.description?.en || e?.summary?.en || e?.de)
  };
}
async function runtime() {
  const source = fs.readFileSync(LOADER, 'utf8');
  const w = {};
  w.fetch = async (input) => {
    const f = localFile(typeof input === 'string' ? input : input?.url);
    if (!fs.existsSync(f)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return read(f); } };
  };
  const d = { addEventListener() {}, getElementById() { return null; }, querySelector() { return null; }, createElement() { return { setAttribute() {} }; }, head: { appendChild() {} } };
  vm.runInNewContext(source, { window: w, document: d, console: { info() {}, warn() {}, error: console.error }, Set, Map }, { filename: 'quality-loader.js' });
  return await w.CTA_DATA_LOADER.loadEntries();
}

(async () => {
  if (!fs.existsSync(TARGET)) throw new Error(`Missing target batch file: ${TARGET}`);
  const sourceRows = rowsFrom(read(TARGET));
  const redirects = arr(read(REDIRECTS)?.redirects);
  const redirected = new Set(redirects.map((r) => text(r?.from)).filter(Boolean));
  const active = sourceRows.filter((r) => !redirected.has(text(r?.id)));
  const rt = await runtime();
  const runtimeById = new Map(rt.map((entry) => [text(entry?.id), entry]));
  const exactReports = [];
  const nearReports = [];

  for (const s of active) {
    const sid = text(s?.id);
    const resolved = runtimeById.get(sid);
    if (!resolved) throw new Error(`${sid}: active batch canonical missing from resolved runtime`);
    const sn = names(resolved);
    const sj = normJa(sn.ja);
    const se = normEn(sn.en);
    const sw = words(sn.en);
    const sit = idTokens(sid);
    const exact = [];
    const near = [];

    for (const e of rt) {
      const id = text(e?.id);
      if (!id || id === sid) continue;
      const n = names(e);
      const reasons = [];
      if (sj && normJa(n.ja) === sj) reasons.push('exact_ja');
      if (se && normEn(n.en) === se) reasons.push('exact_en');
      if (sj && n.aja.some((v) => normJa(v) === sj)) reasons.push('target_alias_ja');
      if (se && n.aen.some((v) => normEn(v) === se)) reasons.push('target_alias_en');
      if (reasons.length) exact.push({ id, ...n, reasons });

      const ew = words(n.en);
      const eit = idTokens(id);
      let score = 0;
      const nearReasons = [];
      const iw = intersection(sw, ew);
      if (iw) {
        const ratio = iw / Math.max(1, Math.min(sw.size, ew.size));
        if (ratio >= 0.5) { score += 3 * ratio; nearReasons.push(`en_token:${ratio.toFixed(2)}`); }
      }
      const oj = normJa(n.ja);
      if (sj.length >= 2 && oj.length >= 2 && sj !== oj && (sj.includes(oj) || oj.includes(sj))) { score += 2; nearReasons.push('ja_contains'); }
      const sharedId = sit.filter((x) => eit.includes(x)).length;
      if (sharedId) {
        const ratio = sharedId / Math.max(1, Math.min(sit.length, eit.length));
        if (ratio >= 0.5) { score += 2 * ratio; nearReasons.push(`id_token:${ratio.toFixed(2)}`); }
      }
      if (!reasons.length && score >= 4) near.push({ id, ...n, score: Number(score.toFixed(2)), reasons: nearReasons });
    }

    const raw = names(s);
    const source = {
      id: sid,
      type: sn.type,
      ja: sn.ja,
      en: sn.en,
      dja: raw.dja,
      den: raw.den,
      raw_type: raw.type,
      raw_ja: raw.ja,
      raw_en: raw.en
    };
    if (exact.length) exactReports.push({ source, candidates: exact });
    if (near.length) {
      near.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
      nearReports.push({ source, candidates: near.slice(0, 8) });
    }
  }

  const summary = {
    batch,
    source_rows: sourceRows.length,
    active_rows: active.length,
    already_redirected: sourceRows.length - active.length,
    exact_collision_rows: exactReports.length,
    near_candidate_rows: nearReports.length,
    collision_free_exact_rows: active.length - exactReports.length,
    runtime_entries: rt.length
  };
  console.log('CTA_BATCH_IDENTITY_CANDIDATE_SUMMARY=' + JSON.stringify(summary));
  console.log('CTA_BATCH_EXACT_COLLISION_IDS=' + JSON.stringify(exactReports.map((r) => r.source.id)));
  for (const report of exactReports) console.log('CTA_BATCH_EXACT_COLLISION_CASE=' + JSON.stringify(report));
  console.log('CTA_BATCH_NEAR_CANDIDATE_IDS=' + JSON.stringify(nearReports.map((r) => r.source.id)));
  for (const report of nearReports) console.log('CTA_BATCH_NEAR_CANDIDATE_CASE=' + JSON.stringify(report));
  console.log(`Construction Tools Atlas batch ${batch} identity candidate audit: PASS`);
})().catch((error) => {
  console.error(`Construction Tools Atlas batch ${batch} identity candidate audit: FAIL`);
  console.error('- ' + error.message);
  process.exit(1);
});
