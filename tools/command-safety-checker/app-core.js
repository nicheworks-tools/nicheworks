(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const osSelect = $("osSelect");
  const cmdInput = $("cmdInput");
  const analyzeBtn = $("analyzeBtn");
  const clearBtn = $("clearBtn");
  const copyBtn = $("copyBtn");
  const resultSection = $("resultSection");
  const riskLevelEl = $("riskLevel");
  const resultSummaryEl = $("resultSummary");
  const findingsEl = $("findings");
  const saferStepsEl = $("saferSteps");
  const normalizedCmdEl = $("normalizedCmd");
  const normalizedWrap = $("normalizedWrap");
  const toastEl = $("toast");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");

  let currentLang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  const t = (ja, en) => currentLang === "ja" ? ja : en;
  const pick = (obj) => currentLang === "ja" ? obj.ja : obj.en;

  const C = {
    destructive: { ja: "破壊・削除", en: "Destructive delete" },
    remoteExec: { ja: "外部スクリプト実行", en: "Remote script execution" },
    privilege: { ja: "権限昇格", en: "Privilege escalation" },
    disk: { ja: "ディスク操作", en: "Disk operation" },
    exfil: { ja: "漏洩・外部送信", en: "Exfiltration" },
    secrets: { ja: "秘密情報露出", en: "Secret exposure" },
    packages: { ja: "パッケージ導入", en: "Package installation" },
    persistence: { ja: "永続化・自動起動", en: "Persistence/autostart" },
    process: { ja: "プロセス停止", en: "Process control" },
    git: { ja: "Git破壊", en: "Git destructive action" },
    permissions: { ja: "権限変更", en: "Permission change" }
  };

  const rule = (id, os, severity, category, title, why, check, alternative, re, tags) => ({
    id, os, severity, category, title, why, check, alternative, re, tags
  });

  const rules = [
    rule("rm_rf_root", "unix", "HIGH", C.destructive,
      { ja: "rm -rf が /・~・変数パスを対象", en: "rm -rf targets /, ~, or variable path" },
      { ja: "再帰削除がシステム全体・ホーム直下・展開後の不明なパスに向く可能性があります。", en: "Recursive delete may target the whole system, home directory, or an unknown expanded path." },
      { ja: "対象を ls -la / find で確認し、変数は echo で展開結果を確認。", en: "Check the target with ls -la/find; echo variables before using them." },
      { ja: "ls -la 対象 → find 対象 -maxdepth 1 -print → 必要なら rm -ri 対象。", en: "Use ls -la target → find target -maxdepth 1 -print → rm -ri target if needed." },
      /\brm\b(?=[^\n]*-[A-Za-z]*r[A-Za-z]*f|[^\n]*-[A-Za-z]*f[A-Za-z]*r)[^\n]*(?:\s\/(?:\s|$)|\s~(?:\s|$)|\s\$[A-Za-z_]\w*)/i,
      ["delete", "destructive"]),
    rule("rm_rf_general", "unix", "MED", C.destructive,
      { ja: "rm -rf による再帰削除", en: "Recursive delete with rm -rf" },
      { ja: "対象パスの誤りで必要なファイルまで消す可能性があります。", en: "A wrong target path can delete needed files." },
      { ja: "pwd と ls -la で現在地・対象を確認。", en: "Run pwd and ls -la before deleting." },
      { ja: "rm -ri 対象、またはゴミ箱へ移動するコマンドを検討。", en: "Use rm -ri target or move files to trash instead." },
      /\brm\b(?=[^\n]*-[A-Za-z]*r[A-Za-z]*f|[^\n]*-[A-Za-z]*f[A-Za-z]*r)[^\n]+/i,
      ["delete", "destructive"]),
    rule("curl_pipe_shell", "unix", "HIGH", C.remoteExec,
      { ja: "curl/wget の出力をシェルへ直接実行", en: "curl/wget output piped directly to shell" },
      { ja: "外部スクリプトの中身を確認せず、そのまま実行します。", en: "Runs a remote script without inspecting it first." },
      { ja: "URLの提供元、HTTPS、スクリプト内容、チェックサムを確認。", en: "Verify source, HTTPS, script contents, and checksum." },
      { ja: "curl -fsSL URL -o install.sh → less install.sh → shasum -a 256 install.sh。", en: "curl -fsSL URL -o install.sh → less install.sh → shasum -a 256 install.sh." },
      /\b(curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh)\b/i,
      ["remote", "script"]),
    rule("sudo_destructive", "unix", "HIGH", C.privilege,
      { ja: "sudo 付きの破壊的コマンド", en: "Destructive command with sudo" },
      { ja: "高権限で削除・上書き・権限変更を行うため、失敗時の影響が大きくなります。", en: "Elevated privileges make delete/overwrite/permission mistakes more damaging." },
      { ja: "sudo が本当に必要か、対象パスが限定されているか確認。", en: "Check whether sudo is necessary and whether the target is scoped." },
      { ja: "sudo なしで確認コマンドを先に実行し、必要最小限の対象だけにする。", en: "Run non-sudo inspection first and limit the target as much as possible." },
      /\bsudo\b[^\n]*\b(?:rm|dd|mkfs|fdisk|diskutil|truncate|mv|cp|chmod|chown|apt(?:-get)?\s+(?:remove|purge))\b/i,
      ["sudo", "privilege"]),
    rule("disk_write", "unix", "HIGH", C.disk,
      { ja: "dd / mkfs / fdisk / diskutil によるディスク操作", en: "Disk write/format operation" },
      { ja: "対象デバイスの指定ミスでデータ消失につながる可能性があります。", en: "A wrong device target can cause data loss." },
      { ja: "lsblk / diskutil list / df -h で対象を確認。", en: "Inspect with lsblk / diskutil list / df -h." },
      { ja: "まず読み取り専用の確認コマンドだけを実行。", en: "Run read-only inspection commands first." },
      /\b(?:dd\b[^\n]*\bof=\/dev\/(?:sd[a-z]|hd[a-z]|nvme\d+n\d+|disk\d+)|mkfs(?:\.\w+)?|fdisk|parted|diskutil\s+eraseDisk)\b/i,
      ["disk"]),
    rule("git_reset_hard", "all", "MED", C.git,
      { ja: "git reset --hard", en: "git reset --hard" },
      { ja: "未コミットの変更が失われる可能性があります。", en: "Can discard uncommitted changes." },
      { ja: "git status と git diff を確認。", en: "Check git status and git diff." },
      { ja: "git stash push -u -m backup-before-reset または退避ブランチを作成。", en: "Use git stash push -u -m backup-before-reset or create a backup branch." },
      /\bgit\b\s+reset\b[^\n]*--hard\b/i,
      ["git"]),
    rule("git_clean_fd", "all", "MED", C.git,
      { ja: "git clean -fd", en: "git clean -fd" },
      { ja: "追跡外ファイルを削除します。未追加ファイルも消える可能性があります。", en: "Deletes untracked files, including files you have not added yet." },
      { ja: "git clean -nd で削除予定を先に見る。", en: "Run git clean -nd first to preview deletions." },
      { ja: "git clean -nd → 問題なければ対象を限定して実行。", en: "Preview with git clean -nd, then run with a narrower target." },
      /\bgit\b\s+clean\b[^\n]*-(?:[A-Za-z]*f[A-Za-z]*d|[A-Za-z]*d[A-Za-z]*f)\b/i,
      ["git"]),
    rule("chmod_chown_recursive", "unix", "MED", C.permissions,
      { ja: "chmod/chown の再帰的な権限変更", en: "Recursive chmod/chown" },
      { ja: "広範囲の権限や所有者を変えるため、環境を壊す可能性があります。", en: "Broad permission or ownership changes can break an environment." },
      { ja: "対象ディレクトリと変更後の権限を確認。", en: "Confirm target directory and resulting permissions." },
      { ja: "find 対象 -maxdepth 1 -print で対象確認後、必要最小限だけ変更。", en: "Preview with find target -maxdepth 1 -print and change only what is needed." },
      /\b(?:chmod\b[^\n]*-R[^\n]*(?:777|775|666|\+[rwx]{1,3})|chown\b[^\n]*-R\b)/i,
      ["permission"]),
    rule("file_exfil", "unix", "HIGH", C.exfil,
      { ja: "curl/scp/rsync/nc による外部送信", en: "External file transfer via curl/scp/rsync/nc" },
      { ja: "ローカルファイルや秘密情報が外部ホストへ送信される可能性があります。", en: "Local files or secrets may be sent to a remote host." },
      { ja: "送信先URL/ホスト、送信ファイル、機密情報の有無を確認。", en: "Check destination, file path, and whether it contains secrets." },
      { ja: "まずダミーデータで確認し、.env や秘密鍵は送信しない。", en: "Test with dummy data and do not send .env or private keys." },
      /(?:\bcurl\b[^\n]*(?:-d|--data|--data-raw|--data-binary|--form|-F)\s+@[^\s]+|\bscp\b[^\n]+[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+:|\brsync\b[^\n]+[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+:|\b(?:nc|netcat)\b[^\n]*\s+[A-Za-z0-9_.-]+\s+\d+[^\n]*<\s*[^\s]+)/i,
      ["exfil"]),
    rule("secret_exposure", "all", "HIGH", C.secrets,
      { ja: "秘密鍵・.env・URL内トークンの露出", en: "Secret key, .env, or URL token exposure" },
      { ja: "秘密情報が端末、履歴、ログ、共有画面に出る可能性があります。", en: "Secrets may appear in terminals, history, logs, or shared screens." },
      { ja: "出力先が安全か、共有前に伏字化しているか確認。", en: "Check output destination and redact before sharing." },
      { ja: "値は表示せず、存在確認は test -f / ls -l / Get-Item で行う。", en: "Do not print values; use test -f, ls -l, or Get-Item for existence checks." },
      /(?:\bcat\b[^\n]*(?:~\/\.ssh\/(?:id_rsa|id_ed25519)|\.env|\.npmrc|\.pypirc|\.aws\/credentials)|https?:\/\/[^\s"'`]+(?:token|api[_-]?key|key|secret|password)=)/i,
      ["secret"]),
    rule("env_dump", "all", "MED", C.secrets,
      { ja: "環境変数の一括表示", en: "Environment variables dumped" },
      { ja: "APIキーやトークンが環境変数に含まれている場合、そのまま表示されます。", en: "API keys or tokens in environment variables may be printed." },
      { ja: "必要な変数名だけを確認し、出力を共有しない。", en: "Inspect only the needed variable and do not share output." },
      { ja: "printenv NAME / echo $NAME のように個別確認し、秘密値は伏せる。", en: "Use printenv NAME or echo $NAME and redact secret values." },
      /(?:^|[;&|]\s*)(?:printenv|env)(?:\s*$|\s*[;&|])/i,
      ["secret"]),
    rule("package_persistence", "unix", "MED", C.packages,
      { ja: "パッケージ導入・削除・自動起動変更", en: "Package install/remove or persistence change" },
      { ja: "環境全体、依存関係、自動起動に影響する可能性があります。", en: "Can affect the whole environment, dependencies, or autostart behavior." },
      { ja: "公式手順、対象パッケージ、登録内容を確認。", en: "Check official docs, package name, and registered entry." },
      { ja: "venv / npm exec / apt -s / systemctl status / crontab -l で確認から始める。", en: "Start with venv, npm exec, apt -s, systemctl status, or crontab -l." },
      /(?:\bnpm\b[^\n]*\binstall\b[^\n]*(?:\s-g\b|\s--global\b)|\bsudo\b[^\n]*\bpip\d?\b\s+install\b|\b(?:apt|apt-get)\b\s+(?:remove|purge|autoremove)\b|\bsystemctl\b\s+enable\b|\bcrontab\b\s+(?:-e|-r|[^\s]+)|\|\s*crontab\b|\blaunchctl\b[^\n]*(?:load|bootstrap|enable|kickstart)\b)/i,
      ["package", "persistence"]),
    rule("ps_remove_recurse_force", "powershell", "HIGH", C.destructive,
      { ja: "Remove-Item -Recurse -Force", en: "Remove-Item -Recurse -Force" },
      { ja: "確認なしで再帰削除する典型的な危険コマンドです。", en: "A typical dangerous recursive delete without confirmation." },
      { ja: "対象パスを Get-ChildItem で確認し、-WhatIf を先に使う。", en: "Inspect target with Get-ChildItem and use -WhatIf first." },
      { ja: "Get-ChildItem 対象 → Remove-Item 対象 -Recurse -WhatIf → 必要なら -Confirm。", en: "Get-ChildItem target → Remove-Item target -Recurse -WhatIf → use -Confirm if needed." },
      /\bRemove-Item\b[^\n]*(?:-Recurse|-r)\b[^\n]*(?:-Force|-f)\b/i,
      ["ps", "delete"]),
    rule("ps_iwr_iex", "powershell", "HIGH", C.remoteExec,
      { ja: "Invoke-WebRequest / iwr を iex へパイプ", en: "Invoke-WebRequest / iwr piped to iex" },
      { ja: "外部から取得したPowerShellコードを中身確認なしで実行します。", en: "Executes remote PowerShell code without inspection." },
      { ja: "URL提供元、取得内容、署名、ハッシュを確認。", en: "Verify source URL, content, signature, and hash." },
      { ja: "Invoke-WebRequest URL -OutFile script.ps1 → 内容確認 → Get-FileHash script.ps1。", en: "Invoke-WebRequest URL -OutFile script.ps1 → inspect → Get-FileHash script.ps1." },
      /\b(?:Invoke-WebRequest|iwr|curl)\b[^\n|]*\|\s*(?:Invoke-Expression|iex)\b/i,
      ["ps", "remote"]),
    rule("ps_privilege_policy", "powershell", "MED", C.privilege,
      { ja: "ExecutionPolicy Bypass / runAs", en: "ExecutionPolicy Bypass / runAs" },
      { ja: "実行制限を緩めたり、管理者権限でプロセスを起動します。", en: "Loosens execution restrictions or starts a process as administrator." },
      { ja: "対象スクリプト、署名、起動引数を確認。", en: "Check script source, signature, and arguments." },
      { ja: "Process スコープなど最小範囲に限定し、読み取り専用確認から始める。", en: "Limit scope and start with read-only inspection." },
      /(?:\bSet-ExecutionPolicy\b[^\n]*\b(?:Bypass|Unrestricted)\b|\bStart-Process\b[^\n]*-Verb\s+runAs\b)/i,
      ["ps", "privilege"]),
    rule("ps_disk_ops", "powershell", "HIGH", C.disk,
      { ja: "Format-Volume / Clear-Disk / Remove-Partition", en: "Format-Volume / Clear-Disk / Remove-Partition" },
      { ja: "ディスク・ボリューム・パーティションを削除/初期化する可能性があります。", en: "Can erase or format disks, volumes, or partitions." },
      { ja: "Get-Disk / Get-Volume / Get-Partition で対象を確認。", en: "Inspect targets with Get-Disk / Get-Volume / Get-Partition." },
      { ja: "まず Get-* コマンドだけで対象確認。変更系は実行しない。", en: "First use Get-* inspection commands only; do not run mutation commands." },
      /\b(?:Format-Volume|Clear-Disk|Remove-Partition)\b/i,
      ["ps", "disk"]),
    rule("ps_stop_process", "powershell", "MED", C.process,
      { ja: "Stop-Process", en: "Stop-Process" },
      { ja: "重要プロセスを停止し、作業中データやサービスに影響する可能性があります。", en: "May stop important processes and affect work or services." },
      { ja: "Get-Process で対象名/IDを確認。", en: "Verify target name/ID with Get-Process." },
      { ja: "Get-Process -Name 対象 で確認後、必要なら個別IDに限定。", en: "Inspect with Get-Process -Name target, then limit to a specific ID if needed." },
      /\bStop-Process\b[^\n]*(?:-Name|-Id)\b/i,
      ["ps", "process"])
  ];

  const rank = (severity) => severity === "HIGH" ? 3 : severity === "MED" ? 2 : severity === "LOW" ? 1 : 0;
  const applies = (r, os) => r.os === "all" || r.os === os;
  const normalize = (text) => String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
  const esc = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  function setLang(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.lang === lang));
    if (window.__cscLastResult) render(window.__cscLastResult);
  }

  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    clearTimeout(toast.timer);
    toast.timer = setTimeout(() => { toastEl.hidden = true; }, 2200);
  }

  function analyze(input) {
    const normalized = normalize(input);
    const os = osSelect?.value || "unix";
    const lines = normalized ? normalized.split("\n") : [];
    const findings = [];
    const tagSet = new Set();
    const categoryMap = new Map();

    lines.forEach((line, index) => {
      rules.forEach((r) => {
        if (!applies(r, os)) return;
        r.re.lastIndex = 0;
        if (r.re.test(line)) {
          findings.push({ line: index + 1, command: line, rule: r });
          r.tags.forEach((tag) => tagSet.add(tag));
          categoryMap.set(r.category.en, r.category);
        }
      });
    });

    findings.sort((a, b) => rank(b.rule.severity) - rank(a.rule.severity) || a.line - b.line);
    const counts = { HIGH: 0, MED: 0, LOW: 0 };
    findings.forEach((f) => { counts[f.rule.severity] += 1; });
    const risk = findings.reduce((acc, f) => rank(f.rule.severity) > rank(acc) ? f.rule.severity : acc, "LOW");

    return {
      os,
      normalized,
      findings,
      counts,
      categories: Array.from(categoryMap.values()),
      tags: Array.from(tagSet),
      risk: findings.length ? risk : "LOW"
    };
  }

  function saferSteps(result) {
    const tags = new Set(result.tags || []);
    const steps = [
      t("コマンドを一語ずつ読み直し、意味が曖昧なら実行しない。", "Read the command carefully; if anything is unclear, do not run it."),
      t("対象パス・URL・ホスト名・権限を確認してから実行する。", "Check target paths, URLs, hostnames, and privileges before running."),
      t("バックアップ、git commit、または復元できる状態を先に作る。", "Create a backup, git commit, or other recovery point first.")
    ];
    if (tags.has("delete")) steps.push(t("削除系は ls / find / Get-ChildItem / -WhatIf で対象を確認してから判断。", "For deletes, preview targets with ls/find/Get-ChildItem/-WhatIf first."));
    if (tags.has("remote")) steps.push(t("外部スクリプトは直接実行せず、保存して中身を確認してから判断。", "Do not run remote scripts directly; save and inspect them first."));
    if (tags.has("exfil") || tags.has("secret")) steps.push(t("秘密鍵・.env・環境変数・送信先URLを確認し、共有前に必ず伏字化。", "Check keys, .env, environment variables, and destinations; redact before sharing."));
    if (tags.has("disk")) steps.push(t("ディスク操作は対象デバイス名を確認し、バックアップがないなら実行しない。", "For disk operations, verify device names and do not run without backups."));
    if (tags.has("git")) steps.push(t("Git破壊系は git status / git diff / git clean -nd で影響を先に確認。", "For destructive Git commands, preview impact with git status/diff/clean -nd."));
    if (tags.has("persistence")) steps.push(t("自動起動・定期実行は、登録前に現在設定と追加内容を控える。", "For autostart/scheduled jobs, record current and new settings first."));
    if (tags.has("sudo") || tags.has("privilege")) steps.push(t("管理者権限が本当に必要か確認し、まず読み取り専用コマンドで確認。", "Confirm admin privileges are truly needed; start with read-only commands."));
    return steps;
  }

  function renderSummary(result) {
    if (!resultSummaryEl) return;
    const cats = result.categories.length ? result.categories.map((c) => pick(c)).join(" / ") : t("なし", "None");
    resultSummaryEl.innerHTML = `
      <div class="summary-grid">
        <div class="summary-item high"><b>${result.counts.HIGH}</b><span>High</span></div>
        <div class="summary-item medium"><b>${result.counts.MED}</b><span>Medium</span></div>
        <div class="summary-item low"><b>${result.counts.LOW}</b><span>Low</span></div>
      </div>
      <p class="summary-categories"><b>${esc(t("検出カテゴリ", "Categories"))}:</b> ${esc(cats)}</p>
      ${result.findings.length ? "" : `<p class="summary-note">${esc(t("危険パターン未検出。ただし安全保証ではありません。", "No risky pattern detected. This is not a safety guarantee."))}</p>`}
    `;
  }

  function render(result) {
    window.__cscLastResult = result;
    if (resultSection) resultSection.hidden = false;
    if (riskLevelEl) {
      riskLevelEl.textContent = result.risk;
      riskLevelEl.className = `badge ${result.risk === "HIGH" ? "high" : result.risk === "MED" ? "medium" : "low"}`;
    }
    renderSummary(result);

    if (findingsEl) {
      findingsEl.innerHTML = "";
      if (result.findings.length === 0) {
        const li = document.createElement("li");
        li.className = "finding empty";
        li.innerHTML = `<strong>${esc(t("危険パターンは検出されませんでした", "No risky patterns detected"))}</strong><br><span class="meta">${esc(t("ただし安全を保証するものではありません。URL・パス・権限は必ず確認してください。", "This does not guarantee safety. Always check URLs, paths, and privileges."))}</span>`;
        findingsEl.appendChild(li);
      } else {
        result.findings.forEach((item) => {
          const li = document.createElement("li");
          li.className = "finding";
          li.innerHTML = `
            <div class="finding-head">
              <span class="tag ${item.rule.severity.toLowerCase()}">${item.rule.severity}</span>
              <span class="category-pill">${esc(pick(item.rule.category))}</span>
              <span class="finding-title">L${item.line}: ${esc(pick(item.rule.title))}</span>
            </div>
            <div class="code-line">${esc(item.command)}</div>
            <dl class="finding-detail">
              <dt>${esc(t("理由", "Why"))}</dt><dd>${esc(pick(item.rule.why))}</dd>
              <dt>${esc(t("確認", "Check"))}</dt><dd>${esc(pick(item.rule.check))}</dd>
              <dt>${esc(t("代替", "Alternative"))}</dt><dd>${esc(pick(item.rule.alternative))}</dd>
            </dl>`;
          findingsEl.appendChild(li);
        });
      }
    }

    if (saferStepsEl) {
      saferStepsEl.innerHTML = "";
      saferSteps(result).forEach((step) => {
        const li = document.createElement("li");
        li.textContent = step;
        saferStepsEl.appendChild(li);
      });
    }

    if (normalizedCmdEl && normalizedWrap) {
      normalizedCmdEl.textContent = result.normalized;
      normalizedWrap.hidden = !result.normalized;
    }
  }

  function handleAnalyze() {
    const normalized = normalize(cmdInput?.value || "");
    if (!normalized) {
      toast(t("コマンドを入力してください", "Please paste a command"));
      return;
    }
    render(analyze(normalized));
  }

  function handleClear() {
    if (cmdInput) cmdInput.value = "";
    if (resultSection) resultSection.hidden = true;
    if (resultSummaryEl) resultSummaryEl.innerHTML = "";
    if (findingsEl) findingsEl.innerHTML = "";
    if (saferStepsEl) saferStepsEl.innerHTML = "";
    if (normalizedCmdEl) normalizedCmdEl.textContent = "";
    if (normalizedWrap) normalizedWrap.hidden = true;
    window.__cscLastResult = null;
    toast(t("クリアしました", "Cleared"));
  }

  function buildReport(result) {
    const lines = [
      "Command Safety Checker — Report",
      `OS: ${result.os}`,
      `Risk: ${result.risk}`,
      `High: ${result.counts.HIGH} / Medium: ${result.counts.MED} / Low: ${result.counts.LOW}`,
      "",
      "Findings:"
    ];
    if (!result.findings.length) lines.push("- none (not a safety guarantee)");
    result.findings.forEach((item) => {
      lines.push(`- L${item.line}: [${item.rule.severity}] ${pick(item.rule.category)} — ${pick(item.rule.title)}`);
      lines.push(`  command: ${item.command}`);
      lines.push(`  why: ${pick(item.rule.why)}`);
      lines.push(`  check: ${pick(item.rule.check)}`);
      lines.push(`  alternative: ${pick(item.rule.alternative)}`);
    });
    lines.push("", "Safer steps:");
    saferSteps(result).forEach((step) => lines.push(`- ${step}`));
    lines.push("", "Normalized command:", result.normalized || "");
    return lines.join("\n");
  }

  async function copyResults() {
    const result = window.__cscLastResult;
    if (!result) {
      toast(t("まずチェックを実行してください", "Run a check first"));
      return;
    }
    const text = buildReport(result);
    try {
      await navigator.clipboard.writeText(text);
      toast(t("コピーしました", "Copied"));
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        toast(t("コピーしました", "Copied"));
      } catch {
        toast(t("コピーに失敗しました", "Copy failed"));
      } finally {
        document.body.removeChild(ta);
      }
    }
  }

  langButtons.forEach((btn) => btn.addEventListener("click", () => setLang(btn.dataset.lang)));
  analyzeBtn?.addEventListener("click", handleAnalyze);
  clearBtn?.addEventListener("click", handleClear);
  copyBtn?.addEventListener("click", copyResults);
  cmdInput?.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === "Enter") handleAnalyze();
  });
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-preset]");
    if (!btn) return;
    if (btn.dataset.os && osSelect) osSelect.value = btn.dataset.os;
    if (cmdInput) {
      cmdInput.value = btn.dataset.preset || "";
      cmdInput.focus();
    }
  });

  setLang(currentLang);
})();
