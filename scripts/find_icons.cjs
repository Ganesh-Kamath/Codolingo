const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (!full.includes('node_modules') && !full.includes('.git') && !full.includes('dist')) {
        results = results.concat(walk(full));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  }
  return results;
}

const files = walk('./src');
const names = new Set();
const iconRegex = /<Icon[^>]*\bname=['"{]([a-zA-Z0-9\-_]+)['"}]/g;

for (const file of files) {
  const content = fs.readFileSync(file, 'utf8');
  let match;
  while ((match = iconRegex.exec(content)) !== null) {
    names.add(match[1]);
  }
}

console.log(JSON.stringify(Array.from(names).sort(), null, 2));
