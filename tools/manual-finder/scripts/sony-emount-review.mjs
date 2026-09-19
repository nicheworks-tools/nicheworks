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
      signal: AbortSignal.timeout(20000),
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

function scopeBase(scope, model) {
  const source = String(scope.sourceUrl || '');
  const lower = model.toLowerCase();
  if (source.toLowerCase().includes('/' + lower)) return source.replace(/\/$/, '');
  return source.replace(/\/manuals\/?$/i, '').replace(/\/$/, '') + '/' + lower;
}

const args = parseArgs(process.argv.slice(2));
if (!args.pass) {
  console.error('Usage: node sony-emount-review.mjs --pass <manifest.json> [--output <result.json>]');
  process.exit(2);
}

const pass = JSON.parse(await fs.readFile(args.pass, 'utf8'));
const allowedDomains = pass.allowedDomains || [];
const scopes = Array.isArray(pass.subscopes) ? pass.subscopes : [];
const scopedModels = scopes.flatMap((scope) => (scope.models || []).map((model) => ({ model, scope })));
if (scopedModels.length !== pass.universe.models.length) {
  throw new Error(`subscope partition mismatch: ${scopedModels.length} vs universe ${pass.universe.models.length}`);
}

const records = [];
for (const { model, scope } of scopedModels) {
  const supportCandidate = scopeBase(scope, model);
  const manualCandidate = supportCandidate.endsWith('/manuals') ? supportCandidate : supportCandidate + '/manuals';
  const manual = await fetchText(manualCandidate, allowedDomains);
  const manualExact = manual.text.includes(model);
  const saysNoManual = /現在、本ページで提供されている取扱説明書はありません/.test(manual.text);
  const hasManualArtifact = /ヘルプガイド|\[PDF\]|PDF|ファイルサイズ/.test(manual.text);

  let record;
  if (manual.ok && manualExact && !saysNoManual && hasManualArtifact) {
    record = {
      model,
      scopeId: scope.id,
      candidateState: 'direct',
      manualUrl: manual.finalUrl,
      supportUrl: supportCandidate,
      evidenceUrls: [scope.sourceUrl, manual.finalUrl],
      verification: { exactModelText: true, officialHost: true, manualArtifactMarker: true }
    };
  } else {
    const support = await fetchText(supportCandidate, allowedDomains);
    const supportExact = support.text.includes(model);
    if (support.ok && supportExact) {
      record = {
        model,
        scopeId: scope.id,
        candidateState: 'support_only',
        supportUrl: support.finalUrl,
        evidenceUrls: [scope.sourceUrl, support.finalUrl],
        verification: {
          exactModelText: true,
          officialHost: true,
          manualCandidateStatus: manual.status,
          noManualStatement: saysNoManual
        }
      };
    } else {
      record = {
        model,
        scopeId: scope.id,
        candidateState: 'needs_secondary_discovery',
        attemptedDiscovery: ['official_manual_index', 'official_model_support_candidate'],
        evidenceUrls: [scope.sourceUrl],
        diagnostics: {
          manualStatus: manual.status,
          manualFinalUrl: manual.finalUrl,
          manualExact,
          supportStatus: support.status,
          supportFinalUrl: support.finalUrl,
          supportExact
        }
      };
    }
  }
  records.push(record);
  console.log('MANUALFINDER_SONY_REVIEW_RECORD ' + JSON.stringify(record));
}

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
  note: 'Automated positive-verification candidates only. Sample review and secondary discovery are required before manifest final states/publication.'
};
console.log('MANUALFINDER_SONY_REVIEW_SUMMARY ' + JSON.stringify({ officialPopulation: result.officialPopulation, counts }));
if (args.output) await fs.writeFile(args.output, JSON.stringify(result, null, 2) + '\n');
