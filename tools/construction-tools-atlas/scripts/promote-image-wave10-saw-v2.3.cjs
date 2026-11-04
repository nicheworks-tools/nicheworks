#!/usr/bin/env node
"use strict";
const fs=require("node:fs"),fsp=require("node:fs/promises"),path=require("node:path"),crypto=require("node:crypto"),{spawnSync}=require("node:child_process");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),IMAGES=path.join(ROOT,"images");
const ID="reciprocating_saw",VERSION="2026-11-04-reviewed-image-wave10-saw-1";
const COMMONS_FILENAME="Reciprocating Saw.JPG",SOURCE_PAGE="https://commons.wikimedia.org/wiki/File:Reciprocating_Saw.JPG",SOURCE_URL="https://upload.wikimedia.org/wikipedia/commons/0/04/Reciprocating_Saw.JPG";
const AUTHOR="Junglecat",LICENSE="Public Domain (PD-self)",LICENSE_URL="https://commons.wikimedia.org/wiki/Template:PD-self",ATTRIBUTION="Junglecat / Wikimedia Commons, Public Domain (PD-self)";
const ASSESSMENT="Reviewed original 1008x523 JPEG: the full Craftsman reciprocating saw is identifiable, including blade, shoe, tool body and rear trigger handle. Fit-within WebP derivatives retain the full photo without cropping. Earlier cropped Makita candidates remain historical rejections.";
const read=(name)=>JSON.parse(fs.readFileSync(path.join(DATA,name),"utf8")),write=(name,obj)=>fs.writeFileSync(path.join(DATA,name),JSON.stringify(obj,null,2)+"\n");
function ensure(cond,msg){if(!cond)throw Error("Wave10 saw: "+msg)}
function sha1(bytes){return crypto.createHash("sha1").update(bytes).digest("hex")}
function run(command,args){const p=spawnSync(command,args,{encoding:"utf8",maxBuffer:32*1024*1024});ensure(p.status===0,command+" failed "+(p.stderr||p.stdout||p.error?.message||""));return p}
async function getSource(){
  const ua="NicheWorks-Construction-Atlas/2.3 (+https://nicheworks.app/)";
  const res=await fetch(SOURCE_URL,{headers:{"user-agent":ua,"accept":"image/jpeg"}});
  ensure(res.ok,"source HTTP "+res.status);
  ensure((res.headers.get("content-type")||"").startsWith("image/jpeg"),"source mime mismatch");
  const bytes=Buffer.from(await res.arrayBuffer());
  ensure(bytes.length>20000&&bytes.length<3000000&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255,"source JPEG size/signature mismatch");
  const hash=sha1(bytes),api=new URL("https://commons.wikimedia.org/w/api.php");
  api.search=new URLSearchParams({action:"query",format:"json",prop:"imageinfo",iiprop:"sha1|url|size",titles:"File:"+COMMONS_FILENAME}).toString();
  const resp=await fetch(api,{headers:{"user-agent":ua,"accept":"application/json"}});
  ensure(resp.ok,"Commons API HTTP "+resp.status);
  const body=await resp.json(),meta=Object.values(body.query?.pages||{})[0]?.imageinfo?.[0];
  ensure(meta&&meta.sha1===hash&&meta.size===bytes.length,"original hash/size disagrees with Commons");
  const a=new URL(meta.url),b=new URL(SOURCE_URL);
  ensure(a.origin===b.origin&&a.pathname===b.pathname&&!a.search&&!a.hash,"Commons URL differs from reviewed original "+JSON.stringify({api_url:meta.url,expected_url:SOURCE_URL,sha1:hash}));
  console.log("CTA_WAVE10_SOURCE_VERIFIED="+JSON.stringify({entry_id:ID,sha1:hash,bytes:bytes.length,url:SOURCE_URL}));
  return{bytes,hash};
}
async function materialize(bytes,hash){
  const dir=path.join(IMAGES,ID);
  ensure(!fs.existsSync(dir),"image directory exists; refusing overwrite");
  await fsp.mkdir(dir,{recursive:true});
  const source=path.join(dir,"source.jpg");await fsp.writeFile(source,bytes);
  const cmd=["magick","convert"].find(x=>spawnSync(x,["-version"],{stdio:"ignore"}).status===0);
  ensure(cmd,"ImageMagick required");
  for(const [filename,geometry,quality] of [["primary.webp","960x720>","82"],["thumb.webp","320x240>","78"]]){
    run(cmd,[source,"-auto-orient","-colorspace","sRGB","-strip","-resize",geometry,"-quality",quality,"-define","webp:method=6",path.join(dir,filename)]);
    const buf=await fsp.readFile(path.join(dir,filename));
    ensure(buf.length>1000&&buf.toString("ascii",0,4)==="RIFF"&&buf.toString("ascii",8,12)==="WEBP",filename+" invalid WebP");
  }
  ensure(sha1(await fsp.readFile(source))===hash,"retained source mismatch");
}
function updateAttribution(hash){
  const f=path.join(IMAGES,"ATTRIBUTION.md"),tick=String.fromCharCode(96);
  let s=fs.readFileSync(f,"utf8");
  ensure(!s.includes("| "+tick+ID+tick+" |"),"duplicate attribution row");
  const anchor="\nSource ledger versions:";
  ensure(s.includes(anchor),"attribution footer missing");
  const line="| "+tick+ID+tick+" | "+ATTRIBUTION+" | ["+LICENSE+"]("+LICENSE_URL+") | [Wikimedia Commons]("+SOURCE_PAGE+") | "+tick+hash+tick+" |";
  s=s.replace(anchor,line+anchor);
  ensure(/Source ledger versions: ([^\n]+)\./.test(s),"version footer malformed");
  s=s.replace(/Source ledger versions: ([^\n]+)\./,(_m,versions)=>"Source ledger versions: "+versions+", "+tick+VERSION+tick+".");
  fs.writeFileSync(f,s);
}
async function main(){
  const {bytes,hash}=await getSource(),registry=read("image-registry-v2.3.json"),ledger=read("image-lifecycle-v2.3.json"),intake=read("affiliate-image-acquisition-wave6-v2.3.json");
  ensure(!registry.items.some(x=>x.entry_id===ID),"already formally promoted");
  const row=ledger.items.find(x=>x.entry_id===ID);
  ensure(row&&row.history.at(-1)?.state==="awaiting_source","lifecycle awaiting_source required");
  ensure(intake.expected.revenue_ready===44&&intake.expected.awaiting_source===386&&intake.expected.first_wave===1,"existing queue changed");
  ensure(intake.first_wave_ids.includes(ID),"saw missing from selected first wave");
  const decision=(intake.review_decisions||[]).find(x=>x.entry_id===ID);
  ensure(decision?.disposition==="rejected_subject_focus","historical rejection missing");
  await materialize(bytes,hash);
  const source={source_url:SOURCE_URL,source_page:SOURCE_PAGE,license:LICENSE,license_url:LICENSE_URL,author:AUTHOR,attribution:ATTRIBUTION,source_sha1:hash};
  write("image-wave10-sources-v2.3.json",{
    schema:"cta-image-wave10-sources-v2.3",version:VERSION,
    policy:{runtime_hotlink:false,source_provider:"Wikimedia Commons",promotion_rule:"Full image visually reviewed and retained; independent original SHA-1 check against Commons API."},
    items:[{entry_id:ID,...source,source_filename:"source.jpg",expected_sha1:hash,subject_match:"matched",review_state:"verified",review_note:ASSESSMENT}]
  });
  registry.items.push({entry_id:ID,alt_ja:"刃先・シュー・本体・後部グリップまで写ったレシプロソー",alt_en:"Complete reciprocating saw with blade, shoe, body and trigger grip",image_state:"verified",subject_match:"matched",migration_state:"promoted",primary:{source:"./images/"+ID+"/source.jpg",display:"./images/"+ID+"/primary.webp",thumbnail:"./images/"+ID+"/thumb.webp"},source:{...source,modifications:"Fit-within resize and auto-orientation, metadata stripped and WebP converted without cropping; original retained locally, public domain status unchanged."},notes:"Wave10: "+ASSESSMENT});
  registry.version=VERSION;write("image-registry-v2.3.json",registry);
  const {loadContext,candidateDigest}=require("./image-lifecycle-v2.3.cjs");
  const candidate={id:"wave10:"+ID,source_entry_id:ID,kind:"photograph",source_ref:{file:"image-wave10-sources-v2.3.json",entry_id:ID}};
  const digest=candidateDigest(candidate,await loadContext());ledger.candidates.push(candidate);
  const t=Date.now();
  const steps=[
    ["candidate","Full-tool Commons replacement selected after previous cropped-image rejections."],
    ["provenance_verified","Verified exact source URL, byte length and original SHA-1 against Commons MediaWiki API; PD-self attribution recorded."],
    ["verified",ASSESSMENT],
    ["promoted","Retained exact JPEG; separately generated uncropped local WebP primary and thumb; provenance registry updated."]
  ];
  for(let i=0;i<steps.length;i++){const [state,reason]=steps[i];row.history.push({state,at:new Date(t+i*1000).toISOString(),actor:"image-wave10-reviewed-20261104",reason,candidate_id:candidate.id,candidate_sha256:digest,hold:null})}
  ledger.version=VERSION;write("image-lifecycle-v2.3.json",ledger);updateAttribution(hash);
  decision.disposition="promoted";decision.review+=" Wave10 full-tool replacement accepted after visual review; source original hash verified through Commons API.";
  intake.version=VERSION;intake.expected.revenue_ready=45;intake.expected.awaiting_source=385;intake.expected.first_wave=0;
  write("affiliate-image-acquisition-wave6-v2.3.json",intake);
  const hotfix=path.join(ROOT,"detail-image-hotfix.js");let s=fs.readFileSync(hotfix,"utf8");
  ensure(/image-registry-v2\.3\.json\?v=[^"']+/.test(s),"cache key not found");
  s=s.replace(/image-registry-v2\.3\.json\?v=[^"']+/,"image-registry-v2.3.json?v="+VERSION);fs.writeFileSync(hotfix,s);
  const tasks=[["audit-image-inventory-v2.3.cjs","--write"],["audit-public-image-inventory-v2.3.cjs","--write"],["build-affiliate-image-acquisition-queue-v2.3.cjs","--write"],["build-seo-detail-pages-v2.3.cjs"],["check-image-registry-v2.3.cjs"],["check-image-attribution-v2.3.cjs"],["check-image-lifecycle-v2.3.cjs"]];
  for(const task of tasks){const result=run(process.execPath,[path.join(ROOT,"scripts",task[0]),...task.slice(1)]);console.log(task[0]+": "+result.stdout.slice(-400))}
  const seo=read("seo-detail-pages-v2.3.json").summary,imgs=read("public-image-inventory-v2.3.json").summary,q=read("affiliate-image-acquisition-queue-v2.3.json").summary;
  ensure(seo.public_runtime_entries===865&&seo.published_static_detail_pages===45,"SEO count mismatch");
  ensure(imgs.formal_image_entries===54&&imgs.missing_formal_image_entries===766,"image count mismatch");
  ensure(q.revenue_ready===45&&q.awaiting_source===385,"queue count mismatch");
  console.log("CTA_WAVE10_PROMOTION_PASS="+JSON.stringify({hash,seo,images:imgs,queue:q}));
}
main().catch(e=>{console.error(e.stack);process.exit(1)});
