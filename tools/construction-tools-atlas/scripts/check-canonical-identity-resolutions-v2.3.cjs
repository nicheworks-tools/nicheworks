const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const IDENTITY_PATH = path.join(DATA, 'canonical-identity-resolutions-v2.3.json');
const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');
const LOADER_PATH = path.join(DATA, 'quality-loader.js');

function text(value) { return typeof value === 'string' ? value.trim() : ''; }
function array(value) { return Array.isArray(value) ? value : []; }
function readJson(file) { return JSON.parse(fs.readFileSync(file, 'utf8')); }
function norm(value) { return String(value || '').normalize('NFKC').toLowerCase().replace(/[\s\u3000]+/g, ' ').trim(); }
function localFile(runtimePath) {
  const clean = String(runtimePath || '').replace(/[?#].*$/, '').replace(/^\.\//, '');
  return path.resolve(ROOT, clean);
}

async function runLoader() {
  const source = fs.readFileSync(LOADER_PATH, 'utf8');
  const windowObject = { localStorage: { getItem() { return null; }, setItem() {} } };
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
  return { entries, windowObject };
}

function resolve(id, redirects) {
  let current = id;
  const seen = new Set();
  while (redirects.has(current) && !seen.has(current)) {
    seen.add(current);
    current = redirects.get(current);
  }
  return current;
}

async function main() {
  const identity = readJson(IDENTITY_PATH);
  const redirectDoc = readJson(REDIRECT_PATH);
  const redirects = new Map(array(redirectDoc.redirects).map((row) => [text(row.from), text(row.to)]));
  const runtime = await runLoader();
  const byId = new Map(runtime.entries.map((row) => [text(row?.id), row]));
  const diagnostics = runtime.windowObject.CTA_DATA_DIAGNOSTICS || {};
  const expectedAliasRemovalCount = array(identity.alias_removals).reduce((sum, row) => sum + array(row.ja).length + array(row.en).length, 0);

  if (diagnostics.identityTypeOverridesApplied !== array(identity.type_overrides).length) {
    throw new Error(`Type override count mismatch: ${diagnostics.identityTypeOverridesApplied} != ${array(identity.type_overrides).length}`);
  }
  if (diagnostics.identityAliasRemovalsApplied !== expectedAliasRemovalCount) {
    throw new Error(`Alias removal count mismatch: ${diagnostics.identityAliasRemovalsApplied} != ${expectedAliasRemovalCount}`);
  }
  if (diagnostics.identityResolutionMissingTargets) throw new Error(`Missing identity targets: ${diagnostics.identityResolutionMissingTargets}`);
  if (diagnostics.identityResolutionSourceMismatches) throw new Error(`Unexpected identity source type mismatches: ${diagnostics.identityResolutionSourceMismatches}`);

  for (const row of array(identity.type_overrides)) {
    const id = text(row.id);
    const canonicalId = resolve(id, redirects);
    const target = byId.get(canonicalId);
    if (!target) throw new Error(`${id}: effective canonical ${canonicalId} is not public`);
    if (text(target.type) !== text(row.to)) throw new Error(`${id}: effective type ${text(target.type)} != ${text(row.to)}`);
  }

  for (const row of array(identity.alias_removals)) {
    const id = text(row.id);
    const target = byId.get(id);
    if (!target) throw new Error(`${id}: alias-removal target is not public`);
    const aliasesJa = array(target?.aliases?.ja).map(norm);
    const aliasesEn = array(target?.aliases?.en).map(norm);
    const fuzzy = array(target?.fuzzy).map(norm);
    for (const value of array(row.ja)) {
      const key = norm(value);
      if (aliasesJa.includes(key) || fuzzy.includes(key)) throw new Error(`${id}: retired JA alias remains searchable as equivalent: ${value}`);
    }
    for (const value of array(row.en)) {
      const key = norm(value);
      if (aliasesEn.includes(key) || fuzzy.includes(key)) throw new Error(`${id}: retired EN alias remains searchable as equivalent: ${value}`);
    }
  }

  for (const row of array(identity.resolved_distinct_pairs)) {
    const a = text(row.a);
    const b = text(row.b);
    if (!byId.has(a) || !byId.has(b)) throw new Error(`${a} / ${b}: reviewed distinct pair must remain as two public canonicals`);
    if (resolve(a, redirects) !== a || resolve(b, redirects) !== b) throw new Error(`${a} / ${b}: reviewed distinct pair must not be redirected`);
  }

  console.log(`CTA_IDENTITY_RUNTIME_SUMMARY=${JSON.stringify({
    public_entries: runtime.entries.length,
    redirects: redirects.size,
    type_overrides: array(identity.type_overrides).length,
    alias_removals: expectedAliasRemovalCount,
    distinct_pairs: array(identity.resolved_distinct_pairs).length
  })}`);
  console.log('Construction Tools Atlas canonical identity resolutions v2.3: PASS');
}

main().catch((error) => {
  console.error('Construction Tools Atlas canonical identity resolutions v2.3: FAIL');
  console.error(`- ${error.message}`);
  process.exit(1);
});
