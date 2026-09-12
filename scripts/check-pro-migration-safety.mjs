import fs from 'node:fs';

const read = (path) => fs.readFileSync(path, 'utf8');
const fail = (message) => {
  console.error(`PRO_MIGRATION_SAFETY_FAIL: ${message}`);
  process.exitCode = 1;
};
const requireText = (text, needle, label) => {
  if (!text.includes(needle)) fail(`${label}: missing required contract: ${needle}`);
};
const forbidText = (text, needle, label) => {
  if (text.includes(needle)) fail(`${label}: forbidden legacy/bypass contract remains: ${needle}`);
};

const logisticsPath = 'tools/logistics-compliance-kit-jp/pro-bridge.js';
const sqlPath = 'tools/sql-db-risk-checker/pro-bridge.js';
const ogAppPath = 'tools/og-image-maker/app.js';
const ogBridgePath = 'tools/og-image-maker/pro-bridge.js';
const ogIndexPath = 'tools/og-image-maker/index.html';
const ledgerPath = 'PRO_MIGRATION_LEDGER.md';

const logistics = read(logisticsPath);
forbidText(logistics, 'nw_pro_logistics-compliance-kit-jp', logisticsPath);
forbidText(logistics, 'hasLegacyFallback', logisticsPath);
requireText(logistics, 'status && status.active', logisticsPath);
requireText(logistics, 'status.entitlement === ENTITLEMENT', logisticsPath);

const sql = read(sqlPath);
// Reject the original entitlement-only bypass while allowing the safe
// entitlement compatibility expression: !status.entitlement || status.entitlement === ENTITLEMENT.
forbidText(sql, '|| status.entitlement === "nicheworks_pro"', sqlPath);
requireText(sql, 'const entitlementMatches = !status.entitlement || status.entitlement === ENTITLEMENT;', sqlPath);
requireText(sql, 'hasExplicitActiveState', sqlPath);
requireText(sql, 'entitlementMatches && hasExplicitActiveState', sqlPath);

const ogApp = read(ogAppPath);
const ogBridge = read(ogBridgePath);
const ogIndex = read(ogIndexPath);
// If the historical template-local nw_pro_key helper still exists, the public
// page must override it before DOMContentLoaded initializes the batch UI. A
// future cleanup may delete nw_pro_key entirely; that stronger state is valid.
if (ogApp.includes('nw_pro_key')) {
  requireText(ogIndex, '<script src="/assets/nw-pro.js"></script>', ogIndexPath);
  const appPos = ogIndex.indexOf('<script src="./app.js"></script>');
  const bridgePos = ogIndex.indexOf('<script src="./pro-bridge.js"></script>');
  if (appPos < 0 || bridgePos < 0 || bridgePos <= appPos) {
    fail(`${ogIndexPath}: pro-bridge.js must load after app.js while the historical NW.hasPro helper remains`);
  }
  requireText(ogBridge, 'window.NW.hasPro = hasSharedPro', ogBridgePath);
  requireText(ogBridge, 'status.active', ogBridgePath);
  requireText(ogBridge, 'status.entitlement === ENTITLEMENT', ogBridgePath);
  forbidText(ogBridge, 'nw_pro_key', ogBridgePath);
}

const ledger = read(ledgerPath);
const rows = ledger.split('\n').filter((line) => /^\|\s*\d+\s*\|/.test(line));
if (rows.length !== 42) fail(`${ledgerPath}: expected exactly 42 numbered tool rows, found ${rows.length}`);
requireText(ledger, 'Current `PRODUCT_SCOPED`: **0**', ledgerPath);
requireText(ledger, 'Unresolved tool-specific `BYPASS_RISK` after this audit: **0**', ledgerPath);

if (!process.exitCode) {
  console.log('Pro migration safety contracts: OK');
}
