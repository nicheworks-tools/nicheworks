const fs = require("node:fs");
const vm = require("node:vm");
const assert = require("node:assert/strict");
const path = require("node:path");
const source = fs.readFileSync(path.join(__dirname, "../tools/mini-game-utility/app.js"), "utf8");
const handlers = {};
const nodes = Object.fromEntries(["timerDisplay","btnStart","btnPause","btnReset","btnAdd","btnExport","btnClear","playerName","scoreValue","history"].map(id => [id, {value:"",textContent:"",addEventListener(type,fn){handlers[id+":"+type]=fn},setCustomValidity(s){this.validation=s},reportValidity(){this.reported=true}}]));
const storage = new Map();
const document = {querySelectorAll(){return []},documentElement:{},getElementById(id){return nodes[id]},addEventListener(type,fn){if(type==="DOMContentLoaded") (handlers.boot??=[]).push(fn)}};
const context = {document,window:{},navigator:{language:"en"},localStorage:{getItem(k){return storage.get(k)??null},setItem(k,v){storage.set(k,v)}},setInterval(){return 1},clearInterval(){},setTimeout,clearTimeout,Date,Blob,URL};
vm.runInNewContext(source,context);
for(const boot of handlers.boot)boot();
const add = handlers["btnAdd:click"];
nodes.playerName.value="Test";
for(const invalid of ["","   ","not a number","Infinity","1e999"]){nodes.scoreValue.value=invalid;add();assert.equal(storage.get("nw_mini_game_scores"),undefined);assert.ok(nodes.scoreValue.validation)}
nodes.scoreValue.value="0";handlers["scoreValue:input"]();add();
assert.equal(JSON.parse(storage.get("nw_mini_game_scores"))[0].score,0);
assert.equal(nodes.scoreValue.validation,"");
console.log("mini-game score validation: PASS");
