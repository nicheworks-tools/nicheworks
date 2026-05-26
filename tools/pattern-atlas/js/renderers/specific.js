const esc = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const isTransparent = (value) => String(value || '').trim().toLowerCase() === 'transparent';
const c = (pattern, key, fallback) => isTransparent(pattern.defaultColors?.[key]) ? 'transparent' : esc(pattern.defaultColors?.[key] || fallback);

const wrap = (pattern, content) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const bg = pattern.defaultColors?.background || '#ffffff';
  const bgRect = isTransparent(bg) ? '' : `<rect width="100%" height="100%" fill="${esc(bg)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(pattern.nameEn)} pattern preview">${bgRect}${content}</svg>`;
};

const seigaiha = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#8fbcd4');
  let out = '';
  for (let y = 38; y <= 150; y += 34) {
    for (let x = 0; x <= 240; x += 48) {
      out += `<path d="M ${x - 24} ${y} A 24 24 0 0 1 ${x + 24} ${y}" fill="none" stroke="${primary}" stroke-width="4"/>`;
      out += `<path d="M ${x - 16} ${y} A 16 16 0 0 1 ${x + 16} ${y}" fill="none" stroke="${accent}" stroke-width="2"/>`;
      out += `<path d="M ${x - 8} ${y} A 8 8 0 0 1 ${x + 8} ${y}" fill="none" stroke="${primary}" stroke-width="1.6" opacity=".85"/>`;
    }
  }
  return wrap(p, out);
};

const runningWater = (p) => wrap(p, [
  `<path d="M -20 34 C 30 6, 64 66, 116 30 S 196 28, 260 8" fill="none" stroke="${c(p, 'primary', '#2f6f9f')}" stroke-width="5" stroke-linecap="round"/>`,
  `<path d="M -14 78 C 46 38, 86 102, 144 68 S 208 72, 260 44" fill="none" stroke="${c(p, 'secondary', '#9ec9df')}" stroke-width="3" stroke-linecap="round"/>`,
  `<path d="M 8 104 C 54 84, 96 122, 140 98 S 210 94, 246 112" fill="none" stroke="${c(p, 'primary', '#2f6f9f')}" stroke-width="2.4" stroke-linecap="round" opacity=".75"/>`
].join(''));

const shippo = (p) => {
  const primary = c(p, 'primary', '#8b5e34');
  const accent = c(p, 'accent', '#d9c9a3');
  let out = '';
  for (let y = -20; y <= 180; y += 40) {
    for (let x = -20; x <= 180; x += 40) {
      out += `<circle cx="${x}" cy="${y}" r="32" fill="none" stroke="${primary}" stroke-width="3"/>`;
      out += `<circle cx="${x + 20}" cy="${y + 20}" r="5" fill="${accent}" opacity=".8"/>`;
    }
  }
  return wrap(p, out);
};

const ichimatsu = (p) => {
  const primary = c(p, 'primary', '#222');
  let out = '';
  for (let y = 0; y < 120; y += 30) for (let x = 0; x < 120; x += 30) {
    if (((x + y) / 30) % 2 === 0) out += `<rect x="${x}" y="${y}" width="30" height="30" fill="${primary}"/>`;
  }
  return wrap(p, out);
};

const asanoha = (p) => {
  const primary = c(p, 'primary', '#4f5d4f');
  const secondary = c(p, 'secondary', '#9aa38f');
  let out = '';
  for (let cy = 26; cy <= 156; cy += 52) for (let cx = 30; cx <= 180; cx += 60) {
    out += `<path d="M ${cx} ${cy - 24} L ${cx + 26} ${cy - 8} L ${cx + 26} ${cy + 8} L ${cx} ${cy + 24} L ${cx - 26} ${cy + 8} L ${cx - 26} ${cy - 8} Z" fill="none" stroke="${primary}" stroke-width="2"/>`;
    out += `<path d="M ${cx} ${cy - 24} L ${cx} ${cy + 24} M ${cx - 26} ${cy - 8} L ${cx + 26} ${cy + 8} M ${cx + 26} ${cy - 8} L ${cx - 26} ${cy + 8}" stroke="${secondary}" stroke-width="2"/>`;
  }
  return wrap(p, out);
};

const kikko = (p) => {
  const primary = c(p, 'primary', '#5b4636');
  let out = '';
  for (let y = 20; y <= 156; y += 46) for (let x = 28; x <= 180; x += 54) {
    out += `<path d="M ${x} ${y - 20} L ${x + 23} ${y - 8} L ${x + 23} ${y + 8} L ${x} ${y + 20} L ${x - 23} ${y + 8} L ${x - 23} ${y - 8} Z" fill="none" stroke="${primary}" stroke-width="3"/>`;
  }
  return wrap(p, out);
};

const yagasuri = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -10; x <= 190; x += 36) {
    out += `<path d="M ${x} 0 L ${x + 18} 42 L ${x + 6} 42 L ${x + 24} 88 L ${x + 36} 42 L ${x + 24} 42 L ${x + 42} 0" fill="none" stroke="${primary}" stroke-width="5" stroke-linejoin="round"/>`;
    out += `<path d="M ${x + 18} 50 L ${x + 18} 160" stroke="${accent}" stroke-width="3"/>`;
  }
  return wrap(p, out);
};

const uroko = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  let out = '';
  for (let y = 0; y <= 160; y += 32) for (let x = -16; x <= 180; x += 32) {
    out += `<path d="M ${x} ${y} L ${x + 16} ${y + 28} L ${x + 32} ${y} Z" fill="none" stroke="${primary}" stroke-width="2.5"/>`;
  }
  return wrap(p, out);
};

const karakusa = (p) => {
  const primary = c(p, 'primary', '#2f5f57');
  const accent = c(p, 'accent', '#d9a441');
  let out = `<path d="M -10 96 C 40 20, 72 140, 126 64 S 194 48, 232 108" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round"/>`;
  for (const [x, y, r] of [[48, 56, 18], [92, 104, 15], [146, 58, 16], [178, 96, 13]]) {
    out += `<path d="M ${x} ${y} c ${r} -${r} ${r * 2} ${r} 0 ${r * 1.8}" fill="none" stroke="${primary}" stroke-width="3"/>`;
    out += `<circle cx="${x + 6}" cy="${y - 6}" r="5" fill="${accent}"/>`;
  }
  return wrap(p, out);
};

const hishi = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let y = 24; y <= 156; y += 44) for (let x = 20; x <= 180; x += 44) {
    out += `<path d="M ${x} ${y - 18} L ${x + 18} ${y} L ${x} ${y + 18} L ${x - 18} ${y} Z" fill="none" stroke="${primary}" stroke-width="3"/>`;
    out += `<path d="M ${x} ${y - 8} L ${x + 8} ${y} L ${x} ${y + 8} L ${x - 8} ${y} Z" fill="${accent}" opacity=".75"/>`;
  }
  return wrap(p, out);
};

const greekMeander = (p) => {
  const primary = c(p, 'primary', '#222');
  let out = '';
  for (let x = -30; x < 260; x += 60) {
    out += `<path d="M ${x} 18 H ${x + 48} V 48 H ${x + 18} V 32 H ${x + 34}" fill="none" stroke="${primary}" stroke-width="7" stroke-linejoin="miter"/>`;
  }
  return wrap(p, out);
};

const paisley = (p) => wrap(p, `<path d="M 94 30 C 132 28, 154 60, 138 92 C 126 118, 92 124, 70 104 C 44 80, 60 42, 94 30 C 82 50, 98 60, 104 76 C 112 98, 82 102, 76 82" fill="none" stroke="${c(p, 'primary', '#8b2f3c')}" stroke-width="5"/><circle cx="105" cy="70" r="8" fill="${c(p, 'accent', '#d9a441')}"/><path d="M 36 126 C 76 96, 126 142, 180 112" fill="none" stroke="${c(p, 'secondary', '#2f5f57')}" stroke-width="3" opacity=".75"/>`);

const starTile = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let cy = 38; cy <= 150; cy += 56) for (let cx = 38; cx <= 180; cx += 56) {
    out += `<path d="M ${cx} ${cy - 26} L ${cx + 8} ${cy - 8} L ${cx + 26} ${cy} L ${cx + 8} ${cy + 8} L ${cx} ${cy + 26} L ${cx - 8} ${cy + 8} L ${cx - 26} ${cy} L ${cx - 8} ${cy - 8} Z" fill="none" stroke="${primary}" stroke-width="3"/>`;
    out += `<circle cx="${cx}" cy="${cy}" r="5" fill="${accent}"/>`;
  }
  return wrap(p, out);
};

const ikat = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -20; x < 240; x += 34) {
    out += `<path d="M ${x} 0 L ${x + 44} 160" stroke="${primary}" stroke-width="18" opacity=".8"/>`;
    out += `<path d="M ${x + 11} 0 L ${x + 55} 160" stroke="${accent}" stroke-width="5" opacity=".65" stroke-dasharray="10 7"/>`;
  }
  return wrap(p, out);
};

const mandala = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  const cx = (p.tile?.width || 180) / 2;
  const cy = (p.tile?.height || 160) / 2;
  let out = `<circle cx="${cx}" cy="${cy}" r="16" fill="${accent}"/><circle cx="${cx}" cy="${cy}" r="38" fill="none" stroke="${primary}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="60" fill="none" stroke="${primary}" stroke-width="2" opacity=".75"/>`;
  for (let i = 0; i < 12; i += 1) {
    const a = Math.PI * 2 * i / 12;
    const x = cx + Math.cos(a) * 54;
    const y = cy + Math.sin(a) * 54;
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="7" ry="16" fill="none" stroke="${primary}" stroke-width="2" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return wrap(p, out);
};

const lotus = (p) => {
  const primary = c(p, 'primary', '#2f5f57');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let x = 22; x <= 180; x += 44) {
    out += `<path d="M ${x} 110 C ${x - 24} 76, ${x - 14} 40, ${x} 28 C ${x + 14} 40, ${x + 24} 76, ${x} 110 Z" fill="none" stroke="${primary}" stroke-width="3"/>`;
    out += `<circle cx="${x}" cy="118" r="5" fill="${accent}"/>`;
  }
  return wrap(p, out);
};

const batikParang = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -80; x <= 220; x += 54) {
    out += `<path d="M ${x} 160 C ${x + 36} 108, ${x + 30} 52, ${x + 84} 0" fill="none" stroke="${primary}" stroke-width="18" stroke-linecap="round"/>`;
    out += `<path d="M ${x + 10} 158 C ${x + 46} 108, ${x + 40} 52, ${x + 94} 2" fill="none" stroke="${accent}" stroke-width="4"/>`;
  }
  return wrap(p, out);
};

const chineseCloud = (p) => wrap(p, `<path d="M 22 84 C 42 48, 80 68, 68 94 C 110 56, 154 60, 142 100 C 166 86, 190 96, 198 118 H 24" fill="none" stroke="${c(p, 'primary', '#2f6f9f')}" stroke-width="5" stroke-linecap="round"/><path d="M 70 104 C 96 84, 126 86, 148 108" fill="none" stroke="${c(p, 'accent', '#d9a441')}" stroke-width="3"/>`);

const dancheong = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  return wrap(p, `<rect x="0" y="30" width="100%" height="26" fill="${primary}" opacity=".8"/><rect x="0" y="104" width="100%" height="26" fill="${primary}" opacity=".8"/><path d="M 24 80 Q 45 48 66 80 T 108 80 T 150 80 T 192 80" fill="none" stroke="${accent}" stroke-width="5"/><circle cx="90" cy="80" r="12" fill="none" stroke="${primary}" stroke-width="3"/>`);
};

const moreu = (p) => wrap(p, `<path d="M 40 96 C 76 50, 124 66, 108 100 C 96 126, 56 118, 66 88 C 76 58, 132 38, 168 82" fill="none" stroke="${c(p, 'primary', '#1f4e79')}" stroke-width="6" stroke-linecap="round"/><path d="M 164 82 c 18 0 22 20 4 28" fill="none" stroke="${c(p, 'accent', '#d9a441')}" stroke-width="4"/>`);

const damask = (p) => wrap(p, `<path d="M 90 24 C 118 50, 118 96, 90 126 C 62 96, 62 50, 90 24 Z" fill="none" stroke="${c(p, 'primary', '#2f5f57')}" stroke-width="4"/><path d="M 90 52 C 42 28, 30 104, 78 92 M 90 52 C 138 28, 150 104, 102 92" fill="none" stroke="${c(p, 'accent', '#d9a441')}" stroke-width="3"/><circle cx="90" cy="78" r="10" fill="${c(p, 'primary', '#2f5f57')}" opacity=".75"/>`);

const tartan = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let x = 0; x < 180; x += 44) out += `<rect x="${x}" y="0" width="18" height="160" fill="${primary}" opacity=".75"/><rect x="${x + 22}" y="0" width="4" height="160" fill="${accent}"/>`;
  for (let y = 0; y < 160; y += 44) out += `<rect x="0" y="${y}" width="180" height="18" fill="${primary}" opacity=".55"/><rect x="0" y="${y + 22}" width="180" height="4" fill="${accent}"/>`;
  return wrap(p, out);
};

const nordicRosette = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let y = 34; y <= 136; y += 52) for (let x = 34; x <= 170; x += 52) {
    out += `<path d="M ${x} ${y - 18} L ${x + 6} ${y - 6} L ${x + 18} ${y} L ${x + 6} ${y + 6} L ${x} ${y + 18} L ${x - 6} ${y + 6} L ${x - 18} ${y} L ${x - 6} ${y - 6} Z" fill="none" stroke="${primary}" stroke-width="3"/><circle cx="${x}" cy="${y}" r="4" fill="${accent}"/>`;
  }
  return wrap(p, out);
};

const kente = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  let out = '';
  for (let y = 0; y < 160; y += 40) for (let x = 0; x < 180; x += 45) {
    out += `<rect x="${x}" y="${y}" width="45" height="40" fill="${((x + y) / 40) % 2 < 1 ? primary : accent}" opacity=".85"/>`;
    out += `<path d="M ${x + 6} ${y + 8} H ${x + 39} M ${x + 6} ${y + 20} H ${x + 39} M ${x + 6} ${y + 32} H ${x + 39}" stroke="#fff" stroke-width="2" opacity=".75"/>`;
  }
  return wrap(p, out);
};

const kuba = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  const accent = c(p, 'accent', '#d9a441');
  return wrap(p, `<rect x="14" y="14" width="46" height="34" fill="${primary}" opacity=".75"/><path d="M 70 20 H 150 V 52 H 98 V 92 H 166" fill="none" stroke="${primary}" stroke-width="8"/><rect x="28" y="88" width="56" height="42" fill="${accent}" opacity=".7"/><path d="M 18 140 L 62 110 L 112 146 L 166 104" fill="none" stroke="${primary}" stroke-width="5"/>`);
};

const andean = (p) => wrap(p, `<path d="M 90 20 H 118 V 48 H 146 V 76 H 118 V 104 H 90 V 132 H 62 V 104 H 34 V 76 H 62 V 48 H 90 Z" fill="none" stroke="${c(p, 'primary', '#1f4e79')}" stroke-width="5"/><path d="M 90 46 H 112 V 68 H 134 M 90 114 H 68 V 92 H 46" fill="none" stroke="${c(p, 'accent', '#d9a441')}" stroke-width="4"/>`);

const koru = (p) => wrap(p, `<path d="M 34 112 C 74 42, 160 52, 132 102 C 112 136, 66 116, 82 86 C 96 58, 136 76, 116 100" fill="none" stroke="${c(p, 'primary', '#1f4e79')}" stroke-width="7" stroke-linecap="round"/><circle cx="96" cy="46" r="12" fill="${c(p, 'accent', '#d9a441')}"/>`);

const dotGrid = (p) => {
  const primary = c(p, 'primary', '#1f4e79');
  let out = '';
  for (let y = 24; y <= 140; y += 24) for (let x = 24; x <= 168; x += 24) out += `<circle cx="${x}" cy="${y}" r="3" fill="${primary}"/>`;
  return wrap(p, out);
};

const map = {
  seigaiha,
  'running-water': runningWater,
  shippo,
  ichimatsu,
  asanoha,
  kikko,
  yagasuri,
  uroko,
  karakusa,
  hishi,
  arabesque: karakusa,
  'celtic-knot': (p) => wrap(p, `<path d="M 28 80 C 48 26, 132 26, 152 80 C 132 134, 48 134, 28 80 Z" fill="none" stroke="${c(p, 'primary', '#5b4636')}" stroke-width="10"/><path d="M 32 34 L 148 126 M 148 34 L 32 126" stroke="${c(p, 'accent', '#8b6f47')}" stroke-width="7" stroke-linecap="round"/>`),
  'greek-meander': greekMeander,
  paisley,
  'islamic-star-tile': starTile,
  ikat,
  mandala,
  lotus,
  'batik-parang': batikParang,
  'chinese-cloud': chineseCloud,
  dancheong,
  'ainu-moreu': moreu,
  damask,
  tartan,
  'nordic-rosette': nordicRosette,
  'kente-band': kente,
  'kuba-cloth-grid': kuba,
  'andean-stepped-diamond': andean,
  'koru-inspired': koru,
  'dot-grid': dotGrid
};

export function renderSpecificPatternSvg(pattern) {
  return map[pattern.slug] ? map[pattern.slug](pattern) : null;
}
