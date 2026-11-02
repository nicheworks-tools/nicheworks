/**
 * Research-only English-photo OCR extraction diagnostics and strict
 * whole-line dictionary-sequence splitting. No production behavior changes.
 * Does not return ingredient strings or source transcription from assess().
 */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const shared = require('../../_shared/cosmetic-ingredient-parser.js');

function dictionary() {
  const entries = [];
  for (const suffix of ['', ...Array.from({ length: 8 }, (_, i) => '-extra-' + (i + 1))]) {
    entries.push(...JSON.parse(fs.readFileSync('tools/inci-fastscan/data/ingredients' + suffix + '.json', 'utf8')));
  }
  const browser = {};
  vm.runInNewContext(fs.readFileSync('tools/inci-fastscan/js/generated_dictionary.js', 'utf8'),
    { window: browser }, { filename: 'generated_dictionary.js' });
  entries.push(...browser.NW_INCI_GENERATED_DICTIONARY);
  return shared.mergeDictionaryRecords(entries);
}

function runtime() {
  const ctx = { NWCosmeticIngredientParser: shared };
  ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const script of ['core_parser.js', 'core_matcher.js', 'core_analyze.js']) {
    vm.runInContext(fs.readFileSync('tools/inci-fastscan/js/' + script, 'utf8'), ctx, { filename: script });
  }
  return ctx;
}

function normText(value) {
  return String(value || '').normalize('NFKC').toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ').replace(/\s+/g, ' ').trim();
}
function containsPhrase(haystack, needle) {
  const phrase = normText(needle);
  if (!phrase || phrase.length < 3) return false;
  return (' ' + haystack + ' ').includes(' ' + phrase + ' ');
}

export function createOcrLossDiagnostics() {
  const dict = dictionary();
  const ctx = runtime();
  const byName = new Map();
  const namesById = new Map();
  for (const item of dict) {
    const identity = shared.canonicalIdentityKey(item.en);
    if (!identity) continue;
    const values = [item.en, ...(item.alias || [])];
    namesById.set(identity, values);
    for (const value of [...values, ...(item.jp || [])]) {
      const key = shared.normalizeKey(value);
      if (key && !byName.has(key)) byName.set(key, identity);
    }
  }

  function segmentExactWholeLine(text) {
    const line = String(text || '').normalize('NFKC').trim().replace(/\s+/g, ' ');
    // Exclude OCR paragraphs, instructions, punctuation and non-ASCII labels.
    if (!line || line.length > 160 || !/^[A-Za-z0-9\s.\-]+$/.test(line)) return null;
    if (byName.has(shared.normalizeKey(line))) return null; // exact INCI already known
    const words = line.split(' ');
    if (words.length < 2 || words.length > 20) return null;
    const paths = Array.from({ length: words.length + 1 }, () => []);
    paths[words.length] = [[]];
    for (let i = words.length - 1; i >= 0; i -= 1) {
      for (let j = i + 1; j <= Math.min(words.length, i + 8); j += 1) {
        const phrase = words.slice(i, j).join(' ');
        if (!byName.has(shared.normalizeKey(phrase))) continue;
        for (const tail of paths[j]) {
          paths[i].push([phrase, ...tail]);
          if (paths[i].length > 1) break;
        }
        if (paths[i].length > 1) break;
      }
    }
    // Ambiguous segmentation or incomplete coverage? Leave user text intact.
    return paths[0].length === 1 && paths[0][0].length >= 2 ? paths[0][0] : null;
  }

  async function assess(rawText, processedText, annotatedList) {
    assert.equal(typeof rawText, 'string');
    assert.equal(typeof processedText, 'string');
    assert.ok(Array.isArray(annotatedList));

    const gtMatches = await ctx.coreMatchIngredients(annotatedList, dict);
    const expected = new Set(gtMatches.filter(x => x.found).map(x => shared.canonicalIdentityKey(x.en)));
    const parsed = ctx.coreParseIngredients(processedText);
    const repaired = ctx.repairWrappedIngredientFragments(parsed, dict);
    const actualMatches = await ctx.coreMatchIngredients(repaired.list, dict);
    const actual = new Set(actualMatches.filter(x => x.found).map(x => shared.canonicalIdentityKey(x.en)));
    const rawHaystack = normText(rawText);
    const processedHaystack = normText(processedText);

    let rawPresentMissing = 0;
    let processedPresentMissing = 0;
    let rawAbsentMissing = 0;
    for (const key of expected) {
      if (actual.has(key)) continue;
      const aliases = namesById.get(key) || [];
      if (aliases.some(alias => containsPhrase(rawHaystack, alias))) rawPresentMissing++;
      else rawAbsentMissing++;
      if (aliases.some(alias => containsPhrase(processedHaystack, alias))) processedPresentMissing++;
    }

    const expanded = [];
    let splitActions = 0;
    let splitPieces = 0;
    for (const text of parsed) {
      const candidate = segmentExactWholeLine(text);
      if (!candidate) expanded.push(text);
      else {
        expanded.push(...candidate);
        splitActions++;
        splitPieces += candidate.length;
      }
    }
    const experimental = ctx.repairWrappedIngredientFragments(expanded, dict);
    const result = await ctx.coreMatchIngredients(experimental.list, dict);
    const found = new Set(result.filter(x => x.found).map(x => shared.canonicalIdentityKey(x.en)));
    let experimentalHits = 0;
    let experimentalExtras = 0;
    for (const key of expected) if (found.has(key)) experimentalHits++;
    for (const key of found) if (!expected.has(key)) experimentalExtras++;
    let baselineHits = 0;
    let baselineExtras = 0;
    for (const key of expected) if (actual.has(key)) baselineHits++;
    for (const key of actual) if (!expected.has(key)) baselineExtras++;
    return {
      supportedReferences: expected.size,
      baselineHits, baselineExtras,
      rawPresentMissing,
      processedPresentMissing,
      rawAbsentMissing,
      parsedSegments: parsed.length,
      knownMatchedSegments: actualMatches.filter(x => x.found).length,
      unmatchedSegments: actualMatches.filter(x => !x.found).length,
      attemptedSplitActions: splitActions,
      attemptedSplitPieces: splitPieces,
      experimentHits: experimentalHits,
      experimentExtras: experimentalExtras
    };
  }
  return Object.freeze({ dictSize: dict.length, assess });
}

export function summarizeOcrLoss(rows, name) {
  const sums = {
    name, photos: rows.length, supportedReferences: 0, baselineHits: 0,
    baselineExtras: 0, rawPresentMissing: 0, processedPresentMissing: 0,
    rawAbsentMissing: 0, parsedSegments: 0, knownMatchedSegments: 0,
    unmatchedSegments: 0, attemptedSplitActions: 0, attemptedSplitPieces: 0,
    experimentHits: 0, experimentExtras: 0
  };
  for (const row of rows) {
    for (const k of Object.keys(sums)) {
      if (k === 'name' || k === 'photos') continue;
      assert.ok(Number.isInteger(row[k]) && row[k] >= 0, name + ': invalid ' + k);
      sums[k] += row[k];
    }
  }
  sums.baselineRecall = sums.supportedReferences ? sums.baselineHits / sums.supportedReferences : null;
  sums.experimentRecall = sums.supportedReferences ? sums.experimentHits / sums.supportedReferences : null;
  return sums;
}
