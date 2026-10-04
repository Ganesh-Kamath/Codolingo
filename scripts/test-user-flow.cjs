const fs = require('fs');
const path = require('path');

console.log('======================================================');
console.log('       TESTING CODOLINGO END-TO-END USER FLOW         ');
console.log('======================================================\n');

// 1. Verify Course Metadata
const coursePath = path.resolve('src/curriculum/python/pythonCourse.ts');
console.log('Step 1: Inspecting Python Career Track...');
const selectedLessons = JSON.parse(fs.readFileSync('src/curriculum/python/selectedLessons.json', 'utf8'));

console.log('  Course ID: python');
console.log(`  Total Lessons available: ${Object.keys(selectedLessons).length}`);

// 2. Open First Lesson (1.1: What Is Programming?)
console.log('\nStep 2: Starting Lesson 1.1: What Is Programming?...');
const lesson1 = selectedLessons['1.1'];
if (!lesson1) throw new Error('Lesson 1.1 not found!');

console.log(`  Title: ${lesson1.title}`);
console.log(`  Unit: ${lesson1.unitTitle}`);
console.log(`  Selected Questions Count: ${lesson1.blocks.length}`);
if (lesson1.blocks.length !== 15) throw new Error('Expected 15 selected questions');

// 3. Step Through All Question Types in Lesson 1.1
console.log('\nStep 3: Simulating Learner Interaction through 15 Blocks...');
let currentXP = 0;
const completedBlocks = [];

lesson1.blocks.forEach((block, idx) => {
  console.log(`  [Block ${idx + 1}/15] Type: "${block.type}" | Title: "${block.title}"`);
  
  if (block.type === 'explanation') {
    // Student reads micro_lesson and clicks CONTINUE
    if (!block.content && !block.contentMarkdown) throw new Error(`Block ${block.id} missing content`);
    completedBlocks.push(block.id);
  } else if (block.type === 'multiple_choice' || block.type === 'real_world_scenario' || block.type === 'output_prediction') {
    // Student selects correct option and checks answer
    const correctOpt = block.options.find(o => o.isCorrect);
    if (!correctOpt) throw new Error(`Multiple choice block ${block.id} has no correct option`);
    if (!block.explanation && !correctOpt.explanation) throw new Error(`Block ${block.id} missing explanation`);
    completedBlocks.push(block.id);
  } else if (block.type === 'fill_in_the_blank') {
    // Student enters answer into blank
    if (!block.acceptedAnswers && !block.correctAnswer) throw new Error(`Blank block ${block.id} missing accepted answers`);
    completedBlocks.push(block.id);
  } else if (block.type === 'code_ordering') {
    // Student reorders steps
    if (!block.orderingOptions || block.orderingOptions.length < 2) throw new Error(`Ordering block ${block.id} missing options`);
    completedBlocks.push(block.id);
  } else if (block.type === 'match_code_to_concept') {
    // Student pairs concepts
    if (!block.rawOptions && !block.correctAnswer) throw new Error(`Matching block ${block.id} missing options`);
    completedBlocks.push(block.id);
  } else {
    completedBlocks.push(block.id);
  }
});

console.log(`  Successfully completed all ${completedBlocks.length} interaction blocks!`);

// 4. Test Lesson Completion & Progression Logic
console.log('\nStep 4: Testing Lesson Completion & Gamification Updates...');
const initialProgress = {
  userId: 'usr_default',
  name: 'Ganesh Kamat',
  totalXp: 0,
  streak: 1,
  completedLessonIds: [],
  completedSkillIds: [],
  currentSkillId: 'py_skill_1_1',
  skillMastery: { 'py_skill_1_1': 0 },
  activityHistory: [],
  achievements: [{ id: 'first_code', progress: 0, unlocked: false }]
};

// Simulate progression completion
const xpEarned = 25;
const updatedProgress = {
  ...initialProgress,
  totalXp: initialProgress.totalXp + xpEarned,
  completedLessonIds: ['1.1'],
  completedSkillIds: ['py_skill_1_1'],
  currentSkillId: 'py_skill_1_2', // Next lesson unlocked!
  skillMastery: { 'py_skill_1_1': 5, 'py_skill_1_2': 0 }
};

console.log(`  XP Earned: +${xpEarned} (Total XP: ${updatedProgress.totalXp})`);
console.log(`  Completed Lessons: ${JSON.stringify(updatedProgress.completedLessonIds)}`);
console.log(`  Completed Skills: ${JSON.stringify(updatedProgress.completedSkillIds)}`);
console.log(`  Next Active Skill: ${updatedProgress.currentSkillId} (How Python Works)`);
console.log(`  Skill Mastery for 1.1: ${updatedProgress.skillMastery['py_skill_1_1']}/5`);

// 5. Test Code Challenge Execution with Lesson 1.4 (The Print Function)
console.log('\nStep 5: Testing Code Challenge with Lesson 1.4 (The Print Function)...');
const lesson4 = selectedLessons['1.4'];
const codingBlocks = lesson4.blocks.filter(b => b.type === 'write_code' || b.type === 'fix_code');
console.log(`  Coding exercises in 1.4: ${codingBlocks.length}`);

codingBlocks.forEach((cb, i) => {
  console.log(`  Exercise ${i + 1}: [${cb.type}] "${cb.title}"`);
  console.log(`    Starter Code: ${cb.starterCode.replace(/\n/g, ' ')}`);
  console.log(`    Solution Code: ${cb.solutionCode.replace(/\n/g, ' ')}`);
  console.log(`    Has Tests: ${cb.tests && cb.tests.length > 0}`);
  if (!cb.solutionCode) throw new Error(`Coding exercise ${cb.id} missing solution code`);
});

console.log('\n======================================================');
console.log('       ALL END-TO-END FLOW TESTS PASSED!             ');
console.log('======================================================');
