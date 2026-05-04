/* ============================================================
   Redirect Unwrapper - local URL string analyzer (NicheWorks)
   - Does not open input URLs
   - Does not fetch external URLs
============================================================ */

const UI_TEXT = {
  ja: {
    enterUrl: "URLを入力してください。",
    invalidUrl: "URLとして解析できませんでした。入力内容を確認してください。",
    copied: "コピーしました",
    copyFailed: "コピーに失敗しました",
    noCandidates: "URL内に転送先候補は見つかりませんでした。",
    candidateFound: "転送先候補を抽出しました。",
    notRedirectTracker: "短縮URLのサーバー側301/302リダイレクトは、このツール単体では追跡しません。",
    noWarnings: "強い警告はありません。ただし安全性を保証するものではありません。",
    destinationParam: "転送先らしいパラメータ",
    embeddedUrl: "URL文字列内の埋め込みURL",
    originalUrl: "元URL",
    candidateUrl: "候補URL",
    warnings: {
      externalNotChecked: "このツールはURLを開かず、外部サイトへアクセスしません。表示結果は文字列解析です。",
      insecureHttp: "HTTP URLです。暗号化されていない可能性があります。",
      dangerousScheme: "危険または通常のWeb閲覧に不向きなスキームです。開かないでください。",
      unsupportedScheme: "http/https以外のスキームです。通常のWeb URLとして扱えない可能性があります。",
      ipHost: "ホストがIPアドレスです。偽装・一時サイト・管理画面URLの可能性に注意してください。",
      punycode: "ドメインにpunycode（xn--）が含まれます。見た目が紛らわしい国際化ドメインの可能性があります。",
      hasCredentials: "URL内にユーザー名/パスワード形式の情報が含まれます。表示ドメインの誤認に注意してください。",
      hasEmbedded: "URL内に別のURLが含まれています。",
      multiEmbedded: "URL内に複数のURL候補が含まれています。",
      hostMismatch: "表示ドメインと転送先候補のドメインが異なります。",
      manyTrackers: "追跡パラメータが多く含まれています。",
      urlInPath: "パス部分に別URLらしい文字列が含まれています。"
    }
  },
  en: {
    enterUrl: "Please enter a URL.",
    invalidUrl: "The input could not be parsed as a URL. Please check it.",
    copied: "Copied",
    copyFailed: "Copy failed",
    noCandidates: "No embedded destination URL candidate was found.",
    candidateFound: "Destination URL candidate extracted.",
    notRedirectTracker: "This tool does not follow server-side 301/302 redirects by itself.",
    noWarnings: "No strong warnings were detected, but this does not guarantee safety.",
    destinationParam: "Likely destination parameter",
    embeddedUrl: "Embedded URL in the string",
    originalUrl: "Original URL",
    candidateUrl: "Candidate URL",
    warnings: {
      externalNotChecked: "This tool does not open the URL or access external sites. Results are based on string analysis.",
      insecureHttp: "This is an HTTP URL. It may not be encrypted.",
      dangerousScheme: "This URL uses a dangerous or non-browsing scheme. Do not open it.",
      unsupportedScheme: "This URL uses a non-http/https scheme and may not behave like a normal web URL.",
      ipHost: "The host is an IP address. Be careful with spoofed, temporary, or admin URLs.",
      punycode: "The domain contains punycode (xn--). It may be a visually confusing internationalized domain.",
      hasCredentials: "The URL contains username/password-style information. Be careful not to misread the real host.",
      hasEmbedded: "Another URL is embedded inside this URL.",
      multiEmbedded: "Multiple embedded URL candidates were found.",
      hostMismatch: "The visible host and extracted destination host are different.",
      manyTrackers: "Many tracking parameters are included.",
      urlInPath: "The path appears to contain another URL."
    }
  }
};

const DESTINATION_PARAM_KEYS = new Set([
  "url",
  "u",
  "q",
  "target",
  "target_url",
  "redirect",
  "redirect_url",
  "redir",
  "dest",
  "destination",
  "to",
  "continue",
  "next",
  "return",
  "return_url",
  "r",
  "link"
]);

const TRACKING_PARAM_KEYS = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "utm_id",
  "fbclid",
  "gclid",
  "dclid",
  "msclkid",
  "igshid",
  "mc_cid",
  "mc_eid",
  "yclid",
  "ref",
  "ref_src",
  "spm",
  "src",
  "campaign",
  "feature"
]);

const DANGEROUS_SCHEMES = new Set([
  "javascript:",
  "data:",
  "file:",
  "blob:",
  "vbscript:"
]);

let currentLang = "ja";
let lastAnalysis = null;

document.addEventListener("DOMContentLoaded", () => {
  setupLanguage();
  setupEvents();
});

function setupLanguage() {
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const browserLang = (navigator.language || "").toLowerCase();
  currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const applyLang = (lang) => {
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });

    document.querySelectorAll("[data-i18n-key]").forEach((el) => {
      const key = el.dataset.i18nKey;
      if (key && UI_TEXT[lang][key]) {
        el.textContent = UI_TEXT[lang][key];
      }
    });

    document.querySelectorAll("[data-placeholder-ja]").forEach((el) => {
      el.placeholder = el.dataset[`placeholder${lang === "ja" ? "Ja" : "En"}`] || "";
    });

    langButtons.forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang);
    });

    if (lastAnalysis) {
      renderAnalysis(lastAnalysis);
    }
  };

  langButtons.forEach((button) => {
    button.addEventListener("click", () => applyLang(button.dataset.lang));
  });

  applyLang(currentLang);
}

function setupEvents() {
  const analyzeBtn = document.getElementById("analyzeBtn");
  const urlInput = document.getElementById("urlInput");
  const copyCandidatesBtn = document.getElementById("copyCandidatesBtn");
  const copySummaryBtn = document.getElementById("copySummaryBtn");

  analyzeBtn.addEventListener("click", startAnalysis);

  urlInput.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      startAnalysis();
    }
  });

  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      urlInput.value = button.dataset.sample;
      startAnalysis();
    });
  });

  copyCandidatesBtn.addEventListener("click", () => {
    if (!lastAnalysis) return;
    const text = lastAnalysis.candidates.map((candidate) => candidate.url).join("\n");
    copyText(text || UI_TEXT[currentLang].noCandidates, copyCandidatesBtn);
  });

  copySummaryBtn.addEventListener("click", () => {
    if (!lastAnalysis) return;
    copyText(buildPlainSummary(lastAnalysis), copySummaryBtn);
  });
}

function startAnalysis() {
  const input = document.getElementById("urlInput").value.trim();
  const errorEl = document.getElementById("errorBox");

  errorEl.hidden = true;
  errorEl.textContent = "";

  if (!input) {
    showError(UI_TEXT[currentLang].enterUrl);
    return;
  }

  try {
    const analysis = analyzeUrlString(input);
    lastAnalysis = analysis;
    renderAnalysis(analysis);
  } catch (error) {
    lastAnalysis = null;
    document.getElementById("results").hidden = true;
    showError(UI_TEXT[currentLang].invalidUrl);
  }
}

function showError(message) {
  const errorEl = document.getElementById("errorBox");
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function analyzeUrlString(input) {
  const normalized = normalizeUrl(input);
  const parsed = new URL(normalized);
  const queryParams = Array.from(parsed.searchParams.entries()).map(([key, value]) => ({
    key,
    value,
    decodedValue: decodeRepeated(value)
  }));

  const trackingParams = queryParams.filter((param) => isTrackingParam(param.key));
  const candidates = extractEmbeddedUrls(parsed, queryParams);
  const warnings = buildWarnings(parsed, queryParams, candidates);

  return {
    input,
    normalized: parsed.href,
    scheme: parsed.protocol,
    host: parsed.hostname,
    path: parsed.pathname,
    queryParams,
    trackingParams,
    candidates,
    warnings
  };
}

function normalizeUrl(input) {
  let value = input.trim();

  if (value.startsWith("//")) {
    value = `https:${value}`;
  }

  if (!/^[a-z][a-z0-9+.-]*:/i.test(value)) {
    value = `https://${value}`;
  }

  return value;
}

function decodeRepeated(value, max = 4) {
  let current = String(value || "").replace(/\+/g, "%20");

  for (let i = 0; i < max; i += 1) {
    try {
      const next = decodeURIComponent(current);
      if (next === current) break;
      current = next;
    } catch (_) {
      break;
    }
  }

  return current;
}

function extractEmbeddedUrls(parsed, queryParams) {
  const candidates = [];
  const seen = new Set();

  queryParams.forEach((param) => {
    const key = param.key.toLowerCase();
    const decoded = param.decodedValue;

    if (DESTINATION_PARAM_KEYS.has(key)) {
      addCandidatesFromText(candidates, seen, decoded, {
        source: UI_TEXT[currentLang].destinationParam,
        key: param.key
      });
    } else {
      addCandidatesFromText(candidates, seen, decoded, {
        source: UI_TEXT[currentLang].embeddedUrl,
        key: param.key
      });
    }
  });

  addCandidatesFromText(candidates, seen, decodeRepeated(parsed.pathname), {
    source: "path",
    key: ""
  });

  addCandidatesFromText(candidates, seen, decodeRepeated(parsed.hash), {
    source: "hash",
    key: ""
  });

  return candidates;
}

function addCandidatesFromText(candidates, seen, text, meta) {
  const matches = findHttpUrls(text);

  matches.forEach((rawUrl) => {
    try {
      const parsedCandidate = new URL(rawUrl);
      const normalizedCandidate = parsedCandidate.href;

      if (seen.has(normalizedCandidate)) return;
      seen.add(normalizedCandidate);

      candidates.push({
        url: normalizedCandidate,
        host: parsedCandidate.hostname,
        scheme: parsedCandidate.protocol,
        source: meta.source,
        key: meta.key
      });
    } catch (_) {
      // Ignore malformed embedded URL-looking strings.
    }
  });
}

function findHttpUrls(text) {
  const decoded = decodeRepeated(text);
  const matches = decoded.match(/https?:\/\/[^\s"'<>]+/gi) || [];
  return matches.map((url) => url.replace(/[)\],.;]+$/g, ""));
}

function isTrackingParam(key) {
  const normalized = key.toLowerCase();
  return normalized.startsWith("utm_") || TRACKING_PARAM_KEYS.has(normalized);
}

function buildWarnings(parsed, queryParams, candidates) {
  const warnings = new Set();
  const t = UI_TEXT[currentLang].warnings;

  warnings.add(t.externalNotChecked);

  if (parsed.protocol === "http:") {
    warnings.add(t.insecureHttp);
  }

  if (DANGEROUS_SCHEMES.has(parsed.protocol)) {
    warnings.add(t.dangerousScheme);
  } else if (!["http:", "https:"].includes(parsed.protocol)) {
    warnings.add(t.unsupportedScheme);
  }

  if (isIpAddress(parsed.hostname)) {
    warnings.add(t.ipHost);
  }

  if (isPunycodeHost(parsed.hostname)) {
    warnings.add(t.punycode);
  }

  if (parsed.username || parsed.password) {
    warnings.add(t.hasCredentials);
  }

  if (candidates.length > 0) {
    warnings.add(t.hasEmbedded);
  }

  if (candidates.length > 1) {
    warnings.add(t.multiEmbedded);
  }

  if (candidates.some((candidate) => candidate.host && candidate.host !== parsed.hostname)) {
    warnings.add(t.hostMismatch);
  }

  const trackingCount = queryParams.filter((param) => isTrackingParam(param.key)).length;
  if (trackingCount >= 3) {
    warnings.add(t.manyTrackers);
  }

  if (findHttpUrls(parsed.pathname).length > 0) {
    warnings.add(t.urlInPath);
  }

  candidates.forEach((candidate) => {
    if (candidate.scheme === "http:") {
      warnings.add(`${t.insecureHttp} (${candidate.host})`);
    }
    if (isIpAddress(candidate.host)) {
      warnings.add(`${t.ipHost} (${candidate.host})`);
    }
    if (isPunycodeHost(candidate.host)) {
      warnings.add(`${t.punycode} (${candidate.host})`);
    }
  });

  return Array.from(warnings);
}

function isIpAddress(hostname) {
  if (!hostname) return false;
  const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const ipv6 = hostname.includes(":");
  return ipv4 || ipv6;
}

function isPunycodeHost(hostname) {
  return hostname.toLowerCase().split(".").some((part) => part.startsWith("xn--"));
}

function renderAnalysis(analysis) {
  const results = document.getElementById("results");
  const summary = document.getElementById("resultSummary");
  const details = document.getElementById("resultDetails");
  const candidates = document.getElementById("candidateList");
  const warnings = document.getElementById("warningList");
  const copyCandidatesBtn = document.getElementById("copyCandidatesBtn");

  results.hidden = false;
  summary.textContent = analysis.candidates.length > 0
    ? UI_TEXT[currentLang].candidateFound
    : `${UI_TEXT[currentLang].noCandidates} ${UI_TEXT[currentLang].notRedirectTracker}`;

  details.innerHTML = "";
  appendDetail(details, "Input", analysis.input);
  appendDetail(details, "Normalized", analysis.normalized);
  appendDetail(details, "Scheme", analysis.scheme || "-");
  appendDetail(details, "Host", analysis.host || "-");
  appendDetail(details, "Path", analysis.path || "/");

  const trackingText = analysis.trackingParams.length > 0
    ? analysis.trackingParams.map((param) => param.key).join(", ")
    : "-";
  appendDetail(details, "Tracking parameters", trackingText);

  candidates.innerHTML = "";
  if (analysis.candidates.length === 0) {
    const item = document.createElement("li");
    item.textContent = UI_TEXT[currentLang].noCandidates;
    candidates.appendChild(item);
  } else {
    analysis.candidates.forEach((candidate, index) => {
      const item = document.createElement("li");
      const title = document.createElement("strong");
      title.textContent = `${index + 1}. ${candidate.url}`;
      const meta = document.createElement("span");
      meta.className = "candidate-meta";
      meta.textContent = `host: ${candidate.host || "-"} / source: ${candidate.key || candidate.source}`;
      item.appendChild(title);
      item.appendChild(meta);
      candidates.appendChild(item);
    });
  }

  warnings.innerHTML = "";
  const warningItems = analysis.warnings.length > 0
    ? analysis.warnings
    : [UI_TEXT[currentLang].noWarnings];

  warningItems.forEach((warning) => {
    const item = document.createElement("li");
    item.textContent = warning;
    warnings.appendChild(item);
  });

  copyCandidatesBtn.disabled = analysis.candidates.length === 0;
}

function appendDetail(container, label, value) {
  const row = document.createElement("div");
  row.className = "result-row";

  const labelEl = document.createElement("div");
  labelEl.className = "result-label";
  labelEl.textContent = label;

  const valueEl = document.createElement("div");
  valueEl.className = "result-value";
  valueEl.textContent = value;

  row.appendChild(labelEl);
  row.appendChild(valueEl);
  container.appendChild(row);
}

function buildPlainSummary(analysis) {
  const lines = [
    "Redirect Unwrapper result",
    `Input: ${analysis.input}`,
    `Normalized: ${analysis.normalized}`,
    `Scheme: ${analysis.scheme || "-"}`,
    `Host: ${analysis.host || "-"}`,
    `Path: ${analysis.path || "/"}`,
    `Tracking parameters: ${analysis.trackingParams.map((param) => param.key).join(", ") || "-"}`,
    "",
    "Candidates:",
    ...(analysis.candidates.length > 0
      ? analysis.candidates.map((candidate, index) => `${index + 1}. ${candidate.url}`)
      : [`- ${UI_TEXT[currentLang].noCandidates}`]),
    "",
    "Warnings:",
    ...(analysis.warnings.length > 0 ? analysis.warnings.map((warning) => `- ${warning}`) : [`- ${UI_TEXT[currentLang].noWarnings}`])
  ];

  return lines.join("\n");
}

async function copyText(text, button) {
  const originalHtml = button.innerHTML;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
    } else {
      fallbackCopy(text);
    }
    button.textContent = UI_TEXT[currentLang].copied;
  } catch (_) {
    button.textContent = UI_TEXT[currentLang].copyFailed;
  }

  setTimeout(() => {
    button.innerHTML = originalHtml;
    button.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });
  }, 1200);
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.top = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
}
