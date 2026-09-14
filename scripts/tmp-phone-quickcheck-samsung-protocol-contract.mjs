import fs from 'node:fs';

const appPath = 'tools/phone-quickcheck/app.js';
let app = fs.readFileSync(appPath, 'utf8');
const oldProtocol = `    } else if (manufacturer === 'google' && phone.charging?.pps === 'required') {\n      raw.push('USB PD', 'PPS');\n    } else if (manufacturer === 'samsung' && watts) {\n      raw.push(watts >= 60 ? 'Super Fast Charging 3.0' : watts >= 45 ? 'Super Fast Charging 2.0' : 'Super Fast Charging');\n    }\n`;
const newProtocol = `    } else if (manufacturer === 'google' && phone.charging?.pps === 'required') {\n      raw.push('USB PD', 'PPS');\n    }\n`;
if (!app.includes(oldProtocol)) throw new Error('Samsung protocol inference block not found');
app = app.replace(oldProtocol, newProtocol);
fs.writeFileSync(appPath, app);

const testPath = 'tools/phone-quickcheck/tests/behavior.test.mjs';
let test = fs.readFileSync(testPath, 'utf8');
const marker = `// Charger guidance must never be promoted to a handset-side wired maximum without wiredMaxW.\n`;
if (!test.includes(marker)) throw new Error('wired-max regression marker missing');
const regression = `// Samsung charging protocol labels must come from canonical source-backed protocols, not wattage inference.\n{\n  const h = await createHarness(['synthetic-foldable']);\n  const html = h.elements.desktopDetail.innerHTML;\n  assert.match(html, /規格<\\/span><b>—/);\n}\n\n`;
test = test.replace(marker, regression + marker);
fs.writeFileSync(testPath, test);

console.log('Applied Samsung protocol inference removal.');
