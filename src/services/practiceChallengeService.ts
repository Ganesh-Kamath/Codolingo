import { Challenge, ChallengeTest, DiagnosticRule, LessonBlock } from '../types';
import { QuestionMetadata } from '../types/question';
import { FOUNDATIONS_LESSONS, FINAL_CHALLENGE_QUESTIONS } from '../curriculum/python/foundations';

export interface PracticeChallengeItem extends Challenge {
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  topic: string;
  skillId?: string;
  unitTitle?: string;
  lessonTitle?: string;
  expectedOutput?: string;
  xpReward?: number;
  hints?: string[];
}

/**
 * Adapter converting QuestionMetadata into a Practice Challenge Item
 */
function mapQuestionToChallenge(q: QuestionMetadata, lessonTitle: string, unitTitle: string): PracticeChallengeItem | null {
  // Only convert coding / debugging / apply challenges
  const isCodeChallenge = 
    q.question_type === 'WRITE_CODE' ||
    q.question_type === 'APPLY' ||
    q.question_type === 'DEBUG_CODE' ||
    q.question_type === 'CODE_COMPLETION' ||
    Boolean(q.starter_code || q.solution_code || (q.test_cases && q.test_cases.length > 0));

  if (!isCodeChallenge) return null;

  const tests: ChallengeTest[] = (q.test_cases || []).map((tc, idx) => ({
    id: tc.id || `tc_${idx + 1}`,
    description: tc.description || `Test case ${idx + 1}`,
    expectedOutput: tc.expectedOutput || q.expected_output || '',
    input: tc.input || '',
    isHidden: tc.isHidden || false,
    assertionPython: tc.assertionPython
  } as any));

  // If no explicit test cases exist but expected_output does, synthesize one test
  if (tests.length === 0 && q.expected_output) {
    tests.push({
      id: `tc_default`,
      description: `Outputs expected result: "${q.expected_output}"`,
      expectedOutput: q.expected_output,
      isHidden: false
    });
  }

  // Convert diagnostic rules or synthesize from misconception tag
  const diagnosticRules: DiagnosticRule[] = [];
  if (q.misconception_tag) {
    if (q.misconception_tag === 'SYNTAX_ERROR') {
      diagnosticRules.push({
        id: `rule_syntax_${q.id}`,
        mistakeType: 'syntax_error',
        pattern: 'Print\\(|print\\s+[^\\(]',
        message: 'Remember that Python is case sensitive and functions use parentheses.',
        fixSuggestion: 'Use lowercase print(...) with matching parentheses.'
      });
    } else if (q.misconception_tag === 'ASSIGNMENT_VS_COMPARISON') {
      diagnosticRules.push({
        id: `rule_eq_${q.id}`,
        mistakeType: 'assignment_vs_comparison',
        pattern: 'if\\s+[a-zA-Z0-9_]+\\s*=\\s*[^=]',
        message: 'Single = assigns a variable, while double == compares two values.',
        fixSuggestion: 'Use == to compare equality inside if statements.'
      });
    }
  }

  const hints: string[] = [];
  if (q.hint) hints.push(q.hint);
  if (q.progressive_hints) hints.push(...q.progressive_hints);

  const starterCode = q.starter_code || `# ${q.learning_objective || q.concept}\n# Write your Python code below\n\n`;
  const solutionCode = q.solution_code || '';

  return {
    id: q.id,
    lessonId: q.lesson,
    skillId: `py_skill_${q.lesson.replace('.', '_')}`,
    conceptId: q.concept,
    title: q.section ? `${q.section.replace(/^\d+\.\s*/, '')}` : (q.learning_objective || q.concept.replace(/_/g, ' ')),
    description: q.prompt || q.learning_objective || '',
    instructionMarkdown: q.prompt,
    topic: q.concept.replace(/_/g, ' '),
    unitTitle,
    lessonTitle,
    difficulty: (q.difficulty as any) || 'medium',
    category: 'Foundations',
    starterCode,
    solutionCode,
    expectedOutput: q.expected_output,
    hints: hints.length > 0 ? hints : undefined,
    hint: q.hint || (hints.length > 0 ? hints[0] : undefined),
    type: q.question_type === 'DEBUG_CODE' ? 'repair' : 'code',
    tests,
    diagnosticRules: diagnosticRules.length > 0 ? diagnosticRules : undefined,
    xpReward: q.xp || 25
  };
}

/**
 * Service providing curriculum-backed coding challenges
 */
class PracticeChallengeService {
  private challengesCache: PracticeChallengeItem[] | null = null;

  getAllChallenges(): PracticeChallengeItem[] {
    if (this.challengesCache) {
      return this.challengesCache;
    }

    const challenges: PracticeChallengeItem[] = [];

    // 1. Load from all structured Foundations lessons
    for (const lesson of FOUNDATIONS_LESSONS) {
      for (const q of lesson.questions) {
        const mapped = mapQuestionToChallenge(q, lesson.title, lesson.unitTitle);
        if (mapped) {
          challenges.push(mapped);
        }
      }
    }

    // 2. Load from Capstone Final Challenge
    for (const q of FINAL_CHALLENGE_QUESTIONS) {
      const mapped = mapQuestionToChallenge(q, 'Capstone Challenge', 'Unit 1: Python Foundations');
      if (mapped) {
        challenges.push(mapped);
      }
    }

    this.challengesCache = challenges;
    return challenges;
  }

  getChallengeById(id: string): PracticeChallengeItem | undefined {
    const all = this.getAllChallenges();
    return all.find(c => c.id === id);
  }

  getNextChallenge(currentId: string): PracticeChallengeItem | undefined {
    const all = this.getAllChallenges();
    const currentIndex = all.findIndex(c => c.id === currentId);
    if (currentIndex >= 0 && currentIndex < all.length - 1) {
      return all[currentIndex + 1];
    }
    return undefined;
  }

  getChallengesByDifficulty(difficulty: 'all' | 'easy' | 'medium' | 'hard'): PracticeChallengeItem[] {
    const all = this.getAllChallenges();
    if (difficulty === 'all') return all;
    return all.filter(c => c.difficulty === difficulty);
  }
}

export const practiceChallengeService = new PracticeChallengeService();
