/**
 * Teal + Mist Grey Theme Application Script
 * AI Gym Management SaaS Platform
 * 
 * Palette:
 * - Primary Teal: #167D78
 * - Mist Grey Background: #E8EFF0
 * - White: #FFFFFF
 * - Deep Teal: #344B4A
 * - Light Teal: #D8EAE7
 * - Teal Hover: #116660
 * - Light Border: #D9E2E3
 * - Muted Text: #697778
 * - Success: #27845A
 * - Warning: #D99A27
 * - Error: #C43D35
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

// 1. Color replacements (ordered from specific to general)
const colorReplacements = [
  // Primary colors -> Primary Teal (#167D78)
  { from: /#B8734E/gi, to: '#167D78' },
  { from: /#C65D35/gi, to: '#167D78' },
  { from: /#EA580C/gi, to: '#167D78' },
  { from: /#F97316/gi, to: '#167D78' },
  { from: /#C2410C/gi, to: '#167D78' },
  { from: /#9A3412/gi, to: '#167D78' },
  { from: /#A991D4/gi, to: '#167D78' },
  { from: /#967CC5/gi, to: '#167D78' },
  { from: /#AA3BFF/gi, to: '#167D78' },

  // Hover states -> Teal Hover (#116660)
  { from: /#9E5D3D/gi, to: '#116660' },
  { from: /#A94A29/gi, to: '#116660' },
  { from: /hover:bg-\[#0d3535\]/gi, to: 'hover:bg-[#116660]' },
  { from: /hover:bg-\[#0f3434\]/gi, to: 'hover:bg-[#116660]' },
  { from: /hover:bg-\[#0f3535\]/gi, to: 'hover:bg-[#116660]' },
  { from: /hover:bg-\[#0d2d2d\]/gi, to: 'hover:bg-[#116660]' },
  { from: /hover:bg-\[#0d3030\]/gi, to: 'hover:bg-[#116660]' },
  { from: /#0D3535/gi, to: '#116660' },
  { from: /#0F3434/gi, to: '#116660' },
  { from: /#0F3535/gi, to: '#116660' },
  { from: /#0D2D2D/gi, to: '#116660' },
  { from: /#0D3030/gi, to: '#116660' },
  { from: /#1F5F5F/gi, to: '#167D78' },
  { from: /#1B5353/gi, to: '#167D78' },
  { from: /#256A6A/gi, to: '#167D78' },
  { from: /#2D6868/gi, to: '#116660' },
  { from: /#103838/gi, to: '#116660' },
  { from: /#1F5C5C/gi, to: '#167D78' },
  { from: /#2A7575/gi, to: '#167D78' },
  { from: /#123838/gi, to: '#116660' },
  { from: /#1A5C5C/gi, to: '#167D78' },

  // Background colors -> Mist Grey (#E8EFF0)
  { from: /#FFF1D8/gi, to: '#E8EFF0' },
  { from: /#FFF9F0/gi, to: '#E8EFF0' },
  { from: /#FFF7ED/gi, to: '#E8EFF0' },
  { from: /#FFF8ED/gi, to: '#E8EFF0' },
  { from: /#F8FAF9/gi, to: '#E8EFF0' },
  { from: /#F8FAFA/gi, to: '#E8EFF0' },
  { from: /#F0F7F6/gi, to: '#E8EFF0' },
  { from: /#F4F6F4/gi, to: '#E8EFF0' },
  { from: /#FAF9F6/gi, to: '#E8EFF0' },
  { from: /#FAF8F5/gi, to: '#E8EFF0' },
  { from: /#F7FAF8/gi, to: '#E8EFF0' },
  { from: /#F8FAFB/gi, to: '#E8EFF0' },
  { from: /#F9FBFA/gi, to: '#E8EFF0' },
  { from: /#F0F7F4/gi, to: '#E8EFF0' },
  { from: /#F0FDFA/gi, to: '#E8EFF0' },
  { from: /#F1F5F3/gi, to: '#E8EFF0' },
  { from: /#FFFDF8/gi, to: '#E8EFF0' },
  { from: /#F7F4FA/gi, to: '#E8EFF0' },

  // Headings / Dark text / Accents -> Deep Teal (#344B4A)
  { from: /#51443C/gi, to: '#344B4A' },
  { from: /#38312E/gi, to: '#344B4A' },
  { from: /#7A3D28/gi, to: '#344B4A' },
  { from: /#292524/gi, to: '#344B4A' },
  { from: /#292431/gi, to: '#344B4A' },
  { from: /#4C315E/gi, to: '#344B4A' },
  { from: /#44403C/gi, to: '#344B4A' },
  { from: /#332E2B/gi, to: '#344B4A' },
  { from: /#242E28/gi, to: '#344B4A' },
  { from: /#1B2323/gi, to: '#344B4A' },

  // Light Teal Accents / Highlights / Badges -> Light Teal (#D8EAE7)
  { from: /#D8C3A5/gi, to: '#D8EAE7' },
  { from: /#F6E5DB/gi, to: '#D8EAE7' },
  { from: /#E8D5B7/gi, to: '#D8EAE7' },
  { from: /#FED7AA/gi, to: '#D8EAE7' },
  { from: /#E9DFF4/gi, to: '#D8EAE7' },
  { from: /#B8D8CE/gi, to: '#D8EAE7' },
  { from: /#E8F5F3/gi, to: '#D8EAE7' },
  { from: /#E8F0EC/gi, to: '#D8EAE7' },
  { from: /#E5EAE7/gi, to: '#D8EAE7' },

  // Light Borders / Dividers -> Light Border (#D9E2E3)
  { from: /#E8DCCB/gi, to: '#D9E2E3' },
  { from: /#E8DFD3/gi, to: '#D9E2E3' },
  { from: /#E7E5E4/gi, to: '#D9E2E3' },
  { from: /#E5DDEB/gi, to: '#D9E2E3' },
  { from: /#EAE7DF/gi, to: '#D9E2E3' },
  { from: /#D3DFDA/gi, to: '#D9E2E3' },
  { from: /#CCFBF1/gi, to: '#D9E2E3' },

  // Muted Text / Secondary Labels -> Muted Text (#697778)
  { from: /#807268/gi, to: '#697778' },
  { from: /#776C64/gi, to: '#697778' },
  { from: /#57534E/gi, to: '#697778' },
  { from: /#78716C/gi, to: '#697778' },
  { from: /#6B5E78/gi, to: '#697778' },
  { from: /#899794/gi, to: '#697778' },
  { from: /#A8ADA9/gi, to: '#697778' },

  // Status Colors:
  // Warnings -> #D99A27
  { from: /#B77916/gi, to: '#D99A27' },
  { from: /#B45309/gi, to: '#D99A27' },
  { from: /#854D0E/gi, to: '#D99A27' },
  { from: /#92400E/gi, to: '#D99A27' },

  // Errors -> #C43D35
  { from: /#C43D4D/gi, to: '#C43D35' },
  { from: /#DC2626/gi, to: '#C43D35' },
  { from: /#B81D44/gi, to: '#C43D35' },
  { from: /#E11D48/gi, to: '#C43D35' },

  // Fix old dark table header bar in Super Admin
  { from: /bg-\[#0a0a0a\]\s+text-\[#555\]/gi, to: 'bg-[#E8EFF0] text-[#344B4A]' },
  { from: /bg-\[#0a0a0a\]/gi, to: 'bg-[#E8EFF0]' },

  // Fix button text on primary teal
  { from: /bg-\[#167D78\]\s+text-black/gi, to: 'bg-[#167D78] text-white' },
  { from: /bg-\[#167D78\]\s+text-\[#51443C\]/gi, to: 'bg-[#167D78] text-white' },
  { from: /bg-\[#167D78\]\s+text-\[#344B4A\]/gi, to: 'bg-[#167D78] text-white' },
  { from: /bg-\[#116660\]\s+text-black/gi, to: 'bg-[#116660] text-white' },
  { from: /hover:bg-\[#167D78\]\s+hover:text-\[#51443C\]/gi, to: 'hover:bg-[#167D78] hover:text-white' },
  { from: /hover:bg-\[#167D78\]\s+hover:text-\[#344B4A\]/gi, to: 'hover:bg-[#167D78] hover:text-white' },
  { from: /group-hover:bg-\[#167D78\]\s+group-hover:text-\[#51443C\]/gi, to: 'group-hover:bg-[#167D78] group-hover:text-white' },
  { from: /group-hover:bg-\[#167D78\]\s+group-hover:text-\[#344B4A\]/gi, to: 'group-hover:bg-[#167D78] group-hover:text-white' },

  // Shadows: Replace orange/purple heavy shadows with subtle shadows
  { from: /shadow-orange-\d+(\/\d+)?/gi, to: 'shadow-teal-900/10' },
  { from: /shadow-purple-\d+(\/\d+)?/gi, to: 'shadow-teal-900/10' },
  { from: /shadow-slate-1000\/\d+/gi, to: 'shadow-teal-900/10' },
  { from: /shadow-\[0_0_30px_rgba\(249,115,22,[^\]]+\)\]/gi, to: 'shadow-[0_0_20px_rgba(22,125,120,0.25)]' },
  { from: /shadow-\[0_0_30px_rgba\(212,175,55,[^\]]+\)\]/gi, to: 'shadow-[0_0_20px_rgba(22,125,120,0.25)]' },
  { from: /shadow-\[0_0_40px_rgba\(22,163,74,[^\]]+\)\]/gi, to: 'shadow-[0_0_20px_rgba(22,125,120,0.25)]' },
  { from: /shadow-\[0_0_30px_rgba\(22,163,74,[^\]]+\)\]/gi, to: 'shadow-[0_0_20px_rgba(22,125,120,0.25)]' },

  // Radials and rgba
  { from: /rgba\(198,93,53,0\.04\)/gi, to: 'rgba(22,125,120,0.04)' },
  { from: /rgba\(76,\s*49,\s*94,\s*0\.4\)/gi, to: 'rgba(52,75,74,0.4)' },
  { from: /rgba\(249,\s*115,\s*22,\s*0\.45\)/gi, to: 'rgba(22,125,120,0.45)' },
  { from: /rgba\(249,\s*115,\s*22,\s*0\.1\)/gi, to: 'rgba(22,125,120,0.1)' },
  { from: /rgba\(249,115,22,/gi, to: 'rgba(22,125,120,' },
  { from: /rgba\(212,175,55,/gi, to: 'rgba(22,125,120,' },
  { from: /rgba\(22,163,74,/gi, to: 'rgba(22,125,120,' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const rule of colorReplacements) {
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

console.log('🎨 Applying Teal + Mist Grey Theme across frontend/src...');
const stats = walkDir(SRC_DIR);
console.log(`✅ Processed ${stats.count} files, updated ${stats.changed} files with new Teal + Mist Grey palette.`);
