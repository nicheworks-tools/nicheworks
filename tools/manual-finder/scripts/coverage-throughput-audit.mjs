#!/usr/bin/env node
/**
 * ManualFinder throughput and publication audit.
 * Audit a completed or in-progress manufacturer scope without counting
 * already-published rows as new work. No HTTP request is treated as evidence.
 *
 * node scripts/coverage-throughput-audit.mjs --pass coverage-passes/...json \
 *   --before data/manuals.coverage-pass.before.js \
 *   --after data/manuals.coverage-pass.after.js \
 *   --before-var MANUALFINDER_COVERAGE_PASS_... \
 *   --after-var MANUALFINDER_COVERAGE_PASS_... \
 *   --elapsed-seconds 120
 *
 * --before and --after are mandatory: a pass manifest alone cannot prove
 * a new publication. For a brand-new batch, use --before-empty explicitly.
 */
import fs from 'node:fs/promises';
import vm from 'node:vm';
import {pathToFileURL} from 'node:url';
import {validateCoveragePass} from './coverage-pass-lib.mjs';

export function audit({pass, before, after, elapsedSeconds = null}) {
  const gate = validateCoveragePass(pass);
  const errors = [...gate.errors];
  if (!gate.completionReady) errors.push('manufacturer scope is not fully reconciled');
  if (!Array.isArray(before) || !Array.isArray(after)) errors.push('before/after published arrays are required');
  const old = Array.isArray(before) ? before : [];
  const next = Array.isArray(after) ? after : [];
  const identity = row => String(row?.maker || row?.brand || '') + '\u0000' + String(row?.model || '');
  const oldKeys = new Set(old.map(identity));
  const nextKeys = new Set(next.map(identity));
  if (oldKeys.size !== old.length) errors.push('duplicate maker/model identity in before');
  if (nextKeys.size !== next.length) errors.push('duplicate maker/model identity in after');
  if (old.some(row => !nextKeys.has(identity(row)))) errors.push('previously published model disappeared from after');
  const records = new Map((pass.records || []).map(row => [String(row.model), row]));
  const accepted = new Set(['direct', 'shared', 'support_only']);
  const added = next.filter(row => !oldKeys.has(identity(row)));
  for (const row of added) {
    const state = records.get(String(row.model))?.state;
    if (String(row.maker || row.brand) !== pass.maker || !accepted.has(state))
      errors.push('new published row lacks accepted manifest state: ' + identity(row));
    const proof = records.get(String(row.model));
    const dest = state === 'support_only' ? row.supportUrl : row.manualUrl;
    if (!dest || !proof?.evidenceUrls?.length)
      errors.push('new row missing destination/evidence: ' + identity(row));
    if (state === 'direct' || state === 'shared') {
      if (row.manualUrl !== proof?.manualUrl) errors.push('published manual URL differs from manifest: ' + identity(row));
    } else if (state === 'support_only' && row.supportUrl !== proof?.supportUrl) {
      errors.push('published support URL differs from manifest: ' + identity(row));
    }
  }
  const seconds = elapsedSeconds === null ? null : Number(elapsedSeconds);
  if (seconds !== null && (!Number.isFinite(seconds) || seconds <= 0)) errors.push('elapsed-seconds must be positive');
  const counts = gate.summary?.states || {direct:0,shared:0,support_only:0,held:0};
  return {
    valid: errors.length === 0,
    publicationVerified: errors.length === 0,
    maker: pass.maker, scopeId: pass.scopeId,
    officialPopulation: gate.summary?.capturedPopulation ?? null,
    states: counts,
    heldRate: gate.summary?.capturedPopulation ? counts.held / gate.summary.capturedPopulation : null,
    beforePublished: old.length, afterPublished: next.length,
    newlyPublished: added.length,
    netPublishedChange: next.length - old.length,
    elapsedSeconds: seconds,
    verifiedNewRowsPerHour: seconds && !errors.length ? added.length * 3600 / seconds : null,
    errors
  };
}

export function readPublishedJs(source, variable) {
  if (!/^MANUALFINDER_[A-Z0-9_]+$/.test(variable)) throw Error('explicit safe window variable required');
  const sandbox = vm.createContext({window:{}});
  vm.runInContext(source, sandbox, {timeout:1500});
  const rows = sandbox.window[variable];
  if (!Array.isArray(rows)) throw Error('requested public batch array not found: ' + variable);
  return Array.from(rows, row => JSON.parse(JSON.stringify(row)));
}

async function main() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (!k.startsWith('--')) throw Error('unexpected argument: ' + k);
    args[k.slice(2)] = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true;
  }
  if (!args.pass || !args.after || !args['after-var'] || (!args.before && !args['before-empty']))
    throw Error('usage: --pass FILE --after FILE --after-var VARIABLE (--before FILE --before-var VARIABLE | --before-empty) [--elapsed-seconds N]');
  if (args.before && !args['before-var']) throw Error('--before-var is required');
  if (args.before && args['before-empty']) throw Error('choose one baseline mode');
  const pass = JSON.parse(await fs.readFile(args.pass,'utf8'));
  const before = args['before-empty'] ? [] : readPublishedJs(await fs.readFile(args.before,'utf8'),args['before-var']);
  const after = readPublishedJs(await fs.readFile(args.after,'utf8'),args['after-var']);
  const result = audit({pass,before,after,elapsedSeconds:args['elapsed-seconds'] ?? null});
  console.log(JSON.stringify(result,null,2));
  if (!result.valid) process.exitCode = 1;
}
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main().catch(e => { console.error(e); process.exitCode = 1; });
