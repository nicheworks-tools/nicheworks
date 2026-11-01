import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { generateStudioFiles, validateComposition, STUDIO_PRODUCT_ID, STUDIO_FEATURE_ID } from "../../../functions/api/motion-atlas/studio-core.mjs";
import { onRequestPost, onRequestGet } from "../../../functions/api/motion-atlas/studio-export.js";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const read=path=>fs.readFileSync(path,"utf8");
const client=read(root+"/studio/studio.js");
const css=read(root+"/studio/studio.css");
const en=read(root+"/studio/index.html"),ja=read(root+"/ja/studio/index.html");
new vm.Script(client,{filename:"tools/motion-atlas/studio/studio.js"});
assert.match(css,/\.track\b/);
assert.match(css,/\.studio-layer/);
for(const html of [en,ja]){
 assert.match(html,/noindex,nofollow/,"Paid Studio preview must not be indexed before approval");
 assert.match(html,/id="timeline-list"/);
 assert.match(html,/id="save-preset"/);
 assert.match(html,/id="export"/);
 assert.match(html,/studio\.js/);
 assert.doesNotMatch(html,/buy\.stripe\.com|<form[^>]+checkout|stripe\.com\/checkout/);
}
assert.match(client,/\.animate\(EFFECTS\[track\.effect\]/,"Timeline preview must use WAAPI");
assert.match(client,/localStorage\.setItem\(STORAGE/,"Browser-local preset storage required");
assert.match(client,/nicheworks:billing:session:motion_atlas\.studio_v1/);
assert.match(client,/\/api\/motion-atlas\/studio-export/);
assert.doesNotMatch(client,/function generateStudioFiles|@keyframes nwStudio_/,"Paid generator must remain on server");

const base={text:"Motion",tracks:[
 {effect:"fade-up",delay:0,duration:750,easing:"ease-out"},
 {effect:"overshoot",delay:320,duration:720,easing:"ease-in-out"}
]};
assert.equal(STUDIO_PRODUCT_ID,"motion_atlas.studio_v1");
assert.equal(STUDIO_FEATURE_ID,"motionAtlas.studioExport");
assert.equal(validateComposition(base).tracks.length,2);
const generated=generateStudioFiles(base);
assert.equal(generated.files.length,3);
assert.equal(generated.totalDuration,1040);
const cssOut=generated.files.find(file=>file.name==="MotionStudio.css").content;
const reactOut=generated.files.find(file=>file.name==="MotionStudioSequence.jsx").content;
assert.match(cssOut,/@keyframes nwStudio_0/);
assert.match(cssOut,/@keyframes nwStudio_1/);
assert.match(cssOut,/prefers-reduced-motion:reduce/);
assert.match(reactOut,/nw-studio-layer-0/);
assert.match(reactOut,/nw-studio-layer-1/);
assert.match(reactOut,/\"Motion\"/);
for(const [invalid,expected] of [
 [{...base,text:""}, "invalid_text"],
 [{...base,text:"<script>alert(1)</script>\n"}, "invalid_text"],
 [{...base,tracks:[]}, "invalid_tracks"],
 [{...base,tracks:Array(9).fill(base.tracks[0])}, "invalid_tracks"],
 [{...base,tracks:[{...base.tracks[0],effect:"random"}]}, "unsupported_effect"],
 [{...base,tracks:[{...base.tracks[0],effect:"x; color:red"}]}, "unsupported_effect"],
 [{...base,tracks:[{...base.tracks[0],delay:-1}]}, "invalid_delay"],
 [{...base,tracks:[{...base.tracks[0],duration:100000}]}, "invalid_duration"],
 [{...base,tracks:[{...base.tracks[0],easing:"steps(1,end);color:red"}]}, "invalid_easing"],
 [{...base,tracks:[{...base.tracks[0],delay:12000,duration:5000}]}, "timeline_too_long"]
])assert.throws(()=>generateStudioFiles(invalid),new RegExp(expected));

const url="https://nicheworks.app/api/motion-atlas/studio-export";
const sessionId="cs_test_exampleABC123";
function request(composition=base,session=sessionId,origin="https://nicheworks.app"){
 return new Request(url,{method:"POST",headers:{"content-type":"application/json","origin":origin},body:JSON.stringify({sessionId:session,composition})});
}
function fakeDb(row){
 return {BILLING_DB:{prepare(query){
  assert.match(query,/stripe_checkout_session_id = \?/);
  return {bind(session,product){
   assert.equal(product,STUDIO_PRODUCT_ID);
   assert.equal(session,sessionId);
   return {first:async()=>row};
  }};
 }}};
}
const activeRow={entitlement_id:"ent_testing",product_id:STUDIO_PRODUCT_ID,status:"active",
 source:"stripe_webhook",features_json:JSON.stringify([STUDIO_FEATURE_ID])};
const ok=await onRequestPost({request:request(),env:fakeDb(activeRow)});
assert.equal(ok.status,200);
assert.equal(ok.headers.get("cache-control"),"no-store");
const output=await ok.json();
assert.equal(output.ok,true);
assert.equal(output.files.length,3);
assert.ok(!JSON.stringify(output).includes(sessionId),"API must not echo bearer session");
const noSession=await onRequestPost({request:request(base,""),env:fakeDb(activeRow)});
assert.equal(noSession.status,401);
const invalid=await onRequestPost({request:request({...base,tracks:[{...base.tracks[0],effect:"evil"}]}),env:fakeDb(activeRow)});
assert.equal(invalid.status,400);
const missingDb=await onRequestPost({request:request(),env:{}});
assert.equal(missingDb.status,503);
const missingFeature=await onRequestPost({request:request(),env:fakeDb({...activeRow,features_json:"[]"})});
assert.equal(missingFeature.status,403);
const revoked=await onRequestPost({request:request(),env:fakeDb(null)});
assert.equal(revoked.status,403);
const csrf=await onRequestPost({request:request(base,sessionId,"https://evil.example"),env:fakeDb(activeRow)});
assert.equal(csrf.status,403);
assert.equal((await onRequestGet()).status,405);
console.log("Motion Atlas Studio contract PASS: EN/JA preview, 2-track bundle, validation, D1-only entitlement allow/deny.");
