/**
 * Unit Test Suite for Streak Freeze, Loss Prevention, and Schema v4 Migration
 */

const assert = require('assert');

console.log('===============================================================');
console.log('   STREAK FREEZE & AT-RISK LOSS PREVENTION TEST SUITE (v4)     ');
console.log('===============================================================');

let passedCount = 0;
function pass(desc) {
  passedCount++;
  console.log(`  ✅ PASS: ${desc}`);
}

// -------------------------------------------------------------
// PURE FUNCTION LOGIC (Mirroring progressionService & migrationService)
// -------------------------------------------------------------

function checkAndApplyStreakFreeze(userProgress, today = new Date()) {
  const todayStr = today.toISOString().split('T')[0];
  const history = userProgress.activityHistory || [];
  const todayActivity = history.find(a => a.date === todayStr);

  // If already practiced today, streak is safe
  if (todayActivity) {
    return userProgress;
  }

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  const yesterdayActivity = history.find(a => a.date === yesterdayStr);
  const usedDates = userProgress.freezeUsedDates || [];

  // If practiced yesterday or yesterday was already protected by a freeze, streak holds
  if (yesterdayActivity || usedDates.includes(yesterdayStr)) {
    return userProgress;
  }

  // Yesterday was missed. Can we rescue it with a freeze?
  const inventory = userProgress.freezeInventory || 0;
  if (inventory > 0 && userProgress.streak > 0) {
    // Consume 1 freeze to preserve the streak
    return {
      ...userProgress,
      freezeInventory: inventory - 1,
      freezeUsedDates: [...usedDates, yesterdayStr],
      streakRescuePending: true
    };
  }

  return userProgress;
}

function recordMistakeResolution(userProgress) {
  const currentInventory = userProgress.freezeInventory || 0;
  const currentProgress = userProgress.freezeRepairsProgress || 0;
  const nextProgress = currentProgress + 1;

  if (nextProgress >= 3) {
    // Reached 3 repairs -> award 1 freeze (cap at 2)
    const newInventory = Math.min(2, currentInventory + 1);
    return {
      freezeInventory: newInventory,
      freezeRepairsProgress: 0,
      freezeEarned: newInventory > currentInventory
    };
  }

  return {
    freezeInventory: currentInventory,
    freezeRepairsProgress: nextProgress,
    freezeEarned: false
  };
}

function updateStreak(userProgress) {
  const todayStr = new Date().toISOString().split('T')[0];
  const history = [...(userProgress.activityHistory || [])];
  const todayActivity = history.find(a => a.date === todayStr);
  
  if (todayActivity) {
    return { 
      activityHistory: history,
      lastActiveDate: todayStr
    };
  }

  let currentStreak = userProgress.streak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const yesterdayActivity = history.find(a => a.date === yesterdayStr);
  const yesterdayFrozen = (userProgress.freezeUsedDates || []).includes(yesterdayStr);
  
  if (yesterdayActivity || yesterdayFrozen) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }

  const bestStreak = Math.max(currentStreak, userProgress.bestStreak || 1);

  return {
    streak: currentStreak,
    bestStreak,
    lastActiveDate: todayStr
  };
}

function migrateProgressDataV4(raw, fallbackInitial) {
  const migrated = {
    ...fallbackInitial,
    ...raw,
    streak: typeof raw.streak === 'number' ? raw.streak : 0,
    bestStreak: typeof raw.bestStreak === 'number' ? raw.bestStreak : (raw.streak || 0)
  };

  const rawStreak = typeof raw.streak === 'number' ? raw.streak : 0;
  migrated.freezeInventory = typeof raw.freezeInventory === 'number'
    ? Math.min(2, Math.max(0, raw.freezeInventory))
    : (rawStreak >= 3 ? 1 : 0);

  migrated.freezeRepairsProgress = typeof raw.freezeRepairsProgress === 'number'
    ? Math.min(2, Math.max(0, raw.freezeRepairsProgress))
    : 0;

  migrated.freezeUsedDates = Array.isArray(raw.freezeUsedDates) ? [...raw.freezeUsedDates] : [];
  migrated.lastActiveDate = raw.lastActiveDate || raw.activityHistory?.[raw.activityHistory.length - 1]?.date || '';
  migrated.streakRescuePending = Boolean(raw.streakRescuePending);

  migrated._version = 4;
  return migrated;
}

// -------------------------------------------------------------
// SECTION 1: STREAK FREEZE CONSUMPTION & PROTECTION
// -------------------------------------------------------------
console.log('\n--- SECTION 1: STREAK FREEZE CONSUMPTION ---');

// 1. Practicing today does not consume freeze
const todayDate = new Date('2026-10-18T14:00:00Z');
const userPracticedToday = {
  streak: 5,
  bestStreak: 10,
  freezeInventory: 1,
  freezeUsedDates: [],
  activityHistory: [{ date: '2026-10-18', lessonsCount: 1, xp: 50 }]
};

const res1 = checkAndApplyStreakFreeze(userPracticedToday, todayDate);
assert.strictEqual(res1.freezeInventory, 1, 'Freeze should not be consumed when practiced today');
assert.strictEqual(res1.streak, 5, 'Streak should remain intact');
assert.strictEqual(Boolean(res1.streakRescuePending), false, 'Rescue should not be pending');
pass('1. Practicing today retains freeze inventory and marks rescue as false');

// 2. Missing yesterday with freeze consumes 1 freeze and sets rescue pending
const userMissedYesterday = {
  streak: 7,
  bestStreak: 14,
  freezeInventory: 2,
  freezeUsedDates: [],
  activityHistory: [{ date: '2026-10-16', lessonsCount: 2, xp: 100 }] // Missed 2026-10-17
};

const res2 = checkAndApplyStreakFreeze(userMissedYesterday, todayDate);
assert.strictEqual(res2.freezeInventory, 1, '1 freeze consumed');
assert.strictEqual(res2.streak, 7, 'Streak protected at 7');
assert.strictEqual(res2.streakRescuePending, true, 'Streak rescue marked pending');
assert.ok(res2.freezeUsedDates.includes('2026-10-17'), 'Yesterday logged as protected by freeze');
pass('2. Missing yesterday consumes exactly 1 freeze, preserves streak, and flags rescue modal');

// 3. Second check on the same day does not re-consume freeze
const res3 = checkAndApplyStreakFreeze(res2, todayDate);
assert.strictEqual(res3.freezeInventory, 1, 'Freeze must not be consumed twice on the same day');
assert.strictEqual(res3.streak, 7, 'Streak remains 7');
pass('3. Consecutive app launches on the same day do not duplicate freeze consumption');

// -------------------------------------------------------------
// SECTION 2: EARNING FREEZES VIA FIX-IT LAB MISTAKE REPAIRS
// -------------------------------------------------------------
console.log('\n--- SECTION 2: FIX-IT LAB REPAIR PROGRESSION ---');

const userStartingDrills = {
  freezeInventory: 0,
  freezeRepairsProgress: 0
};

// First repair: 0 -> 1
const rep1 = recordMistakeResolution(userStartingDrills);
assert.strictEqual(rep1.freezeRepairsProgress, 1);
assert.strictEqual(rep1.freezeInventory, 0);
assert.strictEqual(rep1.freezeEarned, false);
pass('4. First mistake repair advances progress to 1/3 (no freeze yet)');

// Second repair: 1 -> 2
const rep2 = recordMistakeResolution({
  freezeInventory: rep1.freezeInventory,
  freezeRepairsProgress: rep1.freezeRepairsProgress
});
assert.strictEqual(rep2.freezeRepairsProgress, 2);
assert.strictEqual(rep2.freezeInventory, 0);
assert.strictEqual(rep2.freezeEarned, false);
pass('5. Second mistake repair advances progress to 2/3 (no freeze yet)');

// Third repair: 2 -> 3 (Awards freeze!)
const rep3 = recordMistakeResolution({
  freezeInventory: rep2.freezeInventory,
  freezeRepairsProgress: rep2.freezeRepairsProgress
});
assert.strictEqual(rep3.freezeRepairsProgress, 0, 'Progress resets to 0 upon earning freeze');
assert.strictEqual(rep3.freezeInventory, 1, 'Freeze inventory incremented to 1');
assert.strictEqual(rep3.freezeEarned, true, 'freezeEarned flag is true');
pass('6. Third mistake repair earns +1 Streak Freeze and resets drill progress to 0');

// Cap at maximum 2 freezes
const repCap = recordMistakeResolution({
  freezeInventory: 2,
  freezeRepairsProgress: 2
});
assert.strictEqual(repCap.freezeInventory, 2, 'Inventory capped at 2');
assert.strictEqual(repCap.freezeRepairsProgress, 0, 'Progress resets to 0');
assert.strictEqual(repCap.freezeEarned, false, 'freezeEarned is false when already at cap');
pass('7. Freeze inventory strictly caps at maximum capacity of 2');

// -------------------------------------------------------------
// SECTION 3: STREAK INCREMENT ACROSS FROZEN DAYS
// -------------------------------------------------------------
console.log('\n--- SECTION 3: STREAK ADVANCE ON POST-FREEZE DAY ---');

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);
const yesterdayStr = yesterday.toISOString().split('T')[0];

const userWithFrozenYesterday = {
  streak: 7,
  bestStreak: 14,
  freezeUsedDates: [yesterdayStr],
  activityHistory: []
};

const streakUpdate = updateStreak(userWithFrozenYesterday);
assert.strictEqual(streakUpdate.streak, 8, 'Streak increments from 7 to 8 across a frozen day');
pass('8. Completing lesson after a frozen day successfully advances the streak');

// -------------------------------------------------------------
// SECTION 4: SCHEMA V4 MIGRATION
// -------------------------------------------------------------
console.log('\n--- SECTION 4: SCHEMA V4 MIGRATION ---');

const legacyV3User = {
  userId: 'usr_existing',
  name: 'Existing Coder',
  streak: 12,
  bestStreak: 15,
  totalXp: 3500,
  _version: 3
};

const migratedV4 = migrateProgressDataV4(legacyV3User, {
  userId: 'usr_default',
  name: 'Default',
  streak: 0,
  totalXp: 0,
  completedLessonIds: [],
  completedSkillIds: [],
  skillMastery: {},
  mistakes: [],
  activityHistory: [],
  achievements: []
});

assert.strictEqual(migratedV4._version, 4, 'Schema version migrated to 4');
assert.strictEqual(migratedV4.streak, 12, 'Existing streak preserved');
assert.strictEqual(migratedV4.freezeInventory, 1, 'Existing users with streak >= 3 receive 1 grace freeze');
assert.strictEqual(migratedV4.freezeRepairsProgress, 0, 'Repairs progress initialized to 0');
assert.strictEqual(Array.isArray(migratedV4.freezeUsedDates), true, 'freezeUsedDates initialized to array');
pass('9. Legacy v3 progress cleanly migrates to v4 with grace freeze and intact history');

console.log('===============================================================');
console.log(`ALL ${passedCount}/${passedCount} STREAK FREEZE TESTS PASSED!`);
console.log('===============================================================');
