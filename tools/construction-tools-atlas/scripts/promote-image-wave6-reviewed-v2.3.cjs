#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),path=require("node:path"),crypto=require("node:crypto");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),IMAGES=path.join(ROOT,"images");
const read=name=>JSON.parse(fs.readFileSync(path.join(DATA,name),"utf8"));
const write=(name,object)=>fs.writeFileSync(path.join(DATA,name),JSON.stringify(object,null,2)+"\n");
const PROMOTION_VERSION="2026-10-31-reviewed-image-wave6-two-1";
const IDS=["hammer_drill","tape_measure"];
const REVIEW={
 hammer_drill:{alt_ja:"補助ハンドルとコンクリート用ドリルビットが付いた有線振動ドリル",alt_en:"Corded hammer drill with auxiliary handle and masonry drill bit",assessment:"Inspected original 800x905 JPEG and 636x720 WebP: corded hammer drill with side handle and masonry drill bit clearly identifiable, not an impact driver or rotary hammer."},
 tape_measure:{alt_ja:"伸縮式の金属製巻尺（10メートル表示）",alt_en:"Retractable ten-metre tape measure with a partially extended metal measuring blade",assessment:"Inspected original 3648x2056 JPEG and 960x541 WebP: identifiable tape housing, ten-metre label and extended ruler; clear tool subject."}
};
function fail(message){throw Error("Wave6 formal promotion: "+message)}
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
 const intake=read("affiliate-image-acquisition-wave6-v2.3.json");
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
  registry.items.push({entry_id:id,alt_ja:meta.alt_ja,alt_en:meta.alt_en,image_state:"verified",subject_match:"matched",migration_state:"promoted",primary:{source:"./images/"+id+"/source.jpg",display:"./images/"+id+"/primary.webp",thumbnail:"./images/"+id+"/thumb.webp"},source:{source_url:lead.source_url,source_page:lead.source_page,license:lead.license,license_url:lead.license_url,author:lead.author,attribution:lead.attribution,modifications:"Auto-oriented if required, resized, metadata stripped, converted to WebP; original source retained locally; derivative remains under the source license.",source_sha1:lead.expected_sha1},notes:"Wave6: full original/derivative visual review and pinned binary SHA-1 verification; "+meta.assessment});
 }
 sourceRows.sort((a,b)=>a.entry_id.localeCompare(b.entry_id,"en"));
 const sourceLedger={schema:"cta-image-wave6-sources-v2.3",version:PROMOTION_VERSION,policy:{runtime_hotlink:false,source_provider:"Wikimedia Commons",promotion_rule:"Only two subject-reviewed, SHA-1 verified local raster records approved; rejected torque_wrench photo excluded."},items:sourceRows};
 write("image-wave6-sources-v2.3.json",sourceLedger);
 registry.version=PROMOTION_VERSION;
 write("image-registry-v2.3.json",registry);
 const {loadContext,candidateDigest}=require("./image-lifecycle-v2.3.cjs");
 const context=await loadContext();
 for(const id of IDS){
  const candidate={id:"wave6:"+id,source_entry_id:id,kind:"photograph",source_ref:{file:"image-wave6-sources-v2.3.json",entry_id:id}};
  const hash=candidateDigest(candidate,context);
  ledger.candidates.push(candidate);
  const row=ledger.items.find(x=>x.entry_id===id);
  if(!row||row.history.at(-1).state!=="awaiting_source")fail(id+": expected awaiting_source lifecycle state");
  const phases=[
    ["candidate","2026-10-31T12:20:00Z","Pinned Wikimedia original accepted for review, with distinct canonical subject and reviewed license."],
    ["provenance_verified","2026-10-31T12:20:01Z","Commons attribution, license URL, source page, original bytes, and SHA-1 were validated."],
    ["verified","2026-10-31T12:20:02Z",REVIEW[id].assessment],
    ["promoted","2026-10-31T12:20:03Z","Promoted only after direct visual review, SHA-1 match, retained source JPEG, distinct local primary and thumbnail WebP derivatives."]
  ];
  for(const [state,at,reason] of phases)row.history.push({state,at,actor:"image-wave6-reviewed-20261031",reason,candidate_id:candidate.id,candidate_sha256:hash,hold:null});
 }
 ledger.version=PROMOTION_VERSION;
 write("image-lifecycle-v2.3.json",ledger);
 noteAttribution(sourceRows,PROMOTION_VERSION);
 const hotfix=path.join(ROOT,"detail-image-hotfix.js");
 let runtime=fs.readFileSync(hotfix,"utf8");
 if(!/image-registry-v2\.3\.json\?v=[^"']+/.test(runtime))fail("runtime image registry URL missing");
 runtime=runtime.replace(/image-registry-v2\.3\.json\?v=[^"']+/, "image-registry-v2.3.json?v="+PROMOTION_VERSION);
 fs.writeFileSync(hotfix,runtime);
 const rootComparison=path.join(ROOT,"scripts","build-comparison-pages-v2.3.cjs");
 let comp=fs.readFileSync(rootComparison,"utf8");
 if(!comp.includes("公開詳細ページ一覧"))fail("comparison directory link unexpected");
 const page=path.join(ROOT,"comparisons","impact-driver-vs-drill-driver","index.html");
 let pageHtml=fs.readFileSync(page,"utf8");
 if(!pageHtml.includes("33件の公開詳細ページ一覧"))fail("expected old comparison label missing");
 pageHtml=pageHtml.replace("33件の公開詳細ページ一覧","公開詳細ページ一覧");
 fs.writeFileSync(page,pageHtml);
 intake.version=PROMOTION_VERSION;
 intake.expected.revenue_ready=35;
 intake.expected.awaiting_source=397;
 intake.expected.first_wave=10;
 intake.review_decisions=[
   {entry_id:"hammer_drill",disposition:"promoted",review:"Original and WebP image visibly match hammer drill; SHA-1 verified, formal image lifecycle completed."},
   {entry_id:"tape_measure",disposition:"promoted",review:"Original and WebP image visibly match tape measure; SHA-1 verified, formal image lifecycle completed."},
   {entry_id:"torque_wrench",disposition:"rejected_subject_focus",review:"Image depicts a wall-mounted mixed-tool/wrench collection; inadequate focal representation of a single torque wrench. Keep canonical awaiting_source; find a new photo."}
 ];
 write("affiliate-image-acquisition-wave6-v2.3.json",intake);
 console.log("Construction Atlas Wave6 formal promotion: prepared 2 verified registry items; 1 source rejected; final audits and snapshot rebuild required");
}
main().catch(error=>{console.error(error.stack);process.exit(1)});
