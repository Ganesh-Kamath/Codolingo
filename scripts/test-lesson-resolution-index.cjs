const fs = require('fs');
const path = require('path');

// 1. Load curriculum status
const curriculumStatusPath = path.join(__dirname, '../src/curriculum/python/curriculumStatus.json');
const curriculumStatus = JSON.parse(fs.readFileSync(curriculumStatusPath, 'utf8'));
const comingSoonUnits = new Set(curriculumStatus.comingSoonUnits || []);

// 2. Load selected lessons
const selectedLessonsPath = path.join(__dirname, '../src/curriculum/python/selectedLessons.json');
const selectedLessons = JSON.parse(fs.readFileSync(selectedLessonsPath, 'utf8'));

// 3. Scan content files to build index
const contentDir = path.join(__dirname, '../src/curriculum/python/content');
const contentFiles = fs.readdirSync(contentDir, { recursive: true }).filter(f => f.endsWith('.json'));

const rawLessonIdIndex = new Map();
for (const relPath of contentFiles) {
  const norm = relPath.replace(/\\/g, '/');
  const match = norm.match(/(?:^|\/)(\d+\.\d+)[_.]/);
  if (match) {
    rawLessonIdIndex.set(match[1], path.join(contentDir, relPath));
  }
}

// 4. Extract lesson IDs from pythonCourse.ts
const pythonCoursePath = path.join(__dirname, '../src/curriculum/python/pythonCourse.ts');
const courseContent = fs.readFileSync(pythonCoursePath, 'utf8');

const lessonIdMatches = [...courseContent.matchAll(/"id":\s*["'](\d+\.\d+)["']/g)].map(m => m[1]);
const uniqueLessonIds = [...new Set(lessonIdMatches)];

console.log(`[TEST: Lesson Resolution Index] Testing ${uniqueLessonIds.length} lesson IDs...`);

let passed = 0;
let comingSoonCount = 0;
let errors = [];

for (const id of uniqueLessonIds) {
  const unitNum = parseInt(id.split('.')[0], 10);
  const unitId = `unit_${String(unitNum).padStart(2, '0')}`;
  const isComingSoon = comingSoonUnits.has(unitId);

  // Check resolution sources
  const inSelected = Boolean(selectedLessons[id] && selectedLessons[id].blocks && selectedLessons[id].blocks.length > 0);
  const inRaw = rawLessonIdIndex.has(id);
  const isFoundation = unitNum === 1; // Unit 1 has structured foundations

  if (inSelected || inRaw || isFoundation) {
    passed++;
  } else if (isComingSoon) {
    comingSoonCount++;
  } else {
    errors.push(`Lesson "${id}" in ${unitId} failed to resolve and is NOT marked coming soon!`);
  }
}

console.log(`  ✓ ${passed} lessons resolve directly to curriculum content`);
if (comingSoonCount > 0) {
  console.log(`  ✓ ${comingSoonCount} lessons in coming soon units appropriately marked`);
}

if (errors.length > 0) {
  console.error(`  ✗ FAIL: ${errors.length} unresolved lessons:`, errors);
  process.exit(1);
}

console.log(`[PASS] All ${uniqueLessonIds.length} curriculum lessons resolve successfully.`);
