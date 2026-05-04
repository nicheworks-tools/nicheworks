(function(){
  const TOOL = "contract-risk-highlighter";
  const $ = (id) => document.getElementById(id);

  const els = {
    modeJP: $("modeJP"), modeEN: $("modeEN"), mainTitle: $("mainTitle"), subhead: $("subhead"),
    noticeTitle: $("noticeTitle"), noticeBody1: $("noticeBody1"), noticeBody2: $("noticeBody2"), noticeBody3: $("noticeBody3"),
    lblText: $("lblText"), lblType: $("lblType"), lblPdf: $("lblPdf"), pdfNote: $("pdfNote"), hintText: $("hintText"),
    contractType: $("contractType"), text: $("contractText"), analyze: $("analyzeBtn"), clear: $("clearBtn"), pasteExample: $("pasteExampleBtn"),
    resultTitle: $("resultTitle"), riskBadge: $("riskBadge"), riskWhy: $("riskWhy"), disclaimerTitle: $("disclaimerTitle"), disclaimer: $("disclaimer"),
    findingsTitle: $("findingsTitle"), findings: $("findings"), copyFindings: $("copyFindingsBtn"), exportTitle: $("exportTitle"), proState: $("proState"),
    mdLabel: $("mdLabel"), mdPreview: $("mdPreview"), downloadMd: $("downloadMdBtn"), downloadPdf: $("downloadPdfBtn"),
    faqTitle: $("faqTitle"), faq: $("faq"), relatedTitle: $("relatedTitle"), toast: $("toast")
  };

  let MODE = "JP";
  let lastScore = null;

  const I18N = {
    JP: {
      title: "契約書リスク簡易チェック",
      subhead: "契約書の“注意点になり得るパターン”を抽出して整理します。法的助言ではありません。",
      noticeTitle: "重要な注意",
      noticeBody1: "このツールは契約書内の注意パターンを機械的に拾う簡易チェックです。法的助言、契約可否の判断、条文修正の正しさを保証するものではありません。",
      noticeBody2: "重要な契約は、弁護士・専門家・社内法務に確認してください。機密契約書や個人情報は貼り付けないでください。",
      noticeBody3: "本文テキストは送信しません。ただしページ表示のために広告・解析タグは読み込まれます。",
      lblText: "契約書テキスト（貼り付け）", placeholder: "ここに契約書本文を貼り付けてください。機密情報や個人情報は貼り付けないでください。",
      lblType: "契約タイプ", lblPdf: "PDF抽出：準備中", pdfNote: "現在は契約書テキストの貼り付けのみ対応です。",
      analyze: "Analyze", clear: "Clear", pasteExample: "Paste example", hint: "検出結果は専門家へ相談するための下書きとして使ってください。",
      result: "Result", disclaimerTitle: "Disclaimer", disclaimer: "これは法的助言ではありません。契約可否・法的効果・条文修正の正しさは保証しません。重要な契約は専門家に確認してください。",
      findings: "Findings", copy: "Copy markdown", exportTitle: "Export", exportState: "ダウンロード機能は準備中です。Markdownコピーを使ってください。", mdLabel: "Markdown preview (Free)",
      empty: "契約書テキストを貼り付けて Analyze を押してください。", noFindings: "検出結果はありません。ただし安全を保証するものではありません。",
      pasteFirst: "テキストを貼り付けてください", copied: "Copied", copyFailed: "コピーに失敗しました。プレビュー欄を手動でコピーしてください。", noMarkdown: "先にAnalyzeしてください",
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
        ["検出されなければ安全ですか？", "いいえ。検出漏れがあります。重要な契約は専門家に確認してください。"],
        ["PDFに対応していますか？", "現時点ではテキスト貼り付けのみ対応です。PDF抽出は準備中です。"]
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
      lblType: "Contract type", lblPdf: "PDF extraction: coming soon", pdfNote: "Currently this tool supports pasted text only.",
      analyze: "Analyze", clear: "Clear", pasteExample: "Paste example", hint: "Use the findings as a draft for review or professional consultation.",
      result: "Result", disclaimerTitle: "Disclaimer", disclaimer: "This is not legal advice. It does not guarantee legal effect, contract acceptance, or clause correctness. Consult a professional for important agreements.",
      findings: "Findings", copy: "Copy markdown", exportTitle: "Export", exportState: "Downloads are preparing. Use Markdown copy for now.", mdLabel: "Markdown preview (Free)",
      empty: "Paste contract text and click Analyze.", noFindings: "No findings. This does not mean the contract is safe.", pasteFirst: "Paste some text first",
      copied: "Copied", copyFailed: "Copy failed. Copy the preview manually.", noMarkdown: "Analyze first", faqTitle: "FAQ", relatedTitle: "Related tools",
      typeOptions: [["services_en","Services agreement"],["nda_en","NDA"],["sales_en","Sales agreement"]],
      scoreGuide: {
        HIGH: "HIGH: Strong termination, uncapped liability, IP assignment, or multiple one-sided clauses were found.",
        MEDIUM: "MEDIUM: Payment, acceptance, liability, or review-sensitive clauses were found.",
        LOW: "LOW: Minor or general review points were found.",
        UNKNOWN: "UNKNOWN: The text is too short or there is not enough signal."
      },
      faq: [
        ["Is this legal advice?", "No. It is a simple pattern checker. It does not guarantee whether a contract is acceptable or how clauses should be revised."],
        ["Is the contract text sent to a server?", "No. The text analysis runs in your browser. Ad and analytics tags are still loaded for the page."],
        ["Can I paste confidential contracts?", "Not recommended. Do not paste confidential information or personal data."],
        ["Does no finding mean the contract is safe?", "No. This tool can miss important issues. Consult a professional for important agreements."],
        ["Does it support PDF?", "Not yet. Currently it supports pasted text only."]
      ]
    }
  };

  function gtagSafe(name, params){ try{ if(typeof window.gtag === "function") window.gtag("event", name, params || {}); }catch(_){} }
  function toast(msg){ if(!els.toast) return; els.toast.textContent = msg; els.toast.style.display = "block"; clearTimeout(toast._tm); toast._tm = setTimeout(() => { els.toast.style.display = "none"; }, 1800); }
  function escapeHtml(s){ return String(s || "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }
  function setText(el, text){ if(el) el.textContent = text; }

  function setMode(mode){
    MODE = mode;
    const t = I18N[MODE];
    document.documentElement.lang = MODE === "JP" ? "ja" : "en";
    if(els.modeJP) els.modeJP.disabled = MODE === "JP";
    if(els.modeEN) els.modeEN.disabled = MODE === "EN";
    setText(els.mainTitle, t.title); setText(els.subhead, t.subhead); setText(els.noticeTitle, t.noticeTitle);
    setText(els.noticeBody1, t.noticeBody1); setText(els.noticeBody2, t.noticeBody2); setText(els.noticeBody3, t.noticeBody3);
    setText(els.lblText, t.lblText); setText(els.lblType, t.lblType); setText(els.lblPdf, t.lblPdf); setText(els.pdfNote, t.pdfNote);
    setText(els.analyze, t.analyze); setText(els.clear, t.clear); setText(els.pasteExample, t.pasteExample); setText(els.hintText, t.hint);
    setText(els.resultTitle, t.result); setText(els.disclaimerTitle, t.disclaimerTitle); setText(els.disclaimer, t.disclaimer);
    setText(els.findingsTitle, t.findings); setText(els.copyFindings, t.copy); setText(els.exportTitle, t.exportTitle); setText(els.proState, t.exportState);
    setText(els.mdLabel, t.mdLabel); setText(els.faqTitle, t.faqTitle); setText(els.relatedTitle, t.relatedTitle);
    if(els.text) els.text.placeholder = t.placeholder;
    if(els.contractType) els.contractType.innerHTML = t.typeOptions.map(([value,label]) => `<option value="${value}">${escapeHtml(label)}</option>`).join("");
    renderFAQ(); clearOutputs(); gtagSafe("tool_open", { tool_slug: TOOL, lang: MODE });
  }

  function renderFAQ(){ if(!els.faq) return; const t = I18N[MODE]; els.faq.innerHTML = t.faq.map(([q,a]) => `<details><summary>${escapeHtml(q)}</summary><p>${escapeHtml(a)}</p></details>`).join(""); }
  function windowSnippet(text, idx, mlen){ if(idx < 0) return "—"; const left = Math.max(0, idx - 90); const right = Math.min(text.length, idx + (mlen || 0) + 90); let s = text.slice(left, right).replace(/\s+/g," ").trim(); if(left > 0) s = "…" + s; if(right < text.length) s += "…"; return s.slice(0, 240); }
  function makeFinding(rule, match, text){ return { id: rule.id, title: rule.title, severity: rule.severity, category: rule.category || "General", snippet: windowSnippet(text, match.index, match.text.length), why: rule.why, questions: rule.questions || [], suggestion: rule.suggestion || "" }; }
  function findByRule(text, rule){ const re = new RegExp(rule.re.source, rule.re.flags.includes("g") ? rule.re.flags : rule.re.flags + "g"); const match = re.exec(text); return match ? makeFinding(rule, { index: match.index, text: match[0] }, text) : null; }
  function missingFinding(rule){ return { id: rule.id, title: rule.title, severity: rule.severity, category: rule.category || "Missing clause", snippet: "—", why: rule.why, questions: rule.questions || [], suggestion: rule.suggestion || "" }; }

  function commonRulesJP(){ return [
    { id:"jp_termination_penalty", category:"解除・違約金", title:"一方的/強い解除・違約金", severity:"HIGH", re:/(違約金|即時解除|直ちに解除|無催告|催告を要せず|解除権)/, why:"解除や違約金が一方に偏ると、取引継続や損害負担のリスクが増える可能性があります。", questions:["解除条件は双方対等か？","通知期間や是正期間はあるか？","違約金・賠償額は過大ではないか？"], suggestion:"解除条件、通知期間、是正期間、違約金・賠償上限を明確にしてください。" },
    { id:"jp_exemption", category:"免責", title:"免責の範囲が広い", severity:"HIGH", re:/(一切責任を負わない|いかなる責任も負わない|免責|責任を免れる)/, why:"免責が広すぎると、損害発生時に救済が難しくなる可能性があります。", questions:["故意・重過失は免責から除外されているか？","免責対象は合理的に限定されているか？"], suggestion:"免責範囲を限定し、故意・重過失・法令違反を除外してください。" },
    { id:"jp_uncapped_liability", category:"損害賠償", title:"損害賠償の上限が見当たらない/無制限に見える", severity:"HIGH", re:/(一切の損害|全ての損害|すべての損害|損害を賠償|賠償するものとする)/, why:"賠償範囲や上限がないと、契約金額を超える負担が発生する可能性があります。", questions:["損害賠償の上限はあるか？","間接損害・逸失利益は除外されているか？"], suggestion:"契約金額や一定月数分など、合理的な賠償上限を検討してください。" },
    { id:"jp_consequential", category:"損害範囲", title:"間接損害・逸失利益の扱いに注意", severity:"MED", re:/(間接損害|特別損害|逸失利益|結果損害|営業損失)/, why:"間接損害や逸失利益まで負担対象になると、想定外の損害額になる可能性があります。", questions:["間接損害・逸失利益は除外されているか？","対象損害は直接通常損害に限定されているか？"], suggestion:"負担する損害範囲を直接かつ通常の損害に限定することを検討してください。" },
    { id:"jp_payment", category:"支払", title:"支払条件・遅延条件の確認が必要", severity:"MED", re:/(支払条件|支払期日|支払サイト|月末締め|翌月|検収後|別途協議|遅延損害金|支払遅延)/, why:"支払期日や遅延時の扱いが曖昧だと、入金遅延や認識違いが起きやすくなります。", questions:["支払期日は明確か？","検収と支払の関係は明確か？","遅延損害金は過大ではないか？"], suggestion:"請求日、支払期日、検収期限、遅延時対応を明文化してください。" },
    { id:"jp_auto_renewal", category:"契約期間", title:"自動更新・解約制限", severity:"MED", re:/(自動更新|更新される|同一条件で更新|中途解約不可|解約できない|期間満了.*更新)/, why:"自動更新や中途解約不可は、終了したい契約を止めにくくする可能性があります。", questions:["更新停止の通知期限は明確か？","中途解約や解約予告は可能か？"], suggestion:"更新停止期限、解約予告期間、中途解約条件を明確にしてください。" },
    { id:"jp_unilateral_change", category:"変更権", title:"一方的な変更権", severity:"HIGH", re:/(一方的に変更|任意に変更|予告なく変更|当社が変更|甲が変更できる|単独の裁量)/, why:"一方だけが条件を変更できる条項は、契約内容の安定性を損なう可能性があります。", questions:["変更には事前通知や同意が必要か？","不利益変更時に解約できるか？"], suggestion:"重要条件の変更には事前通知・協議・同意を必要とする形を検討してください。" },
    { id:"jp_ip_assignment", category:"知的財産", title:"成果物・ノウハウの権利帰属が広い", severity:"MED", re:/(一切の権利は.+に帰属|著作権.*譲渡|成果物.*帰属|ノウハウ.*譲渡|知的財産権.*譲渡)/, why:"権利譲渡が広すぎると、既存ノウハウや再利用部品まで失う可能性があります。", questions:["既存ノウハウや汎用部品は除外されているか？","実績公開や再利用は可能か？"], suggestion:"背景知財・既存ノウハウ・汎用部品の留保を明記してください。" },
    { id:"jp_moral_rights", category:"知的財産", title:"著作者人格権不行使", severity:"MED", re:/(著作者人格権.*行使しない|著作者人格権を行使しない|人格権.*不行使)/, why:"著作者人格権不行使は、改変や表示方法への関与を制限する可能性があります。", questions:["不行使の範囲は成果物に限定されているか？","実績公開やクレジット表記は可能か？"], suggestion:"対象範囲、改変可否、実績公開・クレジット表記を確認してください。" },
    { id:"jp_confidentiality", category:"秘密保持", title:"秘密保持が過大/永久", severity:"LOW", re:/(永久|無期限).{0,30}(秘密保持|機密|秘密情報)/, why:"過度に長い秘密保持は運用負担になる可能性があります。", questions:["期間は合理的か？","公知情報・独自開発・第三者取得の例外はあるか？"], suggestion:"合理的な期間と標準的な例外条項を入れてください。" },
    { id:"jp_non_compete", category:"競業・専属", title:"競業避止・専属契約", severity:"HIGH", re:/(競業避止|競業禁止|専属契約|専属的|同種業務を行わない|類似業務を行わない)/, why:"競業避止や専属条項は、今後の営業・業務機会を大きく制限する可能性があります。", questions:["期間・地域・対象業務は限定されているか？","対価や合理的理由はあるか？"], suggestion:"対象範囲、期間、地域、対価の有無を必ず確認してください。" },
    { id:"jp_subcontracting", category:"再委託", title:"再委託の制限または無制限再委託", severity:"MED", re:/(再委託|第三者に委託|外部委託|下請)/, why:"再委託の全面禁止や無制限再委託は、実務・責任分担・情報管理に影響します。", questions:["再委託には事前承諾が必要か？","再委託先の管理責任は明確か？"], suggestion:"再委託の承諾条件、管理義務、責任範囲を明確にしてください。" },
    { id:"jp_personal_data", category:"個人情報", title:"個人情報・委託先管理", severity:"MED", re:/(個人情報|個人データ|委託先管理|安全管理措置|漏えい|第三者提供)/, why:"個人情報を扱う契約では、管理義務・委託先管理・漏えい時対応が重要です。", questions:["個人情報の取扱範囲は明確か？","漏えい時の通知・責任分担はあるか？"], suggestion:"安全管理措置、再委託管理、漏えい時対応、返還・削除を確認してください。" }
  ]; }

  function typeRulesJP(type){
    if(type === "nda_jp") return [
      { id:"jp_nda_purpose", category:"NDA", title:"目的外利用・秘密情報定義", severity:"MED", re:/(目的外利用|本目的以外|秘密情報|機密情報|開示情報)/, why:"NDAでは秘密情報の定義、目的外利用、例外規定が実務上重要です。", questions:["秘密情報の定義は広すぎないか？","公知情報・既知情報・独自開発の例外はあるか？"], suggestion:"秘密情報の範囲、利用目的、例外、返還・破棄を明確にしてください。" },
      { id:"jp_nda_return_destroy", category:"NDA", title:"返還・破棄条項", severity:"LOW", re:/(返還|破棄|消去|削除).{0,40}(秘密情報|機密情報|資料|データ)/, why:"返還・破棄の方法や期限が曖昧だと、終了後の運用で揉める可能性があります。", questions:["返還・破棄の期限はあるか？","バックアップや法令保存分の扱いはあるか？"], suggestion:"終了時の返還・破棄期限と例外を明確にしてください。" }
    ];
    if(type === "sales_jp") return [
      { id:"jp_sales_acceptance", category:"売買", title:"検収みなし承認・返品制限", severity:"MED", re:/(みなし承認|検収したものとみなす|返品不可|キャンセル不可|契約不適合|危険負担|所有権移転)/, why:"売買では検収、返品、契約不適合、危険負担、所有権移転の条件が重要です。", questions:["検収期限は合理的か？","契約不適合時の対応は明確か？","危険負担と所有権移転の時点は明確か？"], suggestion:"検収期限、返品条件、契約不適合責任、危険負担、所有権移転時期を確認してください。" },
      { id:"jp_sales_delivery", category:"売買", title:"納期・遅延責任", severity:"MED", re:/(納期|納入|引渡し|遅延|遅滞|配送|出荷)/, why:"納期や遅延時の責任が曖昧だと、損害やキャンセル条件で争いになりやすくなります。", questions:["納期は確定か目安か？","遅延時の通知・解除・賠償は明確か？"], suggestion:"納期、遅延時の通知、解除条件、責任範囲を明確にしてください。" }
    ];
    return [
      { id:"jp_services_acceptance", category:"業務委託", title:"検収・修補・再納品", severity:"MED", re:/(検収|修補|再納品|不具合|瑕疵|契約不適合)/, why:"業務委託では検収期限や無償修補範囲が曖昧だと、工数が膨らむ可能性があります。", questions:["検収期限はあるか？","無償修補の範囲・期間は限定されているか？"], suggestion:"検収期限、修補回数、対応範囲、対応期間を明確にしてください。" },
      { id:"jp_services_mid_cancel", category:"業務委託", title:"中途解約・報酬精算", severity:"MED", re:/(中途解約|途中解約|解約予告|既履行|精算|報酬を支払わない)/, why:"中途解約時の精算が曖昧だと、作業済み分の報酬回収が難しくなる可能性があります。", questions:["既履行分の報酬は支払われるか？","解約予告期間はあるか？"], suggestion:"中途解約時の既履行分精算、費用負担、予告期間を確認してください。" }
    ];
  }

  function missingRulesJP(text){ const checks = []; if(!/(準拠法|合意管轄|管轄裁判所)/.test(text)) checks.push({ id:"jp_missing_juris", category:"不足確認", title:"準拠法/合意管轄の記載が見当たらない", severity:"INFO", why:"トラブル時の手続きが不明確になり得ます。", questions:["準拠法は明記されているか？","管轄裁判所は明記されているか？"], suggestion:"準拠法と管轄裁判所を明記してください。" }); if(!/(反社会的勢力|反社|暴力団|反社会勢力)/.test(text)) checks.push({ id:"jp_missing_antisocial", category:"不足確認", title:"反社条項の記載が見当たらない", severity:"INFO", why:"取引相手の属性に関する解除・表明保証がない可能性があります。", questions:["反社会的勢力排除条項はあるか？","違反時の解除権はあるか？"], suggestion:"必要に応じて反社会的勢力排除条項を追加してください。" }); return checks.map(missingFinding); }

  function commonRulesEN(){ return [
    { id:"en_termination", category:"Termination", title:"One-sided termination", severity:"HIGH", re:/(terminate|termination).{0,80}(sole discretion|immediately|without notice|for convenience)/i, why:"One-sided termination rights can increase delivery, revenue, and continuity risk.", questions:["Are termination rights mutual?","Is notice or cure period required?"], suggestion:"Consider mutual termination rights, notice periods, and cure periods." },
    { id:"en_uncapped", category:"Liability", title:"Unlimited or uncapped liability", severity:"HIGH", re:/(unlimited liability|uncapped|no cap|without limit|liable for all damages)/i, why:"Uncapped liability can create disproportionate downside risk.", questions:["Is there a liability cap?","Are indirect or consequential damages excluded?"], suggestion:"Consider a reasonable liability cap and exclusions for indirect damages." },
    { id:"en_consequential", category:"Damages", title:"Consequential damages / lost profits", severity:"MED", re:/(consequential damages|indirect damages|special damages|lost profits|loss of profit)/i, why:"Consequential damages or lost profits may expand exposure beyond expected direct losses.", questions:["Are indirect damages excluded?","Is liability limited to direct damages?"], suggestion:"Clarify whether indirect damages, special damages, and lost profits are excluded." },
    { id:"en_indemnity", category:"Indemnity", title:"Broad indemnity", severity:"MED", re:/(indemnif(?:y|ies|ication)|hold harmless|defend and hold)/i, why:"Broad indemnities may shift unexpected risk to one party.", questions:["Is the scope limited to third-party claims?","Are triggers and caps defined?"], suggestion:"Clarify scope, triggers, exclusions, and caps." },
    { id:"en_auto_renewal", category:"Term", title:"Auto-renewal / no easy termination", severity:"MED", re:/(auto.?renew|automatic renewal|renews automatically|no termination for convenience|may not terminate)/i, why:"Auto-renewal or no convenience termination can make the contract hard to exit.", questions:["Is the opt-out deadline clear?","Is termination for convenience allowed?"], suggestion:"Define renewal notice, opt-out deadline, and termination rights." },
    { id:"en_unilateral_change", category:"Change rights", title:"Unilateral change right", severity:"HIGH", re:/(may change|modify at .*sole discretion|unilaterally|without notice|we may update)/i, why:"One party being able to change terms unilaterally can undermine certainty.", questions:["Is advance notice required?","Can the other party terminate after adverse changes?"], suggestion:"Require notice, consent for material changes, or termination rights for adverse changes." },
    { id:"en_payment", category:"Payment", title:"Vague or sensitive payment terms", severity:"MED", re:/(as agreed|reasonable time|promptly|payment terms|due date|late payment|interest)/i, why:"Vague payment terms can cause disputes and delays.", questions:["Is the due date clear?","Are invoicing and acceptance requirements clear?"], suggestion:"Define invoice timing, due date, acceptance, and late payment handling." },
    { id:"en_ip_assignment", category:"IP", title:"Overly broad IP assignment", severity:"MED", re:/(assign(?:s|ment)?).{0,100}(all intellectual property|all IP|work product|deliverables)/i, why:"Overbroad IP assignment may unintentionally include pre-existing tools, know-how, or reusable materials.", questions:["Is background IP excluded?","Is there a license-back?","Can portfolio use be allowed?"], suggestion:"Carve out background IP, tools, know-how, and reusable components." },
    { id:"en_moral_rights", category:"IP", title:"Moral rights waiver", severity:"MED", re:/(moral rights).{0,80}(waive|waiver|not assert)/i, why:"Moral rights waiver can affect attribution and control over modifications.", questions:["Is the waiver limited to deliverables?","Is attribution or portfolio use allowed?"], suggestion:"Limit the waiver scope and clarify attribution or portfolio use." },
    { id:"en_non_compete", category:"Non-compete", title:"Non-compete / exclusivity", severity:"HIGH", re:/(non-?compete|not compete|exclusive|exclusivity|restraint of trade)/i, why:"Non-compete or exclusivity terms can restrict future work or sales opportunities.", questions:["Is the scope/time/territory limited?","Is consideration or business justification clear?"], suggestion:"Limit scope, duration, territory, and target activities." },
    { id:"en_subcontracting", category:"Subcontracting", title:"Subcontracting restrictions or broad subcontracting", severity:"MED", re:/(subcontract|subcontractor|delegate|third party provider)/i, why:"Subcontracting terms affect delivery, confidentiality, data handling, and responsibility.", questions:["Is consent required?","Who is responsible for subcontractors?"], suggestion:"Clarify consent, flow-down obligations, and responsibility for subcontractors." },
    { id:"en_personal_data", category:"Data", title:"Personal data / DPA issue", severity:"MED", re:/(personal data|personal information|DPA|data processing|processor|controller|data breach)/i, why:"Contracts involving personal data need clear processing roles and breach handling.", questions:["Are controller/processor roles clear?","Are breach notice and deletion rules defined?"], suggestion:"Add or review DPA, security measures, breach notice, deletion, and subprocessors." },
    { id:"en_confidentiality", category:"Confidentiality", title:"Perpetual confidentiality without clear limits", severity:"LOW", re:/(confidential).{0,100}(perpetual|forever|in perpetuity)/i, why:"Perpetual confidentiality may be operationally heavy without standard exceptions.", questions:["Are public domain and independently developed exceptions included?","Is duration reasonable?"], suggestion:"Add standard exceptions and a reasonable term, except for trade secrets where appropriate." }
  ]; }

  function typeRulesEN(type){
    if(type === "nda_en") return [
      { id:"en_nda_purpose", category:"NDA", title:"Purpose and confidential information definition", severity:"MED", re:/(confidential information|purpose|permitted purpose|use.*only for)/i, why:"For NDAs, the definition of confidential information, purpose limitation, and exceptions are critical.", questions:["Is confidential information defined too broadly?","Are standard exceptions included?"], suggestion:"Clarify confidential information, permitted purpose, exceptions, and return/destruction." },
      { id:"en_nda_return_destroy", category:"NDA", title:"Return / destruction obligations", severity:"LOW", re:/(return|destroy|delete|destruction).{0,80}(confidential|materials|information|data)/i, why:"Return/destruction procedures can be difficult without deadlines and backup exceptions.", questions:["Is the deadline clear?","Are backup/legal retention exceptions included?"], suggestion:"Define deadlines, method, and backup/legal retention exceptions." }
    ];
    if(type === "sales_en") return [
      { id:"en_sales_acceptance", category:"Sales", title:"Deemed acceptance / returns / warranty", severity:"MED", re:/(deemed accepted|acceptance|no returns|non-refundable|warranty|risk of loss|title passes)/i, why:"Sales contracts need clear acceptance, returns, warranty, risk of loss, and title transfer terms.", questions:["Is deemed acceptance period reasonable?","Are warranty and return remedies clear?","When do title and risk transfer?"], suggestion:"Clarify acceptance period, return rights, warranty remedy, title, and risk transfer." },
      { id:"en_sales_delivery", category:"Sales", title:"Delivery delay and responsibility", severity:"MED", re:/(delivery|shipment|late delivery|delay|lead time|dispatch)/i, why:"Delivery and delay terms affect cancellation, damages, and customer obligations.", questions:["Is the delivery date firm or estimated?","What happens if delivery is delayed?"], suggestion:"Define delivery timing, delay notice, cancellation rights, and responsibility." }
    ];
    return [
      { id:"en_services_acceptance", category:"Services", title:"Acceptance / rework / defects", severity:"MED", re:/(acceptance|accepted|defect|bug|rework|resubmit|correction)/i, why:"Services agreements need clear acceptance criteria and limits on free rework.", questions:["Is acceptance period defined?","Is free rework limited by scope/time?"], suggestion:"Define acceptance criteria, acceptance period, rework scope, and rework limit." },
      { id:"en_services_termination_payment", category:"Services", title:"Termination and payment for work performed", severity:"MED", re:/(termination|terminate|work performed|fees earned|no payment|refund)/i, why:"If termination payment is unclear, already performed work may go unpaid.", questions:["Is payment due for work already performed?","Are expenses reimbursed?"], suggestion:"Clarify payment for work performed, expenses, and notice period after termination." }
    ];
  }

  function missingRulesEN(text){ const checks = []; if(!/(governing law|jurisdiction|courts of|venue)/i.test(text)) checks.push({ id:"en_missing_juris", category:"Missing clause", title:"Governing law / jurisdiction not found", severity:"INFO", why:"Dispute handling may be unclear without governing law or jurisdiction.", questions:["What is the governing law?","Which courts or venue apply?"], suggestion:"Add governing law and jurisdiction clauses." }); return checks.map(missingFinding); }
  function rulesJP(text, type){ return [...commonRulesJP(), ...typeRulesJP(type)].map((rule) => findByRule(text, rule)).filter(Boolean).concat(missingRulesJP(text)); }
  function rulesEN(text, type){ return [...commonRulesEN(), ...typeRulesEN(type)].map((rule) => findByRule(text, rule)).filter(Boolean).concat(missingRulesEN(text)); }

  function score(findings, text){
    const highs = findings.filter(f => f.severity === "HIGH").length;
    const meds = findings.filter(f => f.severity === "MED").length;
    const lows = findings.filter(f => f.severity === "LOW").length;
    const infos = findings.filter(f => f.severity === "INFO").length;
    let level = "UNKNOWN";
    if(!text || text.trim().length < 80) level = "UNKNOWN";
    else if(text.trim().length < 400 && (highs + meds + lows + infos) < 2) level = "UNKNOWN";
    else if(highs >= 2 || (highs >= 1 && meds >= 2)) level = "HIGH";
    else if(highs === 1 || meds >= 2) level = "MEDIUM";
    else if(meds === 1 || lows + infos > 0) level = "LOW";
    const lines = [I18N[MODE].scoreGuide[level]];
    if(findings.length) lines.push(...findings.slice(0, 6).map(f => `• [${f.severity}] ${f.title}`));
    return { level, why: lines.join("\n"), counts: { highs, meds, lows, infos } };
  }

  function badge(level){ if(!els.riskBadge) return; els.riskBadge.className = "nw-badge"; if(level === "HIGH") els.riskBadge.classList.add("nw-badge--high"); else if(level === "MEDIUM") els.riskBadge.classList.add("nw-badge--med"); else if(level === "LOW") els.riskBadge.classList.add("nw-badge--low"); else els.riskBadge.classList.add("nw-badge--unk"); els.riskBadge.textContent = level; }
  function renderFindings(list){ if(!els.findings) return; els.findings.innerHTML = ""; if(!list.length){ els.findings.innerHTML = `<div class="nw-muted">${escapeHtml(I18N[MODE].noFindings)}</div>`; return; } for(const f of list){ const div = document.createElement("div"); div.className = "finding"; div.innerHTML = `<div class="finding__top"><div class="finding__title">${escapeHtml(f.title)}</div><div class="finding__sev sev-${escapeHtml(f.severity)}">${escapeHtml(f.severity)}</div></div><div class="finding__cat">${escapeHtml(f.category || "General")}</div><div class="nw-muted" style="margin-top:6px;">Matched</div><div class="nw-pre">${escapeHtml(f.snippet || "—")}</div><div class="nw-muted" style="margin-top:6px;">Why</div><div>${escapeHtml(f.why || "—")}</div><div class="nw-muted" style="margin-top:6px;">What to ask</div><ul>${(f.questions || []).map(q => `<li>${escapeHtml(q)}</li>`).join("")}</ul><div class="nw-muted" style="margin-top:6px;">Suggested check / rewrite direction</div><div>${escapeHtml(f.suggestion || "—")}</div>`; els.findings.appendChild(div); } }
  function toMarkdown(meta, findings, scored){ const lines = []; lines.push("# Contract Risk Highlight (Lite)"); lines.push(`- Timestamp: ${new Date().toLocaleString()}`); lines.push(`- Mode: ${MODE}`); lines.push(`- Type: ${meta.type}`); lines.push(`- Risk: ${scored.level}`); lines.push(""); lines.push("## Important disclaimer"); lines.push(MODE === "JP" ? "この出力は法的助言ではありません。契約可否・法的効果・条文修正の正しさを保証しません。重要な契約は弁護士・専門家・社内法務に確認してください。原文全文は含めず、検出箇所の短い抜粋のみを記録しています。" : "This output is not legal advice. It does not guarantee legal effect, contract acceptance, or clause correctness. Consult a lawyer, specialist, or legal team for important agreements. The full original text is not included; only short snippets are recorded."); lines.push(""); lines.push("## Risk basis"); scored.why.split("\n").forEach(line => lines.push(line.replace(/^•\s?/, "- "))); lines.push(""); lines.push("## Findings"); if(!findings.length){ lines.push("- (none; this does not mean the contract is safe)"); }else{ for(const f of findings){ lines.push(`### [${f.severity}] ${f.title}`); lines.push(`- Category: ${f.category || "General"}`); lines.push(`- Snippet: ${f.snippet || "—"}`); lines.push(`- Why: ${f.why || "—"}`); lines.push("- What to ask:"); (f.questions || []).forEach(q => lines.push(`  - ${q}`)); lines.push(`- Suggested check / rewrite direction: ${f.suggestion || "—"}`); lines.push(""); } } return lines.join("\n"); }

  function clearOutputs(){ lastScore = null; badge("UNKNOWN"); if(els.riskWhy) els.riskWhy.textContent = "—"; if(els.findings) els.findings.innerHTML = `<div class="nw-muted">${escapeHtml(I18N[MODE].empty)}</div>`; if(els.mdPreview) els.mdPreview.value = ""; }
  function analyze(){ const text = (els.text && els.text.value ? els.text.value : "").trim(); gtagSafe("tool_run", { tool_slug: TOOL, lang: MODE }); if(!text){ clearOutputs(); toast(I18N[MODE].pasteFirst); return; } const type = els.contractType ? els.contractType.value : (MODE === "JP" ? "services_jp" : "services_en"); const findings = MODE === "JP" ? rulesJP(text, type) : rulesEN(text, type); const sc = score(findings, text); lastScore = sc; badge(sc.level); if(els.riskWhy) els.riskWhy.textContent = sc.why; renderFindings(findings); if(els.mdPreview) els.mdPreview.value = toMarkdown({ type }, findings, sc); }
  function fallbackCopy(text){ const ta = document.createElement("textarea"); ta.value = text; ta.setAttribute("readonly", ""); ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select(); let ok = false; try{ ok = document.execCommand("copy"); }catch(_){ ok = false; } ta.remove(); return ok; }
  async function copyMarkdown(){ const text = els.mdPreview ? els.mdPreview.value : ""; if(!text.trim() || !lastScore){ toast(I18N[MODE].noMarkdown); return; } try{ if(navigator.clipboard && window.isSecureContext){ await navigator.clipboard.writeText(text); toast(I18N[MODE].copied); return; } }catch(_){} if(fallbackCopy(text)) toast(I18N[MODE].copied); else toast(I18N[MODE].copyFailed); }

  const EX_JP = `【業務委託契約（抜粋例）】\n甲は、乙が本契約に違反した場合、何らの催告を要せず直ちに本契約を解除できる。\n乙は、甲に生じた一切の損害を賠償するものとし、違約金として金100万円を支払う。\n本契約は自動更新され、中途解約はできない。\n成果物に関する一切の権利は甲に帰属し、乙は著作者人格権を行使しない。\n秘密保持義務は永久とする。`;
  const EX_EN = `Services Agreement (excerpt)\nCustomer may terminate this Agreement immediately at its sole discretion.\nSupplier shall have unlimited liability and shall indemnify and hold harmless Customer for all claims, including consequential damages and lost profits.\nThis Agreement renews automatically and Supplier may not terminate for convenience.\nSupplier assigns all intellectual property in the deliverables to Customer and waives moral rights. Confidentiality obligations are perpetual.`;

  function wire(){ if(els.modeJP) els.modeJP.addEventListener("click", () => setMode("JP")); if(els.modeEN) els.modeEN.addEventListener("click", () => setMode("EN")); if(els.analyze) els.analyze.addEventListener("click", analyze); if(els.clear) els.clear.addEventListener("click", () => { if(els.text) els.text.value = ""; clearOutputs(); }); if(els.pasteExample) els.pasteExample.addEventListener("click", () => { if(els.text) els.text.value = MODE === "JP" ? EX_JP : EX_EN; toast("Example pasted"); }); if(els.copyFindings) els.copyFindings.addEventListener("click", copyMarkdown); if(els.downloadMd) els.downloadMd.addEventListener("click", () => toast(I18N[MODE].exportState)); if(els.downloadPdf) els.downloadPdf.addEventListener("click", () => toast(I18N[MODE].exportState)); }

  wire();
  setMode((navigator.language || "").toLowerCase().startsWith("ja") ? "JP" : "EN");
})();
