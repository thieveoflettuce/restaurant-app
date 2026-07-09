const AdmZip = require('adm-zip');
const path = require('path');
const fs = require('fs');
const ROOT = 'd:/restaurant-app';
const zip = new AdmZip(path.join(ROOT, 'Презентация Захаров.pptx'));
const slide = zip.getEntry('ppt/slides/slide5.xml').getData().toString('utf8');
const rels = zip.getEntry('ppt/slides/_rels/slide5.xml.rels').getData().toString('utf8');
const embeds = [...slide.matchAll(/r:embed="(rId\d+)"/g)].map((m) => m[1]);
const sizes = [...slide.matchAll(/<a:ext cx="(\d+)" cy="(\d+)"/g)].map((m) => ({
  cx: +m[1],
  cy: +m[2],
  area: (+m[1]) * (+m[2]),
}));
console.log('embeds', embeds.length);
console.log('rels:\n', rels);
// map rId to media
const ridMap = {};
[...rels.matchAll(/Id="(rId\d+)".*Target="\.\.\/media\/([^"]+)"/g)].forEach((m) => {
  ridMap[m[1]] = m[2];
});
embeds.forEach((rid, i) => {
  console.log(rid, '->', ridMap[rid], 'size rank', i);
});
console.log('top extents:', sizes.sort((a, b) => b.area - a.area).slice(0, 5));
