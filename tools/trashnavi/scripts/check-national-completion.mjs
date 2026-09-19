#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(scriptDir, "..");
const dataDir = path.join(toolDir, "data");

const localgovPath = path.join(dataDir, "localgovjp-lite.json");
const ledgerPath = path.join(dataDir, "municipality-review-ledger.json");
const manifestPath = path.join(toolDir, "municipality-page-manifest.json");

const FINAL_STATES = new Set(["standard", "limited", "joint_service", "reviewed_no_direct"]);
const PUBLISHABLE_STATES = new Set(["standard", "limited", "joint_service"]);
const ALL_STATES = new Set([...FINAL_STATES, "pending_review"]);

const LEGACY_TYPE_MAP = new Map([
  ["自治体公式ページ", "municipal_home"],
  ["公式サイト", "municipal_home"],
  ["ごみ分別ページ", "waste_sorting"],
  ["収集カレンダー", "collection_calendar"],
  ["粗大ごみ", "bulky_waste"],
  ["検索ページ", "waste_search"]
]);

const WASTE_TYPES = new Set([
  "waste_sorting",
  "collection_calendar",
  "bulky_waste",
  "bulky_application",
  "waste_search",
  "dropoff_facility",
  "waste_app",
  "special_disposal"
]);

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

function clean(value) {
  return String(value ?? "").trim();
}

function canonicalType(record) {
  const explicit = clean(record.link_type);
  if (explicit) return explicit;
  const legacy = clean(record.type);
  if (!legacy) return "municipal_home";
  return LEGACY_TYPE_MAP.get(legacy) || `unknown:${legacy}`;
}

function fail(message) {
  console.error(`TrashNavi national completion audit failed: ${message}`);
  process.exit(1);
}

const localgov = readJson(localgovPath);
const ledger = readJson(ledgerPath);
const manifest = readJson(manifestPath);

const phase1 = localgov.filter((row) => !clean(row.city).includes(" "));
const adminWards = localgov.filter((row) => clean(row.city).includes(" "));

if (phase1.length !== 1741) fail(`Phase 1 universe must be 1741; got ${phase1.length}`);
if (adminWards.length !== 175) fail(`designated-city administrative ward universe must be 175; got ${adminWards.length}`);
if (ledger.schema_version !== 1) fail(`unsupported ledger schema_version: ${ledger.schema_version}`);
if (ledger.phase1_target !== 1741) fail(`ledger phase1_target must be 1741; got ${ledger.phase1_target}`);
if (ledger.designated_city_administrative_wards_excluded !== 175) fail("ledger administrative-ward exclusion count must be 175");
if (ledger.count_semantics !== "minimum_verified_for_state") fail("ledger count_semantics must be minimum_verified_for_state");
if (!Array.isArray(ledger.municipalities)) fail("ledger.municipalities must be an array");
if (ledger.municipalities.length !== 1741) fail(`ledger must contain 1741 municipality rows; got ${ledger.municipalities.length}`);

const universeByCode = new Map(phase1.map((row) => [clean(row.lgcode), row]));
const ledgerByCode = new Map();

for (const row of ledger.municipalities) {
  const code = clean(row.lgcode);
  if (!code) fail("ledger row missing lgcode");
  if (ledgerByCode.has(code)) fail(`duplicate ledger lgcode: ${code}`);
  const canonical = universeByCode.get(code);
  if (!canonical) fail(`ledger contains non-Phase-1 lgcode: ${code}`);
  if (clean(row.pref) !== clean(canonical.pref)) fail(`${code}: prefecture identity drift`);
  if (clean(row.municipality) !== clean(canonical.city)) fail(`${code}: municipality identity drift`);
  if (!ALL_STATES.has(row.coverage_state)) fail(`${code}: invalid coverage_state ${row.coverage_state}`);
  ledgerByCode.set(code, row);
}

for (const code of universeByCode.keys()) {
  if (!ledgerByCode.has(code)) fail(`Phase 1 municipality missing from ledger: ${code}`);
}

const directFiles = fs.readdirSync(dataDir)
  .filter((name) => /^direct-waste-links.*\.json$/.test(name))
  .sort();

const sourceStats = new Map();

for (const name of directFiles) {
  const records = readJson(path.join(dataDir, name));
  if (!Array.isArray(records)) fail(`${name}: expected array`);
  for (const record of records) {
    const code = clean(record.lgcode);
    const url = clean(record.url);
    const type = canonicalType(record);
    if (!universeByCode.has(code)) continue;
    if (!WASTE_TYPES.has(type)) continue;
    if (!/^https?:\/\//.test(url)) continue;
    if (!sourceStats.has(code)) sourceStats.set(code, { urls: new Set(), types: new Set() });
    const stats = sourceStats.get(code);
    stats.urls.add(url);
    stats.types.add(type);
  }
}

const published = manifest.filter((entry) => entry.publish);
const publishedCodes = new Set();

for (const entry of published) {
  const code = clean(entry.lgcode);
  if (publishedCodes.has(code)) fail(`duplicate published manifest lgcode: ${code}`);
  publishedCodes.add(code);
  const ledgerRow = ledgerByCode.get(code);
  if (!ledgerRow) fail(`published manifest lgcode is outside Phase 1 ledger: ${code}`);
  if (!PUBLISHABLE_STATES.has(ledgerRow.coverage_state)) {
    fail(`${code}: published page has non-publishable state ${ledgerRow.coverage_state}`);
  }
}

const migrationDiagnostics = [];
for (const code of publishedCodes) {
  const row = ledgerByCode.get(code);
  const stats = sourceStats.get(code) || { urls: new Set(), types: new Set() };
  if (row?.coverage_state === "standard" && (stats.urls.size < 3 || stats.types.size < 3)) {
    migrationDiagnostics.push({
      lgcode: code,
      municipality: row.municipality,
      actual_urls: stats.urls.size,
      actual_types: stats.types.size,
      recommended_state: stats.urls.size >= 1 && stats.types.size >= 1 ? "limited" : "reviewed_no_direct"
    });
  }
}
if (migrationDiagnostics.length) {
  console.log("Legacy publication rows requiring state migration:");
  console.log(JSON.stringify(migrationDiagnostics, null, 2));
}

const stateCounts = Object.fromEntries([...ALL_STATES].map((state) => [state, 0]));
let reviewed = 0;

for (const [code, row] of ledgerByCode) {
  stateCounts[row.coverage_state] += 1;
  const stats = sourceStats.get(code) || { urls: new Set(), types: new Set() };
  const actualUrls = stats.urls.size;
  const actualTypes = stats.types.size;
  const minSources = Number(row.qualifying_source_count);
  const minTypes = Number(row.distinct_link_type_count);

  if (!Number.isInteger(minSources) || minSources < 0) fail(`${code}: invalid qualifying_source_count`);
  if (!Number.isInteger(minTypes) || minTypes < 0) fail(`${code}: invalid distinct_link_type_count`);
  if (minSources > actualUrls) fail(`${code}: ledger source minimum ${minSources} exceeds actual qualifying URLs ${actualUrls}`);
  if (minTypes > actualTypes) fail(`${code}: ledger type minimum ${minTypes} exceeds actual qualifying types ${actualTypes}`);

  if (row.coverage_state === "pending_review") {
    if (row.reviewed_at !== null) fail(`${code}: pending_review must have reviewed_at=null`);
    if (publishedCodes.has(code)) fail(`${code}: pending_review must not be published`);
    continue;
  }

  reviewed += 1;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(clean(row.reviewed_at))) fail(`${code}: final state requires YYYY-MM-DD reviewed_at`);

  if (row.coverage_state === "standard") {
    if (actualUrls < 3 || actualTypes < 3) fail(`${code}: standard requires >=3 URLs and >=3 types; got ${actualUrls}/${actualTypes}`);
    if (minSources < 3 || minTypes < 3) fail(`${code}: standard ledger minimum must be >=3/3`);
  }

  if (row.coverage_state === "limited") {
    if (actualUrls < 1 || actualTypes < 1) fail(`${code}: limited requires at least one qualifying source`);
    if (actualUrls >= 3 && actualTypes >= 3) fail(`${code}: limited already satisfies standard threshold`);
    if (minSources < 1 || minTypes < 1) fail(`${code}: limited ledger minimum must be >=1/1`);
  }

  if (row.coverage_state === "joint_service") {
    if (actualUrls < 1 || actualTypes < 1) fail(`${code}: joint_service requires at least one qualifying source`);
    if (!clean(row.service_provider)) fail(`${code}: joint_service requires service_provider`);
  }

  if (row.coverage_state === "reviewed_no_direct") {
    if (actualUrls !== 0 || actualTypes !== 0) fail(`${code}: reviewed_no_direct cannot have qualifying direct sources`);
    if (!clean(row.review_note)) fail(`${code}: reviewed_no_direct requires review_note`);
    if (publishedCodes.has(code)) fail(`${code}: reviewed_no_direct must not be published`);
  }

  if (PUBLISHABLE_STATES.has(row.coverage_state) && !publishedCodes.has(code)) {
    fail(`${code}: ${row.coverage_state} must have a published manifest entry`);
  }
}

const finalStateTotal = [...FINAL_STATES].reduce((sum, state) => sum + stateCounts[state], 0);
if (reviewed !== finalStateTotal) fail("reviewed count does not reconcile with final states");
if (reviewed + stateCounts.pending_review !== 1741) fail("state counts do not reconcile to 1741");

const summary = {
  status: "pass",
  phase1_target: 1741,
  reviewed,
  pending_review: stateCounts.pending_review,
  completion_percent: Number(((reviewed / 1741) * 100).toFixed(2)),
  published_pages: published.length,
  states: stateCounts,
  designated_city_administrative_wards_deferred: 175,
  direct_datasets: directFiles.length
};

console.log(JSON.stringify(summary, null, 2));
