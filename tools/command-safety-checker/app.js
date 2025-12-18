/* Command Safety Checker — MVP (in-browser, no storage)
   - Detect risky patterns (destructive/exfiltration/privilege/service impact)
   - Score => Low/Medium/High
   - Output findings with line numbers and short reasons
*/

(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);

  const osSelect = $("osSelect");
  const input = $("commandInput");
  const btnCheck = $("btnCheck");
  const btnClear = $("btnClear");
  const progress = $("progress");

  const resultSection = $("resultSection");
  const riskBadge = $("riskBadge");
  const summaryChips = $("summaryChips");
  const findingsEl = $("findings");
  const hintsEl = $("hints");
  const btnReset = $("btnReset");
  const btnCopyReport = $("btnCopyReport");
  const resultAnchor = $("resultSection");

  // i18n (Common spec pattern A)
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  function applyLang(lang) {
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    currentLang = lang;
  }
  langButtons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
  applyLang(currentLang);

  // Rules
  function buildRules(os) {
    const common = [
      // Exfiltration / remote execution
      {
        id: "pipe_shell_unix",
        severity: "high",
        category: "Remote execution",
        re: /\b(curl|wget)\b[^\n]*\|\s*(sh|bash|zsh)\b/i,
        messageJa: "外部スクリプトを即実行（curl|wget | sh/bash）",
        messageEn: "Immediate remote script execution (curl|wget | sh/bash)"
      },
      {
        id: "pipe_iex_ps",
        severity: "high",
        category: "Remote execution",
        re: /\b(Invoke-WebRequest|iwr|curl)\b[^\n]*\|\s*(iex|Invoke-Expression)\b/i,
        messageJa: "外部取得した内容を即実行（| iex）",
        messageEn: "Immediate execution of downloaded content (| iex)"
      },

      // Destructive
      {
        id: "rm_rf",
        severity: "medium",
        category: "Destructive",
        re: /\brm\b[^\n]*\s(-rf|-fr|--recursive)[^\n]*/i,
        messageJa: "破壊的削除（rm -rf 系）",
        messageEn: "Destructive deletion (rm -rf style)"
      },
      {
        id: "dd_mkfs_format",
        severity: "high",
        category: "Destructive",
        re: /\b(dd|mkfs(\.\w+)?|format)\b/i,
        messageJa: "ディスク破壊の可能性（dd/mkfs/format）",
        messageEn: "Potential disk destruction (dd/mkfs/format)"
      },
      {
        id: "git_hard_clean",
        severity: "medium",
        category: "Destructive",
        re: /\bgit\b[^\n]*\b(reset\s+--hard|clean\s+-f[d]?)\b/i,
        messageJa: "作業ツリー破壊（git reset --hard / git clean -fd）",
        messageEn: "Working tree wipe (git reset --hard / git clean -fd)"
      },
      {
        id: "docker_prune",
        severity: "medium",
        category: "Destructive",
        re: /\bdocker\b[^\n]*\b(system\s+prune(\s+-a)?|container\s+prune|image\s+prune)\b/i,
        messageJa: "Dockerの一括削除（prune）",
        messageEn: "Docker bulk deletion (prune)"
      },

      // Privilege / permissions
      {
        id: "chmod_777",
        severity: "medium",
        category: "Permissions",
        re: /\bchmod\b[^\n]*\b(-R\s+)?777\b/i,
        messageJa: "過剰権限（chmod 777 / chmod -R 777）",
        messageEn: "Over-permissive chmod (777)"
      },
      {
        id: "chown_recursive",
        severity: "medium",
        category: "Permissions",
        re: /\bchown\b[^\n]*\b-R\b/i,
        messageJa: "所有者の再帰変更（chown -R）",
        messageEn: "Recursive ownership change (chown -R)"
      },
      {
        id: "sudo",
        severity: "low",
        category: "Privilege",
        re: /\bsudo\b/i,
        messageJa: "権限昇格（sudo）",
        messageEn: "Privilege escalation (sudo)"
      },

      // Service impact / reboot
      {
        id: "shutdown_reboot",
        severity: "high",
        category: "System impact",
        re: /\b(shutdown|reboot)\b/i,
        messageJa: "再起動/停止（shutdown/reboot）",
        messageEn: "Shutdown/reboot"
      },
      {
        id: "kill_9",
        severity: "medium",
        category: "System impact",
        re: /\bkill\b[^\n]*\s-9\b/i,
        messageJa: "強制終了（kill -9）",
        messageEn: "Force kill (kill -9)"
      }
    ];

    const unixOnly = [
      {
        id: "systemctl_stop",
        severity: "medium",
        category: "System impact",
        re: /\b(systemctl|service)\b[^\n]*\b(stop|disable)\b/i,
        messageJa: "サービス停止/無効化（systemctl stop/disable）",
        messageEn: "Stop/disable services (systemctl stop/disable)"
      },
      {
        id: "danger_path_root",
        severity: "high",
        category: "Target path",
        re: /\brm\b[^\n]*\s(-rf|-fr|--recursive)[^\n]*\s(\/\s*$|\/\s+)/i,
        messageJa: "ルート直下に対する再帰削除の疑い（/）",
        messageEn: "Possible recursive deletion against root (/)"
      },
      {
        id: "danger_path_home",
        severity: "medium",
        category: "Target path",
        re: /\brm\b[^\n]*\s(-rf|-fr|--recursive)[^\n]*\s(~\/?|\/Users\/|\/home\/)/i,
        messageJa: "ホーム配下を広範囲に消す疑い（~ / home）",
        messageEn: "Possible broad deletion in home directory (~ / home)"
      }
    ];

    const psOnly = [
      {
        id: "remove_item_recurse_force",
        severity: "medium",
        category: "Destructive",
        re: /\bRemove-Item\b[^\n]*\b-Recurse\b/i,
        messageJa: "再帰削除（Remove-Item -Recurse）",
        messageEn: "Recursive deletion (Remove-Item -Recurse)"
      },
      {
        id: "rd_rmdir_s",
        severity: "medium",
        category: "Destructive",
        re: /\b(rmdir|rd)\b[^\n]*\s\/s\b/i,
        messageJa: "再帰削除（rmdir/rd /s）",
        messageEn: "Recursive delete (rmdir/rd /s)"
      },
      {
        id: "icacls_grant_all",
        severity: "medium",
        category: "Permissions",
        re: /\bicacls\b[^\n]*\b(grant|grant:r)\b/i,
        messageJa: "権限付与の可能性（icacls grant）",
        messageEn: "ACL modification (icacls grant)"
      },
      {
        id: "net_stop",
        severity: "medium",
        category: "System impact",
        re: /\bnet\s+stop\b/i,
        messageJa: "サービス停止（net stop）",
        messageEn: "Stop services (net stop)"
      },
      {
        id: "danger_path_croot",
        severity: "high",
        category: "Target path",
        re: /\b(Remove-Item|rmdir|rd)\b[^\n]*\b(C:\\\s*$|C:\\\s+)/i,
        messageJa: "C:\\ 直下への削除の疑い",
        messageEn: "Possible deletion against C:\\ root"
      }
    ];

    const list = [...common];
    if (os === "unix") list.push(...unixOnly);
    if (os === "powershell") list.push(...psOnly);
    return list;
  }

  function severityScore(sev) {
    if (sev === "high") return 5;
    if (sev === "medium") return 3;
    return 1;
  }

  function computeOverall(findings) {
    if (findings.some((f) => f.severity === "high")) return "HIGH";
    if (findings.some((f) => f.severity === "medium")) return "MEDIUM";
    if (findings.length > 0) return "LOW";
    return "LOW";
  }

  function setBadge(level) {
    riskBadge.className = "badge";
    riskBadge.textContent = level;

    if (level === "HIGH") riskBadge.classList.add("high");
    else if (level === "MEDIUM") riskBadge.classList.add("medium");
    else riskBadge.classList.add("low");
  }

  function showProgress(on) {
    progress.hidden = !on;
  }

  function disableControls(disabled) {
    btnCheck.disabled = disabled;
    osSelect.disabled = disabled;
    input.disabled = disabled;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
    }[c]));
  }

  function t(ja, en) {
    return currentLang === "ja" ? ja : en;
  }

  function buildHints(findings, os) {
    const hints = [];

    hints.push(t("対象ディレクトリを確認（pwd / ls / dir）", "Confirm target directory (pwd / ls / dir)"));

    if (findings.some((f) => f.category === "Destructive")) {
      hints.push(t("削除系はまず対象を列挙して確認（ls / dir / findのdry-run）", "For delete ops, list targets first (ls/dir, dry-run where possible)"));
      hints.push(t("git管理なら git status / バックアップを先に", "If under git, run git status / back up first"));
    }
    if (findings.some((f) => f.category === "Remote execution")) {
      hints.push(t("パイプ実行は避け、まず中身を保存して確認してから実行", "Avoid piping to shell; save & inspect the script before running"));
    }
    if (findings.some((f) => f.category === "Permissions" || f.category === "Privilege")) {
      hints.push(t("権限変更は範囲を狭く（-Rの乱用に注意）", "Keep permission changes scoped (be careful with -R)"));
    }
    if (findings.some((f) => f.category === "System impact")) {
      hints.push(t("サービス停止や再起動は影響範囲を事前共有", "For service stops/reboots, confirm impact and communicate first"));
    }

    if (os === "powershell") {
      hints.push(t("PowerShellは -WhatIf が使える場合は先に試す", "Use -WhatIf first when available (PowerShell)"));
    } else {
      hints.push(t("可能なら --dry-run / -n / -i を利用", "Use --dry-run / -n / -i when available"));
    }

    // Deduplicate
    return Array.from(new Set(hints)).slice(0, 8);
  }

  function analyze(text, os) {
    const rules = buildRules(os);
    const lines = text.split(/\r?\n/);
    const findings = [];

    lines.forEach((line, idx) => {
      const raw = line;
      const trimmed = raw.trim();
      if (!trimmed) return;

      rules.forEach((rule) => {
        if (rule.re.test(raw)) {
          findings.push({
            lineNo: idx + 1,
            severity: rule.severity,
            category: rule.category,
            id: rule.id,
            messageJa: rule.messageJa,
            messageEn: rule.messageEn,
            code: raw
          });
        }
      });
    });

    // Sort: high -> medium -> low, then lineNo
    findings.sort((a, b) => {
      const ds = severityScore(b.severity) - severityScore(a.severity);
      if (ds !== 0) return ds;
      return a.lineNo - b.lineNo;
    });

    // Compute score
    const score = findings.reduce((acc, f) => acc + severityScore(f.severity), 0);
    const overall = computeOverall(findings);

    const countBy = (sev) => findings.filter((f) => f.severity === sev).length;

    return {
      overall,
      score,
      total: findings.length,
      high: countBy("high"),
      medium: countBy("medium"),
      low: countBy("low"),
      findings
    };
  }

  function renderSummary(summary) {
    summaryChips.innerHTML = "";
    const chips = [
      t(`検出 ${summary.total}件`, `${summary.total} findings`),
      `High ${summary.high}`,
      `Medium ${summary.medium}`,
      `Low ${summary.low}`
    ];
    chips.forEach((c) => {
      const span = document.createElement("span");
      span.className = "chip";
      span.textContent = c;
      summaryChips.appendChild(span);
    });
  }

  function renderFindings(findings) {
    findingsEl.innerHTML = "";
    if (findings.length === 0) {
      const empty = document.createElement("div");
      empty.className = "finding";
      empty.innerHTML = `
        <div class="meta">${escapeHtml(t("危険パターンは検出されませんでした（ただし安全を保証するものではありません）。",
                                         "No risky patterns detected (this does not guarantee safety)."))}</div>
      `;
      findingsEl.appendChild(empty);
      return;
    }

    findings.forEach((f) => {
      const card = document.createElement("div");
      card.className = "finding";

      const sevText = f.severity.toUpperCase();
      const msg = currentLang === "ja" ? f.messageJa : f.messageEn;

      card.innerHTML = `
        <div class="finding-top">
          <span class="tag ${escapeHtml(f.severity)}">${escapeHtml(sevText)}</span>
          <span class="meta">L${f.lineNo}</span>
          <span class="meta">${escapeHtml(f.category)}</span>
        </div>
        <div class="meta">${escapeHtml(msg)}</div>
        <div class="code-line">${escapeHtml(f.code)}</div>
      `;
      findingsEl.appendChild(card);
    });
  }

  function renderHints(hints) {
    hintsEl.innerHTML = "";
    hints.forEach((h) => {
      const li = document.createElement("li");
      li.textContent = h;
      hintsEl.appendChild(li);
    });
  }

  function scrollToResult() {
    resultAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function buildReportText(summary, os) {
    const lines = [];
    lines.push(`Command Safety Checker`);
    lines.push(`OS: ${os === "powershell" ? "Windows (PowerShell)" : "Linux/macOS (bash/zsh)"}`);
    lines.push(`Overall: ${summary.overall}`);
    lines.push(`Findings: total=${summary.total} high=${summary.high} medium=${summary.medium} low=${summary.low}`);
    lines.push(``);
    lines.push(`Findings:`);
    if (summary.findings.length === 0) {
      lines.push(`- (none)`);
    } else {
      summary.findings.forEach((f) => {
        const msg = currentLang === "ja" ? f.messageJa : f.messageEn;
        lines.push(`- L${f.lineNo} [${f.severity.toUpperCase()}] ${msg} :: ${f.code}`);
      });
    }
    return lines.join("\n");
  }

  function resetAll() {
    input.value = "";
    findingsEl.innerHTML = "";
    hintsEl.innerHTML = "";
    summaryChips.innerHTML = "";
    setBadge("—");
    resultSection.hidden = true;
    showProgress(false);
    disableControls(false);
    input.focus();
  }

  // Events
  btnClear.addEventListener("click", () => {
    input.value = "";
    input.focus();
  });

  btnReset.addEventListener("click", () => resetAll());

  btnCheck.addEventListener("click", async () => {
    const text = input.value || "";
    const os = osSelect.value;

    resultSection.hidden = true;
    showProgress(true);
    disableControls(true);

    try {
      // simulate a tick so UI updates
      await new Promise((r) => setTimeout(r, 50));

      const summary = analyze(text, os);

      setBadge(summary.overall);
      renderSummary(summary);
      renderFindings(summary.findings);
      renderHints(buildHints(summary.findings, os));

      resultSection.hidden = false;
      showProgress(false);
      disableControls(false);
      scrollToResult();

      btnCopyReport.onclick = async () => {
        const report = buildReportText(summary, os);
        try {
          await navigator.clipboard.writeText(report);
          btnCopyReport.textContent = t("コピーしました", "Copied");
          setTimeout(() => {
            btnCopyReport.innerHTML = `<span data-i18n="ja">レポートをコピー</span><span data-i18n="en">Copy report</span>`;
            applyLang(currentLang);
          }, 900);
        } catch {
          alert(t("コピーに失敗しました（ブラウザ権限を確認）", "Copy failed (check browser permission)"));
        }
      };
    } catch (e) {
      showProgress(false);
      disableControls(false);
      resultSection.hidden = false;
      setBadge("HIGH");
      findingsEl.innerHTML = `<div class="finding"><div class="meta">${escapeHtml(t("エラーが発生しました。入力内容を短くして再試行してください。", "An error occurred. Try shortening the input and retry."))}</div></div>`;
      renderHints([t("ページを再読み込みして再試行", "Reload the page and retry")]);
      scrollToResult();
      console.error(e);
    }
  });

  // Pro button (MVP: placeholder)
  const btnUnlock = $("btnUnlock");
  if (btnUnlock) {
    btnUnlock.addEventListener("click", () => {
      alert(t("MVPではProは準備中。課金導線は後で差し替えます。", "Pro is coming soon. Payment flow will be wired later."));
    });
  }

  // Start state
  resetAll();
})();
