const assert = require('node:assert/strict');
const { validate, loadContext, read, digest, candidateDigest } = require('./image-lifecycle-v2.3.cjs');
const clone = (x) => JSON.parse(JSON.stringify(x));
async function runTests() {
  const base = { ledger: read('image-lifecycle-v2.3.json'), policy: read('image-lifecycle-policy-v2.3.json'), context: await loadContext() };
  let passed = 0;
  function test(name, change, error) {
    const f = clone(base);
    change(f);
    if (error) assert.throws(() => validate(f.ledger, f.policy, f.context, { checkAssets: false }), error, name);
    else validate(f.ledger, f.policy, f.context, { checkAssets: false });
    passed++;
  }
  const formal = (f) => f.ledger.items.find((r) => r.history.at(-1).state === 'promoted');
  const pending = (f) => f.ledger.items.find((r) => r.history.at(-1).state === 'unreviewed');
  function event(state, candidate = null, context = null) {
    return { state, at: '2026-09-19T00:00:00Z', actor: 'fixture-reviewer', reason: 'Fixture review attestation.',
      candidate_id: candidate?.id || null, candidate_sha256: candidate ? candidateDigest(candidate, context) : null, hold: null };
  }
  function flow(f, states) {
    const row = formal(f), candidate = f.ledger.candidates.find((c) => c.id === row.history[0].candidate_id);
    f.policy.imports = f.policy.imports.filter((r) => r.entry_id !== row.entry_id);
    row.history = states.map((state) => event(state, f.policy.states[state].candidate ? candidate : null, f.context));
    if (states.at(-1) !== 'promoted') f.context.registry = f.context.registry.filter((r) => r.entry_id !== candidate.source_entry_id);
    // Candidates are append-only evidence, so early stages without a candidate don't retain an orphan fixture.
    if (!states.some((s) => f.policy.states[s].candidate)) f.ledger.candidates = f.ledger.candidates.filter((c) => c.id !== candidate.id);
    return { row, candidate };
  }
  test('baseline', () => {});
  test('license then subject then promotion', (f) => flow(f, ['unreviewed','awaiting_source','candidate','provenance_verified','verified','promoted']));
  test('subject then license then promotion', (f) => flow(f, ['unreviewed','awaiting_source','candidate','subject_verified','verified','promoted']));
  for (const state of ['awaiting_source','candidate','provenance_verified','subject_verified','verified']) {
    const states = ['unreviewed','awaiting_source'];
    if (state !== 'awaiting_source') states.push('candidate');
    if (['provenance_verified','verified'].includes(state)) states.push('provenance_verified');
    if (state === 'subject_verified') states.push(state);
    if (state === 'verified') states.push(state);
    test(`valid ${state}`, (f) => flow(f, states));
  }
  test('missing public disposition', (f) => f.ledger.items.splice(0,1), /no review disposition/);
  test('duplicate lifecycle', (f) => f.ledger.items.push(clone(f.ledger.items[0])), /duplicate lifecycle/);
  test('nonexistent lifecycle', (f) => f.ledger.items[0].entry_id = 'no_such_entry', /not a published canonical/);
  test('retired ID is not public lifecycle owner', (f) => f.ledger.items[0].entry_id = f.context.redirects[0].from, /not a published canonical/);
  test('empty history', (f) => f.ledger.items[0].history = [], /history required/);
  test('unrecognized state', (f) => pending(f).history[0].state = 'unobtainable', /invalid lifecycle state/);
  test('silent promoted bootstrap', (f) => { f.policy.imports = []; }, /first event must/);
  test('modified historical decision', (f) => formal(f).history[0].reason = 'rewritten', /first event must|historical import changed/);
  test('unknown event fields', (f) => pending(f).history[0].verified = true, /unknown field/);
  test('unreviewed cannot have candidate', (f) => pending(f).history[0].candidate_id = f.ledger.candidates[0].id, /cannot contain candidate/);
  test('new required decision', (f) => pending(f).history.push(event('awaiting_source')));
  test('unknown provenance cannot skip verification', (f) => flow(f, ['unreviewed','awaiting_source','candidate','promoted']), /illegal transition/);
  test('license alone cannot promote', (f) => flow(f, ['unreviewed','awaiting_source','candidate','provenance_verified','promoted']), /illegal transition/);
  test('subject alone cannot promote', (f) => flow(f, ['unreviewed','awaiting_source','candidate','subject_verified','promoted']), /illegal transition/);
  test('cannot skip applicability', (f) => flow(f, ['unreviewed','candidate']), /illegal transition/);
  test('chronology', (f) => { const r=pending(f); r.history.push({...event('awaiting_source'),at:'2020-01-01T00:00:00Z'}); }, /chronology/);
  test('actor required', (f) => pending(f).history[0].actor = '', /requires actor/);
  test('hold allowed before applicability decision', (f) => {pending(f).history[0].hold={reason:'Identity unclear',resume_when:'Canonical identity reviewed'};});
  test('hold requires resume condition', (f) => pending(f).history[0].hold = {reason:'blocked'}, /hold requires/);
  test('hold forbidden for promoted', (f) => {
    const row=formal(f); row.history.push({...clone(row.history[0]),at:'2026-09-19T00:00:00Z',hold:{reason:'x',resume_when:'y'}});
  }, /terminal disposition/);
  test('active image cannot revert to awaiting source', (f) => formal(f).history.push(event('awaiting_source')), /active formal image contradiction/);
  test('not_required conflicts with image', (f) => f.context.exceptions.push({entry_id:formal(f).entry_id,state:'not_required',reason:'x'}), /conflicts with active formal/);
  test('not_required must have exception', (f) => pending(f).history.push(event('not_required')), /exception contradiction/);
  test('exception reason cannot be lost', (f) => { const r=f.ledger.items.find(r=>r.history[0].state==='not_required'); r.history.push(event('not_required')); }, /reason must match/);
  test('license missing in registry', (f) => delete f.context.registry[0].source.license, /provenance license required/);
  test('subject missing in registry', (f) => f.context.registry[0].subject_match='unreviewed', /lacks subject verification/);
  test('historical subject missing', (f) => Object.values(f.context.sources)[0][0].subject_match='unreviewed', /reviewed historical source required/);
  test('source points to nonexistent entry', (f) => Object.values(f.context.sources)[0][0].entry_id='no_such_entry', /source has no public/);
  test('source points to quarantined entry', (f) => {const id=f.context.corpusIds.find(id=>!f.context.publicIds.includes(id)&&!f.context.redirects.some(r=>r.from===id));Object.values(f.context.sources)[0][0].entry_id=id;}, /source has no public/);
  test('redirect removed from inherited source', (f) => {
    const inherited=f.context.registry.find(r=>f.context.redirects.some(d=>d.from===r.entry_id));
    f.context.redirects=f.context.redirects.filter(r=>r.from!==inherited.entry_id);
  }, /source has no public/);
  test('redirect cycle', (f) => f.context.redirects.push({from:f.context.redirects[0].to,to:f.context.redirects[0].from,reason:'fixture'}), /redirect cycle/);
  test('duplicate source', (f) => Object.values(f.context.sources)[0].push(clone(Object.values(f.context.sources)[0][0])), /conflicting source/);
  test('duplicate registry', (f) => f.context.registry.push(clone(f.context.registry[0])), /duplicate registry/);
  test('duplicate candidate', (f) => f.ledger.candidates.push(clone(f.ledger.candidates[0])), /duplicate\/missing candidate/);
  test('evidence changed', (f) => { const row=formal(f);row.history.push({...clone(row.history[0]),at:'2026-09-19T00:00:00Z',candidate_sha256:'0'.repeat(64)});}, /changed candidate evidence/);
  test('publication count mismatch', (f) => f.context.publication.summary.published_runtime_entries++, /publication count mismatch/);
  test('publication ID hash mismatch', (f) => f.context.publication.hashes.published_id_sha256='bad', /publication ID hash mismatch/);
  test('illustration never promotes', (f) => {
    const {row,candidate}=flow(f,['unreviewed','awaiting_source','candidate','provenance_verified','verified','promoted']);
    candidate.kind='illustration';for(const e of row.history)if(e.candidate_id)e.candidate_sha256=candidateDigest(candidate,f.context);
  }, /illustration cannot/);
  test('legacy SVG cannot become candidate media kind', (f) => f.ledger.candidates[0].kind='legacy_svg', /invalid media kind/);
  test('candidate replacement resets verification', (f) => {
    const {row,candidate}=flow(f,['unreviewed','awaiting_source','candidate','provenance_verified','verified']);
    const newer={...clone(candidate),id:'replacement'};f.ledger.candidates.push(newer);
    row.history.push(event('verified',newer,f.context));
  }, /replacement must restart/);
  test('candidate replacement through candidate is valid', (f) => {
    const {row,candidate}=flow(f,['unreviewed','awaiting_source','candidate','subject_verified']);
    const newer={...clone(candidate),id:'replacement'};f.ledger.candidates.push(newer);row.history.push(event('candidate',newer,f.context));
  });
  // Real bytes exercise the source/format gate, without changing tracked assets.
  const f=clone(base); f.context.registry[0].primary.source='./images/ATTRIBUTION.md';
  assert.throws(()=>validate(f.ledger,f.policy,f.context), /JPEG\/PNG/);passed++;
  console.log(`Construction Tools Atlas image lifecycle fixtures: ${passed} PASS / 0 FAIL`);
  return passed;
}
module.exports = { runTests };
if(require.main===module) runTests().catch(e=>{console.error(e);process.exitCode=1;});
