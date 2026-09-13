import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const failures = [];
const filePath = (rel) => path.join(root, rel);
const exists = (rel) => fs.existsSync(filePath(rel));
const read = (rel) => fs.readFileSync(filePath(rel), 'utf8');
const check = (condition, message) => { if (!condition) failures.push(message); };

function has(rel, needle, label = String(needle)) {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  const text = read(rel);
  check(needle instanceof RegExp ? needle.test(text) : text.includes(needle), `${rel}: missing ${label}`);
}

function lacks(rel, needle, label = String(needle)) {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return;
  const text = read(rel);
  check(!(needle instanceof RegExp ? needle.test(text) : text.includes(needle)), `${rel}: forbidden ${label}`);
}

function readJson(rel) {
  check(exists(rel), `${rel}: missing file`);
  if (!exists(rel)) return null;
  try {
    return JSON.parse(read(rel));
  } catch (error) {
    failures.push(`${rel}: invalid JSON (${error.message})`);
    return null;
  }
}

// Wave 7 begins with Reconcile, introduced as registered tool 88. Do not hard-code the
// current registry count: later tools may be added while this contract remains valid.
const registry = readJson('tools/tools-index.json');
if (registry) {
  check(Array.isArray(registry.items), 'tools/tools-index.json: items must be an array');
  check(registry.items?.some((item) => item?.slug === 'reconcile'), 'tools/tools-index.json: reconcile must remain registered');
}

// Public entry: active module runtime, product-scoped entitlement adapter, and explicit
// local-processing disclosure for transaction data.
has('tools/reconcile/index.html', /<script[^>]+src=["']\/assets\/nw-pro-entitlement\.js["'][^>]*><\/script>/i, 'shared entitlement adapter script');
has('tools/reconcile/index.html', /<script[^>]+type=["']module["'][^>]+src=["']\.\/?app\.mjs["'][^>]*><\/script>/i, 'active app.mjs module');
has('tools/reconcile/index.html', /Transaction data is not sent to NicheWorks|取引データはNicheWorksへ送信しません/i, 'visible local-processing disclosure');

// Runtime plan boundaries and exact paid authority.
has('tools/reconcile/app.mjs', "const FREE_MAX_ROWS = 500;");
has('tools/reconcile/app.mjs', "const RESULT_PAGE_SIZE = 250;");
has('tools/reconcile/app.mjs', "const PRO_CSV_MAX_ROWS = 100000;");
has('tools/reconcile/app.mjs', "const PRO_XLSX_MAX_ROWS = 50000;");
has('tools/reconcile/app.mjs', "const RECONCILE_PRODUCT_ID = 'reconcile.pro_v1';");
has('tools/reconcile/app.mjs', "const RECONCILE_FEATURE_ID = 'reconcile_pro_v1';");
has('tools/reconcile/app.mjs', /refreshProState\s*\(\s*\{[\s\S]*?productId:\s*RECONCILE_PRODUCT_ID,[\s\S]*?featureId:\s*RECONCILE_FEATURE_ID[\s\S]*?\}\s*\)/, 'server-backed product + feature entitlement check');
has('tools/reconcile/app.mjs', "fetch('/api/billing/create-checkout-session'", 'product-scoped checkout endpoint');
has('tools/reconcile/app.mjs', /JSON\.stringify\(\{\s*productId:\s*RECONCILE_PRODUCT_ID,\s*returnPath:\s*'\/tools\/reconcile\/'\s*\}\)/, 'checkout body limited to product and return path');
has('tools/reconcile/app.mjs', /checkoutUrl\.protocol\s*!==\s*'https:'\s*\|\|\s*checkoutUrl\.hostname\s*!==\s*'checkout\.stripe\.com'/, 'Stripe checkout host validation');

// Regression contract from #674: loaded CSV File stays page-local and remains available
// for encoding/delimiter reparses. This catches the previously reverted state wiring.
has('tools/reconcile/app.mjs', /readCsvFile\(current\.sourceFile\s*,/, 'reparse reads retained source File');
has('tools/reconcile/app.mjs', /sourceFile:\s*current\.sourceFile/, 'reparse preserves retained source File');
has('tools/reconcile/app.mjs', /async function loadCsv\(side, file\)[\s\S]*?sourceFile:\s*file[\s\S]*?\n\}/, 'initial CSV load retains source File');
has('tools/reconcile/tests/app-csv-reparse.test.mjs', /sourceFile:\\s\*current\\\.sourceFile|sourceFile:\\s\*current\.sourceFile/, 'CSV reparse regression test');

// Paid matching controls must collapse to Free-safe values when Reconcile Pro is inactive.
has('tools/reconcile/app.mjs', /amountTolerance:\s*state\.proEnabled\s*\?\s*Number\([^\n]+\)\s*:\s*0/, 'Free amount tolerance lock');
has('tools/reconcile/app.mjs', /signMode:\s*state\.proEnabled\s*\?\s*\$\('signMode'\)\.value\s*:\s*'normal'/, 'Free sign mode lock');
has('tools/reconcile/app.mjs', /groupMatching:\s*state\.proEnabled\s*\?\s*\$\('groupMatching'\)\.checked\s*:\s*false/, 'Free grouped matching lock');

// CSV parsing remains browser-local. XLSX stays on the pinned local vendor.
has('tools/reconcile/parser.mjs', /file\.arrayBuffer\(\)/, 'local File arrayBuffer parsing');
has('tools/reconcile/parser.mjs', /new TextDecoder\(/, 'browser TextDecoder parsing');
lacks('tools/reconcile/parser.mjs', /fetch\s*\(/, 'network CSV parsing');
has('tools/reconcile/xlsx-adapter.mjs', "export const EXPECTED_XLSX_VERSION = '0.20.3';");
has('tools/reconcile/xlsx-adapter.mjs', "export const DEFAULT_XLSX_VENDOR_URL = './vendor/xlsx.mini.min.js';");
lacks('tools/reconcile/xlsx-adapter.mjs', /https?:\/\//, 'runtime XLSX CDN URL');

// Saved profiles are configuration-only and bounded.
has('tools/reconcile/rules-store.mjs', "export const PROFILE_STORAGE_KEY = 'nw_reconcile_profiles_v1';");
has('tools/reconcile/rules-store.mjs', 'export const MAX_PROFILES = 20;');
lacks('tools/reconcile/rules-store.mjs', /\b(rawRows|rowsA|rowsB|sourceFile|xlsxSource)\b/, 'transaction/file payload in profile store');

// Billing product contract: standalone Reconcile purchase grants its own feature plus the
// shared bundle feature; no other product may reverse-grant Reconcile Pro.
const billing = readJson('config/billing/products.json');
if (billing) {
  const products = Array.isArray(billing.products) ? billing.products : [];
  const product = products.find((item) => item?.productId === 'reconcile.pro_v1');
  check(Boolean(product), 'config/billing/products.json: missing reconcile.pro_v1');
  if (product) {
    check(product.price?.amount === 3980, 'config/billing/products.json: Reconcile price must remain 3980');
    check(product.price?.currency === 'JPY', 'config/billing/products.json: Reconcile currency must remain JPY');
    check(product.price?.type === 'one_time', 'config/billing/products.json: Reconcile price type must remain one_time');
    const features = new Set(Array.isArray(product.features) ? product.features : []);
    check(features.has('reconcile_pro_v1'), 'config/billing/products.json: Reconcile product must grant reconcile_pro_v1');
    check(features.has('nicheworks_pro'), 'config/billing/products.json: Reconcile product must grant nicheworks_pro');
  }
  for (const other of products.filter((item) => item?.productId !== 'reconcile.pro_v1')) {
    check(!Array.isArray(other.features) || !other.features.includes('reconcile_pro_v1'), `config/billing/products.json: ${other.productId || 'unknown product'} must not grant reconcile_pro_v1`);
  }
}

// Stored Checkout Session IDs are restore inputs only; active state still comes from the
// server entitlement endpoint and requested feature membership.
has('assets/nw-pro-entitlement.js', "fetch(`/api/billing/entitlement?${params.toString()}`", 'server entitlement request');
has('assets/nw-pro-entitlement.js', /base\.active\s*&&\s*Array\.isArray\(base\.features\)\s*&&\s*base\.features\.includes\(featureId\)/, 'feature membership gate');
has('assets/nw-pro-entitlement.js', /stored\s*\?\s*'checkout-pending'\s*:\s*'restore-required'/, 'stored session is non-active pending state');

if (failures.length) {
  console.error(`Wave 7 runtime contract audit failed with ${failures.length} issue(s):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Wave 7 runtime contract audit passed for Reconcile (introduced as registered tool 88).');
