const fs = require('fs');
const path = require('path');

const ROOT_SRC = path.join(__dirname, 'src');

const replacements = [
  { from: /shadow-green-([0-9]+(\/[0-9]+)?)/g, to: 'shadow-orange-$1' },
  { from: /hover:to-\[#0F766E\]/gi, to: 'hover:to-[#EA580C]' },
  { from: /from-\[#F97316\] to-\[#FED7AA\]/gi, to: 'from-[#F97316] to-[#EA580C]' },
  { from: /from-\[#F97316\] to-\[#FED7AA\] text-\[#292524\]/gi, to: 'from-[#F97316] to-[#EA580C] text-white' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir) {
  let count = 0;
  let changed = 0;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      const res = walkDir(fullPath);
      count += res.count;
      changed += res.changed;
    } else if (/\.(tsx|ts|jsx|js|css)$/.test(entry.name)) {
      count++;
      if (processFile(fullPath)) {
        changed++;
      }
    }
  }
  return { count, changed };
}

const stats = walkDir(ROOT_SRC);
console.log(`Cleaned up shadows and gradient ends: ${stats.changed} files.`);
