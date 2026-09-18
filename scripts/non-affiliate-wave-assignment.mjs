export function buildNonAffiliateWaves(registry, scope, plan) {
  const inScope = new Set(Object.values(scope.classes).flat());
  const ordered = registry.items.map((item) => item.slug).filter((slug) => inScope.has(slug));

  if (ordered.length !== plan.totalTools) {
    throw new Error(`Expected ${plan.totalTools} in-scope tools, found ${ordered.length}.`);
  }

  if (plan.assignment !== 'current_registry_order_chunks') {
    throw new Error(`Unsupported assignment mode: ${plan.assignment}`);
  }

  if (!Array.isArray(plan.waveSizes) || plan.waveSizes.length !== plan.waveCount) {
    throw new Error('waveSizes must contain one entry per wave.');
  }
  if (plan.waveSizes.reduce((sum, size) => sum + size, 0) !== plan.totalTools) {
    throw new Error('waveSizes must sum to totalTools.');
  }

  const waves = [];
  let offset = 0;
  for (const size of plan.waveSizes) {
    waves.push(ordered.slice(offset, offset + size));
    offset += size;
  }

  for (let index = 0; index < waves.length; index += 1) {
    if (waves[index].length !== plan.waveSizes[index]) {
      throw new Error(`Wave ${index + 1} expected ${plan.waveSizes[index]} tools, found ${waves[index].length}.`);
    }
  }

  const flattened = waves.flat();
  if (flattened.length !== plan.totalTools || new Set(flattened).size !== plan.totalTools) {
    throw new Error('Wave assignment must cover each in-scope tool exactly once.');
  }

  return { ordered, waves };
}
