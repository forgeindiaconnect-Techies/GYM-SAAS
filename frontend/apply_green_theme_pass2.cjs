/**
 * Second pass: Fix remaining text-white issues in JSX content
 * and fix button tab active states where text-white is on light bg
 */

const fs = require('fs');
const path = require('path');

const PAGE_DIRS = [
  'src/pages/admin',
  'src/pages/super-admin',
  'src/pages/member',
  'src/pages/trainer',
  'src/pages/auth',
  'src/pages/company',
  'src/pages/legal',
  'src/pages/marketplace',
  'src/pages/subscription',
  'src/components',
];

// Second pass: fix remaining occurrences
const replacements = [
  // Fix "text-white" in JSX text — these are inside rendered content, not buttons
  // Pattern: text-sm text-white font-semibold (table rows, card values etc.)
  { from: /text-sm text-white font-semibold/g, to: 'text-sm text-[#1E293B] font-semibold' },
  { from: /text-sm font-semibold text-white/g, to: 'text-sm font-semibold text-[#1E293B]' },
  { from: /text-sm text-white/g, to: 'text-sm text-[#1E293B]' },
  { from: /text-base text-white/g, to: 'text-base text-[#1E293B]' },
  { from: /font-semibold text-white/g, to: 'font-semibold text-[#1E293B]' },
  { from: /font-bold text-white/g, to: 'font-bold text-[#1E293B]' },
  { from: /font-medium text-white/g, to: 'font-medium text-[#1E293B]' },
  { from: /tracking-tight text-white/g, to: 'tracking-tight text-[#1E293B]' },
  { from: /text-white tracking-tight/g, to: 'text-[#1E293B] tracking-tight' },
  
  // Active tab buttons: bg-[color] text-white → text-white is okay (white text on color bg)
  // But if bg-[#16A34A] text-[#1E293B] — that was from prev pass converting too aggressively. Fix:
  // Actually for button tabs: bg-[#16A34A] text-white (white text on green) IS correct — let's restore it
  { from: /bg-\[#16A34A\] text-\[#1E293B\]/g, to: 'bg-[#16A34A] text-white' },
  { from: /bg-blue-500 text-\[#1E293B\]/g, to: 'bg-blue-500 text-white' },
  { from: /bg-\[#0D9488\] text-\[#1E293B\]/g, to: 'bg-[#0D9488] text-white' },
  { from: /bg-\[#06B6D4\] text-\[#1E293B\]/g, to: 'bg-[#06B6D4] text-white' },

  // Fix: "text-white" on its own (remaining inline className strings)
  { from: /"text-white"/g, to: '"text-[#1E293B]"' },
  
  // Fix hover text on buttons that aren't sidebar items 
  { from: /hover:text-\[#16A34A\](?=\s*transition)/g, to: 'hover:text-[#16A34A] transition' },
  
  // Fix alert h4s that still have text-white
  { from: /text-white font-semibold text-sm/g, to: 'text-[#1E293B] font-semibold text-sm' },
  { from: /text-white font-semibold/g, to: 'text-[#1E293B] font-semibold' },
  { from: /text-white font-bold/g, to: 'text-[#1E293B] font-bold' },
  { from: /text-white font-medium/g, to: 'text-[#1E293B] font-medium' },
  
  // Remaining standalone text-white in class strings (not in buttons with colored bg)
  { from: /\s+text-white\s+leading-none/g, to: ' text-[#1E293B] leading-none' },
  { from: /text-white leading-none/g, to: 'text-[#1E293B] leading-none' },
  { from: /text-white mb-1/g, to: 'text-[#1E293B] mb-1' },
  { from: /text-white mb-2/g, to: 'text-[#1E293B] mb-2' },
  { from: /text-white mb-3/g, to: 'text-[#1E293B] mb-3' },
  { from: /text-white mb-4/g, to: 'text-[#1E293B] mb-4' },
  { from: /text-white mb-6/g, to: 'text-[#1E293B] mb-6' },
  { from: /text-white mt-1/g, to: 'text-[#1E293B] mt-1' },
  { from: /text-white mt-2/g, to: 'text-[#1E293B] mt-2' },

  // Old E2E8F0 border missed in some files
  { from: /border-\[#E2E8F0\]/g, to: 'border-[#CCFBF1]' },
  { from: /divide-\[#E2E8F0\]/g, to: 'divide-[#CCFBF1]' },
  
  // Fix any remaining old hover:text-white that should be green
  { from: /hover:text-white/g, to: 'hover:text-[#16A34A]' },

  // Fix Cancel button text that became green
  { from: /text-\[#16A34A\] hover:text-\[#16A34A\]/g, to: 'text-[#475569] hover:text-[#16A34A]' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const rule of replacements) {
    const newContent = content.replace(rule.from, rule.to);
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
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx'))) {
        processed++;
        if (processFile(fullPath)) {
          changed++;
          console.log(`  ✓ ${path.relative(__dirname, fullPath)}`);
        }
      }
    }
  }
  
  walk(basePath);
  return { processed, changed };
}

console.log('\n🎨 Pass 2 — Fixing remaining text-white and tab button states\n');

let totalProcessed = 0, totalChanged = 0;
for (const dir of PAGE_DIRS) {
  const { processed, changed } = processDirectory(dir);
  totalProcessed += processed;
  totalChanged += changed;
}

console.log(`\n✅ Pass 2 Complete: ${totalChanged}/${totalProcessed} files updated.\n`);
