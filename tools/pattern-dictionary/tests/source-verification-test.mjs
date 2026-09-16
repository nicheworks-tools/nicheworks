import fs from 'node:fs';

const base=JSON.parse(fs.readFileSync(new URL('../data/patterns.json',import.meta.url),'utf8'));
const patterns=JSON.parse(fs.readFileSync(new URL('../data/production-content.json',import.meta.url),'utf8')).patterns;
const ledger=JSON.parse(fs.readFileSync(new URL('../data/source-verification.json',import.meta.url),'utf8'));
const canonical=base.map(x=>x.id).sort();
const fail=m=>{console.error(`FAIL: ${m}`);process.exitCode=1};
const ids=patterns.map(p=>p.pattern_id).sort(),ledgerIds=ledger.patterns.map(p=>p.pattern_id).sort();
if(canonical.length!==100)fail(`runtime canonical set must be 100, got ${canonical.length}`);
if(JSON.stringify(ids)!==JSON.stringify(canonical))fail('production ID set differs from runtime canonical 100');
if(JSON.stringify(ledgerIds)!==JSON.stringify(canonical))fail('source ledger ID set differs from runtime canonical 100');
for(const record of ledger.patterns){
  const p=patterns.find(x=>x.pattern_id===record.pattern_id);
  if(!p){fail(`${record.pattern_id}: missing production record`);continue}
  if(!['verified','qualified'].includes(record.verification_state))fail(`${record.pattern_id}: invalid verification_state`);
  if(!record.term_scope||!record.structure)fail(`${record.pattern_id}: incomplete source verification`);
  if(record.verified_names.ja!==p.names.ja||record.verified_names.en!==p.names.en)fail(`${record.pattern_id}: verified names differ from production content`);
  if(!Array.isArray(record.sources)||!record.sources.length)fail(`${record.pattern_id}: no evidence sources`);
  for(const source of record.sources||[])if(!source.publisher||!/^https:\/\//.test(source.url||'')||!Array.isArray(source.supports)||!source.supports.length)fail(`${record.pattern_id}: malformed source record`);
  if(record.verification_state==='qualified'&&!record.qualification)fail(`${record.pattern_id}: missing source qualification`);
}
const qualified=ledger.patterns.filter(p=>p.verification_state==='qualified').map(p=>p.pattern_id).sort();
const expected=['ajrakh','bandhani','baroque-scroll','basketweave','batik','botanical-print','breton-stripe','chinoiserie','chintz','flame-stitch','herringbone','ikat','ivy','jacobean-floral','kalamkari','kanoko','kilim','koushi','madras-check','moire','moroccan-trellis','ogee','prince-of-wales-check','regimental-stripe','same-komon','shibori','swiss-dot','toile-de-jouy','suzani','kente','bogolan','adire','kuba-cloth','sashiko','kantha','otomi-embroidery','african-wax-print','block-print','tie-dye','marbling','terrazzo'].sort();
if(JSON.stringify(qualified)!==JSON.stringify(expected))fail(`qualified set changed: ${qualified.join(', ')}`);
if(!process.exitCode)console.log(`OK: source verification ledger covers exactly 100 published patterns; verified=${100-qualified.length} qualified=${qualified.length}.`);
