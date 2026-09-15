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
const EXPECTED_REDIRECTED=new Set([
  'q013_lever_hoist','q013_mixing_paddle','q013_soil_tamper','q013_crowbar','q013_level_staff',
  'q013_marking_paint','q013_line_level','q013_utility_knife','q013_tape_measure','q013_carpenter_pencil',
  'q013_putty_scraper','q013_paint_roller','q013_paint_tray','q013_screed_board','q013_marker_pen'
]);
const EXPECTED_DISTINCT=new Set(['q013_scaffold_clamp','q013_lifting_sling','q013_dolly','q013_long_tape']);
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
  const redirects=arr(redirectDoc.redirects);
  if(redirects.length<55)throw new Error(`Expected at least 55 redirects through q013 closure, got ${redirects.length}`);
  const redirectMap=new Map(redirects.map(r=>[text(r.from),text(r.to)]));
  for(const id of EXPECTED_REDIRECTED)if(!redirectMap.has(id))throw new Error(`${id}: expected q013 redirect missing`);
  for(const id of EXPECTED_DISTINCT)if(redirectMap.has(id))throw new Error(`${id}: reviewed distinct q013 canonical must survive`);
  const source=rowsFrom(read(path.join(DATA,'tools.quality-013.json')));
  const activeIds=source.map(r=>text(r.id)).filter(id=>id&&!redirectMap.has(id));
  if(source.length!==85)throw new Error(`Expected 85 q013 source rows, got ${source.length}`);
  if(activeIds.length!==70)throw new Error(`Expected 70 active q013 canonicals, got ${activeIds.length}`);
  const rt=await runtime();
  const byId=new Map(rt.entries.map(e=>[text(e.id),e]));
  for(const id of EXPECTED_REDIRECTED)if(byId.has(id))throw new Error(`${id}: redirected q013 duplicate is still public`);
  for(const id of activeIds)if(!byId.has(id))throw new Error(`${id}: active q013 canonical missing from runtime`);
  const identity=read(path.join(DATA,'canonical-identity-resolutions-v2.3.json'));
  const pairKey=(a,b)=>[a,b].sort().join('\t');
  const allowed=new Set(arr(identity.resolved_distinct_pairs).map(r=>pairKey(text(r.a),text(r.b))));
  const unresolved=[];
  for(const id of activeIds){const e=byId.get(id),n=names(e),sj=normJa(n.ja),se=normEn(n.en);
    for(const other of rt.entries){const oid=text(other.id);if(!oid||oid===id)continue;const o=names(other),reasons=[];
      if(sj&&normJa(o.ja)===sj)reasons.push('exact_ja');
      if(se&&normEn(o.en)===se)reasons.push('exact_en');
      if(sj&&o.aja.some(v=>normJa(v)===sj))reasons.push('target_alias_ja');
      if(se&&o.aen.some(v=>normEn(v)===se))reasons.push('target_alias_en');
      if(reasons.length&&!allowed.has(pairKey(id,oid)))unresolved.push({id,other:oid,reasons});
    }
  }
  if(unresolved.length)throw new Error(`Unresolved q013 exact/alias collisions: ${JSON.stringify(unresolved)}`);
  const expectedNames={
    clamp_bar:['バークランプ','Bar Clamp'],
    q013_dolly:['平台車','Platform Dolly'],
    tamper:['タンパー（手動）','Hand Tamper'],
    caulking_scraper:['皮すき','Paint Scraper'],
    screed:['スクリード（均し定規）','Screed']
  };
  for(const [id,[ja,en]] of Object.entries(expectedNames)){const e=byId.get(id);if(!e||text(e?.term?.ja)!==ja||text(e?.term?.en)!==en)throw new Error(`${id}: reviewed public identity not applied`);}
  console.log(`CTA_Q013_IDENTITY_CLOSURE=${JSON.stringify({source_rows:85,active_q013:70,q013_redirects:EXPECTED_REDIRECTED.size,total_redirects:redirects.length,public_entries:rt.entries.length,reviewed_distinct:EXPECTED_DISTINCT.size,unresolved_collisions:0})}`);
  console.log('Construction Tools Atlas q013 identity closure v2.3: PASS');
})().catch(e=>{console.error('Construction Tools Atlas q013 identity closure v2.3: FAIL');console.error('- '+e.message);process.exit(1)});
