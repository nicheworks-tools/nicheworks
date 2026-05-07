(function(){
  const TOOL = "minutes-to-ops";
  const $ = (id)=>document.getElementById(id);
  const els = {
    uiJA: $("uiJA"), uiEN: $("uiEN"), title: $("title"), subhead: $("subhead"),
    notes: $("notes"), meetingTitle: $("meetingTitle"), meetingDate: $("meetingDate"), participants: $("participants"),
    gen: $("genBtn"), clear: $("clearBtn"), pasteExample: $("pasteExampleBtn"),
    todoBody: $("todoBody"), todoMeta: $("todoMeta"), decisions: $("decisions"), sop: $("sop"),
    csvPreview: $("csvPreview"), mdPreview: $("mdPreview"), dlCsv: $("dlCsvBtn"), dlMd: $("dlMdBtn"),
    exportState: $("exportState"), copyMd: $("copyMdBtn"), copySop: $("copySopBtn"), faq: $("faq"), faqFallback: $("faqFallback"), toast: $("toast"),
    hTodo: $("hTodo"), hDec: $("hDec"), hSop: $("hSop"), hExport: $("hExport"),
    lblNotes: $("lblNotes"), lblMeeting: $("lblMeeting"), lblDate: $("lblDate"), lblParts: $("lblParts"), lblCsvPreview: $("lblCsvPreview"), lblMdPreview: $("lblMdPreview"),
    privacyNote: $("privacyNote"), ruleNote: $("ruleNote"), langNote: $("langNote")
  };

  const TXT = {
    JA: {
      title:"議事録→ToDo→決定事項→SOP", subhead:"議事録を“運用成果物”に整形（ルールベース / 翻訳なし）",
      lblNotes:"議事録（貼り付け）", lblMeeting:"会議名", lblDate:"日付", lblParts:"参加者",
      phNotes:"議事録を貼り付けてください", phMeeting:"例: 週次MTG / Sprint planning", phDate:"例: 2026-02-03", phParts:"例: A, B, C",
      gen:"生成", clear:"クリア", pasteExample:"例を入れる", hTodo:"ToDo", hDec:"決定事項", hSop:"SOPドラフト", hExport:"Export",
      exportState:"CSV / Markdown保存は無料です。Pro拡張は下部の予定枠に残しています。", copyMd:"Markdownをコピー", copySop:"SOPをコピー", dlCsv:"CSVを保存", dlMd:"Markdownを保存",
      privacyNote:"抽出処理はブラウザ内で行います。ただし広告・解析タグは読み込まれます。公開前の重要情報は貼り付けないでください。",
      ruleNote:"このツールはAI要約ではありません。Task / 担当 / 期限 / 決定 / 合意 などの語をもとに、ルールベースで抽出します。重要な内容は原文と照合してください。",
      langNote:"UIだけ切り替えます。議事録本文は翻訳しません。出力見出しは入力言語を推定して切り替えます。",
      pasteFirst:"議事録を貼り付けてください", examplePasted:"例を入力しました", csvSaved:"CSVを保存しました", mdSaved:"Markdownを保存しました", mdCopied:"Markdownをコピーしました", sopCopied:"SOPをコピーしました", copyEmpty:"コピーする内容がありません", copyFailed:"コピーに失敗しました。手動で選択してコピーしてください。",
      proTitle:"Pro予定（削除しない枠）", proLead:"初期公開ではCSV/Markdown保存を無料にし、Proは未実装機能の予定枠として残します。", proItems:["履歴保存", "複数議事録の比較", "SOP/ToDoテンプレート拡張", "PDF出力", "チーム向けエクスポート整形"]
    },
    EN: {
      title:"Minutes → ToDos → Decisions → SOP", subhead:"Turn minutes into operational artifacts (rule-based / no translation)",
      lblNotes:"Meeting notes (paste)", lblMeeting:"Meeting title", lblDate:"Date", lblParts:"Participants",
      phNotes:"Paste meeting notes here", phMeeting:"Example: Weekly sync / Sprint planning", phDate:"Example: 2026-02-03", phParts:"Example: A, B, C",
      gen:"Generate", clear:"Clear", pasteExample:"Paste example", hTodo:"ToDos", hDec:"Decisions", hSop:"SOP draft", hExport:"Export",
      exportState:"CSV / Markdown downloads are free. Planned Pro extensions remain below.", copyMd:"Copy Markdown", copySop:"Copy SOP", dlCsv:"Download CSV", dlMd:"Download Markdown",
      privacyNote:"Extraction runs in your browser. Ads and analytics scripts may still load. Do not paste unpublished important information.",
      ruleNote:"This is not AI summarization. It uses rule-based extraction from words such as Task, Owner, Due, Decision, and Agreed. Always compare important items with the original notes.",
      langNote:"The UI language changes only labels. Meeting notes are not translated. Output headings are inferred from the input language.",
      pasteFirst:"Paste notes first", examplePasted:"Example pasted", csvSaved:"CSV downloaded", mdSaved:"Markdown downloaded", mdCopied:"Markdown copied", sopCopied:"SOP copied", copyEmpty:"Nothing to copy", copyFailed:"Copy failed. Select the text manually and copy it.",
      proTitle:"Planned Pro features", proLead:"CSV/Markdown downloads stay free for the initial release. Pro remains as a planned extension area, not a removed product tier.", proItems:["Local history", "Compare multiple meeting notes", "Extended SOP/ToDo templates", "PDF export", "Team-ready export formatting"]
    }
  };

  const FAQ = {
    JA: [["AI要約ですか？","いいえ。キーワードとテンプレートによるルールベース抽出です。"],["翻訳できますか？","できません。UI表示だけ切り替わり、本文は翻訳しません。"],["CSV/Markdownは無料で保存できますか？","初期版では無料保存を基本にします。PDF出力や履歴などはPro拡張候補です。"]],
    EN: [["Is this AI summarization?","No. It is rule-based extraction using keywords and templates."],["Can it translate notes?","No. The UI labels can switch languages, but the pasted notes are not translated."],["Are CSV and Markdown downloads free?","Yes. CSV and Markdown downloads stay free in the initial version. PDF/history features are Pro candidates."]]
  };

  let UI = "JA";
  let currentTodos = [];
  let currentMarkdown = "";
  let currentSop = "";

  function gtagSafe(name, params){ try{ if(typeof window.gtag==="function") window.gtag("event", name, params||{}); }catch(_){} }
  function toast(msg){ const t=els.toast; if(!t) return; t.textContent=msg; t.style.display="block"; clearTimeout(toast._tm); toast._tm=setTimeout(()=>{t.style.display="none";},1800); }
  function setText(el, text){ if(el) el.textContent = text; }
  function setPH(el, text){ if(el){ el.setAttribute("placeholder", text); el.removeAttribute("stable"); el.removeAttribute("content"); } }

  function setUI(lang){
    UI = lang;
    const t = TXT[lang];
    if(els.uiJA) els.uiJA.disabled = lang === "JA";
    if(els.uiEN) els.uiEN.disabled = lang === "EN";
    document.documentElement.lang = lang === "JA" ? "ja" : "en";
    ["title","subhead","lblNotes","lblMeeting","lblDate","lblParts","gen","clear","pasteExample","hTodo","hDec","hSop","hExport","exportState","copyMd","copySop","dlCsv","dlMd","privacyNote","ruleNote","langNote"].forEach(k=>setText(els[k], t[k]));
    setText(els.lblCsvPreview, "CSV preview");
    setText(els.lblMdPreview, "Markdown preview");
    setPH(els.notes, t.phNotes); setPH(els.meetingTitle, t.phMeeting); setPH(els.meetingDate, t.phDate); setPH(els.participants, t.phParts);
    renderFAQ(FAQ[lang]);
    renderProRoadmap(t);
    gtagSafe("tool_open", { tool_slug: TOOL, lang: UI });
  }

  function renderProRoadmap(t){
    let card = document.getElementById("proRoadmap");
    if(!card){
      const exportCard = els.mdPreview && els.mdPreview.closest(".nw-card");
      if(!exportCard || !exportCard.parentNode) return;
      card = document.createElement("div");
      card.id = "proRoadmap";
      card.className = "nw-card nw-pro-roadmap";
      card.style.marginTop = "12px";
      exportCard.parentNode.insertBefore(card, exportCard.nextSibling);
    }
    card.textContent = "";
    const h = document.createElement("div");
    h.style.fontWeight = "800";
    h.textContent = t.proTitle;
    const p = document.createElement("p");
    p.className = "nw-muted";
    p.textContent = t.proLead;
    const ul = document.createElement("ul");
    t.proItems.forEach((item)=>{ const li=document.createElement("li"); li.textContent=item; ul.appendChild(li); });
    card.appendChild(h); card.appendChild(p); card.appendChild(ul);
  }

  function detectJA(text){ const s=text||""; const ja=(s.match(/[\u3040-\u30ff\u4e00-\u9faf]/g)||[]).length; return ja/Math.max(1,s.length)>0.08; }
  function parseLines(text){ return (text||"").split(/\r?\n/).map(x=>x.trim()).filter(Boolean); }
  function dedupe(arr){ const seen=new Set(); const out=[]; for(const x of arr){ const k=String(x).toLowerCase().replace(/\s+/g," "); if(!seen.has(k)){seen.add(k); out.push(x);} } return out; }
  function dedupeByKey(arr, fn){ const seen=new Set(); const out=[]; for(const x of arr){ const k=fn(x); if(!seen.has(k)){seen.add(k); out.push(x);} } return out; }

  function extractTodos(lines){
    const out=[];
    const todoReJA=/(TODO|ToDo|Task|やる|対応|確認|作る|修正|送る|依頼|担当|期限)/i;
    const todoReEN=/(TODO|Task|Action|We will|Need to|Follow up|Owner:|Due:)/i;
    for(const line of lines){
      if(!(todoReJA.test(line)||todoReEN.test(line))) continue;
      const owner=(line.match(/(?:担当|Owner)\s*[:：]\s*([A-Za-z0-9_\-ぁ-んァ-ン一-龥@]+)/)||[])[1]||"";
      const due=(line.match(/(?:期限|Due)\s*[:：]\s*([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}|[0-9]{1,2}\/[0-9]{1,2}|[A-Za-z]{3,9}\s+\d{1,2})/)||[])[1]||"";
      const pr=(line.match(/(?:優先|Priority)\s*[:：]\s*(High|Med|Low|P0|P1|P2)/i)||[])[1]||"";
      out.push({task:line, owner, due, priority:pr, status:""});
      if(out.length>=30) break;
    }
    return dedupeByKey(out, x=>x.task.toLowerCase().replace(/\s+/g," "));
  }

  function extractDecisions(lines){ const out=[]; const reJA=/(決定|合意|方針|採用|却下)/; const reEN=/(Decision|Agreed|We decided|Conclusion)/i; for(const line of lines){ if(reJA.test(line)||reEN.test(line)) out.push(line); if(out.length>=20) break; } return dedupe(out); }

  function buildSOP(meta, todos, decisions, rawText){
    const ja=detectJA(rawText);
    const title=meta.title || (ja ? "（会議名未入力）" : "(No meeting title)");
    const date=meta.date || (ja ? "（日付未入力）" : "(No date)");
    const parts=meta.participants || (ja ? "（参加者未入力）" : "(No participants)");
    const risks=parseLines(rawText).filter(l=>/(リスク|懸念|課題|blocker|risk|issue)/i.test(l)).slice(0,6);
    const steps=todos.slice(0,10).map((x,i)=>`${i+1}. ${x.task}${x.owner?` (${x.owner})`:""}${x.due?` [${x.due}]`:""}`);
    if(ja) return ["# SOPドラフト","## 目的",`${title} の決定事項とToDoを運用手順に落とし込む。`,"","## 範囲",`対象: ${parts} / 日付: ${date}`,"","## 手順",steps.length?steps.join("\n"):"（ToDoが見つかりませんでした。Task/担当/期限 を含めると抽出しやすいです）","","## チェック",decisions.length?decisions.map(x=>`- ${x}`).join("\n"):"- （決定事項なし）","","## 例外・リスク",risks.length?risks.map(x=>`- ${x}`).join("\n"):"- （記載なし）"].join("\n");
    return ["# SOP Draft","## Purpose",`Turn outcomes of \"${title}\" into executable steps.`,"","## Scope",`Participants: ${parts} / Date: ${date}`,"","## Procedure",steps.length?steps.join("\n"):"(No ToDos found. Add Task/Owner/Due markers for better extraction.)","","## Checklist",decisions.length?decisions.map(x=>`- ${x}`).join("\n"):"- (No decisions found)","","## Exceptions / Risks",risks.length?risks.map(x=>`- ${x}`).join("\n"):"- (none)"].join("\n");
  }

  function renderEmptyTodos(){ if(!els.todoBody) return; els.todoBody.textContent=""; const tr=document.createElement("tr"); const td=document.createElement("td"); td.colSpan=5; td.className="nw-muted"; td.textContent="—"; tr.appendChild(td); els.todoBody.appendChild(tr); }
  function renderTodos(todos){ if(!els.todoBody) return; els.todoBody.textContent=""; if(!todos.length){ renderEmptyTodos(); return; } for(const item of todos){ const tr=document.createElement("tr"); ["task","owner","due","priority","status"].forEach(key=>{ const td=document.createElement("td"); td.textContent=item[key]||""; tr.appendChild(td); }); els.todoBody.appendChild(tr); } }

  function csvCell(x){ const s=String(x||""); return /[,"\r\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; }
  function toCSV(todos, opt){ const o=Object.assign({bom:false,newline:"\n"}, opt||{}); const rows=[["task","owner","due","priority","status"].join(",")]; for(const t of todos) rows.push([t.task,t.owner,t.due,t.priority,t.status].map(csvCell).join(",")); return (o.bom?"\uFEFF":"") + rows.join(o.newline); }
  function pipe(s){ return String(s||"").replace(/\|/g,"\\|").replace(/\r?\n/g," "); }
  function toMarkdown(meta, todos, decisions, sop, rawText){
    const ja=detectJA(rawText);
    const lines=["# Minutes to Ops",`- Timestamp: ${new Date().toLocaleString()}`,`- Title: ${meta.title||"-"}`,`- Date: ${meta.date||"-"}`,`- Participants: ${meta.participants||"-"}`,`- Headings: ${ja?"JA":"EN"} (content not translated)`,"- Extraction: rule-based keyword/template extraction, not AI summarization","- Note: Original full notes are not included in this export.","","## Decisions",decisions.length?decisions.map(x=>`- ${x}`).join("\n"):"- (none)","","## ToDos"];
    if(todos.length){ lines.push("| Task | Owner | Due | Priority | Status |","|---|---|---|---|---|"); for(const t of todos) lines.push(`| ${pipe(t.task)} | ${pipe(t.owner)} | ${pipe(t.due)} | ${pipe(t.priority)} | ${pipe(t.status)} |`); } else lines.push("- (none)");
    lines.push("","## SOP","```",sop,"```");
    return lines.join("\n");
  }
  function stamp(){ const d=new Date(); return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; }
  function download(filename, content, mime){ const blob=new Blob([content],{type:mime||"text/plain;charset=utf-8"}); const a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download=filename; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},0); }
  function meta(){ return { title:(els.meetingTitle?.value||"").trim(), date:(els.meetingDate?.value||"").trim(), participants:(els.participants?.value||"").trim() }; }

  function generate(opts){
    const silent=opts&&opts.silent;
    const raw=(els.notes?.value||"").trim();
    gtagSafe("tool_run", { tool_slug: TOOL, lang: UI });
    if(!raw){ clearAll(); if(!silent) toast(TXT[UI].pasteFirst); return false; }
    const lines=parseLines(raw);
    const todos=extractTodos(lines);
    const decisions=extractDecisions(lines);
    const m=meta();
    const sop=buildSOP(m,todos,decisions,raw);
    const md=toMarkdown(m,todos,decisions,sop,raw);
    currentTodos=todos; currentSop=sop; currentMarkdown=md;
    renderTodos(todos);
    setText(els.todoMeta, `${todos.length} todos / ${decisions.length} decisions`);
    setText(els.decisions, decisions.length?decisions.map(x=>`- ${x}`).join("\n"):"—");
    setText(els.sop, sop);
    const csv=toCSV(todos,{bom:false,newline:"\n"});
    if(els.csvPreview){ const rows=csv.split("\n"); els.csvPreview.value=rows.slice(0,21).join("\n") + (rows.length>21?"\n...":""); }
    if(els.mdPreview) els.mdPreview.value=md;
    return true;
  }
  function ensureGenerated(){ if(!(els.notes?.value||"").trim()) return false; return currentMarkdown || generate({silent:true}); }

  async function copyText(value, okMsg){
    const text=String(value||"");
    if(!text.trim()){ toast(TXT[UI].copyEmpty); return; }
    try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); toast(okMsg); return; } }catch(_){}
    const ta=document.createElement("textarea"); ta.value=text; ta.setAttribute("readonly",""); ta.style.position="fixed"; ta.style.left="-9999px"; document.body.appendChild(ta); ta.focus(); ta.select();
    try{ toast(document.execCommand("copy") ? okMsg : TXT[UI].copyFailed); }catch(_){ toast(TXT[UI].copyFailed); } finally{ ta.remove(); }
  }

  function renderFAQ(items){ if(!els.faq) return; els.faq.textContent=""; for(const item of items){ const details=document.createElement("details"); const summary=document.createElement("summary"); const p=document.createElement("p"); summary.textContent=item[0]; p.textContent=item[1]; details.appendChild(summary); details.appendChild(p); els.faq.appendChild(details); } if(els.faqFallback) els.faqFallback.style.display="none"; }
  function clearAll(){ currentTodos=[]; currentMarkdown=""; currentSop=""; renderEmptyTodos(); setText(els.todoMeta,"—"); setText(els.decisions,"—"); setText(els.sop,"—"); if(els.csvPreview) els.csvPreview.value=""; if(els.mdPreview) els.mdPreview.value=""; }

  const EX_JA=`週次MTG
決定: 次スプリントはP0を優先
Task: LPの見出し修正 担当: A 期限: 2026-02-05
Task: GA4イベント確認 担当: B 期限: 2026-02-06
懸念: モバイルで一覧が長すぎる
決定: 詳細は全画面シートにする`;
  const EX_EN=`Weekly sync
Decision: Prioritise P0 items next sprint
Task: Fix landing page headline Owner: A Due: Feb 5
Action: Verify GA4 events Owner: B Due: Feb 6
Risk: Mobile list view is too long
Agreed: Use full-screen sheet for details`;

  els.uiJA?.addEventListener("click",()=>setUI("JA"));
  els.uiEN?.addEventListener("click",()=>setUI("EN"));
  els.gen?.addEventListener("click",()=>generate());
  els.clear?.addEventListener("click",()=>{ if(els.notes) els.notes.value=""; if(els.meetingTitle) els.meetingTitle.value=""; if(els.meetingDate) els.meetingDate.value=""; if(els.participants) els.participants.value=""; clearAll(); });
  els.pasteExample?.addEventListener("click",()=>{ if(els.notes) els.notes.value=UI==="JA"?EX_JA:EX_EN; toast(TXT[UI].examplePasted); });
  els.dlCsv?.addEventListener("click",()=>{ if(!ensureGenerated()){ toast(TXT[UI].pasteFirst); return; } gtagSafe("export_click",{tool_slug:TOOL,kind:"csv"}); download(`minutes-to-ops-todos-${stamp()}.csv`, toCSV(currentTodos,{bom:true,newline:"\r\n"}), "text/csv;charset=utf-8"); toast(TXT[UI].csvSaved); });
  els.dlMd?.addEventListener("click",()=>{ if(!ensureGenerated()){ toast(TXT[UI].pasteFirst); return; } gtagSafe("export_click",{tool_slug:TOOL,kind:"md"}); download(`minutes-to-ops-${stamp()}.md`, currentMarkdown, "text/markdown;charset=utf-8"); toast(TXT[UI].mdSaved); });
  els.copyMd?.addEventListener("click",()=>{ if(!ensureGenerated()){ toast(TXT[UI].pasteFirst); return; } copyText(currentMarkdown || els.mdPreview?.value, TXT[UI].mdCopied); });
  els.copySop?.addEventListener("click",()=>{ if(!ensureGenerated()){ toast(TXT[UI].pasteFirst); return; } copyText(currentSop || els.sop?.textContent, TXT[UI].sopCopied); });

  setUI("JA");
  clearAll();
})();
