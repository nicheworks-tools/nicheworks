document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("cover-form");
  const outputContainer = document.getElementById("result-container");
  const outputArea = document.getElementById("result-text");
  const copyBtn = document.getElementById("copy-btn");
  const saveBtn = document.getElementById("save-btn");
  const generateBtn = document.getElementById("generate-btn");
  const statusMessage = document.getElementById("form-status");
  const wordCountEl = document.getElementById("word-count");
  const toastEl = document.getElementById("toast");

  const TEMPLATE_STYLES = new Set(["formal", "modern", "entry", "direct", "skill"]);

  function setStatus(message, type = "info") {
    if (!statusMessage) return;
    statusMessage.textContent = message || "";
    statusMessage.dataset.type = type;
  }

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.hidden = false;
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toastEl.hidden = true;
      toastEl.textContent = "";
    }, 1800);
  }

  async function loadTemplate(style) {
    const safeStyle = TEMPLATE_STYLES.has(style) ? style : "formal";
    const res = await fetch(`./templates/${safeStyle}.txt`, { cache: "no-cache" });

    if (!res.ok) {
      throw new Error("template_load_failed");
    }

    const text = await res.text();
    const trimmed = text.trim();

    if (!trimmed || /^<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
      throw new Error("template_load_failed");
    }

    return text;
  }

  function buildSkillsPhrase(raw) {
    if (!raw || !raw.trim()) return "";

    const items = raw
      .replace(/\n+/g, ",")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, 4);

    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;

    const last = items.pop();
    return `${items.join(", ")}, and ${last}`;
  }

  function normalizeExperience(raw) {
    if (!raw || !raw.trim()) return { text: "", wasTrimmed: false };

    const compact = raw.replace(/\s+/g, " ").trim();
    const limit = 250;
    const wasTrimmed = compact.length > limit;
    const clipped = wasTrimmed ? `${compact.slice(0, limit - 3).trim()}...` : compact;
    const withoutTrailingPunctuation = clipped.replace(/[.!?]+$/u, "");

    return {
      text: withoutTrailingPunctuation,
      wasTrimmed
    };
  }

  function insertExperienceParagraph(draft, normalizedExperience) {
    if (!normalizedExperience) {
      return draft.replace(/\[EXPERIENCE\]/g, "").replace(/\n{3,}/g, "\n\n");
    }

    const sentence = `My background includes ${normalizedExperience}.`;

    if (draft.includes("[EXPERIENCE]")) {
      return draft.replace(/\[EXPERIENCE\]/g, sentence);
    }

    const signoffPattern = /\n\n(Sincerely,|Best regards,)/;
    if (signoffPattern.test(draft)) {
      return draft.replace(signoffPattern, `\n\n${sentence}\n\n$1`);
    }

    return `${draft.trim()}\n\n${sentence}`;
  }

  function compactShortDraft(draft) {
    const blocks = draft.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
    const signoffIndex = blocks.findIndex((block) => /^(Sincerely,|Best regards,)/.test(block));

    if (signoffIndex <= 1) return draft;

    const greeting = blocks[0];
    const bodyBlocks = blocks.slice(1, signoffIndex);
    const signoff = blocks.slice(signoffIndex).join("\n\n");
    const bodySentences = bodyBlocks
      .join(" ")
      .split(/(?<=[.!?])\s+/)
      .map((sentence) => sentence.trim())
      .filter(Boolean)
      .slice(0, 3)
      .join(" ");

    return [greeting, bodySentences, signoff].filter(Boolean).join("\n\n");
  }

  function countWords(text) {
    const words = text.trim().match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)?/g);
    return words ? words.length : 0;
  }

  async function copyToClipboard(text) {
    if (!text.trim()) {
      throw new Error("empty_output");
    }

    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "0";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();

    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (!ok) {
      throw new Error("copy_failed");
    }
  }

  function saveTextFile(text) {
    if (!text.trim()) {
      throw new Error("empty_output");
    }

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "cover-letter-draft.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const applicant = document.getElementById("applicant").value.trim();
    const company = document.getElementById("company").value.trim();
    const position = document.getElementById("position").value.trim();
    const rawSkills = document.getElementById("skills").value.trim();
    const experienceRaw = document.getElementById("experience").value.trim();

    const tone = document.querySelector('input[name="tone"]:checked')?.value || "formal";
    const length = document.querySelector('input[name="length"]:checked')?.value || "short";
    const style = document.getElementById("template-style").value;

    generateBtn.disabled = true;
    generateBtn.textContent = "Generating...";
    setStatus("");
    outputContainer.style.display = "none";

    try {
      const template = await loadTemplate(style);
      const skillsPhrase = buildSkillsPhrase(rawSkills) || "relevant skills";
      const normalizedExperience = normalizeExperience(experienceRaw);

      let result = template
        .replace(/\[JOB_TITLE\]/g, position || "the role")
        .replace(/\[COMPANY\]/g, company || "your company")
        .replace(/\[SKILLS\]/g, skillsPhrase)
        .replace(/\[YOUR_NAME\]/g, applicant || "Applicant");

      if (tone === "neutral") {
        result = result
          .replace(/^Dear Hiring Manager,/m, "Hello,")
          .replace(/Sincerely,/g, "Best regards,");
      }

      result = insertExperienceParagraph(result, normalizedExperience.text);

      if (length === "short" && countWords(result) > 130) {
        result = compactShortDraft(result);
      }

      result = result.trim();
      outputArea.textContent = result;
      outputContainer.style.display = "block";

      const words = countWords(result);
      wordCountEl.textContent = `${words} words. Edit before sending.`;

      if (normalizedExperience.wasTrimmed) {
        setStatus("Experience summary was shortened to keep the draft readable.", "warning");
      } else if (length === "short" && words > 130) {
        setStatus("This short draft is still a little long. Consider trimming details before sending.", "warning");
      } else {
        setStatus("Draft generated. Review and customize it before use.", "success");
      }

      showToast("Draft generated");
    } catch (error) {
      outputArea.textContent = "";
      wordCountEl.textContent = "";
      outputContainer.style.display = "none";
      setStatus("Template could not be loaded. Please reload the page and try another template.", "error");
    } finally {
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Draft";
    }
  });

  copyBtn.addEventListener("click", async () => {
    try {
      await copyToClipboard(outputArea.textContent);
      showToast("Copied");
    } catch (error) {
      showToast("Copy failed");
    }
  });

  saveBtn.addEventListener("click", () => {
    try {
      saveTextFile(outputArea.textContent);
      showToast("TXT saved");
    } catch (error) {
      showToast("Nothing to save");
    }
  });
});
