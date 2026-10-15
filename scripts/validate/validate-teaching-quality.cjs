#!/usr/bin/env node
/**
 * Codolingo Automated Teaching & Explanation Quality Gate
 * 
 * Enforces:
 * 1. Zero boilerplate/filler explanations ("Mastering these rules...").
 * 2. Zero hints leaking raw solution code.
 * 3. 100% of playable exercises have computational mental models.
 * 4. 100% of playable exercises have 3-step progressive hint ladders.
 * 5. Learning objectives defined for every playable lesson.
 * 
 * Fails with non-zero exit code if pedagogical quality regresses.
 */

const fs = require('fs');
const path = require('path');
const { auditLessonFile, PLAYABLE_UNITS } = require('../authoring/curriculumAuthoringEngine.cjs');

const curriculumDir = path.resolve(__dirname, '../../src/curriculum/python/content');

let totalLessons = 0;
let totalExercises = 0;
let failureCount = 0;

console.log('===============================================================');
console.log('       CODOLINGO TEACHING CONTENT QUALITY VERIFICATION GATE     ');
console.log('===============================================================');

for (const u of PLAYABLE_UNITS) {
  const uDir = path.join(curriculumDir, u);
  if (!fs.existsSync(uDir)) continue;

  const jsonFiles = fs.readdirSync(uDir).filter(f => f.endsWith('.json')).sort();
  for (const f of jsonFiles) {
    const fullPath = path.join(uDir, f);
    const result = auditLessonFile(fullPath);
    totalLessons++;
    totalExercises += result.totalItems;

    // Filter issues for quality gate (critical, high, medium)
    const criticalOrHigh = result.issues.filter(i => i.severity === 'critical' || i.severity === 'high' || i.severity === 'medium');

    if (criticalOrHigh.length > 0) {
      console.log(`❌ FAIL: ${f} (${result.title})`);
      for (const iss of criticalOrHigh) {
        console.log(`    - [${iss.severity.toUpperCase()}] ${iss.id} (${iss.rule}): ${iss.text}`);
        failureCount++;
      }
    } else {
      console.log(`  ✓ PASS: ${f} [${result.totalItems} items verified]`);
    }
  }
}

console.log('\n===============================================================');
console.log('                     QUALITY GATE SUMMARY                      ');
console.log('===============================================================');
console.log(`Playable Lessons Audited:   ${totalLessons}`);
console.log(`Exercises Inspected:        ${totalExercises}`);
console.log(`Pedagogical Defects:        ${failureCount}`);

if (failureCount > 0) {
  console.error(`\n❌ QUALITY GATE FAILED with ${failureCount} pedagogical defect(s).`);
  process.exit(1);
} else {
  console.log('\n✅ 100% OF PLAYABLE LESSONS MEET THE TEACHING CONTENT QUALITY STANDARD!');
  process.exit(0);
}
