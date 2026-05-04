(function () {
  var docLang = (document.documentElement.lang || "ja").toLowerCase();
  var isEn = docLang.indexOf("en") === 0;

  var t = {
    noFiles: isEn ? "No files selected yet." : "ファイルがまだ選択されていません。",
    pressNormalize: isEn ? "Click normalize first." : "※整形ボタンを押してください",
    changed: isEn ? "Changed" : "変更あり",
    same: isEn ? "Unchanged" : "そのまま",
    duplicate: isEn ? "Duplicate" : "重複",
    fixedDuplicate: isEn ? "Numbered" : "連番済み",
    dash: "-",
    copyOk: isEn ? "Copied TSV mapping to clipboard." : "TSV形式でコピーしました。",
    copyNone: isEn ? "No data to copy." : "コピー対象がありません。",
    copyFail: isEn ? "Failed to copy. Please copy manually." : "コピーに失敗しました。手動で選択してください。",
    csvOk: isEn ? "Downloaded CSV mapping." : "CSVを保存しました。",
    needFiles: isEn ? "Please select or drop files first." : "先にファイルを選択してください。",
  };

  var warningLabels = {
    too_long: isEn ? "Over 255 chars" : "255文字超",
    leading_dot: isEn ? "Leading dot" : "先頭ドット",
    trailing_dot_space: isEn ? "Trailing dot/space" : "末尾ドット/スペース",
    reserved_windows_name: isEn ? "Windows reserved" : "Windows予約名",
    empty_name: isEn ? "Empty name" : "空の名前",
  };

  var fileInput = document.getElementById("fileInput");
  var fileSelectButton = document.getElementById("fileSelectButton");
  var dropzone = document.getElementById("dropzone");
  var runButton = document.getElementById("runButton");
  var copyTsvButton = document.getElementById("copyTsvButton");
  var downloadCsvButton = document.getElementById("downloadCsvButton");
  var clearButton = document.getElementById("clearButton");
  var resultWrapper = document.getElementById("resultWrapper");
  var resultBody = document.getElementById("resultBody");
  var noFilesMessage = document.getElementById("noFilesMessage");
  var copyStatus = document.getElementById("copyStatus");
  var summaryBox = document.getElementById("summaryBox");

  var optNormalizeWidth = document.getElementById("optNormalizeWidth");
  var optSpaceToUnderscore = document.getElementById("optSpaceToUnderscore");
  var optLowercaseExt = document.getElementById("optLowercaseExt");
  var optLowercaseBase = document.getElementById("optLowercaseBase");
  var optCollapseUnderscore = document.getElementById("optCollapseUnderscore");
  var optTrimEdge = document.getElementById("optTrimEdge");
  var optRemoveForbidden = document.getElementById("optRemoveForbidden");
  var optDeduplicate = document.getElementById("optDeduplicate");

  var originalNames = [];
  var currentRows = [];

  function setFilesFromList(fileList) {
    originalNames = [];
    currentRows = [];
    if (!fileList) return;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (f && typeof f.name === "string") originalNames.push(f.name);
    }
    renderPreview([]);
  }

  function setOutputEnabled(enabled) {
    if (copyTsvButton) copyTsvButton.disabled = !enabled;
    if (downloadCsvButton) downloadCsvButton.disabled = !enabled;
  }

  function renderSummary(rows, hasNormalized) {
    if (!summaryBox) return;
    if (!originalNames.length) {
      summaryBox.textContent = isEn ? "Selected: 0 files" : "選択ファイル数：0件";
      return;
    }
    if (!hasNormalized) {
      summaryBox.textContent = isEn ? "Selected: " + originalNames.length + " files" : "選択ファイル数：" + originalNames.length + "件";
      return;
    }

    var changed = 0;
    var unchanged = 0;
    var duplicateFixed = 0;
    var duplicate = 0;
    var warnings = 0;
    rows.forEach(function (row) {
      if (row.original !== row.normalized) changed += 1;
      else unchanged += 1;
      if (row.duplicateFixed) duplicateFixed += 1;
      if (row.duplicate) duplicate += 1;
      if (row.warnings && row.warnings.length) warnings += 1;
    });

    summaryBox.textContent = isEn
      ? "Selected: " + originalNames.length + " / changed: " + changed + " / unchanged: " + unchanged + " / numbered: " + duplicateFixed + " / duplicates: " + duplicate + " / warnings: " + warnings
      : "選択：" + originalNames.length + "件　変更あり：" + changed + "件　変更なし：" + unchanged + "件　重複修正：" + duplicateFixed + "件　重複候補：" + duplicate + "件　警告：" + warnings + "件";
  }

  function makeBadge(text, className) {
    var badge = document.createElement("span");
    badge.className = className;
    badge.textContent = text;
    return badge;
  }

  function renderPreview(rows) {
    if (noFilesMessage) noFilesMessage.textContent = t.noFiles;
    if (!resultBody) return;
    resultBody.innerHTML = "";
    if (copyStatus) copyStatus.textContent = "";

    var hasNormalized = Object.prototype.toString.call(rows) === "[object Array]" && rows.length === originalNames.length;
    currentRows = hasNormalized ? rows : [];
    renderSummary(rows || [], hasNormalized);

    if (!originalNames.length) {
      if (noFilesMessage) noFilesMessage.classList.remove("hidden");
      if (resultWrapper) resultWrapper.classList.add("hidden");
      setOutputEnabled(false);
      return;
    }

    if (noFilesMessage) noFilesMessage.classList.add("hidden");
    if (resultWrapper) resultWrapper.classList.remove("hidden");

    originalNames.forEach(function (orig, index) {
      var row = hasNormalized ? rows[index] : null;
      var tr = document.createElement("tr");
      var idxTd = document.createElement("td");
      var origTd = document.createElement("td");
      var normTd = document.createElement("td");
      var statusTd = document.createElement("td");
      var warningTd = document.createElement("td");

      idxTd.textContent = String(index + 1);
      origTd.textContent = orig;

      if (row) {
        normTd.textContent = row.normalized;
        statusTd.appendChild(makeBadge(row.normalized !== row.original ? t.changed : t.same, row.normalized !== row.original ? "badge-changed" : "badge-same"));
        if (row.duplicateFixed) statusTd.appendChild(makeBadge(t.fixedDuplicate, "badge-info"));
        if (row.duplicate) statusTd.appendChild(makeBadge(t.duplicate, "badge-warning"));
        if (row.warnings && row.warnings.length) {
          row.warnings.forEach(function (w) { warningTd.appendChild(makeBadge(warningLabels[w] || w, "badge-warning")); });
        } else {
          warningTd.textContent = t.dash;
        }
      } else {
        normTd.textContent = t.pressNormalize;
        statusTd.appendChild(makeBadge(t.dash, "badge-same"));
        warningTd.textContent = t.dash;
      }

      tr.appendChild(idxTd);
      tr.appendChild(origTd);
      tr.appendChild(normTd);
      tr.appendChild(statusTd);
      tr.appendChild(warningTd);
      resultBody.appendChild(tr);
    });

    setOutputEnabled(hasNormalized);
  }

  function showCopyStatus(msg, ok) {
    if (!copyStatus) return;
    copyStatus.textContent = msg || "";
    copyStatus.style.color = ok ? "#16a34a" : "#dc2626";
    if (!msg) return;
    clearTimeout(showCopyStatus._timer);
    showCopyStatus._timer = setTimeout(function () { copyStatus.textContent = ""; }, 2400);
  }

  var forbiddenChars = /[\/\\:\*\?"<>|]/g;

  function splitName(name) {
    var lastDot = name.lastIndexOf(".");
    if (lastDot <= 0 || lastDot === name.length - 1) return { base: name, ext: "" };
    return { base: name.slice(0, lastDot), ext: name.slice(lastDot + 1) };
  }

  function applyNormalizeWidth(str) { try { return str.normalize("NFKC"); } catch (e) { return str; } }
  function applySpaceToUnderscore(str) { return str.replace(/\s+/g, "_"); }
  function applyRemoveForbidden(str) { return str.replace(forbiddenChars, "_"); }
  function applyCollapseSeparators(str) { return str.replace(/[_\-\.]{2,}/g, function (m) { return m.charAt(0); }); }
  function applyTrimEdge(str) { return str.replace(/^[_\.\-]+/, "").replace(/[_\.\-]+$/, ""); }

  function normalizeOne(name) {
    var work = name.trim();
    if (optNormalizeWidth && optNormalizeWidth.checked) work = applyNormalizeWidth(work);
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
    if (optLowercaseBase && optLowercaseBase.checked) base = base.toLowerCase();
    if (optLowercaseExt && optLowercaseExt.checked && ext) ext = ext.toLowerCase();
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

  function getNameWarnings(name) {
    var warnings = [];
    if (!name) warnings.push("empty_name");
    if (name.length > 255) warnings.push("too_long");
    if (/^\./.test(name)) warnings.push("leading_dot");
    if (/[\.\s]$/.test(name)) warnings.push("trailing_dot_space");
    if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(\.|$)/i.test(name)) warnings.push("reserved_windows_name");
    return warnings;
  }

  function addNumberSuffix(name, count) {
    var parts = splitName(name);
    var suffix = "_" + count;
    return parts.ext ? parts.base + suffix + "." + parts.ext : parts.base + suffix;
  }

  function buildRows() {
    if (!originalNames.length) {
      showCopyStatus(t.needFiles, false);
      return [];
    }
    var baseRows = originalNames.map(function (original) {
      return { original: original, normalized: normalizeOne(original), duplicate: false, duplicateFixed: false, warnings: [] };
    });
    var counts = Object.create(null);
    baseRows.forEach(function (row) {
      var key = row.normalized.toLowerCase();
      counts[key] = (counts[key] || 0) + 1;
    });
    var seen = Object.create(null);
    baseRows.forEach(function (row) {
      var key = row.normalized.toLowerCase();
      if (counts[key] > 1) row.duplicate = true;
      if (optDeduplicate && optDeduplicate.checked) {
        seen[key] = (seen[key] || 0) + 1;
        if (seen[key] > 1) {
          var numbered = addNumberSuffix(row.normalized, seen[key]);
          var nextKey = numbered.toLowerCase();
          while (seen[nextKey]) {
            seen[key] += 1;
            numbered = addNumberSuffix(row.normalized, seen[key]);
            nextKey = numbered.toLowerCase();
          }
          row.normalized = numbered;
          row.duplicateFixed = true;
          seen[nextKey] = 1;
        }
      }
      row.warnings = getNameWarnings(row.normalized);
    });
    return baseRows;
  }

  function rowsToTsv(rows) { return rows.map(function (row) { return row.original + "\t" + row.normalized; }).join("\n"); }

  function csvCell(value) {
    var s = String(value == null ? "" : value);
    return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  function rowsToCsv(rows) {
    var lines = [["original", "normalized", "changed", "duplicate", "duplicate_fixed", "warnings"].map(csvCell).join(",")];
    rows.forEach(function (row) {
      lines.push([row.original, row.normalized, row.original !== row.normalized ? "yes" : "no", row.duplicate ? "yes" : "no", row.duplicateFixed ? "yes" : "no", (row.warnings || []).join("|")].map(csvCell).join(","));
    });
    return lines.join("\r\n");
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    ta.setSelectionRange(0, ta.value.length);
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    ta.remove();
    return ok;
  }

  function todayYmd() {
    var d = new Date();
    return String(d.getFullYear()) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
  }

  function downloadText(filename, text, mime) {
    var blob = new Blob(["\ufeff" + text], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  if (fileSelectButton && fileInput) {
    fileSelectButton.addEventListener("click", function () { fileInput.click(); });
    fileInput.addEventListener("change", function (e) { setFilesFromList(e.target.files); });
  }

  if (dropzone) {
    ["dragenter", "dragover", "dragleave", "drop"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function (e) { e.preventDefault(); e.stopPropagation(); });
    });
    ["dragenter", "dragover"].forEach(function (eventName) {
      dropzone.addEventListener(eventName, function () { dropzone.classList.add("dragover"); });
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
      var rows = buildRows();
      if (!rows.length) return;
      renderPreview(rows);
    });
  }

  if (copyTsvButton) {
    copyTsvButton.addEventListener("click", function () {
      if (!currentRows.length) { showCopyStatus(t.copyNone, false); return; }
      copyText(rowsToTsv(currentRows)).then(function (ok) { showCopyStatus(ok ? t.copyOk : t.copyFail, ok); });
    });
  }

  if (downloadCsvButton) {
    downloadCsvButton.addEventListener("click", function () {
      if (!currentRows.length) { showCopyStatus(t.copyNone, false); return; }
      downloadText("rename-wizard-mapping-" + todayYmd() + ".csv", rowsToCsv(currentRows), "text/csv;charset=utf-8");
      showCopyStatus(t.csvOk, true);
    });
  }

  if (clearButton) {
    clearButton.addEventListener("click", function () {
      originalNames = [];
      currentRows = [];
      if (fileInput) fileInput.value = "";
      if (resultBody) resultBody.innerHTML = "";
      if (resultWrapper) resultWrapper.classList.add("hidden");
      if (noFilesMessage) {
        noFilesMessage.textContent = t.noFiles;
        noFilesMessage.classList.remove("hidden");
      }
      renderSummary([], false);
      setOutputEnabled(false);
      if (copyStatus) copyStatus.textContent = "";
    });
  }
})();
