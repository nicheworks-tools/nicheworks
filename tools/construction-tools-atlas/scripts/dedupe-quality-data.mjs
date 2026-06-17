import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dataDir = path.join(root, 'data');
const reportDir = path.join(root, 'reports');
const manifestPath = path.join(dataDir, 'quality-manifest.json');
const dryRun = process.argv.includes('--dry-run');
const writeReport = process.argv.includes('--write-report') || dryRun;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, data) {
  if (Array.isArray(data)) {
    const rows = data.map((row) => JSON.stringify(row));
    fs.writeFileSync(filePath, `[\n${rows.join(',\n')}\n]\n`);
    return;
  }
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}

function normalize(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[\s\u3000]+/g, ' ')
    .replace(/[／]/g, '/')
    .trim();
}

function getId(entry) {
  return String(entry?.id || '').trim();
}

function getTerm(entry) {
  return {
    ja: String(entry?.term?.ja || entry?.ja || '').trim(),
    en: String(entry?.term?.en || entry?.en || '').trim(),
  };
}

function termKey(entry) {
  const term = getTerm(entry);
  const ja = normalize(term.ja);
  const en = normalize(term.en);
  return ja || en ? `${ja}::${en}` : '';
}

function packFiles(manifest) {
  return [
    ...(manifest.base || []),
    ...(manifest.packs || []).map((pack) => typeof pack === 'string' ? pack : pack.path),
  ]
    .filter(Boolean)
    .map((p) => p.replace(/^\.\/data\//, ''));
}

function rowsOf(raw) {
  if (Array.isArray(raw)) return { kind: 'array', rows: raw };
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw?.rows)) return { kind: 'compact', rows: raw.rows };
  if (Array.isArray(raw?.entries)) return { kind: 'entries', rows: raw.entries };
  if (Array.isArray(raw?.data)) return { kind: 'data', rows: raw.data };
  return { kind: 'unknown', rows: [] };
}

function setRows(raw, kind, rows) {
  if (kind === 'array') return rows;
  if (kind === 'compact') return { ...raw, rows };
  if (kind === 'entries') return { ...raw, entries: rows };
  if (kind === 'data') return { ...raw, data: rows };
  return raw;
}

const manifest = readJson(manifestPath);
const files = packFiles(manifest);
const seenIds = new Map();
const seenTerms = new Map();
const removals = [];
const perFile = [];

for (const file of files) {
  const filePath = path.join(dataDir, file);
  if (!fs.existsSync(filePath)) {
    perFile.push({ file, status: 'missing', before: 0, after: 0, removed: 0 });
    continue;
  }

  const raw = readJson(filePath);
  const { kind, rows } = rowsOf(raw);
  const kept = [];

  for (const row of rows) {
    const id = getId(row);
    const key = termKey(row);
    const term = getTerm(row);

    const idHit = id && seenIds.get(id);
    const termHit = key && seenTerms.get(key);

    if (idHit || termHit) {
      removals.push({
        file,
        id,
        ja: term.ja,
        en: term.en,
        reason: idHit ? 'duplicate_id' : 'duplicate_exact_term',
        first_source: idHit?.file || termHit?.file,
        first_id: idHit?.id || termHit?.id,
      });
      continue;
    }

    if (id) seenIds.set(id, { file, id, key });
    if (key) seenTerms.set(key, { file, id, key });
    kept.push(row);
  }

  perFile.push({ file, status: 'ok', before: rows.length, after: kept.length, removed: rows.length - kept.length });

  if (!dryRun && kept.length !== rows.length) {
    writeJson(filePath, setRows(raw, kind, kept));
  }
}

const report = {
  mode: dryRun ? 'dry-run' : 'write',
  files_scanned: files.length,
  total_removed: removals.length,
  per_file: perFile,
  removals,
};

console.log(JSON.stringify(report, null, 2));

if (writeReport) {
  fs.mkdirSync(reportDir, { recursive: true });
  fs.writeFileSync(path.join(reportDir, 'dedupe-quality-data.json'), `${JSON.stringify(report, null, 2)}\n`);
}

if (dryRun && removals.length > 0) {
  process.exitCode = 1;
}
