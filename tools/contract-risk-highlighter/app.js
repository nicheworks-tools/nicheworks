(function(){
  const TOOL = "contract-risk-highlighter";
  const PRO_KEY = "nw_pro_" + TOOL;

  const $ = (id)=>document.getElementById(id);
  const els = {
    modeJP: $("modeJP"),
    modeEN: $("modeEN"),
    subhead: $("subhead"),
    lblText: $("lblText"),
    lblType: $("lblType"),
    lblPdf: $("lblPdf"),
    pdfNote: $("pdfNote"),
    contractType: $("contractType"),
    text: $("contractText"),
    analyze: $("analyzeBtn"),
    clear: $("clearBtn"),
    pasteExample: $("pasteExampleBtn"),
    riskBadge: $("riskBadge"),
    riskWhy: $("riskWhy"),
    findings: $("findings"),
    mdPreview: $("mdPreview"),
    downloadMd: $("downloadMdBtn"),
    downloadPdf: $("downloadPdfBtn"),
    payBtn: $("payBtn"),
    manualPro: $("manualProBtn"),
    proState: $("proState"),
    copyFindings: $("copyFindingsBtn"),
    toast: $("toast"),
    faq: $("faq"),
    faqFallback: $("faqFallback"),
  };

  function gtagSafe(name, params){
    try{
      if (typeof window.gtag === "function") window.gtag("event", name, params || {});
    }catch(_){}
  }

  function toast(msg){
    const t = els.toast;
    if(!t) return;
    t.textContent = msg;
    t.style.display = "block";
    clearTimeout(toast._tm);
    toast._tm = setTimeout(()=>{ t.style.display="none"; }, 1800);
  }

  function isPro(){ return localStorage.getItem(PRO_KEY) === "1"; }
  function setPro(v){
    if(v) localStorage.setItem(PRO_KEY, "1"); else localStorage.removeItem(PRO_KEY);
    updateProUI();
  }

  function updateProUI(){
    const pro = isPro();
    els.downloadMd.disabled = !pro;
    els.downloadPdf.disabled = !pro;
    els.proState.textContent = pro ? "Pro: ON" : "Pro: OFF (downloads locked)";
  }

  // ---- Mode (JP/EN) ----
  let MODE = "JP";
  function setMode(m){
    MODE = m;
    els.modeJP.disabled = (m==="JP");
    els.modeEN.disabled = (m==="EN");

    if(m==="JP"){
      document.documentElement.lang = "ja";
      els.subhead.textContent = "契約書の“注意点になり得るパターン”を抽出して整理（法的助言ではありません）";
      els.lblText.textContent = "契約書テキスト（貼り付け）";
      els.lblType.textContent = "契約タイプ";
      els.lblPdf.textContent = "PDFから抽出（準備中）";
      els.pdfNote.textContent = "coming soon";
      els.analyze.textContent = "Analyze";
      els.clear.textContent = "Clear";
      els.pasteExample.textContent = "Paste example";
      els.contractType.innerHTML = `
        <option value="services_jp">業務委託（v1中心）</option>
        <option value="nda_jp">NDA（参考）</option>
        <option value="sales_jp">売買（参考）</option>
      `;
    }else{
      document.documentElement.lang = "en";
      els.subhead.textContent = "Highlight potentially risky clause patterns (not legal advice)";
      els.lblText.textContent = "Contract text (paste)";
      els.lblType.textContent = "Contract type";
      els.lblPdf.textContent = "Extract from PDF (coming soon)";
      els.pdfNote.textContent = "coming soon";
      els.analyze.textContent = "Analyze";
      els.clear.textContent = "Clear";
      els.pasteExample.textContent = "Paste example";
      els.contractType.innerHTML = `
        <option value="services_en">Services Agreement (v1 focus)</option>
        <option value="nda_en">NDA (reference)</option>
        <option value="sales_en">Sales (reference)</option>
      `;
    }
    gtagSafe("tool_open", { tool_slug: TOOL, lang: MODE });
    clearOutputs();
  }

  // ---- Findings ----
  function windowSnippet(text, idx, mlen){
    const left = Math.max(0, idx - 90);
    const right = Math.min(text.length, idx + (mlen||0) + 90);
    let s = text.slice(left, right);
    s = s.replace(/\s+/g," ").trim();
    if(left>0) s = "…" + s;
    if(right<text.length) s = s + "…";
    return s.slice(0, 220);
  }

  function makeFinding({id,title,severity,idx,len,why,questions,suggestion}, text){
    return {
      id, title, severity,
      snippet: windowSnippet(text, idx, len),
      why, questions: questions||[], suggestion: suggestion||""
    };
  }

  function rulesJP(text){
    const rules = [
      { id:"jp_term", title:"一方的/強い解除・違約金", severity:"HIGH",
        re: /(違約金|損害賠償|即時解除|解除権|無催告)/g,
        why:"解除や違約金が一方に偏ると、取引継続のリスクが増える可能性があります。",
        questions:["解除条件は双方対等か？","違約金/賠償の上限はあるか？"],
        suggestion:"解除条件・賠償上限・通知期間を明確化することを検討。"
      },
      { id:"jp_exempt", title:"免責の偏り", severity:"HIGH",
        re: /(一切責任を負わない|いかなる責任も負わない|免責)/g,
        why:"免責が広すぎると、損害発生時に救済が難しくなる可能性があります。",
        questions:["免責の範囲は合理的か？","故意/重過失は除外されているか？"],
        suggestion:"免責範囲を限定し、故意・重過失の除外を明記。"
      },
      { id:"jp_payment", title:"支払条件が不明確", severity:"MED",
        re: /(別途協議|検収後|支払サイト|月末締め|翌月|支払期日)/g,
        why:"支払条件が曖昧だと、入金遅延や認識違いが起きやすい可能性があります。",
        questions:["支払期日は明確か？","検収条件・期限はあるか？"],
        suggestion:"検収期限・支払期日・遅延時対応を明文化。"
      },
      { id:"jp_accept", title:"検収・瑕疵の拘束が強い/長い", severity:"MED",
        re: /(検収|瑕疵|不具合|修補|再納品)/g,
        why:"検収や瑕疵対応が無制限だと、工数が膨らむ可能性があります。",
        questions:["検収期限はあるか？","無償対応の範囲は？"],
        suggestion:"検収期限・瑕疵対応期間・対応範囲を設定。"
      },
      { id:"jp_ip", title:"成果物の権利帰属が一方的", severity:"MED",
        re: /(一切の権利は.+に帰属|著作権.*譲渡|成果物.*帰属)/g,
        why:"IPの扱いが一方的だと、再利用や実績公開に制約が出る可能性があります。",
        questions:["既存ノウハウ/汎用部品は除外されているか？","実績公開は可能か？"],
        suggestion:"既存資産の留保・利用許諾・実績公開の扱いを追記。"
      },
      { id:"jp_conf", title:"秘密保持が過大/永久", severity:"LOW",
        re: /(永久|無期限).{0,20}(秘密保持|機密)/g,
        why:"過度に長い秘密保持は運用負担になる可能性があります。",
        questions:["期間は合理的か？","例外（公知・独自開発等）はあるか？"],
        suggestion:"合理的な期間設定と例外条項を検討。"
      }
    ];
    const out = [];
    for(const r of rules){
      const m = r.re.exec(text);
      if(m){
        out.push(makeFinding({
          id:r.id, title:r.title, severity:r.severity,
          idx:m.index, len:m[0].length, why:r.why,
          questions:r.questions, suggestion:r.suggestion
        }, text));
      }
      r.re.lastIndex = 0;
    }

    // INFO checks (missing)
    const info = [];
    if(!/(準拠法|合意管轄|管轄裁判所)/.test(text)){
      info.push({id:"jp_juris", title:"準拠法/合意管轄の記載が見当たらない", severity:"INFO",
        snippet:"—", why:"トラブル時の手続きが不明確になり得ます。", questions:["準拠法は？","専属的合意管轄は？"],
        suggestion:"準拠法・管轄裁判所を明記。"
      });
    }
    return out.concat(info);
  }

  function rulesEN(text){
    const rules = [
      { id:"en_term", title:"One-sided termination / termination for convenience", severity:"HIGH",
        re: /(terminate|termination).{0,60}(for convenience|sole discretion|immediately)/i,
        why:"If termination rights are one-sided, delivery and revenue risk may increase.",
        questions:["Is termination mutual and with notice?","Are cure periods defined?"],
        suggestion:"Consider mutual termination rights, notice periods, and cure periods."
      },
      { id:"en_liab", title:"Unlimited liability / uncapped indemnity", severity:"HIGH",
        re: /(unlimited liability|no cap|uncapped|without limit)/i,
        why:"Uncapped liability can create disproportionate downside risk.",
        questions:["Is there a liability cap?","Are indirect/consequential damages excluded?"],
        suggestion:"Consider liability caps and exclusions for indirect damages."
      },
      { id:"en_indem", title:"Broad indemnity (indemnify and hold harmless)", severity:"MED",
        re: /(indemnif(y|ies)|hold harmless)/i,
        why:"Broad indemnities may shift unexpected risk to one party.",
        questions:["Is scope limited?","Are third-party claims defined?"],
        suggestion:"Clarify scope, triggers, and limit to third-party claims where appropriate."
      },
      { id:"en_pay", title:"Vague payment terms", severity:"MED",
        re: /(as agreed|reasonable|promptly|within a reasonable time)/i,
        why:"Vague payment terms can cause disputes and delays.",
        questions:["Is payment due date defined?","Are invoicing/acceptance terms clear?"],
        suggestion:"Define due dates, invoicing cadence, and acceptance criteria."
      },
      { id:"en_ip", title:"Overly broad IP assignment", severity:"MED",
        re: /(assign(s|ment)?).{0,80}(all intellectual property|all IP)/i,
        why:"Overbroad IP assignment may unintentionally include pre-existing materials.",
        questions:["Are background IP and tools excluded?","Is there a licence-back?"],
        suggestion:"Carve out background IP; consider licence-back terms."
      },
      { id:"en_nc", title:"Overly broad non-compete / long duration", severity:"LOW",
        re: /(non-?compete|restraint of trade|not compete)/i,
        why:"Broad non-competes can be difficult to comply with and may be unenforceable in some contexts.",
        questions:["Is scope/time/territory limited?","Is it necessary?"],
        suggestion:"Limit scope, duration, and territory; consider alternatives (non-solicit, confidentiality)."
      },
      { id:"en_conf", title:"Perpetual confidentiality without exceptions", severity:"LOW",
        re: /(confidential).{0,80}(perpetual|forever|in perpetuity)/i,
        why:"Perpetual confidentiality may be operationally heavy without clear exceptions.",
        questions:["Are exceptions included (public domain, independently developed)?","Is duration reasonable?"],
        suggestion:"Add standard exceptions and a reasonable term."
      }
    ];

    const out = [];
    for(const r of rules){
      const m = text.match(r.re);
      if(m){
        const idx = text.toLowerCase().indexOf(m[0].toLowerCase());
        out.push(makeFinding({
          id:r.id, title:r.title, severity:r.severity,
          idx: Math.max(0, idx), len: m[0].length,
          why:r.why, questions:r.questions, suggestion:r.suggestion
        }, text));
      }
    }

    if(!/(governing law|jurisdiction|courts of)/i.test(text)){
      out.push({id:"en_juris", title:"Governing law / jurisdiction not found", severity:"INFO",
        snippet:"—", why:"Dispute handling may be unclear.", questions:["What is the governing law?","Which courts have jurisdiction?"],
        suggestion:"Add governing law and jurisdiction clauses."
      });
    }
    return out;
  }

  function score(findings, text){
    const highs = findings.filter(f=>f.severity==="HIGH").length;
    const meds  = findings.filter(f=>f.severity==="MED").length;
    const lows  = findings.filter(f=>f.severity==="LOW").length;
    const infos = findings.filter(f=>f.severity==="INFO").length;

    let level = "UNKNOWN";
    if(!text || text.trim().length < 10) level = "UNKNOWN";
    else if(text.trim().length < 400 && (highs+meds+lows+infos) < 2) level = "UNKNOWN";
    else if(highs >= 2 || (highs>=1 && meds>=2)) level = "HIGH";
    else if(meds >= 2 || highs === 1) level = "MEDIUM";
    else if((lows+infos) > 0 && highs===0 && meds===0) level = "LOW";
    else level = "UNKNOWN";

    const why = [];
    for(const f of findings.slice(0,6)){
      why.push("• " + f.title);
    }
    return { level, why: why.length? why.join("\n") : "—" };
  }

  function badge(level){
    els.riskBadge.className = "nw-badge";
    if(level==="HIGH"){ els.riskBadge.classList.add("nw-badge--high"); els.riskBadge.textContent="HIGH"; }
    else if(level==="MEDIUM"){ els.riskBadge.classList.add("nw-badge--med"); els.riskBadge.textContent="MEDIUM"; }
    else if(level==="LOW"){ els.riskBadge.classList.add("nw-badge--low"); els.riskBadge.textContent="LOW"; }
    else { els.riskBadge.classList.add("nw-badge--unk"); els.riskBadge.textContent="UNKNOWN"; }
  }

  function renderFindings(list){
    els.findings.innerHTML = "";
    if(!list.length){
      els.findings.innerHTML = '<div class="nw-muted">No findings yet. Paste text and click Analyze.</div>';
      return;
    }
    for(const f of list){
      const div = document.createElement("div");
      div.className = "finding";
      div.innerHTML = `
        <div class="finding__top">
          <div class="finding__title">${escapeHtml(f.title)}</div>
          <div class="finding__sev sev-${escapeHtml(f.severity)}">${escapeHtml(f.severity)}</div>
        </div>
        <div class="nw-muted" style="margin-top:6px;">Matched</div>
        <div class="nw-pre">${escapeHtml(f.snippet || "—")}</div>
        <div class="nw-muted" style="margin-top:6px;">Why</div>
        <div>${escapeHtml(f.why || "—")}</div>
        <div class="nw-muted" style="margin-top:6px;">What to ask</div>
        <ul>${(f.questions||[]).map(q=>`<li>${escapeHtml(q)}</li>`).join("")}</ul>
        <div class="nw-muted" style="margin-top:6px;">Suggested clause / rewrite</div>
        <div>${escapeHtml(f.suggestion || "—")}</div>
      `;
      els.findings.appendChild(div);
    }
  }

  function toMarkdown(meta, findings, scored){
    const lines = [];
    lines.push(`# Contract Risk Highlight (Lite)`);
    lines.push(`- Timestamp: ${new Date().toLocaleString()}`);
    lines.push(`- Mode: ${MODE}`);
    lines.push(`- Type: ${meta.type}`);
    lines.push(`- Risk: ${scored.level}`);
    lines.push(``);
    lines.push(`## Why this level`);
    lines.push(scored.why === "—" ? `- —` : scored.why.split("\n").map(x=>x.replace(/^•\s?/,"- ")).join("\n"));
    lines.push(``);
    lines.push(`## Findings`);
    if(!findings.length){
      lines.push(`- (none)`);
    }else{
      for(const f of findings){
        lines.push(`### [${f.severity}] ${f.title}`);
        lines.push(`- Snippet: ${f.snippet || "—"}`);
        lines.push(`- Why: ${f.why || "—"}`);
        lines.push(`- What to ask:`);
        (f.questions||[]).forEach(q=>lines.push(`  - ${q}`));
        lines.push(`- Suggestion: ${f.suggestion || "—"}`);
        lines.push(``);
      }
    }
    lines.push(`## Disclaimer`);
    lines.push(`This is not legal advice. It provides general patterns only.`);
    return lines.join("\n");
  }

  function escapeHtml(s){
    return String(s||"").replace(/[&<>"']/g, (c)=>({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
  }

  function clearOutputs(){
    badge("UNKNOWN");
    els.riskWhy.textContent = "—";
    els.findings.innerHTML = '<div class="nw-muted">No findings yet.</div>';
    els.mdPreview.value = "";
  }

  function analyze(){
    const text = (els.text.value||"").trim();
    gtagSafe("tool_run", { tool_slug: TOOL, lang: MODE });
    if(!text){
      clearOutputs();
      toast(MODE==="JP" ? "テキストを貼り付けてください" : "Paste some text first");
      return;
    }

    const findings = (MODE==="JP") ? rulesJP(text) : rulesEN(text);
    const sc = score(findings, text);
    badge(sc.level);
    els.riskWhy.textContent = sc.why;
    renderFindings(findings);

    const md = toMarkdown({type: els.contractType.value}, findings, sc);
    els.mdPreview.value = md;
  }

  function download(filename, content, mime){
    const blob = new Blob([content], {type: mime || "text/plain"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(()=>{ URL.revokeObjectURL(a.href); a.remove(); }, 0);
  }

  // ---- FAQ ----
  async function loadFAQ(){
    try{
      const res = await fetch("./qa.json", {cache:"no-store"});
      if(!res.ok) throw new Error("bad status");
      const items = await res.json();
      els.faq.innerHTML = "";
      const show = items.filter(x=> (MODE==="JP" ? x.lang==="ja" : x.lang==="en")).slice(0,6);
      for(const it of show){
        const d = document.createElement("details");
        d.innerHTML = `<summary>${escapeHtml(it.q)}</summary><p>${escapeHtml(it.a)}</p>`;
        els.faq.appendChild(d);
      }
      els.faqFallback.style.display = show.length ? "none" : "block";
    }catch(_){
      els.faqFallback.style.display = "block";
    }
  }

  // ---- Examples ----
  const EX_JP = `【業務委託契約（抜粋例）】
甲は、乙が本契約に違反した場合、何らの催告を要せず直ちに本契約を解除できる。
乙は、甲に生じた一切の損害を賠償するものとし、違約金として金100万円を支払う。
成果物に関する一切の権利は甲に帰属する。秘密保持義務は永久とする。`;

  const EX_EN = `Services Agreement (excerpt)
Either party may terminate for convenience at its sole discretion immediately.
Supplier shall have unlimited liability and shall indemnify and hold harmless Customer for all claims.
Supplier assigns all intellectual property to Customer. Confidentiality obligations are perpetual.`;

  // ---- Wire ----
  els.modeJP.addEventListener("click", ()=>{ setMode("JP"); loadFAQ(); });
  els.modeEN.addEventListener("click", ()=>{ setMode("EN"); loadFAQ(); });

  els.analyze.addEventListener("click", ()=>{ analyze(); loadFAQ(); });
  els.clear.addEventListener("click", ()=>{ els.text.value=""; clearOutputs(); });
  els.pasteExample.addEventListener("click", ()=>{
    els.text.value = (MODE==="JP") ? EX_JP : EX_EN;
    toast("Example pasted");
  });

  els.payBtn.addEventListener("click", ()=>{
    gtagSafe("pro_unlock_click", { tool_slug: TOOL });
    toast("Replace payment link later: REPLACE_STRIPE_PAYMENT_LINK_contract-risk-highlighter");
  });

  els.manualPro.addEventListener("click", ()=>{
    gtagSafe("pro_manual_enable", { tool_slug: TOOL });
    setPro(true);
    toast("Pro enabled (manual) on this browser");
  });

  els.downloadMd.addEventListener("click", ()=>{
    if(!isPro()){ toast("Unlock Pro to download"); return; }
    gtagSafe("export_click", { tool_slug: TOOL, kind:"md" });
    download("contract-risk-highlighter.md", els.mdPreview.value, "text/markdown");
  });

  els.downloadPdf.addEventListener("click", ()=>{
    if(!isPro()){ toast("Unlock Pro to export"); return; }
    gtagSafe("export_click", { tool_slug: TOOL, kind:"pdf" });
    toast("PDF export is coming soon. Use Markdown for now.");
  });

  els.copyFindings.addEventListener("click", async ()=>{
    try{
      await navigator.clipboard.writeText(els.mdPreview.value || "");
      toast("Copied");
    }catch(_){
      toast("Copy failed");
    }
  });

  // init
  updateProUI();
  setMode("JP");
  clearOutputs();
  loadFAQ();
})();
