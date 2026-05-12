const STORAGE_KEY_LANG = "nw_lang";

const UI = {
  ja: {
    title: "文面ジェネレーター",
    subtitle: "用途・文化圏・フォーマル度から短い文面の下書きを作成します。",
    generatorTitle: "文面を作成する",
    warningTitle: "重要な注意",
    warningText1: "このツールは短文のたたき台を作る簡易ツールです。弔事、謝罪、契約、クレーム対応、法的責任、補償、返金、金銭に関わる文面は、状況に合わせて必ず確認・修正してください。",
    warningText2: "特に謝罪文では、法的責任や補償を不用意に認める表現を避け、必要に応じて責任者や専門家に確認してください。",
    labels: {
      purpose: "用途（Purpose）",
      culture: "文化圏（Culture）",
      formality: "フォーマル度（Formality）",
      relationship: "相手との関係（任意）",
      keywords: "キーワード（任意）"
    },
    options: {
      purpose: ["選択してください", "結婚", "弔事", "お礼", "お詫び", "季節の挨拶", "ビジネス挨拶", "カジュアルメッセージ"],
      culture: ["選択してください", "日本", "英語圏", "EU"],
      formality: ["選択してください", "高", "中", "低"],
      relationship: ["指定なし", "友人", "家族", "上司", "取引先"]
    },
    buttons: {
      generate: "文面を生成する",
      copy: "コピー",
      save: "TXT保存",
      regenerate: "再生成"
    },
    resultTitle: "生成された文面",
    formHintReady: "生成できます。重要な文面は送信前に必ず確認してください。",
    formHintMissing: "用途・文化圏・フォーマル度を選ぶと生成できます。",
    formHintError: "用途・文化圏・フォーマル度を選んでください。",
    copySuccess: "コピーしました。",
    copyFail: "コピーできませんでした。本文を選択して手動でコピーしてください。",
    saveSuccess: "TXTを保存しました。",
    noMessage: "先に文面を生成してください。",
    languageChanged: "表示言語を切り替えました。必要なら再生成してください。",
    faqTitle: "FAQ"
  },
  en: {
    title: "Message Generator",
    subtitle: "Create a short draft message from purpose, culture, and formality.",
    generatorTitle: "Create a message",
    warningTitle: "Important note",
    warningText1: "This tool creates rough short-message drafts. Please review and edit messages involving condolences, apologies, contracts, complaints, legal responsibility, compensation, refunds, or money.",
    warningText2: "For apologies, avoid wording that admits legal responsibility or compensation without review. Ask a responsible person or specialist when needed.",
    labels: {
      purpose: "Purpose",
      culture: "Culture",
      formality: "Formality",
      relationship: "Relationship (optional)",
      keywords: "Keywords (optional)"
    },
    options: {
      purpose: ["Please select", "Wedding", "Condolence", "Thank you", "Apology", "Seasonal greeting", "Business greeting", "Casual message"],
      culture: ["Please select", "Japan", "English-speaking", "EU"],
      formality: ["Please select", "Formal", "Standard", "Casual"],
      relationship: ["Not specified", "Friend", "Family", "Manager", "Client"]
    },
    buttons: {
      generate: "Generate",
      copy: "Copy",
      save: "Save TXT",
      regenerate: "Regenerate"
    },
    resultTitle: "Generated message",
    formHintReady: "Ready to generate. Review important messages before sending.",
    formHintMissing: "Select purpose, culture, and formality to generate.",
    formHintError: "Please select purpose, culture, and formality.",
    copySuccess: "Copied.",
    copyFail: "Copy failed. Please select the text and copy it manually.",
    saveSuccess: "TXT saved.",
    noMessage: "Generate a message first.",
    languageChanged: "Display language changed. Regenerate if needed.",
    faqTitle: "FAQ"
  }
};

const OPENINGS = {
  ja: { high: "拝啓", medium: "いつもお世話になっております。", casual: "こんにちは。" },
  en: { high: "Dear Sir or Madam,", medium: "Hello,", casual: "Hi," }
};

const CLOSINGS = {
  ja: { high: "敬具", medium: "よろしくお願いいたします。", casual: "またご連絡します。" },
  en: { high: "Sincerely,", medium: "Best regards,", casual: "Best," }
};

const RELATIONSHIP_LINES = {
  ja: {
    friend: { high: "親しい間柄ではありますが、失礼のないよう、心を込めてお伝えします。", medium: "いつも気にかけてくれてありがとう。", casual: "いつもありがとう。" },
    family: { high: "家族として、日頃の支えに深く感謝しています。", medium: "いつも支えてくれてありがとう。", casual: "いつも助かってるよ。" },
    boss: { high: "日頃よりご指導を賜り、誠にありがとうございます。", medium: "いつもご指導いただきありがとうございます。", casual: "いつもありがとうございます。" },
    client: { high: "平素より格別のご高配を賜り、心より御礼申し上げます。", medium: "いつもお世話になっております。", casual: "いつもありがとうございます。" }
  },
  en: {
    friend: { high: "Although we know each other well, I wanted to write with care and respect.", medium: "Thank you, as always, for being there.", casual: "Thanks as always." },
    family: { high: "I am grateful for your continued support as family.", medium: "Thank you for always supporting me.", casual: "Thanks for always being there." },
    boss: { high: "Thank you very much for your continued guidance and support.", medium: "Thank you for your continued guidance.", casual: "Thank you as always." },
    client: { high: "Thank you very much for your continued trust and support.", medium: "Thank you for your continued support.", casual: "Thank you as always." }
  }
};

const TEMPLATES = {
  ja: {
    wedding: {
      high: ["このたびはご結婚、誠におめでとうございます。お二人の新しい門出が、温かな笑顔に満ちたものとなりますよう心よりお祈り申し上げます。"],
      medium: ["ご結婚おめでとうございます。お二人で築かれる毎日が、穏やかで幸せな時間になりますよう願っています。"],
      casual: ["結婚おめでとう！二人らしく楽しく、あたたかい毎日を過ごしてね。"]
    },
    funeral: {
      high: ["このたびのご訃報に接し、心よりお悔やみ申し上げます。ご家族の皆さまの悲しみが少しでも和らぎますよう、謹んでお祈りいたします。"],
      medium: ["突然の知らせに驚いています。心よりお悔やみ申し上げます。どうか無理をなさらず、お身体を大切にしてください。"],
      casual: ["つらい中での連絡ありがとう。無理しないでね。必要なことがあればいつでも声をかけてください。"]
    },
    thank_you: {
      high: ["このたびは温かいお心遣いをいただき、誠にありがとうございました。いただいたご配慮に深く感謝申し上げます。"],
      medium: ["このたびは本当にありがとうございました。おかげさまでとても助かりました。心より感謝しています。"],
      casual: ["本当にありがとう。すごく助かったし、とても嬉しかったです。"]
    },
    apology: {
      high: ["このたびはご迷惑をおかけし、誠に申し訳ございません。現在の状況を確認し、同じことが起きないよう改善に努めてまいります。"],
      medium: ["このたびはご迷惑をおかけして申し訳ありません。状況を確認し、今後の対応を見直します。"],
      casual: ["今回は迷惑をかけてごめんなさい。状況を見直して、次から気をつけます。"]
    },
    greeting_seasonal: {
      high: ["季節の変わり目となりましたが、いかがお過ごしでしょうか。皆さまのご健康とご多幸を心よりお祈り申し上げます。"],
      medium: ["季節の変わり目ですが、お元気でお過ごしでしょうか。どうぞ体調に気をつけてお過ごしください。"],
      casual: ["だんだん季節が変わってきたね。体調に気をつけて、元気に過ごしてね。"]
    },
    greeting_business: {
      high: ["平素より大変お世話になっております。今後とも円滑に進められるよう努めてまいりますので、引き続きよろしくお願い申し上げます。"],
      medium: ["いつもお世話になっております。今後ともスムーズに進められるよう対応いたしますので、よろしくお願いいたします。"],
      casual: ["いつもありがとうございます。今後ともよろしくお願いします。"]
    },
    casual_message: {
      high: ["取り急ぎご連絡いたします。ご都合のよいタイミングでご確認いただけますと幸いです。"],
      medium: ["少し共有したいことがあり、連絡しました。時間のあるときに確認してもらえると助かります。"],
      casual: ["ちょっと連絡です。時間あるときに見てみてね。"]
    }
  },
  en: {
    wedding: {
      high: ["Congratulations on your marriage. I sincerely wish you both a warm and happy future together."],
      medium: ["Congratulations on your wedding. I hope your new life together is full of joy, comfort, and laughter."],
      casual: ["Congratulations! Wishing you both lots of happiness and fun ahead."]
    },
    funeral: {
      high: ["Please accept my sincere condolences. I am keeping you and your family in my thoughts during this difficult time."],
      medium: ["I am so sorry for your loss. Please take care of yourself, and know that I am thinking of you."],
      casual: ["I’m really sorry to hear this. Please don’t push yourself, and let me know if there’s anything I can do."]
    },
    thank_you: {
      high: ["Thank you very much for your thoughtful support. I truly appreciate your kindness and consideration."],
      medium: ["Thank you so much. Your help meant a lot to me, and I really appreciate it."],
      casual: ["Thanks so much. That really helped, and I appreciate it."]
    },
    apology: {
      high: ["I sincerely apologize for the inconvenience. I am reviewing the situation and will work to prevent a similar issue from happening again."],
      medium: ["I’m sorry for the inconvenience. I’ll review what happened and improve the process going forward."],
      casual: ["Sorry about this. I’ll check what happened and be more careful next time."]
    },
    greeting_seasonal: {
      high: ["I hope you are doing well as the season changes. Wishing you continued health and success."],
      medium: ["I hope you’ve been well. Please take care as the season changes."],
      casual: ["Hope you’re doing well. Take care with the change in weather."]
    },
    greeting_business: {
      high: ["Thank you for your continued support. I look forward to working with you and will do my best to ensure smooth communication."],
      medium: ["Thank you for your continued support. I look forward to working with you."],
      casual: ["Thanks as always. Looking forward to working together."]
    },
    casual_message: {
      high: ["I am writing to share a quick note. Please review it when convenient."],
      medium: ["I wanted to share a quick update. Please take a look when you have time."],
      casual: ["Just a quick note. Check it when you get a chance."]
    }
  }
};

const APOLOGY_REVIEW_LINES = {
  ja: "※法的責任、補償、返金、契約違反に関わる場合は、送信前に責任者や専門家へ確認してください。",
  en: "Note: If this involves legal responsibility, compensation, refunds, or contract issues, ask a responsible person or specialist to review it before sending."
};

let currentLang = "ja";
let currentMessage = null;
let lastContext = null;
let hasTriedSubmit = false;

function $(selector) { return document.querySelector(selector); }
function getOutputLang(culture) { return culture === "japan" ? "ja" : "en"; }
function getInitialLang() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_LANG);
    if (saved === "ja" || saved === "en") return saved;
  } catch {}
  return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
}
function saveLang(lang) {
  try { localStorage.setItem(STORAGE_KEY_LANG, lang); } catch {}
}
function applyOptionLabels(selectId, labels) {
  document.querySelectorAll(`#${selectId} option`).forEach((option, index) => {
    if (labels[index]) option.textContent = labels[index];
  });
}
function setText(selector, value) {
  const el = $(selector);
  if (el) el.textContent = value;
}
function setLanguage(lang, shouldNotify = false) {
  currentLang = lang === "en" ? "en" : "ja";
  const content = UI[currentLang];
  document.documentElement.lang = currentLang;
  document.querySelectorAll(".lang-switch button").forEach((button) => button.classList.toggle("active", button.dataset.lang === currentLang));
  setText(".title", content.title);
  setText(".subtitle", content.subtitle);
  setText("#generator-title", content.generatorTitle);
  setText("#warning-title", content.warningTitle);
  const warningParagraphs = document.querySelectorAll(".nw-warning p");
  if (warningParagraphs[0]) warningParagraphs[0].textContent = content.warningText1;
  if (warningParagraphs[1]) warningParagraphs[1].textContent = content.warningText2;
  const labels = document.querySelectorAll(".generator-panel label");
  if (labels[0]) labels[0].textContent = content.labels.purpose;
  if (labels[1]) labels[1].textContent = content.labels.culture;
  if (labels[2]) labels[2].textContent = content.labels.formality;
  if (labels[3]) labels[3].textContent = content.labels.relationship;
  if (labels[4]) labels[4].textContent = content.labels.keywords;
  applyOptionLabels("purpose", content.options.purpose);
  applyOptionLabels("culture", content.options.culture);
  applyOptionLabels("formality", content.options.formality);
  applyOptionLabels("relationship", content.options.relationship);
  setText("#generate-btn", content.buttons.generate);
  setText("#copy-btn", content.buttons.copy);
  setText("#save-btn", content.buttons.save);
  setText("#regenerate-btn", content.buttons.regenerate);
  setText("#result-section h2", content.resultTitle);
  setText("#faq-title", content.faqTitle);
  saveLang(currentLang);
  updateGenerateState();
  if (shouldNotify && currentMessage) showToast(content.languageChanged);
}
function getFormContext() {
  return {
    purpose: $("#purpose").value,
    culture: $("#culture").value,
    formality: $("#formality").value,
    relationship: $("#relationship").value,
    keywords: $("#keywords").value.trim()
  };
}
function isContextValid(context) { return Boolean(context.purpose && context.culture && context.formality); }
function updateGenerateState() {
  const context = getFormContext();
  const valid = isContextValid(context);
  const button = $("#generate-btn");
  const hint = $("#form-hint");
  if (button) button.disabled = !valid;
  if (hint) {
    hint.textContent = valid ? UI[currentLang].formHintReady : (hasTriedSubmit ? UI[currentLang].formHintError : UI[currentLang].formHintMissing);
    hint.classList.toggle("is-error", !valid && hasTriedSubmit);
  }
}
function splitKeywords(value) {
  return value.split(/[、,]/).map((item) => item.trim()).filter(Boolean);
}
function keywordSentence(lang, keywords) {
  const items = splitKeywords(keywords);
  if (!items.length) return "";
  return lang === "ja" ? `関連する内容：${items.join("・")}。` : `Related details: ${items.join(", ")}.`;
}
function generateMessage(context) {
  const outputLang = getOutputLang(context.culture);
  const opening = OPENINGS[outputLang][context.formality];
  const closing = CLOSINGS[outputLang][context.formality];
  const body = TEMPLATES[outputLang][context.purpose][context.formality][0];
  const lines = [];
  if (context.relationship && RELATIONSHIP_LINES[outputLang][context.relationship]) lines.push(RELATIONSHIP_LINES[outputLang][context.relationship][context.formality]);
  lines.push(body);
  const keywords = keywordSentence(outputLang, context.keywords);
  if (keywords) lines.push(keywords);
  if (context.purpose === "apology") lines.push(APOLOGY_REVIEW_LINES[outputLang]);
  return { fullText: [opening, lines.join("\n"), closing].filter(Boolean).join("\n\n"), outputLang };
}
function toggleProgress(show) {
  const progress = $("#progress");
  if (!progress) return;
  progress.classList.toggle("hidden", !show);
  progress.classList.toggle("loading", show);
}
function renderResult(message) {
  const resultSection = $("#result-section");
  const resultText = $("#result-text");
  if (!resultSection || !resultText) return;
  resultText.textContent = message.fullText;
  resultSection.classList.remove("hidden");
  resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}
function showToast(message) {
  const toast = $("#toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-visible");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("is-visible"), 2600);
}
async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const ok = document.execCommand("copy");
  textarea.remove();
  return ok;
}
function saveTextFile(text, outputLang) {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `message-generator-${outputLang}-${date}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function handleGenerate(isRegenerate = false) {
  hasTriedSubmit = true;
  const context = isRegenerate && lastContext ? lastContext : getFormContext();
  if (!isContextValid(context)) {
    updateGenerateState();
    showToast(UI[currentLang].formHintError);
    return;
  }
  lastContext = context;
  toggleProgress(true);
  window.setTimeout(() => {
    currentMessage = generateMessage(context);
    toggleProgress(false);
    renderResult(currentMessage);
  }, 180);
}
function bindEvents() {
  document.querySelectorAll(".lang-switch button").forEach((button) => button.addEventListener("click", () => setLanguage(button.dataset.lang, true)));
  ["#purpose", "#culture", "#formality", "#relationship", "#keywords"].forEach((selector) => {
    const el = $(selector);
    if (!el) return;
    el.addEventListener("input", updateGenerateState);
    el.addEventListener("change", updateGenerateState);
  });
  $("#generate-btn").addEventListener("click", () => handleGenerate(false));
  $("#regenerate-btn").addEventListener("click", () => handleGenerate(true));
  $("#copy-btn").addEventListener("click", async () => {
    if (!currentMessage) return showToast(UI[currentLang].noMessage);
    try {
      const ok = await copyText(currentMessage.fullText);
      showToast(ok ? UI[currentLang].copySuccess : UI[currentLang].copyFail);
    } catch {
      showToast(UI[currentLang].copyFail);
    }
  });
  $("#save-btn").addEventListener("click", () => {
    if (!currentMessage) return showToast(UI[currentLang].noMessage);
    saveTextFile(currentMessage.fullText, currentMessage.outputLang);
    showToast(UI[currentLang].saveSuccess);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  setLanguage(getInitialLang(), false);
});
