const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');
const MANIFEST_PATH = path.join(DATA, 'quality-manifest.json');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');
const DEEP_LINK_PATH = path.join(ROOT, 'canonical-deep-link-v2.3.js');

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function array(value) { return Array.isArray(value) ? value : []; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function rowsFrom(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.schema === 'cta-compact-v1' && Array.isArray(raw.rows)) return raw.rows;
  if (Array.isArray(raw?.entries)) return raw.entries;
  if (Array.isArray(raw?.data)) return raw.data;
  return [];
}
function idOf(row) { return text(row?.id || row?.slug); }
function typeOf(row) { return text(row?.type || row?.t || 'unknown') || 'unknown'; }
function jaOf(row) { return text(row?.term?.ja || row?.ja); }
function enOf(row) { return text(row?.term?.en || row?.en); }
function localFile(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}
function manifestSources() {
  const manifest = readJson(MANIFEST_PATH);
  const out = [];
  for (const pack of array(manifest.packs)) {
    const value = typeof pack === 'string' ? pack : pack?.path;
    if (value) out.push(String(value).replace(/^\.\//, ''));
  }
  for (const base of array(manifest.base)) if (base) out.push(String(base).replace(/^\.\//, ''));
  return out;
}

async function runLoader(favoriteIds) {
  const source = fs.readFileSync(LOADER_PATH, 'utf8');
  const store = new Map([['cta_favs', JSON.stringify(favoriteIds)]]);
  const windowObject = {
    localStorage: {
      getItem(key) { return store.has(key) ? store.get(key) : null; },
      setItem(key, value) { store.set(key, String(value)); }
    }
  };
  windowObject.fetch = async (input) => {
    const file = localFile(typeof input === 'string' ? input : input?.url);
    if (!fs.existsSync(file)) return { ok: false, async json() { return null; } };
    return { ok: true, async json() { return readJson(file); } };
  };
  const documentStub = {
    addEventListener() {}, getElementById() { return null; }, querySelector() { return null; },
    createElement() { return { setAttribute() {} }; }, head: { appendChild() {} }
  };
  vm.runInNewContext(source, { window: windowObject, document: documentStub, console: { info() {}, warn() {}, error: console.error }, Set, Map }, { filename: 'quality-loader.js' });
  const entries = await windowObject.CTA_DATA_LOADER.loadEntries();
  return { windowObject, entries, favoriteIds: JSON.parse(store.get('cta_favs') || '[]') };
}

async function main() {
  const redirectDoc = readJson(REDIRECT_PATH);
  const redirects = array(redirectDoc.redirects);
  if (redirects.length !== 10) throw new Error(`Expected 10 confirmed redirects, got ${redirects.length}`);

  const sourceById = new Map();
  for (const rel of manifestSources()) {
    const file = path.resolve(ROOT, rel);
    for (const row of rowsFrom(readJson(file))) {
      const id = idOf(row);
      if (id && !sourceById.has(id)) sourceById.set(id, row);
    }
  }

  const fromIds = new Set();
  const toIds = new Set();
  for (const redirect of redirects) {
    const from = text(redirect.from);
    const to = text(redirect.to);
    if (!from || !to || from === to) throw new Error('Invalid redirect row');
    if (fromIds.has(from)) throw new Error(`${from}: duplicate redirect source`);
    if (toIds.has(from)) throw new Error(`${from}: redirect chain/cycle source is also a target`);
    const source = sourceById.get(from);
    const target = sourceById.get(to);
    if (!source) throw new Error(`${from}: source record missing`);
    if (!target) throw new Error(`${from}: target ${to} missing`);
    if (typeOf(source) !== typeOf(target)) throw new Error(`${from}: type mismatch ${typeOf(source)} -> ${typeOf(target)}`);
    fromIds.add(from);
    toIds.add(to);
  }

  const favoriteProbe = [...fromIds, 'drill_driver'];
  const runtime = await runLoader(favoriteProbe);
  const runtimeById = new Map(runtime.entries.map((row) => [idOf(row), row]));
  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.canonicalRedirectsApplied !== redirects.length) throw new Error('Loader redirect count mismatch');
  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.canonicalRedirectMissingSources) throw new Error('Loader reports missing redirect sources');
  if (runtime.windowObject.CTA_DATA_DIAGNOSTICS?.canonicalRedirectMissingTargets) throw new Error('Loader reports missing redirect targets');

  for (const redirect of redirects) {
    const from = text(redirect.from);
    const to = text(redirect.to);
    if (runtimeById.has(from)) throw new Error(`${from}: redirected duplicate is still public`);
    const target = runtimeById.get(to);
    if (!target) throw new Error(`${to}: redirect target is not public`);
    const source = sourceById.get(from);
    const vocab = [
      ...array(target?.aliases?.ja), ...array(target?.aliases?.en), ...array(target?.fuzzy)
    ].map(text);
    for (const expected of [from, jaOf(source), enOf(source)].filter(Boolean)) {
      if (!vocab.includes(expected)) throw new Error(`${from}: target ${to} did not inherit search vocabulary ${expected}`);
    }
    if (runtime.windowObject.CTA_DATA_LOADER.resolveCanonicalId(from) !== to) throw new Error(`${from}: resolver did not return ${to}`);
  }

  const expectedFavorites = [...new Set(favoriteProbe.map((id) => runtime.windowObject.CTA_DATA_LOADER.resolveCanonicalId(id)))];
  if (JSON.stringify(runtime.favoriteIds) !== JSON.stringify(expectedFavorites)) {
    throw new Error(`Favorite migration mismatch: ${JSON.stringify(runtime.favoriteIds)}`);
  }

  const deepLinkSource = fs.readFileSync(DEEP_LINK_PATH, 'utf8');
  for (const marker of ['resolveCanonicalId', 'history.replaceState', 'row.dataset.entryId', 'shareCurrentEntry']) {
    if (!deepLinkSource.includes(marker)) throw new Error(`Deep-link runtime missing contract marker: ${marker}`);
  }

  console.log(`CTA_CANONICAL_REDIRECTS=${JSON.stringify(Object.fromEntries(redirects.map((row) => [row.from, row.to])))}`);
  console.log(`CTA_CANONICAL_REDIRECT_RUNTIME_COUNT=${runtime.entries.length}`);
  console.log('Construction Tools Atlas canonical redirects v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas canonical redirects v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});