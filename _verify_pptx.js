const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function extractTexts(buf, slideNum) {
  const target = `ppt/slides/slide${slideNum}.xml`;
  let i = 0;
  while (i < buf.length - 30) {
    if (buf.readUInt32LE(i) !== 0x04034b50) { i++; continue; }
    const comp = buf.readUInt16LE(i + 8);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const name = buf.slice(i + 30, i + 30 + nameLen).toString('utf8');
    const dataStart = i + 30 + nameLen + extraLen;
    const compSize = buf.readUInt32LE(i + 18);
    const data = buf.slice(dataStart, dataStart + compSize);
    if (name === target) {
      const xml = (comp === 8 ? zlib.inflateRawSync(data) : data).toString('utf8');
      const texts = [];
      const re = /<a:t>([^<]*)<\/a:t>/g;
      let m;
      while ((m = re.exec(xml))) if (m[1].trim()) texts.push(m[1]);
      return texts;
    }
    i = dataStart + compSize;
  }
  return [];
}

const base = 'd:/restaurant-app';
const name = 'Презентация Захаров (по образцу).pptx';
const buf = fs.readFileSync(path.join(base, name));
for (let s = 1; s <= 16; s++) {
  const t = extractTexts(buf, s);
  console.log('---', s, '---');
  console.log(t.join(' | '));
}
