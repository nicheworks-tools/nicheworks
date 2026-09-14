import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import zlib from 'node:zlib';

const staged = ['earth-alerts', 'earth-timeseries'];
const fromMain = (file) => execFileSync('git', ['show', `origin/main:${file}`], { encoding: 'utf8' });

// Restore the canonical compact manifest formatting from main, then make only
// the semantic 90 -> 88 and two-row removals.
{
  let text = fromMain('tools/tool-spec-manifest.json');
  text = text.replace('"required_complete": 90', '"required_complete": 88');
  text = text.replace('"complete": 90', '"complete": 88');
  for (const slug of staged) {
    const line = `    {"slug":"${slug}","state":"complete","spec":"tools/${slug}/SPEC.md"},\n`;
    if (!text.includes(line)) throw new Error(`manifest row not found for ${slug}`);
    text = text.replace(line, '');
  }
  fs.writeFileSync('tools/tool-spec-manifest.json', text, 'utf8');
}

// Restore sitemap bytes from main and remove only URL blocks whose <loc>
// belongs to one of the two staged routes. Preserve all unrelated formatting.
{
  const xml = fromMain('sitemap.xml');
  let pos = 0;
  let out = '';
  while (true) {
    const open = xml.indexOf('<url>', pos);
    if (open < 0) { out += xml.slice(pos); break; }
    const closeStart = xml.indexOf('</url>', open);
    if (closeStart < 0) throw new Error('unterminated <url> block in sitemap.xml');
    const close = closeStart + '</url>'.length;
    const block = xml.slice(open, close);
    const remove = staged.some((slug) => block.includes(`https://nicheworks.app/tools/${slug}/`));
    out += xml.slice(pos, open);
    if (!remove) out += block;
    pos = close;
  }
  for (const slug of staged) {
    if (out.includes(`https://nicheworks.app/tools/${slug}/`)) throw new Error(`${slug} still present in normalized sitemap`);
  }
  fs.writeFileSync('sitemap.xml', out, 'utf8');
  fs.writeFileSync('sitemap.xml.gz', zlib.gzipSync(Buffer.from(out, 'utf8')));
}

console.log('Normalized Earth staging manifest + sitemap diff without changing semantics.');
