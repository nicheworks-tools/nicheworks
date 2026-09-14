import fs from 'node:fs';

const rel = 'scripts/_tmp-stage-earth-placeholders.mjs';
let s = fs.readFileSync(rel, 'utf8');
const before = `// 9) Remove the two routes from XML discovery, including nested URLs.\n{\n  const rel = 'sitemap.xml';\n  let xml = read(rel);\n  for (const slug of staged) {\n    const esc = slug.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');\n    xml = xml.replace(new RegExp(\`\\\\s*<url>[\\\\s\\\\S]*?<loc>https:\\\\/\\\\/nicheworks\\\\.app\\\\/tools\\\\/\${esc}\\\\/(?:[^<]*)?<\\\\/loc>[\\\\s\\\\S]*?<\\\\/url>\`, 'g'), '');\n  }\n  write(rel, xml.endsWith('\\n') ? xml : xml + '\\n');\n  if (fs.existsSync(p('sitemap.xml.gz'))) fs.writeFileSync(p('sitemap.xml.gz'), zlib.gzipSync(Buffer.from(xml, 'utf8')));\n}`;
const after = `// 9) Remove only URL blocks that belong to the two staged routes.\n{\n  const rel = 'sitemap.xml';\n  let xml = read(rel);\n  const blocks = [...xml.matchAll(/<url>[\\s\\S]*?<\\/url>/g)].map((match) => match[0]);\n  const kept = blocks.filter((block) => ![...staged].some((slug) => block.includes(\`https://nicheworks.app/tools/\${slug}/\`)));\n  if (kept.length === blocks.length) throw new Error('staged Earth routes were not found in sitemap.xml');\n  const prefix = xml.slice(0, xml.indexOf('<url>'));\n  const lastClose = xml.lastIndexOf('</url>');\n  const suffix = lastClose >= 0 ? xml.slice(lastClose + '</url>'.length) : '';\n  xml = prefix + kept.join('\\n') + suffix;\n  write(rel, xml.endsWith('\\n') ? xml : xml + '\\n');\n  if (fs.existsSync(p('sitemap.xml.gz'))) fs.writeFileSync(p('sitemap.xml.gz'), zlib.gzipSync(Buffer.from(xml, 'utf8')));\n}`;
if (!s.includes(before)) throw new Error('old sitemap transform block not found');
s = s.replace(before, after);
fs.writeFileSync(rel, s, 'utf8');
console.log('Patched one-shot Earth staging sitemap transform.');
