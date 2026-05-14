(() => {
  "use strict";

  const PAYMENT_LINK = "https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209";
  const ENTITLEMENT = "nicheworks_pro";
  const TOOL_ID = "command-safety-checker";
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
    return String(text || "").replace(/\r\n/g, "\n").trim();
  }

  function getResult() {
    return window.__cscLastResult || null;
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
      severity: rule.severity || "",
      category: pickLocalized(rule.category),
      title: pickLocalized(rule.title),
      why: pickLocalized(rule.why),
      check: pickLocalized(rule.check),
      alternative: pickLocalized(rule.alternative)
    };
  }

  function categories(result) {
    return (result?.categories || []).map((category) => pickLocalized(category)).filter(Boolean);
  }

  function priorityChecklist(result) {
    const findings = (result?.findings || []).map(serializeFinding);
    if (!findings.length) {
      return [
        "Confirm command source and expected side effects before running.",
        "Run read-only inspection commands first when possible.",
        "Keep backups or version-control recovery paths available."
      ];
    }

    return findings.map((finding, index) => {
      const label = finding.severity === "HIGH" ? "P0" : finding.severity === "MED" ? "P1" : "P2";
      return `${label}-${index + 1}: ${finding.check || finding.title}`;
    });
  }

  function codexTask(result) {
    const risk = result?.risk || "UNKNOWN";
    const high = result?.counts?.HIGH ?? 0;
    const med = result?.counts?.MED ?? 0;
    const low = result?.counts?.LOW ?? 0;
    const command = plain(result?.normalized || document.getElementById("cmdInput")?.value || "");
    return [
      "Please perform a Command Safety Checker review before this command is run.",
      "",
      `Overall risk: ${risk}`,
      `Counts: High ${high}, Medium ${med}, Low ${low}`,
      `Categories: ${categories(result).join(", ") || "None detected"}`,
      "",
      "Command:",
      "```",
      command || "(no command provided)",
      "```",
      "",
      "Review requests:",
      "- Confirm whether each finding is expected for this task.",
      "- Suggest safer read-only checks or dry-run commands first.",
      "- Identify paths, URLs, secrets, or permissions that require human confirmation.",
      "- Do not certify the command as safe; provide residual risks."
    ].join("\n");
  }

  function githubIssue(result) {
    const risk = result?.risk || "UNKNOWN";
    const command = plain(result?.normalized || document.getElementById("cmdInput")?.value || "");
    return [
      `Title: Review ${risk} command before execution`,
      "",
      "## Context",
      "Command Safety Checker found items that should be reviewed before running this command.",
      "",
      "## Command",
      "```sh",
      command || "(no command provided)",
      "```",
      "",
      "## Findings",
      ...((result?.findings || []).length ? result.findings.map((item) => {
        const finding = serializeFinding(item);
        return `- [ ] ${finding.severity}: ${finding.title} — ${finding.why}`;
      }) : ["- [ ] No risky pattern detected; still perform human review."]),
      "",
      "## Acceptance criteria",
      "- [ ] Source URLs, target paths, and privilege requirements are verified.",
      "- [ ] Safer alternatives or dry-run commands are considered.",
      "- [ ] Residual risks are documented before execution."
    ].join("\n");
  }

  function markdownReport(result) {
    const command = plain(document.getElementById("cmdInput")?.value || result?.normalized || "");
    const normalized = plain(result?.normalized || "");
    const findings = (result?.findings || []).map(serializeFinding);
    const checklist = priorityChecklist(result);

    const lines = [
      "# Command Safety Pro Review",
      "",
      "## Summary",
      `- Overall risk: ${result?.risk || "UNKNOWN"}`,
      `- High: ${result?.counts?.HIGH ?? 0}`,
      `- Medium: ${result?.counts?.MED ?? 0}`,
      `- Low: ${result?.counts?.LOW ?? 0}`,
      `- Categories: ${categories(result).join(", ") || "None detected"}`,
      "",
      "## Original command",
      "```sh",
      command || "(no command provided)",
      "```",
      "",
      "## Normalized command",
      "```sh",
      normalized || "(empty)",
      "```",
      "",
      "## Findings"
    ];

    if (!findings.length) {
      lines.push("- Severity: LOW", "  - Category: None detected", "  - Why: No configured risky pattern matched. This is not a safety guarantee.", "  - Check: Review source, target paths, and expected side effects with a human reviewer.", "  - Alternative: Prefer read-only or dry-run commands first.");
    } else {
      findings.forEach((finding) => {
        lines.push(`- Severity: ${finding.severity}`);
        lines.push(`  - Category: ${finding.category}`);
        lines.push(`  - Why: ${finding.why}`);
        lines.push(`  - Check: ${finding.check}`);
        lines.push(`  - Alternative: ${finding.alternative}`);
      });
    }

    lines.push(
      "",
      "## Pre-run checklist",
      ...checklist.map((item) => `- [ ] ${item}`),
      "",
      "## Codex safety check task",
      codexTask(result),
      "",
      "## GitHub Issue draft",
      githubIssue(result),
      "",
      "## Final note",
      "This report is a review aid only. It does not certify that a command is safe."
    );

    return lines.join("\n");
  }

  function jsonExport(result) {
    return JSON.stringify({
      tool_id: TOOL_ID,
      entitlement: ENTITLEMENT,
      generated_at: new Date().toISOString(),
      summary: {
        overall_risk: result?.risk || "UNKNOWN",
        high: result?.counts?.HIGH ?? 0,
        medium: result?.counts?.MED ?? 0,
        low: result?.counts?.LOW ?? 0,
        categories: categories(result)
      },
      original_command: plain(document.getElementById("cmdInput")?.value || ""),
      normalized_command: plain(result?.normalized || ""),
      findings: (result?.findings || []).map(serializeFinding),
      pre_run_checklist: priorityChecklist(result),
      codex_task: codexTask(result),
      github_issue: githubIssue(result),
      final_note: "This report is a review aid only. It does not certify that a command is safe."
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
