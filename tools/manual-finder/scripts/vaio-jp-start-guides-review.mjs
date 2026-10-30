#!/usr/bin/env node
/**
 * VAIO JP start-guide official candidate reviewer.
 * Output is NEVER publication truth. This runner deliberately does not mutate the
 * locked population or classify records as direct/shared/support_only.
 */
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { decodeHtml, htmlToText, hostAllowed, validateCoveragePass } from './coverage-pass-lib.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.resolve(here, '../coverage-passes/vaio/jp-pc-start-guide-manual-index.json');
const sourceUrl = 'https://solutions.vaio.com/2012';
const allowed = ['solutions.vaio.com', 'support.vaio.com'];
const MODEL_RE = /\bVJ(?:S|F|Z|A|C|P|FL|BM|BK)[A-Z0-9]{2,7}\b/g;
const httpTimeoutMs = 30000;

function absoluteOfficial(href, base) {
  if (!href || href.startsWith('#') || /^javascript:/i.test(href)) return null;
  try {
    const u = new URL(decodeHtml(href), base);
    return hostAllowed(u.href, allowed) ? u.href : null;
  } catch { return null; }
}
function linksIn(chunk, base) {
  const results = [];
  for (const match of chunk.matchAll(/<a\b[^>]*href\s*=\s*(["'])(.*?)\1[^>]*>([\s\S]*?)<\/a>/gi)) {
    const url = absoluteOfficial(match[2], base);
    if (url) results.push({ url, label: htmlToText(match[3]) });
  }
  return [...new Map(results.map(x => [x.url, x])).values()];
}
function htmlTableRows(html) {
  const out = [];
  for (const table of html.matchAll(/<table\b[^>]*>[\s\S]*?<\/table>/gi)) {
    for (const tr of table[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...tr[1].matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi)].map(x => x[1]);
      if (cells.length >= 2) out.push({ cells, raw: tr[1] });
    }
  }
  return out;
}
function textForCell(s) { return htmlToText(s).replace(/\s+/g, ' ').trim(); }
export function extractCandidates(html, base = sourceUrl) {
  const rows = htmlTableRows(html);
  const modelToRows = new Map();
  const unexpected = [];
  for (const row of rows) {
    const modelCell = textForCell(row.cells[0]).replace(/\*/g, '');
    const matched = [...modelCell.matchAll(MODEL_RE)].map(m => m[0]);
    if (!matched.length) continue;
    // Do not silently confuse later safety/recovery/accessory grouped tables with
    // start-guide rows. A start-guide row must have an actual release year.
    const releaseCell = textForCell(row.cells[1]);
    if (!/20(?:1[4-9]|2\d)年/.test(releaseCell)) continue;
    const links = linksIn(row.cells.slice(2).join(' '), base);
    for (const model of matched) {
      const entry = { model, release: releaseCell, links, linksPresent: links.length > 0 };
      if (!modelToRows.has(model)) modelToRows.set(model, []);
      modelToRows.get(model).push(entry);
    }
  }
  return { modelToRows, unexpected, scannedTableRows: rows.length };
}
function classifyCandidateLink(x) {
  const s = (x.label + ' ' + new URL(x.url).pathname).toLowerCase();
  if (/\.pdf(?:$|\?)/.test(x.url.toLowerCase())) return 'pdf_candidate';
  if (/ユーザーマニュアル|user.manual|userguide|manual/.test(s)) return 'html_manual_candidate';
  return 'other_official_link_candidate';
}
async function fetchOfficial(url, { checkBody = false } = {}) {
  const response = await fetch(url, { redirect: 'follow', headers: { 'user-agent': 'ManualFinderCoveragePass/1.0 (+https://nicheworks.app/tools/manual-finder/)' }, signal: AbortSignal.timeout(httpTimeoutMs) });
  if (!hostAllowed(response.url, allowed)) throw Error('redirected outside official allowlist: ' + response.url);
  if (!response.ok) throw Error('HTTP ' + response.status + ' for ' + url);
  return { response, text: checkBody ? await response.text() : null };
}
export async function review({ html, pass, checkTargets = true }) {
  const parsed = extractCandidates(html);
  const locked = pass.universe.models;
  const allowedModels = new Set(locked);
  const extraModels = [...parsed.modelToRows.keys()].filter(m => !allowedModels.has(m));
  const candidates = [];
  let structuralExceptions = 0;
  for (const model of locked) {
    const hits = parsed.modelToRows.get(model) || [];
    if (hits.length !== 1) {
      structuralExceptions++;
      candidates.push({ model, candidateStatus: 'needs_secondary_discovery', reason: hits.length ? 'duplicate_official_index_rows' : 'missing_from_live_official_index', indexRows: hits.length });
      continue;
    }
    const hit = hits[0];
    const links = [];
    let hasValid = false;
    for (const link of hit.links) {
      const candidateKind = classifyCandidateLink(link);
      let check = { status: 'not_checked' };
      if (checkTargets) {
        try {
          // GET rather than HEAD: many official services do not support HEAD consistently.
          // Parse only HTML, and limit memory for PDFs by immediately cancelling the body.
          const { response } = await fetchOfficial(link.url);
          const type = response.headers.get('content-type') || '';
          const finalUrl = response.url;
          const candidateIdentityIsOfficiallyListed = true;
          const expectedKind = candidateKind === 'pdf_candidate' ? /pdf/i.test(type) : /html/i.test(type);
          check = { status: expectedKind ? 'reachable_official_candidate' : 'destination_type_exception',
            statusCode: response.status, finalUrl, contentType: type, candidateIdentityIsOfficiallyListed };
          await response.body?.cancel();
          if (expectedKind) hasValid = true;
        } catch (err) {
          check = { status: 'fetch_exception', error: String(err) };
        }
      }
      links.push({ ...link, candidateKind, check });
    }
    const hasCandidate = hit.links.length > 0 && (!checkTargets || hasValid);
    if (!hasCandidate) structuralExceptions++;
    candidates.push({ model, release: hit.release, candidateStatus: hasCandidate ? 'candidate_only_requires_positive_model_review' : 'needs_secondary_discovery',
      reason: hasCandidate ? null : hit.links.length ? 'no_accepted_reachable_target_candidate' : 'no_manual_anchor_on_official_index_row', links });
  }
  return {
    schemaVersion: 1, maker: 'VAIO', scopeId: pass.scopeId, sourceUrl,
    observedAt: new Date().toISOString(), lockedPopulation: locked.length,
    foundLockedModels: locked.length - candidates.filter(x => x.reason === 'missing_from_live_official_index').length,
    extraModels, duplicateModels: candidates.filter(x => x.reason === 'duplicate_official_index_rows').map(x => x.model),
    rowsScanned: parsed.scannedTableRows, structuralExceptions,
    publicationEligible: false,
    candidates, notes: 'All links remain candidates. Shared PDF identities require explicit vendor index grouping, model identity and document review. HTTP 200 is not sufficient for publication.'
  };
}
async function main() {
  const pass = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
  const valid = validateCoveragePass(pass);
  if (!valid.valid) throw Error('Invalid locked manifest: ' + valid.errors.join('; '));
  const args = process.argv.slice(2);
  const index = args.indexOf('--out');
  const out = index >= 0 ? args[index + 1] : null;
  const checkTargets = !args.includes('--offline-candidates');
  const htmlFileIndex = args.indexOf('--html');
  const html = htmlFileIndex >= 0 ? await fs.readFile(args[htmlFileIndex + 1], 'utf8') : (await fetchOfficial(sourceUrl, { checkBody: true })).text;
  const result = await review({ html, pass, checkTargets });
  const text = JSON.stringify(result, null, 2) + '\n';
  if (out) { await fs.mkdir(path.dirname(out), { recursive: true }); await fs.writeFile(out, text); }
  console.log(JSON.stringify({ lockedPopulation: result.lockedPopulation, foundLockedModels: result.foundLockedModels,
    extraModels: result.extraModels, duplicateModels: result.duplicateModels, structuralExceptions: result.structuralExceptions, publicationEligible: false }));
  if (result.extraModels.length || result.foundLockedModels !== result.lockedPopulation || result.duplicateModels.length) {
    process.exitCode = 1; // Source drift or parser regression must fail closed.
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(err => { console.error(err); process.exitCode = 1; });
}
