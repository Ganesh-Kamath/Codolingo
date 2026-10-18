import { UserProgressState } from '../types';
import { UNKNOWN_MASTERY_PIPS } from '../constants/mastery';

export const CURRENT_STORAGE_KEY = 'codolingo_progress_v4';

export const LEGACY_STORAGE_KEYS = [
  'codolingo_progress_v3',
  'codolingo_progress_v2',
  'codolingo_python_curriculum_v1',
  'codolingo_progress_v1',
  'codon_progress_v1'
] as const;

/**
 * Pure function that migrates any older user progress object to the v3 schema.
 * Re-labels legacy hardcoded 5-pip skills without real attempt history to UNKNOWN_MASTERY_PIPS (-1).
 */
export function migrateProgressData(raw: any, fallbackInitial: UserProgressState): UserProgressState {
  if (!raw || typeof raw !== 'object') {
    return fallbackInitial;
  }

  const migrated: UserProgressState = {
    ...fallbackInitial,
    ...raw,
    // Ensure all required core fields exist
    userId: raw.userId || fallbackInitial.userId,
    name: raw.name || fallbackInitial.name || 'Learner',
    username: raw.username || fallbackInitial.username || 'learner',
    avatarUrl: raw.avatarUrl || fallbackInitial.avatarUrl || '',
    activeCourseId: raw.activeCourseId || 'python',
    streak: typeof raw.streak === 'number' ? raw.streak : 0,
    bestStreak: typeof raw.bestStreak === 'number' ? raw.bestStreak : (raw.streak || 0),
    level: typeof raw.level === 'number' ? raw.level : 1,
    totalXp: typeof raw.totalXp === 'number' ? raw.totalXp : 0,
    energy: typeof raw.energy === 'number' ? raw.energy : 5,
    maxEnergy: typeof raw.maxEnergy === 'number' ? raw.maxEnergy : 5,
    dailyGoalXp: typeof raw.dailyGoalXp === 'number' ? raw.dailyGoalXp : 20,
    dailyGoalEarnedXp: typeof raw.dailyGoalEarnedXp === 'number' ? raw.dailyGoalEarnedXp : 0,
    completedSkillIds: Array.isArray(raw.completedSkillIds) ? [...raw.completedSkillIds] : [],
    currentSkillId: raw.currentSkillId || fallbackInitial.currentSkillId,
    completedLessonIds: Array.isArray(raw.completedLessonIds) ? [...raw.completedLessonIds] : [],
    mistakes: Array.isArray(raw.mistakes) ? [...raw.mistakes] : [],
    activityHistory: Array.isArray(raw.activityHistory) ? [...raw.activityHistory] : [],
    achievements: Array.isArray(raw.achievements) ? [...raw.achievements] : fallbackInitial.achievements,
    dailyGoal: raw.dailyGoal || {
      lessonsTarget: 2,
      lessonsCompleted: 0,
      xpTarget: raw.dailyGoalXp || 20,
      xpEarned: raw.dailyGoalEarnedXp || 0
    },
    skillMastery: {}
  };

  // Skill Mastery Migration:
  // If raw has skillMastery, examine each skill.
  // In legacy v1/v2, skills were hardcoded to 5 upon completion with no attempt stats.
  // Re-label these 5s to UNKNOWN_MASTERY_PIPS (-1) so they display as "Completed, mastery unknown"
  // and will be re-scored properly on next practice.
  const rawMastery = raw.skillMastery || {};
  const isLegacyVersion = !raw._version || raw._version < 3;

  for (const skillId of migrated.completedSkillIds) {
    const rawScore = rawMastery[skillId];
    if (isLegacyVersion && (rawScore === 5 || rawScore === undefined)) {
      // Legacy hardcoded 5-pip score -> mark as unknown mastery
      migrated.skillMastery[skillId] = UNKNOWN_MASTERY_PIPS;
    } else if (typeof rawScore === 'number') {
      migrated.skillMastery[skillId] = rawScore;
    } else {
      migrated.skillMastery[skillId] = UNKNOWN_MASTERY_PIPS;
    }
  }

  // Preserve any other skill keys
  for (const [k, v] of Object.entries(rawMastery)) {
    if (migrated.skillMastery[k] === undefined && typeof v === 'number') {
      migrated.skillMastery[k] = isLegacyVersion && v === 5 ? UNKNOWN_MASTERY_PIPS : v;
    }
  }

  // Curriculum Migration:
  // If raw was saved under legacy foundations curriculum (_curriculumVersion < 2),
  // remap the 10-lesson foundations structure to canonical Units 1-6.
  const isLegacyCurriculum = !raw._curriculumVersion || raw._curriculumVersion < 2;

  if (isLegacyCurriculum) {
    const oldLessonIds = new Set(migrated.completedLessonIds);
    const newLessonIds = new Set(migrated.completedLessonIds);

    // Check if user completed the old foundations final challenge or lesson 10
    const finishedFoundations = oldLessonIds.has('1.10') || 
                                migrated.completedSkillIds.includes('py_skill_1_10') ||
                                oldLessonIds.has('unit_01_final') ||
                                oldLessonIds.has('final_challenge_01');

    // 1. Remap lessons
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
      // Credit entire canonical Unit 1
      ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6'].forEach(id => newLessonIds.add(id));
    }

    migrated.completedLessonIds = Array.from(newLessonIds);

    // 2. Remap skills
    const oldSkillIds = new Set(migrated.completedSkillIds);
    const newSkillIds = new Set(migrated.completedSkillIds);

    const legacySkillMapping: Record<string, string> = {
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

    // 3. Remap currentSkillId
    if (migrated.currentSkillId in legacySkillMapping) {
      migrated.currentSkillId = legacySkillMapping[migrated.currentSkillId];
    }

    // 4. Remap skillMastery keys
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

  // Streak Freeze & Protection Migration (v4):
  const rawStreak = typeof raw.streak === 'number' ? raw.streak : 0;
  migrated.freezeInventory = typeof raw.freezeInventory === 'number'
    ? Math.min(2, Math.max(0, raw.freezeInventory))
    : (rawStreak >= 3 ? 1 : 0); // Grace grant 1 freeze to users with existing streaks >= 3

  migrated.freezeRepairsProgress = typeof raw.freezeRepairsProgress === 'number'
    ? Math.min(2, Math.max(0, raw.freezeRepairsProgress))
    : 0;

  migrated.freezeUsedDates = Array.isArray(raw.freezeUsedDates) ? [...raw.freezeUsedDates] : [];
  migrated.lastActiveDate = raw.lastActiveDate || raw.activityHistory?.[raw.activityHistory.length - 1]?.date || '';
  migrated.streakRescuePending = Boolean(raw.streakRescuePending);

  // Tag with current schema and curriculum versions
  migrated._version = 4;
  migrated._curriculumVersion = 2;

  return migrated;
}

/**
 * Loads and migrates progress from browser localStorage.
 */
export function loadAndMigrateProgress(fallbackInitial: UserProgressState): UserProgressState {
  if (typeof window === 'undefined' || !window.localStorage) {
    return fallbackInitial;
  }

  try {
    // 1. Check current v4 storage key
    const currentRaw = localStorage.getItem(CURRENT_STORAGE_KEY);
    if (currentRaw) {
      const parsed = JSON.parse(currentRaw);
      return migrateProgressData(parsed, fallbackInitial);
    }

    // 2. Search legacy keys
    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        const migrated = migrateProgressData(parsed, fallbackInitial);
        // Persist immediately into v4 key
        saveProgress(migrated);
        return migrated;
      }
    }
  } catch (err) {
    console.error('Failed to load/migrate progress from storage', err);
  }

  return fallbackInitial;
}

/**
 * Persists user progress to current v4 storage
 */
export function saveProgress(progress: UserProgressState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const withVersion = {
      ...progress,
      _version: 4,
      _curriculumVersion: 2
    };
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(withVersion));
  } catch (err) {
    console.error('Failed to save progress to storage', err);
  }
}
