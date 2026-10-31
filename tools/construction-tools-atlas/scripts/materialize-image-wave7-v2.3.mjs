#!/usr/bin/env node
// Verified local source and WebP staging only. Never modifies formal image registries.
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const intake=JSON.parse(await fs.readFile(path.join(ROOT,"data","affiliate-image-acquisition-wave7-v2.3.json"),"utf8"));
if(intake.schema!=="cta-affiliate-image-acquisition-wave7-v2.3")throw Error("Wave7 source schema mismatch");
const items=intake.source_leads||[],seen=new Set();
if(!items.length)throw Error("No pinned Wave7 leads");
for(const item of items){
 if(!/^[a-z0-9_]+$/.test(item.entry_id)||seen.has(item.entry_id)||!intake.first_wave_ids.includes(item.entry_id))throw Error("Invalid or duplicate Wave7 canonical ID");
 seen.add(item.entry_id);
 if(!/^https:\/\/upload\.wikimedia\.org\/wikipedia\/commons\//.test(item.source_url)||!/^[0-9a-f]{40}$/.test(item.expected_sha1)||item.promotion_allowed!==false||item.binary_review!=="pending_download_sha1_webp_quality_review")throw Error("Source is unpinned or wrongly promoted: "+item.entry_id);
}
if(!process.argv.includes("--stage")){
 console.log("Wave7 source preflight: PASS "+JSON.stringify({source_leads:items.length,formally_promoted:0}));
 process.exit(0);
}
const imageMagick=["magick","convert"].find(name=>spawnSync(name,["-version"],{stdio:"ignore"}).status===0);
if(!imageMagick)throw Error("ImageMagick is required for stage mode");
const outDir=process.env.CTA_WAVE7_STAGING_DIR?path.resolve(process.env.CTA_WAVE7_STAGING_DIR):await fs.mkdtemp(path.join(os.tmpdir(),"cta-wave7-"));
const report={schema:"cta-image-wave7-staging-report-v2.3",promoted:false,items:[]};
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
 if(sha1!==item.expected_sha1)throw Error(item.entry_id+": SHA-1 pin mismatch "+sha1);
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
console.log("Wave7 staged (NOT published): "+JSON.stringify({output_dir:outDir,verified:report.items.length,promoted:false}));
