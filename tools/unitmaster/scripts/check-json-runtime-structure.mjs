import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const errors = [];

const requiredFiles = [
  'index.html',
  'data/units.json',
  'runtime-units-adapter.js',
  'app-json-runtime.js',
  'app.js'
];

function fail(message) {
  errors.push(message);
}

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), 'utf8');
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) {
    fail(`Required UnitMaster runtime file is missing: ${file}`);
  }
}

let index = '';
try {
  index = read('index.html');
} catch (error) {
  fail(`Failed to read index.html: ${error.message}`);
}

if (index) {
  const adapterScript = '<script src="./runtime-units-adapter.js"></script>';
  const jsonRuntimeScript = '<script src="./app-json-runtime.js"></script>';
  const legacyScript = '<script src="./app.js"></script>';
  const adapterIndex = index.indexOf(adapterScript);
  const jsonRuntimeIndex = index.indexOf(jsonRuntimeScript);
  const legacyIndex = index.indexOf(legacyScript);
  if (adapterIndex === -1) fail('index.html must load ./runtime-units-adapter.js.');
  if (jsonRuntimeIndex === -1) fail('index.html must load ./app-json-runtime.js.');
  if (adapterIndex !== -1 && jsonRuntimeIndex !== -1 && adapterIndex > jsonRuntimeIndex) fail('runtime-units-adapter.js must be loaded before app-json-runtime.js.');
  if (legacyIndex !== -1) fail('index.html must not directly load ./app.js after switching to JSON runtime. app.js is only a fallback loaded by app-json-runtime.js.');
}

let jsonRuntime = '';
try {
  jsonRuntime = read('app-json-runtime.js');
} catch (error) {
  fail(`Failed to read app-json-runtime.js: ${error.message}`);
}

if (jsonRuntime) {
  if (!jsonRuntime.includes('./data/units.json')) fail('app-json-runtime.js must reference ./data/units.json.');
  if (!jsonRuntime.includes('./app.js')) fail('app-json-runtime.js must keep ./app.js as the legacy fallback path.');
  if (!jsonRuntime.includes('UnitMasterRuntimeAdapter')) fail('app-json-runtime.js must use UnitMasterRuntimeAdapter.');
}

let adapter = '';
try {
  adapter = read('runtime-units-adapter.js');
} catch (error) {
  fail(`Failed to read runtime-units-adapter.js: ${error.message}`);
}

if (adapter && !adapter.includes('adaptUnitMasterData')) {
  fail('runtime-units-adapter.js must expose adaptUnitMasterData.');
}

if (errors.length) {
  console.error('UnitMaster JSON runtime structure check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('UnitMaster JSON runtime structure check passed.');
