import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const callbacks = [];
const listeners = new Map();
const nodes = new Map();
const makeElement = () => ({
  value: "", textContent: "", src: "", disabled: false,
  naturalWidth: 100, naturalHeight: 100, style: {}, dataset: {}, files: [],
  classList: { add() {}, remove() {}, toggle() {} },
  addEventListener(type, cb) { listeners.set(this.id + "/" + type, cb); },
  removeAttribute() {}, setAttribute() {}
});
const dom = {
  documentElement: { dataset: { lang: "ja" }, lang: "ja" },
  addEventListener() {}, querySelectorAll() { return []; },
  getElementById(id) {
    if (!nodes.has(id)) nodes.set(id, { ...makeElement(), id });
    return nodes.get(id);
  },
  createElement(tag) {
    if (tag !== "canvas") return makeElement();
    return {
      width: 0, height: 0,
      getContext() {
        return { drawImage() {}, fillRect() {}, getImageData() { return { data: new Uint8Array(64*64*4).fill(255) }; } };
      },
      toBlob(cb, mime, quality) { callbacks.push({ cb, mime, quality }); }
    };
  }
};
nodes.set("format-select", { ...makeElement(), value: "image/webp", id:"format-select" });
nodes.set("quality-range", { ...makeElement(), value: "0.80", id:"quality-range" });
const urls=[];
const timers = [];
const sandbox = {
  document: dom, console,
  navigator: { language: "ja" },
  URL: { createObjectURL() { const u = "blob:test-" + (urls.length + 1); urls.push(u); return u; }, revokeObjectURL() {} },
  window: { addEventListener() {}, setTimeout(cb) { timers.push(cb); return timers.length; }, clearTimeout() {} },
  Image: class {}, FileReader: class {},
};
const ctx = vm.createContext(sandbox);
vm.runInContext(app, ctx, { filename: "tools/image-compression-inspector/app.js" });
const run = (code) => vm.runInContext(code, ctx);
const format = dom.getElementById("format-select");
const download = dom.getElementById("download-btn");

assert.equal(run('matchesRequestedOutput({type:"image/png"}, "image/webp")'), false);
assert.equal(run('matchesRequestedOutput({type:"image/webp"}, "image/webp")'), true);
assert.equal(run('matchesRequestedOutput({type:"image/jpeg"}, "image/jpeg")'), true);
assert.equal(run('matchesRequestedOutput({type:""}, "image/jpeg")'), false);

run('state.file = { name:"photo.png", size:1000 }; state.img = { naturalWidth:100, naturalHeight:80 };');
run('updateCompression()');
assert.equal(download.disabled, true, "pending output must not enable download");
timers.at(-1)();
assert.equal(callbacks.length, 1);
assert.equal(callbacks[0].mime, "image/webp");

format.value="image/jpeg";
run('updateCompression()');
assert.equal(download.disabled, true, "old format must be disabled immediately");
timers.at(-1)();
assert.equal(callbacks.length, 2);
callbacks[0].cb({type:"image/webp",size:200});
assert.equal(run('state.outputBlob'), null, "late callback must not overwrite newer setting");

callbacks[1].cb({type:"image/png",size:250});
assert.equal(run('state.outputBlob'), null, "browser PNG fallback must be rejected");
assert.equal(run('state.lastErrorKey'), "outputFormatUnsupported");
assert.equal(download.disabled, true, "unsupported fallback must never be downloadable");

run('updateCompression()'); timers.at(-1)();
callbacks[2].cb({type:"image/jpeg",size:300});
assert.equal(run('state.outputBlob.size'), 300);
assert.equal(download.disabled, false);
assert.equal(dom.getElementById("output-format").textContent, "JPEG");

run('resetTool()');
assert.equal(download.disabled, true);
assert.equal(run('state.outputBlob'), null);
run('state.file = {name:"new.png",size:1000}; state.img={naturalWidth:20,naturalHeight:20};');
run('updateCompression()'); timers.at(-1)();
run('resetTool()');
callbacks[3].cb({type:"image/jpeg",size:123});
assert.equal(run('state.outputBlob'), null, "reset must invalidate in-flight encoders");

assert.match(html, /Changing the format or quality invalidates earlier previews and downloads/);
assert.ok(app.includes('generation !== loadGeneration'), "stale FileReader and Image callbacks guarded");
assert.ok(!app.includes('fetch('), "image upload is not added");

console.log("PASS: compression MIME fallback rejection, async race handling and reset");
