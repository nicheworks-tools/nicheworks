import json
import pathlib
import re
import subprocess

root = pathlib.Path('.')
targets = [
    ('041009', 'miyagi', 'sendai', '仙台市'),
    ('121002', 'chiba', 'chiba', '千葉市'),
    ('151009', 'niigata', 'niigata', '新潟市'),
    ('261009', 'kyoto', 'kyoto', '京都市'),
    ('271004', 'osaka', 'osaka', '大阪市'),
]

expected_links = {
    '041009': [
        'https://www.city.sendai.jp/kurashi/machi/genryo/gomi/',
        'https://www.city.sendai.jp/haiki-shido/kurashi/machi/genryo/gomi/yobi/ichiran.html',
        'https://www.city.sendai.jp/haiki-kanri/kurashi/machi/genryo/gomi/wakekata/sodaigomi.html',
    ],
    '121002': [
        'https://www.city.chiba.jp/kurashi/gomi/gomi/gomiguide/',
        'https://www.city.chiba.jp/kankyo/junkan/shushugyomu/shushubi.html',
        'https://www.city.chiba.jp/kankyo/junkan/shushugyomu/sodaigomi.html',
    ],
    '151009': [
        'https://www.city.niigata.lg.jp/kurashi/gomi/gomishigen/start.html',
        'https://www.city.niigata.lg.jp/kurashi/gomi/gomishigen/gomidasi/gomi_calemder/',
        'https://www.city.niigata.lg.jp/kurashi/gomi/gomishigen/gomidasi/niigata/discard.html',
    ],
    '261009': [
        'https://www.city.kyoto.lg.jp/kankyo/page/0000309217.html',
        'https://www.city.kyoto.lg.jp/kankyo/page/0000000509.html',
        'https://www.city.kyoto.lg.jp/kankyo/page/0000001317.html',
    ],
    '271004': [
        'https://www.city.osaka.lg.jp/kankyo/page/0000009337.html',
        'https://www.city.osaka.lg.jp/kankyo/page/0000370521.html',
        'https://www.city.osaka.lg.jp/kankyo/page/0000369355.html',
    ],
}

def run(*args):
    print('+', ' '.join(args), flush=True)
    subprocess.run(args, check=True)

# Manifest 39 -> 44, preserving compact one-entry-per-line formatting.
p = root / 'tools/trashnavi/municipality-page-manifest.json'
s = p.read_text()
manifest = json.loads(s)
assert len([x for x in manifest if x.get('publish')]) == 39
existing = {x['lgcode'] for x in manifest}
for lg, _, _, _ in targets:
    assert lg not in existing
rows = [f'  {{"lgcode":"{lg}","pref_slug":"{pref}","city_slug":"{city}","publish":true}}' for lg, pref, city, _ in targets]
s = s.rstrip()
assert s.endswith(']')
s = s[:-1].rstrip()
if not s.endswith(','):
    s += ','
p.write_text(s + '\n' + ',\n'.join(rows) + '\n]\n')

# Generator and affiliate guards 39 -> 44.
p = root / 'tools/trashnavi/scripts/generate-municipality-pages.mjs'
s = p.read_text()
old = 'if(outputs.length!==39) throw new Error(`municipality page count must be 39; got ${outputs.length}`);'
new = 'if(outputs.length!==44) throw new Error(`municipality page count must be 44; got ${outputs.length}`);'
assert s.count(old) == 1
p.write_text(s.replace(old, new))

p = root / 'tools/trashnavi/scripts/check-affiliate-contract.mjs'
s = p.read_text()
old = 'check(manifest.length === 39, `expected 39 published municipality pages, got ${manifest.length}`);'
new = 'check(manifest.length === 44, `expected 44 published municipality pages, got ${manifest.length}`);'
assert s.count(old) == 1
p.write_text(s.replace(old, new))

# TrashNavi landing-page internal links.
p = root / 'tools/trashnavi/index.html'
s = p.read_text()
anchor = '<a href="/tools/trashnavi/wakayama/wakayama/">和歌山市</a>'
assert s.count(anchor) == 1
additions = ''.join(f'<a href="/tools/trashnavi/{pref}/{city}/">{name}</a>' for _, pref, city, name in targets)
p.write_text(s.replace(anchor, anchor + additions))

# Machine-readable municipality index 39 -> 44.
p = root / 'tools/trashnavi/ai-reference.json'
data = json.loads(p.read_text())
assert data['published_municipality_count'] == 39
assert len(data['municipalities']) == 39
existing = {x['lgcode'] for x in data['municipalities']}
for lg, pref, city, _ in targets:
    assert lg not in existing
    data['municipalities'].append({
        'lgcode': lg,
        'pref_slug': pref,
        'city_slug': city,
        'url': f'https://nicheworks.app/tools/trashnavi/{pref}/{city}/',
    })
data['published_municipality_count'] = 44
data['snapshot_date'] = '2026-09-15'
head = {k: v for k, v in data.items() if k != 'municipalities'}
lines = ['{']
for k, v in head.items():
    lines.append(f'  {json.dumps(k, ensure_ascii=False)}: {json.dumps(v, ensure_ascii=False)},')
lines.append('  "municipalities": [')
for i, row in enumerate(data['municipalities']):
    comma = ',' if i < len(data['municipalities']) - 1 else ''
    lines.append('    ' + json.dumps(row, ensure_ascii=False, separators=(',', ':')) + comma)
lines += ['  ]', '}']
p.write_text('\n'.join(lines) + '\n')

# Root sitemap must be updated explicitly; generator owns sitemap-trashnavi.xml only.
p = root / 'sitemap.xml'
s = p.read_text()
blocks = []
for _, pref, city, _ in targets:
    url = f'https://nicheworks.app/tools/trashnavi/{pref}/{city}/'
    assert s.count(f'<loc>{url}</loc>') == 0
    blocks.append(f'  <url>\n    <loc>{url}</loc>\n    <lastmod>2026-09-15</lastmod>\n  </url>')
assert s.count('</urlset>') == 1
p.write_text(s.replace('</urlset>', '\n'.join(blocks) + '\n</urlset>'))

# Wave25 spec record.
p = root / 'tools/trashnavi/SPEC.md'
s = p.read_text()
assert '## Wave 25 batch publication' not in s
block = "\n".join([
    '## Wave 25 batch publication',
    '',
    'Wave 25は5自治体batch expansionを継続し、公開閾値を変更せず **39自治体から44自治体** へ拡張する。公開条件は従来どおり `municipal_home` を除く3種類以上の異なるwaste-specific official link typeであり、同一のcombined pageを複数種として数えず、外部委託先を閾値の穴埋めにも使わない。',
    '',
    '- 宮城県 仙台市 — `/tools/trashnavi/miyagi/sendai/` — waste sorting / collection calendar / bulky waste',
    '- 千葉県 千葉市 — `/tools/trashnavi/chiba/chiba/` — waste sorting / collection calendar / bulky waste',
    '- 新潟県 新潟市 — `/tools/trashnavi/niigata/niigata/` — waste sorting / collection calendar / bulky waste',
    '- 京都府 京都市 — `/tools/trashnavi/kyoto/kyoto/` — waste sorting / collection calendar / bulky waste',
    '- 大阪府 大阪市 — `/tools/trashnavi/osaka/osaka/` — waste sorting / collection calendar / bulky waste',
    '',
    'Wave 25 readiness baselineは1,916 municipalities、2,254 valid HTTP(S) records、44 preferred candidates、28 direct-link datasets / 186 records / 167 unique URLs / 0 invalid URLsとする。',
    '',
    'Publication acceptanceでは5ページすべてについてexactly 3 official cards、canonical URL、現在のofficial municipal source URL、Amazon affiliate block `[PR]`、AI reference 44/44、両sitemapへのcanonical 1件ずつを検証する。`fiscal_year: 2026` を明示する新潟市だけ2026 calendar calloutを表示し、仙台市・千葉市・京都市・大阪市には年次calloutを生成しない。現行generatorの広告プレースホルダー削除を維持し、新規ページに `ad-slot` を復活させない。Amazon契約は `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を継承する。',
])
p.write_text(s.rstrip() + '\n\n' + block + '\n')

# llms.txt intentionally has no count/list; preserve its machine-readable index handoff.
llms = (root / 'llms.txt').read_text()
assert 'https://nicheworks.app/tools/trashnavi/ai-reference.json' in llms

# Generate all municipality pages and TrashNavi sitemap from the current generator.
run('node', 'tools/trashnavi/scripts/generate-municipality-pages.mjs')

checks = [
    ('041009', 'tools/trashnavi/miyagi/sendai/index.html', 'https://nicheworks.app/tools/trashnavi/miyagi/sendai/', False),
    ('121002', 'tools/trashnavi/chiba/chiba/index.html', 'https://nicheworks.app/tools/trashnavi/chiba/chiba/', False),
    ('151009', 'tools/trashnavi/niigata/niigata/index.html', 'https://nicheworks.app/tools/trashnavi/niigata/niigata/', True),
    ('261009', 'tools/trashnavi/kyoto/kyoto/index.html', 'https://nicheworks.app/tools/trashnavi/kyoto/kyoto/', False),
    ('271004', 'tools/trashnavi/osaka/osaka/index.html', 'https://nicheworks.app/tools/trashnavi/osaka/osaka/', False),
]
for lg, path, canonical, annual in checks:
    html = pathlib.Path(path).read_text()
    assert html.count('class="official-link-card"') == 3, path
    for url in expected_links[lg]:
        assert url in html, (path, url)
    assert f'rel="canonical" href="{canonical}"' in html, path
    assert ('class="current-calendar-callout"' in html) == annual, path
    for needle in [
        'id="trashnaviAmazonAffiliate"',
        'ごみ出し・片付け用品 [PR]',
        '/assets/amazon-affiliate.js',
        '/tools/trashnavi/affiliate-config.js',
        '/tools/trashnavi/affiliate-runtime.js',
    ]:
        assert needle in html, (path, needle)
    assert 'class="ad-slot' not in html, f'{path}: removed ad placeholder resurrected'

ai = json.loads((root / 'tools/trashnavi/ai-reference.json').read_text())
assert ai['published_municipality_count'] == 44
assert len(ai['municipalities']) == 44
for lg, _, canonical, _ in [(lg, path, canonical, annual) for lg, path, canonical, annual in checks]:
    assert sum(1 for x in ai['municipalities'] if x['lgcode'] == lg and x['url'] == canonical) == 1
for _, _, canonical, _ in checks:
    for sm in ['sitemap.xml', 'sitemap-trashnavi.xml']:
        text = (root / sm).read_text()
        assert text.count(f'<loc>{canonical}</loc>') == 1, (sm, canonical)

# Required Wave audits.
for cmd in [
    ['node', 'tools/trashnavi/scripts/audit-coverage.mjs', '--strict'],
    ['node', 'scripts/check-trashnavi-direct-links.mjs', '--inventory'],
    ['node', 'tools/trashnavi/scripts/generate-municipality-pages.mjs', '--check'],
    ['node', 'tools/trashnavi/scripts/check-affiliate-contract.mjs'],
    ['node', 'tools/trashnavi/scripts/check-runtime-contract.mjs'],
    ['git', 'diff', '--check'],
]:
    run(*cmd)

allowed = {
    '.github/workflows/trashnavi-wave25-publication-temp.yml',
    '.github/trashnavi-wave25-publication-temp.py',
    'tools/trashnavi/municipality-page-manifest.json',
    'tools/trashnavi/scripts/generate-municipality-pages.mjs',
    'tools/trashnavi/scripts/check-affiliate-contract.mjs',
    'tools/trashnavi/index.html',
    'tools/trashnavi/ai-reference.json',
    'tools/trashnavi/SPEC.md',
    'tools/trashnavi/miyagi/sendai/index.html',
    'tools/trashnavi/chiba/chiba/index.html',
    'tools/trashnavi/niigata/niigata/index.html',
    'tools/trashnavi/kyoto/kyoto/index.html',
    'tools/trashnavi/osaka/osaka/index.html',
    'sitemap-trashnavi.xml',
    'sitemap.xml',
}
status = subprocess.check_output(['git', 'status', '--short', '--untracked-files=all'], text=True).splitlines()
changed = {line[3:] for line in status}
extra = changed - allowed
assert not extra, sorted(extra)
print('publication changed files:', sorted(changed))

run('git', 'config', 'user.name', 'github-actions[bot]')
run('git', 'config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
publication_files = [
    'tools/trashnavi/municipality-page-manifest.json',
    'tools/trashnavi/scripts/generate-municipality-pages.mjs',
    'tools/trashnavi/scripts/check-affiliate-contract.mjs',
    'tools/trashnavi/index.html',
    'tools/trashnavi/ai-reference.json',
    'tools/trashnavi/SPEC.md',
    'tools/trashnavi/miyagi/sendai/index.html',
    'tools/trashnavi/chiba/chiba/index.html',
    'tools/trashnavi/niigata/niigata/index.html',
    'tools/trashnavi/kyoto/kyoto/index.html',
    'tools/trashnavi/osaka/osaka/index.html',
    'sitemap-trashnavi.xml',
    'sitemap.xml',
]
run('git', 'add', *publication_files)
run('git', 'diff', '--cached', '--check')
run('git', 'commit', '-m', 'Publish five TrashNavi Wave25 municipality pages')

# Remove temporary execution files before the single push so they never remain in final PR diff.
run('git', 'rm', '.github/workflows/trashnavi-wave25-publication-temp.yml', '.github/trashnavi-wave25-publication-temp.py')
run('git', 'commit', '-m', 'Remove TrashNavi Wave25 publication runner')
run('git', 'push', 'origin', 'HEAD:feat/trashnavi-batch-wave25-publication-20260915')
