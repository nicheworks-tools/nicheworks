import json, pathlib, re, subprocess
root=pathlib.Path('.')
checks=[
('tools/trashnavi/iwate/morioka/index.html','https://nicheworks.app/tools/trashnavi/iwate/morioka/',False,False,['https://www.city.morioka.iwate.jp/kurashi/gomi_recycle/gomidashikata/1001153.html','https://www.city.morioka.iwate.jp/kurashi/gomi_recycle/gomidashikata/1035494.html','https://www.city.morioka.iwate.jp/kurashi/gomi_recycle/recyclingcenter/1020526/index.html']),
('tools/trashnavi/akita/akita/index.html','https://nicheworks.app/tools/trashnavi/akita/akita/',False,True,['https://www.city.akita.lg.jp/kurashi/recycle/1006071/1010211/index.html','https://www.city.akita.lg.jp/kurashi/recycle/1009021/index.html','https://www.city.akita.lg.jp/kurashi/recycle/1006080/1006201.html']),
('tools/trashnavi/fukushima/fukushima/index.html','https://nicheworks.app/tools/trashnavi/fukushima/fukushima/',True,False,['https://www.city.fukushima.fukushima.jp/kurashi/gomi-recycle/1/2/index.html','https://www.city.fukushima.fukushima.jp/kurashi/gomi-recycle/1/gomidashi/shushubi/7930.html','https://www.city.fukushima.fukushima.jp/kurashi/gomi-recycle/1/2/7909.html']),
('tools/trashnavi/ibaraki/mito/index.html','https://nicheworks.app/tools/trashnavi/ibaraki/mito/',True,True,['https://www.city.mito.lg.jp/site/gomi/1774.html','https://www.city.mito.lg.jp/site/gomi/120306.html','https://www.city.mito.lg.jp/site/gomi/4737.html']),
('tools/trashnavi/kanagawa/kawasaki/index.html','https://nicheworks.app/tools/trashnavi/kanagawa/kawasaki/',False,True,['https://www.city.kawasaki.jp/kurashi/category/261-1-10-0-0-0-0-0-0-0.html','https://www.city.kawasaki.jp/kurashi/category/261-1-6-0-0-0-0-0-0-0.html','https://www.city.kawasaki.jp/kurashi/category/261-1-10-11-0-0-0-0-0-0.html']),
('tools/trashnavi/kanagawa/sagamihara/index.html','https://nicheworks.app/tools/trashnavi/kanagawa/sagamihara/',False,True,['https://gomi.city.sagamihara.kanagawa.jp/','https://www.city.sagamihara.kanagawa.jp/kurashi/1026489/recycle/1026493/katei/1008306.html','https://www.city.sagamihara.kanagawa.jp/kurashi/1026489/recycle/1026493/katei/1008322.html']),
('tools/trashnavi/osaka/sakai/index.html','https://nicheworks.app/tools/trashnavi/osaka/sakai/',False,True,['https://www.city.sakai.lg.jp/kurashi/gomi/gomi_recy/bunbetsu/shigen/index.html','https://www.city.sakai.lg.jp/kurashi/gomi/gomi_recy/bunbetsu/chomeiichiran/index.html','https://www.city.sakai.lg.jp/kurashi/gomi/gomi_recy/bunbetsu/shigen/sodaigomi/teluketuke.html']),
('tools/trashnavi/okayama/okayama/index.html','https://nicheworks.app/tools/trashnavi/okayama/okayama/',False,True,['https://www.city.okayama.jp/kurashi/0000005082.html','https://www.city.okayama.jp/kurashi/category/1-12-7-10-3-0-0-0-0-0.html','https://www.city.okayama.jp/kurashi/0000005008.html']),
('tools/trashnavi/fukuoka/fukuoka/index.html','https://nicheworks.app/tools/trashnavi/fukuoka/fukuoka/',False,True,['https://www.city.fukuoka.lg.jp/kankyo/jigyokeigomi/life/katei-bunbetsu/kateigomi-dasikata.html','https://www.city.fukuoka.lg.jp/kankyo/kateigomi/life/katei-bunbetsu/sodaigomi.html','https://www.city.fukuoka.lg.jp/kankyo/kanri/hp/jikohannyuu.html']),
('tools/trashnavi/fukuoka/kitakyushu/index.html','https://nicheworks.app/tools/trashnavi/fukuoka/kitakyushu/',False,True,['https://www.city.kitakyushu.lg.jp/contents/924_10025.html','https://www.city.kitakyushu.lg.jp/kurashi/menu01_0394.html','https://www.city.kitakyushu.lg.jp/contents/924_10259.html'])]
for path,url,calendar,bulky,links in checks:
 html=(root/path).read_text(); assert html.count('class="official-link-card"')==3,path
 for x in links: assert x in html,(path,x)
 for x in ['id="trashnaviAmazonAffiliate"','ごみ出し・片付け用品 [PR]','/assets/amazon-affiliate.js','/tools/trashnavi/affiliate-config.js','/tools/trashnavi/affiliate-runtime.js']: assert x in html,(path,x)
 assert ('class="current-calendar-callout"' in html)==calendar,path
 title=re.search(r'<title>([^<]+)</title>',html).group(1); hero=re.search(r'<section class="municipality-hero">([\s\S]*?)</section>',html).group(1)
 if not bulky: assert '粗大ごみ' not in title and '粗大ごみ' not in hero,path
 assert f'rel="canonical" href="{url}"' in html,path
ai=json.loads((root/'tools/trashnavi/ai-reference.json').read_text()); assert ai['published_municipality_count']==64 and len(ai['municipalities'])==64
for _,url,_,_,_ in checks:
 for sm in ['sitemap.xml','sitemap-trashnavi.xml']: assert (root/sm).read_text().count(f'<loc>{url}</loc>')==1,(sm,url)
# exact final publication change set plus temporary files
pub=['tools/trashnavi/municipality-page-manifest.json','tools/trashnavi/scripts/generate-municipality-pages.mjs','tools/trashnavi/scripts/check-affiliate-contract.mjs','tools/trashnavi/index.html','tools/trashnavi/ai-reference.json','tools/trashnavi/SPEC.md','sitemap-trashnavi.xml','sitemap.xml']+[x[0] for x in checks]
status=subprocess.check_output(['git','status','--short','--untracked-files=all'],text=True).splitlines(); changed={x[3:] for x in status}; temp={'.github/trashnavi-wave28-patch-temp.py','.github/trashnavi-wave28-verify-temp.py','.github/workflows/trashnavi-wave28-publication-temp.yml'}
assert not changed-(set(pub)|temp),sorted(changed-(set(pub)|temp))
for f in pub: assert f in changed,f
assert len(set(pub))==18
print('verified Wave28 publication files:',len(pub))
