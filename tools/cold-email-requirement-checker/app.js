(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  const showToast = (message) => {
    let toast = document.getElementById("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      try {
        return document.execCommand("copy");
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  window.NW = { applyLang, copyToClipboard, debounce, showToast };

  document.addEventListener("DOMContentLoaded", initLang);
})();

const initColdEmailChecker = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="field">
      <label class="label" for="emailSubject">
        <span data-i18n="ja">件名（任意）</span>
        <span data-i18n="en" style="display:none;">Subject (optional)</span>
      </label>
      <input id="emailSubject" class="input" type="text" placeholder="例：貴社サービスを拝見してのご相談" />
    </div>

    <div class="field">
      <label class="label" for="emailText">
        <span data-i18n="ja">メール本文</span>
        <span data-i18n="en" style="display:none;">Email body</span>
      </label>
      <textarea id="emailText" class="textarea" placeholder="お世話になっております。突然のご連絡失礼いたします。..."></textarea>
    </div>

    <div class="field">
      <div class="label">
        <span data-i18n="ja">例文プリセット</span>
        <span data-i18n="en" style="display:none;">Example presets</span>
      </div>
      <div class="row preset-row">
        <button class="btn preset-btn" type="button" data-preset="jaSales"><span data-i18n="ja">日本語営業</span><span data-i18n="en" style="display:none;">JP sales</span></button>
        <button class="btn preset-btn" type="button" data-preset="jaPartner"><span data-i18n="ja">日本語提携</span><span data-i18n="en" style="display:none;">JP partnership</span></button>
        <button class="btn preset-btn" type="button" data-preset="jaRecruit"><span data-i18n="ja">日本語採用</span><span data-i18n="en" style="display:none;">JP recruiting</span></button>
        <button class="btn preset-btn" type="button" data-preset="enSales"><span data-i18n="ja">英語営業</span><span data-i18n="en" style="display:none;">EN sales</span></button>
        <button class="btn preset-btn" type="button" data-preset="enPartner"><span data-i18n="ja">英語提携</span><span data-i18n="en" style="display:none;">EN partnership</span></button>
        <button class="btn preset-btn" type="button" data-preset="enRecruit"><span data-i18n="ja">英語求人</span><span data-i18n="en" style="display:none;">EN recruiting</span></button>
      </div>
    </div>

    <div class="row">
      <button id="checkBtn" class="btn primary" type="button"><span data-i18n="ja">チェック</span><span data-i18n="en" style="display:none;">Check</span></button>
      <button id="clearBtn" class="btn danger" type="button"><span data-i18n="ja">クリア</span><span data-i18n="en" style="display:none;">Clear</span></button>
      <button id="copyBtn" class="btn" type="button"><span data-i18n="ja">確認結果をコピー</span><span data-i18n="en" style="display:none;">Copy review</span></button>
    </div>

    <hr class="hr" />

    <div class="result-grid">
      <div class="result-card">
        <div class="result-title"><span data-i18n="ja">下書き確認ステータス</span><span data-i18n="en" style="display:none;">Draft review status</span></div>
        <div id="overallStatus" class="status-badge">Review needed</div>
      </div>
      <div class="result-card">
        <div class="result-title"><span data-i18n="ja">構成スコア</span><span data-i18n="en" style="display:none;">Structure score</span></div>
        <div class="score-line"><span id="scoreValue">0</span> / 100</div>
        <p class="score-note" data-i18n="ja">文章構成の目安です。合法性・到達率・返信率は保証しません。</p>
        <p class="score-note" data-i18n="en" style="display:none;">A structure signal only. It does not guarantee legality, deliverability, or reply rates.</p>
      </div>
    </div>

    <div class="field">
      <div class="label"><span data-i18n="ja">チェックリスト</span><span data-i18n="en" style="display:none;">Checklist</span></div>
      <div id="checklist" class="checklist"></div>
    </div>

    <div class="field">
      <div class="label"><span data-i18n="ja">確認・改善候補</span><span data-i18n="en" style="display:none;">Review suggestions</span></div>
      <ul id="suggestions" class="suggestions"></ul>
    </div>
  `;

  const emailSubject = root.querySelector("#emailSubject");
  const emailText = root.querySelector("#emailText");
  const overallStatus = root.querySelector("#overallStatus");
  const scoreValue = root.querySelector("#scoreValue");
  const checklist = root.querySelector("#checklist");
  const suggestions = root.querySelector("#suggestions");
  const checkBtn = root.querySelector("#checkBtn");
  const clearBtn = root.querySelector("#clearBtn");
  const copyBtn = root.querySelector("#copyBtn");
  const presetButtons = Array.from(root.querySelectorAll(".preset-btn"));

  const t = (jp, en) => (document.documentElement.lang === "ja" ? jp : en);

  const presets = {
    jaSales: {
      subject: "貴社サービスを拝見してのご相談",
      body: "お世話になっております。突然のご連絡失礼いたします。\n株式会社サンプルの山田と申します。\n\n貴社のサービス紹介記事を拝見し、法人向けの導入支援についてご相談できればと思い、ご連絡いたしました。弊社では中小企業向けに業務改善ツールを提供しており、貴社のお客様にも補完的な価値をご提供できる可能性があります。\n\n差し支えなければ、来週15分ほどお打ち合わせのお時間をいただけますでしょうか。不要な場合はその旨をご返信ください。\n\n株式会社サンプル\n山田太郎\nyamada@example.com\nhttps://example.com"
    },
    jaPartner: {
      subject: "提携の可能性についてのご相談",
      body: "お世話になっております。株式会社サンプルの山田と申します。\n\n貴社の事例ページを拝見し、弊社サービスとの提携余地があるのではないかと考え、ご連絡いたしました。弊社は店舗向けの予約管理支援を行っており、貴社の既存ソリューションと組み合わせることで、双方のお客様に追加価値を出せる可能性があります。\n\n一度、15分ほどオンラインで情報交換のお時間をいただけますでしょうか。不要な場合はご返信いただければ、以後のご連絡は控えます。\n\n株式会社サンプル\n山田太郎\nyamada@example.com\nhttps://example.com"
    },
    jaRecruit: {
      subject: "採用についてのお問い合わせ",
      body: "突然のご連絡失礼いたします。山田太郎と申します。\n\n貴社の採用ページを拝見し、プロダクト開発職に興味を持ちました。これまでWebサービスの改善、ユーザー調査、軽量なフロントエンド実装に携わってきました。\n\n現在募集されている職種について、応募前に業務内容やチーム体制を少し伺うことは可能でしょうか。ご都合のよい方法でご返信いただけますと幸いです。\n\n山田太郎\nyamada@example.com\nhttps://example.com/portfolio"
    },
    enSales: {
      subject: "Quick idea for [Company]",
      body: "Hi [Name],\n\nI’m [Your Name] at [Company]. I noticed your team recently launched [Product] and wanted to reach out with a relevant idea.\n\nWe help teams reduce onboarding drop-off, and I think there may be a practical fit for your current growth work.\n\nWould you be open to a 15-minute call next week to compare notes? If this is not relevant, please let me know and I will not follow up.\n\nBest,\n[Your Name]\n[Company]\n[Email]\nhttps://example.com"
    },
    enPartner: {
      subject: "Partnership idea for [Company]",
      body: "Hello [Name],\n\nMy name is [Your Name], and I work on partnerships at [Company]. I saw your work with [Audience] and thought our products could be complementary.\n\nWe recently launched [Product], which may help your customers with [Problem].\n\nCould we schedule a short chat to explore whether a partnership makes sense? If this is not relevant, feel free to reply and I will not follow up.\n\nRegards,\n[Your Name]\n[Company]\n[Email]"
    },
    enRecruit: {
      subject: "Interest in the [Role] role",
      body: "Dear [Name],\n\nI’m [Your Name]. I saw the [Role] opening at [Company] and wanted to introduce myself.\n\nI have worked on [Relevant Area] for [X years], and I believe I could contribute to your team’s current priorities.\n\nWould it be possible to ask a few questions about the role and team before applying?\n\nThank you,\n[Your Name]\n[Email]\n[LinkedIn or Portfolio]"
    }
  };

  const spamPhrases = [
    "guarantee", "risk-free", "act now", "limited time", "free money", "100%", "no obligation",
    "今すぐ", "無料で確実", "絶対", "必ず成果", "限定", "リスクなし", "儲かる", "保証"
  ];

  const getWordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
  const isMostlyJapanese = (text) => /[ぁ-んァ-ン一-龥]/.test(text);

  const hasGreeting = (text) => {
    const head = text.trim().split("\n").slice(0, 3).join(" ");
    return /^(hi|hello|dear|hey|good (morning|afternoon|evening))/i.test(head.trim())
      || /こんにちは|はじめまして|お世話になっております|突然のご連絡失礼いたします|ご担当者様/.test(head);
  };

  const hasIntro = (text) => /i'?m\b|i am\b|my name\b|this is\b|at \[?company\]?|私は|私の名前|と申します|株式会社|有限会社|当社|弊社/i.test(text);
  const hasRecipientMention = (text, subject) => /your (company|team|product|service)|saw your|noticed your|at [A-Z][A-Za-z]+|貴社|御社|ご担当者様|サービス|記事を拝見|採用ページ|事例ページ|紹介記事/.test(`${subject}\n${text}`);
  const hasReason = (text) => /because|noticed|saw|reaching out|interested in|reason|inquiry|ご連絡|理由|拝見|興味を持ち|ご提案|ご相談|可能性|問い合わせ/i.test(text);
  const hasCTA = (text) => /would you be open to|can we|could we|are you available|schedule|call|meeting|chat|discuss|15-minute|お時間|お打ち合わせ|ご都合|ご相談|ご返信|15分|オンライン/i.test(text);
  const hasOptOut = (text) => /unsubscribe|opt out|not relevant|do not follow up|please let me know|不要|配信停止|以後のご連絡|ご返信ください|返信不要|控えます/i.test(text);
  const hasSenderInfo = (text) => /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text) && /(company|inc|corp|llc|ltd|株式会社|有限会社|氏名|山田|太郎|担当|部|課|http|https)/i.test(text);
  const hasSignature = (text) => {
    const tail = text.trim().split("\n").filter((line) => line.trim()).slice(-8).join("\n");
    return /(best|regards|sincerely|thank you|thanks|よろしく|敬具|株式会社|有限会社|氏名|メール|Email|LinkedIn|Portfolio)/i.test(tail)
      || /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(tail)
      || /https?:\/\//i.test(tail);
  };
  const hasMisleadingSubject = (subject) => /(re:|fw:|fwd:|至急|重要|請求|警告|最終通知)/i.test(subject.trim());
  const hasAttachmentRisk = (text) => /添付|attachment|attached|ファイル|資料/.test(text) && !/添付.*(内容|資料|PDF|ご確認)|attached.*(file|pdf|document|proposal)/i.test(text);
  const hasSensitiveData = (text) => /(password|api[_ -]?key|secret|token|private key|パスワード|暗証番号|APIキー|秘密鍵|個人番号|マイナンバー)/i.test(text);
  const getSpamHits = (text) => spamPhrases.filter((phrase) => text.toLowerCase().includes(phrase.toLowerCase()));
  const countLinks = (text) => (text.match(/https?:\/\/\S+|www\.\S+/gi) || []).length;

  const lengthCheck = (text) => {
    if (!text.trim()) return false;
    if (isMostlyJapanese(text)) {
      const chars = text.replace(/\s/g, "").length;
      return chars >= 180 && chars <= 900;
    }
    const count = getWordCount(text);
    return count >= 70 && count <= 240;
  };

  const rules = [
    { key: "length", points: 8, label: { ja: "長さ", en: "Length" }, hint: { ja: "短すぎ/長すぎないか", en: "Avoid too short/long drafts" }, suggestion: { ja: "本文量を調整してください。日本語なら約180〜900字、英語なら約70〜240語が目安です。", en: "Adjust draft length. Aim for about 70–240 words in English, or a comparable concise draft." }, example: { ja: "要点を3〜5段落に分け、相手言及・理由・依頼・署名を入れます。", en: "Use 3–5 short paragraphs covering relevance, reason, ask, and signature." }, check: lengthCheck },
    { key: "greeting", points: 8, label: { ja: "挨拶", en: "Greeting" }, hint: { ja: "日本語/英語の自然な冒頭", en: "Natural opening" }, suggestion: { ja: "冒頭に自然な挨拶を入れてください。", en: "Add a natural greeting at the start." }, example: { ja: "お世話になっております。突然のご連絡失礼いたします。", en: "Hi [Name]," }, check: hasGreeting },
    { key: "intro", points: 8, label: { ja: "自己紹介", en: "Self-introduction" }, hint: { ja: "誰からの連絡か", en: "Who is contacting them" }, suggestion: { ja: "一文で会社名・氏名・立場を入れてください。", en: "Add a short self-introduction with name/company/role." }, example: { ja: "株式会社〇〇の山田と申します。", en: "I’m [Name] at [Company]." }, check: hasIntro },
    { key: "recipient", points: 8, label: { ja: "相手への言及", en: "Recipient relevance" }, hint: { ja: "貴社/御社/拝見しました等", en: "Mention company/team context" }, suggestion: { ja: "相手企業・サービス・記事などを見た理由を入れてください。", en: "Mention the recipient, company, product, or relevant context." }, example: { ja: "貴社の事例ページを拝見し、関連性があると考えました。", en: "I noticed your recent launch of [Product]." }, check: hasRecipientMention },
    { key: "reason", points: 10, label: { ja: "連絡理由", en: "Reason for outreach" }, hint: { ja: "なぜ送ったか", en: "Why you are reaching out" }, suggestion: { ja: "連絡理由を一文で明確にしてください。", en: "Add a clear reason for reaching out." }, example: { ja: "〇〇の課題に対して、補完的な提案ができると考えました。", en: "I’m reaching out because this may help with [Problem]." }, check: hasReason },
    { key: "cta", points: 12, label: { ja: "CTA（次の行動）", en: "CTA / next action" }, hint: { ja: "返信/打ち合わせ/15分など", en: "Reply, meeting, 15 minutes, etc." }, suggestion: { ja: "相手に求める次の行動を具体的にしてください。", en: "Make the next action concrete." }, example: { ja: "15分ほどお話しするお時間をいただけますでしょうか。", en: "Would you be open to a 15-minute call next week?" }, check: hasCTA },
    { key: "sender", points: 10, label: { ja: "送信者情報", en: "Sender information" }, hint: { ja: "会社名・氏名・メール・URLなど", en: "Company, name, email, URL, etc." }, suggestion: { ja: "送信者情報を明確にしてください。", en: "Add clear sender information." }, example: { ja: "会社名、氏名、メールアドレス、WebサイトURLを署名に入れます。", en: "Include company, name, email, and a website or profile link." }, check: hasSenderInfo },
    { key: "signature", points: 8, label: { ja: "署名", en: "Signature" }, hint: { ja: "末尾の連絡先", en: "Contact block at the end" }, suggestion: { ja: "末尾に署名を追加してください。", en: "Add a signature block." }, example: { ja: "株式会社〇〇\n氏名\nメール\nURL", en: "[Name]\n[Company]\n[Email]\n[URL]" }, check: hasSignature },
    { key: "optout", points: 8, label: { ja: "配信停止/不要時導線", en: "Opt-out / not relevant path" }, hint: { ja: "不要な場合の導線", en: "Give a way to decline" }, suggestion: { ja: "不要な場合の返信・配信停止などの導線を検討してください。", en: "Add a clear way to decline or opt out where appropriate." }, example: { ja: "不要な場合はその旨をご返信ください。以後のご連絡は控えます。", en: "If this is not relevant, let me know and I will not follow up." }, check: hasOptOut },
    { key: "spam", points: 10, label: { ja: "過度な煽り表現", en: "Overly promotional wording" }, hint: { ja: "絶対/保証/儲かる等", en: "Guarantee/risk-free/etc." }, suggestion: { ja: "過度な煽り・保証表現を削ってください。", en: "Remove exaggerated or spam-like phrases." }, example: { ja: "「必ず成果」ではなく「可能性があります」などに弱めます。", en: "Replace guarantees with measured wording." }, check: (text) => getSpamHits(text).length === 0 },
    { key: "links", points: 8, label: { ja: "リンク数", en: "Link count" }, hint: { ja: "多すぎるURLを避ける", en: "Avoid too many URLs" }, suggestion: { ja: "リンクは必要最小限にしてください。", en: "Keep links to the minimum needed." }, example: { ja: "最初の連絡では会社URLまたは資料URLを1件程度に抑えます。", en: "Use one relevant company or reference link if needed." }, check: (text) => countLinks(text) < 2 },
    { key: "subject", points: 6, label: { ja: "件名の誤認誘導", en: "Misleading subject" }, hint: { ja: "Re:/至急/重要などに注意", en: "Avoid fake urgency or fake replies" }, suggestion: { ja: "誤認を誘う件名表現を避けてください。", en: "Avoid subject lines that imply false urgency or an existing thread." }, example: { ja: "「至急」ではなく「〇〇についてのご相談」などにします。", en: "Use a plain subject such as “Question about [topic]”." }, check: (_text, subject) => !hasMisleadingSubject(subject) },
    { key: "attachment", points: 6, label: { ja: "添付ファイル注意", en: "Attachment clarity" }, hint: { ja: "添付の説明不足に注意", en: "Explain any attachment" }, suggestion: { ja: "添付ファイルがある場合は内容と安全性が分かる説明を入れてください。", en: "If you mention an attachment, explain what it is." }, example: { ja: "添付資料は1枚のPDFです。概要のみ記載しています。", en: "I attached a one-page PDF overview." }, check: (text) => !hasAttachmentRisk(text) },
    { key: "sensitive", points: 8, label: { ja: "機密/個人情報", en: "Sensitive information" }, hint: { ja: "秘密情報を含めすぎない", en: "Avoid secrets or sensitive data" }, suggestion: { ja: "パスワード、APIキー、個人番号などを本文に含めないでください。", en: "Do not include passwords, API keys, private keys, or sensitive personal data." }, example: { ja: "詳細情報は初回メールではなく、安全な別経路で共有します。", en: "Share sensitive details through a secure separate channel." }, check: (text) => !hasSensitiveData(text) }
  ];

  const renderChecklistItem = (rule, passed) => {
    const item = document.createElement("div");
    item.className = "checklist-item";
    const label = document.createElement("div");
    label.className = "checklist-label";
    label.textContent = t(rule.label.ja, rule.label.en);
    const hint = document.createElement("div");
    hint.className = "checklist-hint";
    hint.textContent = t(rule.hint.ja, rule.hint.en);
    const chip = document.createElement("span");
    chip.className = `chip ${passed ? "pass" : "fail"}`;
    chip.textContent = passed ? "OK" : t("確認", "Review");
    item.append(label, chip, hint);
    return item;
  };

  const renderSuggestions = (items) => {
    suggestions.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = t("構成上の大きな不足は見当たりません。送信前に法令・配信停止・送信者情報・相手との関係を別途確認してください。", "No major structure gaps detected. Before sending, separately check laws, opt-out wording, sender details, and relationship context.");
      suggestions.appendChild(li);
      return;
    }
    items.forEach((item) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${item.title}</strong><br><span>${item.reason}</span><br><em>${item.example}</em>`;
      suggestions.appendChild(li);
    });
  };

  const runCheck = () => {
    const subject = emailSubject.value.trim();
    const text = emailText.value.trim();

    let score = 100;
    let hasWarn = false;
    const suggestionItems = [];
    checklist.innerHTML = "";

    rules.forEach((rule) => {
      const passed = rule.check(text, subject);
      if (!passed) {
        hasWarn = true;
        score -= rule.points;
        suggestionItems.push({
          title: `${t("Review needed", "Review needed")}: ${t(rule.label.ja, rule.label.en)}`,
          reason: t(rule.suggestion.ja, rule.suggestion.en),
          example: `${t("修正例", "Example")}: ${t(rule.example.ja, rule.example.en)}`
        });
      }
      checklist.appendChild(renderChecklistItem(rule, passed));
    });

    score = Math.max(0, score);
    overallStatus.textContent = hasWarn ? "Review needed" : "Looks complete";
    overallStatus.classList.toggle("warn", hasWarn);
    overallStatus.classList.toggle("pass", !hasWarn);
    scoreValue.textContent = String(score);
    renderSuggestions(suggestionItems);
  };

  const buildCopyText = () => {
    const items = Array.from(suggestions.querySelectorAll("li"))
      .map((li) => li.textContent.replace(/\s+/g, " ").trim())
      .filter(Boolean);
    const disclaimer = t(
      "※この結果は文章構成の簡易チェックです。法令適合性、同意要件、配信停止表示、送信者情報の正確性、到達率・返信率を保証しません。",
      "Note: This is a simple structure checklist. It does not guarantee legal compliance, consent requirements, opt-out wording, sender identity accuracy, deliverability, or reply rates."
    );
    return [
      t("Cold Email Requirement Checker 確認結果", "Cold Email Requirement Checker review"),
      `${t("下書き確認ステータス", "Draft review status")}: ${overallStatus.textContent}`,
      `${t("構成スコア", "Structure score")}: ${scoreValue.textContent}/100`,
      "",
      ...items.map((item) => `- ${item}`),
      "",
      disclaimer
    ].join("\n");
  };

  const debouncedCheck = window.NW.debounce(runCheck, 200);

  checkBtn.addEventListener("click", runCheck);
  clearBtn.addEventListener("click", () => {
    emailSubject.value = "";
    emailText.value = "";
    runCheck();
  });
  copyBtn.addEventListener("click", async () => {
    const text = buildCopyText();
    const ok = await window.NW.copyToClipboard(text);
    window.NW.showToast(ok ? t("確認結果をコピーしました。", "Review copied.") : t("コピーに失敗しました。", "Copy failed."));
  });

  presetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = presets[btn.dataset.preset];
      if (!preset) return;
      emailSubject.value = preset.subject;
      emailText.value = preset.body;
      runCheck();
    });
  });

  emailSubject.addEventListener("input", debouncedCheck);
  emailText.addEventListener("input", debouncedCheck);

  runCheck();
  window.NW.applyLang(document.documentElement.lang || "ja");
};

document.addEventListener("DOMContentLoaded", initColdEmailChecker);
