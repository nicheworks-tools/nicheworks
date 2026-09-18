export function buildNonAffiliateWaves(registry, scope, plan) {
  const inScope = new Set(Object.values(scope.classes).flat());
  const scopeOrdered = registry.items.map((item) => item.slug).filter((slug) => inScope.has(slug));

  if (scopeOrdered.length !== plan.totalTools) {
    throw new Error(`Expected ${plan.totalTools} in-scope tools, found ${scopeOrdered.length}.`);
  }

  if (plan.assignment !== 'current_registry_order_audited_chunks') {
    throw new Error(`Unsupported assignment mode: ${plan.assignment}`);
  }

  const pending = Array.isArray(plan.pendingSlugs) ? plan.pendingSlugs : [];
  const pendingSet = new Set(pending);
  if (pendingSet.size !== pending.length) throw new Error('pendingSlugs contains duplicates.');
  for (const slug of pending) {
    if (!inScope.has(slug)) throw new Error(`Pending slug is not in non-affiliate scope: ${slug}`);
  }

  const ordered = scopeOrdered.filter((slug) => !pendingSet.has(slug));
  if (ordered.length !== plan.auditedTools) {
    throw new Error(`Expected ${plan.auditedTools} audited tools, found ${ordered.length}.`);
  }

  if (!Array.isArray(plan.waveSizes) || plan.waveSizes.length !== plan.waveCount) {
    throw new Error('waveSizes must contain one entry per wave.');
  }
  if (plan.waveSizes.reduce((sum, size) => sum + size, 0) !== plan.auditedTools) {
    throw new Error('waveSizes must sum to auditedTools.');
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
  if (flattened.length !== plan.auditedTools || new Set(flattened).size !== plan.auditedTools) {
    throw new Error('Wave assignment must cover each audited in-scope tool exactly once.');
  }

  return { scopeOrdered, ordered, pending, waves };
}
