let renderSequence = 0;

function normalizeIdPrefix(value) {
  const normalized = String(value || "nw-j2m")
    .trim()
    .replace(/[^A-Za-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return normalized || "nw-j2m";
}

function normalizeConfig(styleConfig) {
  if (!styleConfig || typeof styleConfig !== "object" || Array.isArray(styleConfig)) return {};
  return { ...styleConfig };
}

export function createMermaidRenderer(mermaid, options = {}) {
  if (!mermaid || typeof mermaid.initialize !== "function" || typeof mermaid.render !== "function") {
    throw new TypeError("A Mermaid API object with initialize() and render() is required.");
  }

  const idPrefix = normalizeIdPrefix(options.idPrefix);

  return async function renderMermaidLocally(mermaidCode, styleConfig = {}) {
    if (typeof mermaidCode !== "string" || !mermaidCode.trim()) {
      throw new TypeError("Mermaid source is required.");
    }

    const config = {
      ...normalizeConfig(styleConfig),
      startOnLoad: false,
      securityLevel: "strict"
    };

    mermaid.initialize(config);
    renderSequence += 1;
    const renderId = `${idPrefix}-${renderSequence}`;
    const result = await mermaid.render(renderId, mermaidCode);
    const svg = typeof result === "string" ? result : result?.svg;
    if (typeof svg !== "string" || !/<svg\b/i.test(svg)) {
      throw new TypeError("Mermaid render() did not return SVG markup.");
    }

    return { svg };
  };
}
