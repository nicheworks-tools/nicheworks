from pathlib import Path

app=Path('tools/pattern-dictionary/app.js')
s=app.read_text()

header="const DATA=ROOT+'data/patterns.json';\nconst DICT=ROOT+'data/search-dictionary.json';\nlet patternsPromise,dictPromise;"
replacement="const DATA=ROOT+'data/patterns.json';\nconst PROD=ROOT+'data/production-content.json';\nconst DICT=ROOT+'data/search-dictionary.json';\nlet patternsPromise,dictPromise;"
if header not in s and "const PROD=ROOT+'data/production-content.json';" not in s:
    raise SystemExit('header contract not found')
s=s.replace(header,replacement)

old="async function patterns(){return patternsPromise||(patternsPromise=fetch(DATA).then(r=>r.json()))}"
new="async function patterns(){return patternsPromise||(patternsPromise=Promise.all([fetch(DATA).then(r=>r.json()),fetch(PROD).then(r=>r.json())]).then(([base,prod])=>{const overlays=Object.fromEntries((prod.patterns||[]).map(x=>[x.pattern_id,x]));return base.map(p=>{const o=overlays[p.id]||{};return {...p,...o,id:p.id,names:{...p.names,...(o.names||{})},aliases:{ja:[...new Set([...(p.aliases?.ja||[]),...(o.aliases?.ja||[])])],en:[...new Set([...(p.aliases?.en||[]),...(o.aliases?.en||[])])]},colors:{...p.colors,...(o.colors||{})},description:o.definition||p.description,relationships:p.relationships,search_terms:p.search_terms,families:p.families,motifs:p.motifs,visual:p.visual,uses:p.uses,culture:p.culture}})}))}"
if old in s:
    s=s.replace(old,new)
elif 'Promise.all([fetch(DATA)' not in s:
    raise SystemExit('patterns() contract not found')

old_bag="function bag(p,lang){return norm([p.names?.[lang],p.names?.[lang==='ja'?'en':'ja'],...(p.aliases?.[lang]||[]),...(p.search_terms?.[lang]||[]),...(p.motifs||[]),...(p.families||[]),...(p.visual?.geometry||[]),...(p.visual?.line||[]),...(p.colors?.primary||[]),...(p.uses||[]),...(p.culture||[])].join(' '))}"
new_bag="function bag(p,lang){return norm([p.names?.[lang],p.names?.[lang==='ja'?'en':'ja'],...(p.aliases?.[lang]||[]),...(p.search_terms?.[lang]||[]),...(p.motifs||[]),...(p.families||[]),...(p.visual?.geometry||[]),...(p.visual?.line||[]),...(p.colors?.primary||[]),...(p.uses||[]),...(p.culture||[]),p.term_scope,p.definition?.[lang],...(p.distinguishing_features?.[lang]||[]),...(p.common_uses?.[lang]||[])].join(' '))}"
if old_bag in s:
    s=s.replace(old_bag,new_bag)
elif 'p.distinguishing_features?.[lang]' not in s:
    raise SystemExit('bag() contract not found')

start=s.find('async function initDetail(lang){')
end=s.find('async function initCompare(lang){')
if start<0 or end<0 or end<=start:
    raise SystemExit('detail function markers not found')
detail="""async function initDetail(lang){const ps=await patterns(),map=Object.fromEntries(ps.map(p=>[p.id,p])),id=document.body.dataset.patternId||new URLSearchParams(location.search).get('id'),p=map[id]||ps[0],rel=[...(p.relationships?.often_confused_with||[]),...(p.relationships?.similar||[])].filter((x,i,a)=>a.indexOf(x)===i).map(x=>map[x]).filter(Boolean),features=p.distinguishing_features?.[lang]||[],uses=p.common_uses?.[lang]||[];document.title=`${p.names[lang]} | Pattern Dictionary | NicheWorks`;$('#detail').innerHTML=`<section class=\"pd-detail-head\"><div><img class=\"pd-detail-image\" src=\"${patternSvg(p)}\" alt=\"\"><p class=\"pd-warning\">${lang==='ja'?'この画像はUI検証用DEVプレースホルダーです。辞典用Reference Imageとして未検証です。':'This image is a DEV placeholder for UI validation, not a verified dictionary Reference Image.'}</p></div><div><p class=\"pd-kicker\">${p.verification_state==='qualified'?'RESEARCHED · QUALIFIED':'RESEARCHED'}</p><h1 class=\"pd-title\">${esc(p.names[lang])}</h1><p class=\"pd-enname\">${esc(p.names[lang==='ja'?'en':'ja'])}</p><div class=\"pd-tags\">${[...p.families,...p.motifs.slice(0,3)].map(x=>`<span class=\"pd-tag\">${esc(x)}</span>`).join('')}</div><p class=\"pd-copy\">${esc(p.definition?.[lang]||p.description?.[lang]||'')}</p><table class=\"pd-table\"><tr><th>${lang==='ja'?'別名':'Aliases'}</th><td>${esc((p.aliases?.[lang]||[]).join(', ')||'—')}</td></tr><tr><th>${lang==='ja'?'用語の範囲':'Term scope'}</th><td>${esc(p.term_scope||'—')}</td></tr><tr><th>${lang==='ja'?'代表色':'Primary colors'}</th><td>${esc(p.colors.primary.join(' + '))}</td></tr><tr><th>${lang==='ja'?'色の扱い':'Color role'}</th><td>${esc(p.colors.color_role)}</td></tr><tr><th>${lang==='ja'?'主な用途':'Common uses'}</th><td>${esc(uses.join(', ')||'—')}</td></tr></table>${rel[0]?`<a class=\"pd-button secondary\" href=\"${compareUrl(p.id,rel[0].id,lang)}\">${lang==='ja'?'似た柄と比較':'Compare with a similar pattern'}</a>`:''}</div></section><section class=\"pd-section\"><div class=\"pd-section-head\"><h2>${lang==='ja'?'見分け方':'How to identify it'}</h2></div><ul class=\"pd-copy\">${features.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>${p.qualification?.[lang]?`<div class=\"pd-warning\"><strong>${lang==='ja'?'用語上の注意':'Scope note'}</strong><br>${esc(p.qualification[lang])}</div>`:''}</section><section class=\"pd-section\"><div class=\"pd-section-head\"><h2>${lang==='ja'?'似ている・間違えやすい模様':'Similar or commonly confused patterns'}</h2></div><div class=\"pd-related\">${rel.map(x=>card(x,lang)).join('')}</div></section><section class=\"pd-section\"><div class=\"pd-commerce\"><h2>${lang==='ja'?'この柄の商品を探す':'Find products in this pattern'}</h2><p class=\"pd-note\">${lang==='ja'?'Amazonリンクはまだ接続していません。辞典本文とReference Imageの検証後に接続します。':'Amazon links are not connected yet. They will be added after dictionary copy and Reference Images are verified.'}</p></div></section>`;const langLink=$('#lang-link');if(langLink)langLink.href=ROOT+(lang==='ja'?'en/':'')+'patterns/'+encodeURIComponent(p.id)+'/'}\n"""
s=s[:start]+detail+s[end:]
app.write_text(s)
print('OK: researched overlay wired into app.js')
