document.addEventListener("DOMContentLoaded", () => {

  const form = document.getElementById("cover-form");
  const outputContainer = document.getElementById("result-container");
  const outputArea = document.getElementById("result-text");
  const copyBtn = document.getElementById("copy-btn");

  async function loadTemplate(style) {
    const res = await fetch(`./templates/${style}.txt`);
    return await res.text();
  }

  // Build natural English list for skills ("A, B, and C")
  function buildSkillsPhrase(raw) {
    if (!raw || !raw.trim()) return "";

    let items = raw
      .replace(/\n+/g, ",")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 4); // cap at 4 items

    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} and ${items[1]}`;

    const last = items.pop();
    return `${items.join(", ")}, and ${last}`;
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const applicant = document.getElementById("applicant").value.trim();
    const company = document.getElementById("company").value.trim();
    const position = document.getElementById("position").value.trim();
    const rawSkills = document.getElementById("skills").value.trim();
    const experience = document.getElementById("experience").value.trim();

    const tone = document.querySelector('input[name="tone"]:checked')?.value || "formal";
    const length = document.querySelector('input[name="length"]:checked')?.value || "short";
    const style = document.getElementById("template-style").value;

    const template = await loadTemplate(style);

    let skillsPhrase = buildSkillsPhrase(rawSkills);
    if (!skillsPhrase) skillsPhrase = "relevant skills";

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

    // Optional: lightly append experience if provided.
    if (experience) {
      result += `\n\nIn previous experience, ${experience}`;
    }

    // Length control (very light)
    if (length === "short") {
      const sentences = result.split(/(?<=\.)\s+/);
      result = sentences.slice(0, 3).join(" ");
    }

    outputArea.textContent = result.trim();
    outputContainer.style.display = "block";
    copyBtn.style.display = "inline-block";
  });

  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(outputArea.textContent)
      .then(() => {
        copyBtn.textContent = "Copied!";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      });
  });
});
