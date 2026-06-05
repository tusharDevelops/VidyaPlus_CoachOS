const fs = require('fs');
const path = require('path');

const dirsToScan = [
  'apps/web/src'
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Padding adjustments inside classNames (ensure safe defaults for <320px)
  content = content.replace(/className="([^"]*)\bp-8\b([^"]*)"/g, 'className="$1p-3 sm:p-8$2"');
  content = content.replace(/className=\{`([^`]*)\bp-8\b([^`]*)`\}/g, 'className={`$1p-3 sm:p-8$2`}');

  content = content.replace(/className="([^"]*)\bp-10\b([^"]*)"/g, 'className="$1p-4 sm:p-10$2"');
  content = content.replace(/className=\{`([^`]*)\bp-10\b([^`]*)`\}/g, 'className={`$1p-4 sm:p-10$2`}');

  // Convert px-5 sm:px-8 to px-3 sm:px-8 (already has sm:px-8, so just replace px-5)
  content = content.replace(/className="([^"]*)\bpx-5 sm:px-8\b([^"]*)"/g, 'className="$1px-3 sm:px-8$2"');
  content = content.replace(/className=\{`([^`]*)\bpx-5 sm:px-8\b([^`]*)`\}/g, 'className={`$1px-3 sm:px-8$2`}');

  // Replace standalone px-8
  content = content.replace(/className="([^"]*)\bpx-8\b([^"]*)"/g, 'className="$1px-3 sm:px-8$2"');
  content = content.replace(/className=\{`([^`]*)\bpx-8\b([^`]*)`\}/g, 'className={`$1px-3 sm:px-8$2`}');

  // 2. Gap scaling
  content = content.replace(/className="([^"]*)\bgap-8\b([^"]*)"/g, 'className="$1gap-3 sm:gap-8$2"');
  content = content.replace(/className=\{`([^`]*)\bgap-8\b([^`]*)`\}/g, 'className={`$1gap-3 sm:gap-8$2`}');

  // 3. Text size scaling for huge texts
  content = content.replace(/className="([^"]*)\btext-4xl sm:text-5xl\b([^"]*)"/g, 'className="$1text-3xl sm:text-5xl$2"');
  content = content.replace(/className="([^"]*)\btext-\[42px\] sm:text-\[56px\] lg:text-\[72px\]\b([^"]*)"/g, 'className="$1text-3xl sm:text-5xl lg:text-[72px]$2"');
  content = content.replace(/className=\{`([^`]*)\btext-4xl sm:text-5xl\b([^`]*)`\}/g, 'className={`$1text-3xl sm:text-5xl$2`}');

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
console.log('Web mobile layout pass complete.');
