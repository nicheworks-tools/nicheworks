import json
import pathlib
import re
import subprocess

root = pathlib.Path('.')
targets = [
    ('011002', 'hokkaido', 'sapporo', '札幌市'),
    ('141003', 'kanagawa', 'yokohama', '横浜市'),
    ('192015', 'yamanashi', 'kofu', '甲府市'),
    ('231002', 'aichi', 'nagoya', '名古屋市'),
    ('302015', 'wakayama', 'wakayama', '和歌山市'),
]

def run(*args):
    print('+', ' '.join(args), flush=True)
    subprocess.run(args, check=True)

# Manifest 34 -> 39.
p = root / 'tools/trashnavi/municipality-page-manifest.json'
s = p.read_text()
assert s.count('"publish":true') == 34
for lg, _, _, _ in targets:
    assert f'"lgcode":"{lg}"' not in s
rows = [f'  {{"lgcode":"{lg}","pref_slug":"{pref}","city_slug":"{city}","publish":true}}' for lg, pref, city, _ in targets]
s = s.rstrip()
assert s.endswith(']')
s = s[:-1].rstrip()
if not s.endswith(','):
    s += ','
p.write_text(s + '\n' + ',\n'.join(rows) + '\n]\n')

# Generator and affiliate publication guards 34 -> 39.
p = root / 'tools/trashnavi/scripts/generate-municipality-pages.mjs'
s = p.read_text()
old = 'if(outputs.length!==34) throw new Error(`municipality page count must be 34; got ${outputs.length}`);'
new = 'if(outputs.length!==39) throw new Error(`municipality page count must be 39; got ${outputs.length}`);'
assert s.count(old) == 1
p.write_text(s.replace(old, new))

p = root / 'tools/trashnavi/scripts/check-affiliate-contract.mjs'
s = p.read_text()
old = 'check(manifest.length === 34, `expected 34 published municipality pages, got ${manifest.length}`);'
new = 'check(manifest.length === 39, `expected 39 published municipality pages, got ${manifest.length}`);'
assert s.count(old) == 1
p.write_text(s.replace(old, new))

# Landing page links.
p = root / 'tools/trashnavi/index.html'
s = p.read_text()
anchor = '<a href="/tools/trashnavi/gifu/gifu/">岐阜市</a>'
assert s.count(anchor) == 1
additions = ''.join(f'<a href="/tools/trashnavi/{pref}/{city}/">{name}</a>' for _, pref, city, name in targets)
p.write_text(s.replace(anchor, anchor + additions))

# AI discovery 34 -> 39 while retaining compact municipality rows.
p = root / 'tools/trashnavi/ai-reference.json'
data = json.loads(p.read_text())
assert data['published_municipality_count'] == 34
assert len(data['municipalities']) == 34
existing = {x['lgcode'] for x in data['municipalities']}
for lg, pref, city, _ in targets:
    assert lg not in existing
    data['municipalities'].append({'lgcode': lg, 'pref_slug': pref, 'city_slug': city, 'url': f'https://nicheworks.app/tools/trashnavi/{pref}/{city}/'})
data['published_municipality_count'] = 39
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

# Root sitemap is explicit; generator only writes sitemap-trashnavi.xml.
p = root / 'sitemap.xml'
s = p.read_text()
blocks = []
for _, pref, city, _ in targets:
    url = f'https://nicheworks.app/tools/trashnavi/{pref}/{city}/'
    assert s.count(f'<loc>{url}</loc>') == 0
    blocks.append(f'  <url>\n    <loc>{url}</loc>\n    <lastmod>2026-09-15</lastmod>\n  </url>')
assert s.count('</urlset>') == 1
p.write_text(s.replace('</urlset>', '\n'.join(blocks) + '\n</urlset>'))

# Wave24 spec record.
p = root / 'tools/trashnavi/SPEC.md'
s = p.read_text()
assert '## Wave 24 batch publication' not in s
block = "\n".join([
    '## Wave 24 batch publication',
    '',
    'Wave 24はWave 23で成立した5自治体batch expansionを継続し、公開閾値を変更せず **34自治体から39自治体** へ拡張する。公開条件は従来どおり `municipal_home` を除く3種類以上の異なるwaste-specific official link typeであり、外部委託先を閾値の穴埋めには使わない。',
    '',
    '- 北海道 札幌市 — `/tools/trashnavi/hokkaido/sapporo/` — waste sorting / collection calendar / bulky waste',
    '- 神奈川県 横浜市 — `/tools/trashnavi/kanagawa/yokohama/` — waste sorting / collection calendar / bulky waste',
    '- 山梨県 甲府市 — `/tools/trashnavi/yamanashi/kofu/` — waste sorting / collection calendar / waste app',
    '- 愛知県 名古屋市 — `/tools/trashnavi/aichi/nagoya/` — waste sorting / collection calendar / bulky waste',
    '- 和歌山県 和歌山市 — `/tools/trashnavi/wakayama/wakayama/` — waste sorting / bulky waste / drop-off facility',
    '',
    'Wave 24 readiness baselineは1,916 municipalities、2,244 valid HTTP(S) records、39 preferred candidates、27 direct-link datasets / 176 records / 157 unique URLs / 0 invalid URLsとする。',
    '',
    'Publication acceptanceでは5ページすべてについてexactly 3 official cards、canonical URL、現在のofficial source URL、Amazon affiliate block `[PR]`、AI reference 39/39、両sitemapへのcanonical 1件ずつを検証する。`fiscal_year: 2026` を明示する甲府市だけ2026 calendar calloutを表示し、札幌市・横浜市・名古屋市・和歌山市には年次calloutを生成しない。甲府市はbulky sourceを持たないためmetadata/heroで粗大ごみcoverageを広告しない。Amazon契約は既存の `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を継承する。',
])
p.write_text(s.rstrip() + '\n\n' + block + '\n')

run('node', 'tools/trashnavi/scripts/generate-municipality-pages.mjs')

checks = [
    {'path': 'tools/trashnavi/hokkaido/sapporo/index.html', 'url': 'https://nicheworks.app/tools/trashnavi/hokkaido/sapporo/', 'calendar': False, 'bulky': True, 'links': ['https://www.city.sapporo.jp/seiso/gomi/dashikata_menu.html', 'https://www.city.sapporo.jp/seiso/kaisyu/', 'https://www.city.sapporo.jp/seiso/gomi/oogatagomi.html']},
    {'path': 'tools/trashnavi/kanagawa/yokohama/index.html', 'url': 'https://nicheworks.app/tools/trashnavi/kanagawa/yokohama/', 'calendar': False, 'bulky': True, 'links': ['https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/gomi-recycle/gomi/dashikata.html', 'https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/gomi-recycle/gomi/shushuyobi/', 'https://www.city.yokohama.lg.jp/kurashi/sumai-kurashi/gomi-recycle/gomi/shushu/sodaigomi/dashikata/shuushuu.html']},
    {'path': 'tools/trashnavi/yamanashi/kofu/index.html', 'url': 'https://nicheworks.app/tools/trashnavi/yamanashi/kofu/', 'calendar': True, 'bulky': False, 'links': ['https://www.city.kofu.yamanashi.jp/genryo/kurashi/gomi/bunbetsu/index.html', 'https://www.city.kofu.yamanashi.jp/shushu/tikubetunitteihyou/r4nitteihyou/20240129.html', 'https://www.city.kofu.yamanashi.jp/genryo/apuri.html']},
    {'path': 'tools/trashnavi/aichi/nagoya/index.html', 'url': 'https://nicheworks.app/tools/trashnavi/aichi/nagoya/', 'calendar': False, 'bulky': True, 'links': ['https://www.city.nagoya.jp/kurashi/gomi/1012183/index.html', 'https://www.city.nagoya.jp/kurashi/gomi/1012183/1037098.html', 'https://www.city.nagoya.jp/kurashi/gomi/1012183/1035058/1012184/1033988.html']},
    {'path': 'tools/trashnavi/wakayama/wakayama/index.html', 'url': 'https://nicheworks.app/tools/trashnavi/wakayama/wakayama/', 'calendar': False, 'bulky': True, 'links': ['https://www.city.wakayama.wakayama.jp/kurashi/gomi_kankyo/1001116/index.html', 'https://www.city.wakayama.wakayama.jp/kurashi/gomi_kankyo/1001113/1005184/1037075/1037074.html', 'https://www.city.wakayama.wakayama.jp/kurashi/gomi_kankyo/1001113/1019036/1019037.html']},
]
for t in checks:
    html = pathlib.Path(t['path']).read_text()
    assert html.count('class="official-link-card"') == 3, t['path']
    for url in t['links']:
        assert url in html, (t['path'], url)
    for needle in ['id="trashnaviAmazonAffiliate"', 'ごみ出し・片付け用品 [PR]', '/assets/amazon-affiliate.js', '/tools/trashnavi/affiliate-config.js', '/tools/trashnavi/affiliate-runtime.js']:
        assert needle in html, (t['path'], needle)
    assert ('class="current-calendar-callout"' in html) == t['calendar'], t['path']
    title = re.search(r'<title>([^<]+)</title>', html).group(1)
    hero = re.search(r'<section class="municipality-hero">([\s\S]*?)</section>', html).group(1)
    if not t['bulky']:
        assert '粗大ごみ' not in title
        assert '粗大ごみ' not in hero
    assert f'rel="canonical" href="{t["url"]}"' in html

ai = json.loads((root / 'tools/trashnavi/ai-reference.json').read_text())
assert ai['published_municipality_count'] == 39
assert len(ai['municipalities']) == 39
for t in checks:
    for sm in ['sitemap.xml', 'sitemap-trashnavi.xml']:
        text = (root / sm).read_text()
        assert text.count(f'<loc>{t["url"]}</loc>') == 1, (sm, t['url'])

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
    '.github/workflows/trashnavi-wave24-publication-v2-temp.yml',
    '.github/trashnavi-wave24-publication-temp.py',
    'tools/trashnavi/municipality-page-manifest.json',
    'tools/trashnavi/scripts/generate-municipality-pages.mjs',
    'tools/trashnavi/scripts/check-affiliate-contract.mjs',
    'tools/trashnavi/index.html',
    'tools/trashnavi/ai-reference.json',
    'tools/trashnavi/SPEC.md',
    'tools/trashnavi/hokkaido/sapporo/index.html',
    'tools/trashnavi/kanagawa/yokohama/index.html',
    'tools/trashnavi/yamanashi/kofu/index.html',
    'tools/trashnavi/aichi/nagoya/index.html',
    'tools/trashnavi/wakayama/wakayama/index.html',
    'sitemap-trashnavi.xml',
    'sitemap.xml',
}
status = subprocess.check_output(['git', 'status', '--short'], text=True).splitlines()
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
    'tools/trashnavi/hokkaido/sapporo/index.html',
    'tools/trashnavi/kanagawa/yokohama/index.html',
    'tools/trashnavi/yamanashi/kofu/index.html',
    'tools/trashnavi/aichi/nagoya/index.html',
    'tools/trashnavi/wakayama/wakayama/index.html',
    'sitemap-trashnavi.xml',
    'sitemap.xml',
]
run('git', 'add', *publication_files)
run('git', 'diff', '--cached', '--check')
run('git', 'commit', '-m', 'Publish five TrashNavi Wave24 municipality pages')
run('git', 'push', 'origin', 'HEAD:feat/trashnavi-batch-wave24-publication-20260915')
run('git', 'rm', '.github/workflows/trashnavi-wave24-publication-v2-temp.yml', '.github/trashnavi-wave24-publication-temp.py')
run('git', 'commit', '-m', 'Remove TrashNavi Wave24 publication workflow')
run('git', 'push', 'origin', 'HEAD:feat/trashnavi-batch-wave24-publication-20260915')
