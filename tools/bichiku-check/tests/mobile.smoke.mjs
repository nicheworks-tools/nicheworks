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
 assert.match(await page.locator(".g-drinking-review").innerText(),/飲用/);
 await page.locator('input[data-drink-reserve]').fill("3");
 await page.locator('input[data-drink-reserve]').press("Tab");
 assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false);
 await page.locator('input[data-drink-confirm]').check();
 assert.match(await page.locator(".g-drinking-review").innerText(),/未配分水/);
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
  assert.equal(await page.locator('input[data-setting="offGridHeatConfirmed"]').count(),0,
   "single legacy approval must not unlock all hot food");
  assert.equal(await page.locator('input[data-heat-stock]').count(),3);
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="packRice"] summary').click();
  await page.locator('input[data-option-qty="packRice"]').fill("3");
  await page.locator('input[data-option-qty="packRice"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"blackout excludes heated rice without fuel");
  await page.locator('input[data-heat-sessions="packRice"]').fill("2");
  await page.locator('input[data-heat-sessions="packRice"]').press("Tab");
  await page.locator('input[data-heat-confirm="packRice"]').check();
  await page.locator('input[data-heat-stock="stoveCount"]').fill("1");
  await page.locator('input[data-heat-stock="stoveCount"]').press("Tab");
  await page.locator('input[data-heat-stock="gasCount"]').fill("2");
  await page.locator('input[data-heat-stock="gasCount"]').press("Tab");
  await page.locator('input[data-heat-stock="gasCapacity"]').fill("1");
  await page.locator('input[data-heat-stock="gasCapacity"]').press("Tab");
  await page.locator('input[data-heat-check="stove"]').check();
  await page.locator('input[data-heat-check="gas"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"one planned heating session cannot cover two required sessions");
  await page.locator('input[data-heat-stock="gasCount"]').fill("2.5");
  await page.locator('input[data-heat-stock="gasCount"]').press("Tab");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).stocks["home:gas"].qty),2,
   "fractional canister count is rejected");
  await page.locator('input[data-heat-stock="gasCount"]').fill("2");
  await page.locator('input[data-heat-stock="gasCount"]').press("Tab");
  await page.locator('input[data-heat-stock="gasCapacity"]').fill("2");
  await page.locator('input[data-heat-stock="gasCapacity"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"changing capacity invalidates previous fuel review");
  await page.locator('input[data-heat-check="gas"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/18/,"verified two fuel sessions qualify three rice portions");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-heat-stock="gasCapacity"]').inputValue(),"2");
  assert.match(await page.locator(".g-detail-status").innerText(),/18/,"fuel-budget state persists locally");
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

 // Previously saved litre quantities must not become invalid fractional bottle counts.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({mode:"home",adults:1,days:7,stocks:{},variants:{"home:water2L":{qty:1}}})));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="water2L"] summary').click();
  assert.equal(await page.locator('input[data-option-bottles="water2L"]').inputValue(),"","unmatched saved litres are not shown as fractional bottles");
  assert.match(await page.locator('details.g-option[data-option="water2L"]').innerText(),/1L/);
  assert.match(await page.locator(".g-detail-status").innerText(),/20L/,"original 1L remains credited");
  await page.locator('input[data-option-bottles="water2L"]').fill("2");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).variants["home:water2L"].qty),4);
  assert.match(await page.locator(".g-detail-status").innerText(),/17L/);
  assert.deepEqual(exceptions,[]);
  console.log("PASS unmatched legacy water litres and integer bottle replacement");
  passed++;await ctx.close();
 }

 // Toilet components require separately measured bag/absorbent counts and safe handling.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="toilet"]').click();
  await page.locator('details.g-option[data-option="toiletBags"] summary').click();
  await page.locator('input[data-toilet-component="bagQty"]').fill("8");
  await page.locator('input[data-toilet-component="bagQty"]').press("Tab");
  await page.locator('input[data-toilet-component="solidifierQty"]').fill("6");
  await page.locator('input[data-toilet-component="solidifierQty"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/35/,"unverified components cannot cover 35 toilet uses");
  await page.locator('input[data-toilet-component="solidifierQty"]').fill("2.5");
  await page.locator('input[data-toilet-component="solidifierQty"]').press("Tab");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).variants["home:toiletBags"].solidifierQty),6,"fractional uses must not overwrite existing stock");
  await page.locator('input[data-toilet-component="solidifierQty"]').fill("6");
  await page.locator('input[data-toilet-component="solidifierQty"]').press("Tab");
  await page.locator('input[data-setting="toiletAssemblyConfirmed"]').check();
  await page.locator('input[data-setting="toiletSeatConfirmed"]').check();
  await page.locator('input[data-setting="toiletStorageConfirmed"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/35/,"missing local disposal review blocks use");
  await page.locator('input[data-setting="toiletDisposalConfirmed"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/29/,"six matched pairs count exactly once");
  await page.locator('details.g-option[data-option="toiletKit"] summary').click();
  await page.locator('input[data-option-qty="toiletKit"]').fill("5");
  await page.locator('input[data-option-qty="toiletKit"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/24/,"five complete kits count separately");
  await page.locator('input[data-setting="toiletStorageConfirmed"]').uncheck();
  assert.match(await page.locator(".g-detail-status").innerText(),/35/,"unsafe storage blocks kits and loose pairs");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="toilet"]').click();
  await page.locator('details.g-option[data-option="toiletBags"] summary').click();
  assert.equal(await page.locator('input[data-toilet-component="bagQty"]').inputValue(),"8");
  assert.equal(await page.locator('input[data-toilet-component="solidifierQty"]').inputValue(),"6");
  assert.equal(await page.locator('input[data-setting="toiletStorageConfirmed"]').isChecked(),false);
  await noOverflow(page,"toilet matched-components 390px");
  assert.deepEqual(exceptions,[]);
  console.log("PASS toilet component matching, independent conditions and storage");
  passed++;await ctx.close();
 }

 // Old combined-count stock is preserved but cannot silently become verified pairs.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:7,stocks:{},variants:{"home:toiletBags":{qty:12}},
   toiletAssemblyConfirmed:true,toiletSeatConfirmed:true,toiletStorageConfirmed:true,toiletDisposalConfirmed:true
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="toilet"]').click();
  await page.locator('details.g-option[data-option="toiletBags"] summary').click();
  assert.match(await page.locator('details.g-option[data-option="toiletBags"]').innerText(),/以前の.*12/);
  assert.match(await page.locator(".g-detail-status").innerText(),/35/,"legacy paired quantity needs explicit verification of both components");
  await page.locator('input[data-toilet-component="bagQty"]').fill("12");
  await page.locator('input[data-toilet-component="bagQty"]').press("Tab");
  await page.locator('input[data-toilet-component="solidifierQty"]').fill("7");
  await page.locator('input[data-toilet-component="solidifierQty"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/28/,"only seven separately confirmed combinations count");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).variants["home:toiletBags"].qty),12,"keep original saved legacy quantity for review");
  assert.deepEqual(exceptions,[]);
  console.log("PASS legacy toilet quantity preserved without automatic reuse");
  passed++;await ctx.close();
 }


 // Existing single-checkbox heating approval must not silently qualify old inventory.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:7,powerOut:true,offGridHeatConfirmed:true,
   stocks:{"home:stove":{qty:1},"home:gas":{qty:5}},
   variants:{"home:packRice":{qty:10}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/21/);
  assert.match(await page.locator(".g-heat-review").innerText(),/旧方式の加熱確認/);
  assert.deepEqual(exceptions,[]);
  console.log("PASS existing heating approval preserved without unmeasured fuel credit");
  passed++;await ctx.close();
 }

 // Power-tab stove/gas inventory updates must invalidate the previous heat budget.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator('input[data-condition="powerOut"]').check();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="packRice"] summary').click();
  await page.locator('input[data-option-qty="packRice"]').fill("4");
  await page.locator('input[data-option-qty="packRice"]').press("Tab");
  await page.locator('input[data-heat-sessions="packRice"]').fill("1");
  await page.locator('input[data-heat-sessions="packRice"]').press("Tab");
  await page.locator('input[data-heat-confirm="packRice"]').check();
  await page.locator('input[data-heat-stock="stoveCount"]').fill("1");
  await page.locator('input[data-heat-stock="stoveCount"]').press("Tab");
  await page.locator('input[data-heat-stock="gasCount"]').fill("2");
  await page.locator('input[data-heat-stock="gasCount"]').press("Tab");
  await page.locator('input[data-heat-stock="gasCapacity"]').fill("1");
  await page.locator('input[data-heat-stock="gasCapacity"]').press("Tab");
  await page.locator('input[data-heat-check="stove"]').check();
  await page.locator('input[data-heat-check="gas"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/17/);
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="power"]').click();
  await page.locator('input[data-basic="gas"]').fill("3");
  await page.locator('input[data-basic="gas"]').press("Tab");
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="food"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"changing gas inventory invalidates confirmed fuel budget");
  assert.equal(await page.locator('input[data-heat-stock="gasCapacity"]').inputValue(),"0");
  assert.equal(await page.locator('input[data-heat-check="gas"]').isChecked(),false);
  assert.deepEqual(exceptions,[]);
  console.log("PASS changing power inventory invalidates old fuel budget");
  passed++;await ctx.close();
 }


 // Register real powered lights rather than equating physical units with working stock.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  await page.locator('input[data-option-qty="headlamp"]').fill("3");
  await page.locator('input[data-option-qty="headlamp"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"three unverified headlamps must not count");
  await page.locator('input[data-energy-option-ready="headlamp"]').fill("1");
  await page.locator('input[data-energy-option-ready="headlamp"]').press("Tab");
  await page.locator('input[data-energy-option-confirm="headlamp"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/1/,"one working headlamp covers just one unit");
  await page.locator('input[data-energy-option-ready="headlamp"]').fill("1.5");
  await page.locator('input[data-energy-option-ready="headlamp"]').press("Tab");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).variants["home:headlamp"].powerReadyQty),1,
   "fractional working units must not overwrite the saved count");
  await page.locator('input[data-energy-option-ready="headlamp"]').fill("2");
  await page.locator('input[data-energy-option-ready="headlamp"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"changing working count revokes prior confirmation");
  await page.locator('input[data-energy-option-confirm="headlamp"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/0/,"two checked headlamps meet two-unit target");
  await page.locator('input[data-option-qty="headlamp"]').fill("4");
  await page.locator('input[data-option-qty="headlamp"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"changing owned count revokes working-unit confirmation");
  await page.locator('input[data-energy-option-confirm="headlamp"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/0/);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  assert.equal(await page.locator('input[data-energy-option-ready="headlamp"]').inputValue(),"2");
  assert.equal(await page.locator('input[data-energy-option-confirm="headlamp"]').isChecked(),true);
  await noOverflow(page,"powered lamps 390px");
  assert.deepEqual(exceptions,[]);
  console.log("PASS headlamp operational-count clamp, invalid fractional input, revocation, persistence");
  passed++;await ctx.close();
 }

 // Bank charge/cable verification and manual radio stock are separate from simple ownership.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  await page.locator('input[data-basic="radio"]').fill("2");
  await page.locator('input[data-basic="radio"]').press("Tab");
  await page.locator('input[data-energy-basic-ready="radio"]').fill("1");
  await page.locator('input[data-energy-basic-ready="radio"]').press("Tab");
  await page.locator('input[data-energy-basic-confirm="radio"]').check();
  assert.equal(await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04").calc.items.find(x=>x.item.id==="radio").effective;
  }),1,"two radios owned, only one actually powered");
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="batteryBank"] summary').click();
  await page.locator('input[data-option-qty="batteryBank"]').fill("2");
  await page.locator('input[data-option-qty="batteryBank"]').press("Tab");
  assert.equal(await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04").calc.items.find(x=>x.item.id==="powerbank").effective;
  }),0,"owning a bank does not establish charge or compatibility");
  await page.locator('input[data-energy-option-ready="batteryBank"]').fill("1");
  await page.locator('input[data-energy-option-ready="batteryBank"]').press("Tab");
  await page.locator('input[data-energy-option-confirm="batteryBank"]').check();
  assert.equal(await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04").calc.items.find(x=>x.item.id==="powerbank").effective;
  }),1,"a charged compatible bank is one usable bank, not an inferred number of phone charges");
  await page.locator('input[data-option-qty="batteryBank"]').fill("3");
  await page.locator('input[data-option-qty="batteryBank"]').press("Tab");
  assert.equal(await page.locator('input[data-energy-option-confirm="batteryBank"]').isChecked(),false);
  assert.equal(await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04").calc.items.find(x=>x.item.id==="powerbank").effective;
  }),0);
  await page.locator('input[data-basic="radio"]').fill("3");
  await page.locator('input[data-basic="radio"]').press("Tab");
  assert.equal(await page.locator('input[data-energy-basic-confirm="radio"]').isChecked(),false,
   "manual radio quantity change revokes its operational approval");
  await noOverflow(page,"radio and power bank 390px");
  assert.deepEqual(exceptions,[]);
  console.log("PASS bank charge/cable confirmation and radio readiness revocation");
  passed++;await ctx.close();
 }

 // Old inventories remain locally saved, but are not silently credited as powered.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:7,stocks:{"home:light":{qty:2},"home:powerbank":{qty:3}},
   variants:{"home:flashlight":{qty:2},"home:batteryBank":{qty:3}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/2/);
  assert.equal(await page.locator('input[data-basic="light"]').inputValue(),"2");
  assert.equal(await page.locator('input[data-energy-basic-ready="light"]').inputValue(),"0");
  await page.locator('input[data-energy-basic-ready="light"]').fill("1");
  await page.locator('input[data-energy-basic-ready="light"]').press("Tab");
  await page.locator('input[data-energy-basic-confirm="light"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,
   "one working manual lamp is still uncredited while ownership overlaps two itemized flashlights");
  assert.equal(await page.locator('select[data-manual-basis="light"]').inputValue(),"");
  await page.locator('select[data-manual-basis="light"]').selectOption("additional");
  assert.match(await page.locator(".g-detail-status").innerText(),/1/,
   "explicitly confirming an independently owned manual lamp credits exactly one");
  assert.deepEqual(exceptions,[]);
  console.log("PASS legacy lamp/bank quantities retained, ambiguous lights held and distinct manual lamp confirmed");
  passed++;await ctx.close();
 }


 // Spare AA cells must be budgeted across ALL lights and radios without duplication.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator('input[data-condition="powerOut"]').check();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  await page.locator('input[data-option-qty="headlamp"]').fill("2");
  await page.locator('input[data-option-qty="headlamp"]').press("Tab");
  await page.locator('input[data-energy-option-ready="headlamp"]').fill("2");
  await page.locator('input[data-energy-option-ready="headlamp"]').press("Tab");
  await page.locator('input[data-energy-option-confirm="headlamp"]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"operational lights alone do not establish multi-day battery coverage");
  await page.locator('select[data-battery-type="option:headlamp"]').selectOption("AA");
  await page.locator('input[data-battery-cells="option:headlamp"]').fill("3");
  await page.locator('input[data-battery-cells="option:headlamp"]').press("Tab");
  await page.locator('input[data-battery-changes="option:headlamp"]').fill("1");
  await page.locator('input[data-battery-changes="option:headlamp"]').press("Tab");
  await page.locator('input[data-battery-confirm="option:headlamp"]').check();
  await page.locator('details[data-battery-stock-panel] summary').click();
  await page.locator('input[data-battery-stock="AAA"]').fill("99");
  await page.locator('input[data-battery-stock="AAA"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"AAA stock cannot cover AA devices");
  await page.locator('input[data-battery-stock="AA"]').fill("5");
  await page.locator('input[data-battery-stock="AA"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"five AA cells insufficient for two times three AA replacements");
  await page.locator('input[data-battery-stock="AA"]').fill("5.5");
  await page.locator('input[data-battery-stock="AA"]').press("Tab");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).stocks["home:batteries"].batteryCells.AA),5,
   "fractional battery inventory must be rejected without changing storage");
  await page.locator('input[data-battery-stock="AA"]').fill("6");
  await page.locator('input[data-battery-stock="AA"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/0/,"six AA cells verify two sustained headlamps");
  assert.equal(await page.locator('details[data-battery-stock-panel]').getAttribute("open"),"",
   "battery inventory panel must stay open for multiple entries");
  await page.locator('input[data-basic="radio"]').fill("1");
  await page.locator('input[data-basic="radio"]').press("Tab");
  await page.locator('input[data-energy-basic-ready="radio"]').fill("1");
  await page.locator('input[data-energy-basic-ready="radio"]').press("Tab");
  await page.locator('input[data-energy-basic-confirm="radio"]').check();
  await page.locator('select[data-battery-type="basic:radio"]').selectOption("AA");
  await page.locator('input[data-battery-cells="basic:radio"]').fill("2");
  await page.locator('input[data-battery-cells="basic:radio"]').press("Tab");
  await page.locator('input[data-battery-changes="basic:radio"]').fill("1");
  await page.locator('input[data-battery-changes="basic:radio"]').press("Tab");
  await page.locator('input[data-battery-confirm="basic:radio"]').check();
  assert.equal(await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04").batteryReview.rows.find(x=>x.type==="AA").required;
  }),8,"six AA for headlamps plus two for radio, not six reused");
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"type-wide shortage must revoke incomplete period coverage");
  await page.locator('input[data-battery-stock="AA"]').fill("8");
  await page.locator('input[data-battery-stock="AA"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/0/);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  assert.equal(await page.locator('input[data-battery-stock="AA"]').inputValue(),"8");
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  assert.equal(await page.locator('input[data-battery-confirm="option:headlamp"]').isChecked(),true);
  await noOverflow(page,"shared AA cell budget 390px");
  assert.deepEqual(exceptions,[]);
  console.log("PASS spare battery types, shared radio+headlamp budget, invalid counts and storage");
  passed++;await ctx.close();
 }

 // Reserve four available AA cells for two headlamps while excluding a
 // separate radio: the tool must never silently choose an allocation itself.
 {
  const {ctx,page,exceptions}=await open(320);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:3,powerOut:true,
   stocks:{"home:batteries":{batteryCells:{AA:4}},
     "home:radio":{qty:1,powerReadyQty:1,powerReadyConfirmed:true,
       batteryType:"AA",cellsPerChange:2,plannedChanges:1,
       batteryPlanConfirmed:true,batteryPlanDays:3}},
   variants:{"home:headlamp":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,
      batteryType:"AA",cellsPerChange:2,plannedChanges:1,
      batteryPlanConfirmed:true,batteryPlanDays:3}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"short shared AA budget cannot automatically choose the headlamps");
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  assert.equal(await page.locator('input[data-battery-reserve="option:headlamp"]').inputValue(),"",
   "blank legacy battery reservation means all working units, not zero");
  await page.locator('input[data-battery-reserve="basic:radio"]').fill("0");
  await page.locator('input[data-battery-reserve="basic:radio"]').press("Tab");
  assert.equal(await page.locator('input[data-battery-confirm="basic:radio"]').isChecked(),false,
   "changing one reserved-device count revokes prior approval");
  await page.locator('input[data-battery-confirm="basic:radio"]').check();
  const now=await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04");
  });
  assert.equal(now.batteryReview.rows.find(r=>r.type==="AA").required,4);
  assert.equal(now.batteryReview.rows.find(r=>r.type==="AA").shortage,0);
  assert.equal(now.calc.items.find(r=>r.item.id==="light").effective,2);
  assert.equal(now.calc.items.find(r=>r.item.id==="radio").effective,0);
  assert.match(await page.locator(".g-battery-review").innerText(),/一部/);
  assert.match(await page.locator(".g-detail-status").innerText(),/0/,"light shortage disappears after explicit AA allocation");
  await page.locator('input[data-battery-reserve="basic:radio"]').fill("1");
  await page.locator('input[data-battery-reserve="basic:radio"]').press("Tab");
  await page.locator('input[data-battery-confirm="basic:radio"]').check();
  const excess=await page.evaluate(()=>{
   const s=JSON.parse(localStorage.getItem("bichiku-check-v1"));
   return window.BichikuDecision.assessment(window.BICHIKU_CATALOG,window.BICHIKU_OPTIONS,s,"2026-11-04");
  });
  assert.equal(excess.batteryReview.rows.find(r=>r.type==="AA").shortage,2);
  assert.equal(excess.calc.items.find(r=>r.item.id==="light").effective,0,
   "reintroducing an over-budget radio cannot double-use the same AA cells");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  assert.equal(await page.locator('input[data-battery-reserve="basic:radio"]').inputValue(),"1");
  await noOverflow(page,"320px selective battery allocation");
  assert.deepEqual(exceptions,[]);
  console.log("PASS explicit partial battery reservation, shared pool, approval revocation and persistence");
  passed++;await ctx.close();
 }

 // Legacy spare sets are not converted to cells; changing days invalidates checked plans.
 {
  const {ctx,page,exceptions}=await open(320);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:3,powerOut:true,
   stocks:{"home:batteries":{qty:99}},
   variants:{"home:headlamp":{qty:2,powerReadyQty:2,powerReadyConfirmed:true,
    batteryType:"AA",cellsPerChange:2,plannedChanges:1,batteryPlanConfirmed:true,batteryPlanDays:3}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"99 untyped sets cannot cover AA requirements");
  await page.locator('details[data-battery-stock-panel] summary').click();
  assert.match(await page.locator(".g-battery-review").innerText(),/99/);
  await page.locator('input[data-battery-stock="AA"]').fill("4");
  await page.locator('input[data-battery-stock="AA"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/0/);
  await noOverflow(page,"battery planning 320px");
  await page.locator("button[data-back]").click();
  await page.locator("button[data-edit]").click();
  await page.locator('button[data-select="days"][data-value="7"]').click();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="power"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/2/,"3-day verification must not certify 7-day operation");
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  assert.equal(await page.locator('input[data-battery-confirm="option:headlamp"]').isChecked(),false);
  assert.deepEqual(exceptions,[]);
  console.log("PASS legacy battery sets not converted and planning days invalidate verification");
  passed++;await ctx.close();
 }

 // A manual category quantity and itemized bottled water can be the SAME stock.
 // Require reconciliation, preserve saved data and invalidate after any changes.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('input[data-basic="water"]').fill("10");
  await page.locator('input[data-basic="water"]').press("Tab");
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="water2L"] summary').click();
  await page.locator('input[data-option-bottles="water2L"]').fill("4");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/13L/,"unreviewed manual 10L must not add to 8L itemized water");
  assert.equal(await page.locator('select[data-manual-basis="water"]').inputValue(),"");
  assert.match(await page.locator(".g-pending").allInnerTexts().then(x=>x.join(" ")),/二重登録/);
  await page.locator('select[data-manual-basis="water"]').selectOption("includes_options");
  assert.match(await page.locator(".g-detail-status").innerText(),/11L/,"inclusive total credits ten, not eighteen litres");
  await page.locator('select[data-manual-basis="water"]').selectOption("additional");
  assert.match(await page.locator(".g-detail-status").innerText(),/3L/,"explicit independent stock credits 10+8 litres");
  await page.locator('input[data-option-bottles="water2L"]').fill("3");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  assert.match(await page.locator(".g-detail-status").innerText(),/15L/,"bottle edit revokes previously declared independence");
  assert.equal(await page.locator('select[data-manual-basis="water"]').inputValue(),"");
  await page.locator('select[data-manual-basis="water"]').selectOption("includes_options");
  assert.match(await page.locator(".g-detail-status").innerText(),/11L/);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  assert.equal(await page.locator('input[data-basic="water"]').inputValue(),"10");
  assert.equal(await page.locator('select[data-manual-basis="water"]').inputValue(),"includes_options");
  assert.equal(await page.locator('input[data-option-bottles="water2L"]').count(),0,
    "named option is in everyday tab; no cross-tab duplicate entry");
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="water2L"] summary').click();
  assert.equal(await page.locator('input[data-option-bottles="water2L"]').inputValue(),"3");
  assert.deepEqual(exceptions,[]);
  await noOverflow(page,"390px manual+named water overlap");
  console.log("PASS duplicate water reconciliation: unknown/inclusive/additional, invalidation and persistence");
  passed++;await ctx.close();
 }

 // A complete toilet kit and separately assembled loose pieces can overlap
 // manual toilet-use totals; no automatic double credit is allowed.
 {
  const {ctx,page,exceptions}=await open(320);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:3,
   stocks:{"home:toilet":{qty:10}},
   variants:{"home:toiletKit":{qty:5},"home:toiletBags":{bagQty:8,solidifierQty:6}},
   toiletAssemblyConfirmed:true,toiletSeatConfirmed:true,toiletStorageConfirmed:true,toiletDisposalConfirmed:true
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  assert.match(await page.locator(".g-pending").allInnerTexts().then(x=>x.join(" ")),/重複確認/);
  await page.locator('button[data-goal="toilet"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/4/,"only five complete plus six assembled pairs for fifteen uses");
  await page.locator('select[data-manual-basis="toilet"]').selectOption("includes_options");
  assert.match(await page.locator(".g-detail-status").innerText(),/4/,"manual 10 includes eleven named usable, so count eleven");
  await page.locator('select[data-manual-basis="toilet"]').selectOption("additional");
  assert.match(await page.locator(".g-detail-status").innerText(),/0/,"ten distinct manual uses plus eleven options cover the target");
  assert.deepEqual(exceptions,[]);
  await noOverflow(page,"320px toilet overlap reconciliation");
  console.log("PASS portable toilet kit/loose pairs versus manual count without duplicate credit");
  passed++;await ctx.close();
 }


 // Water outage: preserve independent drinking litres; never double-spend prep litres.
 {
  const {ctx,page,exceptions}=await open(320);
  await page.locator('input[data-condition="noHeat"]').check();
  await page.locator('input[data-condition="waterOut"]').check();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  await page.locator('input[data-setting="safeWaterConfirmed"]').check();
  await page.locator('details.g-option[data-option="alphaRice"] summary').click();
  await page.locator('input[data-option-qty="alphaRice"]').fill("3");
  await page.locator('input[data-option-qty="alphaRice"]').press("Tab");
  await page.locator('input[data-prep-liters="alphaRice"]').fill("2");
  await page.locator('input[data-prep-liters="alphaRice"]').press("Tab");
  await page.locator('input[data-prep-confirm="alphaRice"]').check();
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('input[data-basic="water"]').fill("5");
  await page.locator('input[data-basic="water"]').press("Tab");
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false);
  await page.locator('input[data-drink-reserve]').fill("3");
  await page.locator('input[data-drink-reserve]').press("Tab");
  await page.locator('input[data-drink-confirm]').check();
  assert.match(await page.locator(".g-drinking-review").innerText(),/5L/);
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="food"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/18/,"5L covers 3L drinking and 2L prep");
  await page.locator('input[data-drink-reserve]').fill("4");
  await page.locator('input[data-drink-reserve]').press("Tab");
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false);
  await page.locator('input[data-drink-confirm]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/21/,"6L combined cannot reuse 5L twice");
  assert.ok((await page.locator(".g-drinking-review").innerText()).includes("超え"));
  await page.locator('input[data-drink-reserve]').fill("2.5");
  await page.locator('input[data-drink-reserve]').press("Tab");
  await page.locator('input[data-drink-confirm]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/18/);
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  assert.equal(await page.locator('input[data-drink-reserve]').inputValue(),"2.5");
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),true);
  await page.locator('input[data-basic="water"]').fill("6");
  await page.locator('input[data-basic="water"]').press("Tab");
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false,
    "changing water stock invalidates drinking allocation approval");
  await noOverflow(page,"320px drinking+prep allocation");
  assert.deepEqual(exceptions,[]);
  console.log("PASS shared drinking/cooking water, overcommit and stock invalidation");
  passed++;await ctx.close();
 }

 // An explicit drinking+prep plan can exceed the reference target, even when
 // the reference itself appears fully covered. Shopping must show the real gap.
 {
  const {ctx,page,exceptions}=await open(320);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
    mode:"home",adults:1,children:0,infants:0,pets:0,days:3,
    noHeat:true,waterOut:true,safeWaterConfirmed:true,
    stocks:{"home:water":{qty:10,drinkingReserveLiters:9,
      drinkingReserveConfirmed:true,drinkingReservePlanDays:3,drinkingReserveHousehold:"1:0:0:0"}},
    variants:{"home:alphaRice":{qty:2,prepConfirmed:true,prepWaterLiters:2}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  const overviewWater=page.locator(".g-goal").filter({has:page.locator('button[data-goal="water"]')});
  assert.match(await overviewWater.innerText(),/1L/,"overview must show shortage versus 11L allocation, not legacy 9L target");
  await page.locator('button[data-goal="water"]').click();
  assert.match(await page.locator(".g-detail-status").innerText(),/不足: 1L/);
  const summary=await page.locator(".g-drinking-review").innerText();
  assert.match(summary,/11L/,"visible adjusted requirement");
  assert.match(summary,/2L/,"explain two litres above nine-litre target");
  await page.locator('button[data-shopping]').first().click();
  const waterShop=page.locator(".g-shop-row").filter({has:page.locator('input[data-shop="water"]')});
  assert.equal(await waterShop.count(),1,"short water must be in default shopping list");
  assert.match(await waterShop.innerText(),/不足: 1L/);
  assert.match(await waterShop.innerText(),/\+2L/,"shopping must explain allocation-driven extra litres");
  await noOverflow(page,"320px adjusted water shopping");
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('input[data-drink-reserve]').fill("8");
  await page.locator('input[data-drink-reserve]').press("Tab");
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false);
  assert.match(await page.locator(".g-detail-status").innerText(),/不足: 0L/,"unverified old plan must not inflate shopping target");
  await page.locator('input[data-drink-confirm]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/不足: 0L/,"verified ten-litre plan fits ten stocked litres");
  await page.locator('button[data-shopping]').first().click();
  assert.equal(await page.locator('.g-shop-row input[data-shop="water"]').count(),0,"water must disappear from shopping once allocation fits the stock");
  assert.deepEqual(exceptions,[]);
  console.log("PASS verified water plan increases overview and shopping target without double adding prep");
  passed++;await ctx.close();
 }

 // A saved drinking plan cannot cover a different roster, even on the same day plan.
 {
  const {ctx,page,exceptions}=await open(390);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,children:0,infants:0,pets:0,days:3,
   waterOut:true,noHeat:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:8,drinkingReserveLiters:5,
     drinkingReserveConfirmed:true,drinkingReservePlanDays:3,
     drinkingReserveHousehold:"1:0:0:0"}},
   variants:{"home:alphaRice":{qty:3,prepConfirmed:true,prepWaterLiters:2}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),true);
  assert.match(await page.locator(".g-detail-status").innerText(),/6/,"confirmed plan credits three rice portions");
  await page.locator('button[data-back]').click();
  await page.locator('button[data-edit]').click();
  await page.locator('button[data-inc="1"][data-field="adults"]').click();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false,"more adults invalidate prior drinking review");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).stocks["home:water"].drinkingReserveLiters),5,
   "old water amount must not be deleted");
  assert.match(await page.locator(".g-drinking-review").innerText(),/未確認/);
  await page.locator('input[data-drink-confirm]').check();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).stocks["home:water"].drinkingReserveHousehold),"2:0:0:0");
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),true,"new roster-bound review persists");
  await page.locator('button[data-back]').click();
  await page.locator('button[data-edit]').click();
  await page.locator('button[data-select="days"][data-value="7"]').click();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false,"changing planning days invalidates the review");
  await page.locator('button[data-back]').click();
  await page.locator('button[data-edit]').click();
  await page.locator('input[data-condition="waterOut"]').uncheck();
  await page.locator('input[data-condition="waterOut"]').check();
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).safeWaterConfirmed),false,
   "changing water outage scope also revokes potable-water safety confirmation");
  await noOverflow(page,"390px roster-scoped drinking review");
  assert.deepEqual(exceptions,[]);
  console.log("PASS drinking confirmation revoked on adults/day/outage change while preserving litres");
  passed++;await ctx.close();
 }
 // Old localStorage approvals with no household snapshot are not trusted.
 {
  const {ctx,page,exceptions}=await open(320);
  await page.evaluate(()=>localStorage.setItem("bichiku-check-v1",JSON.stringify({
   mode:"home",adults:1,days:3,noHeat:true,waterOut:true,safeWaterConfirmed:true,
   stocks:{"home:water":{qty:8,drinkingReserveLiters:5,
     drinkingReserveConfirmed:true,drinkingReservePlanDays:3}},
   variants:{"home:alphaRice":{qty:3,prepConfirmed:true,prepWaterLiters:2}}
  })));
  await page.reload({waitUntil:"domcontentloaded"});
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-drink-confirm]').isChecked(),false);
  assert.match(await page.locator(".g-drinking-review").innerText(),/人数構成/);
  assert.match(await page.locator(".g-detail-status").innerText(),/9/,"legacy water review cannot certify hydrated food");
  await page.locator('input[data-drink-confirm]').check();
  assert.match(await page.locator(".g-detail-status").innerText(),/6/,"fresh review credits food without erasing old stock");
  assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem("bichiku-check-v1")).stocks["home:water"].drinkingReserveHousehold),"1:0:0:0");
  assert.deepEqual(exceptions,[]);
  console.log("PASS legacy drinking approval requires fresh household confirmation at 320px");
  passed++;await ctx.close();
 }

 // Localized water allocation controls must remain usable in every supported language.
 for(const [locale,dir] of locales){
  const {ctx,page,exceptions}=await open(390,dir);
  await page.locator('input[data-condition="waterOut"]').check();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="water"]').click();
  assert.equal(await page.locator('input[data-drink-reserve]').count(),1);
  assert.equal(await page.locator('input[data-drink-confirm]').count(),1);
  assert.ok((await page.locator(".g-drinking-review").innerText()).length>100,"localized water plan "+locale);
  await noOverflow(page,"drinking allocation "+locale);
  assert.deepEqual(exceptions,[]);
  console.log("PASS drinking budget locale "+locale);passed++;await ctx.close();
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
  await page.locator("button[data-back]").click();
  await page.locator('button[data-goal="toilet"]').click();
  assert.equal(await page.locator('input[data-setting^="toilet"]').count(),4,"four independent toilet confirmations "+locale);
  assert.ok((await page.locator('label.g-check').filter({has:page.locator('input[data-setting="toiletDisposalConfirmed"]')}).innerText()).trim().length>10,"localized disposal language "+locale);
  await page.locator('button[data-back]').click();
  await page.locator('button[data-edit]').click();
  await page.locator('input[data-condition="powerOut"]').check();
  await page.locator("#calculate").click();
  await page.locator('button[data-goal="food"]').click();
  assert.equal(await page.locator('input[data-heat-stock]').count(),3,"three localized heater/fuel fields "+locale);
  assert.ok((await page.locator('label.g-check').filter({has:page.locator('input[data-heat-check="gas"]')}).innerText()).trim().length>10,"localized fuel review "+locale);
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="power"]').click();
  assert.equal(await page.locator('input[data-energy-basic-ready]').count(),4,
   "four energy-dependent manual categories "+locale);
  await page.locator('details.g-option[data-option="headlamp"] summary').click();
  assert.equal(await page.locator('input[data-energy-option-ready="headlamp"]').count(),1,
   "energy-dependent options display whole-unit input "+locale);
  assert.ok((await page.locator('label.g-check').filter({has:page.locator('input[data-energy-option-confirm="headlamp"]')}).innerText()).trim().length>10,
   "localized energy confirmation "+locale);
  assert.equal(await page.locator('input[data-battery-stock]').count(),7,"seven battery types shown "+locale);
  assert.equal(await page.locator('select[data-battery-type="option:headlamp"]').count(),1,"localized device battery type "+locale);
  assert.equal(await page.locator('input[data-battery-reserve="option:headlamp"]').count(),1,
   "localized partial battery allocation field "+locale);
  assert.ok((await page.locator('label').filter({has:page.locator('input[data-battery-reserve="option:headlamp"]')}).innerText()).trim().length>15,
   "localized battery allocation explanation "+locale);
  assert.ok((await page.locator('label.g-check').filter({has:page.locator('input[data-battery-confirm="option:headlamp"]')}).innerText()).trim().length>10,"localized battery plan confirmation "+locale);
  await page.locator('button[data-back]').click();
  await page.locator('button[data-goal="water"]').click();
  await page.locator('input[data-basic="water"]').fill("10");
  await page.locator('input[data-basic="water"]').press("Tab");
  await page.locator('button[data-tab="everyday"]').click();
  await page.locator('details.g-option[data-option="water2L"] summary').click();
  await page.locator('input[data-option-bottles="water2L"]').fill("2");
  await page.locator('input[data-option-bottles="water2L"]').press("Tab");
  assert.equal(await page.locator('select[data-manual-basis="water"]').count(),1,"localized review select "+locale);
  assert.ok((await page.locator('select[data-manual-basis="water"] option').nth(1).innerText()).trim().length>15,
   "translated total-includes-options explanation "+locale);
  await noOverflow(page,locale);
  assert.deepEqual(exceptions,[],"JS exceptions "+locale);
  await page.screenshot({path:path.join(folder,"locale-"+locale+".png"),fullPage:true});
  console.log("PASS locale "+locale);passed++;
  await ctx.close();
 }
 console.log("Bichiku guided browser smoke PASS: "+passed+" scenarios");
}finally{await browser.close()}
