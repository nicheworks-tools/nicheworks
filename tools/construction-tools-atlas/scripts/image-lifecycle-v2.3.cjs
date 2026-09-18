// The lifecycle is review metadata, not runtime image selection. No network I/O.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const ROOT = path.resolve(__dirname, '..');
const DATA = path.join(ROOT, 'data');
const read = (name) => JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
const digest = (value) => crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
const nonempty = (v) => typeof v === 'string' && v.trim().length > 0;
function assert(ok, message) { if (!ok) throw new Error(message); }
function keys(obj, allowed, label) {
  assert(obj && typeof obj === 'object' && !Array.isArray(obj), `${label}: object required`);
  for (const key of Object.keys(obj)) assert(allowed.includes(key), `${label}: unknown field ${key}`);
}
function https(value, label) {
  let valid = false;
  try { valid = new URL(value).protocol === 'https:'; } catch (_) {}
  assert(valid, `${label}: HTTPS URL required`);
}
const PROVENANCE = ['source_url', 'source_page', 'license', 'license_url', 'author', 'attribution', 'source_sha1'];
function provenance(source, label) {
  for (const field of PROVENANCE) assert(nonempty(source[field]), `${label}: provenance ${field} required`);
  for (const field of ['source_url', 'source_page', 'license_url']) https(source[field], `${label}.${field}`);
  assert(/^[a-f0-9]{40}$/.test(source.source_sha1), `${label}: pinned source SHA-1 required`);
}
function localBytes(rel) {
  assert(typeof rel === 'string' && rel.startsWith('./'), 'asset must use local ./ path');
  const file = path.resolve(ROOT, rel);
  assert(file.startsWith(ROOT + path.sep), 'asset escapes tool directory');
  return fs.readFileSync(file);
}
function assets(item) {
  const id = item.entry_id;
  const source = localBytes(item.primary?.source);
  assert(source.length > 0, `${id}: empty retained source`);
  assert((source[0] === 0xff && source[1] === 0xd8 && source[2] === 0xff)
    || source.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10])), `${id}: retained source must be JPEG/PNG, not SVG/placeholder`);
  assert(crypto.createHash('sha1').update(source).digest('hex') === item.source.source_sha1, `${id}: retained source SHA-1 mismatch`);
  assert(item.primary.display !== item.primary.thumbnail, `${id}: separate derivatives required`);
  for (const name of ['display', 'thumbnail']) {
    assert(/\.webp$/.test(item.primary[name]), `${id}: ${name} must be WebP`);
    const bytes = localBytes(item.primary[name]);
    assert(bytes.length > 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP', `${id}: invalid WebP bytes`);
  }
}
async function loadContext() {
  const { runPublicLoader } = require('./audit-public-image-inventory-v2.3.cjs');
  const runtime = await runPublicLoader();
  const manifest = read('quality-manifest.json');
  const corpus = new Set();
  for (const p of [...manifest.base, ...manifest.packs.map((p) => typeof p === 'string' ? p : p.path)]) {
    const raw = read(p.replace(/^\.\/data\//, ''));
    const rows = Array.isArray(raw) ? raw : raw.rows || raw.entries || raw.data || [];
    for (const row of rows) corpus.add(row.id || row.slug);
  }
  const sources = {};
  for (const name of fs.readdirSync(DATA).filter((n) => /^image-wave\d+-sources-v2\.3\.json$/.test(n)).sort()) sources[name] = read(name).items;
  return { publicIds: runtime.entries.map((e) => e.id), corpusIds: [...corpus],
    publication: read('publication-inventory-v2.3.json'),
    redirects: read('canonical-redirects-v2.3.json').redirects,
    registry: read('image-registry-v2.3.json').items,
    exceptions: read('image-inventory-exceptions-v2.3.json').items, sources };
}
function resolveFactory(context) {
  const redirects = new Map();
  const corpus = new Set(context.corpusIds);
  for (const r of context.redirects) {
    assert(corpus.has(r.from) && corpus.has(r.to), 'redirect references nonexistent entry');
    assert(!redirects.has(r.from) && nonempty(r.reason), 'duplicate/undocumented redirect');
    redirects.set(r.from, r.to);
  }
  const resolve = (id) => {
    const seen = new Set();
    while (redirects.has(id)) {
      assert(!seen.has(id), 'canonical redirect cycle'); seen.add(id); id = redirects.get(id);
    }
    return id;
  };
  for (const id of redirects.keys()) resolve(id);
  return resolve;
}
function candidateSource(candidate, context) {
  assert(Boolean(candidate.source_ref) !== Boolean(candidate.source), `${candidate.id}: use exactly one source or source_ref`);
  if (candidate.source) return candidate.source;
  keys(candidate.source_ref, ['file', 'entry_id'], 'source_ref');
  const matches = (context.sources[candidate.source_ref.file] || []).filter((s) => s.entry_id === candidate.source_ref.entry_id);
  assert(matches.length === 1, `${candidate.id}: source_ref must select exactly one historical source row`);
  assert(candidate.source_ref.entry_id === candidate.source_entry_id, `${candidate.id}: historical source identity mismatch`);
  return matches[0];
}
function candidateDigest(candidate, context) { return digest({ candidate, source: candidateSource(candidate, context) }); }

function validate(ledger, policy, context, { checkAssets = true } = {}) {
  keys(ledger, ['schema', 'version', 'candidates', 'items'], 'ledger');
  assert(ledger.schema === 'cta-image-lifecycle-v2.3' && nonempty(ledger.version), 'invalid lifecycle schema/version');
  assert(Array.isArray(ledger.items) && Array.isArray(ledger.candidates), 'lifecycle arrays required');
  assert(policy.schema === 'cta-image-lifecycle-policy-v2.3', 'invalid policy schema');
  const publicIds = new Set(context.publicIds);
  const corpus = new Set(context.corpusIds);
  assert(publicIds.size === context.publicIds.length, 'duplicate public canonical IDs');
  assert(publicIds.size === context.publication.summary.published_runtime_entries, 'publication count mismatch');
  const ids = [...publicIds].sort((a,b) => a.localeCompare(b, 'en'));
  const idHash = crypto.createHash('sha256').update(ids.join('\n') + '\n').digest('hex');
  assert(idHash === context.publication.hashes.published_id_sha256, 'publication ID hash mismatch');
  const resolve = resolveFactory(context);
  for (const id of publicIds) assert(corpus.has(id) && resolve(id) === id, `${id}: public canonical invalid`);
  const sourceById = new Map();
  for (const [file, rows] of Object.entries(context.sources)) for (const source of rows) {
    assert(corpus.has(source.entry_id) && publicIds.has(resolve(source.entry_id)), `${source.entry_id}: source has no public canonical/valid redirect`);
    assert(!sourceById.has(source.entry_id), `${source.entry_id}: conflicting source rows`);
    sourceById.set(source.entry_id, { file, source });
  }
  const formalByTarget = new Map();
  const registryIds = new Set();
  for (const item of context.registry) {
    assert(!registryIds.has(item.entry_id), `${item.entry_id}: duplicate registry row`); registryIds.add(item.entry_id);
    assert(corpus.has(item.entry_id) && publicIds.has(resolve(item.entry_id)), `${item.entry_id}: registry has no public canonical/valid redirect`);
    const formal = ['reviewed', 'verified'].includes(item.image_state);
    assert(item.migration_state !== 'promoted' || formal, `${item.entry_id}: impossible registry promotion`);
    if (!formal) continue;
    assert(item.subject_match === 'matched', `${item.entry_id}: promoted image lacks subject verification`);
    assert(['reviewed', 'verified', 'promoted'].includes(item.migration_state), `${item.entry_id}: invalid formal migration state`);
    provenance(item.source || {}, item.entry_id);
    assert(nonempty(item.source.modifications), `${item.entry_id}: derivative disclosure required`);
    const historical = sourceById.get(item.entry_id)?.source;
    assert(historical && ['reviewed', 'verified'].includes(historical.review_state) && historical.subject_match === 'matched' && nonempty(historical.review_note), `${item.entry_id}: reviewed historical source required`);
    for (const field of PROVENANCE) assert(item.source[field] === historical[field], `${item.entry_id}: registry/source provenance mismatch ${field}`);
    if (checkAssets) assets(item);
    const target = resolve(item.entry_id);
    if (!formalByTarget.has(target)) formalByTarget.set(target, []);
    formalByTarget.get(target).push(item);
  }
  const selected = new Map();
  for (const [target, items] of formalByTarget) {
    const direct = items.find((i) => i.entry_id === target);
    assert(direct || items.length === 1, `${target}: ambiguous inherited formal images`);
    selected.set(target, direct || items[0]); // Match runtime: direct ownership wins.
  }
  const exceptions = new Map();
  for (const item of context.exceptions) {
    const id = resolve(item.entry_id);
    assert(corpus.has(item.entry_id) && publicIds.has(id), `${item.entry_id}: exception outside public canonicals`);
    assert(item.state === 'not_required' && nonempty(item.reason), `${id}: exception must be reasoned not_required; unobtainable is not supported`);
    assert(!exceptions.has(id), `${id}: duplicate canonical exception`);
    assert(!selected.has(id), `${id}: not_required conflicts with active formal image`);
    exceptions.set(id, item);
  }
  const candidates = new Map();
  for (const c of ledger.candidates) {
    keys(c, ['id', 'source_entry_id', 'kind', 'source_ref', 'source'], 'candidate');
    assert(nonempty(c.id) && !candidates.has(c.id), 'duplicate/missing candidate ID');
    assert(['photograph', 'illustration'].includes(c.kind), `${c.id}: invalid media kind`);
    assert(corpus.has(c.source_entry_id) && publicIds.has(resolve(c.source_entry_id)), `${c.id}: candidate has no public canonical/valid redirect`);
    const source = candidateSource(c, context);
    https(source.source_page, c.id); https(source.source_url, c.id);
    candidates.set(c.id, { candidate: c, source, digest: candidateDigest(c, context) });
  }
  const imports = new Map(policy.imports.map((i) => [i.entry_id, i.event_sha256]));
  assert(imports.size === policy.imports.length, 'duplicate migration import');
  const seen = new Set(); const usedCandidates = new Set(); const rows = [];
  for (const item of ledger.items) {
    keys(item, ['entry_id', 'history'], 'lifecycle item');
    const id = item.entry_id;
    assert(publicIds.has(id), `${id}: lifecycle record is not a published canonical`);
    assert(!seen.has(id), `${id}: duplicate lifecycle record`); seen.add(id);
    assert(Array.isArray(item.history) && item.history.length, `${id}: review disposition/history required`);
    let previous;
    for (const [index, event] of item.history.entries()) {
      keys(event, ['state', 'at', 'actor', 'reason', 'candidate_id', 'candidate_sha256', 'hold'], `${id} event`);
      const rule = policy.states[event.state];
      assert(rule, `${id}: invalid lifecycle state ${event.state}`);
      assert(nonempty(event.actor) && nonempty(event.reason) && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(event.at) && Number.isFinite(Date.parse(event.at)), `${id}: event requires actor, UTC timestamp, reason`);
      if (index === 0) {
        assert(event.state === 'unreviewed' || imports.get(id) === digest(event), `${id}: first event must be unreviewed or pinned historical import`);
        if (imports.has(id)) assert(imports.get(id) === digest(event), `${id}: historical import changed`);
      } else {
        assert(Date.parse(event.at) >= Date.parse(previous.at), `${id}: event chronology invalid`);
        assert(policy.states[previous.state].next.includes(event.state), `${id}: illegal transition ${previous.state} -> ${event.state}`);
        if (previous.candidate_id && event.candidate_id && previous.candidate_id !== event.candidate_id) {
          assert(event.state === 'candidate', `${id}: candidate replacement must restart verification`);
        }
      }
      if (event.hold !== null) {
        keys(event.hold, ['reason', 'resume_when'], `${id} hold`);
        assert(nonempty(event.hold.reason) && nonempty(event.hold.resume_when), `${id}: hold requires reason and resume condition`);
        assert(!['not_required', 'promoted'].includes(event.state), `${id}: terminal disposition cannot be on hold`);
      }
      if (rule.candidate) {
        const c = candidates.get(event.candidate_id);
        assert(c && event.candidate_sha256 === c.digest, `${id}: missing/changed candidate evidence`);
        usedCandidates.add(event.candidate_id);
        assert(resolve(c.candidate.source_entry_id) === id, `${id}: candidate subject canonical mismatch`);
        if (rule.provenance_verified) provenance(c.source, id);
        // These states are explicit attestations; event actor/time/reason records the reviewer.
        // Historical imports additionally rely on the pinned reviewed source note.
        if (event.state === 'promoted') {
          assert(c.candidate.kind === 'photograph', `${id}: representative illustration cannot be a formal photograph`);
          if (index === item.history.length - 1) {
            const image = selected.get(id);
            assert(image && image.entry_id === c.candidate.source_entry_id, `${id}: promoted candidate must match active registry ownership`);
            for (const field of PROVENANCE) assert(c.source[field] === image.source[field], `${id}: candidate/registry provenance mismatch ${field}`);
          }
        }
      } else {
        assert(event.candidate_id === null && event.candidate_sha256 === null, `${id}: state cannot contain candidate/verification evidence`);
      }
      previous = event;
    }
    const latest = previous; const rule = policy.states[latest.state];
    assert((latest.state === 'promoted') === selected.has(id), `${id}: lifecycle/active formal image contradiction`);
    assert((latest.state === 'not_required') === exceptions.has(id), `${id}: lifecycle/exception contradiction`);
    if (latest.state === 'not_required') assert(latest.reason === exceptions.get(id).reason, `${id}: no-image reason must match exception ledger`);
    const c = candidates.get(latest.candidate_id);
    rows.push({ id, applicability: rule.applicability, stage: latest.state,
      applicability_reviewed: rule.applicability !== 'unreviewed',
      provenance_verified: rule.provenance_verified, subject_verified: rule.subject_verified,
      hold: latest.hold, reason: latest.reason, candidate_id: latest.candidate_id,
      source_entry_id: c?.candidate.source_entry_id || null,
      attachment: latest.state === 'promoted' ? (c.candidate.source_entry_id === id ? 'direct' : 'canonical_redirect') : 'none' });
  }
  for (const id of publicIds) assert(seen.has(id), `${id}: published canonical has no review disposition`);
  for (const id of imports.keys()) assert(seen.has(id), `${id}: pinned import lost; canonical retirement needs explicit policy migration`);
  for (const id of candidates.keys()) assert(usedCandidates.has(id), `${id}: orphan lifecycle candidate`);
  rows.sort((a,b) => a.id.localeCompare(b.id, 'en'));
  const stages = Object.fromEntries(Object.keys(policy.states).map((s) => [s, 0]));
  for (const r of rows) stages[r.stage]++;
  return { policy: 'image-lifecycle-policy-v2.3.json', ledger: 'image-lifecycle-v2.3.json',
    summary: { public_entries: rows.length, disposition_records: rows.length,
      applicability_reviewed: rows.filter((r) => r.applicability_reviewed).length,
      required: rows.filter((r) => r.applicability === 'required').length,
      on_hold: rows.filter((r) => r.hold).length,
      final_dispositions: stages.not_required + stages.promoted,
      unresolved: rows.length - stages.not_required - stages.promoted, by_stage: stages },
    evidence_sha256: digest({ ledger, policy }), rows };
}
async function audit(options) {
  return validate(read('image-lifecycle-v2.3.json'), read('image-lifecycle-policy-v2.3.json'), await loadContext(), options);
}
module.exports = { audit, validate, loadContext, candidateSource, candidateDigest, digest, read };
if (require.main === module) audit().then((result) => {
  console.log(`CTA_IMAGE_LIFECYCLE_SUMMARY=${JSON.stringify(result.summary)}`);
  console.log('Construction Tools Atlas image lifecycle: PASS');
}).catch((error) => { console.error(error.message); process.exitCode = 1; });
