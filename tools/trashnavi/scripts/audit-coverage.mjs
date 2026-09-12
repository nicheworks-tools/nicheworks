#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(__filename);
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

const TYPE_MAP = new Map([
  ["自治体公式ページ", "municipal_home"],
  ["ごみ分別ページ", "waste_sorting"],
  ["収集カレンダー", "collection_calendar"],
  ["粗大ごみ", "bulky_waste"],
  ["検索ページ", "waste_search"]
]);

const KNOWN_CANONICAL_TYPES = [
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

const WASTE_SPECIFIC_TYPES = new Set(KNOWN_CANONICAL_TYPES.filter(type => type !== "municipal_home"));
const CORE_FIELDS = [
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

const args = new Set(process.argv.slice(2));
const jsonMode = args.has("--json");
const strictMode = args.has("--strict");

function readJsonFile(filePath) {
  const text = fs.readFileSync(filePath, "utf8");
  const value = JSON.parse(text);
  if (!Array.isArray(value)) {
    throw new Error("top-level JSON value must be an array");
  }
  return value;
}

function canonicalType(record) {
  const explicit = String(record.link_type || "").trim();
  if (explicit) {
    return KNOWN_CANONICAL_TYPES.includes(explicit) ? explicit : `unknown:${explicit}`;
  }

  const legacy = String(record.type || "").trim();
  if (!legacy) return "municipal_home";
  return TYPE_MAP.get(legacy) || `unknown:${legacy}`;
}

function identityKey(record) {
  const lgcode = String(record.lgcode || "").trim();
  if (lgcode) return `lgcode:${lgcode}`;
  return `name:${String(record.pref || "").trim()}\u0000${String(record.city || "").trim()}`;
}

function isHttpUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function getRuntimeDeclaredDataFiles() {
  if (!fs.existsSync(appPath)) return [];
  const text = fs.readFileSync(appPath, "utf8");
  const match = text.match(/const\s+DIRECT_LINK_FILES\s*=\s*\[(.*?)\]\s*;/s);
  if (!match) return [];
  return [...match[1].matchAll(/["']([^"']+)["']/g)].map(item => item[1]);
}

function prefRank(pref) {
  const idx = PREF_ORDER.indexOf(pref);
  return idx === -1 ? 999 : idx;
}

const jsonFiles = fs.readdirSync(dataDir)
  .filter(name => name.endsWith(".json"))
  .sort((a, b) => a.localeCompare(b, "ja"));

const parseErrors = [];
const sources = [];
const records = [];

for (const file of jsonFiles) {
  const fullPath = path.join(dataDir, file);
  try {
    const rows = readJsonFile(fullPath);
    sources.push({ file, records: rows.length, parsed: true });
    rows.forEach((record, index) => records.push({ record, source_file: file, source_index: index }));
  } catch (error) {
    sources.push({ file, records: null, parsed: false });
    parseErrors.push({ file, error: error instanceof Error ? error.message : String(error) });
  }
}

const invalidRecords = [];
const validRecords = [];
const unknownTypes = new Map();
const duplicateKeys = new Map();

for (const item of records) {
  const record = item.record && typeof item.record === "object" ? item.record : {};
  const pref = String(record.pref || "").trim();
  const city = String(record.city || "").trim();
  const url = String(record.url || "").trim();
  const type = canonicalType(record);
  const reasons = [];

  if (!pref) reasons.push("missing_pref");
  if (!city) reasons.push("missing_city");
  if (!isHttpUrl(url)) reasons.push("invalid_or_missing_url");

  if (reasons.length) {
    invalidRecords.push({
      source_file: item.source_file,
      source_index: item.source_index,
      reasons,
      pref,
      city,
      url
    });
    continue;
  }

  if (type.startsWith("unknown:")) {
    unknownTypes.set(type, (unknownTypes.get(type) || 0) + 1);
  }

  const normalized = {
    source_file: item.source_file,
    source_index: item.source_index,
    lgcode: String(record.lgcode || "").trim(),
    pref,
    city,
    name: String(record.name || "").trim(),
    url,
    canonical_type: type,
    identity: identityKey(record)
  };

  validRecords.push(normalized);

  const duplicateKey = `${normalized.identity}\u0000${type}\u0000${url}`;
  if (!duplicateKeys.has(duplicateKey)) duplicateKeys.set(duplicateKey, []);
  duplicateKeys.get(duplicateKey).push({ source_file: item.source_file, source_index: item.source_index });
}

const duplicateRecords = [...duplicateKeys.entries()]
  .filter(([, occurrences]) => occurrences.length > 1)
  .map(([key, occurrences]) => ({ key, occurrences }));

const municipalityMap = new Map();

for (const record of validRecords) {
  if (!municipalityMap.has(record.identity)) {
    municipalityMap.set(record.identity, {
      identity: record.identity,
      lgcode: record.lgcode,
      pref: record.pref,
      city: record.city,
      urls: new Set(),
      types: new Set(),
      source_files: new Set()
    });
  }

  const municipality = municipalityMap.get(record.identity);
  municipality.urls.add(record.url);
  municipality.types.add(record.canonical_type);
  municipality.source_files.add(record.source_file);
  if (!municipality.lgcode && record.lgcode) municipality.lgcode = record.lgcode;
}

const municipalities = [...municipalityMap.values()].map(municipality => {
  const typeFlags = Object.fromEntries(CORE_FIELDS.map(type => [type, municipality.types.has(type)]));
  const wasteTypes = [...municipality.types].filter(type => WASTE_SPECIFIC_TYPES.has(type));
  return {
    lgcode: municipality.lgcode,
    pref: municipality.pref,
    city: municipality.city,
    ...typeFlags,
    distinct_waste_link_types: wasteTypes.length,
    total_distinct_urls: municipality.urls.size,
    publish_candidate: wasteTypes.length >= 2,
    preferred_candidate: wasteTypes.length >= 3,
    source_files: [...municipality.source_files].sort()
  };
}).sort((a, b) => {
  const rankDiff = prefRank(a.pref) - prefRank(b.pref);
  if (rankDiff) return rankDiff;
  return `${a.city}`.localeCompare(`${b.city}`, "ja");
});

const typeCoverage = {};
for (const type of [...KNOWN_CANONICAL_TYPES, ...[...unknownTypes.keys()].sort()]) {
  const typeRecords = validRecords.filter(record => record.canonical_type === type);
  typeCoverage[type] = {
    records: typeRecords.length,
    municipalities: new Set(typeRecords.map(record => record.identity)).size
  };
}

const prefectureMap = new Map();
for (const municipality of municipalities) {
  if (!prefectureMap.has(municipality.pref)) {
    prefectureMap.set(municipality.pref, {
      prefecture: municipality.pref,
      municipalities: 0,
      with_official_home: 0,
      with_any_waste_link: 0,
      publish_candidates: 0,
      preferred_candidates: 0
    });
  }
  const row = prefectureMap.get(municipality.pref);
  row.municipalities += 1;
  if (municipality.municipal_home) row.with_official_home += 1;
  if (municipality.distinct_waste_link_types >= 1) row.with_any_waste_link += 1;
  if (municipality.publish_candidate) row.publish_candidates += 1;
  if (municipality.preferred_candidate) row.preferred_candidates += 1;
}

const prefectures = [...prefectureMap.values()].sort((a, b) => prefRank(a.prefecture) - prefRank(b.prefecture));

const runtimeDeclaredFiles = getRuntimeDeclaredDataFiles();
const runtimeMissingFiles = runtimeDeclaredFiles.filter(relativePath => !fs.existsSync(path.join(toolDir, relativePath)));
const discoveredDirectFiles = jsonFiles.filter(file => /^direct-waste-links.*\.json$/.test(file)).map(file => `data/${file}`);
const directFilesNotLoaded = discoveredDirectFiles.filter(relativePath => !runtimeDeclaredFiles.includes(relativePath));

const summary = {
  source_files: sources.length,
  parsed_source_files: sources.filter(source => source.parsed).length,
  total_records: records.length,
  valid_http_records: validRecords.length,
  invalid_records: invalidRecords.length,
  duplicate_record_groups: duplicateRecords.length,
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
  Object.entries(typeCoverage).forEach(([type, value]) => {
    console.log(`  - ${type}: ${value.records} records / ${value.municipalities} municipalities`);
  });
  console.log("");

  console.log("Prefecture coverage (municipalities / any-direct / publish-ready / preferred):");
  prefectures.forEach(row => {
    console.log(`  - ${row.prefecture}: ${row.municipalities} / ${row.with_any_waste_link} / ${row.publish_candidates} / ${row.preferred_candidates}`);
  });
}

if (strictMode) {
  const hasStrictFailure = parseErrors.length > 0 || invalidRecords.length > 0 || runtimeMissingFiles.length > 0 || directFilesNotLoaded.length > 0;
  if (hasStrictFailure) process.exitCode = 1;
}
