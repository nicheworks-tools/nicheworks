(() => {
  const $ = (id) => document.getElementById(id);
  const multipliers = {
    chat: [1.1, 1.3],
    writing: [1.4, 2.0],
    spec: [1.8, 2.8],
    code: [1.8, 3.0],
    github: [3.0, 5.0],
    pdf: [2.0, 4.0],
    screenshot: [2.5, 5.0],
    research: [2.0, 4.0]
  };
  const presetInputs = { small: [800, 2500], medium: [3000, 10000], large: [12000, 40000], huge: [45000, 140000] };
  const outputTokens = { short: [300, 900], normal: [900, 2500], detailed: [2500, 7000], spec: [7000, 18000] };
  const labels = {
    ja: {
      copied: 'コピーしました',
      copyFailed: 'コピーできませんでした',
      split: '分割案',
      tips: '節約案',
      web: 'Web版は非公開の利用制限があります。正確な残り回数ではなく、作業量リスクとして見てください。',
      api: 'API利用時は入力・出力単価で料金が変わります。この表示は汎用単価による概算です。',
      local: 'ローカルAIでは外部サービスの回数制限より、RAM/VRAM/速度/文脈長が主な制約になります。'
    },
    en: {
      copied: 'Copied',
      copyFailed: 'Copy failed',
      split: 'Split plan',
      tips: 'Cost-saving tips',
      web: 'Web apps may use private usage limits. Treat this as workload risk, not exact remaining quota.',
      api: 'API cost depends on input and output pricing. This is a rough generic estimate.',
      local: 'For local AI, RAM, VRAM, speed, and context size are the main constraints.'
    }
  };
  let currentLang = localStorage.getItem('ace-lang') || ((navigator.language || '').toLowerCase().startsWith('ja') ? 'ja' : 'en');
  let lastResult = '';
  function riskName(high) {
    if (high <= 5000) return ['small', currentLang === 'ja' ? '小' : 'Small'];
    if (high <= 20000) return ['medium', currentLang === 'ja' ? '中' : 'Medium'];
    if (high <= 60000) return ['large', currentLang === 'ja' ? '大' : 'Large'];
    if (high <= 150000) return ['huge', currentLang === 'ja' ? '特大' : 'Huge'];
    return ['extreme', currentLang === 'ja' ? '危険' : 'Extreme'];
  }
  function fmt(n) { return Math.round(n).toLocaleString(); }
  function promptBoost(text) {
    const value = String(text || '').toLowerCase();
    let low = 0;
    let high = 0;
    ['github','pr','repo','diff','コード','実装','修正','テスト'].forEach((k) => { if (value.includes(k)) { low += 3000; high += 16000; } });
    ['全部','漏れなく','詳細','仕様書','網羅','complete','full'].forEach((k) => { if (value.includes(k)) { low += 2000; high += 10000; } });
    ['pdf','スクショ','画像','screenshot','image'].forEach((k) => { if (value.includes(k)) { low += 2000; high += 12000; } });
    ['最新','検索','調べ','cite','source','web'].forEach((k) => { if (value.includes(k)) { low += 1500; high += 8000; } });
    return [low, high];
  }
  function estimate() {
    const task = $('task').value;
    const platform = $('platform').value;
    const inputSize = $('inputSize').value;
    const outputSize = $('outputSize').value;
    const textChars = Number($('textChars').value || 0);
    const codeLines = Number($('codeLines').value || 0);
    const pdfPages = Number($('pdfPages').value || 0);
    const screenshots = Number($('screenshots').value || 0);
    const promptText = $('promptText').value;
    const preset = presetInputs[inputSize] || presetInputs.small;
    const output = outputTokens[outputSize] || outputTokens.normal;
    const multiplier = multipliers[task] || multipliers.chat;
    const text = [textChars * 0.8, textChars * 1.4];
    const code = [codeLines * 8, codeLines * 25];
    const pdf = [pdfPages * 500, pdfPages * 1800];
    const shot = [screenshots * 2000, screenshots * 8000];
    const boost = promptBoost(promptText);
    const baseLow = preset[0] + text[0] + code[0] + pdf[0] + shot[0] + boost[0];
    const baseHigh = preset[1] + text[1] + code[1] + pdf[1] + shot[1] + boost[1];
    const inputLow = baseLow * multiplier[0];
    const inputHigh = baseHigh * multiplier[1];
    const totalLow = inputLow + output[0];
    const totalHigh = inputHigh + output[1];
    const risk = riskName(totalHigh);
    const costLow = platform === 'api' ? ((inputLow / 1000000) * 1 + (output[0] / 1000000) * 5) : null;
    const costHigh = platform === 'api' ? ((inputHigh / 1000000) * 5 + (output[1] / 1000000) * 20) : null;
    const platformNote = labels[currentLang][platform] || labels[currentLang].web;
    const splitItems = task === 'github'
      ? ['Review only the PR diff first.', 'Check policy violations next.', 'Generate the next task after that.']
      : task === 'spec'
        ? ['Create an outline first.', 'Then expand section by section.', 'Ask for a final consistency pass last.']
        : ['Reduce the input scope.', 'Ask for a shorter first pass.', 'Regenerate only the weak section.'];
    const tips = ['Use a shorter output format.', 'Avoid asking for everything at once.', 'Separate reading, checking, and writing.'];
    const summary = `${currentLang === 'ja' ? '推定' : 'Estimate'}: ${fmt(totalLow)} - ${fmt(totalHigh)} tokens / ${currentLang === 'ja' ? 'リスク' : 'Risk'}: ${risk[1]}`;
    $('resultSummary').innerHTML = `<div>${summary}</div><div class="risk-${risk[0]}">${platformNote}</div>${platform === 'api' ? `<div>Cost: $${costLow.toFixed(4)} - $${costHigh.toFixed(4)}</div>` : ''}`;
    $('breakdown').innerHTML = `<ul><li>Input: ${fmt(inputLow)} - ${fmt(inputHigh)}</li><li>Output: ${fmt(output[0])} - ${fmt(output[1])}</li><li>Total: ${fmt(totalLow)} - ${fmt(totalHigh)}</li></ul>`;
    $('advice').innerHTML = `<h3>${labels[currentLang].split}</h3><ul>${splitItems.map((x) => `<li>${x}</li>`).join('')}</ul><h3>${labels[currentLang].tips}</h3><ul>${tips.map((x) => `<li>${x}</li>`).join('')}</ul>`;
    lastResult = `${summary}\n${platformNote}\nSplit plan:\n- ${splitItems.join('\n- ')}`;
    localStorage.setItem('ace-last', JSON.stringify({ task, platform, inputSize, outputSize, textChars, codeLines, pdfPages, screenshots }));
  }
  function applyLang(lang) {
    currentLang = lang;
    localStorage.setItem('ace-lang', lang);
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ja][data-en]').forEach((node) => { node.textContent = node.dataset[lang]; });
    document.querySelectorAll('[data-lang]').forEach((btn) => btn.classList.toggle('active', btn.dataset.lang === lang));
  }
  document.addEventListener('DOMContentLoaded', () => {
    applyLang(currentLang);
    $('estimateBtn').addEventListener('click', estimate);
    $('copyBtn').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(lastResult || $('resultSummary').textContent); $('copyBtn').textContent = labels[currentLang].copied; }
      catch { $('copyBtn').textContent = labels[currentLang].copyFailed; }
      setTimeout(() => { $('copyBtn').textContent = 'Copy result'; }, 1400);
    });
    document.querySelectorAll('[data-lang]').forEach((btn) => btn.addEventListener('click', () => { applyLang(btn.dataset.lang); estimate(); }));
    estimate();
  });
})();
