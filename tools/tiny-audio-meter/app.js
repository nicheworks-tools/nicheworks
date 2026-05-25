(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;

  const micButton = $("micButton");
  const stopMicButton = $("stopMicButton");
  const micStatus = $("micStatus");
  const voiceActivity = $("voiceActivity");
  const volumeBar = $("volumeBar");
  const volumeValue = $("volumeValue");
  const pitchValue = $("pitchValue");
  const noteValue = $("noteValue");

  const spectrumCanvas = $("spectrumCanvas");
  const sctx = spectrumCanvas.getContext("2d");

  const snapshotButton = $("snapshotButton");
  const snapshotCount = $("snapshotCount");
  const snapshotItems = $("snapshotItems");
  const clearSnapshotsBtn = $("clearSnapshots");

  const segmentStart = $("segmentStart");
  const segmentStop = $("segmentStop");
  const segmentResult = $("segmentResult");
  const resetButton = $("resetButton");

  const LANG_KEY = "nw_lang";
  const FFT_SIZE = 2048;
  const ACTIVITY_THRESHOLD = 0.06;
  const SNAP_MAX = 20;

  const MSG = {
    ja: {
      starting: "マイクを起動しています…",
      micOn: "マイクは有効です。停止する場合は「マイクを停止」を押してください。",
      micOff: "マイクを停止しました。",
      unsupported: "このブラウザは音声入力に対応していない可能性があります。",
      micDenied: "マイク権限が拒否されました。ブラウザ設定からこのサイトのマイク許可を確認してください。",
      micError: "マイクの起動に失敗しました。別のアプリが使用中でないか、端末設定を確認してください。",
      snapshotEmpty: "スナップショットはまだありません。",
      clearArmed: "もう一度押すと、すべての数値スナップショットを削除します。",
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
      delete: "削除",
      peak: "ピーク",
      active: "active",
      silent: "silent",
      volume: "Volume",
      pitch: "Pitch"
    },
    en: {
      starting: "Starting microphone...",
      micOn: "Microphone is active. Press Stop Mic to turn it off.",
      micOff: "Microphone stopped.",
      unsupported: "Your browser may not support audio input features.",
      micDenied: "Microphone permission was denied. Check this site's microphone permission in browser settings.",
      micError: "Failed to start microphone. Check whether another app is using it or device settings block access.",
      snapshotEmpty: "No snapshots yet.",
      clearArmed: "Press again to delete all number snapshots.",
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
      delete: "Delete",
      peak: "Peak",
      active: "active",
      silent: "silent",
      volume: "Volume",
      pitch: "Pitch"
    }
  };

  let currentLang = detectInitialLang();

  let audioCtx = null;
  let analyser = null;
  let sourceNode = null;
  let mediaStream = null;
  let timeData = null;
  let freqData = null;
  let rafId = null;
  let lastActive = false;
  let starting = false;

  let snapshots = [];
  let clearArmed = false;
  let clearTimer = null;

  let segActive = false;
  let segStartTs = 0;
  let segVolDb = [];
  let segHz = [];
  let segActiveFrames = 0;
  let segTotalFrames = 0;
  let lastSegmentRows = [];

  function detectInitialLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "ja" || saved === "en") return saved;
    } catch {}
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    root.setAttribute("data-lang", currentLang);
    document.documentElement.lang = currentLang;

    try {
      localStorage.setItem(LANG_KEY, currentLang);
    } catch {}

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.style.display = el.dataset.i18n === currentLang ? "" : "none";
    });

    document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.langSwitch === currentLang);
    });

    renderSnapshots();

    if (segActive) {
      segmentResult.textContent = MSG[currentLang].segmentRecording;
    } else if (!segmentResult.classList.contains("hidden") && segVolDb.length) {
      renderSegmentResult();
    }
  }

  function clamp(n, min, max) {
    return Math.min(max, Math.max(min, n));
  }

  function rmsToDb(rms) {
    const value = Math.max(rms, 1e-6);
    return clamp(20 * Math.log10(value), -60, 0);
  }

  function computeRMS(buf) {
    let sum = 0;
    for (let i = 0; i < buf.length; i += 1) {
      sum += buf[i] * buf[i];
    }
    return Math.sqrt(sum / buf.length);
  }

  function detectPitchACF(floatBuf, sampleRate) {
    const size = floatBuf.length;
    const rms = computeRMS(floatBuf);
    if (rms < 0.008) return null;

    let r1 = 0;
    let r2 = size - 1;
    const threshold = 0.02;

    for (let i = 0; i < size / 2; i += 1) {
      if (Math.abs(floatBuf[i]) < threshold) {
        r1 = i;
        break;
      }
    }

    for (let i = 1; i < size / 2; i += 1) {
      if (Math.abs(floatBuf[size - i]) < threshold) {
        r2 = size - i;
        break;
      }
    }

    if (r2 - r1 < 256) {
      r1 = 0;
      r2 = size - 1;
    }

    const buf = floatBuf.slice(r1, r2);
    const n = buf.length;
    const correlations = new Array(n).fill(0);

    for (let lag = 0; lag < n; lag += 1) {
      let sum = 0;
      for (let i = 0; i < n - lag; i += 1) {
        sum += buf[i] * buf[i + lag];
      }
      correlations[lag] = sum;
    }

    let dip = 0;
    while (dip < n - 1 && correlations[dip] > correlations[dip + 1]) dip += 1;

    let maxValue = -1;
    let maxPos = -1;
    for (let i = dip; i < n; i += 1) {
      if (correlations[i] > maxValue) {
        maxValue = correlations[i];
        maxPos = i;
      }
    }
    if (maxPos <= 0) return null;

    const x1 = correlations[maxPos - 1] || 0;
    const x2 = correlations[maxPos] || 0;
    const x3 = correlations[maxPos + 1] || 0;
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;

    let period = maxPos;
    if (a !== 0) period = maxPos - b / (2 * a);

    const hz = sampleRate / period;
    if (!Number.isFinite(hz)) return null;
    if (hz < 60 || hz > 1200) return null;
    return hz;
  }

  function hzToNoteName(hz) {
    if (!hz || !Number.isFinite(hz) || hz <= 0) return "--";
    const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const semitonesFromA4 = Math.round(12 * Math.log2(hz / 440));
    const midi = 69 + semitonesFromA4;
    const name = noteNames[(midi + 1200) % 12];
    const octave = Math.floor(midi / 12) - 1;
    return `${name}${octave}`;
  }

  function findPeak(freqBins, sampleRate) {
    let maxIndex = 0;
    let maxValue = -1;
    for (let i = 0; i < freqBins.length; i += 1) {
      if (freqBins[i] > maxValue) {
        maxValue = freqBins[i];
        maxIndex = i;
      }
    }
    if (maxValue <= 0) return { peakHz: null, peakAmp: null };
    return {
      peakHz: (maxIndex * (sampleRate / 2)) / freqBins.length,
      peakAmp: maxValue
    };
  }

  function formatTime(ts) {
    const d = new Date(ts);
    return [d.getHours(), d.getMinutes(), d.getSeconds()]
      .map((v) => String(v).padStart(2, "0"))
      .join(":");
  }

  function isMicRunning() {
    return Boolean(audioCtx && analyser && mediaStream);
  }

  function setStatus(message, type = "info") {
    if (!micStatus) return;
    micStatus.textContent = message;
    micStatus.className = `mic-status ${type}`;
  }

  function clearStatus() {
    if (!micStatus) return;
    micStatus.textContent = "";
    micStatus.className = "mic-status hidden";
  }

  function setVoiceActivity(active) {
    voiceActivity.classList.toggle("active", active);
    voiceActivity.classList.toggle("silent", !active);
    lastActive = active;
  }

  function setVolumeUI(db) {
    volumeValue.textContent = `${Math.round(db)} dB`;
    volumeBar.style.width = `${clamp(((db + 60) / 60) * 100, 0, 100)}%`;
  }

  function setPitchUI(hz) {
    pitchValue.textContent = hz ? `${Math.round(hz)} Hz` : "-- Hz";
    noteValue.textContent = hz ? hzToNoteName(hz) : "--";
  }

  function resizeSpectrumCanvasToCSS() {
    const rect = spectrumCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(200, Math.floor(rect.width * dpr));
    const h = Math.max(120, Math.floor(rect.height * dpr));
    if (spectrumCanvas.width !== w || spectrumCanvas.height !== h) {
      spectrumCanvas.width = w;
      spectrumCanvas.height = h;
    }
  }

  function resetMeterUI() {
    setVoiceActivity(false);
    setVolumeUI(-60);
    setPitchUI(null);
    resizeSpectrumCanvasToCSS();
    sctx.clearRect(0, 0, spectrumCanvas.width, spectrumCanvas.height);
  }

  function drawSpectrumBars(freqBins) {
    resizeSpectrumCanvasToCSS();

    const w = spectrumCanvas.width;
    const h = spectrumCanvas.height;

    sctx.clearRect(0, 0, w, h);
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, w, h);

    const bars = w < 420 ? 20 : w < 700 ? 32 : 48;
    const step = Math.max(1, Math.floor(freqBins.length / bars));
    const barW = w / bars;

    sctx.fillStyle = "#111827";

    for (let i = 0; i < bars; i += 1) {
      let max = 0;
      const start = i * step;
      const end = Math.min(freqBins.length, start + step);
      for (let j = start; j < end; j += 1) {
        max = Math.max(max, freqBins[j]);
      }

      const value = max / 255;
      const barHeight = value * (h - 10);
      sctx.fillRect(i * barW + barW * 0.18, h - barHeight, barW * 0.64, barHeight);
    }

    sctx.strokeStyle = "#e5e7eb";
    sctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
    sctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  function updateControls() {
    const running = isMicRunning();

    micButton.disabled = running || starting;
    micButton.classList.toggle("hidden", running);
    micButton.classList.toggle("is-pending", starting);
    micButton.setAttribute("aria-disabled", String(running || starting));

    stopMicButton.disabled = !running;
    stopMicButton.classList.toggle("hidden", !running);
    stopMicButton.setAttribute("aria-disabled", String(!running));

    snapshotButton.disabled = !running;
    clearSnapshotsBtn.disabled = snapshots.length === 0;

    segmentStart.disabled = !running || segActive;
    segmentStop.disabled = !segActive;

    resetButton.classList.toggle(
      "hidden",
      snapshots.length === 0 && segmentResult.classList.contains("hidden") && !running
    );
  }

  function renderSnapshots() {
    snapshotCount.textContent = String(snapshots.length);
    snapshotItems.replaceChildren();

    if (snapshots.length === 0) {
      const p = document.createElement("p");
      p.className = "empty-note";
      p.textContent = MSG[currentLang].snapshotEmpty;
      snapshotItems.appendChild(p);
      updateControls();
      return;
    }

    snapshots.forEach((snapshot) => {
      const card = document.createElement("div");
      card.className = "snapshot-card";

      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = `${formatTime(snapshot.ts)} • ${
        snapshot.active ? MSG[currentLang].active : MSG[currentLang].silent
      }`;
      card.appendChild(meta);

      const vals = document.createElement("div");
      vals.className = "vals";

      [
        `${MSG[currentLang].volume}: ${Math.round(snapshot.volDb)} dB`,
        `${MSG[currentLang].pitch}: ${
          snapshot.hz ? `${Math.round(snapshot.hz)} Hz (${snapshot.note})` : "--"
        }`,
        `${MSG[currentLang].peak}: ${
          snapshot.peakHz ? `${Math.round(snapshot.peakHz)} Hz` : "--"
        }`
      ].forEach((line) => {
        const div = document.createElement("div");
        div.textContent = line;
        vals.appendChild(div);
      });

      card.appendChild(vals);

      const actions = document.createElement("div");
      actions.className = "actions";

      const del = document.createElement("button");
      del.className = "delete";
      del.type = "button";
      del.textContent = MSG[currentLang].delete;
      del.addEventListener("click", () => {
        snapshots = snapshots.filter((item) => item.id !== snapshot.id);
        renderSnapshots();
      });

      actions.appendChild(del);
      card.appendChild(actions);
      snapshotItems.appendChild(card);
    });

    updateControls();
  }

  function computeStabilityStars(hzSeries) {
    const vals = hzSeries.filter((v) => typeof v === "number" && Number.isFinite(v));
    if (vals.length < 5) return 1;

    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const variance = vals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / vals.length;
    const std = Math.sqrt(variance);
    const ratio = std / Math.max(mean, 1e-6);

    if (ratio < 0.01) return 5;
    if (ratio < 0.02) return 4;
    if (ratio < 0.04) return 3;
    if (ratio < 0.07) return 2;
    return 1;
  }

  function computeNoiseLabel(volDbSeries, activeRate) {
    const meanDb = volDbSeries.reduce((a, b) => a + b, 0) / Math.max(1, volDbSeries.length);
    if (meanDb > -28) return MSG[currentLang].high;
    if (meanDb > -38 || activeRate > 0.35) return MSG[currentLang].mid;
    return MSG[currentLang].low;
  }

  function appendResultRow(parent, label, value, muted = false) {
    const row = document.createElement("div");
    if (muted) {
      const span = document.createElement("span");
      span.className = "muted";
      span.textContent = label;
      row.appendChild(span);
    } else {
      row.textContent = `${label}: ${value}`;
    }
    parent.appendChild(row);
  }

  function renderSegmentResult() {
    const durationSec = (Date.now() - segStartTs) / 1000;
    segmentResult.replaceChildren();
    segmentResult.classList.remove("hidden");

    if (durationSec < 1) {
      segmentResult.textContent = MSG[currentLang].segmentTooShort;
      lastSegmentRows = [];
      updateControls();
      return;
    }

    const meanVol = segVolDb.reduce((a, b) => a + b, 0) / Math.max(1, segVolDb.length);
    const hzVals = segHz.filter((v) => typeof v === "number" && Number.isFinite(v));
    const meanHz = hzVals.length ? hzVals.reduce((a, b) => a + b, 0) / hzVals.length : null;
    const stars = computeStabilityStars(segHz);
    const activeRate = segTotalFrames > 0 ? segActiveFrames / segTotalFrames : 0;
    const noise = computeNoiseLabel(segVolDb, activeRate);

    lastSegmentRows = [
      [MSG[currentLang].duration, `${durationSec.toFixed(1)}s`],
      [MSG[currentLang].avgLoudness, `${Math.round(meanVol)} dB`],
      [MSG[currentLang].avgPitch, meanHz ? `${Math.round(meanHz)} Hz` : "--"],
      [MSG[currentLang].stability, `${"★".repeat(stars)}${"☆".repeat(5 - stars)}`],
      [MSG[currentLang].noiseLevel, noise]
    ];

    appendResultRow(segmentResult, MSG[currentLang].segmentTitle, "", true);
    lastSegmentRows.forEach(([label, value]) => appendResultRow(segmentResult, label, value));

    updateControls();
  }

  function tick() {
    if (!analyser || !audioCtx || !timeData || !freqData) return;

    analyser.getFloatTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    const rms = computeRMS(timeData);
    const db = rmsToDb(rms);
    const active = rms >= ACTIVITY_THRESHOLD;
    const hz = rms >= 0.01 ? detectPitchACF(timeData, audioCtx.sampleRate) : null;

    setVolumeUI(db);
    if (active !== lastActive) setVoiceActivity(active);
    setPitchUI(hz);
    drawSpectrumBars(freqData);

    if (segActive) {
      segTotalFrames += 1;
      if (active) segActiveFrames += 1;
      segVolDb.push(db);
      segHz.push(hz);
    }

    rafId = requestAnimationFrame(tick);
  }

  function cleanupAudio() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;

    if (sourceNode) {
      try {
        sourceNode.disconnect();
      } catch {}
    }
    sourceNode = null;

    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch {}
      });
    }
    mediaStream = null;

    if (audioCtx) {
      const ctx = audioCtx;
      try {
        if (ctx.state !== "closed") {
          ctx.close().catch(() => {});
        }
      } catch {}
    }

    audioCtx = null;
    analyser = null;
    timeData = null;
    freqData = null;
  }

  async function startMic() {
    if (starting || isMicRunning()) return;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus(MSG[currentLang].unsupported, "error");
      updateControls();
      return;
    }

    const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextCtor) {
      setStatus(MSG[currentLang].unsupported, "error");
      updateControls();
      return;
    }

    starting = true;
    setStatus(MSG[currentLang].starting, "info");
    updateControls();

    try {
      audioCtx = new AudioContextCtor();

      mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: false
      });

      analyser = audioCtx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.85;

      sourceNode = audioCtx.createMediaStreamSource(mediaStream);
      sourceNode.connect(analyser);

      timeData = new Float32Array(analyser.fftSize);
      freqData = new Uint8Array(analyser.frequencyBinCount);

      resetMeterUI();

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(tick);

      setStatus(MSG[currentLang].micOn, "ok");
    } catch (err) {
      const name = err && err.name ? err.name : "";
      setStatus(
        name === "NotAllowedError" || name === "PermissionDeniedError"
          ? MSG[currentLang].micDenied
          : MSG[currentLang].micError,
        "error"
      );
      cleanupAudio();
      resetMeterUI();
    } finally {
      starting = false;
      updateControls();
    }
  }

  function stopMic(options = {}) {
    cleanupAudio();

    if (segActive) {
      segActive = false;
      segmentStop.disabled = true;
      segmentStart.disabled = true;
    }

    resetMeterUI();

    if (options.showMessage !== false) {
      setStatus(MSG[currentLang].micOff, "info");
    }

    updateControls();
  }

  function takeSnapshot() {
    if (!isMicRunning()) return;

    analyser.getFloatTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);

    const rms = computeRMS(timeData);
    const volDb = rmsToDb(rms);
    const active = rms >= ACTIVITY_THRESHOLD;
    const hz = rms >= 0.01 ? detectPitchACF(timeData, audioCtx.sampleRate) : null;
    const note = hz ? hzToNoteName(hz) : "--";
    const { peakHz, peakAmp } = findPeak(freqData, audioCtx.sampleRate);

    snapshots.push({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      ts: Date.now(),
      volDb,
      hz,
      note,
      peakHz,
      peakAmp,
      active
    });

    if (snapshots.length > SNAP_MAX) {
      snapshots = snapshots.slice(snapshots.length - SNAP_MAX);
    }

    clearArmed = false;
    renderSnapshots();
  }

  function clearSnapshots() {
    if (snapshots.length === 0) return;

    if (!clearArmed) {
      clearArmed = true;
      setStatus(MSG[currentLang].clearArmed, "info");
      clearTimeout(clearTimer);
      clearTimer = setTimeout(() => {
        clearArmed = false;
      }, 3500);
      return;
    }

    clearArmed = false;
    clearTimeout(clearTimer);
    snapshots = [];
    renderSnapshots();
    setStatus(MSG[currentLang].cleared, "info");
  }

  function startSegment() {
    if (!isMicRunning()) return;

    segActive = true;
    segStartTs = Date.now();
    segVolDb = [];
    segHz = [];
    segActiveFrames = 0;
    segTotalFrames = 0;
    lastSegmentRows = [];

    segmentResult.classList.remove("hidden");
    segmentResult.textContent = MSG[currentLang].segmentRecording;

    updateControls();
  }

  function stopSegment() {
    if (!segActive) return;

    segActive = false;
    renderSegmentResult();
  }

  function resetRecords() {
    segActive = false;
    segStartTs = 0;
    segVolDb = [];
    segHz = [];
    segActiveFrames = 0;
    segTotalFrames = 0;
    lastSegmentRows = [];

    segmentResult.classList.add("hidden");
    segmentResult.replaceChildren();

    snapshots = [];
    clearArmed = false;
    renderSnapshots();
    clearStatus();
    resetMeterUI();

    updateControls();
  }

  micButton.addEventListener("click", startMic);
  stopMicButton.addEventListener("click", () => stopMic());
  snapshotButton.addEventListener("click", takeSnapshot);
  clearSnapshotsBtn.addEventListener("click", clearSnapshots);
  segmentStart.addEventListener("click", startSegment);
  segmentStop.addEventListener("click", stopSegment);
  resetButton.addEventListener("click", resetRecords);

  document.querySelectorAll("[data-lang-switch]").forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.langSwitch));
  });

  window.addEventListener("resize", () => {
    if (analyser && freqData) {
      try {
        analyser.getByteFrequencyData(freqData);
        drawSpectrumBars(freqData);
      } catch {}
    } else {
      resetMeterUI();
    }
  });

  window.addEventListener("pagehide", () => stopMic({ showMessage: false }));
  window.addEventListener("beforeunload", () => stopMic({ showMessage: false }));

  snapshotButton.disabled = true;
  clearSnapshotsBtn.disabled = true;
  segmentStart.disabled = true;
  segmentStop.disabled = true;
  resetButton.classList.add("hidden");

  resetMeterUI();
  renderSnapshots();
  applyLang(currentLang);
  updateControls();
})();
