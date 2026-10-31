#!/usr/bin/env node
// Verified local source and WebP staging only. Never modifies formal image registries.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const intake=JSON.parse(await fs.readFile(path.join(ROOT,"data","affiliate-image-acquisition-wave9-v2.3.json"),"utf8"));
if(intake.schema!=="cta-affiliate-image-acquisition-wave9-v2.3")throw Error("Wave9 source schema mismatch");
const items=intake.source_leads||[],seen=new Set();
if(!items.length)throw Error("No pinned Wave9 leads");
for(const item of items){
 if(!/^[a-z0-9_]+$/.test(item.entry_id)||seen.has(item.entry_id)||!intake.first_wave_ids.includes(item.entry_id))throw Error("Invalid or duplicate Wave9 canonical ID");
 seen.add(item.entry_id);
 if(!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(item.source_url)||item.promotion_allowed!==false||!/^[0-9a-f]{40}$/.test(item.expected_sha1)||!["sha1_verified_raster_derivatives_visually_reviewed","sha1_verified_but_visual_tool_focus_rejected"].includes(item.binary_review))throw Error("Wave9 source has invalid provenance or premature promotion: "+item.entry_id);
}
if(!process.argv.includes("--stage")){
 console.log("Wave9 source preflight: PASS "+JSON.stringify({source_leads:items.length,formally_promoted:0}));
 process.exit(0);
}
const imageMagick=["magick","convert"].find(name=>spawnSync(name,["-version"],{stdio:"ignore"}).status===0);
if(!imageMagick)throw Error("ImageMagick is required for stage mode");
const outDir=process.env.CTA_WAVE9_STAGING_DIR?path.resolve(process.env.CTA_WAVE9_STAGING_DIR):await fs.mkdtemp(path.join(os.tmpdir(),"cta-wave9-"));
const report={schema:"cta-image-wave9-staging-report-v2.3",promoted:false,items:[]};
for(const item of items){
 const response=await fetch(item.source_url,{redirect:"follow",headers:{"user-agent":"NicheWorks-Construction-Atlas/2.3 (+https://nicheworks.app/)","accept":"image/jpeg,image/png"}});
 if(!response.ok)throw Error(item.entry_id+": HTTP "+response.status);
 const mime=response.headers.get("content-type")||"";
 if(!/^image\/(jpeg|png)/i.test(mime))throw Error(item.entry_id+": unexpected MIME "+mime);
 const announced=Number(response.headers.get("content-length")||0);
 if(announced>25*1024*1024)throw Error(item.entry_id+": source over size limit");
 const bytes=Buffer.from(await response.arrayBuffer());
 if(!bytes.length||bytes.length>25*1024*1024)throw Error(item.entry_id+": invalid source size");
 const sha1=createHash("sha1").update(bytes).digest("hex");
 const params=new URLSearchParams({action:"query",format:"json",prop:"imageinfo",iiprop:"sha1|url|size",titles:"File:"+item.commons_filename});
 const api=await fetch("https://commons.wikimedia.org/w/api.php?"+params.toString(),{headers:{"user-agent":"NicheWorks-Construction-Atlas/2.3 (+https://nicheworks.app/)","accept":"application/json"}});
 if(!api.ok)throw Error(item.entry_id+": Commons API HTTP "+api.status);
 const json=await api.json();
 const page=Object.values(json.query?.pages||{})[0];
 const info=page?.imageinfo?.[0];
 const apiUrl=info?.url?new URL(info.url):null;
 const expectedUrl=new URL(item.source_url);
 const allowedTracking=new Set(["utm_source","utm_campaign","utm_content"]);
 const knownTracking=apiUrl && [...apiUrl.searchParams.keys()].every(key=>allowedTracking.has(key));
 if(sha1!==item.expected_sha1||!info||info.sha1!==sha1||!apiUrl||apiUrl.origin!==expectedUrl.origin||apiUrl.pathname!==expectedUrl.pathname||!knownTracking||apiUrl.hash)
   throw Error(item.entry_id+": Commons API SHA1/URL integrity mismatch "+JSON.stringify({api_sha1:info?.sha1,local_sha1:sha1,api_url:info?.url,declared_url:item.source_url}));

 console.log("WAVE9_VERIFIED_SOURCE="+JSON.stringify({entry_id:item.entry_id,sha1,source_url:item.source_url,size:bytes.length}));
 const folder=path.join(outDir,item.entry_id);await fs.mkdir(folder,{recursive:true});
 const source=path.join(folder,item.source_filename);await fs.writeFile(source,bytes);
 const derivatives=[["primary.webp","960x720>","82"],["thumb.webp","320x240>","78"]];
 for(const [name,geometry,quality] of derivatives){
  const target=path.join(folder,name);
  const run=spawnSync(imageMagick,[source,"-auto-orient","-colorspace","sRGB","-strip","-resize",geometry,"-quality",quality,"-define","webp:method=6",target],{encoding:"utf8"});
  if(run.status!==0)throw Error(item.entry_id+": conversion failed "+(run.stderr||run.stdout||""));
  if(!(await fs.stat(target)).size)throw Error(item.entry_id+": derivative empty");
 }
 report.items.push({entry_id:item.entry_id,source_sha1:sha1,license:item.license,source_page:item.source_page,source_bytes:bytes.length,primary_bytes:(await fs.stat(path.join(folder,"primary.webp"))).size,thumb_bytes:(await fs.stat(path.join(folder,"thumb.webp"))).size,promoted:false});
}
await fs.writeFile(path.join(outDir,"staging-report.json"),JSON.stringify(report,null,2)+"\n");
console.log("Wave9 staged (NOT published): "+JSON.stringify({output_dir:outDir,verified:report.items.length,promoted:false}));
