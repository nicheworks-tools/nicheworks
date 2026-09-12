import { normalizeAmount, normalizeDate, normalizeReference, normalizeText } from './normalize.mjs';

function selectedValue(row, column) {
  return column ? row.values[column] : '';
}

function applySignMode(amount, side, mode) {
  if (amount === null) return null;
  if (mode === 'invert_b' && side === 'b') return -amount;
  if (mode === 'ignore_sign') return Math.abs(amount);
  return amount;
}

function buildRecord(row, mapping, options, side) {
  const rawAmount = normalizeAmount(selectedValue(row, mapping.amount));
  const amount = applySignMode(rawAmount, side, options.signMode);
  const dateResult = mapping.date ? normalizeDate(selectedValue(row, mapping.date), options.dateMode) : { dayKey: null, iso: '', error: null };
  const reference = mapping.reference ? normalizeReference(selectedValue(row, mapping.reference)) : '';
  const description = mapping.description ? normalizeText(selectedValue(row, mapping.description)) : '';
  return {
    row,
    side,
    sourceRow: row.sourceRow,
    rawAmount,
    amount,
    dateKey: dateResult.dayKey,
    dateIso: dateResult.iso,
    dateError: dateResult.error,
    reference,
    description,
    invalidAmount: amount === null
  };
}

function buildAmountIndex(records) {
  return records
    .filter((record) => !record.invalidAmount && !record.dateError)
    .sort((a, b) => a.amount - b.amount || a.sourceRow - b.sourceRow);
}

function lowerBoundAmount(records, value) {
  let lo = 0;
  let hi = records.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (records[mid].amount < value) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

function recordsWithinAmount(records, amount, tolerance) {
  const min = amount - tolerance;
  const max = amount + tolerance;
  const start = lowerBoundAmount(records, min);
  const out = [];
  for (let i = start; i < records.length && records[i].amount <= max; i += 1) out.push(records[i]);
  return out;
}

function buildReferenceIndex(records) {
  const map = new Map();
  for (const record of records) {
    if (!record.reference) continue;
    if (!map.has(record.reference)) map.set(record.reference, []);
    map.get(record.reference).push(record);
  }
  return map;
}

function roundAmount(value) {
  return Number(Number(value).toFixed(12));
}

function amountDistance(a, b) {
  return roundAmount(Math.abs(a.amount - b.amount));
}

function dateDistance(a, b) {
  if (a.dateKey === null || b.dateKey === null) return null;
  return Math.abs(a.dateKey - b.dateKey);
}

function referencesCompatible(a, b, useReference) {
  if (!useReference) return true;
  if (!a.reference || !b.reference) return true;
  return a.reference === b.reference;
}

function referenceConflict(a, b, tolerance) {
  return Boolean(a.reference && b.reference && a.reference === b.reference && a.amount !== null && b.amount !== null && amountDistance(a, b) > tolerance);
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

function groupDateCompatible(anchor, record, useDate, tolerance) {
  if (!useDate) return true;
  const gap = dateDistance(anchor, record);
  return gap !== null && gap <= tolerance;
}

function groupReferenceCompatible(anchor, record, useReference) {
  return referencesCompatible(anchor, record, useReference);
}

function findCombinations(records, target, tolerance, maxSize, maxNodes) {
  const solutions = [];
  const sorted = [...records].sort((a, b) => a.sourceRow - b.sourceRow);
  let visitedNodes = 0;
  let truncated = false;

  function walk(start, picked, sum) {
    if (solutions.length > 1 || truncated) return;
    visitedNodes += 1;
    if (visitedNodes > maxNodes) {
      truncated = true;
      return;
    }
    if (picked.length >= 2 && roundAmount(Math.abs(sum - target)) <= tolerance) {
      solutions.push([...picked]);
      if (solutions.length > 1) return;
    }
    if (picked.length >= maxSize) return;

    for (let i = start; i < sorted.length; i += 1) {
      picked.push(sorted[i]);
      walk(i + 1, picked, roundAmount(sum + sorted[i].amount));
      picked.pop();
      if (solutions.length > 1 || truncated) return;
    }
  }

  walk(0, [], 0);
  return { solutions, truncated, visitedNodes };
}

function groupReason(relation, target, members, tolerance) {
  const sum = members.reduce((total, item) => roundAmount(total + item.amount), 0);
  const diff = roundAmount(Math.abs(sum - target.amount));
  return `${relation} aggregate amount ${sum} · target ${target.amount} · difference ${diff}${tolerance ? ` · tolerance ${tolerance}` : ''}`;
}

export function reconcile({ rowsA, rowsB, mappingA, mappingB, options = {} }) {
  const config = {
    dateToleranceDays: Math.max(0, Number(options.dateToleranceDays ?? 0)),
    amountTolerance: Math.max(0, Number(options.amountTolerance ?? 0)),
    dateMode: options.dateMode || 'auto',
    signMode: ['normal', 'invert_b', 'ignore_sign'].includes(options.signMode) ? options.signMode : 'normal',
    groupMatching: Boolean(options.groupMatching),
    maxGroupSize: Math.min(5, Math.max(2, Number(options.maxGroupSize ?? 5))),
    groupSearchNodeLimit: Math.max(1, Number(options.groupSearchNodeLimit ?? 50000))
  };
  if (!mappingA?.amount || !mappingB?.amount) throw new Error('amount_mapping_required');

  const a = rowsA.map((row) => buildRecord(row, mappingA, config, 'a'));
  const b = rowsB.map((row) => buildRecord(row, mappingB, config, 'b'));
  const useDate = Boolean(mappingA.date && mappingB.date);
  const useReference = Boolean(mappingA.reference && mappingB.reference);
  const dupA = markDuplicates(a, useDate, useReference);
  const dupB = markDuplicates(b, useDate, useReference);
  const amountIndexB = buildAmountIndex(b);
  const referenceIndexB = buildReferenceIndex(b);
  const usedA = new Set();
  const usedB = new Set();
  const reservedCandidateA = new Set();
  const reservedCandidateB = new Set();
  const results = [];

  for (const recordA of a) {
    if (recordA.invalidAmount || recordA.dateError) {
      results.push({ status: 'a_only', relation: '1:0', aRows: [recordA.sourceRow], bRows: [], amount: recordA.amount, date: recordA.dateIso, reason: recordA.invalidAmount ? 'Invalid amount in A' : `Date error in A: ${recordA.dateError}` });
      usedA.add(recordA.sourceRow);
      continue;
    }

    const conflicts = (recordA.reference ? (referenceIndexB.get(recordA.reference) || []) : [])
      .filter((recordB) => !usedB.has(recordB.sourceRow) && referenceConflict(recordA, recordB, config.amountTolerance));
    if (conflicts.length === 1) {
      const recordB = conflicts[0];
      usedA.add(recordA.sourceRow);
      usedB.add(recordB.sourceRow);
      results.push({ status: 'conflict', relation: '1:1', aRows: [recordA.sourceRow], bRows: [recordB.sourceRow], amount: recordA.amount, date: recordA.dateIso, reason: `Same reference · Amount differs by ${amountDistance(recordA, recordB)}` });
      continue;
    }

    const candidates = [];
    for (const recordB of recordsWithinAmount(amountIndexB, recordA.amount, config.amountTolerance)) {
      if (usedB.has(recordB.sourceRow)) continue;
      const amountGap = amountDistance(recordA, recordB);
      const dateGap = useDate ? dateDistance(recordA, recordB) : null;
      if (useDate && (dateGap === null || dateGap > config.dateToleranceDays)) continue;
      if (!referencesCompatible(recordA, recordB, useReference)) continue;
      candidates.push({ recordB, amountGap, dateGap });
    }

    candidates.sort((x, y) => x.amountGap - y.amountGap || (x.dateGap ?? 0) - (y.dateGap ?? 0) || x.recordB.sourceRow - y.recordB.sourceRow);

    if (candidates.length === 1) {
      const match = candidates[0];
      usedA.add(recordA.sourceRow);
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
      reservedCandidateA.add(recordA.sourceRow);
      candidates.forEach((item) => reservedCandidateB.add(item.recordB.sourceRow));
      results.push({
        status: 'candidate',
        relation: '1:?',
        aRows: [recordA.sourceRow],
        bRows: candidates.map((item) => item.recordB.sourceRow),
        amount: recordA.amount,
        date: recordA.dateIso,
        reason: `${candidates.length} acceptable candidates require review`
      });
    }
  }

  if (config.groupMatching) {
    for (const recordA of a) {
      if (usedA.has(recordA.sourceRow) || reservedCandidateA.has(recordA.sourceRow) || recordA.invalidAmount || recordA.dateError) continue;
      const pool = b.filter((recordB) =>
        !usedB.has(recordB.sourceRow)
        && !reservedCandidateB.has(recordB.sourceRow)
        && !recordB.invalidAmount
        && !recordB.dateError
        && groupDateCompatible(recordA, recordB, useDate, config.dateToleranceDays)
        && groupReferenceCompatible(recordA, recordB, useReference)
      );
      const groupSearch = findCombinations(pool, recordA.amount, config.amountTolerance, config.maxGroupSize, config.groupSearchNodeLimit);
      const { solutions } = groupSearch;
      if (groupSearch.truncated) {
        reservedCandidateA.add(recordA.sourceRow);
        results.push({ status: 'candidate', relation: '1:n?', aRows: [recordA.sourceRow], bRows: pool.slice(0, 20).map((item) => item.sourceRow), amount: recordA.amount, date: recordA.dateIso, reason: `Grouped search safety limit reached after ${groupSearch.visitedNodes} nodes; manual review required` });
      } else if (solutions.length === 1) {
        const members = solutions[0];
        usedA.add(recordA.sourceRow);
        members.forEach((member) => usedB.add(member.sourceRow));
        results.push({ status: 'tolerant_match', relation: `1:${members.length}`, aRows: [recordA.sourceRow], bRows: members.map((item) => item.sourceRow), amount: recordA.amount, date: recordA.dateIso, reason: groupReason(`1:${members.length}`, recordA, members, config.amountTolerance) });
      } else if (solutions.length > 1) {
        reservedCandidateA.add(recordA.sourceRow);
        solutions.flat().forEach((member) => reservedCandidateB.add(member.sourceRow));
        results.push({ status: 'candidate', relation: '1:n?', aRows: [recordA.sourceRow], bRows: [...new Set(solutions.flat().map((item) => item.sourceRow))], amount: recordA.amount, date: recordA.dateIso, reason: 'Multiple valid grouped B-side combinations require review' });
      }
    }

    for (const recordB of b) {
      if (usedB.has(recordB.sourceRow) || reservedCandidateB.has(recordB.sourceRow) || recordB.invalidAmount || recordB.dateError) continue;
      const pool = a.filter((recordA) =>
        !usedA.has(recordA.sourceRow)
        && !reservedCandidateA.has(recordA.sourceRow)
        && !recordA.invalidAmount
        && !recordA.dateError
        && groupDateCompatible(recordB, recordA, useDate, config.dateToleranceDays)
        && groupReferenceCompatible(recordB, recordA, useReference)
      );
      const groupSearch = findCombinations(pool, recordB.amount, config.amountTolerance, config.maxGroupSize, config.groupSearchNodeLimit);
      const { solutions } = groupSearch;
      if (groupSearch.truncated) {
        reservedCandidateB.add(recordB.sourceRow);
        results.push({ status: 'candidate', relation: 'n:1?', aRows: pool.slice(0, 20).map((item) => item.sourceRow), bRows: [recordB.sourceRow], amount: recordB.amount, date: recordB.dateIso, reason: `Grouped search safety limit reached after ${groupSearch.visitedNodes} nodes; manual review required` });
      } else if (solutions.length === 1) {
        const members = solutions[0];
        usedB.add(recordB.sourceRow);
        members.forEach((member) => usedA.add(member.sourceRow));
        results.push({ status: 'tolerant_match', relation: `${members.length}:1`, aRows: members.map((item) => item.sourceRow), bRows: [recordB.sourceRow], amount: recordB.amount, date: recordB.dateIso, reason: groupReason(`${members.length}:1`, recordB, members, config.amountTolerance) });
      } else if (solutions.length > 1) {
        reservedCandidateB.add(recordB.sourceRow);
        solutions.flat().forEach((member) => reservedCandidateA.add(member.sourceRow));
        results.push({ status: 'candidate', relation: 'n:1?', aRows: [...new Set(solutions.flat().map((item) => item.sourceRow))], bRows: [recordB.sourceRow], amount: recordB.amount, date: recordB.dateIso, reason: 'Multiple valid grouped A-side combinations require review' });
      }
    }
  }

  for (const recordA of a) {
    if (!usedA.has(recordA.sourceRow) && !reservedCandidateA.has(recordA.sourceRow)) {
      results.push({ status: 'a_only', relation: '1:0', aRows: [recordA.sourceRow], bRows: [], amount: recordA.amount, date: recordA.dateIso, reason: recordA.invalidAmount ? 'Invalid amount in A' : 'No acceptable B-side match' });
    }
  }

  for (const recordB of b) {
    if (!usedB.has(recordB.sourceRow) && !reservedCandidateB.has(recordB.sourceRow)) {
      results.push({ status: 'b_only', relation: '0:1', aRows: [], bRows: [recordB.sourceRow], amount: recordB.amount, date: recordB.dateIso, reason: recordB.invalidAmount ? 'Invalid amount in B' : 'No accepted A-side match' });
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
