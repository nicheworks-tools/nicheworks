import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync('assets/okj-workspace-store.js','utf8');
const memory=new Map();
const storage={
  getItem:key=>memory.get(key)||null,
  setItem:(key,value)=>memory.set(key,value),
  removeItem:key=>memory.delete(key)
};
const ctx=vm.createContext({window:{localStorage:storage}});
vm.runInContext(source,ctx);
const work=ctx.window.OldKanjiWorkspaceStore;
const gate={active:true,productId:'okj.toolkit_pro',featureId:'okj.workspaces'};
const wrong={active:true,productId:'okj.toolkit_pro',featureId:'okj.history'};
assert.equal(work.list(wrong).error,'pro_required');
assert.equal(work.create('無断作業',wrong).error,'pro_required');
assert.equal(memory.size,0);
assert.equal(work.create('',gate).error,'invalid_name');
assert.equal(work.create('長'.repeat(81),gate).error,'invalid_name');
const created=work.create('古文書調査・第一巻',gate);
assert.equal(created.ok,true);
const wid=created.workspace.id;
const oldText='  舊\n學  ';
assert.equal(work.addEntry(wid,{sourceTool:'old-kanji-ocr-scanner',text:oldText,label:'原本A'},wrong).error,'pro_required');
assert.equal(work.addEntry(wid,{sourceTool:'old-kanji-ocr-scanner',text:oldText,label:'原本A'},gate).ok,true);
assert.equal(work.addEntry(wid,{sourceTool:'name-old-kanji-checker',text:'齋藤',label:'名簿'},gate).ok,true);
assert.equal(work.addEntry(wid,{sourceTool:'fake-tool',text:'test'},gate).error,'invalid_source_tool');
assert.equal(work.addEntry(wid,{sourceTool:'unicode-kanji-checker',text:'x'.repeat(30001)},gate).error,'invalid_text');
const list=work.list(gate);
assert.equal(list.workspaces.length,1);
assert.equal(list.workspaces[0].entries.length,2);
assert.equal(list.workspaces[0].entries[1].text,oldText);
const markdown=work.exportWorkspace(wid,'markdown',gate);
assert.equal(markdown.ok,true);
assert.ok(markdown.content.includes(oldText));
assert.ok(markdown.content.includes('齋藤'));
assert.equal(work.exportWorkspace(wid,'json',wrong).error,'pro_required');
const json=JSON.parse(work.exportWorkspace(wid,'json',gate).content);
assert.equal(json.entries.length,2);
assert.equal(work.removeEntry(wid,json.entries[0].id,gate).ok,true);
assert.equal(work.list(gate).workspaces[0].entries.length,1);
assert.equal(work.removeWorkspace(wid,wrong).error,'pro_required');
assert.equal(work.removeWorkspace(wid,gate).ok,true);
assert.equal(work.list(gate).workspaces.length,0);
const slugs=work.supportedTools;
assert.equal(slugs.length,8);
for(const slug of slugs){
  const html=fs.readFileSync('tools/'+slug+'/index.html','utf8');
  assert.ok(html.includes('/assets/okj-workspace-store.js'),slug+' missing store');
  assert.ok(html.includes('/assets/okj-workspace-ui.js'),slug+' missing UI');
}
const ui=fs.readFileSync('assets/okj-workspace-ui.js','utf8');
assert.ok(ui.includes("refreshProState({ productId: PRODUCT, featureId: FEATURE })"));
assert.ok(ui.includes("recheck()"));
assert.ok(ui.includes("store.addEntry("));
assert.ok(ui.includes("store.exportWorkspace("));
assert.ok(ui.includes("store.removeWorkspace("));
assert.doesNotMatch(ui,/gtag\(|amazon\.co\.jp|api\/billing\/create-checkout-session/);
console.log('Old Kanji Pro cross-tool workspace: eight-page wiring, local CRUD/export and feature-specific gates PASS');
