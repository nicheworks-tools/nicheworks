import fs from 'node:fs';
import assert from 'node:assert/strict';

const phonesPath = 'tools/phone-quickcheck/data/phones.json';
const phones = JSON.parse(fs.readFileSync(phonesPath, 'utf8'));
assert.equal(phones.phones.length, 182, 'expected 182-phone baseline');
const phone = phones.phones.find((item) => item.id === 'zte-nubia-fold');
assert.ok(phone, 'zte-nubia-fold missing');

phone.charging.battery = {
  capacityMah: 6560,
  valueClass: 'official',
  sourceRef: 'https://www.ymobile.jp/biz/lineup/smartphone_a502zt/'
};
phone.charging.protocols = ['USB-PD', 'PPS'];
phone.charging.pps = 'required';
phone.sources.specificationsUrl = 'https://www.ymobile.jp/biz/lineup/smartphone_a502zt/';
phone.sources.manualUrl = 'https://www.ymobile.jp/lineup/nubia_fold/data/nubia_fold_quickstart.pdf';
phone.sources.releaseUrl = 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-fold';
phone.sources.chargingUrl = 'https://www.nubia.com/jp/products/smartphones/nubia/nubia-fold';
phone.sources.verifiedAt = '2026-09-15';
fs.writeFileSync(phonesPath, JSON.stringify(phones, null, 2) + '\n');

const semanticsPath = 'scripts/check-phone-quickcheck-source-semantics.mjs';
let semantics = fs.readFileSync(semanticsPath, 'utf8');
const oldLine = "ZTE: ['nubia.com', 'ymobile.jp', 'softbank.jp']";
assert.ok(semantics.includes(oldLine), 'expected ZTE softbank trust entry missing');
semantics = semantics.replace(oldLine, "ZTE: ['nubia.com', 'ymobile.jp']");
fs.writeFileSync(semanticsPath, semantics);

console.log('Tightened nubia Fold evidence to nubia/Y!mobile primary sources only.');