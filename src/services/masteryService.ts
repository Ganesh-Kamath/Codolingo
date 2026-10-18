import { 
  MASTERY_THRESHOLDS, 
  MASTERY_PENALTIES, 
  MASTERY_LABELS, 
  UNKNOWN_MASTERY_PIPS, 
  UNKNOWN_MASTERY_LABEL,
  HALF_LIFE_TIERS,
  getHalfLifeForPips
} from '../constants/mastery';
import { SkillMasteryRecord } from '../types';

export interface LessonAttemptStats {
  firstAttemptCorrectCount: number;
  totalQuestions: number;
  hintsUsed?: number;
  unresolvedMistakesCount?: number;
  runCount?: number;
  checkCount?: number;
}

export interface MasteryEvaluation {
  score: number; // 0 - 100
  pips: number;  // 0 - 5 (or UNKNOWN_MASTERY_PIPS)
  label: string;
  firstAttemptCorrectCount: number;
  totalQuestions: number;
  hintsUsed: number;
  unresolvedMistakesCount: number;
  explanation: string;
}

export interface EffectiveMasteryResult {
  initialPips: number;
  effectivePips: number;
  decayFactor: number;
  needsReview: boolean;
  daysSincePractice: number;
  halfLifeDays: number;
}

export const masteryService = {
  /**
   * Converts a 0-100 score into 0-5 pips based on defined thresholds
   */
  scoreToPips(score: number): number {
    if (score < MASTERY_THRESHOLDS.PIP_1_MIN) return 0;
    if (score < MASTERY_THRESHOLDS.PIP_2_MIN) return 1;
    if (score < MASTERY_THRESHOLDS.PIP_3_MIN) return 2;
    if (score < MASTERY_THRESHOLDS.PIP_4_MIN) return 3;
    if (score < MASTERY_THRESHOLDS.PIP_5_MIN) return 4;
    return 5;
  },

  /**
   * Computes a real 0-100 skill score and maps to 0-5 pips
   */
  evaluateAttempt(stats: LessonAttemptStats): MasteryEvaluation {
    const total = Math.max(stats.totalQuestions, 1);
    const correct = Math.max(0, Math.min(stats.firstAttemptCorrectCount, total));
    const hints = Math.max(0, stats.hintsUsed || 0);
    const unresolvedMistakes = Math.max(0, stats.unresolvedMistakesCount || 0);

    // Base score is first attempt accuracy percentage
    const baseAccuracy = (correct / total) * 100;

    // Deductions
    const hintPenalty = Math.min(hints * MASTERY_PENALTIES.HINT_PENALTY, MASTERY_PENALTIES.MAX_HINT_PENALTY);
    const mistakePenalty = unresolvedMistakes * MASTERY_PENALTIES.UNRESOLVED_MISTAKE_PENALTY;

    const rawScore = Math.round(baseAccuracy - hintPenalty - mistakePenalty);
    const score = Math.max(0, Math.min(100, rawScore));
    const pips = masteryService.scoreToPips(score);
    const label = MASTERY_LABELS[pips] || 'Needs practice';

    const explanation = masteryService.formatPipsExplanation(
      pips,
      correct,
      total,
      hints,
      unresolvedMistakes
    );

    return {
      score,
      pips,
      label,
      firstAttemptCorrectCount: correct,
      totalQuestions: total,
      hintsUsed: hints,
      unresolvedMistakesCount: unresolvedMistakes,
      explanation
    };
  },

  /**
   * Formats a human explanation for the pips score:
   * e.g., "3/5: you got 7 of 10 right first try, used 2 hints. Fix 1 mistake to reach 4/5"
   */
  formatPipsExplanation(
    pips: number,
    correct: number,
    total: number,
    hints: number,
    unresolvedMistakes: number
  ): string {
    if (pips === UNKNOWN_MASTERY_PIPS) {
      return `${UNKNOWN_MASTERY_LABEL}: Practice this skill to calibrate your real mastery score.`;
    }

    const accuracyPart = `you got ${correct} of ${total} right first try`;
    const hintPart = hints > 0 ? `, used ${hints} ${hints === 1 ? 'hint' : 'hints'}` : '';
    
    if (pips === 5) {
      return `5/5: Perfect mastery! ${accuracyPart}${hintPart}. Outstanding work.`;
    }

    const nextPip = pips + 1;
    let advice = '';
    if (unresolvedMistakes > 0) {
      advice = ` Fix ${unresolvedMistakes} ${unresolvedMistakes === 1 ? 'mistake' : 'mistakes'} in Fix-It Lab to boost towards ${nextPip}/5.`;
    } else if (hints > 0) {
      advice = ` Try again with fewer hints to reach ${nextPip}/5.`;
    } else {
      advice = ` Improve first-try accuracy to reach ${nextPip}/5.`;
    }

    return `${pips}/5: ${accuracyPart}${hintPart}.${advice}`;
  },

  /**
   * Non-decreasing update:
   * Replaying a lesson with poor accuracy never decreases mastery.
   * Keeps the highest earned pips, but allows higher scores to upgrade it.
   */
  updateSkillMastery(currentPips: number | undefined, newPips: number): number {
    if (currentPips === undefined || currentPips === UNKNOWN_MASTERY_PIPS) {
      return newPips;
    }
    return Math.max(currentPips, newPips);
  },

  /**
   * Evaluates effective pips using Settles & Meeder (2016) Half-Life Regression decay:
   * decayFactor = 2^(- delta_t / halfLifeDays)
   * effectivePips = max(1, round(initialPips * decayFactor)) (for initialPips >= 1)
   * needsReview = initialPips > 0 && (effectivePips < initialPips || decayFactor < 0.70)
   */
  getEffectivePips(record?: SkillMasteryRecord | null, currentDate: Date = new Date()): EffectiveMasteryResult {
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
  },

  /**
   * Explains temporal decay in learner-friendly terms
   */
  formatDecayExplanation(effectivePips: number, initialPips: number, daysSincePractice: number): string {
    const days = Math.floor(daysSincePractice);
    const daysText = days === 1 ? '1 day' : `${days} days`;
    if (effectivePips < initialPips) {
      return `Needs Review: Practiced ${daysText} ago. Mastery decayed from ${initialPips}/5 to ${effectivePips}/5 pips. Quick refresh to restore full strength!`;
    }
    return `Skill memory is fading (last practiced ${daysText} ago). Quick refresh to keep it at ${initialPips}/5 pips!`;
  },

  /**
   * Creates a fresh SkillMasteryRecord
   */
  createMasteryRecord(pips: number, date: Date = new Date()): SkillMasteryRecord {
    return {
      pips,
      lastPracticedAt: date.toISOString(),
      halfLifeDays: getHalfLifeForPips(pips)
    };
  },

  /**
   * Restores a SkillMasteryRecord upon Quick Refresh or full lesson practice
   */
  restoreMasteryRecord(record: SkillMasteryRecord, restoredPips?: number): SkillMasteryRecord {
    const pips = restoredPips !== undefined ? restoredPips : record.pips;
    return {
      pips,
      lastPracticedAt: new Date().toISOString(),
      halfLifeDays: getHalfLifeForPips(pips)
    };
  }
};
