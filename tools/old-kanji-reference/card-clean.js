(() => {
  const META = ["./meta.json", "./meta-extra-2.json", "./meta-extra-3.json", "./meta-extra-4.json"];
  const state = { meta: {}, busy: false };
  const lang = () => document.documentElement.lang === "en" ? "en" : "ja";
  const label = (ja, en) => lang() === "en" ? en : ja;

  async function json(path) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      return res.ok ? res.json() : { entries: {} };
    } catch (_) {
      return { entries: {} };
    }
  }

  async function load() {
    const files = await Promise.all(META.map(json));
    state.meta = Object.assign({}, ...files.map((file) => file.entries || {}));
  }

  function value(meta, jaKey, enKey) {
    return lang() === "en" ? (meta[enKey] || meta[jaKey] || "") : (meta[jaKey] || meta[enKey] || "");
  }

  function line(cls, ja, en, text) {
    const p = document.createElement("p");
    p.className = cls;
    p.textContent = `${label(ja, en)}: ${text}`;
    return p;
  }

  function fixCard(card) {
    const meta = state.meta[card.dataset.old] || {};
    card.querySelectorAll(".kanji-meta, .codepoint-line, .kanji-clean").forEach((el) => el.remove());

    const reading = value(meta, "readingJa", "readingEn");
    const meaning = value(meta, "meaningJa", "meaningEn");
    const usage = value(meta, "usageJa", "usageEn");
    const actions = card.querySelector(".copy-actions");

    const readingLine = card.querySelector(".kanji-reading");
    if (readingLine) {
      if (reading) readingLine.textContent = `${label("読み", "Reading")}: ${reading}`;
      else readingLine.remove();
    }

    if (meaning) {
      const meaningLine = line("kanji-meaning kanji-clean", "意味", "Meaning", meaning);
      if (readingLine && readingLine.isConnected) readingLine.insertAdjacentElement("afterend", meaningLine);
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
      detail.appendChild(line("kanji-usage", "用途", "Usage", usage));
    }

    card.querySelectorAll(".copy-btn").forEach((button) => {
      button.textContent = button.dataset.copyKind === "new" ? label("新字をコピー", "Copy modern") : label("旧字をコピー", "Copy old");
    });
  }

  function run() {
    state.busy = false;
    document.querySelectorAll(".kanji-card[data-old]").forEach(fixCard);
  }

  function schedule() {
    if (state.busy) return;
    state.busy = true;
    requestAnimationFrame(run);
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await load();
    run();
    new MutationObserver(schedule).observe(document.body, { childList: true, subtree: true });
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach((button) => button.addEventListener("click", () => setTimeout(run, 0)));
  });
})();
