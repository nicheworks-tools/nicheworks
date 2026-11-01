import assert from "node:assert/strict";
import fs from "node:fs";
const root = new URL("../", import.meta.url);
const html = fs.readFileSync(new URL("index.html", root), "utf8");
const app = fs.readFileSync(new URL("app.js", root), "utf8");
const css = fs.readFileSync(new URL("style.css", root), "utf8");
const cfg = fs.readFileSync(new URL("affiliate-config.js", root), "utf8");

const matches = [...html.matchAll(/name="handoffReady" value="([^"]+)"/g)].map(match => match[1]);
assert.equal(matches.length, 5);
assert.equal(new Set(matches).size, 5);
assert.ok(["keys", "papers", "photos", "notes", "protection"].every(key => matches.includes(key)));

const guide = html.indexOf('aria-label="退去立会いの持ち物確認"');
const shop = html.indexOf('id="nwAmazonAffiliate"');
const faq = html.indexOf('<section class="faq"');
assert.ok(guide > -1 && shop > guide && faq > shop,
  "fixed accessory links must follow general handoff guidance, before FAQ");
assert.equal(html.split('id="nwAmazonAffiliate"').length - 1, 1);
assert.ok(html.includes("端末に保存されず"), "the optional prep list must not imply persistence");
assert.ok(html.includes("退去手続きの完了を表しません"), "must not claim legal completion");
assert.ok(html.includes("契約書と指定された案内を優先"), "must prioritize contract guidance");
assert.ok(html.includes("新たな購入が不要な場合"), "must support not buying");
assert.ok(css.includes("@media print { .handoff-ready"), "supplementary shopping guide excluded from print");
assert.ok(!app.includes("handoffReady"), "optional supplies checks must not affect canonical checklist state");
assert.ok(cfg.includes('trackingId: TRACKING_ID') && cfg.includes('"nicheworks09-22"'),
  "retain existing validated Amazon tracking");
assert.ok(cfg.includes('enabled: true'));
console.log("PASS: final handoff essentials and separate fixed-supply affiliate path");
