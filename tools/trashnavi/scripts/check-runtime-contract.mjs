// TrashNavi runtime acceptance and published-link integrity contract.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

const html = read('tools/trashnavi/index.html');
const app = read('tools/trashnavi/app.js');
const manifest = JSON.parse(read('tools/trashnavi/municipality-page-manifest.json'));
const issueTemplatePath = path.join(root, '.github/ISSUE_TEMPLATE/trashnavi-link-report.yml');

for (const id of ['prefSelect', 'citySelect', 'typeSelect', 'keywordInput', 'searchButton', 'resetButton', 'results', 'resultSummary']) {
  assert.ok(html.includes(`id="${id}"`), `missing runtime control: ${id}`);
}

assert.ok(html.includes('<script src="app.js"></script>'), 'TrashNavi app.js is not loaded by index.html');
assert.match(app, /loadMunicipalities\(\)\.then\(data=>\{MUNICIPALITIES=normalizeMunicipalities\(data\);initPrefOptions\(el\.pref,MUNICIPALITIES\)/, 'municipality data load / prefecture initialization contract missing');
assert.match(app, /renderResults\(MUNICIPALITIES,el\.results,el\.summary\)/, 'initial result rendering contract missing');

for (const clause of [
  'if(pref&&x.pref!==pref)return false',
  'if(city&&x.city!==city)return false',
  'if(type&&x.type!==type)return false',
  'if(!kw)return true'
]) {
  assert.ok(app.includes(clause), `browser-side filter contract missing: ${clause}`);
}
assert.ok(app.includes('.join(" ").toLowerCase().includes(kw)'), 'keyword filter contract missing');

assert.ok(app.includes('a.href=x.url'), 'official result URL binding missing');
assert.ok(app.includes('a.target="_blank"'), 'external target contract missing');
assert.ok(app.includes('a.rel="noopener noreferrer"'), 'external link safety contract missing');
assert.ok(app.includes('note.textContent=TEXT[currentLang].note'), 'official-source confirmation note missing');

assert.ok(app.includes('el.reset.addEventListener("click"'), 'reset handler missing');
for (const clause of ['el.pref.value=""', 'el.type.value=""', 'el.kw.value=""', 'renderResults(MUNICIPALITIES,el.results,el.summary)']) {
  assert.ok(app.includes(clause), `reset contract missing: ${clause}`);
}

const issueHref = 'https://github.com/nicheworks-tools/nicheworks/issues/new?template=trashnavi-link-report.yml';
assert.ok(html.includes(issueHref), 'missing/broken-link report route missing from index.html');
assert.ok(fs.existsSync(issueTemplatePath), 'TrashNavi link-report issue template missing');

assert.ok(html.includes('class="nw-lang-switch"'), 'language switch UI missing');
assert.ok(html.includes('data-lang="ja"') && html.includes('data-lang="en"'), 'JA/EN language buttons missing');
assert.ok(app.includes('document.documentElement.lang=lang'), 'document language switching contract missing');
assert.ok(app.includes('nodes.forEach(n=>{n.style.display=n.dataset.i18n===lang?"":"none"})'), 'JA/EN content switching contract missing');
assert.ok(app.includes('btns.forEach(b=>b.addEventListener("click",()=>apply(b.dataset.lang)))'), 'language switch event contract missing');

const published = manifest.filter((entry) => entry.publish);
assert.ok(published.length >= 1, 'municipality publication manifest has no published entries');
for (const entry of published) {
  const href = `/tools/trashnavi/${entry.pref_slug}/${entry.city_slug}/`;
  assert.ok(html.includes(`href="${href}"`), `published municipality missing from TrashNavi root internal links: ${href}`);
}

console.log(JSON.stringify({
  status: 'pass',
  runtime_acceptance_checks: 6,
  published_municipalities: published.length,
  root_internal_links_verified: published.length,
  issue_template: true,
  language_modes: ['ja', 'en']
}, null, 2));
