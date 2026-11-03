import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawn } from 'node:child_process';

const root = process.cwd();
const browser = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser']
  .find(cmd => (process.env.PATH || '').split(path.delimiter).some(dir => fs.existsSync(path.join(dir, cmd))));
if (!browser) throw Error('Chromium/Chrome not found');

function pageSmoke() {
  const errors = [];
  window.addEventListener('error', event => errors.push(event.message));
  window.addEventListener('unhandledrejection', event => errors.push(String(event.reason)));
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const check = (ok, message) => { if (!ok) throw Error(message); };
  const waitFor = async (fn, label) => {
    for (let i = 0; i < 120; i++) {
      if (fn()) return;
      await sleep(40);
    }
    throw Error('Timeout: ' + label);
  };
  const status = () => document.querySelector('#status')?.textContent || '';
  const c = document.querySelector('#canvas');
  const input = document.querySelector('#files');
  async function png(color) {
    const source = document.createElement('canvas');
    source.width = 140;
    source.height = 80;
    const context = source.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0, 0, 140, 80);
    return new Promise(resolve => source.toBlob(resolve, 'image/png'));
  }
  function rgbAt(x, y) {
    return c.getContext('2d').getImageData(x, y, 1, 1).data;
  }
  function pointer(type, x, y, shiftKey = false) {
    const rect = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: 123, pointerType: 'mouse', shiftKey,
      clientX: rect.left + x * rect.width / c.width,
      clientY: rect.top + y * rect.height / c.height
    }));
  }
  async function test() {
    await waitFor(() => status().includes('画像 0 枚'), 'app initialization');
    const startWidth = c.width;
    check(startWidth === 1600, 'initial canvas width');
    const red = await png('rgb(240,20,50)');
    const blue = await png('rgb(20,60,240)');
    const files = new DataTransfer();
    files.items.add(new File([red], 'red.png', { type: 'image/png' }));
    files.items.add(new File([blue], 'blue.png', { type: 'image/png' }));
    input.files = files.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await waitFor(() => status().includes('画像 2 枚'), 'two image imports');

    document.querySelector('[data-layout="row"]').click();
    check(rgbAt(40, 40)[0] > 200, 'row layout first image color');
    check(rgbAt(200, 40)[2] > 200, 'row layout second image color');

    c.setPointerCapture = () => {};
    pointer('pointerdown', 90, 60);
    pointer('pointermove', 130, 90);
    pointer('pointerup', 130, 90);
    check(rgbAt(45, 45)[0] > 245, 'move vacates original pixel');
    check(rgbAt(100, 90)[0] > 200, 'drag moves first image');

    document.querySelector('#undo').click();
    check(rgbAt(45, 45)[0] > 200, 'undo restores image position');
    document.querySelector('#redo').click();
    check(rgbAt(100, 90)[0] > 200, 'redo restores moved position');

    const bg = document.querySelector('#background');
    bg.focus();
    bg.value = 'transparent';
    bg.dispatchEvent(new Event('change', { bubbles: true }));
    check(rgbAt(10, 10)[3] === 0, 'transparent background');
    document.querySelector('#undo').click();
    check(rgbAt(10, 10)[3] === 255, 'undo background change');
    document.querySelector('#redo').click();
    check(rgbAt(10, 10)[3] === 0, 'redo background change');

    pointer('pointerdown', 100, 90);
    pointer('pointerup', 100, 90);
    const opacity = document.querySelector('#opacity');
    opacity.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }));
    opacity.value = '40';
    opacity.dispatchEvent(new Event('input', { bubbles: true }));
    opacity.dispatchEvent(new Event('change', { bubbles: true }));
    check(Math.abs(rgbAt(100, 90)[3] - 102) < 4, 'opacity 40 percent');
    document.querySelector('#undo').click();
    check(rgbAt(100, 90)[3] === 255, 'undo restores full opacity');

    const width = document.querySelector('#width');
    width.value = '1200';
    width.dispatchEvent(new Event('change', { bubbles: true }));
    check(c.width === 1200, 'canvas dimension change');
    document.querySelector('#undo').click();
    check(c.width === 1600, 'canvas dimension undo');

    pointer('pointerdown', 100, 90);
    pointer('pointerup', 100, 90);
    document.querySelector('#duplicate').click();
    check(status().includes('画像 3 枚'), 'duplicate selection');
    document.querySelector('#delete').click();
    check(status().includes('画像 2 枚'), 'delete duplicate');
    document.querySelector('#undo').click();
    check(status().includes('画像 3 枚'), 'undo delete');

    document.querySelector('[data-layout="grid"]').click();
    document.querySelector('[data-layout="column"]').click();
    document.querySelector('[data-layout="overlay"]').click();

    const originalClick = HTMLAnchorElement.prototype.click;
    let filename = '';
    HTMLAnchorElement.prototype.click = function () { filename = this.download; };
    try {
      document.querySelector('#export').click();
      await waitFor(() => filename !== '', 'PNG export');
      check(filename === 'screenshot-canvas.png', 'PNG download filename');
    } finally {
      HTMLAnchorElement.prototype.click = originalClick;
    }

    const lang = document.querySelector('#lang');
    lang.value = 'en';
    lang.dispatchEvent(new Event('change', { bubbles: true }));
    check(status().includes('Images 3'), 'English UI switch: ' + JSON.stringify({status:status(), value:lang.value, documentLanguage:document.documentElement.lang}));
    check(errors.length === 0, 'browser runtime errors: ' + errors.join(' | '));
    check(document.documentElement.scrollWidth - window.innerWidth <= 8, 'page horizontal overflow');
    return 'PASS:IMPORT2:ROW:DRAG:UNDO_REDO:BACKGROUND:OPACITY:SIZE:DUPLICATE:DELETE:LAYOUTS:PNG:LANG:WIDTH' + window.innerWidth;
  }
  test().then(result => {
    const pre = document.createElement('pre');
    pre.id = 'qa-result';
    pre.textContent = result;
    document.body.append(pre);
  }).catch(error => {
    const pre = document.createElement('pre');
    pre.id = 'qa-result';
    pre.textContent = 'FAIL:' + error.message;
    document.body.append(pre);
  });
}

const injected = '<script>(' + pageSmoke.toString() + ')();</script>';
const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
  if (!file.startsWith(root + path.sep)) {
    res.writeHead(403).end();
    return;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    res.writeHead(404).end('Not found');
    return;
  }
  let data = fs.readFileSync(file);
  const type = file.endsWith('.html') ? 'text/html' :
    file.endsWith('.css') ? 'text/css' : file.endsWith('.js') ? 'application/javascript' : 'application/octet-stream';
  if (type === 'text/html' && url.searchParams.has('qa')) {
    let html = data.toString('utf8');
    html = html.replace(/<script\b[^>]*\bsrc="https:\/\/[^"]+"[^>]*><\/script>/g, '');
    data = Buffer.from(html.replace('</body>', injected + '</body>'));
  }
  res.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' }).end(data);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
async function run(width) {
  const url = 'http://127.0.0.1:' + port + '/tools/screenshot-canvas/?qa=1';
  const args = ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    '--disable-background-networking', '--disable-extensions', '--no-first-run',
    '--window-size=' + width + ',900', '--virtual-time-budget=12000', '--dump-dom', url];
  const child = spawn(browser, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', b => stdout += b.toString());
  child.stderr.on('data', b => { if (stderr.length < 4000) stderr += b.toString(); });
  let timeout = false;
  const alarm = setTimeout(() => { timeout = true; child.kill('SIGKILL'); }, 35000);
  const code = await new Promise(resolve => child.on('close', resolve));
  clearTimeout(alarm);
  const result = stdout.match(/<pre id="qa-result">([^<]+)<\/pre>/)?.[1] || 'NO_QA_RESULT';
  console.log(width + 'px: ' + result + ' exit=' + code + (timeout ? ' TIMEOUT' : ''));
  if (code !== 0 || timeout || !result.startsWith('PASS:'))
    throw Error('Screenshot Canvas browser smoke failed: ' + result + ' ' + stderr.slice(-400));
}
try {
  await run(1440);
  await run(390);
  console.log('Screenshot Canvas Chromium browser smoke PASS');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await new Promise(resolve => server.close(resolve));
}
