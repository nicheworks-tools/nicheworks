export function buildNonAffiliateWaves(registry, scope, plan) {
  const inScope = new Set(Object.values(scope.classes).flat());
  const ordered = registry.items.map((item) => item.slug).filter((slug) => inScope.has(slug));

  if (ordered.length !== plan.totalTools) {
    throw new Error(`Expected ${plan.totalTools} in-scope tools, found ${ordered.length}.`);
  }

  if (plan.assignment !== 'frozen_baseline_waves_plus_reclassified_additions') {
    throw new Error(`Unsupported assignment mode: ${plan.assignment}`);
  }

  const lateAdditions = Array.isArray(plan.lateAdditions) ? plan.lateAdditions : [];
  const lateSet = new Set(lateAdditions);
  if (lateSet.size !== lateAdditions.length) {
    throw new Error('lateAdditions contains duplicate slugs.');
  }
  for (const slug of lateAdditions) {
    if (!inScope.has(slug)) throw new Error(`Late addition is not in non-affiliate scope: ${slug}`);
  }

  const baselineOrdered = ordered.filter((slug) => !lateSet.has(slug));
  const lateOrdered = ordered.filter((slug) => lateSet.has(slug));
  const baselineWaveCount = plan.waveCount - 1;
  const expectedBaseline = baselineWaveCount * plan.waveSize;

  if (baselineOrdered.length !== expectedBaseline) {
    throw new Error(`Expected ${expectedBaseline} frozen-baseline tools, found ${baselineOrdered.length}.`);
  }
  if (lateOrdered.length !== lateAdditions.length) {
    throw new Error(`Expected ${lateAdditions.length} late additions, found ${lateOrdered.length}.`);
  }

  const waves = Array.from({ length: baselineWaveCount }, (_, index) =>
    baselineOrdered.slice(index * plan.waveSize, (index + 1) * plan.waveSize)
  );
  waves.push(lateOrdered);

  if (!Array.isArray(plan.waveSizes) || plan.waveSizes.length !== plan.waveCount) {
    throw new Error('waveSizes must contain one entry per wave.');
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
