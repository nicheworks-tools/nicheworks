#!/usr/bin/env node
import fs from 'node:fs/promises';
import { hostAllowed, htmlToText } from './coverage-pass-lib.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (!argv[i].startsWith('--')) continue;
    out[argv[i].slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

async function fetchText(url, allowedDomains) {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      signal: AbortSignal.timeout(15000),
      headers: { 'user-agent': 'NicheWorks-ManualFinder-CoveragePass/1.0 (+https://nicheworks.app/tools/manual-finder/)' }
    });
    const finalUrl = response.url;
    if (!hostAllowed(finalUrl, allowedDomains)) {
      return { ok: false, status: response.status, finalUrl, error: 'redirect_outside_allowed_domains', text: '' };
    }
    const html = await response.text();
    return { ok: response.ok, status: response.status, finalUrl, text: htmlToText(html) };
  } catch (error) {
    return { ok: false, status: null, finalUrl: url, error: String(error?.message || error), text: '' };
  }
}

async function mapLimit(items, concurrency, worker) {
  const results = new Array(items.length);
  let next = 0;
  async function run() {
    while (true) {
      const index = next++;
      if (index >= items.length) return;
      results[index] = await worker(items[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, () => run()));
  return results;
}

const args = parseArgs(process.argv.slice(2));
if (!args.pass) {
  console.error('Usage: node panasonic-lumix-review.mjs --pass <manifest.json> [--output <result.json>]');
  process.exit(2);
}

const pass = JSON.parse(await fs.readFile(args.pass, 'utf8'));
const allowedDomains = pass.allowedDomains || [];
const scopedModels = (pass.subscopes || []).flatMap((scope) =>
  (scope.models || []).map((model) => ({ model, scopeId: scope.id, sourceUrl: scope.sourceUrl }))
);
if (scopedModels.length !== pass.universe.models.length || new Set(scopedModels.map((x) => x.model)).size !== pass.universe.models.length) {
  throw new Error(`subscope partition mismatch: ${scopedModels.length} vs universe ${pass.universe.models.length}`);
}

async function reviewOne(entry) {
  const supportCandidate = `https://panasonic.jp/dc/products/${entry.model}/support.html`;
  const support = await fetchText(supportCandidate, allowedDomains);
  const upperText = support.text.toUpperCase();
  const exactModelText = upperText.includes(entry.model.toUpperCase());
  const hasManualSection = /取扱説明書/.test(support.text);
  const saysNoManual = /取扱説明書[^。]{0,80}(?:ありません|提供しておりません)/.test(support.text)
    || /ご希望の取扱説明書が見つからない場合/.test(support.text) && !/\[[^\]]*DC-[A-Z0-9]+[^\]]*\]/.test(support.text);
  const hasManualArtifact = /\bPDF\b|詳細ガイド|活用ガイド|取扱説明書[_＜<]|取扱説明書\s*[［\[]/.test(support.text);

  if (support.ok && exactModelText && hasManualSection && hasManualArtifact && !saysNoManual) {
    return {
      model: entry.model,
      scopeId: entry.scopeId,
      candidateState: 'direct',
      manualUrl: support.finalUrl,
      supportUrl: support.finalUrl,
      evidenceUrls: [entry.sourceUrl, support.finalUrl],
      verification: {
        officialHost: true,
        exactModelText: true,
        manualSection: true,
        manualArtifactMarker: true
      }
    };
  }

  if (support.ok && exactModelText) {
    return {
      model: entry.model,
      scopeId: entry.scopeId,
      candidateState: 'support_only',
      supportUrl: support.finalUrl,
      evidenceUrls: [entry.sourceUrl, support.finalUrl],
      attemptedDiscovery: ['official_product_support_page'],
      verification: {
        officialHost: true,
        exactModelText: true,
        manualSection: hasManualSection,
        manualArtifactMarker: hasManualArtifact,
        noManualStatement: saysNoManual
      }
    };
  }

  return {
    model: entry.model,
    scopeId: entry.scopeId,
    candidateState: 'needs_secondary_discovery',
    attemptedDiscovery: ['official_product_support_page'],
    evidenceUrls: [entry.sourceUrl],
    diagnostics: {
      status: support.status,
      finalUrl: support.finalUrl,
      exactModelText,
      error: support.error || null
    }
  };
}

const records = await mapLimit(scopedModels, 8, reviewOne);
for (const record of records) console.log('MANUALFINDER_PANASONIC_REVIEW_RECORD ' + JSON.stringify(record));

const counts = records.reduce((acc, row) => {
  acc[row.candidateState] = (acc[row.candidateState] || 0) + 1;
  return acc;
}, {});
const result = {
  schemaVersion: 1,
  maker: pass.maker,
  scopeId: pass.scopeId,
  reviewedAt: new Date().toISOString(),
  officialPopulation: pass.universe.models.length,
  counts,
  records,
  publicationReady: false,
  note: 'Automated positive-verification candidates only. Secondary discovery and sample validation remain required before final states/publication.'
};
console.log('MANUALFINDER_PANASONIC_REVIEW_SUMMARY ' + JSON.stringify({ officialPopulation: result.officialPopulation, counts }));
if (args.output) await fs.writeFile(args.output, JSON.stringify(result, null, 2) + '\n');
