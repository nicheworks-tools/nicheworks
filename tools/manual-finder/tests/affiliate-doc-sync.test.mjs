import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);

// Reuse the canonical coverage audit instead of duplicating its catalog-loading logic.
const coverageOutput = execFileSync(
  process.execPath,
  [new URL('./affiliate-coverage.test.mjs', import.meta.url).pathname],
  { encoding: 'utf8' }
);
const prefix = 'MANUALFINDER_AFFILIATE_COVERAGE ';
const coverageLine = coverageOutput.split(/\r?\n/).find((line) => line.startsWith(prefix));
assert.ok(coverageLine, 'affiliate coverage audit must emit its machine-readable summary');
const summary = JSON.parse(coverageLine.slice(prefix.length));
const printer = summary.byCategory?.['プリンター・複合機'];
assert.ok(printer, 'coverage summary must include the printer category');

const affiliateCoverageDoc = fs.readFileSync(new URL('AFFILIATE_COVERAGE.md', root), 'utf8');
const specDoc = fs.readFileSync(new URL('SPEC.md', root), 'utf8');

for (const [label, expected] of [
  ['basic', `| Printer records with a basic Amazon path | **${printer.basic}** |`],
  ['detail', `| Printer records with a verified detail handoff | **${printer.detail}** |`],
  ['reviewed exclusions', `| Reviewed printer-detail exclusions | **${summary.printerDetailExcluded}** |`],
  ['missing detail', `| Actionable printer records still missing detail | **${summary.printerMissingDetail}** |`]
]) {
  assert.ok(
    affiliateCoverageDoc.includes(expected),
    `AFFILIATE_COVERAGE.md ${label} snapshot must match the live coverage audit`
  );
}

const affiliateReconciliation = `printer basic ${printer.basic} = detail ${printer.detail} + reviewed exclusion ${summary.printerDetailExcluded} + missing ${summary.printerMissingDetail}`;
assert.ok(
  affiliateCoverageDoc.includes(affiliateReconciliation),
  'AFFILIATE_COVERAGE.md printer reconciliation must match the live coverage audit'
);

const specReconciliation = `**${printer.basic} basic = ${printer.detail} detail + ${summary.printerDetailExcluded} reviewed exclusions + ${summary.printerMissingDetail} missing detail**`;
assert.ok(
  specDoc.includes(specReconciliation),
  'SPEC.md printer reconciliation must match the live coverage audit'
);

// Keep the KYOCERA completion subsection synchronized with the active mapping/exclusion ledgers.
const sandbox = { window: {}, URL };
const context = vm.createContext(sandbox);
for (const name of [
  'affiliate-config.js',
  'affiliate-office-consumables.js',
  'affiliate-oki-toner-wave2.js',
  'affiliate-oki-toner-wave6.js',
  'affiliate-ricoh-consumables-wave3.js',
  'affiliate-kyocera-toner-wave3.js',
  'affiliate-kyocera-toner-wave4.js',
  'affiliate-kyocera-toner-wave6.js',
  'affiliate-fujifilm-toner-wave2.js',
  'affiliate-printer-detail-exclusions.js'
]) {
  const source = fs.readFileSync(new URL(name, root), 'utf8');
  vm.runInContext(source, context, { filename: `tools/manual-finder/${name}` });
}

const kyoceraMaker = 'KYOCERA Document Solutions';
const kyoceraDetailModels = new Set(
  Array.from(context.window.MANUALFINDER_AFFILIATE_CONFIG?.printerConsumables || [])
    .filter((row) => row.maker === kyoceraMaker)
    .map((row) => row.model)
);
const kyoceraExclusions = Array.from(context.window.MANUALFINDER_PRINTER_DETAIL_EXCLUSIONS || [])
  .filter((row) => row.maker === kyoceraMaker);
const kyoceraDetail = kyoceraDetailModels.size;
const kyoceraExcluded = kyoceraExclusions.length;
const kyoceraMissing = 0; // The child coverage audit above fails before this point if any actionable gap exists.
const kyoceraTotal = kyoceraDetail + kyoceraExcluded;

const affiliateKyoceraReconciliation = `${kyoceraTotal} = ${kyoceraDetail} detail handoffs + ${kyoceraExcluded} reviewed exclusions + ${kyoceraMissing} missing`;
assert.ok(
  affiliateCoverageDoc.includes(affiliateKyoceraReconciliation),
  'AFFILIATE_COVERAGE.md KYOCERA reconciliation must match the active ledgers'
);

const specKyoceraReconciliation = `**${kyoceraTotal} = ${kyoceraDetail} detail + ${kyoceraExcluded} reviewed exclusions + ${kyoceraMissing} missing**`;
assert.ok(
  specDoc.includes(specKyoceraReconciliation),
  'SPEC.md KYOCERA reconciliation must match the active ledgers'
);

assert.equal(summary.printerMissingDetail, 0, 'completed printer audit baseline must remain at zero actionable missing detail');
assert.deepEqual(summary.printerMissingDetailByMaker, {}, 'completed printer audit must keep maker-level missing detail empty');
assert.deepEqual(summary.printerMissingDetailModelsByMaker, {}, 'completed printer audit must keep model-level missing detail empty');

console.log('ManualFinder affiliate documentation sync audit passed.');
