(function(){
  const $ = (id)=>document.getElementById(id);

  const state = {
    lang: "ja",
    items: [],
    outBlob: null
  };

  // ---------- i18n ----------
  function setLang(lang){
    state.lang = (lang === "en") ? "en" : "ja";

    // toggle visibility
    const ja = document.querySelectorAll('[data-i18n$="_ja"]');
    const en = document.querySelectorAll('[data-i18n$="_en"]');
    ja.forEach(el=> el.style.display = (state.lang==="ja") ? "" : "none");
    en.forEach(el=> el.style.display = (state.lang==="en") ? "" : "none");

    // switch highlight
    const btnJa = document.querySelector('.nw-lang-switch button[data-lang="ja"]');
    const btnEn = document.querySelector('.nw-lang-switch button[data-lang="en"]');
    if(btnJa && btnEn){
      btnJa.classList.toggle("is-active", state.lang==="ja");
      btnEn.classList.toggle("is-active", state.lang==="en");
    }
  }

  function detectLang(){
    const nav = (navigator.language||"").toLowerCase();
    return nav.startsWith("ja") ? "ja" : "en";
  }

  // ---------- list ----------
  function renderList(){
    const ul = $("itemsList");
    if(!ul) return;
    ul.innerHTML = "";

    state.items.forEach((it, idx)=>{
      const li = document.createElement("li");
      li.className = "item";
      li.innerHTML = `
        <div class="item-left">
          <div class="item-name">${escapeHtml(it.name)}</div>
          <div class="item-meta">${it.w}×${it.h} • ${formatBytes(it.size)}</div>
        </div>
        <div class="item-actions">
          <button class="btn btn-ghost" type="button" data-act="up" ${idx===0?"disabled":""}>↑</button>
          <button class="btn btn-ghost" type="button" data-act="down" ${idx===state.items.length-1?"disabled":""}>↓</button>
          <button class="btn btn-ghost" type="button" data-act="del">✕</button>
        </div>
      `;
      li.querySelector('[data-act="up"]')?.addEventListener("click", ()=>{ move(idx, idx-1); });
      li.querySelector('[data-act="down"]')?.addEventListener("click", ()=>{ move(idx, idx+1); });
      li.querySelector('[data-act="del"]')?.addEventListener("click", ()=>{ remove(idx); });

      ul.appendChild(li);
    });

    $("countLabel").textContent = `${state.items.length} items`;
    $("btnDownload").disabled = !state.outBlob;
  }

  function move(from, to){
    if(to < 0 || to >= state.items.length) return;
    const a = state.items[from];
    state.items.splice(from,1);
    state.items.splice(to,0,a);
    state.outBlob = null;
    $("btnDownload").disabled = true;
    setStatus("—");
    renderList();
  }

  function remove(i){
    state.items.splice(i,1);
    state.outBlob = null;
    $("btnDownload").disabled = true;
    setStatus("—");
    renderList();
  }

  function clearAll(){
    state.items = [];
    state.outBlob = null;
    $("btnDownload").disabled = true;
    setStatus("—");
    renderList();
    clearCanvas();
  }

  // ---------- stitch (MVP stub; Codex will replace with full) ----------
  async function buildPreview(){
    if(state.items.length === 0){
      setStatus(state.lang==="ja" ? "画像を追加してください" : "Add images first");
      return;
    }

    setStatus(state.lang==="ja" ? "プレビュー生成中…" : "Building preview…");

    // This is only a starter; Codex task will implement full stitch, trim, scaling, export.
    // For now: draw a simple placeholder banner to verify layout.
    const c = $("outCanvas");
    const ctx = c.getContext("2d");
    c.width = 900;
    c.height = 240;
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0,0,c.width,c.height);
    ctx.strokeStyle = "#e5e7eb";
    ctx.strokeRect(0.5,0.5,c.width-1,c.height-1);
    ctx.fillStyle = "#111827";
    ctx.font = "16px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText("Starter layout OK. Codex will implement stitching here.", 18, 48);
    ctx.fillStyle = "#6b7280";
    ctx.font = "13px system-ui, -apple-system, Segoe UI, Roboto, Arial";
    ctx.fillText(`items: ${state.items.length}`, 18, 78);

    $("previewMeta").textContent = "—";
    state.outBlob = null;
    $("btnDownload").disabled = true;

    setStatus(state.lang==="ja" ? "（初期形）レイアウト確認用の仮プレビューです" : "(Starter) Placeholder preview for layout check");
  }

  function downloadPng(){
    if(!state.outBlob){
      setStatus(state.lang==="ja" ? "まずプレビューを生成してください" : "Build preview first");
      return;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(state.outBlob);
    a.download = "stitched.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 2000);
  }

  function clearCanvas(){
    const c = $("outCanvas");
    if(!c) return;
    const ctx = c.getContext("2d");
    c.width = 10; c.height = 10;
    ctx.clearRect(0,0,10,10);
    $("previewMeta").textContent = "—";
  }

  function setStatus(msg){
    $("statusText").textContent = msg;
  }

  // ---------- file load ----------
  async function addFiles(fileList){
    const files = Array.from(fileList || []);
    if(files.length === 0) return;

    for(const f of files){
      if(!/^image\/(png|jpeg|webp)$/.test(f.type)) continue;

      const img = await fileToImage(f);
      state.items.push({
        name: f.name,
        size: f.size,
        w: img.width,
        h: img.height,
        file: f,
        img
      });
    }
    state.outBlob = null;
    setStatus("—");
    renderList();
  }

  function fileToImage(file){
    return new Promise((resolve,reject)=>{
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = ()=>{ URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e)=>{ URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });
  }

  // ---------- utils ----------
  function escapeHtml(s){
    return String(s).replace(/[&<>"']/g, (c)=>({
      "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
    }[c]));
  }
  function formatBytes(n){
    const u = ["B","KB","MB","GB"];
    let i=0, v=n;
    while(v>=1024 && i<u.length-1){ v/=1024; i++; }
    return `${v.toFixed(i===0?0:1)} ${u[i]}`;
  }

  // ---------- init ----------
  function init(){
    // language
    setLang(detectLang());
    document.querySelectorAll('.nw-lang-switch button[data-lang]').forEach(btn=>{
      btn.addEventListener("click", ()=> setLang(btn.getAttribute("data-lang")));
    });

    // file input & drop
    const dz = $("dropzone");
    const fi = $("fileInput");
    fi?.addEventListener("change", ()=> addFiles(fi.files));

    dz?.addEventListener("dragover", (e)=>{ e.preventDefault(); dz.classList.add("is-drag"); });
    dz?.addEventListener("dragleave", ()=> dz.classList.remove("is-drag"));
    dz?.addEventListener("drop", (e)=>{
      e.preventDefault();
      dz.classList.remove("is-drag");
      addFiles(e.dataTransfer.files);
    });

    // buttons
    $("btnClear")?.addEventListener("click", clearAll);
    $("btnClear_en")?.addEventListener("click", clearAll);
    $("btnBuild")?.addEventListener("click", buildPreview);
    $("btnBuild_en")?.addEventListener("click", buildPreview);
    $("btnDownload")?.addEventListener("click", downloadPng);
    $("btnDownload_en")?.addEventListener("click", downloadPng);

    renderList();
    setStatus("—");
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();
