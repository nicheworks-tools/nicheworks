import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const base=JSON.parse(fs.readFileSync(path.join(root,'data/patterns.json'),'utf8'));
const prod=JSON.parse(fs.readFileSync(path.join(root,'data/production-content.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'data/source-verification.json'),'utf8'));
const canonical=['houndstooth','gingham','tartan','glen-check','argyle','chevron','polka-dot','moroccan-trellis','seigaiha','asanoha','shippo','ichimatsu','kikko','karakusa','damask','arabesque','paisley','leopard-print','ikat','kilim'].sort();
const reviewOrder=['draft','researched','image_ready','reviewed','verified','published'];
const fail=m=>{console.error(`FAIL: ${m}`);process.exitCode=1};
const pmap=Object.fromEntries(prod.patterns.map(x=>[x.pattern_id,x]));
if(prod.patterns.length!==20)fail(`expected 20 production records, got ${prod.patterns.length}`);
if(JSON.stringify(Object.keys(pmap).sort())!==JSON.stringify(canonical))fail('production content canonical ID set differs');
for(const id of canonical){
  const p=pmap[id],source=ledger.patterns.find(x=>x.pattern_id===id),raw=base.find(x=>x.id===id);
  if(!p||!source||!raw){fail(`${id}: missing joined record`);continue}
  if(reviewOrder.indexOf(p.review_state)<reviewOrder.indexOf('researched'))fail(`${id}: review_state must be researched or later`);
  if(p.verification_state!==source.verification_state)fail(`${id}: verification state differs from source ledger`);
  if(p.names?.ja!==source.verified_names?.ja||p.names?.en!==source.verified_names?.en)fail(`${id}: production names differ from source ledger`);
  if(!p.term_scope||!p.definition?.ja||!p.definition?.en)fail(`${id}: incomplete definition contract`);
  if((p.distinguishing_features?.ja||[]).length<3||(p.distinguishing_features?.en||[]).length<3)fail(`${id}: needs 3+ JA/EN distinguishing features`);
  if(!(p.common_uses?.ja||[]).length||!(p.common_uses?.en||[]).length)fail(`${id}: missing JA/EN common uses`);
  if(!['non-essential','traditional','identity-relevant','variable'].includes(p.colors?.color_role))fail(`${id}: invalid color role`);
  if(!p.colors?.primary?.length||!p.colors?.primary_reason)fail(`${id}: incomplete color contract`);
  if(p.verification_state==='qualified'&&(!p.qualification?.ja||!p.qualification?.en))fail(`${id}: qualified term requires JA/EN scope note`);
}
const qualified=prod.patterns.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();
if(JSON.stringify(qualified)!==JSON.stringify(['ikat','kilim','moroccan-trellis']))fail(`qualified set changed: ${qualified.join(', ')}`);
if(!process.exitCode)console.log('OK: 20/20 production content records are source-ledger aligned and researched-or-later.');
