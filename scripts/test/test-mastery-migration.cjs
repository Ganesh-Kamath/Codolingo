/**
 * Unit test suite for Mastery Scoring Model & Storage Migration v3.
 * Runs in Node without external dependencies.
 */

const assert = require('assert');

// 1. Thresholds & constants mirroring src/constants/mastery.ts
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

// 2. Migration function mirroring src/services/migrationService.ts
function migrateProgressData(raw, fallbackInitial) {
  if (!raw || typeof raw !== 'object') {
    return fallbackInitial;
  }

  const migrated = {
    ...fallbackInitial,
    ...raw,
    totalXp: typeof raw.totalXp === 'number' ? raw.totalXp : 0,
    streak: typeof raw.streak === 'number' ? raw.streak : 0,
    completedSkillIds: Array.isArray(raw.completedSkillIds) ? [...raw.completedSkillIds] : [],
    completedLessonIds: Array.isArray(raw.completedLessonIds) ? [...raw.completedLessonIds] : [],
    mistakes: Array.isArray(raw.mistakes) ? [...raw.mistakes] : [],
    skillMastery: {}
  };

  const rawMastery = raw.skillMastery || {};
  const isLegacyVersion = !raw._version || raw._version < 3;

  for (const skillId of migrated.completedSkillIds) {
    const rawScore = rawMastery[skillId];
    if (isLegacyVersion && (rawScore === 5 || rawScore === undefined)) {
      migrated.skillMastery[skillId] = UNKNOWN_MASTERY_PIPS;
    } else if (typeof rawScore === 'number') {
      migrated.skillMastery[skillId] = rawScore;
    } else {
      migrated.skillMastery[skillId] = UNKNOWN_MASTERY_PIPS;
    }
  }

  for (const [k, v] of Object.entries(rawMastery)) {
    if (migrated.skillMastery[k] === undefined && typeof v === 'number') {
      migrated.skillMastery[k] = isLegacyVersion && v === 5 ? UNKNOWN_MASTERY_PIPS : v;
    }
  }

  // Curriculum Migration:
  const isLegacyCurriculum = !raw._curriculumVersion || raw._curriculumVersion < 2;

  if (isLegacyCurriculum) {
    const oldLessonIds = new Set(migrated.completedLessonIds);
    const newLessonIds = new Set(migrated.completedLessonIds);

    const finishedFoundations = oldLessonIds.has('1.10') || 
                                migrated.completedSkillIds.includes('py_skill_1_10') ||
                                oldLessonIds.has('unit_01_final') ||
                                oldLessonIds.has('final_challenge_01');

    if (oldLessonIds.has('1.1')) {
      newLessonIds.add('1.1');
      newLessonIds.add('1.4');
    }
    if (oldLessonIds.has('1.2')) newLessonIds.add('2.1');
    if (oldLessonIds.has('1.3')) newLessonIds.add('3.1');
    if (oldLessonIds.has('1.4')) newLessonIds.add('2.4');
    if (oldLessonIds.has('1.5')) newLessonIds.add('4.1');
    if (oldLessonIds.has('1.6')) newLessonIds.add('2.7');
    if (oldLessonIds.has('1.7')) {
      newLessonIds.delete('1.7');
      newLessonIds.add('3.4');
    }
    if (oldLessonIds.has('1.8')) {
      newLessonIds.delete('1.8');
      newLessonIds.add('3.5');
    }
    if (oldLessonIds.has('1.9')) {
      newLessonIds.delete('1.9');
      newLessonIds.add('5.1');
    }
    if (oldLessonIds.has('1.10')) {
      newLessonIds.delete('1.10');
      newLessonIds.add('5.6');
    }

    if (finishedFoundations) {
      ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'].forEach(id => newLessonIds.add(id));
    }

    migrated.completedLessonIds = Array.from(newLessonIds);

    const oldSkillIds = new Set(migrated.completedSkillIds);
    const newSkillIds = new Set(migrated.completedSkillIds);

    const legacySkillMapping = {
      'py_skill_1_7': 'py_skill_3_4',
      'py_skill_1_8': 'py_skill_3_5',
      'py_skill_1_9': 'py_skill_5_1',
      'py_skill_1_10': 'py_skill_5_6',
    };

    if (oldSkillIds.has('py_skill_1_2')) newSkillIds.add('py_skill_2_1');
    if (oldSkillIds.has('py_skill_1_3')) newSkillIds.add('py_skill_3_1');
    if (oldSkillIds.has('py_skill_1_4')) newSkillIds.add('py_skill_2_4');
    if (oldSkillIds.has('py_skill_1_5')) newSkillIds.add('py_skill_4_1');
    if (oldSkillIds.has('py_skill_1_6')) newSkillIds.add('py_skill_2_7');

    for (const [oldSkill, newSkill] of Object.entries(legacySkillMapping)) {
      if (oldSkillIds.has(oldSkill)) {
        newSkillIds.delete(oldSkill);
        newSkillIds.add(newSkill);
      }
    }

    if (finishedFoundations) {
      ['py_skill_1_1', 'py_skill_1_2', 'py_skill_1_3', 'py_skill_1_4', 'py_skill_1_5', 'py_skill_1_6'].forEach(id => newSkillIds.add(id));
    }

    migrated.completedSkillIds = Array.from(newSkillIds);

    if (migrated.currentSkillId in legacySkillMapping) {
      migrated.currentSkillId = legacySkillMapping[migrated.currentSkillId];
    }

    for (const [oldSkill, newSkill] of Object.entries(legacySkillMapping)) {
      if (oldSkill in migrated.skillMastery) {
        migrated.skillMastery[newSkill] = migrated.skillMastery[oldSkill];
        delete migrated.skillMastery[oldSkill];
      }
    }
    if ('py_skill_1_2' in migrated.skillMastery && !('py_skill_2_1' in migrated.skillMastery)) {
      migrated.skillMastery['py_skill_2_1'] = migrated.skillMastery['py_skill_1_2'];
    }
    if ('py_skill_1_3' in migrated.skillMastery && !('py_skill_3_1' in migrated.skillMastery)) {
      migrated.skillMastery['py_skill_3_1'] = migrated.skillMastery['py_skill_1_3'];
    }
    if ('py_skill_1_4' in migrated.skillMastery && !('py_skill_2_4' in migrated.skillMastery)) {
      migrated.skillMastery['py_skill_2_4'] = migrated.skillMastery['py_skill_1_4'];
    }
    if ('py_skill_1_5' in migrated.skillMastery && !('py_skill_4_1' in migrated.skillMastery)) {
      migrated.skillMastery['py_skill_4_1'] = migrated.skillMastery['py_skill_1_5'];
    }
    if ('py_skill_1_6' in migrated.skillMastery && !('py_skill_2_7' in migrated.skillMastery)) {
      migrated.skillMastery['py_skill_2_7'] = migrated.skillMastery['py_skill_1_6'];
    }
  }

  migrated._version = 3;
  migrated._curriculumVersion = 2;
  return migrated;
}

console.log('======================================================');
console.log('   MASTERY MODEL & V3 MIGRATION UNIT TEST SUITE       ');
console.log('======================================================\n');

let passedCount = 0;
function test(name, fn) {
  try {
    fn();
    console.log(`  ✅ PASS: ${name}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(err);
    process.exit(1);
  }
}

// --- SECTION 1: MASTERY SCORING EVALUATION ---
console.log('--- SECTION 1: MASTERY SCORING MODEL ---');

test('1. Flawless 100% first-try accuracy yields 100 score and 5 pips', () => {
  const res = evaluateAttempt({ firstAttemptCorrectCount: 10, totalQuestions: 10, hintsUsed: 0, unresolvedMistakesCount: 0 });
  assert.strictEqual(res.score, 100);
  assert.strictEqual(res.pips, 5);
});

test('2. 7 of 10 correct with 2 hints yields 60 score and 3 pips', () => {
  // 70% base - (2 * 5) = 60 -> 3 pips
  const res = evaluateAttempt({ firstAttemptCorrectCount: 7, totalQuestions: 10, hintsUsed: 2, unresolvedMistakesCount: 0 });
  assert.strictEqual(res.score, 60);
  assert.strictEqual(res.pips, 3);
});

test('3. Poor accuracy (2 of 10) with 2 hints yields 10 score and 0 pips (Needs Practice)', () => {
  // 20% base - 10 = 10 -> 0 pips (<20)
  const res = evaluateAttempt({ firstAttemptCorrectCount: 2, totalQuestions: 10, hintsUsed: 2, unresolvedMistakesCount: 0 });
  assert.strictEqual(res.score, 10);
  assert.strictEqual(res.pips, 0);
});

test('4. Unresolved mistakes apply correct penalty', () => {
  // 8 of 10 = 80%. 1 unresolved mistake (-5) -> 75% -> 4 pips
  const res = evaluateAttempt({ firstAttemptCorrectCount: 8, totalQuestions: 10, hintsUsed: 0, unresolvedMistakesCount: 1 });
  assert.strictEqual(res.score, 75);
  assert.strictEqual(res.pips, 4);
});

test('5. Extreme penalties clamp to 0 and do not return negative score', () => {
  const res = evaluateAttempt({ firstAttemptCorrectCount: 0, totalQuestions: 10, hintsUsed: 5, unresolvedMistakesCount: 5 });
  assert.strictEqual(res.score, 0);
  assert.strictEqual(res.pips, 0);
});

test('6. Mastery score is strictly non-decreasing on lesson replay', () => {
  const initialPips = 4;
  const poorReplayPips = 1;
  const result = updateSkillMastery(initialPips, poorReplayPips);
  assert.strictEqual(result, 4, 'Mastery should retain the best score (4) instead of dropping to 1');
});

test('7. Mastery score increases when learner performs better on practice', () => {
  const initialPips = 2;
  const improvedReplayPips = 5;
  const result = updateSkillMastery(initialPips, improvedReplayPips);
  assert.strictEqual(result, 5, 'Mastery should upgrade from 2 to 5');
});

// --- SECTION 2: STORAGE MIGRATION ---
console.log('\n--- SECTION 2: V3 STORAGE MIGRATION ---');

const dummyInitial = {
  userId: 'usr_test',
  name: 'Learner',
  totalXp: 0,
  streak: 0,
  completedSkillIds: [],
  completedLessonIds: [],
  skillMastery: {},
  mistakes: []
};

test('8. Legacy progress with hardcoded 5-pip scores migrates to UNKNOWN_MASTERY_PIPS (-1)', () => {
  const legacyBlob = {
    userId: 'usr_existing',
    totalXp: 450,
    streak: 3,
    completedSkillIds: ['py_skill_1_1', 'py_skill_1_2'],
    completedLessonIds: ['1.1', '1.2', '1.3'],
    skillMastery: {
      'py_skill_1_1': 5,
      'py_skill_1_2': 5
    },
    mistakes: [],
    _curriculumVersion: 2
  };

  const migrated = migrateProgressData(legacyBlob, dummyInitial);
  assert.strictEqual(migrated.totalXp, 450, 'Preserves total XP');
  assert.strictEqual(migrated.streak, 3, 'Preserves streak');
  assert.deepStrictEqual(migrated.completedSkillIds, ['py_skill_1_1', 'py_skill_1_2']);
  assert.deepStrictEqual(migrated.completedLessonIds, ['1.1', '1.2', '1.3']);
  assert.strictEqual(migrated.skillMastery['py_skill_1_1'], UNKNOWN_MASTERY_PIPS, 'Re-labels legacy 5 to unknown');
  assert.strictEqual(migrated.skillMastery['py_skill_1_2'], UNKNOWN_MASTERY_PIPS, 'Re-labels legacy 5 to unknown');
  assert.strictEqual(migrated._version, 3);
});

test('9. Replaying an unknown mastery skill calibrates with real pips', () => {
  const currentUnknownPips = UNKNOWN_MASTERY_PIPS;
  const newAttemptPips = 3;
  const rescored = updateSkillMastery(currentUnknownPips, newAttemptPips);
  assert.strictEqual(rescored, 3, 'Unknown mastery successfully replaces with real pips');
});

test('10. V3 progress with genuine calibrated scores passes through untouched', () => {
  const v3Blob = {
    _version: 3,
    _curriculumVersion: 2,
    userId: 'usr_v3',
    totalXp: 800,
    completedSkillIds: ['py_skill_1_1'],
    skillMastery: {
      'py_skill_1_1': 4
    }
  };

  const migrated = migrateProgressData(v3Blob, dummyInitial);
  assert.strictEqual(migrated.skillMastery['py_skill_1_1'], 4, 'Genuine score 4 is preserved');
  assert.strictEqual(migrated._curriculumVersion, 2);
});

// --- SECTION 3: CURRICULUM RE-MAPPING MIGRATION ---
console.log('\n--- SECTION 3: CURRICULUM MIGRATION ---');

test('11. Legacy foundations progress with 1.7-1.10 re-maps to canonical Units 3 and 5', () => {
  const legacyFoundationsBlob = {
    userId: 'usr_legacy_foundations',
    totalXp: 320,
    streak: 4,
    currentSkillId: 'py_skill_1_7',
    completedLessonIds: ['1.1', '1.2', '1.7'],
    completedSkillIds: ['py_skill_1_1', 'py_skill_1_2', 'py_skill_1_7'],
    skillMastery: {
      'py_skill_1_1': 5,
      'py_skill_1_2': 5,
      'py_skill_1_7': 4
    }
  };

  const migrated = migrateProgressData(legacyFoundationsBlob, dummyInitial);
  assert.strictEqual(migrated.totalXp, 320, 'Preserves total XP');
  assert.strictEqual(migrated.streak, 4, 'Preserves streak');
  
  // Lesson 1.7 must be removed and replaced with canonical 3.4 (Comparison Operators)
  assert.ok(!migrated.completedLessonIds.includes('1.7'), 'Legacy 1.7 must be removed');
  assert.ok(migrated.completedLessonIds.includes('3.4'), 'Canonical 3.4 must be added');
  // Lesson 1.2 (Variables) also grants canonical 2.1
  assert.ok(migrated.completedLessonIds.includes('2.1'), 'Canonical 2.1 (Variables) must be added');
  
  // Skill py_skill_1_7 must be removed and mapped to py_skill_3_4
  assert.ok(!migrated.completedSkillIds.includes('py_skill_1_7'), 'Legacy py_skill_1_7 must be removed');
  assert.ok(migrated.completedSkillIds.includes('py_skill_3_4'), 'Canonical py_skill_3_4 must be added');
  assert.ok(migrated.completedSkillIds.includes('py_skill_2_1'), 'Canonical py_skill_2_1 must be added');
  
  // currentSkillId must be retargeted from py_skill_1_7 to py_skill_3_4
  assert.strictEqual(migrated.currentSkillId, 'py_skill_3_4', 'currentSkillId must be retargeted to py_skill_3_4');
  
  // Mastery of py_skill_1_7 moved to py_skill_3_4
  assert.strictEqual(migrated.skillMastery['py_skill_3_4'], 4, 'Mastery moved to py_skill_3_4');
  assert.strictEqual(migrated.skillMastery['py_skill_1_7'], undefined, 'Old skill key removed');

  assert.strictEqual(migrated._curriculumVersion, 2, 'Curriculum version tagged as 2');
  assert.strictEqual(migrated._version, 3, 'Schema version tagged as 3');
});

test('12. Full foundations completion (lesson 1.10) credits canonical Unit 1 entirely', () => {
  const fullFoundationsBlob = {
    userId: 'usr_graduate',
    totalXp: 1200,
    currentSkillId: 'py_skill_1_10',
    completedLessonIds: ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10'],
    completedSkillIds: [
      'py_skill_1_1', 'py_skill_1_2', 'py_skill_1_3', 'py_skill_1_4', 'py_skill_1_5',
      'py_skill_1_6', 'py_skill_1_7', 'py_skill_1_8', 'py_skill_1_9', 'py_skill_1_10'
    ]
  };

  const migrated = migrateProgressData(fullFoundationsBlob, dummyInitial);
  // Entire canonical Unit 1 must be marked complete
  ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'].forEach(id => {
    assert.ok(migrated.completedLessonIds.includes(id), `Canonical lesson ${id} must be completed`);
  });
  // Cross-unit canonical lessons must also be credited
  ['2.1', '2.4', '2.7', '3.1', '3.4', '3.5', '4.1', '5.1', '5.6'].forEach(id => {
    assert.ok(migrated.completedLessonIds.includes(id), `Canonical lesson ${id} must be completed`);
  });

  // Legacy invalid IDs removed
  assert.ok(!migrated.completedLessonIds.includes('1.7'));
  assert.ok(!migrated.completedLessonIds.includes('1.8'));
  assert.ok(!migrated.completedLessonIds.includes('1.9'));
  assert.ok(!migrated.completedLessonIds.includes('1.10'));

  // Skills
  assert.ok(!migrated.completedSkillIds.includes('py_skill_1_7'));
  assert.ok(!migrated.completedSkillIds.includes('py_skill_1_10'));
  assert.ok(migrated.completedSkillIds.includes('py_skill_5_6'));
  assert.strictEqual(migrated.currentSkillId, 'py_skill_5_6');
});

console.log(`\n======================================================`);
console.log(`   ALL ${passedCount} MASTERY & MIGRATION TESTS PASSED!`);
console.log(`======================================================\n`);
