export const REQUIRED_PATTERN_FIELDS = [
  'id',
  'slug',
  'nameEn',
  'nameJa',
  'aliasesEn',
  'aliasesJa',
  'regions',
  'cultures',
  'categories',
  'motifs',
  'useCases',
  'summaryEn',
  'summaryJa',
  'meaningEn',
  'meaningJa',
  'contextEn',
  'contextJa',
  'usageNotesEn',
  'usageNotesJa',
  'cautionLevel',
  'cautionTags',
  'colorSlots',
  'defaultColors',
  'tile',
  'rendererType',
  'rendererParams',
  'relatedIds',
  'sourceNotes',
  'exportSafety'
];

export const CAUTION_LEVELS = ['low', 'medium', 'high', 'restricted', 'unknown'];

export const CAUTION_TAGS = [
  'traditional',
  'religious',
  'sacred',
  'ceremonial',
  'indigenous',
  'funerary',
  'royal',
  'tribal',
  'commercial-caution',
  'unknown-origin',
  'modern-reconstruction'
];

export const COLOR_SLOTS = ['background', 'primary', 'secondary', 'accent', 'line', 'highlight'];

export const RENDERER_TYPES = [
  'geometric-repeat',
  'wave-repeat',
  'stripe',
  'grid',
  'dot-repeat',
  'diamond-repeat',
  'radial',
  'border',
  'floral-symbol',
  'knot',
  'custom-path'
];

export const EXPORT_FORMATS = ['svg', 'png', 'css'];
