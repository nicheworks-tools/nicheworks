import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const readJSON=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const base=readJSON('data/patterns.json');
const taxonomy=readJSON('data/taxonomy-v2.json');
const sources=readJSON('data/source-verification.json');
const backlog=readJSON('data/coverage-backlog.json');
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
const assert=(ok,message)=>{if(!ok)throw new Error(message)};
const ids=new Set(base.map(p=>p.id));
assert(base.length===100&&ids.size===100,'canonical dataset drift');
assert(taxonomy.entries.length===100,'all canonical entries need taxonomy');
assert(taxonomy.review_state==='editorial-provisional','new taxonomy must not claim final review');
assert(sources.patterns.length===100,'all canonical entries need source provenance');

const taxonomyIds=new Set();
const allowedTypes=new Set(Object.keys(taxonomy.concept_types));
const allowedAppearance=new Set(Object.keys(taxonomy.appearance_groups));
const allowedContexts=new Set(Object.keys(taxonomy.contexts));
const usedTypes=new Set();
for(const record of taxonomy.entries){
  assert(ids.has(record.id)&&!taxonomyIds.has(record.id),'taxonomy ID mismatch or duplicate: '+record.id);
  taxonomyIds.add(record.id);
  for(const field of ['types','appearance','contexts'])assert(Array.isArray(record[field])&&new Set(record[field]).size===record[field].length,record.id+' invalid '+field);
  assert(record.types.length>0,record.id+' lacks a concept type');
  for(const key of record.types){assert(allowedTypes.has(key),record.id+' unknown type '+key);usedTypes.add(key)}
  for(const key of record.appearance)assert(allowedAppearance.has(key),record.id+' unknown appearance '+key);
  for(const key of record.contexts)assert(allowedContexts.has(key),record.id+' unknown context '+key);
}
for(const key of allowedTypes)assert(usedTypes.has(key),'unused concept type '+key);
for(const [axis,values] of [['concept_types',allowedTypes],['appearance_groups',allowedAppearance],['contexts',allowedContexts]])
for(const key of values)for(const language of ['ja','en'])assert(taxonomy[axis][key]?.[language],'missing '+language+' translation for '+axis+'/'+key);
const sourcedIds=new Set();
let urlCount=0;
for(const record of sources.patterns){
  assert(ids.has(record.pattern_id)&&!sourcedIds.has(record.pattern_id),'source ID mismatch or duplicate: '+record.pattern_id);
  sourcedIds.add(record.pattern_id);
  assert(['verified','qualified'].includes(record.verification_state),record.pattern_id+' unreviewed source');
  assert(Array.isArray(record.sources)&&record.sources.length>0,record.pattern_id+' missing citations');
  for(const item of record.sources){
    assert(item.publisher&&item.url,record.pattern_id+' missing publisher or URL');
    const url=new URL(item.url);
    assert(url.protocol==='https:'||url.protocol==='http:',record.pattern_id+' non-HTTP source URL');
    urlCount++;
  }
}
const candidates=backlog.candidates;
assert(backlog.status==='not-published-not-verified','coverage inventory must not suggest publication');
assert(candidates.length>=70,'coverage breadth unexpectedly shrank');
const candidateIds=new Set();
for(const item of candidates){
  assert(!ids.has(item.id)&&!candidateIds.has(item.id),'duplicate or canonical-overlapping expansion candidate '+item.id);
  assert(item.status==='candidate-unverified','unverified candidate must not be promoted as fact: '+item.id);
  assert(item.name?.ja&&item.name?.en&&item.proposed_type&&item.domain,'candidate needs scope: '+item.id);
  assert(!item.sources&&!item.definition,'unverified candidates must not invent source evidence: '+item.id);
  candidateIds.add(item.id);
}
for(const lang of ['ja','en']){
  const html=fs.readFileSync(path.join(root,lang==='ja'?'index.html':'en/index.html'),'utf8');
  for(const axis of ['appearance','type','context'])assert(html.includes('data-axis="'+axis+'"'),lang+' missing filter axis '+axis);
  for(const type of allowedTypes)assert(html.includes('data-axis="type" data-value="'+type+'"'),lang+' missing type filter '+type);
  assert(html.includes('data-axis="context" data-value="japanese"'),lang+' missing Japanese context filter');
  assert(html.includes('data-axis="context" data-value="regional"'),lang+' missing regional context filter');
}
assert(app.includes("const SOURCES=ROOT+'data/source-verification.json'"),'runtime must fetch reviewed sources');
assert(app.includes("const TAXONOMY=ROOT+'data/taxonomy-v2.json'"),'runtime must fetch independent taxonomy');
assert(app.includes("sourceMap[p.id]"),'detail page must render correct entry sources');
assert(app.includes('rel="noopener noreferrer"'),'external sources must not expose opener');
assert(app.includes('sourceSection'),'detail page must have source section');
assert(app.includes("const selected={appearance:'',type:'',context:''}"),'browse must filter independent axes');
assert(app.includes('taxonomyLabels(p,lang)'),'detail must render translated taxonomy labels');
assert(!app.includes('document.title='),'runtime must not override static detail-page SEO titles');
assert(!app.includes('coverage-backlog.json'),'unreviewed candidates must stay outside public runtime');
const sitemap=fs.readFileSync(path.resolve(root,'..','..','sitemap.xml'),'utf8');
for(const candidate of candidates)assert(!sitemap.includes('/patterns/'+candidate.id+'/'),'unreviewed candidate accidentally indexed: '+candidate.id);
console.log('OK: 100/100 distinct taxonomy entries, 100/100 cited source entries ('+urlCount+' links), '+candidates.length+' unpublished coverage candidates, independent bilingual browse axes and visible source wiring.');
