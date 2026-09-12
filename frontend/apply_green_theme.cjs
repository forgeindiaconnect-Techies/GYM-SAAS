/**
 * Color Replacement Script — AI Gym Management SaaS
 * Replaces old orange/amber/dark-mode colors with Green + Teal + Cyan palette
 * Run: node apply_green_theme.cjs
 */

const fs = require('fs');
const path = require('path');

// Directories to process
const PAGE_DIRS = [
  'src/pages/admin',
  'src/pages/super-admin',
  'src/pages/member',
  'src/pages/trainer',
  'src/pages/auth',
  'src/pages/gym-owner',
  'src/pages/company',
  'src/pages/legal',
  'src/pages/manager',
  'src/pages/marketplace',
  'src/pages/receptionist',
  'src/pages/saas',
  'src/pages/subscription',
  'src/components',
];

// Color replacement rules — ordered from most specific to least specific
const replacements = [
  // ============ HEADINGS & BODY TEXT — white → dark (light background) ============
  // text-white for headings inside cards/pages (NOT buttons)
  { from: /className="text-3xl font-bold text-white/g, to: 'className="text-3xl font-bold text-[#1E293B]' },
  { from: /className="text-2xl font-bold text-white/g, to: 'className="text-2xl font-bold text-[#1E293B]' },
  { from: /className="text-xl font-bold text-white/g, to: 'className="text-xl font-bold text-[#1E293B]' },
  { from: /className="text-lg font-bold text-white/g, to: 'className="text-lg font-bold text-[#1E293B]' },
  { from: /className="text-lg font-semibold text-white/g, to: 'className="text-lg font-semibold text-[#1E293B]' },
  { from: /text-xl font-bold text-white/g, to: 'text-xl font-bold text-[#1E293B]' },
  { from: /text-2xl font-bold text-white/g, to: 'text-2xl font-bold text-[#1E293B]' },
  { from: /text-3xl font-bold text-white/g, to: 'text-3xl font-bold text-[#1E293B]' },
  { from: /text-3xl font-extrabold text-white/g, to: 'text-3xl font-extrabold text-[#1E293B]' },
  // Inline text-white for body content
  { from: /\btext-white\b(?! rounded| shadow| bg| border| px| py| p-| m-| flex| block| inline| font| text-)/g, to: 'text-[#1E293B]' },

  // ============ ORANGE PRIMARY (#F97316) → GREEN (#16A34A) ============
  { from: /bg-\[#F97316\]\/10/g, to: 'bg-[#16A34A]/10' },
  { from: /bg-\[#F97316\]\/5/g, to: 'bg-[#16A34A]/5' },
  { from: /bg-\[#F97316\]/g, to: 'bg-[#16A34A]' },
  { from: /text-\[#F97316\]/g, to: 'text-[#16A34A]' },
  { from: /border-\[#F97316\]/g, to: 'border-[#16A34A]' },
  { from: /hover:border-\[#F97316\]/g, to: 'hover:border-[#16A34A]' },
  { from: /hover:bg-\[#F97316\]\/10/g, to: 'hover:bg-[#16A34A]/10' },
  { from: /hover:bg-\[#F97316\]\/5/g, to: 'hover:bg-[#16A34A]/5' },
  { from: /shadow-\[#F97316\]/g, to: 'shadow-[#16A34A]' },
  { from: /shadow-\[0_0_8px_#F97316\]/g, to: 'shadow-[0_0_8px_#16A34A]' },
  { from: /shadow-\[0_0_10px_rgba\(249,115,22/g, to: 'shadow-[0_0_10px_rgba(22,163,74' },
  { from: /from-\[#F97316\]/g, to: 'from-[#16A34A]' },
  { from: /to-\[#F97316\]/g, to: 'to-[#16A34A]' },
  { from: /via-\[#F97316\]/g, to: 'via-[#16A34A]' },
  { from: /ring-\[#F97316\]/g, to: 'ring-[#16A34A]' },

  // ============ RED (#EF4444) for PRIMARY BUTTONS → GREEN (#16A34A) ============
  { from: /bg-\[#EF4444\]\s+text-white/g, to: 'bg-[#16A34A] text-white' },
  { from: /bg-\[#EF4444\]\/10/g, to: 'bg-[#16A34A]/10' },
  { from: /bg-\[#EF4444\]\/5/g, to: 'bg-[#16A34A]/5' },
  { from: /bg-\[#EF4444\]/g, to: 'bg-[#16A34A]' },
  { from: /hover:bg-\[#DC2626\]/g, to: 'hover:bg-[#15803D]' },
  { from: /hover:bg-\[#EF4444\]\/10/g, to: 'hover:bg-[#16A34A]/10' },
  { from: /hover:bg-\[#EF4444\]\/5/g, to: 'hover:bg-[#16A34A]/5' },
  { from: /text-\[#EF4444\](?!\s*font)/g, to: 'text-[#16A34A]' },
  { from: /border-\[#EF4444\]/g, to: 'border-[#16A34A]' },
  { from: /hover:border-\[#EF4444\]/g, to: 'hover:border-[#16A34A]' },
  { from: /shadow-\[0_0_8px_#EF4444\]/g, to: 'shadow-[0_0_8px_#16A34A]' },
  { from: /shadow-\[#EF4444\]/g, to: 'shadow-[#16A34A]' },

  // ============ AMBER (#F59E0B) → TEAL (#0D9488) ============
  { from: /text-amber-500/g, to: 'text-[#0D9488]' },
  { from: /bg-amber-500\/10/g, to: 'bg-[#0D9488]/10' },
  { from: /bg-amber-500\/5/g, to: 'bg-[#0D9488]/5' },
  { from: /bg-amber-500/g, to: 'bg-[#0D9488]' },
  { from: /border-amber-500/g, to: 'border-[#0D9488]' },
  { from: /hover:border-amber-500/g, to: 'hover:border-[#16A34A]' },
  { from: /hover:bg-amber-500\/5/g, to: 'hover:bg-[#16A34A]/5' },
  { from: /hover:bg-amber-500\/10/g, to: 'hover:bg-[#16A34A]/10' },
  { from: /shadow-\[0_0_10px_rgba\(245,158,11/g, to: 'shadow-[0_0_10px_rgba(13,148,136' },
  { from: /shadow-\[inset_0_0_10px_rgba\(245,158,11/g, to: 'shadow-[inset_0_0_10px_rgba(13,148,136' },
  { from: /from-amber-/g, to: 'from-teal-' },
  { from: /to-amber-/g, to: 'to-teal-' },
  { from: /text-amber-/g, to: 'text-teal-' },
  { from: /bg-amber-/g, to: 'bg-teal-' },

  // ============ OLD BACKGROUND (#F8FAFC, #1E1E2E, #121212) → NEW (#F0FDFA, #FFFFFF) ============
  { from: /bg-\[#F8FAFC\]/g, to: 'bg-[#F0FDFA]' },
  { from: /bg-\[#1E1E2E\]/g, to: 'bg-[#F0FDFA]' },
  { from: /bg-\[#121212\]/g, to: 'bg-[#F0FDFA]' },
  { from: /bg-\[#0F172A\]/g, to: 'bg-[#F0FDFA]' },
  { from: /bg-\[#1A1A2E\]/g, to: 'bg-[#FFFFFF]' },
  { from: /bg-\[#252525\]/g, to: 'bg-[#FFFFFF]' },
  { from: /bg-\[#1E1E1E\]/g, to: 'bg-[#FFFFFF]' },

  // ============ OLD BORDER (#E2E8F0, #333) → NEW BORDER (#CCFBF1) ============
  { from: /border-\[#E2E8F0\]/g, to: 'border-[#CCFBF1]' },
  { from: /divide-\[#E2E8F0\]/g, to: 'divide-[#CCFBF1]' },
  { from: /border-\[#333333\]/g, to: 'border-[#CCFBF1]' },
  { from: /border-\[#333\]/g, to: 'border-[#CCFBF1]' },

  // ============ CARD BACKGROUNDS (#252525 etc.) → WHITE ============
  { from: /bg-\[#252525\]/g, to: 'bg-[#FFFFFF]' },
  { from: /bg-\[#2D2D2D\]/g, to: 'bg-[#FFFFFF]' },

  // ============ HOVER TEXT-WHITE (sidebar fix) → GREEN ============
  { from: /hover:text-white/g, to: 'hover:text-[#16A34A]' },

  // ============ RADIAL GRADIENT — update colors ============
  { from: /rgba\(249,115,22,0\.03\)/g, to: 'rgba(22,163,74,0.04)' },
  { from: /rgba\(245,158,11,0\.03\)/g, to: 'rgba(13,148,136,0.04)' },
  { from: /rgba\(212,255,0,0\.03\)/g, to: 'rgba(22,163,74,0.04)' },

  // ============ SCROLLBAR THUMB COLOR ============
  { from: /background-color: #555/g, to: 'background-color: #0D9488' },

  // ============ BUTTON ACTIVE STATES ============
  { from: /bg-\[#EF4444\] text-white/g, to: 'bg-[#16A34A] text-white' },
  { from: /bg-amber-500 text-white/g, to: 'bg-[#0D9488] text-white' },

  // ============ SECONDARY TEXT (#64748B → #475569 — minor update) ============
  { from: /text-\[#64748B\]/g, to: 'text-[#475569]' },

  // ============ HOVER BG OLD DARK CARDS ============
  { from: /hover:bg-\[#FFFFFF\]\/50/g, to: 'hover:bg-[#F0FDFA]' },
  { from: /hover:bg-\[#1E1E2E\]/g, to: 'hover:bg-[#F0FDFA]' },
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
  if (!fs.existsSync(basePath)) {
    console.log(`  ⚠ Skipping (not found): ${dir}`);
    return { processed: 0, changed: 0 };
  }
  
  let processed = 0;
  let changed = 0;
  
  function walk(currentPath) {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts') || entry.name.endsWith('.jsx') || entry.name.endsWith('.js'))) {
        processed++;
        if (processFile(fullPath)) {
          changed++;
          console.log(`  ✓ Updated: ${path.relative(__dirname, fullPath)}`);
        }
      }
    }
  }
  
  walk(basePath);
  return { processed, changed };
}

console.log('\n🎨 AI Gym — Green + Teal + Cyan Theme Replacement\n');
console.log('=' .repeat(50));

let totalProcessed = 0;
let totalChanged = 0;

for (const dir of PAGE_DIRS) {
  console.log(`\n📁 Processing: ${dir}`);
  const { processed, changed } = processDirectory(dir);
  totalProcessed += processed;
  totalChanged += changed;
  console.log(`   ${changed}/${processed} files updated`);
}

console.log('\n' + '=' .repeat(50));
console.log(`\n✅ Complete! ${totalChanged}/${totalProcessed} files updated with new theme.\n`);
