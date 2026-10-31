"use strict";
const fs=require("node:fs"),path=require("node:path"),assert=require("node:assert/strict");
const root=path.resolve(__dirname,".."),data=path.join(root,"data");
const ids=["q011_mortar_mixer","q011_check_valve","q011_sanding_paper","q012_ratchet_handle","q012_hand_shear","q012_nail_puller","q012_air_impact_wrench","q013_scaffold_clamp","q013_base_jack","q014_door_closer","q015_pump","q015_cable_gland","q016_vinyl_sheet_flooring","q016_floor_underlayment","q017_needle_nose_pliers"];
const wanted=new Set(ids),found=new Map();
for(let i=11;i<=17;i++){
 const file="tools.quality-"+String(i).padStart(3,"0")+".json";
 const pack=JSON.parse(fs.readFileSync(path.join(data,file),"utf8"));
 assert.equal(pack.schema,"cta-compact-v1",file+": expected maintained compact source pack");
 for(const row of pack.rows){
  if(!wanted.has(row.id))continue;
  assert(!found.has(row.id),"duplicate subject "+row.id);
  assert(row.dj.length>=65,row.id+": short Japanese definition regressed");
  assert(row.de.length>=125,row.id+": short English definition regressed");
  assert(row.dj.split("。").filter(Boolean).length>=2,row.id+": Japanese definition should contain identity and useful context");
  assert(!/仕様、下地条件、周辺部材との取り合い/.test(row.dj),row.id+": generic filler not permitted");
  found.set(row.id,row);
 }
}
assert.equal(found.size,wanted.size,"reviewed canonical definition missing");
const inventory=JSON.parse(fs.readFileSync(path.join(data,"public-image-inventory-v2.3.json"),"utf8"));
const publicIds=new Set(inventory.lifecycle.rows.map(row=>row.id));
for(const id of wanted)assert(publicIds.has(id),"definition is not a current published canonical: "+id);
console.log("Construction Atlas reviewed dictionary definitions: PASS "+found.size+" bilingual subjects, directly in published canonical runtime source");
