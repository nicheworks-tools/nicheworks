(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const snapshotItems = $("snapshotItems");
  const segmentResult = $("segmentResult");
  if (!snapshotItems || !segmentResult) return;

  const SNAPSHOT_RE = /^\s*([+-]?\d+(?:\.\d+)?)\s*dB\s*·\s*(?:(\d+(?:\.\d+)?)\s*Hz\s*\/\s*([^/]+?)\s*\/\s*(\d+)%|--\s*Hz\s*\/\s*--\s*\/\s*(\d+)%)\s*$/i;

  function isEnglish() {
    return (document.documentElement.lang || "ja").toLowerCase().startsWith("en");
  }

  function parseSnapshotCard(card) {
    const time = card.querySelector(".meta")?.textContent?.trim() || "";
    const raw = card.querySelector(".values")?.textContent?.trim() || "";
    const match = SNAPSHOT_RE.exec(raw);
    if (!match) return null;
    const db = Number(match[1]);
    const hz = match[2] ? Number(match[2]) : null;
    const note = match[3]?.trim() || "";
    const confidence = Number(match[4] || match[5] || 0);
    if (!Number.isFinite(db)) return null;
    return {
      time,
      relativeDb: db,
      pitchHz: Number.isFinite(hz) ? hz : null,
      note,
      confidencePercent: Number.isFinite(confidence) ? confidence : 0
    };
  }

  function snapshotRows() {
    return [...snapshotItems.querySelectorAll(".snapshot-card")]
      .map(parseSnapshotCard)
      .filter(Boolean);
  }

  function mean(values) {
    if (!values.length) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  function summary(rows) {
    const db = rows.map((row) => row.relativeDb).filter(Number.isFinite);
    const pitch = rows.map((row) => row.pitchHz).filter(Number.isFinite);
    return {
      count: rows.length,
      minDb: db.length ? Math.min(...db) : null,
      avgDb: mean(db),
      maxDb: db.length ? Math.max(...db) : null,
      validPitchCount: pitch.length,
      avgPitchHz: mean(pitch)
    };
  }

  function csvCell(value) {
    const text = value == null ? "" : String(value);
    return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
  }

  function buildCsv(rows) {
    const lines = [["time", "relative_db", "pitch_hz", "note", "pitch_confidence_percent"]];
    rows.forEach((row) => lines.push([
      row.time,
      row.relativeDb.toFixed(1),
      Number.isFinite(row.pitchHz) ? row.pitchHz.toFixed(1) : "",
      row.note,
      String(row.confidencePercent)
    ]));
    return lines.map((line) => line.map(csvCell).join(",")).join("\r\n");
  }

  function timestamp() {
    const date = new Date();
    const p = (value) => String(value).padStart(2, "0");
    return `${date.getFullYear()}${p(date.getMonth() + 1)}${p(date.getDate())}-${p(date.getHours())}${p(date.getMinutes())}${p(date.getSeconds())}`;
  }

  function downloadCsv() {
    const rows = snapshotRows();
    if (!rows.length) return;
    const blob = new Blob(["\uFEFF", buildCsv(rows)], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tiny-audio-meter-snapshots-${timestamp()}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  async function copySnapshotSummary() {
    const rows = snapshotRows();
    if (!rows.length) return;
    const stats = summary(rows);
    const en = isEnglish();
    const lines = en ? [
      "Tiny Audio Meter numeric snapshot summary",
      `Snapshots: ${stats.count}`,
      `Relative dB min / avg / max: ${stats.minDb.toFixed(1)} / ${stats.avgDb.toFixed(1)} / ${stats.maxDb.toFixed(1)}`,
      `Valid pitch readings: ${stats.validPitchCount}`,
      `Average valid pitch: ${Number.isFinite(stats.avgPitchHz) ? `${stats.avgPitchHz.toFixed(1)} Hz` : "—"}`,
      "Relative microphone-input values only; not calibrated dB SPL."
    ] : [
      "Tiny Audio Meter 数値スナップショット要約",
      `件数: ${stats.count}`,
      `相対dB 最小 / 平均 / 最大: ${stats.minDb.toFixed(1)} / ${stats.avgDb.toFixed(1)} / ${stats.maxDb.toFixed(1)}`,
      `有効pitch件数: ${stats.validPitchCount}`,
      `有効pitch平均: ${Number.isFinite(stats.avgPitchHz) ? `${stats.avgPitchHz.toFixed(1)} Hz` : "—"}`,
      "マイク入力の相対値であり、校正済みdB SPLではありません。"
    ];
    try { await navigator.clipboard.writeText(lines.join("\n")); } catch (_) {}
  }

  async function copySegment() {
    if (segmentResult.hidden) return;
    const text = segmentResult.innerText?.trim() || segmentResult.textContent?.trim() || "";
    if (!text) return;
    const prefix = isEnglish()
      ? "Tiny Audio Meter segment result\nRelative microphone-input values; not calibrated dB SPL.\n"
      : "Tiny Audio Meter 区間分析結果\nマイク入力の相対値であり、校正済みdB SPLではありません。\n";
    try { await navigator.clipboard.writeText(`${prefix}${text}`); } catch (_) {}
  }

  function ensureExportPanel() {
    let panel = $("numericExportPanel");
    if (panel) return panel;
    const snapshotCard = snapshotItems.closest(".analysis-card");
    if (!snapshotCard) return null;
    panel = document.createElement("div");
    panel.id = "numericExportPanel";
    panel.className = "numeric-export-panel";
    panel.innerHTML = `
      <div class="numeric-export-summary" id="numericExportSummary"></div>
      <div class="numeric-export-actions">
        <button type="button" class="secondary-btn" id="downloadSnapshotCsv"></button>
        <button type="button" class="secondary-btn" id="copySnapshotSummary"></button>
      </div>
      <p class="small-note numeric-export-note"></p>
    `;
    snapshotCard.appendChild(panel);
    $("downloadSnapshotCsv").addEventListener("click", downloadCsv);
    $("copySnapshotSummary").addEventListener("click", copySnapshotSummary);
    return panel;
  }

  function ensureSegmentCopy() {
    let button = $("copySegmentResult");
    if (button) return button;
    button = document.createElement("button");
    button.id = "copySegmentResult";
    button.type = "button";
    button.className = "secondary-btn segment-copy-btn";
    segmentResult.insertAdjacentElement("afterend", button);
    button.addEventListener("click", copySegment);
    return button;
  }

  function render() {
    const panel = ensureExportPanel();
    const segmentCopy = ensureSegmentCopy();
    if (!panel || !segmentCopy) return;
    const rows = snapshotRows();
    const stats = summary(rows);
    const en = isEnglish();
    const summaryNode = $("numericExportSummary");
    const download = $("downloadSnapshotCsv");
    const copy = $("copySnapshotSummary");
    const note = panel.querySelector(".numeric-export-note");

    if (!rows.length) {
      summaryNode.textContent = en ? "No numeric snapshots to summarize yet." : "要約できる数値スナップショットはまだありません。";
    } else {
      const pitchText = Number.isFinite(stats.avgPitchHz) ? `${stats.avgPitchHz.toFixed(1)} Hz` : "—";
      summaryNode.textContent = en
        ? `${stats.count} snapshots · relative dB ${stats.minDb.toFixed(1)} / ${stats.avgDb.toFixed(1)} / ${stats.maxDb.toFixed(1)} min/avg/max · ${stats.validPitchCount} valid pitch · avg ${pitchText}`
        : `${stats.count}件 · 相対dB 最小/平均/最大 ${stats.minDb.toFixed(1)} / ${stats.avgDb.toFixed(1)} / ${stats.maxDb.toFixed(1)} · 有効pitch ${stats.validPitchCount}件 · 平均 ${pitchText}`;
    }

    download.textContent = en ? "Download snapshot CSV" : "スナップショットCSVを保存";
    copy.textContent = en ? "Copy numeric summary" : "数値要約をコピー";
    note.textContent = en
      ? "CSV contains numeric readings only. No audio, device label, device ID, baseline, or affiliate data is exported."
      : "CSVに出すのは数値スナップショットだけです。音声・デバイス名/ID・baseline・affiliate情報は含めません。";
    download.disabled = rows.length === 0;
    copy.disabled = rows.length === 0;

    const segmentText = segmentResult.innerText?.trim() || segmentResult.textContent?.trim() || "";
    segmentCopy.textContent = en ? "Copy segment result" : "区間分析結果をコピー";
    segmentCopy.disabled = segmentResult.hidden || !segmentText;
    segmentCopy.hidden = segmentResult.hidden || !segmentText;
  }

  const style = document.createElement("style");
  style.textContent = `
    .numeric-export-panel{margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb}
    .numeric-export-summary{font-size:.9rem;line-height:1.55;font-weight:600}
    .numeric-export-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}
    .numeric-export-note{margin:8px 0 0}.segment-copy-btn{margin-top:10px}
  `;
  document.head.appendChild(style);

  const snapshotObserver = new MutationObserver(render);
  snapshotObserver.observe(snapshotItems, { childList: true, subtree: true, characterData: true });
  const segmentObserver = new MutationObserver(render);
  segmentObserver.observe(segmentResult, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ["hidden"] });
  const languageObserver = new MutationObserver(render);
  languageObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });

  render();
  window.addEventListener("pagehide", () => {
    snapshotObserver.disconnect();
    segmentObserver.disconnect();
    languageObserver.disconnect();
  }, { once: true });
})();
