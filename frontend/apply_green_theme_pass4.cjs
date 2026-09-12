/**
 * Pass 4 — Landing Page specific + LandingPage.tsx full update
 */

const fs = require('fs');
const path = require('path');

const targetFiles = [
  'src/pages/LandingPage.tsx',
  'src/pages/StubDashboard.tsx',
  'src/App.tsx',
];

const replacements = [
  // Landing page specific colors
  { from: /bg-\[#EF4444\]/g, to: 'bg-[#16A34A]' },
  { from: /text-\[#EF4444\]/g, to: 'text-[#16A34A]' },
  { from: /hover:bg-\[#DC2626\]/g, to: 'hover:bg-[#15803D]' },
  { from: /text-\[#DC2626\]/g, to: 'text-[#15803D]' },
  { from: /hover:text-\[#DC2626\]/g, to: 'hover:text-[#15803D]' },
  { from: /border-\[#EF4444\]/g, to: 'border-[#16A34A]' },
  { from: /from-\[#EF4444\]/g, to: 'from-[#16A34A]' },
  { from: /shadow-\[#EF4444\]/g, to: 'shadow-[#16A34A]' },
  { from: /shadow-\[0_0_8px_#EF4444\]/g, to: 'shadow-[0_0_8px_#16A34A]' },
  { from: /shadow-\[#EF4444\]\/20/g, to: 'shadow-[#16A34A]/20' },
  { from: /from-\[#EF4444\]\/10/g, to: 'from-[#16A34A]/10' },
  
  // Old dark bg
  { from: /bg-\[#F8FAFC\]/g, to: 'bg-[#F0FDFA]' },
  
  // Old border
  { from: /border-\[#E2E8F0\]/g, to: 'border-[#CCFBF1]' },
  
  // Old secondary text
  { from: /text-\[#64748B\]/g, to: 'text-[#475569]' },
  
  // selection colors
  { from: /selection:bg-\[#EF4444\]/g, to: 'selection:bg-[#16A34A]' },
  
  // Amber/orange stragglers
  { from: /text-amber-500/g, to: 'text-[#0D9488]' },
  { from: /bg-amber-500/g, to: 'bg-[#0D9488]' },
  { from: /text-\[#F97316\]/g, to: 'text-[#16A34A]' },
  { from: /bg-\[#F97316\]/g, to: 'bg-[#16A34A]' },
  
  // Fix hover:text-white on nav links
  { from: /hover:text-white transition-colors/g, to: 'hover:text-[#16A34A] transition-colors' },
  { from: /hover:text-white/g, to: 'hover:text-[#16A34A]' },
  
  // Fix text-black on green buttons
  { from: /bg-\[#16A34A\] text-black/g, to: 'bg-[#16A34A] text-white' },
  { from: /bg-\[#15803D\] text-black/g, to: 'bg-[#15803D] text-white' },
  
  // text-white on light bg contexts
  { from: /font-semibold text-white rounded-xl/g, to: 'font-semibold text-[#1E293B] rounded-xl' },
  { from: /text-white font-semibold/g, to: 'text-[#1E293B] font-semibold' },
  { from: /text-white font-bold/g, to: 'text-[#1E293B] font-bold' },
  { from: /text-white font-medium/g, to: 'text-[#1E293B] font-medium' },
  { from: /text-sm text-white/g, to: 'text-sm text-[#1E293B]' },
  { from: /text-white mb-\d/g, to: (m) => m.replace('text-white', 'text-[#1E293B]') },
  
  // Fix red-based colors in pricing/features sections (NOT EF4444 which already handled)
  { from: /bg-red-\d+/g, to: 'bg-green-600' },
];

let totalChanged = 0;

for (const relPath of targetFiles) {
  const filePath = path.join(__dirname, relPath);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const rule of replacements) {
    if (typeof rule.to === 'function') {
      const newContent = content.replace(rule.from, rule.to);
      if (newContent !== content) { content = newContent; changed = true; }
    } else {
      const newContent = content.replace(rule.from, rule.to);
      if (newContent !== content) { content = newContent; changed = true; }
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✓ Updated: ${relPath}`);
    totalChanged++;
  }
}

console.log(`\n✅ Pass 4 Complete: ${totalChanged} files updated.\n`);
