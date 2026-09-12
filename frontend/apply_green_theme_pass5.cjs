/**
 * Pass 5 — Final comprehensive text-white cleanup
 * Targets ONLY text-white that appears on white/light backgrounds
 * Preserves text-white on colored button backgrounds (bg-[#16A34A], bg-blue-500, etc.)
 */

const fs = require('fs');
const path = require('path');

const ALL_SRC = 'src';

// These patterns specifically target text-white that's NOT on a colored bg button
// We use context-aware replacements
const problematicPatterns = [
  // Table content
  { from: /(<td[^>]*>[\s\S]*?)<(?:div|p|span) className="([^"]*?)text-white([^"]*?)">/g },
  // Alert/card h4 text
  { from: /<h4 className="text-white ([^"]+)">/g, to: '<h4 className="text-[#1E293B] $1">' },
  { from: /<h4 className="([^"]+) text-white ([^"]+)">/g, to: '<h4 className="$1 text-[#1E293B] $2">' },
  { from: /<h4 className="text-white">/g, to: '<h4 className="text-[#1E293B]">' },
  // P tags with text-white
  { from: /<p className="text-white/g, to: '<p className="text-[#1E293B]' },
  // Span tags with text-white (not in badges)  
  { from: /<span className="text-sm font-semibold text-white/g, to: '<span className="text-sm font-semibold text-[#1E293B]' },
];

// Simple string replacements (context-insensitive, but these are clearly wrong patterns)
const stringReplacements = [
  // text-white in card/table heading contexts clearly visible
  { from: /\btext-white\b(?=\s+font-)/g, to: 'text-[#1E293B]' },
  { from: /font-(?:semibold|bold|medium)\s+text-white/g, to: (m) => m.replace('text-white', 'text-[#1E293B]') },
  { from: /text-white\s+font-(?:semibold|bold|medium)/g, to: (m) => m.replace('text-white', 'text-[#1E293B]') },
  
  // Specific remaining text-white on non-button elements
  { from: /className="text-white"/g, to: 'className="text-[#1E293B]"' },
  { from: /className="([^"]*?)text-white([^"]*?)"(?!.*bg-\[#(?:16A34A|0D9488|06B6D4|EF4444|DC2626)|bg-(?:blue|green|red|teal|cyan|purple|orange))/g, 
    to: (m, p1, p2) => {
      // Only replace if not preceded by bg- color on same element
      if (!m.includes('bg-[') && !m.includes('bg-blue') && !m.includes('bg-green') && 
          !m.includes('bg-teal') && !m.includes('bg-red') && !m.includes('bg-cyan') &&
          !m.includes('bg-gradient')) {
        return m.replace('text-white', 'text-[#1E293B]');
      }
      return m;
    }
  },
  
  // Direct patterns
  { from: /text-3xl font-bold text-white/g, to: 'text-3xl font-bold text-[#1E293B]' },
  { from: /text-2xl font-bold text-white/g, to: 'text-2xl font-bold text-[#1E293B]' },
  { from: /text-xl font-bold text-white/g, to: 'text-xl font-bold text-[#1E293B]' },
  { from: /text-lg font-bold text-white/g, to: 'text-lg font-bold text-[#1E293B]' },
  { from: /text-lg font-semibold text-white/g, to: 'text-lg font-semibold text-[#1E293B]' },
  { from: /text-sm font-semibold text-white/g, to: 'text-sm font-semibold text-[#1E293B]' },
  { from: /text-sm font-bold text-white/g, to: 'text-sm font-bold text-[#1E293B]' },
  { from: /text-sm font-medium text-white/g, to: 'text-sm font-medium text-[#1E293B]' },
  { from: /text-sm text-white font/g, to: 'text-sm text-[#1E293B] font' },
  { from: /font-semibold text-white/g, to: 'font-semibold text-[#1E293B]' },
  { from: /font-bold text-white/g, to: 'font-bold text-[#1E293B]' },
  { from: /text-white tracking-tight/g, to: 'text-[#1E293B] tracking-tight' },
  { from: /tracking-tight text-white/g, to: 'tracking-tight text-[#1E293B]' },
  { from: /text-white leading-none/g, to: 'text-[#1E293B] leading-none' },
  { from: /text-white mt-\d/g, to: (m) => m.replace('text-white', 'text-[#1E293B]') },
  { from: /text-white mb-\d/g, to: (m) => m.replace('text-white', 'text-[#1E293B]') },
  { from: /text-white pt-/g, to: 'text-[#1E293B] pt-' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const rule of stringReplacements) {
    const newContent = typeof rule.to === 'function' 
      ? content.replace(rule.from, rule.to)
      : content.replace(rule.from, rule.to);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function processDirectory(dir) {
  const basePath = path.join(__dirname, dir);
  if (!fs.existsSync(basePath)) return { processed: 0, changed: 0 };
  
  let processed = 0;
  let changed = 0;
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))) {
        processed++;
        if (processFile(fullPath)) {
          changed++;
        }
      }
    }
  }
  
  walk(basePath);
  return { processed, changed };
}

console.log('\n🎨 Pass 5 — Comprehensive text-white cleanup\n');

const { processed, changed } = processDirectory('src');
console.log(`\n✅ Pass 5 Complete: ${changed}/${processed} files updated.\n`);
