const fs = require('fs');
const path = require('path');

const dirsToScan = [
  'apps/admin/src',
  'apps/staff/src',
  'apps/student/src'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // Cleanup accidentally nested utilities
  content = content.replace(/sm:p-4 sm:p-8/g, 'sm:p-8');
  content = content.replace(/sm:p-5 sm:p-10/g, 'sm:p-10');
  content = content.replace(/p-4 p-4 sm:p-8/g, 'p-4 sm:p-8');
  content = content.replace(/p-4 sm:p-4/g, 'p-4');
  content = content.replace(/sm:gap-4 sm:gap-8/g, 'sm:gap-8');
  content = content.replace(/gap-4 gap-4 sm:gap-8/g, 'gap-4 sm:gap-8');

  // Specific fix for admin layout
  content = content.replace(/p-4 sm:p-8 lg:p-5 sm:p-10/g, 'p-4 sm:p-8 lg:p-10');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Cleaned: ${filePath}`);
  }
}

function scanDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      scanDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

dirsToScan.forEach(dir => scanDir(path.join(__dirname, dir)));
console.log('Cleanup pass complete.');
