import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {runInNewContext} from 'node:vm';

const root=new URL('../../',import.meta.url);
const html=await readFile(new URL('tools/rename-wizard/index.html',root),'utf8');
const css=await readFile(new URL('tools/rename-wizard/style.css',root),'utf8');
const js=await readFile(new URL('tools/rename-wizard/app.js',root),'utf8');
assert.match(html,/<input id="fileInput" type="file" multiple/);
assert.match(html,/id="selectedFileNames"/);
assert.match(html,/id="selectedFileCount"/);
assert.doesNotMatch(html,/id="fileSelectButton"/);
assert.match(css,/\.file-input\s*\{\s*display:\s*block/);
assert.match(css,/\.file-input\.has-appended-files\s*\{[^}]*font-size:\s*0;/s);
assert.doesNotMatch(js,/fileInput\.files\s*=/);

const all=new Map();
function el(id='node'){
  const handlers=new Map(),cls=new Set();
  return {id,value:'',textContent:'',innerHTML:'',checked:true,disabled:false,style:{},children:[],attributes:{},
    addEventListener(name,fn){if(!handlers.has(name))handlers.set(name,[]);handlers.get(name).push(fn);},
    dispatch(name,props={}){const event={target:this,preventDefault(){this.prevented=true},stopPropagation(){this.stopped=true},...props};for(const fn of handlers.get(name)||[])fn(event);return event;},
    appendChild(node){this.children.push(node);return node},remove(){},replaceChildren(...nodes){this.children=nodes},
    setAttribute(name,value){this.attributes[name]=value},
    click(){throw Error('Unexpected programmatic click')},
    classList:{add(name){cls.add(name)},remove(name){cls.delete(name)},contains(name){return cls.has(name)}}
  };
}
let mockFileList=[];
const get=id=>{if(!all.has(id))all.set(id,el(id));return all.get(id);};
const fileInput=get('fileInput');
Object.defineProperty(fileInput,'files',{get(){return mockFileList},set(){throw Error('FileList setter blocked')}});
const document={documentElement:{lang:'ja'},getElementById:get,createElement:tag=>el(tag),body:{appendChild(){}}};
runInNewContext(js,{document,Date,Blob,URL,navigator:{clipboard:null},setTimeout,clearTimeout,console,Promise});
assert.equal(get('selectedFileCount').textContent,'0件');
assert.equal(fileInput.classList.contains('has-appended-files'),false);
assert.equal(fileInput.attributes['aria-label'],'ファイルを選択（複数可）');
mockFileList=[{name:'請求書 2026.PDF'}];
fileInput.dispatch('change');
assert.match(get('summaryBox').textContent,/1件/);
assert.equal(get('selectedFileCount').textContent,'1件');
assert.equal(fileInput.classList.contains('has-appended-files'),true);
assert.match(fileInput.attributes['aria-label'],/現在1件追加済み/);
assert.match(get('selectedFileNames').children[0].children[0].textContent,/請求書/);
assert.equal(fileInput.value,'');
mockFileList=[{name:'写真 001.JPG'}];
fileInput.dispatch('change');
assert.equal(get('selectedFileCount').textContent,'2件');
assert.match(get('selectedFileNames').children[0].children[0].textContent,/請求書/);
assert.match(get('selectedFileNames').children[1].children[0].textContent,/写真/);
get('runButton').dispatch('click');
assert.match(get('summaryBox').textContent,/変更あり/);
const drop=get('dropzone').dispatch('drop',{dataTransfer:{files:[{name:'Dropped 001.JPG'}]}});
assert.equal(drop.prevented,true);
assert.equal(drop.stopped,true);
assert.equal(get('selectedFileCount').textContent,'3件');
assert.match(get('fileSelectionStatus').textContent,/ドロップ/);
get('selectedFileNames').children[1].children[1].dispatch('click');
assert.equal(get('selectedFileCount').textContent,'2件');
assert.match(get('selectedFileNames').children[1].children[0].textContent,/Dropped/);
mockFileList=[{name:'Same file.txt'}];
fileInput.dispatch('change');
fileInput.dispatch('change');
assert.equal(get('selectedFileCount').textContent,'4件');
assert.match(get('fileSelectionStatus').textContent,/合計4件/);
mockFileList=Array.from({length:500},(_,i)=>({name:'test-'+i+'.txt'}));
fileInput.dispatch('change');
assert.equal(get('selectedFileCount').textContent,'4件');
assert.match(get('fileSelectionStatus').textContent,/500件まで/);
get('clearButton').dispatch('click');
assert.match(get('summaryBox').textContent,/0件/);
assert.equal(get('selectedFileCount').textContent,'0件');
assert.equal(fileInput.classList.contains('has-appended-files'),false);
assert.equal(fileInput.attributes['aria-label'],'ファイルを選択（複数可）');
assert.equal(get('selectedFileNames').children.length,1);
get('namesInput').value='x.txt\ny.jpg';
get('loadNamesButton').dispatch('click');
assert.equal(get('selectedFileCount').textContent,'2件');
assert.equal(fileInput.classList.contains('has-appended-files'),true);
assert.match(get('selectedFileNames').children[1].children[0].textContent,/y.jpg/);
console.log('RENAME_APPEND_SELECTION_SMOKE_OK: repeated picker, drop append, names shown, removal, reset, limit, paste');
