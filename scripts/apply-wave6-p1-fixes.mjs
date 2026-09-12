import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');
const write = (rel, text) => fs.writeFileSync(path.join(root, rel), text);

function replaceOnce(rel, from, to, label) {
  const input = read(rel);
  const count = input.split(from).length - 1;
  if (count !== 1) throw new Error(`${rel}: expected exactly one ${label}, found ${count}`);
  write(rel, input.replace(from, to));
}

// UI Atlas: current shared Pro must be isolated to the legacy nicheworks_pro entitlement.
replaceOnce(
  'tools/ui-atlas/pro-bridge.js',
  "  const doc = document.documentElement;\n",
  "  const doc = document.documentElement;\n  const EXPECTED_ENTITLEMENT = 'nicheworks_pro';\n",
  'bridge entitlement insertion point'
);
replaceOnce(
  'tools/ui-atlas/pro-bridge.js',
  '      const active = Boolean(local && local.active);',
  '      const active = Boolean(local && local.active && local.entitlement === EXPECTED_ENTITLEMENT);',
  'bridge active-only gate'
);
replaceOnce(
  'tools/ui-atlas/app.js',
  '        commonProActive = Boolean(local && local.active);',
  "        commonProActive = Boolean(local && local.active && local.entitlement === 'nicheworks_pro');",
  'app active-only fallback gate'
);

// Vibe Lexicon: exact entitlement only; the old tool-local flag is migration debris, not authority.
replaceOnce(
  'tools/vibe-lexicon/pro-bridge.js',
  "  var BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';\n",
  "  var BUY_URL = 'https://buy.stripe.com/14A6oJ3UZ1M1eWhbIHcV209';\n  var EXPECTED_ENTITLEMENT = 'nicheworks_pro';\n",
  'vibe entitlement insertion point'
);
replaceOnce(
  'tools/vibe-lexicon/pro-bridge.js',
  '      return Boolean(status && status.active);',
  '      return Boolean(status && status.active && status.entitlement === EXPECTED_ENTITLEMENT);',
  'vibe shared active-only gate'
);
replaceOnce(
  'tools/vibe-lexicon/pro-bridge.js',
  `  function legacyActive() {\n    try {\n      return localStorage.getItem(LEGACY_KEY) === '1';\n    } catch (error) {\n      return false;\n    }\n  }\n`,
  `  function clearLegacyLocalFlag() {\n    try {\n      localStorage.removeItem(LEGACY_KEY);\n    } catch (error) {}\n  }\n`,
  'vibe legacy self-unlock helper'
);
replaceOnce(
  'tools/vibe-lexicon/pro-bridge.js',
  '    var active = localCommonActive() || legacyActive();\n    applyUI(active);',
  '    clearLegacyLocalFlag();\n    var active = localCommonActive();\n    applyUI(active);',
  'vibe legacy self-unlock boot path'
);
replaceOnce(
  'tools/vibe-lexicon/app.js',
  '      if (status && status.active) return true;',
  "      if (status && status.active && status.entitlement === 'nicheworks_pro') return true;",
  'vibe app active-only fallback gate'
);

// Synchronize specifications with the corrected runtime contracts.
replaceOnce(
  'tools/ui-atlas/SPEC.md',
  '- current live Pro active stateは`UIAtlasProBridge`または共通`NWPro` legacy contractに従う。',
  '- current live Pro active stateは`UIAtlasProBridge`または共通`NWPro` legacy contractに従い、`active`だけでなくexact `nicheworks_pro` entitlement一致を必須とする。別productのactive entitlementではUI Atlas paid operationを解放しない。',
  'UI Atlas state contract'
);
replaceOnce(
  'tools/ui-atlas/SPEC.md',
  '- [ ] current legacy Pro active時はcompare上限が5件へ拡張される。',
  '- [ ] current legacy Proは`active && entitlement === "nicheworks_pro"`の場合だけcompare上限が5件へ拡張され、別entitlementのactive stateではFree上限2件を維持する。',
  'UI Atlas acceptance gate'
);
replaceOnce(
  'tools/vibe-lexicon/SPEC.md',
  '- Pro active stateは共通`NWPro` infrastructureのcontractに従う。',
  '- Pro active stateは共通`NWPro` infrastructureのcontractに従い、`active && entitlement === "nicheworks_pro"`を必須とする。旧tool-local `nw_pro_vibe-lexicon` flag単独ではpaid operationを解放せず、bridge初期化時にlegacy flagを削除する。',
  'Vibe state contract'
);
replaceOnce(
  'tools/vibe-lexicon/SPEC.md',
  '- [ ] Pro active時にwork-pack copy/export actionsが解放されるが、compare件数上限は現行runtimeどおり2件を維持する。',
  '- [ ] `active && entitlement === "nicheworks_pro"`の場合だけwork-pack copy/export actionsが解放され、別entitlementや旧tool-local flagだけでは解放されない。compare件数上限は現行runtimeどおり2件を維持する。',
  'Vibe acceptance gate'
);
replaceOnce(
  'tools/url-title-collector/SPEC.md',
  '- 現在のpage metadata/説明に残る「ローカル処理」「Fully browser-based」という表現はruntime behaviorと一致せず、このSPECではruntimeを正とする。',
  '- 現在のJP/EN page metadataとvisible privacy説明は、入力URLがtitle取得のためNicheWorks Workerへ送信され、Workerからtarget siteへのnetwork requestが発生するruntime behaviorと一致している。',
  'URL Title Collector stale privacy note'
);

console.log('Wave 6 targeted P1/spec fixes applied.');
