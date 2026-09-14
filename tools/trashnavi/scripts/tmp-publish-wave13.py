from pathlib import Path

root = Path(__file__).resolve().parents[3]
tool = root / 'tools' / 'trashnavi'


def replace_once(path, old, new):
    text = path.read_text(encoding='utf-8')
    if old not in text:
        raise SystemExit(f'anchor missing in {path}: {old[:120]!r}')
    if text.count(old) != 1:
        raise SystemExit(f'anchor not unique in {path}: {old[:120]!r}')
    path.write_text(text.replace(old, new, 1), encoding='utf-8')

# 1) Publication allowlist: 19 -> 20, add Tsu.
manifest = tool / 'municipality-page-manifest.json'
replace_once(
    manifest,
    '  {"lgcode":"442011","pref_slug":"oita","city_slug":"oita","publish":true}\n]',
    '  {"lgcode":"442011","pref_slug":"oita","city_slug":"oita","publish":true},\n'
    '  {"lgcode":"242012","pref_slug":"mie","city_slug":"tsu","publish":true}\n]'
)

# 2) Generator publication-count guard: 19 -> 20.
generator = tool / 'scripts' / 'generate-municipality-pages.mjs'
replace_once(
    generator,
    "if(outputs.length!==19) throw new Error(`municipality page count must be 19; got ${outputs.length}`);",
    "if(outputs.length!==20) throw new Error(`municipality page count must be 20; got ${outputs.length}`);"
)

# 3) Root TrashNavi page: add Tsu and update displayed data date.
index = tool / 'index.html'
text = index.read_text(encoding='utf-8')
old_tail = '<a href="/tools/trashnavi/oita/oita/">大分市</a></div>'
new_tail = '<a href="/tools/trashnavi/oita/oita/">大分市</a><a href="/tools/trashnavi/mie/tsu/">津市</a></div>'
if text.count(old_tail) != 1:
    raise SystemExit('TrashNavi root municipality-list anchor missing/not unique')
text = text.replace(old_tail, new_tail, 1)
text = text.replace('データ更新日：2026-09-13', 'データ更新日：2026-09-14', 1)
text = text.replace('Data updated: 2026-09-13', 'Data updated: 2026-09-14', 1)
index.write_text(text, encoding='utf-8')

# 4) Root sitemap: add the canonical Tsu municipality URL exactly once.
root_sitemap = root / 'sitemap.xml'
text = root_sitemap.read_text(encoding='utf-8')
tsu_loc = '<loc>https://nicheworks.app/tools/trashnavi/mie/tsu/</loc>'
if tsu_loc in text:
    raise SystemExit('Tsu URL already present in root sitemap')
oita_block = '  <url>\n    <loc>https://nicheworks.app/tools/trashnavi/oita/oita/</loc>\n    <lastmod>2026-09-13</lastmod>\n  </url>\n'
tsu_block = '  <url>\n    <loc>https://nicheworks.app/tools/trashnavi/mie/tsu/</loc>\n    <lastmod>2026-09-14</lastmod>\n  </url>\n'
if text.count(oita_block) != 1:
    raise SystemExit('Oita root-sitemap anchor missing/not unique')
root_sitemap.write_text(text.replace(oita_block, oita_block + tsu_block, 1), encoding='utf-8')

# 5) SPEC: synchronize Wave 13 publication, measured baseline and evidence.
spec_path = tool / 'SPEC.md'
spec = spec_path.read_text(encoding='utf-8')
wave12_anchor = '- 大分県 大分市 — `/tools/trashnavi/oita/oita/`\n'
wave13_text = '''\nWave 13では、供給側拡張方針を維持し、既存direct-link coverageが1種類止まりの県庁所在地から津市を選定した。津市公式の令和8年度家庭ごみ収集カレンダーと大型家具の処分案内を追加し、既存のごみ分別導線と合わせてpreferred candidateへ引き上げた。data enrichment検証後、公開対象を **20自治体** とする。\n\n- 三重県 津市 — `/tools/trashnavi/mie/tsu/`\n'''
if wave12_anchor not in spec:
    raise SystemExit('Wave 12 publication anchor missing in SPEC')
spec = spec.replace(wave12_anchor, wave12_anchor + wave13_text, 1)

# Insert measured Wave 13 baseline immediately after the Wave 12 baseline section.
wave12_heading = '### Wave 12 verified coverage baseline'
pos = spec.find(wave12_heading)
if pos < 0:
    raise SystemExit('Wave 12 baseline heading missing in SPEC')
next_heading = spec.find('\n### ', pos + len(wave12_heading))
if next_heading < 0:
    raise SystemExit('Could not locate heading after Wave 12 baseline')
wave13_baseline = '''\n\n### Wave 13 verified coverage baseline\n\n2026-09-14のWave 13 CI基準値は次のとおり。\n\n- municipalities: 1,916\n- records: 2,204 / 2,204 valid HTTP(S)\n- municipalities with any waste-specific direct link: 78\n- publish candidates (2+ types): 20\n- preferred candidates (3+ types): 20\n- collection calendar coverage: 20 municipalities\n- bulky-waste coverage: 19 municipalities\n- drop-off facility coverage: 1 municipality\n- waste-app coverage: 1 municipality\n- direct-link inventory: 16 datasets / 136 records / 117 unique URLs / 0 invalid URLs\n- invalid records: 0\n- unknown type labels: 0\n'''
spec = spec[:next_heading] + wave13_baseline + spec[next_heading:]

spec = spec.replace('- [x] 公開19自治体をmanifest allowlistで管理する。', '- [x] 公開20自治体をmanifest allowlistで管理する。', 1)
spec = spec.replace('- [x] generator `--check` で19ページの生成driftを検出する。', '- [x] generator `--check` で20ページの生成driftを検出する。', 1)
spec = spec.replace('- [x] Wave 12で大分市をpreferred candidateへ引き上げ、自治体pageを公開する。', '- [x] Wave 12で大分市をpreferred candidateへ引き上げ、自治体pageを公開する。\n- [x] Wave 13で津市をpreferred candidateへ引き上げ、自治体pageを公開する。', 1)
spec = spec.replace('- `tools/trashnavi/data/direct-waste-links-supply-wave12.json` — 大分市のWave 12 collection-calendar / bulky-waste enrichment。', '- `tools/trashnavi/data/direct-waste-links-supply-wave12.json` — 大分市のWave 12 collection-calendar / bulky-waste enrichment。\n- `tools/trashnavi/data/direct-waste-links-supply-wave13.json` — 津市のWave 13 collection-calendar / bulky-waste enrichment。', 1)
spec = spec.replace('- `tools/trashnavi/oita/oita/index.html` — Wave 12 municipality page。', '- `tools/trashnavi/oita/oita/index.html` — Wave 12 municipality page。\n- `tools/trashnavi/mie/tsu/index.html` — Wave 13 municipality page。', 1)
spec = spec.replace('- 現在のmunicipality expansionではaffiliate block自体を追加しない。', '- municipality pageのaffiliate blockは自治体official linkと視覚的・意味的に分離し、自治体固有情報やuser/runtime stateをAmazon queryへ渡さない。', 1)
spec_path.write_text(spec, encoding='utf-8')

print('Wave 13 publication staging complete')
