/* ============================================================
 * Contract Cleaner – app.js
 * Rule-based contract term checker (no AI, local-only)
 * ============================================================ */

const MAX_HIGHLIGHTS = 200;
const SNIPPET_CONTEXT = 34;

let CURRENT_LANG = "ja";

const I18N = {
  ja: {
    title_main: "契約書の注意語・確認ポイント検出（Contract Cleaner）",
    subtitle: "契約書・利用規約の本文から、注意が必要な可能性のある表現をブラウザ内で整理します（AI不使用）。",
    donate_hdr: "このツールが役に立ったら、開発継続のご支援をいただけると嬉しいです。",
    donate_ftr: "開発継続のためのご支援をいただけると嬉しいです。",
    notice_title: "重要な注意",
    notice_body: "このツールは危険条文を断定するものではありません。契約書内の注意語・確認候補を機械的に抽出するだけです。契約可否、条文修正の正しさ、法的リスクの有無は判断しません。重要な契約は弁護士・専門家・社内法務に確認してください。機密契約書や個人情報は貼り付けないでください。",
    input_title: "契約書・規約の本文",
    input_desc: "PDFファイルの直接読み込みには対応していません。本文をコピーできるPDFは、テキストとして貼り付けてください。スキャンPDF・画像PDFのOCRは行いません。",
    local_only: "本文解析はブラウザ内で行います。入力テキストは送信しません。ただし広告・解析タグは読み込まれます。",
    placeholder: "ここに契約書・利用規約の本文を貼り付けてください。PDFの直接読み込みやOCRには対応していません。",
    scan_btn: "確認ポイントを検出",
    clear_btn: "クリア",
    example_btn: "例文",
    copy_summary: "要約をコピー",
    copy_questions: "質問テンプレをコピー",
    download_btn: "txtを保存",
    disclaimer: "検出されない＝安全ではありません。これは法的助言ではなく、注意語の機械的な抽出です。",
    result_title: "確認ポイント",
    total_hits: "合計ヒット",
    category_hits: "該当カテゴリ",
    severity_high: "High",
    severity_medium: "Medium",
    severity_low: "Low",
    severity_help: "High / Medium / Low は確認の優先度目安です。法的な危険度を断定するものではありません。",
    priority_title: "優先確認カテゴリ",
    priority_empty: "本文を貼り付けると、優先確認カテゴリを表示します。",
    only_matched: "該当カテゴリのみ表示",
    summary_hint: "カテゴリ別に確認ポイントと該当箇所を表示します。",
    questions_title: "確認したい点（プレビュー）",
    questions_header: "確認したい点（質問テンプレ）",
    highlight_title: "ハイライト表示",
    highlight_desc: "入力テキスト中の該当箇所を色付きで表示します。",
    faq_title: "よくある質問",
    faq_legal_q: "法的助言ですか？",
    faq_legal_a: "いいえ。注意語を機械的に検出する簡易ツールです。契約判断や条文修正の正しさは保証しません。",
    faq_privacy_q: "契約書テキストは送信されますか？",
    faq_privacy_a: "本文解析はブラウザ内で行います。入力内容をサーバーへ送信する処理はありません。ただし広告・解析タグは読み込まれます。",
    faq_safe_q: "検出されなければ安全ですか？",
    faq_safe_a: "いいえ。検出漏れがあります。重要な契約は弁護士・専門家・社内法務に確認してください。",
    faq_pdf_q: "PDFに対応していますか？",
    faq_pdf_a: "直接読み込みには対応していません。本文をコピーできるPDFはテキスト化して貼り付けてください。スキャンPDF・画像PDFのOCRは行いません。",
    faq_diff_q: "Contract Risk Highlighterとの違いは？",
    faq_diff_a: "Contract Cleanerはキーワードと確認ポイント整理に寄せた軽量ツールです。Contract Risk Highlighterは条項パターンごとの説明に寄せたツールです。",
    related_title: "関連ツール",
    footer_disclaimer: "当サイトには広告が含まれる場合があります。情報の正確性は保証されません。",
    no_match: "注意語は見つかりませんでした。ただし安全を意味するものではありません。",
    no_category: "該当なし",
    more_hits: "さらに {count} 件あります。",
    toast_copy: "コピーしました",
    toast_empty: "コピーする内容がありません",
    toast_download: "txtを保存しました",
    toast_copy_failed: "コピーに失敗しました",
    hits_label: "ヒット数",
    confirmation_label: "確認ポイント",
    severity_label: "優先度",
    term_label: "該当語",
    raw_not_included: "※ 原文全文は含めていません。",
    summary_disclaimer: "※ この出力は法的助言ではありません。注意語・確認候補を機械的に整理したものです。重要な契約は専門家・社内法務に確認してください。",
  },
  en: {
    title_main: "Contract term and review-point checker (Contract Cleaner)",
    subtitle: "Find contract or terms-of-service phrases that may need review. Runs locally in your browser, with no AI.",
    donate_hdr: "If this tool helps, you can support future development.",
    donate_ftr: "We appreciate your support for continued development.",
    notice_title: "Important note",
    notice_body: "This tool does not decide whether a clause is dangerous. It mechanically extracts terms and review candidates only. It does not judge whether to sign, how to revise clauses, or whether legal risk exists. For important contracts, ask a lawyer, specialist, or internal legal team. Do not paste confidential contracts or personal information.",
    input_title: "Contract / Terms text",
    input_desc: "Direct PDF upload is not supported. If text can be copied from a PDF, paste it as text. Scanned or image-based PDFs are not OCRed here.",
    local_only: "Text analysis runs in your browser. The pasted text is not uploaded. Ads and analytics tags may still load.",
    placeholder: "Paste contract or terms text here. Direct PDF upload and OCR are not supported.",
    scan_btn: "Find review points",
    clear_btn: "Clear",
    example_btn: "Example",
    copy_summary: "Copy summary",
    copy_questions: "Copy questions",
    download_btn: "Download txt",
    disclaimer: "No matches does not mean safe. This is not legal advice; it only extracts terms mechanically.",
    result_title: "Review points",
    total_hits: "Total hits",
    category_hits: "Matched categories",
    severity_high: "High",
    severity_medium: "Medium",
    severity_low: "Low",
    severity_help: "High / Medium / Low are rough review-priority labels, not legal risk decisions.",
    priority_title: "Priority categories",
    priority_empty: "Paste text to show priority categories.",
    only_matched: "Show only matched categories",
    summary_hint: "Each category shows review points and matched snippets.",
    questions_title: "Questions to ask (preview)",
    questions_header: "Questions to ask (template)",
    highlight_title: "Highlighted view",
    highlight_desc: "Matched terms are highlighted in the text below.",
    faq_title: "FAQ",
    faq_legal_q: "Is this legal advice?",
    faq_legal_a: "No. It is a simple tool that mechanically detects review terms. It does not guarantee contract decisions or clause revisions.",
    faq_privacy_q: "Is the contract text uploaded?",
    faq_privacy_a: "The body text is analyzed in your browser. This tool does not send the pasted text to a server. Ads and analytics tags may still load.",
    faq_safe_q: "Does no detection mean the contract is safe?",
    faq_safe_a: "No. There can be missed terms. For important contracts, ask a lawyer, specialist, or internal legal team.",
    faq_pdf_q: "Does it support PDF files?",
    faq_pdf_a: "Direct PDF upload is not supported. Copy text from the PDF and paste it here. Scanned or image-based PDFs are not OCRed.",
    faq_diff_q: "How is it different from Contract Risk Highlighter?",
    faq_diff_a: "Contract Cleaner focuses on keyword detection and review-point organization. Contract Risk Highlighter focuses more on clause-pattern explanations.",
    related_title: "Related tools",
    footer_disclaimer: "This site may contain ads. No guarantee of accuracy.",
    no_match: "No review terms were found. This does not mean the text is safe.",
    no_category: "No matches",
    more_hits: "+ {count} more",
    toast_copy: "Copied",
    toast_empty: "Nothing to copy",
    toast_download: "Downloaded",
    toast_copy_failed: "Copy failed",
    hits_label: "Hits",
    confirmation_label: "Review point",
    severity_label: "Priority",
    term_label: "Matched term",
    raw_not_included: "Original full text is not included.",
    summary_disclaimer: "This output is not legal advice. It mechanically organizes terms and review candidates. For important contracts, ask a specialist or legal team.",
  },
};

const SEVERITY_ORDER = { high: 0, medium: 1, low: 2 };

const RULES = [
  {
    id: "liability",
    severity: "high",
    name: { ja: "損害賠償・責任", en: "Liability" },
    keywords: ["損害賠償", "賠償責任", "責任の上限", "責任制限", "免責", "間接損害", "逸失利益", "特別損害", "liability", "indemnify", "indemnification", "limitation of liability", "damages"],
    confirmationPoint: {
      ja: "責任範囲、免責、上限、間接損害の扱いが一方的でないか確認したい。",
      en: "Check liability scope, disclaimers, caps, and indirect-damage treatment.",
    },
    questionTemplates: {
      ja: ["損害賠償の上限は妥当な金額か？", "免責の範囲と例外条件は明確か？", "間接損害・逸失利益の扱いはどう定義されているか？"],
      en: ["Is the liability cap reasonable?", "Are disclaimers and exceptions clear?", "How are indirect damages or lost profits handled?"],
    },
  },
  {
    id: "termination",
    severity: "high",
    name: { ja: "解除・中途解約", en: "Termination" },
    keywords: ["解除", "中途解約", "解約", "違約金", "解約金", "契約終了", "終了事由", "termination", "terminate", "early termination", "penalty"],
    confirmationPoint: {
      ja: "解除条件、通知期限、違約金、精算条件が一方的でないか確認したい。",
      en: "Review termination rights, notice periods, penalties, and settlement conditions.",
    },
    questionTemplates: {
      ja: ["解除できる条件は双方で対称か？", "中途解約の違約金・精算条件は明確か？", "通知期限や手続きが現実的か？"],
      en: ["Are termination rights balanced?", "Are early-termination fees clear?", "Is the notice period realistic?"],
    },
  },
  {
    id: "ip",
    severity: "high",
    name: { ja: "知財・成果物", en: "IP & Deliverables" },
    keywords: ["知的財産", "知財", "著作権", "成果物", "所有権", "権利帰属", "利用許諾", "使用許諾", "ライセンス", "intellectual property", "copyright", "deliverables", "ownership", "license"],
    confirmationPoint: {
      ja: "成果物の権利帰属、利用範囲、二次利用、改変可否を確認したい。",
      en: "Confirm ownership, license scope, reuse, and modification rights.",
    },
    questionTemplates: {
      ja: ["成果物の権利帰属はどちらか？", "利用許諾の範囲・期間・地域は明確か？", "二次利用や改変は可能か？"],
      en: ["Who owns the deliverables?", "Is the license scope, term, and territory clear?", "Are reuse or modifications permitted?"],
    },
  },
  {
    id: "unilateral_change",
    severity: "high",
    name: { ja: "一方的変更", en: "Unilateral changes" },
    keywords: ["変更できる", "当社が定める", "当社の裁量", "予告なく変更", "任意に変更", "随時変更", "別途定める", "may change", "sole discretion", "without notice", "at any time"],
    confirmationPoint: {
      ja: "相手側だけが条件を変更できる条項になっていないか確認したい。",
      en: "Check whether one party can change terms unilaterally.",
    },
    questionTemplates: {
      ja: ["変更時の通知方法・効力発生日は明確か？", "一方的変更に対する拒否・解約の選択肢はあるか？", "変更対象が広すぎないか？"],
      en: ["How are changes notified and when do they take effect?", "Can the other party reject or terminate after changes?", "Is the change scope too broad?"],
    },
  },
  {
    id: "non_compete_exclusive",
    severity: "high",
    name: { ja: "競業避止・専属契約", en: "Non-compete / Exclusivity" },
    keywords: ["競業避止", "競業禁止", "専属", "独占", "排他的", "同種業務", "類似業務", "non-compete", "exclusive", "exclusivity", "competing business"],
    confirmationPoint: {
      ja: "活動制限の範囲、期間、地域、対象業務が広すぎないか確認したい。",
      en: "Check whether activity restrictions are too broad in scope, term, geography, or business area.",
    },
    questionTemplates: {
      ja: ["制限される業務範囲は明確か？", "期間・地域・対象顧客が広すぎないか？", "対価や例外条件はあるか？"],
      en: ["Is the restricted activity clearly defined?", "Are term, geography, or customers too broad?", "Is there consideration or an exception?"],
    },
  },
  {
    id: "payment",
    severity: "medium",
    name: { ja: "支払・料金", en: "Payment" },
    keywords: ["支払", "支払い", "料金", "報酬", "遅延損害金", "手数料", "相殺", "振込手数料", "請求", "payment", "fee", "late fee", "set-off", "invoice"],
    confirmationPoint: {
      ja: "支払期限、支払方法、遅延時の扱い、相殺条項を確認したい。",
      en: "Confirm payment timing, method, late fees, and set-off clauses.",
    },
    questionTemplates: {
      ja: ["支払期限・支払方法は現実的か？", "遅延損害金や手数料の条件は妥当か？", "相殺条項の有無を確認したい。"],
      en: ["Are payment terms and methods acceptable?", "How are late fees applied?", "Is there a set-off clause?"],
    },
  },
  {
    id: "inspection_delivery",
    severity: "medium",
    name: { ja: "検収・納品", en: "Inspection / Delivery" },
    keywords: ["検収", "納品", "納入", "みなし承認", "みなし検収", "検査", "修正対応", "acceptance", "inspection", "deemed accepted", "delivery"],
    confirmationPoint: {
      ja: "検収基準、みなし承認、修正対応、納品完了条件を確認したい。",
      en: "Check acceptance criteria, deemed acceptance, revisions, and delivery completion.",
    },
    questionTemplates: {
      ja: ["検収基準は客観的か？", "みなし承認までの期間は妥当か？", "修正回数・範囲・期限は明確か？"],
      en: ["Are acceptance criteria objective?", "Is the deemed-acceptance period reasonable?", "Are revision scope and deadlines clear?"],
    },
  },
  {
    id: "subcontracting",
    severity: "medium",
    name: { ja: "再委託・外注", en: "Subcontracting" },
    keywords: ["再委託", "再委任", "外注", "委託先", "下請", "subcontract", "subprocessor", "delegate"],
    confirmationPoint: {
      ja: "再委託の可否、事前承諾、責任分担、情報管理を確認したい。",
      en: "Verify subcontracting permission, prior consent, responsibility, and information handling.",
    },
    questionTemplates: {
      ja: ["再委託に事前承諾が必要か？", "再委託先への責任分担は明確か？", "個人情報や機密情報の扱いは定義されているか？"],
      en: ["Is prior consent required?", "Are responsibilities for subcontractors defined?", "How are personal or confidential data handled?"],
    },
  },
  {
    id: "personal_data",
    severity: "medium",
    name: { ja: "個人情報・データ", en: "Personal data / Data" },
    keywords: ["個人情報", "個人データ", "第三者提供", "委託先", "データ", "ログ", "利用目的", "privacy", "personal data", "personal information", "third party", "data processing"],
    confirmationPoint: {
      ja: "個人情報・データの利用目的、第三者提供、委託先、削除・返却条件を確認したい。",
      en: "Check data purposes, third-party sharing, processors, deletion, and return conditions.",
    },
    questionTemplates: {
      ja: ["利用目的は具体的か？", "第三者提供や委託先の範囲は明確か？", "契約終了後の削除・返却は定義されているか？"],
      en: ["Are data purposes specific?", "Are third parties and processors clear?", "Are deletion or return obligations defined after termination?"],
    },
  },
  {
    id: "confidentiality",
    severity: "medium",
    name: { ja: "秘密保持", en: "Confidentiality" },
    keywords: ["秘密保持", "機密", "秘密情報", "開示", "例外", "第三者開示", "confidential", "confidentiality", "non-disclosure", "disclosure"],
    confirmationPoint: {
      ja: "秘密情報の範囲、例外、開示条件、保持期間を確認したい。",
      en: "Check scope, exceptions, disclosure conditions, and confidentiality term.",
    },
    questionTemplates: {
      ja: ["秘密情報の定義は広すぎないか？", "開示可能な例外や通知義務はあるか？", "秘密保持期間は妥当か？"],
      en: ["Is the definition of confidential information reasonable?", "Are exceptions and notice duties clear?", "Is the confidentiality term appropriate?"],
    },
  },
  {
    id: "auto_renewal",
    severity: "medium",
    name: { ja: "自動更新", en: "Auto-renewal" },
    keywords: ["自動更新", "更新拒絶", "解約申出", "更新しない", "更新停止", "auto-renew", "automatic renewal", "renewal notice"],
    confirmationPoint: {
      ja: "自動更新の有無、更新拒絶期限、通知方法を確認したい。",
      en: "Check auto-renewal, opt-out deadlines, and notice methods.",
    },
    questionTemplates: {
      ja: ["自動更新の期間は明確か？", "更新拒絶の期限・方法は現実的か？", "解約申出を忘れた場合の負担は大きくないか？"],
      en: ["Is the renewal term clear?", "Are opt-out deadline and method realistic?", "What happens if notice is missed?"],
    },
  },
  {
    id: "warranty",
    severity: "medium",
    name: { ja: "保証・補償", en: "Warranty & Indemnity" },
    keywords: ["保証", "補償", "瑕疵", "契約不適合", "瑕疵担保", "非侵害保証", "warranty", "indemnity", "defect", "non-infringement"],
    confirmationPoint: {
      ja: "保証範囲、補償条件、契約不適合時の対応を確認したい。",
      en: "Review warranty scope, indemnity conditions, and defect handling.",
    },
    questionTemplates: {
      ja: ["保証内容・期間は妥当か？", "補償範囲や免責条件は明確か？", "契約不適合時の手続きは定義されているか？"],
      en: ["Are warranty terms and duration reasonable?", "Are indemnity scope and exclusions clear?", "Is the defect remediation process defined?"],
    },
  },
  {
    id: "deadline_delay",
    severity: "medium",
    name: { ja: "期限・遅延", en: "Deadlines / Delay" },
    keywords: ["期限", "納期", "遅延", "期限の利益", "遅滞", "delay", "deadline", "due date", "time is of the essence"],
    confirmationPoint: {
      ja: "納期・期限、遅延時の効果、期限の利益喪失条件を確認したい。",
      en: "Check deadlines, delay consequences, and acceleration clauses.",
    },
    questionTemplates: {
      ja: ["期限や納期は現実的か？", "遅延時のペナルティや解除条件は明確か？", "期限の利益喪失が広すぎないか？"],
      en: ["Are deadlines realistic?", "Are delay penalties or termination rights clear?", "Are acceleration conditions too broad?"],
    },
  },
  {
    id: "antisocial",
    severity: "low",
    name: { ja: "反社会的勢力", en: "Anti-social forces" },
    keywords: ["反社会的勢力", "暴力団", "暴力団員", "反社", "antisocial forces", "organized crime", "criminal organization"],
    confirmationPoint: {
      ja: "表明保証、解除条件、確認範囲を確認したい。",
      en: "Check representations, termination triggers, and scope.",
    },
    questionTemplates: {
      ja: ["反社条項は入っているか？", "違反時の解除条件は明確か？", "確認対象の範囲は妥当か？"],
      en: ["Is an anti-social forces clause included?", "Are termination triggers clear?", "Is the covered scope reasonable?"],
    },
  },
  {
    id: "force_majeure",
    severity: "low",
    name: { ja: "不可抗力", en: "Force majeure" },
    keywords: ["不可抗力", "天災", "地震", "システム障害", "通信障害", "force majeure", "act of god", "system failure", "network failure"],
    confirmationPoint: {
      ja: "不可抗力の範囲、通知義務、履行免除の条件を確認したい。",
      en: "Check force-majeure scope, notice duties, and performance relief.",
    },
    questionTemplates: {
      ja: ["不可抗力の定義は広すぎないか？", "通知義務や証明方法はあるか？", "支払義務や納期への影響は明確か？"],
      en: ["Is the force-majeure definition too broad?", "Are notice and proof requirements defined?", "How are payment or deadlines affected?"],
    },
  },
  {
    id: "jurisdiction",
    severity: "low",
    name: { ja: "準拠法・管轄", en: "Governing law / Jurisdiction" },
    keywords: ["準拠法", "管轄", "裁判所", "合意管轄", "専属的合意管轄", "governing law", "jurisdiction", "venue", "court"],
    confirmationPoint: {
      ja: "準拠法や管轄地が実務上対応可能か確認したい。",
      en: "Confirm whether governing law and venue are practical.",
    },
    questionTemplates: {
      ja: ["準拠法・管轄は自社に不利でないか？", "専属的合意管轄の記載があるか？", "遠隔地・国外管轄になっていないか？"],
      en: ["Is the governing law or venue unfavorable?", "Is there an exclusive jurisdiction clause?", "Is the venue remote or overseas?"],
    },
  },
];

function t(key) {
  return I18N[CURRENT_LANG][key] || I18N.ja[key] || key;
}

function applyI18n() {
  document.documentElement.lang = CURRENT_LANG;
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (key && t(key)) el.textContent = t(key);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.getAttribute("data-i18n-placeholder"));
  });
}

function setLang(lang) {
  CURRENT_LANG = lang === "en" ? "en" : "ja";
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === CURRENT_LANG);
  });
  applyI18n();
  renderAll();
}

function normalize(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function escapeRegExp(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isEnglishKeyword(keyword) {
  return /[A-Za-z]/.test(keyword);
}

function buildEnglishRegex(keyword) {
  const escaped = escapeRegExp(keyword);
  let pattern = escaped;
  if (/^[A-Za-z0-9]/.test(keyword)) pattern = `\\b${pattern}`;
  if (/[A-Za-z0-9]$/.test(keyword)) pattern = `${pattern}\\b`;
  return new RegExp(pattern, "gi");
}

function collectMatches(text) {
  const candidates = [];
  const keywords = RULES.flatMap((rule) =>
    rule.keywords.map((keyword) => ({ keyword, rule, isEnglish: isEnglishKeyword(keyword) }))
  ).sort((a, b) => b.keyword.length - a.keyword.length);

  for (const item of keywords) {
    if (!item.keyword) continue;
    if (item.isEnglish) {
      const re = buildEnglishRegex(item.keyword);
      let match;
      while ((match = re.exec(text)) !== null) {
        candidates.push({ start: match.index, end: match.index + match[0].length, term: match[0], rule: item.rule });
      }
    } else {
      let idx = 0;
      while (true) {
        const pos = text.indexOf(item.keyword, idx);
        if (pos === -1) break;
        candidates.push({ start: pos, end: pos + item.keyword.length, term: item.keyword, rule: item.rule });
        idx = pos + item.keyword.length;
      }
    }
  }

  candidates.sort((a, b) => a.start - b.start || b.end - a.end || SEVERITY_ORDER[a.rule.severity] - SEVERITY_ORDER[b.rule.severity]);
  const filtered = [];
  let lastEnd = -1;
  for (const match of candidates) {
    if (match.start < lastEnd) continue;
    filtered.push(match);
    lastEnd = match.end;
  }
  return filtered;
}

function groupByCategory(matches) {
  const groups = new Map();
  RULES.forEach((rule) => groups.set(rule.id, { rule, matches: [] }));
  matches.forEach((match) => groups.get(match.rule.id)?.matches.push(match));
  return Array.from(groups.values());
}

function buildSnippet(text, start, end) {
  const before = Math.max(0, start - SNIPPET_CONTEXT);
  const after = Math.min(text.length, end + SNIPPET_CONTEXT);
  return `${before > 0 ? "…" : ""}${text.slice(before, after).replace(/\s+/g, " ").trim()}${after < text.length ? "…" : ""}`;
}

function getSeverityStats(groups) {
  return ["high", "medium", "low"].reduce((acc, severity) => {
    const matched = groups.filter((group) => group.rule.severity === severity && group.matches.length > 0);
    acc[severity] = {
      categories: matched.length,
      hits: matched.reduce((sum, group) => sum + group.matches.length, 0),
    };
    return acc;
  }, {});
}

function updateCounters(matches, groups) {
  const matchedCategories = groups.filter((group) => group.matches.length > 0).length;
  const totalHits = document.getElementById("totalHits");
  const categoryCount = document.getElementById("categoryCount");
  if (totalHits) totalHits.textContent = String(matches.length);
  if (categoryCount) categoryCount.textContent = String(matchedCategories);

  const stats = getSeverityStats(groups);
  ["high", "medium", "low"].forEach((severity) => {
    const el = document.getElementById(`${severity}Count`);
    if (el) el.textContent = `${stats[severity].categories} / ${stats[severity].hits}`;
  });
}

function updatePriorityCategories(groups) {
  const target = document.getElementById("priorityCategories");
  if (!target) return;
  const matched = groups
    .filter((group) => group.matches.length > 0)
    .sort((a, b) => SEVERITY_ORDER[a.rule.severity] - SEVERITY_ORDER[b.rule.severity] || b.matches.length - a.matches.length)
    .slice(0, 6);

  if (!matched.length) {
    target.textContent = t("priority_empty");
    target.className = "priority-empty";
    return;
  }

  target.className = "priority-list";
  target.innerHTML = matched.map((group) => `
    <span class="priority-pill severity-${group.rule.severity}">
      ${escapeHtml(t(`severity_${group.rule.severity}`))}: ${escapeHtml(group.rule.name[CURRENT_LANG])} (${group.matches.length})
    </span>
  `).join("");
}

function updateCategoryList(text, groups) {
  const list = document.getElementById("categoryList");
  const onlyMatched = document.getElementById("onlyMatchedToggle");
  if (!list) return;

  const showOnlyMatched = onlyMatched ? onlyMatched.checked : true;
  list.innerHTML = "";

  groups.forEach((group) => {
    const hasMatches = group.matches.length > 0;
    if (showOnlyMatched && !hasMatches) return;

    const card = document.createElement("details");
    card.className = `category-card severity-${group.rule.severity}`;
    card.open = hasMatches;

    const summary = document.createElement("summary");
    summary.className = "category-summary";
    summary.innerHTML = `
      <span class="category-name">${escapeHtml(group.rule.name[CURRENT_LANG])}</span>
      <span class="category-meta">
        <span class="severity-badge severity-${group.rule.severity}">${escapeHtml(t(`severity_${group.rule.severity}`))}</span>
        <span class="category-count">${escapeHtml(t("hits_label"))}: ${group.matches.length}</span>
      </span>
    `;
    card.appendChild(summary);

    const body = document.createElement("div");
    body.className = "category-body";
    const confirmation = document.createElement("p");
    confirmation.className = "category-confirmation";
    confirmation.innerHTML = `<strong>${escapeHtml(t("confirmation_label"))}:</strong> ${escapeHtml(group.rule.confirmationPoint[CURRENT_LANG])}`;
    body.appendChild(confirmation);

    if (!hasMatches) {
      const empty = document.createElement("p");
      empty.className = "category-empty";
      empty.textContent = t("no_category");
      body.appendChild(empty);
    } else {
      const listEl = document.createElement("ul");
      listEl.className = "match-list";
      group.matches.forEach((match) => {
        const item = document.createElement("li");
        item.innerHTML = `
          <span class="match-term">${escapeHtml(match.term)}</span>
          <span class="match-snippet">${escapeHtml(buildSnippet(text, match.start, match.end))}</span>
        `;
        listEl.appendChild(item);
      });
      body.appendChild(listEl);
    }

    card.appendChild(body);
    list.appendChild(card);
  });
}

function updateHighlight(text, matches) {
  const preview = document.getElementById("highlightPreview");
  const note = document.getElementById("highlightNote");
  if (!preview) return;

  if (!matches.length) {
    preview.textContent = text;
    if (note) note.textContent = text.trim() ? t("no_match") : "";
    return;
  }

  let output = "";
  let cursor = 0;
  const renderMatches = matches.slice(0, MAX_HIGHLIGHTS);
  renderMatches.forEach((match) => {
    if (match.start > cursor) output += escapeHtml(text.slice(cursor, match.start));
    output += `<mark class="severity-${match.rule.severity}" data-cat="${escapeHtml(match.rule.name[CURRENT_LANG])}">${escapeHtml(text.slice(match.start, match.end))}</mark>`;
    cursor = match.end;
  });
  if (cursor < text.length) output += escapeHtml(text.slice(cursor));
  preview.innerHTML = output;

  if (note) {
    note.textContent = matches.length > MAX_HIGHLIGHTS ? t("more_hits").replace("{count}", String(matches.length - MAX_HIGHLIGHTS)) : "";
  }
}

function buildSummaryText(matches, groups) {
  const matchedGroups = groups
    .filter((group) => group.matches.length > 0)
    .sort((a, b) => SEVERITY_ORDER[a.rule.severity] - SEVERITY_ORDER[b.rule.severity] || b.matches.length - a.matches.length);
  const stats = getSeverityStats(groups);
  const lines = [
    "Contract Cleaner",
    t("summary_disclaimer"),
    t("raw_not_included"),
    "",
    `${t("total_hits")}: ${matches.length}`,
    `${t("category_hits")}: ${matchedGroups.length}`,
    `${t("severity_high")}: ${stats.high.categories} categories / ${stats.high.hits} hits`,
    `${t("severity_medium")}: ${stats.medium.categories} categories / ${stats.medium.hits} hits`,
    `${t("severity_low")}: ${stats.low.categories} categories / ${stats.low.hits} hits`,
    "",
  ];

  if (!matchedGroups.length) {
    lines.push(t("no_match"));
  } else {
    matchedGroups.forEach((group) => {
      lines.push(`[${t(`severity_${group.rule.severity}`)}] ${group.rule.name[CURRENT_LANG]} (${group.matches.length})`);
      lines.push(`- ${group.rule.confirmationPoint[CURRENT_LANG]}`);
      const terms = Array.from(new Set(group.matches.map((match) => match.term))).slice(0, 12);
      lines.push(`- ${t("term_label")}: ${terms.join(", ")}`);
      lines.push("");
    });
  }
  return lines.join("\n").trim();
}

function buildQuestionsText(groups) {
  const matchedGroups = groups
    .filter((group) => group.matches.length > 0)
    .sort((a, b) => SEVERITY_ORDER[a.rule.severity] - SEVERITY_ORDER[b.rule.severity] || b.matches.length - a.matches.length);
  if (!matchedGroups.length) return "";
  const lines = [t("questions_header"), t("summary_disclaimer"), ""];

  matchedGroups.forEach((group) => {
    lines.push(`■ [${t(`severity_${group.rule.severity}`)}] ${group.rule.name[CURRENT_LANG]}`);
    group.rule.questionTemplates[CURRENT_LANG].forEach((item) => lines.push(`- ${item}`));
    lines.push("");
  });
  return lines.join("\n").trim();
}

function updateQuestionsPreview(groups) {
  const preview = document.getElementById("questionsPreview");
  if (preview) preview.textContent = buildQuestionsText(groups);
}

function renderAll() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;
  const text = normalize(textArea.value || "");
  const matches = text.trim() ? collectMatches(text) : [];
  const groups = groupByCategory(matches);
  updateCounters(matches, groups);
  updatePriorityCategories(groups);
  updateCategoryList(text, groups);
  updateHighlight(text, matches);
  updateQuestionsPreview(groups);
}

function clearInput() {
  const textArea = document.getElementById("contractText");
  if (textArea) textArea.value = "";
  renderAll();
}

function applyExample() {
  const textArea = document.getElementById("contractText");
  if (!textArea) return;
  textArea.value = `本契約に基づく損害賠償責任は、当社の責任の上限を月額料金の6か月分とします。\n\n当社は理由の如何を問わず本契約を解除でき、ユーザーは中途解約の場合に違約金を支払うものとします。\n\n成果物の知的財産権は当社に帰属し、利用許諾の範囲は当社が定めるものとします。\n\n本サービスの内容は当社の裁量により予告なく変更できるものとします。\n\n本契約は自動更新され、更新拒絶は期間満了日の30日前までに行うものとします。\n\n個人情報は委託先に提供される場合があります。検収後7日以内に異議がない場合はみなし承認とします。\n\n準拠法は日本法とし、東京地方裁判所を第一審の専属的合意管轄とします。`;
  renderAll();
}

async function copyText(text) {
  if (!text) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      // Fall through to legacy copy path.
    }
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand("copy");
  } catch (error) {
    ok = false;
  }
  textarea.remove();
  return ok;
}

function showToast(message) {
  const toast = document.getElementById("copyToast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 1800);
}

function analyzeCurrentText() {
  const textArea = document.getElementById("contractText");
  const text = normalize(textArea?.value || "");
  const matches = text.trim() ? collectMatches(text) : [];
  return { matches, groups: groupByCategory(matches) };
}

async function handleCopySummary() {
  const { matches, groups } = analyzeCurrentText();
  const summary = buildSummaryText(matches, groups);
  if (!summary.trim()) return showToast(t("toast_empty"));
  const ok = await copyText(summary);
  showToast(ok ? t("toast_copy") : t("toast_copy_failed"));
}

async function handleCopyQuestions() {
  const { groups } = analyzeCurrentText();
  const questions = buildQuestionsText(groups);
  if (!questions.trim()) return showToast(t("toast_empty"));
  const ok = await copyText(questions);
  showToast(ok ? t("toast_copy") : t("toast_copy_failed"));
}

function handleDownload() {
  const { matches, groups } = analyzeCurrentText();
  const output = `${buildSummaryText(matches, groups)}\n\n${buildQuestionsText(groups)}`.trim();
  if (!output) return showToast(t("toast_empty"));
  const blob = new Blob([output], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `contract-cleaner-${new Date().toISOString().slice(0, 10)}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showToast(t("toast_download"));
}

function bindEvents() {
  document.querySelectorAll(".lang-btn").forEach((btn) => btn.addEventListener("click", () => setLang(btn.dataset.lang)));
  document.getElementById("analyzeBtn")?.addEventListener("click", renderAll);
  document.getElementById("clearBtn")?.addEventListener("click", clearInput);
  document.getElementById("exampleBtn")?.addEventListener("click", applyExample);
  document.getElementById("copySummaryBtn")?.addEventListener("click", handleCopySummary);
  document.getElementById("copyQuestionsBtn")?.addEventListener("click", handleCopyQuestions);
  document.getElementById("downloadBtn")?.addEventListener("click", handleDownload);
  document.getElementById("onlyMatchedToggle")?.addEventListener("change", renderAll);
  document.getElementById("contractText")?.addEventListener("input", () => {
    const textarea = document.getElementById("contractText");
    if (!textarea.value.trim()) renderAll();
  });
}

function init() {
  const nav = (navigator.language || "ja").toLowerCase();
  CURRENT_LANG = nav.startsWith("en") ? "en" : "ja";
  bindEvents();
  setLang(CURRENT_LANG);
}

document.addEventListener("DOMContentLoaded", init);
