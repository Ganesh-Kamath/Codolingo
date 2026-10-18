/**
 * Unit Test Suite for Feature 3: 30-Second First Win & Misconception-Driven Placement Engine
 */

const assert = require('assert');

console.log('================================================================');
console.log('   30-SECOND FIRST WIN & MISCONCEPTION PLACEMENT TEST SUITE     ');
console.log('================================================================');

let passedCount = 0;
function pass(desc) {
  passedCount++;
  console.log(`  ✅ PASS: ${desc}`);
}

// -------------------------------------------------------------
// PURE DIAGNOSTIC ENGINE LOGIC
// -------------------------------------------------------------

const DIAGNOSTIC_QUESTIONS = [
  {
    id: 1,
    tier: 1,
    misconceptionTag: 'SYNTAX_ERROR',
    conceptTitle: 'Syntax & Output Delimiters',
    question: 'What occurs when Python executes the following statement?',
    codeSnippet: 'print("Python"',
    options: [
      { id: 'opt_1a', text: 'Outputs "Python" cleanly to standard output', isCorrect: true },
      { id: 'opt_1b', text: 'Raises a SyntaxError because print is not a valid built-in', isCorrect: false },
      { id: 'opt_1c', text: 'Outputs "None" because no variable was assigned', isCorrect: false },
      { id: 'opt_1d', text: 'Raises a TypeError because string quotes are invalid', isCorrect: false }
    ],
    explanation: 'print("Python") is valid syntax that sends the string text to standard output.'
  },
  {
    id: 2,
    tier: 2,
    misconceptionTag: 'STRING_VS_NUMBER',
    conceptTitle: 'Types: String Concatenation vs Arithmetic',
    question: 'What is the evaluated result of `total` after this statement runs?',
    codeSnippet: 'total = "10" + "20"',
    options: [
      { id: 'opt_2a', text: '30 (numeric addition of the numbers)', isCorrect: false },
      { id: 'opt_2b', text: '"1020" (text concatenation of two strings)', isCorrect: true },
      { id: 'opt_2c', text: 'Raises TypeError: cannot add string to string', isCorrect: false },
      { id: 'opt_2d', text: '200 (multiplied values)', isCorrect: false }
    ],
    explanation: 'In Python, the + operator between two strings concatenates them into "1020", not numeric 30.'
  },
  {
    id: 3,
    tier: 3,
    misconceptionTag: 'ASSIGNMENT_VS_COMPARISON',
    conceptTitle: 'Conditionals: Assignment (=) vs Equality (==)',
    question: 'Which line correctly checks if variable `score` equals 100 without mutating it?',
    codeSnippet: '# Checking if score has reached 100',
    options: [
      { id: 'opt_3a', text: 'if score == 100:', isCorrect: true },
      { id: 'opt_3b', text: 'if score = 100:', isCorrect: false },
      { id: 'opt_3c', text: 'if score === 100:', isCorrect: false },
      { id: 'opt_3d', text: 'if score.equals(100):', isCorrect: false }
    ],
    explanation: 'In Python, == is the equality comparison operator, whereas = assigns a new value.'
  },
  {
    id: 4,
    tier: 4,
    misconceptionTag: 'OFF_BY_ONE',
    conceptTitle: 'Iteration: range() Stop Bounds & Fenceposts',
    question: 'What sequence of numbers does this loop output?',
    codeSnippet: 'for i in range(1, 5):\n    print(i)',
    options: [
      { id: 'opt_4a', text: '1, 2, 3, 4, 5 (inclusive of 5)', isCorrect: false },
      { id: 'opt_4b', text: '1, 2, 3, 4 (exclusive of stop value 5)', isCorrect: true },
      { id: 'opt_4c', text: '0, 1, 2, 3, 4 (starts from 0)', isCorrect: false },
      { id: 'opt_4d', text: '2, 3, 4, 5 (starts at 1 + 1)', isCorrect: false }
    ],
    explanation: 'range(start, stop) generates integers from start up to stop - 1 (exclusive of the stop value).'
  },
  {
    id: 5,
    tier: 5,
    misconceptionTag: 'VARIABLE_VALUE_CONFUSION',
    conceptTitle: 'Variables: Value Copy vs Variable Binding',
    question: 'What is printed at the end of this script?',
    codeSnippet: 'x = 5\ny = x\nx = 10\nprint(y)',
    options: [
      { id: 'opt_5a', text: '10 (y changes dynamically when x changes)', isCorrect: false },
      { id: 'opt_5b', text: '5 (y retains the value 5 bound at assignment time)', isCorrect: true },
      { id: 'opt_5c', text: '15 (sum of 5 and 10)', isCorrect: false },
      { id: 'opt_5d', text: 'None', isCorrect: false }
    ],
    explanation: 'Assigning y = x binds y to the current value 5. Reassigning x = 10 does not alter y.'
  }
];

function evaluatePlacement(selectedOptionIds, course) {
  let correctCount = 0;
  const diagnosedMisconceptions = [];
  const mistakeRecords = [];

  DIAGNOSTIC_QUESTIONS.forEach(q => {
    const selectedId = selectedOptionIds[q.id];
    const selectedOption = q.options.find(o => o.id === selectedId);
    const isCorrect = Boolean(selectedOption?.isCorrect);

    if (isCorrect) {
      correctCount++;
    } else {
      diagnosedMisconceptions.push(q.misconceptionTag);
      mistakeRecords.push({
        id: `mst_diag_${q.misconceptionTag.toLowerCase()}_${q.id}`,
        lessonId: 'placement',
        skillId: `py_skill_${q.tier}_1`,
        challengeId: `diag_q_${q.id}`,
        userCode: q.codeSnippet,
        explanation: q.explanation,
        mistakeType: q.misconceptionTag,
        timestamp: new Date().toISOString(),
        frequency: 1,
        resolved: false
      });
    }
  });

  let targetUnitNumber = 1;
  let placementTier = 1;

  if (correctCount >= 5) {
    placementTier = 5;
    targetUnitNumber = 6;
  } else if (correctCount === 4) {
    placementTier = 4;
    targetUnitNumber = 4;
  } else if (correctCount === 3) {
    placementTier = 3;
    targetUnitNumber = 3;
  } else if (correctCount === 2) {
    placementTier = 2;
    targetUnitNumber = 2;
  } else {
    placementTier = 1;
    targetUnitNumber = 1;
  }

  const masteredSkillIds = [];
  const masteredLessonIds = [];

  if (targetUnitNumber > 1 && course?.units) {
    for (const u of course.units) {
      if (u.unitNumber < targetUnitNumber) {
        for (const s of u.skills) {
          masteredSkillIds.push(s.id);
          for (const l of s.lessons) {
            masteredLessonIds.push(l.id);
          }
        }
      }
    }
  }

  const targetUnit = course?.units?.find(u => u.unitNumber === targetUnitNumber);
  const nextSkillId = targetUnit?.skills?.[0]?.id || 'py_skill_1_1';
  const awardedXp = masteredSkillIds.length * 50;

  return {
    correctCount,
    totalQuestions: DIAGNOSTIC_QUESTIONS.length,
    placementTier,
    targetUnitNumber,
    masteredSkillIds,
    masteredLessonIds,
    nextSkillId,
    diagnosedMisconceptions,
    awardedXp,
    mistakeRecords
  };
}

function applyDiagnosticPlacementResult(prev, result) {
  const updatedCompletedSkills = Array.from(new Set([...prev.completedSkillIds, ...result.masteredSkillIds]));
  const updatedCompletedLessons = Array.from(new Set([...prev.completedLessonIds, ...result.masteredLessonIds]));
  const updatedMastery = { ...prev.skillMastery };
  const updatedMasteryRecords = { ...(prev.skillMasteryRecords || {}) };

  result.masteredSkillIds.forEach(sId => {
    updatedMastery[sId] = 5;
    updatedMasteryRecords[sId] = {
      pips: 5,
      lastPracticedAt: new Date().toISOString(),
      halfLifeDays: 30
    };
  });

  const existingMistakeKeys = new Set(prev.mistakes.map(m => `${m.skillId}_${m.mistakeType}`));
  const newMistakes = result.mistakeRecords.filter(m => !existingMistakeKeys.has(`${m.skillId}_${m.mistakeType}`));
  const updatedMistakes = [...newMistakes, ...prev.mistakes];

  return {
    ...prev,
    completedSkillIds: updatedCompletedSkills,
    completedLessonIds: updatedCompletedLessons,
    currentSkillId: result.nextSkillId,
    skillMastery: updatedMastery,
    skillMasteryRecords: updatedMasteryRecords,
    totalXp: prev.totalXp + result.awardedXp,
    mistakes: updatedMistakes,
    hasCompletedOnboarding: true,
    onboardingPlacementTier: result.placementTier,
    diagnosedMisconceptions: result.diagnosedMisconceptions
  };
}

// -------------------------------------------------------------
// TEST CASES
// -------------------------------------------------------------

// Mock Course Data
const mockCourse = {
  units: [
    { unitNumber: 1, skills: [{ id: 'py_skill_1_1', lessons: [{ id: '1.1' }] }, { id: 'py_skill_1_2', lessons: [{ id: '1.2' }] }] },
    { unitNumber: 2, skills: [{ id: 'py_skill_2_1', lessons: [{ id: '2.1' }] }] },
    { unitNumber: 3, skills: [{ id: 'py_skill_3_1', lessons: [{ id: '3.1' }] }] },
    { unitNumber: 4, skills: [{ id: 'py_skill_4_1', lessons: [{ id: '4.1' }] }] },
    { unitNumber: 6, skills: [{ id: 'py_skill_6_1', lessons: [{ id: '6.1' }] }] }
  ]
};

// Test 1: Question matrix coverage
assert.strictEqual(DIAGNOSTIC_QUESTIONS.length, 5, 'Should have exactly 5 diagnostic questions');
const tags = DIAGNOSTIC_QUESTIONS.map(q => q.misconceptionTag);
assert(tags.includes('SYNTAX_ERROR'), 'Must include SYNTAX_ERROR');
assert(tags.includes('STRING_VS_NUMBER'), 'Must include STRING_VS_NUMBER');
assert(tags.includes('ASSIGNMENT_VS_COMPARISON'), 'Must include ASSIGNMENT_VS_COMPARISON');
assert(tags.includes('OFF_BY_ONE'), 'Must include OFF_BY_ONE');
assert(tags.includes('VARIABLE_VALUE_CONFUSION'), 'Must include VARIABLE_VALUE_CONFUSION');
pass('1. Diagnostic matrix covers all 5 foundational misconception tags');

// Test 2: Perfect score (5/5) unlocks Unit 6
const perfectAnswers = {
  1: 'opt_1a',
  2: 'opt_2b',
  3: 'opt_3a',
  4: 'opt_4b',
  5: 'opt_5b'
};
const perfectEval = evaluatePlacement(perfectAnswers, mockCourse);
assert.strictEqual(perfectEval.correctCount, 5);
assert.strictEqual(perfectEval.targetUnitNumber, 6, '5/5 score should place in Unit 6');
assert.strictEqual(perfectEval.placementTier, 5);
assert.strictEqual(perfectEval.diagnosedMisconceptions.length, 0, 'No misconceptions diagnosed on perfect score');
assert(perfectEval.masteredSkillIds.includes('py_skill_1_1'));
assert(perfectEval.masteredSkillIds.includes('py_skill_4_1'));
assert.strictEqual(perfectEval.nextSkillId, 'py_skill_6_1');
pass('2. Perfect score (5/5) places into Unit 6 and credits prior units');

// Test 3: Failing Tier 3 (Assignment vs Comparison) places into Unit 3
const partialAnswers = {
  1: 'opt_1a', // correct
  2: 'opt_2b', // correct
  3: 'opt_3b', // WRONG (assignment instead of equality)
  4: 'opt_4a', // WRONG (inclusive of 5)
  5: 'opt_5b'  // correct
};
const partialEval = evaluatePlacement(partialAnswers, mockCourse);
assert.strictEqual(partialEval.correctCount, 3);
assert.strictEqual(partialEval.targetUnitNumber, 3, '3 correct should place into Unit 3');
assert(partialEval.diagnosedMisconceptions.includes('ASSIGNMENT_VS_COMPARISON'));
assert(partialEval.diagnosedMisconceptions.includes('OFF_BY_ONE'));
assert.strictEqual(partialEval.mistakeRecords.length, 2, 'Should generate 2 mistake records for Fix-It Lab');
pass('3. Failing Tier 3 & Tier 4 places in Unit 3 and logs ASSIGNMENT_VS_COMPARISON & OFF_BY_ONE');

// Test 4: Brand new learner (0-1 correct) places into Unit 1
const beginnerAnswers = {
  1: 'opt_1b', // wrong
  2: 'opt_2a', // wrong
  3: 'opt_3b', // wrong
  4: 'opt_4a', // wrong
  5: 'opt_5a'  // wrong
};
const beginnerEval = evaluatePlacement(beginnerAnswers, mockCourse);
assert.strictEqual(beginnerEval.correctCount, 0);
assert.strictEqual(beginnerEval.targetUnitNumber, 1, '0 correct should place in Unit 1');
assert.strictEqual(beginnerEval.masteredSkillIds.length, 0, 'No skills skipped for Unit 1 placement');
assert.strictEqual(beginnerEval.awardedXp, 0);
pass('4. Absolute beginner (0/5) places cleanly in Unit 1 without skipped skills');

// Test 5: State application and Fix-It Lab mistake logging
const initialProgress = {
  completedSkillIds: [],
  completedLessonIds: [],
  currentSkillId: 'py_skill_1_1',
  skillMastery: {},
  skillMasteryRecords: {},
  totalXp: 0,
  mistakes: []
};
const updatedProgress = applyDiagnosticPlacementResult(initialProgress, partialEval);
assert.strictEqual(updatedProgress.hasCompletedOnboarding, true);
assert.strictEqual(updatedProgress.onboardingPlacementTier, 3);
assert.strictEqual(updatedProgress.currentSkillId, 'py_skill_3_1');
assert(updatedProgress.mistakes.some(m => m.mistakeType === 'ASSIGNMENT_VS_COMPARISON'));
assert(updatedProgress.mistakes.some(m => m.mistakeType === 'OFF_BY_ONE'));
assert.strictEqual(updatedProgress.totalXp, partialEval.awardedXp);
pass('5. State application successfully unlocks Unit 3, awards XP, and registers diagnosed mistakes in Fix-It Lab');

console.log('================================================================');
console.log(`  🎉 ALL ${passedCount}/5 DIAGNOSTIC ONBOARDING TESTS PASSED!`);
console.log('================================================================\n');
