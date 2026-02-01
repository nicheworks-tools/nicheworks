/* ================================
 * Earth Map Suite - placeholder logic
 * ================================ */

(() => {
  "use strict";

  const i18nNodes = () => Array.from(document.querySelectorAll("[data-i18n]"));
  const langButtons = () => Array.from(document.querySelectorAll(".nw-lang-switch button"));
  const TOOL_NAME = "earth-map-suite";

  const trackEvent = (name, params = {}) => {
    if (typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", name, params);
  };

  const getDefaultLang = () => {
    const browserLang = (navigator.language || "").toLowerCase();
    return browserLang.startsWith("ja") ? "ja" : "en";
  };

  const applyLang = (lang) => {
    i18nNodes().forEach((el) => {
      el.style.display = (el.dataset.i18n === lang) ? "" : "none";
    });
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === lang));
    document.documentElement.lang = lang;
    try { localStorage.setItem("nw_lang", lang); } catch (_) {}
  };

  const initLang = () => {
    let lang = getDefaultLang();
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") lang = saved;
    } catch (_) {}
    langButtons().forEach((btn) => btn.addEventListener("click", () => applyLang(btn.dataset.lang)));
    applyLang(lang);
  };

  const LIMITS = {
    bboxMaxSpan: 5,
    dateSpanDays: 31,
    presets: ["low", "mid", "detail"],
    stormFramesMax: 48
  };

  const stormCache = new Map();

  const ERROR_CODES = {
    missing_params: "missing_params",
    limit_exceeded: "limit_exceeded",
    no_data: "no_data",
    upstream_fail: "upstream_fail",
    timeout: "timeout",
    unknown: "unknown"
  };

  const escapeHTML = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const hashString = (value) => {
    let hash = 2166136261;
    for (let i = 0; i < value.length; i += 1) {
      hash ^= value.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };

  const mulberry32 = (seed) => {
    let t = seed >>> 0;
    return () => {
      t += 0x6d2b79f5;
      let r = Math.imul(t ^ (t >>> 15), t | 1);
      r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  };

  const lerp = (a, b, t) => a + (b - a) * t;

  const lerpColor = (from, to, t) => {
    const r = Math.round(lerp(from[0], to[0], t));
    const g = Math.round(lerp(from[1], to[1], t));
    const b = Math.round(lerp(from[2], to[2], t));
    return `rgb(${r}, ${g}, ${b})`;
  };

  const valueToColor = (value) => {
    const v = clamp(value, 0, 1);
    if (v <= 0.5) {
      return lerpColor([219, 234, 254], [59, 130, 246], v / 0.5);
    }
    return lerpColor([59, 130, 246], [239, 68, 68], (v - 0.5) / 0.5);
  };

  const formatPreview = ({ mode, bbox, lat, lon, start, end, startB, endB, preset, frames, area, layers, notes }, lang) => {
    const safeMode = mode || "storm";
    const safeBBox = bbox || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeLat = lat || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeLon = lon || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeStart = start || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeEnd = end || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeStartB = startB || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeEndB = endB || (lang === "ja" ? "（未入力）" : "(empty)");
    const safePreset = preset || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeFrames = frames || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeArea = area || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeLayers = layers || (lang === "ja" ? "（未入力）" : "(empty)");
    const safeNotes = notes || (lang === "ja" ? "（未入力）" : "(empty)");

    if (lang === "ja") {
      const lines = [
        "[Earth Map Suite プレビュー]",
        `モード: ${safeMode}`,
        `BBox: ${safeBBox}`,
        `緯度: ${safeLat}`,
        `経度: ${safeLon}`,
        `開始日: ${safeStart}`,
        `終了日: ${safeEnd}`,
        `プリセット: ${safePreset}`
      ];
      if (safeMode === "storm") {
        lines.push(`フレーム数: ${safeFrames}`);
      }
      if (safeMode === "compare") {
        lines.push(
          `期間A: ${safeStart} 〜 ${safeEnd}`,
          `期間B: ${safeStartB} 〜 ${safeEndB}`
        );
      }
      lines.push(
        `対象エリア: ${safeArea}`,
        `レイヤー: ${safeLayers}`,
        `補足メモ: ${safeNotes}`,
        "----",
        "次アクション: 共有前に地図ツールで再確認してください。"
      );
      return lines.join("\n");
    }

    const lines = [
      "[Earth Map Suite Preview]",
      `Mode: ${safeMode}`,
      `BBox: ${safeBBox}`,
      `Lat: ${safeLat}`,
      `Lon: ${safeLon}`,
      `Start: ${safeStart}`,
      `End: ${safeEnd}`,
      `Preset: ${safePreset}`
    ];
    if (safeMode === "storm") {
      lines.push(`Frames: ${safeFrames}`);
    }
    if (safeMode === "compare") {
      lines.push(
        `Period A: ${safeStart} to ${safeEnd}`,
        `Period B: ${safeStartB} to ${safeEndB}`
      );
    }
    lines.push(
      `Target area: ${safeArea}`,
      `Layers: ${safeLayers}`,
      `Notes: ${safeNotes}`,
      "----",
      "Next step: validate the view in your map tool before sharing."
    );
    return lines.join("\n");
  };

  const buildStormKey = ({ bbox, start, end, preset, frames }) =>
    `${bbox}|${start}|${end}|${preset}|${frames}`;

  const buildTimestampSeries = (start, end, frameCount) => {
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    const startMs = startDate.getTime();
    const endMs = endDate.getTime();
    if (!Number.isFinite(startMs) || !Number.isFinite(endMs)) {
      return [];
    }
    if (frameCount <= 1 || startMs === endMs) {
      return [new Date(startMs).toISOString()];
    }
    const step = (endMs - startMs) / (frameCount - 1);
    return Array.from({ length: frameCount }, (_, idx) => new Date(startMs + step * idx).toISOString());
  };

  const resolveStormGrid = (preset) => {
    if (preset === "detail") return { cols: 36, rows: 24 };
    if (preset === "mid") return { cols: 28, rows: 18 };
    return { cols: 22, rows: 14 };
  };

  const generateStormFrame = ({ seed, cols, rows, frameIndex }) => {
    const random = mulberry32(seed + (frameIndex + 1) * 97);
    const cellCount = 4 + Math.floor(random() * 4);
    const cells = Array.from({ length: cellCount }, () => ({
      x: random(),
      y: random(),
      radius: 0.12 + random() * 0.25,
      intensity: 0.6 + random() * 0.4
    }));
    const values = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
    let total = 0;
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col / (cols - 1 || 1);
        const y = row / (rows - 1 || 1);
        let value = 0;
        cells.forEach((cell) => {
          const dx = x - cell.x;
          const dy = y - cell.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cell.radius) {
            value += (1 - dist / cell.radius) * cell.intensity;
          }
        });
        const normalized = clamp(value, 0, 1);
        values[row][col] = normalized;
        total += normalized;
      }
    }
    return { values, total };
  };

  const generateStormReplay = ({ bbox, start, end, preset, frames }) => {
    const normalizedPreset = preset.toLowerCase();
    const rawFrames = Math.max(1, Math.floor(Number(frames)));
    const thinningStep = Math.ceil(rawFrames / LIMITS.stormFramesMax);
    const frameCount = Math.ceil(rawFrames / thinningStep);
    const { cols, rows } = resolveStormGrid(normalizedPreset);
    const seed = hashString(`${bbox}|${start}|${end}|${normalizedPreset}`);
    const allTimestamps = buildTimestampSeries(start, end, rawFrames);
    const framesData = [];
    const timestamps = [];
    const frameTotals = [];

    for (let idx = 0; idx < rawFrames; idx += thinningStep) {
      const frameIndex = idx;
      const frame = generateStormFrame({ seed, cols, rows, frameIndex });
      framesData.push(frame.values);
      frameTotals.push(frame.total);
      timestamps.push(allTimestamps[frameIndex] || allTimestamps[allTimestamps.length - 1] || "");
    }

    const cumulativeTotals = [];
    let runningTotal = 0;
    frameTotals.forEach((total) => {
      runningTotal += total;
      cumulativeTotals.push(runningTotal);
    });

    return {
      preset: normalizedPreset,
      cols,
      rows,
      rawFrames,
      thinningStep,
      frames: framesData,
      timestamps,
      frameTotals,
      cumulativeTotals
    };
  };

  const buildCumulativeFrames = (frames) => {
    const cumulative = [];
    let running = null;
    frames.forEach((frame) => {
      if (!running) {
        running = frame.map((row) => row.slice());
      } else {
        running = running.map((row, rIdx) =>
          row.map((value, cIdx) => value + frame[rIdx][cIdx])
        );
      }
      cumulative.push(running.map((row) => row.slice()));
    });
    return cumulative;
  };

  const normalizeGrid = (grid) => {
    let max = 0;
    grid.forEach((row) => {
      row.forEach((value) => {
        if (value > max) max = value;
      });
    });
    if (max <= 0) return grid;
    return grid.map((row) => row.map((value) => value / max));
  };

  const normalizeGridByMax = (grid, max) => {
    if (!Number.isFinite(max) || max <= 0) return grid;
    return grid.map((row) => row.map((value) => value / max));
  };

  const getGridStats = (grid) => {
    let total = 0;
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    let count = 0;
    grid.forEach((row) => {
      row.forEach((value) => {
        total += value;
        min = Math.min(min, value);
        max = Math.max(max, value);
        count += 1;
      });
    });
    const mean = count ? total / count : 0;
    return { total, min, max, mean, count };
  };

  const valueToDiffColor = (value, maxAbs) => {
    const safeMax = maxAbs > 0 ? maxAbs : 1;
    const t = clamp(value / safeMax, -1, 1);
    if (t >= 0) {
      return lerpColor([229, 231, 235], [239, 68, 68], t);
    }
    return lerpColor([59, 130, 246], [229, 231, 235], t + 1);
  };

  const generatePrecipGrid = ({ seed, cols, rows }) => {
    const random = mulberry32(seed);
    const cellCount = 4 + Math.floor(random() * 4);
    const cells = Array.from({ length: cellCount }, () => ({
      x: random(),
      y: random(),
      radius: 0.18 + random() * 0.25,
      intensity: 0.5 + random() * 0.5
    }));
    const values = Array.from({ length: rows }, () => Array.from({ length: cols }, () => 0));
    for (let row = 0; row < rows; row += 1) {
      for (let col = 0; col < cols; col += 1) {
        const x = col / (cols - 1 || 1);
        const y = row / (rows - 1 || 1);
        let value = 0;
        cells.forEach((cell) => {
          const dx = x - cell.x;
          const dy = y - cell.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < cell.radius) {
            value += (1 - dist / cell.radius) * cell.intensity;
          }
        });
        values[row][col] = clamp(value, 0, 1) * 80;
      }
    }
    return values;
  };

  const buildCompareData = ({ bbox, startA, endA, startB, endB, preset }) => {
    const normalizedPreset = preset.toLowerCase();
    const { cols, rows } = resolveStormGrid(normalizedPreset);
    const seedBase = hashString(`${bbox}|${startA}|${endA}|${startB}|${endB}|${normalizedPreset}`);
    const gridA = generatePrecipGrid({ seed: seedBase + 11, cols, rows });
    const gridB = generatePrecipGrid({ seed: seedBase + 97, cols, rows });
    const diffGrid = gridA.map((row, rIdx) =>
      row.map((value, cIdx) => value - gridB[rIdx][cIdx])
    );
    return {
      preset: normalizedPreset,
      cols,
      rows,
      gridA,
      gridB,
      diffGrid,
      statsA: getGridStats(gridA),
      statsB: getGridStats(gridB),
      statsDiff: getGridStats(diffGrid)
    };
  };

  const buildDailySeries = (start, end) => {
    const dates = [];
    const startDate = new Date(`${start}T00:00:00`);
    const endDate = new Date(`${end}T00:00:00`);
    if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) {
      return dates;
    }
    const current = new Date(startDate);
    while (current <= endDate) {
      dates.push(current.toISOString().slice(0, 10));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const buildPointTimeseries = ({ lat, lon, start, end, preset }) => {
    const normalizedPreset = preset.toLowerCase();
    const dates = buildDailySeries(start, end);
    const seed = hashString(`${lat}|${lon}|${start}|${end}|${normalizedPreset}`);
    const random = mulberry32(seed);
    const baseByPreset = {
      low: 4,
      mid: 8,
      detail: 12
    };
    const amplitudeByPreset = {
      low: 12,
      mid: 20,
      detail: 28
    };
    const base = baseByPreset[normalizedPreset] ?? 6;
    const amplitude = amplitudeByPreset[normalizedPreset] ?? 16;
    const series = dates.map((date, idx) => {
      const wave = (Math.sin(idx / 3) + 1) * 0.5;
      const randomBoost = random() * 0.8 + 0.2;
      const value = (base + amplitude * wave) * randomBoost;
      return { date, value: Math.max(0, value) };
    });
    const total = series.reduce((sum, item) => sum + item.value, 0);
    const max = series.reduce((m, item) => Math.max(m, item.value), 0);
    const avg = series.length ? total / series.length : 0;
    return { series, total, max, avg, preset: normalizedPreset };
  };

  const buildCardCsv = ({ lat, lon, start, end, preset, series }) => {
    const lines = [
      "lat,lon,start,end,preset",
      `${lat},${lon},${start},${end},${preset}`,
      "date,precip_mm"
    ];
    series.forEach((item) => {
      lines.push(`${item.date},${item.value.toFixed(2)}`);
    });
    return lines.join("\n");
  };

  const renderMiniChart = (canvas, series) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#f8fafc";
    ctx.fillRect(0, 0, width, height);
    const padding = 24;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const maxValue = Math.max(...series.map((item) => item.value), 1);
    ctx.strokeStyle = "#e5e7eb";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.stroke();
    if (!series.length) return;
    ctx.strokeStyle = "#2563eb";
    ctx.lineWidth = 2;
    ctx.beginPath();
    series.forEach((item, idx) => {
      const x = padding + (idx / (series.length - 1 || 1)) * chartWidth;
      const y = padding + chartHeight - (item.value / maxValue) * chartHeight;
      if (idx === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    ctx.stroke();
    ctx.fillStyle = "rgba(37, 99, 235, 0.1)";
    ctx.lineTo(padding + chartWidth, padding + chartHeight);
    ctx.lineTo(padding, padding + chartHeight);
    ctx.closePath();
    ctx.fill();
  };

  const renderPointMap = (canvas, lat, lon, label) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, "#e0f2fe");
    gradient.addColorStop(1, "#fef3c7");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = "rgba(148, 163, 184, 0.7)";
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i += 1) {
      const y = (height / 4) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    for (let i = 1; i < 4; i += 1) {
      const x = (width / 4) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    const x = ((lon + 180) / 360) * width;
    const y = ((90 - lat) / 180) * height;
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();
    if (label) {
      ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
      ctx.fillRect(0, 0, width, 20);
      ctx.fillStyle = "#fff";
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, 8, 14);
    }
  };

  const renderGrid = (canvas, grid, label, colorizer = valueToColor) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);
    const rows = grid.length;
    const cols = grid[0]?.length || 0;
    const cellWidth = width / (cols || 1);
    const cellHeight = height / (rows || 1);
    for (let r = 0; r < rows; r += 1) {
      for (let c = 0; c < cols; c += 1) {
        ctx.fillStyle = colorizer(grid[r][c]);
        ctx.fillRect(c * cellWidth, r * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
    if (label) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
      ctx.fillRect(0, 0, width, 20);
      ctx.fillStyle = "#fff";
      ctx.font = "12px ui-sans-serif, system-ui, sans-serif";
      ctx.fillText(label, 8, 14);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    initLang();

    const modeSelect = document.getElementById("modeSelect");
    const bboxInput = document.getElementById("bboxInput");
    const latInput = document.getElementById("latInput");
    const lonInput = document.getElementById("lonInput");
    const startInput = document.getElementById("startInput");
    const endInput = document.getElementById("endInput");
    const startInputB = document.getElementById("startInputB");
    const endInputB = document.getElementById("endInputB");
    const presetInput = document.getElementById("presetInput");
    const framesInput = document.getElementById("framesInput");
    const areaInput = document.getElementById("focusArea");
    const layersInput = document.getElementById("layers");
    const notesInput = document.getElementById("notes");
    const resultOutput = document.getElementById("resultOutput");
    const errorOutput = document.getElementById("errorOutput");
    const compareOutput = document.getElementById("compareOutput");
    const compareMetrics = document.getElementById("compareMetrics");
    const compareCanvasA = document.getElementById("compareCanvasA");
    const compareCanvasB = document.getElementById("compareCanvasB");
    const compareCanvasDiff = document.getElementById("compareCanvasDiff");
    const cardOutput = document.getElementById("cardOutput");
    const cardMapPicker = document.getElementById("cardMapPicker");
    const cardMapPreview = document.getElementById("cardMapPreview");
    const cardMapMeta = document.getElementById("cardMapMeta");
    const cardChart = document.getElementById("cardChart");
    const cardSummary = document.getElementById("cardSummary");
    const stormReplay = document.getElementById("stormReplay");
    const stormStatus = document.getElementById("stormStatus");
    const stormPrev = document.getElementById("stormPrev");
    const stormNext = document.getElementById("stormNext");
    const stormSlider = document.getElementById("stormSlider");
    const stormTimestamp = document.getElementById("stormTimestamp");
    const stormCumulativeToggle = document.getElementById("stormCumulativeToggle");
    const stormCumulativePanel = document.getElementById("stormCumulativePanel");
    const stormFrameCanvas = document.getElementById("stormFrameCanvas");
    const stormCumulativeCanvas = document.getElementById("stormCumulativeCanvas");
    const downloadFrameButtons = [
      document.getElementById("downloadFramePng"),
      document.getElementById("downloadFramePngEn")
    ].filter(Boolean);
    const downloadCumulativeButtons = [
      document.getElementById("downloadCumulativePng"),
      document.getElementById("downloadCumulativePngEn")
    ].filter(Boolean);
    const downloadCsvButtons = [
      document.getElementById("downloadCsv"),
      document.getElementById("downloadCsvEn")
    ].filter(Boolean);
    const downloadCompareButtons = {
      a: [
        document.getElementById("downloadCompareA"),
        document.getElementById("downloadCompareAEn")
      ].filter(Boolean),
      b: [
        document.getElementById("downloadCompareB"),
        document.getElementById("downloadCompareBEn")
      ].filter(Boolean),
      diff: [
        document.getElementById("downloadCompareDiff"),
        document.getElementById("downloadCompareDiffEn")
      ].filter(Boolean),
      csv: [
        document.getElementById("downloadCompareCsv"),
        document.getElementById("downloadCompareCsvEn")
      ].filter(Boolean)
    };
    const downloadCardButtons = [
      document.getElementById("downloadCardCsv"),
      document.getElementById("downloadCardCsvEn")
    ].filter(Boolean);

    const exampleButtons = Array.from(document.querySelectorAll("[data-example-mode]"));

    const runButtons = [
      document.getElementById("runBtn"),
      document.getElementById("runBtnEn")
    ].filter(Boolean);

    const getDefaultMode = () => "storm";
    let stormState = null;
    let compareState = null;
    let cardState = null;
    const compareOnlyNodes = Array.from(document.querySelectorAll(".compare-only"));
    const cardOnlyNodes = Array.from(document.querySelectorAll(".card-only"));
    const stormOnlyNodes = Array.from(document.querySelectorAll(".storm-only"));
    const nonCardNodes = Array.from(document.querySelectorAll(".non-card-only"));

    const readUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = params.get("mode");
      const bbox = params.get("bbox");
      const lat = params.get("lat");
      const lon = params.get("lon");
      const start = params.get("start");
      const end = params.get("end");
      const startB = params.get("startB");
      const endB = params.get("endB");
      const preset = params.get("preset");
      const frames = params.get("frames");
      return {
        mode: mode && ["storm", "compare", "card"].includes(mode) ? mode : null,
        bbox: bbox || "",
        lat: lat || "",
        lon: lon || "",
        start: start || "",
        end: end || "",
        startB: startB || "",
        endB: endB || "",
        preset: preset || "",
        frames: frames || ""
      };
    };

    const updateUrlState = () => {
      const params = new URLSearchParams(window.location.search);
      const mode = modeSelect.value || getDefaultMode();
      params.set("mode", mode);

      const bbox = bboxInput.value.trim();
      const lat = latInput?.value.trim() || "";
      const lon = lonInput?.value.trim() || "";
      const start = startInput.value;
      const end = endInput.value;
      const startB = startInputB?.value || "";
      const endB = endInputB?.value || "";
      const preset = presetInput.value.trim();
      const frames = framesInput.value.trim();

      if (bbox) {
        params.set("bbox", bbox);
      } else {
        params.delete("bbox");
      }

      if (lat) {
        params.set("lat", lat);
      } else {
        params.delete("lat");
      }

      if (lon) {
        params.set("lon", lon);
      } else {
        params.delete("lon");
      }

      if (start) {
        params.set("start", start);
      } else {
        params.delete("start");
      }

      if (end) {
        params.set("end", end);
      } else {
        params.delete("end");
      }

      if (startB) {
        params.set("startB", startB);
      } else {
        params.delete("startB");
      }

      if (endB) {
        params.set("endB", endB);
      } else {
        params.delete("endB");
      }

      if (preset) {
        params.set("preset", preset);
      } else {
        params.delete("preset");
      }

      if (frames) {
        params.set("frames", frames);
      } else {
        params.delete("frames");
      }

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, "", newUrl);
    };

    const examplePresets = {
      storm: {
        ja: {
          mode: "storm",
          bbox: "139.60,35.50,139.95,35.80",
          start: "2024-04-01",
          end: "2024-04-30",
          preset: "low",
          frames: "24",
          area: "関東地方・沿岸部",
          layers: "地形 / 主要道路 / 避難所",
          notes: "夜間モードでの視認性を確認"
        },
        en: {
          mode: "storm",
          bbox: "139.60,35.50,139.95,35.80",
          start: "2024-04-01",
          end: "2024-04-30",
          preset: "low",
          frames: "24",
          area: "Coastal area around Kanto",
          layers: "Terrain / main roads / shelters",
          notes: "Check readability in night mode"
        }
      },
      compare: {
        ja: {
          mode: "compare",
          bbox: "135.35,34.55,135.70,34.85",
          start: "2024-05-10",
          end: "2024-05-20",
          startB: "2024-06-10",
          endB: "2024-06-20",
          preset: "mid",
          frames: "",
          area: "大阪湾周辺",
          layers: "河川 / 交通 / 標高",
          notes: "降雨量の差分で比較予定"
        },
        en: {
          mode: "compare",
          bbox: "135.35,34.55,135.70,34.85",
          start: "2024-05-10",
          end: "2024-05-20",
          startB: "2024-06-10",
          endB: "2024-06-20",
          preset: "mid",
          frames: "",
          area: "Osaka Bay area",
          layers: "Rivers / transport / elevation",
          notes: "Compare rainfall differences"
        }
      },
      card: {
        ja: {
          mode: "card",
          bbox: "",
          lat: "38.32",
          lon: "141.50",
          start: "2024-06-01",
          end: "2024-06-07",
          preset: "detail",
          frames: "",
          area: "仙台湾沿岸",
          layers: "避難所 / 防潮堤 / 高低差",
          notes: "要点をカードで共有する想定"
        },
        en: {
          mode: "card",
          bbox: "",
          lat: "38.32",
          lon: "141.50",
          start: "2024-06-01",
          end: "2024-06-07",
          preset: "detail",
          frames: "",
          area: "Sendai Bay coast",
          layers: "Shelters / seawalls / elevation",
          notes: "Share highlights in card format"
        }
      }
    };

    const setExample = (mode, lang) => {
      const preset = examplePresets[mode] || examplePresets.storm;
      const copy = preset[lang] || preset.ja;
      modeSelect.value = copy.mode;
      bboxInput.value = copy.bbox;
      if (latInput && lonInput) {
        latInput.value = copy.lat || "";
        lonInput.value = copy.lon || "";
      }
      startInput.value = copy.start;
      endInput.value = copy.end;
      if (startInputB && endInputB) {
        startInputB.value = copy.startB || "";
        endInputB.value = copy.endB || "";
      }
      presetInput.value = copy.preset;
      framesInput.value = copy.frames || "";
      areaInput.value = copy.area;
      layersInput.value = copy.layers;
      notesInput.value = copy.notes;
    };

    const parseBBox = (value) => {
      if (!value) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const parts = value.split(",").map((part) => part.trim()).filter(Boolean);
      if (parts.length !== 4) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const nums = parts.map((part) => Number(part));
      if (nums.some((num) => Number.isNaN(num))) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const [minLon, minLat, maxLon, maxLat] = nums;
      if (minLon < -180 || maxLon > 180 || minLat < -90 || maxLat > 90 || minLon >= maxLon || minLat >= maxLat) {
        return { error: { code: ERROR_CODES.missing_params, field: "bbox" } };
      }
      const spanLon = Math.abs(maxLon - minLon);
      const spanLat = Math.abs(maxLat - minLat);
      if (spanLon > LIMITS.bboxMaxSpan || spanLat > LIMITS.bboxMaxSpan) {
        return {
          error: {
            code: ERROR_CODES.limit_exceeded,
            field: "bbox",
            detail: { spanLon, spanLat }
          }
        };
      }
      return { value: { minLon, minLat, maxLon, maxLat, spanLon, spanLat } };
    };

  const parseDateRange = (start, end) => {
      if (!start || !end) {
        return { error: { code: ERROR_CODES.missing_params, field: "date" } };
      }
      const startDate = new Date(`${start}T00:00:00`);
      const endDate = new Date(`${end}T00:00:00`);
      if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate < startDate) {
        return { error: { code: ERROR_CODES.missing_params, field: "date" } };
      }
      const diffMs = endDate.getTime() - startDate.getTime();
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
      if (days > LIMITS.dateSpanDays) {
        return {
          error: {
            code: ERROR_CODES.limit_exceeded,
            field: "date",
            detail: { days }
          }
        };
      }
    return { value: { days } };
  };

  const parseLatLon = (latValue, lonValue) => {
    if (latValue === "" || lonValue === "") {
      return { error: { code: ERROR_CODES.missing_params, field: "latlon" } };
    }
    const lat = Number(latValue);
    const lon = Number(lonValue);
    if (Number.isNaN(lat) || Number.isNaN(lon)) {
      return { error: { code: ERROR_CODES.missing_params, field: "latlon" } };
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return { error: { code: ERROR_CODES.limit_exceeded, field: "latlon" } };
    }
    return { value: { lat, lon } };
  };

    const getBBoxAreaBucket = (bbox) => {
      const result = parseBBox(bbox);
      if (result.error) {
        return "unknown";
      }
      const area = result.value.spanLon * result.value.spanLat;
      if (area <= 0.5) return "xs";
      if (area <= 2) return "s";
      if (area <= 5) return "m";
      if (area <= 10) return "l";
      if (area <= 25) return "xl";
      return "xxl";
    };

    const getDateSpanDays = (start, end) => {
      const result = parseDateRange(start, end);
      if (result.error) {
        return null;
      }
      return result.value.days;
    };

    const getEventContext = () => {
      const lang = document.documentElement.lang || "ja";
      const bboxValue = bboxInput.value.trim();
      const startValue = startInput.value;
      const endValue = endInput.value;
      const presetValue = presetInput.value.trim();
      const framesValue = framesInput.value.trim();

      const context = {
        tool_name: TOOL_NAME,
        tool_mode: modeSelect.value || getDefaultMode(),
        lang,
        bbox_area_bucket: getBBoxAreaBucket(bboxValue)
      };

      const dateSpanDays = getDateSpanDays(startValue, endValue);
      if (dateSpanDays !== null) {
        context.date_span_days = dateSpanDays;
      }

      if (presetValue) {
        context.preset = presetValue.toLowerCase();
      }

      if (framesValue) {
        const framesNumber = Number(framesValue);
        if (Number.isFinite(framesNumber)) {
          context.frames = framesNumber;
        }
      }

      return context;
    };

    const validateInputs = ({ mode, bbox, start, end, startB, endB, preset, frames }) => {
      const warnings = [];
      const missingFields = [];
      const isCard = mode === "card";
      if (!bbox && !isCard) missingFields.push("bbox");
      if (isCard) {
        if (!latInput?.value) missingFields.push("lat");
        if (!lonInput?.value) missingFields.push("lon");
      }
      if (!start) missingFields.push("start");
      if (!end) missingFields.push("end");
      if (mode === "compare") {
        if (!startB) missingFields.push("startB");
        if (!endB) missingFields.push("endB");
      }
      if (!preset) missingFields.push("preset");
      if (mode === "storm" && !frames) missingFields.push("frames");
      if (missingFields.length) {
        return { error: { code: ERROR_CODES.missing_params, field: "missing", detail: { missingFields } } };
      }

      if (!isCard) {
        const bboxResult = parseBBox(bbox);
        if (bboxResult.error) return { error: bboxResult.error };
      } else {
        const latlonResult = parseLatLon(latInput?.value, lonInput?.value);
        if (latlonResult.error) return { error: latlonResult.error };
      }

      const dateResult = parseDateRange(start, end);
      if (dateResult.error) return { error: dateResult.error };
      if (mode === "compare") {
        const dateResultB = parseDateRange(startB, endB);
        if (dateResultB.error) return { error: dateResultB.error };
      }

      const normalizedPreset = preset.toLowerCase();
      if (!LIMITS.presets.includes(normalizedPreset)) {
        return {
          error: {
            code: ERROR_CODES.limit_exceeded,
            field: "preset",
            detail: { preset: normalizedPreset }
          }
        };
      }

      if (mode === "storm") {
        const frameValue = Number(frames);
        if (!Number.isFinite(frameValue) || frameValue < 1) {
          return { error: { code: ERROR_CODES.missing_params, field: "frames" } };
        }
        if (frameValue > LIMITS.stormFramesMax) {
          warnings.push({
            code: ERROR_CODES.limit_exceeded,
            field: "frames",
            detail: { frames: frameValue }
          });
        }
      }

      return { ok: true, warnings };
    };

    const buildErrorMessage = (error, lang) => {
      const usageLink = lang === "ja" ? "./usage.html" : "./usage-en.html";
      const usageLabel = lang === "ja" ? "使い方ガイドを見る" : "See usage guide";

      if (error.code === ERROR_CODES.missing_params) {
        if (error.field === "bbox") {
          return {
            title: lang === "ja" ? "BBoxが未入力または形式が不正です" : "BBox is missing or invalid",
            body: lang === "ja"
              ? "BBoxは「経度,緯度,経度,緯度」の形式で入力してください。"
              : "Enter bbox as “lon,lat,lon,lat”.",
            fix: lang === "ja" ? "対処: BBoxを正しい形式で入力してください。" : "Fix: enter a valid bbox.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "latlon") {
          return {
            title: lang === "ja" ? "緯度・経度が未入力または形式が不正です" : "Latitude/longitude is missing or invalid",
            body: lang === "ja"
              ? "緯度（-90〜90）と経度（-180〜180）を入力してください。"
              : "Enter latitude (-90 to 90) and longitude (-180 to 180).",
            fix: lang === "ja" ? "対処: 緯度経度を正しい形式で入力してください。" : "Fix: enter valid lat/lon values.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "date") {
          return {
            title: lang === "ja" ? "開始日または終了日が不足しています" : "Start or end date is missing",
            body: lang === "ja"
              ? "開始日と終了日を両方入力してください。"
              : "Provide both start and end dates.",
            fix: lang === "ja" ? "対処: 日付を設定してください。" : "Fix: set both dates.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "frames") {
          return {
            title: lang === "ja" ? "stormモードのフレーム数が不足しています" : "Storm frames are missing",
            body: lang === "ja"
              ? "stormモードではフレーム数が必須です。"
              : "Frames are required in storm mode.",
            fix: lang === "ja" ? "対処: フレーム数を入力してください。" : "Fix: enter the frames count.",
            usageLink,
            usageLabel
          };
        }

        const missingFields = error.detail?.missingFields || [];
        const missingList = missingFields.length ? missingFields.join(", ") : "bbox / start / end / preset / frames";
        return {
          title: lang === "ja" ? "入力が不足しています" : "Missing required inputs",
          body: lang === "ja"
            ? `不足: ${missingList}。必須項目を入力してから実行してください。`
            : `Missing: ${missingList}. Please fill in the required inputs before running.`,
          fix: lang === "ja" ? "対処: 必須項目をすべて入力してください。" : "Fix: fill in all required fields.",
          usageLink,
          usageLabel
        };
      }

      if (error.code === ERROR_CODES.limit_exceeded) {
        if (error.field === "bbox") {
          const spanLon = error.detail?.spanLon?.toFixed(2);
          const spanLat = error.detail?.spanLat?.toFixed(2);
          return {
            title: lang === "ja" ? "BBoxが無料枠の上限を超えています" : "BBox exceeds the free limit",
            body: lang === "ja"
              ? `現在のBBoxは ${spanLon}° × ${spanLat}° です。上限は ${LIMITS.bboxMaxSpan}° × ${LIMITS.bboxMaxSpan}° です。`
              : `Your BBox spans ${spanLon}° × ${spanLat}°. The limit is ${LIMITS.bboxMaxSpan}° × ${LIMITS.bboxMaxSpan}°.`,
            fix: lang === "ja" ? "対処: BBoxを縮小するか、複数回に分割してください。" : "Fix: shrink the bbox or split into multiple runs.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "date") {
          const days = error.detail?.days;
          return {
            title: lang === "ja" ? "期間が無料枠の上限を超えています" : "Date span exceeds the free limit",
            body: lang === "ja"
              ? `現在の期間は ${days} 日です。上限は ${LIMITS.dateSpanDays} 日です。`
              : `Your date span is ${days} days. The limit is ${LIMITS.dateSpanDays} days.`,
            fix: lang === "ja" ? "対処: 期間を短くしてください。" : "Fix: shorten the period.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "preset") {
          const preset = error.detail?.preset || "";
          return {
            title: lang === "ja" ? "プリセットが無料枠の対象外です" : "Preset is not available on free ops",
            body: lang === "ja"
              ? `指定されたプリセット「${preset}」は利用できません。利用可能: ${LIMITS.presets.join(", ")}。`
              : `Preset "${preset}" is not available. Allowed: ${LIMITS.presets.join(", ")}.`,
            fix: lang === "ja" ? "対処: 範囲が広い場合は low を選択してください。" : "Fix: choose low for larger areas.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "latlon") {
          return {
            title: lang === "ja" ? "緯度・経度が範囲外です" : "Latitude/longitude is out of range",
            body: lang === "ja"
              ? "緯度は -90〜90、経度は -180〜180 の範囲で指定してください。"
              : "Latitude must be between -90 and 90, longitude between -180 and 180.",
            fix: lang === "ja" ? "対処: 緯度経度を範囲内で入力してください。" : "Fix: enter lat/lon within the valid range.",
            usageLink,
            usageLabel
          };
        }
        if (error.field === "frames") {
          const frames = error.detail?.frames;
          return {
            title: lang === "ja" ? "フレーム数が無料枠の上限を超えています" : "Storm frames exceed the free limit",
            body: lang === "ja"
              ? `現在のフレーム数は ${frames} です。上限は ${LIMITS.stormFramesMax} です。`
              : `Frames set to ${frames}. The limit is ${LIMITS.stormFramesMax}.`,
            fix: lang === "ja" ? "対処: フレーム数を減らすか、プリセットを low にしてください。" : "Fix: reduce frames or switch to the low preset.",
            usageLink,
            usageLabel
          };
        }
      }

      return {
        title: lang === "ja" ? "不明なエラーが発生しました" : "Unknown error",
        body: lang === "ja"
          ? "入力内容を確認して再度お試しください。"
          : "Please review your inputs and try again.",
        fix: lang === "ja" ? "対処: 使い方ガイドを参照してください。" : "Fix: review the usage guide.",
        usageLink,
        usageLabel
      };
    };

    const STATUS_COPY = {
      ja: {
        idle: {
          title: "準備完了",
          body: "入力後に「実行」で結果を生成します。",
          hint: "すぐ試す場合は Example を選んでください。"
        },
        loading: {
          title: "処理中",
          body: "入力内容を確認して結果を準備しています。"
        },
        success: {
          title: "結果を生成しました",
          body: "プレビュー内容を確認してください。"
        },
        error: {
          title: "入力エラー",
          body: "不足や上限超過がありました。"
        },
        statusLabel: "ステータス",
        codeLabel: "エラーコード"
      },
      en: {
        idle: {
          title: "Ready",
          body: "Enter details and hit “Run” to generate results.",
          hint: "Need a quick start? Choose an Example preset."
        },
        loading: {
          title: "Working…",
          body: "Checking inputs and preparing results."
        },
        success: {
          title: "Results ready",
          body: "Review the preview and next steps."
        },
        error: {
          title: "Input issue",
          body: "Some inputs are missing or out of range."
        },
        statusLabel: "Status",
        codeLabel: "Error code"
      }
    };

    const buildPreviewText = (lang) => formatPreview({
      mode: modeSelect.value,
      bbox: bboxInput.value.trim(),
      lat: latInput?.value.trim() || "",
      lon: lonInput?.value.trim() || "",
      start: startInput.value,
      end: endInput.value,
      startB: startInputB?.value || "",
      endB: endInputB?.value || "",
      preset: presetInput.value.trim(),
      frames: framesInput.value.trim(),
      area: areaInput.value.trim(),
      layers: layersInput.value.trim(),
      notes: notesInput.value.trim()
    }, lang);

    let currentStatus = "idle";

    const renderStatus = ({ state, lang, error, previewText }) => {
      const copy = STATUS_COPY[lang] || STATUS_COPY.ja;
      const statusMeta = copy[state] || copy.idle;
      const statusLabel = copy.statusLabel;
      const stateLabel = statusMeta.title;
      const intro = statusMeta.body;
      const hint = statusMeta.hint;
      const codeLabel = copy.codeLabel;
      const isError = state === "error";
      const isSuccess = state === "success";
      const isIdle = state === "idle";
      const errorMessage = isError ? buildErrorMessage(error || {}, lang) : null;
      const errorCode = escapeHTML((error?.code || ERROR_CODES.unknown).toString());

      const contentParts = [
        "<div class=\"status-card status-" + state + "\">",
        "<div class=\"status-header\">",
        `<span class=\"status-label\">${escapeHTML(statusLabel)}</span>`,
        `<span class=\"status-state\">${escapeHTML(stateLabel)}</span>`,
        "</div>",
        `<div class=\"status-body\">${escapeHTML(intro)}</div>`
      ];

      if (isIdle && hint) {
        contentParts.push(`<div class=\"status-hint\">${escapeHTML(hint)}</div>`);
      }

      if (isError && errorMessage) {
        contentParts.push(
          "<div class=\"status-detail\">",
          `<span class=\"status-code\">${escapeHTML(codeLabel)}: ${errorCode}</span>`,
          `<div class=\"status-title\">${escapeHTML(errorMessage.title)}</div>`,
          `<p>${escapeHTML(errorMessage.body)}</p>`,
          `<p>${escapeHTML(errorMessage.fix)}</p>`,
          `<a class=\"nw-link\" href=\"${escapeHTML(errorMessage.usageLink)}\">${escapeHTML(errorMessage.usageLabel)}</a>`,
          "</div>"
        );
      }

      if (isSuccess && previewText) {
        contentParts.push(
          "<div class=\"status-preview\">",
          escapeHTML(previewText),
          "</div>"
        );
      }

      contentParts.push("</div>");

      resultOutput.classList.add("status-output");
      resultOutput.innerHTML = contentParts.join("");
      resultOutput.hidden = false;
      errorOutput.hidden = true;
      errorOutput.innerHTML = "";
      currentStatus = state;
    };

    const setIdleStatus = (lang) => renderStatus({ state: "idle", lang });
    const setLoadingStatus = (lang) => renderStatus({ state: "loading", lang });
    const setSuccessStatus = (lang) => renderStatus({ state: "success", lang, previewText: buildPreviewText(lang) });
    const setErrorStatus = (error, lang) => renderStatus({ state: "error", lang, error });

    const clearError = () => {
      errorOutput.hidden = true;
      errorOutput.innerHTML = "";
      if (currentStatus === "error") {
        setIdleStatus(document.documentElement.lang || "ja");
      }
    };

    const setStormStatus = ({ rawFrames, frames, thinningStep, lang }) => {
      if (!stormStatus) return;
      if (!rawFrames || !frames) {
        stormStatus.textContent = "";
        return;
      }
      if (rawFrames > LIMITS.stormFramesMax) {
        const message = lang === "ja"
          ? `フレーム数 ${rawFrames} を受け取りました。${frames} フレームに間引いて表示しています（${thinningStep}フレームごと）。必要ならフレーム数を減らしてください。`
          : `Requested ${rawFrames} frames. Showing ${frames} frames (every ${thinningStep} frame). Reduce frames if needed.`;
        stormStatus.innerHTML = `<strong>${escapeHTML(message)}</strong>`;
        return;
      }
      stormStatus.textContent = lang === "ja"
        ? `フレーム数: ${frames}（${rawFrames}フレームから生成）`
        : `Frames: ${frames} (from ${rawFrames})`;
    };

    const buildCsvContent = (timestamps, frameTotals, cumulativeTotals) => {
      const lines = ["timestamp,frame_index,frame_total,cumulative_total"];
      timestamps.forEach((timestamp, idx) => {
        const frameTotal = frameTotals[idx] ?? 0;
        const cumulativeTotal = cumulativeTotals[idx] ?? 0;
        lines.push(`${timestamp},${idx + 1},${frameTotal.toFixed(4)},${cumulativeTotal.toFixed(4)}`);
      });
      return lines.join("\n");
    };

    const buildCompareCsv = ({ bbox, startA, endA, startB, endB, preset, gridA, gridB, diffGrid }) => {
      const lines = [
        "bbox,period_a_start,period_a_end,period_b_start,period_b_end,preset",
        `"${bbox}",${startA},${endA},${startB},${endB},${preset}`,
        "row,col,period_a_mm,period_b_mm,diff_mm"
      ];
      gridA.forEach((row, rIdx) => {
        row.forEach((value, cIdx) => {
          const valueB = gridB[rIdx][cIdx];
          const diff = diffGrid[rIdx][cIdx];
          lines.push(`${rIdx + 1},${cIdx + 1},${value.toFixed(2)},${valueB.toFixed(2)},${diff.toFixed(2)}`);
        });
      });
      return lines.join("\n");
    };

    const downloadBlob = (content, filename, type) => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };

    const downloadCanvas = (canvas, filename) => {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
    };

    const updateStormView = () => {
      if (!stormState || !stormFrameCanvas || !stormCumulativeCanvas) return;
      const index = stormState.index;
      const currentFrame = stormState.frames[index];
      const currentTimestamp = stormState.timestamps[index] || "-";
      const cumulativeFrame = stormState.cumulativeFrames[index];
      const label = currentTimestamp;
      renderGrid(stormFrameCanvas, currentFrame, label);
      if (stormCumulativePanel && stormCumulativeToggle) {
        stormCumulativePanel.hidden = !stormCumulativeToggle.checked;
      }
      if (stormCumulativeToggle?.checked) {
        renderGrid(stormCumulativeCanvas, normalizeGrid(cumulativeFrame), label);
      }
      if (stormTimestamp) {
        stormTimestamp.textContent = currentTimestamp;
      }
      if (stormSlider) {
        stormSlider.value = String(index);
      }
    };

    const loadStormReplay = ({ bbox, start, end, preset, frames }, lang) => {
      if (!stormReplay) return;
      const key = buildStormKey({ bbox, start, end, preset, frames });
      let data = stormCache.get(key);
      if (!data) {
        data = generateStormReplay({ bbox, start, end, preset, frames });
        stormCache.set(key, data);
      }
      const cumulativeFrames = buildCumulativeFrames(data.frames);
      stormState = {
        ...data,
        cumulativeFrames,
        index: 0
      };
      stormReplay.hidden = false;
      if (stormSlider) {
        stormSlider.max = String(Math.max(0, data.frames.length - 1));
        stormSlider.value = "0";
      }
      setStormStatus({
        rawFrames: data.rawFrames,
        frames: data.frames.length,
        thinningStep: data.thinningStep,
        lang
      });
      updateStormView();
    };

    const resetStormReplay = () => {
      if (stormReplay) {
        stormReplay.hidden = true;
      }
      if (stormStatus) {
        stormStatus.textContent = "";
      }
      stormState = null;
    };

    const resetCompareOutput = () => {
      if (compareOutput) {
        compareOutput.hidden = true;
      }
      if (compareMetrics) {
        compareMetrics.innerHTML = "";
      }
      compareState = null;
    };

    const resetCardOutput = () => {
      if (cardOutput) {
        cardOutput.hidden = true;
      }
      if (cardSummary) {
        cardSummary.innerHTML = "";
      }
      cardState = null;
    };

    const updateCompareMetrics = ({ statsA, statsB, statsDiff }, lang) => {
      if (!compareMetrics) return;
      const format = (value) => Number.isFinite(value) ? value.toFixed(2) : "-";
      if (lang === "ja") {
        compareMetrics.innerHTML = [
          "<div>",
          "<dt>期間A 合計 (mm相当)</dt>",
          `<dd>${format(statsA.total)}</dd>`,
          "</div>",
          "<div>",
          "<dt>期間B 合計 (mm相当)</dt>",
          `<dd>${format(statsB.total)}</dd>`,
          "</div>",
          "<div>",
          "<dt>差分合計 (A - B, mm相当)</dt>",
          `<dd>${format(statsDiff.total)}</dd>`,
          "</div>",
          "<div>",
          "<dt>期間A 平均 (mm相当)</dt>",
          `<dd>${format(statsA.mean)}</dd>`,
          "</div>",
          "<div>",
          "<dt>期間B 平均 (mm相当)</dt>",
          `<dd>${format(statsB.mean)}</dd>`,
          "</div>",
          "<div>",
          "<dt>差分最大 (mm相当)</dt>",
          `<dd>${format(statsDiff.max)}</dd>`,
          "</div>"
        ].join("");
        return;
      }
      compareMetrics.innerHTML = [
        "<div>",
        "<dt>Period A total (mm equivalent)</dt>",
        `<dd>${format(statsA.total)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Period B total (mm equivalent)</dt>",
        `<dd>${format(statsB.total)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Diff total (A - B, mm equivalent)</dt>",
        `<dd>${format(statsDiff.total)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Period A mean (mm equivalent)</dt>",
        `<dd>${format(statsA.mean)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Period B mean (mm equivalent)</dt>",
        `<dd>${format(statsB.mean)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Max diff (mm equivalent)</dt>",
        `<dd>${format(statsDiff.max)}</dd>`,
        "</div>"
      ].join("");
    };

    const updateCardSummary = ({ total, avg, max, series, preset, start, end, lat, lon }, lang) => {
      if (!cardSummary) return;
      const format = (value) => Number.isFinite(value) ? value.toFixed(2) : "-";
      if (lang === "ja") {
        cardSummary.innerHTML = [
          "<div>",
          "<dt>期間</dt>",
          `<dd>${start} 〜 ${end}</dd>`,
          "</div>",
          "<div>",
          "<dt>プリセット</dt>",
          `<dd>${escapeHTML(preset)}</dd>`,
          "</div>",
          "<div>",
          "<dt>観測日数</dt>",
          `<dd>${series.length} 日</dd>`,
          "</div>",
          "<div>",
          "<dt>合計 (mm)</dt>",
          `<dd>${format(total)}</dd>`,
          "</div>",
          "<div>",
          "<dt>平均 (mm)</dt>",
          `<dd>${format(avg)}</dd>`,
          "</div>",
          "<div>",
          "<dt>最大 (mm)</dt>",
          `<dd>${format(max)}</dd>`,
          "</div>",
          "<div>",
          "<dt>緯度 / 経度</dt>",
          `<dd>${lat.toFixed(4)} / ${lon.toFixed(4)}</dd>`,
          "</div>"
        ].join("");
        return;
      }
      cardSummary.innerHTML = [
        "<div>",
        "<dt>Period</dt>",
        `<dd>${start} to ${end}</dd>`,
        "</div>",
        "<div>",
        "<dt>Preset</dt>",
        `<dd>${escapeHTML(preset)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Days</dt>",
        `<dd>${series.length} days</dd>`,
        "</div>",
        "<div>",
        "<dt>Total (mm)</dt>",
        `<dd>${format(total)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Average (mm)</dt>",
        `<dd>${format(avg)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Max (mm)</dt>",
        `<dd>${format(max)}</dd>`,
        "</div>",
        "<div>",
        "<dt>Lat / Lon</dt>",
        `<dd>${lat.toFixed(4)} / ${lon.toFixed(4)}</dd>`,
        "</div>"
      ].join("");
    };

    const updateCardMapMeta = (lat, lon, lang) => {
      if (!cardMapMeta) return;
      const latText = Number.isFinite(lat) ? lat.toFixed(4) : "-";
      const lonText = Number.isFinite(lon) ? lon.toFixed(4) : "-";
      cardMapMeta.textContent = lang === "ja"
        ? `緯度: ${latText} / 経度: ${lonText}`
        : `Lat: ${latText} / Lon: ${lonText}`;
    };

    const loadCardOutput = ({ lat, lon, start, end, preset }, lang) => {
      if (!cardOutput || !cardChart || !cardMapPreview) return;
      const data = buildPointTimeseries({ lat, lon, start, end, preset });
      cardState = { ...data, lat, lon, start, end, preset };
      cardOutput.hidden = false;
      renderMiniChart(cardChart, data.series);
      renderPointMap(cardMapPreview, lat, lon, `${start} ~ ${end}`);
      updateCardMapMeta(lat, lon, lang);
      updateCardSummary({ ...data, lat, lon, start, end, preset }, lang);
    };

    const updateCardPickerMap = () => {
      if (!cardMapPicker) return;
      const latValue = Number(latInput?.value);
      const lonValue = Number(lonInput?.value);
      const lat = Number.isFinite(latValue) ? latValue : 0;
      const lon = Number.isFinite(lonValue) ? lonValue : 0;
      renderPointMap(cardMapPicker, lat, lon, "Pick");
    };

    const loadCompareOutput = ({ bbox, startA, endA, startB, endB, preset }, lang) => {
      if (!compareOutput || !compareCanvasA || !compareCanvasB || !compareCanvasDiff) return;
      const data = buildCompareData({ bbox, startA, endA, startB, endB, preset });
      compareState = { ...data, bbox, startA, endA, startB, endB };
      compareOutput.hidden = false;
      updateCompareMetrics(data, lang);

      const maxAB = Math.max(data.statsA.max, data.statsB.max, 1);
      const normalizedA = normalizeGridByMax(data.gridA, maxAB);
      const normalizedB = normalizeGridByMax(data.gridB, maxAB);
      const maxAbsDiff = Math.max(Math.abs(data.statsDiff.min), Math.abs(data.statsDiff.max), 1);

      renderGrid(compareCanvasA, normalizedA, `${startA} ~ ${endA}`);
      renderGrid(compareCanvasB, normalizedB, `${startB} ~ ${endB}`);
      renderGrid(compareCanvasDiff, data.diffGrid, "A - B", (value) => valueToDiffColor(value, maxAbsDiff));
    };

    const scrollToResults = () => {
      resultOutput.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    exampleButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = document.documentElement.lang || "ja";
        const mode = btn.dataset.exampleMode || modeSelect.value || getDefaultMode();
        setExample(mode, lang);
        updateCardPickerMap();
        updateModeVisibility(modeSelect.value);
        clearError();
        updateUrlState();
        setLoadingStatus(lang);
        scrollToResults();
        if (modeSelect.value === "storm") {
          const validation = validateInputs({
            mode: modeSelect.value,
            bbox: bboxInput.value.trim(),
            start: startInput.value,
            end: endInput.value,
            startB: startInputB?.value || "",
            endB: endInputB?.value || "",
            preset: presetInput.value.trim(),
            frames: framesInput.value.trim()
          });
          if (validation.error) {
            setErrorStatus(validation.error, lang);
          } else {
            setSuccessStatus(lang);
            loadStormReplay({
              bbox: bboxInput.value.trim(),
              start: startInput.value,
              end: endInput.value,
              preset: presetInput.value.trim(),
              frames: framesInput.value.trim()
            }, lang);
          }
          resetCompareOutput();
        } else if (modeSelect.value === "compare") {
          const validation = validateInputs({
            mode: modeSelect.value,
            bbox: bboxInput.value.trim(),
            start: startInput.value,
            end: endInput.value,
            startB: startInputB?.value || "",
            endB: endInputB?.value || "",
            preset: presetInput.value.trim(),
            frames: framesInput.value.trim()
          });
          if (validation.error) {
            setErrorStatus(validation.error, lang);
          } else {
            setSuccessStatus(lang);
            loadCompareOutput({
              bbox: bboxInput.value.trim(),
              startA: startInput.value,
              endA: endInput.value,
              startB: startInputB?.value || "",
              endB: endInputB?.value || "",
              preset: presetInput.value.trim()
            }, lang);
          }
          resetStormReplay();
        } else if (modeSelect.value === "card") {
          const validation = validateInputs({
            mode: modeSelect.value,
            bbox: bboxInput.value.trim(),
            start: startInput.value,
            end: endInput.value,
            startB: startInputB?.value || "",
            endB: endInputB?.value || "",
            preset: presetInput.value.trim(),
            frames: framesInput.value.trim()
          });
          if (validation.error) {
            setErrorStatus(validation.error, lang);
          } else {
            setSuccessStatus(lang);
            const lat = Number(latInput?.value);
            const lon = Number(lonInput?.value);
            loadCardOutput({
              lat,
              lon,
              start: startInput.value,
              end: endInput.value,
              preset: presetInput.value.trim()
            }, lang);
          }
          resetStormReplay();
          resetCompareOutput();
        } else {
          resetStormReplay();
          resetCompareOutput();
          resetCardOutput();
        }
        trackEvent("tool_example_apply", {
          tool_name: TOOL_NAME,
          tool_mode: mode,
          example_mode: mode,
          lang
        });
      });
    });

    runButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        clearError();
        updateUrlState();
        trackEvent("tool_run", getEventContext());
        const lang = document.documentElement.lang || "ja";
        setLoadingStatus(lang);
        scrollToResults();
        const validation = validateInputs({
          mode: modeSelect.value,
          bbox: bboxInput.value.trim(),
          start: startInput.value,
          end: endInput.value,
          startB: startInputB?.value || "",
          endB: endInputB?.value || "",
          preset: presetInput.value.trim(),
          frames: framesInput.value.trim()
        });
        if (validation.error) {
          setErrorStatus(validation.error, lang);
          trackEvent("tool_error", {
            ...getEventContext(),
            error_code: validation.error.code || ERROR_CODES.unknown,
            error_field: validation.error.field || "unknown"
          });
          return;
        }
        setSuccessStatus(lang);
        if (modeSelect.value === "storm") {
          loadStormReplay({
            bbox: bboxInput.value.trim(),
            start: startInput.value,
            end: endInput.value,
            preset: presetInput.value.trim(),
            frames: framesInput.value.trim()
          }, lang);
          resetCompareOutput();
          resetCardOutput();
        } else if (modeSelect.value === "compare") {
          loadCompareOutput({
            bbox: bboxInput.value.trim(),
            startA: startInput.value,
            endA: endInput.value,
            startB: startInputB?.value || "",
            endB: endInputB?.value || "",
            preset: presetInput.value.trim()
          }, lang);
          resetStormReplay();
          resetCardOutput();
        } else if (modeSelect.value === "card") {
          const lat = Number(latInput?.value);
          const lon = Number(lonInput?.value);
          loadCardOutput({
            lat,
            lon,
            start: startInput.value,
            end: endInput.value,
            preset: presetInput.value.trim()
          }, lang);
          resetStormReplay();
          resetCompareOutput();
        } else {
          resetStormReplay();
          resetCompareOutput();
          resetCardOutput();
        }
        trackEvent("tool_result", getEventContext());
      });
    });

    if (stormPrev) {
      stormPrev.addEventListener("click", () => {
        if (!stormState) return;
        stormState.index = Math.max(0, stormState.index - 1);
        updateStormView();
      });
    }
    if (stormNext) {
      stormNext.addEventListener("click", () => {
        if (!stormState) return;
        stormState.index = Math.min(stormState.frames.length - 1, stormState.index + 1);
        updateStormView();
      });
    }
    if (stormSlider) {
      stormSlider.addEventListener("input", () => {
        if (!stormState) return;
        stormState.index = Number(stormSlider.value);
        updateStormView();
      });
    }
    if (stormCumulativeToggle) {
      stormCumulativeToggle.addEventListener("change", () => {
        updateStormView();
      });
    }

    downloadFrameButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!stormState || !stormFrameCanvas) return;
        const timestamp = stormState.timestamps[stormState.index] || "frame";
        const filename = `storm-frame-${timestamp.replace(/[:.]/g, "-")}.png`;
        downloadCanvas(stormFrameCanvas, filename);
      });
    });

    downloadCumulativeButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!stormState || !stormCumulativeCanvas) return;
        const timestamp = stormState.timestamps[stormState.index] || "cumulative";
        const filename = `storm-cumulative-${timestamp.replace(/[:.]/g, "-")}.png`;
        downloadCanvas(stormCumulativeCanvas, filename);
      });
    });

    downloadCsvButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!stormState) return;
        const csv = buildCsvContent(stormState.timestamps, stormState.frameTotals, stormState.cumulativeTotals);
        const filename = "storm-timeseries.csv";
        downloadBlob(csv, filename, "text/csv;charset=utf-8;");
      });
    });

    downloadCompareButtons.a.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!compareState || !compareCanvasA) return;
        downloadCanvas(compareCanvasA, "compare-period-a.png");
      });
    });
    downloadCompareButtons.b.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!compareState || !compareCanvasB) return;
        downloadCanvas(compareCanvasB, "compare-period-b.png");
      });
    });
    downloadCompareButtons.diff.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!compareState || !compareCanvasDiff) return;
        downloadCanvas(compareCanvasDiff, "compare-diff.png");
      });
    });
    downloadCompareButtons.csv.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!compareState) return;
        const csv = buildCompareCsv({
          bbox: compareState.bbox,
          startA: compareState.startA,
          endA: compareState.endA,
          startB: compareState.startB,
          endB: compareState.endB,
          preset: compareState.preset,
          gridA: compareState.gridA,
          gridB: compareState.gridB,
          diffGrid: compareState.diffGrid
        });
        downloadBlob(csv, "compare-precipitation.csv", "text/csv;charset=utf-8;");
      });
    });

    downloadCardButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        if (!cardState) return;
        const csv = buildCardCsv({
          lat: cardState.lat,
          lon: cardState.lon,
          start: cardState.start,
          end: cardState.end,
          preset: cardState.preset,
          series: cardState.series
        });
        downloadBlob(csv, "card-point-timeseries.csv", "text/csv;charset=utf-8;");
      });
    });

    const urlState = readUrlState();
    modeSelect.value = urlState.mode || getDefaultMode();
    bboxInput.value = urlState.bbox;
    if (latInput && lonInput) {
      latInput.value = urlState.lat;
      lonInput.value = urlState.lon;
    }
    startInput.value = urlState.start;
    endInput.value = urlState.end;
    if (startInputB && endInputB) {
      startInputB.value = urlState.startB;
      endInputB.value = urlState.endB;
    }
    presetInput.value = urlState.preset;
    framesInput.value = urlState.frames;

    let previousMode = modeSelect.value || getDefaultMode();

    const updateModeVisibility = (mode) => {
      const isCompare = mode === "compare";
      const isStorm = mode === "storm";
      const isCard = mode === "card";
      compareOnlyNodes.forEach((node) => {
        node.hidden = !isCompare;
      });
      stormOnlyNodes.forEach((node) => {
        node.hidden = !isStorm;
      });
      cardOnlyNodes.forEach((node) => {
        node.hidden = !isCard;
      });
      nonCardNodes.forEach((node) => {
        node.hidden = isCard;
      });
      if (!isCompare) {
        resetCompareOutput();
      }
      if (!isStorm) {
        resetStormReplay();
      }
      if (!isCard) {
        resetCardOutput();
      }
    };

    const inputsToWatch = [
      modeSelect,
      bboxInput,
      latInput,
      lonInput,
      startInput,
      endInput,
      startInputB,
      endInputB,
      presetInput,
      framesInput,
      areaInput,
      layersInput,
      notesInput
    ];

    inputsToWatch.forEach((input) => {
      input.addEventListener("input", () => {
        clearError();
        updateUrlState();
        setIdleStatus(document.documentElement.lang || "ja");
        resetStormReplay();
        resetCompareOutput();
        resetCardOutput();
        if (input === latInput || input === lonInput) {
          updateCardPickerMap();
        }
      });
      input.addEventListener("change", () => {
        clearError();
        updateUrlState();
        setIdleStatus(document.documentElement.lang || "ja");
        resetStormReplay();
        resetCompareOutput();
        resetCardOutput();
        if (input === latInput || input === lonInput) {
          updateCardPickerMap();
        }
        if (input === modeSelect && previousMode !== modeSelect.value) {
          updateModeVisibility(modeSelect.value);
          trackEvent("tool_mode_change", {
            tool_name: TOOL_NAME,
            tool_mode: modeSelect.value,
            previous_mode: previousMode,
            lang: document.documentElement.lang || "ja"
          });
          previousMode = modeSelect.value;
        }
      });
    });

    if (cardMapPicker) {
      updateCardPickerMap();
      cardMapPicker.addEventListener("click", (event) => {
        if (!latInput || !lonInput) return;
        const rect = cardMapPicker.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const lon = (x / rect.width) * 360 - 180;
        const lat = 90 - (y / rect.height) * 180;
        latInput.value = lat.toFixed(4);
        lonInput.value = lon.toFixed(4);
        updateUrlState();
        setIdleStatus(document.documentElement.lang || "ja");
        updateCardPickerMap();
        resetCardOutput();
      });
    }

    document.addEventListener("click", (event) => {
      const link = event.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href") || "";
      const lang = document.documentElement.lang || "ja";

      if (link.closest(".nw-other-links")) {
        trackEvent("related_tool_click", {
          tool_name: TOOL_NAME,
          lang,
          related_tool_path: href
        });
        return;
      }

      if (href.includes("usage")) {
        trackEvent("usage_open", {
          tool_name: TOOL_NAME,
          lang,
          usage_path: href
        });
        return;
      }

      if (href && !href.startsWith("#")) {
        const isExternal = (() => {
          try {
            const url = new URL(href, window.location.href);
            return url.origin !== window.location.origin;
          } catch (_) {
            return false;
          }
        })();

        if (isExternal) {
          trackEvent("outbound_click", {
            tool_name: TOOL_NAME,
            lang,
            outbound_url: href
          });
        }
      }
    });

    updateModeVisibility(modeSelect.value || getDefaultMode());
    updateUrlState();
    setIdleStatus(document.documentElement.lang || "ja");
  });
})();
