/* ================================
 * tiny audio meter | NicheWorks
 * app.js (MVP)
 * - JP/EN (data-i18n) toggle
 * - Enable Mic (user gesture only)
 * - Real-time: RMS -> dB-ish, Pitch (ACF), Note, FFT bars
 * - Voice activity effect (3-bar) on/off by RMS threshold
 * - Snapshots: FIFO max 20, list + delete + clear
 * - Segment analysis: Start/Stop, summary stats
 * ================================ */

(() => {
  // ----------------------------
  // DOM
  // ----------------------------
  const root = document.documentElement;

  const micButton = document.getElementById("micButton");
  const voiceActivity = document.getElementById("voiceActivity");
  const volumeBar = document.getElementById("volumeBar");
  const volumeValue = document.getElementById("volumeValue");
  const pitchValue = document.getElementById("pitchValue");
  const noteValue = document.getElementById("noteValue");

  const spectrumCanvas = document.getElementById("spectrumCanvas");
  const sctx = spectrumCanvas.getContext("2d");

  const snapshotButton = document.getElementById("snapshotButton");
  const snapshotCount = document.getElementById("snapshotCount");
  const snapshotItems = document.getElementById("snapshotItems");
  const clearSnapshotsBtn = document.getElementById("clearSnapshots");

  const segmentStart = document.getElementById("segmentStart");
  const segmentStop = document.getElementById("segmentStop");
  const segmentResult = document.getElementById("segmentResult");
  const resetButton = document.getElementById("resetButton");

  // ----------------------------
  // i18n
  // ----------------------------
  const MSG = {
    ja: {
      enableMic: "マイクを許可",
      micOn: "マイク：ON",
      micOff: "マイク：OFF",
      needUserGesture: "マイクはボタン操作でのみ有効化できます。",
      micDenied: "マイク権限が拒否されました。ブラウザ設定から許可してください。",
      micError: "マイクの起動に失敗しました。",
      unsupported: "このブラウザは音声入力に対応していない可能性があります。",
      snapshotEmpty: "スナップショットはまだありません。",
      cleared: "スナップショットを削除しました。",
      segmentRecording: "記録中…",
      segmentTooShort: "短すぎます（1秒以上）",
      segmentTitle: "区間解析結果",
      duration: "区間長",
      avgLoudness: "平均音量",
      avgPitch: "平均周波数",
      stability: "安定度",
      noiseLevel: "ノイズ",
      low: "Low",
      mid: "Mid",
      high: "High",
      reset: "リセット",
      delete: "削除",
      clearAll: "全削除",
      snapshot: "スナップショット",
      peak: "ピーク",
      active: "active",
      silent: "silent",
    },
    en: {
      enableMic: "Enable Mic",
      micOn: "Mic: ON",
      micOff: "Mic: OFF",
      needUserGesture: "Microphone must be enabled by a button click.",
      micDenied: "Microphone permission denied. Please allow it in browser settings.",
      micError: "Failed to start microphone.",
      unsupported: "Your browser may not support audio input features.",
      snapshotEmpty: "No snapshots yet.",
      cleared: "Snapshots cleared.",
      segmentRecording: "Recording...",
      segmentTooShort: "Too short (needs 1s+).",
      segmentTitle: "Segment Result",
      duration: "Duration",
      avgLoudness: "Avg Loudness",
      avgPitch: "Avg Pitch",
      stability: "Stability",
      noiseLevel: "Noise Level",
      low: "Low",
      mid: "Mid",
      high: "High",
      reset: "Reset",
      delete: "Delete",
      clearAll: "Clear All",
      snapshot: "Snapshot",
      peak: "Peak",
      active: "active",
      silent: "silent",
    },
  };

  function detectInitialLang() {
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ja") ? "ja" : "en";
  }

  let currentLang = detectInitialLang();

  function applyLang(lang) {
    currentLang = lang;
    root.setAttribute("data-lang", lang);

    // show/hide nodes by data-i18n
    const nodes = document.querySelectorAll("[data-i18n]");
    nodes.forEach((el) => {
      const target = el.getAttribute("data-i18n");
      el.style.display = target === lang ? "" : "none";
    });

    // update count label summary stays same; content already bilingual in HTML
  }

  // wire language switch
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.getAttribute("data-lang-switch")));
  });

  applyLang(currentLang);

  // ----------------------------
  // Audio state
  // ----------------------------
  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let mediaStream = null;

  // Buffers
  let timeData = null;
  let freqData = null;

  // Animation
  let rafId = null;
  let lastActive = false;

  // Config
  const FFT_SIZE = 1024;        // 512-1024 recommended
  const ACTIVITY_THRESHOLD = 0.06; // RMS threshold (0..1)
  const SNAP_MAX = 20;

  // Snapshots
  /** @type {Array<{id:string, ts:number, volDb:number, hz:number|null, note:string, peakHz:number|null, peakAmp:number|null, active:boolean}>} */
  let snapshots = [];

  // Segment recording
  let segActive = false;
  let segStartTs = 0;
  /** @type {number[]} */
  let segVolDb = [];
  /** @type {(number|null)[]} */
  let segHz = [];
  /** @type {number[]} */
  let segCentroid = []; // for "reverb-ish / brightness stability"
  let segActiveFrames = 0;
  let segTotalFrames = 0;

  // ----------------------------
  // Helpers: math / audio metrics
  // ----------------------------
  function clamp(n, a, b) {
    return Math.min(b, Math.max(a, n));
  }

  // Convert RMS (0..1) -> pseudo dB range (-60..0)
  function rmsToDb(rms) {
    // avoid log(0)
    const v = Math.max(rms, 1e-6);
    const db = 20 * Math.log10(v); // negative
    return clamp(db, -60, 0);
  }

  function computeRMS(buf) {
    let sum = 0;
    for (let i = 0; i < buf.length; i++) {
      const v = buf[i];
      sum += v * v;
    }
    return Math.sqrt(sum / buf.length);
  }

  // Autocorrelation pitch detection (simple ACF).
  // Returns frequency in Hz or null.
  function detectPitchACF(floatBuf, sampleRate) {
    // Remove DC offset
    let mean = 0;
    for (let i = 0; i < floatBuf.length; i++) mean += floatBuf[i];
    mean /= floatBuf.length;

    // Copy and window small part for speed
    const buf = floatBuf;
    const size = buf.length;

    // Quick silence check via RMS
    let rms = 0;
    for (let i = 0; i < size; i++) {
      const v = buf[i] - mean;
      rms += v * v;
    }
    rms = Math.sqrt(rms / size);
    if (rms < 0.01) return null;

    // Expected pitch range: ~70Hz to 1000Hz (voice/instruments)
    const minHz = 70;
    const maxHz = 1000;
    const minLag = Math.floor(sampleRate / maxHz);
    const maxLag = Math.floor(sampleRate / minHz);

    // Autocorrelation
    let bestLag = -1;
    let bestCorr = 0;

    for (let lag = minLag; lag <= maxLag; lag++) {
      let corr = 0;
      for (let i = 0; i < size - lag; i++) {
        corr += (buf[i] - mean) * (buf[i + lag] - mean);
      }
      if (corr > bestCorr) {
        bestCorr = corr;
        bestLag = lag;
      }
    }

    if (bestLag <= 0) return null;

    // crude confidence gate
    // normalize by size
    const norm = bestCorr / size;
    if (norm < 0.02) return null;

    return sampleRate / bestLag;
  }

  function hzToNoteName(hz) {
    if (!hz || !isFinite(hz) || hz <= 0) return "--";

    const A4 = 440;
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const semitonesFromA4 = Math.round(12 * Math.log2(hz / A4));
    const midi = 69 + semitonesFromA4; // A4 = 69
    const name = noteNames[(midi + 1200) % 12]; // safe mod
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  }

  function spectralCentroid(freqBins, sampleRate) {
    // freqBins: Uint8Array magnitude [0..255]
    let num = 0;
    let den = 0;
    const n = freqBins.length;
    // bin frequency: i * sampleRate/2 / n
    const factor = (sampleRate / 2) / n;
    for (let i = 0; i < n; i++) {
      const mag = freqBins[i];
      den += mag;
      num += mag * (i * factor);
    }
    if (den <= 0) return 0;
    return num / den;
  }

  function findPeak(freqBins, sampleRate) {
    let maxI = 0;
    let maxV = -1;
    for (let i = 0; i < freqBins.length; i++) {
      const v = freqBins[i];
      if (v > maxV) {
        maxV = v;
        maxI = i;
      }
    }
    if (maxV <= 0) return { peakHz: null, peakAmp: null };

    const hz = (maxI * (sampleRate / 2)) / freqBins.length;
    return { peakHz: hz, peakAmp: maxV };
  }

  function fmtTime(ts) {
    const d = new Date(ts);
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }

  // ----------------------------
  // UI rendering
  // ----------------------------
  function setVoiceActivity(active) {
    if (active) {
      voiceActivity.classList.remove("silent");
      voiceActivity.classList.add("active");
    } else {
      voiceActivity.classList.remove("active");
      voiceActivity.classList.add("silent");
    }
    lastActive = active;
  }

  function setVolumeUI(db) {
    // db: -60..0
    volumeValue.textContent = `${Math.round(db)} dB`;

    // map -60..0 -> 0..100
    const pct = clamp(((db + 60) / 60) * 100, 0, 100);
    volumeBar.style.width = `${pct}%`;
  }

  function setPitchUI(hz) {
    if (!hz) {
      pitchValue.textContent = `-- Hz`;
      noteValue.textContent = `--`;
      return;
    }
    pitchValue.textContent = `${Math.round(hz)} Hz`;
    noteValue.textContent = hzToNoteName(hz);
  }

  function resizeSpectrumCanvasToCSS() {
    // ensure canvas internal resolution matches CSS size for crisp lines
    const rect = spectrumCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(200, Math.floor(rect.width * dpr));
    const h = Math.max(120, Math.floor(rect.height * dpr));
    if (spectrumCanvas.width !== w || spectrumCanvas.height !== h) {
      spectrumCanvas.width = w;
      spectrumCanvas.height = h;
    }
  }

  function drawSpectrumBars(freqBins) {
    resizeSpectrumCanvasToCSS();

    const w = spectrumCanvas.width;
    const h = spectrumCanvas.height;

    // clear
    sctx.clearRect(0, 0, w, h);

    // background
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, w, h);

    // Determine bar count based on canvas width (mobile-friendly)
    const bars = w < 420 ? 20 : w < 700 ? 32 : 48;
    const step = Math.floor(freqBins.length / bars);

    const barW = w / bars;

    sctx.fillStyle = "#111827";

    for (let i = 0; i < bars; i++) {
      let max = 0;
      const start = i * step;
      const end = Math.min(freqBins.length, start + step);
      for (let j = start; j < end; j++) {
        if (freqBins[j] > max) max = freqBins[j];
      }
      const v = max / 255;
      const bh = v * (h - 10);
      const x = i * barW + barW * 0.18;
      const y = h - bh;
      const bw = barW * 0.64;

      // Rounded-ish bars (simple)
      sctx.fillRect(x, y, bw, bh);
    }

    // border
    sctx.strokeStyle = "#e5e7eb";
    sctx.lineWidth = Math.max(1, (window.devicePixelRatio || 1));
    sctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  function renderSnapshots() {
    snapshotCount.textContent = String(snapshots.length);
    snapshotItems.innerHTML = "";

    if (snapshots.length === 0) {
      const p = document.createElement("p");
      p.style.margin = "8px 0 0";
      p.style.color = "#6b7280";
      p.style.fontSize = "13px";
      p.textContent = MSG[currentLang].snapshotEmpty;
      snapshotItems.appendChild(p);
      return;
    }

    snapshots.forEach((s) => {
      const card = document.createElement("div");
      card.className = "snapshot-card";

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${fmtTime(s.ts)} • ${s.active ? MSG[currentLang].active : MSG[currentLang].silent}`;
      card.appendChild(meta);

      const vals = document.createElement("div");
      vals.className = "vals";

      const lines = [];
      lines.push(`Volume: ${Math.round(s.volDb)} dB`);
      lines.push(`Pitch: ${s.hz ? Math.round(s.hz) + " Hz (" + s.note + ")" : "--"}`);
      lines.push(
        `${MSG[currentLang].peak}: ${s.peakHz ? Math.round(s.peakHz) + " Hz" : "--"}`
      );

      vals.innerHTML = lines.map((t) => `<div>${escapeHtml(t)}</div>`).join("");
      card.appendChild(vals);

      const actions = document.createElement("div");
      actions.className = "actions";

      const del = document.createElement("button");
      del.className = "delete";
      del.type = "button";
      del.textContent = MSG[currentLang].delete;
      del.addEventListener("click", () => {
        snapshots = snapshots.filter((x) => x.id !== s.id);
        renderSnapshots();
      });

      actions.appendChild(del);
      card.appendChild(actions);

      snapshotItems.appendChild(card);
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  // ----------------------------
  // Segment results
  // ----------------------------
  function computeStabilityStars(hzSeries) {
    // Use stddev / mean as rough jitter measure
    const vals = hzSeries.filter((v) => typeof v === "number" && isFinite(v));
    if (vals.length < 5) return 1;

    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const varr =
      vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    const std = Math.sqrt(varr);

    const ratio = std / Math.max(mean, 1e-6); // relative jitter
    // Map ratio to stars (very rough)
    if (ratio < 0.01) return 5;
    if (ratio < 0.02) return 4;
    if (ratio < 0.04) return 3;
    if (ratio < 0.07) return 2;
    return 1;
  }

  function computeNoiseLevel(segVolDbArr, activeRate) {
    // A very rough noise heuristic:
    // - if many frames are "active" but volume is low => noisy environment or far mic
    // - if mostly silent and low volume => Low
    // We'll classify using mean loudness and active rate.
    const meanDb =
      segVolDbArr.reduce((a, b) => a + b, 0) / Math.max(1, segVolDbArr.length);

    // meanDb closer to 0 = louder
    // If meanDb is around -50 but activeRate high => noise likely
    if (meanDb > -28) return "High";
    if (meanDb > -38) return "Mid";
    // quiet region:
    if (activeRate > 0.35) return "Mid";
    return "Low";
  }

  function renderSegmentResult() {
    const durMs = Date.now() - segStartTs;
    const durSec = durMs / 1000;

    if (durSec < 1) {
      segmentResult.classList.remove("hidden");
      segmentResult.textContent = MSG[currentLang].segmentTooShort;
      return;
    }

    const meanVol =
      segVolDb.reduce((a, b) => a + b, 0) / Math.max(1, segVolDb.length);

    const hzVals = segHz.filter((v) => typeof v === "number" && isFinite(v));
    const meanHz =
      hzVals.length > 0 ? hzVals.reduce((a, b) => a + b, 0) / hzVals.length : null;

    const stars = computeStabilityStars(segHz);
    const starText = "★".repeat(stars) + "☆".repeat(5 - stars);

    const activeRate = segTotalFrames > 0 ? segActiveFrames / segTotalFrames : 0;
    const noise = computeNoiseLevel(segVolDb, activeRate);

    const noiseLabel =
      noise === "Low"
        ? MSG[currentLang].low
        : noise === "Mid"
        ? MSG[currentLang].mid
        : MSG[currentLang].high;

    // Build bilingual-ish display using current language labels
    const rows = [
      `<div><span class="muted">${escapeHtml(MSG[currentLang].segmentTitle)}</span></div>`,
      `<div>${escapeHtml(MSG[currentLang].duration)}: ${durSec.toFixed(1)}s</div>`,
      `<div>${escapeHtml(MSG[currentLang].avgLoudness)}: ${Math.round(meanVol)} dB</div>`,
      `<div>${escapeHtml(MSG[currentLang].avgPitch)}: ${
        meanHz ? Math.round(meanHz) + " Hz" : "--"
      }</div>`,
      `<div>${escapeHtml(MSG[currentLang].stability)}: ${starText}</div>`,
      `<div>${escapeHtml(MSG[currentLang].noiseLevel)}: ${noiseLabel}</div>`,
    ];

    segmentResult.innerHTML = rows.join("");
    segmentResult.classList.remove("hidden");
  }

  // ----------------------------
  // Main loop (realtime)
  // ----------------------------
  function tick() {
    if (!analyser || !audioCtx) return;

    analyser.getFloatTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    // RMS -> dB
    const rms = computeRMS(timeData);
    const db = rmsToDb(rms);
    setVolumeUI(db);

    const active = rms >= ACTIVITY_THRESHOLD;
    if (active !== lastActive) setVoiceActivity(active);

    // Pitch detection (only when active-ish)
    let hz = null;
    if (rms >= 0.015) {
      hz = detectPitchACF(timeData, audioCtx.sampleRate);
    }
    setPitchUI(hz);

    // Spectrum draw
    drawSpectrumBars(freqData);

    // Segment accumulation
    if (segActive) {
      segTotalFrames++;
      if (active) segActiveFrames++;
      segVolDb.push(db);
      segHz.push(hz);

      const c = spectralCentroid(freqData, audioCtx.sampleRate);
      segCentroid.push(c);
    }

    rafId = requestAnimationFrame(tick);
  }

  // ----------------------------
  // Start / Stop microphone
  // ----------------------------
  async function startMic() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(MSG[currentLang].unsupported);
      return;
    }

    // Create audio context on user gesture
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    try {
      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
    } catch (err) {
      // permission denied / etc
      const name = err && err.name ? err.name : "";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        alert(MSG[currentLang].micDenied);
      } else {
        alert(MSG[currentLang].micError);
      }
      try {
        audioCtx.close();
      } catch {}
      audioCtx = null;
      return;
    }

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.85;

    sourceNode = audioCtx.createMediaStreamSource(mediaStream);
    sourceNode.connect(analyser);

    timeData = new Float32Array(analyser.fftSize);
    freqData = new Uint8Array(analyser.frequencyBinCount);

    // initial UI
    setVoiceActivity(false);
    setVolumeUI(-60);
    setPitchUI(null);

    // enable buttons
    snapshotButton.disabled = false;
    segmentStart.disabled = false;
    resetButton.classList.remove("hidden");

    // start loop
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);

    // update button label (keep bilingual spans; add aria)
    micButton.disabled = true;
    micButton.setAttribute("aria-disabled", "true");
  }

  function stopMic() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;

    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
    }
    mediaStream = null;

    if (audioCtx) {
      try {
        audioCtx.close();
      } catch {}
    }
    audioCtx = null;
    analyser = null;
    sourceNode = null;

    setVoiceActivity(false);
    setVolumeUI(-60);
    setPitchUI(null);
  }

  // ----------------------------
  // Snapshots
  // ----------------------------
  function takeSnapshot() {
    if (!audioCtx || !analyser) return;

    // ensure up-to-date values
    analyser.getFloatTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    const rms = computeRMS(timeData);
    const db = rmsToDb(rms);
    const active = rms >= ACTIVITY_THRESHOLD;

    let hz = null;
    if (rms >= 0.015) hz = detectPitchACF(timeData, audioCtx.sampleRate);

    const note = hz ? hzToNoteName(hz) : "--";

    const { peakHz, peakAmp } = findPeak(freqData, audioCtx.sampleRate);

    const snap = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ts: Date.now(),
      volDb: db,
      hz,
      note,
      peakHz,
      peakAmp,
      active,
    };

    snapshots.push(snap);
    if (snapshots.length > SNAP_MAX) {
      snapshots = snapshots.slice(snapshots.length - SNAP_MAX);
    }
    renderSnapshots();
  }

  // ----------------------------
  // Segment control
  // ----------------------------
  function startSegment() {
    if (!audioCtx || !analyser) return;

    segActive = true;
    segStartTs = Date.now();
    segVolDb = [];
    segHz = [];
    segCentroid = [];
    segActiveFrames = 0;
    segTotalFrames = 0;

    segmentStart.disabled = true;
    segmentStop.disabled = false;
    segmentResult.classList.remove("hidden");
    segmentResult.textContent = MSG[currentLang].segmentRecording;
  }

  function stopSegment() {
    if (!segActive) return;

    segActive = false;
    segmentStart.disabled = false;
    segmentStop.disabled = true;

    renderSegmentResult();
  }

  // ----------------------------
  // Reset
  // ----------------------------
  function resetAll() {
    // stop segment if any
    if (segActive) {
      segActive = false;
    }

    // clear segment UI
    segmentResult.classList.add("hidden");
    segmentResult.innerHTML = "";
    segmentStart.disabled = false;
    segmentStop.disabled = true;

    // clear snapshots
    snapshots = [];
    renderSnapshots();

    // stop mic
    stopMic();

    // re-enable mic button
    micButton.disabled = false;
    micButton.removeAttribute("aria-disabled");

    // disable snapshot/segment until mic enabled
    snapshotButton.disabled = true;
    segmentStart.disabled = true;

    // hide reset
    resetButton.classList.add("hidden");
  }

  // ----------------------------
  // Events
  // ----------------------------
  micButton.addEventListener("click", async () => {
    try {
      await startMic();
    } catch (e) {
      alert(MSG[currentLang].micError);
      console.error(e);
    }
  });

  snapshotButton.addEventListener("click", takeSnapshot);

  clearSnapshotsBtn.addEventListener("click", () => {
    snapshots = [];
    renderSnapshots();
  });

  segmentStart.addEventListener("click", startSegment);
  segmentStop.addEventListener("click", stopSegment);

  resetButton.addEventListener("click", resetAll);

  // re-render snapshots when language changes (so Delete/Clear text updates)
  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.addEventListener("click", () => {
      // applyLang already ran; now re-render
      renderSnapshots();
      // if segment result is visible, regenerate labels
      if (!segmentResult.classList.contains("hidden") && !segActive && segVolDb.length > 0) {
        renderSegmentResult();
      }
      if (segActive) {
        segmentResult.textContent = MSG[currentLang].segmentRecording;
      }
    });
  });

  // init UI states
  snapshotButton.disabled = true;
  segmentStart.disabled = true;
  segmentStop.disabled = true;
  resetButton.classList.add("hidden");
  setVoiceActivity(false);
  renderSnapshots();

  // handle resize for canvas crispness
  window.addEventListener("resize", () => {
    if (analyser) {
      // redraw with current freqData if available
      try {
        analyser.getByteFrequencyData(freqData);
        drawSpectrumBars(freqData);
      } catch {}
    } else {
      // just resize canvas background
      resizeSpectrumCanvasToCSS();
      sctx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
    }
  });
})();
