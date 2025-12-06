// === UI 初期制御（Codexが実装を追加する） ===

document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("generate-btn");
  const purpose = document.getElementById("purpose");
  const culture = document.getElementById("culture");
  const formality = document.getElementById("formality");

  // 必須項目が揃ったらボタンを有効化
  function validate() {
    btn.disabled = !(purpose.value && culture.value && formality.value);
  }

  purpose.onchange = validate;
  culture.onchange = validate;
  formality.onchange = validate;

  // 生成ボタン押下処理（後で Codex が実装）
  btn.addEventListener("click", () => {
    console.log("Generate clicked (Codex will implement)");
  });
});

// === 構文辞書（固定） ===
const STRUCTURE = {
  "cultures": {
    "japan": {
      "opening": {
        "high": "拝啓",
        "medium": "いつもお世話になっております。",
        "casual": "こんにちは。"
      },
      "closing": {
        "high": "敬具",
        "medium": "よろしくお願いいたします。",
        "casual": "では、また。"
      }
    },
    "english": {
      "opening": {
        "high": "Dear Sir or Madam,",
        "medium": "Hello,",
        "casual": "Hi,"
      },
      "closing": {
        "high": "Sincerely,",
        "medium": "Best regards,",
        "casual": "Cheers,"
      }
    },
    "eu": {
      "opening": {
        "high": "To whom it may concern,",
        "medium": "Hello,",
        "casual": "Hi,"
      },
      "closing": {
        "high": "Yours faithfully,",
        "medium": "Kind regards,",
        "casual": "Regards,"
      }
    }
  },

  "purposes": {
    "wedding": {
      "body_template": "結婚に関する主要メッセージを述べる（祝福・参加/欠席・新生活への言及など）。",
      "keywords_influence": true
    },
    "funeral": {
      "body_template": "弔意・お悔やみの言葉・励ましの気持ちなどを述べる。",
      "keywords_influence": true
    },
    "thank_you": {
      "body_template": "具体的に何に対する感謝かを述べ、相手への敬意や気遣いを含める。",
      "keywords_influence": true
    },
    "apology": {
      "body_template": "謝罪の理由・責任の明確化・改善策・再発防止への姿勢を示す。",
      "keywords_influence": true
    },
    "greeting_seasonal": {
      "body_template": "季節の挨拶と近況、相手への気遣いを述べる。",
      "keywords_influence": false
    },
    "greeting_business": {
      "body_template": "ビジネス関係の礼儀正しい挨拶（取引開始、担当変更、節目の挨拶など）。",
      "keywords_influence": true
    },
    "casual_message": {
      "body_template": "日常的な軽い連絡や近況、フレンドリーなメッセージを述べる。",
      "keywords_influence": false
    }
  }
};

const RELATIONSHIP_PHRASES = {
  friend: "いつも気軽に話せる友人として感謝しています。",
  family: "家族としての温かい支えに心から感謝しています。",
  boss: "日頃よりご指導ご鞭撻を賜り、誠にありがとうございます。",
  client: "平素より格別のご高配を賜り、心より御礼申し上げます。"
};

const BODY_ENDINGS = {
  high: [
    "何卒ご理解賜りますようお願い申し上げます。",
    "引き続きご高配のほどよろしくお願い申し上げます。"
  ],
  medium: [
    "今後ともよろしくお願いいたします。",
    "引き続きご連絡を取り合えれば幸いです。"
  ],
  casual: [
    "また気軽にやり取りできると嬉しいです。",
    "これからもよろしくね。"
  ]
};

const BODY_LEAD_INS = {
  high: ["このたびは", "早速ながら"],
  medium: ["今回は", "改めて"],
  casual: ["実は", "ちょっとだけ"]
};

const LANG_CONTENT = {
  jp: {
    title: "文面ジェネレーター",
    subtitle: "用途・文化圏・フォーマル度から最適な文章を自動生成",
    labels: {
      purpose: "用途（Purpose）",
      culture: "文化圏（Culture）",
      formality: "フォーマル度（Formality）",
      relationship: "相手との関係（任意）",
      keywords: "キーワード（任意）"
    },
    placeholders: {
      keywords: "例：欠席連絡、感謝、遅延の謝罪など"
    },
    resultTitle: "生成された文面",
    buttons: {
      generate: "文面を生成する",
      copy: "コピー",
      regenerate: "再生成"
    },
    selectTexts: {
      purpose: ["選択してください", "結婚", "弔事", "お礼", "お詫び", "季節の挨拶", "ビジネス挨拶", "カジュアルメッセージ"],
      culture: ["選択してください", "日本", "英語圏", "EU"],
      formality: ["選択してください", "高", "中", "低"],
      relationship: ["指定なし", "友人", "家族", "上司", "取引先"]
    },
    copySuccess: "クリップボードへコピーしました"
  },
  en: {
    title: "Message Generator",
    subtitle: "Create messages from purpose, culture, and formality",
    labels: {
      purpose: "Purpose",
      culture: "Culture",
      formality: "Formality",
      relationship: "Relationship (optional)",
      keywords: "Keywords (optional)"
    },
    placeholders: {
      keywords: "e.g. RSVP, gratitude, delay apology"
    },
    resultTitle: "Generated Message",
    buttons: {
      generate: "Generate",
      copy: "Copy",
      regenerate: "Regenerate"
    },
    selectTexts: {
      purpose: ["Please select", "Wedding", "Funeral", "Thank you", "Apology", "Seasonal greeting", "Business greeting", "Casual message"],
      culture: ["Please select", "Japan", "English", "EU"],
      formality: ["Please select", "Formal", "Standard", "Casual"],
      relationship: ["Not specified", "Friend", "Family", "Boss", "Client"]
    },
    copySuccess: "Copied to clipboard"
  }
};

let lastContext = null;
let currentMessage = null;
let copyNoticeEl = null;

function pickRandom(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function formatKeywords(keywords) {
  if (!keywords) return "";
  const tokens = keywords
    .split(/[、,]/)
    .map((k) => k.trim())
    .filter(Boolean);
  if (!tokens.length) return "";
  if (tokens.length === 1) return tokens[0];
  const last = tokens.pop();
  return `${tokens.join("・")} と ${last}`;
}

function generateBody(purpose, formality, relationship, keywords) {
  const purposeInfo = STRUCTURE.purposes[purpose];
  const lead = pickRandom(BODY_LEAD_INS[formality]);
  const baseSentence = `${lead}、${purposeInfo.body_template.replace(/。$/, "")}ことをお伝えしたくご連絡いたしました。`;
  const sentences = [baseSentence];

  if (relationship && RELATIONSHIP_PHRASES[relationship]) {
    sentences.unshift(RELATIONSHIP_PHRASES[relationship]);
  }

  const formattedKeywords = formatKeywords(keywords);
  if (formattedKeywords) {
    const keywordLine = purposeInfo.keywords_influence
      ? `特に「${formattedKeywords}」に触れつつ、状況を整理いたしました。`
      : `「${formattedKeywords}」についてもささやかに添えております。`;
    sentences.push(keywordLine);
  }

  const ending = pickRandom(BODY_ENDINGS[formality]);
  sentences.push(ending);

  return sentences.join("\n");
}

function generateMessage(purpose, culture, formality, relationship, keywords) {
  const opening = STRUCTURE.cultures[culture].opening[formality];
  const closing = STRUCTURE.cultures[culture].closing[formality];
  const body = generateBody(purpose, formality, relationship, keywords);
  const fullText = `${opening}\n\n${body}\n\n${closing}`;

  return { opening, body, closing, fullText };
}

function setLanguage(lang) {
  const langButtons = document.querySelectorAll(".lang-switch button");
  langButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  const content = LANG_CONTENT[lang];
  document.documentElement.lang = lang === "jp" ? "ja" : "en";

  document.querySelector(".title").textContent = content.title;
  document.querySelector(".subtitle").textContent = content.subtitle;
  const labels = document.querySelectorAll(".generator-panel label");
  labels[0].textContent = content.labels.purpose;
  labels[1].textContent = content.labels.culture;
  labels[2].textContent = content.labels.formality;
  labels[3].textContent = content.labels.relationship;
  labels[4].textContent = content.labels.keywords;

  const purposeOptions = document.querySelectorAll("#purpose option");
  const cultureOptions = document.querySelectorAll("#culture option");
  const formalityOptions = document.querySelectorAll("#formality option");
  const relationOptions = document.querySelectorAll("#relationship option");

  content.selectTexts.purpose.forEach((text, idx) => {
    if (purposeOptions[idx]) purposeOptions[idx].textContent = text;
  });
  content.selectTexts.culture.forEach((text, idx) => {
    if (cultureOptions[idx]) cultureOptions[idx].textContent = text;
  });
  content.selectTexts.formality.forEach((text, idx) => {
    if (formalityOptions[idx]) formalityOptions[idx].textContent = text;
  });
  content.selectTexts.relationship.forEach((text, idx) => {
    if (relationOptions[idx]) relationOptions[idx].textContent = text;
  });

  const keywordInput = document.getElementById("keywords");
  keywordInput.placeholder = content.placeholders.keywords;
  document.getElementById("generate-btn").textContent = content.buttons.generate;
  document.getElementById("copy-btn").textContent = content.buttons.copy;
  document.getElementById("regenerate-btn").textContent = content.buttons.regenerate;
  document.querySelector("#result-section h2").textContent = content.resultTitle;
}

function toggleProgress(show) {
  const progress = document.getElementById("progress");
  if (show) {
    progress.classList.remove("hidden");
    progress.classList.add("loading");
  } else {
    progress.classList.add("hidden");
    progress.classList.remove("loading");
  }
}

function renderResult(message) {
  const resultSection = document.getElementById("result-section");
  const resultText = document.getElementById("result-text");
  resultText.textContent = message.fullText;
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth" });
}

function showCopyNotice(text) {
  if (!copyNoticeEl) {
    copyNoticeEl = document.createElement("div");
    copyNoticeEl.className = "copy-success";
    document.querySelector(".result-actions").after(copyNoticeEl);
  }
  copyNoticeEl.textContent = text;
}

function handleGenerate(isRegenerate = false) {
  const purposeEl = document.getElementById("purpose");
  const cultureEl = document.getElementById("culture");
  const formalityEl = document.getElementById("formality");
  const relationshipEl = document.getElementById("relationship");
  const keywordsEl = document.getElementById("keywords");

  const context = isRegenerate && lastContext
    ? lastContext
    : {
        purpose: purposeEl.value,
        culture: cultureEl.value,
        formality: formalityEl.value,
        relationship: relationshipEl.value,
        keywords: keywordsEl.value
      };

  if (!(context.purpose && context.culture && context.formality)) {
    return;
  }

  lastContext = context;
  toggleProgress(true);

  setTimeout(() => {
    currentMessage = generateMessage(
      context.purpose,
      context.culture,
      context.formality,
      context.relationship,
      context.keywords
    );
    toggleProgress(false);
    renderResult(currentMessage);
  }, 420);
}

function attachEventHandlers() {
  const langButtons = document.querySelectorAll(".lang-switch button");
  langButtons.forEach((btn) => {
    btn.addEventListener("click", () => setLanguage(btn.dataset.lang));
  });

  const generateBtn = document.getElementById("generate-btn");
  generateBtn.addEventListener("click", () => handleGenerate(false));

  const regenerateBtn = document.getElementById("regenerate-btn");
  regenerateBtn.addEventListener("click", () => handleGenerate(true));

  const copyBtn = document.getElementById("copy-btn");
  copyBtn.addEventListener("click", async () => {
    if (!currentMessage) return;
    await navigator.clipboard.writeText(currentMessage.fullText);
    const activeLang = document.querySelector(".lang-switch button.active").dataset.lang;
    showCopyNotice(LANG_CONTENT[activeLang].copySuccess);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setLanguage("jp");
  attachEventHandlers();
});
