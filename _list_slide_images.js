const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const ROOT = __dirname;
const pptx = path.join(ROOT, 'Презентация Захаров (по образцу).pptx');
const zip = new AdmZip(pptx);
for (let s = 1; s <= 16; s++) {
  const rel = zip.getEntry(`ppt/slides/_rels/slide${s}.xml.rels`);
  if (!rel) continue;
  const xml = rel.getData().toString('utf8');
  const imgs = [...xml.matchAll(/Target="\.\.\/media\/([^"]+)"/g)].map((m) => m[1]);
  console.log(`slide ${s}:`, imgs.join(', '));
}
