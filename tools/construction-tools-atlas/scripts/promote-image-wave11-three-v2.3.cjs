#!/usr/bin/env node
"use strict";
// Source-verified, full-subject Atlas Wave11. No unreviewed image is published.
const fs=require("node:fs"),fsp=require("node:fs/promises"),path=require("node:path"),crypto=require("node:crypto"),{spawnSync}=require("node:child_process");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),IMAGES=path.join(ROOT,"images");
const VERSION="2026-11-05-reviewed-image-wave11-three-1";
const ITEMS=[
  {id:"cable_tie",file:"Cable ties.jpg",url:"https://upload.wikimedia.org/wikipedia/commons/2/2f/Cable_ties.jpg",page:"https://commons.wikimedia.org/wiki/File:Cable_ties.jpg",
   author:"Silverxxx (English Wikipedia)",license:"CC BY-SA 3.0",license_url:"https://creativecommons.org/licenses/by-sa/3.0/",
   attribution:"Silverxxx (English Wikipedia) / Wikimedia Commons, CC BY-SA 3.0",
   pin:"992e9b0b6a214c1fa9c98e4b60871fb0ea677f88",
   alt_ja:"白い背景上の黒・緑・青・白の樹脂製結束バンドとロック部分",alt_en:"Assorted black, green, blue and white nylon cable ties with locking heads",
   review:"Reviewed the original 1152x864 photo: distinct plastic cable tie locking heads, toothed straps and a closed green loop are visible; no product-pack-only image."},
  {id:"bucket",file:"White plastic bucket.jpg",url:"https://upload.wikimedia.org/wikipedia/commons/4/41/White_plastic_bucket.jpg",page:"https://commons.wikimedia.org/wiki/File:White_plastic_bucket.jpg",
   author:"Santeri Viinamäki",license:"CC BY-SA 4.0",license_url:"https://creativecommons.org/licenses/by-sa/4.0/",
   attribution:"Santeri Viinamäki / Wikimedia Commons, CC BY-SA 4.0",
   pin:"900d18edd1a2956b7617db7a9e24ad9baac7b816",
   alt_ja:"屋外の木製床面に置かれた黒い持ち手付き白い樹脂製バケツ",alt_en:"White plastic bucket with black carrying handle on a wooden deck",
   review:"Reviewed full Commons photograph (3648x2736): a white plastic bucket with black carrying handle and open rim is fully visible; clear canonical bucket subject."},
  {id:"chisel",file:"Wood chisels.jpg",url:"https://upload.wikimedia.org/wikipedia/commons/1/1a/Wood_chisels.jpg",page:"https://commons.wikimedia.org/wiki/File:Wood_chisels.jpg",
   author:"Michaelkurek011",license:"CC BY-SA 4.0",license_url:"https://creativecommons.org/licenses/by-sa/4.0/",
   attribution:"Michaelkurek011 / Wikimedia Commons, CC BY-SA 4.0",
   pin:"a3f0ef8647c099528ee39cac9cfd5391a6662fd1",
   alt_ja:"木の台上に並んだ幅の異なる木工用のみ5本と刃先",alt_en:"Five woodworking chisels with wooden handles and different cutting-edge widths",
   review:"Reviewed the original 2992x2992 photograph: five full-size woodworking chisels, their handles, metal shafts and cutting edges are all identifiable."}
];
const read=n=>JSON.parse(fs.readFileSync(path.join(DATA,n),"utf8"));
const write=(n,obj)=>fs.writeFileSync(path.join(DATA,n),JSON.stringify(obj,null,2)+"\n");
const hash=b=>crypto.createHash("sha1").update(b).digest("hex");
const ensure=(good,msg)=>{if(!good)throw Error("Atlas Wave11: "+msg)};
function run(cmd,args){const p=spawnSync(cmd,args,{encoding:"utf8",maxBuffer:32*1024*1024});ensure(p.status===0,cmd+" failed: "+(p.stderr||p.stdout||p.error?.message||""));return p;}
async function verifyCommons(item){
 const ua="NicheWorks-Construction-Atlas/2.3 (+https://nicheworks.app/)";
 const response=await fetch(item.url,{redirect:"follow",headers:{"user-agent":ua,accept:"image/jpeg"}});
 ensure(response.ok,item.id+" source HTTP "+response.status);
 ensure((response.headers.get("content-type")||"").toLowerCase().startsWith("image/jpeg"),item.id+" source is not JPEG");
 const bytes=Buffer.from(await response.arrayBuffer());
 ensure(bytes.length>10000&&bytes.length<10*1024*1024&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255,item.id+" invalid JPEG or size");
 const sha1=hash(bytes),apiUrl=new URL("https://commons.wikimedia.org/w/api.php");
 apiUrl.search=new URLSearchParams({action:"query",format:"json",prop:"imageinfo",iiprop:"sha1|url|size",titles:"File:"+item.file}).toString();
 const mr=await fetch(apiUrl,{headers:{"user-agent":ua,accept:"application/json"}});
 ensure(mr.ok,item.id+" Commons API "+mr.status);
 const metadata=Object.values((await mr.json()).query?.pages||{})[0]?.imageinfo?.[0];
 ensure(metadata&&metadata.sha1===sha1&&metadata.size===bytes.length,item.id+" original does not match live Commons SHA1/size");
 const actual=new URL(metadata.url),expected=new URL(item.url);
 const approved={utm_source:"commons.wikimedia.org",utm_campaign:"imageinfo",utm_content:"original"};
 const tracking=[...actual.searchParams].every(([k,v])=>Object.hasOwn(approved,k)&&approved[k]===v);
 ensure(actual.origin===expected.origin&&actual.pathname===expected.pathname&&!actual.hash&&tracking,item.id+" original URL changed unexpectedly: "+metadata.url);
 console.log("CTA_WAVE11_VERIFIED_SOURCE="+JSON.stringify({id:item.id,sha1,bytes:bytes.length,page:item.page,license:item.license}));
 return{...item,sha1,bytes};
}
async function materialize(item,converter){
 const folder=path.join(IMAGES,item.id);
 ensure(!fs.existsSync(folder),item.id+" already has image directory");
 await fsp.mkdir(folder,{recursive:true});
 const source=path.join(folder,"source.jpg");await fsp.writeFile(source,item.bytes);
 for(const [name,size,quality] of [["primary.webp","960x720>","82"],["thumb.webp","320x240>","78"]]){
   const output=path.join(folder,name);
   run(converter,[source,"-auto-orient","-colorspace","sRGB","-strip","-resize",size,"-quality",quality,"-define","webp:method=6",output]);
   const b=await fsp.readFile(output);
   ensure(b.length>1000&&b.toString("ascii",0,4)==="RIFF"&&b.toString("ascii",8,12)==="WEBP",item.id+"/"+name+" corrupt");
 }
 ensure(hash(await fsp.readFile(source))===item.pin,item.id+" saved original SHA1 differs from pin");
}
function updateAttribution(items){
 const f=path.join(IMAGES,"ATTRIBUTION.md"),tick=String.fromCharCode(96);
 let s=fs.readFileSync(f,"utf8"),anchor="\nSource ledger versions:";
 ensure(s.includes(anchor),"source ledger footer missing");
 for(const it of items){
   ensure(!s.includes("| "+tick+it.id+tick+" |"),it.id+" attribution already present");
   const line="| "+tick+it.id+tick+" | "+it.attribution+" | ["+it.license+"]("+it.license_url+") | [Wikimedia Commons]("+it.page+") | "+tick+it.sha1+tick+" |";
   s=s.replace(anchor,line+anchor);
 }
 ensure(/Source ledger versions: ([^\n]+)\./.test(s),"attribution source ledger versions malformed");
 s=s.replace(/Source ledger versions: ([^\n]+)\./,(_m,v)=>"Source ledger versions: "+v+", "+tick+VERSION+tick+".");
 fs.writeFileSync(f,s);
}
async function main(){
 const results=await Promise.all(ITEMS.map(verifyCommons));
 const unpinned=results.filter(x=>!(/^[a-f0-9]{40}$/.test(x.pin)));
 if(unpinned.length)throw Error("First-pass intake only: pin the independently verified SHA1 values before promotion: "+unpinned.map(x=>x.id+"="+x.sha1).join(", "));
 results.forEach(it=>ensure(it.sha1===it.pin,it.id+" source SHA1 differs from review pin"));
 const registry=read("image-registry-v2.3.json"),lifecycle=read("image-lifecycle-v2.3.json"),intake=read("affiliate-image-acquisition-wave6-v2.3.json");
 ensure(registry.items.length===54,"base image registry changed");
 ensure(intake.expected.active_affiliate_mappings===430&&intake.expected.revenue_ready===45&&intake.expected.awaiting_source===385&&intake.expected.first_wave===0,"base queue changed");
 for(const it of results){
   ensure(!registry.items.some(x=>x.entry_id===it.id),it.id+" already promoted");
   ensure(lifecycle.items.find(x=>x.entry_id===it.id)?.history.at(-1)?.state==="awaiting_source",it.id+" is not awaiting source");
 }
 const converter=["magick","convert"].find(n=>spawnSync(n,["-version"],{stdio:"ignore"}).status===0);
 ensure(converter,"ImageMagick is required");
 for(const it of results)await materialize(it,converter);
 const ledgers=[];
 for(const it of results){
   const source={source_url:it.url,source_page:it.page,license:it.license,license_url:it.license_url,author:it.author,attribution:it.attribution,source_sha1:it.sha1};
   ledgers.push({entry_id:it.id,...source,source_filename:"source.jpg",expected_sha1:it.sha1,subject_match:"matched",review_state:"verified",review_note:it.review});
   registry.items.push({entry_id:it.id,alt_ja:it.alt_ja,alt_en:it.alt_en,image_state:"verified",subject_match:"matched",migration_state:"promoted",
    primary:{source:"./images/"+it.id+"/source.jpg",display:"./images/"+it.id+"/primary.webp",thumbnail:"./images/"+it.id+"/thumb.webp"},
    source:{...source,modifications:"Auto-oriented, fit-within resized without cropping, metadata stripped, and converted to local WebP; exact original retained; derivative stays under source license."},
    notes:"Wave11: "+it.review+" Exact Commons original SHA-1 verified against independent pin and live MediaWiki API."});
 }
 write("image-wave11-sources-v2.3.json",{schema:"cta-image-wave11-sources-v2.3",version:VERSION,policy:{runtime_hotlink:false,source_provider:"Wikimedia Commons",promotion_rule:"Only three visually reviewed source photos with independently pinned original SHA-1, a Commons API byte/hash match, and complete uncropped local WebP may be published."},items:ledgers});
 registry.version=VERSION;write("image-registry-v2.3.json",registry);
 const {candidateDigest,loadContext}=require("./image-lifecycle-v2.3.cjs"),context=await loadContext();
 const t=Math.floor(Date.now()/1000)*1000;
 for(let index=0;index<results.length;index++){
   const it=results[index],candidate={id:"wave11:"+it.id,source_entry_id:it.id,kind:"photograph",source_ref:{file:"image-wave11-sources-v2.3.json",entry_id:it.id}},digest=candidateDigest(candidate,context);
   lifecycle.candidates.push(candidate);
   const row=lifecycle.items.find(x=>x.entry_id===it.id);
   for(const [phase,[state,reason]] of [
     ["candidate","Visually reviewed photograph of the full canonical tool or material."],
     ["provenance_verified","Exact source bytes SHA-1 and length match pinned metadata and Commons MediaWiki API; author and license recorded."],
     ["verified",it.review],
     ["promoted","Local original and separately optimized primary and thumbnail WebP retained with reviewed provenance."]
   ].entries()){
     row.history.push({state,at:new Date(t+index*5000+phase*1000).toISOString().replace(/\.\d{3}Z$/,"Z"),actor:"image-wave11-reviewed-20261105",reason,candidate_id:candidate.id,candidate_sha256:digest,hold:null});
   }
 }
 lifecycle.version=VERSION;write("image-lifecycle-v2.3.json",lifecycle);
 updateAttribution(results);
 for(const it of results){
   ensure(!intake.first_wave_ids.includes(it.id),it.id+" already selected");
   intake.first_wave_ids.push(it.id);
   ensure(!(intake.review_decisions||[]).some(x=>x.entry_id===it.id),it.id+" duplicate review decision");
   intake.review_decisions.push({entry_id:it.id,disposition:"promoted",review:"Full source JPEG and uncropped WebP visually inspected. License/attribution and exact Commons original SHA1 confirmed. "+it.review});
 }
 intake.version=VERSION;intake.expected.revenue_ready=48;intake.expected.awaiting_source=382;intake.expected.first_wave=0;
 write("affiliate-image-acquisition-wave6-v2.3.json",intake);
 const hotfix=path.join(ROOT,"detail-image-hotfix.js");let js=fs.readFileSync(hotfix,"utf8");
 ensure(/image-registry-v2\.3\.json\?v=[^"']+/.test(js),"runtime image cache version missing");
 js=js.replace(/image-registry-v2\.3\.json\?v=[^"']+/,"image-registry-v2.3.json?v="+VERSION);fs.writeFileSync(hotfix,js);
 for(const task of [
   ["audit-image-inventory-v2.3.cjs","--write"],
   ["audit-public-image-inventory-v2.3.cjs","--write"],
   ["build-affiliate-image-acquisition-queue-v2.3.cjs","--write"],
   ["build-seo-detail-pages-v2.3.cjs"],
   ["check-image-registry-v2.3.cjs"],
   ["check-image-attribution-v2.3.cjs"],
   ["check-image-lifecycle-v2.3.cjs"]
 ]){const p=run(process.execPath,[path.join(ROOT,"scripts",task[0]),...task.slice(1)]);console.log("CTA_WAVE11_CHECK="+task[0]+" "+p.stdout.slice(-200))}
 const pub=read("public-image-inventory-v2.3.json").summary,seo=read("seo-detail-pages-v2.3.json").summary,queue=read("affiliate-image-acquisition-queue-v2.3.json").summary;
 ensure(pub.public_entries===865&&pub.formal_image_entries===57&&pub.missing_formal_image_entries===763,"public image inventory count mismatch");
 ensure(seo.published_static_detail_pages===48&&seo.public_runtime_entries===865,"SEO manifest mismatch");
 ensure(queue.revenue_ready===48&&queue.awaiting_source===382,"queue count mismatch");
 console.log("CTA_WAVE11_PROMOTION_PASS="+JSON.stringify({ids:results.map(x=>x.id),hashes:results.map(x=>[x.id,x.sha1]),pub,seo,queue}));
}
main().catch(e=>{console.error(e.stack);process.exitCode=1});
