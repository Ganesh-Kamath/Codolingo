#!/usr/bin/env node
/**
 * Codolingo Curriculum Authoring CLI
 * 
 * Usage:
 *   node scripts/authoring/author-cli.cjs --audit
 *   node scripts/authoring/author-cli.cjs --improve-playable
 *   node scripts/authoring/author-cli.cjs --sync
 *   node scripts/authoring/author-cli.cjs --status
 */

const path = require('path');
const fs = require('fs');
const {
  PLAYABLE_UNITS,
  auditLessonFile,
  improveLessonFile,
  syncSelectedLessons
} = require('./curriculumAuthoringEngine.cjs');
const { OpenAIAuthoringService } = require('./openaiService.cjs');

const args = process.argv.slice(2);
const command = args[0] || '--help';

const curriculumDir = path.resolve(__dirname, '../../src/curriculum/python/content');

function getAllPlayableLessonFiles() {
  const files = [];
  for (const u of PLAYABLE_UNITS) {
    const uDir = path.join(curriculumDir, u);
    if (!fs.existsSync(uDir)) continue;
    const jsonFiles = fs.readdirSync(uDir).filter(f => f.endsWith('.json')).sort();
    for (const f of jsonFiles) {
      files.push(path.join(uDir, f));
    }
  }
  return files;
}

async function main() {
  if (command === '--status') {
    const s = new OpenAIAuthoringService();
    console.log('=== CODOLINGO OPENAI AUTHORING STATUS ===');
    console.log('Is Configured:', s.isConfigured());
    console.log('Configured Model:', s.model);
    console.log('API Key Status:', s.isConfigured() ? 'Active rotated key detected in .env' : 'Placeholder/unconfigured in .env');
    return;
  }

  if (command === '--audit') {
    console.log('=== AUDITING PLAYABLE CURRICULUM (UNITS 1–6) ===');
    const files = getAllPlayableLessonFiles();
    let totalIssues = 0;
    const severityCounts = { critical: 0, high: 0, medium: 0, low: 0 };

    for (const file of files) {
      const res = auditLessonFile(file);
      if (res.issues.length > 0) {
        console.log(`\nLesson: ${res.title} (${res.file}) - ${res.issues.length} issues`);
        for (const iss of res.issues) {
          severityCounts[iss.severity]++;
          totalIssues++;
          console.log(`  [${iss.severity.toUpperCase()}] ${iss.id} (${iss.rule}): ${iss.text}`);
        }
      } else {
        console.log(`✓ ${res.file} (All ${res.totalItems} items meet quality standard)`);
      }
    }

    console.log('\n================ AUDIT SUMMARY ================');
    console.log(`Total Lessons Audited: ${files.length}`);
    console.log(`Total Pedagogical Issues: ${totalIssues}`);
    console.log(`  Critical: ${severityCounts.critical}`);
    console.log(`  High:     ${severityCounts.high}`);
    console.log(`  Medium:   ${severityCounts.medium}`);
    console.log(`  Low:      ${severityCounts.low}`);
    return;
  }

  if (command === '--improve-playable') {
    console.log('=== OVERHAULING PLAYABLE CURRICULUM (UNITS 1–6) ===');
    const files = getAllPlayableLessonFiles();
    let totalUpdatedLessons = 0;
    let totalModifiedItems = 0;

    for (const file of files) {
      const { modifiedCount, totalItems } = improveLessonFile(file);
      if (modifiedCount > 0) {
        totalUpdatedLessons++;
        totalModifiedItems += modifiedCount;
        console.log(`✓ Upgraded ${path.basename(file)}: ${modifiedCount}/${totalItems} items improved with mental models & progressive hints.`);
      } else {
        console.log(`- ${path.basename(file)}: Already up to standard.`);
      }
    }

    console.log('\nSynchronizing selectedLessons.json...');
    const syncedLessons = syncSelectedLessons();
    console.log(`Successfully synced ${syncedLessons} playable lessons in selectedLessons.json!`);

    console.log(`\nAll done! Upgraded ${totalModifiedItems} exercises across ${totalUpdatedLessons} lessons.`);
    return;
  }

  if (command === '--sync') {
    console.log('Synchronizing selectedLessons.json with content JSONs...');
    const count = syncSelectedLessons();
    console.log(`Successfully synced ${count} lessons.`);
    return;
  }

  console.log(`Codolingo Curriculum Authoring CLI
Usage:
  node scripts/authoring/author-cli.cjs --audit             Run teaching quality audit
  node scripts/authoring/author-cli.cjs --improve-playable  Upgrade all playable lessons (Units 1-6)
  node scripts/authoring/author-cli.cjs --sync              Sync selectedLessons.json
  node scripts/authoring/author-cli.cjs --status            Check OpenAI API configuration
`);
}

main().catch(err => {
  console.error('Fatal CLI Error:', err);
  process.exit(1);
});
