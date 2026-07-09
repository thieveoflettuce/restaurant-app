const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function walkZip(buf) {
  const entries = [];
  let i = 0;
  while (i < buf.length - 30) {
    if (buf.readUInt32LE(i) !== 0x04034b50) { i++; continue; }
    const comp = buf.readUInt16LE(i + 8);
    const nameLen = buf.readUInt16LE(i + 26);
    const extraLen = buf.readUInt16LE(i + 28);
    const name = buf.slice(i + 30, i + 30 + nameLen).toString('utf8');
    const dataStart = i + 30 + nameLen + extraLen;
    const compSize = buf.readUInt32LE(i + 18);
    const uncompSize = buf.readUInt32LE(i + 22);
    const data = buf.slice(dataStart, dataStart + compSize);
    let content = data;
    if (comp === 8) content = zlib.inflateRawSync(data);
    entries.push({ name, content, comp, compSize, uncompSize, dataStart, localHeaderOffset: i });
    i = dataStart + compSize;
  }
  return entries;
}

const base = 'd:/restaurant-app';
const pptxName = fs.readdirSync(base).find((f) => f.endsWith('.pptx') && f.includes('Сер'));
const buf = fs.readFileSync(path.join(base, pptxName));
const entries = walkZip(buf);
const media = entries.filter((e) => e.name.startsWith('ppt/media/'));
console.log('Media files:');
media.forEach((m) => console.log(' ', m.name, m.content.length));

// slide1 full structure hints
const slide1 = entries.find((e) => e.name === 'ppt/slides/slide1.xml').content.toString('utf8');
const pics = [...slide1.matchAll(/r:embed="([^"]+)"/g)].map((m) => m[1]);
console.log('\nSlide1 embeds:', pics);

// rels for slide1
const rel1 = entries.find((e) => e.name === 'ppt/slides/_rels/slide1.xml.rels');
if (rel1) console.log('\nSlide1 rels:\n', rel1.content.toString('utf8'));
