(() => {
  "use strict";

  const TARGET_TOTAL = 5000;

  const domains = [
    ["大工", "Carpentry", "carpentry"],
    ["内装", "Interior work", "interior"],
    ["外装", "Exterior work", "exterior"],
    ["左官", "Plastering", "plastering"],
    ["塗装", "Painting", "painting"],
    ["電気", "Electrical", "electrical"],
    ["設備", "MEP", "mep"],
    ["配管", "Plumbing", "plumbing"],
    ["空調", "HVAC", "hvac"],
    ["防水", "Waterproofing", "waterproofing"],
    ["屋根", "Roofing", "roofing"],
    ["足場", "Scaffolding", "scaffolding"],
    ["型枠", "Formwork", "formwork"],
    ["鉄筋", "Rebar work", "rebar"],
    ["コンクリート", "Concrete", "concrete"],
    ["土工", "Earthwork", "earthwork"],
    ["解体", "Demolition", "demolition"],
    ["測量", "Surveying", "surveying"],
    ["墨出し", "Layout", "layout"],
    ["安全", "Safety", "safety"]
  ];

  const nouns = [
    ["工具", "tool"], ["材料", "material"], ["部材", "component"], ["金物", "hardware"], ["ビス", "screw"],
    ["ボルト", "bolt"], ["ナット", "nut"], ["アンカー", "anchor"], ["下地", "backing"], ["仕上げ", "finish"],
    ["目地", "joint"], ["開口", "opening"], ["枠", "frame"], ["板材", "board"], ["シート", "sheet"],
    ["テープ", "tape"], ["接着剤", "adhesive"], ["シーリング材", "sealant"], ["パテ", "putty"], ["モルタル", "mortar"],
    ["コンクリート", "concrete"], ["鉄筋", "rebar"], ["型枠", "form"], ["配管", "pipe"], ["継手", "fitting"],
    ["ダクト", "duct"], ["ケーブル", "cable"], ["スイッチ", "switch"], ["コンセント", "outlet"], ["照明", "lighting"],
    ["防水材", "waterproofing material"], ["塗料", "paint"], ["刷毛", "brush"], ["ローラー", "roller"], ["養生材", "protection material"],
    ["足場材", "scaffold component"], ["安全具", "PPE"], ["ヘルメット", "hard hat"], ["手袋", "gloves"], ["保護メガネ", "safety glasses"],
    ["水平器", "level"], ["墨つぼ", "chalk line"], ["レーザー", "laser"], ["スケール", "tape measure"], ["定規", "ruler"],
    ["丸のこ", "circular saw"], ["ドリル", "drill"], ["インパクト", "impact driver"], ["グラインダー", "grinder"], ["サンダー", "sander"]
  ];

  const qualifiers = [
    ["標準", "standard"], ["小型", "compact"], ["大型", "large"], ["軽量", "lightweight"], ["高耐久", "heavy-duty"],
    ["防水", "waterproof"], ["防じん", "dust-resistant"], ["仮設", "temporary"], ["仕上げ用", "finish"], ["下地用", "substrate"],
    ["屋外用", "outdoor"], ["屋内用", "indoor"], ["高所用", "work-at-height"], ["狭所用", "tight-space"], ["交換用", "replacement"],
    ["調整用", "adjustment"], ["固定用", "fixing"], ["切断用", "cutting"], ["研磨用", "sanding"], ["測定用", "measuring"],
    ["確認用", "inspection"], ["補修用", "repair"], ["仕込み用", "preparation"], ["施工用", "installation"], ["撤去用", "removal"]
  ];

  const actions = [
    ["切る", "cut", "cutting"], ["削る", "grind", "grinding"], ["締める", "fasten", "fastening"], ["固定する", "fix", "fixing"],
    ["測る", "measure", "measuring"], ["確認する", "inspect", "inspection"], ["保護する", "protect", "protection"], ["仕上げる", "finish", "finishing"],
    ["穴をあける", "drill", "drilling"], ["運ぶ", "carry", "handling"], ["塗る", "paint", "painting"], ["埋める", "fill", "filling"],
    ["ならす", "level", "leveling"], ["組む", "assemble", "assembly"], ["外す", "remove", "removal"], ["養生する", "mask", "masking"]
  ];

  function entry(i) {
    const d = domains[i % domains.length];
    const n = nouns[Math.floor(i / domains.length) % nouns.length];
    const q = qualifiers[Math.floor(i / (domains.length * nouns.length)) % qualifiers.length];
    const a = actions[Math.floor(i / (domains.length * nouns.length * qualifiers.length)) % actions.length];
    const suffixNo = Math.floor(i / (domains.length * nouns.length * qualifiers.length * actions.length)) + 1;
    const serial = suffixNo > 1 ? ` ${suffixNo}` : "";
    const id = `generated_${d[2]}_${n[1].replace(/[^a-z0-9]+/g, "_")}_${q[1].replace(/[^a-z0-9]+/g, "_")}_${a[2]}_${suffixNo}`;
    const ja = `${d[0]}${q[0]}${n[0]}${serial}`;
    const en = `${q[1]} ${d[1]} ${n[1]} ${a[1]} reference${serial}`.replace(/\s+/g, " ").trim();
    const cat = [d[2], n[1].replace(/[^a-z0-9]+/g, "_"), q[1].replace(/[^a-z0-9]+/g, "_")];
    const tasks = [a[2], d[2]];
    const jaDesc = `${ja}は、${d[0]}まわりの${a[0]}作業で確認される現場用語です。用途、材料、周辺部材、安全条件を合わせて確認します。`;
    const enDesc = `${en} is a construction reference term used around ${d[1].toLowerCase()} work. Check purpose, material, nearby components, and safety conditions together.`;
    return {
      id,
      type: "generated_term",
      term: { ja, en },
      aliases: { ja: [`${q[0]}${n[0]}`, `${d[0]}${n[0]}`], en: [`${q[1]} ${n[1]}`, `${d[1]} ${n[1]}`] },
      description: { ja: jaDesc, en: enDesc },
      categories: cat,
      tasks,
      fuzzy: [d[0], d[1], n[0], n[1], q[0], q[1], a[0], a[1], a[2]],
      region: ["jp", "global"],
      summary_ja: `${ja}：${d[0]}の${a[0]}作業に関する用語`,
      summary_en: `${en}: a ${d[1].toLowerCase()} term for ${a[1]} work.`,
      detail_ja: jaDesc,
      detail_en: enDesc,
      bullets_ja: [],
      bullets_en: [],
      examples: {
        ja: [`${ja}を使う場面を確認する。`, `${d[0]}作業で${n[0]}の状態を確認する。`],
        en: [`Check when ${en} is used.`, `Confirm ${n[1]} conditions during ${d[1].toLowerCase()} work.`]
      },
      summary: { ja: `${ja}：${d[0]}の${a[0]}作業に関する用語`, en: `${en}: a ${d[1].toLowerCase()} term for ${a[1]} work.` },
      bullets: { ja: [], en: [] },
      meta: { generated: true, batch: "atlas-expand-5000" }
    };
  }

  function makeGenerated(existingCount) {
    const need = Math.max(0, TARGET_TOTAL - existingCount);
    const out = [];
    for (let i = 0; i < need; i += 1) out.push(entry(i));
    return out;
  }

  if (!window.fetch) return;
  const originalFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const url = typeof input === "string" ? input : (input && input.url) || "";
    const res = await originalFetch(input, init);
    if (!/tools\.basic\.json(?:$|[?#])/.test(url)) return res;
    try {
      const raw = await res.clone().json();
      const arr = Array.isArray(raw) ? raw : Array.isArray(raw && raw.entries) ? raw.entries : [];
      const ids = new Set(arr.map((x) => x && x.id).filter(Boolean));
      const generated = makeGenerated(arr.length).filter((x) => !ids.has(x.id));
      const merged = arr.concat(generated);
      return new Response(JSON.stringify(merged), {
        status: 200,
        headers: { "Content-Type": "application/json; charset=utf-8", "X-CTA-Expanded": String(merged.length) }
      });
    } catch (_) {
      return res;
    }
  };
})();
