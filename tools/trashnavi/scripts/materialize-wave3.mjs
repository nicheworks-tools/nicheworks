#!/usr/bin/env node
import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

const generated = spawnSync(process.execPath, ['tools/trashnavi/scripts/generate-municipality-pages.mjs'], { stdio: 'inherit' });
if (generated.status !== 0) process.exit(generated.status ?? 1);

const newPages = [
  ['https://nicheworks.app/tools/trashnavi/mie/mihama/', '御浜町'],
  ['https://nicheworks.app/tools/trashnavi/gifu/kaizu/', '海津市'],
  ['https://nicheworks.app/tools/trashnavi/ibaraki/yuki/', '結城市']
];

let sitemap = fs.readFileSync('sitemap.xml', 'utf8');
const anchorUrl = 'https://nicheworks.app/tools/trashnavi/tokyo/suginami/';
const anchorPattern = new RegExp(`  <url>\\n    <loc>${anchorUrl.replaceAll('/', '\\/')}</loc>\\n    <lastmod>[^<]+</lastmod>\\n  </url>\\n`);
const anchor = sitemap.match(anchorPattern)?.[0];
if (!anchor) throw new Error('TrashNavi sitemap anchor not found');
const missingBlocks = newPages
  .filter(([url]) => !sitemap.includes(`<loc>${url}</loc>`))
  .map(([url]) => `  <url>\n    <loc>${url}</loc>\n    <lastmod>2026-09-12</lastmod>\n  </url>\n`)
  .join('');
if (missingBlocks) sitemap = sitemap.replace(anchor, anchor + missingBlocks);
fs.writeFileSync('sitemap.xml', sitemap, 'utf8');

const indexPath = 'tools/trashnavi/index.html';
let index = fs.readFileSync(indexPath, 'utf8');
const linksAnchor = '<a href="/tools/trashnavi/tokyo/nerima/">練馬区</a>';
if (!index.includes(linksAnchor)) throw new Error('TrashNavi municipality link anchor not found');
const extraLinks = newPages
  .filter(([url]) => !index.includes(new URL(url).pathname))
  .map(([url, name]) => `<a href="${new URL(url).pathname}">${name}</a>`)
  .join('');
if (extraLinks) index = index.replace(linksAnchor, linksAnchor + extraLinks);
fs.writeFileSync(indexPath, index, 'utf8');

console.log('TrashNavi Wave 3 generated pages, auxiliary sitemap, root sitemap and root-page links materialized.');
