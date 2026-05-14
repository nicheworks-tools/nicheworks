(() => {
  "use strict";

  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";
  const TOOL_ID = "command-safety-checker";
  const FINAL_NOTE = "This report is a review aid only. It does not certify that a command is safe.";
  const STATUS = {
    preview: "Previewモード / Preview mode",
    active: "Pro解放済み / Pro unlocked",
    unavailable: "Pro状態を確認できませんでした。無料機能は引き続き利用できます。 / Pro status could not be checked. Free features remain available."
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));

  function currentLang() {
    const active = $(".nw-lang-switch button.active");
    return active?.dataset.lang === "en" ? "en" : "ja";
  }

  function toast(ja, en) {
    let el = document.getElementById("toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "toast";
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = currentLang() === "en" ? en : ja;
    el.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { el.hidden = true; }, 2400);
  }

  function getCommonStatus() {
    if (!window.NWPro || typeof window.NWPro.getLocalStatus !== "function") {
      return { available: false, active: false, entitlement: ENTITLEMENT };
    }

    try {
      const status = window.NWPro.getLocalStatus();
      const entitlement = status?.entitlement || ENTITLEMENT;
      return {
        available: true,
        active: Boolean(status?.active && entitlement === ENTITLEMENT),
        entitlement,
        checkedAt: status?.checkedAt || ""
      };
    } catch (error) {
      return { available: false, active: false, entitlement: ENTITLEMENT };
    }
  }

  function syncBuyLinks() {
    $$('[data-pro-buy]').forEach((link) => {
      link.setAttribute("href", PAYMENT_LINK);
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener");
    });
  }

  function syncGate() {
    const status = getCommonStatus();
    const active = Boolean(status.available && status.active);
    document.documentElement.dataset.proActive = active ? "true" : "false";
    document.documentElement.dataset.proTool = TOOL_ID;

    $$('[data-pro-status]').forEach((el) => {
      el.textContent = status.available ? (active ? STATUS.active : STATUS.preview) : STATUS.unavailable;
    });

    $$('[data-pro-preview]').forEach((el) => {
      el.hidden = active;
      el.setAttribute("aria-hidden", active ? "true" : "false");
    });

    $$('[data-pro-only]').forEach((el) => {
      el.hidden = !active;
      el.setAttribute("aria-hidden", active ? "false" : "true");
    });

    $$('[data-pro-action]').forEach((button) => {
      button.disabled = !active;
      button.setAttribute("aria-disabled", active ? "false" : "true");
      button.title = active ? "" : "Pro feature locked / Pro限定機能";
    });

    syncBuyLinks();
    return { ...status, active };
  }

  function plain(text) {
    return String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();
  }

  function getResult() {
    return window.__cscLastResult || null;
  }

  function originalCommand(result) {
    return plain(document.getElementById("cmdInput")?.value || result?.normalized || "");
  }

  function normalizedCommand(result) {
    return plain(result?.normalized || "");
  }

  function osMode(result) {
    return result?.os || document.getElementById("osSelect")?.value || "unknown";
  }

  function pickLocalized(value) {
    if (!value || typeof value !== "object") return String(value || "");
    return value.en || value.ja || "";
  }

  function serializeFinding(item) {
    const rule = item?.rule || {};
    return {
      line: item?.line || null,
      command: item?.command || "",
      severity: rule.severity || "LOW",
      category: pickLocalized(rule.category) || "General review",
      title: pickLocalized(rule.title) || "Manual command review needed",
      why: pickLocalized(rule.why) || "Review this command before execution because automated checks cannot prove it is safe.",
      check: pickLocalized(rule.check) || "Confirm source, target paths, permissions, secrets, and expected side effects before running.",
      alternative: pickLocalized(rule.alternative) || "Start with read-only inspection or a dry-run/WhatIf equivalent where available."
    };
  }

  function categories(result) {
    return (result?.categories || []).map((category) => pickLocalized(category)).filter(Boolean);
  }

  function severityLabel(severity) {
    if (severity === "HIGH") return "P0";
    if (severity === "MED") return "P1";
    return "P2";
  }

  function priorityChecklist(result) {
    const findings = (result?.findings || []).map(serializeFinding);
    if (!findings.length) {
      return [
        "P2-1: Confirm command source, target paths, URLs, permissions, and expected side effects before running.",
        "P2-2: Run read-only inspection commands first when possible.",
        "P2-3: Keep backups, git commits, or another recovery path available."
      ];
    }

    const counters = { P0: 0, P1: 0, P2: 0 };
    return findings.map((finding) => {
      const priority = severityLabel(finding.severity);
      counters[priority] += 1;
      return `${priority}-${counters[priority]}: ${finding.check || finding.title}`;
    });
  }

  function suggestionForFinding(finding) {
    const text = `${finding.command} ${finding.title} ${finding.category}`.toLowerCase();
    if (/curl|wget|invoke-webrequest|\biwr\b|\biex\b|remote/.test(text) && /\|\s*(sh|bash|zsh|iex)|iex|script/.test(text)) {
      return "Remote installer: download to a file first, inspect it, verify checksum/signature if available, then run only after review (for example: curl -fsSL URL -o install.sh → less install.sh → shasum -a 256 install.sh).";
    }
    if (/rm\s+-rf|delete|destructive/.test(text)) {
      return "Recursive delete: list the exact target first, preview one directory level, then prefer interactive deletion (for example: ls -la ./dist → find ./dist -maxdepth 1 -print → rm -ri ./dist).";
    }
    if (/remove-item|powershell/.test(text) && /recurse|force|delete/.test(text)) {
      return "PowerShell delete: inspect targets before deletion and use -WhatIf when possible (for example: Get-ChildItem path → Remove-Item path -Recurse -WhatIf).";
    }
    if (/chmod|chown|permission|privilege|sudo|administrator/.test(text)) {
      return "Permission change: inspect current owner/mode first, narrow the target, and avoid recursive broad grants unless explicitly required.";
    }
    if (/secret|\.env|token|key|exfil|upload|scp|rsync|nc\b/.test(text)) {
      return "Secret or upload risk: redact secrets, verify destination hosts, and replace upload commands with a dry-run or local archive listing first.";
    }
    if (/git|reset|clean/.test(text)) {
      return "Git destructive action: run git status, git diff, and dry-run previews such as git clean -nd before irreversible commands.";
    }
    if (/disk|mkfs|dd|clear-disk|format/.test(text)) {
      return "Disk operation: list disks/partitions first, confirm identifiers out-of-band, and do not proceed without a restorable backup.";
    }
    return `${finding.title}: ${finding.alternative}`;
  }

  function saferCommandSuggestions(result) {
    const findings = (result?.findings || []).map(serializeFinding);
    const suggestions = [];
    findings.forEach((finding) => {
      const suggestion = suggestionForFinding(finding);
      if (!suggestions.includes(suggestion)) suggestions.push(suggestion);
    });

    if (!suggestions.length) {
      suggestions.push("No risky pattern matched, but start with read-only inspection, verify URLs/paths/permissions, and document residual risk before execution.");
    }
    return suggestions;
  }

  function generatedAt() {
    return new Date().toISOString();
  }

  function codexTask(result) {
    const risk = result?.risk || "UNKNOWN";
    const high = result?.counts?.HIGH ?? 0;
    const med = result?.counts?.MED ?? 0;
    const low = result?.counts?.LOW ?? 0;
    const command = normalizedCommand(result) || originalCommand(result);
    return [
      "Please review this command before it is run. Identify the dangerous parts and explain why they matter.",
      "",
      `Overall risk: ${risk}`,
      `Counts: High ${high}, Medium ${med}, Low ${low}`,
      `OS mode: ${osMode(result)}`,
      `Categories: ${categories(result).join(", ") || "None detected"}`,
      "",
      "Command:",
      "```sh",
      command || "(no command provided)",
      "```",
      "",
      "Review requests:",
      "- Verify URL sources, redirects, domains, and downloaded script contents before execution.",
      "- Verify paths, glob patterns, target directories, and whether any secret values or environment files could be exposed.",
      "- Verify privilege changes, sudo/administrator requirements, permission impact, process impact, and disk/data-loss impact.",
      "- Propose a safer alternative, dry-run, -WhatIf, or read-only inspection flow before any destructive step.",
      "- Do not state that the command is safe; include remaining risks and assumptions."
    ].join("\n");
  }

  function githubIssue(result) {
    const risk = result?.risk || "UNKNOWN";
    const command = normalizedCommand(result) || originalCommand(result);
    const checklist = priorityChecklist(result);
    return [
      `Title: Review ${risk} command before execution`,
      "",
      "## Context",
      "Command Safety Checker found items that should be reviewed before this command is run. This issue is for pre-execution review, not a safety approval.",
      "",
      "## Command",
      "```sh",
      command || "(no command provided)",
      "```",
      "",
      "## Findings checklist",
      ...((result?.findings || []).length ? result.findings.map((item) => {
        const finding = serializeFinding(item);
        return `- [ ] ${finding.severity} / ${finding.category} / line ${finding.line || "?"}: ${finding.title} — ${finding.why}`;
      }) : ["- [ ] No configured risky pattern matched; still perform human review."]),
      "",
      "## Review checklist",
      ...checklist.map((item) => `- [ ] ${item}`),
      "- [ ] URL sources, target paths, secrets, permissions, and disk impact are verified.",
      "- [ ] Safer alternative, dry-run, -WhatIf, or read-only inspection steps are documented.",
      "",
      "## Acceptance criteria",
      "- [ ] Each finding has an owner decision: block, revise, inspect further, or accept residual risk.",
      "- [ ] Any command to be run is copied from a reviewed source, not from an unchecked chat response.",
      "- [ ] Residual risks and rollback/recovery steps are documented before execution.",
      "",
      "## Final caution",
      FINAL_NOTE
    ].join("\n");
  }

  function markdownReport(result) {
    const command = originalCommand(result);
    const normalized = normalizedCommand(result);
    const findings = (result?.findings || []).map(serializeFinding);
    const checklist = priorityChecklist(result);
    const suggestions = saferCommandSuggestions(result);
    const timestamp = generatedAt();

    const lines = [
      "# Command Safety Pro Review",
      "",
      "## 1. Summary",
      `- Overall risk: ${result?.risk || "UNKNOWN"}`,
      `- High / Medium / Low counts: ${result?.counts?.HIGH ?? 0} / ${result?.counts?.MED ?? 0} / ${result?.counts?.LOW ?? 0}`,
      `- Detected categories: ${categories(result).join(", ") || "None detected"}`,
      `- OS mode: ${osMode(result)}`,
      `- Generated at: ${timestamp}`,
      `- Tool id: ${TOOL_ID}`,
      "",
      "## 2. Original command",
      "```sh",
      command || "(no command provided)",
      "```",
      "",
      "## 3. Normalized command",
      "```sh",
      normalized || "(empty)",
      "```",
      "",
      "## 4. Findings"
    ];

    if (!findings.length) {
      lines.push(
        "- Severity: LOW",
        "  - Category: None detected",
        "  - Line: n/a",
        "  - Rule title: No configured risky pattern matched",
        `  - Matched command: ${normalized || command || "(empty)"}`,
        "  - Why this matters: Pattern matching cannot prove a command is safe.",
        "  - What to check before running: Confirm URL, path, secret, permission, and disk impact manually.",
        "  - Safer alternative / first step: Run read-only inspection or dry-run steps first."
      );
    } else {
      findings.forEach((finding, index) => {
        lines.push(
          `### Finding ${index + 1}`,
          `- Severity: ${finding.severity}`,
          `- Category: ${finding.category}`,
          `- Line: ${finding.line || "n/a"}`,
          `- Rule title: ${finding.title}`,
          `- Matched command: ${finding.command || "(not captured)"}`,
          `- Why this matters: ${finding.why}`,
          `- What to check before running: ${finding.check}`,
          `- Safer alternative / first step: ${finding.alternative}`
        );
      });
    }

    lines.push(
      "",
      "## 5. Priority checklist",
      ...checklist.map((item) => `- [ ] ${item}`),
      "",
      "## 6. Safer command suggestions",
      ...suggestions.map((item) => `- ${item}`),
      "",
      "## 7. Codex safety check task",
      codexTask(result),
      "",
      "## 8. GitHub Issue draft",
      githubIssue(result),
      "",
      "## 9. Final note",
      FINAL_NOTE
    );

    return lines.join("\n");
  }

  function jsonExport(result) {
    const issue = githubIssue(result);
    const task = codexTask(result);
    return JSON.stringify({
      tool_id: TOOL_ID,
      entitlement: ENTITLEMENT,
      generated_at: generatedAt(),
      os_mode: osMode(result),
      summary: {
        overall_risk: result?.risk || "UNKNOWN",
        high: result?.counts?.HIGH ?? 0,
        medium: result?.counts?.MED ?? 0,
        low: result?.counts?.LOW ?? 0,
        categories: categories(result)
      },
      original_command: originalCommand(result),
      normalized_command: normalizedCommand(result),
      findings: (result?.findings || []).map(serializeFinding),
      priority_checklist: priorityChecklist(result),
      safer_command_suggestions: saferCommandSuggestions(result),
      codex_task: task,
      github_issue: issue,
      final_note: FINAL_NOTE
    }, null, 2);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("コピーしました", "Copied");
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      toast(ok ? "コピーしました" : "コピーに失敗しました", ok ? "Copied" : "Copy failed");
    }
  }

  function download(filename, text, type) {
    const blob = new Blob([text], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function requireProAndResult() {
    const status = syncGate();
    if (!status.active) {
      toast("Pro限定機能です。Previewモードではサンプルのみ表示されます。", "Pro feature locked. Preview mode only shows samples.");
      return null;
    }

    const result = getResult();
    if (!result) {
      toast("先に無料チェックを実行してください。", "Run a free check first.");
      return null;
    }

    return result;
  }

  function handleAction(action) {
    const result = requireProAndResult();
    if (!result) return;

    if (action === "copy-report") copyText(markdownReport(result));
    if (action === "save-markdown") download("command-safety-pro-review.md", markdownReport(result), "text/markdown;charset=utf-8");
    if (action === "copy-codex") copyText(codexTask(result));
    if (action === "copy-issue") copyText(githubIssue(result));
    if (action === "export-json") download("command-safety-review.json", jsonExport(result), "application/json;charset=utf-8");
    if (action === "export-markdown") download("command-safety-review.md", markdownReport(result), "text/markdown;charset=utf-8");
  }

  function init() {
    syncGate();
    document.addEventListener("click", (event) => {
      const actionButton = event.target.closest("[data-pro-action]");
      if (actionButton) {
        event.preventDefault();
        handleAction(actionButton.dataset.proAction);
        return;
      }
      if (event.target.closest(".nw-lang-switch button")) {
        setTimeout(syncGate, 0);
      }
    });
    window.addEventListener("storage", syncGate);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) syncGate();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
