// ===============================
// URL Title Collector - app.js
// ===============================

const fetchBtn = document.getElementById("fetchBtn");
const sampleBtn = document.getElementById("sampleBtn");
const urlInput = document.getElementById("urlInput");
const resultsDiv = document.getElementById("results");
const progressWrap = document.getElementById("progressWrap");
const progressBar = document.getElementById("progressBar");
const toast = document.getElementById("toast");

const countArea = document.getElementById("countArea");
const countTotal = document.getElementById("countTotal");
const countSuccess = document.getElementById("countSuccess");
const countFail = document.getElementById("countFail");
const countSkip = document.getElementById("countSkip");

const exportArea = document.getElementById("exportArea");
const resetBtn = document.getElementById("resetBtn");
const copyCsvBtn = document.getElementById("copyCsvBtn");
const copyTsvBtn = document.getElementById("copyTsvBtn");

const WORKER_URL = "https://floral-voice-bfc0.nicheworks-tools.workers.dev/?url=";
const MAX_URLS = 50;
const FETCH_TIMEOUT_MS = 10000;
const SAMPLE_URLS = [
  "https://nicheworks.app/",
  "https://example.com/",
  "https://example.com/",
  "not-a-url",
  "javascript:alert(1)"
].join("\n");

let latestResults = [];

fetchBtn.addEventListener("click", handleFetch);
copyCsvBtn.addEventListener("click", () => copyResults("csv"));
copyTsvBtn.addEventListener("click", () => copyResults("tsv"));
resetBtn.addEventListener("click", resetTool);

if (sampleBtn) {
  sampleBtn.addEventListener("click", () => {
    urlInput.value = SAMPLE_URLS;
    showToast("サンプルURLを入力しました。 / Sample URLs loaded.");
  });
}

async function handleFetch() {
  const parsed = parseInputUrls(urlInput.value);

  if (parsed.length === 0) {
    showToast("URLを入力してください。 / Enter at least one URL.");
    return;
  }

  latestResults = [];
  resultsDiv.innerHTML = "";
  progressWrap.classList.remove("hidden");
  countArea.classList.remove("hidden");
  exportArea.classList.add("hidden");
  progressBar.style.width = "0%";
  setCounts(parsed.length, 0, 0, 0);
  fetchBtn.disabled = true;

  let success = 0;
  let fail = 0;
  let skip = 0;

  for (let i = 0; i < parsed.length; i += 1) {
    const item = parsed[i];
    let result;

    if (item.status !== "ready") {
      result = {
        raw: item.raw,
        url: item.url || item.raw,
        title: "",
        status: item.status
      };
    } else {
      result = await fetchTitle(item.url);
    }

    latestResults.push(result);

    if (result.status === "success") success += 1;
    else if (isSkipStatus(result.status)) skip += 1;
    else fail += 1;

    setCounts(parsed.length, success, fail, skip);
    progressBar.style.width = `${Math.round(((i + 1) / parsed.length) * 100)}%`;
  }

  renderResults(latestResults);
  exportArea.classList.remove("hidden");
  fetchBtn.disabled = false;
  showToast("処理が完了しました。 / Done.");
}

function parseInputUrls(text) {
  const seen = new Set();
  const lines = text.split("\n");
  const results = [];
  let acceptedCount = 0;

  for (const line of lines) {
    const raw = cleanRawUrl(line);
    if (!raw) continue;

    if (acceptedCount >= MAX_URLS) {
      results.push({ raw, status: "skipped-limit" });
      continue;
    }

    try {
      const url = new URL(raw);
      if (!["http:", "https:"].includes(url.protocol)) {
        results.push({ raw, status: "invalid-scheme" });
        acceptedCount += 1;
        continue;
      }

      const normalized = url.href;
      if (seen.has(normalized)) {
        results.push({ raw, url: normalized, status: "duplicate" });
        acceptedCount += 1;
        continue;
      }

      seen.add(normalized);
      results.push({ raw, url: normalized, status: "ready" });
      acceptedCount += 1;
    } catch {
      results.push({ raw, status: "invalid-url" });
      acceptedCount += 1;
    }
  }

  return results;
}

function cleanRawUrl(line) {
  return line
    .trim()
    .replace(/^[<「『\"']+/, "")
    .replace(/[>」』\"']+$/, "")
    .trim();
}

async function fetchTitle(url) {
  try {
    const response = await fetchWithTimeout(WORKER_URL + encodeURIComponent(url), FETCH_TIMEOUT_MS);
    const text = await response.text();
    const title = extractTitle(text);

    if (!response.ok) {
      return { url, title: title || "", status: "http-error" };
    }

    if (!title) {
      return { url, title: "", status: "no-title" };
    }

    return { url, title: decodeHtmlEntities(title), status: "success" };
  } catch (error) {
    return {
      url,
      title: "",
      status: error.name === "AbortError" ? "timeout" : "network-error"
    };
  }
}

async function fetchWithTimeout(url, ms) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    window.clearTimeout(timer);
  }
}

function extractTitle(html) {
  const match = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!match) return "";
  return match[1].replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(text) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = text;
  return textarea.value;
}

function renderResults(results) {
  resultsDiv.innerHTML = "";

  if (!results.length) return;

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  ["URL", "Title", "Status"].forEach((label) => {
    const th = document.createElement("th");
    th.textContent = label;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  results.forEach((result) => {
    const tr = document.createElement("tr");
    const urlTd = document.createElement("td");
    const titleTd = document.createElement("td");
    const statusTd = document.createElement("td");

    urlTd.textContent = result.url || result.raw || "";
    titleTd.textContent = result.title || "";
    titleTd.title = result.title || "";
    statusTd.textContent = result.status;
    statusTd.className = statusClass(result.status);

    tr.append(urlTd, titleTd, statusTd);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  resultsDiv.appendChild(table);
}

function statusClass(status) {
  switch (status) {
    case "success": return "status-success";
    case "duplicate":
    case "invalid-url":
    case "invalid-scheme":
    case "skipped-limit": return "status-skipped";
    case "no-title": return "status-no-title";
    case "http-error": return "status-http-error";
    case "network-error":
    case "worker-error":
    case "timeout": return "status-network-error";
    default: return "";
  }
}

function isSkipStatus(status) {
  return ["duplicate", "invalid-url", "invalid-scheme", "skipped-limit"].includes(status);
}

function setCounts(total, success, fail, skip) {
  const isEnglish = document.documentElement.lang === "en";
  countTotal.textContent = `${isEnglish ? "Total" : "合計"}: ${total}`;
  countSuccess.textContent = `${isEnglish ? "Success" : "成功"}: ${success}`;
  countFail.textContent = `${isEnglish ? "Failed" : "失敗"}: ${fail}`;
  if (countSkip) countSkip.textContent = `${isEnglish ? "Skipped" : "スキップ"}: ${skip}`;
}

async function copyResults(type) {
  if (!latestResults.length) {
    showToast("コピーする結果がありません。 / No results to copy.");
    return;
  }

  const text = buildExportText(latestResults, type);
  const ok = await copyToClipboard(text);
  if (ok) {
    showToast(`${type.toUpperCase()} をコピーしました。 / ${type.toUpperCase()} copied.`);
  } else {
    showToast("コピーに失敗しました。結果を選択して手動でコピーしてください。 / Copy failed.");
  }
}

function buildExportText(results, type) {
  const sep = type === "csv" ? "," : "\t";
  const newline = type === "csv" ? "\r\n" : "\n";
  const header = ["url", "title", "status"];
  const rows = results.map((result) => [result.url || result.raw || "", result.title || "", result.status]);
  return [header, ...rows]
    .map((row) => row.map((cell) => type === "csv" ? csvCell(cell) : tsvCell(cell)).join(sep))
    .join(newline);
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function tsvCell(value) {
  return String(value ?? "").replace(/[\t\r\n]+/g, " ");
}

async function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // fallback below
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();

  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    document.body.removeChild(textarea);
  }
}

function resetTool() {
  urlInput.value = "";
  latestResults = [];
  resultsDiv.innerHTML = "";
  progressWrap.classList.add("hidden");
  countArea.classList.add("hidden");
  exportArea.classList.add("hidden");
  progressBar.style.width = "0%";
  setCounts(0, 0, 0, 0);
  showToast("リセットしました。 / Reset complete.");
}

let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.add("hidden"), 2600);
}
