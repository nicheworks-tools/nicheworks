(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) {
    module.exports = api;
  }
  root.UnitMasterRuntimeAdapter = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  function assertData(data) {
    if (!data || typeof data !== 'object') {
      throw new Error('UnitMaster data must be an object.');
    }
    if (!Array.isArray(data.categories)) {
      throw new Error('UnitMaster data categories must be an array.');
    }
    if (!Array.isArray(data.units)) {
      throw new Error('UnitMaster data units must be an array.');
    }
  }

  function isNonEmptyString(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function getOrderedCategories(data) {
    assertData(data);
    return data.categories
      .filter((category) => category && isNonEmptyString(category.id))
      .map((category) => ({
        id: category.id,
        nameJa: category.nameJa || category.id,
        nameEn: category.nameEn || category.id,
        baseUnit: category.baseUnit ?? null
      }));
  }

  function getCategoryKeys(data) {
    return getOrderedCategories(data).map((category) => category.id);
  }

  function buildRuntimeUnits(data) {
    assertData(data);
    const result = {};

    for (const category of getOrderedCategories(data)) {
      result[category.id] = category.id === 'temp' ? [] : {};
    }

    for (const unit of data.units) {
      if (!unit || !isNonEmptyString(unit.category) || !isNonEmptyString(unit.key)) continue;
      if (!(unit.category in result)) {
        result[unit.category] = unit.category === 'temp' ? [] : {};
      }

      if (unit.category === 'temp') {
        if (!result.temp.includes(unit.key)) result.temp.push(unit.key);
        continue;
      }

      if (typeof unit.factor !== 'number' || !Number.isFinite(unit.factor)) {
        throw new Error(`Invalid factor for ${unit.category}:${unit.key}`);
      }
      result[unit.category][unit.key] = unit.factor;
    }

    return result;
  }

  function buildUnitLabels(data) {
    assertData(data);
    const labels = { ja: {}, en: {} };

    for (const category of getOrderedCategories(data)) {
      labels.ja[category.id] = {};
      labels.en[category.id] = {};
    }

    for (const unit of data.units) {
      if (!unit || !isNonEmptyString(unit.category) || !isNonEmptyString(unit.key)) continue;
      if (!labels.ja[unit.category]) labels.ja[unit.category] = {};
      if (!labels.en[unit.category]) labels.en[unit.category] = {};
      labels.ja[unit.category][unit.key] = unit.labelJa || unit.key;
      labels.en[unit.category][unit.key] = unit.labelEn || unit.key;
    }

    return labels;
  }

  function buildCategoryLabels(data) {
    const labels = { ja: {}, en: {} };
    for (const category of getOrderedCategories(data)) {
      labels.ja[category.id] = category.nameJa || category.id;
      labels.en[category.id] = category.nameEn || category.id;
    }
    return labels;
  }

  function adaptUnitMasterData(data) {
    assertData(data);
    return {
      categoryKeys: getCategoryKeys(data),
      categories: getOrderedCategories(data),
      units: buildRuntimeUnits(data),
      unitLabels: buildUnitLabels(data),
      categoryLabels: buildCategoryLabels(data)
    };
  }

  return {
    adaptUnitMasterData,
    buildCategoryLabels,
    buildRuntimeUnits,
    buildUnitLabels,
    getCategoryKeys,
    getOrderedCategories
  };
});
