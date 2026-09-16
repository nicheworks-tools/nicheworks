import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const published=JSON.parse(fs.readFileSync(path.join(root,'data','patterns.json'),'utf8'));
const ledger=JSON.parse(fs.readFileSync(path.join(root,'data','wave5-source-verification.json'),'utf8'));
const expected=['suzani','kente','bogolan','adire','kuba-cloth','sashiko','kantha','otomi-embroidery','african-wax-print','block-print','zebra-print','tiger-print','snake-print','cow-print','giraffe-print','dalmatian-spots','camouflage','tie-dye','marbling','terrazzo'];
if(![80,100].includes(published.length))throw new Error(`Wave 5 provenance expects runtime 80 before publication or 100 after, got ${published.length}`);
if(ledger.phase!=='wave5-source-verification'||ledger.wave!==5||JSON.stringify(ledger.ordinal_range)!==JSON.stringify([81,100]))throw new Error('unexpected Wave 5 source metadata');
const rows=(ledger.patterns||[]).slice().sort((a,b)=>a.ordinal-b.ordinal);if(rows.length!==20)throw new Error(`expected 20 Wave 5 rows, got ${rows.length}`);
for(let i=0;i<20;i++){const r=rows[i];if(r.ordinal!==81+i||r.pattern_id!==expected[i])throw new Error(`Wave 5 ordinal/id mismatch at ${81+i}`);if(!['verified','qualified'].includes(r.verification_state)||!r.term_scope?.trim()||!r.structure?.trim())throw new Error(`${r.pattern_id}: incomplete source contract`);if(!r.sources?.length)throw new Error(`${r.pattern_id}: source required`);for(const s of r.sources)if(!s.publisher||!/^https:\/\//.test(s.url||'')||!s.supports?.length)throw new Error(`${r.pattern_id}: malformed evidence`);if(r.verification_state==='qualified'&&!r.qualification?.trim())throw new Error(`${r.pattern_id}: qualified term needs qualification`);}
const qualified=rows.filter(x=>x.verification_state==='qualified').map(x=>x.pattern_id).sort();const expectedQualified=['suzani','kente','bogolan','adire','kuba-cloth','sashiko','kantha','otomi-embroidery','african-wax-print','block-print','tie-dye','marbling','terrazzo'].sort();if(JSON.stringify(qualified)!==JSON.stringify(expectedQualified))throw new Error(`Wave 5 qualified set changed: ${qualified.join(', ')}`);
const urls=new Set(rows.flatMap(x=>x.sources.map(s=>s.url)));if(urls.size<20)throw new Error(`Wave 5 evidence too concentrated: ${urls.size} distinct URLs`);
if(published.length===100)for(const id of expected)if(!published.some(x=>x.id===id))throw new Error(`${id}: missing from final runtime`);
console.log(`OK: Wave 5 source provenance covers 81-100 exactly; 7 verified / 13 qualified; ${urls.size} distinct evidence URLs; runtime state ${published.length}.`);
