import { URL } from 'node:url';

const FINAL_STATES = new Set(['direct', 'shared', 'support_only', 'held']);
const PASS_STATUSES = new Set(['acquiring_universe', 'reviewing', 'coverage-pass-complete']);

export function hostAllowed(value, allowedDomains = []) {
  let host;
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:') return false;
    host = url.hostname.toLowerCase();
  } catch {
    return false;
  }
  return allowedDomains.some((domain) => {
    const clean = String(domain || '').trim().toLowerCase();
    return clean && (host === clean || host.endsWith(`.${clean}`));
  });
}

export function decodeHtml(value) {
  return String(value || '')
    .replace(/&nbsp;|&#160;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function htmlToText(html) {
  return decodeHtml(String(html || '')
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function buildRegex(spec, defaultFlags = 'giu') {
  if (typeof spec === 'string') return new RegExp(spec, defaultFlags);
  if (!spec || typeof spec.source !== 'string') throw new Error('invalid regex spec');
  const flags = spec.flags || defaultFlags;
  return new RegExp(spec.source, flags.includes('g') ? flags : `${flags}g`);
}

export function discoverFromHtml(html, discovery = {}) {
  const raw = String(html || '');
  const text = htmlToText(raw);
  let declaredCount = null;

  for (const spec of discovery.declaredCountPatterns || []) {
    const regex = buildRegex(spec, 'iu');
    regex.lastIndex = 0;
    const match = regex.exec(text) || regex.exec(raw);
    if (match) {
      const candidate = String(match[1] || match[0]).replace(/,/g, '').match(/\d+/)?.[0];
      if (candidate) {
        declaredCount = Number(candidate);
        break;
      }
    }
  }

  const found = new Set();
  for (const spec of discovery.modelPatterns || []) {
    const regex = buildRegex(spec);
    for (const source of [text, raw]) {
      regex.lastIndex = 0;
      for (const match of source.matchAll(regex)) {
        const model = String(match[1] || match[0] || '').trim();
        if (model) found.add(model);
      }
    }
  }

  const models = [...found].sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }));
  return Object.freeze({
    declaredCount,
    models,
    capturedCount: models.length,
    countMatches: Number.isInteger(declaredCount) ? models.length === declaredCount : null
  });
}

function unique(values) {
  return [...new Set(values)];
}

function finalStateSummary(records) {
  const counts = { direct: 0, shared: 0, support_only: 0, held: 0 };
  for (const row of records) {
    if (counts[row.state] !== undefined) counts[row.state] += 1;
  }
  return counts;
}

export function validateCoveragePass(pass) {
  const errors = [];
  const warnings = [];
  if (!pass || typeof pass !== 'object') {
    return { valid: false, completionReady: false, errors: ['pass must be an object'], warnings, summary: null };
  }

  if (pass.schemaVersion !== 1) errors.push('schemaVersion must be 1');
  if (!String(pass.maker || '').trim()) errors.push('maker is required');
  if (!String(pass.scopeId || '').trim()) errors.push('scopeId is required');
  if (!PASS_STATUSES.has(pass.status)) errors.push(`unsupported pass status: ${pass.status}`);

  const allowedDomains = Array.isArray(pass.allowedDomains) ? pass.allowedDomains.filter(Boolean) : [];
  if (!allowedDomains.length) errors.push('allowedDomains must contain at least one manufacturer-controlled domain');

  const universe = pass.universe || {};
  const sourceUrls = Array.isArray(universe.sourceUrls) ? universe.sourceUrls : [];
  if (!sourceUrls.length) errors.push('universe.sourceUrls must not be empty');
  sourceUrls.forEach((url) => {
    if (!hostAllowed(url, allowedDomains)) errors.push(`universe source is outside allowed official domains: ${url}`);
  });

  const models = Array.isArray(universe.models) ? universe.models.map((x) => String(x || '').trim()).filter(Boolean) : [];
  const duplicateModels = models.filter((model, index) => models.indexOf(model) !== index);
  if (duplicateModels.length) errors.push(`duplicate universe models: ${unique(duplicateModels).join(', ')}`);

  const declaredCount = Number.isInteger(universe.declaredCount) ? universe.declaredCount : null;
  if (declaredCount !== null && declaredCount < 0) errors.push('universe.declaredCount must be non-negative');
  if (declaredCount !== null && models.length > declaredCount) errors.push('captured universe models exceed manufacturer-declared count');

  const records = Array.isArray(pass.records) ? pass.records : [];
  const recordsByModel = new Map();
  for (const row of records) {
    const model = String(row?.model || '').trim();
    if (!model) {
      errors.push('every record requires model');
      continue;
    }
    if (!models.includes(model)) errors.push(`record model is outside locked/captured universe: ${model}`);
    if (recordsByModel.has(model)) errors.push(`duplicate review record: ${model}`);
    recordsByModel.set(model, row);

    if (!FINAL_STATES.has(row.state)) errors.push(`invalid final review state for ${model}: ${row.state}`);
    if (row.state === 'not_found' || row.state === 'missing') errors.push(`negative terminal state is forbidden for ${model}`);

    const evidenceUrls = Array.isArray(row.evidenceUrls) ? row.evidenceUrls : [];
    if (row.state === 'direct' || row.state === 'shared' || row.state === 'support_only') {
      if (!evidenceUrls.length) errors.push(`${model} ${row.state} record requires evidenceUrls`);
      evidenceUrls.forEach((url) => {
        if (!hostAllowed(url, allowedDomains)) errors.push(`${model} evidence is outside allowed official domains: ${url}`);
      });
    }
    if (row.state === 'direct' || row.state === 'shared') {
      if (!row.manualUrl) errors.push(`${model} ${row.state} record requires manualUrl`);
      else if (!hostAllowed(row.manualUrl, allowedDomains)) errors.push(`${model} manualUrl is outside allowed official domains`);
    }
    if (row.state === 'support_only') {
      if (!row.supportUrl) errors.push(`${model} support_only record requires supportUrl`);
      else if (!hostAllowed(row.supportUrl, allowedDomains)) errors.push(`${model} supportUrl is outside allowed official domains`);
    }
    if (row.state === 'held') {
      if (!String(row.reason || '').trim()) errors.push(`${model} held record requires reason`);
      const attempted = Array.isArray(row.attemptedDiscovery) ? unique(row.attemptedDiscovery.filter(Boolean)) : [];
      if (attempted.length < 2) errors.push(`${model} held record requires at least two attemptedDiscovery channels`);
      const checked = Array.isArray(row.evidenceUrls) ? row.evidenceUrls : [];
      checked.forEach((url) => {
        if (!hostAllowed(url, allowedDomains)) errors.push(`${model} held evidence is outside allowed official domains: ${url}`);
      });
    }
  }

  const counts = finalStateSummary(records);
  const reviewedCount = counts.direct + counts.shared + counts.support_only + counts.held;
  const unreviewedModels = models.filter((model) => !recordsByModel.has(model));
  const unresolvedUniverseCount = declaredCount === null ? null : Math.max(0, declaredCount - models.length);
  const populationLocked = models.length > 0 && (declaredCount === null || declaredCount === models.length);
  const reconciles = populationLocked && reviewedCount === models.length && unreviewedModels.length === 0;
  const completionReady = errors.length === 0 && reconciles;

  if (pass.status === 'coverage-pass-complete' && !completionReady) {
    errors.push('coverage-pass-complete requires a locked population and one final review state for every model');
  }
  if (pass.status !== 'coverage-pass-complete' && completionReady) {
    warnings.push('pass satisfies completion gates but status is not coverage-pass-complete');
  }
  if (pass.status === 'acquiring_universe' && models.length && declaredCount !== null && models.length === declaredCount) {
    warnings.push('declared population is fully captured; pass can move to reviewing after source-boundary confirmation');
  }

  return {
    valid: errors.length === 0,
    completionReady,
    errors,
    warnings,
    summary: {
      declaredCount,
      capturedPopulation: models.length,
      unresolvedUniverseCount,
      reviewedCount,
      unreviewedCount: unreviewedModels.length,
      unreviewedModels,
      states: counts,
      reconciliation: populationLocked
        ? `${models.length} = ${counts.direct} direct + ${counts.shared} shared + ${counts.support_only} support_only + ${counts.held} held`
        : null
    }
  };
}
