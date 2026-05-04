(function(){
  "use strict";

  const $ = (id) => document.getElementById(id);
  const PRO_KEY = "jr_pro_key";
  const HIST_ENABLED_KEY = "jr_hist_enabled";
  const HIST_ITEMS_KEY = "jr_hist_items";

  const I18N = {
    ja: {
      title:"JSON Repair（壊れたJSON修復）",
      subtitle:"壊れたJSONをブラウザ内で修復・検証・整形（外部送信なし）",
      privacyNote:"入力内容は外部送信されません（このページ内でのみ処理）。",
      freeTitle:"無料でできること",
      freeBadge:"Free / Local",
      freeDesc:"検証、末尾カンマ・コメント入りJSONの修復、Pretty/Minify、コピー、JSON保存、修復ログ、差分確認が使えます。",
      scopeTitle:"修復できる範囲",
      scopeFree:"無料：末尾カンマ、コメント除去、一部のログ混在JSON、検証、Pretty、Minify、コピー、JSON保存、差分確認。",
      scopeExtra:"追加機能：シングルクォート、未クォートキー、Python風 True / False / None、JSON候補抽出、Schema check、ローカル履歴。",
      howTitle:"使い方",
      how1:"1. 壊れたJSONやログ混在テキストを入力欄に貼り付ける。",
      how2:"2. まず Validate で状態を確認する。",
      how3:"3. Safe または Standard を選んで Repair を押す。",
      how4:"4. 修復ログと差分を確認してからコピーまたは保存する。",
      modeLabel:"Mode",
      sampleLabel:"Samples",
      levelLabel:"Repair",
      indentLabel:"Indent",
      loadBtn:"ファイル読込",
      inputTitle:"入力",
      outputTitle:"出力",
      validateBtn:"検証",
      repairBtn:"修復",
      prettyBtn:"整形",
      minifyBtn:"ミニファイ",
      resetBtn:"リセット",
      shortcutsHint:"Cmd/Ctrl+Enter: 修復 / Cmd/Ctrl+Shift+Enter: 検証 / Cmd/Ctrl+S: 保存",
      tabRepaired:"修復結果",
      tabFormatted:"整形結果",
      tabValidate:"検証結果",
      copyBtn:"コピー",
      downloadBtn:"保存(.json)",
      logTitle:"修復ログ",
      showDiff:"差分を見る",
      proTitle:"追加機能（ローカル解除）",
      activateBtn:"Activate",
      clearBtn:"Clear",
      proDesc:"より強い修復・JSON候補抽出・Schema check・ローカル履歴・詳細な修復説明を使う場合の追加機能です。無料機能だけでも通常のJSON修復・検証・整形は使えます。",
      candidatesTitle:"JSON候補抽出（追加機能）",
      schemaTitle:"Schema check（追加機能）",
      schemaHelp:"例: required user.id, user.name / type user.id=number",
      schemaRunBtn:"Schema check",
      historyTitle:"ローカル履歴（追加機能）",
      historyEnable:"この端末に履歴を保存",
      donateText:"このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
      linksTitle:"関連ツール",
      faq1q:"入力したJSONはサーバーに送信されますか？",
      faq1a:"いいえ。入力内容はブラウザ内で処理されます。",
      faq2q:"どんな壊れたJSONを直せますか？",
      faq2a:"末尾カンマ、コメント入りJSON、一部のログ混在JSONなどを修復できます。",
      faq3q:"すべてのJSONを自動修復できますか？",
      faq3a:"いいえ。意味が曖昧な壊れ方や大きく崩れたJSONは修復できない場合があります。",
      faq4q:"元データは変更されますか？",
      faq4a:"いいえ。入力欄の内容は残り、修復結果は出力欄に表示されます。",
      safeHelp:"Safe：意味を変えにくい範囲で、末尾カンマやコメント除去などを中心に修復します。",
      standardHelp:"Standard：Safeに加えて、ログ内のJSON候補抽出も試します。",
      aggressiveHelp:"Aggressive：シングルクォート、未クォートキー、Python風リテラルなども試します。意味が変わる可能性があります。",
      aggressiveLocked:"Aggressiveは追加機能です。無料ではSafe / Standardを使ってください。",
      valid:"有効なJSONです。",
      invalid:"無効なJSONです。",
      repaired:"修復しました。",
      repairFail:"修復できませんでした。",
      copied:"コピーしました。",
      copyFail:"コピーに失敗しました。",
      saved:"保存しました。",
      saveEmpty:"保存できる出力がありません。",
      proInvalid:"Proキーが無効です。",
      proOn:"Proを有効化しました。",
      proOff:"Proを解除しました。",
      logEmpty:"適用した修復、検証結果、差分確認がここに表示されます。重要なJSONは保存前に内容を確認してください。",
      causesTitle:"よくある原因",
      causes:"末尾カンマ / 閉じ括弧の不足 / 文字列のクォート漏れ / コメント入りJSON / ログや説明文の混入",
      diffNote:"差分は修復前後の変化を確認するための補助表示です。"
    },
    en: {
      title:"JSON Repair (Fix Broken JSON)",
      subtitle:"Repair, validate, and format broken JSON locally (no external upload).",
      privacyNote:"Your input is processed locally in this page (no external upload).",
      freeTitle:"What you can do for free",
      freeBadge:"Free / Local",
      freeDesc:"Validate JSON, repair trailing commas and comments, Pretty/Minify, copy, save JSON, inspect the repair log, and check the diff.",
      scopeTitle:"Repair scope",
      scopeFree:"Free: trailing commas, comment removal, some JSON mixed into logs, validation, Pretty, Minify, copy, JSON save, and diff check.",
      scopeExtra:"Extra: single quotes, unquoted keys, Python-like True / False / None, JSON candidate extraction, schema check, and local history.",
      howTitle:"How to use",
      how1:"1. Paste broken JSON or log-mixed text into the input box.",
      how2:"2. Use Validate first to see the current state.",
      how3:"3. Select Safe or Standard, then press Repair.",
      how4:"4. Check the repair log and diff before copying or saving.",
      modeLabel:"Mode",
      sampleLabel:"Samples",
      levelLabel:"Repair",
      indentLabel:"Indent",
      loadBtn:"Load file",
      inputTitle:"Input",
      outputTitle:"Output",
      validateBtn:"Validate",
      repairBtn:"Repair",
      prettyBtn:"Pretty",
      minifyBtn:"Minify",
      resetBtn:"Reset",
      shortcutsHint:"Cmd/Ctrl+Enter: Repair / Cmd/Ctrl+Shift+Enter: Validate / Cmd/Ctrl+S: Download",
      tabRepaired:"Repaired",
      tabFormatted:"Formatted",
      tabValidate:"Validate",
      copyBtn:"Copy",
      downloadBtn:"Download .json",
      logTitle:"Repair Log",
      showDiff:"Show Diff",
      proTitle:"Extra features (local unlock)",
      activateBtn:"Activate",
      clearBtn:"Clear",
      proDesc:"Extra features for stronger repair, JSON candidate extraction, schema checks, local history, and detailed explanations. Regular repair, validation, and formatting work for free.",
      candidatesTitle:"JSON candidates (extra)",
      schemaTitle:"Schema check (extra)",
      schemaHelp:"Example: required user.id, user.name / type user.id=number",
      schemaRunBtn:"Schema check",
      historyTitle:"Local history (extra)",
      historyEnable:"Save history on this device",
      donateText:"If this tool helped, consider supporting continued development.",
      linksTitle:"Related tools",
      faq1q:"Is my JSON sent to a server?",
      faq1a:"No. Your input is processed in your browser.",
      faq2q:"What kinds of broken JSON can this repair?",
      faq2a:"It can repair trailing commas, JSON with comments, and some JSON fragments mixed into logs.",
      faq3q:"Can it repair every broken JSON automatically?",
      faq3a:"No. Ambiguous or heavily damaged JSON may not be repairable automatically.",
      faq4q:"Will the original input be changed?",
      faq4a:"No. The input remains in the input box and the repaired JSON appears in the output box.",
      safeHelp:"Safe: Repairs low-risk issues such as trailing commas and comments.",
      standardHelp:"Standard: Includes Safe repair and JSON candidate extraction from mixed logs.",
      aggressiveHelp:"Aggressive: Tries single quotes, unquoted keys, and Python-like literals. It may change meaning.",
      aggressiveLocked:"Aggressive is an extra feature. Use Safe / Standard for free.",
      valid:"Valid JSON.",
      invalid:"Invalid JSON.",
      repaired:"Repaired.",
      repairFail:"Repair failed.",
      copied:"Copied.",
      copyFail:"Copy failed.",
      saved:"Saved.",
      saveEmpty:"There is no output to save.",
      proInvalid:"Invalid Pro key.",
      proOn:"Pro activated.",
      proOff:"Pro cleared.",
      logEmpty:"Applied repairs, validation results, and diff notes appear here. Check important JSON before saving.",
      causesTitle:"Common causes",
      causes:"Trailing comma / missing closing brace / missing string quotes / comments / logs or prose mixed in",
      diffNote:"The diff helps you inspect what changed between input and output."
    }
  };

  const SAMPLES = {
    trailingComma: '{\n  "a": 1,\n  "b": 2,\n}\n',
    comments: '{\n  // comment\n  "a": 1, /* block */\n  "b": 2\n}\n',
    logMixed: 'INFO something happened id=123\n{\n  "ok": true,\n  "items": [1,2,3]\n}\nDEBUG end\n',
    array: '[\n  { "id": 1, "name": "alpha" },\n  { "id": 2, "name": "beta" }\n]\n',
    config: '{\n  "name": "demo",\n  "enabled": true,\n  "limits": {\n    "max": 10,\n    "retry": 3\n  }\n}\n',
    singleQuotes: "{\n  'a': 'hello',\n  'b': 'world'\n}\n",
    unquotedKeys: "{\n  a: 1,\n  b: { inner_key: 2 }\n}\n",
    pythonLiterals: "{\n  \"enabled\": True,\n  \"value\": None,\n  \"flag\": False\n}\n"
  };

  const state = { lang:"ja", level:"safe", indent:2, pro:false, last:{ input:"", repaired:"", formatted:"", log:[], validate:null } };

  function esc(s){ return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c])); }
  function tr(k){ return (I18N[state.lang] && I18N[state.lang][k]) || k; }
  function toast(s){ const el=$("jrToast"); if(!el) return; el.textContent=s; el.hidden=false; clearTimeout(el._t); el._t=setTimeout(()=>el.hidden=true,2400); }

  function detectLang(){ const saved=localStorage.getItem("nw_lang"); if(saved==="ja"||saved==="en") return saved; return (navigator.language||"ja").toLowerCase().startsWith("ja") ? "ja" : "en"; }
  function setLang(l){ state.lang = l === "en" ? "en" : "ja"; localStorage.setItem("nw_lang", state.lang); document.documentElement.lang = state.lang; renderAllText(); }

  function renderAllText(){
    document.querySelectorAll("[data-i18n]").forEach(el => { const k=el.getAttribute("data-i18n"); el.textContent=tr(k); });
    document.querySelectorAll(".nw-lang-btn").forEach(btn => btn.setAttribute("aria-pressed", btn.dataset.lang === state.lang ? "true" : "false"));
    renderLevelHelp();
    renderProState();
    renderLog();
  }

  function insertGuide(){
    if(document.querySelector(".jr-scope-guide")) return;
    const free = document.querySelector("section[aria-label='Free features']");
    if(!free) return;
    const guide=document.createElement("section");
    guide.className="jr-pro jr-scope-guide";
    guide.innerHTML='<div class="jr-pro-head"><h2 class="jr-h2" data-i18n="scopeTitle"></h2><div class="jr-mini">Free / Extra</div></div><div class="jr-pro-note" data-i18n="scopeFree"></div><div class="jr-pro-note" data-i18n="scopeExtra"></div><div class="jr-pro-head jr-how-head"><h2 class="jr-h2" data-i18n="howTitle"></h2></div><ol class="jr-how-list"><li data-i18n="how1"></li><li data-i18n="how2"></li><li data-i18n="how3"></li><li data-i18n="how4"></li></ol>';
    free.insertAdjacentElement("afterend", guide);
  }

  function checksum97(str){ let sum=0; for(let i=0;i<str.length;i++) sum=(sum+str.charCodeAt(i))%97; return sum; }
  function normalizeKey(v){ return String(v||"").toUpperCase().replace(/\s+/g,"").trim(); }
  function validProKey(v){ const k=normalizeKey(v); const m=/^NW-JR-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(k); if(!m) return null; const want=checksum97(m[1]+m[2]).toString(36).toUpperCase().padStart(2,"0"); return m[3].slice(-2)===want ? k : null; }
  function loadPro(){ const k=localStorage.getItem(PRO_KEY)||""; state.pro=!!validProKey(k); }
  function setPro(on,k){ if(on){ const v=validProKey(k); if(!v){ toast(tr("proInvalid")); return; } localStorage.setItem(PRO_KEY,v); state.pro=true; toast(tr("proOn")); } else { localStorage.removeItem(PRO_KEY); state.pro=false; toast(tr("proOff")); } renderProState(); renderLevelHelp(); }
  function renderProState(){ const el=$("jrProState"); if(el){ el.textContent=state.pro?"Active":"Inactive"; el.className="jr-mini "+(state.pro?"jr-pro-on":"jr-pro-off"); } const opt=[...($("selRepairLevel")?.options||[])].find(o=>o.value==="aggressive"); if(opt) opt.disabled=!state.pro; document.querySelectorAll("#selSample option[data-pro='true']").forEach(o=>{ o.disabled=!state.pro; o.hidden=!state.pro; }); if(!state.pro && $("selRepairLevel")?.value==="aggressive"){ $("selRepairLevel").value="safe"; state.level="safe"; } }

  function renderLevelHelp(){ const el=$("jrLevelHelp"); if(!el) return; const lvl=$("selRepairLevel")?.value||"safe"; if(lvl==="aggressive"&&!state.pro) el.textContent=tr("aggressiveLocked"); else el.textContent=tr(lvl+"Help"); }
  function setTab(tab){ ["repaired","formatted","validate"].forEach(x=>{ const b=document.querySelector(`.jr-tab[data-tab="${x}"]`); const p=$("panel"+x[0].toUpperCase()+x.slice(1)); if(b)b.setAttribute("aria-selected",x===tab?"true":"false"); if(p)p.hidden=x!==tab; }); }
  function updateStats(){ const raw=$("jrInput")?.value||""; const kb=(new Blob([raw]).size/1024).toFixed(1); if($("jrStats")) $("jrStats").textContent=`${raw.length.toLocaleString()} chars / ${kb} KB`; }

  function stripComments(s){ let out="", i=0, str=false, q="", escp=false; while(i<s.length){ const c=s[i], n=s[i+1]; if(str){ out+=c; if(escp) escp=false; else if(c==="\\") escp=true; else if(c===q) str=false; i++; continue; } if(c==='"'||c==="'"){ str=true; q=c; out+=c; i++; continue; } if(c==="/"&&n==="/"){ i+=2; while(i<s.length&&s[i]!=="\n") i++; continue; } if(c==="/"&&n==="*"){ i+=2; while(i<s.length&&!(s[i]==="*"&&s[i+1]==="/")) i++; i+=2; continue; } out+=c; i++; } return out; }
  function removeTrailingCommas(s){ let out="", i=0, str=false, q="", escp=false; while(i<s.length){ const c=s[i]; if(str){ out+=c; if(escp) escp=false; else if(c==="\\") escp=true; else if(c===q) str=false; i++; continue; } if(c==='"'||c==="'"){ str=true; q=c; out+=c; i++; continue; } if(c===","){ let j=i+1; while(/\s/.test(s[j]||"")) j++; if(s[j]==="}"||s[j]==="]"){ i++; continue; } } out+=c; i++; } return out; }
  function singleToDouble(s){ return s.replace(/'([^'\\]*(?:\\.[^'\\]*)*)'/g, (_,a)=>'"'+a.replace(/"/g,'\\"')+'"'); }
  function quoteKeys(s){ return s.replace(/([\{,]\s*)([A-Za-z_$][\w$-]*)(\s*:)/g,'$1"$2"$3'); }
  function pyLiterals(s){ return s.replace(/\bTrue\b/g,"true").replace(/\bFalse\b/g,"false").replace(/\bNone\b/g,"null"); }
  function parseOk(s){ try{ return {ok:true,obj:JSON.parse(s)}; } catch(e){ return {ok:false,error:e}; } }
  function pretty(s,indent){ return JSON.stringify(JSON.parse(s),null,indent)+"\n"; }

  function locateError(raw, err){ const msg=err&&err.message?err.message:String(err); const m=/position\s+(\d+)/i.exec(msg); const pos=m?parseInt(m[1],10):-1; let line=0,col=0,snippet=""; if(pos>=0){ const before=raw.slice(0,pos); line=before.split("\n").length; col=before.length-before.lastIndexOf("\n"); snippet=raw.slice(Math.max(0,pos-60),Math.min(raw.length,pos+60)); } return {msg,pos,line,col,snippet}; }

  function extractCandidates(raw){ const found=[]; const stack=[]; let str=false,q="",escp=false; for(let i=0;i<raw.length;i++){ const c=raw[i]; if(str){ if(escp) escp=false; else if(c==="\\") escp=true; else if(c===q) str=false; continue; } if(c==='"'||c==="'"){ str=true; q=c; continue; } if(c==="{"||c==="[") stack.push({ch:c,start:i}); if((c==="}"||c==="]")&&stack.length){ const top=stack.pop(); if((top.ch==="{"&&c==="}")||(top.ch==="["&&c==="]")){ const text=raw.slice(top.start,i+1); if(text.length>1) found.push({start:top.start,end:i+1,text}); } } } return found.sort((a,b)=>b.text.length-a.text.length).slice(0,8); }

  function repair(raw){
    const log=[]; let s=String(raw||"").trim();
    if(!s) return {ok:false,text:"",log:["empty"]};
    const direct=parseOk(s); if(direct.ok) return {ok:true,text:pretty(s,state.indent),log:["valid JSON"]};
    const c1=stripComments(s); if(c1!==s){ s=c1; log.push("comments removed"); }
    const c2=removeTrailingCommas(s); if(c2!==s){ s=c2; log.push("trailing commas removed"); }
    let p=parseOk(s); if(p.ok) return {ok:true,text:pretty(s,state.indent),log};
    if(state.level==="standard"||state.level==="aggressive"){
      for(const cand of extractCandidates(raw)){ const r=repair(cand.text); if(r.ok){ r.log.unshift("JSON candidate extracted"); return r; } }
    }
    if(state.level==="aggressive"&&state.pro){
      let a=pyLiterals(quoteKeys(singleToDouble(s))); log.push("aggressive repair applied");
      a=removeTrailingCommas(stripComments(a));
      p=parseOk(a); if(p.ok) return {ok:true,text:pretty(a,state.indent),log};
    }
    return {ok:false,text:s,log};
  }

  function validate(){ const raw=$("jrInput").value||""; const p=parseOk(raw); const out=$("jrValidateOut"); if(p.ok){ state.last.validate={ok:true}; out.innerHTML="<b>OK</b><br>"+esc(tr("valid")); $("jrInput").classList.remove("jr-input-error"); toast(tr("valid")); } else { const e=locateError(raw,p.error); state.last.validate={ok:false,...e}; out.innerHTML=`<b>${esc(tr("invalid"))}</b><br>${esc(e.msg)}${e.line?`<br>line ${e.line}, column ${e.col}`:""}${e.snippet?`<pre>${esc(e.snippet)}</pre>`:""}<div class="jr-validate-extra"><div class="jr-mini"><strong>${esc(tr("causesTitle"))}</strong><br>${esc(tr("causes"))}</div></div>`; $("jrInput").classList.add("jr-input-error"); toast(tr("invalid")); } setTab("validate"); }
  function renderLog(){ const el=$("jrLog"); if(!el) return; const arr=state.last.log||[]; el.textContent=arr.length?arr.map((x,i)=>`${i+1}. ${x}`).join("\n"):tr("logEmpty"); }
  function renderDiff(before,after){ const d=$("jrDiff"); if(!d) return; d.textContent = before===after ? "No changes" : `--- input\n+++ output\n${tr("diffNote")}\n\nInput length: ${before.length}\nOutput length: ${after.length}`; }

  function doRepair(){ const raw=$("jrInput").value||""; const res=repair(raw); state.last.log=res.log; if(res.ok){ state.last.repaired=res.text; $("jrOutput").value=res.text; $("jrInput").classList.remove("jr-input-error"); renderLog(); renderDiff(raw,res.text); addHistory(raw,res.text); toast(tr("repaired")); setTab("repaired"); } else { renderLog(); validate(); toast(tr("repairFail")); } }
  function doPretty(minify){ const src=state.last.repaired || $("jrInput").value || ""; try{ const out=minify?JSON.stringify(JSON.parse(src)):JSON.stringify(JSON.parse(src),null,state.indent)+"\n"; state.last.formatted=out; $("jrFormattedOut").value=out; toast("OK"); setTab("formatted"); } catch(e){ validate(); } }
  async function copyOut(){ const txt=state.last.repaired||state.last.formatted||$("jrInput").value||""; if(!txt){toast(tr("copyFail"));return;} try{ await navigator.clipboard.writeText(txt); toast(tr("copied")); } catch(e){ const ta=document.createElement("textarea"); ta.value=txt; document.body.appendChild(ta); ta.select(); const ok=document.execCommand("copy"); ta.remove(); toast(ok?tr("copied"):tr("copyFail")); } }
  function saveOut(){ const txt=state.last.repaired||state.last.formatted||""; if(!txt){toast(tr("saveEmpty"));return;} let name=($("jrFilename").value||"repaired.json").trim(); if(!/\.json$/i.test(name)) name+=".json"; const blob=new Blob([txt],{type:"application/json;charset=utf-8"}); const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),1000); toast(tr("saved")); }
  function resetAll(){ ["jrInput","jrOutput","jrFormattedOut"].forEach(id=>{ if($(id)) $(id).value=""; }); if($("jrValidateOut")) $("jrValidateOut").innerHTML=""; if($("jrDiff")) $("jrDiff").textContent=""; state.last={input:"",repaired:"",formatted:"",log:[],validate:null}; updateStats(); renderLog(); setTab("repaired"); }

  function schemaCheck(){ const out=$("jrSchemaOut"); if(!out) return; if(!state.pro){ out.textContent=""; return; } let obj; try{ obj=JSON.parse(state.last.repaired||state.last.formatted||$("jrInput").value||""); } catch(e){ out.innerHTML="<b>Invalid JSON</b>"; return; } const rules=($("jrSchemaRules").value||"").split("\n").map(x=>x.trim()).filter(Boolean); const issues=[]; const get=(path)=>path.split(".").reduce((a,k)=>a&&Object.prototype.hasOwnProperty.call(a,k)?a[k]:undefined,obj); for(const r of rules){ if(r.toLowerCase().startsWith("required")){ r.slice(8).split(",").map(x=>x.trim()).filter(Boolean).forEach(p=>{ if(get(p)===undefined) issues.push("Missing: "+p); }); } if(r.toLowerCase().startsWith("type")){ const m=/^type\s+(.+?)\s*=\s*(string|number|boolean|object|array|null)$/i.exec(r); if(m){ const v=get(m[1]); const typ=v===null?"null":Array.isArray(v)?"array":typeof v; if(typ!==m[2].toLowerCase()) issues.push(`${m[1]}: got ${typ}, expected ${m[2]}`); } } } out.innerHTML=issues.length?issues.map(esc).join("<br>"):"<b>Schema OK</b>"; }
  function addHistory(input,output){ if(!state.pro||localStorage.getItem(HIST_ENABLED_KEY)!=="1") return; let arr=[]; try{arr=JSON.parse(localStorage.getItem(HIST_ITEMS_KEY)||"[]");}catch(e){} arr.unshift({at:new Date().toISOString(),input:input.slice(0,120),output:output.slice(0,120)}); localStorage.setItem(HIST_ITEMS_KEY,JSON.stringify(arr.slice(0,10))); renderHistory(); }
  function renderHistory(){ const list=$("jrHistList"); if(!list) return; if(!state.pro){ list.textContent="—"; return; } let arr=[]; try{arr=JSON.parse(localStorage.getItem(HIST_ITEMS_KEY)||"[]");}catch(e){} list.textContent=arr.length?arr.map(x=>`${x.at}\nIN: ${x.input}\nOUT: ${x.output}`).join("\n\n"):"—"; }

  function wire(){
    document.querySelectorAll(".nw-lang-btn").forEach(b=>b.addEventListener("click",()=>setLang(b.dataset.lang)));
    $("selRepairLevel").addEventListener("change",e=>{ state.level=e.target.value; renderLevelHelp(); });
    $("selIndent").addEventListener("change",e=>{ state.indent=parseInt(e.target.value,10)||2; });
    $("selSample").addEventListener("change",e=>{ const k=e.target.value; if(!k)return; const opt=e.target.selectedOptions[0]; if(opt&&opt.dataset.pro&&!state.pro){ e.target.value=""; toast(tr("aggressiveLocked")); return; } $("jrInput").value=SAMPLES[k]||""; updateStats(); });
    $("jrInput").addEventListener("input",updateStats);
    $("btnValidate").addEventListener("click",validate);
    $("btnRepair").addEventListener("click",doRepair);
    $("btnFormatPretty").addEventListener("click",()=>doPretty(false));
    $("btnFormatMinify").addEventListener("click",()=>doPretty(true));
    $("btnCopy").addEventListener("click",copyOut);
    $("btnDownload").addEventListener("click",saveOut);
    $("btnReset").addEventListener("click",resetAll);
    $("btnLoad").addEventListener("click",()=>$("fileInput").click());
    $("fileInput").addEventListener("change",async e=>{ const f=e.target.files&&e.target.files[0]; if(!f)return; $("jrInput").value=await f.text(); updateStats(); e.target.value=""; });
    document.querySelectorAll(".jr-tab").forEach(b=>b.addEventListener("click",()=>setTab(b.dataset.tab)));
    $("btnProActivate").addEventListener("click",()=>setPro(true,$("jrProKey").value));
    $("btnProClear").addEventListener("click",()=>setPro(false,""));
    $("jrHistEnable").addEventListener("change",e=>{ localStorage.setItem(HIST_ENABLED_KEY,e.target.checked?"1":"0"); });
    $("btnSchemaRun").addEventListener("click",schemaCheck);
    document.addEventListener("keydown",e=>{ if(!(e.metaKey||e.ctrlKey))return; if(e.key==="Enter"&&e.shiftKey){ e.preventDefault(); validate(); } else if(e.key==="Enter"){ e.preventDefault(); doRepair(); } else if(e.key.toLowerCase()==="s"){ e.preventDefault(); saveOut(); } });
  }

  function init(){ state.lang=detectLang(); document.documentElement.lang=state.lang; loadPro(); insertGuide(); wire(); renderAllText(); renderProState(); updateStats(); renderLog(); renderHistory(); setTab("repaired"); }
  document.addEventListener("DOMContentLoaded",init);
})();
