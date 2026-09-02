const fs = require('fs');

const raw = fs.readFileSync('extracted_training_plans.txt', 'utf8');

const parts = raw.split(/={10,}\r?\nFILE:\s*/);

const planFiles = [];

for (const part of parts) {
  if (!part.trim()) continue;
  const match = part.match(/^([^\r\n]+)\r?\n={10,}\r?\n([\s\S]*)$/);
  if (match) {
    const fileName = match[1].trim();
    const content = match[2].trim();
    const lines = content.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    planFiles.push({ fileName, content, lines });
  }
}

console.log(`Parsed ${planFiles.length} files:`);
planFiles.forEach(f => {
  console.log(`- ${f.fileName}: ${f.lines.length} lines`);
});
