import { UserProgressState } from '../types';
import { UNKNOWN_MASTERY_PIPS } from '../constants/mastery';

export const CURRENT_STORAGE_KEY = 'codolingo_progress_v3';

export const LEGACY_STORAGE_KEYS = [
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

  // Tag with current schema version
  (migrated as any)._version = 3;

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
    // 1. Check current v3 storage key
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
        // Persist immediately into v3 key
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
 * Persists user progress to current v3 storage
 */
export function saveProgress(progress: UserProgressState): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    const withVersion = {
      ...progress,
      _version: 3
    };
    localStorage.setItem(CURRENT_STORAGE_KEY, JSON.stringify(withVersion));
  } catch (err) {
    console.error('Failed to save progress to storage', err);
  }
}
