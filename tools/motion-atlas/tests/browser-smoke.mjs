import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import {spawn} from "node:child_process";

const root=process.cwd();
const browser=["google-chrome","google-chrome-stable","chromium","chromium-browser"].find(cmd=>
  (process.env.PATH||"").split(path.delimiter).some(dir=>fs.existsSync(path.join(dir,cmd))));
if(!browser){console.error("Chrome/Chromium missing in runner");process.exit(1);}

const injected=[
  "<script>",
  "(function(){",
  "const errors=[];",
  "window.addEventListener('error',e=>errors.push(e.message));",
  "const sleep=ms=>new Promise(r=>setTimeout(r,ms));",
  "async function ready(){for(let i=0;i<100;i++){if(document.querySelectorAll('.motion-card').length===42)return true;await sleep(50)}return false}",
  "const check=(ok,msg)=>{if(!ok)throw Error(msg)};",
  "const all=q=>Array.from(document.querySelectorAll(q));",
  "async function test(){",
  "check(await ready(),'42 catalog cards did not load');",
  "const search=document.querySelector('#motion-search');",
  "search.value='overshoot';search.dispatchEvent(new Event('input',{bubbles:true}));",
  "await sleep(100);check(all('.motion-card').length>0&&all('.motion-card').length<42,'search did not filter');",
  "document.querySelector('[data-reset]').click();await sleep(100);",
  "check(all('.motion-card').length===42,'reset did not restore catalog');",
  "for(let i=0;i<4;i++){const b=all('.motion-card')[i]?.querySelector('.card-actions button:nth-child(2)');check(b,'missing compare control');b.click()}",
  "check(all('#compare-tray button').length===4,'four-way compare did not work');",
  "check(document.querySelector('#compare-table table'),'comparison table is missing');",
  "all('.motion-card')[4]?.querySelector('.card-actions button:nth-child(2)')?.click();",
  "check(all('#compare-tray button').length===4,'fifth comparison was accepted');",
  "const count=all('.motion-card').find(c=>c.querySelector('h3')?.textContent.includes('Count up'));",
  "check(count,'count-up card missing');count.querySelector('.card-actions button').click();",
  "check(document.querySelector('#motion-detail .motion-demo[data-demo=\"count-up\"]'),'count-up detail missing');",
  "await sleep(1100);const countText=document.querySelector('#motion-detail .demo-shape')?.textContent;check(countText==='259','counter did not reach target (actual: '+JSON.stringify(countText)+', reduced: '+document.documentElement.classList.contains('is-reduced')+')');",
  "const mask=all('.motion-card').find(c=>c.querySelector('h3')?.textContent.includes('Mask reveal'));",
  "check(mask,'mask reveal missing');mask.querySelector('.card-actions button').click();",
  "check(getComputedStyle(document.querySelector('#motion-detail .demo-shape')).animationName.includes('atlasMaskReveal'),'mask animation missing');",
  "const reduced=document.querySelector('#reduced-toggle');",
  "reduced.checked=true;reduced.dispatchEvent(new Event('change',{bubbles:true}));",
  "check(document.documentElement.classList.contains('is-reduced'),'reduce-motion toggle failed');",
  "check(errors.length===0,'script errors: '+errors.join('|'));",
  "const overflow=document.documentElement.scrollWidth-window.innerWidth;",
  "check(overflow<=8,'horizontal overflow: '+overflow+'px');",
  "return 'PASS:42:SEARCH:COMPARE4:COUNTUP:MASK:REDUCED:WIDTH'+window.innerWidth;",
  "}",
  "test().then(result=>{const p=document.createElement('pre');p.id='qa-result';p.textContent=result;document.body.append(p)})",
  ".catch(err=>{const p=document.createElement('pre');p.id='qa-result';p.textContent='FAIL:'+err.message;document.body.append(p)});",
  "})();",
  "</script>"
].join("\n");

const server=http.createServer((req,res)=>{
  const url=new URL(req.url,"http://localhost");
  let target=path.resolve(root,"."+decodeURIComponent(url.pathname));
  if(!target.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(target)&&fs.statSync(target).isDirectory())target=path.join(target,"index.html");
  if(!fs.existsSync(target)){res.writeHead(404).end("Not found");return;}
  let data=fs.readFileSync(target);
  const type=target.endsWith(".html")?"text/html":target.endsWith(".css")?"text/css":target.endsWith(".js")?"application/javascript":target.endsWith(".json")?"application/json":"application/octet-stream";
  if(type==="text/html"&&url.searchParams.get("qa")==="1"){
    let html=data.toString("utf8");
    html=html.replace(/<script\b[^>]*\bsrc="https:\/\/[^"]+"[^>]*><\/script>/g,"");
    data=Buffer.from(html.replace("</body>",injected+"</body>"));
  }
  res.writeHead(200,{"Content-Type":type+"; charset=utf-8","Cache-Control":"no-store"}).end(data);
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
async function run(lang,width){
  const suffix=lang==="ja"?"ja/":"";
  const url="http://127.0.0.1:"+port+"/tools/motion-atlas/"+suffix+"?qa=1";
  const args=["--headless=new","--no-sandbox","--disable-gpu","--disable-dev-shm-usage","--no-first-run","--disable-background-networking","--disable-extensions","--disable-background-timer-throttling","--window-size="+width+",880","--virtual-time-budget=8000","--dump-dom",url];
  const child=spawn(browser,args,{stdio:["ignore","pipe","pipe"]});
  let stdout="",stderr="";
  child.stdout.on("data",b=>stdout+=b.toString());
  child.stderr.on("data",b=>{if(stderr.length<4000)stderr+=b.toString();});
  let timedOut=false;
  const timer=setTimeout(()=>{timedOut=true;child.kill("SIGKILL");},30000);
  const code=await new Promise(resolve=>child.on("close",resolve));
  clearTimeout(timer);
  const result=stdout.match(/<pre id="qa-result">([^<]+)<\/pre>/)?.[1]||"NO_QA_RESULT";
  console.log(lang+" "+width+": "+result+" (exit="+code+(timedOut?", timeout":"")+")");
  if(timedOut||code!==0||!result.startsWith("PASS:"))throw Error(lang+" "+width+": "+result+" "+stderr.slice(-700));
}
try{
  await run("en",1440);
  await run("ja",1440);
  await run("en",390);
  await run("ja",390);
  console.log("Motion Atlas Chromium browser smoke PASS");
}catch(err){console.error(err);process.exitCode=1;}
finally{await new Promise(resolve=>server.close(resolve));}
