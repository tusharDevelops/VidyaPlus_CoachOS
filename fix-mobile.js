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

  // 1. Padding adjustments inside classNames
  // Replace standalone "p-8" with "p-4 sm:p-8" inside classNames
  content = content.replace(/className="([^"]*)\bp-8\b([^"]*)"/g, 'className="$1p-4 sm:p-8$2"');
  content = content.replace(/className=\{`([^`]*)\bp-8\b([^`]*)`\}/g, 'className={`$1p-4 sm:p-8$2`}');

  // Replace standalone "p-10" with "p-5 sm:p-10"
  content = content.replace(/className="([^"]*)\bp-10\b([^"]*)"/g, 'className="$1p-5 sm:p-10$2"');
  content = content.replace(/className=\{`([^`]*)\bp-10\b([^`]*)`\}/g, 'className={`$1p-5 sm:p-10$2`}');
  
  // Replace standalone "px-8" with "px-4 sm:px-8"
  content = content.replace(/className="([^"]*)\bpx-8\b([^"]*)"/g, 'className="$1px-4 sm:px-8$2"');
  content = content.replace(/className=\{`([^`]*)\bpx-8\b([^`]*)`\}/g, 'className={`$1px-4 sm:px-8$2`}');

  // 2. Gap scaling
  // Replace "gap-8" with "gap-4 sm:gap-8"
  content = content.replace(/className="([^"]*)\bgap-8\b([^"]*)"/g, 'className="$1gap-4 sm:gap-8$2"');
  content = content.replace(/className=\{`([^`]*)\bgap-8\b([^`]*)`\}/g, 'className={`$1gap-4 sm:gap-8$2`}');

  // 3. Flex scaling for rigid rows
  // If we see flex items-center without flex-col sm:flex-row, it's risky to auto-replace because we might break intended rows.
  // We'll specifically target ones with justify-between
  // e.g. "flex items-center justify-between" -> "flex flex-col sm:flex-row sm:items-center justify-between"
  // Actually, some small headers need to stay flex-row. It's safer to only do padding and gaps automatically, and I'll manually fix the big flex containers.

  // 4. Overflows for tables
  // If a table is found and not wrapped in overflow-x-auto, wrap it!
  // This is tricky with regex if there are nested elements, so I will skip auto-wrapping tables and do it manually if needed, or assume they are mostly wrapped.
  
  // Wait, let's fix specifically known flex squashing in StaffStaffDetailLayer and StaffStudentDetailLayer.
  // We will do that manually.
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated: ${filePath}`);
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
console.log('Mobile layout pass complete.');
