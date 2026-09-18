import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const playwrightRoot = process.env.PLAYWRIGHT_ROOT || '/tmp/phone-smoke';
const { chromium } = await import(pathToFileURL(path.join(playwrightRoot, 'node_modules/playwright/index.mjs')).href);

const outDir = process.env.SMOKE_OUT || '/tmp/phone-smoke-artifacts';
fs.mkdirSync(outDir, { recursive: true });

const launchOptions = { headless: true };
if (process.env.CHROME_PATH) launchOptions.executablePath = process.env.CHROME_PATH;
const browser = await chromium.launch(launchOptions);

const widths = [320, 390, 414, 768, 1280];
const results = [];

for (const width of widths) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    locale: 'ja-JP',
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  await page.route('**/*', async (route) => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') await route.continue();
    else await route.abort();
  });

  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  await page.goto('http://127.0.0.1:4173/tools/phone-quickcheck/', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => document.querySelectorAll('.phone-row').length > 0);
  await page.waitForFunction(() => /181/.test(document.querySelector('#dataState')?.textContent || ''));

  const rowCount = await page.locator('.phone-row').count();
  if (rowCount !== 181) throw new Error(`${width}px: expected 181 phone rows, got ${rowCount}`);

  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
  if (horizontalOverflow) throw new Error(`${width}px: document has horizontal overflow`);

  if (width <= 900) {
    if (await page.locator('#desktopDetail').isVisible()) throw new Error(`${width}px: desktop detail should be hidden`);
    await page.locator('.phone-row').first().click();
    await page.locator('#mobileSheet').waitFor({ state: 'visible' });

    const bodyOverflow = await page.evaluate(() => document.body.style.overflow);
    if (bodyOverflow !== 'hidden') throw new Error(`${width}px: body scroll must lock while sheet is open`);

    const sheetBox = await page.locator('#mobileSheet').boundingBox();
    if (!sheetBox || sheetBox.width > width + 1) throw new Error(`${width}px: bottom sheet exceeds viewport width`);

    const officialLinks = await page.locator('#sheetDetail .official-links a').count();
    if (!officialLinks) throw new Error(`${width}px: official source links missing in mobile sheet`);

    await page.locator('#sheetDetail .amazon-cta').first().waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(outDir, `phone-${width}-sheet.png`), fullPage: false });

    if (width === 390) {
      await page.locator('[data-lang="en"]').click();
      await page.waitForFunction(() => document.documentElement.lang === 'en');
      await page.screenshot({ path: path.join(outDir, 'phone-390-sheet-en.png'), fullPage: false });
    }

    await page.locator('#sheetClose').click();
    if (await page.locator('#mobileSheet').isVisible()) throw new Error(`${width}px: close button did not dismiss sheet`);
  } else {
    if (!(await page.locator('#desktopDetail').isVisible())) throw new Error(`${width}px: desktop detail must be visible`);
    if (await page.locator('#mobileSheet').isVisible()) throw new Error(`${width}px: mobile sheet must be hidden`);
    const officialLinks = await page.locator('#desktopDetail .official-links a').count();
    if (!officialLinks) throw new Error(`${width}px: official source links missing in desktop detail`);
    await page.locator('#desktopDetail .amazon-cta').first().waitFor({ state: 'visible' });
    await page.screenshot({ path: path.join(outDir, `phone-${width}-desktop.png`), fullPage: false });
  }

  if (errors.length) throw new Error(`${width}px page errors: ${errors.join(' | ')}`);
  results.push({ width, rowCount, horizontalOverflow: false, mode: width <= 900 ? 'mobile-sheet' : 'desktop-detail' });
  await context.close();
}

await browser.close();
fs.writeFileSync(path.join(outDir, 'results.json'), JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2) + '\n');
console.log(JSON.stringify(results));
