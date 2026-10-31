#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),IMAGES=path.join(ROOT,"images");
const read=name=>JSON.parse(fs.readFileSync(path.join(DATA,name),"utf8"));
const write=(name,object)=>fs.writeFileSync(path.join(DATA,name),JSON.stringify(object,null,2)+"\n");
const PROMOTION_VERSION="2026-10-31-reviewed-image-wave7-three-1";
const IDS=["utility_knife","screwdriver","multimeter"];
const REVIEW={
 utility_knife:{alt_ja:"黄色と黒のスライド式カッターナイフと交換用折り刃",alt_en:"Yellow and black retractable snap-off utility knife with a spare segmented blade",assessment:"Inspected original 1800x1350 JPEG and primary 960x720 WebP: yellow and black retractable segmented-blade construction utility knife shown clearly with spare break-off blade; correct canonical subject."},
 screwdriver:{alt_ja:"黒と黄色のグリップと金属軸を備えた手動ドライバー",alt_en:"Manual screwdriver with black-and-yellow grip and steel shaft",assessment:"Inspected original 2736x3648 JPEG and primary 540x720 WebP: one full-length manual cross-head screwdriver, clear handle, shaft and tip, distinct from powered drivers; correct canonical subject."},
 multimeter:{alt_ja:"黄色い液晶付きデジタルマルチメーターの測定切替ダイヤルと入力端子",alt_en:"Yellow digital multimeter with LCD, rotary range selector and test lead sockets",assessment:"Inspected original 1840x2453 JPEG and primary 540x720 WebP: digital multimeter with screen, selector knob, electrical measurement ranges and lead ports; single identifiable multimeter."}
};
function fail(message){throw Error("Wave7 formal promotion: "+message)}
function sha1(buffer){return crypto.createHash("sha1").update(buffer).digest("hex")}
function sourceBytes(id,filename){const f=path.join(IMAGES,id,filename);if(!fs.existsSync(f))fail(id+": missing "+f);return fs.readFileSync(f)}
function verifyAssets(lead){
 const id=lead.entry_id,original=sourceBytes(id,lead.source_filename),primary=sourceBytes(id,"primary.webp"),thumb=sourceBytes(id,"thumb.webp");
 if(original[0]!==255||original[1]!==216||original[2]!==255)fail(id+": source is not JPEG");
 if(sha1(original)!==lead.expected_sha1)fail(id+": source SHA-1 mismatch");
 for(const [filename,buffer] of [["primary.webp",primary],["thumb.webp",thumb]]){
  if(buffer.length<1000||buffer.toString("ascii",0,4)!=="RIFF"||buffer.toString("ascii",8,12)!=="WEBP")fail(id+": invalid "+filename);
 }
 if(primary.equals(thumb))fail(id+": original and thumb cannot be identical");
}
function noteAttribution(items,version){
 const file=path.join(IMAGES,"ATTRIBUTION.md");
 let text=fs.readFileSync(file,"utf8");
 if(!text.includes("Runtime images are local derivatives."))fail("attribution base disclosure missing");
 for(const item of items){
  if(text.includes("| `"+item.entry_id+"` |"))fail(item.entry_id+": attribution duplicate");
  const line="| `"+item.entry_id+"` | "+item.attribution+" | ["+item.license+"]("+item.license_url+") | [Wikimedia Commons]("+item.source_page+") | `"+item.source_sha1+"` |";
  const anchor="\nSource ledger versions:";
  if(!text.includes(anchor))fail("attribution footer missing");
  text=text.replace(anchor,line+"\n"+anchor);
 }
 const footer=/Source ledger versions: ([^\n]+)\./;
 if(!footer.test(text))fail("attribution source version footer missing");
 text=text.replace(footer,(_all,body)=>"Source ledger versions: "+body+", `"+version+"`.");
 fs.writeFileSync(file,text);
}
async function main(){
 const intake=read("affiliate-image-acquisition-wave7-v2.3.json");
 const registry=read("image-registry-v2.3.json");
 const ledger=read("image-lifecycle-v2.3.json");
 const selected=intake.source_leads.filter(x=>IDS.includes(x.entry_id));
 if(selected.length!==IDS.length)fail("missing source lead");
 if(IDS.some(id=>registry.items.some(x=>x.entry_id===id)))fail("previously promoted image, refusing duplicate publication");
 const sourceRows=[];
 for(const lead of selected){
  verifyAssets(lead);
  const id=lead.entry_id,meta=REVIEW[id];
  const row={entry_id:id,source_url:lead.source_url,source_page:lead.source_page,source_filename:lead.source_filename,license:lead.license,license_url:lead.license_url,author:lead.author,attribution:lead.attribution,expected_sha1:lead.expected_sha1,subject_match:"matched",review_state:"verified",review_note:meta.assessment,source_sha1:lead.expected_sha1};
  sourceRows.push(row);
  registry.items.push({entry_id:id,alt_ja:meta.alt_ja,alt_en:meta.alt_en,image_state:"verified",subject_match:"matched",migration_state:"promoted",primary:{source:"./images/"+id+"/source.jpg",display:"./images/"+id+"/primary.webp",thumbnail:"./images/"+id+"/thumb.webp"},source:{source_url:lead.source_url,source_page:lead.source_page,license:lead.license,license_url:lead.license_url,author:lead.author,attribution:lead.attribution,modifications:"Auto-oriented if required, resized, metadata stripped, converted to WebP; original source retained locally; derivative remains under the source license.",source_sha1:lead.expected_sha1},notes:"Wave7: full original/derivative visual review and pinned binary SHA-1 verification; "+meta.assessment});
 }
 sourceRows.sort((a,b)=>a.entry_id.localeCompare(b.entry_id,"en"));
 const sourceLedger={schema:"cta-image-wave7-sources-v2.3",version:PROMOTION_VERSION,policy:{runtime_hotlink:false,source_provider:"Wikimedia Commons",promotion_rule:"Only three visually reviewed, SHA-1 verified local raster records approved; no automatic promotion from source intake."},items:sourceRows};
 write("image-wave7-sources-v2.3.json",sourceLedger);
 registry.version=PROMOTION_VERSION;
 write("image-registry-v2.3.json",registry);
 const {loadContext,candidateDigest}=require("./image-lifecycle-v2.3.cjs");
 const context=await loadContext();
 for(const id of IDS){
  const candidate={id:"wave6:"+id,source_entry_id:id,kind:"photograph",source_ref:{file:"image-wave7-sources-v2.3.json",entry_id:id}};
  const hash=candidateDigest(candidate,context);
  ledger.candidates.push(candidate);
  const row=ledger.items.find(x=>x.entry_id===id);
  if(!row||row.history.at(-1).state!=="awaiting_source")fail(id+": expected awaiting_source lifecycle state");
  const phases=[
    ["candidate","2026-10-31T13:05:00Z","Pinned Wikimedia original accepted for review, with distinct canonical subject and reviewed license."],
    ["provenance_verified","2026-10-31T13:05:01Z","Commons attribution, license URL, source page, original bytes, and SHA-1 were validated."],
    ["verified","2026-10-31T13:05:02Z",REVIEW[id].assessment],
    ["promoted","2026-10-31T13:05:03Z","Promoted only after direct visual review, SHA-1 match, retained source JPEG, distinct local primary and thumbnail WebP derivatives."]
  ];
  for(const [state,at,reason] of phases)row.history.push({state,at,actor:"image-wave7-reviewed-20261031",reason,candidate_id:candidate.id,candidate_sha256:hash,hold:null});
 }
 ledger.version=PROMOTION_VERSION;
 write("image-lifecycle-v2.3.json",ledger);
 noteAttribution(sourceRows,PROMOTION_VERSION);
 const hotfix=path.join(ROOT,"detail-image-hotfix.js");
 let runtime=fs.readFileSync(hotfix,"utf8");
 if(!/image-registry-v2\.3\.json\?v=[^"']+/.test(runtime))fail("runtime image registry URL missing");
 runtime=runtime.replace(/image-registry-v2\.3\.json\?v=[^"']+/, "image-registry-v2.3.json?v="+PROMOTION_VERSION);
 fs.writeFileSync(hotfix,runtime);
 const previousIntake=read("affiliate-image-acquisition-wave6-v2.3.json");
 if(previousIntake.expected.revenue_ready!==35||previousIntake.expected.awaiting_source!==397||previousIntake.expected.first_wave!==10)fail("Wave6 cohort drift before Wave7 formal promotion");
 const current=previousIntake.review_decisions||[];
 for(const id of IDS)if(current.some(x=>x.entry_id===id))fail(id+": duplicate formal review decision");
 previousIntake.version=PROMOTION_VERSION;
 previousIntake.expected.revenue_ready=38;
 previousIntake.expected.awaiting_source=394;
 previousIntake.expected.first_wave=7;
 previousIntake.review_decisions=[...current,...IDS.map(id=>({entry_id:id,disposition:"promoted",review:"Wave7 source and WebP originals directly inspected, exact Commons SHA-1 matched, licensed attribution retained, complete formal lifecycle completed: "+REVIEW[id].assessment}))];
 write("affiliate-image-acquisition-wave6-v2.3.json",previousIntake);

 console.log("Construction Atlas Wave7 formal promotion: prepared 3 verified registry items; final audits and 38-item SEO rebuild required");
}
main().catch(error=>{console.error(error.stack);process.exit(1)});
