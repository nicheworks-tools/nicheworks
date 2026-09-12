import { normalizeAmount, normalizeDate, normalizeReference, normalizeText } from './normalize.mjs';

function selectedValue(row, column) {
  return column ? row.values[column] : '';
}

function buildRecord(row, mapping, options) {
  const amount = normalizeAmount(selectedValue(row, mapping.amount));
  const dateResult = mapping.date ? normalizeDate(selectedValue(row, mapping.date), options.dateMode) : { dayKey: null, iso: '', error: null };
  const reference = mapping.reference ? normalizeReference(selectedValue(row, mapping.reference)) : '';
  const description = mapping.description ? normalizeText(selectedValue(row, mapping.description)) : '';
  return {
    row,
    sourceRow: row.sourceRow,
    amount,
    dateKey: dateResult.dayKey,
    dateIso: dateResult.iso,
    dateError: dateResult.error,
    reference,
    description,
    invalidAmount: amount === null
  };
}

function amountDistance(a, b) {
  return Math.abs(a.amount - b.amount);
}

function dateDistance(a, b) {
  if (a.dateKey === null || b.dateKey === null) return null;
  return Math.abs(a.dateKey - b.dateKey);
}

function referenceConflict(a, b) {
  return Boolean(a.reference && b.reference && a.reference === b.reference && a.amount !== null && b.amount !== null && a.amount !== b.amount);
}

function duplicateSignature(record, useDate, useReference) {
  const parts = [String(record.amount)];
  if (useDate) parts.push(record.dateKey === null ? '' : String(record.dateKey));
  if (useReference) parts.push(record.reference);
  return parts.join('|');
}

function markDuplicates(records, useDate, useReference) {
  const groups = new Map();
  for (const record of records) {
    if (record.invalidAmount) continue;
    const key = duplicateSignature(record, useDate, useReference);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record.sourceRow);
  }
  return new Set([...groups.values()].filter((rows) => rows.length > 1).flat());
}

function reasonFor(a, b, dateGap, amountGap) {
  const pieces = [];
  if (amountGap === 0) pieces.push('Amount exact');
  else pieces.push(`Amount difference ${amountGap}`);
  if (dateGap !== null) pieces.push(dateGap === 0 ? 'Date exact' : `Date ${dateGap} day${dateGap === 1 ? '' : 's'} apart`);
  if (a.reference && b.reference && a.reference === b.reference) pieces.push('Reference exact');
  return pieces.join(' · ');
}

export function reconcile({ rowsA, rowsB, mappingA, mappingB, options = {} }) {
  const config = {
    dateToleranceDays: Math.max(0, Number(options.dateToleranceDays ?? 0)),
    amountTolerance: Math.max(0, Number(options.amountTolerance ?? 0)),
    dateMode: options.dateMode || 'auto'
  };
  if (!mappingA?.amount || !mappingB?.amount) throw new Error('amount_mapping_required');

  const a = rowsA.map((row) => buildRecord(row, mappingA, config));
  const b = rowsB.map((row) => buildRecord(row, mappingB, config));
  const useDate = Boolean(mappingA.date && mappingB.date);
  const useReference = Boolean(mappingA.reference && mappingB.reference);
  const dupA = markDuplicates(a, useDate, useReference);
  const dupB = markDuplicates(b, useDate, useReference);
  const usedB = new Set();
  const results = [];

  for (const recordA of a) {
    if (recordA.invalidAmount || recordA.dateError) {
      results.push({ status: 'a_only', relation: '1:0', aRows: [recordA.sourceRow], bRows: [], amount: recordA.amount, date: recordA.dateIso, reason: recordA.invalidAmount ? 'Invalid amount in A' : `Date error in A: ${recordA.dateError}` });
      continue;
    }

    const conflicts = b.filter((recordB) => !usedB.has(recordB.sourceRow) && referenceConflict(recordA, recordB));
    if (conflicts.length === 1) {
      const recordB = conflicts[0];
      usedB.add(recordB.sourceRow);
      results.push({ status: 'conflict', relation: '1:1', aRows: [recordA.sourceRow], bRows: [recordB.sourceRow], amount: recordA.amount, date: recordA.dateIso, reason: `Same reference · Amount differs by ${amountDistance(recordA, recordB)}` });
      continue;
    }

    const candidates = [];
    for (const recordB of b) {
      if (usedB.has(recordB.sourceRow) || recordB.invalidAmount || recordB.dateError) continue;
      const amountGap = amountDistance(recordA, recordB);
      if (amountGap > config.amountTolerance) continue;
      const dateGap = useDate ? dateDistance(recordA, recordB) : null;
      if (useDate && (dateGap === null || dateGap > config.dateToleranceDays)) continue;
      if (useReference && recordA.reference && recordB.reference && recordA.reference !== recordB.reference) continue;
      candidates.push({ recordB, amountGap, dateGap });
    }

    candidates.sort((x, y) => x.amountGap - y.amountGap || (x.dateGap ?? 0) - (y.dateGap ?? 0) || x.recordB.sourceRow - y.recordB.sourceRow);

    if (candidates.length === 1) {
      const match = candidates[0];
      usedB.add(match.recordB.sourceRow);
      const exact = match.amountGap === 0 && (!useDate || match.dateGap === 0);
      results.push({
        status: exact ? 'exact_match' : 'tolerant_match',
        relation: '1:1',
        aRows: [recordA.sourceRow],
        bRows: [match.recordB.sourceRow],
        amount: recordA.amount,
        date: recordA.dateIso,
        reason: reasonFor(recordA, match.recordB, match.dateGap, match.amountGap)
      });
    } else if (candidates.length > 1) {
      results.push({
        status: 'candidate',
        relation: '1:?',
        aRows: [recordA.sourceRow],
        bRows: candidates.map((item) => item.recordB.sourceRow),
        amount: recordA.amount,
        date: recordA.dateIso,
        reason: `${candidates.length} equally acceptable candidates require review`
      });
    } else {
      results.push({ status: 'a_only', relation: '1:0', aRows: [recordA.sourceRow], bRows: [], amount: recordA.amount, date: recordA.dateIso, reason: 'No acceptable B-side match' });
    }
  }

  for (const recordB of b) {
    if (!usedB.has(recordB.sourceRow)) {
      const alreadyCandidate = results.some((item) => item.status === 'candidate' && item.bRows.includes(recordB.sourceRow));
      if (!alreadyCandidate) {
        results.push({ status: 'b_only', relation: '0:1', aRows: [], bRows: [recordB.sourceRow], amount: recordB.amount, date: recordB.dateIso, reason: recordB.invalidAmount ? 'Invalid amount in B' : 'No accepted A-side match' });
      }
    }
  }

  const duplicateResults = [];
  for (const row of [...dupA].sort((x, y) => x - y)) duplicateResults.push({ status: 'duplicate', relation: 'A', aRows: [row], bRows: [], amount: null, date: '', reason: 'Duplicate reconciliation signature on A side' });
  for (const row of [...dupB].sort((x, y) => x - y)) duplicateResults.push({ status: 'duplicate', relation: 'B', aRows: [], bRows: [row], amount: null, date: '', reason: 'Duplicate reconciliation signature on B side' });

  return [...results, ...duplicateResults];
}

export function summarize(results) {
  const summary = { exact_match: 0, tolerant_match: 0, candidate: 0, a_only: 0, b_only: 0, duplicate: 0, conflict: 0 };
  for (const item of results) if (item.status in summary) summary[item.status] += 1;
  return summary;
}
