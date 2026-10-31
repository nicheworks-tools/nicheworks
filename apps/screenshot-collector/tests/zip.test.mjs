import {readFileSync} from "node:fs";
import {test} from "node:test";
import assert from "node:assert/strict";
const src=readFileSync(new URL("../extension/zip.js",import.meta.url),"utf8");
const {createZip}=await import("data:text/javascript;base64,"+Buffer.from(src).toString("base64"));
test("ZIP contains local header, central directory and EOCD",async()=>{
 const zip=createZip([{name:"manifest.json",data:'{"ok":true}'},{name:"page-001.png",data:new Uint8Array([137,80,78,71])}]);
 const bytes=new Uint8Array(await zip.arrayBuffer()),view=new DataView(bytes.buffer);
 assert.equal(view.getUint32(0,true),0x04034b50);
 assert.equal(view.getUint32(bytes.length-22,true),0x06054b50);
 assert.equal(view.getUint16(bytes.length-12,true),2);
});
test("ZIP rejects path traversal",()=>assert.throws(()=>createZip([{name:"../oops",data:"x"}]),/Unsafe/));
