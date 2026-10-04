import { PROJECTS_DATA } from '../src/data/projectsData.ts';
import { codeExecutionService } from '../src/services/codeExecutionService.ts';

console.log('====================================================');
console.log('CODOLINGO PROJECTS SECTION VERIFICATION TEST SUITE');
console.log('====================================================\n');

let allPassed = true;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    allPassed = false;
    throw new Error(message);
  } else {
    console.log(`✅ PASSED: ${message}`);
  }
}

// 1. Total and Difficulty Counts
assert(PROJECTS_DATA.length === 30, `Total projects is exactly 30 (got ${PROJECTS_DATA.length})`);

const beginner = PROJECTS_DATA.filter(p => p.difficulty === 'beginner');
const intermediate = PROJECTS_DATA.filter(p => p.difficulty === 'intermediate');
const advanced = PROJECTS_DATA.filter(p => p.difficulty === 'advanced');

assert(beginner.length === 10, `Beginner projects count is exactly 10 (got ${beginner.length})`);
assert(intermediate.length === 10, `Intermediate projects count is exactly 10 (got ${intermediate.length})`);
assert(advanced.length === 10, `Advanced projects count is exactly 10 (got ${advanced.length})`);

// 2. Uniqueness of IDs and Titles
const ids = new Set(PROJECTS_DATA.map(p => p.id));
const titles = new Set(PROJECTS_DATA.map(p => p.title));
assert(ids.size === 30, 'All 30 project IDs are completely unique');
assert(titles.size === 30, 'All 30 project titles are unique');

// 3. Completeness of Required Schema Fields
console.log('\n--- VERIFYING PROJECT SCHEMA FIELDS ---');
for (const p of PROJECTS_DATA) {
  assert(Boolean(p.id && p.id.trim()), `${p.title}: Valid id`);
  assert(Boolean(p.title && p.title.trim()), `${p.title}: Valid title`);
  assert(['beginner', 'intermediate', 'advanced'].includes(p.difficulty), `${p.title}: Valid difficulty`);
  assert(Boolean(p.shortDescription && p.shortDescription.length > 20), `${p.title}: Meaningful shortDescription`);
  assert(Boolean(p.whatYouAreBuilding && p.whatYouAreBuilding.length > 20), `${p.title}: Meaningful whatYouAreBuilding`);
  assert(Boolean(p.goal && p.goal.length > 15), `${p.title}: Meaningful goal`);
  assert(Array.isArray(p.requirements) && p.requirements.length >= 4, `${p.title}: At least 4 concrete requirements (has ${p.requirements?.length})`);
  assert(Array.isArray(p.skills) && p.skills.length >= 3, `${p.title}: At least 3 skills listed (has ${p.skills?.length})`);
  assert(Array.isArray(p.topics) && p.topics.length >= 3, `${p.title}: At least 3 Python topics listed (has ${p.topics?.length})`);
  assert(Array.isArray(p.thinkingPoints) && p.thinkingPoints.length >= 2, `${p.title}: Thought-provoking thinking points (has ${p.thinkingPoints?.length})`);
  assert(Array.isArray(p.extensions) && p.extensions.length >= 2, `${p.title}: Meaningful extensions listed (has ${p.extensions?.length})`);
  assert(Boolean(p.estimatedTime), `${p.title}: Has estimatedTime (${p.estimatedTime})`);
}

// 4. Strict "NO SOLUTION CODE" Guarantee
console.log('\n--- VERIFYING NO SOLUTION CODE OR PREDEFINED ANSWERS ---');
for (const p of PROJECTS_DATA) {
  assert(!('solution' in p), `${p.title}: Does not contain 'solution' field`);
  assert(!('solutionCode' in p), `${p.title}: Does not contain 'solutionCode' field`);
  assert(!('code' in p), `${p.title}: Does not contain 'code' field`);
  assert(!('answer' in p), `${p.title}: Does not contain 'answer' field`);
  assert(!('answers' in p), `${p.title}: Does not contain 'answers' field`);
  assert(!('testCases' in p), `${p.title}: Does not contain 'testCases' field`);
}

// 5. Code Execution Service: executeRaw
console.log('\n--- VERIFYING CODE EXECUTION SERVICE (executeRaw) ---');
async function testExecution() {
  const sampleCode = `
def add(a, b):
    return a + b

res = add(10, 32)
print(f"Result: {res}")
`;
  const res = await codeExecutionService.executeRaw(sampleCode);
  assert(res.stdout.includes('Result: 42'), 'executeRaw runs code and produces output "Result: 42"');
  assert(!res.error, 'executeRaw executed without runtime error');
  console.log(`Execution Output:\n${res.stdout}`);
}

await testExecution();

// 6. Test Filtering Logic
console.log('\n--- VERIFYING FILTERING & SEARCH LOGIC ---');
const beginnerFiltered = PROJECTS_DATA.filter(p => p.difficulty === 'beginner');
assert(beginnerFiltered.length === 10, 'Filtering by "beginner" returns 10 projects');

const searchCalculator = PROJECTS_DATA.filter(p => p.title.toLowerCase().includes('calculator') || p.shortDescription.toLowerCase().includes('calculator'));
assert(searchCalculator.length >= 1, 'Search for "calculator" finds at least 1 matching project');

const searchRegex = PROJECTS_DATA.filter(p => p.skills.some(s => s.toLowerCase().includes('regex')) || p.topics.some(t => t.toLowerCase().includes('regex')));
assert(searchRegex.length >= 1, 'Search for "regex" finds intermediate projects involving regular expressions');

console.log('\n====================================================');
console.log('ALL PROJECTS SECTION TESTS PASSED SUCCESSFULLY! (30/30)');
console.log('====================================================');
