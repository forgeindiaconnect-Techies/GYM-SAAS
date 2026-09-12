const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const replacements = {
  // Backgrounds and Borders
  '#080808': '#121212',
  '#101010': '#1E1E1E',
  '#151515': '#252525',
  '#272727': '#333333',
  
  // Hex Accents
  '#FF3366': '#D4AF37',
  '#ff3366': '#d4af37',
  
  // Tailwind Red -> Amber
  'red-500': 'amber-500',
  'red-400': 'amber-400',
  'red-600': 'amber-600',
  
  // Hex to RGB instances for shadows/borders if any
  '239,68,68': '245,158,11',
  '239, 68, 68': '245, 158, 11',
};

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  for (const [oldStr, newStr] of Object.entries(replacements)) {
    // Only replace if it's not part of a word like 'shared-500'
    const regex = new RegExp(oldStr.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    content = content.replace(regex, newStr);
  }
  
  // Fix specifically the 'Rejected' status badge back to red so it doesn't blend with 'Pending' (amber/yellow)
  // This is a common pattern: text-amber-500 ... 'Rejected'
  // It's safer to just do a quick fix for the word 'Rejected' ? 'bg-amber-500/10 text-amber-500'
  content = content.replace(/'bg-amber-500\/10 text-amber-500' \: 'bg-yellow-500/g, "'bg-red-500/10 text-red-500' : 'bg-yellow-500");
  content = content.replace(/status === 'Rejected' \? 'bg-amber-500/g, "status === 'Rejected' ? 'bg-red-500");
  content = content.replace(/status === 'Rejected' \? 'text-amber-500/g, "status === 'Rejected' ? 'text-red-500");
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts') || fullPath.endsWith('.css') || fullPath.endsWith('.html')) {
      replaceInFile(fullPath);
    }
  }
}

console.log('Applying Premium Stealth Theme...');
walkDir(directory);
console.log('Theme applied successfully!');
