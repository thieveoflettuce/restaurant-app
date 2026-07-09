const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function readEntry(buf, target) {
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
    if (name === target) return (comp === 8 ? zlib.inflateRawSync(data) : data).toString('utf8');
    i = dataStart + compSize;
  }
  return null;
}

const base = 'd:/restaurant-app';
const pptxName = fs.readdirSync(base).find((f) => f.endsWith('.pptx') && f.includes('Сер'));
const buf = fs.readFileSync(path.join(base, pptxName));
for (const n of [2, 3, 15, 16]) {
  const xml = readEntry(buf, `ppt/slides/slide${n}.xml`);
  fs.writeFileSync(path.join(base, `_slide${n}.xml`), xml, 'utf8');
  console.log('wrote slide', n, 'len', xml.length);
}
