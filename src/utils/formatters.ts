/**
 * Human-friendly string formatters and translators.
 * Translates dev/internal identifiers into clear, natural user-facing text.
 */

const MISCONCEPTION_LABELS: Record<string, string> = {
  STRING_VS_NUMBER: 'Mixing text and numbers',
  ASSIGNMENT_VS_COMPARISON: 'Assignment vs equality',
  OFF_BY_ONE: 'Off-by-one boundary',
  WRONG_OPERATOR: 'Incorrect operator',
  WRONG_TYPE: 'Type mismatch',
  VARIABLE_VALUE_CONFUSION: 'Variable vs value',
  PRECEDENCE_CONFUSION: 'Operator precedence',
  BOOLEAN_LOGIC_CONFUSION: 'Boolean logic',
  SYNTAX_ERROR: 'Syntax structure',
  INDENTATION_ERROR: 'Indentation alignment',
  INPUT_IS_STRING: 'Input string conversion',
  CONDITION_BOUNDARY: 'Condition boundary',
  LOOP_EXECUTION_CONFUSION: 'Loop execution flow',
  MISCONCEPTION_DETECTED: 'Misconception detected',
  runtime_code_error: 'Runtime error'
};

/**
 * Converts internal SCREAMING_SNAKE_CASE or snake_case misconception tags
 * into readable sentence-case human labels.
 */
export function formatMisconceptionTag(tag?: string): string {
  if (!tag) return 'Misconception review';
  if (MISCONCEPTION_LABELS[tag]) {
    return MISCONCEPTION_LABELS[tag];
  }
  // Fallback: convert SNAKE_CASE to sentence case
  const words = tag.replace(/_/g, ' ').toLowerCase().trim();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Format raw XP numbers with proper commas if large.
 */
export function formatXP(xp: number): string {
  return xp.toLocaleString('en-US');
}
