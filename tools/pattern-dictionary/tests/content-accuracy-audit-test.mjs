import fs from 'node:fs';
const root='tools/pattern-dictionary/data/';
const prod=JSON.parse(fs.readFileSync(root+'production-content.json','utf8'));
const audit=JSON.parse(fs.readFileSync(root+'content-accuracy-audit.json','utf8'));
if(prod.patterns.length!==100)throw new Error('production content must remain canonical 100');
if(audit.patterns.length!==100||audit.counts.total!==100)throw new Error('content audit must cover all 100 patterns');
if(audit.counts.unresolved!==0||audit.patterns.some(x=>x.unresolved))throw new Error('content audit contains unresolved entries');
const byid=Object.fromEntries(prod.patterns.map(x=>[x.pattern_id,x]));
const k=byid.kente;
if(!/western Togo/i.test(k.definition.en)||!/Ewe/.test(k.definition.en)||!/Asante\/Akan/.test(k.definition.en))throw new Error('kente scope must include Asante/Akan and Ewe traditions including western Togo');
const a=byid['african-wax-print'];
if(!/little or no literal wax/i.test(a.definition.en)||!/Indonesian batik/i.test(a.definition.en)||!/West and East Africa/i.test(a.definition.en))throw new Error('African wax print scope/history guard missing');
const q=new Set(prod.policy.qualified_terms);
for(const id of q){
  const p=byid[id];
  if(!p)throw new Error(`qualified term missing: ${id}`);
  if(p.verification_state!=='qualified')throw new Error(`qualified term lost qualified state: ${id}`);
}
console.log('OK: canonical-100 content accuracy audit covers 100/100, unresolved 0, and corrected scope guards passed.');
