import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('tools/phone-quickcheck/models/index.html','utf8');
const script=fs.readFileSync('tools/phone-quickcheck/models/model-index.js','utf8');
assert.equal((html.match(/data-phone-id=/g)||[]).length,250,'All 250 rows must remain static and crawlable');
assert.ok(html.includes('<input id="modelSearch" type="search"'));
assert.ok(html.includes('id="modelSearchCount"'));
assert.ok(html.includes('<script src="./model-index.js" defer></script>'));
assert.ok(html.includes('tbody tr[hidden],main section[hidden]'));

function item(name){
  const handlers={};
  const a={textContent:name,addEventListener:(event,cb)=>{handlers[event]=cb},click:()=>handlers.click?.()};
  return {hidden:false,querySelector:(sel)=>sel==='th a'?a:null,anchor:a};
}
function section(maker,models){
  const rows=models.map(item);
  return {id:'maker-'+maker,hidden:false,rows,querySelectorAll:()=>rows};
}
const groups=[
  section('apple',['iPhone 17 Pro','iPhone 17 Pro Max','iPhone Air']),
  section('google',['Pixel 8 Pro','Pixel 10a']),
  section('oppo',['OPPO Find X9'])
];
const input={value:'',listeners:{},addEventListener(event,cb){this.listeners[event]=cb}};
const counter={textContent:''};
const events=[];
const doc={
  readyState:'complete',
  getElementById:id=>id==='modelSearch'?input:id==='modelSearchCount'?counter:null,
  querySelectorAll:sel=>sel==='section[id^="maker-"]'?groups:[]
};
vm.runInNewContext(script,{document:doc,window:{gtag:(...args)=>events.push(args)}},{filename:'model-index.js'});
const apply=value=>{input.value=value;input.listeners.input();return groups.reduce((a,g)=>a+g.rows.filter(r=>!r.hidden).length,0)};
assert.equal(counter.textContent,'6 / 6機種を表示');
assert.equal(apply('Google Pixel 8 Pro'),1);
assert.equal(groups[1].hidden,false);
assert.equal(groups[0].hidden,true);
assert.equal(apply('ｉＰｈｏｎｅ １７ Ｐｒｏ'),2,'NFKC full-width input must match');
assert.equal(apply('OPPO'),1);
assert.equal(apply('not-a-model'),0);
assert.ok(counter.textContent.includes('該当する機種がありません'));
assert.equal(apply(''),6);
groups[1].rows[0].anchor.click();
assert.equal(events.length,1);
const [command,event,payload]=events[0];
assert.equal(command,'event');
assert.equal(event,'phone_index_model_click');
assert.equal(payload.tool_slug,'phone-quickcheck');
assert.equal(payload.maker_bucket,'google');
assert.equal(payload.placement,'static_model_index');
assert.deepEqual(Object.keys(payload).sort(),['maker_bucket','placement','tool_slug']);
assert.equal(JSON.stringify(payload).includes('Pixel'),false,'No model or search string must enter GA4');
console.log('Phone QuickCheck model index PASS: 250 pre-rendered entries, local NFKC search, accessible count, maker-only click analytics.');
