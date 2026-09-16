const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ROOT=path.resolve(__dirname,'..');
const DATA=path.join(ROOT,'data');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const text=v=>typeof v==='string'?v.trim():'';
const arr=v=>Array.isArray(v)?v:[];
const normJa=v=>text(v).normalize('NFKC').replace(/[\s・･\-‐‑‒–—―_()（）/]/g,'').toLowerCase();
const normEn=v=>text(v).normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const rowsFrom=raw=>Array.isArray(raw)?raw:Array.isArray(raw?.rows)?raw.rows:Array.isArray(raw?.entries)?raw.entries:[];
const EXPECTED_REDIRECTS=new Map([
  ['q014_roof_tile','roof_tile'],
  ['q014_roof_batten','roof_batten'],
  ['q014_valley_flashing','valley_flashing'],
  ['q014_drip_edge','drip_edge'],
  ['q014_exterior_siding','siding'],
  ['q014_weather_barrier','housewrap'],
  ['q014_soffit_board','soffit'],
  ['q014_window_sash','window_sash'],
  ['q014_threshold','threshold'],
  ['q014_window_flashing_tape','flashing_tape'],
  ['q014_masking_for_sealant','masking_tape']
]);
const EXPECTED_DISTINCT=new Set([
  'q014_galvalume_roof','q014_roof_drain','q014_fiber_cement_siding','q014_metal_siding',
  'q014_vented_rainscreen','q014_fascia_board','q014_sill_pan','q014_handrail'
]);
const EXPECTED_TYPES=new Map([
  ['roof_batten','component'],['drip_edge','component'],['caulking_sealant','material'],
  ['screw_set','fastener'],['flashing_tape','material'],['masking_tape','material'],
  ['q014_urethane_waterproofing','process'],['q014_frp_waterproofing','process'],
  ['q014_sheet_membrane','process'],['q014_torch_on_membrane','process'],
  ['q014_vented_rainscreen','component']
]);
function localFile(v){return path.resolve(ROOT,String(v||'').replace(/[?#].*$/,'').replace(/^\.\//,''));}
async function runtime(){
  const src=fs.readFileSync(path.join(DATA,'quality-loader.js'),'utf8');
  const w={localStorage:{getItem(){return null;},setItem(){}}};
  w.fetch=async input=>{const f=localFile(typeof input==='string'?input:input?.url);if(!fs.existsSync(f))return{ok:false,async json(){return null;}};return{ok:true,async json(){return read(f);}}};
  const d={addEventListener(){},getElementById(){return null;},querySelector(){return null;},createElement(){return{setAttribute(){}}},head:{appendChild(){}}};
  vm.runInNewContext(src,{window:w,document:d,console:{info(){},warn(){},error:console.error},Set,Map},{filename:'quality-loader.js'});
  return {entries:await w.CTA_DATA_LOADER.loadEntries(),diagnostics:w.CTA_DATA_DIAGNOSTICS||{}};
}
function names(e){return{ja:text(e?.term?.ja),en:text(e?.term?.en),aja:arr(e?.aliases?.ja).map(text),aen:arr(e?.aliases?.en).map(text)}};
(async()=>{
  const redirectDoc=read(path.join(DATA,'canonical-redirects-v2.3.json'));
  if(text(redirectDoc.version)!=='2026-09-16-q014-identity-closure-1')throw new Error(`Unexpected redirect version: ${redirectDoc.version}`);
  const redirects=arr(redirectDoc.redirects);
  const redirectMap=new Map(redirects.map(r=>[text(r.from),text(r.to)]));
  for(const [from,to] of EXPECTED_REDIRECTS){if(redirectMap.get(from)!==to)throw new Error(`${from}: expected redirect to ${to}, got ${redirectMap.get(from)||'missing'}`);}
  for(const id of EXPECTED_DISTINCT)if(redirectMap.has(id))throw new Error(`${id}: reviewed distinct q014 canonical must survive`);

  const source=rowsFrom(read(path.join(DATA,'tools.quality-014.json')));
  const activeIds=source.map(r=>text(r.id)).filter(id=>id&&!redirectMap.has(id));
  if(source.length!==109)throw new Error(`Expected 109 q014 source rows, got ${source.length}`);
  if(activeIds.length!==98)throw new Error(`Expected 98 active q014 canonicals, got ${activeIds.length}`);

  const rt=await runtime();
  if(rt.entries.length!==870)throw new Error(`Expected 870 public runtime entries after q014 closure, got ${rt.entries.length}`);
  const byId=new Map(rt.entries.map(e=>[text(e.id),e]));
  for(const id of EXPECTED_REDIRECTS.keys())if(byId.has(id))throw new Error(`${id}: redirected q014 duplicate is still public`);
  for(const id of activeIds)if(!byId.has(id))throw new Error(`${id}: active q014 canonical missing from runtime`);

  const identity=read(path.join(DATA,'canonical-identity-resolutions-v2.3.json'));
  if(text(identity.version)!=='2026-09-16-q014-identity-closure-1')throw new Error(`Unexpected identity version: ${identity.version}`);
  const pairKey=(a,b)=>[a,b].sort().join('\t');
  const allowed=new Set(arr(identity.resolved_distinct_pairs).map(r=>pairKey(text(r.a),text(r.b))));
  const unresolved=[];
  for(const id of activeIds){
    const e=byId.get(id),n=names(e),sj=normJa(n.ja),se=normEn(n.en);
    for(const other of rt.entries){
      const oid=text(other.id);if(!oid||oid===id)continue;const o=names(other),reasons=[];
      if(sj&&normJa(o.ja)===sj)reasons.push('exact_ja');
      if(se&&normEn(o.en)===se)reasons.push('exact_en');
      if(sj&&o.aja.some(v=>normJa(v)===sj))reasons.push('target_alias_ja');
      if(se&&o.aen.some(v=>normEn(v)===se))reasons.push('target_alias_en');
      if(reasons.length&&!allowed.has(pairKey(id,oid)))unresolved.push({id,other:oid,reasons});
    }
  }
  if(unresolved.length)throw new Error(`Unresolved q014 exact/alias collisions: ${JSON.stringify(unresolved)}`);

  const expectedNames={
    guardrail:['墜落防止手すり','Guardrail'],
    q014_fascia_board:['破風板','Bargeboard']
  };
  for(const [id,[ja,en]] of Object.entries(expectedNames)){
    const e=byId.get(id);if(!e||text(e?.term?.ja)!==ja||text(e?.term?.en)!==en)throw new Error(`${id}: reviewed public identity not applied`);
  }
  for(const [id,type] of EXPECTED_TYPES){
    const e=byId.get(id);if(!e)throw new Error(`${id}: type-check target missing`);
    if(text(e.type)!==type)throw new Error(`${id}: expected type ${type}, got ${text(e.type)}`);
  }

  console.log(`CTA_Q014_IDENTITY_CLOSURE=${JSON.stringify({source_rows:109,active_q014:98,q014_redirects:EXPECTED_REDIRECTS.size,total_redirects:redirects.length,public_entries:rt.entries.length,reviewed_distinct:EXPECTED_DISTINCT.size,unresolved_collisions:0,type_assertions:EXPECTED_TYPES.size})}`);
  console.log('Construction Tools Atlas q014 identity closure v2.3: PASS');
})().catch(e=>{console.error('Construction Tools Atlas q014 identity closure v2.3: FAIL');console.error('- '+e.message);process.exit(1)});
