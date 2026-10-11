const fs = require('fs');

const content = fs.readFileSync('src/views/MultiStepLessonView.tsx', 'utf8');
const lines = content.split('\n');

const findings = [];
lines.forEach((l, idx) => {
  const lineNum = idx + 1;
  if (
    l.includes('#FDFBF7') ||
    l.includes('#FFFFFF') ||
    l.includes('#FFF') ||
    l.includes('#1E1E1E') ||
    l.includes('#FEF2F2') ||
    l.includes('#FEF3C7') ||
    l.includes('#ECFDF5')
  ) {
    findings.push({ line: lineNum, text: l.trim() });
  }
});

console.log(`Found ${findings.length} lines with hardcoded colors in MultiStepLessonView.tsx:`);
findings.forEach(f => console.log(`${f.line}: ${f.text}`));
