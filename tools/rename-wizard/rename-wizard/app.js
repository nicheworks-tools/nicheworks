(function () {
  var docLang = (document.documentElement.lang || "ja").toLowerCase();
  var isEn = docLang.indexOf("en") === 0;

  var t = {
    noFiles: isEn ? "No files selected yet." : "ファイルがまだ選択されていません。",
    pressNormalize: isEn
      ? 'Click "Normalize file names" to generate.'
      : "※「ファイル名を整形する」を押してください",
    changed: isEn ? "Changed" : "変更あり",
    same: isEn ? "Unchanged" : "そのまま",
    dash: "-",
    copyOk: isEn
      ? "Copied mapping (original → normalized) to clipboard."
      : "整形後の一覧（元名→整形名）をコピーしました。",
    copyNone: isEn ? "No data to copy." : "コピー対象がありません。",
    copyFail: isEn
      ? "Failed to copy. Please copy manually."
      : "コピーに失敗しました。手動で選択してください。",
    needFiles: isEn
      ? "Please select or drop files first."
      : "先にファイルを選択してください。",
  };

  var fileInput = document.getElementById("fileInput");
  var fileSelectButton = document.getElementById("fileSelectButton");
  var dropzone = document.getElementById("dropzone");
  var runButton = document.getElementById("runButton");
  var copyButton = document.getElementById("copyButton");
  var clearButton = document.getElementById("clearButton");
  var resultWrapper = document.getElementById("resultWrapper");
  var resultBody = document.getElementById("resultBody");
  var noFilesMessage = document.getElementById("noFilesMessage");
  var copyStatus = document.getElementById("copyStatus");

  var optNormalizeWidth = document.getElementById("optNormalizeWidth");
  var optSpaceToUnderscore = document.getElementById("optSpaceToUnderscore");
  var optLowercaseExt = document.getElementById("optLowercaseExt");
  var optLowercaseBase = document.getElementById("optLowercaseBase");
  var optCollapseUnderscore = document.getElementById("optCollapseUnderscore");
  var optTrimEdge = document.getElementById("optTrimEdge");
  var optRemoveForbidden = document.getElementById("optRemoveForbidden");

  var originalNames = [];

  function setFilesFromList(fileList) {
    originalNames = [];
    if (!fileList) return;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (f && typeof f.name === "string") {
        originalNames.push(f.name);
      }
    }
    renderPreview([]);
  }

  function renderPreview(normalizedList) {
    if (noFilesMessage) {
      noFilesMessage.textContent = t.noFiles;
    }
    if (!resultBody) return;

    resultBody.innerHTML = "";
    if (copyStatus) copyStatus.textContent = "";

    if (!originalNames.length) {
      if (noFilesMessage) noFilesMessage.classList.remove("hidden");
      if (resultWrapper) resultWrapper.classList.add("hidden");
      if (copyButton) copyButton.disabled = true;
      return;
    }

    var hasNormalized =
      Object.prototype.toString.call(normalizedList) === "[object Array]" &&
      normalizedList.length === originalNames.length;

    if (noFilesMessage) noFilesMessage.classList.add("hidden");
    if (resultWrapper) resultWrapper.classList.remove("hidden");

    originalNames.forEach(function (orig, index) {
      var tr = document.createElement("tr");

      var idxTd = document.createElement("td");
      idxTd.textContent = String(index + 1);

      var origTd = document.createElement("td");
      origTd.textContent = orig;

      var normTd = document.createElement("td");
      var badgeTd = document.createElement("td");

      if (hasNormalized) {
        var norm = normalizedList[index];
        normTd.textContent = norm;

        var badge = document.createElement("span");
        if (norm !== orig) {
          badge.className = "badge-changed";
          badge.textContent = t.changed;
        } else {
          badge.className = "badge-same";
          badge.textContent = t.same;
        }
        badgeTd.appendChild(badge);
      } else {
        normTd.textContent = t.pressNormalize;
        var badge2 = document.createElement("span");
        badge2.className = "badge-same";
        badge2.textContent = t.dash;
        badgeTd.appendChild(badge2);
      }

      tr.appendChild(idxTd);
      tr.appendChild(origTd);
      tr.appendChild(normTd);
      tr.appendChild(badgeTd);
      resultBody.appendChild(tr);
    });

    if (copyButton) copyButton.disabled = !hasNormalized;
  }

  function showCopyStatus(msg, ok) {
    if (!copyStatus) return;
    copyStatus.textContent = msg || "";
    copyStatus.style.color = ok ? "#16a34a" : "#dc2626";
    if (!msg) return;
    clearTimeout(showCopyStatus._timer);
    showCopyStatus._timer = setTimeout(function () {
      copyStatus.textContent = "";
    }, 2200);
  }

  var forbiddenChars = /[\/\\:\*\?"<>|]/g;

  function splitName(name) {
    var lastDot = name.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === name.length - 1) {
      return { base: name, ext: "" };
    }
    return {
      base: name.slice(0, lastDot),
      ext: name.slice(lastDot + 1),
    };
  }

  function applyNormalizeWidth(str) {
    try {
      return str.normalize("NFKC");
    } catch (e) {
      return str;
    }
  }

  function applySpaceToUnderscore(str) {
    return str.replace(/\s+/g, "_");
  }

  function applyRemoveForbidden(str) {
    return str.replace(forbiddenChars, "_");
  }

  function applyCollapseSeparators(str) {
    return str.replace(/[_\-\.]{2,}/g, function (m) {
      return m.charAt(0);
    });
  }

  function applyTrimEdge(str) {
    return str.replace(/^[_\.\-]+/, "").replace(/[_\.\-]+$/, "");
  }

  function normalizeOne(name) {
    var work = name.trim();

    if (optNormalizeWidth && optNormalizeWidth.checked) {
      work = applyNormalizeWidth(work);
    }

    var parts = splitName(work);
    var base = parts.base;
    var ext = parts.ext;

    if (optSpaceToUnderscore && optSpaceToUnderscore.checked) {
      base = applySpaceToUnderscore(base);
      if (ext) ext = applySpaceToUnderscore(ext);
    }

    if (optRemoveForbidden && optRemoveForbidden.checked) {
      base = applyRemoveForbidden(base);
      if (ext) ext = applyRemoveForbidden(ext);
    }

    if (optLowercaseBase && optLowercaseBase.checked) {
      base = base.toLowerCase();
    }
    if (optLowercaseExt && optLowercaseExt.checked && ext) {
      ext = ext.toLowerCase();
    }

    if (optCollapseUnderscore && optCollapseUnderscore.checked) {
      base = applyCollapseSeparators(base);
      if (ext) ext = applyCollapseSeparators(ext);
    }

    if (optTrimEdge && optTrimEdge.checked) {
      base = applyTrimEdge(base);
      if (ext) ext = applyTrimEdge(ext);
    }

    if (!base) base = "file";

    return ext ? base + "." + ext : base;
  }

  function normalizeAll() {
    if (!originalNames.length) {
      showCopyStatus(t.needFiles, false);
      return [];
    }
    return originalNames.map(normalizeOne);
  }

  if (fileSelectButton && fileInput) {
    fileSelectButton.addEventListener("click", function () {
      fileInput.click();
    });
    fileInput.addEventListener("change", function (e) {
      setFilesFromList(e.target.files);
    });
  }

  if (dropzone) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        e.preventDefault();
        e.stopPropagation();
      });
    });

    ["dragenter", "dragover"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function () {
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) {
        if (eventName === "dragleave" && e.target !== dropzone) return;
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", function (e) {
      var dt = e.dataTransfer;
      if (!dt) return;
      var files = dt.files;
      if (files && files.length > 0) {
        setFilesFromList(files);
        if (fileInput) fileInput.files = files;
      }
    });
  }

  if (runButton) {
    runButton.addEventListener("click", function () {
      var normalized = normalizeAll();
      if (!normalized.length) return;
      renderPreview(normalized);
    });
  }

  if (copyButton) {
    copyButton.addEventListener("click", function () {
      if (!resultBody) return;
      var rows = resultBody.querySelectorAll("tr");
      if (!rows.length) return;

      var lines = [];
      rows.forEach(function (tr) {
        var tds = tr.querySelectorAll("td");
        if (tds.length >= 3) {
          var original = tds[1].textContent || "";
          var normalized = tds[2].textContent || "";
          if (normalized && normalized !== t.pressNormalize) {
            lines.push(original + "\t" + normalized);
          }
        }
      });

      var text = lines.join("\n");
      if (!text) {
        showCopyStatus(t.copyNone, false);
        return;
      }

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () { showCopyStatus(t.copyOk, true); })
          .catch(function () { showCopyStatus(t.copyFail, false); });
      } else {
        showCopyStatus(t.copyFail, false);
      }
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      originalNames = [];
      if (fileInput) fileInput.value = "";
      if (resultBody) resultBody.innerHTML = "";
      if (resultWrapper) resultWrapper.classList.add("hidden");
      if (noFilesMessage) {
        noFilesMessage.textContent = t.noFiles;
        noFilesMessage.classList.remove("hidden");
      }
      if (copyButton) copyButton.disabled = true;
      if (copyStatus) copyStatus.textContent = "";
    });
  }
})();