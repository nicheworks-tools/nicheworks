#!/usr/bin/env node
import { readFile } from 'node:fs/promises';

const TARGET_PATH = 'tools/earth-map-suite/ems-rd-11-browser-self-check-result.json';
const ALLOWED_MODES = new Set(['safe_self_health_manifest', 'research_probe', 'not_run', 'api_safe_bundle']);
const ALLOWED_BRANCH_DECISIONS = new Set(['browser_result_missing', 'network_unverified', 'health_manifest_failed', 'health_manifest_reachable', 'raw_pixel_read', 'decoder_strategy_required', 'endpoint_error', 'blocked', 'inconclusive', 'probe_checked_without_phase']);
const REQUIRED_ENDPOINT_KEYS = ['self_check', 'health', 'manifest', 'probe_status', 'precipitation_sample_real'];
const NEXT = { browser_result_missing: 'VERIFY', network_unverified: 'VERIFY', health_manifest_failed: 'ROUTE', health_manifest_reachable: 'PROBE', raw_pixel_read: 'SAMPLE', decoder_strategy_required: 'DECODER', endpoint_error: 'PROBEFIX', blocked: 'PROBEFIX', inconclusive: 'PROBEFIX', probe_checked_without_phase: 'PROBEFIX' };

const fail = (m) => {
  console.error(`❌ ${m}`);
  process.exit(1);
};

const parsed = JSON.parse(await readFile(TARGET_PATH, 'utf8'));
for (const f of ['branch_decision', 'public_real_data_enabled', 'storm_compare_card_connected', 'endpoints', 'mode', 'page_url', 'checked_at']) {
  if (!Object.hasOwn(parsed, f)) fail(`Missing required top-level field: ${f}`);
}
if (parsed.result_hash !== undefined && parsed.result_hash !== null && typeof parsed.result_hash !== 'string') fail('Invalid result_hash: must be string or null');
if (parsed.result_hash_algorithm !== undefined && parsed.result_hash_algorithm !== null && typeof parsed.result_hash_algorithm !== 'string') fail('Invalid result_hash_algorithm: must be string or null');
if (!ALLOWED_MODES.has(parsed.mode)) fail(`Invalid mode: ${parsed.mode}`);
if (!ALLOWED_BRANCH_DECISIONS.has(parsed.branch_decision)) fail(`Invalid branch_decision: ${parsed.branch_decision}`);
if (parsed.public_real_data_enabled !== false) fail('Unsafe flag detected: public_real_data_enabled must be false');
if (parsed.storm_compare_card_connected !== false) fail('Unsafe flag detected: storm_compare_card_connected must be false');
if (!Array.isArray(parsed.endpoints)) fail('Invalid endpoints: endpoints must be an array');

const keys = new Set(parsed.endpoints.map((e) => e?.key).filter(Boolean));
const found = REQUIRED_ENDPOINT_KEYS.filter((k) => keys.has(k));
const missing = REQUIRED_ENDPOINT_KEYS.filter((k) => !keys.has(k));
if (missing.length) fail(`Missing required endpoints: ${missing.join(', ')}`);

console.log('✅ Browser self-check result validation passed.');
console.log(`mode: ${parsed.mode}`);
console.log(`branch_decision: ${parsed.branch_decision}`);
console.log(`next_task_family: ${NEXT[parsed.branch_decision]}`);
console.log(`result_hash: ${parsed.result_hash ?? 'null'}`);
console.log(`result_hash_algorithm: ${parsed.result_hash_algorithm ?? 'null'}`);
console.log(`required_endpoints_found: ${found.join(', ')}`);
console.log(`required_endpoints_missing: ${missing.length === 0 ? 'none' : missing.join(', ')}`);
