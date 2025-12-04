async function loadTemplate(name) {
  const res = await fetch(`./templates/${name}.txt`);
  return await res.text();
}

function buildSkillsPhrase(raw) {
  if (!raw.trim()) return "";
  let arr = raw
    .replace(/\n+/g, ',')
    .split(',')
    .map(s => s.trim())
    .filter(s => s);

  arr = arr.slice(0, 4); // up to 4 skills

  if (arr.length === 1) return arr[0];
  if (arr.length === 2) return `${arr[0]} and ${arr[1]}`;
  const last = arr.pop();
  return `${arr.join(', ')}, and ${last}`;
}

function scrollToResult() {
  const sec = document.getElementById("result-section");
  sec.scrollIntoView({ behavior: "smooth" });
}

document.getElementById("generate-btn").addEventListener("click", async () => {
  const applicant = document.getElementById("applicant").value.trim();
  const company = document.getElementById("company").value.trim();
  const position = document.getElementById("position").value.trim();
  const skillsRaw = document.getElementById("skills").value;
  const experience = document.getElementById("experience").value.trim();
  const style = document.getElementById("style").value;

  const tone = document.querySelector("input[name='tone']:checked").value;
  const length = document.querySelector("input[name='length']:checked").value;

  if (!applicant || !company || !position || !skillsRaw.trim()) {
    alert("Please fill in Applicant, Company, Position, and Skills.");
    return;
  }

  const skillsPhrase = buildSkillsPhrase(skillsRaw);

  const experienceSentence = experience
    ? experience
    : "I have built a foundation of practical skills that I am eager to apply in a professional setting.";

  /* load template */
  const base = await loadTemplate(style);

  /* apply tone adjustments */
  let text = base;

  if (tone === "formal") {
    text = text.replace("{{closing}}", "Sincerely,");
  } else {
    text = text.replace("{{closing}}", "Best regards,");
  }

  /* length */
  if (length === "medium") {
    text = text.replace("{{extra}}", "Additionally, I believe my background and motivation align strongly with the role's expectations.");
  } else {
    text = text.replace("{{extra}}", "");
  }

  /* replace placeholders */
  text = text
    .replace(/{{company}}/g, company)
    .replace(/{{position}}/g, position)
    .replace(/{{skills_phrase}}/g, skillsPhrase)
    .replace(/{{experience_sentence}}/g, experienceSentence)
    .replace(/{{applicant}}/g, applicant);

  /* output */
  const out = document.getElementById("output");
  out.innerHTML = text
    .split("\n")
    .map(l => `<p>${l}</p>`)
    .join("");

  document.getElementById("result-section").style.display = "block";
  scrollToResult();
});

/* copy */
document.getElementById("copy-btn").addEventListener("click", () => {
  const text = document.getElementById("output").innerText;
  navigator.clipboard.writeText(text);
  alert("Copied!");
});
