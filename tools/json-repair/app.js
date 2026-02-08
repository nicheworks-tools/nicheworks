(function(){
  "use strict";

  function $(id){ return document.getElementById(id); }
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, c => (
      c==="&" ? "&amp;" :
      c==="<" ? "&lt;" :
      c===">" ? "&gt;" :
      c==='"' ? "&quot;" : "&#39;"
    ));
  }

  const I18N = {
    ja: {
      title: "JSON Repair（壊れたJSON修復）",
      subtitle: "壊れたJSONをブラウザ内で修復・検証・整形（外部送信なし）",
      privacyNote: "入力内容は外部送信されません（このページ内でのみ処理）。",
      modeLabel: "Mode",
      levelLabel: "Repair",
      indentLabel: "Indent",
      loadBtn: "ファイル読込",
      inputTitle: "入力",
      outputTitle: "出力",
      validateBtn: "検証",
      repairBtn: "修復",
      prettyBtn: "整形",
      minifyBtn: "ミニファイ",
      resetBtn: "リセット",
      shortcutsHint: "Cmd/Ctrl+Enter: 修復 / Cmd/Ctrl+Shift+Enter: 検証 / Cmd/Ctrl+S: 保存",
      tabRepaired: "修復結果",
      tabFormatted: "整形結果",
      tabValidate: "検証結果",
      copyBtn: "コピー",
      downloadBtn: "保存(.json)",
      logTitle: "修復ログ",
      showDiff: "差分を見る",
      donateText: "このツールが役に立ったら、開発継続のためのご支援をいただけると嬉しいです。",
      linksTitle: "他のツール",
      toastCopied: "コピーしました",
      toastCopyFail: "コピーに失敗しました",
      toastDownloaded: "保存を開始しました",
      toastRepaired: "修復しました",
      toastRepairFail: "修復できませんでした",
      toastValid: "有効なJSONです",
      toastInvalid: "無効なJSONです"
    },
    en: {
      title: "JSON Repair (Fix Broken JSON)",
      subtitle: "Repair, validate, and format broken JSON locally (no external upload).",
      privacyNote: "Your input is processed locally in this page (no external upload).",
      modeLabel: "Mode",
      levelLabel: "Repair",
      indentLabel: "Indent",
      loadBtn: "Load file",
      inputTitle: "Input",
      outputTitle: "Output",
      validateBtn: "Validate",
      repairBtn: "Repair",
      prettyBtn: "Pretty",
      minifyBtn: "Minify",
      resetBtn: "Reset",
      shortcutsHint: "Cmd/Ctrl+Enter: Repair / Cmd/Ctrl+Shift+Enter: Validate / Cmd/Ctrl+S: Download",
      tabRepaired: "Repaired",
      tabFormatted: "Formatted",
      tabValidate: "Validate",
      copyBtn: "Copy",
      downloadBtn: "Download .json",
      logTitle: "Repair Log",
      showDiff: "Show Diff",
      donateText: "If this tool helped, consider supporting continued development.",
      linksTitle: "More tools",
      toastCopied: "Copied",
      toastCopyFail: "Copy failed",
      toastDownloaded: "Download started",
      toastRepaired: "Repaired",
      toastRepairFail: "Repair failed",
      toastValid: "Valid JSON",
      toastInvalid: "Invalid JSON"
    }
  };


  const SAMPLES = {
    trailingComma: '{\n  "a": 1,\n  "b": 2,\n}\n',
    comments: '{\n  // comment\n  "a": 1, /* block */\n  "b": 2\n}\n',
    logMixed: 'INFO something happened id=123\n{\n  "ok": true,\n  "items": [1,2,3]\n}\nDEBUG end\n',
    singleQuotes: "{\n  'a': 'hello',\n  'b': 'world'\n}\n",
    unquotedKeys: "{\n  a: 1,\n  b: { inner_key: 2 }\n}\n",
    pythonLiterals: "{\n  \"enabled\": True,\n  \"value\": None,\n  \"flag\": False\n}\n"
  };

  const state = {
    pro: { enabled:false, key:"" },
    lang: "ja",
    mode: "auto",
    level: "safe",
    indent: 2,
    busy: false,
    last: {
      activeTab: "repaired",
      input: "",
      repaired: "",
      formatted: "",
      diff: "",
      stepDiffs: [],
      validate: { ok:false, msg:"", pos:-1, line:0, col:0, snippet:"" },
      log: []
    }
  };

  function detectInitialLang(){
    const saved = localStorage.getItem("nw_lang");
    if (saved === "ja" || saved === "en") return saved;
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ja") ? "ja" : "en";
  }

  function setLang(lang){
    state.lang = (lang==="en") ? "en" : "ja";
    localStorage.setItem("nw_lang", state.lang);
    document.documentElement.lang = state.lang;

    // Pro (JSON-14)
    loadProFromStorage();
    renderProUI();
    runSchemaCheck();
    $("btnProActivate").addEventListener("click", ()=>{
      const v = validateProKey($("jrProKey").value);
      if (!v.ok){
        toast("Invalid key");
        return;
      }
      setPro(true, v.norm);
      toast("Pro Activated");
    });
    $("btnProClear").addEventListener("click", ()=>{
      $("jrProKey").value = "";
      setPro(false, "");
      toast("Cleared");
    });

    renderI18n();
    renderLangButtons();
    renderValidate();
    renderLog();
  }

  function t(key){
    return (I18N[state.lang] && I18N[state.lang][key]) || key;
  }

  function renderI18n(){
    document.querySelectorAll("[data-i18n]").forEach(el=>{
      const k = el.getAttribute("data-i18n");
      el.textContent = t(k);
    });
  }

  function renderLangButtons(){
    document.querySelectorAll(".nw-lang-btn").forEach(btn=>{
      const on = btn.getAttribute("data-lang") === state.lang;
      btn.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  function setBusy(on){
    state.busy = !!on;
    const busyEl = $("jrBusy");
    if (busyEl) busyEl.textContent = on ? "Working..." : "";
    ["btnValidate","btnRepair","btnFormatPretty","btnFormatMinify","btnCopy","btnDownload","btnReset","btnLoad"].forEach(id=>{
      const el = $(id);
      if (el) el.disabled = on;
    });
  }

  let toastTimer = null;
  function toast(msg){
    const el = $("jrToast");
    if (!el) return;
    el.textContent = msg;
    el.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(()=>{ el.hidden = true; }, 2600);
  }

  function setActiveTab(tab){
    state.last.activeTab = tab;
    const tabs = ["repaired","formatted","validate"];
    tabs.forEach(x=>{
      const btn = document.querySelector(`.jr-tab[data-tab="${x}"]`);
      const panel = $("panel" + x.charAt(0).toUpperCase() + x.slice(1));
      const on = (x === tab);
      if (btn) btn.setAttribute("aria-selected", on ? "true" : "false");
      if (panel) panel.hidden = !on;
    });
  }

  function updateStats(){
    const raw = $("jrInput")?.value || "";
    const bytes = new Blob([raw]).size;
    $("jrStats").textContent = `${raw.length.toLocaleString()} chars / ${(bytes/1024).toFixed(1)} KB`;
  }


  function normalizeKey(key){
    return String(key || "").toUpperCase().replace(/\s+/g, "").trim();
  }

  function checksum97(str){
    // simple checksum: sum of char codes mod 97
    let sum = 0;
    for (let i=0;i<str.length;i++){
      sum = (sum + str.charCodeAt(i)) % 97;
    }
    return sum;
  }

  function validateProKey(key){
    const k = normalizeKey(key);
    // Format: NW-JR-XXXX-XXXX-XXXX (X=A-Z0-9)
    const m = /^NW-JR-([A-Z0-9]{4})-([A-Z0-9]{4})-([A-Z0-9]{4})$/.exec(k);
    if (!m) return { ok:false, norm:k };
    const body = (m[1] + m[2]); // first 8 chars
    const tail = m[3];         // last 4 chars
    // expected: last2 = checksum(body) in base36 padded to 2, rest any
    const want = checksum97(body);
    const want36 = want.toString(36).toUpperCase().padStart(2,"0");
    const got = tail.slice(-2);
    if (got !== want36) return { ok:false, norm:k };
    return { ok:true, norm:k };
  }

  function loadProFromStorage(){
    const saved = localStorage.getItem("jr_pro_key") || "";
    if (!saved) return;
    const v = validateProKey(saved);
    if (v.ok){
      state.pro.enabled = true;
      state.pro.key = v.norm;
    }else{
      state.pro.enabled = false;
      state.pro.key = "";
      localStorage.removeItem("jr_pro_key");
    }
  }

  function setPro(enabled, key){
    state.pro.enabled = !!enabled;
    state.pro.key = enabled ? normalizeKey(key) : "";
    if (state.pro.enabled) localStorage.setItem("jr_pro_key", state.pro.key);
    else localStorage.removeItem("jr_pro_key");
    renderProUI();
  }



  // ===== Schema check (JSON-19) Pro-only =====
  function getByPath(obj, path){
    // supports dot path, and [] for array existence: items[]
    const parts = String(path||"").split(".").filter(Boolean);
    let cur = obj;
    for (let i=0;i<parts.length;i++){
      let p = parts[i];
      if (p.endsWith("[]")){
        const key = p.slice(0,-2);
        if (!cur || typeof cur !== "object") return { ok:false, val:undefined };
        const v = cur[key];
        if (!Array.isArray(v)) return { ok:false, val:v };
        cur = v;
        continue;
      }
      if (!cur || typeof cur !== "object") return { ok:false, val:undefined };
      if (!(p in cur)) return { ok:false, val:undefined };
      cur = cur[p];
    }
    return { ok:true, val:cur };
  }

  function parseSchemaRules(text){
    const lines = String(text || "").split("\n").map(x=>x.trim()).filter(Boolean);
    const req = [];
    const types = [];
    for (const ln of lines){
      const low = ln.toLowerCase();
      if (low.startsWith("required")){
        const rest = ln.slice(8).trim();
        rest.split(",").map(x=>x.trim()).filter(Boolean).forEach(x=>req.push(x));
      }else if (low.startsWith("type")){
        const rest = ln.slice(4).trim();
        rest.split(",").map(x=>x.trim()).filter(Boolean).forEach(pair=>{
          const m = /^(.+?)\s*=\s*(string|number|boolean|object|array|null)$/i.exec(pair);
          if (m) types.push({ path:m[1].trim(), type:m[2].toLowerCase() });
        });
      }
    }
    return { required:req, types };
  }

  function typeOfVal(v){
    if (v === null) return "null";
    if (Array.isArray(v)) return "array";
    return typeof v;
  }

  function runSchemaCheck(){
    const wrap = $("jrSchemaWrap");
    const out = $("jrSchemaOut");
    if (!wrap || !out) return;

    const pro = !!(state.pro && state.pro.enabled);
    wrap.style.display = pro ? "block" : "none";
    if (!pro) return;

    const rules = parseSchemaRules($("jrSchemaRules")?.value || "");
    const src = state.last.repaired || state.last.formatted || $("jrInput")?.value || "";
    let obj = null;
    try{
      obj = JSON.parse(src);
    }catch(_){
      out.innerHTML = "<b>Invalid JSON</b> (cannot run schema check)";
      return;
    }

    const misses = [];
    for (const pth of rules.required){
      const r = getByPath(obj, pth);
      if (!r.ok) misses.push(pth);
    }

    const mism = [];
    for (const t of rules.types){
      const r = getByPath(obj, t.path);
      if (!r.ok){
        mism.push(`${t.path}: missing (expected ${t.type})`);
        continue;
      }
      const got = typeOfVal(r.val);
      if (got !== t.type){
        mism.push(`${t.path}: got ${got}, expected ${t.type}`);
      }
    }

    const ok = (misses.length===0 && mism.length===0);
    out.innerHTML = ok
      ? "<b>Schema OK</b>"
      : `<b>Schema issues</b><br>` +
        (misses.length ? ("<br><b>Missing:</b><br>" + misses.map(x=>"• "+escapeHtml(x)).join("<br>")) : "") +
        (mism.length ? ("<br><br><b>Type mismatch:</b><br>" + mism.map(x=>"• "+escapeHtml(x)).join("<br>")) : "");
  }
  // ===== /Schema check =====

  function renderCandidates(raw){
    const wrap = $("jrCandsWrap");
    const box = $("jrCandidates");
    if (!wrap || !box) return;

    const pro = !!(state.pro && state.pro.enabled);
    wrap.style.display = pro ? "block" : "none";
    if (!pro) return;

    const cands = extractCandidates(raw || "");
    if (!cands.length){
      box.textContent = "—";
      return;
    }

    box.innerHTML = cands.map((c, idx)=>{
      const preview = (c.text || "").slice(0, 120).replace(/\s+/g, " ");
      return `
        <div class="jr-cand-item">
          <div><b>#${idx+1}</b> ${escapeHtml(c.kind)} — ${escapeHtml(preview)}${(c.text.length>120)?"…":""}</div>
          <div class="jr-cand-meta">range: ${c.start}..${c.end} / len: ${c.text.length}</div>
          <div class="jr-cand-actions">
            <button type="button" class="jr-btn" data-cand-use="${idx}">Use as input</button>
            <button type="button" class="jr-btn" data-cand-repair="${idx}">Repair this</button>
          </div>
        </div>
      `;
    }).join("");

    // wire
    box.querySelectorAll("button[data-cand-use]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = parseInt(btn.getAttribute("data-cand-use"), 10);
        const c = cands[idx];
        if (!c) return;
        $("jrInput").value = c.text;
        state.last.input = c.text;
        toast("Loaded candidate");
      });
    });
    box.querySelectorAll("button[data-cand-repair]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const idx = parseInt(btn.getAttribute("data-cand-repair"), 10);
        const c = cands[idx];
        if (!c) return;
        $("jrInput").value = c.text;
        state.last.input = c.text;
        $("btnRepair").click();
      });
    });
  }

  function renderProUI(){
    const st = $("jrProState");
    const key = $("jrProKey");
    const sel = $("selRepairLevel");
    if (st){
      st.textContent = state.pro.enabled ? "Active" : "Inactive";
      st.className = "jr-mini " + (state.pro.enabled ? "jr-pro-on" : "jr-pro-off");
    }
    if (key && state.pro.key && !key.value) key.value = state.pro.key;
    // unlock aggressive option
    if (sel){
      const opt = Array.from(sel.options).find(o=> o.value==="aggressive");
      if (opt) opt.disabled = !state.pro.enabled;
      // If aggressive selected while not pro, force back
      if (!state.pro.enabled && sel.value === "aggressive"){
        sel.value = "safe";
        state.level = "safe";
      }
    }
  }

  function historyKey(){ return "jr_hist_items"; }
  function historyEnabledKey(){ return "jr_hist_enabled"; }

  function historyLoad(){
    try{
      const raw = localStorage.getItem(historyKey());
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    }catch(_){
      return [];
    }
  }

  function historySave(items){
    try{
      localStorage.setItem(historyKey(), JSON.stringify(items.slice(0, 10)));
    }catch(_){}
  }

  function historyIsEnabled(){
    return localStorage.getItem(historyEnabledKey()) === "1";
  }

  function historySetEnabled(on){
    localStorage.setItem(historyEnabledKey(), on ? "1" : "0");
    renderHistory();
  }

  function historyAdd(input, repaired){
    if (!historyIsEnabled()) return;
    const items = historyLoad();
    const now = new Date().toISOString();
    items.unshift({
      at: now,
      inHead: String(input||"").slice(0, 200),
      outHead: String(repaired||"").slice(0, 200)
    });
    historySave(items);
    renderHistory();
  }

  function renderHistory(){
    const wrap = $("jrHistWrap");
    const list = $("jrHistList");
    const chk = $("jrHistEnable");
    if (!wrap || !list || !chk) return;

    const pro = !!(state.pro && state.pro.enabled);
    wrap.style.display = pro ? "block" : "none";
    if (!pro) return;

    chk.checked = historyIsEnabled();

    const items = historyLoad();
    if (!items.length){
      list.textContent = "—";
      return;
    }
    list.textContent = items.map(it=>{
      return `🕒 ${it.at}\nIN: ${it.inHead}\nOUT: ${it.outHead}\n`;
    }).join("\n");
  }

  function init(){
    state.lang = detectInitialLang();
    document.documentElement.lang = state.lang;

    // lang switch
    document.querySelectorAll(".nw-lang-btn").forEach(btn=>{
      btn.addEventListener("click", ()=> setLang(btn.getAttribute("data-lang")));
    });

    // controls
    $("selMode").addEventListener("change", e=>{ state.mode = e.target.value; });
    $("selRepairLevel").addEventListener("change", e=>{ state.level = e.target.value; });
    $("selIndent").addEventListener("change", e=>{ state.indent = parseInt(e.target.value,10) || 2; });

    // schema (JSON-19)
    const schemaBtn = $("btnSchemaRun");
    if (schemaBtn){ schemaBtn.addEventListener("click", runSchemaCheck); }

    // tabs
    document.querySelectorAll(".jr-tab").forEach(btn=>{
      btn.addEventListener("click", ()=> setActiveTab(btn.getAttribute("data-tab")));
    });

    // input events
    $("jrInput").addEventListener("input", ()=>{
      renderCandidates($('jrInput').value || '');

      state.last.input = $("jrInput").value;
      $("jrInput").classList.remove("jr-input-error");
      updateStats();
    });

    // file load (wired in JSON-5)
    // file input
    $("fileInput").addEventListener("change", async (e)=>{
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      try{
        const txt = await f.text();
        if (f.size > 10*1024*1024) toast("Large file (10MB+). It may be slow.");
        $("jrInput").value = txt;
        state.last.input = txt;
        $("jrInput").classList.remove("jr-input-error");
        updateStats();
      }catch(err){
        toast("Failed to read file");
      }finally{
        e.target.value = "";
      }
    });

    // drag & drop on textarea
    const ta = $("jrInput");
    ta.addEventListener("dragover", (ev)=>{ ev.preventDefault(); ta.classList.add("jr-drop"); });
    ta.addEventListener("dragleave", ()=> ta.classList.remove("jr-drop"));
    ta.addEventListener("drop", async (ev)=>{
      ev.preventDefault();
      ta.classList.remove("jr-drop");
      const f = ev.dataTransfer && ev.dataTransfer.files && ev.dataTransfer.files[0];
      if (!f) return;
      try{
        const txt = await f.text();
        if (f.size > 10*1024*1024) toast("Large file (10MB+). It may be slow.");
        $("jrInput").value = txt;
        state.last.input = txt;
        $("jrInput").classList.remove("jr-input-error");
        updateStats();
      }catch(err){
        toast("Failed to read dropped file");
      }
    });

    $("btnLoad").addEventListener("click", ()=> $("fileInput").click());

    // buttons (wired in later tasks)
    // placeholders; real handlers in JSON-6+
    $("btnValidate").addEventListener("click", ()=>{
      const raw = $("jrInput").value || "";
      state.last.validate = validateRaw(raw);
      if (state.last.validate.ok){
        $("jrInput").classList.remove("jr-input-error");
        toast(t("toastValid"));
      }else{
        $("jrInput").classList.add("jr-input-error");
        // selection highlight if pos available
        const pos = state.last.validate.pos;
        if (pos >= 0){
          const ta = $("jrInput");
          try{
            ta.focus();
            ta.setSelectionRange(pos, Math.min(pos+1, raw.length));
          }catch(_){}
        }
        toast(t("toastInvalid"));
      }
      renderValidate();
      renderExplain(raw);
      setActiveTab("validate");
    });
    $("btnRepair").addEventListener("click", ()=>{
      const raw = $("jrInput").value || "";
      setBusy(true);
      try{
        const res = repairSafe(raw);

        // If Safe failed and level=standard, try extracting JSON candidate(s)
        if (!res.ok && state.level === "standard"){
          const cands = extractCandidates(raw);
          if (cands && cands.length){
            // pick best candidate that can be repaired or parsed
            let picked = null;
            for (const c of cands){
              // quick path: parse already ok
              if (tryParseJson(c.text)){ picked = c; break; }
              // else try safe repair on candidate
              const r2 = repairSafe(c.text);
              if (r2.ok){ picked = { ...c, text: r2.text }; break; }
            }
            if (picked){
              // log extraction as warn (meaning may change)
              state.last.log.push({
                ruleId:"extract_candidate",
                severity:"warn",
                title: (state.lang==="ja")
                  ? `JSON候補を抽出（${picked.kind} / ${picked.start}..${picked.end}）`
                  : `Extracted JSON candidate (${picked.kind} / ${picked.start}..${picked.end})`
              });

              // if picked.text is already repaired text, use it; otherwise repair it
              const finalText = picked.text;
              try{
                JSON.parse(finalText);
                res.ok = true;
                res.text = finalText;
              }catch(_){
                // keep failed
              }
            }
          }
        }

        // If still failed and level=aggressive (Pro), try aggressive repair
        if (!res.ok && state.level === "aggressive"){
          if (!state.pro || !state.pro.enabled){
            // force back
            state.level = "safe";
            $("selRepairLevel").value = "safe";
          }else{
            const a0 = aggressiveRepair(raw);
            const rA = repairSafe(a0); // reuse safe normalization + commas/comments
            if (rA.ok){
              state.last.log.push({
                ruleId:"aggressive",
                severity:"warn",
                title: (state.lang==="ja") ? "Aggressive修復を適用（意味変更の可能性）" : "Applied aggressive repair (may change meaning)"
              });
              res.ok = true;
              res.text = rA.text;
            }
          }
        }


        // If still failed and level=aggressive (Pro), try aggressive repair
        if (!res.ok && state.level === "aggressive"){
          if (!state.pro || !state.pro.enabled){
            // force back
            state.level = "safe";
            $("selRepairLevel").value = "safe";
          }else{
            const a0 = aggressiveRepair(raw);
            const rA = repairSafe(a0); // reuse safe normalization + commas/comments
            if (rA.ok){
              state.last.log.push({
                ruleId:"aggressive",
                severity:"warn",
                title: (state.lang==="ja") ? "Aggressive修復を適用（意味変更の可能性）" : "Applied aggressive repair (may change meaning)"
              });
              res.ok = true;
              res.text = rA.text;
            }
          }
        }

        if (res.ok){
          state.last.repaired = res.text;
          $("jrOutput").value = res.text;
          $("jrInput").classList.remove("jr-input-error");
          renderLog();

          // diff
          state.last.diff = makeSimpleDiff(raw, res.text);
          $("jrDiff").textContent = state.last.diff;
          renderStepDiffUI();

          toast(t("toastRepaired"));
          setActiveTab("repaired");
        }else{
          // also compute validate to show position
          state.last.validate = validateRaw(raw);
          renderValidate();
          renderLog();
          $("jrInput").classList.add("jr-input-error");
          toast(t("toastRepairFail"));
          setActiveTab("validate");
        }
      }finally{
        setBusy(false);
      }
    });
    $("btnFormatPretty").addEventListener("click", ()=>{
      const src = state.last.repaired || $("jrInput").value || "";
      try{
        const obj = JSON.parse(src);
        const out = JSON.stringify(obj, null, state.indent) + "\n";
        state.last.formatted = out;
        $("jrFormattedOut").value = out;
        toast("OK");
        setActiveTab("formatted");
      }catch(e){
        toast(t("toastInvalid"));
        state.last.validate = validateRaw($("jrInput").value || "");
        renderValidate();
        setActiveTab("validate");
      }
    });
    $("btnFormatMinify").addEventListener("click", ()=>{
      const src = state.last.repaired || $("jrInput").value || "";
      try{
        const obj = JSON.parse(src);
        const out = JSON.stringify(obj);
        state.last.formatted = out;
        $("jrFormattedOut").value = out;
        toast("OK");
        setActiveTab("formatted");
      }catch(e){
        toast(t("toastInvalid"));
        state.last.validate = validateRaw($("jrInput").value || "");
        renderValidate();
        setActiveTab("validate");
      }
    });
    async function copyText(txt){
      const s = String(txt || "");
      if (!s) return false;
      try{
        await navigator.clipboard.writeText(s);
        return true;
      }catch(_){
        try{
          const ta = document.createElement("textarea");
          ta.value = s;
          ta.style.position = "fixed";
          ta.style.left = "-9999px";
          document.body.appendChild(ta);
          ta.focus(); ta.select();
          const ok = document.execCommand("copy");
          document.body.removeChild(ta);
          return !!ok;
        }catch(__){
          return false;
        }
      }
    }

    $("btnCopy").addEventListener("click", async ()=>{
      const txt = state.last.repaired || state.last.formatted || $("jrInput").value || "";
      const ok = await copyText(txt);
      toast(ok ? t("toastCopied") : t("toastCopyFail"));
    });
    function downloadText(filename, text){
      const name = (filename && String(filename).trim()) ? String(filename).trim() : "repaired.json";
      const blob = new Blob([String(text || "")], { type: "application/json;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = name.endsWith(".json") ? name : (name + ".json");
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(()=> URL.revokeObjectURL(url), 1500);
    }

    $("btnDownload").addEventListener("click", ()=>{
      const txt = state.last.repaired || state.last.formatted || "";
      if (!txt){
        toast(t("toastRepairFail"));
        return;
      }
      const name = $("jrFilename")?.value || "repaired.json";
      downloadText(name, txt);
      toast(t("toastDownloaded"));
    });
    $("btnReset").addEventListener("click", ()=>{
      $("jrInput").value = "";
      $("jrOutput").value = "";
      $("jrFormattedOut").value = "";
      $("jrValidateOut").innerHTML = "";
      $("jrDiff").textContent = "";
      $("jrLog").textContent = "—";
      state.last = { activeTab:"repaired", input:"", repaired:"", formatted:"", diff:"", validate:{ ok:false, msg:"", pos:-1, line:0, col:0, snippet:"" }, log:[] };
      updateStats();
      setActiveTab("repaired");
    });


    // keyboard shortcuts (JSON-13)
    if (!window.__jr_keys){
      window.__jr_keys = true;
      window.addEventListener("keydown", (ev)=>{
        const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
        const mod = isMac ? ev.metaKey : ev.ctrlKey;

        if (!mod) return;

        // Cmd/Ctrl+Enter: Repair
        if (ev.key === "Enter" && !ev.shiftKey){
          ev.preventDefault();
          $("btnRepair").click();
          return;
        }
        // Cmd/Ctrl+Shift+Enter: Validate
        if (ev.key === "Enter" && ev.shiftKey){
          ev.preventDefault();
          $("btnValidate").click();
          return;
        }
        // Cmd/Ctrl+S: Download
        if ((ev.key === "s" || ev.key === "S") && !ev.shiftKey){
          ev.preventDefault();
          $("btnDownload").click();
          return;
        }
      }, { passive:false });
    }


    // Pro (JSON-14)
    loadProFromStorage();
    renderProUI();
    $("btnProActivate").addEventListener("click", ()=>{
      const v = validateProKey($("jrProKey").value);
      if (!v.ok){
        toast("Invalid key");
        return;
      }
      setPro(true, v.norm);
      toast("Pro Activated");
    });
    $("btnProClear").addEventListener("click", ()=>{
      $("jrProKey").value = "";
      setPro(false, "");
      toast("Cleared");
    });

    renderI18n();
    renderLangButtons();
    updateStats();
    setActiveTab(state.last.activeTab);
  }

  // validate (raw)
  function parseErrorPosition(msg){
    // Typical: "... in JSON at position 1234"
    const m = /position\s+(\d+)/i.exec(msg || "");
    if (!m) return -1;
    const n = parseInt(m[1], 10);
    return Number.isFinite(n) ? n : -1;
  }

  function posToLineCol(raw, pos){
    if (pos < 0) return { line:0, col:0 };
    const pre = raw.slice(0, pos);
    const line = 1 + (pre.match(/\n/g) || []).length;
    const lastNl = pre.lastIndexOf("\n");
    const col = 1 + (pos - (lastNl >= 0 ? lastNl+1 : 0));
    return { line, col };
  }

  function validateRaw(raw){
    try{
      JSON.parse(raw);
      return { ok:true, msg:"", pos:-1, line:0, col:0, snippet:"" };
    }catch(e){
      const msg = (e && e.message) ? String(e.message) : "Invalid JSON";
      const pos = parseErrorPosition(msg);
      let line=0, col=0, snippet="";
      if (pos >= 0){
        const lc = posToLineCol(raw, pos);
        line = lc.line; col = lc.col;
      }
      if (pos >= 0){
        const start = Math.max(0, pos-60);
        const end = Math.min(raw.length, pos+60);
        snippet = raw.slice(start, end);
      }
      const lc2 = (pos >= 0) ? posToLineCol(raw, pos) : {line:0,col:0};
      return { ok:false, msg, pos, line:lc2.line, col:lc2.col, snippet };
    }
  }

  function renderValidate(){
    const v = state.last.validate;
    const box = $("jrValidateOut");
    if (!box) return;

    if (v.ok){
      box.innerHTML = `<div><b>${escapeHtml(t("toastValid"))}</b></div>`;
      return;
    }
    const loc = (v.line && v.col) ? ` (line ${v.line}, col ${v.col})` : "";
    const snippet = v.snippet ? `<div class="jr-snippet"><code>${escapeHtml(v.snippet)}</code></div>` : "";
    box.innerHTML =
      `<div><b>${escapeHtml(t("toastInvalid"))}</b>${escapeHtml(loc)}</div>` +
      `<div>${escapeHtml(v.msg || "")}</div>` +
      snippet;
  }

  // stubs; filled in next tasks
  function renderValidate(){}
  function logPush(item){
    state.last.log.push(item);
  }

  function stepLog(ruleId, titleJa, titleEn, severity, changed){
    if (!changed) return;
    logPush({
      ruleId,
      severity: severity || "ok",
      title: state.lang === "ja" ? titleJa : titleEn
    });
  }

  function removeBOM(x){
    if (x.charCodeAt(0) === 0xFEFF) return x.slice(1);
    return x;
  }

  function normalizeNewlines(x){
    return x.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  }

  function stripCommentsJSONC(x){
    // state machine: track string + escapes. Remove // and /* */ only when not in string.
    let out = "";
    let inStr = false;
    let quote = '"';
    let esc = false;

    for (let i=0; i<x.length; i++){
      const c = x[i];
      const n = x[i+1];

      if (inStr){
        out += c;
        if (esc){ esc = false; continue; }
        if (c === "\\"){ esc = true; continue; }
        if (c === quote){ inStr = false; continue; }
        continue;
      }

      // not in string
      if (c === '"' || c === "'"){
        inStr = true; quote = c;
        out += c;
        continue;
      }

      // line comment //
      if (c === "/" && n === "/"){
        // skip until newline (keep newline)
        while (i < x.length && x[i] !== "\n"){ i++; }
        out += "\n";
        continue;
      }

      // block comment /* */
      if (c === "/" && n === "*"){
        i += 2;
        while (i < x.length-1){
          if (x[i] === "*" && x[i+1] === "/"){ i++; break; }
          i++;
        }
        continue;
      }

      out += c;
    }
    return out;
  }

  function removeTrailingCommas(x){
    // remove commas that are followed only by whitespace and then } or ]
    let out = "";
    let inStr = false;
    let quote = '"';
    let esc = false;

    for (let i=0; i<x.length; i++){
      const c = x[i];

      if (inStr){
        out += c;
        if (esc){ esc = false; continue; }
        if (c === "\\"){ esc = true; continue; }
        if (c === quote){ inStr = false; continue; }
        continue;
      }

      if (c === '"' || c === "'"){
        inStr = true; quote = c;
        out += c;
        continue;
      }

      if (c === ","){
        let j = i+1;
        while (j < x.length && /\s/.test(x[j])) j++;
        if (j < x.length && (x[j] === "}" || x[j] === "]")){
          // skip this comma
          continue;
        }
      }

      out += c;
    }
    return out;
  }


  function extractCandidates(raw){
    // Find balanced {...} or [...] ranges ignoring strings.
    const x = String(raw || "");
    const out = [];
    let inStr = false;
    let quote = '"';
    let esc = false;

    function pushCandidate(start, end, kind){
      const text = x.slice(start, end+1);
      const len = text.length;
      // score: longer is better; object/array both ok
      const score = len;
      out.push({ start, end: end+1, kind, text, score });
    }

    for (let i=0; i<x.length; i++){
      const c = x[i];

      if (inStr){
        if (esc){ esc = false; continue; }
        if (c === "\\"){ esc = true; continue; }
        if (c === quote){ inStr = false; continue; }
        continue;
      }

      if (c === '"' || c === "'"){
        inStr = true; quote = c; continue;
      }

      if (c !== "{" && c !== "[") continue;

      const open = c;
      const close = (open === "{") ? "}" : "]";
      const kind = (open === "{") ? "object" : "array";

      // scan forward to balance
      let depth = 0;
      let j = i;
      let inStr2 = false;
      let quote2 = '"';
      let esc2 = false;

      for (; j<x.length; j++){
        const d = x[j];

        if (inStr2){
          if (esc2){ esc2 = false; continue; }
          if (d === "\\"){ esc2 = true; continue; }
          if (d === quote2){ inStr2 = false; continue; }
          continue;
        }

        if (d === '"' || d === "'"){ inStr2 = true; quote2 = d; continue; }

        if (d === open) depth++;
        else if (d === close) depth--;

        if (depth === 0){
          pushCandidate(i, j, kind);
          break;
        }
      }
      // continue searching; don't jump i=j to also catch nested starts later
    }

    // sort by score desc, keep top 10
    out.sort((a,b)=> (b.score - a.score));
    return out.slice(0, 10);
  }


  function aggressiveRepair(raw){
    // Pro-only. Best effort. Operate with a simple tokenizer to avoid strings.
    let x = String(raw || "");
    let out = "";
    let inStr = false;
    let quote = '"';
    let esc = false;

    // 1) Convert single-quoted strings to double-quoted strings (best effort)
    //    Only when a string starts with ' outside any string.
    for (let i=0; i<x.length; i++){
      const c = x[i];

      if (inStr){
        if (esc){
          out += c; esc = false; continue;
        }
        if (c === "\\"){
          out += c; esc = true; continue;
        }
        if (c === quote){
          out += c; inStr = false; continue;
        }
        out += c; continue;
      }

      // not in string
      if (c === "'"){
        // start single-quoted string -> rewrite to double quoted
        inStr = true; quote = "'";
        out += '"';
        continue;
      }
      if (c === '"'){
        inStr = true; quote = '"';
        out += c;
        continue;
      }
      out += c;
    }

    // Now out may contain single-quoted content but with quote=' still; we need to close them.
    // Quick pass: replace the ending quote ' with " while respecting escapes within original.
    // We'll do a second pass converting quote context.
    x = out;
    out = "";
    inStr = false; quote = '"'; esc = false;
    for (let i=0; i<x.length; i++){
      const c = x[i];

      if (inStr){
        if (esc){ out += c; esc = false; continue; }
        if (c === "\\"){ out += c; esc = true; continue; }
        if (c === quote){
          out += c; inStr = false; continue;
        }
        // if we are in a converted single-quote string, quote is "
        out += c;
        continue;
      }

      if (c === '"'){
        inStr = true; quote = '"';
        out += c;
        continue;
      }
      out += c;
    }

    // 2) Token-based replacements outside strings: True/False/None -> true/false/null
    //    We'll scan again and only replace whole-word tokens when not in string.
    x = out;
    out = "";
    inStr = false; quote = '"'; esc = false;

    function isWordChar(ch){ return /[A-Za-z0-9_]/.test(ch || ""); }

    for (let i=0; i<x.length; i++){
      const c = x[i];

      if (inStr){
        out += c;
        if (esc){ esc = false; continue; }
        if (c === "\\"){ esc = true; continue; }
        if (c === quote){ inStr = false; continue; }
        continue;
      }

      if (c === '"'){
        inStr = true; quote = '"';
        out += c; continue;
      }

      // Replace tokens
      if (/[A-Za-z]/.test(c)){
        let j = i;
        while (j < x.length && isWordChar(x[j])) j++;
        const tok = x.slice(i, j);
        const prev = x[i-1] || "";
        const next = x[j] || "";
        const leftOk = !isWordChar(prev);
        const rightOk = !isWordChar(next);
        if (leftOk && rightOk){
          if (tok === "True"){ out += "true"; i = j-1; continue; }
          if (tok === "False"){ out += "false"; i = j-1; continue; }
          if (tok === "None"){ out += "null"; i = j-1; continue; }
        }
      }

      out += c;
    }

    // 3) Remove trailing semicolons outside strings (common in logs)
    out = out.replace(/;\s*$/g, "");

    // 4) Quote unquoted keys: {a:1} or ,a:1  (best effort)
    //    We only do this outside strings with a small state scan.
    x = out;
    out = "";
    inStr = false; quote = '"'; esc = false;

    function skipWs(pos){
      while (pos < x.length && /\s/.test(x[pos])) pos++;
      return pos;
    }
    function readIdent(pos){
      let j = pos;
      if (!/[A-Za-z_]/.test(x[j] || "")) return null;
      j++;
      while (j < x.length && /[A-Za-z0-9_\-]/.test(x[j])) j++;
      return { ident: x.slice(pos, j), end: j };
    }

    for (let i=0; i<x.length; i++){
      const c = x[i];

      if (inStr){
        out += c;
        if (esc){ esc = false; continue; }
        if (c === "\\"){ esc = true; continue; }
        if (c === quote){ inStr = false; continue; }
        continue;
      }

      if (c === '"'){ inStr = true; quote = '"'; out += c; continue; }

      // detect key position after { or ,
      if (c === "{" || c === ","){
        out += c;
        let j = skipWs(i+1);
        // if already quoted key or closing brace, do nothing
        const c2 = x[j] || "";
        if (c2 === '"' || c2 === "}" ){ i = j-1; continue; }
        const ident = readIdent(j);
        if (!ident){ i = j-1; continue; }
        let k2 = skipWs(ident.end);
        if ((x[k2] || "") === ":"){
          // quote it
          out += x.slice(i+1, j); // whitespace between
          out += '"' + ident.ident + '"';
          out += x.slice(ident.end, k2); // whitespace between ident and :
          out += ":"; // consume :
          i = k2; // will be incremented by loop
          continue;
        }
        // not a key (maybe value), continue normally
        i = j-1;
        continue;
      }

      out += c;
    }

    return out;
  }

  function tryParseJson(text){
    try { JSON.parse(text); return true; } catch(_) { return false; }
  }
  function repairSafe(raw){
    state.last.log = [];
    state.last.stepDiffs = [];
    let s0 = raw || "";
    let s1 = s0;

    const beforeBOM = s1;
    s1 = removeBOM(s1);
    if (state.pro && state.pro.enabled){ state.last.stepDiffs.push({ name:"remove_bom", before: beforeBOM, after: s1 }); }
    stepLog("remove_bom", "BOMを除去", "Removed BOM", "ok", s1 !== beforeBOM);

    const beforeNL = s1;
    s1 = normalizeNewlines(s1);
    if (state.pro && state.pro.enabled){ state.last.stepDiffs.push({ name:"normalize_newlines", before: beforeNL, after: s1 }); }
    stepLog("normalize_newlines", "改行を正規化", "Normalized newlines", "ok", s1 !== beforeNL);

    const beforeC = s1;
    s1 = stripCommentsJSONC(s1);
    if (state.pro && state.pro.enabled){ state.last.stepDiffs.push({ name:"strip_comments", before: beforeC, after: s1 }); }
    stepLog("strip_comments", "コメントを除去", "Removed comments", "ok", s1 !== beforeC);

    const beforeTC = s1;
    s1 = removeTrailingCommas(s1);
    if (state.pro && state.pro.enabled){ state.last.stepDiffs.push({ name:"trailing_commas", before: beforeTC, after: s1 }); }
    stepLog("trailing_commas", "末尾カンマを削除", "Removed trailing commas", "ok", s1 !== beforeTC);

    // try parse
    try{
      JSON.parse(s1);
      return { ok:true, text:s1 };
    }catch(e){
      return { ok:false, text:"", err: e && e.message ? String(e.message) : "Repair failed" };
    }
  }

  function renderLog(){
    const box = $("jrLog");
    if (!box) return;

    const items = state.last.log || [];
    if (!items.length){
      box.textContent = "—";
      return;
    }

    // fixed readable layout
    const lines = items.map(it=>{
      const sev = it.severity || "ok";
      const icon = (sev === "warn") ? "⚠️" : "✅";
      const title = it.title || it.ruleId || "step";
      return `${icon} ${title}`;
    });

    box.textContent = lines.join("\n");
  }


  function renderStepDiffUI(){
    const ui = $("jrStepDiffUI");
    if (!ui) return;
    const pro = !!(state.pro && state.pro.enabled);
    if (!pro || !state.last.stepDiffs || state.last.stepDiffs.length === 0){
      ui.innerHTML = "";
      return;
    }
    const opts = state.last.stepDiffs.map((it, idx)=>`<option value="${idx}">${escapeHtml(it.name)}</option>`).join("");
    ui.innerHTML = `
      <div><b>Step diff (Pro)</b></div>
      <div style="margin-top:6px; display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <select id="jrStepSel">${opts}</select>
        <button type="button" class="jr-btn" id="jrStepShow">Show</button>
      </div>
    `;
    const sel = ui.querySelector("#jrStepSel");
    const btn = ui.querySelector("#jrStepShow");
    btn.addEventListener("click", ()=>{
      const idx = parseInt(sel.value, 10);
      const it = state.last.stepDiffs[idx];
      if (!it) return;
      $("jrDiff").textContent = makeSimpleDiff(it.before, it.after);
    });
  }

  function makeSimpleDiff(before, after){
    const a = String(before || "").split("\n");
    const b = String(after || "").split("\n");
    const out = [];
    const max = 200;
    const m = Math.max(a.length, b.length);
    for (let i=0; i<m && out.length < max; i++){
      const x = a[i] ?? "";
      const y = b[i] ?? "";
      if (x === y) continue;
      if (x) out.push("- " + x);
      if (y) out.push("+ " + y);
    }
    if (m > max) out.push("… (showing first 200 changed lines)");
    return out.join("\n");
  }

  function renderLog(){}


  // ===== Explain Validate (JSON-16) =====
  function renderExplain(raw){
    const box = $("jrExplain");
    if (!box) return;

    const v = state.last.validate;
    if (!v || v.ok){
      box.innerHTML = "";
      return;
    }

    const txt = String(raw || "");
    const msg = String(v.msg || "").toLowerCase();
    const near = String(v.snippet || "");

    const ideas = [];

    // trailing commas
    if (near.includes(",}") || near.includes(",]")) ideas.push({ level:"safe", title:"Trailing commas", note:"Try Safe repair (removes trailing commas)." });

    // comments (JSONC)
    if (txt.includes("//") || txt.includes("/*") || msg.includes("token /")) ideas.push({ level:"safe", title:"Comments (JSONC)", note:"Try Safe repair (strips comments)." });

    // unquoted keys
    if (/\{[\s\r\n]*[A-Za-z_][A-Za-z0-9_\-]*\s*:/.test(txt) || /,[\s\r\n]*[A-Za-z_][A-Za-z0-9_\-]*\s*:/.test(txt)){
      ideas.push({ level:"aggressive", title:"Unquoted keys", note:"Try Aggressive (quotes object keys)." });
    }

    // single quotes
    if (txt.includes("'")){
      ideas.push({ level:"aggressive", title:"Single quotes", note:"Try Aggressive (converts single-quoted strings)." });
    }

    // python literals
    if (/\b(True|False|None)\b/.test(txt)){
      ideas.push({ level:"aggressive", title:"Python literals", note:"Try Aggressive (True/False/None → true/false/null)." });
    }

    // log mixed
    if (txt.includes("{") && txt.includes("}") && txt.indexOf("{") > 0){
      ideas.push({ level:"standard", title:"Logs mixed in", note:"Try Standard (extracts a JSON candidate)." });
    }

    // de-dupe
    const seen = new Set();
    const uniq = [];
    for (const it of ideas){
      const key = it.level + ":" + it.title;
      if (seen.has(key)) continue;
      seen.add(key);
      uniq.push(it);
    }

    if (!uniq.length){
      box.innerHTML = "";
      return;
    }

    const pro = !!(state.pro && state.pro.enabled);

    const btns = uniq.map(it=>{
      const locked = (it.level === "aggressive") && !pro;
      const label = locked ? (it.title + " (Pro)") : it.title;
      const dis = locked ? "disabled" : "";
      return `<button type="button" class="jr-btn" data-explain="${it.level}" ${dis}>${escapeHtml(label)}</button>`;
    }).join("");

    box.innerHTML = `
      <h3>Next step</h3>
      <div>${uniq.map(it=>`• <b>${escapeHtml(it.title)}</b> — ${escapeHtml(it.note)}`).join("<br>")}</div>
      <div class="jr-actions">${btns}</div>
      <div class="jr-mini">${pro ? "Pro: one-click apply enabled" : "Free: suggestions only (Aggressive requires Pro)"}</div>
    `;

    // wire clicks
    box.querySelectorAll("button[data-explain]").forEach(btn=>{
      btn.addEventListener("click", ()=>{
        const lv = btn.getAttribute("data-explain");
        $("selRepairLevel").value = lv;
        state.level = lv;
        $("btnRepair").click();
      });
    });
  }
  // ===== /Explain Validate =====

  window.addEventListener("DOMContentLoaded", init);

  // expose for later patch tasks
  window.__JR__ = { state, t, toast, setBusy, setActiveTab, renderValidate, renderLog, escapeHtml, $ };
})();
