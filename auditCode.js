const fs = require('fs');
const path = require('path');

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== '.expo' && entry.name !== '.git') {
        scanDir(fullPath);
      }
    } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
      checkFile(fullPath);
    }
  }
}

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  lines.forEach((line, idx) => {
    // Check window/document
    if (line.includes('window.') && !line.includes('typeof window') && !line.includes('Platform.OS === \'web\'')) {
      console.log(`[WINDOW] ${filePath}:${idx + 1} -> ${line.trim()}`);
    }
    if (line.includes('document.') && !line.includes('typeof document') && !line.includes('Platform.OS === \'web\'')) {
      console.log(`[DOCUMENT] ${filePath}:${idx + 1} -> ${line.trim()}`);
    }
    if (line.includes('localStorage') && !line.includes('typeof localStorage') && !line.includes('Platform.OS === \'web\'')) {
      console.log(`[LOCALSTORAGE] ${filePath}:${idx + 1} -> ${line.trim()}`);
    }
    if (line.includes('alert(') && !line.includes('Alert.alert') && !line.includes('//')) {
      console.log(`[ALERT] ${filePath}:${idx + 1} -> ${line.trim()}`);
    }
  });
}

console.log('--- STARTING AUDIT ---');
scanDir(path.join(__dirname, 'app'));
scanDir(path.join(__dirname, 'src'));
console.log('--- AUDIT COMPLETE ---');
