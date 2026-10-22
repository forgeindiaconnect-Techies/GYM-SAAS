/**
 * Teal + Mist Grey Theme Pass 2
 * Fine-tuning secondary and straggler colors to strictly adhere to the palette
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

const replacements = [
  // Muted text: #555, #444, #777 -> #697778
  { from: /text-\[#555\]/g, to: 'text-[#697778]' },
  { from: /text-\[#444\]/g, to: 'text-[#697778]' },
  { from: /text-\[#777\]/g, to: 'text-[#697778]' },
  { from: /#555\b/g, to: '#697778' },
  { from: /#444\b/g, to: '#697778' },
  { from: /#777\b/g, to: '#697778' },
  { from: /#A8A29E/gi, to: '#697778' },
  { from: /#475569/gi, to: '#697778' },
  { from: /#94A3B8/gi, to: '#697778' },

  // Dark text / Headings: #333, #334155, #202020 -> #344B4A
  { from: /text-\[#333\]/g, to: 'text-[#344B4A]' },
  { from: /text-\[#334155\]/g, to: 'text-[#344B4A]' },
  { from: /border-\[#333\]/g, to: 'border-[#D9E2E3]' },
  { from: /#334155/gi, to: '#344B4A' },

  // Light container/button backgrounds: #F5F5F4 -> #E8EFF0
  { from: /bg-\[#F5F5F4\]/g, to: 'bg-[#E8EFF0]' },
  { from: /border-\[#F5F5F4\]/g, to: 'border-[#D9E2E3]' },

  // Any leftover blue borders or highlights
  { from: /border-blue-500/g, to: 'border-[#167D78]' },
  { from: /text-blue-600/g, to: 'text-[#167D78]' },
  { from: /text-blue-500/g, to: 'text-[#167D78]' },

  // Ensure button text on Teal is white
  { from: /bg-\[#167D78\]\s+text-\[#697778\]/g, to: 'bg-[#167D78] text-white' },
  { from: /bg-\[#167D78\]\s+text-gray-900/g, to: 'bg-[#167D78] text-white' },
  { from: /bg-\[#167D78\]\s+text-gray-800/g, to: 'bg-[#167D78] text-white' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const rule of replacements) {
    content = content.replace(rule.from, rule.to);
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
    } else if (/\.(tsx|ts|jsx|js|css|html)$/.test(entry.name)) {
      count++;
      if (processFile(fullPath)) {
        changed++;
      }
    }
  }
  return { count, changed };
}

console.log('🎨 Running Pass 2 fine-tuning...');
const stats = walkDir(SRC_DIR);
console.log(`✅ Pass 2: processed ${stats.count} files, updated ${stats.changed} files.`);
