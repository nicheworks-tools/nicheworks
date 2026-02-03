(function(){
  const TOOL = "minutes-to-ops";
  const PRO_KEY = "nw_pro_" + TOOL;

  const $ = (id)=>document.getElementById(id);
  const els = {
    uiJA: $("uiJA"), uiEN: $("uiEN"),
    title: $("title"), subhead: $("subhead"),
    notes: $("notes"),
    meetingTitle: $("meetingTitle"),
    meetingDate: $("meetingDate"),
    participants: $("participants"),
    gen: $("genBtn"), clear: $("clearBtn"),
    pasteExample: $("pasteExampleBtn"),
    todoBody: $("todoBody"), todoMeta: $("todoMeta"),
    decisions: $("decisions"),
    sop: $("sop"),
    csvPreview: $("csvPreview"),
    mdPreview: $("mdPreview"),
    dlCsv: $("dlCsvBtn"), dlMd: $("dlMdBtn"), dlPdf: $("dlPdfBtn"),
    payBtn: $("payBtn"), manualPro: $("manualProBtn"),
    proState: $("proState"),
    copyMd: $("copyMdBtn"), copySop: $("copySopBtn"),
    faq: $("faq"), faqFallback: $("faqFallback"),
    toast: $("toast"),
    hTodo: $("hTodo"), hDec: $("hDec"), hSop: $("hSop"),
    disclaimer: $("disclaimer"),
    lblNotes: $("lblNotes"), lblMeeting: $("lblMeeting"), lblDate: $("lblDate"), lblParts: $("lblParts"),
  };

  function gtagSafe(name, params){
    try{ if(typeof window.gtag==="function") window.gtag("event", name, params||{}); }catch(_){}
  }
  function toast(msg){
    const t = els.toast; if(!t) return;
    t.textContent = msg; t.style.display="block";
    clearTimeout(toast._tm);
    toast._tm = setTimeout(()=>{ t.style.display="none"; }, 1800);
  }

  function isPro(){ return localStorage.getItem(PRO_KEY)==="1"; }
  function setPro(v){
    if(v) localStorage.setItem(PRO_KEY,"1"); else localStorage.removeItem(PRO_KEY);
    updateProUI();
  }
  function updateProUI(){
    const pro = isPro();
    els.dlCsv.disabled = !pro;
    els.dlMd.disabled  = !pro;
    els.dlPdf.disabled = !pro;
    els.proState.textContent = pro ? "Pro: ON" : "Pro: OFF (downloads locked)";
  }

  // UI language (labels only)
  let UI = "JA";
  function setUI(lang){
    UI = lang;
    els.uiJA.disabled = (lang==="JA");
    els.uiEN.disabled = (lang==="EN");

    if(lang==="JA"){
      document.documentElement.lang = "ja";
      els.title.textContent = "議事録→ToDo→決定事項→SOP";
      els.subhead.textContent = "議事録を“運用成果物”に整形（ルール＋テンプレ / 翻訳なし）";
      els.lblNotes.textContent = "議事録（貼り付け）";
      els.lblMeeting.textContent = "会議名";
      els.lblDate.textContent = "日付";
      els.lblParts.textContent = "参加者";
      els.gen.textContent = "Generate";
      els.clear.textContent = "Clear";
      els.pasteExample.textContent = "Paste example";
      els.hTodo.textContent = "ToDo";
      els.hDec.textContent = "決定事項";
      els.hSop.textContent = "SOPドラフト";
      els.disclaimer.textContent = "本ツールは翻訳や保証を行いません。本文処理はブラウザ内想定。ただし広告/解析タグは読み込まれます。機密情報は避けてください。";
    }else{
      document.documentElement.lang = "en";
      els.title.textContent = "Minutes → ToDos → Decisions → SOP";
      els.subhead.textContent = "Turn minutes into operational artifacts (rules + templates / no translation)";
      els.lblNotes.textContent = "Meeting notes (paste)";
      els.lblMeeting.textContent = "Meeting title";
      els.lblDate.textContent = "Date";
      els.lblParts.textContent = "Participants";
      els.gen.textContent = "Generate";
      els.clear.textContent = "Clear";
      els.pasteExample.textContent = "Paste example";
      els.hTodo.textContent = "ToDos";
      els.hDec.textContent = "Decisions";
      els.hSop.textContent = "SOP draft";
      els.disclaimer.textContent = "No translation, no guarantees. Text processing runs in your browser; analytics/ads scripts may load. Avoid sensitive data.";
    }
    gtagSafe("tool_open", { tool_slug: TOOL, lang: UI });
    loadFAQ();
  }

  // Language detection for headings (output headings only)
  function detectJA(text){
    const s = text || "";
    const ja = (s.match(/[\u3040-\u30ff\u4e00-\u9faf]/g) || []).length;
    const all = Math.max(1, s.length);
    return (ja / all) > 0.08;
  }

  function parseLines(text){
    return (text||"")
      .split(/\r?\n/)
      .map(x=>x.trim())
      .filter(Boolean);
  }

  function extractTodos(lines){
    const out = [];
    const todoReJA = /(TODO|ToDo|やる|対応|確認|作る|修正|送る|依頼)/i;
    const todoReEN = /(TODO|Action|We will|Need to|Follow up|Owner:)/i;

    for(const line of lines){
      if(!(todoReJA.test(line) || todoReEN.test(line))) continue;

      const owner = (line.match(/(?:担当|Owner)\s*[:：]\s*([A-Za-z0-9_\-ぁ-んァ-ン一-龥@]+)/) || [])[1] || "";
      const due = (line.match(/(?:期限|Due)\s*[:：]\s*([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2}|[0-9]{1,2}\/[0-9]{1,2}|[A-Za-z]{3,9}\s+\d{1,2})/) || [])[1] || "";
      const pr = (line.match(/(?:優先|Priority)\s*[:：]\s*(High|Med|Low|P0|P1|P2)/i) || [])[1] || "";
      out.push({ task: line, owner, due, priority: pr, status: "" });
      if(out.length >= 30) break;
    }
    return dedupeByKey(out, x=>x.task.toLowerCase().replace(/\s+/g," "));
  }

  function extractDecisions(lines){
    const out = [];
    const reJA = /(決定|合意|方針|採用|却下)/;
    const reEN = /(Decision|Agreed|We decided|Conclusion)/i;
    for(const line of lines){
      if(!(reJA.test(line) || reEN.test(line))) continue;
      out.push(line);
      if(out.length >= 20) break;
    }
    return dedupe(out);
  }

  function dedupe(arr){
    const seen = new Set(); const out=[];
    for(const x of arr){
      const k = String(x).toLowerCase().replace(/\s+/g," ");
      if(seen.has(k)) continue;
      seen.add(k); out.push(x);
    }
    return out;
  }
  function dedupeByKey(arr, fn){
    const seen = new Set(); const out=[];
    for(const x of arr){
      const k = fn(x);
      if(seen.has(k)) continue;
      seen.add(k); out.push(x);
    }
    return out;
  }

  function buildSOP(meta, todos, decisions, rawText){
    const ja = detectJA(rawText);
    const t = meta.title || (ja ? "（会議名未入力）" : "(No meeting title)");
    const d = meta.date || (ja ? "（日付未入力）" : "(No date)");
    const p = meta.participants || (ja ? "（参加者未入力）" : "(No participants)");

    const riskLines = parseLines(rawText).filter(l=>/(リスク|懸念|課題|blocker|risk|issue)/i.test(l)).slice(0,6);

    const steps = todos.slice(0,10).map((x,i)=>{
      const o = x.owner ? ` (${x.owner})` : "";
      const du = x.due ? ` [${x.due}]` : "";
      return `${i+1}. ${x.task}${o}${du}`;
    });

    if(ja){
      return [
        `# SOPドラフト`,
        `## 目的`,
        `${t} の決定事項とToDoを運用手順に落とし込む。`,
        ``,
        `## 範囲`,
        `対象: ${p} / 日付: ${d}`,
        ``,
        `## 手順`,
        steps.length ? steps.join("\n") : "（ToDoが見つかりませんでした。TODO/担当/期限 を含めると抽出しやすいです）",
        ``,
        `## チェック`,
        decisions.length ? decisions.map(x=>`- ${x}`).join("\n") : "- （決定事項なし）",
        ``,
        `## 例外・リスク`,
        riskLines.length ? riskLines.map(x=>`- ${x}`).join("\n") : "- （記載なし）",
        ``,
        `## 次回改善`,
        "- 次回は ToDo 行に「担当: / 期限:」を付ける"
      ].join("\n");
    }else{
      return [
        `# SOP Draft`,
        `## Purpose`,
        `Turn outcomes of "${t}" into executable steps.`,
        ``,
        `## Scope`,
        `Participants: ${p} / Date: ${d}`,
        ``,
        `## Procedure`,
        steps.length ? steps.join("\n") : "(No ToDos found. Add TODO/Owner/Due markers for better extraction.)",
        ``,
        `## Checklist`,
        decisions.length ? decisions.map(x=>`- ${x}`).join("\n") : "- (No decisions found)",
        ``,
        `## Exceptions / Risks`,
        riskLines.length ? riskLines.map(x=>`- ${x}`).join("\n") : "- (none)",
        ``,
        `## Next iteration`,
        "- Add Owner/Due in the same line for each action item"
      ].join("\n");
    }
  }

  function renderTodos(todos){
    els.todoBody.innerHTML = "";
    if(!todos.length){
      els.todoBody.innerHTML = `<tr><td colspan="5" class="nw-muted">—</td></tr>`;
      return;
    }
    for(const t of todos){
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${esc(t.task)}</td><td>${esc(t.owner)}</td><td>${esc(t.due)}</td><td>${esc(t.priority)}</td><td>${esc(t.status)}</td>`;
      els.todoBody.appendChild(tr);
    }
  }

  function toCSV(todos){
    const head = ["task","owner","due","priority","status"];
    const rows = [head.join(",")];
    for(const t of todos){
      rows.push([t.task,t.owner,t.due,t.priority,t.status].map(csvCell).join(","));
    }
    return rows.join("\n");
  }
  function csvCell(x){
    const s = String(x||"");
    if(/[,"\n]/.test(s)) return `"${s.replace(/"/g,'""')}"`;
    return s;
  }
  function toMarkdown(meta, todos, decisions, sop, rawText){
    const ja = detectJA(rawText);
    const lines = [];
    lines.push(`# Minutes to Ops`);
    lines.push(`- Timestamp: ${new Date().toLocaleString()}`);
    lines.push(`- Title: ${meta.title || "-"}`);
    lines.push(`- Date: ${meta.date || "-"}`);
    lines.push(`- Participants: ${meta.participants || "-"}`);
    lines.push(`- Headings: ${ja ? "JA" : "EN"} (content not translated)`);
    lines.push(``);
    lines.push(`## Decisions`);
    lines.push(decisions.length ? decisions.map(x=>`- ${x}`).join("\n") : "- (none)");
    lines.push(``);
    lines.push(`## ToDos`);
    if(todos.length){
      lines.push(`| Task | Owner | Due | Priority | Status |`);
      lines.push(`|---|---|---|---|---|`);
      for(const t of todos){
        lines.push(`| ${pipe(t.task)} | ${pipe(t.owner)} | ${pipe(t.due)} | ${pipe(t.priority)} | ${pipe(t.status)} |`);
      }
    }else{
      lines.push(`- (none)`);
    }
    lines.push(``);
    lines.push(`## SOP`);
    lines.push("```");
    lines.push(sop);
    lines.push("```");
    return lines.join("\n");
  }
  function pipe(s){ return String(s||"").replace(/\|/g,"\\|"); }
  function esc(s){ return String(s||"").replace(/[&<>"']/g,(c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c])); }

  function download(filename, content, mime){
    const blob = new Blob([content], {type:mime||"text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  // FAQ
  async function loadFAQ(){
    try{
      const res = await fetch("./qa.json", {cache:"no-store"});
      if(!res.ok) throw new Error("bad");
      const items = await res.json();
      els.faq.innerHTML = "";
      const show = items.filter(x=> (UI==="JA" ? x.lang==="ja" : x.lang==="en")).slice(0,6);
      for(const it of show){
        const d = document.createElement("details");
        d.innerHTML = `<summary>${esc(it.q)}</summary><p>${esc(it.a)}</p>`;
        els.faq.appendChild(d);
      }
      els.faqFallback.style.display = show.length ? "none" : "block";
    }catch(_){
      els.faqFallback.style.display = "block";
    }
  }

  function clearAll(){
    els.todoBody.innerHTML = `<tr><td colspan="5" class="nw-muted">—</td></tr>`;
    els.todoMeta.textContent = "—";
    els.decisions.textContent = "—";
    els.sop.textContent = "—";
    els.csvPreview.value = "";
    els.mdPreview.value = "";
  }

  function generate(){
    const raw = (els.notes.value||"").trim();
    gtagSafe("tool_run", { tool_slug: TOOL, lang: UI });

    if(!raw){
      clearAll();
      toast(UI==="JA" ? "議事録を貼り付けてください" : "Paste notes first");
      return;
    }

    const lines = parseLines(raw);
    const todos = extractTodos(lines);
    const decisions = extractDecisions(lines);

    renderTodos(todos);
    els.todoMeta.textContent = `${todos.length} todos / ${decisions.length} decisions`;

    els.decisions.textContent = decisions.length ? decisions.map(x=>`- ${x}`).join("\n") : "—";

    const meta = { title: (els.meetingTitle.value||"").trim(), date: (els.meetingDate.value||"").trim(), participants: (els.participants.value||"").trim() };
    const sop = buildSOP(meta, todos, decisions, raw);
    els.sop.textContent = sop;

    const csv = toCSV(todos);
    els.csvPreview.value = csv.split("\n").slice(0,21).join("\n") + (csv.split("\n").length>21 ? "\n..." : "");

    const md = toMarkdown(meta, todos, decisions, sop, raw);
    els.mdPreview.value = md;
  }

  // examples
  const EX_JA = `週次MTG
決定: 次スプリントはP0を優先
TODO: LPの見出し修正 担当: A 期限: 2026-02-05
TODO: GA4イベント確認 担当: B 期限: 2026-02-06
懸念: モバイルで一覧が長すぎる
決定: 詳細は全画面シートにする`;

  const EX_EN = `Weekly sync
Decision: Prioritise P0 items next sprint
TODO: Fix landing page headline Owner: A Due: Feb 5
Action: Verify GA4 events Owner: B Due: Feb 6
Risk: Mobile list view is too long
Agreed: Use full-screen sheet for details`;

  // wire
  els.uiJA.addEventListener("click", ()=>setUI("JA"));
  els.uiEN.addEventListener("click", ()=>setUI("EN"));

  els.gen.addEventListener("click", generate);
  els.clear.addEventListener("click", ()=>{
    els.notes.value=""; els.meetingTitle.value=""; els.meetingDate.value=""; els.participants.value="";
    clearAll();
  });

  els.pasteExample.addEventListener("click", ()=>{
    els.notes.value = (UI==="JA") ? EX_JA : EX_EN;
    toast("Example pasted");
  });

  els.payBtn.addEventListener("click", ()=>{
    gtagSafe("pro_unlock_click", { tool_slug: TOOL });
    toast("Replace payment link later: REPLACE_STRIPE_PAYMENT_LINK_minutes-to-ops");
  });

  els.manualPro.addEventListener("click", ()=>{
    gtagSafe("pro_manual_enable", { tool_slug: TOOL });
    setPro(true);
    toast("Pro enabled (manual) on this browser");
  });

  els.dlCsv.addEventListener("click", ()=>{
    if(!isPro()){ toast("Unlock Pro to download"); return; }
    gtagSafe("export_click", { tool_slug: TOOL, kind:"csv" });
    download("minutes-to-ops-todos.csv", toCSV(extractTodos(parseLines(els.notes.value||""))), "text/csv");
  });

  els.dlMd.addEventListener("click", ()=>{
    if(!isPro()){ toast("Unlock Pro to download"); return; }
    gtagSafe("export_click", { tool_slug: TOOL, kind:"md" });
    download("minutes-to-ops.md", els.mdPreview.value || "", "text/markdown");
  });

  els.dlPdf.addEventListener("click", ()=>{
    if(!isPro()){ toast("Unlock Pro to export"); return; }
    gtagSafe("export_click", { tool_slug: TOOL, kind:"pdf" });
    toast("PDF export is coming soon. Use CSV/Markdown for now.");
  });

  els.copyMd.addEventListener("click", async ()=>{
    try{ await navigator.clipboard.writeText(els.mdPreview.value || ""); toast("Copied"); }catch(_){ toast("Copy failed"); }
  });

  els.copySop.addEventListener("click", async ()=>{
    try{ await navigator.clipboard.writeText(els.sop.textContent || ""); toast("Copied"); }catch(_){ toast("Copy failed"); }
  });

  // init
  updateProUI();
  setUI("JA");
  clearAll();
  loadFAQ();
})();
