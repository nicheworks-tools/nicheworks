/* NicheWorks — Command Safety Checker
 * MVP + Pro Step 1:
 * - Detect risky command patterns (unix + powershell)
 * - Score risk: Low / Medium / High
 * - Findings with line numbers + short reasons
 * - Minimum safety hints
 * - Copy report
 * - Language toggle (JP/EN)
 * - Pro Step 1: Safer alternative templates + pre-run checklist
 *   (Unlocked locally via "Enable Pro on this device" — honor system / auto-verify via pro.html)
 */

(() => {
  "use strict";

  // ====== Config ======
  const PAYMENT_LINK = "https://buy.stripe.com/bJe14p2QV1M13dz5kjcV208";
  const PRO_FLAG_KEY = "nw_command_safety_pro_enabled_v1";

  // ====== DOM ======
  const osSelect = document.getElementById("osSelect");
  const commandInput = document.getElementById("commandInput");

  const btnCheck = document.getElementById("btnCheck");
  const btnClear = document.getElementById("btnClear");
  const btnReset = document.getElementById("btnReset");
  const btnCopyReport = document.getElementById("btnCopyReport");

  const progress = document.getElementById("progress");

  const resultSection = document.getElementById("resultSection");
  const riskBadge = document.getElementById("riskBadge");
  const summaryChips = document.getElementById("summaryChips");

  const findingsEl = document.getElementById("findings");
  const hintsEl = document.getElementById("hints");

  // Pro block exists in index.html
  const proBlock = document.getElementById("proBlock");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");

  // ====== i18n ======
  const browserLang = (navigator.language || "").toLowerCase();
  let currentLang = browserLang.startsWith("ja") ? "ja" : "en";

  const t = (ja, en) => (currentLang === "ja" ? ja : en);

  function applyLang(lang) {
    currentLang = lang;
    i18nNodes.forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    // Re-render dynamic bits in the current language if already shown
    if (!resultSection.hidden) {
      // Just re-run render using lastResult if available
      if (window.__nw_lastResult) renderResult(window.__nw_lastResult);
    }
  }

  langButtons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
  applyLang(currentLang);

  // ====== Helpers ======
  const escapeHtml = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const normalizeNewlines = (text) => String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  const splitLines = (text) => normalizeNewlines(text).split("\n");

  function setProgress(on) {
    if (!progress) return;
    progress.hidden = !on;
  }

  function clearChildren(el) {
    while (el && el.firstChild) el.removeChild(el.firstChild);
  }

  function makeBadge(text, className = "") {
    const span = document.createElement("span");
    span.className = `badge ${className}`.trim();
    span.textContent = text;
    return span;
  }

  function makeChip(text) {
    const span = document.createElement("span");
    span.className = "chip";
    span.textContent = text;
    return span;
  }

  function isProEnabled() {
    return localStorage.getItem(PRO_FLAG_KEY) === "1";
  }

  function enablePro() {
    localStorage.setItem(PRO_FLAG_KEY, "1");
    if (window.__nw_lastResult) renderResult(window.__nw_lastResult);
  }

  function disablePro() {
    localStorage.removeItem(PRO_FLAG_KEY);
    if (window.__nw_lastResult) renderResult(window.__nw_lastResult);
  }

  // ====== Detection Rules ======
  // Categories are used for Pro templates and summary chips.
  // severity: 1 (low) / 2 (med) / 3 (high)
  function buildRules(os) {
    const isUnix = os === "unix";
    const isPS = os === "powershell";

    /** @type {Array<{id:string, category:string, severity:number, title:{ja:string,en:string}, reason:{ja:string,en:string}, re:RegExp}>} */
    const rules = [];

    // --- Remote execution / pipe to shell ---
    if (isUnix) {
      rules.push({
        id: "pipe_remote_shell",
        category: "remote_exec",
        severity: 3,
        title: { ja: "外部取得→即実行", en: "Remote download piped to shell" },
        reason: {
          ja: "外部スクリプトを検証せず即実行するパターン。中身確認・保存してから実行が安全。",
          en: "Runs remote scripts without inspection. Safer to download, inspect, then execute.",
        },
        re: /\b(curl|wget)\b[^\n|]*\|\s*(sh|bash|zsh)\b/i,
      });
      rules.push({
        id: "curl_bash",
        category: "remote_exec",
        severity: 3,
        title: { ja: "curl|bash系", en: "curl|bash pattern" },
        reason: {
          ja: "パイプで直接シェルへ流す実行は危険度が高い。",
          en: "Piping directly into a shell is high risk.",
        },
        re: /\b(curl|wget)\b.*\|\s*(sudo\s+)?bash\b/i,
      });
    }
    if (isPS) {
      rules.push({
        id: "iwr_iex",
        category: "remote_exec",
        severity: 3,
        title: { ja: "IWR/IEX 即実行", en: "Invoke-WebRequest piped to IEX" },
        reason: {
          ja: "外部スクリプトを即実行する高リスクパターン。保存して内容確認が推奨。",
          en: "High-risk remote execution. Save and inspect before running.",
        },
        re: /\b(iwr|Invoke-WebRequest)\b.*\|\s*(iex|Invoke-Expression)\b/i,
      });
    }

    // --- Destructive / wipe ---
    if (isUnix) {
      rules.push({
        id: "rm_rf",
        category: "destructive",
        severity: 3,
        title: { ja: "rm -rf", en: "rm -rf" },
        reason: {
          ja: "再帰削除。対象パスの誤りで致命的な削除になる可能性。",
          en: "Recursive delete. A wrong target can be catastrophic.",
        },
        re: /\brm\b\s+(-[^\n]*r[^\n]*f|-f[^\n]*r|-r[^\n]*f)\b/i,
      });
      rules.push({
        id: "dd",
        category: "destructive",
        severity: 3,
        title: { ja: "dd（書き込み）", en: "dd (write)" },
        reason: {
          ja: "ディスク等へ直接書き込みする可能性。対象デバイス誤りは致命的。",
          en: "May write raw data to devices. Wrong target can brick disks.",
        },
        re: /\bdd\b/i,
      });
      rules.push({
        id: "mkfs",
        category: "destructive",
        severity: 3,
        title: { ja: "mkfs/format", en: "mkfs/format" },
        reason: {
          ja: "ファイルシステム初期化系。データ消失リスクが高い。",
          en: "Filesystem formatting. High risk of data loss.",
        },
        re: /\bmkfs(\.\w+)?\b|\bformat\b/i,
      });
      rules.push({
        id: "sudo_rm_root",
        category: "destructive",
        severity: 3,
        title: { ja: "root直下の削除疑い", en: "Possible root-level deletion" },
        reason: {
          ja: "/ や ~ 直下の再帰操作は非常に危険。対象確認が必須。",
          en: "Recursive operations on / or ~ are extremely risky. Verify targets.",
        },
        re: /\brm\b[^\n]*(\/\s*$|\/\s+|~\/?(\s|$))/i,
      });
    }

    if (isPS) {
      rules.push({
        id: "remove_item_force",
        category: "destructive",
        severity: 3,
        title: { ja: "Remove-Item -Recurse -Force", en: "Remove-Item -Recurse -Force" },
        reason: {
          ja: "再帰削除。対象パスの誤りで大規模削除になる可能性。",
          en: "Recursive delete. Wrong target can delete large areas.",
        },
        re: /\bRemove-Item\b.*\b-Recurse\b.*\b-Force\b/i,
      });
      rules.push({
        id: "rm_alias",
        category: "destructive",
        severity: 2,
        title: { ja: "rm/del エイリアス", en: "rm/del aliases" },
        reason: {
          ja: "PowerShellの別名コマンド。オプション次第で危険。",
          en: "Aliases can be destructive depending on flags/targets.",
        },
        re: /\b(rm|del|erase)\b\s+/i,
      });
      rules.push({
        id: "danger_path_c_root",
        category: "risky_target",
        severity: 3,
        title: { ja: "C:\\ 直下操作疑い", en: "Possible C:\\ root target" },
        reason: {
          ja: "C:\\ 直下や広範囲対象は危険。対象確認・限定が必須。",
          en: "Operating on C:\\ root/broad targets is risky. Scope it down.",
        },
        re: /C:\\\s*($|\\|")/i,
      });
    }

    // --- Git dangerous operations ---
    rules.push({
      id: "git_reset_hard",
      category: "destructive",
      severity: 2,
      title: { ja: "git reset --hard", en: "git reset --hard" },
      reason: {
        ja: "未コミット変更が消える可能性。ブランチ/対象の確認が必要。",
        en: "Can discard uncommitted changes. Verify branch/targets.",
      },
      re: /\bgit\b\s+reset\b.*--hard\b/i,
    });
    rules.push({
      id: "git_clean_fd",
      category: "destructive",
      severity: 2,
      title: { ja: "git clean -fd", en: "git clean -fd" },
      reason: {
        ja: "追跡外ファイルを削除。復元が難しい場合あり。",
        en: "Deletes untracked files. Can be hard to recover.",
      },
      re: /\bgit\b\s+clean\b.*-(?:f.*d|d.*f)\b/i,
    });

    // --- Docker prune ---
    rules.push({
      id: "docker_prune",
      category: "destructive",
      severity: 2,
      title: { ja: "docker prune", en: "docker prune" },
      reason: {
        ja: "未使用リソース削除。環境破壊や再取得コストの可能性。",
        en: "Removes unused resources. Can break env / costs to rebuild.",
      },
      re: /\bdocker\b\s+(system\s+prune|image\s+prune|container\s+prune|volume\s+prune)\b/i,
    });

    // --- Permission / ownership ---
    if (isUnix) {
      rules.push({
        id: "chmod_777",
        category: "permissions",
        severity: 2,
        title: { ja: "chmod 777", en: "chmod 777" },
        reason: {
          ja: "権限を広げすぎ。意図しない書き換え・漏洩の原因になりうる。",
          en: "Over-permissive. Can lead to unintended access/modification.",
        },
        re: /\bchmod\b[^\n]*\b777\b/i,
      });
      rules.push({
        id: "chmod_recursive",
        category: "permissions",
        severity: 2,
        title: { ja: "chmod -R", en: "chmod -R" },
        reason: {
          ja: "再帰的権限変更は影響範囲が広い。対象確認が必要。",
          en: "Recursive permission changes have broad impact. Verify scope.",
        },
        re: /\bchmod\b[^\n]*\s-\w*R\w*\b/i,
      });
      rules.push({
        id: "chown_recursive",
        category: "permissions",
        severity: 2,
        title: { ja: "chown -R", en: "chown -R" },
        reason: {
          ja: "所有者変更が広範囲に及ぶ可能性。対象を限定する。",
          en: "Recursive ownership changes can be broad. Scope it down.",
        },
        re: /\bchown\b[^\n]*\s-\w*R\w*\b/i,
      });
    }

    if (isPS) {
      rules.push({
        id: "icacls_grant",
        category: "permissions",
        severity: 2,
        title: { ja: "icacls grant", en: "icacls grant" },
        reason: {
          ja: "アクセス権変更。範囲が広いと被害拡大の元。",
          en: "Permission changes. Broad scope can increase risk.",
        },
        re: /\bicacls\b[^\n]*\bgrant\b/i,
      });
    }

    // --- System impact / service stop/reboot ---
    if (isUnix) {
      rules.push({
        id: "shutdown_reboot",
        category: "system_impact",
        severity: 2,
        title: { ja: "shutdown/reboot", en: "shutdown/reboot" },
        reason: {
          ja: "再起動・停止で作業中断やサービス影響の可能性。",
          en: "May reboot/stop system, interrupting work/services.",
        },
        re: /\b(shutdown|reboot)\b/i,
      });
      rules.push({
        id: "systemctl_stop",
        category: "system_impact",
        severity: 2,
        title: { ja: "systemctl stop", en: "systemctl stop" },
        reason: {
          ja: "サービス停止。影響範囲の確認が必要。",
          en: "Stops services. Verify impact.",
        },
        re: /\bsystemctl\b\s+stop\b/i,
      });
      rules.push({
        id: "kill_9",
        category: "system_impact",
        severity: 2,
        title: { ja: "kill -9", en: "kill -9" },
        reason: {
          ja: "強制終了。データ破損の可能性がある。",
          en: "Force kill may cause data corruption.",
        },
        re: /\bkill\b[^\n]*\s-9\b/i,
      });
    }

    if (isPS) {
      rules.push({
        id: "shutdown_ps",
        category: "system_impact",
        severity: 2,
        title: { ja: "shutdown", en: "shutdown" },
        reason: {
          ja: "停止/再起動。実行環境への影響が大きい。",
          en: "Shutdown/restart can heavily impact the environment.",
        },
        re: /\bshutdown\b/i,
      });
      rules.push({
        id: "net_stop",
        category: "system_impact",
        severity: 2,
        title: { ja: "net stop", en: "net stop" },
        reason: {
          ja: "サービス停止。影響確認が必要。",
          en: "Stops services. Verify impact.",
        },
        re: /\bnet\b\s+stop\b/i,
      });
      rules.push({
        id: "stop_service",
        category: "system_impact",
        severity: 2,
        title: { ja: "Stop-Service", en: "Stop-Service" },
        reason: {
          ja: "サービス停止。影響確認が必要。",
          en: "Stops services. Verify impact.",
        },
        re: /\bStop-Service\b/i,
      });
    }

    // --- Risky targets (broad scope) ---
    if (isUnix) {
      rules.push({
        id: "risky_target_root",
        category: "risky_target",
        severity: 2,
        title: { ja: "危険パス疑い（/ や ~）", en: "Risky target (/ or ~)" },
        reason: {
          ja: "広範囲対象の可能性。対象確認と限定が必要。",
          en: "May target broad locations. Verify and scope down.",
        },
        re: /(^|\s)(\/\s*$|~\s*$|\/\.\.\s*$)/,
      });
    }

    return rules;
  }

  // ====== Analyzer ======
  function analyze(os, inputText) {
    const text = normalizeNewlines(inputText).trimEnd();
    const lines = splitLines(text);
    const rules = buildRules(os);

    /** @type {Array<{line:number, raw:string, hits:Array<any>}>} */
    const perLine = [];
    /** @type {Array<{line:number, raw:string, rule:any}>} */
    const findings = [];

    const categoriesHit = new Set();

    // Scan each line (simple, explainable, stable)
    lines.forEach((raw, idx) => {
      const lineNo = idx + 1;
      const line = raw || "";
      const hits = [];

      // ignore empty line
      if (!line.trim()) {
        perLine.push({ line: lineNo, raw, hits: [] });
        return;
      }

      for (const rule of rules) {
        if (rule.re.test(line)) {
          hits.push(rule);
          findings.push({ line: lineNo, raw, rule });
          categoriesHit.add(rule.category);
        }
      }

      perLine.push({ line: lineNo, raw, hits });
    });

    // Compute risk score
    // high severity hits push to HIGH quickly
    let score = 0;
    let maxSeverity = 0;

    // De-duplicate same rule on same line in scoring
    const seen = new Set();
    for (const f of findings) {
      const key = `${f.line}:${f.rule.id}`;
      if (seen.has(key)) continue;
      seen.add(key);

      score += f.rule.severity;
      maxSeverity = Math.max(maxSeverity, f.rule.severity);
    }

    // Risk mapping:
    // - Any severity 3 OR score >= 5 => HIGH
    // - score 2..4 => MEDIUM
    // - score 0..1 => LOW
    let risk = "LOW";
    if (maxSeverity >= 3 || score >= 5) risk = "HIGH";
    else if (score >= 2) risk = "MEDIUM";

    // Basic hints (always)
    const hints = buildHints(os, risk, categoriesHit);

    // Pro templates + checklist from categories
    const pro = buildProPack(os, categoriesHit, findings);

    return {
      os,
      input: text,
      lines,
      findings,
      categoriesHit: Array.from(categoriesHit),
      score,
      risk,
      hints,
      pro,
    };
  }

  function buildHints(os, risk, categoriesHit) {
    const hints = [];

    // universal
    hints.push(t("対象確認：実行前に pwd / ls（or dir）で場所と対象を確認", "Verify targets: check pwd / ls (or dir) before running"));
    hints.push(t("段階実行：いきなり一発で走らせず、影響の小さい確認から", "Run in steps: start with low-impact checks before destructive actions"));
    hints.push(t("バックアップ：git status / コピー / スナップショットなど", "Back up: git status, copies, snapshots, etc."));

    if (categoriesHit.has("remote_exec")) {
      hints.push(t("外部取得→即実行は避ける：保存して中身を読んでから実行", "Avoid remote piping: save and inspect scripts before executing"));
    }
    if (categoriesHit.has("destructive")) {
      hints.push(t("破壊系は特に注意：対象パスを限定、-i/--dry-run/確認コマンドを併用", "Destructive ops: scope targets, use -i/--dry-run/verification commands"));
    }
    if (categoriesHit.has("permissions")) {
      hints.push(t("権限変更は最小範囲：再帰（-R）は対象を限定して実行", "Permissions: keep scope minimal; be careful with recursive changes"));
    }
    if (categoriesHit.has("system_impact")) {
      hints.push(t("サービス停止/再起動は影響範囲を確認：本番環境なら特に慎重に", "Service stop/reboot: verify impact, especially in production"));
    }

    if (risk === "HIGH") {
      hints.push(t("HIGH：迷うなら実行しない（安全側に倒す）", "HIGH: if unsure, do not run it (choose the safe side)"));
    } else if (risk === "MEDIUM") {
      hints.push(t("MEDIUM：実行前に対象・権限・影響範囲を再チェック", "MEDIUM: re-check targets/permissions/impact before running"));
    } else {
      hints.push(t("LOW：危険パターンは未検出。ただし安全保証ではない", "LOW: no risky patterns detected, but not a safety guarantee"));
    }

    // OS specific
    if (os === "powershell") {
      hints.push(t("PowerShell：エイリアス（rm/del等）に注意。実体コマンドを確認", "PowerShell: beware aliases (rm/del). Confirm actual command behavior"));
    }

    return hints;
  }

  // ====== Pro Step 1 Pack ======
  function buildProPack(os, categoriesHitSet, findings) {
    const cats = new Set(categoriesHitSet);

    // Identify specific triggers for better templates
    const hasPipeExec = findings.some((f) => f.rule.category === "remote_exec");
    const hasRmRf = findings.some((f) => f.rule.id === "rm_rf");
    const hasRemoveItem = findings.some((f) => f.rule.id === "remove_item_force");
    const hasGitClean = findings.some((f) => f.rule.id === "git_clean_fd");
    const hasGitResetHard = findings.some((f) => f.rule.id === "git_reset_hard");
    const hasDockerPrune = findings.some((f) => f.rule.id === "docker_prune");
    const hasChmod777 = findings.some((f) => f.rule.id === "chmod_777");

    /** @type {Array<{title:{ja:string,en:string}, body:{ja:string,en:string}}>} */
    const templates = [];

    /** @type {Array<{ja:string,en:string}>} */
    const checklist = [];

    // Universal Pro checklist items
    checklist.push({
      ja: "実行場所を確認（pwd / ls / dir）して、想定ディレクトリか？",
      en: "Confirm your working directory (pwd/ls/dir). Is it the intended location?",
    });
    checklist.push({
      ja: "対象を列挙して確認（削除や変更の前に一覧表示）できるか？",
      en: "Can you list/preview targets before deleting/modifying anything?",
    });
    checklist.push({
      ja: "ロールバック手段（git、バックアップ、スナップショット）があるか？",
      en: "Do you have a rollback plan (git, backup, snapshot)?",
    });

    if (cats.has("remote_exec") || hasPipeExec) {
      templates.push({
        title: { ja: "外部スクリプトは“保存→中身確認→実行”", en: "For remote scripts: download → inspect → run" },
        body: {
          ja:
            "1) まず保存\n" +
            "   curl -fsSL URL -o script.sh\n" +
            "2) 中身確認\n" +
            "   sed -n '1,160p' script.sh\n" +
            "   (または less script.sh)\n" +
            "3) 実行権限は最小で\n" +
            "   bash script.sh\n\n" +
            "※ いきなり `curl ... | sh` は避ける",
          en:
            "1) Save first\n" +
            "   curl -fsSL URL -o script.sh\n" +
            "2) Inspect contents\n" +
            "   sed -n '1,160p' script.sh\n" +
            "   (or less script.sh)\n" +
            "3) Run explicitly\n" +
            "   bash script.sh\n\n" +
            "Avoid `curl ... | sh` when possible.",
        },
      });

      if (os === "powershell") {
        templates.push({
          title: { ja: "PowerShell: IWR|IEX を分解", en: "PowerShell: split IWR|IEX" },
          body: {
            ja:
              "1) まず保存\n" +
              "   iwr URL -OutFile script.ps1\n" +
              "2) 中身確認\n" +
              "   Get-Content script.ps1 -TotalCount 160\n" +
              "3) 実行（必要なら）\n" +
              "   powershell -ExecutionPolicy Bypass -File .\\script.ps1\n\n" +
              "※ いきなり `iwr ... | iex` は避ける",
            en:
              "1) Save\n" +
              "   iwr URL -OutFile script.ps1\n" +
              "2) Inspect\n" +
              "   Get-Content script.ps1 -TotalCount 160\n" +
              "3) Run explicitly (if needed)\n" +
              "   powershell -ExecutionPolicy Bypass -File .\\script.ps1\n\n" +
              "Avoid `iwr ... | iex` when possible.",
          },
        });
      }

      checklist.push({
        ja: "ダウンロード元URLは信頼できるか？（公式/署名/コミット）",
        en: "Is the download source trustworthy? (official site/signature/commit)",
      });
      checklist.push({
        ja: "実行前に“何が変更されるか”を説明できるか？",
        en: "Can you explain what will change before executing?",
      });
    }

    if (cats.has("destructive") || hasRmRf || hasRemoveItem) {
      templates.push({
        title: { ja: "削除の前に“対象を見える化”", en: "Before delete: make targets visible" },
        body: {
          ja:
            "削除前に対象を列挙して確認：\n" +
            "  ls -la TARGET\n" +
            "  find TARGET -maxdepth 2 -type f | head\n\n" +
            "対話的にする：\n" +
            "  rm -ri TARGET\n\n" +
            "どうしても強制なら、パスを二重確認してから：\n" +
            "  pwd\n" +
            "  echo TARGET\n",
          en:
            "Preview targets first:\n" +
            "  ls -la TARGET\n" +
            "  find TARGET -maxdepth 2 -type f | head\n\n" +
            "Use interactive mode:\n" +
            "  rm -ri TARGET\n\n" +
            "If you must force it, double-check:\n" +
            "  pwd\n" +
            "  echo TARGET\n",
        },
      });

      if (hasRmRf) {
        templates.push({
          title: { ja: "rm -rf の“代替”例", en: "Safer alternatives to rm -rf" },
          body: {
            ja:
              "・まず dry-run 的に対象確認（find/ls）\n" +
              "・rm -ri で対話削除\n" +
              "・ゴミ箱があるなら（環境次第）：trash コマンド利用\n\n" +
              "例：\n" +
              "  ls -la ./build\n" +
              "  rm -ri ./build\n",
            en:
              "• Preview first (ls/find)\n" +
              "• Use rm -ri for interactive deletes\n" +
              "• Use a trash command if available\n\n" +
              "Example:\n" +
              "  ls -la ./build\n" +
              "  rm -ri ./build\n",
          },
        });
      }

      if (hasRemoveItem) {
        templates.push({
          title: { ja: "PowerShell: Remove-Item の“縮小”", en: "PowerShell: scope down Remove-Item" },
          body: {
            ja:
              "・まず対象確認：\n" +
              "  Get-ChildItem TARGET -Recurse | Select-Object -First 50\n\n" +
              "・範囲を狭める（ワイルドカード/特定拡張子）\n" +
              "・-WhatIf が使えるコマンドは併用\n",
            en:
              "• Preview targets:\n" +
              "  Get-ChildItem TARGET -Recurse | Select-Object -First 50\n\n" +
              "• Narrow scope (wildcards/file types)\n" +
              "• Use -WhatIf when available\n",
          },
        });
      }

      checklist.push({
        ja: "削除/破壊の前に、対象パスを“コピペで再確認”したか？",
        en: "Did you re-check the exact target path (copy/paste) before deleting?",
      });
      checklist.push({
        ja: "本番・共有環境ではないか？（本番なら特に止める）",
        en: "Is this production/shared? (If yes, stop and reassess.)",
      });
    }

    if (cats.has("permissions") || hasChmod777) {
      templates.push({
        title: { ja: "権限変更は“最小”に", en: "Permissions: least privilege" },
        body: {
          ja:
            "・777 は避け、必要最小に：\n" +
            "  chmod 644 file\n" +
            "  chmod 755 dir\n\n" +
            "・再帰（-R）を使うなら対象を限定：\n" +
            "  chmod -R 755 ./public\n\n" +
            "・変更前後で確認：\n" +
            "  ls -la TARGET\n",
          en:
            "• Avoid 777; use minimal permissions:\n" +
            "  chmod 644 file\n" +
            "  chmod 755 dir\n\n" +
            "• If using -R, keep scope narrow:\n" +
            "  chmod -R 755 ./public\n\n" +
            "• Verify before/after:\n" +
            "  ls -la TARGET\n",
        },
      });

      checklist.push({
        ja: "“誰が書ける/読める”が広がっていないか？（777/Everyone）",
        en: "Are you expanding access too broadly? (777/Everyone)",
      });
    }

    if (hasGitClean || hasGitResetHard) {
      templates.push({
        title: { ja: "git 破壊コマンドの前に", en: "Before destructive git commands" },
        body: {
          ja:
            "・状態確認：\n" +
            "  git status\n" +
            "  git diff\n\n" +
            "・消えるものを見える化：\n" +
            "  git clean -nd   （dry-run）\n\n" +
            "・バックアップ/退避：\n" +
            "  git stash -u\n",
          en:
            "• Check status:\n" +
            "  git status\n" +
            "  git diff\n\n" +
            "• Preview what will be deleted:\n" +
            "  git clean -nd (dry-run)\n\n" +
            "• Backup/stash:\n" +
            "  git stash -u\n",
        },
      });

      checklist.push({
        ja: "git clean は必ず -n（dry-run）で確認したか？",
        en: "Did you run git clean with -n (dry-run) first?",
      });
    }

    if (hasDockerPrune) {
      templates.push({
        title: { ja: "docker prune の前に", en: "Before docker prune" },
        body: {
          ja:
            "・何が消えるか確認：\n" +
            "  docker system df\n\n" +
            "・段階的に：\n" +
            "  docker image prune\n" +
            "  docker container prune\n\n" +
            "・本当に system prune -a が必要か再検討\n",
          en:
            "• Inspect space usage:\n" +
            "  docker system df\n\n" +
            "• Prune step-by-step:\n" +
            "  docker image prune\n" +
            "  docker container prune\n\n" +
            "Reconsider whether system prune -a is necessary.\n",
        },
      });

      checklist.push({
        ja: "docker system df で影響を確認したか？",
        en: "Did you check impact with docker system df first?",
      });
    }

    // If no hits, keep Pro minimal
    if (templates.length === 0) {
      templates.push({
        title: { ja: "Pro: 安全運用テンプレ（一般）", en: "Pro: General safe-run template" },
        body: {
          ja:
            "・実行前：pwd / ls（対象確認）\n" +
            "・変更系：dry-run / 影響範囲の見える化\n" +
            "・破壊系：バックアップ + 対話モード（-i）\n",
          en:
            "• Before run: pwd/ls (verify targets)\n" +
            "• Changes: dry-run / preview impact\n" +
            "• Destructive: backup + interactive mode (-i)\n",
        },
      });
    }

    return { templates, checklist };
  }

  // ====== Rendering ======
  function renderResult(result) {
    window.__nw_lastResult = result;

    // Risk badge
    const risk = result.risk;
    riskBadge.textContent = risk;
    riskBadge.className = "badge";

    if (risk === "HIGH") riskBadge.classList.add("badge-danger");
    else if (risk === "MEDIUM") riskBadge.classList.add("badge-warn");
    else riskBadge.classList.add("badge-ok");

    // Summary chips
    clearChildren(summaryChips);
    const chipTexts = [];
    if (result.categoriesHit.includes("remote_exec")) chipTexts.push(t("外部即実行", "Remote exec"));
    if (result.categoriesHit.includes("destructive")) chipTexts.push(t("破壊/削除", "Destructive"));
    if (result.categoriesHit.includes("permissions")) chipTexts.push(t("権限", "Permissions"));
    if (result.categoriesHit.includes("system_impact")) chipTexts.push(t("サービス影響", "System impact"));
    if (result.categoriesHit.includes("risky_target")) chipTexts.push(t("危険パス", "Risky target"));

    if (chipTexts.length === 0) chipTexts.push(t("検出なし", "No hits"));

    chipTexts.forEach((ct) => summaryChips.appendChild(makeChip(ct)));

    // Findings
    clearChildren(findingsEl);

    if (result.findings.length === 0) {
      const div = document.createElement("div");
      div.className = "finding none";
      div.innerHTML = `
        <div class="finding-title">${escapeHtml(t("危険パターンは検出されませんでした", "No risky patterns detected"))}</div>
        <div class="finding-body">${escapeHtml(t("ただし安全を保証するものではありません。実行前に内容と対象を確認してください。", "This does not guarantee safety. Verify contents and targets before running."))}</div>
      `;
      findingsEl.appendChild(div);
    } else {
      // Group by line
      const byLine = new Map();
      for (const f of result.findings) {
        const key = f.line;
        if (!byLine.has(key)) byLine.set(key, []);
        byLine.get(key).push(f);
      }

      for (const [lineNo, arr] of byLine.entries()) {
        const raw = arr[0].raw;
        const wrap = document.createElement("div");
        wrap.className = "finding";

        const top = document.createElement("div");
        top.className = "finding-top";
        top.innerHTML = `<div class="finding-title">L${lineNo}</div>`;

        const code = document.createElement("div");
        code.className = "finding-code";
        code.innerHTML = `<code>${escapeHtml(raw || "")}</code>`;

        const list = document.createElement("div");
        list.className = "finding-list";

        // De-dup rule ids
        const seen = new Set();
        for (const item of arr) {
          if (seen.has(item.rule.id)) continue;
          seen.add(item.rule.id);

          const row = document.createElement("div");
          row.className = "finding-item";

          const title = currentLang === "ja" ? item.rule.title.ja : item.rule.title.en;
          const reason = currentLang === "ja" ? item.rule.reason.ja : item.rule.reason.en;

          const sev = item.rule.severity;
          const sevText = sev === 3 ? "HIGH" : sev === 2 ? "MEDIUM" : "LOW";

          row.innerHTML = `
            <div class="finding-item-head">
              <span class="finding-sev ${sevText.toLowerCase()}">${sevText}</span>
              <span class="finding-item-title">${escapeHtml(title)}</span>
            </div>
            <div class="finding-item-reason">${escapeHtml(reason)}</div>
          `;
          list.appendChild(row);
        }

        wrap.appendChild(top);
        wrap.appendChild(code);
        wrap.appendChild(list);
        findingsEl.appendChild(wrap);
      }
    }

    // Hints
    clearChildren(hintsEl);
    result.hints.forEach((hint) => {
      const li = document.createElement("li");
      li.textContent = hint;
      hintsEl.appendChild(li);
    });

    // Pro UI (Step 1)
    renderPro(result);

    // Show result
    resultSection.hidden = false;
  }

  function renderPro(result) {
    if (!proBlock) return;

    // Ensure a container exists
    let proDynamic = document.getElementById("proDynamic");
    if (!proDynamic) {
      proDynamic = document.createElement("div");
      proDynamic.id = "proDynamic";
      proDynamic.className = "pro-dynamic";
      proDynamic.style.marginTop = "10px";
      proBlock.appendChild(proDynamic);
    }

    clearChildren(proDynamic);

    const enabled = isProEnabled();

    // Header controls
    const controls = document.createElement("div");
    controls.className = "pro-controls";
    controls.style.display = "flex";
    controls.style.gap = "10px";
    controls.style.flexWrap = "wrap";
    controls.style.alignItems = "center";

    const state = document.createElement("div");
    state.className = "pro-state";
    state.style.fontSize = "12px";
    state.style.color = "#6b7280";
    state.textContent = enabled
      ? t("Pro：この端末で有効（ローカル）", "Pro: enabled on this device (local)")
      : t("Pro：未有効（購入後に有効化できます）", "Pro: not enabled (enable after purchase)");

    controls.appendChild(state);

    // Enable button (honor system)
    const btnEnable = document.createElement("button");
    btnEnable.type = "button";
    btnEnable.className = "btn";
    btnEnable.textContent = enabled ? t("Proを無効化", "Disable Pro") : t("Proをこの端末で有効化", "Enable Pro on this device");
    btnEnable.addEventListener("click", () => {
      if (enabled) disablePro();
      else enablePro();
    });
    controls.appendChild(btnEnable);

    // Buy link (always)
    const buy = document.createElement("a");
    buy.className = "btn btn-primary";
    buy.href = PAYMENT_LINK;
    buy.target = "_blank";
    buy.rel = "noopener";
    buy.style.textDecoration = "none";
    buy.textContent = t("Proを購入（$2.99）", "Buy Pro ($2.99)");
    controls.appendChild(buy);

    proDynamic.appendChild(controls);

    // Content area
    const divider = document.createElement("div");
    divider.className = "divider";
    divider.style.margin = "12px 0";
    proDynamic.appendChild(divider);

    const title = document.createElement("div");
    title.className = "h2";
    title.style.marginBottom = "8px";
    title.textContent = t("Proテンプレ（安全代替案）", "Pro templates (safer alternatives)");
    proDynamic.appendChild(title);

    if (!enabled) {
      const msg = document.createElement("div");
      msg.className = "pro-locked";
      msg.style.fontSize = "13px";
      msg.style.lineHeight = "1.7";
      msg.style.color = "#111827";
      msg.innerHTML = `
        <div style="margin-bottom:6px;">
          <b>${escapeHtml(t("ロック中", "Locked"))}</b> — ${escapeHtml(t("購入後に「Proをこの端末で有効化」を押すと表示されます。", "After purchase, click “Enable Pro on this device” to show templates."))}
        </div>
        <div style="color:#6b7280;">
          ${escapeHtml(t("※このMVPでは購入確認後に端末ローカルでProを有効化します。", "This MVP enables Pro locally on your device after purchase verification."))}
        </div>
      `;
      proDynamic.appendChild(msg);

      // Tiny preview (non-actionable)
      const preview = document.createElement("div");
      preview.className = "code";
      preview.style.opacity = "0.55";
      preview.textContent = t(
        "Preview:\n- Download → Inspect → Run (avoid curl|sh)\n- Preview targets before delete (ls/find)\n- Use least privilege (avoid 777)",
        "Preview:\n- Download → Inspect → Run (avoid curl|sh)\n- Preview targets before delete (ls/find)\n- Use least privilege (avoid 777)"
      );
      proDynamic.appendChild(preview);
      return;
    }

    // Render templates
    const { templates, checklist } = result.pro;

    templates.forEach((tpl) => {
      const card = document.createElement("div");
      card.className = "card";
      card.style.margin = "10px 0";
      card.style.boxShadow = "none";
      card.style.border = "1px solid #e5e7eb";

      const h = document.createElement("div");
      h.className = "h2";
      h.style.marginBottom = "8px";
      h.textContent = currentLang === "ja" ? tpl.title.ja : tpl.title.en;

      const pre = document.createElement("div");
      pre.className = "code";
      pre.textContent = currentLang === "ja" ? tpl.body.ja : tpl.body.en;

      card.appendChild(h);
      card.appendChild(pre);
      proDynamic.appendChild(card);
    });

    // Checklist
    const title2 = document.createElement("div");
    title2.className = "h2";
    title2.style.marginTop = "12px";
    title2.textContent = t("実行前チェックリスト（Pro）", "Pre-run checklist (Pro)");
    proDynamic.appendChild(title2);

    const ul = document.createElement("ul");
    ul.className = "ul";
    checklist.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = currentLang === "ja" ? c.ja : c.en;
      ul.appendChild(li);
    });
    proDynamic.appendChild(ul);
  }

  // ====== Report ======
  function buildReport(result) {
    const lines = [];
    lines.push(`Command Safety Checker — Report`);
    lines.push(`OS: ${result.os === "unix" ? "Linux/macOS" : "Windows PowerShell"}`);
    lines.push(`Risk: ${result.risk} (score=${result.score})`);
    lines.push(`Categories: ${result.categoriesHit.join(", ") || "none"}`);
    lines.push("");

    lines.push("Findings:");
    if (result.findings.length === 0) {
      lines.push("- none");
    } else {
      // de-dup
      const seen = new Set();
      for (const f of result.findings) {
        const key = `${f.line}:${f.rule.id}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const title = currentLang === "ja" ? f.rule.title.ja : f.rule.title.en;
        const reason = currentLang === "ja" ? f.rule.reason.ja : f.rule.reason.en;
        lines.push(`- L${f.line}: ${title}`);
        lines.push(`  ${reason}`);
        lines.push(`  > ${f.raw}`);
      }
    }
    lines.push("");

    lines.push("Hints:");
    result.hints.forEach((h) => lines.push(`- ${h}`));

    return lines.join("\n");
  }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      alert(t("コピーしました", "Copied"));
    } catch {
      // fallback
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

  // ====== Actions ======
  function onCheck() {
    const os = osSelect?.value || "unix";
    const text = commandInput?.value || "";
    const trimmed = normalizeNewlines(text).trim();

    if (!trimmed) {
      alert(t("コマンドを入力してください", "Please paste a command"));
      return;
    }

    setProgress(true);

    // Simulate async for UX
    setTimeout(() => {
      const result = analyze(os, trimmed);
      setProgress(false);
      renderResult(result);
    }, 120);
  }

  function onClear() {
    if (commandInput) commandInput.value = "";
    if (resultSection) resultSection.hidden = true;
    if (findingsEl) clearChildren(findingsEl);
    if (hintsEl) clearChildren(hintsEl);
    window.__nw_lastResult = null;
  }

  function onReset() {
    onClear();
    if (osSelect) osSelect.value = "unix";
  }

  function onCopyReport() {
    if (!window.__nw_lastResult) {
      alert(t("まずチェックを実行してください", "Run a check first"));
      return;
    }
    const report = buildReport(window.__nw_lastResult);
    copyToClipboard(report);
  }

  // ====== Wire events ======
  btnCheck?.addEventListener("click", onCheck);
  btnClear?.addEventListener("click", onClear);
  btnReset?.addEventListener("click", onReset);
  btnCopyReport?.addEventListener("click", onCopyReport);

  // Enter/Ctrl+Enter convenience
  commandInput?.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      onCheck();
    }
  });

  // Expose small debug helpers (optional)
  window.__nw_pro = { enablePro, disablePro, isProEnabled };
})();
