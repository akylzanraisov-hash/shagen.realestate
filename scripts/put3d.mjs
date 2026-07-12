import fs from 'fs';
import path from 'path';

const dir = 'public';
const target = 'configurator3d.html';
const MARKER = 'MOBILE_TOUCH_V6';

// List all configurator3d*.html files
const all = fs.readdirSync(dir).filter(f => f.startsWith('configurator3d') && f.endsWith('.html'));
console.log('Before — files found:', all.map(f => {
  try { return `${f} (${fs.statSync(path.join(dir, f)).size} bytes)`; } catch { return f; }
}).join(', '));

// Find the one with the marker
let srcFile = null;
for (const f of all) {
  const content = fs.readFileSync(path.join(dir, f), 'utf8');
  if (content.includes(MARKER)) { srcFile = f; break; }
}

if (!srcFile) {
  console.error(`ERROR: No file in public/ containing '${MARKER}' — aborting.`);
  process.exit(1);
}

console.log(`Marker '${MARKER}' found in: ${srcFile}`);
const newContent = fs.readFileSync(path.join(dir, srcFile), 'utf8');

// Write to configurator3d.html
fs.writeFileSync(path.join(dir, target), newContent, 'utf8');

// Delete all others (not the target)
for (const f of all) {
  if (f !== target) {
    fs.unlinkSync(path.join(dir, f));
    console.log(`Deleted: ${f}`);
  }
}

// Report after
const after = fs.readdirSync(dir).filter(f => f.startsWith('configurator3d') && f.endsWith('.html'));
console.log('After — files:', after.map(f => `${f} (${fs.statSync(path.join(dir, f)).size} bytes)`).join(', '));

// Verify markers
const final = fs.readFileSync(path.join(dir, target), 'utf8');
console.log(`Contains 'MOBILE_TOUCH_V6': ${final.includes('MOBILE_TOUCH_V6')}`);
console.log(`Contains 'glbBtn': ${final.includes('glbBtn')}`);
console.log('Done.');
