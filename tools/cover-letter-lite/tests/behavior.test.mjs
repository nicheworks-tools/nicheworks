import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const events={},els={},pending=[];
const get=id=>els[id]??=( {
 value:"",textContent:"",disabled:false,style:{},dataset:{},
 addEventListener(kind,fn){events[id+"/"+kind]=fn},
 focus(){},select(){},setAttribute(){}
});
let ready;
const doc={
 getElementById:get,querySelectorAll:()=>[],querySelector:()=>null,
 addEventListener(_kind,fn){ready=fn},body:{appendChild(){},removeChild(){}},
 createElement:get
};
vm.runInNewContext(source,{
 document:doc,navigator:{},
 window:{setTimeout(){},clearTimeout(){}},
 fetch(url){return new Promise(resolve=>pending.push({url,resolve}))},
 console
});
ready();
const submit=()=>events["cover-form/submit"]({preventDefault(){}});
const edit=()=>events["cover-form/input"]();
const template="Dear Hiring Manager,\n\nI apply for [JOB_TITLE] at [COMPANY] with [SKILLS].\n\nSincerely,\n[YOUR_NAME]";
const finish=()=>pending.shift().resolve({ok:true,text:async()=>template});
get("applicant").value="A";
get("company").value="Old";
get("position").value="Role";
get("template-style").value="formal";
const first=submit();
get("company").value="New";edit();
finish();await first;
assert.equal(get("result-text").textContent,"");
assert.equal(get("generate-btn").disabled,false);
const second=submit();finish();await second;
assert.match(get("result-text").textContent,/New/);
assert.doesNotMatch(get("result-text").textContent,/Old/);
assert.equal(get("generate-btn").disabled,false);
assert.match(source,/revision !== draftRevision/);
console.log("PASS: cover-letter template race");
