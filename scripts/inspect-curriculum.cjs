const fs = require('fs');
const path = require('path');

const curriculumDir = 'C:\\Users\\kamat\\Desktop\\Pythoncurriculum\\python_content';
const manifestPath = 'C:\\Users\\kamat\\Desktop\\Pythoncurriculum\\manifest.json';
const syllabusPath = 'C:\\Users\\kamat\\Desktop\\Pythoncurriculum\\PYTHON_MASTER_SYLLABUS.txt';

console.log('--- CURRICULUM INSPECTION ---');
console.log('Checking paths:');
console.log('Curriculum dir exists:', fs.existsSync(curriculumDir));
console.log('Manifest exists:', fs.existsSync(manifestPath));
console.log('Syllabus exists:', fs.existsSync(syllabusPath));

const unitDirs = fs.readdirSync(curriculumDir)
  .filter(d => fs.statSync(path.join(curriculumDir, d)).isDirectory())
  .sort();

console.log('Total unit directories:', unitDirs.length);

let totalLessons = 0;
let totalItems = 0;
const typeCounts = {};
const fieldCounts = {};
const samplesByType = {};

for (const unit of unitDirs) {
  const uPath = path.join(curriculumDir, unit);
  const files = fs.readdirSync(uPath).filter(f => f.endsWith('.json')).sort();
  totalLessons += files.length;

  for (const f of files) {
    const fullPath = path.join(uPath, f);
    const content = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
    const items = content.items || [];
    totalItems += items.length;

    for (const item of items) {
      typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
      for (const k of Object.keys(item)) {
        fieldCounts[k] = (fieldCounts[k] || 0) + 1;
      }
      if (!samplesByType[item.type]) {
        samplesByType[item.type] = item;
      }
    }
  }
}

console.log('Total Lessons:', totalLessons);
console.log('Total Items:', totalItems);
console.log('Question Types distribution:', JSON.stringify(typeCounts, null, 2));
console.log('All Item Keys:', Object.keys(fieldCounts));

// Save samples for reference
fs.writeFileSync('scripts/samples_by_type.json', JSON.stringify(samplesByType, null, 2));
console.log('Sample of each type saved to scripts/samples_by_type.json');
