(() => {
  "use strict";

  const osSelect = document.getElementById("osSelect");
  const cmdInput = document.getElementById("cmdInput");
  const analyzeBtn = document.getElementById("analyzeBtn");
  const clearBtn = document.getElementById("clearBtn");
  const copyBtn = document.getElementById("copyBtn");

  const presetDangerRm = document.getElementById("presetDangerRm");
  const presetCurlPipeSh = document.getElementById("presetCurlPipeSh");
  const presetGitResetHard = document.getElementById("presetGitResetHard");

  const resultSection = document.getElementById("resultSection");
  const riskLevelEl = document.getElementById("riskLevel");
  const findingsEl = document.getElementById("findings");
  const saferStepsEl = document.getElementById("saferSteps");
  const normalizedCmdEl = document.getElementById("normalizedCmd");
  const normalizedWrap = document.getElementById("normalizedWrap");

  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");

  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const t = (ja, en) => (currentLang === "ja" ? ja : en);

  function applyLang(lang) {
    currentLang = lang;
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    if (window.__nw_lastResult) {
      renderResult(window.__nw_lastResult);
    }
  }

  langButtons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
  applyLang(currentLang);

  const normalizeNewlines = (text) => String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const trimLines = (text) =>
    normalizeNewlines(text)
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");

  const escapeHtml = (text) =>
    String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const ruleLibrary = [
    {
      id: "rm_rf_root",
      severity: "HIGH",
      title: { ja: "rm -rf で / または ~ を対象", en: "rm -rf targeting / or ~" },
      hazard: {
        ja: "ルート直下やホーム直下の再帰削除は致命的な削除につながる可能性。",
        en: "Recursive delete on / or ~ can delete critical files.",
      },
      re: /\brm\b[^\n]*(?:-rf|-fr)[^\n]*(?:\s\/(\s|$)|\s~(\s|$)|\s\$\w+)/i,
      tags: ["rm_rf"],
    },
    {
      id: "fork_bomb",
      severity: "HIGH",
      title: { ja: "fork bomb", en: "fork bomb" },
      hazard: {
        ja: "プロセス大量生成でシステム停止を引き起こす可能性。",
        en: "Rapid process spawning can freeze the system.",
      },
      re: /:\(\)\s*{\s*:\s*\|\s*:\s*&\s*}\s*;\s*:/,
      tags: ["fork_bomb"],
    },
    {
      id: "curl_pipe_shell",
      severity: "HIGH",
      title: { ja: "curl|wget をシェルへパイプ", en: "curl|wget piped to shell" },
      hazard: {
        ja: "外部スクリプトを検証せず実行するため危険。",
        en: "Runs remote scripts without inspection.",
      },
      re: /\b(curl|wget)\b[^\n|]*\|\s*(sh|bash|zsh)\b/i,
      tags: ["curl_pipe"],
    },
    {
      id: "dd_to_device",
      severity: "HIGH",
      title: { ja: "dd で /dev/sdX へ書き込み", en: "dd writing to /dev/sdX" },
      hazard: {
        ja: "ディスクを上書きする可能性。対象デバイス誤りは致命的。",
        en: "Can overwrite disks; wrong target is catastrophic.",
      },
      re: /\bdd\b[^\n]*\bof=\/dev\/sd[a-z]\b/i,
      tags: ["disk_write"],
    },
    {
      id: "disk_format",
      severity: "HIGH",
      title: { ja: "mkfs / fdisk / diskutil eraseDisk", en: "mkfs / fdisk / diskutil eraseDisk" },
      hazard: {
        ja: "ファイルシステム初期化やディスク消去はデータ消失の危険が高い。",
        en: "Formatting/erasing disks risks data loss.",
      },
      re: /\b(mkfs(\.\w+)?|fdisk|diskutil\s+eraseDisk)\b/i,
      tags: ["disk_format"],
    },
    {
      id: "sudo_destructive",
      severity: "MED",
      title: { ja: "sudo + 破壊的コマンド", en: "sudo with destructive commands" },
      hazard: {
        ja: "高権限で破壊系コマンドを実行している可能性。",
        en: "Running destructive commands with elevated privileges.",
      },
      re: /\bsudo\b[^\n]*(rm|dd|mkfs|fdisk|diskutil|truncate|mv|cp|chmod|chown)\b/i,
      tags: ["sudo"],
    },
    {
      id: "git_reset_hard",
      severity: "MED",
      title: { ja: "git reset --hard", en: "git reset --hard" },
      hazard: {
        ja: "未コミットの変更が失われる可能性。",
        en: "Can discard uncommitted changes.",
      },
      re: /\bgit\b\s+reset\b[^\n]*--hard\b/i,
      tags: ["git_reset"],
    },
    {
      id: "git_clean_fd",
      severity: "MED",
      title: { ja: "git clean -fd", en: "git clean -fd" },
      hazard: {
        ja: "追跡外ファイルが削除される可能性。",
        en: "Deletes untracked files.",
      },
      re: /\bgit\b\s+clean\b[^\n]*-(?:f.*d|d.*f)\b/i,
      tags: ["git_clean"],
    },
    {
      id: "chmod_r_777",
      severity: "MED",
      title: { ja: "chmod -R 777", en: "chmod -R 777" },
      hazard: {
        ja: "権限を過度に広げる上に再帰適用される。",
        en: "Overly permissive and applied recursively.",
      },
      re: /\bchmod\b[^\n]*-R[^\n]*\b777\b/i,
      tags: ["chmod_777"],
    },
    {
      id: "chown_recursive",
      severity: "MED",
      title: { ja: "chown -R", en: "chown -R" },
      hazard: {
        ja: "広範囲の所有者変更は影響が大きい。",
        en: "Recursive ownership changes are broad.",
      },
      re: /\bchown\b[^\n]*-R\b/i,
      tags: ["chown_recursive"],
    },
  ];

  const safePatterns = [
    /\bls\b/i,
    /\bcat\b/i,
    /\becho\b/i,
    /\bpwd\b/i,
    /\bwhoami\b/i,
    /\bgit\b\s+status\b/i,
  ];

  function analyzeCommand(input) {
    const normalized = trimLines(input);
    const lines = normalized ? normalized.split("\n") : [];
    const findings = [];
    const tags = new Set();

    lines.forEach((line, index) => {
      ruleLibrary.forEach((rule) => {
        if (rule.re.test(line)) {
          findings.push({
            line: index + 1,
            command: line,
            rule,
          });
          rule.tags.forEach((tag) => tags.add(tag));
        }
      });
    });

    const maxSeverity = findings.reduce((acc, item) => {
      if (item.rule.severity === "HIGH") return "HIGH";
      if (item.rule.severity === "MED" && acc === "LOW") return "MED";
      return acc;
    }, "LOW");

    const hasSafeOnly =
      findings.length === 0 &&
      lines.length > 0 &&
      lines.every((line) => safePatterns.some((re) => re.test(line)));

    const risk = findings.length === 0 ? (hasSafeOnly ? "LOW" : "LOW") : maxSeverity;

    const saferSteps = buildSaferSteps(tags);

    return { normalized, findings, saferSteps, risk };
  }

  function buildSaferSteps(tags) {
    const steps = [
      t("コマンドを一語ずつ読み直し、意味が曖昧なら実行しない", "Read the command carefully; if anything is unclear, do not run it."),
      t(
        "dry-run / 事前確認を使う（-n, --dry-run, echo, ls, find など）",
        "Use dry-run/preview options (-n, --dry-run, echo, ls, find, etc.)."
      ),
      t("対象範囲を限定（正しいディレクトリで実行、パスを具体化）", "Limit scope (run in the correct directory, use explicit paths)."),
      t("バックアップや git commit を取ってから実行", "Create a backup or git commit before running."),
    ];

    if (tags.has("rm_rf")) {
      steps.push(
        t("削除前に ls / find で対象を確認し、可能なら rm -i を使う", "Before delete, inspect with ls/find and prefer rm -i.")
      );
      steps.push(
        t(" / や ~ を対象にしない。必要ならパスを二重確認", "Avoid targeting / or ~. Double-check the path if unavoidable.")
      );
    }

    if (tags.has("curl_pipe")) {
      steps.push(
        t("curl|sh は避け、まず保存→中身確認→チェックサム検証", "Avoid curl|sh; download, inspect, and verify checksums first.")
      );
      steps.push(
        t("サンドボックス/VM で実行して影響を隔離する", "Run in a sandbox/VM to isolate impact.")
      );
    }

    if (tags.has("disk_write") || tags.has("disk_format")) {
      steps.push(
        t("対象デバイス名を lsblk/diskutil list で再確認する", "Re-check device names with lsblk/diskutil list.")
      );
      steps.push(
        t("重要データのバックアップを必ず取得する", "Ensure critical data is backed up.")
      );
    }

    if (tags.has("git_reset") || tags.has("git_clean")) {
      steps.push(
        t("git status / git diff / git clean -nd で影響を確認する", "Check impact with git status/diff and git clean -nd.")
      );
    }

    if (tags.has("chmod_777") || tags.has("chown_recursive")) {
      steps.push(
        t("権限変更は最小限にし、再帰操作は対象を限定する", "Keep permission changes minimal; scope recursive ops.")
      );
    }

    if (tags.has("sudo")) {
      steps.push(
        t("sudo を外せるか検討し、必要なら影響範囲を説明できるか確認", "See if sudo is necessary; verify impact if required.")
      );
    }

    if (tags.has("fork_bomb")) {
      steps.push(
        t("絶対に実行しない（fork bomb は即時停止を引き起こす）", "Do not run it (fork bombs can immediately freeze systems).")
      );
    }

    return steps;
  }

  function renderResult(result) {
    window.__nw_lastResult = result;
    if (resultSection) resultSection.hidden = false;

    riskLevelEl.textContent = result.risk;
    const badgeClass = result.risk === "HIGH" ? "high" : result.risk === "MED" ? "medium" : "low";
    riskLevelEl.className = `badge ${badgeClass}`;

    findingsEl.innerHTML = "";
    if (result.findings.length === 0) {
      const li = document.createElement("li");
      li.className = "finding empty";
      li.innerHTML = `<strong>${escapeHtml(
        t("危険パターンは検出されませんでした", "No risky patterns detected")
      )}</strong> ${escapeHtml(t("ただし安全を保証するものではありません。", "This does not guarantee safety."))}`;
      findingsEl.appendChild(li);
    } else {
      result.findings.forEach((item) => {
        const li = document.createElement("li");
        li.className = "finding";
        li.innerHTML = `
          <div class="finding-head">
            <span class="tag ${item.rule.severity.toLowerCase()}">${item.rule.severity}</span>
            <span class="finding-title">L${item.line}: ${escapeHtml(
          currentLang === "ja" ? item.rule.title.ja : item.rule.title.en
        )}</span>
          </div>
          <div class="code-line">${escapeHtml(item.command)}</div>
          <div class="meta">${escapeHtml(currentLang === "ja" ? item.rule.hazard.ja : item.rule.hazard.en)}</div>
        `;
        findingsEl.appendChild(li);
      });
    }

    saferStepsEl.innerHTML = "";
    result.saferSteps.forEach((step) => {
      const li = document.createElement("li");
      li.textContent = step;
      saferStepsEl.appendChild(li);
    });

    if (result.normalized) {
      normalizedCmdEl.textContent = result.normalized;
      normalizedWrap.hidden = false;
    } else {
      normalizedCmdEl.textContent = "";
      normalizedWrap.hidden = true;
    }
  }

  function handleAnalyze() {
    const input = cmdInput?.value || "";
    const normalized = trimLines(input);
    if (!normalized) {
      alert(t("コマンドを入力してください", "Please paste a command"));
      return;
    }
    const result = analyzeCommand(normalized);
    renderResult(result);
  }

  function handleClear() {
    if (cmdInput) cmdInput.value = "";
    if (resultSection) resultSection.hidden = true;
    if (findingsEl) findingsEl.innerHTML = "";
    if (saferStepsEl) saferStepsEl.innerHTML = "";
    if (normalizedCmdEl) normalizedCmdEl.textContent = "";
    if (normalizedWrap) normalizedWrap.hidden = true;
    window.__nw_lastResult = null;
  }

  async function copyResults() {
    if (!window.__nw_lastResult) {
      alert(t("まずチェックを実行してください", "Run a check first"));
      return;
    }
    const result = window.__nw_lastResult;
    const lines = [
      "Command Safety Checker — Report",
      `Risk: ${result.risk}`,
      "",
      "Findings:",
    ];
    if (result.findings.length === 0) {
      lines.push("- none");
    } else {
      result.findings.forEach((item) => {
        const title = currentLang === "ja" ? item.rule.title.ja : item.rule.title.en;
        const hazard = currentLang === "ja" ? item.rule.hazard.ja : item.rule.hazard.en;
        lines.push(`- L${item.line}: ${title}`);
        lines.push(`  ${hazard}`);
        lines.push(`  > ${item.command}`);
      });
    }
    lines.push("");
    lines.push("Safer steps:");
    result.saferSteps.forEach((step) => lines.push(`- ${step}`));

    const text = lines.join("\n");
    try {
      await navigator.clipboard.writeText(text);
      alert(t("コピーしました", "Copied"));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        alert(t("コピーしました", "Copied"));
      } catch {
        alert(t("コピーに失敗しました", "Copy failed"));
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  analyzeBtn?.addEventListener("click", handleAnalyze);
  clearBtn?.addEventListener("click", handleClear);
  copyBtn?.addEventListener("click", copyResults);

  cmdInput?.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
      handleAnalyze();
    }
  });

  presetDangerRm?.addEventListener("click", () => {
    if (cmdInput) cmdInput.value = "rm -rf /";
  });

  presetCurlPipeSh?.addEventListener("click", () => {
    if (cmdInput) cmdInput.value = "curl https://example.com/install.sh | sh";
  });

  presetGitResetHard?.addEventListener("click", () => {
    if (cmdInput) cmdInput.value = "git reset --hard HEAD~1";
  });
})();
