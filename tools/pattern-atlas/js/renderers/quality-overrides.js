const esc = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const transparent = (value) => String(value || '').trim().toLowerCase() === 'transparent';
const color = (pattern, key, fallback) => transparent(pattern.defaultColors?.[key]) ? 'transparent' : esc(pattern.defaultColors?.[key] || fallback);
const wrap = (pattern, content) => {
  const w = pattern.tile?.width || 220;
  const h = pattern.tile?.height || 160;
  const bg = pattern.defaultColors?.background || '#fff';
  const bgRect = transparent(bg) ? '' : `<rect width="100%" height="100%" fill="${esc(bg)}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(pattern.nameEn)} pattern preview">${bgRect}${content}</svg>`;
};

const arabesque = (p) => {
  const primary = color(p, 'primary', '#2f5f57');
  const secondary = color(p, 'secondary', '#9aa38f');
  const accent = color(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -40; x < 260; x += 92) {
    out += `<path d="M ${x} 88 C ${x + 28} 24, ${x + 72} 24, ${x + 104} 88 C ${x + 72} 136, ${x + 28} 136, ${x} 88 Z" fill="none" stroke="${primary}" stroke-width="4"/>`;
    out += `<path d="M ${x + 18} 88 C ${x + 48} 48, ${x + 62} 48, ${x + 92} 88" fill="none" stroke="${secondary}" stroke-width="3"/>`;
    out += `<path d="M ${x + 38} 72 c 12 -22 34 -14 24 8 c -8 18 -34 12 -24 -8 Z" fill="none" stroke="${primary}" stroke-width="2.5"/>`;
    out += `<circle cx="${x + 52}" cy="88" r="5" fill="${accent}"/>`;
  }
  out += `<path d="M -20 132 C 36 104, 74 154, 128 126 S 210 112, 260 136" fill="none" stroke="${secondary}" stroke-width="2" opacity=".7"/>`;
  return wrap(p, out);
};

const karakusa = (p) => {
  const primary = color(p, 'primary', '#2f5f57');
  const accent = color(p, 'accent', '#d9a441');
  let out = `<path d="M -24 100 C 28 40, 66 146, 118 86 S 192 38, 248 96" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round"/>`;
  for (const [x, y, s, flip] of [[40,70,1,1],[78,104,.85,-1],[132,72,1.05,1],[176,104,.9,-1]]) {
    out += `<path d="M ${x} ${y} c ${24*s*flip} ${-28*s}, ${48*s*flip} ${18*s}, ${10*s*flip} ${34*s}" fill="none" stroke="${primary}" stroke-width="3" stroke-linecap="round"/>`;
    out += `<path d="M ${x + 4*flip} ${y - 6} c ${12*flip} -8, ${22*flip} 2, ${10*flip} 14" fill="none" stroke="${accent}" stroke-width="2.2"/>`;
  }
  return wrap(p, out);
};

const paisley = (p) => {
  const primary = color(p, 'primary', '#8b2f3c');
  const secondary = color(p, 'secondary', '#2f5f57');
  const accent = color(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -20; x < 240; x += 96) {
    out += `<path d="M ${x + 54} 28 C ${x + 106} 26, ${x + 124} 86, ${x + 82} 122 C ${x + 42} 156, ${x + 0} 112, ${x + 36} 76 C ${x + 60} 52, ${x + 34} 38, ${x + 54} 28 Z" fill="none" stroke="${primary}" stroke-width="4"/>`;
    out += `<path d="M ${x + 70} 54 C ${x + 92} 70, ${x + 84} 104, ${x + 56} 104" fill="none" stroke="${secondary}" stroke-width="3"/>`;
    out += `<circle cx="${x + 72}" cy="82" r="6" fill="${accent}"/>`;
    out += `<path d="M ${x + 34} 120 c 18 -12 40 -10 56 4" fill="none" stroke="${secondary}" stroke-width="2" opacity=".8"/>`;
  }
  return wrap(p, out);
};

const celticKnot = (p) => {
  const primary = color(p, 'primary', '#5b4636');
  const accent = color(p, 'accent', '#8b6f47');
  return wrap(p, `<path d="M 34 80 C 34 28, 98 28, 98 80 C 98 132, 34 132, 34 80 Z" fill="none" stroke="${primary}" stroke-width="10"/><path d="M 122 80 C 122 28, 186 28, 186 80 C 186 132, 122 132, 122 80 Z" fill="none" stroke="${primary}" stroke-width="10"/><path d="M 42 42 C 88 96, 132 96, 178 42 M 42 118 C 88 64, 132 64, 178 118" fill="none" stroke="${accent}" stroke-width="6" stroke-linecap="round"/><path d="M 72 30 L 148 130 M 148 30 L 72 130" stroke="#fff" stroke-width="3" opacity=".7"/>`);
};

const damask = (p) => {
  const primary = color(p, 'primary', '#2f5f57');
  const secondary = color(p, 'secondary', '#9aa38f');
  const accent = color(p, 'accent', '#d9a441');
  return wrap(p, `<path d="M 110 18 C 146 48, 146 108, 110 142 C 74 108, 74 48, 110 18 Z" fill="none" stroke="${primary}" stroke-width="4"/><path d="M 110 44 C 60 18, 24 58, 54 98 C 76 126, 100 100, 110 80 M 110 44 C 160 18, 196 58, 166 98 C 144 126, 120 100, 110 80" fill="none" stroke="${primary}" stroke-width="3"/><path d="M 110 62 C 94 78, 96 100, 110 116 C 124 100, 126 78, 110 62 Z" fill="${secondary}" opacity=".45"/><circle cx="110" cy="80" r="7" fill="${accent}"/>`);
};

const dancheong = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const secondary = color(p, 'secondary', '#9aa38f');
  const accent = color(p, 'accent', '#d9a441');
  return wrap(p, `<rect x="0" y="18" width="100%" height="22" fill="${primary}" opacity=".85"/><rect x="0" y="120" width="100%" height="22" fill="${primary}" opacity=".85"/><rect x="0" y="48" width="100%" height="10" fill="${accent}" opacity=".9"/><rect x="0" y="102" width="100%" height="10" fill="${accent}" opacity=".9"/><path d="M 20 82 Q 42 48 64 82 T 108 82 T 152 82 T 196 82" fill="none" stroke="${secondary}" stroke-width="6"/><circle cx="108" cy="82" r="18" fill="none" stroke="${primary}" stroke-width="4"/><circle cx="108" cy="82" r="7" fill="${accent}"/>`);
};

const moreu = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const accent = color(p, 'accent', '#d9a441');
  return wrap(p, `<path d="M 22 108 C 66 38, 160 44, 140 108 C 124 154, 54 132, 78 82 C 98 42, 154 78, 116 112" fill="none" stroke="${primary}" stroke-width="7" stroke-linecap="round"/><path d="M 150 72 C 172 66, 188 86, 176 106 C 166 122, 142 112, 148 94" fill="none" stroke="${accent}" stroke-width="4" stroke-linecap="round"/><path d="M 34 122 C 70 112, 94 138, 126 126" fill="none" stroke="${primary}" stroke-width="3" opacity=".65"/>`);
};

const koru = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const accent = color(p, 'accent', '#d9a441');
  return wrap(p, `<path d="M 28 118 C 72 40, 174 44, 146 112 C 124 158, 58 132, 82 84 C 102 46, 154 76, 124 108" fill="none" stroke="${primary}" stroke-width="8" stroke-linecap="round"/><path d="M 56 126 C 90 98, 126 146, 170 118" fill="none" stroke="${primary}" stroke-width="3" opacity=".55"/><circle cx="96" cy="42" r="12" fill="${accent}"/>`);
};

const kente = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const accent = color(p, 'accent', '#d9a441');
  const secondary = color(p, 'secondary', '#9aa38f');
  let out = '';
  for (let y = 0; y < 160; y += 32) for (let x = 0; x < 220; x += 44) {
    const fill = ((x / 44 + y / 32) % 3 === 0) ? primary : ((x / 44 + y / 32) % 3 === 1 ? accent : secondary);
    out += `<rect x="${x}" y="${y}" width="44" height="32" fill="${fill}" opacity=".86"/>`;
    out += `<path d="M ${x + 6} ${y + 8} H ${x + 38} M ${x + 6} ${y + 16} H ${x + 38} M ${x + 6} ${y + 24} H ${x + 38}" stroke="#fff" stroke-width="1.8" opacity=".65"/>`;
  }
  return wrap(p, out);
};

const kuba = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const accent = color(p, 'accent', '#d9a441');
  const secondary = color(p, 'secondary', '#9aa38f');
  return wrap(p, `<rect x="12" y="12" width="52" height="32" fill="${primary}" opacity=".8"/><rect x="78" y="18" width="30" height="58" fill="${secondary}" opacity=".75"/><path d="M 118 20 H 196 V 46 H 160 V 78 H 204" fill="none" stroke="${primary}" stroke-width="9"/><rect x="24" y="86" width="68" height="46" fill="${accent}" opacity=".75"/><path d="M 18 144 L 60 112 L 112 148 L 168 102 L 204 132" fill="none" stroke="${primary}" stroke-width="5"/>`);
};

const batikParang = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const accent = color(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -90; x <= 260; x += 56) {
    out += `<path d="M ${x} 164 C ${x + 42} 118, ${x + 32} 52, ${x + 92} -4" fill="none" stroke="${primary}" stroke-width="18" stroke-linecap="round"/>`;
    out += `<path d="M ${x + 12} 160 C ${x + 54} 112, ${x + 44} 52, ${x + 102} 0" fill="none" stroke="${accent}" stroke-width="5"/>`;
    out += `<circle cx="${x + 52}" cy="80" r="6" fill="${accent}" opacity=".85"/>`;
  }
  return wrap(p, out);
};

const chineseCloud = (p) => {
  const primary = color(p, 'primary', '#2f6f9f');
  const accent = color(p, 'accent', '#d9a441');
  let out = '';
  for (let x = -10; x < 240; x += 110) {
    out += `<path d="M ${x + 12} 88 C ${x + 30} 52, ${x + 70} 68, ${x + 58} 96 C ${x + 96} 56, ${x + 146} 66, ${x + 128} 108 C ${x + 154} 92, ${x + 184} 106, ${x + 188} 126 H ${x + 12}" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round"/>`;
    out += `<path d="M ${x + 60} 112 C ${x + 92} 88, ${x + 124} 94, ${x + 148} 118" fill="none" stroke="${accent}" stroke-width="3"/>`;
  }
  return wrap(p, out);
};

const mandala = (p) => {
  const primary = color(p, 'primary', '#1f4e79');
  const accent = color(p, 'accent', '#d9a441');
  const cx = 110;
  const cy = 80;
  let out = `<circle cx="${cx}" cy="${cy}" r="10" fill="${accent}"/><circle cx="${cx}" cy="${cy}" r="28" fill="none" stroke="${primary}" stroke-width="3"/><circle cx="${cx}" cy="${cy}" r="58" fill="none" stroke="${primary}" stroke-width="2"/>`;
  for (let i = 0; i < 16; i += 1) {
    const a = Math.PI * 2 * i / 16;
    const x = cx + Math.cos(a) * 46;
    const y = cy + Math.sin(a) * 46;
    out += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6" ry="18" fill="none" stroke="${primary}" stroke-width="2" transform="rotate(${(a * 180 / Math.PI).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`;
  }
  return wrap(p, out);
};

const lotus = (p) => {
  const primary = color(p, 'primary', '#2f5f57');
  const accent = color(p, 'accent', '#d9a441');
  let out = '';
  for (let cx = 38; cx <= 204; cx += 56) {
    out += `<path d="M ${cx} 120 C ${cx - 28} 82, ${cx - 10} 38, ${cx} 24 C ${cx + 10} 38, ${cx + 28} 82, ${cx} 120 Z" fill="none" stroke="${primary}" stroke-width="3"/>`;
    out += `<path d="M ${cx - 22} 116 C ${cx - 32} 88, ${cx - 20} 62, ${cx - 4} 44 M ${cx + 22} 116 C ${cx + 32} 88, ${cx + 20} 62, ${cx + 4} 44" fill="none" stroke="${primary}" stroke-width="2" opacity=".75"/>`;
    out += `<circle cx="${cx}" cy="126" r="5" fill="${accent}"/>`;
  }
  return wrap(p, out);
};

const overrides = {
  arabesque,
  karakusa,
  paisley,
  'celtic-knot': celticKnot,
  damask,
  dancheong,
  'ainu-moreu': moreu,
  'koru-inspired': koru,
  'kente-band': kente,
  'kuba-cloth-grid': kuba,
  'batik-parang': batikParang,
  'chinese-cloud': chineseCloud,
  mandala,
  lotus
};

export function renderQualityOverrideSvg(pattern) {
  return overrides[pattern.slug] ? overrides[pattern.slug](pattern) : null;
}
