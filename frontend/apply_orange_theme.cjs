const fs = require('fs');
const path = require('path');

const ROOT_SRC = path.join(__dirname, 'src');

const replacements = [
  // Primary brand / buttons / active tabs
  { from: /#164A4A/gi, to: '#F97316' },
  { from: /#123E3E/gi, to: '#EA580C' },
  { from: /#1F6262/gi, to: '#EA580C' },
  { from: /#C6A77D/gi, to: '#EA580C' },
  { from: /#6fa3a0/gi, to: '#FED7AA' },
  { from: /#D2B48C/gi, to: '#FED7AA' },

  // Backgrounds
  { from: /#F1F5F3/gi, to: '#FFFDF8' },
  { from: /#F0FDFA/gi, to: '#FFFDF8' },
  { from: /#FAFBF9/gi, to: '#FFFDF8' },
  { from: /#F8F9F8/gi, to: '#FFFDF8' },
  { from: /#F2EFE8/gi, to: '#FFFDF8' },
  { from: /#E8E5DA/gi, to: '#FED7AA' },

  // Borders
  { from: /#D3DFDA/gi, to: '#E7E5E4' },
  { from: /#CCFBF1/gi, to: '#E7E5E4' },

  // Main text
  { from: /#202828/gi, to: '#292524' },
  { from: /#1E293B/gi, to: '#292524' },

  // Secondary text
  { from: /#455250/gi, to: '#78716C' },
  { from: /#687B78/gi, to: '#78716C' },
  { from: /#A8ADA9/gi, to: '#78716C' },
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
console.log(`Processed ${stats.count} files, updated ${stats.changed} files with new orange/stone palette.`);
