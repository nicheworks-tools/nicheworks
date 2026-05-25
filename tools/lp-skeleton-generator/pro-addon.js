(() => {
  const KEY='nw_pro_lp_skeleton_generator';
  const STRIPE='https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';
  const isPro=()=>localStorage.getItem(KEY)==='1'||!!localStorage.getItem('nw_pro_key');
  function activate(){const u=new URL(location.href);if(u.searchParams.get('pro')==='1'){localStorage.setItem(KEY,'1');u.searchParams.delete('pro');history.replaceState({},'',u.toString())}}
  function box(){if(document.getElementById('lpProBox'))return;const s=document.createElement('section');s.id='lpProBox';s.className='nw-note';s.innerHTML='<strong>Pro</strong><p id="lpProMsg"></p><p><a class="btn primary" href="'+STRIPE+'" target="_blank" rel="noopener">Unlock Pro / Proを購入</a></p><p class="nw-muted">After payment, open this page with <code>?pro=1</code>.</p>';document.querySelector('main')?.insertBefore(s,document.querySelector('main .card')?.nextSibling||null)}
  function render(){box();document.body.classList.toggle('is-pro',isPro());document.querySelectorAll('[data-pro-only]').forEach(el=>el.style.display=isPro()?'':'none');document.querySelectorAll('[data-pro-lock]').forEach(el=>el.style.display=isPro()?'none':'');const m=document.getElementById('lpProMsg');if(m)m.textContent=isPro()?'Pro active: exports are unlocked. / Pro解放済み。':'Pro locks exports. / Proで出力を解放。'}
  function init(){activate();const old=window.NW||{};window.NW={...old,hasPro:isPro};render();document.addEventListener('click',()=>setTimeout(render,0))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
