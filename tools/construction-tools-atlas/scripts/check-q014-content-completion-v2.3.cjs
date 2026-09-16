const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const DATA=path.join(ROOT,'data');
const TARGET=path.join(DATA,'tools.quality-014.json');
const REDIRECTS=path.join(DATA,'canonical-redirects-v2.3.json');
const MANIFEST=path.join(DATA,'content-enrichment-manifest-v2.3.json');
const LOADER=path.join(DATA,'quality-loader.js');
const GROUPS=['5a','5b','5c','5d'];
const WAVES=new Set(GROUPS.map(g=>`content-wave-00${g}`));
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const arr=v=>Array.isArray(v)?v:[];
const text=v=>typeof v==='string'?v.trim():'';
const rowsFrom=raw=>Array.isArray(raw)?raw:Array.isArray(raw?.rows)?raw.rows:Array.isArray(raw?.entries)?raw.entries:[];
const nonempty=v=>Array.isArray(v)&&v.length>0&&v.every(x=>text(String(x)));
function localFile(v){return path.resolve(ROOT,String(v||'').replace(/[?#].*$/,'').replace(/^\.\//,''));}
async function runtime(){const src=fs.readFileSync(LOADER,'utf8');const w={};w.fetch=async input=>{const f=localFile(typeof input==='string'?input:input?.url);if(!fs.existsSync(f))return{ok:false,async json(){return null;}};return{ok:true,async json(){return read(f);}}};const d={addEventListener(){},getElementById(){return null;},querySelector(){return null;},createElement(){return{setAttribute(){}}},head:{appendChild(){}}};vm.runInNewContext(src,{window:w,document:d,console:{info(){},warn(){},error:console.error},Set,Map},{filename:'quality-loader.js'});return{entries:await w.CTA_DATA_LOADER.loadEntries(),diagnostics:w.CTA_DATA_DIAGNOSTICS||{}};}
(async()=>{
 const source=rowsFrom(read(TARGET)); if(source.length!==109)throw new Error(`source ${source.length}`);
 const redirectMap=new Map(arr(read(REDIRECTS).redirects).map(r=>[text(r.from),text(r.to)]).filter(([a,b])=>a&&b));
 const q014Ids=new Set(source.map(r=>text(r.id)).filter(Boolean));
 const redirected=[...q014Ids].filter(id=>redirectMap.has(id)); if(redirected.length!==11)throw new Error(`q014 redirects ${redirected.length}`);
 const active=[...q014Ids].filter(id=>!redirectMap.has(id)).sort(); if(active.length!==98)throw new Error(`active ${active.length}`);
 const manifest=read(MANIFEST); if(text(manifest.version)!=='2026-09-16-wave5d')throw new Error(`manifest version ${manifest.version}`);
 const manifestWaves=new Map(arr(manifest.packs).map(p=>[text(p.wave),text(p.path)]));
 const packed=new Map(); const waveCounts={};
 for(const g of GROUPS){const wave=`content-wave-00${g}`;const rel=`./data/content-enrichment-wave${g}-v2.3.json`;if(manifestWaves.get(wave)!==rel)throw new Error(`manifest ${wave}`);const doc=read(path.join(DATA,`content-enrichment-wave${g}-v2.3.json`));if(doc.schema!=='cta-content-enrichment-v2.3')throw new Error(`${g} schema`);waveCounts[wave]=doc.entries.length;for(const e of doc.entries){const id=text(e.id);if(packed.has(id))throw new Error(`duplicate ${id}`);if(text(e.wave)!==wave||text(e.state)!=='expanded')throw new Error(`${id} wave/state`);if(!text(e.detail_ja)||!text(e.detail_en))throw new Error(`${id} detail`);if(!nonempty(e.bullets_ja)||!nonempty(e.bullets_en)||e.bullets_ja.length<3||e.bullets_en.length<3)throw new Error(`${id} bullets`);if(!nonempty(e.examples_ja)||!nonempty(e.examples_en)||e.examples_ja.length<2||e.examples_en.length<2)throw new Error(`${id} examples`);packed.set(id,e);}}
 const packedIds=[...packed.keys()].sort();if(packedIds.length!==98)throw new Error(`packed ${packedIds.length}`);if(JSON.stringify(packedIds)!==JSON.stringify(active))throw new Error('pack union != active q014 set');
 for(const id of redirected)if(packed.has(id))throw new Error(`redirect enriched ${id}`);
 const rt=await runtime();if(rt.entries.length!==870)throw new Error(`runtime ${rt.entries.length}`);const byId=new Map(rt.entries.map(e=>[text(e.id),e]));
 for(const id of active){const e=byId.get(id);if(!e)throw new Error(`runtime missing ${id}`);const wave=text(e?.meta?.content_enrichment_wave),state=text(e?.meta?.content_enrichment_state);if(!WAVES.has(wave)||state!=='expanded')throw new Error(`${id} runtime ${wave}/${state}`);}
 for(const id of redirected)if(byId.has(id))throw new Error(`redirect still public ${id}`);
 if(rt.diagnostics.contentEnrichmentMissingTargets)throw new Error(`missing enrichment targets ${rt.diagnostics.contentEnrichmentMissingTargets}`);
 if(rt.diagnostics.contentEnrichmentDuplicateTargets)throw new Error(`duplicate enrichment targets ${rt.diagnostics.contentEnrichmentDuplicateTargets}`);
 if((rt.diagnostics.contentEnriched||0)<269)throw new Error(`global enriched ${rt.diagnostics.contentEnriched||0}`);
 console.log('CTA_Q014_CONTENT_COMPLETION='+JSON.stringify({source_q014:109,redirected_q014:11,active_q014:98,enriched_q014:98,wave_counts:waveCounts,public_entries:rt.entries.length,global_enriched:rt.diagnostics.contentEnriched||0}));
 console.log('Construction Tools Atlas q014 content completion v2.3: PASS');
})().catch(e=>{console.error('Construction Tools Atlas q014 content completion v2.3: FAIL');console.error('- '+e.message);process.exit(1);});
