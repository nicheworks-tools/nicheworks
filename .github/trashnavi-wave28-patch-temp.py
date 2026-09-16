import json, pathlib, re
root=pathlib.Path('.')
targets=[
('032018','iwate','morioka','盛岡市'),('052019','akita','akita','秋田市'),('072010','fukushima','fukushima','福島市'),('082015','ibaraki','mito','水戸市'),('141305','kanagawa','kawasaki','川崎市'),('141500','kanagawa','sagamihara','相模原市'),('271403','osaka','sakai','堺市'),('331007','okayama','okayama','岡山市'),('401307','fukuoka','fukuoka','福岡市'),('401005','fukuoka','kitakyushu','北九州市')]
# manifest
p=root/'tools/trashnavi/municipality-page-manifest.json'; s=p.read_text(); assert s.count('"publish":true')==54
for lg,_,_,_ in targets: assert f'"lgcode":"{lg}"' not in s
rows=[f'  {{"lgcode":"{lg}","pref_slug":"{pref}","city_slug":"{city}","publish":true}}' for lg,pref,city,_ in targets]
s=s.rstrip(); assert s.endswith(']'); s=s[:-1].rstrip(); s += ('' if s.endswith(',') else ',')
p.write_text(s+'\n'+',\n'.join(rows)+'\n]\n')
# generator guard
p=root/'tools/trashnavi/scripts/generate-municipality-pages.mjs'; lines=p.read_text().splitlines(); hits=[i for i,l in enumerate(lines) if 'outputs.length' in l and 'municipality page count' in l and '54' in l]; assert len(hits)==1, hits
i=hits[0]; lines[i]=lines[i].replace('!==54','!==64').replace('must be 54','must be 64'); assert '64' in lines[i] and '54' not in lines[i]; p.write_text('\n'.join(lines)+'\n')
# affiliate guard
p=root/'tools/trashnavi/scripts/check-affiliate-contract.mjs'; s=p.read_text(); old='check(manifest.length === 54, `expected 54 published municipality pages, got ${manifest.length}`);'; new='check(manifest.length === 64, `expected 64 published municipality pages, got ${manifest.length}`);'; assert s.count(old)==1; p.write_text(s.replace(old,new))
# landing page links
p=root/'tools/trashnavi/index.html'; s=p.read_text()
for _,pref,city,_ in targets: assert f'/tools/trashnavi/{pref}/{city}/' not in s
adds=''.join(f'<a href="/tools/trashnavi/{pref}/{city}/">{name}</a>' for _,pref,city,name in targets)
m=re.search(r'(<div class="municipality-related-links">)(.*?)(</div>)',s,re.S); assert m
s=s[:m.start()]+m.group(1)+m.group(2)+adds+m.group(3)+s[m.end():]; p.write_text(s)
# AI ref
p=root/'tools/trashnavi/ai-reference.json'; data=json.loads(p.read_text()); assert data['published_municipality_count']==54 and len(data['municipalities'])==54; existing={x['lgcode'] for x in data['municipalities']}
for lg,pref,city,_ in targets:
 assert lg not in existing; data['municipalities'].append({'lgcode':lg,'pref_slug':pref,'city_slug':city,'url':f'https://nicheworks.app/tools/trashnavi/{pref}/{city}/'})
data['published_municipality_count']=64; data['snapshot_date']='2026-09-16'; head={k:v for k,v in data.items() if k!='municipalities'}; out=['{']
for k,v in head.items(): out.append(f'  {json.dumps(k,ensure_ascii=False)}: {json.dumps(v,ensure_ascii=False)},')
out.append('  "municipalities": [')
for i,row in enumerate(data['municipalities']): out.append('    '+json.dumps(row,ensure_ascii=False,separators=(',',':'))+(',' if i<len(data['municipalities'])-1 else ''))
out += ['  ]','}']; p.write_text('\n'.join(out)+'\n')
# root sitemap
p=root/'sitemap.xml'; s=p.read_text(); blocks=[]
for _,pref,city,_ in targets:
 url=f'https://nicheworks.app/tools/trashnavi/{pref}/{city}/'; assert s.count(f'<loc>{url}</loc>')==0; blocks.append(f'  <url>\n    <loc>{url}</loc>\n    <lastmod>2026-09-16</lastmod>\n  </url>')
assert s.count('</urlset>')==1; p.write_text(s.replace('</urlset>','\n'.join(blocks)+'\n</urlset>'))
# SPEC
p=root/'tools/trashnavi/SPEC.md'; s=p.read_text(); assert '## Wave 28 ten-municipality publication' not in s
block='''## Wave 28 ten-municipality publication

Wave 28は50自治体到達後のbatch scaling ruleに従い、公開閾値を変更せず **54自治体から64自治体** へ10自治体一括で拡張する。公開条件は従来どおり `municipal_home` を除く3種類以上の異なるwaste-specific official link typeとし、同一combined pageの二重計上や外部委託先による閾値補完は行わない。

- 岩手県 盛岡市 — `/tools/trashnavi/iwate/morioka/` — waste sorting / waste app / drop-off facility
- 秋田県 秋田市 — `/tools/trashnavi/akita/akita/` — waste sorting / collection calendar / bulky waste
- 福島県 福島市 — `/tools/trashnavi/fukushima/fukushima/` — waste sorting / collection calendar / waste app
- 茨城県 水戸市 — `/tools/trashnavi/ibaraki/mito/` — waste sorting / collection calendar / bulky waste
- 神奈川県 川崎市 — `/tools/trashnavi/kanagawa/kawasaki/` — waste sorting / collection calendar / bulky waste
- 神奈川県 相模原市 — `/tools/trashnavi/kanagawa/sagamihara/` — waste sorting / collection calendar / bulky waste
- 大阪府 堺市 — `/tools/trashnavi/osaka/sakai/` — waste sorting / collection calendar / bulky waste
- 岡山県 岡山市 — `/tools/trashnavi/okayama/okayama/` — waste sorting / collection calendar / bulky waste
- 福岡県 福岡市 — `/tools/trashnavi/fukuoka/fukuoka/` — waste sorting / bulky waste / drop-off facility
- 福岡県 北九州市 — `/tools/trashnavi/fukuoka/kitakyushu/` — waste sorting / collection calendar / bulky waste

Wave 28 readiness baselineは1,916 municipalities、2,294 valid HTTP(S) records、64 preferred candidates、31 direct-link datasets / 226 records / 207 unique URLs / 0 invalid URLsとする。

Publication acceptanceでは10ページすべてについてexactly 3 official cards、canonical URL、確認済みofficial source URL、Amazon affiliate block `[PR]`、AI reference 64/64、両sitemapへのcanonical 1件ずつを検証する。`fiscal_year: 2026` を明示する福島市・水戸市だけ2026 calendar calloutを表示する。盛岡市と福島市はbulky sourceを持たないためmetadata/heroで粗大ごみcoverageを広告しない。Amazon契約は既存の `nicheworks09-22` / 4 fixed searches / municipality・runtime state非送信を継承する。'''
p.write_text(s.rstrip()+'\n\n'+block.rstrip()+'\n')
