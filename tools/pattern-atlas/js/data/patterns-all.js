import { patterns as basePatterns } from './patterns.js';
import { patternsExtra01 } from './patterns-extra-01.js';
import { patternsExtra02 } from './patterns-extra-02.js';

const mergedPatterns = [
  ...basePatterns,
  ...patternsExtra01,
  ...patternsExtra02
];

export const patterns = Array.from(
  new Map(mergedPatterns.map((pattern) => [pattern.id, pattern])).values()
);
