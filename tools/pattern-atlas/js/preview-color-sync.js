import { renderPatternSvg } from './renderers/index.js';

const encodeSvg = (value) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(value)}`;

export function setupPreviewColorSync({ root }) {
  const apply = (pattern) => {
    if (!pattern) return;
    const svg = renderPatternSvg(pattern);
    const uri = encodeSvg(svg);

    root.querySelectorAll('[data-pa-preview-panel] .pa-svg-preview').forEach((box) => {
      box.innerHTML = svg;
    });

    root.querySelectorAll('[data-pa-preview-panel] .pa-use-preview-box').forEach((box) => {
      box.style.backgroundImage = `url("${uri}")`;
    });
  };

  root.addEventListener('pattern-atlas:colors-change', (event) => {
    apply(event.detail?.pattern);
  });
}
