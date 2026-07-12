import fs from 'fs';

const copyPath = 'public/configurator3d copy.html';
const targetPath = 'public/configurator3d.html';

const copySize = fs.statSync(copyPath).size;
const targetSize = fs.statSync(targetPath).size;
console.log(`Before: configurator3d.html = ${targetSize} bytes, "configurator3d copy.html" = ${copySize} bytes`);

const content = fs.readFileSync(copyPath, 'utf8');
if (!content.includes('glbBtn')) {
  console.error('ERROR: marker "glbBtn" not found in copy — aborting');
  process.exit(1);
}
console.log('Marker "glbBtn" found — proceeding with swap');

fs.writeFileSync(targetPath, content, 'utf8');
fs.unlinkSync(copyPath);

const newSize = fs.statSync(targetPath).size;
const files = fs.readdirSync('public').filter(f => f.startsWith('configurator3d'));
console.log(`After:  configurator3d.html = ${newSize} bytes`);
console.log(`Files in public/ matching "configurator3d*": ${files.join(', ')}`);
