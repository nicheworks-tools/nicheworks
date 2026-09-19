#!/usr/bin/env node
import fs from 'node:fs/promises';
import { hostAllowed, discoverFromHtml, validateCoveragePass } from './coverage-pass-lib.mjs';

function parseArgs(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const key = argv[i];
    if (!key.startsWith('--')) continue;
    out[key.slice(2)] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : true;
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (!args.pass) {
  console.error('Usage: node discover-support-index.mjs --pass <manifest.json> [--html <snapshot.html>] [--output <result.json>]');
  process.exit(2);
}

const pass = JSON.parse(await fs.readFile(args.pass, 'utf8'));
const validation = validateCoveragePass(pass);
if (!validation.valid) {
  console.error(JSON.stringify({ type: 'invalid_pass_manifest', errors: validation.errors }, null, 2));
  process.exit(1);
}

const sourceUrl = pass.universe?.sourceUrls?.[0];
if (!sourceUrl || !hostAllowed(sourceUrl, pass.allowedDomains)) {
  console.error('First universe source URL is missing or not manufacturer-controlled.');
  process.exit(1);
}

let html;
let mode;
if (args.html) {
  html = await fs.readFile(args.html, 'utf8');
  mode = 'snapshot';
} else {
  const response = await fetch(sourceUrl, {
    redirect: 'follow',
    headers: { 'user-agent': 'NicheWorks-ManualFinder-CoveragePass/1.0 (+https://nicheworks.app/tools/manual-finder/)' }
  });
  if (!response.ok) throw new Error(`official source fetch failed: HTTP ${response.status}`);
  if (!hostAllowed(response.url, pass.allowedDomains)) throw new Error(`official source redirected outside allowed domains: ${response.url}`);
  html = await response.text();
  mode = 'live';
}

const discovered = discoverFromHtml(html, pass.discovery || {});
const result = {
  schemaVersion: 1,
  maker: pass.maker,
  scopeId: pass.scopeId,
  mode,
  sourceUrl,
  observedAt: new Date().toISOString(),
  ...discovered,
  manifestCapturedModels: pass.universe?.models || [],
  manifestDeclaredCount: Number.isInteger(pass.universe?.declaredCount) ? pass.universe.declaredCount : null,
  publicationReady: false,
  note: 'Discovery output is candidate data only. Positive verification and full population reconciliation are required before publication.'
};

const body = JSON.stringify(result, null, 2) + '\n';
if (args.output) await fs.writeFile(args.output, body);
else process.stdout.write(body);
