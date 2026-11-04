import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const origin=process.argv[2]||"http://127.0.0.1:8877";
const base=origin.replace(/\/$/,"")+"/tools/bichiku-check/";
const locales=[["ja",""],["en","en/"],["zh-CN","zh-cn/"],["vi","vi/"]];
const widths=[320,360,375,390,414,768,1280];
const folder="bichiku-smoke-artifacts";
fs.mkdirSync(folder,{recursive:true});
const browser=await chromium.launch({headless:true});
let passed=0;
async function open(width,slug=""){
 const ctx=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:1});
 const page=await ctx.newPage(),exceptions=[];
 page.on("pageerror",e=>exceptions.push(e.message));
 await page.route("**/*",route=>route.request().url().startsWith(origin)?route.continue():route.abort());
 await page.goto(base+slug,{waitUntil:"domcontentloaded",timeout:25000});
 await page.locator("#calculate").waitFor({timeout:10000});
 return {ctx,page,exceptions};
}
async function noOverflow(page,context){
 const m=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));
 assert.ok(m.scroll<=m.width+1,"horizontal overflow in "+context+": "+JSON.stringify(m));
}
try{
 for(const width of widths){
  const {ctx,page,exceptions}=await open(width);
  assert.equal(await page.locator("body").getAttribute("data-stage"),"setup");
  await noOverflow(page,"setup "+width);
  await page.locator("#calculate").click();
  await page.locator(".g-goal").first().waitFor();
  assert.equal(await page.locator(".g-goal").count(),7,"seven goal cards");
  assert.equal(await page.locator("body").getAttribute("data-stage"),"results");
  await noOverflow(page,"results "+width);
  const boxes=await page.evaluate(()=>({
   setup:document.querySelector("#setup").getBoundingClientRect().toJSON(),
   result:document.querySelector("#results").getBoundingClientRect().toJSON()
  }));
  if(width>=769)assert.ok(boxes.result.x>=boxes.setup.x+boxes.setup.width-1,"desktop must be side by side");
  else {assert.equal(await page.locator("#setup").isVisible(),false,"mobile should show one stage at a time");assert.equal(await page.locator("#results").isVisible(),true);const overflow=await page.locator("#results").evaluate(el=>getComputedStyle(el).overflowY);assert.notEqual(overflow,"auto","no nested result scrollbar");}
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator("body").getAttribute("data-stage"),"detail");
  assert.ok(await page.locator("details.g-option").count()>=1);
  await page.locator('details.g-option[data-option="alphaRice"] summary').click();
  assert.ok(await page.locator('input[data-option-qty="alphaRice"]').count());
  await noOverflow(page,"food detail "+width);
  await page.locator("button[data-shopping]").first().click();
  assert.equal(await page.locator("body").getAttribute("data-stage"),"shopping");
  const affiliate=page.locator(".g-aff a").first();
  assert.ok(await affiliate.count(),"shopping should include missing-item Amazon links");
  assert.match(await affiliate.getAttribute("href"),/amazon\.co\.jp/);
  assert.match(await affiliate.getAttribute("href"),/tag=nicheworks09-22/);
  assert.equal(await affiliate.getAttribute("rel"),"sponsored noopener");
  assert.match(await page.locator("#affiliate-inline").innerText(),/Amazon/);
  await noOverflow(page,"shopping "+width);
  await page.screenshot({path:path.join(folder,"width-"+width+".png"),fullPage:true});
  assert.deepEqual(exceptions,[],"JS exceptions "+width);
  console.log("PASS viewport "+width+" guided flow");
  passed++;
  await ctx.close();
 }
 const {ctx,page,exceptions}=await open(390);
 await page.locator('input[data-condition="noHeat"]').check();
 await page.locator('input[data-condition="waterOut"]').check();
 await page.locator("#calculate").click();
 await page.locator('button[data-goal="food"]').click();
 await page.locator('details.g-option[data-option="alphaRice"] summary').click();
 await page.locator('input[data-option-qty="alphaRice"]').fill("3");
 await page.locator('input[data-option-qty="alphaRice"]').press("Tab");
 assert.match(await page.locator(".g-detail-status").innerText(),/21/,"no safe-water confirmation should block rice portions");
 await page.locator('input[data-setting="safeWaterConfirmed"]').check();
 await page.locator('input[data-prep-liters="alphaRice"]').fill("1");
 await page.locator('input[data-prep-liters="alphaRice"]').press("Tab");
 await page.locator('input[data-prep-confirm="alphaRice"]').check();
 assert.match(await page.locator(".g-detail-status").innerText(),/21/,"no stored water on outage");
 await page.locator("button[data-back]").click();
 await page.locator('button[data-goal="water"]').click();
 await page.locator('input[data-basic="water"]').fill("5");
 await page.locator('input[data-basic="water"]').press("Tab");
 await page.locator("button[data-back]").click();
 await page.locator('button[data-goal="food"]').click();
 assert.match(await page.locator(".g-detail-status").innerText(),/18/,"count verified water-prepared rice once water is available");
 await page.reload({waitUntil:"domcontentloaded"});
 await page.locator("#calculate").click();
 await page.locator('button[data-goal="food"]').click();
 await page.locator('details.g-option[data-option="alphaRice"] summary').click();
 assert.equal(await page.locator('input[data-option-qty="alphaRice"]').inputValue(),"3");
 assert.match(await page.locator(".g-detail-status").innerText(),/18/);
 assert.deepEqual(exceptions,[]);
 console.log("PASS conditional preparation, water allocation, and inventory persistence");
 passed++;await ctx.close();

 // Verify blackout is a real condition, not only a visual checkbox.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator('input[data-condition="powerOut"]').check();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-setting="offGridHeatConfirmed"]').count(),1);
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="packRice"] summary').click();
  await page.locator('input[data-option-qty="packRice"]').fill("3");
  await page.locator('input[data-option-qty="packRice"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"unmitigated blackout excludes heated rice");
  await page.locator('input[data-setting="offGridHeatConfirmed"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/18/,"confirmed off-grid heat qualifies three portions");
  await page.locator("button[data-shopping]").first().click();
  assert.equal(await page.locator("#g-shop-selected strong").innerText(),"8","only visible eight rows initially selected");
  await page.locator("button[data-more]").click();
  assert.ok(await page.locator(".g-shop-row").count()>8);
  assert.equal(await page.locator('input[data-shop]').nth(8).isChecked(),false,"collapsed items must begin unchecked");
  await page.locator('input[data-shop]').nth(8).check();
  assert.equal(await page.locator("#g-shop-selected strong").innerText(),"9");
  await page.locator("button[data-more]").click();
  await page.evaluate(()=>{window.print=()=>{window.__printedRows=[...document.querySelectorAll("#g-print-list li")].map(el=>el.textContent||"")}});
  await page.locator("#printList").click();
  const printed=await page.evaluate(()=>window.__printedRows);
  assert.equal(printed.length,9,"print must include all nine deliberately selected items");
  assert.ok(printed.every(x=>x.includes("—")),"printed rows must include missing-quantity separators");
  assert.deepEqual(exceptions,[]);
  console.log("PASS 390px blackout heating and explicit shopping + print selections");
  passed++;await ctx.close();
 }


 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="water2L"] summary').click();
  await page.locator('input[data-option-bottles="water2L"]').fill("3");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/15L/,"3 two-litre bottles should cover 6L of a default 21L need");
  await page.locator('input[data-option-bottles="water2L"]').fill("2.5");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  const invalidSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).variants["home:water2L"].qty);
  assert.equal(invalidSaved,6,"fractional bottle count must not overwrite persisted litres");
  await page.locator('input[data-option-bottles="water2L"]').fill("3");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  await page.locator('details.g-option[data-option="water500"] summary').click();
  await page.locator('input[data-option-bottles="water500"]').fill("4");
  await page.locator('input[data-option-bottles="water500"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/13L/,"four half-litre bottles add 2L");
  await noOverflow(page,"bottle-count editing");
  await page.locator("button[data-back]").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator(".g-food-role").count(),3);
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="tunaCan"] summary').click();
  await page.locator('input[data-option-qty="tunaCan"]').fill("2");
  await page.locator('input[data-option-qty="tunaCan"]').press("Tab");
  await page.locator('details.g-option[data-option="cannedVeg"] summary').click();
  await page.locator('input[data-option-qty="cannedVeg"]').fill("3");
  await page.locator('input[data-option-qty="cannedVeg"]').press("Tab");
  assert.match(await page.locator(".g-food-role").nth(0).innerText(),/1 種類/);
  assert.match(await page.locator('details.g-option[data-option="tunaCan"] .g-parent-fields label').first().innerText(),/主菜に使える食数/);
  assert.match(await page.locator('details.g-option[data-option="cannedVeg"] .g-parent-fields label').first().innerText(),/登録数量/);
  assert.match(await page.locator(".g-food-review").innerText(),/使用可能な主菜の登録食数: 2 食/);
  assert.match(await page.locator(".g-food-review").innerText(),/成人の参考備蓄量/);
  assert.match(await page.locator(".g-food-role").nth(1).innerText(),/1 種類/);
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"vegetables and fish should not cover the 21 default staple portions");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="water2L"] summary').click();
  assert.equal(await page.locator('input[data-option-bottles="water2L"]').inputValue(),"3");
  await page.locator('details.g-option[data-option="water500"] summary').click();
  assert.equal(await page.locator('input[data-option-bottles="water500"]').inputValue(),"4");
  assert.match(await page.locator(".g-detail-status").innerText(),/13L/);
  assert.deepEqual(exceptions,[]);
  console.log("PASS 390px water bottles, side-dish audit, no false staple credit and persistence");
  passed++;await ctx.close();
 }

 for(const [locale,dir] of locales){
  const {ctx,page,exceptions}=await open(390,dir);
  assert.equal(await page.locator("html").getAttribute("lang"),locale);
  await page.locator("#calculate").click();
  assert.equal(await page.locator(".g-goal").count(),7,locale);
  await page.locator('button[data-goal="warmth"]').click();
  assert.ok(await page.locator(".g-layers>div").count()>=2,"floor and blanket separate "+locale);
  await page.locator('button[data-tab="fallback"]').click();
  assert.ok(await page.locator('details.g-option[data-option="cardboard"]').count(),"improvised cardboard "+locale);
  await noOverflow(page,locale);
  assert.deepEqual(exceptions,[],"JS exceptions "+locale);
  await page.screenshot({path:path.join(folder,"locale-"+locale+".png"),fullPage:true});
  console.log("PASS locale "+locale);passed++;
  await ctx.close();
 }
 console.log("Bichiku guided browser smoke PASS: "+passed+" scenarios");
}finally{await browser.close()}
