(() => {
  const KEY='nw_pro_command_safety_checker';
  const $=(id)=>document.getElementById(id);
  const isPro=()=>localStorage.getItem(KEY)==='1'||!!localStorage.getItem('nw_pro_key');
  const lang=()=>document.documentElement.lang==='en'?'en':'ja';
  function activate(){const u=new URL(location.href);if(u.searchParams.get('pro')==='1'){localStorage.setItem(KEY,'1');u.searchParams.delete('pro');history.replaceState({},'',u.toString())}}
  function toast(m){let e=$('toast');if(!e){e=document.createElement('div');e.id='toast';e.className='toast';document.body.appendChild(e)}e.textContent=m;e.hidden=false;clearTimeout(toast.t);toast.t=setTimeout(()=>e.hidden=true,2200)}
  function needPro(){if(isPro())return true;toast(lang()==='ja'?'Pro限定機能です。購入後に ?pro=1 で解放してください。':'Pro feature locked. Reopen with ?pro=1 after purchase.');render();return false}
  function report(){return ['# Command Safety Pro Review','','## Input',$('cmdInput')?.value||'','## Normalized',$('normalizedCmd')?.textContent||'','## Findings',$('findings')?.innerText||'','## Review checklist',$('saferSteps')?.innerText||'','## Note','This report is a review aid only. It does not certify that a command is safe.'].join('\n')}
  async function copy(t){try{await navigator.clipboard.writeText(t);toast(lang()==='ja'?'コピーしました':'Copied')}catch(_){toast('Copy failed')}}
  function dl(n,t){const b=new Blob([t],{type:'text/markdown;charset=utf-8'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=n;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
  function build(){if($('cscProAddon'))return;const block=$('proBlock');if(!block)return;const div=document.createElement('div');div.id='cscProAddon';div.className='pro-addon';div.innerHTML='<p id="cscProState"></p><div class="actions"><button id="cscCopyPro" class="btn" type="button">Pro: Copy review report</button><button id="cscSavePro" class="btn" type="button">Pro: Save Markdown report</button></div>';block.appendChild(div);$('cscCopyPro').addEventListener('click',()=>{if(!needPro())return;copy(report())});$('cscSavePro').addEventListener('click',()=>{if(!needPro())return;dl('command-safety-pro-review.md',report())})}
  function render(){build();document.body.classList.toggle('is-pro',isPro());const s=$('cscProState');if(s)s.textContent=isPro()?'Pro active: review copy and Markdown export are unlocked. / Pro解放済み。':'Pro locks review copy and Markdown export. / Proでレビュー保存を解放。'}
  function init(){activate();render();document.addEventListener('click',()=>setTimeout(render,0))}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
