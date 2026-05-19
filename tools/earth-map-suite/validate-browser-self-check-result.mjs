#!/usr/bin/env node

import { readFile } from 'node:fs/promises';

const TARGET_PATH = 'tools/earth-map-suite/ems-rd-11-browser-self-check-result.json';

const ALLOWED_BRANCH_DECISIONS = new Set([
  'browser_result_missing',
  'health_manifest_failed',
  'health_manifest_reachable',
  'raw_pixel_read',
  'decoder_strategy_required',
  'endpoint_error',
  'blocked',
  'inconclusive',
  'probe_checked_without_phase',
  'network_unverified'
]);

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

  if (!Object.hasOwn(parsed, 'branch_decision')) {
    fail('Missing required top-level field: branch_decision');
  }

  if (!Object.hasOwn(parsed, 'public_real_data_enabled')) {
    fail('Missing required top-level field: public_real_data_enabled');
  }

  if (!Object.hasOwn(parsed, 'storm_compare_card_connected')) {
    fail('Missing required top-level field: storm_compare_card_connected');
  }

  if (!Object.hasOwn(parsed, 'endpoints')) {
    fail('Missing required top-level field: endpoints');
  }

  if (!ALLOWED_BRANCH_DECISIONS.has(parsed.branch_decision)) {
    fail(
      `Invalid branch_decision: ${String(parsed.branch_decision)}. Allowed: ${Array.from(ALLOWED_BRANCH_DECISIONS).join(', ')}`
    );
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

  const nextTaskFamily = NEXT_TASK_FAMILY_MAP[parsed.branch_decision];

  if (!nextTaskFamily) {
    fail(`No next task mapping defined for branch_decision: ${parsed.branch_decision}`);
  }

  console.log('✅ Browser self-check result validation passed.');
  console.log(`branch_decision: ${parsed.branch_decision}`);
  console.log(`next_task_family: ${nextTaskFamily}`);
  console.log('safety_flags: public_real_data_enabled=false, storm_compare_card_connected=false');
};

await main();
