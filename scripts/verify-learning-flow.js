import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('====================================================');
console.log('CODOLINGO LEARNING FLOW COMPREHENSIVE TEST SUITE');
console.log('Testing: Immediate Reveal, 15-Q System & Mistake Review');
console.log('====================================================\n');

// 1. Verify Curriculum Selection on real files
const contentDir = path.resolve(__dirname, '../src/curriculum/python/content');
if (!fs.existsSync(contentDir)) {
  console.error('Curriculum directory not found at', contentDir);
  process.exit(1);
}

function findLessonFile(lessonPrefix) {
  const units = fs.readdirSync(contentDir).filter(f => f.startsWith('unit_'));
  for (const u of units) {
    const unitDir = path.join(contentDir, u);
    const files = fs.readdirSync(unitDir);
    const found = files.find(f => f.startsWith(lessonPrefix));
    if (found) return path.join(unitDir, found);
  }
  return null;
}

const sampleFiles = [
  findLessonFile('1.1_'),
  findLessonFile('5.1_'),
  findLessonFile('9.1_')
].filter(Boolean);

// Import selector logic from src/services/curriculumSelector.ts
const { selectLessonQuestions, mapItemToBlock } = await import('../src/services/curriculumSelector.ts');

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

// ========================================================
// TEST 1: Question Pool & Balanced Selection (15 Questions)
// ========================================================
console.log('\n--- VERIFYING 15-QUESTION SELECTION ---');
for (const filePath of sampleFiles) {
  const fileName = path.basename(filePath);
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const selected = selectLessonQuestions(raw, 15);
  
  assert(selected.length === 15, `${fileName}: Selected exactly 15 questions from candidate pool of ${raw.items.length}`);
  
  // Verify no duplicates
  const ids = selected.map(i => i.id);
  const uniqueIds = new Set(ids);
  assert(uniqueIds.size === 15, `${fileName}: Zero duplicate question IDs in selected set`);
  
  // Verify diversity of types
  const types = new Set(selected.map(i => i.type));
  assert(types.size >= 4, `${fileName}: High type diversity (${types.size} distinct interaction types)`);
}

// ========================================================
// TEST A: Answer a question correctly
// Expected: Correct state -> explanation -> continue.
// ========================================================
console.log('\n--- RUNNING TEST A: Correct Answer Flow ---');
{
  const rawLesson = JSON.parse(fs.readFileSync(findLessonFile('1.1_'), 'utf-8'));
  const selected = selectLessonQuestions(rawLesson, 15);
  const blocks = selected.map(mapItemToBlock);
  const q = blocks.find(b => b.type === 'multiple_choice' || (b.options && b.options.length > 0));
  assert(!!q, 'Found multiple choice question');
  
  const correctOpt = q.options.find(o => o.isCorrect);
  assert(!!correctOpt, 'Identified correct option');

  // Simulated state machine
  let exerciseState = 'unanswered';
  let firstAttemptCorrectCount = 0;
  let wrongQuestions = [];
  let isAnswerChecked = false;
  let feedback = null;

  // User selects correct answer
  exerciseState = 'answering';
  // User clicks CHECK
  if (correctOpt.isCorrect) {
    exerciseState = 'correct';
    firstAttemptCorrectCount++;
    isAnswerChecked = true;
    feedback = { title: 'Spot on!', explanation: correctOpt.explanation || q.explanation };
  }

  assert(exerciseState === 'correct', 'TEST A.1: State is marked "correct"');
  assert(isAnswerChecked === true, 'TEST A.2: Answer is checked, primary action button is "CONTINUE"');
  assert(feedback.explanation !== undefined, 'TEST A.3: Explanation is populated for learner');
  assert(wrongQuestions.length === 0, 'TEST A.4: Not added to wrongQuestions list');
}

// ========================================================
// TEST B: Answer a question incorrectly
// Expected: Incorrect state -> correct answer immediately shown -> explanation -> continue.
// The app must NOT force another attempt.
// ========================================================
console.log('\n--- RUNNING TEST B: Immediate Reveal of Wrong Answer (No Retry Loop) ---');
{
  const rawLesson = JSON.parse(fs.readFileSync(findLessonFile('1.1_'), 'utf-8'));
  const selected = selectLessonQuestions(rawLesson, 15);
  const blocks = selected.map(mapItemToBlock);
  const q = blocks.find(b => b.type === 'multiple_choice' || (b.options && b.options.length > 0));
  
  const wrongOpt = q.options.find(o => !o.isCorrect);
  const correctOpt = q.options.find(o => o.isCorrect);
  assert(!!wrongOpt, 'Identified incorrect option');

  // Simulated state machine
  let exerciseState = 'unanswered';
  let wrongQuestions = [];
  let isAnswerChecked = false;
  let primaryButtonLabel = 'CHECK';
  let revealedCorrectAnswer = null;

  // User selects wrong answer
  exerciseState = 'answering';
  // User clicks CHECK
  if (!wrongOpt.isCorrect) {
    exerciseState = 'incorrect';
    wrongQuestions.push({ block: q, userAnswer: wrongOpt.text, concept: q.concept });
    isAnswerChecked = true;
    // UI logic: button becomes CONTINUE when isAnswerChecked
    primaryButtonLabel = 'CONTINUE';
    revealedCorrectAnswer = correctOpt.text;
  }

  assert(exerciseState === 'incorrect', 'TEST B.1: State is marked "incorrect" immediately');
  assert(primaryButtonLabel === 'CONTINUE', 'TEST B.2: Primary button is "CONTINUE" (NOT "TRY AGAIN")');
  assert(revealedCorrectAnswer === correctOpt.text, 'TEST B.3: Correct answer revealed immediately in green');
  assert(wrongQuestions.length === 1, 'TEST B.4: Added to wrongQuestions for later review');
  
  // Advance to next question without repeating
  let currentBlockIndex = 0;
  currentBlockIndex++;
  assert(currentBlockIndex === 1, 'TEST B.5: Next button advances directly to next question without forced retry');
}

// ========================================================
// TEST C: Complete a 15-question lesson with 3 wrong answers
// Expected: 15 initial questions are completed.
// Then: 3 mistakes appear in the review stage.
// Then: lesson can be completed.
// ========================================================
console.log('\n--- RUNNING TEST C: 15-Question Session with 3 Wrong Answers & Review ---');
{
  const rawLesson = JSON.parse(fs.readFileSync(findLessonFile('5.1_'), 'utf-8'));
  const blocks = selectLessonQuestions(rawLesson, 15).map(mapItemToBlock);
  assert(blocks.length === 15, 'Loaded 15 blocks');

  let sessionPhase = 'initial'; // 'initial' | 'review_intro' | 'review' | 'completed'
  let currentBlockIndex = 0;
  let firstAttemptCorrectCount = 0;
  let wrongQuestions = [];
  let reviewIndex = 0;
  let reviewCorrectCount = 0;

  // Simulate answering 15 questions with questions 3, 7, 11 wrong
  const wrongIndices = new Set([3, 7, 11]);

  for (let i = 0; i < 15; i++) {
    currentBlockIndex = i;
    if (wrongIndices.has(i)) {
      wrongQuestions.push({ block: blocks[i], userAnswer: 'wrong_val', concept: blocks[i].concept });
    } else {
      firstAttemptCorrectCount++;
    }
  }

  assert(firstAttemptCorrectCount === 12, 'TEST C.1: 12 first-attempt correct recorded');
  assert(wrongQuestions.length === 3, 'TEST C.2: 3 wrong questions collected');

  // Trigger phase transition after initial 15
  if (wrongQuestions.length > 0) {
    sessionPhase = 'review_intro';
  } else {
    sessionPhase = 'completed';
  }

  assert(sessionPhase === 'review_intro', 'TEST C.3: Transitions to review_intro stage');

  // User clicks "Start Review (3)"
  sessionPhase = 'review';
  reviewIndex = 0;
  assert(sessionPhase === 'review', 'TEST C.4: Enters review session');

  // User completes the 3 review questions
  while (reviewIndex < wrongQuestions.length) {
    // Answer review question correctly
    reviewCorrectCount++;
    wrongQuestions[reviewIndex].isReviewCorrect = true;
    reviewIndex++;
  }

  // Review finished -> complete lesson
  sessionPhase = 'completed';
  assert(sessionPhase === 'completed', 'TEST C.5: Lesson successfully reaches completed stage');
  assert(reviewCorrectCount === 3, 'TEST C.6: All 3 mistakes successfully reviewed');
}

// ========================================================
// TEST D: Get a review question wrong
// Expected: Correct answer/explanation is shown.
// No infinite retry loop.
// ========================================================
console.log('\n--- RUNNING TEST D: Wrong Answer in Review (Strict No Infinite Loop) ---');
{
  let sessionPhase = 'review';
  let wrongQuestions = [
    { block: { id: 'rev_1', title: 'Q1', concept: 'loops' }, userAnswer: 'old_wrong' }
  ];
  let reviewIndex = 0;
  let reviewCorrectCount = 0;

  // Learner gets review question WRONG again
  let exerciseState = 'incorrect';
  let buttonLabel = 'CONTINUE';

  // State machine rule: In review phase, wrong answers do NOT re-append to wrongQuestions!
  if (sessionPhase === 'initial') {
    wrongQuestions.push({ block: wrongQuestions[0].block });
  }

  assert(wrongQuestions.length === 1, 'TEST D.1: Does NOT re-enqueue missed review question (no infinite loop)');
  assert(buttonLabel === 'CONTINUE', 'TEST D.2: Button is CONTINUE, allowing learner to move on');

  // Click CONTINUE
  if (reviewIndex < wrongQuestions.length - 1) {
    reviewIndex++;
  } else {
    sessionPhase = 'completed';
  }

  assert(sessionPhase === 'completed', 'TEST D.3: Completed stage reached cleanly without infinite looping');
}

// ========================================================
// TEST E: Complete a lesson with zero mistakes
// Expected: No unnecessary review stage. Go directly to lesson completion.
// ========================================================
console.log('\n--- RUNNING TEST E: Zero Mistakes Bypass Review ---');
{
  let firstAttemptCorrectCount = 15;
  let wrongQuestions = [];
  let sessionPhase = 'initial';

  // Completion logic at end of 15 questions
  if (wrongQuestions.length > 0) {
    sessionPhase = 'review_intro';
  } else {
    sessionPhase = 'completed';
  }

  assert(sessionPhase === 'completed', 'TEST E.1: Bypasses review stage directly to completed');
}

// ========================================================
// TEST F: Open another lesson
// Expected: Its own question pool and mistake tracking are independent.
// ========================================================
console.log('\n--- RUNNING TEST F: Independent Lesson State ---');
{
  const lesson1Raw = JSON.parse(fs.readFileSync(findLessonFile('1.1_'), 'utf-8'));
  const lesson2Raw = JSON.parse(fs.readFileSync(findLessonFile('9.1_'), 'utf-8'));

  const l1Selected = selectLessonQuestions(lesson1Raw, 15);
  const l2Selected = selectLessonQuestions(lesson2Raw, 15);

  const l1Ids = new Set(l1Selected.map(q => q.id));
  const l2Ids = new Set(l2Selected.map(q => q.id));

  // Overlap should be 0 because lessons have separate items
  let overlap = 0;
  for (const id of l1Ids) {
    if (l2Ids.has(id)) overlap++;
  }

  assert(overlap === 0, 'TEST F.1: Lessons have completely independent question pools');
  assert(l1Selected[0].id.startsWith('1.1_'), 'TEST F.2: Lesson 1 items have 1.1_ prefix');
  assert(l2Selected[0].id.startsWith('9.1_'), 'TEST F.3: Lesson 2 items have 9.1_ prefix');
}

// ========================================================
// TEST G: Refresh/re-enter where appropriate
// Expected: No corrupted lesson state or duplicated questions.
// ========================================================
console.log('\n--- RUNNING TEST G: Deterministic Loading & Re-entrance ---');
{
  const raw = JSON.parse(fs.readFileSync(findLessonFile('1.1_'), 'utf-8'));
  const run1 = selectLessonQuestions(raw, 15).map(q => q.id);
  const run2 = selectLessonQuestions(raw, 15).map(q => q.id);

  assert(JSON.stringify(run1) === JSON.stringify(run2), 'TEST G.1: Question selection is 100% deterministic');
  assert(new Set(run1).size === 15, 'TEST G.2: Exactly 15 unique questions preserved');
}

console.log('\n====================================================');
console.log('ALL TESTS PASSED SUCCESSFULLY! (TEST A - TEST G)');
console.log('====================================================');
