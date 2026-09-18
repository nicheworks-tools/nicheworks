(() => {
  "use strict";

  const POWER_BANK_EFFICIENCY = 0.67;
  const POWER_BANK_CAPACITIES = [5000, 10000, 20000];

  const state = {
    lang: "ja",
    phones: [],
    accessories: [],
    selectedId: null,
    loadError: false
  };

  const messages = {
    ja: {
      allManufacturers: "すべてのメーカー",
      allConnectors: "すべての端子",
      allYears: "すべての発売年",
      sortNewest: "新しい順",
      sortLightest: "軽い順",
      sortCompact: "小さい順",
      dataReady: (n) => `${n}機種`,
      dataPreparing: "データ準備中",
      dataError: "データ読込エラー",
      emptyTitle: "該当する機種がありません",
      emptyBody: "検索条件を変更してください。",
      preparingTitle: "端末データがありません",
      preparingBody: "検証済みデータがまだ登録されていません。",
      loadErrorTitle: "データを読み込めませんでした",
      loadErrorBody: "ページを再読み込みしてください。問題が続く場合は後でもう一度お試しください。",
      size: "サイズ",
      weight: "重量",
      port: "充電端子",
      device: "本体",
      dimensions: "外形寸法",
      dimensionsFolded: "外形寸法（折りたたみ時）",
      dimensionsUnfolded: "外形寸法（展開時）",
      foldedShort: "折りたたみ時",
      display: "画面",
      water: "防水・防塵",
      charging: "充電",
      chargerGuidance: "充電器目安",
      maxWired: "端末側の有線充電上限",
      standard: "規格",
      pps: "PPS",
      wireless: "ワイヤレス",
      battery: "バッテリー容量",
      cableIncluded: "同梱ケーブル",
      adapterIncluded: "ACアダプター",
      included: "同梱",
      notIncluded: "別売",
      unknown: "不明",
      notWaterDustResistant: "非防水・非防塵",
      supported: "対応",
      required: "必須",
      notSupported: "非対応",
      recharge: "モバイルバッテリー充電回数の目安",
      approximate: "約",
      times: "回",
      rechargeUnknown: "バッテリー容量が未確認のため算出していません。",
      rechargeNote: "変換効率67%を用いた簡易推定です。実際は使用状況・温度・ケーブル・バッテリー状態などで変動します。",
      thirdPartyBattery: "メーカー非公表のため、維持対象の第三者参考値です。",
      whatYouNeed: "このスマホで必要なもの",
      affiliatePending: "購入候補を表示できません",
      affiliatePendingBody: "互換カテゴリは確認済み充電条件から判定しています。購入前にAmazonの商品ページで端子・規格・出力条件をご確認ください。",
      officialInfo: "公式情報",
      officialSpecs: "メーカー仕様 ↗",
      officialManual: "公式マニュアル ↗",
      verifiedAt: "最終確認",
      quickCheck: "Quick Check"
    },
    en: {
      allManufacturers: "All manufacturers",
      allConnectors: "All ports",
      allYears: "All release years",
      sortNewest: "Newest",
      sortLightest: "Lightest",
      sortCompact: "Smallest",
      dataReady: (n) => `${n} models`,
      dataPreparing: "Data in preparation",
      dataError: "Data load error",
      emptyTitle: "No matching models",
      emptyBody: "Change the search or filters.",
      preparingTitle: "No verified phone data",
      preparingBody: "No verified phone records are currently registered.",
      loadErrorTitle: "Could not load data",
      loadErrorBody: "Reload the page. If the problem continues, try again later.",
      size: "Size",
      weight: "Weight",
      port: "Charging port",
      device: "Device",
      dimensions: "Dimensions",
      dimensionsFolded: "Dimensions (folded)",
      dimensionsUnfolded: "Dimensions (unfolded)",
      foldedShort: "folded",
      display: "Display",
      water: "Water / dust",
      charging: "Charging",
      chargerGuidance: "Charger guidance",
      maxWired: "Max wired charging",
      standard: "Standard",
      pps: "PPS",
      wireless: "Wireless",
      battery: "Battery capacity",
      cableIncluded: "Cable included",
      adapterIncluded: "Wall charger",
      included: "Included",
      notIncluded: "Not included",
      unknown: "Unknown",
      notWaterDustResistant: "Not water or dust resistant",
      supported: "Supported",
      required: "Required",
      notSupported: "Not supported",
      recharge: "Estimated power-bank recharges",
      approximate: "Approx.",
      times: "×",
      rechargeUnknown: "Not calculated because battery capacity has not been verified.",
      rechargeNote: "Simple estimate using 67% conversion efficiency. Real results vary with use, temperature, cable, battery condition, and other factors.",
      thirdPartyBattery: "Reference value because the manufacturer does not publish the maintained mAh figure.",
      whatYouNeed: "What you need",
      affiliatePending: "No purchase suggestions available",
      affiliatePendingBody: "Compatibility classes are derived from verified charging facts. Confirm connector, protocol, and output requirements on Amazon before purchase.",
      officialInfo: "Official information",
      officialSpecs: "Official specs ↗",
      officialManual: "Official manual ↗",
      verifiedAt: "Last checked",
      quickCheck: "Quick Check"
    }
  };

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  const msg = (key) => messages[state.lang][key];

  function readSavedLang() {
    try {
      const saved = localStorage.getItem("nw_lang");
      if (saved === "ja" || saved === "en") return saved;
    } catch (_) {}
    return (navigator.language || "").toLowerCase().startsWith("ja") ? "ja" : "en";
  }

  function applyLanguage(lang) {
    state.lang = lang === "en" ? "en" : "ja";
    document.documentElement.lang = state.lang;
    $$('[data-i18n]').forEach((node) => {
      node.hidden = node.dataset.i18n !== state.lang;
    });
    $$('.nw-lang-switch button').forEach((button) => {
      button.classList.toggle("active", button.dataset.lang === state.lang);
    });
    const search = $('#searchInput');
    if (search) search.placeholder = search.dataset[`placeholder${state.lang === "ja" ? "Ja" : "En"}`] || "";
    try { localStorage.setItem("nw_lang", state.lang); } catch (_) {}
    rebuildControls();
    render();
  }

  function normalizePhone(raw) {
    if (!raw || typeof raw !== "object") return null;
    if (!raw.id || !raw.manufacturer || !raw.model) return null;
    return raw;
  }

  async function loadData() {
    try {
      const [phonesResponse, accessoriesResponse] = await Promise.all([
        fetch('./data/phones.json', { cache: 'no-store' }),
        fetch('./data/accessories.json', { cache: 'no-store' })
      ]);
      if (!phonesResponse.ok || !accessoriesResponse.ok) throw new Error('data fetch failed');
      const phonesPayload = await phonesResponse.json();
      const accessoriesPayload = await accessoriesResponse.json();
      state.phones = Array.isArray(phonesPayload.phones) ? phonesPayload.phones.map(normalizePhone).filter(Boolean) : [];
      state.accessories = Array.isArray(accessoriesPayload.accessories) ? accessoriesPayload.accessories : [];
      state.selectedId = state.phones[0]?.id || null;
      state.loadError = false;
    } catch (_) {
      state.phones = [];
      state.accessories = [];
      state.selectedId = null;
      state.loadError = true;
    }
    rebuildControls();
    render();
  }

  function unique(values) {
    return [...new Set(values.filter((v) => v !== null && v !== undefined && v !== ""))];
  }

  function currentSelectValue(id, fallback = "all") {
    return $(id)?.value || fallback;
  }

  function fillSelect(select, options, selectedValue) {
    select.innerHTML = options.map(({ value, label }) => `<option value="${escapeHtml(String(value))}">${escapeHtml(label)}</option>`).join('');
    if (options.some((option) => String(option.value) === String(selectedValue))) select.value = selectedValue;
  }

  function rebuildControls() {
    const manufacturerValue = currentSelectValue('#manufacturerFilter');
    const connectorValue = currentSelectValue('#connectorFilter');
    const yearValue = currentSelectValue('#yearFilter');
    const sortValue = currentSelectValue('#sortSelect', 'newest');
    const manufacturers = unique(state.phones.map((phone) => phone.manufacturer)).sort((a, b) => a.localeCompare(b));
    const connectors = unique(state.phones.map((phone) => phone.charging?.connector)).sort((a, b) => a.localeCompare(b));
    const years = unique(state.phones.map((phone) => phone.releaseYear)).sort((a, b) => Number(b) - Number(a));

    fillSelect($('#manufacturerFilter'), [{ value: 'all', label: msg('allManufacturers') }, ...manufacturers.map((v) => ({ value: v, label: v }))], manufacturerValue);
    fillSelect($('#connectorFilter'), [{ value: 'all', label: msg('allConnectors') }, ...connectors.map((v) => ({ value: v, label: v }))], connectorValue);
    fillSelect($('#yearFilter'), [{ value: 'all', label: msg('allYears') }, ...years.map((v) => ({ value: v, label: String(v) }))], yearValue);
    fillSelect($('#sortSelect'), [
      { value: 'newest', label: msg('sortNewest') },
      { value: 'lightest', label: msg('sortLightest') },
      { value: 'compact', label: msg('sortCompact') }
    ], sortValue);
  }

  function filteredPhones() {
    const query = ($('#searchInput').value || '').trim().toLowerCase();
    const manufacturer = $('#manufacturerFilter').value;
    const connector = $('#connectorFilter').value;
    const year = $('#yearFilter').value;
    const sort = $('#sortSelect').value;
    const result = state.phones.filter((phone) => {
      const aliases = Array.isArray(phone.aliases) ? phone.aliases : [];
      const haystack = [phone.manufacturer, phone.model, ...aliases].join(' ').toLowerCase();
      return (!query || haystack.includes(query))
        && (manufacturer === 'all' || phone.manufacturer === manufacturer)
        && (connector === 'all' || phone.charging?.connector === connector)
        && (year === 'all' || String(phone.releaseYear) === year);
    });

    if (sort === 'lightest') {
      result.sort((a, b) => numberOrInfinity(sortWeight(a)) - numberOrInfinity(sortWeight(b)));
    } else if (sort === 'compact') {
      result.sort((a, b) => numberOrInfinity(sortDimensions(a)?.widthMm) - numberOrInfinity(sortDimensions(b)?.widthMm) || numberOrInfinity(sortDimensions(a)?.heightMm) - numberOrInfinity(sortDimensions(b)?.heightMm));
    } else {
      result.sort((a, b) => numberOrZero(b.releaseYear) - numberOrZero(a.releaseYear) || a.model.localeCompare(b.model));
    }
    return result;
  }

  function numberOrInfinity(value) { return Number.isFinite(Number(value)) ? Number(value) : Number.POSITIVE_INFINITY; }
  function numberOrZero(value) { return Number.isFinite(Number(value)) ? Number(value) : 0; }
  function numberOrNull(value) { return Number.isFinite(Number(value)) ? Number(value) : null; }

  function physicalVariants(phone) {
    return Array.isArray(phone?.physicalVariants) ? phone.physicalVariants : [];
  }

  function sortWeight(phone) {
    if (Number.isFinite(Number(phone?.weightG))) return Number(phone.weightG);
    const values = physicalVariants(phone)
      .map((variant) => Number(variant?.weightG))
      .filter(Number.isFinite);
    return values.length ? Math.min(...values) : null;
  }

  function weightLabel(phone) {
    if (Number.isFinite(Number(phone?.weightG))) return `${formatNumber(phone.weightG)} g`;
    const values = physicalVariants(phone)
      .map((variant) => Number(variant?.weightG))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (!values.length) return '—';
    const min = values[0];
    const max = values[values.length - 1];
    return min === max ? `${formatNumber(min)} g` : `${formatNumber(min)}–${formatNumber(max)} g`;
  }

  function localizedVariantLabel(variant) {
    const preferred = state.lang === 'ja' ? variant?.labelJa : variant?.labelEn;
    const fallback = state.lang === 'ja' ? variant?.labelEn : variant?.labelJa;
    return preferred || fallback || variant?.key || '—';
  }

  function render() {
    renderDataState();
    renderList();
    renderDetails();
  }

  function renderDataState() {
    const node = $('#dataState');
    if (state.loadError) node.textContent = msg('dataError');
    else if (!state.phones.length) node.textContent = msg('dataPreparing');
    else node.textContent = msg('dataReady')(state.phones.length);
  }

  function renderList() {
    const list = $('#phoneList');
    if (state.loadError) {
      list.innerHTML = emptyHtml(msg('loadErrorTitle'), msg('loadErrorBody'));
      return;
    }
    if (!state.phones.length) {
      list.innerHTML = emptyHtml(msg('preparingTitle'), msg('preparingBody'));
      return;
    }
    const phones = filteredPhones();
    if (!phones.length) {
      list.innerHTML = emptyHtml(msg('emptyTitle'), msg('emptyBody'));
      return;
    }

    list.innerHTML = phones.map((phone) => {
      const dimensions = compactDimensions(phone);
      const weight = weightLabel(phone);
      const connector = phone.charging?.connector || '—';
      const active = phone.id === state.selectedId ? ' active' : '';
      return `<div class="phone-row${active}" data-phone-id="${escapeHtml(phone.id)}" tabindex="0" role="button">
        <div class="model"><strong>${escapeHtml(phone.model)}</strong><span>${escapeHtml(phone.manufacturer)}${phone.releaseYear ? ` / ${escapeHtml(String(phone.releaseYear))}` : ''}</span><div class="mobile-meta">${escapeHtml([dimensions, weight, connector].filter(Boolean).join(' · '))}</div></div>
        <div class="cell">${escapeHtml(dimensions)}</div>
        <div class="cell">${escapeHtml(weight)}</div>
        <div class="port-cell"><span class="port-pill">${escapeHtml(connector)}</span></div>
        <div class="chev" aria-hidden="true">›</div>
      </div>`;
    }).join('');

    $$('.phone-row').forEach((row) => {
      const select = () => {
        state.selectedId = row.dataset.phoneId;
        renderList();
        renderDetails();
        if (window.matchMedia('(max-width: 900px)').matches) openSheet();
      };
      row.addEventListener('click', select);
      row.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          select();
        }
      });
    });
  }

  function renderDetails() {
    const phone = state.phones.find((item) => item.id === state.selectedId) || null;
    const html = phone ? detailHtml(phone) : emptyHtml(state.loadError ? msg('loadErrorTitle') : msg('preparingTitle'), state.loadError ? msg('loadErrorBody') : msg('preparingBody'));
    $('#desktopDetail').innerHTML = html;
    $('#sheetDetail').innerHTML = html;
  }

  function detailHtml(phone) {
    const dimensions = fullDimensions(phone);
    const weight = weightLabel(phone);
    const connector = phone.charging?.connector || '—';
    const display = phone.displayInch ? `${formatNumber(phone.displayInch)} in` : '—';
    const water = waterLabel(phone);
    const protocols = protocolLabel(phone);
    const guidanceW = numberOrNull(phone.charging?.wiredRecommendedW);
    const charger = guidanceW ? `${formatNumber(guidanceW)}W+` : '—';
    const maxWired = sourceBackedMaxWired(phone);
    const pps = ppsLabel(phone.charging?.pps);
    const wireless = wirelessLabel(phone.charging);
    const battery = phone.charging?.battery || {};
    const batteryLabel = battery.capacityMah ? `${formatNumber(battery.capacityMah)} mAh${battery.valueClass === 'third_party_reference' ? '*' : ''}` : '—';
    const cable = includedLabel(phone.included?.cable);
    const adapter = includedLabel(phone.included?.adapter);
    const accessories = resolvedAccessories(phone);

    return `<div class="detail-top">
      <div class="detail-title"><div><h2>${escapeHtml(phone.model)}</h2><p>${escapeHtml(phone.manufacturer)}${phone.releaseYear ? ` / ${escapeHtml(String(phone.releaseYear))}` : ''}</p></div><span class="status-badge">${escapeHtml(msg('quickCheck'))}</span></div>
      <div class="key-strip"><div class="key-box"><span>${escapeHtml(msg('size'))}</span><strong>${escapeHtml(compactDimensions(phone))}</strong></div><div class="key-box"><span>${escapeHtml(msg('weight'))}</span><strong>${escapeHtml(weight)}</strong></div><div class="key-box"><span>${escapeHtml(msg('port'))}</span><strong>${escapeHtml(connector)}</strong></div></div>
    </div>
    <div class="detail-body">
      <section class="detail-section"><h3>${escapeHtml(msg('device'))}</h3>${dimensionRowsHtml(phone)}${kv(msg('display'), display)}${kv(msg('water'), water)}</section>
      <section class="detail-section"><h3>${escapeHtml(msg('charging'))}</h3>${kv(msg('port'), connector)}${kv(msg('chargerGuidance'), charger)}${maxWired ? kv(msg('maxWired'), `${formatNumber(maxWired)}W`) : ''}${kv(msg('standard'), protocols)}${kv(msg('pps'), pps)}${kv(msg('wireless'), wireless)}${kv(msg('battery'), batteryLabel)}${kv(msg('cableIncluded'), cable)}${kv(msg('adapterIncluded'), adapter)}${battery.valueClass === 'third_party_reference' ? `<p class="detail-note">* ${escapeHtml(msg('thirdPartyBattery'))}</p>` : ''}</section>
      <section class="detail-section"><h3>${escapeHtml(msg('recharge'))}</h3>${rechargeHtml(battery)}<p class="detail-note">${escapeHtml(msg('rechargeNote'))}</p></section>
      <section class="detail-section"><h3>${escapeHtml(msg('whatYouNeed'))}</h3>${accessoryHtml(accessories)}</section>
      <section class="detail-section"><h3>${escapeHtml(msg('officialInfo'))}</h3>${officialLinksHtml(phone.sources || {})}</section>
    </div>`;
  }

  function waterLabel(phone) {
    if (typeof phone.waterRating === 'string' && phone.waterRating.trim()) return phone.waterRating;
    if (phone.waterStatus === 'not_resistant') return msg('notWaterDustResistant');
    return '—';
  }

  function kv(label, value) {
    return `<div class="kv"><span>${escapeHtml(label)}</span><b>${escapeHtml(value || '—')}</b></div>`;
  }

  function rechargeHtml(battery) {
    if (!battery?.capacityMah || !Number.isFinite(Number(battery.capacityMah))) {
      return `<p class="detail-note">${escapeHtml(msg('rechargeUnknown'))}</p>`;
    }
    return `<div class="charge-grid">${POWER_BANK_CAPACITIES.map((capacity) => {
      const count = (capacity * POWER_BANK_EFFICIENCY / Number(battery.capacityMah)).toFixed(1);
      return `<div class="charge-card"><strong>${escapeHtml(msg('approximate'))} ${escapeHtml(count)}${escapeHtml(msg('times'))}</strong><span>${capacity.toLocaleString()}mAh</span></div>`;
    }).join('')}</div>`;
  }

  function accessoryKeysFor(phone) {
    const keys = new Set(Array.isArray(phone.affiliateKeys) ? phone.affiliateKeys : []);
    const connector = String(phone.charging?.connector || '').toLowerCase();
    const manufacturer = String(phone.manufacturer || '').toLowerCase();
    const watts = numberOrNull(phone.charging?.wiredRecommendedW);
    const pps = phone.charging?.pps;
    const protocols = Array.isArray(phone.charging?.protocols) ? phone.charging.protocols.join(' ').toLowerCase() : '';
    const wireless = String(phone.charging?.wirelessStandard || '').toLowerCase();

    if (connector === 'usb-c') keys.add('cable-usbc-usbc');
    else if (connector === 'lightning') keys.add('cable-usbc-lightning');

    if (protocols.includes('supervooc')) keys.add('charger-oppo-supervooc');
    if (protocols.includes('hypercharge') || protocols.includes('turbocharge')) keys.add('charger-xiaomi-hypercharge');
    if (protocols.includes('turbopower')) keys.add('charger-motorola-turbopower');

    if (manufacturer === 'apple' && watts) {
      if (watts >= 60) keys.add('charger-avs-60w');
      else if (watts >= 40) keys.add('charger-pd-40w');
      else keys.add('charger-pd-20w');
    } else if (manufacturer === 'google' && pps === 'required' && watts) {
      keys.add(watts > 30 ? 'charger-pps-45w' : 'charger-pps-30w');
    } else if (manufacturer === 'samsung' && watts && protocols.includes('super fast charging')) {
      if (watts >= 60) keys.add('charger-samsung-60w');
      else if (watts >= 45) keys.add('charger-samsung-45w');
      else keys.add('charger-samsung-25w');
    } else if (manufacturer === 'samsung' && watts && (protocols.includes('adaptive fast charging') || protocols.includes('qc2.0'))) {
      keys.add('charger-samsung-afc-15w');
    } else if (protocols.includes('usb pd') && watts) {
      if (watts <= 20) keys.add('charger-pd-20w');
      else if (watts <= 30) keys.add('charger-pd-30w');
      else keys.add('charger-pd-45w');
    }

    if (wireless.includes('qi2') && wireless.includes('compatible case')) keys.add('charger-qi2-case-required');
    else if (wireless.includes('qi2')) keys.add('charger-qi2');
    else if (wireless.includes('qi')) keys.add('charger-qi');

    if (connector === 'usb-c' || connector === 'lightning') keys.add('powerbank-10000-usbc');
    return [...keys];
  }

  function resolvedAccessories(phone) {
    return accessoryKeysFor(phone)
      .map((key) => state.accessories.find((item) => item.key === key))
      .filter(Boolean);
  }

  function accessoryHtml(accessories) {
    if (!accessories.length) {
      return `<div class="recommend"><strong>${escapeHtml(msg('affiliatePending'))}</strong><p class="detail-note">${escapeHtml(msg('affiliatePendingBody'))}</p><div class="affiliate-grid"></div></div>`;
    }
    return `<div class="recommend">${accessories.map((item) => `<div class="need"><span class="check">✓</span><div><strong>${escapeHtml(state.lang === 'ja' ? item.labelJa : item.labelEn)}</strong><small>${escapeHtml(state.lang === 'ja' ? (item.noteJa || '') : (item.noteEn || ''))}</small></div></div>`).join('')}<p class="detail-note">${escapeHtml(msg('affiliatePendingBody'))}</p><div class="affiliate-grid"></div></div>`;
  }

  function protocolLabel(phone) {
    const raw = Array.isArray(phone.charging?.protocols) ? [...phone.charging.protocols] : [];
    const manufacturer = String(phone.manufacturer || '').toLowerCase();
    const watts = numberOrNull(phone.charging?.wiredRecommendedW);
    if (manufacturer === 'apple' && String(phone.charging?.connector || '').toLowerCase() === 'usb-c') {
      raw.push(watts && watts >= 60 ? 'USB PD 3.1 AVS' : 'USB PD');
    } else if (manufacturer === 'google' && phone.charging?.pps === 'required') {
      raw.push('USB PD', 'PPS');
    }
    const labels = unique(raw);
    return labels.length ? labels.join(' / ') : '—';
  }

  function sourceBackedMaxWired(phone) {
    return numberOrNull(phone.charging?.wiredMaxW);
  }

  function officialLinksHtml(sources) {
    const links = [];
    if (sources.specificationsUrl) links.push(`<a href="${escapeAttribute(sources.specificationsUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(msg('officialSpecs'))}</a>`);
    if (sources.manualUrl) links.push(`<a href="${escapeAttribute(sources.manualUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(msg('officialManual'))}</a>`);
    const date = sources.verifiedAt ? `<p class="detail-note">${escapeHtml(msg('verifiedAt'))}: ${escapeHtml(sources.verifiedAt)}</p>` : '';
    return `${links.length ? `<div class="official-links">${links.join('')}</div>` : '<span>—</span>'}${date}`;
  }

  function isFoldable(phone) {
    return phone?.formFactor === 'foldable';
  }

  function sortDimensions(phone) {
    return isFoldable(phone) ? phone.dimensionsFolded : phone.dimensions;
  }

  function dimensionString(dimensions) {
    const h = dimensions?.heightMm;
    const w = dimensions?.widthMm;
    const d = dimensions?.depthMm;
    const dMin = dimensions?.depthMmMin;
    const dMax = dimensions?.depthMmMax;
    if (!h || !w) return '—';
    const hasDepth = d !== null && d !== undefined;
    const hasDepthRange = dMin !== null && dMin !== undefined && dMax !== null && dMax !== undefined;
    const depth = hasDepth ? formatNumber(d) : hasDepthRange ? `${formatNumber(dMin)}–${formatNumber(dMax)}` : null;
    return [formatNumber(h), formatNumber(w), depth].filter((value) => value !== null && value !== undefined).join(' × ') + ' mm';
  }

  function compactDimensions(phone) {
    const dimensions = sortDimensions(phone);
    const h = dimensions?.heightMm;
    const w = dimensions?.widthMm;
    if (!h || !w) return '—';
    const suffix = isFoldable(phone) ? ` (${msg('foldedShort')})` : '';
    return `${formatNumber(h)} × ${formatNumber(w)} mm${suffix}`;
  }

  function fullDimensions(phone) {
    const dimensions = sortDimensions(phone);
    const variants = physicalVariants(phone);
    if (!variants.length) return dimensionString(dimensions);
    const depths = variants
      .map((variant) => Number(variant?.depthMm))
      .filter(Number.isFinite)
      .sort((a, b) => a - b);
    if (!depths.length) return dimensionString(dimensions);
    const min = depths[0];
    const max = depths[depths.length - 1];
    return dimensionString({
      ...dimensions,
      ...(min === max ? { depthMm: min } : { depthMmMin: min, depthMmMax: max })
    });
  }

  function dimensionRowsHtml(phone) {
    if (isFoldable(phone)) {
      return kv(msg('dimensionsFolded'), dimensionString(phone.dimensionsFolded))
        + kv(msg('dimensionsUnfolded'), dimensionString(phone.dimensionsUnfolded));
    }
    const variants = physicalVariants(phone);
    if (!variants.length) return kv(msg('dimensions'), fullDimensions(phone));
    return kv(msg('dimensions'), fullDimensions(phone))
      + variants.map((variant) => kv(
        localizedVariantLabel(variant),
        `${formatNumber(variant.depthMm)} mm / ${formatNumber(variant.weightG)} g`
      )).join('');
  }

  function ppsLabel(value) {
    if (value === 'required') return msg('required');
    if (value === 'supported') return msg('supported');
    if (value === 'not_supported') return msg('notSupported');
    return msg('unknown');
  }

  function wirelessLabel(charging) {
    if (!charging?.wirelessStandard) return '—';
    return charging.wirelessMaxW ? `${charging.wirelessStandard} / ${formatNumber(charging.wirelessMaxW)}W` : charging.wirelessStandard;
  }

  function includedLabel(value) {
    if (value === 'included') return msg('included');
    if (value === 'not_included') return msg('notIncluded');
    return msg('unknown');
  }

  function formatNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? String(number).replace(/\.0$/, '') : '—';
  }

  function emptyHtml(title, body) {
    return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><p>${escapeHtml(body)}</p></div>`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[character]);
  }

  function escapeAttribute(value) {
    const raw = String(value || '');
    if (!/^https:\/\//i.test(raw)) return '#';
    return escapeHtml(raw);
  }

  function openSheet() {
    $('#sheetBackdrop').hidden = false;
    $('#mobileSheet').hidden = false;
    $('#sheetBackdrop').classList.add('open');
    $('#mobileSheet').classList.add('open');
    document.body.style.overflow = 'hidden';
    $('#sheetClose').focus();
  }

  function closeSheet() {
    $('#sheetBackdrop').classList.remove('open');
    $('#mobileSheet').classList.remove('open');
    $('#sheetBackdrop').hidden = true;
    $('#mobileSheet').hidden = true;
    document.body.style.overflow = '';
  }

  function bindEvents() {
    $$('.nw-lang-switch button').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.lang)));
    $('#searchInput').addEventListener('input', renderList);
    ['#manufacturerFilter', '#connectorFilter', '#yearFilter', '#sortSelect'].forEach((selector) => $(selector).addEventListener('change', renderList));
    $('#sheetClose').addEventListener('click', closeSheet);
    $('#sheetBackdrop').addEventListener('click', closeSheet);
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !$('#mobileSheet').hidden) closeSheet();
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    state.lang = readSavedLang();
    bindEvents();
    applyLanguage(state.lang);
    loadData();
  });
})();
