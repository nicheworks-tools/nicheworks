const el = (id) => document.getElementById(id);

const defaultLang = () => {
  const lang = (navigator.language || "").toLowerCase();
  return lang.startsWith("ja") ? "ja" : "en";
};

const applyLang = (lang) => {
  const nodes = document.querySelectorAll("[data-i18n]");
  nodes.forEach((node) => {
    node.style.display = node.dataset.i18n === lang ? "" : "none";
  });
  document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });
};

const placeholderFor = (text, useKeepLength, placeholder) => {
  if (useKeepLength) {
    return "*".repeat(Math.max(1, text.length));
  }
  return placeholder;
};

const redactContent = (text, options) => {
  const counts = {
    apiKeys: 0,
    bearer: 0,
    jwt: 0,
    privateKey: 0,
    genericSecret: 0,
  };

  let output = text;

  const replaceWhole = (regex, type) => {
    output = output.replace(regex, (match) => {
      counts[type] += 1;
      return placeholderFor(match, options.keepLength, options.placeholder);
    });
  };

  const replaceToken = (regex, type) => {
    output = output.replace(regex, (match, token) => {
      counts[type] += 1;
      return match.replace(token, placeholderFor(token, options.keepLength, options.placeholder));
    });
  };

  const replaceValueGroup = (regex, type) => {
    output = output.replace(regex, (match, label, value) => {
      counts[type] += 1;
      return match.replace(value, placeholderFor(value, options.keepLength, options.placeholder));
    });
  };

  if (options.modePrivateKey) {
    replaceWhole(/-----BEGIN [^-]+ PRIVATE KEY-----[\s\S]*?-----END [^-]+ PRIVATE KEY-----/g, "privateKey");
  }

  if (options.modeBearer) {
    replaceToken(/Authorization:\s*Bearer\s+([A-Za-z0-9\-\._~\+\/]+=*)/gi, "bearer");
    replaceToken(/\bBearer\s+([A-Za-z0-9\-\._~\+\/]+=*)/gi, "bearer");
  }

  if (options.modeJwt) {
    replaceWhole(/\beyJ[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\.[A-Za-z0-9\-_]+\b/g, "jwt");
  }

  if (options.modeApiKeys) {
    replaceWhole(/\bsk-[A-Za-z0-9]{16,}\b/g, "apiKeys");
    replaceWhole(/\bsk_(live|test)_[A-Za-z0-9]{16,}\b/g, "apiKeys");
    replaceWhole(/\bghp_[A-Za-z0-9]{20,}\b/g, "apiKeys");
    replaceWhole(/\bAKIA[0-9A-Z]{16}\b/g, "apiKeys");
  }

  if (options.modeGenericSecret) {
    replaceValueGroup(/(api[_-]?key|token|secret|password)\s*[:=]\s*([^\s'\"]{8,})/gi, "genericSecret");
  }

  return { output, counts };
};

const updateSummary = (counts) => {
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  el("countApiKeys").textContent = String(counts.apiKeys);
  el("countBearer").textContent = String(counts.bearer);
  el("countJwt").textContent = String(counts.jwt);
  el("countPrivateKey").textContent = String(counts.privateKey);
  el("countGeneric").textContent = String(counts.genericSecret);
  el("countTotal").textContent = String(total);
};

const showToast = (msg) => {
  const toast = el("copyToast");
  if (!toast) return;
  toast.textContent = msg;
  toast.hidden = false;
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.hidden = true;
  }, 1200);
};

const downloadText = (filename, text) => {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

document.addEventListener("DOMContentLoaded", () => {
  applyLang(defaultLang());

  document.querySelectorAll(".nw-lang-switch button").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  const input = el("inputText");
  const output = el("outputText");
  const redactBtn = el("redactBtn");
  const clearBtn = el("clearBtn");
  const copyBtn = el("copyBtn");
  const downloadBtn = el("downloadBtn");

  updateSummary({ apiKeys: 0, bearer: 0, jwt: 0, privateKey: 0, genericSecret: 0 });

  redactBtn.addEventListener("click", () => {
    const options = {
      modeApiKeys: el("modeApiKeys").checked,
      modeBearer: el("modeBearer").checked,
      modeJwt: el("modeJwt").checked,
      modePrivateKey: el("modePrivateKey").checked,
      modeGenericSecret: el("modeGenericSecret").checked,
      placeholder: el("placeholderStyle").value,
      keepLength: el("keepLengthToggle").checked,
    };

    const text = input.value || "";
    const result = redactContent(text, options);
    output.value = result.output;
    updateSummary(result.counts);
  });

  clearBtn.addEventListener("click", () => {
    input.value = "";
    output.value = "";
    updateSummary({ apiKeys: 0, bearer: 0, jwt: 0, privateKey: 0, genericSecret: 0 });
    input.focus();
  });

  copyBtn.addEventListener("click", async () => {
    const text = output.value || "";
    if (!text) {
      showToast("Empty");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      showToast("Copied");
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
      showToast("Copied");
    }
  });

  downloadBtn.addEventListener("click", () => {
    const text = output.value || "";
    const filename = `redacted-${new Date().toISOString().slice(0, 10)}.txt`;
    downloadText(filename, text);
  });
});
