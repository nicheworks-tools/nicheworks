import { patterns } from '../js/data/patterns.js';
import {
  CAUTION_LEVELS,
  COLOR_SLOTS,
  REQUIRED_PATTERN_FIELDS,
  RENDERER_TYPES
} from '../js/data/schema.js';

const errors = [];
const ids = new Set();
const slugs = new Set();

const isObject = (value) => value && typeof value === 'object' && !Array.isArray(value);
const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isStringArray = (value) => Array.isArray(value) && value.every((item) => typeof item === 'string');
const isHex = (value) => typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value);

patterns.forEach((pattern, index) => {
  const label = pattern?.id || `pattern at index ${index}`;

  REQUIRED_PATTERN_FIELDS.forEach((field) => {
    if (!(field in pattern)) errors.push(`${label}: missing required field ${field}`);
  });

  if (!isNonEmptyString(pattern.id)) errors.push(`${label}: id must be a non-empty string`);
  if (!isNonEmptyString(pattern.slug)) errors.push(`${label}: slug must be a non-empty string`);
  if (ids.has(pattern.id)) errors.push(`${label}: duplicate id ${pattern.id}`);
  if (slugs.has(pattern.slug)) errors.push(`${label}: duplicate slug ${pattern.slug}`);
  if (pattern.id) ids.add(pattern.id);
  if (pattern.slug) slugs.add(pattern.slug);

  ['nameEn', 'nameJa', 'summaryEn', 'summaryJa', 'meaningEn', 'meaningJa', 'contextEn', 'contextJa', 'usageNotesEn', 'usageNotesJa'].forEach((field) => {
    if (field in pattern && !isNonEmptyString(pattern[field])) errors.push(`${label}: ${field} must be a non-empty string`);
  });

  ['aliasesEn', 'aliasesJa', 'regions', 'cultures', 'categories', 'motifs', 'useCases', 'cautionTags', 'colorSlots', 'relatedIds', 'sourceNotes'].forEach((field) => {
    if (field in pattern && !isStringArray(pattern[field])) errors.push(`${label}: ${field} must be an array of strings`);
  });

  if (pattern.cautionLevel && !CAUTION_LEVELS.includes(pattern.cautionLevel)) {
    errors.push(`${label}: invalid cautionLevel ${pattern.cautionLevel}`);
  }

  if (pattern.rendererType && !RENDERER_TYPES.includes(pattern.rendererType)) {
    errors.push(`${label}: invalid rendererType ${pattern.rendererType}`);
  }

  if (pattern.colorSlots) {
    pattern.colorSlots.forEach((slot) => {
      if (!COLOR_SLOTS.includes(slot)) errors.push(`${label}: invalid color slot ${slot}`);
    });
  }

  if (pattern.defaultColors) {
    if (!isObject(pattern.defaultColors)) {
      errors.push(`${label}: defaultColors must be an object`);
    } else if (pattern.colorSlots) {
      pattern.colorSlots.forEach((slot) => {
        if (!(slot in pattern.defaultColors)) errors.push(`${label}: defaultColors missing ${slot}`);
        if (slot in pattern.defaultColors && !isHex(pattern.defaultColors[slot])) errors.push(`${label}: defaultColors.${slot} must be a hex color`);
      });
    }
  }

  if (pattern.tile) {
    if (!isObject(pattern.tile)) errors.push(`${label}: tile must be an object`);
    if (!Number.isFinite(pattern.tile?.width) || pattern.tile.width <= 0) errors.push(`${label}: tile.width must be a positive number`);
    if (!Number.isFinite(pattern.tile?.height) || pattern.tile.height <= 0) errors.push(`${label}: tile.height must be a positive number`);
  }

  if (pattern.exportSafety) {
    if (!isObject(pattern.exportSafety)) errors.push(`${label}: exportSafety must be an object`);
    ['allowSvg', 'allowPng', 'allowCss', 'requireWarning'].forEach((field) => {
      if (field in pattern.exportSafety && typeof pattern.exportSafety[field] !== 'boolean') {
        errors.push(`${label}: exportSafety.${field} must be boolean`);
      }
    });
  }
});

patterns.forEach((pattern) => {
  const label = pattern?.id || 'unknown pattern';
  if (pattern.relatedIds) {
    pattern.relatedIds.forEach((relatedId) => {
      if (!ids.has(relatedId)) errors.push(`${label}: related id not found: ${relatedId}`);
    });
  }
});

if (errors.length) {
  console.error('Pattern Atlas data check failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(`Pattern Atlas data check passed (${patterns.length} patterns).`);
