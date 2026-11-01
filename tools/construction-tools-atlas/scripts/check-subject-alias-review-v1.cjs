"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const {runPublicLoader}=require("./audit-public-image-inventory-v2.3.cjs");
const search=require("../semantic-search-core.js");
const review=JSON.parse(fs.readFileSync(path.join(__dirname,"..","data","subject-alias-review-v1.json"),"utf8"));
const normalize=search.normalizeText;
(async()=>{
  assert.equal(review.schema,"cta-subject-alias-review-v1");
  assert.equal(review.entries.length,232,"reviewed alias wave1 must retain 232 distinct public entries");
  const runtime=await runPublicLoader();
  assert.equal(runtime.entries.length,870,"public canonical inventory must remain fixed");
  const byId=new Map(runtime.entries.map(e=>[e.id,e]));
  assert.equal(byId.size,870,"duplicate public canonical IDs");

  const owners=new Map(),terms=new Map();
  const add=(map,key,id)=>{
    if(!key)return;
    const ids=map.get(key)||new Set();
    ids.add(id);
    map.set(key,ids);
  };
  for(const e of runtime.entries){
    for(const term of [e.term?.ja,e.term?.en])add(terms,normalize(term),e.id);
    for(const alias of [...(e.aliases?.ja||[]),...(e.aliases?.en||[])])add(owners,normalize(alias),e.id);
  }

  const engine=search.createEngine({signals:[],combinations:[]});
  const checked=new Set(),queries=[];
  for(const row of review.entries){
    const {id,ja,en}=row;
    assert(id&&!checked.has(id),"duplicate reviewed id "+id);checked.add(id);
    assert(Array.isArray(ja)&&ja.length&&Array.isArray(en)&&en.length,id+": JA/EN alias required");
    const target=byId.get(id);
    assert(target,id+": alias review points to non-public or redirected entry");
    for(const [lang,values] of [["ja",ja],["en",en]]){
      const effective=target.aliases?.[lang]||[];
      for(const alias of values){
        const key=normalize(alias);
        assert(key,id+": empty alias");
        assert(effective.some(x=>normalize(x)===key),id+": reviewed alias absent from runtime: "+alias);
        assert(normalize(target.term.ja)!==key&&normalize(target.term.en)!==key,id+": redundant self-term alias: "+alias);
        const wrongTerm=[...(terms.get(key)||[])].filter(other=>other!==id);
        assert.equal(wrongTerm.length,0,id+": alias shadows another canonical term: "+alias+" -> "+wrongTerm.join(","));
        const wrongAlias=[...(owners.get(key)||[])].filter(other=>other!==id);
        assert.equal(wrongAlias.length,0,id+": alias conflicts with another canonical alias: "+alias+" -> "+wrongAlias.join(","));
        assert(engine.scoreEntry(target,alias,[])>=4200,id+": alias query not indexed by search engine: "+alias);
        queries.push({id,alias});
      }
    }
  }
  const explicitBilingual=runtime.entries.filter(e=>e.aliases?.ja?.length&&e.aliases?.en?.length);
  assert.equal(explicitBilingual.length,612,"public bilingual alias coverage regressed (380 + 232)");
  const samples=["q011_sanding_paper","q011_insulation_tester","q012_step_drill","q013_trench_box","q014_resin_sash","q015_cable_gland","q016_ceiling_tile","q017_pipe_threader"];
  for(const id of samples){
    const row=review.entries.find(r=>r.id===id);
    assert(row,"missing representative sample: "+id);
    for(const query of [row.ja[0],row.en[0]]){
      const ranks=runtime.entries.map(e=>({id:e.id,score:engine.scoreEntry(e,query,[])}))
        .sort((a,b)=>b.score-a.score).slice(0,5);
      assert(ranks.some(r=>r.id===id),"representative alias query fails top-5 ranking: "+id+" / "+query);
    }
  }
  console.log("Construction Atlas reviewed aliases: PASS "+JSON.stringify({
    publicCanonicals:runtime.entries.length,reviewedNewAliases:checked.size,
    exactSearchQueries:queries.length,publicExplicitBilingualAliasCount:explicitBilingual.length,
    conflictingCanonicalNames:0,conflictingAliases:0
  }));
})().catch(err=>{console.error(err.stack);process.exitCode=1});
