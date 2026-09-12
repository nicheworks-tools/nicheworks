"use strict";

const UI = {
  jp: {
    title: "文面ジェネレーター",
    subtitle: "用途・文化圏・フォーマル度から文面のたたき台を生成",
    labels: {
      purpose: "用途（Purpose）",
      culture: "文化圏（Culture）",
      formality: "フォーマル度（Formality）",
      relationship: "相手との関係（任意）",
      keywords: "キーワード（任意）"
    },
    placeholders: { keywords: "例：欠席連絡、感謝、遅延の謝罪など" },
    resultTitle: "生成された文面",
    buttons: { generate: "文面を生成する", copy: "コピー", regenerate: "再生成" },
    selects: {
      purpose: ["選択してください", "結婚", "弔事", "お礼", "お詫び", "季節の挨拶", "ビジネス挨拶", "カジュアルメッセージ"],
      culture: ["選択してください", "日本", "英語圏", "EU"],
      formality: ["選択してください", "高", "中", "低"],
      relationship: ["指定なし", "友人", "家族", "上司", "取引先"]
    },
    copied: "クリップボードへコピーしました",
    copyFailed: "コピーできませんでした。手動で選択してコピーしてください。"
  },
  en: {
    title: "Message Generator",
    subtitle: "Create a draft from purpose, culture, and formality",
    labels: {
      purpose: "Purpose",
      culture: "Culture",
      formality: "Formality",
      relationship: "Relationship (optional)",
      keywords: "Keywords (optional)"
    },
    placeholders: { keywords: "e.g. RSVP, gratitude, delay apology" },
    resultTitle: "Generated Message",
    buttons: { generate: "Generate", copy: "Copy", regenerate: "Regenerate" },
    selects: {
      purpose: ["Please select", "Wedding", "Funeral", "Thank you", "Apology", "Seasonal greeting", "Business greeting", "Casual message"],
      culture: ["Please select", "Japan", "English-speaking", "EU"],
      formality: ["Please select", "Formal", "Standard", "Casual"],
      relationship: ["Not specified", "Friend", "Family", "Boss", "Client"]
    },
    copied: "Copied to clipboard",
    copyFailed: "Copy failed. Select the result and copy it manually."
  }
};

const CULTURES = {
  japan: {
    language: "ja",
    opening: {
      high: ["拝啓"],
      medium: ["いつもお世話になっております。", "平素よりありがとうございます。"],
      casual: ["こんにちは。", "お疲れさまです。"]
    },
    closing: {
      high: ["何卒よろしくお願い申し上げます。\n\n敬具", "末筆ながら、今後ともよろしくお願い申し上げます。\n\n敬具"],
      medium: ["今後ともよろしくお願いいたします。", "どうぞよろしくお願いいたします。"],
      casual: ["また連絡します。", "これからもよろしくね。"]
    }
  },
  english: {
    language: "en",
    opening: {
      high: ["Dear Sir or Madam,", "Dear Recipient,"],
      medium: ["Hello,", "Hi there,"],
      casual: ["Hi,", "Hello!"]
    },
    closing: {
      high: ["Sincerely,", "Yours sincerely,"],
      medium: ["Best regards,", "Kind regards,"],
      casual: ["Best,", "Cheers,"]
    }
  },
  eu: {
    language: "en",
    opening: {
      high: ["Dear Sir or Madam,", "To whom it may concern,"],
      medium: ["Hello,", "Dear colleague,"],
      casual: ["Hi,", "Hello!"]
    },
    closing: {
      high: ["Yours faithfully,", "Kind regards,"],
      medium: ["Kind regards,", "Best regards,"],
      casual: ["Regards,", "Best,"]
    }
  }
};

const PURPOSE = {
  wedding: {
    ja: [
      "ご結婚、誠におめでとうございます。お二人の新しい門出を心よりお祝い申し上げます。",
      "このたびのご結婚を心からお祝いします。お二人の末永い幸せをお祈りしています。"
    ],
    en: [
      "Congratulations on your wedding. Wishing you both a joyful start to this new chapter together.",
      "Warmest congratulations on your marriage. I wish you both lasting happiness in the years ahead."
    ]
  },
  funeral: {
    ja: [
      "このたびのご逝去を悼み、心よりお悔やみ申し上げます。どうかご無理をなさらずお過ごしください。",
      "謹んでお悔やみ申し上げます。皆さまのお心が少しでも安らぐことをお祈りしております。"
    ],
    en: [
      "I am very sorry for your loss. Please accept my sincere condolences during this difficult time.",
      "Please accept my heartfelt sympathy. I am thinking of you and your family at this difficult time."
    ]
  },
  thank_you: {
    ja: [
      "このたびは本当にありがとうございました。お心遣いに深く感謝しております。",
      "ご対応いただき、心より感謝いたします。おかげさまで大変助かりました。"
    ],
    en: [
      "Thank you very much for your help and consideration. I truly appreciate it.",
      "I sincerely appreciate your support. Your help made a real difference."
    ]
  },
  apology: {
    ja: [
      "このたびはご迷惑をおかけし、申し訳ございませんでした。状況を確認し、必要な改善に取り組みます。",
      "ご不便をおかけしましたことをお詫び申し上げます。原因を確認し、再発防止に努めます。"
    ],
    en: [
      "I apologize for the inconvenience caused. I am reviewing what happened and will take appropriate steps to improve the situation.",
      "I am sorry for the trouble this caused. I will review the cause and work to prevent the same issue from happening again."
    ]
  },
  greeting_seasonal: {
    ja: [
      "季節の変わり目となりましたが、いかがお過ごしでしょうか。どうぞお身体を大切にお過ごしください。",
      "時節柄、どうぞご自愛ください。変わらずお元気でお過ごしのことを願っております。"
    ],
    en: [
      "I hope you are doing well as the season changes. Wishing you good health and a pleasant season ahead.",
      "I hope this season finds you well. Please take good care of yourself."
    ]
  },
  greeting_business: {
    ja: [
      "平素より大変お世話になっております。改めまして、日頃のご支援に御礼申し上げます。",
      "いつもお世話になっております。今後も円滑にご一緒できれば幸いです。"
    ],
    en: [
      "Thank you for your continued support. I appreciate the opportunity to work with you.",
      "I hope you are well. Thank you for your continued cooperation, and I look forward to working together."
    ]
  },
  casual_message: {
    ja: [
      "ちょっと連絡したくてメッセージしました。最近どうしていますか？",
      "ふと思い出して連絡しました。元気にしていますか？"
    ],
    en: [
      "Just wanted to send a quick message and see how you are doing.",
      "I thought of you and wanted to check in. Hope you are doing well."
    ]
  }
};

const RELATIONSHIP = {
  ja: {
    friend: "いつも気軽に話せる友人として、ありがとう。",
    family: "いつも家族として支えてくれて、ありがとう。",
    boss: "日頃よりご指導いただき、ありがとうございます。",
    client: "平素より格別のご高配を賜り、ありがとうございます。"
  },
  en: {
    friend: "I really value our friendship and appreciate you.",
    family: "I am grateful for your support as family.",
    boss: "Thank you for your continued guidance and support.",
    client: "Thank you for your continued trust and support."
  }
};

let uiLang = "jp";
let lastContext = null;
let currentMessage = "";
let copyNotice = null;

function pick(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function selectedContentLanguage(culture) {
  return CULTURES[culture]?.language === "ja" ? "ja" : "en";
}

function keywordSentence(keywords, contentLang) {
  const tokens = String(keywords || "")
    .split(/[、,]/)
    .map((token) => token.trim())
    .filter(Boolean)
    .slice(0, 6);
  if (!tokens.length) return "";
  if (contentLang === "ja") return `あわせて、${tokens.join("・")}についてもお伝えします。`;
  return `I also wanted to mention ${tokens.join(", ")}.`;
}

function generateMessage(context) {
  const culture = CULTURES[context.culture];
  const contentLang = selectedContentLanguage(context.culture);
  const purposeOptions = PURPOSE[context.purpose]?.[contentLang] || [];
  if (!culture || !purposeOptions.length) return "";

  const parts = [pick(culture.opening[context.formality])];
  const relation = RELATIONSHIP[contentLang]?.[context.relationship];
  if (relation) parts.push(relation);
  parts.push(pick(purposeOptions));
  const keywordLine = keywordSentence(context.keywords, contentLang);
  if (keywordLine) parts.push(keywordLine);
  parts.push(pick(culture.closing[context.formality]));
  return parts.join("\n\n");
}

function validateRequired() {
  const button = document.getElementById("generate-btn");
  const ready = Boolean(
    document.getElementById("purpose")?.value &&
    document.getElementById("culture")?.value &&
    document.getElementById("formality")?.value
  );
  if (button) button.disabled = !ready;
  return ready;
}

function setLanguage(lang) {
  uiLang = lang === "en" ? "en" : "jp";
  const content = UI[uiLang];
  document.documentElement.lang = uiLang === "jp" ? "ja" : "en";
  try { localStorage.setItem("nw_lang", uiLang === "jp" ? "ja" : "en"); } catch (_) {}

  document.querySelectorAll(".lang-switch button").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === uiLang);
  });

  document.querySelector(".title").textContent = content.title;
  document.querySelector(".subtitle").textContent = content.subtitle;

  const labels = document.querySelectorAll(".generator-panel label");
  const labelValues = [content.labels.purpose, content.labels.culture, content.labels.formality, content.labels.relationship, content.labels.keywords];
  labels.forEach((label, index) => { if (labelValues[index]) label.textContent = labelValues[index]; });

  const updateOptions = (selector, values) => {
    document.querySelectorAll(`${selector} option`).forEach((option, index) => {
      if (values[index]) option.textContent = values[index];
    });
  };
  updateOptions("#purpose", content.selects.purpose);
  updateOptions("#culture", content.selects.culture);
  updateOptions("#formality", content.selects.formality);
  updateOptions("#relationship", content.selects.relationship);

  document.getElementById("keywords").placeholder = content.placeholders.keywords;
  document.getElementById("generate-btn").textContent = content.buttons.generate;
  document.getElementById("copy-btn").textContent = content.buttons.copy;
  document.getElementById("regenerate-btn").textContent = content.buttons.regenerate;
  document.querySelector("#result-section h2").textContent = content.resultTitle;
  validateRequired();
}

function renderResult(text) {
  currentMessage = text;
  document.getElementById("result-text").textContent = text;
  document.getElementById("result-section").classList.remove("hidden");
}

function showProgress(show) {
  const progress = document.getElementById("progress");
  progress.classList.toggle("hidden", !show);
  progress.classList.toggle("loading", show);
}

function currentContext() {
  return {
    purpose: document.getElementById("purpose").value,
    culture: document.getElementById("culture").value,
    formality: document.getElementById("formality").value,
    relationship: document.getElementById("relationship").value,
    keywords: document.getElementById("keywords").value.trim()
  };
}

function handleGenerate(regenerate) {
  const context = regenerate && lastContext ? { ...lastContext } : currentContext();
  if (!(context.purpose && context.culture && context.formality)) return;
  lastContext = context;
  showProgress(true);
  window.setTimeout(() => {
    const result = generateMessage(context);
    showProgress(false);
    if (result) renderResult(result);
  }, 120);
}

async function copyText(text) {
  if (!text) return false;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {}
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try { ok = document.execCommand("copy"); } catch (_) { ok = false; }
  textarea.remove();
  return ok;
}

function showCopyNotice(message) {
  if (!copyNotice) {
    copyNotice = document.createElement("div");
    copyNotice.className = "copy-success";
    document.querySelector(".result-actions").after(copyNotice);
  }
  copyNotice.textContent = message;
}

document.addEventListener("DOMContentLoaded", () => {
  let initialUi = (navigator.language || "").toLowerCase().startsWith("ja") ? "jp" : "en";
  try {
    const saved = localStorage.getItem("nw_lang");
    if (saved === "ja") initialUi = "jp";
    if (saved === "en") initialUi = "en";
  } catch (_) {}

  document.querySelectorAll(".lang-switch button").forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.lang));
  });
  ["purpose", "culture", "formality"].forEach((id) => {
    document.getElementById(id)?.addEventListener("change", validateRequired);
  });

  document.getElementById("generate-btn")?.addEventListener("click", () => handleGenerate(false));
  document.getElementById("regenerate-btn")?.addEventListener("click", () => handleGenerate(true));
  document.getElementById("copy-btn")?.addEventListener("click", async () => {
    if (!currentMessage) return;
    const ok = await copyText(currentMessage);
    showCopyNotice(ok ? UI[uiLang].copied : UI[uiLang].copyFailed);
  });

  setLanguage(initialUi);
});
