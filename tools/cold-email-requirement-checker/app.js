/* ================================
 * NicheWorks tool template app.js
 * - JP/EN toggle (data-i18n)
 * - Utilities: copy, downloadText, debounce
 * ================================ */

(() => {
  "use strict";

  // ----------------------------
  // i18n (required)
  // ----------------------------
  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
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

  // ----------------------------
  // Utilities
  // ----------------------------
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      // Fallback
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        return true;
      } catch (e) {
        return false;
      } finally {
        document.body.removeChild(ta);
      }
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 500);
  };

  const debounce = (fn, ms = 150) => {
    let t = null;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  };

  // Expose minimal helpers for tool scripts (Codex can reuse)
  window.NW = {
    applyLang,
    copyToClipboard,
    downloadText,
    debounce,
    hasPro: () => {
      try { return !!localStorage.getItem("nw_pro_key"); } catch (_) { return false; }
    }
  };

  // ----------------------------
  // Boot
  // ----------------------------
  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    // Tool-specific init should be appended below by Codex per tool.
    // Example:
    // initTool();
  });
})();

// ----------------------------
// Tool: Cold Email Requirement Checker
// ----------------------------
const initColdEmailChecker = () => {
  const root = document.getElementById("toolRoot");
  if (!root) return;

  root.innerHTML = `
    <div class="field">
      <label class="label" for="emailSubject">
        <span data-i18n="ja">件名（任意）</span>
        <span data-i18n="en" style="display:none;">Subject (optional)</span>
      </label>
      <input id="emailSubject" class="input" type="text" placeholder="Subject line" />
    </div>

    <div class="field">
      <label class="label" for="emailText">
        <span data-i18n="ja">メール本文</span>
        <span data-i18n="en" style="display:none;">Email body</span>
      </label>
      <textarea id="emailText" class="textarea" placeholder="Hi [Name], ..."></textarea>
    </div>

    <div class="field">
      <div class="label">
        <span data-i18n="ja">例文プリセット</span>
        <span data-i18n="en" style="display:none;">Example presets</span>
      </div>
      <div class="row preset-row">
        <button class="btn preset-btn" type="button" data-preset="sales">
          <span data-i18n="ja">営業アウトリーチ</span>
          <span data-i18n="en" style="display:none;">Sales outreach</span>
        </button>
        <button class="btn preset-btn" type="button" data-preset="partner">
          <span data-i18n="ja">提携</span>
          <span data-i18n="en" style="display:none;">Partnership</span>
        </button>
        <button class="btn preset-btn" type="button" data-preset="job">
          <span data-i18n="ja">求人問い合わせ</span>
          <span data-i18n="en" style="display:none;">Job inquiry</span>
        </button>
      </div>
    </div>

    <div class="row">
      <button id="checkBtn" class="btn primary" type="button">
        <span data-i18n="ja">チェック</span>
        <span data-i18n="en" style="display:none;">Check</span>
      </button>
      <button id="clearBtn" class="btn danger" type="button">
        <span data-i18n="ja">クリア</span>
        <span data-i18n="en" style="display:none;">Clear</span>
      </button>
      <button id="copyBtn" class="btn" type="button">
        <span data-i18n="ja">改善点をコピー</span>
        <span data-i18n="en" style="display:none;">Copy suggestions</span>
      </button>
    </div>

    <hr class="hr" />

    <div class="result-grid">
      <div class="result-card">
        <div class="result-title">
          <span data-i18n="ja">総合ステータス</span>
          <span data-i18n="en" style="display:none;">Overall status</span>
        </div>
        <div id="overallStatus" class="status-badge">PASS</div>
      </div>
      <div class="result-card">
        <div class="result-title">
          <span data-i18n="ja">スコア</span>
          <span data-i18n="en" style="display:none;">Score</span>
        </div>
        <div class="score-line"><span id="scoreValue">100</span> / 100</div>
      </div>
    </div>

    <div class="field">
      <div class="label">
        <span data-i18n="ja">チェックリスト</span>
        <span data-i18n="en" style="display:none;">Checklist</span>
      </div>
      <div id="checklist" class="checklist"></div>
    </div>

    <div class="field">
      <div class="label">
        <span data-i18n="ja">不足 / 改善</span>
        <span data-i18n="en" style="display:none;">Missing / Improve</span>
      </div>
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
    sales: {
      subject: "Quick idea to reduce onboarding drop-off",
      body: [
        "Hi [Name],",
        "",
        "I’m [Your Name] at [Company]. I noticed your team is hiring for growth and saw the recent launch of [Product].",
        "Because onboarding is a common drop-off point, I wanted to reach out with a brief idea that may help.",
        "",
        "Would you be open to a 15-minute call next week to share a quick benchmark and examples?",
        "",
        "Best,",
        "[Your Name]",
        "[Title] | [Company]",
        "[Email] | [Phone]"
      ].join("\n")
    },
    partner: {
      subject: "Partnership idea for [Company]",
      body: [
        "Hello [Name],",
        "",
        "My name is [Your Name], and I lead partnerships at [Company]. I noticed your team supports [Audience] and thought our tools could be complementary.",
        "I'm reaching out because we recently launched [Product], and I believe it could add value for your customers.",
        "",
        "Could we schedule a short chat to explore a partnership fit?",
        "",
        "Regards,",
        "[Your Name]",
        "[Company]"
      ].join("\n")
    },
    job: {
      subject: "Interest in the [Role] role",
      body: [
        "Dear [Name],",
        "",
        "I’m [Your Name]. I saw the [Role] opening at [Company] and wanted to introduce myself.",
        "Because I’ve spent the last [X years] working on [Relevant Area], I believe I could contribute to your team.",
        "",
        "Are you available for a brief call to discuss the role and team needs?",
        "",
        "Thank you,",
        "[Your Name]",
        "[LinkedIn or Portfolio]"
      ].join("\n")
    }
  };

  const spamPhrases = [
    "guarantee",
    "risk-free",
    "act now",
    "limited time",
    "free money",
    "100%",
    "no obligation"
  ];

  const getWordCount = (text) => {
    const words = text.trim().split(/\s+/).filter(Boolean);
    return words.length;
  };

  const hasGreeting = (text) => {
    const head = text.trim().split("\n")[0] || "";
    return /^(hi|hello|dear|hey|good (morning|afternoon|evening)|こんにちは|はじめまして)/i.test(head.trim());
  };

  const hasIntro = (text) => /i'?m\b|i am\b|my name\b|this is\b|私は|私の名前|当社|弊社/i.test(text);

  const hasRecipientMention = (text, subject) => {
    const subjectHit = /[A-Z][A-Za-z]{2,}/.test(subject) || /貴社|御社|ご担当/.test(subject);
    const bodyHit = /your (company|team)|at [A-Z][A-Za-z]+/i.test(text)
      || /[A-Z][A-Za-z]+ (Inc|Corp|LLC|Ltd|Co|Company|Group)/.test(text)
      || /貴社|御社|ご担当|貴チーム/.test(text);
    return subjectHit || bodyHit;
  };

  const hasReason = (text) => /because|noticed|saw|reaching out|interested in|reason|inquiry|ご連絡|理由|拝見|見て|興味/i.test(text);

  const hasCTA = (text) => /would you be open to|can we|could we|are you available|schedule|call|meeting|chat|discuss|お時間|打ち合わせ|ご都合|ご相談/i.test(text);

  const hasSignature = (text) => {
    const lines = text.trim().split("\n").filter((line) => line.trim().length);
    const tail = lines.slice(-6);
    const hasValediction = tail.some((line) => /(best|regards|sincerely|thank you|thanks|よろしく|敬具|草々|best regards|kind regards)/i.test(line));
    const hasContact = tail.some((line) => /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(line) || /\b\d{2,}[-\s]?\d{2,}[-\s]?\d{3,}\b/.test(line));
    const hasNameLine = tail.some((line) => /^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?$/.test(line.trim()) || /株式会社|有限会社|Inc|Corp|LLC|Ltd/.test(line));
    return hasValediction || hasContact || hasNameLine;
  };

  const getSpamHits = (text) => spamPhrases.filter((phrase) => text.toLowerCase().includes(phrase));

  const countLinks = (text) => {
    const matches = text.match(/https?:\/\/\S+|www\.\S+/gi);
    return matches ? matches.length : 0;
  };

  const rules = [
    {
      key: "length",
      points: 10,
      label: { ja: "長さ（80–220 words）", en: "Length (80–220 words)" },
      hint: { ja: "短すぎ/長すぎは警告", en: "Warn if too short/long" },
      suggestion: { ja: "80〜220語に収めるよう調整しましょう。", en: "Aim for 80–220 words." },
      check: (text) => {
        const count = getWordCount(text);
        return count >= 80 && count <= 220;
      }
    },
    {
      key: "greeting",
      points: 10,
      label: { ja: "挨拶", en: "Greeting" },
      hint: { ja: "Hi/Hello/Dear など", en: "Include Hi/Hello/Dear" },
      suggestion: { ja: "冒頭に挨拶を入れましょう。", en: "Add a greeting at the start." },
      check: hasGreeting
    },
    {
      key: "intro",
      points: 10,
      label: { ja: "自己紹介", en: "Self-introduction" },
      hint: { ja: "I'm / my name など", en: "I'm / my name etc." },
      suggestion: { ja: "一文で自己紹介を追加しましょう。", en: "Add a short self-intro." },
      check: hasIntro
    },
    {
      key: "recipient",
      points: 10,
      label: { ja: "相手/会社の言及", en: "Recipient/company mention" },
      hint: { ja: "会社名/チーム名を含める", en: "Mention company/team" },
      suggestion: { ja: "相手企業や担当の言及を追加しましょう。", en: "Mention the recipient or company." },
      check: (text, subject) => hasRecipientMention(text, subject)
    },
    {
      key: "reason",
      points: 10,
      label: { ja: "連絡理由", en: "Reason for outreach" },
      hint: { ja: "because / noticed など", en: "Because / noticed etc." },
      suggestion: { ja: "連絡理由を一文で入れましょう。", en: "Add a clear reason for reaching out." },
      check: hasReason
    },
    {
      key: "cta",
      points: 15,
      label: { ja: "CTA（次の行動）", en: "CTA (next action)" },
      hint: { ja: "call / meeting など", en: "call / meeting etc." },
      suggestion: { ja: "具体的な依頼（打ち合わせ等）を入れましょう。", en: "Add a concrete ask or CTA." },
      check: hasCTA
    },
    {
      key: "signature",
      points: 10,
      label: { ja: "署名", en: "Signature block" },
      hint: { ja: "Best/Regards など", en: "Best/Regards etc." },
      suggestion: { ja: "末尾に署名（名前・連絡先）を入れましょう。", en: "Add a signature with name/contact." },
      check: hasSignature
    },
    {
      key: "spam",
      points: 15,
      label: { ja: "スパム語句", en: "Spammy phrases" },
      hint: { ja: "guarantee / risk-free など", en: "guarantee / risk-free etc." },
      suggestion: { ja: "スパムっぽい表現は削除しましょう。", en: "Remove spammy phrases." },
      check: (text) => getSpamHits(text).length === 0
    },
    {
      key: "links",
      points: 10,
      label: { ja: "リンク数", en: "Too many links" },
      hint: { ja: "URLが2件以上で警告", en: "Warn if URLs ≥ 2" },
      suggestion: { ja: "リンクは1件までに抑えましょう。", en: "Keep links to 1 or fewer." },
      check: (text) => countLinks(text) < 2
    }
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
    chip.textContent = passed ? "PASS" : "FAIL";
    item.append(label, chip, hint);
    return item;
  };

  const renderSuggestions = (items) => {
    suggestions.innerHTML = "";
    if (!items.length) {
      const li = document.createElement("li");
      li.textContent = t("不足項目は見当たりません。", "No missing items detected.");
      suggestions.appendChild(li);
      return;
    }
    items.forEach((text) => {
      const li = document.createElement("li");
      li.textContent = text;
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
        suggestionItems.push(t(rule.suggestion.ja, rule.suggestion.en));
      }
      checklist.appendChild(renderChecklistItem(rule, passed));
    });

    if (score < 0) score = 0;
    overallStatus.textContent = hasWarn ? "WARN" : "PASS";
    overallStatus.classList.toggle("warn", hasWarn);
    overallStatus.classList.toggle("pass", !hasWarn);
    scoreValue.textContent = String(score);
    renderSuggestions(suggestionItems);
  };

  const debouncedCheck = window.NW.debounce(runCheck, 200);

  checkBtn.addEventListener("click", runCheck);
  clearBtn.addEventListener("click", () => {
    emailSubject.value = "";
    emailText.value = "";
    runCheck();
  });
  copyBtn.addEventListener("click", async () => {
    const items = Array.from(suggestions.querySelectorAll("li")).map((li) => `- ${li.textContent}`).join("\n");
    const ok = await window.NW.copyToClipboard(items);
    if (!ok) alert("Copy failed");
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
