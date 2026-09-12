#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const toolDir = path.resolve(scriptDir, "..");
const dataDir = path.join(toolDir, "data");
const appPath = path.join(toolDir, "app.js");

const PREF_ORDER = [
  "北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県",
  "茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県",
  "新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県",
  "静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県",
  "奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県",
  "徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県",
  "熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

const LEGACY_TYPE_MAP = new Map([
  ["自治体公式ページ", "municipal_home"],
  ["公式サイト", "municipal_home"],
  ["ごみ分別ページ", "waste_sorting"],
  ["収集カレンダー", "collection_calendar"],
  ["粗大ごみ", "bulky_waste"],
  ["検索ページ", "waste_search"]
]);

const CANONICAL_TYPES = [
  "municipal_home",
  "waste_sorting",
  "collection_calendar",
  "bulky_waste",
  "bulky_application",
  "waste_search",
  "dropoff_facility",
  "waste_app",
  "special_disposal"
];
const WASTE_TYPES = new Set(CANONICAL_TYPES.filter(type => type !== "municipal_home"));
const args = new Set(process.argv.slice(2));
const jsonMode = args.has("--json");
const strictMode = args.has("--strict");

function clean(value) {
  return String(value ?? "").trim();
}

function nameKey(pref, city) {
  return `${pref}\u0000${city}`;
}

function prefRank(pref) {
  const index = PREF_ORDER.indexOf(pref);
  return index === -1 ? 999 : index;
}

function canonicalType(record) {
  const explicit = clean(record.link_type);
  if (explicit) return CANONICAL_TYPES.includes(explicit) ? explicit : `unknown:${explicit}`;
  const legacy = clean(record.type);
  if (!legacy) return "municipal_home";
  return LEGACY_TYPE_MAP.get(legacy) || `unknown:${legacy}`;
}

function getRuntimeDeclaredDirectFiles() {
  if (!fs.existsSync(appPath)) return [];
  const text = fs.readFileSync(appPath, "utf8");
  const match = text.match(/const\s+DIRECT_LINK_FILES\s*=\s*\[(.*?)\]\s*;/s);
  if (!match) return [];
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map(matchItem => matchItem[1]);
}

const jsonFiles = fs.readdirSync(dataDir)
  .filter(file => file.endsWith(".json"))
  .sort((a, b) => a.localeCompare(b, "ja"));

const sources = [];
const parseErrors = [];
const rawItems = [];

for (const file of jsonFiles) {
  try {
    const parsed = JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
    if (!Array.isArray(parsed)) throw new Error("top-level JSON value must be an array");
    sources.push({ file, parsed: true, records: parsed.length });
    parsed.forEach((record, index) => rawItems.push({ file, index, record }));
  } catch (error) {
    sources.push({ file, parsed: false, records: null });
    parseErrors.push({ file, error: error instanceof Error ? error.message : String(error) });
  }
}

// Old supplementary files often omit lgcode. Resolve them through the nationwide
// municipality master when pref + city maps to exactly one known lgcode.
const codesByName = new Map();
for (const { record } of rawItems) {
  if (!record || typeof record !== "object") continue;
  const pref = clean(record.pref);
  const city = clean(record.city);
  const lgcode = clean(record.lgcode);
  if (!pref || !city || !lgcode) continue;
  const key = nameKey(pref, city);
  if (!codesByName.has(key)) codesByName.set(key, new Set());
  codesByName.get(key).add(lgcode);
}

const ambiguousNameKeys = [...codesByName.entries()]
  .filter(([, codes]) => codes.size > 1)
  .map(([key, codes]) => ({ key, lgcodes: [...codes].sort() }));

function resolveIdentity(pref, city, explicitLgcode) {
  if (explicitLgcode) return { id: `lgcode:${explicitLgcode}`, lgcode: explicitLgcode, inferred: false };
  const codes = codesByName.get(nameKey(pref, city));
  if (codes?.size === 1) {
    const [lgcode] = codes;
    return { id: `lgcode:${lgcode}`, lgcode, inferred: true };
  }
  return { id: `name:${nameKey(pref, city)}`, lgcode: "", inferred: false };
}

const invalidRecords = [];
const validRecords = [];
const unknownTypes = new Map();
const duplicateMap = new Map();
let inferredLgcodeRecords = 0;

for (const item of rawItems) {
  const record = item.record && typeof item.record === "object" ? item.record : {};
  const pref = clean(record.pref);
  const city = clean(record.city);
  const url = clean(record.url);
  const explicitLgcode = clean(record.lgcode);
  const type = canonicalType(record);
  const reasons = [];

  if (!pref) reasons.push("missing_pref");
  if (!city) reasons.push("missing_city");
  if (!/^https?:\/\//i.test(url)) reasons.push("invalid_or_missing_url");

  if (reasons.length) {
    invalidRecords.push({ source_file: item.file, source_index: item.index, pref, city, url, reasons });
    continue;
  }

  const identity = resolveIdentity(pref, city, explicitLgcode);
  if (identity.inferred) inferredLgcodeRecords += 1;
  if (type.startsWith("unknown:")) unknownTypes.set(type, (unknownTypes.get(type) || 0) + 1);

  const normalized = {
    source_file: item.file,
    source_index: item.index,
    pref,
    city,
    lgcode: identity.lgcode,
    lgcode_inferred: identity.inferred,
    identity: identity.id,
    canonical_type: type,
    name: clean(record.name),
    url
  };
  validRecords.push(normalized);

  const duplicateKey = `${identity.id}\u0000${type}\u0000${url}`;
  if (!duplicateMap.has(duplicateKey)) duplicateMap.set(duplicateKey, []);
  duplicateMap.get(duplicateKey).push({ source_file: item.file, source_index: item.index });
}

const duplicateRecords = [...duplicateMap.entries()]
  .filter(([, occurrences]) => occurrences.length > 1)
  .map(([key, occurrences]) => ({ key, occurrences }));

const municipalityMap = new Map();
for (const record of validRecords) {
  if (!municipalityMap.has(record.identity)) {
    municipalityMap.set(record.identity, {
      lgcode: record.lgcode,
      pref: record.pref,
      city: record.city,
      urls: new Set(),
      types: new Set(),
      sourceFiles: new Set()
    });
  }
  const municipality = municipalityMap.get(record.identity);
  municipality.urls.add(record.url);
  municipality.types.add(record.canonical_type);
  municipality.sourceFiles.add(record.source_file);
  if (!municipality.lgcode && record.lgcode) municipality.lgcode = record.lgcode;
}

const municipalities = [...municipalityMap.values()].map(municipality => {
  const flags = Object.fromEntries(CANONICAL_TYPES.map(type => [type, municipality.types.has(type)]));
  const wasteTypeCount = [...municipality.types].filter(type => WASTE_TYPES.has(type)).length;
  return {
    lgcode: municipality.lgcode,
    pref: municipality.pref,
    city: municipality.city,
    ...flags,
    distinct_waste_link_types: wasteTypeCount,
    total_distinct_urls: municipality.urls.size,
    publish_candidate: wasteTypeCount >= 2,
    preferred_candidate: wasteTypeCount >= 3,
    source_files: [...municipality.sourceFiles].sort()
  };
}).sort((a, b) => prefRank(a.pref) - prefRank(b.pref) || a.city.localeCompare(b.city, "ja"));

const typeCoverage = {};
for (const type of [...CANONICAL_TYPES, ...[...unknownTypes.keys()].sort()]) {
  const rows = validRecords.filter(record => record.canonical_type === type);
  typeCoverage[type] = {
    records: rows.length,
    municipalities: new Set(rows.map(record => record.identity)).size
  };
}

const prefMap = new Map();
for (const municipality of municipalities) {
  if (!prefMap.has(municipality.pref)) {
    prefMap.set(municipality.pref, {
      prefecture: municipality.pref,
      municipalities: 0,
      with_official_home: 0,
      with_any_waste_link: 0,
      publish_candidates: 0,
      preferred_candidates: 0
    });
  }
  const row = prefMap.get(municipality.pref);
  row.municipalities += 1;
  if (municipality.municipal_home) row.with_official_home += 1;
  if (municipality.distinct_waste_link_types >= 1) row.with_any_waste_link += 1;
  if (municipality.publish_candidate) row.publish_candidates += 1;
  if (municipality.preferred_candidate) row.preferred_candidates += 1;
}
const prefectures = [...prefMap.values()].sort((a, b) => prefRank(a.prefecture) - prefRank(b.prefecture));

const runtimeDeclaredFiles = getRuntimeDeclaredDirectFiles();
const runtimeMissingFiles = runtimeDeclaredFiles.filter(file => !fs.existsSync(path.join(toolDir, file)));
const discoveredDirectFiles = jsonFiles
  .filter(file => /^direct-waste-links.*\.json$/.test(file))
  .map(file => `data/${file}`);
const directFilesNotLoaded = discoveredDirectFiles.filter(file => !runtimeDeclaredFiles.includes(file));

const summary = {
  source_files: sources.length,
  parsed_source_files: sources.filter(source => source.parsed).length,
  total_records: rawItems.length,
  valid_http_records: validRecords.length,
  invalid_records: invalidRecords.length,
  duplicate_record_groups: duplicateRecords.length,
  records_with_inferred_lgcode: inferredLgcodeRecords,
  ambiguous_pref_city_identity_keys: ambiguousNameKeys.length,
  municipalities: municipalities.length,
  with_official_home: municipalities.filter(row => row.municipal_home).length,
  with_any_waste_link: municipalities.filter(row => row.distinct_waste_link_types >= 1).length,
  with_two_plus_waste_link_types: municipalities.filter(row => row.distinct_waste_link_types >= 2).length,
  with_three_plus_waste_link_types: municipalities.filter(row => row.distinct_waste_link_types >= 3).length,
  runtime_missing_files: runtimeMissingFiles.length,
  direct_files_not_loaded: directFilesNotLoaded.length,
  unknown_type_labels: unknownTypes.size
};

const report = {
  generated_at: new Date().toISOString(),
  contract: {
    publish_candidate_min_distinct_waste_types: 2,
    preferred_candidate_min_distinct_waste_types: 3,
    generic_municipal_home_excluded_from_threshold: true
  },
  summary,
  runtime: {
    declared_direct_link_files: runtimeDeclaredFiles,
    missing_declared_files: runtimeMissingFiles,
    discovered_direct_link_files_not_loaded: directFilesNotLoaded
  },
  sources,
  type_coverage: typeCoverage,
  prefectures,
  municipalities,
  data_quality: {
    parse_errors: parseErrors,
    invalid_records: invalidRecords,
    duplicate_records: duplicateRecords,
    ambiguous_pref_city_identity_keys: ambiguousNameKeys,
    unknown_types: Object.fromEntries([...unknownTypes.entries()].sort())
  }
};

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("TrashNavi coverage audit");
  console.log("========================");
  console.log(`Source files: ${summary.parsed_source_files}/${summary.source_files} parsed`);
  console.log(`Records: ${summary.valid_http_records}/${summary.total_records} valid HTTP(S)`);
  console.log(`Municipalities: ${summary.municipalities}`);
  console.log(`Official-home coverage: ${summary.with_official_home}`);
  console.log(`Any waste-specific direct link: ${summary.with_any_waste_link}`);
  console.log(`2+ distinct waste types (publish candidates): ${summary.with_two_plus_waste_link_types}`);
  console.log(`3+ distinct waste types (preferred candidates): ${summary.with_three_plus_waste_link_types}`);
  console.log(`Legacy records joined by inferred lgcode: ${summary.records_with_inferred_lgcode}`);
  console.log(`Invalid records: ${summary.invalid_records}`);
  console.log(`Duplicate groups: ${summary.duplicate_record_groups}`);
  console.log(`Unknown type labels: ${summary.unknown_type_labels}`);
  console.log("");

  if (runtimeMissingFiles.length) {
    console.log("Runtime-declared data files missing:");
    runtimeMissingFiles.forEach(file => console.log(`  - ${file}`));
    console.log("");
  }
  if (directFilesNotLoaded.length) {
    console.log("Direct-link datasets present but not loaded by app.js:");
    directFilesNotLoaded.forEach(file => console.log(`  - ${file}`));
    console.log("");
  }

  console.log("Coverage by canonical type:");
  for (const [type, value] of Object.entries(typeCoverage)) {
    console.log(`  - ${type}: ${value.records} records / ${value.municipalities} municipalities`);
  }
  console.log("");

  console.log("Prefecture coverage (municipalities / any-direct / publish-ready / preferred):");
  prefectures.forEach(row => {
    console.log(`  - ${row.prefecture}: ${row.municipalities} / ${row.with_any_waste_link} / ${row.publish_candidates} / ${row.preferred_candidates}`);
  });
}

if (strictMode) {
  const strictFailure = parseErrors.length > 0
    || invalidRecords.length > 0
    || runtimeMissingFiles.length > 0
    || directFilesNotLoaded.length > 0
    || ambiguousNameKeys.length > 0;
  if (strictFailure) process.exitCode = 1;
}
