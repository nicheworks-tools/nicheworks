#!/usr/bin/env node
"use strict";
// Remove two rejected Wave13 source photos without altering the eight accepted original bytes.
const fs=require("node:fs"),path=require("node:path"),{spawnSync}=require("node:child_process");
const ROOT=path.resolve(__dirname,".."),DATA=path.join(ROOT,"data"),IMG=path.join(ROOT,"images");
const BAD=["crimping_tool","pvc_pipe"],NEW="2026-11-06-reviewed-image-wave13-eight-1",OLD="2026-11-06-reviewed-image-wave13-ten-1";
const read=n=>JSON.parse(fs.readFileSync(path.join(DATA,n),"utf8"));
const write=(n,o)=>fs.writeFileSync(path.join(DATA,n),JSON.stringify(o,null,2)+"\n");
const ok=(v,msg)=>{if(!v)throw Error("Wave13 correction: "+msg)};
function run(script,...args){let p=spawnSync(process.execPath,[path.join(ROOT,"scripts",script),...args],{encoding:"utf8",maxBuffer:32*1024*1024});ok(p.status===0,script+": "+(p.stderr||p.stdout||p.error?.message||""));console.log(script+": PASS");}
function main(){
 const reg=read("image-registry-v2.3.json"),life=read("image-lifecycle-v2.3.json"),intake=read("affiliate-image-acquisition-wave6-v2.3.json"),ledger=read("image-wave13-sources-v2.3.json");
 ok(reg.version===OLD&&reg.items.length===74,"expected ten-photo base registry absent");
 ok(life.version===OLD&&intake.version===OLD&&ledger.version===OLD,"base versions changed");
 ok(ledger.items.length===10,"expected ten-source ledger absent");
 for(const id of BAD){
   ok(reg.items.some(x=>x.entry_id===id),"missing rejected registry item "+id);
   ok(ledger.items.some(x=>x.entry_id===id),"missing rejected source "+id);
   let row=life.items.find(x=>x.entry_id===id);
   ok(row&&row.history.at(-1)?.state==="promoted",id+" unexpected lifecycle");
   ok(row.history.some(x=>x.candidate_id==="wave13:"+id),id+" candidate evidence missing");
   row.history=row.history.filter(x=>x.candidate_id!=="wave13:"+id);
   ok(row.history.at(-1)?.state==="awaiting_source",id+" not restored to awaiting_source");
   ok(life.candidates.some(x=>x.id==="wave13:"+id),id+" lifecycle candidate absent");
   const imageFolder=path.join(IMG,id),article=path.join(ROOT,"entries",id,"index.html");
   ok(fs.existsSync(imageFolder)&&fs.existsSync(article),id+" publication files missing");
   fs.rmSync(imageFolder,{recursive:true});fs.rmSync(path.dirname(article),{recursive:true});
 }
 reg.items=reg.items.filter(x=>!BAD.includes(x.entry_id));reg.version=NEW;write("image-registry-v2.3.json",reg);
 life.candidates=life.candidates.filter(x=>!BAD.some(id=>x.id==="wave13:"+id));life.version=NEW;write("image-lifecycle-v2.3.json",life);
 ledger.items=ledger.items.filter(x=>!BAD.includes(x.entry_id));ledger.version=NEW;
 ledger.policy.promotion_rule=ledger.policy.promotion_rule.replace(/ten|Ten/g,"eight");
 write("image-wave13-sources-v2.3.json",ledger);
 intake.first_wave_ids=intake.first_wave_ids.filter(x=>!BAD.includes(x));
 intake.review_decisions=intake.review_decisions.filter(x=>!BAD.includes(x.entry_id));
 intake.expected.revenue_ready=63;intake.expected.awaiting_source=367;intake.version=NEW;
 write("affiliate-image-acquisition-wave6-v2.3.json",intake);
 let a=fs.readFileSync(path.join(IMG,"ATTRIBUTION.md"),"utf8");
 for(const id of BAD){let lines=a.split("\n");let kept=lines.filter(x=>!x.startsWith("| `"+id+"` |"));ok(lines.length===kept.length+1,"attribution record not unique "+id);a=kept.join("\n");}
 ok(a.includes(OLD),"attribution ledger version absent");a=a.replace(OLD,NEW);fs.writeFileSync(path.join(IMG,"ATTRIBUTION.md"),a);
 const hotfix=path.join(ROOT,"detail-image-hotfix.js");let h=fs.readFileSync(hotfix,"utf8");
 ok(h.includes(OLD),"runtime image version absent");fs.writeFileSync(hotfix,h.replace(OLD,NEW));
 for(const [script,args] of [
  ["audit-image-inventory-v2.3.cjs",["--write"]],
  ["audit-public-image-inventory-v2.3.cjs",["--write"]],
  ["build-affiliate-image-acquisition-queue-v2.3.cjs",["--write"]],
  ["build-seo-detail-pages-v2.3.cjs",[]],
  ["check-image-registry-v2.3.cjs",[]],
  ["check-image-attribution-v2.3.cjs",[]],
  ["check-image-lifecycle-v2.3.cjs",[]],
  ["build-seo-detail-pages-v2.3.cjs",["--check"]]
 ])run(script,...args);
 const s=read("seo-detail-pages-v2.3.json").summary,q=read("affiliate-image-acquisition-queue-v2.3.json").summary,p=read("public-image-inventory-v2.3.json").summary;
 ok(s.published_static_detail_pages===63&&s.public_runtime_entries===865,"unexpected SEO counts");
 ok(p.formal_image_entries===72&&p.missing_formal_image_entries===748,"unexpected image counts");
 ok(q.revenue_ready===63&&q.awaiting_source===367,"unexpected affiliate counts");
 for(const id of BAD)ok(!fs.existsSync(path.join(ROOT,"entries",id))&&!fs.existsSync(path.join(IMG,id)),id+" still published");
 console.log("CTA_WAVE13_EIGHT_CORRECTION_PASS="+JSON.stringify({promoted:8,rejected:BAD,public:p,seo:s,queue:q}));
}
main();
