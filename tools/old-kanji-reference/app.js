(() => {
  let currentLang = "ja";
  let entriesCache = [];

  const messages = {
    ja: {
      loading: "辞書データを読み込み中です…",
      loadError: "辞書データの読み込みに失敗しました。時間を置いて再度お試しください。",
      copied: "コピーしました",
      placeholder: "旧字体・現代表記どちらでも検索できます"
    },
    en: {
      loading: "Loading dictionary…",
      loadError: "Failed to load dictionary. Please try again later.",
      copied: "Copied!",
      placeholder: "Search by old or modern form"
    }
  };

  const blockRanges = [
    { name: { ja: "CJK統合漢字拡張A", en: "CJK Unified Ideographs Extension A" }, start: 0x3400, end: 0x4dbf },
    { name: { ja: "CJK統合漢字", en: "CJK Unified Ideographs" }, start: 0x4e00, end: 0x9fff },
    { name: { ja: "CJK互換漢字", en: "CJK Compatibility Ideographs" }, start: 0xf900, end: 0xfaff },
    { name: { ja: "康熙部首", en: "Kangxi Radicals" }, start: 0x2f00, end: 0x2fdf },
    { name: { ja: "CJK統合漢字拡張B", en: "CJK Unified Ideographs Extension B" }, start: 0x20000, end: 0x2a6df },
    { name: { ja: "CJK統合漢字拡張C", en: "CJK Unified Ideographs Extension C" }, start: 0x2a700, end: 0x2b73f },
    { name: { ja: "CJK統合漢字拡張D", en: "CJK Unified Ideographs Extension D" }, start: 0x2b740, end: 0x2b81f },
    { name: { ja: "CJK統合漢字拡張E", en: "CJK Unified Ideographs Extension E" }, start: 0x2b820, end: 0x2ceaf },
    { name: { ja: "CJK統合漢字拡張F", en: "CJK Unified Ideographs Extension F" }, start: 0x2ceb0, end: 0x2ebef },
    { name: { ja: "CJK統合漢字拡張G", en: "CJK Unified Ideographs Extension G" }, start: 0x30000, end: 0x3134f },
    { name: { ja: "記号など", en: "Symbols & Others" }, start: 0, end: 0x10ffff }
  ];

  function getBlockName(char) {
    const code = char.codePointAt(0);
    const found = blockRanges.find(range => code >= range.start && code <= range.end);
    return found ? found.name : { ja: "その他", en: "Other" };
  }

  function switchLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";

    if (document.documentElement) {
      document.documentElement.lang = currentLang;
    }

    document.querySelectorAll("[data-i18n]").forEach(el => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });

    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.lang === currentLang);
    });

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      const ja = searchInput.dataset.placeholderJa || messages.ja.placeholder;
      const en = searchInput.dataset.placeholderEn || messages.en.placeholder;
      searchInput.placeholder = currentLang === "en" ? en : ja;
    }
  }

  function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = text;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1600);
  }

  async function loadDict() {
    const res = await fetch("./dict.json", { cache: "no-store" });
    if (!res.ok) {
      throw new Error("Failed to load dict.json");
    }
    const data = await res.json();
    return data;
  }

  function setCounts(dict) {
    const oldCount = Object.keys(dict.old_to_new || {}).length;
    document.querySelectorAll('[data-count="old"]').forEach(el => {
      el.textContent = oldCount;
    });
  }

  function setStatus(messageKey) {
    const el = document.getElementById("statusMessage");
    if (!el) return;
    const text = messageKey ? (messages[currentLang][messageKey] || "") : "";
    el.textContent = text;
  }

  function buildEntries(dict) {
    entriesCache = Object.entries(dict.old_to_new || {}).map(([oldChar, newChar]) => ({ oldChar, newChar }));
    entriesCache.sort((a, b) => a.oldChar.localeCompare(b.oldChar, "ja"));
    return entriesCache;
  }

  function renderGroups(entries) {
    const container = document.getElementById("groupContainer");
    const emptyMessage = document.getElementById("emptyMessage");
    if (!container || !emptyMessage) return;

    container.innerHTML = "";
    emptyMessage.hidden = true;

    if (!entries.length) {
      emptyMessage.hidden = false;
      return;
    }

    const grouped = new Map();
    entries.forEach(entry => {
      const block = getBlockName(entry.oldChar);
      const key = currentLang === "en" ? block.en : block.ja;
      if (!grouped.has(key)) {
        grouped.set(key, []);
      }
      grouped.get(key).push(entry);
    });

    Array.from(grouped.keys()).sort((a, b) => a.localeCompare(b, "ja")).forEach(key => {
      const groupSection = document.createElement("section");
      groupSection.className = "group-section";
      groupSection.dataset.groupKey = key;

      const heading = document.createElement("h3");
      heading.className = "group-heading";
      heading.innerHTML = `${key} <span class="badge">${grouped.get(key).length}</span>`;
      groupSection.appendChild(heading);

      const grid = document.createElement("div");
      grid.className = "kanji-grid";

      grouped.get(key).forEach(({ oldChar, newChar }) => {
        const card = document.createElement("article");
        card.className = "kanji-card";
        card.dataset.old = oldChar;
        card.dataset.new = Array.isArray(newChar) ? newChar.join("") : newChar;

        const pair = document.createElement("div");
        pair.className = "kanji-pair";

        const oldEl = document.createElement("div");
        oldEl.className = "kanji-old";
        oldEl.textContent = oldChar;

        const newEl = document.createElement("div");
        newEl.className = "kanji-new";
        newEl.textContent = Array.isArray(newChar) ? newChar.join("、") : newChar;

        pair.appendChild(oldEl);
        pair.appendChild(newEl);

        const meaning = document.createElement("p");
        meaning.className = "kanji-meaning";
        meaning.innerHTML = `
          <span data-i18n="ja">意味：準備中</span>
          <span data-i18n="en">Meaning: placeholder</span>
        `;

        const copyBtn = document.createElement("button");
        copyBtn.type = "button";
        copyBtn.className = "copy-btn";
        copyBtn.dataset.old = oldChar;
        copyBtn.innerHTML = `
          <span data-i18n="ja">コピー</span>
          <span data-i18n="en">Copy</span>
        `;

        card.appendChild(pair);
        card.appendChild(meaning);
        card.appendChild(copyBtn);

        grid.appendChild(card);
      });

      groupSection.appendChild(grid);
      container.appendChild(groupSection);
    });
  }

  function filterCards(query) {
    const normalized = query.trim();
    const groups = document.querySelectorAll(".group-section");
    let visibleCount = 0;

    groups.forEach(group => {
      let groupVisible = false;
      group.querySelectorAll(".kanji-card").forEach(card => {
        const oldChar = card.dataset.old || "";
        const newChar = card.dataset.new || "";
        const hit = !normalized || oldChar.includes(normalized) || newChar.includes(normalized);
        card.style.display = hit ? "flex" : "none";
        if (hit) groupVisible = true;
      });
      group.style.display = groupVisible ? "block" : "none";
      if (groupVisible) visibleCount++;
    });

    const emptyMessage = document.getElementById("emptyMessage");
    if (emptyMessage) {
      emptyMessage.hidden = visibleCount > 0;
    }
  }

  function handleCopy(target) {
    const char = target.dataset.old;
    if (!char) return;
    navigator.clipboard.writeText(char).then(() => {
      showToast(messages[currentLang].copied);
    }).catch(() => {
      showToast(messages[currentLang].copied);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".nw-lang-switch button[data-lang]").forEach(btn => {
      btn.addEventListener("click", () => {
        switchLang(btn.dataset.lang);
        renderGroups(entriesCache);
        filterCards(document.getElementById("searchInput")?.value || "");
      });
    });

    switchLang(currentLang);

    setStatus("loading");
    loadDict()
      .then(dict => {
        setCounts(dict);
        const entries = buildEntries(dict);
        setStatus("");
        renderGroups(entries);
      })
      .catch(() => setStatus("loadError"));

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        filterCards(searchInput.value);
      });
      searchInput.placeholder = messages[currentLang].placeholder;
    }

    const groupContainer = document.getElementById("groupContainer");
    if (groupContainer) {
      groupContainer.addEventListener("click", (ev) => {
        const target = ev.target.closest(".copy-btn");
        if (target) {
          handleCopy(target);
        }
      });
    }
  });
})();
