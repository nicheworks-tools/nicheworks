const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ROOT = path.resolve(__dirname,'..');
const DATA = path.join(ROOT,'data');
const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const text = v => typeof v === 'string' ? v.trim() : '';
const arr = v => Array.isArray(v) ? v : [];
const normJa = v => text(v).normalize('NFKC').replace(/[\s・･\-‐‑‒–—―_()（）]/g,'').toLowerCase();
const normEn = v => text(v).normalize('NFKC').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const HELD = new Set([
  'q012_hex_key','q012_spanner','q012_feeler_gauge','q012_dial_gauge','q012_vernier_caliper',
  'q012_builder_square','q012_framing_square','q012_diamond_blade','q012_cold_chisel','q012_all_thread_rod',
  'q012_concrete_cover_meter','q012_rebar_locator','q012_crack_scale','q012_dust_collector','q012_shop_vacuum',
  'q012_air_compressor','q012_temporary_distribution_box','q012_guardrail','q012_toe_board'
]);
const EXPECTED_REDIRECTED = new Set([
  'q012_hex_key','q012_feeler_gauge','q012_dial_gauge','q012_vernier_caliper','q012_builder_square',
  'q012_diamond_blade','q012_all_thread_rod','q012_concrete_cover_meter','q012_rebar_locator','q012_crack_scale',
  'q012_dust_collector','q012_shop_vacuum','q012_air_compressor','q012_temporary_distribution_box','q012_guardrail'
]);
const EXPECTED_SURVIVORS = new Set(['q012_spanner','q012_framing_square','q012_cold_chisel','q012_toe_board']);
function localFile(runtimePath){return path.resolve(ROOT,String(runtimePath||'').replace(/[?#].*$/,'').replace(/^\.\//,''));}
async function loadRuntime(){
  const src=fs.readFileSync(path.join(DATA,'quality-loader.js'),'utf8'); const w={localStorage:{getItem(){return null;},setItem(){}}};
  w.fetch=async input=>{const f=localFile(typeof input==='string'?input:input?.url);if(!fs.existsSync(f))return{ok:false,async json(){return null;}};return{ok:true,async json(){return read(f);}}};
  const d={addEventListener(){},getElementById(){return null;},querySelector(){return null;},createElement(){return{setAttribute(){}}},head:{appendChild(){}}};
  vm.runInNewContext(src,{window:w,document:d,console:{info(){},warn(){},error:console.error},Set,Map},{filename:'quality-loader.js'});
  return {entries:await w.CTA_DATA_LOADER.loadEntries(),w};
}
function names(e){return{ja:text(e?.term?.ja),en:text(e?.term?.en),aja:arr(e?.aliases?.ja).map(text),aen:arr(e?.aliases?.en).map(text)}};
(async()=>{
  const redirects=read(path.join(DATA,'canonical-redirects-v2.3.json')).redirects;
  const redirectMap=new Map(redirects.map(r=>[text(r.from),text(r.to)]));
  if(redirects.length<40) throw new Error(`Expected at least the 40 q011/q012 redirects, got ${redirects.length}`);
  for(const id of EXPECTED_REDIRECTED) if(!redirectMap.has(id)) throw new Error(`${id}: expected q012 redirect missing`);
  for(const id of EXPECTED_SURVIVORS) if(redirectMap.has(id)) throw new Error(`${id}: reviewed distinct q012 canonical must survive`);
  const {entries,w}=await loadRuntime();
  const byId=new Map(entries.map(e=>[text(e.id),e]));
  for(const id of EXPECTED_REDIRECTED) if(byId.has(id)) throw new Error(`${id}: redirected q012 entry still public`);
  for(const id of EXPECTED_SURVIVORS) if(!byId.has(id)) throw new Error(`${id}: distinct q012 survivor missing`);
  const identity=read(path.join(DATA,'canonical-identity-resolutions-v2.3.json'));
  const allowed=new Set(arr(identity.resolved_distinct_pairs).flatMap(r=>[`${text(r.a)}\t${text(r.b)}`,`${text(r.b)}\t${text(r.a)}`]));
  const unresolved=[];
  for(const id of EXPECTED_SURVIVORS){
    const e=byId.get(id), n=names(e), sj=normJa(n.ja), se=normEn(n.en);
    for(const other of entries){
      const oid=text(other.id); if(oid===id) continue; const o=names(other); const reasons=[];
      if(sj&&normJa(o.ja)===sj) reasons.push('exact_ja');
      if(se&&normEn(o.en)===se) reasons.push('exact_en');
      if(sj&&o.aja.some(v=>normJa(v)===sj)) reasons.push('target_alias_ja');
      if(se&&o.aen.some(v=>normEn(v)===se)) reasons.push('target_alias_en');
      if(reasons.length&&!allowed.has(`${id}\t${oid}`)) unresolved.push({id,other:oid,reasons});
    }
  }
  if(unresolved.length) throw new Error(`Unresolved q012 collisions: ${JSON.stringify(unresolved)}`);
  if((w.CTA_DATA_DIAGNOSTICS?.identityNameOverridesApplied||0)!==arr(identity.name_overrides).length) throw new Error('Name override runtime count mismatch');
  console.log(`CTA_Q012_IDENTITY_CLOSURE=${JSON.stringify({held:HELD.size,redirected:EXPECTED_REDIRECTED.size,survivors:EXPECTED_SURVIVORS.size,total_redirects:redirects.length,public_entries:entries.length,name_overrides:arr(identity.name_overrides).length,type_overrides:arr(identity.type_overrides).length,alias_removal_rows:arr(identity.alias_removals).length,unresolved_collisions:0})}`);
  console.log('Construction Tools Atlas q012 identity closure v2.3: PASS');
})().catch(e=>{console.error('Construction Tools Atlas q012 identity closure v2.3: FAIL');console.error('- '+e.message);process.exit(1);});
