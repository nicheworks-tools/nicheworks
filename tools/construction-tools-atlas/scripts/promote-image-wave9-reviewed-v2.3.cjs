#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),IMAGES=path.join(ROOT,"images");
const read=name=>JSON.parse(fs.readFileSync(path.join(DATA,name),"utf8"));
const write=(name,object)=>fs.writeFileSync(path.join(DATA,name),JSON.stringify(object,null,2)+"\n");
const PROMOTION_VERSION="2026-10-31-reviewed-image-wave9-four-1";
const IDS=["laser_distance_meter","pipe_wrench","speed_square","nail_gun"];
const REVIEW={
 laser_distance_meter:{alt_ja:"手に持った赤と黒のレーザー距離計、液晶表示と測定操作ボタン",alt_en:"Handheld laser distance meter with display and measuring controls",assessment:"Inspected original 750x507 JPEG and 750x507 WebP: complete handheld laser distance meter with screen and controls, clearly recognizable; source file original SHA-1 confirmed through Commons API."},
 pipe_wrench:{alt_ja:"歯付きジョーと調整ナットを備えた赤いパイプレンチ",alt_en:"Red adjustable pipe wrench with toothed jaws and knurled adjustment nut",assessment:"Inspected original 4608x3072 JPEG and 960x640 WebP: full red pipe wrench, adjustable jaw and knurled knob clearly visible in uncluttered foreground."},
 speed_square:{alt_ja:"角度目盛りのある三角形のスピードスクエア",alt_en:"Triangular Swanson speed square with readable layout and degree scales",assessment:"Inspected original 567x480 JPEG and 567x480 WebP: Swanson triangular speed square with right-angle edges and graduated layout scales; adequate focal tool despite native resolution."},
 nail_gun:{alt_ja:"金属マガジンとエア接続部を備えたエア式釘打ち機",alt_en:"Pneumatic nail gun with metal nail magazine, air fitting and grip",assessment:"Inspected original 2816x2112 JPEG and 960x720 WebP: one full pneumatic nail gun shown side-on with barrel, magazine, grip and air fitting; correct canonical subject."}
};
function fail(message){throw Error("Wave9 formal promotion: "+message)}
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
 const intake=read("affiliate-image-acquisition-wave9-v2.3.json");
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
  registry.items.push({entry_id:id,alt_ja:meta.alt_ja,alt_en:meta.alt_en,image_state:"verified",subject_match:"matched",migration_state:"promoted",primary:{source:"./images/"+id+"/source.jpg",display:"./images/"+id+"/primary.webp",thumbnail:"./images/"+id+"/thumb.webp"},source:{source_url:lead.source_url,source_page:lead.source_page,license:lead.license,license_url:lead.license_url,author:lead.author,attribution:lead.attribution,modifications:"Auto-oriented if required, resized, metadata stripped, converted to WebP; original source retained locally; derivative remains under the source license.",source_sha1:lead.expected_sha1},notes:"Wave9: full original/derivative visual review and pinned binary SHA-1 verification; "+meta.assessment});
 }
 sourceRows.sort((a,b)=>a.entry_id.localeCompare(b.entry_id,"en"));
 const sourceLedger={schema:"cta-image-wave9-sources-v2.3",version:PROMOTION_VERSION,policy:{runtime_hotlink:false,source_provider:"Wikimedia Commons",promotion_rule:"Only 4 visually reviewed source photographs with pinned Commons API SHA-1 accepted; the reciprocating saw photo is expressly rejected."},items:sourceRows};
 write("image-wave9-sources-v2.3.json",sourceLedger);
 registry.version=PROMOTION_VERSION;
 write("image-registry-v2.3.json",registry);
 const {loadContext,candidateDigest}=require("./image-lifecycle-v2.3.cjs");
 const context=await loadContext();
 for(const id of IDS){
  const candidate={id:"wave6:"+id,source_entry_id:id,kind:"photograph",source_ref:{file:"image-wave9-sources-v2.3.json",entry_id:id}};
  const hash=candidateDigest(candidate,context);
  ledger.candidates.push(candidate);
  const row=ledger.items.find(x=>x.entry_id===id);
  if(!row||row.history.at(-1).state!=="awaiting_source")fail(id+": expected awaiting_source lifecycle state");
  const phases=[
    ["candidate","2026-10-31T14:26:00Z","Pinned Wikimedia original accepted for review, with distinct canonical subject and reviewed license."],
    ["provenance_verified","2026-10-31T14:26:01Z","Commons attribution, license URL, source page, original bytes, and SHA-1 were validated."],
    ["verified","2026-10-31T14:26:02Z",REVIEW[id].assessment],
    ["promoted","2026-10-31T14:26:03Z","Promoted only after direct visual review, SHA-1 match, retained source JPEG, distinct local primary and thumbnail WebP derivatives."]
  ];
  for(const [state,at,reason] of phases)row.history.push({state,at,actor:"image-wave9-reviewed-20261031",reason,candidate_id:candidate.id,candidate_sha256:hash,hold:null});
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
 if(previousIntake.expected.revenue_ready!==40||previousIntake.expected.awaiting_source!==392||previousIntake.expected.first_wave!==5)fail("Wave8 cohort drift before Wave9 promotion");
 const decisions=previousIntake.review_decisions||[];
 for(const id of IDS){
   if(decisions.some(x=>x.entry_id===id))fail(id+": duplicate formal review disposition");
   decisions.push({entry_id:id,disposition:"promoted",review:"Original JPEG / primary WebP visually inspected, Commons API SHA-1 matched verified original, attribution and publication lifecycle completed. "+REVIEW[id].assessment});
 }
 const saw=decisions.find(x=>x.entry_id==="reciprocating_saw");
 if(saw?.disposition!=="rejected_subject_focus")fail("prior rejected saw photo disposition missing");
 saw.review+=" Wave9 second proposed saw image inspected: saw body and rear grip visible but cutting blade and tool nose absent; still inadequate for canonical illustration; remain awaiting_source.";
 previousIntake.version=PROMOTION_VERSION;
 previousIntake.expected.revenue_ready=44;
 previousIntake.expected.awaiting_source=388;
 previousIntake.expected.first_wave=1;
 write("affiliate-image-acquisition-wave6-v2.3.json",previousIntake);

 console.log("Construction Atlas Wave9 formal promotion: prepared 4 source-matched image records; 44-page SEO rebuild expected");
}
main().catch(error=>{console.error(error.stack);process.exit(1)});
