(() => {
  const TOOL_KEY = 'nw_command_safety_pro_enabled_v1';
  const LEGACY_KEY = 'nw_pro_command_safety_checker';
  const GLOBAL_KEY = 'nw_pro_key';
  const $ = (id) => document.getElementById(id);
  const isPro = () => localStorage.getItem(TOOL_KEY) === '1' || localStorage.getItem(LEGACY_KEY) === '1' || !!localStorage.getItem(GLOBAL_KEY);
  const lang = () => document.documentElement.lang === 'en' ? 'en' : 'ja';

  function migrate() {
    if (localStorage.getItem(LEGACY_KEY) === '1' || !!localStorage.getItem(GLOBAL_KEY)) {
      localStorage.setItem(TOOL_KEY, '1');
    }
  }

  function setProFromKey(key) {
    const cleaned = String(key || '').trim();
    if (!/^NW-[A-Z0-9-]{8,}$/.test(cleaned)) return false;
    localStorage.setItem(GLOBAL_KEY, cleaned);
    localStorage.setItem(TOOL_KEY, '1');
    localStorage.setItem(LEGACY_KEY, '1');
    return true;
  }

  function activate() {
    const u = new URL(location.href);
    if (u.searchParams.get('pro') === '1') {
      localStorage.setItem(TOOL_KEY, '1');
      localStorage.setItem(LEGACY_KEY, '1');
      u.searchParams.delete('pro');
      history.replaceState({}, '', u.toString());
    }
  }

  function toast(message) {
    let el = $('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.hidden = false;
    clearTimeout(toast.t);
    toast.t = setTimeout(() => { el.hidden = true; }, 2200);
  }

  function needPro() {
    if (isPro()) return true;
    toast(lang() === 'ja'
      ? 'Pro限定機能です。購入後にProキーを入力してください。'
      : 'Pro feature locked. Enter your Pro key after purchase.');
    render();
    return false;
  }

  function report() {
    return [
      '# Command Safety Pro Review',
      '',
      '## Input',
      $('cmdInput')?.value || '',
      '',
      '## Normalized',
      $('normalizedCmd')?.textContent || '',
      '',
      '## Findings',
      $('findings')?.innerText || '',
      '',
      '## Review checklist',
      $('saferSteps')?.innerText || '',
      '',
      '## Note',
      'This report is a review aid only. It does not certify that a command is safe.'
    ].join('\n');
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast(lang() === 'ja' ? 'コピーしました' : 'Copied');
    } catch {
      toast('Copy failed');
    }
  }

  function download(name, text) {
    const blob = new Blob([text], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function build() {
    if ($('cscProAddon')) return;
    const block = $('proBlock');
    if (!block) return;
    const div = document.createElement('div');
    div.id = 'cscProAddon';
    div.className = 'pro-addon';
    div.innerHTML = [
      '<p id="cscProState"></p>',
      '<div id="cscKeyArea" class="actions">',
      '<input id="cscProKey" class="select" type="text" inputmode="text" autocomplete="off" placeholder="Paste Pro key / Proキーを貼り付け">',
      '<button id="cscActivatePro" class="btn" type="button">Activate Pro / Proを有効化</button>',
      '</div>',
      '<div class="actions">',
      '<button id="cscCopyPro" class="btn" type="button">Pro: Copy review report</button>',
      '<button id="cscSavePro" class="btn" type="button">Pro: Save Markdown report</button>',
      '</div>'
    ].join('');
    block.appendChild(div);

    $('cscActivatePro').addEventListener('click', () => {
      if (setProFromKey($('cscProKey')?.value || '')) {
        toast(lang() === 'ja' ? 'Proを有効化しました' : 'Pro activated');
        render();
      } else {
        toast(lang() === 'ja' ? 'Proキーを確認してください' : 'Check the Pro key');
      }
    });
    $('cscCopyPro').addEventListener('click', () => { if (!needPro()) return; copy(report()); });
    $('cscSavePro').addEventListener('click', () => { if (!needPro()) return; download('command-safety-pro-review.md', report()); });
  }

  function render() {
    migrate();
    build();
    document.body.classList.toggle('is-pro', isPro());
    const state = $('cscProState');
    const keyArea = $('cscKeyArea');
    if (state) {
      state.textContent = isPro()
        ? 'Pro active: review copy and Markdown export are unlocked. / Pro解放済み。'
        : 'Pro locked: paste the key from the Pro Unlock page to enable review copy and Markdown export. / Proキーでレビュー保存を解放。';
    }
    if (keyArea) keyArea.hidden = isPro();
  }

  function init() {
    activate();
    migrate();
    render();
    document.addEventListener('click', () => setTimeout(render, 0));
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
