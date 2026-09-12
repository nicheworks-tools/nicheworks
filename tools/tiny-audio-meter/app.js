(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const root = document.documentElement;
  const LANG_KEY = "nw_lang";
  const FFT_SIZE = 2048;
  const SNAP_MAX = 20;
  const PITCH_MIN_HZ = 60;
  const PITCH_MAX_HZ = 1200;
  const PITCH_INTERVAL_MS = 100;
  const PITCH_CONFIDENCE_MIN = 0.55;
  const ACTIVITY_RMS = 0.018;

  const els = {
    micButton: $("micButton"), stopMicButton: $("stopMicButton"), micStatus: $("micStatus"), micStateBadge: $("micStateBadge"),
    deviceRow: $("deviceRow"), deviceSelect: $("deviceSelect"), processingStatus: $("processingStatus"),
    echoChip: $("echoChip"), noiseChip: $("noiseChip"), gainChip: $("gainChip"),
    voiceActivity: $("voiceActivity"), volumeBar: $("volumeBar"), volumeValue: $("volumeValue"),
    pitchValue: $("pitchValue"), noteValue: $("noteValue"), confidenceValue: $("confidenceValue"),
    spectrumCanvas: $("spectrumCanvas"),
    snapshotButton: $("snapshotButton"), snapshotCount: $("snapshotCount"), snapshotItems: $("snapshotItems"), clearSnapshots: $("clearSnapshots"),
    segmentStart: $("segmentStart"), segmentStop: $("segmentStop"), segmentResult: $("segmentResult"), resetButton: $("resetButton"),
    affiliateSection: $("audioAffiliateSection"), soundAffiliate: $("soundLevelAffiliate"), usbAffiliate: $("usbMicAffiliate"), disclosure: $("amazonDisclosure")
  };

  const sctx = els.spectrumCanvas.getContext("2d");

  const MSG = {
    ja: {
      starting: "マイクを起動しています…",
      micOn: "マイク入力をブラウザ内で解析しています。",
      micOff: "マイクを停止しました。",
      unsupported: "このブラウザではマイク入力を利用できません。",
      denied: "マイク権限が拒否されました。ブラウザ設定でこのサイトのマイク許可を確認してください。",
      error: "マイクを開始できませんでした。別アプリの使用状況や端末設定を確認してください。",
      switching: "入力マイクを切り替えています…",
      waiting: "入力待機",
      active: "音を検出",
      noSnapshots: "記録はまだありません。",
      delete: "削除",
      segmentRecording: "区間を記録中…",
      segmentTooShort: "区間が短すぎます。1秒以上計測してください。",
      segmentTitle: "区間分析結果",
      duration: "区間長",
      avgLevel: "平均相対音量",
      avgPitch: "平均pitch",
      stability: "Pitch安定度",
      noPitch: "有効なpitchなし",
      soundLevelAmazon: "Amazonで騒音計を探す",
      usbMicAmazon: "AmazonでUSBマイクを探す"
    },
    en: {
      starting: "Starting microphone…",
      micOn: "Microphone input is being analyzed locally in your browser.",
      micOff: "Microphone stopped.",
      unsupported: "Microphone input is not available in this browser.",
      denied: "Microphone permission was denied. Check this site's microphone permission in browser settings.",
      error: "Could not start the microphone. Check device settings or whether another app is using it.",
      switching: "Switching input microphone…",
      waiting: "Waiting for input",
      active: "Sound detected",
      noSnapshots: "No snapshots yet.",
      delete: "Delete",
      segmentRecording: "Recording segment…",
      segmentTooShort: "Segment is too short. Measure for at least 1 second.",
      segmentTitle: "Segment result",
      duration: "Duration",
      avgLevel: "Average relative level",
      avgPitch: "Average pitch",
      stability: "Pitch stability",
      noPitch: "No valid pitch",
      soundLevelAmazon: "Find sound level meters on Amazon",
      usbMicAmazon: "Find USB microphones on Amazon"
    }
  };

  let currentLang = detectInitialLang();
  let audioCtx = null;
  let analyser = null;
  let mediaStream = null;
  let timeData = null;
  let freqData = null;
  let rafId = null;
  let starting = false;
  let lastPitchAt = 0;
  let selectedDeviceId = "";
  let snapshots = [];
  let lastSegment = null;

  let current = {
    db: -60,
    rms: 0,
    hz: null,
    note: null,
    confidence: 0,
    active: false
  };

  let segment = createSegmentState();

  function detectInitialLang() {
    try {
      const saved = localStorage.getItem(LANG_KEY);
      if (saved === "ja" || saved === "en") return saved;
    } catch (_) {}
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function m(key) { return MSG[currentLang][key] || MSG.ja[key] || key; }

  function applyLang(lang) {
    currentLang = lang === "en" ? "en" : "ja";
    root.lang = currentLang;
    root.dataset.lang = currentLang;
    try { localStorage.setItem(LANG_KEY, currentLang); } catch (_) {}
    document.querySelectorAll("[data-i18n]").forEach((node) => {
      node.style.display = node.dataset.i18n === currentLang ? "" : "none";
    });
    document.querySelectorAll("[data-lang-switch]").forEach((button) => {
      button.classList.toggle("active", button.dataset.langSwitch === currentLang);
    });
    setActivity(current.active);
    renderSnapshots();
    if (segment.active) renderSegmentRecording();
    else if (lastSegment) renderSegmentSummary(lastSegment);
    mountAffiliate();
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }

  function computeRms(buffer) {
    let sum = 0;
    for (let i = 0; i < buffer.length; i += 1) sum += buffer[i] * buffer[i];
    return Math.sqrt(sum / buffer.length);
  }

  function rmsToDb(rms) {
    return clamp(20 * Math.log10(Math.max(rms, 1e-6)), -60, 0);
  }

  function hzToNoteName(hz) {
    if (!Number.isFinite(hz) || hz <= 0) return null;
    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const midi = 69 + Math.round(12 * Math.log2(hz / 440));
    return `${names[(midi + 1200) % 12]}${Math.floor(midi / 12) - 1}`;
  }

  function detectPitch(buffer, sampleRate) {
    const rms = computeRms(buffer);
    if (rms < 0.008) return { hz: null, confidence: 0 };

    const minLag = Math.max(2, Math.floor(sampleRate / PITCH_MAX_HZ));
    const maxLag = Math.min(buffer.length - 2, Math.ceil(sampleRate / PITCH_MIN_HZ));
    const correlations = new Float32Array(maxLag + 2);
    let bestLag = -1;
    let bestCorrelation = -1;

    for (let lag = minLag; lag <= maxLag; lag += 1) {
      let cross = 0;
      let energyA = 0;
      let energyB = 0;
      const limit = buffer.length - lag;
      for (let i = 0; i < limit; i += 1) {
        const a = buffer[i];
        const b = buffer[i + lag];
        cross += a * b;
        energyA += a * a;
        energyB += b * b;
      }
      const denom = Math.sqrt(energyA * energyB) || 1;
      const corr = cross / denom;
      correlations[lag] = corr;
      if (corr > bestCorrelation) {
        bestCorrelation = corr;
        bestLag = lag;
      }
    }

    const confidence = clamp(bestCorrelation, 0, 1);
    if (bestLag < 0 || confidence < PITCH_CONFIDENCE_MIN) return { hz: null, confidence };

    const left = correlations[bestLag - 1] || bestCorrelation;
    const center = correlations[bestLag] || bestCorrelation;
    const right = correlations[bestLag + 1] || bestCorrelation;
    const denom = left - 2 * center + right;
    const offset = denom !== 0 ? 0.5 * (left - right) / denom : 0;
    const refinedLag = bestLag + clamp(offset, -1, 1);
    const hz = sampleRate / refinedLag;
    if (!Number.isFinite(hz) || hz < PITCH_MIN_HZ || hz > PITCH_MAX_HZ) return { hz: null, confidence };
    return { hz, confidence };
  }

  function buildAudioConstraints(deviceId = "") {
    const audio = {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      channelCount: 1
    };
    if (deviceId) audio.deviceId = { exact: deviceId };
    return { audio };
  }

  function isMicRunning() {
    return Boolean(audioCtx && analyser && mediaStream && mediaStream.getAudioTracks().some((track) => track.readyState === "live"));
  }

  function setStatus(text, type = "info") {
    els.micStatus.textContent = text;
    els.micStatus.className = `mic-status ${type}`;
    els.micStatus.hidden = !text;
  }

  function setMicBadge(mode) {
    els.micStateBadge.classList.remove("off", "on", "pending");
    els.micStateBadge.classList.add(mode);
    const ja = els.micStateBadge.querySelector('[data-i18n="ja"]');
    const en = els.micStateBadge.querySelector('[data-i18n="en"]');
    if (mode === "on") { ja.textContent = "マイク動作中"; en.textContent = "Mic active"; }
    else if (mode === "pending") { ja.textContent = "起動中"; en.textContent = "Starting"; }
    else { ja.textContent = "マイク停止中"; en.textContent = "Mic off"; }
    ja.style.display = currentLang === "ja" ? "" : "none";
    en.style.display = currentLang === "en" ? "" : "none";
  }

  function setActivity(active) {
    current.active = Boolean(active);
    els.voiceActivity.classList.toggle("active", current.active);
    els.voiceActivity.classList.toggle("silent", !current.active);
    const ja = els.voiceActivity.querySelector('[data-i18n="ja"]');
    const en = els.voiceActivity.querySelector('[data-i18n="en"]');
    ja.textContent = current.active ? MSG.ja.active : MSG.ja.waiting;
    en.textContent = current.active ? MSG.en.active : MSG.en.waiting;
    ja.style.display = currentLang === "ja" ? "" : "none";
    en.style.display = currentLang === "en" ? "" : "none";
  }

  function setProcessChip(element, label, value) {
    element.classList.remove("on", "off");
    let rendered = "?";
    if (value === false) { rendered = "OFF"; element.classList.add("off"); }
    if (value === true) { rendered = "ON"; element.classList.add("on"); }
    element.textContent = `${label} ${rendered}`;
  }

  function renderProcessingSettings(track) {
    const settings = typeof track?.getSettings === "function" ? track.getSettings() : {};
    setProcessChip(els.echoChip, "EC", settings.echoCancellation);
    setProcessChip(els.noiseChip, "NS", settings.noiseSuppression);
    setProcessChip(els.gainChip, "AGC", settings.autoGainControl);
    els.processingStatus.hidden = false;
  }

  function updateControls() {
    const running = isMicRunning();
    els.micButton.disabled = starting || running;
    els.micButton.hidden = running;
    els.stopMicButton.disabled = !running;
    els.stopMicButton.hidden = !running;
    els.snapshotButton.disabled = !running;
    els.segmentStart.disabled = !running || segment.active;
    els.segmentStop.disabled = !segment.active;
    els.clearSnapshots.disabled = snapshots.length === 0;
    els.resetButton.hidden = snapshots.length === 0 && !lastSegment;
  }

  async function enumerateInputs() {
    if (!navigator.mediaDevices?.enumerateDevices) return;
    try {
      const devices = (await navigator.mediaDevices.enumerateDevices()).filter((device) => device.kind === "audioinput");
      const currentValue = selectedDeviceId || mediaStream?.getAudioTracks?.()[0]?.getSettings?.().deviceId || "";
      els.deviceSelect.replaceChildren();
      devices.forEach((device, index) => {
        const option = document.createElement("option");
        option.value = device.deviceId;
        option.textContent = device.label || `${currentLang === "ja" ? "マイク" : "Microphone"} ${index + 1}`;
        els.deviceSelect.appendChild(option);
      });
      if (devices.some((device) => device.deviceId === currentValue)) els.deviceSelect.value = currentValue;
      selectedDeviceId = els.deviceSelect.value || currentValue || "";
      els.deviceRow.hidden = devices.length < 2;
    } catch (_) {
      els.deviceRow.hidden = true;
    }
  }

  function resetLiveUI() {
    current = { db: -60, rms: 0, hz: null, note: null, confidence: 0, active: false };
    els.volumeValue.textContent = "-- dB";
    els.volumeBar.style.width = "0%";
    els.pitchValue.textContent = "-- Hz";
    els.noteValue.textContent = "--";
    els.confidenceValue.textContent = "--%";
    setActivity(false);
    resizeSpectrum();
    sctx.clearRect(0, 0, els.spectrumCanvas.width, els.spectrumCanvas.height);
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, els.spectrumCanvas.width, els.spectrumCanvas.height);
  }

  function resizeSpectrum() {
    const rect = els.spectrumCanvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.max(320, Math.floor(rect.width * dpr));
    const height = Math.max(140, Math.floor(rect.height * dpr));
    if (els.spectrumCanvas.width !== width || els.spectrumCanvas.height !== height) {
      els.spectrumCanvas.width = width;
      els.spectrumCanvas.height = height;
    }
  }

  function drawSpectrum() {
    resizeSpectrum();
    const width = els.spectrumCanvas.width;
    const height = els.spectrumCanvas.height;
    sctx.clearRect(0, 0, width, height);
    sctx.fillStyle = "#ffffff";
    sctx.fillRect(0, 0, width, height);

    const sampleRate = audioCtx?.sampleRate || 48000;
    const nyquist = sampleRate / 2;
    const maxHz = Math.min(12000, nyquist);
    const maxBin = Math.max(1, Math.floor((maxHz / nyquist) * freqData.length));
    const bars = width < 500 ? 28 : 48;
    const binsPerBar = Math.max(1, Math.floor(maxBin / bars));
    const barWidth = width / bars;
    sctx.fillStyle = "#111827";

    for (let bar = 0; bar < bars; bar += 1) {
      const start = bar * binsPerBar;
      const end = Math.min(maxBin, start + binsPerBar);
      let peak = 0;
      for (let i = start; i < end; i += 1) peak = Math.max(peak, freqData[i]);
      const h = (peak / 255) * (height - 12);
      sctx.fillRect(bar * barWidth + barWidth * 0.16, height - h, barWidth * 0.68, h);
    }

    sctx.strokeStyle = "#e5e7eb";
    sctx.lineWidth = Math.max(1, window.devicePixelRatio || 1);
    sctx.strokeRect(0.5, 0.5, width - 1, height - 1);
  }

  function updatePitch(now) {
    if (!audioCtx || now - lastPitchAt < PITCH_INTERVAL_MS) return;
    lastPitchAt = now;
    const result = detectPitch(timeData, audioCtx.sampleRate);
    current.confidence = result.confidence;
    els.confidenceValue.textContent = result.confidence > 0 ? `${Math.round(result.confidence * 100)}%` : "--%";

    if (result.hz) {
      current.hz = result.hz;
      current.note = hzToNoteName(result.hz);
      els.pitchValue.textContent = `${result.hz.toFixed(1)} Hz`;
      els.noteValue.textContent = current.note || "--";
      addSegmentPitch(result.hz, result.confidence);
    } else {
      current.hz = null;
      current.note = null;
      els.pitchValue.textContent = "-- Hz";
      els.noteValue.textContent = "--";
    }
  }

  function frame(now) {
    if (!isMicRunning()) return;
    analyser.getFloatTimeDomainData(timeData);
    analyser.getByteFrequencyData(freqData);
    current.rms = computeRms(timeData);
    current.db = rmsToDb(current.rms);
    els.volumeValue.textContent = `${current.db.toFixed(1)} dB`;
    els.volumeBar.style.width = `${clamp(((current.db + 60) / 60) * 100, 0, 100)}%`;
    setActivity(current.rms >= ACTIVITY_RMS);
    updatePitch(now);
    drawSpectrum();
    addSegmentLevel(current.db);
    rafId = requestAnimationFrame(frame);
  }

  async function startMic(deviceId = "", options = {}) {
    if (starting) return;
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus(m("unsupported"), "error");
      return;
    }

    starting = true;
    setMicBadge("pending");
    setStatus(options.switching ? m("switching") : m("starting"));
    updateControls();

    try {
      cleanupAudio();
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) throw new Error("AudioContext unavailable");
      mediaStream = await navigator.mediaDevices.getUserMedia(buildAudioConstraints(deviceId));
      selectedDeviceId = mediaStream.getAudioTracks()[0]?.getSettings?.().deviceId || deviceId || "";
      audioCtx = new AudioContextCtor();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.smoothingTimeConstant = 0.72;
      const source = audioCtx.createMediaStreamSource(mediaStream);
      source.connect(analyser);
      timeData = new Float32Array(analyser.fftSize);
      freqData = new Uint8Array(analyser.frequencyBinCount);
      lastPitchAt = 0;
      mediaStream.getAudioTracks().forEach((track) => track.addEventListener("ended", () => {
        if (isMicRunning()) stopMic({ silent: true });
      }, { once: true }));
      renderProcessingSettings(mediaStream.getAudioTracks()[0]);
      await enumerateInputs();
      setStatus(m("micOn"), "success");
      setMicBadge("on");
      rafId = requestAnimationFrame(frame);
    } catch (error) {
      cleanupAudio();
      const denied = error?.name === "NotAllowedError" || error?.name === "SecurityError";
      setStatus(denied ? m("denied") : m("error"), "error");
      setMicBadge("off");
    } finally {
      starting = false;
      updateControls();
    }
  }

  function cleanupAudio() {
    if (rafId != null) cancelAnimationFrame(rafId);
    rafId = null;
    if (mediaStream) mediaStream.getTracks().forEach((track) => track.stop());
    mediaStream = null;
    analyser = null;
    timeData = null;
    freqData = null;
    if (audioCtx && audioCtx.state !== "closed") audioCtx.close().catch(() => {});
    audioCtx = null;
  }

  function stopMic(options = {}) {
    if (segment.active) finishSegment(true);
    cleanupAudio();
    resetLiveUI();
    els.processingStatus.hidden = true;
    setMicBadge("off");
    if (!options.silent) setStatus(m("micOff"));
    updateControls();
  }

  function formatTime(ts) {
    const date = new Date(ts);
    return [date.getHours(), date.getMinutes(), date.getSeconds()].map((part) => String(part).padStart(2, "0")).join(":");
  }

  function captureSnapshot() {
    if (!isMicRunning()) return;
    snapshots.unshift({
      ts: Date.now(),
      db: current.db,
      hz: current.hz,
      note: current.note,
      confidence: current.confidence
    });
    if (snapshots.length > SNAP_MAX) snapshots.length = SNAP_MAX;
    renderSnapshots();
  }

  function renderSnapshots() {
    els.snapshotCount.textContent = String(snapshots.length);
    els.snapshotItems.replaceChildren();
    if (!snapshots.length) {
      const empty = document.createElement("p");
      empty.className = "empty-note";
      empty.textContent = m("noSnapshots");
      els.snapshotItems.appendChild(empty);
      updateControls();
      return;
    }

    snapshots.forEach((snapshot, index) => {
      const card = document.createElement("div");
      card.className = "snapshot-card";
      const meta = document.createElement("div");
      meta.className = "meta";
      meta.textContent = formatTime(snapshot.ts);
      const values = document.createElement("div");
      values.className = "values";
      const pitch = snapshot.hz ? `${snapshot.hz.toFixed(1)} Hz / ${snapshot.note || "--"} / ${Math.round(snapshot.confidence * 100)}%` : `-- Hz / -- / ${Math.round(snapshot.confidence * 100)}%`;
      values.textContent = `${snapshot.db.toFixed(1)} dB · ${pitch}`;
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "link-btn";
      remove.textContent = m("delete");
      remove.addEventListener("click", () => {
        snapshots.splice(index, 1);
        renderSnapshots();
      });
      card.append(meta, values, remove);
      els.snapshotItems.appendChild(card);
    });
    updateControls();
  }

  function clearSnapshots() {
    snapshots = [];
    renderSnapshots();
  }

  function createSegmentState() {
    return {
      active: false,
      start: 0,
      dbSum: 0,
      dbCount: 0,
      pitchCount: 0,
      pitchMean: 0,
      pitchM2: 0,
      confidenceSum: 0
    };
  }

  function addSegmentLevel(db) {
    if (!segment.active || !Number.isFinite(db)) return;
    segment.dbSum += db;
    segment.dbCount += 1;
  }

  function addSegmentPitch(hz, confidence) {
    if (!segment.active || !Number.isFinite(hz)) return;
    segment.pitchCount += 1;
    const delta = hz - segment.pitchMean;
    segment.pitchMean += delta / segment.pitchCount;
    const delta2 = hz - segment.pitchMean;
    segment.pitchM2 += delta * delta2;
    segment.confidenceSum += confidence || 0;
  }

  function startSegment() {
    if (!isMicRunning() || segment.active) return;
    segment = createSegmentState();
    segment.active = true;
    segment.start = performance.now();
    lastSegment = null;
    renderSegmentRecording();
    updateControls();
  }

  function renderSegmentRecording() {
    els.segmentResult.hidden = false;
    els.segmentResult.textContent = m("segmentRecording");
  }

  function finishSegment(interrupted = false) {
    if (!segment.active) return;
    const duration = Math.max(0, (performance.now() - segment.start) / 1000);
    segment.active = false;
    if (duration < 1 && !interrupted) {
      lastSegment = { tooShort: true };
      renderSegmentSummary(lastSegment);
      segment = createSegmentState();
      updateControls();
      return;
    }
    if (duration >= 1) {
      const pitchStd = segment.pitchCount > 1 ? Math.sqrt(segment.pitchM2 / (segment.pitchCount - 1)) : null;
      let stability = null;
      if (segment.pitchCount > 1 && Number.isFinite(pitchStd) && segment.pitchMean > 0) {
        stability = clamp(100 * (1 - pitchStd / Math.max(segment.pitchMean * 0.04, 1)), 0, 100);
      }
      lastSegment = {
        duration,
        avgDb: segment.dbCount ? segment.dbSum / segment.dbCount : null,
        avgHz: segment.pitchCount ? segment.pitchMean : null,
        avgConfidence: segment.pitchCount ? segment.confidenceSum / segment.pitchCount : null,
        stability
      };
      renderSegmentSummary(lastSegment);
    } else {
      els.segmentResult.hidden = true;
    }
    segment = createSegmentState();
    updateControls();
  }

  function renderSegmentSummary(summary) {
    els.segmentResult.replaceChildren();
    els.segmentResult.hidden = false;
    if (summary.tooShort) {
      els.segmentResult.textContent = m("segmentTooShort");
      return;
    }
    const title = document.createElement("strong");
    title.textContent = m("segmentTitle");
    els.segmentResult.appendChild(title);
    const rows = [
      [m("duration"), `${summary.duration.toFixed(1)} s`],
      [m("avgLevel"), Number.isFinite(summary.avgDb) ? `${summary.avgDb.toFixed(1)} dB` : "—"],
      [m("avgPitch"), Number.isFinite(summary.avgHz) ? `${summary.avgHz.toFixed(1)} Hz (${Math.round((summary.avgConfidence || 0) * 100)}%)` : m("noPitch")],
      [m("stability"), Number.isFinite(summary.stability) ? `${Math.round(summary.stability)}%` : "—"]
    ];
    rows.forEach(([label, value]) => {
      const line = document.createElement("div");
      const key = document.createElement("strong");
      key.textContent = `${label}:`;
      line.append(key, document.createTextNode(` ${value}`));
      els.segmentResult.appendChild(line);
    });
  }

  function resetRecords() {
    snapshots = [];
    lastSegment = null;
    segment = createSegmentState();
    els.segmentResult.hidden = true;
    els.segmentResult.replaceChildren();
    renderSnapshots();
    updateControls();
  }

  function configureAffiliate() {
    const helper = window.NWAmazonAffiliate;
    const config = window.NWTinyAudioAffiliate || { enabled: false, targets: {} };
    if (!helper) return;
    helper.configure({ enabled: config.enabled === true, tool: "tiny-audio-meter", targets: config.targets || {} });
    helper.renderDisclosure(els.disclosure, { includeEnglish: true });
  }

  function mountAffiliate() {
    const helper = window.NWAmazonAffiliate;
    if (!helper) {
      els.affiliateSection.hidden = true;
      return;
    }
    const soundMounted = helper.mount({
      container: els.soundAffiliate,
      target: "sound_level_meter",
      label: m("soundLevelAmazon"),
      placement: "post_meter",
      className: "amazon-cta"
    });
    const usbMounted = helper.mount({
      container: els.usbAffiliate,
      target: "usb_microphone",
      label: m("usbMicAmazon"),
      placement: "post_meter",
      className: "amazon-cta"
    });
    els.affiliateSection.hidden = !(soundMounted || usbMounted);
  }

  function bind() {
    document.querySelectorAll("[data-lang-switch]").forEach((button) => button.addEventListener("click", () => applyLang(button.dataset.langSwitch)));
    els.micButton.addEventListener("click", () => startMic(selectedDeviceId));
    els.stopMicButton.addEventListener("click", () => stopMic());
    els.deviceSelect.addEventListener("change", async () => {
      selectedDeviceId = els.deviceSelect.value;
      if (isMicRunning()) await startMic(selectedDeviceId, { switching: true });
    });
    els.snapshotButton.addEventListener("click", captureSnapshot);
    els.clearSnapshots.addEventListener("click", clearSnapshots);
    els.segmentStart.addEventListener("click", startSegment);
    els.segmentStop.addEventListener("click", () => finishSegment(false));
    els.resetButton.addEventListener("click", resetRecords);
    window.addEventListener("resize", () => { if (isMicRunning()) drawSpectrum(); });
    window.addEventListener("pagehide", () => cleanupAudio(), { once: true });
  }

  function init() {
    bind();
    configureAffiliate();
    resetLiveUI();
    renderSnapshots();
    applyLang(currentLang);
    updateControls();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
