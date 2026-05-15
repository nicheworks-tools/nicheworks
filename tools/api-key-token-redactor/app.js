const el = (id) => document.getElementById(id);

let currentLang = "ja";
let lastResult = null;
let customRules = [];

const defaultLang = () => {
  const lang = (navigator.language || "").toLowerCase();
  return lang.startsWith("ja") ? "ja" : "en";
};

const t = (ja, en) => (currentLang === "ja" ? ja : en);

const applyLang = (lang) => {
  currentLang = lang || defaultLang();
  const nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach((node) => {
    node.style.display = node.dataset.i18n === currentLang ? "" : "none";
  });
  document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });
  document.querySelectorAll("[data-howto-link]").forEach((link) => {
    link.setAttribute("href", currentLang === "ja" ? "./howto/" : "./howto/en/");
  });
  if (lastResult) {
    renderFindings(lastResult.findings);
    updateSafetySummary(lastResult.findings);
  }
};

const placeholderFor = (text, useKeepLength, placeholder) => {
  if (useKeepLength) {
    return "*".repeat(Math.max(1, text.length));
  }
  return placeholder;
};

const lineNumberFor = (text, index) => text.slice(0, index).split(/\r\n|\r|\n/).length;

const maskForPreview = (value) => {
  const clean = String(value || "").replace(/\s+/g, " ").trim();
  if (!clean) return "[REDACTED]";
  if (clean.length <= 8) return `${clean.slice(0, 2)}…`;
  return `${clean.slice(0, 6)}…${clean.slice(-4)}`;
};

const previewFor = (text, matchStart, matchEnd, secretStart, secretEnd) => {
  const lineStart = text.lastIndexOf("\n", matchStart - 1) + 1;
  const nextBreak = text.indexOf("\n", matchEnd);
  const lineEnd = nextBreak === -1 ? text.length : nextBreak;
  const before = text.slice(lineStart, Math.max(lineStart, secretStart));
  const secret = text.slice(secretStart, secretEnd);
  const after = text.slice(Math.min(secretEnd, lineEnd), lineEnd);
  const raw = `${before}${maskForPreview(secret)}${after}`.replace(/\s+/g, " ").trim();
  if (!raw) return maskForPreview(secret);
  return raw.length > 140 ? `${raw.slice(0, 137)}...` : raw;
};

const escapeHtml = (value) => String(value).replace(/[&<>"]/g, (ch) => ({
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
}[ch]));

const severityRank = { high: 3, medium: 2, low: 1 };

const redactContent = (text, options) => {
  const findings = [];

  const hasOverlap = (start, end) => findings.some((item) => start < item.end && end > item.start);

  const addFinding = ({ match, value, valueIndex, type, label, severity }) => {
    if (!match || !value) return;
    const localOffset = typeof valueIndex === "number" ? valueIndex : match[0].indexOf(value);
    if (localOffset < 0) return;
    const start = match.index + localOffset;
    const end = start + value.length;
    if (start < 0 || end <= start || hasOverlap(start, end)) return;
    findings.push({
      type,
      label,
      severity,
      line: lineNumberFor(text, start),
      preview: previewFor(text, match.index, match.index + match[0].length, start, end),
      redacted: placeholderFor(value, options.keepLength, options.placeholder),
      start,
      end,
    });
  };

  const scanWhole = (regex, type, label, severity) => {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      addFinding({ match, value: match[0], valueIndex: 0, type, label, severity });
      if (match[0].length === 0) regex.lastIndex += 1;
    }
  };

  const scanGroup = (regex, groupIndex, type, label, severity) => {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = match[groupIndex];
      addFinding({ match, value, type, label, severity });
      if (match[0].length === 0) regex.lastIndex += 1;
    }
  };

  if (options.modePrivateKey) {
    scanWhole(/-----BEGIN [^-]*PRIVATE KEY-----[\s\S]*?-----END [^-]*PRIVATE KEY-----/g, "privateKey", "Private key block", "high");
  }

  if (options.modeBearer) {
    scanGroup(/(Authorization\s*:\s*Bearer\s+)([A-Za-z0-9\-._~+/=]{12,})/gi, 2, "bearer", "Authorization Bearer token", "high");
    scanGroup(/\b(Bearer\s+)([A-Za-z0-9\-._~+/=]{12,})/gi, 2, "bearer", "Bearer token", "high");
    scanGroup(/(Authorization\s*:\s*)(?!Bearer\s+)([^\r\n]{8,})/gi, 2, "header", "Authorization header", "high");
    scanGroup(/(-H\s+["']Authorization\s*:\s*Bearer\s+)([^"'\r\n]{12,})/gi, 2, "bearer", "curl Authorization Bearer token", "high");
  }

  if (options.modeJwt) {
    scanWhole(/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, "jwt", "JWT", "high");
  }

  if (options.modeApiKeys) {
    scanWhole(/\bsk-proj-[A-Za-z0-9_-]{12,}\b/g, "apiKeys", "OpenAI project key", "high");
    scanWhole(/\bsk-[A-Za-z0-9]{16,}\b/g, "apiKeys", "OpenAI API key", "high");
    scanWhole(/\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g, "apiKeys", "Stripe secret key", "high");
    scanWhole(/\brk_(?:live|test)_[A-Za-z0-9]{16,}\b/g, "apiKeys", "Stripe restricted key", "high");
    scanWhole(/\bgithub_pat_[A-Za-z0-9_]{20,}\b/g, "apiKeys", "GitHub fine-grained token", "high");
    scanWhole(/\bgh[opuslr]_[A-Za-z0-9]{20,}\b/g, "apiKeys", "GitHub token", "high");
    scanWhole(/\b(?:xox[baprs]|xapp)-[A-Za-z0-9-]{10,}\b/g, "apiKeys", "Slack token", "high");
    scanWhole(/\bAIza[0-9A-Za-z_-]{20,}\b/g, "apiKeys", "Google API key", "high");
    scanWhole(/\bSG\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, "apiKeys", "SendGrid API key", "high");
    scanWhole(/\bglpat-[A-Za-z0-9_-]{10,}\b/g, "apiKeys", "GitLab token", "high");
    scanWhole(/\bnpm_[A-Za-z0-9]{24,}\b/g, "apiKeys", "npm token", "high");
    scanWhole(/\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g, "apiKeys", "AWS access key ID", "high");
    scanWhole(/\b\d{8,12}:[A-Za-z0-9_-]{30,}\b/g, "apiKeys", "Telegram bot token", "high");
    scanWhole(/\b[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6,8}\.[A-Za-z0-9_-]{27,}\b/g, "apiKeys", "Discord-style token", "high");
  }

  if (options.modeGenericSecret) {
    const secretKeys = "_?auth[_-]?token|api[_-]?key|apikey|token|secret|password|passwd|pwd|client[_-]?secret|access[_-]?token|refresh[_-]?token|auth[_-]?token|private[_-]?key|npm[_-]?token|vercel[_-]?token|database[_-]?url|db[_-]?password|aws[_-]?secret[_-]?access[_-]?key|secretAccessKey";
    scanGroup(new RegExp(`(["']?\\b(?:${secretKeys})\\b["']?\\s*[:=]\\s*)(["'])([^"'\\r\\n]{8,})(["'])`, "gi"), 3, "genericSecret", "Quoted secret value", "medium");
    scanGroup(new RegExp(`(["']?\\b(?:${secretKeys})\\b["']?\\s*[:=]\\s*)([^\\s"',}\\]]{8,})`, "gi"), 2, "genericSecret", "Labeled secret value", "medium");
    scanGroup(/([?&](?:token|api_key|apikey|key|access_token|refresh_token|auth_token|client_secret|signature|sig)=)([^&#\s]{8,})/gi, 2, "urlQuery", "URL query secret", "medium");
    scanGroup(/(Cookie\s*:\s*)([^\r\n]{12,})/gi, 2, "cookie", "Cookie header", "medium");
    scanGroup(/(Set-Cookie\s*:\s*)([^\r\n]{12,})/gi, 2, "cookie", "Set-Cookie header", "medium");
    scanGroup(/(\/\/registry\.npmjs\.org\/:_authToken=)([^\s\r\n]{8,})/gi, 2, "genericSecret", "npm auth token", "high");
  }

  if (options.proActive && Array.isArray(options.customRules)) {
    options.customRules.forEach((rule) => {
      if (!rule || !rule.prefix) return;
      const escapedPrefix = rule.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const minLength = Math.max(4, Number(rule.minLength || 12));
      const pattern = new RegExp(`\\b${escapedPrefix}[A-Za-z0-9._~+/=-]{${minLength},}`, "g");
      scanWhole(pattern, "customRule", rule.label || `Custom: ${rule.prefix}`, rule.severity === "medium" ? "medium" : "high");
    });
  }

  findings.sort((a, b) => a.start - b.start || severityRank[b.severity] - severityRank[a.severity]);

  let output = "";
  let cursor = 0;
  findings.forEach((item) => {
    output += text.slice(cursor, item.start);
    output += placeholderFor(text.slice(item.start, item.end), options.keepLength, options.placeholder);
    cursor = item.end;
  });
  output += text.slice(cursor);

  const counts = findings.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    acc[item.severity] = (acc[item.severity] || 0) + 1;
    acc.total += 1;
    return acc;
  }, {
    apiKeys: 0,
    bearer: 0,
    jwt: 0,
    privateKey: 0,
    genericSecret: 0,
    header: 0,
    urlQuery: 0,
    cookie: 0,
    high: 0,
    medium: 0,
    low: 0,
    total: 0,
  });

  return { output, counts, findings };
};

const setText = (id, value) => {
  const node = el(id);
  if (node) node.textContent = String(value);
};

const updateSummary = (counts) => {
  setText("countApiKeys", counts.apiKeys || 0);
  setText("countBearer", counts.bearer || 0);
  setText("countJwt", counts.jwt || 0);
  setText("countPrivateKey", counts.privateKey || 0);
  setText("countGeneric", counts.genericSecret || 0);
  setText("countHeaders", (counts.header || 0) + (counts.cookie || 0));
  setText("countUrlQuery", counts.urlQuery || 0);
  setText("countHigh", counts.high || 0);
  setText("countMedium", counts.medium || 0);
  setText("countTotal", counts.total || 0);
};

const renderFindings = (findings = []) => {
  const list = el("findingsList");
  if (!list) return;
  if (!findings.length) {
    list.innerHTML = `<p class="empty-state">${escapeHtml(t("検出結果はまだありません。検出0件でも、共有前に目視確認してください。", "No findings yet. Even with zero detections, review manually before sharing."))}</p>`;
    return;
  }
  list.innerHTML = findings.map((item) => `
    <article class="finding-item severity-${escapeHtml(item.severity)}">
      <div class="finding-main">
        <span class="severity-pill">${escapeHtml(item.severity.toUpperCase())}</span>
        <strong>${escapeHtml(item.label)}</strong>
        <span class="finding-line">${escapeHtml(t("行", "Line"))} ${escapeHtml(item.line)}</span>
      </div>
      <code>${escapeHtml(item.preview)}</code>
    </article>
  `).join("");
};

const updateSafetySummary = (findings = []) => {
  const box = el("safetySummary");
  if (!box) return;
  const high = findings.filter((item) => item.severity === "high").length;
  const medium = findings.filter((item) => item.severity === "medium").length;
  const privateKeys = findings.filter((item) => item.type === "privateKey").length;
  const headers = findings.filter((item) => item.type === "bearer" || item.type === "header" || item.type === "cookie").length;
  if (!findings.length) {
    box.textContent = t("検出なし。ただし、独自形式の秘密情報・Cookie・URLパラメータ・メールアドレス・IPなどは残る可能性があります。", "No findings. Custom secrets, cookies, URL parameters, emails, or IP addresses may still remain.");
    box.className = "safety-summary warning";
    return;
  }
  box.textContent = t(
    `検出結果：${findings.length}件 / High：${high}件 / Medium：${medium}件 / 秘密鍵：${privateKeys}件 / ヘッダー系：${headers}件。検出結果のプレビューは一部マスク済みです。共有前に出力を再確認してください。`,
    `Findings: ${findings.length} / High: ${high} / Medium: ${medium} / Private keys: ${privateKeys} / Headers: ${headers}. Finding previews are partially masked. Review the output before sharing.`
  );
  box.className = high > 0 ? "safety-summary danger" : "safety-summary warning";
};

const emptyCounts = () => ({
  apiKeys: 0,
  bearer: 0,
  jwt: 0,
  privateKey: 0,
  genericSecret: 0,
  header: 0,
  urlQuery: 0,
  cookie: 0,
  high: 0,
  medium: 0,
  low: 0,
  total: 0,
});

const showToast = (msg) => {
  const toast = el("copyToast");
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 1600);
};

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};


const copyText = async (text) => {
  if (!text.trim()) return false;
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
    return true;
  }
};

const downloadFile = (filename, text, type = "text/plain;charset=utf-8") => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

const severityCounts = (findings = []) => ({
  high: findings.filter((item) => item.severity === "high").length,
  medium: findings.filter((item) => item.severity === "medium").length,
});

const selectedProfile = () => el("profileSelect")?.value || "GitHub Issue";

const rotationChecklist = (findings = []) => {
  const labels = findings.map((item) => `${item.label} ${item.type}`.toLowerCase());
  const has = (word) => labels.some((label) => label.includes(word));
  const rows = [
    ["GitHub", has("github"), "Revoke the leaked PAT/token, review repository and organization audit logs, and rotate CI secrets."],
    ["Slack", has("slack"), "Rotate bot/user tokens and inspect app installations and message exposure."],
    ["AWS", has("aws"), "Disable the access key, rotate paired secret access key, and review CloudTrail/IAM use."],
    ["Stripe", has("stripe"), "Roll secret/restricted keys and review dashboard events and webhook signing secrets."],
    ["npm", has("npm"), "Revoke the automation token and check recent package publish activity."],
    ["Google", has("google"), "Restrict or regenerate the API key and review API usage."],
    ["GitLab", has("gitlab"), "Revoke the token and inspect project/group activity."],
    ["Unknown generic secret", has("secret") || has("password") || has("custom"), "Identify owner, rotate at source, and confirm the old value no longer works."],
  ];
  return rows.map(([name, detected, note]) => `- [ ] ${name}${detected ? " (detected)" : ""}: ${note}`).join("\n");
};

const safeFindings = () => (lastResult?.findings || []).map((item) => ({
  type: item.type,
  label: item.label,
  severity: item.severity,
  line: item.line,
  preview: item.preview,
  redacted: item.redacted || "[REDACTED]",
}));

const currentRedactedOutput = () => el("outputText")?.value || "";

const ensureResult = () => {
  if (lastResult) return true;
  showToast(t("先に伏字化を実行してください", "Run redaction first"));
  return false;
};

const auditMarkdown = () => {
  const findings = safeFindings();
  const counts = severityCounts(findings);
  const table = findings.length
    ? findings.map((item) => `| ${item.severity.toUpperCase()} | ${item.type} | ${item.label} | ${item.line} | \`${item.preview.replace(/\|/g, "\\|")}\` |`).join("\n")
    : "| - | - | No findings | - | Manual review still required |";
  return `# Redaction Audit Report

## Summary
- Profile: ${selectedProfile()}
- Total findings: ${findings.length}
- Redacted output length: ${currentRedactedOutput().length} characters
- Processing: local browser redaction only; pasted input is not uploaded by this tool.

## Severity counts
- High: ${counts.high}
- Medium: ${counts.medium}

## Finding table
| Severity | Type | Label | Line | Masked preview |
| --- | --- | --- | ---: | --- |
${table}

## Redaction notes
- Finding previews and exports contain masked previews only.
- Raw secret values are not included in this report.
- The redacted text should still be reviewed before sharing.

## Manual review checklist
- [ ] URLs and query parameters checked
- [ ] Cookie and Set-Cookie headers checked
- [ ] Authorization headers checked
- [ ] Emails, IP addresses, and internal hostnames checked
- [ ] Provider-side token rotation considered

## Remaining risks
- Custom formats, very short values, screenshots, and binary files may not be detected.
- A redacted value may still reveal context such as service names, endpoint paths, or account IDs.

## Rotation checklist
${rotationChecklist(findings)}
`;
};

const githubIssueTemplate = () => `## Summary
I need help reviewing this redacted log/config snippet. Secrets were redacted locally before sharing.

## Redacted log area
\`\`\`text
${currentRedactedOutput() || "(Run redaction first and paste the redacted output here.)"}
\`\`\`

## What was redacted
${safeFindings().map((item) => `- ${item.severity.toUpperCase()} line ${item.line}: ${item.label} (${item.type}) — ${item.preview}`).join("\n") || "- No automated findings. Manual review still required."}

## Manual checks still needed
- [ ] Confirm no raw tokens remain
- [ ] Check URLs, Cookie headers, Authorization headers, emails, IPs, and internal hosts
- [ ] Confirm this issue does not include sensitive customer data

## Rotation checklist
${rotationChecklist(safeFindings())}
`;

const supportTemplate = (target = "support") => `Hello,\n\nI redacted likely secrets locally before sharing this ${target} note. Please treat the snippet as potentially sensitive because automated detection is not perfect.\n\nRedacted output:\n\`\`\`text\n${currentRedactedOutput() || "(Run redaction first.)"}\n\`\`\`\n\nManual review warning: URLs, cookies, Authorization headers, account IDs, emails, IPs, and provider-specific tokens may still require human review.\n`;

const handoffPackMarkdown = () => `${auditMarkdown()}\n\n---\n\n# GitHub Issue Template\n\n${githubIssueTemplate()}\n\n---\n\n# Support Template\n\n${supportTemplate("support")}\n\n---\n\n# Discord Template\n\n${supportTemplate("Discord")}\n`;

const csvFindings = () => {
  const rows = [["severity", "type", "label", "line", "preview"]];
  safeFindings().forEach((item) => rows.push([item.severity, item.type, item.label, item.line, item.preview]));
  return rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
};

const renderCustomRules = () => {
  const list = el("customRulesList");
  if (!list) return;
  if (!customRules.length) {
    list.innerHTML = `<p class="empty-state">${escapeHtml(t("Custom ruleは未追加です。", "No custom rules added."))}</p>`;
    return;
  }
  list.innerHTML = customRules.map((rule, index) => `
    <div class="custom-rule-item">
      <code>${escapeHtml(rule.label)} / ${escapeHtml(rule.prefix)} / min ${escapeHtml(rule.minLength)} / ${escapeHtml(rule.severity)}</code>
      <button type="button" class="btn-ghost" data-remove-rule="${index}">${escapeHtml(t("削除", "Remove"))}</button>
    </div>
  `).join("");
  list.querySelectorAll("[data-remove-rule]").forEach((button) => {
    button.addEventListener("click", () => {
      customRules.splice(Number(button.dataset.removeRule), 1);
      renderCustomRules();
      showToast(t("Custom ruleを削除しました", "Custom rule removed"));
    });
  });
};

const setupProActions = () => {
  renderCustomRules();
  el("addCustomRuleBtn")?.addEventListener("click", () => {
    if (document.documentElement.dataset.proActive !== "true") {
      showToast(t("ProでCustom ruleを追加できます", "Custom rules are available with Pro"));
      return;
    }
    const label = el("customRuleLabel")?.value.trim() || "Custom secret";
    const prefix = el("customRulePrefix")?.value.trim();
    const minLength = Number(el("customRuleMinLength")?.value || 12);
    const severity = el("customRuleSeverity")?.value === "medium" ? "medium" : "high";
    if (!prefix) {
      showToast(t("prefixを入力してください", "Enter a prefix"));
      return;
    }
    customRules.push({ label, prefix, minLength: Math.max(4, minLength), severity });
    renderCustomRules();
    showToast(t("Custom ruleを追加しました", "Custom rule added"));
  });

  el("profileSelect")?.addEventListener("change", () => {
    showToast(t("Profileを切り替えました", "Profile switched"));
  });

  const copyAction = (id, builder, message) => {
    el(id)?.addEventListener("click", async () => {
      if (!ensureResult()) return;
      await copyText(builder());
      showToast(message);
    });
  };

  copyAction("copyAuditBtn", auditMarkdown, t("Audit Markdownをコピーしました", "Copied audit Markdown"));
  copyAction("copyGithubBtn", githubIssueTemplate, t("GitHub Issueテンプレートをコピーしました", "Copied GitHub Issue template"));
  copyAction("copySupportBtn", () => supportTemplate("support"), t("Supportテンプレートをコピーしました", "Copied support template"));
  copyAction("copyDiscordBtn", () => supportTemplate("Discord"), t("Discordテンプレートをコピーしました", "Copied Discord template"));

  el("downloadJsonBtn")?.addEventListener("click", () => {
    if (!ensureResult()) return;
    downloadFile(`redacted-findings-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(safeFindings(), null, 2), "application/json;charset=utf-8");
    showToast(t("JSONを保存しました", "JSON saved"));
  });
  el("downloadCsvBtn")?.addEventListener("click", () => {
    if (!ensureResult()) return;
    downloadFile(`redacted-findings-${new Date().toISOString().slice(0, 10)}.csv`, csvFindings(), "text/csv;charset=utf-8");
    showToast(t("CSVを保存しました", "CSV saved"));
  });
  el("downloadHandoffBtn")?.addEventListener("click", () => {
    if (!ensureResult()) return;
    downloadFile(`redaction-handoff-${new Date().toISOString().slice(0, 10)}.md`, handoffPackMarkdown(), "text/markdown;charset=utf-8");
    showToast(t("Markdown handoff packを保存しました", "Markdown handoff pack saved"));
  });
};

window.NWApiKeyTokenRedactor = {
  auditMarkdown,
  githubIssueTemplate,
  supportTemplate,
  handoffPackMarkdown,
  safeFindings,
};

const samples = {
  env: `OPENAI_API_KEY="sk-proj-demo1234567890abcdef"
GITHUB_TOKEN=github_pat_demo_1234567890abcdef123456
SLACK_BOT_TOKEN=xoxb-123456789012-123456789012-demoTOKEN
AWS_ACCESS_KEY_ID=AKIA1234567890ABCDEF
AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
NPM_TOKEN=npm_demo1234567890abcdef1234567890`,
  json: `{
  "apiKey": "AIzaSyDemoKey1234567890abcdefABCDE",
  "client_secret": "demo-client-secret-1234567890",
  "sendgrid": "SG.demo1234567890.demo1234567890",
  "gitlab": "glpat-demo1234567890abcd",
  "database_url": "postgres://user:password@example.com:5432/app"
}`,
  curl: `curl https://api.example.com/v1/items \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demoPayload123456.demoSignature123456" \\
  -H "Cookie: sessionid=abc123def456ghi789; token=hiddenvalue123456"`,
  log: `2026-05-03T20:10:00Z GET /callback?access_token=abc123def456ghi789&signature=abcdef1234567890 200
Authorization: Basic dXNlcjpwYXNzd29yZA==
password="should-not-be-shared-12345"`,
  privateKey: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCdemoDemoDemo1234567890
this-is-a-fake-private-key-block-for-redaction-testing-only
-----END PRIVATE KEY-----`,
};

document.addEventListener("DOMContentLoaded", () => {
  applyLang(defaultLang());

  document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  const input = el("inputText");
  const output = el("outputText");
  const redactBtn = el("redactBtn");
  const clearBtn = el("clearBtn");
  const copyBtn = el("copyBtn");
  const downloadBtn = el("downloadBtn");

  const getOptions = () => ({
    modeApiKeys: el("modeApiKeys").checked,
    modeBearer: el("modeBearer").checked,
    modeJwt: el("modeJwt").checked,
    modePrivateKey: el("modePrivateKey").checked,
    modeGenericSecret: el("modeGenericSecret").checked,
    placeholder: el("placeholderStyle").value,
    keepLength: el("keepLengthToggle").checked,
    proActive: document.documentElement.dataset.proActive === "true",
    customRules,
  });

  const runRedaction = () => {
    const text = input.value || "";
    const result = redactContent(text, getOptions());
    output.value = result.output;
    lastResult = result;
    updateSummary(result.counts);
    renderFindings(result.findings);
    updateSafetySummary(result.findings);
  };

  updateSummary(emptyCounts());
  renderFindings([]);
  updateSafetySummary([]);
  setupProActions();

  redactBtn.addEventListener("click", runRedaction);

  document.querySelectorAll("[data-sample]").forEach((button) => {
    button.addEventListener("click", () => {
      const sample = samples[button.dataset.sample];
      if (!sample) return;
      input.value = sample;
      runRedaction();
    });
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    lastResult = null;
    updateSummary(emptyCounts());
    renderFindings([]);
    updateSafetySummary([]);
    input.focus();
  });

  copyBtn.addEventListener("click", async () => {
    const text = output.value || "";
    if (!text.trim()) {
      showToast(t("伏字済みテキストがありません", "No redacted text to copy"));
      return;
    }
    try {
      await copyText(text);
      showToast(t("伏字済みテキストをコピーしました", "Copied redacted text"));
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast(t("伏字済みテキストをコピーしました", "Copied redacted text"));
    }
  });

  downloadBtn.addEventListener("click", () => {
    const text = output.value || "";
    if (!text.trim()) {
      showToast(t("保存する伏字済みテキストがありません", "No redacted text to save"));
      return;
    }
    const filename = `redacted-secrets-${new Date().toISOString().slice(0, 10)}.txt`;
    downloadText(filename, text);
    showToast(t("TXTを保存しました", "TXT saved"));
  });
});
