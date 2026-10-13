/**
 * Unit & Integration Test Suite for Fix-It Lab Repair Drills
 * Validates all 11 misconception tags and their 4-step drill contracts.
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_TAGS = [
  'STRING_VS_NUMBER',
  'ASSIGNMENT_VS_COMPARISON',
  'INPUT_IS_STRING',
  'CONDITION_BOUNDARY',
  'PRECEDENCE_CONFUSION',
  'VARIABLE_VALUE_CONFUSION',
  'SYNTAX_ERROR',
  'INDENTATION_ERROR',
  'WRONG_OPERATOR',
  'BOOLEAN_LOGIC_CONFUSION',
  'WRONG_TYPE',
  'OFF_BY_ONE',
  'LOOP_EXECUTION_CONFUSION'
];

const drillFiles = [
  'assignmentVsComparison.ts',
  'stringVsNumber.ts',
  'inputIsString.ts',
  'conditionBoundary.ts',
  'precedenceConfusion.ts',
  'variableValueConfusion.ts',
  'syntaxError.ts',
  'indentationError.ts',
  'wrongOperator.ts',
  'booleanLogicConfusion.ts',
  'wrongType.ts',
  'offByOne.ts',
  'loopExecutionConfusion.ts'
];

const repairDir = path.resolve(__dirname, '../../src/curriculum/python/repair');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    testsPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    testsFailed++;
  }
}

console.log('--- Validating Repair Drills Content ---');

// Check all 11 drill files exist
drillFiles.forEach(file => {
  const fullPath = path.join(repairDir, file);
  assert(fs.existsSync(fullPath), `Drill file exists: ${file}`);
  const content = fs.readFileSync(fullPath, 'utf8');

  // Verify it exports a ConceptRepairDrill
  assert(content.includes('tag:'), `${file} defines a tag`);
  assert(content.includes('friendlyTitle:'), `${file} defines friendlyTitle`);
  assert(content.includes('description:'), `${file} defines description`);
  assert(content.includes('category:'), `${file} defines category`);
  assert(content.includes('getSteps:'), `${file} implements getSteps`);

  // Verify all 4 steps are defined
  assert(content.includes('stepNumber: 1') && content.includes('SPOT IT'), `${file} implements Step 1 (SPOT IT)`);
  assert(content.includes('stepNumber: 2') && content.includes('UNDERSTAND WHY'), `${file} implements Step 2 (UNDERSTAND WHY)`);
  assert(content.includes('stepNumber: 3') && content.includes('FIX IT'), `${file} implements Step 3 (FIX IT)`);
  assert(content.includes('stepNumber: 4') && content.includes('PROVE IT'), `${file} implements Step 4 (PROVE IT)`);

  // Verify hints and testcases exist
  assert(content.includes('progressiveHints:'), `${file} includes progressive hints`);
  assert(content.includes('referenceSolution:'), `${file} defines reference solutions`);
});

// Check index.ts registry covers all REQUIRED_TAGS
const indexPath = path.join(repairDir, 'index.ts');
assert(fs.existsSync(indexPath), 'Repair index.ts registry exists');
const indexContent = fs.readFileSync(indexPath, 'utf8');

REQUIRED_TAGS.forEach(tag => {
  assert(indexContent.includes(tag), `Registry includes required tag ${tag}`);
});

console.log(`\nRepair Drills Validation: ${testsPassed} passed, ${testsFailed} failed`);

if (testsFailed > 0) {
  process.exit(1);
}
