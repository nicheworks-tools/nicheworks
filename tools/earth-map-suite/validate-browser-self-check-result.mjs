#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const TARGET_PATH = 'tools/earth-map-suite/ems-rd-11-browser-self-check-result.json';

const ALLOWED_BRANCH_DECISIONS = new Set([
  'browser_result_missing',
  'network_unverified',
  'health_manifest_failed',
  'health_manifest_reachable',
  'raw_pixel_read',
  'decoder_strategy_required',
  'endpoint_error',
  'blocked',
  'inconclusive',
  'probe_checked_without_phase'
]);

const REQUIRED_ENDPOINT_KEYS = [
  'self_check',
  'health',
  'manifest',
  'probe_status',
  'precipitation_sample_real'
];

const NEXT_TASK_FAMILY_MAP = {
  browser_result_missing: 'VERIFY',
  network_unverified: 'VERIFY',
  health_manifest_failed: 'ROUTE',
  health_manifest_reachable: 'PROBE',
  raw_pixel_read: 'SAMPLE',
  decoder_strategy_required: 'DECODER',
  endpoint_error: 'PROBEFIX',
  blocked: 'PROBEFIX',
  inconclusive: 'PROBEFIX',
  probe_checked_without_phase: 'PROBEFIX'
};

const fail = (message) => {
  console.error(`❌ ${message}`);
  process.exit(1);
};

const main = async () => {
  let parsed;
  try {
    const raw = await readFile(TARGET_PATH, 'utf8');
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`Failed to read or parse JSON at ${TARGET_PATH}: ${error.message}`);
  }

  for (const field of ['branch_decision', 'public_real_data_enabled', 'storm_compare_card_connected', 'endpoints']) {
    if (!Object.hasOwn(parsed, field)) {
      fail(`Missing required top-level field: ${field}`);
    }
  }

  if (!ALLOWED_BRANCH_DECISIONS.has(parsed.branch_decision)) {
    fail(`Invalid branch_decision: ${String(parsed.branch_decision)}. Allowed: ${Array.from(ALLOWED_BRANCH_DECISIONS).join(', ')}`);
  }

  if (parsed.public_real_data_enabled !== false) {
    fail('Unsafe flag detected: public_real_data_enabled must be false');
  }

  if (parsed.storm_compare_card_connected !== false) {
    fail('Unsafe flag detected: storm_compare_card_connected must be false');
  }

  if (!Array.isArray(parsed.endpoints)) {
    fail('Invalid endpoints: endpoints must be an array');
  }

  const endpointKeys = new Set(parsed.endpoints.map((endpoint) => endpoint?.key).filter(Boolean));
  const found = REQUIRED_ENDPOINT_KEYS.filter((key) => endpointKeys.has(key));
  const missing = REQUIRED_ENDPOINT_KEYS.filter((key) => !endpointKeys.has(key));

  if (missing.length > 0) {
    fail(`Missing required endpoints: ${missing.join(', ')}`);
  }

  const nextTaskFamily = NEXT_TASK_FAMILY_MAP[parsed.branch_decision];
  if (!nextTaskFamily) {
    fail(`No next task mapping defined for branch_decision: ${parsed.branch_decision}`);
  }

  console.log('✅ Browser self-check result validation passed.');
  console.log(`branch_decision: ${parsed.branch_decision}`);
  console.log(`next_task_family: ${nextTaskFamily}`);
  console.log(`required_endpoints_found: ${found.join(', ')}`);
  console.log(`required_endpoints_missing: ${missing.length === 0 ? 'none' : missing.join(', ')}`);
  console.log('safety_flags: public_real_data_enabled=false, storm_compare_card_connected=false');
};

await main();
