/**
 * Pass 3 — Final cleanup: Fix text-black on green buttons, text-white on filter buttons
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

const replacements = [
  // Fix: text-black on green buttons → text-white (white text on green bg is correct)
  { from: /bg-\[#16A34A\] text-black/g, to: 'bg-[#16A34A] text-white' },
  { from: /bg-\[#15803D\] text-black/g, to: 'bg-[#15803D] text-white' },
  
  // Fix: standalone text-white in buttons that have NO colored bg (filter buttons etc.)
  // bg-[#FFFFFF] border ... text-white → text-[#1E293B]
  { from: /bg-\[#FFFFFF\] border border-\[#CCFBF1\] text-white/g, to: 'bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B]' },
  { from: /bg-white border border-\[#CCFBF1\] text-white/g, to: 'bg-white border border-[#CCFBF1] text-[#1E293B]' },
  
  // Fix remaining standalone text-white NOT on colored backgrounds
  // Context: rounded-xl|rounded-lg + text-white
  { from: /border-\[#CCFBF1\] rounded-xl text-white/g, to: 'border-[#CCFBF1] rounded-xl text-[#1E293B]' },
  { from: /border-\[#CCFBF1\] px-4 py-2 rounded-xl text-white/g, to: 'border-[#CCFBF1] px-4 py-2 rounded-xl text-[#1E293B]' },

  // Fix any remaining text-white in bg-[#FFFFFF] context
  { from: /(bg-\[#FFFFFF\][^"]*?)text-white/g, to: '$1text-[#1E293B]' },
  
  // Fix link colors that are still red
  { from: /text-\[#EF4444\] font-semibold/g, to: 'text-[#16A34A] font-semibold' },
  { from: /text-\[#EF4444\] font-medium/g, to: 'text-[#16A34A] font-medium' },
  
  // hover:text-[#1E293B] transition — this pattern from cancel buttons
  { from: /hover:text-\[#1E293B\] transition-colors/g, to: 'hover:text-[#16A34A] transition-colors' },
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

console.log('\n🎨 Pass 3 — Final cleanup\n');

let totalProcessed = 0, totalChanged = 0;
for (const dir of PAGE_DIRS) {
  const { processed, changed } = processDirectory(dir);
  totalProcessed += processed;
  totalChanged += changed;
}

console.log(`\n✅ Pass 3 Complete: ${totalChanged}/${totalProcessed} files updated.\n`);
