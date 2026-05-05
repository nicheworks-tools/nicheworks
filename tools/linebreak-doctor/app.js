"use strict";

/* ===============================
   共通ユーティリティ
================================= */
const inputEl = document.getElementById("input");
const formatBtn = document.getElementById("formatBtn");
const resetBtn = document.getElementById("resetBtn");
const resultsEl = document.getElementById("results");
const statusEl = document.getElementById("status");
const charCountEl = document.getElementById("charCount");
const toastEl = document.getElementById("toast");

if (inputEl) {
  inputEl.removeAttribute("stable");
  inputEl.removeAttribute("content");
  inputEl.setAttribute("placeholder", "ここに整形したい文章を貼り付けてください");
}

let toastTimer = null;

function setStatus(message, isError = false) {
  if (!statusEl) return;
  statusEl.textContent = message;
  statusEl.classList.toggle("is-error", isError);
}

function showToast(message, isError = false) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.toggle("is-error", isError);
  toastEl.classList.add("is-visible");

  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.remove("is-visible");
  }, 2600);
}

function updateCharCount() {
  if (!charCountEl || !inputEl) return;
  charCountEl.textContent = String(inputEl.value.length);
}

async function copyText(text, label) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      showToast(`${label}向けテキストをコピーしました。`);
      return true;
    }
    throw new Error("Clipboard API unavailable");
  } catch (_) {
    const fallback = document.createElement("textarea");
    fallback.value = text;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.top = "-9999px";
    fallback.style.left = "-9999px";
    document.body.appendChild(fallback);
    fallback.focus();
    fallback.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch (_) {
      copied = false;
    }

    document.body.removeChild(fallback);

    if (copied) {
      showToast(`${label}向けテキストをコピーしました。`);
      return true;
    }

    showToast("コピーできませんでした。テキストを選択して手動でコピーしてください。", true);
    return false;
  }
}

function createTextElement(tagName, className, text) {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  el.textContent = text;
  return el;
}

/* ===============================
   SNSごとの整形ロジック
================================= */
function normalizeLineBreaks(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function trimLineEdges(text) {
  return text.replace(/^[ \t]+/gm, "").replace(/[ \t]+$/gm, "");
}

function keepBlankLinesWithZeroWidthSpace(text) {
  return text.replace(/\n\n/g, "\n\u200B\n");
}

function addZeroWidthSpaceAfterEmojiLine(text) {
  return text.replace(/([\p{Emoji_Presentation}\p{Extended_Pictographic}])\n/gu, "$1\u200B\n");
}

function formatX(text) {
  let output = normalizeLineBreaks(text);
  output = trimLineEdges(output);
  output = output.replace(/\n{2,}/g, "\n");
  return output.trim();
}

function formatInstagram(text) {
  let output = normalizeLineBreaks(text);
  output = trimLineEdges(output);
  output = output.replace(/\n{3,}/g, "\n\n");
  output = addZeroWidthSpaceAfterEmojiLine(output);
  return output.trim();
}

function formatLine(text) {
  return normalizeLineBreaks(text).trim();
}

function formatFacebook(text) {
  let output = normalizeLineBreaks(text);
  output = trimLineEdges(output);
  output = output.replace(/\n{3,}/g, "\n\n");
  output = keepBlankLinesWithZeroWidthSpace(output);
  return output.trim();
}

function formatLinkedIn(text) {
  let output = normalizeLineBreaks(text);
  output = trimLineEdges(output);
  output = output.replace(/\n{3,}/g, "\n\n");
  output = keepBlankLinesWithZeroWidthSpace(output);
  output = addZeroWidthSpaceAfterEmojiLine(output);
  return output.trim();
}

const snsList = [
  {
    title: "X",
    formatter: formatX,
    guide: "連続改行を1つにし、行頭・行末の余分な空白を削除します。短文投稿や告知文向けです。"
  },
  {
    title: "Instagram",
    formatter: formatInstagram,
    guide: "連続改行を最大2つに整え、行頭・行末の空白を削除します。絵文字直後の改行維持にゼロ幅スペースを使う場合があります。"
  },
  {
    title: "LINE",
    formatter: formatLine,
    guide: "改行コードを統一します。LINEは改行を比較的保持しやすいため、過剰な変換は行いません。"
  },
  {
    title: "Facebook",
    formatter: formatFacebook,
    guide: "連続改行を最大2つに整え、空行維持のためゼロ幅スペースを入れる場合があります。"
  },
  {
    title: "LinkedIn",
    formatter: formatLinkedIn,
    guide: "段落が詰まりすぎないように連続改行を整理し、空行維持のためゼロ幅スペースを使う場合があります。"
  }
];

/* ===============================
   出力生成
================================= */
function buildResultCard(sns, formatted) {
  const block = document.createElement("section");
  block.className = "sns-block";

  const heading = createTextElement("h2", null, `${sns.title}向け`);
  const pre = createTextElement("pre", "result-text", formatted);

  const copyButton = document.createElement("button");
  copyButton.type = "button";
  copyButton.className = "copy-btn";
  copyButton.textContent = `${sns.title}向けをコピー`;
  copyButton.addEventListener("click", () => copyText(formatted, sns.title));

  const details = document.createElement("details");
  details.className = "sns-guide";

  const summary = createTextElement("summary", null, "この整形になる理由");
  const guide = createTextElement("p", "sns-guide-text", sns.guide);

  details.append(summary, guide);
  block.append(heading, pre, copyButton, details);
  return block;
}

function renderResults() {
  const rawInput = inputEl.value || "";
  const trimmedInput = rawInput.trim();

  resultsEl.replaceChildren();

  if (!trimmedInput) {
    setStatus("整形する文章を入力してください。", true);
    inputEl.focus();
    return;
  }

  const fragment = document.createDocumentFragment();
  snsList.forEach((sns) => {
    const formatted = sns.formatter(rawInput);
    fragment.appendChild(buildResultCard(sns, formatted));
  });

  resultsEl.appendChild(fragment);
  setStatus("SNS別の整形結果を生成しました。投稿前に各SNSの投稿画面で表示を確認してください。", false);
  showToast("整形結果を生成しました。");
}

function resetTool() {
  inputEl.value = "";
  resultsEl.replaceChildren();
  setStatus("");
  updateCharCount();
  showToast("入力と結果をリセットしました。");
  inputEl.focus();
}

if (inputEl && formatBtn && resetBtn && resultsEl) {
  inputEl.addEventListener("input", updateCharCount);
  formatBtn.addEventListener("click", renderResults);
  resetBtn.addEventListener("click", resetTool);
  updateCharCount();
}
