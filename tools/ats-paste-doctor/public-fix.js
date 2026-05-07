(() => {
  const STRIPE = 'https://buy.stripe.com/bJe14p2QV1M13dz5kjcV208';
  const KEY = 'nw_pro_ats_paste_doctor';
  const $ = (id) => document.getElementById(id);
  const lang = () => document.documentElement.lang === 'ja' ? 'ja' : 'en';
  const isPro = () => localStorage.getItem(KEY) === '1' || !!localStorage.getItem('nw_pro_key');
  function activate(){ const u = new URL(location.href); if(u.searchParams.get('pro') === '1'){ localStorage.setItem(KEY,'1'); u.searchParams.delete('pro'); history.replaceState({},'',u.toString()); } }
  function toast(m){ const e=$('toast'); if(!e)return; e.textContent=m; e.hidden=false; clearTimeout(toast.t); toast.t=setTimeout(()=>e.hidden=true,2200); }
  function status(){
    document.body.classList.toggle('is-pro', isPro());
    const buy=$('buyProLink');
    if(buy){ buy.href=STRIPE; buy.removeAttribute('aria-disabled'); buy.removeAttribute('tabindex'); buy.textContent=isPro()?'Pro active / Pro解放済み':'Unlock Pro / Proを購入'; }
    ['proCard','proTools'].forEach(id=>{ const el=$(id); if(el){ el.hidden=false; el.removeAttribute('aria-hidden'); }});
    document.querySelectorAll('[data-pro-only]').forEach(el=>{ if('disabled' in el) el.disabled=!isPro(); el.setAttribute('aria-hidden', isPro()?'false':'true'); });
    const note=$('proToolsNote'); if(note) note.textContent=isPro()?'Pro tools are unlocked on this device.':'Pro tools are locked until purchase. After payment, open this page with ?pro=1.';
  }
  function needPro(e){ if(isPro()) return true; e?.preventDefault?.(); e?.stopImmediatePropagation?.(); toast(lang()==='ja'?'Pro限定機能です。購入後に ?pro=1 で解放してください。':'Pro feature locked. Reopen with ?pro=1 after purchase.'); status(); return false; }
  async function copyText(text){ try{ await navigator.clipboard.writeText(text); return true; }catch(_){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.left='-9999px'; document.body.appendChild(ta); ta.select(); let ok=false; try{ok=document.execCommand('copy')}catch(_){} ta.remove(); return ok; } }
  function patchCopy(){ const btn=$('copyBtn'); if(!btn) return; btn.addEventListener('click', async e=>{ const out=$('outputText')?.value||''; if(!out.trim()) return; e.preventDefault(); e.stopImmediatePropagation(); toast(await copyText(out)?(lang()==='ja'?'コピーしました':'Copied'):(lang()==='ja'?'コピーできませんでした':'Copy failed')); }, true); }
  function init(){ activate(); status(); patchCopy(); ['exportPdfBtn','historySaveBtn','historyClearBtn'].forEach(id=>$(id)?.addEventListener('click', needPro, true)); document.querySelectorAll('.template-save,.template-load').forEach(el=>el.addEventListener('click', needPro, true)); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
})();
