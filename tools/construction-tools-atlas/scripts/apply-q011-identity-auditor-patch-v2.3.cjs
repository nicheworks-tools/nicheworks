const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');
const PUBLICATION = path.join(ROOT, 'scripts', 'audit-publication-corpus-v2.3.cjs');
const CONTENT = path.join(ROOT, 'scripts', 'audit-public-content-quality-v2.3.cjs');

function replaceOnce(source, before, after, label) {
  const count = source.split(before).length - 1;
  if (count === 0) {
    if (source.includes(after)) return source;
    throw new Error(`${label}: anchor not found`);
  }
  if (count !== 1) throw new Error(`${label}: expected one anchor, found ${count}`);
  return source.replace(before, after);
}

let publication = fs.readFileSync(PUBLICATION, 'utf8');
publication = replaceOnce(
  publication,
  "const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');\n",
  "const REDIRECT_PATH = path.join(DATA, 'canonical-redirects-v2.3.json');\nconst IDENTITY_PATH = path.join(DATA, 'canonical-identity-resolutions-v2.3.json');\n",
  'publication identity path'
);
publication = replaceOnce(
  publication,
  '  const manifest = readJson(MANIFEST_PATH);\n  const redirectMap = buildRedirectMap();\n',
  "  const manifest = readJson(MANIFEST_PATH);\n  const redirectMap = buildRedirectMap();\n  const identity = readJson(IDENTITY_PATH);\n  const typeOverrideMap = new Map(array(identity?.type_overrides).map((row) => [text(row?.id), text(row?.to)]).filter(([id, to]) => id && to));\n",
  'publication identity map'
);
publication = replaceOnce(
  publication,
  '      const id = text(row?.id || row?.slug);\n      const type = sourceType(row);\n',
  '      const id = text(row?.id || row?.slug);\n      const type = typeOverrideMap.get(id) || sourceType(row);\n',
  'publication effective type'
);
publication = replaceOnce(
  publication,
  "      version: '2026-09-15-canonical-redirects-3',\n",
  "      version: '2026-09-16-q011-identity-closure-1',\n",
  'publication version'
);
fs.writeFileSync(PUBLICATION, publication);

let content = fs.readFileSync(CONTENT, 'utf8');
content = replaceOnce(
  content,
  '    const type = typeOf(source.row);\n',
  '    const type = typeOf(publicEntry);\n',
  'content runtime type'
);
content = replaceOnce(
  content,
  "    version: '2026-09-15-content-wave1-2',\n",
  "    version: '2026-09-16-q011-identity-closure-1',\n",
  'content version'
);
fs.writeFileSync(CONTENT, content);

console.log('Applied q011 identity-aware auditor patch.');
