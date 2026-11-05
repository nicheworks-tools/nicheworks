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
  function pointer(type, x, y, shiftKey = false, pointerType = 'mouse') {
    const rect = c.getBoundingClientRect();
    c.dispatchEvent(new PointerEvent(type, {
      bubbles: true, pointerId: 123, pointerType, shiftKey,
      clientX: rect.left + x * rect.width / c.width,
      clientY: rect.top + y * rect.height / c.height
    }));
  }

  async function extended() {
    const stage = name => { document.body.dataset.qaStage = name; };
    stage('extended-start');
    const layers = () => [...document.querySelectorAll('#layers button')];
    check(layers().length === 3, 'initial layer picker count');
    for (let i = 0; i < 3; i++) {
      layers()[0].click();
      document.querySelector('#delete').click();
    }
    check(status().includes('Images 0'), 'clear images using accessible layer picker');
    const red = await png('rgb(240,20,50)');
    const blue = await png('rgb(20,60,240)');
    stage('dropping');
    const dropped = new DataTransfer();
    dropped.items.add(new File([red], 'drop.png', { type: 'image/png' }));
    document.querySelector('#workspace').dispatchEvent(new DragEvent('drop', {
      bubbles: true, cancelable: true, dataTransfer: dropped
    }));
    await waitFor(() => status().includes('Images 1'), 'image drop');

    stage('pasting');
    const pasted = new DataTransfer();
    pasted.items.add(new File([blue], 'pasted.png', { type: 'image/png' }));
    document.dispatchEvent(new ClipboardEvent('paste', {
      bubbles: true, clipboardData: pasted
    }));
    await waitFor(() => status().includes('Images 2'), 'image paste');

    const invalid = new DataTransfer();
    invalid.items.add(new File(['not an image'], 'bad.txt', { type: 'text/plain' }));
    document.querySelector('#workspace').dispatchEvent(new DragEvent('drop', {
      bubbles: true, cancelable: true, dataTransfer: invalid
    }));
    check(status().includes('Images 2'), 'reject nonimage drop');

    stage('jpeg-webp');
    const formatCanvas = document.createElement('canvas');
    formatCanvas.width = 32;
    formatCanvas.height = 32;
    formatCanvas.getContext('2d').fillRect(0, 0, 32, 32);
    const encode = type => {const url=formatCanvas.toDataURL(type);check(url.startsWith('data:'+type+';base64,'),'canvas supports '+type);const bytes=Uint8Array.from(atob(url.split(',')[1]),ch=>ch.charCodeAt(0));return new Blob([bytes],{type});};
    const jpeg = encode('image/jpeg');
    const webp = encode('image/webp');
    check(jpeg?.type === 'image/jpeg' && webp?.type === 'image/webp', 'Chromium image encoders support JPEG/WebP');
    const additional = new DataTransfer();
    additional.items.add(new File([jpeg], 'photo.jpg', { type: 'image/jpeg' }));
    additional.items.add(new File([webp], 'capture.webp', { type: 'image/webp' }));
    input.files = additional.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await waitFor(() => status().includes('Images 4'), 'JPEG/WebP import');
    check(layers().length === 4, 'JPEG/WebP layers added');
    for (let i = 0; i < 2; i++) {
      layers()[2].click();
      document.querySelector('#delete').click();
    }
    check(status().includes('Images 2'), 'JPEG/WebP QA images cleared');

    stage('layer-order');
    document.querySelector('[data-layout="overlay"]').click();
    check(rgbAt(790, 450)[2] > 200, 'last layer visible on top');
    layers()[0].click();
    document.querySelector('#front').click();
    check(rgbAt(790, 450)[0] > 200, 'bring first layer to front');
    document.querySelector('#back').click();
    check(rgbAt(790, 450)[2] > 200, 'send selected layer to back');

    stage('layer-multiselect');
    document.querySelector('[data-layout="row"]').click();
    layers()[0].click();
    check(document.activeElement === c && c.tabIndex === 0, 'keyboard accessible selection');
    check(layers()[0].getAttribute('aria-pressed') === 'true', 'selected layer exposed to screen reader');
    pointer('pointerdown', 205, 60, true);
    check(status().includes('Selected 2'), 'Shift pointer multi-selection');
    check(layers().filter(button => button.getAttribute('aria-pressed') === 'true').length === 2, 'multi-selection announced');
    layers()[1].click();
    document.querySelector('#delete').click();
    check(status().includes('Images 1'), 'delete one selected pasted layer');

    stage('keyboard');
    document.querySelector('[data-layout="row"]').click();
    layers()[0].click();
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', shiftKey: true, bubbles: true, cancelable: true }));
    check(rgbAt(25, 60)[3] === 0, 'keyboard Shift+ArrowRight moves image 10px');
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true, cancelable: true }));
    check(rgbAt(25, 60)[0] > 200, 'keyboard Ctrl+Z restores image');

    stage('synthetic-touch');
    pointer('pointerdown', 90, 60, false, 'touch');
    pointer('pointermove', 125, 95, false, 'touch');
    pointer('pointerup', 125, 95, false, 'touch');
    check(rgbAt(25, 60)[3] === 0 && rgbAt(85, 85)[0] > 200, 'synthetic touch pointer drag');
    document.querySelector('#undo').click();

    stage('corners');
    const corners = [
      { name: 'nw', down: [22, 22], move: [-13, -13], probe: [10, 30] },
      { name: 'ne', down: [158, 22], move: [193, -13], probe: [175, 30] },
      { name: 'sw', down: [22, 98], move: [-13, 133], probe: [10, 112] },
      { name: 'se', down: [158, 98], move: [193, 133], probe: [175, 112] }
    ];
    for (const corner of corners) {
      layers()[0].click();
      pointer('pointerdown', ...corner.down);
      pointer('pointermove', ...corner.move);
      pointer('pointerup', ...corner.move);
      check(rgbAt(...corner.probe)[0] > 200, 'corner resize ' + corner.name);
      document.querySelector('#undo').click();
      check(rgbAt(...corner.probe)[3] === 0, 'corner resize undo ' + corner.name);
    }

    stage('png-pixels');
    const originalClick = HTMLAnchorElement.prototype.click;
    const originalToBlob = HTMLCanvasElement.prototype.toBlob;
    let exportedPixels = false, exportFilename = '';
    HTMLCanvasElement.prototype.toBlob = function (callback, type, quality) {
      if (this !== c) {
        check(type === 'image/png', 'PNG is actually encoded as PNG');
        const out = this.getContext('2d');
        check(this.width === c.width && this.height === c.height, 'PNG dimensions');
        check(out.getImageData(4, 4, 1, 1).data[3] === 0, 'PNG preserves transparency');
        const sampled = out.getImageData(25, 60, 1, 1).data;
        check(sampled[0] > 200 && sampled[3] === 255, 'PNG pixels contain red image without selection overlay');
        exportedPixels = true;
      }
      return originalToBlob.call(this, callback, type, quality);
    };
    HTMLAnchorElement.prototype.click = function () { exportFilename = this.download; };
    try {
      document.querySelector('#export').click();
      check(exportedPixels, 'export used expected canvas content');
      await waitFor(() => exportFilename === 'screenshot-canvas.png', 'PNG file name');
    } finally {
      HTMLAnchorElement.prototype.click = originalClick;
      HTMLCanvasElement.prototype.toBlob = originalToBlob;
    }

    stage('delete-key');
    layers()[0].click();
    c.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true, cancelable: true }));
    check(status().includes('Images 0'), 'keyboard Delete removes selected layer');
    document.querySelector('#undo').click();
    check(status().includes('Images 1'), 'undo keyboard delete');
    check(layers().length === 1, 'layer picker restored after undo');
  }

  async function test() {
    await waitFor(() => status().includes('画像 0 枚'), 'app initialization');
    const startWidth = c.width;
    check(startWidth === 1600, 'initial canvas width');
    const error = document.querySelector('#error');
    check(error?.getAttribute('role') === 'alert', 'accessible image error region exists');
    const widthInput = document.querySelector('#width'),heightInput=document.querySelector('#height');
    widthInput.value='12000';
    heightInput.value='12000';
    widthInput.dispatchEvent(new Event('change',{bubbles:true}));
    check(c.width===1600 && c.height===900,'reject 144MP canvas without allocating');
    check(widthInput.value==='1600' && heightInput.value==='900','restore invalid size input');
    check(!error.hidden && /2,400万|24 million/i.test(error.textContent),'canvas size error announced');
    const oversized = new File(['x'], 'too-large.png', {type:'image/png'});
    Object.defineProperty(oversized,'size',{value:34*1024*1024});
    const oversizedFiles=new DataTransfer();
    oversizedFiles.items.add(oversized);
    input.files=oversizedFiles.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    await waitFor(()=>!error.hidden && /32MB/i.test(error.textContent),'oversized file rejection');
    check(status().includes('画像 0 枚'),'oversized file did not import');
    input.focus();
    check(document.activeElement === input && getComputedStyle(input).display !== 'none', 'keyboard-only image import remains focusable');
    const red = await png('rgb(240,20,50)');
    const blue = await png('rgb(20,60,240)');
    const files = new DataTransfer();
    files.items.add(new File([red], 'red.png', { type: 'image/png' }));
    files.items.add(new File([blue], 'blue.png', { type: 'image/png' }));
    input.files = files.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    await waitFor(() => status().includes('画像 2 枚'), 'two image imports');
    check(error.hidden, 'successful import clears previous warning');
    const broken = new DataTransfer();
    broken.items.add(new File(['not-a-png'], 'broken.png', {type:'image/png'}));
    input.files=broken.files;
    input.dispatchEvent(new Event('change',{bubbles:true}));
    await waitFor(()=>!error.hidden && /32MB/i.test(error.textContent),'invalid image decode error');
    check(status().includes('画像 2 枚'),'invalid image not imported');

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
    await extended();
    check(errors.length === 0, 'browser runtime errors: ' + errors.join(' | '));
    check(document.body.scrollWidth - document.body.clientWidth <= 8, 'page horizontal overflow');
    return 'PASS:IMPORT2:ROW:DRAG:UNDO_REDO:BACKGROUND:OPACITY:SIZE:DUPLICATE:DELETE:LAYOUTS:PNG:LANG:CONTENT' + document.body.clientWidth + ':VIEWPORT' + window.innerWidth;
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
    const narrow = Number(url.searchParams.get('narrow'));
    if (narrow >= 320 && narrow <= 500) html = html.replace('<body>', '<body style="width:' + narrow + 'px;max-width:' + narrow + 'px">');
    data = Buffer.from(html.replace('</body>', injected + '</body>'));
  }
  res.writeHead(200, { 'Content-Type': type + '; charset=utf-8', 'Cache-Control': 'no-store' }).end(data);
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const port = server.address().port;
async function run(width) {
  const url = 'http://127.0.0.1:' + port + '/tools/screenshot-canvas/?qa=1' + (width <= 390 ? '&narrow=' + width : '');
  const args = ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu',
    '--disable-background-networking', '--disable-extensions', '--no-first-run',
    '--window-size=' + width + ',900', '--virtual-time-budget=40000', '--dump-dom', url];
  const child = spawn(browser, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '';
  child.stdout.on('data', b => stdout += b.toString());
  child.stderr.on('data', b => { if (stderr.length < 4000) stderr += b.toString(); });
  let timeout = false;
  const alarm = setTimeout(() => { timeout = true; child.kill('SIGKILL'); }, 60000);
  const code = await new Promise(resolve => child.on('close', resolve));
  clearTimeout(alarm);
  const result = stdout.match(/<pre id="qa-result">([^<]+)<\/pre>/)?.[1] || ('NO_QA_RESULT stage=' + (stdout.match(/data-qa-stage="([^"]+)"/)?.[1] || 'not-set'));
  console.log(width + 'px: ' + result + ' exit=' + code + (timeout ? ' TIMEOUT' : ''));
  if (code !== 0 || timeout || !result.startsWith('PASS:'))
    throw Error('Screenshot Canvas browser smoke failed: ' + result + ' ' + stderr.slice(-400));
}
try {
  await run(1440);
  await run(390);
  await run(360);
  console.log('Screenshot Canvas Chromium browser smoke PASS');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await new Promise(resolve => server.close(resolve));
}
