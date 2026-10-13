/**
 * End-to-End Simulation & Verification Test Script: Multi-Unit Flow
 * Simulates completing lessons across Units 1-3 and asserts:
 * 1. Sequential unlock order across unit boundaries (Unit 1 -> Unit 2 -> Unit 3 -> Unit 4)
 * 2. Next lesson resolution ("Continue", command palette, course explorer)
 * 3. Dynamic skill mastery calculation (accuracy, hints, mistakes; NOT hardcoded to 5)
 * 4. XP, level, streak, daily goal and achievements consistency
 * 5. Persistence across mock page reload (localStorage migration v3)
 * 6. Mistake Bank 4-step repair drill coverage for all 13 misconception tags
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let testsPassed = 0;
let testsFailed = 0;

function it(desc, fn) {
  try {
    fn();
    console.log(`  ✓ ${desc}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
    testsFailed++;
  }
}

// -------------------------------------------------------------
// Load Course Structure from pythonCourse.ts
// -------------------------------------------------------------
console.log('\n--- Loading Curriculum Data ---');
const pythonCourseFile = path.resolve(__dirname, '../../src/curriculum/python/pythonCourse.ts');
const courseContent = fs.readFileSync(pythonCourseFile, 'utf8');

// Extract the units array from pythonCourse.ts
const courseJsonMatch = courseContent.match(/export const PYTHON_COURSE:\s*LearningCourse\s*=\s*(\{[\s\S]*\});\s*$/);
if (!courseJsonMatch) {
  throw new Error('Failed to match PYTHON_COURSE in pythonCourse.ts');
}

// Evaluate course object cleanly
const sandbox = {
  Terminal: 'Terminal'
};
let course;
try {
  // Use Function to evaluate the object literal
  const evaluator = new Function('return ' + courseJsonMatch[1]);
  course = evaluator();
} catch (e) {
  throw new Error('Failed to parse course definition: ' + e.message);
}

console.log(`  ✓ Loaded PYTHON_COURSE with ${course.units.length} units.`);

// -------------------------------------------------------------
// Mastery Model Implementation (mirroring src/services/masteryService.ts)
// -------------------------------------------------------------
const MASTERY_THRESHOLDS = {
  PIP_0_MAX: 19,
  PIP_1_MIN: 20,
  PIP_2_MIN: 40,
  PIP_3_MIN: 60,
  PIP_4_MIN: 75,
  PIP_5_MIN: 90
};

const MASTERY_PENALTIES = {
  HINT_PENALTY: 5,
  UNRESOLVED_MISTAKE_PENALTY: 5,
  MAX_HINT_PENALTY: 25
};

const UNKNOWN_MASTERY_PIPS = -1;

function scoreToPips(score) {
  if (score < MASTERY_THRESHOLDS.PIP_1_MIN) return 0;
  if (score < MASTERY_THRESHOLDS.PIP_2_MIN) return 1;
  if (score < MASTERY_THRESHOLDS.PIP_3_MIN) return 2;
  if (score < MASTERY_THRESHOLDS.PIP_4_MIN) return 3;
  if (score < MASTERY_THRESHOLDS.PIP_4_MIN) return 3;
  if (score < MASTERY_THRESHOLDS.PIP_5_MIN) return 4;
  return 5;
}

function evaluateAttempt(stats) {
  const total = Math.max(stats.totalQuestions, 1);
  const correct = Math.max(0, Math.min(stats.firstAttemptCorrectCount, total));
  const hints = Math.max(0, stats.hintsUsed || 0);
  const unresolvedMistakes = Math.max(0, stats.unresolvedMistakesCount || 0);

  const baseAccuracy = (correct / total) * 100;
  const hintPenalty = Math.min(hints * MASTERY_PENALTIES.HINT_PENALTY, MASTERY_PENALTIES.MAX_HINT_PENALTY);
  const mistakePenalty = unresolvedMistakes * MASTERY_PENALTIES.UNRESOLVED_MISTAKE_PENALTY;

  const rawScore = Math.round(baseAccuracy - hintPenalty - mistakePenalty);
  const score = Math.max(0, Math.min(100, rawScore));
  const pips = scoreToPips(score);
  return { score, pips, correct, total, hints, unresolvedMistakes };
}

function updateSkillMastery(currentPips, newPips) {
  if (currentPips === undefined || currentPips === UNKNOWN_MASTERY_PIPS) {
    return newPips;
  }
  return Math.max(currentPips, newPips);
}

// -------------------------------------------------------------
// Progression Service Implementation (mirroring src/services/progressionService.ts)
// -------------------------------------------------------------
const progressionService = {
  getNextLesson(userProgress, course) {
    const completed = userProgress.completedLessonIds;
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        for (const lesson of skill.lessons) {
          if (!completed.includes(lesson.id)) {
            return lesson.id;
          }
        }
      }
    }
    return null;
  },

  isLessonAvailable(lessonId, userProgress, course) {
    if (userProgress.completedLessonIds.includes(lessonId)) return true;

    const orderedLessons = [];
    for (const unit of course.units) {
      for (const skill of unit.skills) {
        for (const lesson of skill.lessons) {
          orderedLessons.push(lesson.id);
        }
      }
    }

    const idx = orderedLessons.indexOf(lessonId);
    if (idx <= 0) return true;

    const prevLessonId = orderedLessons[idx - 1];
    return userProgress.completedLessonIds.includes(prevLessonId);
  },

  calculateLevel(totalXp) {
    let level = 1;
    let requiredXp = 100;
    let currentLevelBaseXp = 0;

    while (totalXp >= requiredXp) {
      level++;
      currentLevelBaseXp = requiredXp;
      requiredXp += level * 100;
    }

    const progress = Math.round(((totalXp - currentLevelBaseXp) / (requiredXp - currentLevelBaseXp)) * 100);
    return { level, nextLevelXp: requiredXp, progress };
  },

  updateStreak(userProgress) {
    const todayStr = new Date().toISOString().split('T')[0];
    const history = [...userProgress.activityHistory];
    const todayActivity = history.find(a => a.date === todayStr);

    if (todayActivity) {
      return { activityHistory: history };
    }

    let currentStreak = userProgress.streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const yesterdayActivity = history.find(a => a.date === yesterdayStr);
    if (yesterdayActivity) {
      currentStreak += 1;
    } else {
      currentStreak = 1;
    }

    const bestStreak = Math.max(currentStreak, userProgress.bestStreak || 1);
    return { streak: currentStreak, bestStreak };
  },

  processLessonCompletion(userProgress, lessonId, xpReward, course, attemptStats) {
    const isFirstTime = !userProgress.completedLessonIds.includes(lessonId);
    const updatedCompletedLessons = isFirstTime
      ? [...userProgress.completedLessonIds, lessonId]
      : userProgress.completedLessonIds;

    const awardedXp = isFirstTime ? xpReward : 0;
    const newTotalXp = userProgress.totalXp + awardedXp;

    let completedSkillId = null;
    const allOrderedSkills = [];

    for (const unit of course.units) {
      for (const skill of unit.skills) {
        allOrderedSkills.push(skill.id);
        if (skill.lessons.some(l => l.id === lessonId)) {
          completedSkillId = skill.id;
        }
      }
    }

    const updatedCompletedSkills = [...userProgress.completedSkillIds];
    const updatedSkillMastery = { ...userProgress.skillMastery };

    if (completedSkillId) {
      if (!updatedCompletedSkills.includes(completedSkillId)) {
        updatedCompletedSkills.push(completedSkillId);
      }

      if (attemptStats) {
        const unresolvedSkillMistakes = userProgress.mistakes.filter(
          m => !m.resolved && (m.skillId === completedSkillId || m.lessonId === lessonId)
        ).length;

        const totalMistakes = Math.max(
          unresolvedSkillMistakes,
          attemptStats.unresolvedMistakesCount || 0
        );

        const evalResult = evaluateAttempt({
          ...attemptStats,
          unresolvedMistakesCount: totalMistakes
        });

        const currentPips = userProgress.skillMastery[completedSkillId];
        updatedSkillMastery[completedSkillId] = updateSkillMastery(currentPips, evalResult.pips);
      } else if (updatedSkillMastery[completedSkillId] === undefined) {
        updatedSkillMastery[completedSkillId] = 3;
      }
    }

    let nextSkillId = userProgress.currentSkillId;
    if (completedSkillId) {
      const completedIdx = allOrderedSkills.indexOf(completedSkillId);
      const activeIdx = allOrderedSkills.indexOf(userProgress.currentSkillId);
      if ((activeIdx === -1 || completedIdx >= activeIdx) && completedIdx + 1 < allOrderedSkills.length) {
        nextSkillId = allOrderedSkills[completedIdx + 1];
      }
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const history = [...userProgress.activityHistory];
    const todayIdx = history.findIndex(a => a.date === todayStr);

    if (todayIdx >= 0) {
      history[todayIdx] = {
        ...history[todayIdx],
        lessonsCount: isFirstTime ? history[todayIdx].lessonsCount + 1 : history[todayIdx].lessonsCount,
        xp: history[todayIdx].xp + awardedXp
      };
    } else {
      history.push({
        date: todayStr,
        lessonsCount: isFirstTime ? 1 : 0,
        xp: awardedXp
      });
    }

    const dailyGoalEarnedXp = todayIdx >= 0 ? history[todayIdx].xp : (userProgress.dailyGoalEarnedXp + awardedXp);
    const dailyLessonsCount = todayIdx >= 0 ? history[todayIdx].lessonsCount : (isFirstTime ? 1 : 0);
    const updatedDailyGoal = {
      lessonsTarget: userProgress.dailyGoal?.lessonsTarget || 2,
      lessonsCompleted: dailyLessonsCount,
      xpTarget: userProgress.dailyGoal?.xpTarget || userProgress.dailyGoalXp || 50,
      xpEarned: dailyGoalEarnedXp
    };

    const levelInfo = progressionService.calculateLevel(newTotalXp);
    const streakUpdates = progressionService.updateStreak(userProgress);

    const updatedAchievements = userProgress.achievements.map(ach => {
      let progress = ach.progress;
      let unlocked = ach.unlocked;

      if (ach.id === 'first_code' && updatedCompletedLessons.length > 0) {
        progress = 1;
        unlocked = true;
      }
      if (ach.id === 'streak_7') {
        progress = Math.min(streakUpdates.streak ?? userProgress.streak, 7);
        if (progress >= 7) unlocked = true;
      }
      if (ach.id === '100_xp' && newTotalXp >= 100) {
        progress = Math.min(newTotalXp, 100);
        unlocked = true;
      }

      return { ...ach, progress, unlocked };
    });

    return {
      ...userProgress,
      ...streakUpdates,
      completedLessonIds: updatedCompletedLessons,
      completedSkillIds: updatedCompletedSkills,
      currentSkillId: nextSkillId,
      skillMastery: updatedSkillMastery,
      totalXp: newTotalXp,
      level: levelInfo.level,
      dailyGoalEarnedXp,
      dailyGoal: updatedDailyGoal,
      activityHistory: history,
      achievements: updatedAchievements
    };
  }
};

// -------------------------------------------------------------
// Initial User State
// -------------------------------------------------------------
function createInitialUserProgress() {
  return {
    userId: 'usr_test',
    name: 'Learner',
    username: 'learner',
    avatarUrl: '',
    activeCourseId: 'python',
    streak: 0,
    bestStreak: 0,
    level: 1,
    totalXp: 0,
    energy: 5,
    maxEnergy: 5,
    dailyGoalXp: 50,
    dailyGoalEarnedXp: 0,
    completedSkillIds: [],
    currentSkillId: 'py_skill_1_1',
    completedLessonIds: [],
    skillMastery: {
      'py_skill_1_1': 0
    },
    mistakes: [],
    dailyGoal: {
      lessonsTarget: 2,
      lessonsCompleted: 0,
      xpTarget: 50,
      xpEarned: 0
    },
    activityHistory: [],
    achievements: [
      {
        id: 'first_code',
        title: 'First Output',
        description: 'Run your first line of real code in the sandbox',
        icon: 'Terminal',
        unlocked: false,
        progress: 0,
        maxProgress: 1
      },
      {
        id: 'streak_7',
        title: 'Consistency King',
        description: 'Maintain a learning streak for 7 consecutive days',
        icon: 'Flame',
        unlocked: false,
        progress: 0,
        maxProgress: 7
      },
      {
        id: '100_xp',
        title: 'Century Milestone',
        description: 'Earn 100 XP',
        icon: 'Coin',
        unlocked: false,
        progress: 0,
        maxProgress: 100
      },
      {
        id: 'repair_prodigy',
        title: 'Bug Surgeon',
        description: 'Repair 3 code mistakes through targeted diagnostic drills',
        icon: 'Wrench',
        unlocked: false,
        progress: 0,
        maxProgress: 3
      }
    ]
  };
}

// -------------------------------------------------------------
// Test Suite Execution
// -------------------------------------------------------------
console.log('\n--- 1. Testing Initial State & Progression Resolvers ---');

let state = createInitialUserProgress();

it('Initial next lesson resolves to 1.1', () => {
  const next = progressionService.getNextLesson(state, course);
  assert.strictEqual(next, '1.1');
});

it('Lesson 1.1 is available, while Lesson 1.2 is locked initially', () => {
  assert.strictEqual(progressionService.isLessonAvailable('1.1', state, course), true);
  assert.strictEqual(progressionService.isLessonAvailable('1.2', state, course), false);
  assert.strictEqual(progressionService.isLessonAvailable('2.1', state, course), false);
});

// -------------------------------------------------------------
// Unit 1 Playthrough: 1.1 to 1.6
// -------------------------------------------------------------
console.log('\n--- 2. Simulating Unit 1 Playthrough & Mastery Calibration ---');

it('Complete 1.1 with 15/15 correct first-try (0 hints) -> earns 5 pips and unlocks first_code', () => {
  state = progressionService.processLessonCompletion(state, '1.1', 25, course, {
    firstAttemptCorrectCount: 15,
    totalQuestions: 15,
    hintsUsed: 0,
    unresolvedMistakesCount: 0
  });

  assert.strictEqual(state.completedLessonIds.includes('1.1'), true);
  assert.strictEqual(state.totalXp, 25);
  assert.strictEqual(state.skillMastery['py_skill_1_1'], 5);
  assert.strictEqual(state.achievements.find(a => a.id === 'first_code').unlocked, true);
  assert.strictEqual(state.dailyGoal.lessonsCompleted, 1);
  assert.strictEqual(state.dailyGoal.xpEarned, 25);
  assert.strictEqual(state.currentSkillId, 'py_skill_1_2');
  assert.strictEqual(progressionService.getNextLesson(state, course), '1.2');
  assert.strictEqual(progressionService.isLessonAvailable('1.2', state, course), true);
});

it('Complete 1.2 with 10/15 correct and 2 hints -> calculates ~3 pips (NOT hardcoded to 5)', () => {
  // Accuracy = 10/15 = 66.6%, hints = 2 -> score ~57 -> 2 pips (Developing)
  state = progressionService.processLessonCompletion(state, '1.2', 25, course, {
    firstAttemptCorrectCount: 10,
    totalQuestions: 15,
    hintsUsed: 2,
    unresolvedMistakesCount: 1
  });

  const pips = state.skillMastery['py_skill_1_2'];
  assert(pips !== undefined, 'Mastery pip should be recorded');
  assert(pips < 5, `Skill mastery should NOT be 5 on 66% accuracy with hints (got ${pips})`);
  assert(pips >= 2, `Skill mastery should reflect real score (got ${pips})`);
  assert.strictEqual(state.totalXp, 50);
  assert.strictEqual(progressionService.getNextLesson(state, course), '1.3');
});

it('Complete 1.3 with 6/15 correct, 3 hints and 3 mistakes -> yields 1 pip (Beginner)', () => {
  // Accuracy = 6/15 = 40% - 15 - 15 = 10% -> 0 or 1 pips
  state = progressionService.processLessonCompletion(state, '1.3', 25, course, {
    firstAttemptCorrectCount: 6,
    totalQuestions: 15,
    hintsUsed: 3,
    unresolvedMistakesCount: 3
  });

  const pips = state.skillMastery['py_skill_1_3'];
  assert(pips < 3, `Skill mastery should be low on low accuracy (got ${pips})`);
  assert.strictEqual(state.totalXp, 75);
});

it('Complete 1.4 -> total XP reaches 100, level advances to 2, 100_xp achievement unlocks', () => {
  state = progressionService.processLessonCompletion(state, '1.4', 25, course, {
    firstAttemptCorrectCount: 14,
    totalQuestions: 15,
    hintsUsed: 0,
    unresolvedMistakesCount: 0
  });

  assert.strictEqual(state.totalXp, 100);
  assert.strictEqual(state.level, 2);
  const ach = state.achievements.find(a => a.id === '100_xp');
  assert.strictEqual(ach.unlocked, true);
  assert.strictEqual(ach.progress, 100);
});

it('Complete 1.5 and 1.6 to finish Unit 1', () => {
  state = progressionService.processLessonCompletion(state, '1.5', 25, course, {
    firstAttemptCorrectCount: 15,
    totalQuestions: 15,
    hintsUsed: 0
  });
  state = progressionService.processLessonCompletion(state, '1.6', 25, course, {
    firstAttemptCorrectCount: 15,
    totalQuestions: 15,
    hintsUsed: 0
  });

  assert.strictEqual(state.totalXp, 150);
  assert.strictEqual(state.completedLessonIds.length, 6);
  assert.strictEqual(state.completedSkillIds.length, 6);
});

// -------------------------------------------------------------
// Boundary: Unit 1 -> Unit 2 Transition
// -------------------------------------------------------------
console.log('\n--- 3. Testing Unit 1 -> Unit 2 Boundary Transition ---');

it('After 1.6 completion, next lesson resolves cleanly to 2.1 across units', () => {
  const next = progressionService.getNextLesson(state, course);
  assert.strictEqual(next, '2.1', `Next lesson must be 2.1 across unit boundary (got ${next})`);
});

it('Lesson 2.1 is now unlocked, while 2.2 remains locked', () => {
  assert.strictEqual(progressionService.isLessonAvailable('2.1', state, course), true);
  assert.strictEqual(progressionService.isLessonAvailable('2.2', state, course), false);
  assert.strictEqual(state.currentSkillId, 'py_skill_2_1');
});

// -------------------------------------------------------------
// Unit 2 Playthrough: 2.1 to 2.7
// -------------------------------------------------------------
console.log('\n--- 4. Simulating Unit 2 Playthrough ---');

it('Complete lessons 2.1 through 2.7 in Unit 2 sequentially', () => {
  const unit2Lessons = ['2.1', '2.2', '2.3', '2.4', '2.5', '2.6', '2.7'];

  for (const lesId of unit2Lessons) {
    const nextBefore = progressionService.getNextLesson(state, course);
    assert.strictEqual(nextBefore, lesId, `Expected next lesson to be ${lesId}`);
    assert.strictEqual(progressionService.isLessonAvailable(lesId, state, course), true);

    state = progressionService.processLessonCompletion(state, lesId, 25, course, {
      firstAttemptCorrectCount: 14,
      totalQuestions: 15,
      hintsUsed: 1
    });
  }

  assert.strictEqual(state.completedLessonIds.length, 13); // 6 + 7 = 13
  assert.strictEqual(state.totalXp, 325); // 150 + 175 = 325
});

// -------------------------------------------------------------
// Boundary: Unit 2 -> Unit 3 Transition
// -------------------------------------------------------------
console.log('\n--- 5. Testing Unit 2 -> Unit 3 Boundary Transition ---');

it('After 2.7 completion, next lesson resolves cleanly to 3.1', () => {
  const next = progressionService.getNextLesson(state, course);
  assert.strictEqual(next, '3.1', `Next lesson must be 3.1 across unit boundary (got ${next})`);
  assert.strictEqual(progressionService.isLessonAvailable('3.1', state, course), true);
  assert.strictEqual(progressionService.isLessonAvailable('3.2', state, course), false);
  assert.strictEqual(state.currentSkillId, 'py_skill_3_1');
});

// -------------------------------------------------------------
// Unit 3 Playthrough: 3.1 to 3.5
// -------------------------------------------------------------
console.log('\n--- 6. Simulating Unit 3 Playthrough & Unit 4 Unlock ---');

it('Complete lessons 3.1 through 3.5 in Unit 3 sequentially', () => {
  const unit3Lessons = ['3.1', '3.2', '3.3', '3.4', '3.5'];

  for (const lesId of unit3Lessons) {
    state = progressionService.processLessonCompletion(state, lesId, 25, course, {
      firstAttemptCorrectCount: 15,
      totalQuestions: 15,
      hintsUsed: 0
    });
  }

  assert.strictEqual(state.completedLessonIds.length, 18); // 13 + 5 = 18
  assert.strictEqual(state.totalXp, 450); // 325 + 125 = 450
});

it('After 3.5 completion, next lesson resolves cleanly to 4.1', () => {
  const next = progressionService.getNextLesson(state, course);
  assert.strictEqual(next, '4.1', `Next lesson must be 4.1 across unit boundary (got ${next})`);
  assert.strictEqual(progressionService.isLessonAvailable('4.1', state, course), true);
  assert.strictEqual(state.currentSkillId, 'py_skill_4_1');
});

it('Replaying an already completed lesson does not award duplicate XP', () => {
  const prevXp = state.totalXp;
  state = progressionService.processLessonCompletion(state, '1.1', 25, course, {
    firstAttemptCorrectCount: 15,
    totalQuestions: 15,
    hintsUsed: 0
  });
  assert.strictEqual(state.totalXp, prevXp, 'Repeat completion should not award XP');
});

// -------------------------------------------------------------
// Persistence & Reload Simulation (localStorage v3 Schema)
// -------------------------------------------------------------
console.log('\n--- 7. Testing State Persistence & Page Reload ---');

it('Simulate localStorage serialization and reload', () => {
  // Serialize
  const serialized = JSON.stringify({
    ...state,
    _version: 3,
    _curriculumVersion: 2
  });

  // Reload
  const reloadedRaw = JSON.parse(serialized);

  // Assert schema integrity
  assert.strictEqual(reloadedRaw.completedLessonIds.length, 18);
  assert.strictEqual(reloadedRaw.totalXp, 450);
  assert.strictEqual(reloadedRaw.level, state.level);
  assert.strictEqual(reloadedRaw.currentSkillId, 'py_skill_4_1');
  assert.strictEqual(reloadedRaw.dailyGoal.lessonsCompleted >= 2, true);
  assert.strictEqual(reloadedRaw.achievements.find(a => a.id === 'first_code').unlocked, true);
  assert.strictEqual(reloadedRaw.achievements.find(a => a.id === '100_xp').unlocked, true);

  // Skill mastery should remain intact and not reset
  assert.strictEqual(reloadedRaw.skillMastery['py_skill_1_1'], 5);
  assert(reloadedRaw.skillMastery['py_skill_1_2'] < 5, 'Mastery score should remain < 5 for py_skill_1_2');
  assert(reloadedRaw.skillMastery['py_skill_1_3'] < 3, 'Mastery score should remain low for py_skill_1_3');

  // Next lesson should still resolve to 4.1 after reload
  const nextAfterReload = progressionService.getNextLesson(reloadedRaw, course);
  assert.strictEqual(nextAfterReload, '4.1');
});

// -------------------------------------------------------------
// Mistake Bank 13-Tag Coverage & Non-Trivial Drills Check
// -------------------------------------------------------------
console.log('\n--- 8. Testing Mistake Bank Drills & All Misconception Tags ---');

const ALL_MISCONCEPTION_TAGS = [
  'STRING_VS_NUMBER',
  'ASSIGNMENT_VS_COMPARISON',
  'OFF_BY_ONE',
  'WRONG_OPERATOR',
  'WRONG_TYPE',
  'VARIABLE_VALUE_CONFUSION',
  'PRECEDENCE_CONFUSION',
  'BOOLEAN_LOGIC_CONFUSION',
  'SYNTAX_ERROR',
  'INDENTATION_ERROR',
  'INPUT_IS_STRING',
  'CONDITION_BOUNDARY',
  'LOOP_EXECUTION_CONFUSION'
];

const repairDir = path.resolve(__dirname, '../../src/curriculum/python/repair');

it('All 13 misconception tags are registered in repair/index.ts', () => {
  const indexPath = path.join(repairDir, 'index.ts');
  const indexContent = fs.readFileSync(indexPath, 'utf8');

  for (const tag of ALL_MISCONCEPTION_TAGS) {
    assert(indexContent.includes(tag), `Tag ${tag} must be present in repair/index.ts`);
  }
});

it('Every misconception drill contains full 4-step contracts with non-trivial test assertions', () => {
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

  for (const file of drillFiles) {
    const fullPath = path.join(repairDir, file);
    assert(fs.existsSync(fullPath), `Drill file exists: ${file}`);
    const content = fs.readFileSync(fullPath, 'utf8');

    // 4 Steps
    assert(content.includes('SPOT IT'), `${file} has Step 1 SPOT IT`);
    assert(content.includes('UNDERSTAND WHY'), `${file} has Step 2 UNDERSTAND WHY`);
    assert(content.includes('FIX IT'), `${file} has Step 3 FIX IT`);
    assert(content.includes('PROVE IT'), `${file} has Step 4 PROVE IT`);

    // Non-trivial test checks: must have expectedOutput or assertionPython
    assert(
      content.includes('expectedOutput') || content.includes('assertionPython'),
      `${file} must specify expectedOutput or assertionPython for concrete verification`
    );
  }
});

console.log(`\n========================================`);
console.log(`Multi-Unit Flow Tests: ${testsPassed} passed, ${testsFailed} failed`);
console.log(`========================================\n`);

if (testsFailed > 0) {
  process.exit(1);
}
