const ingredients = [
  {
    name_jp: "ヒアルロン酸",
    name_en: "Hyaluronic Acid",
    aliases: ["sodium hyaluronate"],
    risk: 0,
    desc: "保湿目的で広く使われる成分です。"
  },
  {
    name_jp: "グリセリン",
    name_en: "Glycerin",
    aliases: ["glycerol"],
    risk: 0,
    desc: "保湿剤として肌の水分を保持します。"
  },
  {
    name_jp: "サリチル酸",
    name_en: "Salicylic Acid",
    aliases: ["beta hydroxy acid"],
    risk: 1,
    desc: "角質ケア用途で使われ、敏感肌では刺激になる場合があります。"
  },
  {
    name_jp: "エタノール",
    name_en: "Ethanol",
    aliases: ["alcohol"],
    risk: 1,
    desc: "防腐・溶剤として使われ、乾燥を感じることがあります。"
  },
  {
    name_jp: "レチノール",
    name_en: "Retinol",
    aliases: ["vitamin a"],
    risk: 2,
    desc: "高機能成分で、使い方によっては刺激を感じる場合があります。"
  },
  {
    name_jp: "フェノキシエタノール",
    name_en: "Phenoxyethanol",
    aliases: ["phenooxyethanol"],
    risk: 1,
    desc: "防腐剤として利用される一般的な成分です。"
  },
  {
    name_jp: "パラベン",
    name_en: "Paraben",
    aliases: ["methylparaben", "ethylparaben"],
    risk: 1,
    desc: "防腐目的で用いられる複数の同系統成分の総称です。"
  },
  {
    name_jp: "香料",
    name_en: "Fragrance",
    aliases: ["perfume"],
    risk: 1,
    desc: "製品の香り付けに使われ、一部で刺激となることがあります。"
  },
  {
    name_jp: "水",
    name_en: "Water",
    aliases: ["aqua"],
    risk: 0,
    desc: "多くの製品のベースとなる溶媒です。"
  },
  {
    name_jp: "ホホバ種子油",
    name_en: "Jojoba Seed Oil",
    aliases: ["jojoba oil"],
    risk: 0,
    desc: "植物由来のオイルで、保湿や柔軟目的で使用されます。"
  }
];

const ingredientTags = document.getElementById("ingredientTags");
const suggestInput = document.getElementById("searchInput");
const suggestTags = document.getElementById("suggestTags");
const bulkInput = document.getElementById("bulkInput");
const bulkButton = document.getElementById("bulkButton");
const ocrButton = document.getElementById("ocrButton");
const ocrImage = document.getElementById("ocrImage");
const ocrStatus = document.getElementById("ocrStatus");
const analyzeButton = document.getElementById("analyzeButton");
const resultCards = document.getElementById("resultCards");
const bulkSection = document.getElementById("bulk");

function normalizeText(text) {
  return (text || "").normalize("NFKC").trim();
}

function cleanTextToItems(text) {
  const normalized = normalizeText(text);
  const lines = normalized.split(/\r?\n/);
  const collected = [];

  lines.forEach((line) => {
    let current = line.trim();
    if (!current) return;
    if (current.length <= 1) return;
    if (/^\d+$/.test(current)) return;
    if (/内容量|使用上|注意|ml|製造|made/i.test(current)) return;

    const compact = current.replace(/\s+/g, "");
    const hiraganaMatches = compact.match(/[\u3040-\u309F]/g) || [];
    const hiraganaRatio = compact.length ? hiraganaMatches.length / compact.length : 0;
    if (hiraganaRatio >= 0.5) return;
    if (/^[\p{P}\p{S}]+$/u.test(compact)) return;

    const fragments = current.split(/[\,\/・\.]+/);
    fragments.forEach((fragment) => {
      const cleaned = fragment.replace(/[\(\)\（\）\[\]【】]/g, "").trim();
      if (cleaned.length < 2) return;
      collected.push(cleaned.toLowerCase());
    });
  });

  return [...new Set(collected)];
}

function sanitizeSingleTerm(term) {
  let normalized = normalizeText(term);
  normalized = normalized.replace(/[\(\)\（\）\[\]【】]/g, "");
  normalized = normalized.split(/[\,\/・\.]+/)[0];
  const cleaned = normalized.trim().toLowerCase();
  if (cleaned.length < 2) return "";
  if (/^\d+$/.test(cleaned)) return "";
  if (/^[\p{P}\p{S}]+$/u.test(cleaned)) return "";
  return cleaned;
}

function createTagElement(name) {
  const wrapper = document.createElement("span");
  wrapper.className = "itag";

  const nameSpan = document.createElement("span");
  nameSpan.className = "name";
  nameSpan.textContent = name;

  const editButton = document.createElement("button");
  editButton.className = "edit";
  editButton.type = "button";
  editButton.textContent = "✏";

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete";
  deleteButton.type = "button";
  deleteButton.textContent = "🗑";

  editButton.addEventListener("click", handleEditClick);
  deleteButton.addEventListener("click", () => wrapper.remove());

  wrapper.appendChild(nameSpan);
  wrapper.appendChild(editButton);
  wrapper.appendChild(deleteButton);
  return wrapper;
}

function handleEditClick(event) {
  const editButton = event.currentTarget;
  const tag = editButton.parentElement;
  const existingInput = tag.querySelector("input[type='text']");
  if (existingInput) {
    saveEdit(tag, existingInput, editButton);
  } else {
    startEdit(tag, editButton);
  }
}

function startEdit(tag, editButton) {
  const nameSpan = tag.querySelector(".name");
  const currentName = nameSpan.textContent;
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentName;

  tag.replaceChild(input, nameSpan);
  editButton.textContent = "✓";
  input.focus();
}

function saveEdit(tag, input, editButton) {
  const sanitized = sanitizeSingleTerm(input.value);
  if (!sanitized) {
    input.focus();
    return;
  }

  if (isDuplicate(sanitized, tag)) {
    input.focus();
    return;
  }

  const nameSpan = document.createElement("span");
  nameSpan.className = "name";
  nameSpan.textContent = sanitized;

  tag.replaceChild(nameSpan, input);
  editButton.textContent = "✏";
}

function isDuplicate(name, currentTag) {
  const lowerName = name.toLowerCase();
  const items = ingredientTags.querySelectorAll(".itag .name");
  for (const item of items) {
    if (currentTag && item === currentTag.querySelector(".name")) continue;
    if (item.textContent.toLowerCase() === lowerName) return true;
  }
  return false;
}

function addToAnalysisList(name) {
  const sanitized = sanitizeSingleTerm(name);
  if (!sanitized || sanitized.length < 2) return;
  if (isDuplicate(sanitized)) return;
  const tag = createTagElement(sanitized);
  ingredientTags.appendChild(tag);
}

function handleBulkAdd() {
  const items = cleanTextToItems(bulkInput.value);
  items.forEach(addToAnalysisList);
  bulkInput.value = "";
}

function renderSuggests(results) {
  suggestTags.innerHTML = "";
  results.slice(0, 8).forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = item.name_jp;
    tag.addEventListener("click", () => {
      addToAnalysisList(item.name_jp.toLowerCase());
      suggestInput.value = "";
      suggestTags.innerHTML = "";
    });
    suggestTags.appendChild(tag);
  });
}

function handleSuggestInput() {
  const query = sanitizeSingleTerm(suggestInput.value);
  suggestTags.innerHTML = "";
  if (!query) return;

  const results = ingredients.filter((item) => {
    const candidates = [item.name_jp, item.name_en, ...(item.aliases || [])].map((v) => v.toLowerCase());
    return candidates.some((candidate) => candidate.startsWith(query) || candidate.includes(query));
  });

  renderSuggests(results);
}

function handleOcr() {
  const file = ocrImage.files?.[0];
  if (!file) {
    ocrStatus.textContent = "画像ファイルを選択してください。";
    return;
  }

  ocrStatus.textContent = "解析中...";
  const reader = new FileReader();
  reader.onload = () => {
    const data = reader.result;
    Tesseract.recognize(data, "jpn+eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          ocrStatus.textContent = `解析中... ${Math.round((m.progress || 0) * 100)}%`;
        }
      },
    })
      .then(({ data: { text } }) => {
        ocrStatus.textContent = "OCR完了";
        const items = cleanTextToItems(text);
        items.forEach(addToAnalysisList);
      })
      .catch(() => {
        ocrStatus.textContent = "OCRに失敗しました。";
      });
  };
  reader.readAsDataURL(file);
}

function findIngredient(name) {
  const lower = name.toLowerCase();
  return ingredients.find((item) => {
    const candidates = [item.name_jp, item.name_en, ...(item.aliases || [])].map((v) => v.toLowerCase());
    return candidates.includes(lower);
  });
}

function createCard(name, match) {
  let colorClass = "card-gray";
  let description = "このツールの成分データに掲載がありません。";
  if (match) {
    if (match.risk === 0) colorClass = "card-green";
    if (match.risk === 1) colorClass = "card-yellow";
    if (match.risk === 2) colorClass = "card-red";
    description = match.desc;
  }

  const card = document.createElement("div");
  card.className = `result-card ${colorClass}`;

  const band = document.createElement("div");
  band.className = "band";

  const content = document.createElement("div");
  content.className = "card-content";

  const title = document.createElement("h3");
  title.textContent = name;
  const para = document.createElement("p");
  para.textContent = description;

  content.appendChild(title);
  content.appendChild(para);
  card.appendChild(band);
  card.appendChild(content);
  return card;
}

function handleAnalyze() {
  resultCards.innerHTML = "";
  const names = Array.from(ingredientTags.querySelectorAll(".name")).map((el) => el.textContent.toLowerCase());
  names.forEach((name) => {
    const match = findIngredient(name);
    const card = createCard(name, match);
    resultCards.appendChild(card);
  });
  document.getElementById("result").scrollIntoView({ behavior: "smooth" });
}

function toggleBulk(event) {
  if (event.target.tagName.toLowerCase() !== "h2") return;
  bulkSection.classList.toggle("open");
}

bulkSection.addEventListener("click", toggleBulk);
suggestInput.addEventListener("input", handleSuggestInput);
bulkButton.addEventListener("click", handleBulkAdd);
ocrButton.addEventListener("click", handleOcr);
analyzeButton.addEventListener("click", handleAnalyze);
