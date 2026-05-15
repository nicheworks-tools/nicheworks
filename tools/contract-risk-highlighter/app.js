(function(){
  const TOOL = "contract-risk-highlighter";
  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const MAX_FREE_FINDINGS = 3;

  const els = {
    modeJP: $("modeJP"), modeEN: $("modeEN"), mainTitle: $("mainTitle"), subhead: $("subhead"),
    noticeTitle: $("noticeTitle"), noticeBody1: $("noticeBody1"), noticeBody2: $("noticeBody2"), noticeBody3: $("noticeBody3"),
    lblText: $("lblText"), lblType: $("lblType"), lblPdf: $("lblPdf"), pdfNote: $("pdfNote"), hintText: $("hintText"),
    contractType: $("contractType"), text: $("contractText"), analyze: $("analyzeBtn"), clear: $("clearBtn"), pasteExample: $("pasteExampleBtn"),
    resultTitle: $("resultTitle"), riskBadge: $("riskBadge"), riskWhy: $("riskWhy"), disclaimerTitle: $("disclaimerTitle"), disclaimer: $("disclaimer"),
    findingsTitle: $("findingsTitle"), findings: $("findings"), showAll: $("showAllBtn"), copyFindings: $("copyFindingsBtn"), exportTitle: $("exportTitle"),
    mdLabel: $("mdLabel"), mdPreview: $("mdPreview"), downloadMd: $("downloadMdBtn"), downloadPdf: $("downloadPdfBtn"),
    faqTitle: $("faqTitle"), faq: $("faq"), relatedTitle: $("relatedTitle"), toast: $("toast"),
    proPreview: $("proPreview"), fullReview: $("fullReview"), consultMemo: $("consultMemo"), counterpartyQuestions: $("counterpartyQuestions"),
    missingChecklist: $("missingChecklist"), nextAction: $("nextAction"), copyFull: $("copyFullBtn"), copyConsult: $("copyConsultBtn"),
    copyQuestions: $("copyQuestionsBtn"), copyMissing: $("copyMissingBtn")
  };

  let MODE = "JP";
  let last = { findings: [], score: null, type: "" };
  let forceAll = false;

  const I18N = {
    JP: {
      title: "契約書リスク簡易チェック",
      subhead: "契約書の“注意点になり得るパターン”を抽出して整理します。法的助言ではありません。",
      noticeTitle: "重要な注意",
      noticeBody1: "このツールは契約書内の注意パターンを機械的に拾う簡易チェックです。法的助言、契約可否の判断、条文修正の正しさを保証するものではありません。",
      noticeBody2: "重要な契約は、弁護士・専門家・社内法務に確認してください。機密契約書や個人情報は貼り付けないでください。",
      noticeBody3: "本文テキストは送信しません。ただしページ表示のために広告・解析タグは読み込まれます。",
      lblText: "契約書テキスト（貼り付け）", placeholder: "ここに契約書本文を貼り付けてください。機密情報や個人情報は貼り付けないでください。",
      lblType: "契約タイプ", lblPdf: "PDF抽出：準備中", pdfNote: "現在は契約書テキストの貼り付けのみ対応です。ProのPDFは解析結果をブラウザ印刷画面から保存する機能です。",
      analyze: "Analyze", clear: "Clear", pasteExample: "Paste example", hint: "無料版は主要Findings最大3件とLite Markdownを確認できます。Proは成果物パックを生成します。",
      result: "Result", disclaimerTitle: "Disclaimer", disclaimer: "これは法的助言ではありません。契約可否・法的効果・条文修正の正しさは保証しません。重要な契約は専門家に確認してください。",
      findings: "Findings", showAll: "Show all findings", copy: "Copy markdown", exportTitle: "Export", mdLite: "Lite Markdown preview (Free)", mdFull: "Full Review Markdown (Pro)",
      empty: "契約書テキストを貼り付けて Analyze を押してください。", noFindings: "検出結果はありません。ただし安全を保証するものではありません。", moreLocked: "Proで全Findingsを表示できます。",
      pasteFirst: "テキストを貼り付けてください", copied: "Copied", copyFailed: "コピーに失敗しました。プレビュー欄を手動でコピーしてください。", noMarkdown: "先にAnalyzeしてください",
      locked: "Pro Previewを表示しました。Download .md / Print / Save PDF はNicheWorks Proで解放されます。", printed: "ブラウザの印刷画面でPDF保存を選択できます。",
      faqTitle: "FAQ", relatedTitle: "Related tools",
      typeOptions: [["services_jp","業務委託"],["nda_jp","NDA"],["sales_jp","売買"]],
      scoreGuide: {
        HIGH: "HIGH：強い解除、無制限責任、権利譲渡、重大な片務性が複数あります。",
        MEDIUM: "MEDIUM：支払、検収、責任範囲など確認が必要な条項があります。",
        LOW: "LOW：軽微な確認事項または一般的な注意が中心です。",
        UNKNOWN: "UNKNOWN：本文が短すぎる、または判定材料が不足しています。"
      },
      faq: [
        ["法的助言ですか？", "いいえ。注意パターンを機械的に拾う簡易チェックです。契約可否や条文修正の正しさは保証しません。"],
        ["契約書テキストは送信されますか？", "本文解析はブラウザ内で行います。ただしページ表示のために広告・解析タグは読み込まれます。"],
        ["機密契約書を貼ってよいですか？", "推奨しません。機密情報や個人情報は貼り付けないでください。"],
        ["NicheWorks Pro購入後はどうなりますか？", "購入後、このブラウザではNicheWorks Proが有効になります。タブやブラウザを閉じても通常は維持されます。ただし、別端末・別ブラウザ・シークレットモード・サイトデータ削除後は再度有効化が必要です。"],
        ["PDFに対応していますか？", "PDF本文の直接抽出は準備中です。ProのPrint / Save PDFは、解析結果をブラウザ印刷画面からPDF保存する機能です。"]
      ]
    },
    EN: {
      title: "Contract Risk Highlighter",
      subhead: "Highlight potentially risky clause patterns. This is not legal advice.",
      noticeTitle: "Important notice",
      noticeBody1: "This tool mechanically highlights clause patterns that may need review. It is not legal advice and does not guarantee whether you should sign, reject, or revise a contract.",
      noticeBody2: "For important agreements, consult a lawyer, specialist, or legal team. Do not paste confidential contracts or personal data.",
      noticeBody3: "The contract text is not sent to a server. However, ad and analytics tags are loaded for the page itself.",
      lblText: "Contract text (paste)", placeholder: "Paste contract text here. Do not paste confidential information or personal data.",
      lblType: "Contract type", lblPdf: "PDF extraction: coming soon", pdfNote: "Currently this tool supports pasted text only. Pro PDF output means saving the analysis result through the browser print dialog.",
      analyze: "Analyze", clear: "Clear", pasteExample: "Paste example", hint: "Free mode shows up to 3 key findings and Lite Markdown. Pro generates the full deliverable pack.",
      result: "Result", disclaimerTitle: "Disclaimer", disclaimer: "This is not legal advice. It does not guarantee legal effect, contract acceptance, or clause correctness. Consult a professional for important agreements.",
      findings: "Findings", showAll: "Show all findings", copy: "Copy markdown", exportTitle: "Export", mdLite: "Lite Markdown preview (Free)", mdFull: "Full Review Markdown (Pro)",
      empty: "Paste contract text and click Analyze.", noFindings: "No findings. This does not mean the contract is safe.", moreLocked: "Pro shows all findings.",
      pasteFirst: "Paste text first", copied: "Copied", copyFailed: "Copy failed. Please copy the preview manually.", noMarkdown: "Analyze first",
      locked: "Pro Preview is shown. Download .md / Print / Save PDF are unlocked with NicheWorks Pro.", printed: "Choose Save as PDF in the browser print dialog.",
      faqTitle: "FAQ", relatedTitle: "Related tools",
      typeOptions: [["services_en","Services agreement"],["nda_en","NDA"],["sales_en","Sales agreement"]],
      scoreGuide: {
        HIGH: "HIGH: Multiple severe patterns such as immediate termination, unlimited liability, IP transfer, or one-sided terms.",
        MEDIUM: "MEDIUM: Payment, acceptance, liability scope, or similar terms need review.",
        LOW: "LOW: Mostly light review points or general cautions.",
        UNKNOWN: "UNKNOWN: The text is too short or lacks enough signals."
      },
      faq: [
        ["Is this legal advice?", "No. It is a simple pattern checker and does not guarantee legal effect, contract acceptance, or clause correctness."],
        ["Is the contract text sent to a server?", "No. Text analysis runs in your browser, but ad and analytics tags are loaded for the page."],
        ["Can I paste confidential contracts?", "Not recommended. Do not paste confidential contracts, personal data, or non-public information."],
        ["What happens after purchasing NicheWorks Pro?", "After purchase, NicheWorks Pro becomes active in this browser. It usually remains active after closing tabs or the browser. Re-activation may be required on another device, another browser, incognito mode, or after deleting site data."],
        ["Does it support PDF?", "Direct PDF text extraction is coming soon. Pro Print / Save PDF means saving the analysis result through your browser print dialog."]
      ]
    }
  };

  const RULES = [
    { id:"termination", severity:"HIGH", category:"Termination", jp:/解除|無催告|直ちに終了|一方的に終了|中途解約できない/g, en:/terminate|termination|immediate termination|without notice|may not terminate/gi,
      titleJP:"解除・中途解約の片務性", titleEN:"Termination / no-convenience exit", whyJP:"無催告解除や中途解約不可は、片方に大きい不利益が出る可能性があります。", whyEN:"Immediate termination or no-convenience exit can create one-sided operational risk.", askJP:["解除前の催告期間はあるか", "中途解約の条件と費用は妥当か"], askEN:["Is there a cure period before termination?", "Are convenience termination conditions and fees reasonable?"], suggestionJP:"解除事由、催告期間、精算方法を確認してください。", suggestionEN:"Review termination triggers, cure period, and settlement terms." },
    { id:"liability", severity:"HIGH", category:"Liability", jp:/一切の損害|全ての損害|無制限|間接損害|逸失利益|補償|賠償/g, en:/unlimited liability|all damages|consequential damages|lost profits|indemnif|hold harmless|liabil/gi,
      titleJP:"損害賠償・補償範囲", titleEN:"Liability / indemnity scope", whyJP:"賠償範囲や上限が広すぎると、想定外の負担になる可能性があります。", whyEN:"Broad liability or indemnity can create exposure beyond the project value.", askJP:["賠償上限はあるか", "間接損害・逸失利益は除外されるか"], askEN:["Is there a liability cap?", "Are consequential damages and lost profits excluded?"], suggestionJP:"賠償上限、除外損害、補償対象を確認してください。", suggestionEN:"Check caps, excluded damages, and indemnity triggers." },
    { id:"payment", severity:"MED", category:"Payment", jp:/支払|報酬|検収|みなし承認|遅延損害金|返金不可/g, en:/payment|fee|acceptance|deemed accepted|late payment|non-refundable/gi,
      titleJP:"支払・検収条件", titleEN:"Payment / acceptance terms", whyJP:"支払時期や検収基準が曖昧だと、未払い・納品トラブルにつながります。", whyEN:"Ambiguous payment or acceptance terms can cause collection and delivery disputes.", askJP:["検収期限と不合格理由は明確か", "支払期限と遅延時の扱いは妥当か"], askEN:["Are acceptance deadlines and rejection reasons clear?", "Are payment timing and late payment rules reasonable?"], suggestionJP:"検収基準、期限、支払条件を書面で確認してください。", suggestionEN:"Confirm acceptance criteria, deadlines, and payment mechanics." },
    { id:"ip", severity:"HIGH", category:"IP / Deliverables", jp:/権利.*帰属|著作権|知的財産|著作者人格権|譲渡|成果物/g, en:/intellectual property|copyright|assign|assignment|moral rights|deliverables|work product/gi,
      titleJP:"成果物・知的財産権", titleEN:"Deliverables / IP ownership", whyJP:"成果物やノウハウの帰属が広すぎると、再利用や実績利用に影響します。", whyEN:"Broad IP assignment can affect reuse, portfolio use, and background know-how.", askJP:["既存素材やノウハウは除外されるか", "著作者人格権不行使の範囲は妥当か"], askEN:["Are pre-existing materials and know-how excluded?", "Is the moral rights waiver scope reasonable?"], suggestionJP:"成果物、既存素材、二次利用、実績公開の扱いを分けて確認してください。", suggestionEN:"Separate deliverables, pre-existing materials, reuse, and portfolio rights." },
    { id:"confidentiality", severity:"MED", category:"Confidentiality", jp:/秘密保持|機密|永久|競業避止|専属|独占/g, en:/confidential|confidentiality|perpetual|non-compete|exclusive|exclusivity/gi,
      titleJP:"秘密保持・競業避止", titleEN:"Confidentiality / exclusivity", whyJP:"期間が無期限、対象が広すぎる、競業避止が強い場合は実務制約が大きくなります。", whyEN:"Perpetual or broad confidentiality, non-compete, or exclusivity terms can restrict future work.", askJP:["秘密保持期間は合理的か", "競業避止・専属の範囲は限定されているか"], askEN:["Is the confidentiality term reasonable?", "Is non-compete or exclusivity narrowly scoped?"], suggestionJP:"対象情報、期間、例外、競業制限の範囲を確認してください。", suggestionEN:"Check covered information, term, exceptions, and restriction scope." },
    { id:"subcontract", severity:"LOW", category:"Operations", jp:/再委託|下請|第三者|個人情報|委託先/g, en:/subcontract|third party|personal data|processor|vendor/gi,
      titleJP:"再委託・個人情報", titleEN:"Subcontracting / personal data", whyJP:"再委託可否や個人情報の扱いが曖昧だと、実務運用で支障が出ます。", whyEN:"Unclear subcontracting or personal data handling can block operations or compliance.", askJP:["再委託の承諾手続きは明確か", "個人情報の取扱範囲は明確か"], askEN:["Is subcontracting approval clear?", "Is personal data processing scope clear?"], suggestionJP:"承諾方法、責任範囲、個人情報の管理条件を確認してください。", suggestionEN:"Confirm approval flow, responsibility, and data handling safeguards." },
    { id:"missing-law", severity:"INFO", category:"Missing clause", missing:true, jp:/準拠法|管轄|裁判所|反社会的勢力|反社/g, en:/governing law|jurisdiction|venue|anti-social|sanctions/gi,
      titleJP:"準拠法・管轄・反社条項の不足候補", titleEN:"Possible missing governing law / venue / compliance clause", whyJP:"契約全体に紛争解決や反社条項の記載が見当たらない場合、後日の手続き確認が必要です。", whyEN:"If dispute venue or compliance clauses are absent, escalation can become unclear.", askJP:["準拠法・管轄は明記されているか", "反社条項や制裁対応は必要か"], askEN:["Are governing law and jurisdiction stated?", "Are compliance or sanctions clauses needed?"], suggestionJP:"準拠法、管轄、反社条項、制裁対応の必要性を確認してください。", suggestionEN:"Check whether governing law, venue, compliance, or sanctions terms are required." }
  ];

  const EX_JP = `【業務委託契約（抜粋例）】\n甲は、乙が本契約に違反した場合、何らの催告を要せず直ちに本契約を解除できる。\n乙は、甲に生じた一切の損害を賠償するものとし、違約金として金100万円を支払う。\n本契約は自動更新され、中途解約はできない。\n成果物に関する一切の権利は甲に帰属し、乙は著作者人格権を行使しない。\n秘密保持義務は永久とする。`;
  const EX_EN = `Services Agreement (excerpt)\nCustomer may terminate this Agreement immediately at its sole discretion.\nSupplier shall have unlimited liability and shall indemnify and hold harmless Customer for all claims, including consequential damages and lost profits.\nThis Agreement renews automatically and Supplier may not terminate for convenience.\nSupplier assigns all intellectual property in the deliverables to Customer and waives moral rights. Confidentiality obligations are perpetual.`;

  function isPro(){ return root.dataset.proActive === "true"; }
  function gtagSafe(name, params){ try{ if(typeof window.gtag === "function") window.gtag("event", name, params || {}); }catch(_){} }
  function escapeHtml(s){ return String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c])); }
  function toast(msg){ if(!els.toast) return; els.toast.textContent = msg; els.toast.style.display = "block"; clearTimeout(toast.t); toast.t = setTimeout(() => { els.toast.style.display = "none"; }, 2200); }
  function setText(el, text){ if(el) el.textContent = text; }

  function setMode(mode){
    MODE = mode;
    const t = I18N[MODE];
    root.lang = MODE === "JP" ? "ja" : "en";
    setText(els.mainTitle, t.title); setText(els.subhead, t.subhead); setText(els.noticeTitle, t.noticeTitle);
    setText(els.noticeBody1, t.noticeBody1); setText(els.noticeBody2, t.noticeBody2); setText(els.noticeBody3, t.noticeBody3);
    setText(els.lblText, t.lblText); if(els.text) els.text.placeholder = t.placeholder; setText(els.lblType, t.lblType);
    setText(els.lblPdf, t.lblPdf); setText(els.pdfNote, t.pdfNote); setText(els.analyze, t.analyze); setText(els.clear, t.clear); setText(els.pasteExample, t.pasteExample);
    setText(els.hintText, t.hint); setText(els.resultTitle, t.result); setText(els.disclaimerTitle, t.disclaimerTitle); setText(els.disclaimer, t.disclaimer);
    setText(els.findingsTitle, t.findings); setText(els.showAll, t.showAll); setText(els.copyFindings, t.copy); setText(els.exportTitle, t.exportTitle); setText(els.faqTitle, t.faqTitle); setText(els.relatedTitle, t.relatedTitle);
    if(els.contractType){ els.contractType.innerHTML = t.typeOptions.map(([value, label]) => `<option value="${value}">${label}</option>`).join(""); }
    renderFaq(); renderProPreview(); refreshOutputs(); window.NWContractRiskPro?.refresh?.();
  }

  function renderFaq(){ if(!els.faq) return; els.faq.innerHTML = I18N[MODE].faq.map(([q,a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join(""); }

  function renderProPreview(){
    if(!els.proPreview) return;
    els.proPreview.textContent = `# Contract Risk Review Memo\n\n## Important disclaimer\n${MODE === "JP" ? "法的助言ではありません。重要な契約は専門家に確認してください。" : "This is not legal advice. Consult a professional for important agreements."}\n\n## Findings by severity\n- [HIGH] Sample: Liability cap needs review\n\n## Questions to ask the counterparty\n- Please clarify termination notice and cure period.\n\n## Questions to ask lawyer / legal team\n- Is the indemnity scope acceptable for this deal?\n\n## Missing clause checklist\n- Governing law / jurisdiction\n- Personal data handling\n\n## Next action memo\n- Share high-severity points with the reviewer before signing.`;
  }

  function findSnippet(text, re){
    re.lastIndex = 0;
    const m = re.exec(text);
    if(!m) return "";
    const start = Math.max(0, m.index - 45);
    const end = Math.min(text.length, m.index + m[0].length + 45);
    return text.slice(start, end).replace(/\s+/g, " ").trim();
  }

  function analyzeRules(text){
    const lang = MODE === "JP" ? "jp" : "en";
    const findings = [];
    RULES.forEach((rule) => {
      const re = lang === "jp" ? rule.jp : rule.en;
      re.lastIndex = 0;
      const matched = re.test(text);
      if((rule.missing && !matched) || (!rule.missing && matched)){
        findings.push({
          id: rule.id, severity: rule.severity, category: rule.category,
          title: lang === "jp" ? rule.titleJP : rule.titleEN,
          why: lang === "jp" ? rule.whyJP : rule.whyEN,
          questions: lang === "jp" ? rule.askJP : rule.askEN,
          suggestion: lang === "jp" ? rule.suggestionJP : rule.suggestionEN,
          snippet: rule.missing ? (lang === "jp" ? "該当条項が見当たらない可能性があります。" : "No obvious matching clause found.") : findSnippet(text, re)
        });
      }
    });
    return findings;
  }

  function score(findings, text){
    if(text.length < 40) return { level:"UNKNOWN", why:I18N[MODE].scoreGuide.UNKNOWN };
    const high = findings.filter(f => f.severity === "HIGH").length;
    const med = findings.filter(f => f.severity === "MED").length;
    let level = "LOW";
    if(high >= 2 || (high >= 1 && med >= 2)) level = "HIGH";
    else if(high >= 1 || med >= 1) level = "MEDIUM";
    return { level, why:I18N[MODE].scoreGuide[level] + `\n• Findings: ${findings.length} (${high} HIGH / ${med} MED)` };
  }

  function badge(level){
    if(!els.riskBadge) return;
    els.riskBadge.textContent = level;
    els.riskBadge.className = "nw-badge " + (level === "HIGH" ? "nw-badge--high" : level === "MEDIUM" ? "nw-badge--med" : level === "LOW" ? "nw-badge--low" : "nw-badge--unk");
  }

  function renderFindings(){
    if(!els.findings) return;
    const list = (isPro() || forceAll) ? last.findings : last.findings.slice(0, MAX_FREE_FINDINGS);
    els.findings.innerHTML = "";
    if(!last.score){ els.findings.innerHTML = `<div class="nw-muted">${escapeHtml(I18N[MODE].empty)}</div>`; return; }
    if(!list.length){ els.findings.innerHTML = `<div class="nw-muted">${escapeHtml(I18N[MODE].noFindings)}</div>`; return; }
    list.forEach((f) => {
      const div = document.createElement("div");
      div.className = "finding";
      div.innerHTML = `<div class="finding__top"><div class="finding__title">${escapeHtml(f.title)}</div><div class="finding__sev sev-${escapeHtml(f.severity)}">${escapeHtml(f.severity)}</div></div><div class="finding__cat">${escapeHtml(f.category)}</div><div class="nw-muted" style="margin-top:6px;">Matched</div><div class="nw-pre">${escapeHtml(f.snippet || "—")}</div><div class="nw-muted" style="margin-top:6px;">Why</div><div>${escapeHtml(f.why)}</div><div class="nw-muted" style="margin-top:6px;">What to ask</div><ul>${f.questions.map(q => `<li>${escapeHtml(q)}</li>`).join("")}</ul><div class="nw-muted" style="margin-top:6px;">Suggested check / rewrite direction</div><div>${escapeHtml(f.suggestion)}</div>`;
      els.findings.appendChild(div);
    });
    if(!isPro() && last.findings.length > MAX_FREE_FINDINGS){
      const lock = document.createElement("div");
      lock.className = "finding finding--locked";
      lock.textContent = `${I18N[MODE].moreLocked} (${last.findings.length - MAX_FREE_FINDINGS} more)`;
      els.findings.appendChild(lock);
    }
  }

  function typeLabel(){ const opt = els.contractType?.selectedOptions?.[0]; return opt ? opt.textContent : last.type; }
  function disclaimerText(){ return MODE === "JP" ? "この出力は法的助言ではありません。契約可否、法的効果、条文修正の正しさを保証しません。重要な契約は弁護士・専門家・社内法務に確認してください。原文全文は含めず、検出箇所の短い抜粋のみを記録しています。" : "This output is not legal advice. It does not guarantee legal effect, contract acceptance, or clause correctness. Consult a lawyer, specialist, or legal team for important agreements. The full original text is not included; only short snippets are recorded."; }

  function liteMarkdown(){
    if(!last.score) return "";
    const lines = ["# Contract Risk Highlight (Lite)", `- Timestamp: ${new Date().toLocaleString()}`, `- Mode: ${MODE}`, `- Type: ${typeLabel()}`, `- Risk: ${last.score.level}`, "", "## Important disclaimer", disclaimerText(), "", "## Risk basis"];
    last.score.why.split("\n").forEach(line => lines.push(line.replace(/^•\s?/, "- ")));
    lines.push("", "## Key findings (free preview)");
    const list = last.findings.slice(0, MAX_FREE_FINDINGS);
    if(!list.length) lines.push("- (none; this does not mean the contract is safe)");
    list.forEach(f => { lines.push(`### [${f.severity}] ${f.title}`, `- Category: ${f.category}`, `- Snippet: ${f.snippet || "—"}`, `- Why: ${f.why}`, "- What to ask:"); f.questions.forEach(q => lines.push(`  - ${q}`)); lines.push(`- Suggested check / rewrite direction: ${f.suggestion}`, ""); });
    if(last.findings.length > MAX_FREE_FINDINGS) lines.push(`_NicheWorks Pro shows ${last.findings.length - MAX_FREE_FINDINGS} more findings and the Full Review Pack._`);
    return lines.join("\n");
  }

  function memoParts(){
    const high = last.findings.filter(f => f.severity === "HIGH");
    const questions = last.findings.flatMap(f => f.questions.map(q => `- [${f.category}] ${q}`));
    const missing = last.findings.filter(f => f.id === "missing-law" || f.category === "Missing clause");
    return {
      consult: [`Risk: ${last.score?.level || "UNKNOWN"}`, "Priority findings:", ...(high.length ? high.map(f => `- ${f.title}: ${f.why}`) : ["- No HIGH findings detected; this does not mean safe."]), "Questions for legal team:", ...questions.slice(0, 8)].join("\n"),
      counterparty: questions.length ? questions.join("\n") : "- Please confirm no additional risk allocation terms are intended.",
      missing: [`- Governing law / jurisdiction: ${missing.length ? "review needed" : "check if present and adequate"}`, "- Liability cap and excluded damages", "- Confidentiality exceptions and term", "- Personal data / subcontracting safeguards", "- Termination cure period and settlement"].join("\n"),
      next: [`1. Review HIGH findings first (${high.length}).`, "2. Confirm payment, acceptance, liability, and IP terms with the owner.", "3. Share counterparty questions before signing.", "4. Ask lawyer / legal team for important or high-value contracts."].join("\n")
    };
  }

  function fullMarkdown(){
    if(!last.score) return "";
    const parts = memoParts();
    const lines = ["# Contract Risk Review Memo", "", "## Important disclaimer", disclaimerText(), "", "## Contract type", typeLabel(), "", "## Overall risk", last.score.level, "", "## Risk basis", last.score.why, "", "## Findings by severity"];
    if(!last.findings.length) lines.push("- (none; this does not mean the contract is safe)");
    last.findings.forEach(f => { lines.push(`### [${f.severity}] ${f.title}`, `- Category: ${f.category}`, `- Snippet: ${f.snippet || "—"}`, `- Why: ${f.why}`, `- Suggested check / rewrite direction: ${f.suggestion}`, ""); });
    lines.push("## Questions to ask the counterparty", parts.counterparty, "", "## Questions to ask lawyer / legal team", parts.consult, "", "## Missing clause checklist", parts.missing, "", "## Suggested review checklist", "- Confirm scope, deliverables, fees, acceptance, change requests, liability, IP, confidentiality, termination, governing law, and dispute venue.", "", "## Next action memo", parts.next);
    return lines.join("\n");
  }

  function refreshOutputs(){
    if(els.mdLabel) els.mdLabel.textContent = isPro() ? I18N[MODE].mdFull : I18N[MODE].mdLite;
    renderFindings();
    const md = isPro() ? fullMarkdown() : liteMarkdown();
    if(els.mdPreview) els.mdPreview.value = md;
    const parts = last.score ? memoParts() : { consult:"", counterparty:"", missing:"", next:"" };
    if(els.fullReview) els.fullReview.value = isPro() ? fullMarkdown() : "";
    setText(els.consultMemo, parts.consult); setText(els.counterpartyQuestions, parts.counterparty); setText(els.missingChecklist, parts.missing); setText(els.nextAction, parts.next);
  }

  function clearOutputs(){ last = { findings: [], score: null, type: "" }; forceAll = false; badge("UNKNOWN"); setText(els.riskWhy, "—"); refreshOutputs(); }
  function analyze(){
    const text = (els.text?.value || "").trim();
    gtagSafe("tool_run", { tool_slug: TOOL, lang: MODE });
    if(!text){ clearOutputs(); toast(I18N[MODE].pasteFirst); return; }
    const findings = analyzeRules(text);
    const sc = score(findings, text);
    last = { findings, score: sc, type: els.contractType?.value || "" };
    forceAll = false; badge(sc.level); setText(els.riskWhy, sc.why); refreshOutputs();
  }

  function fallbackCopy(text){ const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); let ok = false; try{ ok = document.execCommand("copy"); }catch(_){ ok = false; } ta.remove(); return ok; }
  async function copyText(text){ if(!text.trim()){ toast(I18N[MODE].noMarkdown); return; } try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); toast(I18N[MODE].copied); return; } }catch(_){} toast(fallbackCopy(text) ? I18N[MODE].copied : I18N[MODE].copyFailed); }
  function lockPreview(){ renderProPreview(); document.querySelector("[data-pro-preview]")?.scrollIntoView({ behavior:"smooth", block:"center" }); toast(I18N[MODE].locked); }
  function download(name, text){ const blob = new Blob([text], { type:"text/markdown;charset=utf-8" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 800); }

  function wire(){
    els.modeJP?.addEventListener("click", () => setMode("JP"));
    els.modeEN?.addEventListener("click", () => setMode("EN"));
    els.analyze?.addEventListener("click", analyze);
    els.clear?.addEventListener("click", () => { if(els.text) els.text.value = ""; clearOutputs(); });
    els.pasteExample?.addEventListener("click", () => { if(els.text) els.text.value = MODE === "JP" ? EX_JP : EX_EN; toast("Example pasted"); });
    els.showAll?.addEventListener("click", () => { forceAll = true; renderFindings(); });
    els.copyFindings?.addEventListener("click", () => copyText(isPro() ? fullMarkdown() : liteMarkdown()));
    els.downloadMd?.addEventListener("click", () => { if(!last.score) return toast(I18N[MODE].noMarkdown); if(!isPro()) return lockPreview(); download("contract-risk-review.md", fullMarkdown()); });
    els.downloadPdf?.addEventListener("click", () => { if(!last.score) return toast(I18N[MODE].noMarkdown); if(!isPro()) return lockPreview(); toast(I18N[MODE].printed); window.print(); });
    els.copyFull?.addEventListener("click", () => copyText(fullMarkdown()));
    els.copyConsult?.addEventListener("click", () => copyText(memoParts().consult));
    els.copyQuestions?.addEventListener("click", () => copyText(memoParts().counterparty));
    els.copyMissing?.addEventListener("click", () => copyText(memoParts().missing));
    window.addEventListener("nw-pro-status-change", refreshOutputs);
  }

  wire();
  setMode((navigator.language || "").toLowerCase().startsWith("ja") ? "JP" : "EN");
  clearOutputs();
})();
