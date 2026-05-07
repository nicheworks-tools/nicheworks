(() => {
  const $ = (id) => document.getElementById(id);
  const $$ = (s) => Array.from(document.querySelectorAll(s));
  const STRIPE = 'https://buy.stripe.com/bJe14p2QV1M13dz5kjcV208';
  const KEY = 'nw_pro_outsource_spec_generator';
  let generated = false;
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';
  const isPro = () => localStorage.getItem(KEY) === '1' || !!localStorage.getItem('nw_pro_key');
  function activate(){ const u = new URL(location.href); if(u.searchParams.get('pro') === '1'){ localStorage.setItem(KEY,'1'); u.searchParams.delete('pro'); history.replaceState({},'',u.toString()); } }
  function applyLang(l){ $$('[data-i18n]').forEach(e => e.style.display = e.dataset.i18n === l ? '' : 'none'); $$('.nw-lang-switch button').forEach(b => b.classList.toggle('active', b.dataset.lang === l)); document.documentElement.lang = l; localStorage.setItem('nw_lang', l); proBox(); }
  function toast(m){ const e=$('toast'); if(!e)return; e.textContent=m; e.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>e.hidden=true,2200); }
  function v(id){ return ($(id)?.value || '').trim(); }
  function lines(id){ return v(id).split(/\n|,|、/).map(x=>x.trim()).filter(Boolean); }
  function b(a){ return a.length ? a.map(x=>'- '+x).join('\n') : '- 未指定'; }
  function spec(l){ const ja=l==='ja'; return [ja?'# 外注仕様書ドラフト':'# Outsourcing spec draft','',ja?'## 基本情報':'## Basic info','- Work type: '+v('workType'),'- Purpose: '+v('purpose'),'- Deadline: '+v('deadline'),'- Budget: '+v('budget'),'',ja?'## 成果物・範囲':'## Deliverables',b(lines('deliverables')),'',ja?'## 対象外':'## Out of scope',b(lines('outOfScope')),'',ja?'## 受入基準':'## Acceptance','- '+v('acceptanceMethod'),'- '+v('acceptancePeriod'),'',ja?'## 修正・支払い・権利':'## Revision / payment / rights','- '+v('revisionRounds'),'- '+v('paymentTerms'),'- '+v('rightsUsage'),'- '+v('confidentiality')].join('\n'); }
  function pack(l){ return [(l==='ja'?'# Pro 成果物パック':'# Pro deliverable pack'),'','- Sitemap / 構成案','- Wireframe / ワイヤー','- QA checklist / 検収表','- Delivery note / 納品メモ'].join('\n'); }
  function dl(name,text){ const blob=new Blob([text],{type:'text/markdown;charset=utf-8'}); const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),1000); }
  function proBox(){ if(!$('nwProBox')){ const s=document.createElement('section'); s.id='nwProBox'; s.className='nw-note'; s.innerHTML=`<strong>Pro</strong><p id="nwProMsg"></p><p><a class="btn primary" href="${STRIPE}" target="_blank" rel="noopener">Unlock Pro / Proを購入</a></p><p class="nw-muted">After payment, open this page with ?pro=1.</p>`; document.querySelector('main')?.insertBefore(s, document.querySelector('main .card')?.nextSibling || null); } $('nwProMsg').textContent = isPro() ? 'Pro active / Pro解放済み' : 'Pro locked / Pro機能は購入後に解放'; }
  function needPro(){ if(isPro()) return true; proBox(); toast('Pro限定機能です。購入後に ?pro=1 で解放してください。'); return false; }
  function init(){ activate(); let l=(navigator.language||'').startsWith('ja')?'ja':'en'; try{ const s=localStorage.getItem('nw_lang'); if(s==='ja'||s==='en') l=s; }catch(_){} $$('.nw-lang-switch button').forEach(b=>b.addEventListener('click',()=>applyLang(b.dataset.lang))); applyLang(l); $('outputJa').textContent='入力後に生成してください。'; $('outputEn').textContent='Fill in the fields, then generate.'; $('proOutputJa').textContent='Proで成果物パックを生成できます。'; $('proOutputEn').textContent='Pro unlocks a deliverable pack.'; $('generateBtn').addEventListener('click',()=>{ $('outputJa').textContent=spec('ja'); $('outputEn').textContent=spec('en'); generated=true; toast('Generated'); }); $('copyBtn').addEventListener('click',()=>navigator.clipboard.writeText(lang()==='ja'?$('outputJa').textContent:$('outputEn').textContent)); $('packBtn').addEventListener('click',()=>{ if(!needPro())return; $('proOutputJa').textContent=pack('ja'); $('proOutputEn').textContent=pack('en'); }); $('exportBtn').addEventListener('click',()=>{ if(!needPro())return; if(!generated)return toast('Generate first'); const l=lang(); dl('outsource-spec-pro.md', (l==='ja'?$('outputJa').textContent:$('outputEn').textContent)+'\n\n'+(l==='ja'?$('proOutputJa').textContent:$('proOutputEn').textContent)); }); proBox(); }
  document.addEventListener('DOMContentLoaded', init);
})();
