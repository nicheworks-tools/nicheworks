import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const siteBase = 'https://nicheworks.app';
const ga4 = 'G-57QT78M3JB';
const adsense = 'ca-pub-9879006623791275';
const ogImage = `${siteBase}/assets/ogp.png`;

const read = (p) => fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
const write = (p, s) => fs.writeFileSync(p, s, 'utf8');
const exists = (p) => fs.existsSync(p);
const titleCase = (slug) => slug.split('-').map((w) => w ? w[0].toUpperCase() + w.slice(1) : w).join(' ');

function listHtmlFiles(dir) {
  if (!exists(dir)) return [];
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...listHtmlFiles(p));
    else if (ent.isFile() && ent.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function relUrlForFile(file) {
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel === 'index.html') return `${siteBase}/`;
  if (rel.endsWith('/index.html')) return `${siteBase}/${rel.slice(0, -'index.html'.length)}`;
  return `${siteBase}/${rel}`;
}

function inferTitle(file, html) {
  const current = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim();
  if (current && current !== 'NicheWorks') return current;
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel === 'index.html') return '無料ブラウザツール集｜NicheWorks';
  if (rel === 'en/index.html') return 'Free Browser Tools | NicheWorks';
  const parts = rel.split('/').filter(Boolean);
  const slug = parts[parts.length - 2] || parts[parts.length - 1].replace(/\.html$/, '');
  return `${titleCase(slug)} | NicheWorks`;
}

function inferDescription(file, html, title) {
  const current = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1]?.trim();
  if (current) return current;
  const rel = path.relative(root, file).split(path.sep).join('/');
  if (rel.startsWith('en/')) return `${title.replace(' | NicheWorks', '')} is a lightweight NicheWorks browser page for small, practical tasks.`;
  return `${title.replace(' | NicheWorks', '')} は、NicheWorks のブラウザ完結型ページです。小さな作業を軽くするための無料ツールです。`;
}

function injectBeforeHeadClose(html, block) {
  if (html.includes(block.trim().slice(0, 40))) return html;
  return html.replace(/<\/head>/i, `${block}\n</head>`);
}

function ensureHead(html, file) {
  const url = relUrlForFile(file);
  const title = inferTitle(file, html);
  const desc = inferDescription(file, html, title);

  if (!/<title>[\s\S]*?<\/title>/i.test(html)) {
    html = html.replace(/<head[^>]*>/i, (m) => `${m}\n  <title>${title}</title>`);
  }
  if (!/<meta[^>]+name=["']description["']/i.test(html)) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, (m) => `${m}\n  <meta name="description" content="${desc}">`);
  }
  if (!/<meta[^>]+name=["']robots["']/i.test(html)) {
    html = html.replace(/<meta[^>]+name=["']description["'][^>]*>/i, (m) => `${m}\n  <meta name="robots" content="index,follow">`);
  }
  if (!/<link[^>]+rel=["']canonical["']/i.test(html)) {
    html = html.replace(/<meta[^>]+name=["']robots["'][^>]*>/i, (m) => `${m}\n  <link rel="canonical" href="${url}">`);
  }
  if (!/<link[^>]+rel=["'](?:icon|shortcut icon)["']/i.test(html)) {
    html = html.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, (m) => `${m}\n  <link rel="icon" href="/assets/favicon.ico">`);
  }
  if (!/<link[^>]+rel=["']apple-touch-icon["']/i.test(html)) {
    html = html.replace(/<link[^>]+rel=["'](?:icon|shortcut icon)["'][^>]*>/i, (m) => `${m}\n  <link rel="apple-touch-icon" href="/assets/favicon.ico">`);
  }

  const ogBlock = `
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="NicheWorks">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${desc}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${ogImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${desc}">
  <meta name="twitter:image" content="${ogImage}">`;
  if (!/<meta[^>]+property=["']og:title["']/i.test(html)) html = injectBeforeHeadClose(html, ogBlock);

  const analyticsBlock = `
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}" crossorigin="anonymous"></script>
  <script async src="https://www.googletagmanager.com/gtag/js?id=${ga4}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${ga4}');
  </script>`;
  if (!html.includes(ga4)) html = injectBeforeHeadClose(html, analyticsBlock);
  else if (!html.includes(adsense)) html = injectBeforeHeadClose(html, `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsense}" crossorigin="anonymous"></script>`);

  return html;
}

const files = [
  path.join(root, 'index.html'),
  path.join(root, 'about.html'),
  path.join(root, 'privacy.html'),
  path.join(root, 'contact.html'),
  ...listHtmlFiles(path.join(root, 'en')),
  ...listHtmlFiles(path.join(root, 'tools'))
].filter((p, i, arr) => exists(p) && arr.indexOf(p) === i);

let changed = 0;
for (const file of files) {
  const before = read(file);
  let after = before;
  if (!/<head[\s>]/i.test(after)) continue;
  after = ensureHead(after, file);
  if (after !== before) {
    write(file, after);
    changed += 1;
    console.log(`updated ${path.relative(root, file)}`);
  }
}
console.log(`SEO foundation repair complete. changed=${changed}`);
