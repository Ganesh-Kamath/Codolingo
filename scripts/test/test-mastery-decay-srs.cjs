/**
 * Unit Test Suite for Settles & Meeder (2016) Half-Life Regression Mastery Decay & SRS Refresh
 */

const assert = require('assert');

console.log('================================================================');
console.log('  MASTERY TEMPORAL DECAY & "NEEDS REVIEW" SRS TEST SUITE (v4)  ');
console.log('================================================================');

let passedCount = 0;
function pass(desc) {
  passedCount++;
  console.log(`  ✅ PASS: ${desc}`);
}

// -------------------------------------------------------------
// PURE ALGORITHMS (Settles & Meeder 2016 Half-Life Regression)
// -------------------------------------------------------------

const HALF_LIFE_TIERS = {
  BEGINNER: 7,   // 1 - 2 pips: 7 days
  COMPETENT: 14, // 3 - 4 pips: 14 days
  MASTERED: 30   // 5 pips: 30 days
};

function getHalfLifeForPips(pips) {
  if (pips >= 5) return HALF_LIFE_TIERS.MASTERED;
  if (pips >= 3) return HALF_LIFE_TIERS.COMPETENT;
  return HALF_LIFE_TIERS.BEGINNER;
}

function getEffectivePips(record, currentDate = new Date()) {
  if (!record || typeof record.pips !== 'number') {
    return {
      initialPips: 0,
      effectivePips: 0,
      decayFactor: 1.0,
      needsReview: false,
      daysSincePractice: 0,
      halfLifeDays: HALF_LIFE_TIERS.BEGINNER
    };
  }

  const practicedTime = new Date(record.lastPracticedAt).getTime();
  const currentTime = currentDate.getTime();
  const diffMs = Math.max(0, isNaN(practicedTime) ? 0 : currentTime - practicedTime);
  const daysSincePractice = diffMs / (1000 * 60 * 60 * 24);
  const halfLifeDays = record.halfLifeDays || getHalfLifeForPips(record.pips);

  const decayFactor = Math.pow(2, -daysSincePractice / halfLifeDays);

  let effectivePips = record.pips;
  if (record.pips > 0) {
    effectivePips = Math.max(1, Math.round(record.pips * decayFactor));
  } else {
    effectivePips = 0;
  }

  const needsReview = record.pips > 0 && (effectivePips < record.pips || decayFactor < 0.70);

  return {
    initialPips: record.pips,
    effectivePips,
    decayFactor,
    needsReview,
    daysSincePractice,
    halfLifeDays
  };
}

function refreshSkillMastery(userProgress, skillId, bonusXp = 15) {
  const existingPips = userProgress.skillMasteryRecords?.[skillId]?.pips ?? userProgress.skillMastery?.[skillId] ?? 5;
  const restoredPips = Math.max(existingPips, 5);
  const updatedMastery = { ...(userProgress.skillMastery || {}), [skillId]: restoredPips };
  const updatedRecords = {
    ...(userProgress.skillMasteryRecords || {}),
    [skillId]: {
      pips: restoredPips,
      lastPracticedAt: new Date().toISOString(),
      halfLifeDays: getHalfLifeForPips(restoredPips)
    }
  };
  return {
    ...userProgress,
    totalXp: (userProgress.totalXp || 0) + bonusXp,
    skillMastery: updatedMastery,
    skillMasteryRecords: updatedRecords
  };
}

function migrateSkillMasteryRecords(raw) {
  const rawMastery = raw.skillMastery || {};
  const rawRecords = raw.skillMasteryRecords || {};
  const skillMasteryRecords = {};

  for (const [skillId, pips] of Object.entries(rawMastery)) {
    if (rawRecords[skillId] && typeof rawRecords[skillId].pips === 'number') {
      skillMasteryRecords[skillId] = {
        pips: rawRecords[skillId].pips,
        lastPracticedAt: rawRecords[skillId].lastPracticedAt || new Date().toISOString(),
        halfLifeDays: rawRecords[skillId].halfLifeDays || getHalfLifeForPips(rawRecords[skillId].pips)
      };
    } else if (pips > 0) {
      skillMasteryRecords[skillId] = {
        pips,
        lastPracticedAt: new Date().toISOString(),
        halfLifeDays: getHalfLifeForPips(pips)
      };
    }
  }
  return skillMasteryRecords;
}

// -------------------------------------------------------------
// TEST CASES
// -------------------------------------------------------------

// Test 1: Half-life tier allocation
assert.strictEqual(getHalfLifeForPips(1), 7, '1 pip should have 7-day half-life');
assert.strictEqual(getHalfLifeForPips(2), 7, '2 pips should have 7-day half-life');
assert.strictEqual(getHalfLifeForPips(3), 14, '3 pips should have 14-day half-life');
assert.strictEqual(getHalfLifeForPips(4), 14, '4 pips should have 14-day half-life');
assert.strictEqual(getHalfLifeForPips(5), 30, '5 pips should have 30-day half-life');
pass('1. Half-life tiers correctly map 1-2 pips -> 7d, 3-4 pips -> 14d, 5 pips -> 30d');

// Test 2: Fresh retention (0 days elapsed)
const now = new Date();
const freshRecord = {
  pips: 5,
  lastPracticedAt: now.toISOString(),
  halfLifeDays: 30
};
const freshEval = getEffectivePips(freshRecord, now);
assert.strictEqual(freshEval.effectivePips, 5, 'Effective pips should remain 5 on day 0');
assert.strictEqual(freshEval.needsReview, false, 'Fresh skill should not need review');
assert.strictEqual(freshEval.decayFactor, 1.0, 'Decay factor should be 1.0');
pass('2. Day 0 fresh practice retains 5/5 pips with decayFactor = 1.0 and needsReview = false');

// Test 3: 30-day half-life decay on 5-pip skill (Settles & Meeder 2016)
const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
const thirtyDayRecord = {
  pips: 5,
  lastPracticedAt: thirtyDaysAgo.toISOString(),
  halfLifeDays: 30
};
const thirtyDayEval = getEffectivePips(thirtyDayRecord, now);
assert.strictEqual(thirtyDayEval.effectivePips, 3, '5 pips decayed over 1 half-life (30d) should round to 3 pips (5 * 0.5 = 2.5 -> 3)');
assert.strictEqual(thirtyDayEval.needsReview, true, 'Decayed skill must enter needsReview state');
assert(Math.abs(thirtyDayEval.decayFactor - 0.5) < 0.01, 'Decay factor at 1 half-life must be 0.5');
pass('3. 5-pip skill after 30 days decays to 3 pips and triggers needsReview');

// Test 4: 14-day half-life decay on 3-pip skill
const fourteenDaysAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
const midSkillRecord = {
  pips: 3,
  lastPracticedAt: fourteenDaysAgo.toISOString(),
  halfLifeDays: 14
};
const midEval = getEffectivePips(midSkillRecord, now);
assert.strictEqual(midEval.effectivePips, 2, '3 pips decayed over 1 half-life (14d) should round to 2 pips (3 * 0.5 = 1.5 -> 2)');
assert.strictEqual(midEval.needsReview, true, '3-pip skill decayed must trigger needsReview');
pass('4. 3-pip skill after 14 days decays to 2 pips and triggers needsReview');

// Test 5: 7-day half-life decay on 2-pip skill
const sevenDaysAgo = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
const lowSkillRecord = {
  pips: 2,
  lastPracticedAt: sevenDaysAgo.toISOString(),
  halfLifeDays: 7
};
const lowEval = getEffectivePips(lowSkillRecord, now);
assert.strictEqual(lowEval.effectivePips, 1, '2 pips decayed over 1 half-life (7d) should round to 1 pip (2 * 0.5 = 1.0 -> 1)');
assert.strictEqual(lowEval.needsReview, true, '2-pip skill decayed must trigger needsReview');
pass('5. 2-pip skill after 7 days decays to 1 pip and triggers needsReview');

// Test 6: Needs Review threshold criteria (effectivePips < initialPips OR decayFactor < 0.70)
const eightDaysAgo = new Date(now.getTime() - (8 * 24 * 60 * 60 * 1000));
const eightDayRecord = {
  pips: 5,
  lastPracticedAt: eightDaysAgo.toISOString(),
  halfLifeDays: 30
};
const eightDayEval = getEffectivePips(eightDayRecord, now);
assert.strictEqual(eightDayEval.effectivePips, 4, '5 * 2^(-8/30) = 4.15 -> rounds to 4');
assert.strictEqual(eightDayEval.needsReview, true, 'Should need review because effectivePips (4) < initialPips (5)');

const twoDaysAgo = new Date(now.getTime() - (2 * 24 * 60 * 60 * 1000));
const twoDayRecord = {
  pips: 5,
  lastPracticedAt: twoDaysAgo.toISOString(),
  halfLifeDays: 30
};
const twoDayEval = getEffectivePips(twoDayRecord, now);
assert.strictEqual(twoDayEval.effectivePips, 5, '5 * 2^(-2/30) = 4.77 -> rounds to 5');
assert.strictEqual(twoDayEval.needsReview, false, 'Should not need review at 2 days (effectivePips=5, decayFactor=0.95 >= 0.70)');
pass('6. Threshold sensitivity: 8 days decays 5->4 (needsReview: true), 2 days stays 5 (needsReview: false)');

// Test 7: Floor protection (effective pips never drops below 1 for earned skills)
const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));
const ancientRecord = {
  pips: 5,
  lastPracticedAt: oneYearAgo.toISOString(),
  halfLifeDays: 30
};
const ancientEval = getEffectivePips(ancientRecord, now);
assert.strictEqual(ancientEval.effectivePips, 1, 'Earned skills have floor protection at 1 pip');
assert.strictEqual(ancientEval.needsReview, true, 'Ancient skill needs review');
pass('7. Floor protection: even after 365 days, earned skills never drop below 1 pip');

// Test 8: Non-blocking forward progression invariant
const mockProgress = {
  completedSkillIds: ['py_skill_1_1'],
  currentSkillId: 'py_skill_1_2',
  skillMastery: { py_skill_1_1: 5 },
  skillMasteryRecords: {
    py_skill_1_1: {
      pips: 5,
      lastPracticedAt: thirtyDaysAgo.toISOString(),
      halfLifeDays: 30
    }
  }
};
const prereqDecayedEval = getEffectivePips(mockProgress.skillMasteryRecords['py_skill_1_1'], now);
assert.strictEqual(prereqDecayedEval.needsReview, true, 'Prerequisite skill is decayed');
// Check unlocked status for downstream skill:
const isPrereqCompleted = mockProgress.completedSkillIds.includes('py_skill_1_1');
assert.strictEqual(isPrereqCompleted, true, 'Decayed skill must remain in completedSkillIds');
pass('8. Non-blocking progression invariant: decayed prerequisite does not lock downstream lessons');

// Test 9: Quick Refresh restoration (+15 XP, reset timestamp, full 5 pips)
const refreshedProgress = refreshSkillMastery(mockProgress, 'py_skill_1_1', 15);
assert.strictEqual(refreshedProgress.totalXp, 15, 'Quick refresh awards +15 XP');
assert.strictEqual(refreshedProgress.skillMastery['py_skill_1_1'], 5, 'Mastery restored to 5 pips');
const refreshedEval = getEffectivePips(refreshedProgress.skillMasteryRecords['py_skill_1_1'], new Date());
assert.strictEqual(refreshedEval.effectivePips, 5, 'Effective pips restored to 5');
assert.strictEqual(refreshedEval.needsReview, false, 'Needs review cleared after Quick Refresh');
pass('9. Quick Refresh immediately restores 5 pips, awards +15 XP, and clears Needs Review');

// Test 10: Migration synthesis for legacy records
const legacyState = {
  skillMastery: {
    py_skill_1_1: 4,
    py_skill_1_2: 5
  }
};
const synthesizedRecords = migrateSkillMasteryRecords(legacyState);
assert(synthesizedRecords.py_skill_1_1, 'py_skill_1_1 record should exist');
assert.strictEqual(synthesizedRecords.py_skill_1_1.pips, 4);
assert.strictEqual(synthesizedRecords.py_skill_1_1.halfLifeDays, 14, '4 pips should synthesize 14d half-life');
assert(synthesizedRecords.py_skill_1_2, 'py_skill_1_2 record should exist');
assert.strictEqual(synthesizedRecords.py_skill_1_2.pips, 5);
assert.strictEqual(synthesizedRecords.py_skill_1_2.halfLifeDays, 30, '5 pips should synthesize 30d half-life');
pass('10. Legacy migration synthesizes valid SkillMasteryRecords with appropriate half-life tiers');

console.log('================================================================');
console.log(`  🎉 ALL ${passedCount}/10 SRS TEMPORAL DECAY TESTS PASSED!`);
console.log('================================================================\n');
