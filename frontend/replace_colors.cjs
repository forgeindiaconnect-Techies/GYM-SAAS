const fs = require('fs');
const path = require('path');

const directory = path.join(__dirname, 'src');

const oldPrimary = 'D4FF00';
const newPrimary = 'FF3366';
const oldHover = 'bce600';
const newHover = 'e62e5c'; // Slightly darker for hover

function replaceInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  if (content.includes(oldPrimary) || content.includes(oldHover) || content.includes(oldPrimary.toLowerCase()) || content.includes(oldHover.toLowerCase())) {
    const regexPrimary = new RegExp(oldPrimary, 'gi');
    const regexHover = new RegExp(oldHover, 'gi');
    
    let newContent = content.replace(regexPrimary, newPrimary);
    newContent = newContent.replace(regexHover, newHover);
    
    fs.writeFileSync(filePath, newContent, 'utf8');
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

walkDir(directory);
console.log('Color replacement complete!');
