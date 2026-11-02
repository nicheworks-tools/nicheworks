import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const origin = process.argv[2] || "http://127.0.0.1:8877";
const base = origin.replace(/\/$/,"") + "/tools/bichiku-check/";
const dirs = [
  ["ja",""],
  ["en","en/"],
  ["zh-CN","zh-cn/"],
  ["vi","vi/"]
];
const widths = [320,360,375,390,414,768,1280];
const outDir = "bichiku-smoke-artifacts";
fs.mkdirSync(outDir,{recursive:true});
const browser = await chromium.launch({headless:true});
let passed=0;

async function makePage(width) {
  const ctx=await browser.newContext({viewport:{width,height:850},deviceScaleFactor:1});
  const page=await ctx.newPage();
  const exceptions=[];
  page.on("pageerror",e=>exceptions.push(e.message));
  await page.route("**/*",route=>{
    if(route.request().url().startsWith(origin)) return route.continue();
    return route.abort(); // Ads/analytics are unrelated to local interaction smoke.
  });
  return {ctx,page,exceptions};
}

try {
  for(const width of widths) {
    const {ctx,page,exceptions}=await makePage(width);
    await page.goto(base,{waitUntil:"domcontentloaded",timeout:25000});
    await page.locator("#calculate").waitFor({timeout:12000});
    await page.locator("#calculate").click();
    await page.locator("#results:not([hidden])").waitFor({timeout:10000});
    const measure=await page.evaluate(()=>({
      scrollWidth:document.documentElement.scrollWidth,
      innerWidth:window.innerWidth,
      setup:document.getElementById("setup").getBoundingClientRect().toJSON(),
      results:document.getElementById("results").getBoundingClientRect().toJSON()
    }));
    assert.ok(measure.scrollWidth<=measure.innerWidth+1,"horizontal overflow at "+width+"px: "+JSON.stringify(measure));
    assert.ok(measure.setup.width>230,"setup unusably narrow at "+width);
    if(width>=769) {
      assert.ok(measure.results.x>measure.setup.x+measure.setup.width-1,"desktop result should be right of setup: "+width);
    } else {
      assert.ok(measure.results.y>=measure.setup.y+measure.setup.height-1,"mobile result should be below setup: "+width);
    }
    assert.ok((await page.locator(".item").count())>0,"missing inventory rows");
    const affiliate=page.locator(".aff-link").first();
    assert.ok((await affiliate.count())>0,"no affiliate link after result");
    const href=await affiliate.getAttribute("href");
    assert.match(href,/amazon\.co\.jp/);
    assert.match(href,/tag=nicheworks09-22/);
    assert.equal(await affiliate.getAttribute("rel"),"sponsored noopener");
    assert.match(await page.locator("#affiliate-inline").innerText(),/Amazon/);
    assert.equal(await page.locator("#specific-options:not([hidden])").count(),1,"specific options panel should be shown");
    await page.locator("#specific-toggle").click();
    assert.ok((await page.locator(".specific-option").count())>=25,"expected rich food/substitute options");
    await page.locator('[data-options-filter="warmth"]').click();
    assert.equal(await page.locator('.specific-option[data-option="foamMat"]').count(),1);
    await page.locator('.specific-option[data-option="aluminumSheet"] summary').click();
    assert.equal(await page.locator('.specific-option[data-option="aluminumSheet"] .specific-limit').count(),1,"foil must not auto-satisfy warmth");
    await page.locator('[data-options-filter="food"]').click();
    assert.equal(await page.locator('.specific-option[data-option="cupNoodles"]').count(),1);

    if(width===390) {
      const target=page.locator("#qty-water");
      await target.fill("12");
      await target.press("Tab");
      assert.equal(await page.locator("#qty-water").inputValue(),"12");
      await page.locator('.item[data-item="water"] .item-detail summary').click();
      await page.locator("#target-water").fill("25");
      await page.locator("#target-water").press("Tab");
      assert.equal(await page.locator("#target-water").inputValue(),"25");
      await page.locator('.specific-option[data-option="alphaRice"] summary').click();
      await page.locator('.specific-option[data-option="alphaRice"] .specific-qty').fill("3");
      await page.locator('.specific-option[data-option="alphaRice"] .specific-qty').press("Tab");
      assert.equal(await page.locator('.specific-option[data-option="alphaRice"] .specific-qty').inputValue(),"3");
      const groupFood=await page.locator('li[data-item="food"]').innerText();
      assert.match(groupFood,/18/,"alpha rice should reduce 21 planned staple portions by 3");
      await page.reload({waitUntil:"domcontentloaded"});
      await page.locator("#calculate").click();
      assert.equal(await page.locator("#qty-water").inputValue(),"12","stock not retained");
      await page.locator('.item[data-item="water"] .item-detail summary').click();
      assert.equal(await page.locator("#target-water").inputValue(),"25","target not retained");
      await page.locator("#specific-toggle").click();
      await page.locator('.specific-option[data-option="alphaRice"] summary').click();
      assert.equal(await page.locator('.specific-option[data-option="alphaRice"] .specific-qty').inputValue(),"3","specific item stock not retained");
    }
    await page.screenshot({path:path.join(outDir,"width-"+width+".png"),fullPage:true});
    assert.deepEqual(exceptions,[],"page script exception at "+width);
    console.log("PASS viewport "+width+"px no overflow; source link and calculation responsive");
    passed++;
    await ctx.close();
  }
  for(const [locale,dir] of dirs) {
    const {ctx,page,exceptions}=await makePage(390);
    await page.goto(base+dir,{waitUntil:"domcontentloaded",timeout:25000});
    await page.locator("#calculate").waitFor({timeout:12000});
    assert.equal(await page.locator("html").getAttribute("lang"),locale);
    await page.locator("#calculate").click();
    assert.ok((await page.locator(".item").count())>0,"missing rows "+locale);
    const dims=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,w:innerWidth}));
    assert.ok(dims.sw<=dims.w+1,"overflow "+locale);
    await page.screenshot({path:path.join(outDir,"locale-"+locale+".png"),fullPage:true});
    assert.deepEqual(exceptions,[],"page script exception "+locale);
    console.log("PASS locale "+locale);
    passed++;
    await ctx.close();
  }
  console.log("BichikuCheck browser smoke PASS: "+passed+" scenarios");
} finally {
  await browser.close();
}
