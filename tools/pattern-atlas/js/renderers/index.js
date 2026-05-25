const svg = (content, pattern) => {
  const width = pattern.tile?.width || 180;
  const height = pattern.tile?.height || 160;
  const colors = pattern.defaultColors || {};
  const bg = colors.background || '#ffffff';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeAttr(pattern.nameEn)} pattern preview"><rect width="100%" height="100%" fill="${escapeAttr(bg)}"/>${content}</svg>`;
};

const escapeAttr = (value) => String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
const color = (pattern, key, fallback) => escapeAttr(pattern.defaultColors?.[key] || fallback);

const wave = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#1f4e79');
  const accent = color(pattern, 'accent', '#8fbcd4');
  const rows = pattern.rendererParams?.rows || 3;
  const step = h / (rows + 1);
  let content = '';
  for (let row = 1; row <= rows; row += 1) {
    const y = Math.round(step * row);
    for (let x = -40; x < w + 40; x += 48) {
      content += `<path d="M ${x} ${y} q 24 -36 48 0" fill="none" stroke="${primary}" stroke-width="4" stroke-linecap="round"/>`;
      content += `<path d="M ${x + 8} ${y + 16} q 16 -22 32 0" fill="none" stroke="${accent}" stroke-width="2" stroke-linecap="round" opacity="0.75"/>`;
    }
  }
  return svg(content, pattern);
};

const grid = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#222222');
  const cell = Math.max(24, Math.min(w, h) / 4);
  let content = '';
  for (let y = 0; y < h; y += cell) {
    for (let x = 0; x < w; x += cell) {
      if (((x / cell) + (y / cell)) % 2 === 0) content += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="${primary}" opacity="0.88"/>`;
    }
  }
  return svg(content, pattern);
};

const dots = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#1f4e79');
  const r = pattern.rendererParams?.radius || 4;
  let content = '';
  for (let y = 20; y < h; y += 32) {
    for (let x = 20; x < w; x += 32) content += `<circle cx="${x}" cy="${y}" r="${r}" fill="${primary}"/>`;
  }
  return svg(content, pattern);
};

const diamond = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#1f4e79');
  const accent = color(pattern, 'accent', '#d9a441');
  let content = '';
  for (let y = 20; y < h + 30; y += 48) {
    for (let x = 20; x < w + 30; x += 48) {
      content += `<path d="M ${x} ${y - 18} L ${x + 18} ${y} L ${x} ${y + 18} L ${x - 18} ${y} Z" fill="none" stroke="${primary}" stroke-width="3"/>`;
      content += `<circle cx="${x}" cy="${y}" r="4" fill="${accent}"/>`;
    }
  }
  return svg(content, pattern);
};

const stripe = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#1f4e79');
  const accent = color(pattern, 'accent', '#d9a441');
  let content = '';
  for (let x = -h; x < w + h; x += 28) {
    content += `<path d="M ${x} ${h} L ${x + h} 0" stroke="${primary}" stroke-width="12" opacity="0.85"/>`;
    content += `<path d="M ${x + 14} ${h} L ${x + h + 14} 0" stroke="${accent}" stroke-width="4" opacity="0.8"/>`;
  }
  return svg(content, pattern);
};

const radial = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const cx = w / 2;
  const cy = h / 2;
  const primary = color(pattern, 'primary', '#1f4e79');
  const accent = color(pattern, 'accent', '#d9a441');
  const points = pattern.rendererParams?.points || 8;
  let content = `<circle cx="${cx}" cy="${cy}" r="${Math.min(w, h) * 0.34}" fill="none" stroke="${primary}" stroke-width="3"/>`;
  for (let i = 0; i < points; i += 1) {
    const a = (Math.PI * 2 * i) / points;
    const x = cx + Math.cos(a) * Math.min(w, h) * 0.36;
    const y = cy + Math.sin(a) * Math.min(w, h) * 0.36;
    content += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${primary}" stroke-width="2"/>`;
    content += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5" fill="${accent}"/>`;
  }
  return svg(content, pattern);
};

const floral = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#2f5f57');
  const accent = color(pattern, 'accent', '#d9a441');
  const content = `<path d="M 20 ${h * 0.65} C ${w * 0.3} ${h * 0.2}, ${w * 0.65} ${h * 0.9}, ${w - 20} ${h * 0.35}" fill="none" stroke="${primary}" stroke-width="5" stroke-linecap="round"/><circle cx="${w * 0.35}" cy="${h * 0.38}" r="13" fill="${accent}" opacity="0.85"/><circle cx="${w * 0.67}" cy="${h * 0.55}" r="10" fill="${primary}" opacity="0.75"/>`;
  return svg(content, pattern);
};

const knot = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#5b4636');
  const content = `<path d="M 28 ${h / 2} C 56 20, 96 20, ${w - 28} ${h / 2} C 96 ${h - 20}, 56 ${h - 20}, 28 ${h / 2} Z" fill="none" stroke="${primary}" stroke-width="9" stroke-linejoin="round"/><path d="M 36 36 L ${w - 36} ${h - 36} M ${w - 36} 36 L 36 ${h - 36}" stroke="${primary}" stroke-width="7" stroke-linecap="round" opacity="0.72"/>`;
  return svg(content, pattern);
};

const fallback = (pattern) => {
  const w = pattern.tile?.width || 180;
  const h = pattern.tile?.height || 160;
  const primary = color(pattern, 'primary', '#1f4e79');
  return svg(`<rect x="24" y="24" width="${w - 48}" height="${h - 48}" fill="none" stroke="${primary}" stroke-width="4"/><path d="M 24 ${h - 24} L ${w - 24} 24" stroke="${primary}" stroke-width="3" opacity="0.7"/>`, pattern);
};

export function renderPatternSvg(pattern) {
  switch (pattern.rendererType) {
    case 'wave-repeat': return wave(pattern);
    case 'grid': return grid(pattern);
    case 'dot-repeat': return dots(pattern);
    case 'diamond-repeat': return diamond(pattern);
    case 'stripe': return stripe(pattern);
    case 'radial': return radial(pattern);
    case 'floral-symbol': return floral(pattern);
    case 'knot': return knot(pattern);
    case 'border': return stripe(pattern);
    case 'geometric-repeat': return pattern.rendererParams?.shape === 'linked-circles' ? wave(pattern) : diamond(pattern);
    default: return fallback(pattern);
  }
}
