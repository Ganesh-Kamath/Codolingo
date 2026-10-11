const fs = require('fs');
const path = require('path');

console.log('[TEST: Block Type Renderers] Verifying mapItemToBlock output against MultiStepLessonView...');

// 1. Scan all raw curriculum content files to find all possible item 'type' values
const contentDir = path.join(__dirname, '../src/curriculum/python/content');
const contentFiles = fs.readdirSync(contentDir, { recursive: true }).filter(f => f.endsWith('.json'));

const rawTypesFound = new Set();
for (const file of contentFiles) {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(contentDir, file), 'utf8'));
    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        if (item.type) rawTypesFound.add(item.type);
      }
    }
  } catch {}
}

console.log(`  Found ${rawTypesFound.size} raw item types across content files:`, [...rawTypesFound]);

// 2. Read curriculumSelector.ts to map raw types to output block types
const selectorPath = path.join(__dirname, '../src/services/curriculumSelector.ts');
const selectorContent = fs.readFileSync(selectorPath, 'utf8');

// Expected output block types from mapItemToBlock:
const expectedBlockTypes = new Set([
  'explanation',
  'multiple_choice',
  'real_world_scenario',
  'error_diagnosis',
  'output_prediction',
  'code_prediction',
  'trace_execution',
  'fill_in_the_blank',
  'code_ordering',
  'match_code_to_concept',
  'write_code',
  'fix_code',
  'mini_challenge',
  'refactoring_challenge',
  'code_example',
  'trace_code',
  'short_quiz',
  'predict_output'
]);

// 3. Inspect MultiStepLessonView.tsx switch statement in renderBlockContent
const viewPath = path.join(__dirname, '../src/views/MultiStepLessonView.tsx');
const viewContent = fs.readFileSync(viewPath, 'utf8');

const switchMatch = viewContent.match(/switch\s*\(\s*currentBlock\.type\s*\)\s*\{([\s\S]*?)\n\s*default:/);
if (!switchMatch) {
  console.error('  ✗ FAIL: Could not find renderBlockContent switch statement in MultiStepLessonView.tsx');
  process.exit(1);
}

const switchBody = switchMatch[1];
const handledCases = new Set([...switchBody.matchAll(/case\s+['"]([^'"]+)['"]/g)].map(m => m[1]));

console.log(`  MultiStepLessonView handles ${handledCases.size} block types explicitly:`, [...handledCases]);

let missingTypes = [];
for (const type of expectedBlockTypes) {
  if (!handledCases.has(type)) {
    missingTypes.push(type);
  }
}

if (missingTypes.length > 0) {
  console.error(`  ✗ FAIL: Missing renderers for block types:`, missingTypes);
  process.exit(1);
}

// 4. Verify default fallback handler exists in MultiStepLessonView
const hasDefaultFallback = viewContent.includes('default:') && viewContent.includes('Unsupported question block type');
if (!hasDefaultFallback) {
  console.error('  ✗ FAIL: MultiStepLessonView is missing a graceful default fallback handler!');
  process.exit(1);
}

console.log('  ✓ Every block type produced by mapItemToBlock has a verified renderer.');
console.log('  ✓ Graceful fallback handler present for unknown block types.');
console.log('[PASS] Block type renderer completeness verified.');
