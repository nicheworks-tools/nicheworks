(() => {
  const META = ["./meta.json", "./meta-extra-2.json", "./meta-extra-3.json", "./meta-extra-4.json"];
  const state = { meta: {}, timer: null };
  const lang = () => document.documentElement.lang === "en" ? "en" : "ja";
  const label = (ja, en) => lang() === "en" ? en : ja;

  async function read(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      return res.ok ? res.json() : { entries: {} };
    } catch (_) {
      return { entries: {} };
    }
  }

  async function loadMeta() {
    const files = await Promise.all(META.map(read));
    state.meta = Object.assign({}, ...files.map((file) => file.entries || {}));
  }

  function pick(meta, jaKey, enKey) {
    return lang() === "en" ? (meta[enKey] || meta[jaKey] || "") : (meta[jaKey] || meta[enKey] || "");
  }

  function makeLine(className, ja, en, text) {
    const p = document.createElement("p");
    p.className = className;
    p.textContent = `${label(ja, en)}: ${text}`;
    return p;
  }

  function fixCard(card) {
    const oldChar = card.dataset.old;
    if (!oldChar) return;
    const meta = state.meta[oldChar] || {};
    const reading = pick(meta, "readingJa", "readingEn");
    const meaning = pick(meta, "meaningJa", "meaningEn");
    const usage = pick(meta, "usageJa", "usageEn");
    const actions = card.querySelector(".copy-actions");

    card.querySelectorAll(".kanji-meta, .codepoint-line, .kanji-clean").forEach((el) => el.remove());

    const readingLine = card.querySelector(".kanji-reading");
    if (readingLine) {
      if (reading) readingLine.textContent = `${label("読み", "Reading")}: ${reading}`;
      else readingLine.remove();
    }

    if (meaning) {
      const meaningLine = makeLine("kanji-meaning kanji-clean", "意味", "Meaning", meaning);
      const currentReading = card.querySelector(".kanji-reading");
      if (currentReading) currentReading.insertAdjacentElement("afterend", meaningLine);
      else if (actions) card.insertBefore(meaningLine, actions);
      else card.appendChild(meaningLine);
    } else if (!reading) {
      const note = document.createElement("p");
      note.className = "pair-only-note-card kanji-clean";
      note.textContent = label("旧字と新字の対応のみ表示中", "Old/modern pair only");
      if (actions) card.insertBefore(note, actions);
      else card.appendChild(note);
    }

    const detail = card.querySelector(".mobile-detail-content");
    if (detail && usage) {
      detail.innerHTML = "";
      detail.appendChild(makeLine("kanji-usage", "用途", "Usage", usage));
    }

    const toggle = card.querySelector(".mobile-detail-toggle");
    if (toggle) {
      toggle.textContent = card.classList.contains("mobile-open") ? label("用途を閉じる", "Hide usage") : label("用途を見る", "Show usage");
    }

    card.querySelectorAll(".copy-btn").forEach((button) => {
      button.textContent = button.dataset.copyKind === "new" ? label("新字をコピー", "Copy modern") : label("旧字をコピー", "Copy old");
    });
  }

  function fixStaticLang() {
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === lang() ? "" : "none";
    });
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === lang());
    });
  }

  function run() {
    fixStaticLang();
    document.querySelectorAll(".kanji-card[data-old]").forEach(fixCard);
    const detector = document.getElementById("detectorInput");
    if (detector) {
      detector.placeholder = label("例：舊字體の文章や古い表記を貼り付けて確認する", "Example: Paste text with old kanji forms to check them");
    }
  }

  function delayedRun() {
    clearTimeout(state.timer);
    state.timer = setTimeout(run, 40);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await loadMeta();
    run();
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach((button) => {
      button.addEventListener("click", delayedRun);
    });
    document.addEventListener("input", delayedRun, true);
    document.addEventListener("click", delayedRun, true);
  });
})();
