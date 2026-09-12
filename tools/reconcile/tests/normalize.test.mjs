import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAmount, normalizeDate, normalizeReference, normalizeText } from '../normalize.mjs';

test('normalizes Unicode width and whitespace deterministically', () => {
  assert.equal(normalizeText('  ＡＢＣ　１２３  '), 'ABC 123');
  assert.equal(normalizeReference(' ＯＲＤ－００１ '), 'ord-001');
});

test('parses common financial amount formats without guessing malformed input', () => {
  assert.equal(normalizeAmount('¥12,800'), 12800);
  assert.equal(normalizeAmount('￥１２，８００'), 12800);
  assert.equal(normalizeAmount('(5,000)'), -5000);
  assert.equal(normalizeAmount('−100.50'), -100.5);
  assert.equal(normalizeAmount('100.50-'), -100.5);
  assert.equal(normalizeAmount('JPY 1,234.50'), 1234.5);
  assert.equal(normalizeAmount('1,234.50 USD'), 1234.5);
  assert.equal(normalizeAmount('1.234,56'), 1234.56);
  assert.equal(normalizeAmount('1234,56'), 1234.56);
  assert.equal(normalizeAmount('1,23,4'), null);
  assert.equal(normalizeAmount('ABC123'), null);
  assert.equal(normalizeAmount('oops'), null);
});

test('keeps date parsing strict while allowing timestamps', () => {
  assert.equal(normalizeDate('２０２６／０９／１２').iso, '2026-09-12');
  assert.equal(normalizeDate('2026-09-12T13:45:00Z').iso, '2026-09-12');
  assert.equal(normalizeDate('2026-09-12 13:45:00').iso, '2026-09-12');
  assert.equal(normalizeDate('2026-09-12junk').error, 'invalid_date');
  assert.equal(normalizeDate('2026-02-30').error, 'invalid_date');
});

test('rejects ambiguous day/month order unless mode or values disambiguate it', () => {
  assert.equal(normalizeDate('03/04/2026').error, 'ambiguous_date');
  assert.equal(normalizeDate('03/04/2026', 'mdy').iso, '2026-03-04');
  assert.equal(normalizeDate('03/04/2026', 'dmy').iso, '2026-04-03');
  assert.equal(normalizeDate('03/14/2026').iso, '2026-03-14');
  assert.equal(normalizeDate('14/03/2026').iso, '2026-03-14');
});
