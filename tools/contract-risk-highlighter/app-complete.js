(() => {
  const STRIPE='https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const KEY='nw_pro_contract_risk_highlighter';
  const $=(id)=>document.getElementById(id);
  const isPro=()=>localStorage.getItem(KEY)==='1'||!!localStorage.getItem('nw_pro_key');
  const lang=()=>document.documentElement.lang==='en'?'en':'ja';
  const tx={ja:{need:'Pro限定機能です。購入後に ?pro=1 で解放してください。',active:'Pro解放済み。Markdown保存とPDF保存が使えます。',first:'先にAnalyzeしてください。'},en:{need:'Pro feature locked. Reopen with ?pro=1 after purchase.',active:'Pro active. Markdown and PDF export are unlocked.',first:'Analyze first.'}};
  let md='';
  function activate(){const u=new URL(location.href);if(u.searchParams.get('pro')==='1'){localStorage.setItem(KEY,'1');u.searchParams.delete('pro');history.replaceState({},'',u.toString())}}
  function toast(m){const e=$('toast');if(!e)return;e.textContent=m;e.style.display='block';clearTimeout(toast.t);toast.t=setTimeout(()=>e.style.display='none',1800)}
  function proBox(){if(!$('nwProBox')){const s=document.createElement('section');s.id='nwProBox';s.className='nw-card';s.innerHTML=`<strong>Pro</strong><p id="nwProMsg"></p><p><a class="btn" href="${STRIPE}" target="_blank" rel="noopener">Unlock Pro / Proを購入</a></p><p class="nw-muted">After payment, open this page with ?pro=1.</p>`;document.querySelector('main')?.insertBefore(s,document.querySelector('.nw-donate')||null)}$('nwProMsg').textContent=isPro()?tx[lang()].active:tx[lang()].need;const ps=$('proState');if(ps)ps.textContent=isPro()?tx[lang()].active:tx[lang()].need}
  function needPro(e){if(isPro())return true;e?.preventDefault?.();e?.stopImmediatePropagation?.();proBox();toast(tx[lang()].need);return false}
  function download(name,text){const b=new Blob([text],{type:'text/markdown;charset=utf-8'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),800)}
  function capture(){md=$('mdPreview')?.value||'';}
  function init(){activate();proBox();const dl=$('downloadMdBtn');const pdf=$('downloadPdfBtn');dl?.addEventListener('click',e=>{capture();if(!needPro(e))return;if(!md.trim())return toast(tx[lang()].first);e.preventDefault();e.stopImmediatePropagation();download('contract-risk-pro.md',md)} ,true);pdf?.addEventListener('click',e=>{capture();if(!needPro(e))return;if(!md.trim())return toast(tx[lang()].first);e.preventDefault();e.stopImmediatePropagation();window.print()},true);document.addEventListener('click',()=>setTimeout(proBox,0));}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
