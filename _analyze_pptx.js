const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function listAndRead(buf, target) {
  const files = [];
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
    files.push(name);
    if (name === target) {
      return comp === 8 ? zlib.inflateRawSync(data) : data;
    }
    i = dataStart + compSize;
  }
  return { files };
}

function extractTexts(xml) {
  const texts = [];
  const re = /<a:t>([^<]*)<\/a:t>/g;
  let m;
  while ((m = re.exec(xml))) texts.push(m[1]);
  return texts;
}

const base = 'd:/restaurant-app';
const pptxName = fs.readdirSync(base).find((f) => f.endsWith('.pptx') && f.includes('Сер'));
const buf = fs.readFileSync(path.join(base, pptxName));
const { files } = listAndRead(buf, '');
const slideFiles = files.filter((f) => /^ppt\/slides\/slide\d+\.xml$/.test(f)).sort((a, b) => {
  const na = parseInt(a.match(/\d+/)[0], 10);
  const nb = parseInt(b.match(/\d+/)[0], 10);
  return na - nb;
});
console.log('PPTX:', pptxName);
console.log('Slides:', slideFiles.length);
console.log('---');

slideFiles.forEach((sf, idx) => {
  const xml = listAndRead(buf, sf);
  const texts = extractTexts(xml.toString('utf8'));
  console.log(`SLIDE ${idx + 1} (${sf})`);
  texts.forEach((t) => console.log('  -', t));
  console.log('');
});

// theme colors
const theme = listAndRead(buf, 'ppt/theme/theme1.xml');
if (theme) {
  const srgb = [...theme.toString('utf8').matchAll(/<a:srgbClr val="([A-Fa-f0-9]{6})"/g)].map((m) => m[1]);
  console.log('Theme colors:', [...new Set(srgb)].join(', '));
}
