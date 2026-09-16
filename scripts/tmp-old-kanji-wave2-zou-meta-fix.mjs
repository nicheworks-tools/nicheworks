import fs from 'node:fs';

const path = 'tools/old-kanji-reference/meta-extra-2.json';
let text = fs.readFileSync(path, 'utf8');
const before = `    "贈": {
      "modern": "贈",
      "category": "document",
      "verified": true,
      "dataStatus": "verified",
      "confidence": "high",
      "sourceNote": "文化庁「常用漢字表」の「贈（贈）」に基づく旧字体・新字体対応"
    }`;
const after = `    "贈": {
      "modern": "贈",
      "readingJa": "ぞう・そう・おくる",
      "readingEn": "zo / so / okuru",
      "meaningJa": "人に金品などをおくり与える。",
      "meaningEn": "to give or present something to another person.",
      "usageJa": "「贈る」「贈与」「贈呈」などで使われる。",
      "usageEn": "Used in words and expressions about giving or presenting, such as 贈る, 贈与, and 贈呈.",
      "category": "document",
      "verified": true,
      "dataStatus": "verified",
      "confidence": "high",
      "sourceNote": "文化庁「常用漢字表」の「贈（贈）」および漢字ペディア「贈」に基づく旧字体・新字体対応"
    }`;
const count = text.split(before).length - 1;
if (count !== 1) throw new Error(`Expected one 贈 metadata block, found ${count}`);
text = text.replace(before, after);
JSON.parse(text);
fs.writeFileSync(path, text);
console.log('Added source-backed reading, meaning, and usage for 贈.');
