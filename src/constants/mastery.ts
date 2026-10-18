/**
 * Mastery scoring thresholds and penalty constants.
 * Converts 0-100 real accuracy performance into 0-5 skill pips.
 */

export const MASTERY_THRESHOLDS = {
  // Score required to earn each pip level (0 to 5)
  PIP_0_MAX: 19, // 0 - 19: Needs Practice (0 pips)
  PIP_1_MIN: 20, // 20 - 39: Beginner (1 pip)
  PIP_2_MIN: 40, // 40 - 59: Developing (2 pips)
  PIP_3_MIN: 60, // 60 - 74: Competent (3 pips)
  PIP_4_MIN: 75, // 75 - 89: Proficient (4 pips)
  PIP_5_MIN: 90  // 90 - 100: Mastered (5 pips)
} as const;

export const MASTERY_PENALTIES = {
  HINT_PENALTY: 5,               // Score deducted per hint revealed
  UNRESOLVED_MISTAKE_PENALTY: 5, // Score deducted per active unresolved mistake on this skill
  MAX_HINT_PENALTY: 25,          // Cap so hint penalty doesn't completely zero a mostly correct attempt
} as const;

export const MASTERY_LABELS: Record<number, string> = {
  0: 'Needs practice',
  1: 'Getting started',
  2: 'Developing',
  3: 'Competent',
  4: 'Proficient',
  5: 'Mastered'
};

export const UNKNOWN_MASTERY_LABEL = 'Completed (Mastery unknown)';
export const UNKNOWN_MASTERY_PIPS = -1; // Sentinel value representing completed legacy skills awaiting rescoring

/**
 * Temporal Decay Half-Life Tiers (Settles & Meeder 2016 Half-Life Regression)
 * Base half-life in days per earned pip tier
 */
export const HALF_LIFE_TIERS = {
  BEGINNER: 7,   // 1 - 2 pips: 7 days half-life
  COMPETENT: 14, // 3 - 4 pips: 14 days half-life
  MASTERED: 30   // 5 pips: 30 days half-life
} as const;

export function getHalfLifeForPips(pips: number): number {
  if (pips >= 5) return HALF_LIFE_TIERS.MASTERED;
  if (pips >= 3) return HALF_LIFE_TIERS.COMPETENT;
  return HALF_LIFE_TIERS.BEGINNER;
}
