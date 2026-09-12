import test from 'node:test';
import assert from 'node:assert/strict';
import { createProfileStore, PROFILE_BUNDLE_KIND, PROFILE_SCHEMA_VERSION } from '../rules-store.mjs';

function memoryStorage() {
  const map = new Map();
  return {
    getItem: (key) => map.has(key) ? map.get(key) : null,
    setItem: (key, value) => map.set(key, String(value)),
    removeItem: (key) => map.delete(key)
  };
}

const sample = {
  name: 'Stripe payout',
  config: {
    parser: { encoding: 'shift_jis', delimiter: ',', headerRow: 2 },
    mappingA: { amount: 'Amount', date: 'Date', reference: 'ID', description: 'Memo' },
    mappingB: { amount: 'Total', date: 'Created', reference: 'Reference', description: 'Description' },
    options: { dateToleranceDays: 1, amountTolerance: 0.05, dateMode: 'mdy', signMode: 'invert_b', groupMatching: true, maxGroupSize: 4 }
  }
};

test('saves only normalized profile configuration', () => {
  const store = createProfileStore(memoryStorage());
  const saved = store.save(sample, { now: Date.parse('2026-09-12T00:00:00Z') });
  assert.equal(saved.name, 'Stripe payout');
  assert.equal(saved.config.parser.headerRow, 2);
  assert.equal(saved.config.options.amountTolerance, 0.05);
  assert.equal(saved.config.options.groupMatching, true);
  assert.equal('rows' in saved, false);
  assert.equal(store.list().length, 1);
});

test('updates an existing profile without duplicating its id', () => {
  const storage = memoryStorage();
  const store = createProfileStore(storage);
  const saved = store.save(sample, { now: Date.parse('2026-09-12T00:00:00Z') });
  store.save({ ...saved, name: 'Updated' }, { now: Date.parse('2026-09-12T01:00:00Z') });
  const list = store.list();
  assert.equal(list.length, 1);
  assert.equal(list[0].id, saved.id);
  assert.equal(list[0].name, 'Updated');
  assert.equal(list[0].createdAt, saved.createdAt);
});

test('exports and imports a versioned profile bundle', () => {
  const source = createProfileStore(memoryStorage());
  source.save(sample, { now: Date.parse('2026-09-12T00:00:00Z') });
  const bundle = source.exportBundle({ now: Date.parse('2026-09-12T02:00:00Z') });
  const parsed = JSON.parse(bundle);
  assert.equal(parsed.kind, PROFILE_BUNDLE_KIND);
  assert.equal(parsed.version, PROFILE_SCHEMA_VERSION);
  assert.equal(parsed.profiles.length, 1);

  const target = createProfileStore(memoryStorage());
  const result = target.importBundle(bundle, { now: Date.parse('2026-09-12T03:00:00Z') });
  assert.equal(result.imported, 1);
  assert.equal(target.list()[0].name, 'Stripe payout');
});

test('rejects invalid bundle schema and clamps unsafe values', () => {
  const store = createProfileStore(memoryStorage());
  assert.throws(() => store.importBundle('{"kind":"other","version":1,"profiles":[]}'), /profile_bundle_invalid_schema/);
  const saved = store.save({
    name: 'x'.repeat(200),
    config: { parser: { headerRow: 999 }, options: { dateToleranceDays: -10, amountTolerance: -1, maxGroupSize: 99, signMode: 'bad' } }
  }, { now: Date.parse('2026-09-12T00:00:00Z') });
  assert.equal(saved.name.length, 80);
  assert.equal(saved.config.parser.headerRow, 20);
  assert.equal(saved.config.options.dateToleranceDays, 0);
  assert.equal(saved.config.options.amountTolerance, 0);
  assert.equal(saved.config.options.maxGroupSize, 5);
  assert.equal(saved.config.options.signMode, 'normal');

  const upperBound = store.save({
    name: 'Date upper bound',
    config: { options: { dateToleranceDays: 31 } }
  }, { now: Date.parse('2026-09-12T00:00:01Z') });
  assert.equal(upperBound.config.options.dateToleranceDays, 1);
});

test('remove and clear are deterministic', () => {
  const store = createProfileStore(memoryStorage());
  const one = store.save({ ...sample, name: 'One' }, { now: Date.parse('2026-09-12T00:00:00Z') });
  store.save({ ...sample, name: 'Two' }, { now: Date.parse('2026-09-12T00:00:01Z') });
  assert.equal(store.remove(one.id), true);
  assert.equal(store.remove(one.id), false);
  assert.equal(store.list().length, 1);
  store.clear();
  assert.equal(store.list().length, 0);
});
