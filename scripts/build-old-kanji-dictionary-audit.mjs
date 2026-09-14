import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const referenceDir = path.join(root, 'tools', 'old-kanji-reference');
const dictPath = path.join(referenceDir, 'dict.json');
const compatibilityPath = path.join(referenceDir, 'compatibility-notes.json');
const auditPath = path.join(referenceDir, 'dictionary-audit.json');
const metaFiles = ['meta.json', 'meta-extra-2.json', 'meta-extra-3.json', 'meta-extra-4.json', 'meta-extra-5.json', 'meta-extra-6.json'];
const CLASS_ORDER = ['old_to_modern', 'variant', 'compatibility', 'identity', 'unresolved'];

function readText(file) {
  return fs.readFileSync(file, 'utf8');
}

function readJson(file) {
  return JSON.parse(readText(file));
}

function sha256(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function extractObjectBody(raw, propertyName) {
  const marker = `"${propertyName}"`;
  const markerIndex = raw.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing ${propertyName} in dict.json`);
  const start = raw.indexOf('{', markerIndex + marker.length);
  if (start < 0) throw new Error(`Missing object start for ${propertyName}`);
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < raw.length; i += 1) {
    const ch = raw[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') {
      inString = true;
      continue;
    }
    if (ch === '{') depth += 1;
    if (ch === '}') {
      depth -= 1;
      if (depth === 0) return raw.slice(start + 1, i);
    }
  }
  throw new Error(`Unclosed object for ${propertyName}`);
}

function rawObjectEntries(raw, propertyName) {
  const body = extractObjectBody(raw, propertyName);
  const entries = [];
  const pattern = /"((?:\\.|[^"\\])*)"\s*:\s*("(?:\\.|[^"\\])*"|\[[^\]]*\])/g;
  let match;
  while ((match = pattern.exec(body)) !== null) {
    const key = JSON.parse(`"${match[1]}"`);
    const value = JSON.parse(match[2]);
    entries.push({ key, value });
  }
  return entries;
}

function buildRawDuplicateLedger(entries) {
  const grouped = new Map();
  for (const entry of entries) {
    if (!grouped.has(entry.key)) grouped.set(entry.key, []);
    grouped.get(entry.key).push(entry.value);
  }
  return [...grouped.entries()]
    .filter(([, values]) => values.length > 1)
    .map(([key, values]) => ({
      key,
      occurrences: values.length,
      values,
      conflicting: new Set(values.map((value) => JSON.stringify(value))).size > 1
    }));
}

function loadMetadata() {
  const merged = new Map();
  const sourceFile = new Map();
  const duplicateKeys = [];
  for (const file of metaFiles) {
    const filePath = path.join(referenceDir, file);
    const json = readJson(filePath);
    for (const [key, value] of Object.entries(json.entries || {})) {
      if (merged.has(key)) duplicateKeys.push({ key, previous: sourceFile.get(key), next: file });
      merged.set(key, value || {});
      sourceFile.set(key, file);
    }
  }
  return { merged, sourceFile, duplicateKeys };
}

function isCompatibilityCodePoint(source) {
  const chars = Array.from(source || '');
  if (chars.length !== 1) return false;
  const cp = chars[0].codePointAt(0);
  return cp >= 0xF900 && cp <= 0xFAFF;
}

function hasCompatibilityEvidence(note) {
  return Array.isArray(note?.riskTypes) && note.riskTypes.includes('compatibility-ideograph');
}

function hasVariantEvidence(meta, note) {
  const haystack = [
    meta?.sourceNote,
    note?.technicalJa,
    note?.technicalEn,
    note?.summaryJa,
    note?.summaryEn
  ].filter(Boolean).join(' ').toLowerCase();
  return haystack.includes('異体字') || haystack.includes('variant');
}

function hasVerifiedOldToModernEvidence(meta, target) {
  if (!meta || meta.verified !== true || meta.dataStatus !== 'verified') return false;
  if (meta.modern !== target) return false;
  const note = String(meta.sourceNote || '');
  return note.includes('旧字体・新字体対応') || (note.includes('旧字体') && note.includes('新字体'));
}

function standaloneSignals(meta, note) {
  if (!meta || meta.verified !== true || meta.dataStatus !== 'verified') return [];
  const signals = [];
  if (meta.readingJa || meta.readingEn) signals.push('reading');
  if (meta.meaningJa || meta.meaningEn) signals.push('meaning');
  if (meta.usageJa || meta.usageEn) signals.push('usage');
  if (meta.sourceNote) signals.push('source_note');
  if (note) signals.push('compatibility_note');
  return signals;
}

function classifyRecord({ source, target, meta, note, duplicate, forwardIssues }) {
  const evidence = [];
  const issues = [...forwardIssues];

  if (duplicate) {
    evidence.push(duplicate.conflicting ? 'raw_conflicting_duplicate' : 'raw_duplicate_same_value');
    if (duplicate.conflicting) issues.push('conflicting_duplicate_key');
  }
  if (meta?.modern && meta.modern !== target) issues.push('metadata_modern_mismatch');
  if (note?.modern && note.modern !== target) issues.push('compatibility_note_modern_mismatch');

  if (source === target) evidence.push('mapping_identity');
  else evidence.push('mapping_changes_character');

  const compatibilityRange = isCompatibilityCodePoint(source);
  const compatibilityNote = hasCompatibilityEvidence(note);
  if (compatibilityRange) evidence.push('unicode_cjk_compatibility_range');
  if (compatibilityNote) evidence.push('repository_compatibility_note');

  const variantEvidence = hasVariantEvidence(meta, note);
  if (variantEvidence) evidence.push('repository_variant_wording');

  const verifiedOldPair = hasVerifiedOldToModernEvidence(meta, target);
  if (verifiedOldPair) evidence.push('verified_metadata_old_to_modern');

  const classificationBlockingIssues = new Set([
    'conflicting_duplicate_key',
    'metadata_modern_mismatch',
    'compatibility_note_modern_mismatch',
    'reverse_mapping_missing',
    'reverse_target_mismatch'
  ]);

  let classification;
  if (issues.some((issue) => classificationBlockingIssues.has(issue))) {
    classification = 'unresolved';
  } else if (source === target) {
    classification = 'identity';
  } else if (compatibilityRange || compatibilityNote) {
    classification = 'compatibility';
  } else if (variantEvidence) {
    classification = 'variant';
  } else if (verifiedOldPair) {
    classification = 'old_to_modern';
  } else {
    classification = 'unresolved';
  }

  const signals = standaloneSignals(meta, note);
  const seoCandidate = !['identity', 'unresolved'].includes(classification) &&
    issues.length === 0 &&
    meta?.verified === true &&
    meta?.dataStatus === 'verified' &&
    meta?.modern === target &&
    signals.length >= 2;

  let seoGate = 'candidate_requires_search_demand';
  if (classification === 'identity') seoGate = 'blocked_identity_mapping';
  else if (classification === 'unresolved') seoGate = 'blocked_unresolved_classification';
  else if (issues.length) seoGate = 'blocked_data_quality_issue';
  else if (!seoCandidate) seoGate = 'blocked_insufficient_standalone_data';

  return { classification, evidence, issues: [...new Set(issues)], standaloneSignals: signals, seoCandidate, seoGate };
}

export function buildAudit() {
  const dictRaw = readText(dictPath);
  const dict = JSON.parse(dictRaw);
  const oldToNew = dict.old_to_new || {};
  const newToOld = dict.new_to_old || {};
  const rawOldEntries = rawObjectEntries(dictRaw, 'old_to_new');
  const rawDuplicates = buildRawDuplicateLedger(rawOldEntries);
  const duplicateByKey = new Map(rawDuplicates.map((item) => [item.key, item]));
  const { merged: metadata, sourceFile: metadataSource, duplicateKeys: metadataDuplicateKeys } = loadMetadata();
  const compatibilityJson = readJson(compatibilityPath);
  const compatibility = compatibilityJson.entries || {};

  const reverseIssues = [];
  const forwardIssuesBySource = new Map();
  const addForwardIssue = (source, issue) => {
    if (!forwardIssuesBySource.has(source)) forwardIssuesBySource.set(source, []);
    forwardIssuesBySource.get(source).push(issue);
  };

  // Identity mappings do not need a self-reference in new_to_old. The reverse
  // table is a conversion-candidate table, so requiring X -> [X] would create
  // noise rather than a useful integrity check.
  for (const [source, target] of Object.entries(oldToNew)) {
    if (source === target) continue;
    const reverse = Array.isArray(newToOld[target]) ? newToOld[target] : [];
    if (!reverse.includes(source)) {
      reverseIssues.push({ type: 'forward_missing_from_reverse', source, target });
      addForwardIssue(source, 'reverse_mapping_missing');
    }
  }
  for (const [target, sources] of Object.entries(newToOld)) {
    for (const source of Array.isArray(sources) ? sources : []) {
      if (!Object.prototype.hasOwnProperty.call(oldToNew, source)) {
        reverseIssues.push({ type: 'reverse_source_missing_forward', source, target });
        continue;
      }
      if (oldToNew[source] !== target) {
        reverseIssues.push({ type: 'reverse_target_mismatch', source, target, forwardTarget: oldToNew[source] });
        addForwardIssue(source, 'reverse_target_mismatch');
      }
    }
  }

  const records = Object.entries(oldToNew).map(([source, target]) => {
    const meta = metadata.get(source) || null;
    const note = compatibility[source] || null;
    const result = classifyRecord({
      source,
      target,
      meta,
      note,
      duplicate: duplicateByKey.get(source) || null,
      forwardIssues: forwardIssuesBySource.get(source) || []
    });
    return {
      source,
      target,
      classification: result.classification,
      evidence: result.evidence,
      issues: result.issues,
      metadata: meta ? {
        sourceFile: metadataSource.get(source),
        verified: meta.verified === true,
        dataStatus: meta.dataStatus || null,
        confidence: meta.confidence || null,
        category: meta.category || null,
        modernMatchesMapping: meta.modern === target
      } : null,
      compatibility: note ? {
        riskLevel: note.riskLevel || null,
        riskTypes: Array.isArray(note.riskTypes) ? note.riskTypes : [],
        modernMatchesMapping: !note.modern || note.modern === target
      } : null,
      standaloneSignals: result.standaloneSignals,
      seoCandidate: result.seoCandidate,
      seoGate: result.seoGate
    };
  });

  const classes = Object.fromEntries(CLASS_ORDER.map((key) => [key, records.filter((record) => record.classification === key).length]));
  const identityMappings = records.filter((record) => record.classification === 'identity').map(({ source, target }) => ({ source, target }));
  const unresolvedRecords = records.filter((record) => record.classification === 'unresolved').map(({ source, target, evidence, issues, seoGate }) => ({ source, target, evidence, issues, seoGate }));
  const issueRecords = records.filter((record) => record.issues.length > 0).map(({ source, target, classification, issues }) => ({ source, target, classification, issues }));
  const seoCandidates = records.filter((record) => record.seoCandidate).map((record) => record.source);

  const sourceFiles = ['dict.json', ...metaFiles, 'compatibility-notes.json'];
  const sourceDigests = Object.fromEntries(sourceFiles.map((file) => [file, sha256(readText(path.join(referenceDir, file)))]));

  return {
    version: '2026-09-14-okj-dictionary-audit-1',
    basis: 'repository_only',
    sourceDigests,
    classificationRules: {
      precedence: ['data_quality_conflict=>unresolved', 'identity', 'compatibility', 'variant', 'verified_metadata_old_to_modern', 'unresolved'],
      compatibility: 'Unicode U+F900–U+FAFF or existing compatibility note riskTypes includes compatibility-ideograph',
      variant: 'existing repository metadata/compatibility wording explicitly says 異体字 or variant',
      old_to_modern: 'verified metadata modern target matches dict and sourceNote explicitly describes old/new-form correspondence',
      identity: 'source equals mapped target; self-reference in new_to_old is not required',
      unresolved: 'repository evidence is insufficient or data-quality conflicts exist',
      seoCandidate: 'non-identity/non-unresolved classification + no issues + verified matching metadata + at least two standalone repository signals; publication still requires actual search demand'
    },
    summary: {
      canonicalOldToNewRecords: records.length,
      rawOldToNewEntries: rawOldEntries.length,
      classes,
      identityMappings: identityMappings.length,
      unresolvedRecords: unresolvedRecords.length,
      rawDuplicateKeys: rawDuplicates.length,
      conflictingRawDuplicateKeys: rawDuplicates.filter((item) => item.conflicting).length,
      metadataDuplicateKeys: metadataDuplicateKeys.length,
      reverseIssues: reverseIssues.length,
      issueRecords: issueRecords.length,
      seoCandidates: seoCandidates.length
    },
    rawDuplicateKeys: rawDuplicates,
    metadataDuplicateKeys,
    reverseIssues,
    identityMappings,
    issueRecords,
    unresolvedRecords,
    seoCandidates,
    records
  };
}

function serialize(audit) {
  return `${JSON.stringify(audit, null, 2)}\n`;
}

const audit = buildAudit();
const output = serialize(audit);
const checkOnly = process.argv.includes('--check');

if (checkOnly) {
  if (!fs.existsSync(auditPath)) {
    console.error('Old Kanji dictionary audit artifact is missing.');
    process.exit(1);
  }
  const current = readText(auditPath);
  if (current !== output) {
    console.error('Old Kanji dictionary audit drift detected. Run node scripts/build-old-kanji-dictionary-audit.mjs and commit the result.');
    process.exit(1);
  }
} else {
  fs.writeFileSync(auditPath, output);
}

const summary = audit.summary;
console.log(`Old Kanji dictionary audit ${checkOnly ? 'check' : 'build'} passed.`);
console.log(JSON.stringify(summary));
