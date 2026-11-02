import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const source=fs.readFileSync(new URL("../app.js",import.meta.url),"utf8");
const start=source.indexOf("  function csvEscape(value) {");
const end=source.indexOf("\n  function rowToExport(",start);
assert.ok(start>=0 && end>start);
const csvEscape=vm.runInNewContext(source.slice(start,end)+"\n csvEscape;");
for(const value of ["=SUM(A1:A3)","+SUM(A1)","@SUM(A1)","-SUM(A1)","  =1+1"]){
 const formatted=csvEscape(value);
 assert.ok(formatted.startsWith("'"),JSON.stringify(value));
}
assert.equal(csvEscape("-"),"-");
assert.equal(csvEscape("-10"),"-10");
assert.equal(csvEscape("192.0.2.1"),"192.0.2.1");
assert.equal(csvEscape("200"),"200");
assert.equal(csvEscape("one,two"),'"one,two"');
assert.equal(csvEscape('say "hello"'),'"say ""hello"""');
assert.ok(source.includes("cols.map((col) => csvEscape(out[col]))"));
console.log("PASS: spreadsheet-safe CSV fields and ordinary log values");
