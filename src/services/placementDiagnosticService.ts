/**
 * Placement Diagnostic Service
 * Misconception-Driven Placement Engine assessing core programming models:
 * - SYNTAX_ERROR (Syntax & Delimiters)
 * - STRING_VS_NUMBER (Type concatenation vs addition)
 * - ASSIGNMENT_VS_COMPARISON (= vs ==)
 * - OFF_BY_ONE (range bounds & index fences)
 * - VARIABLE_VALUE_CONFUSION (Value copy vs live references)
 */

import { LearningCourse, MistakeRecord } from '../types';

export interface DiagnosticQuestion {
  id: number;
  tier: number;
  misconceptionTag: string;
  conceptTitle: string;
  question: string;
  codeSnippet: string;
  options: { id: string; text: string; isCorrect: boolean }[];
  explanation: string;
}

export const DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: 1,
    tier: 1,
    misconceptionTag: 'SYNTAX_ERROR',
    conceptTitle: 'Syntax & Output Delimiters',
    question: 'What occurs when Python executes the following statement?',
    codeSnippet: 'print("Python"',
    options: [
      { id: 'opt_1a', text: 'Outputs "Python" cleanly to standard output', isCorrect: true },
      { id: 'opt_1b', text: 'Raises a SyntaxError because print is not a valid built-in', isCorrect: false },
      { id: 'opt_1c', text: 'Outputs "None" because no variable was assigned', isCorrect: false },
      { id: 'opt_1d', text: 'Raises a TypeError because string quotes are invalid', isCorrect: false }
    ],
    explanation: 'print("Python") is valid syntax that sends the string text to standard output.'
  },
  {
    id: 2,
    tier: 2,
    misconceptionTag: 'STRING_VS_NUMBER',
    conceptTitle: 'Types: String Concatenation vs Arithmetic',
    question: 'What is the evaluated result of `total` after this statement runs?',
    codeSnippet: 'total = "10" + "20"',
    options: [
      { id: 'opt_2a', text: '30 (numeric addition of the numbers)', isCorrect: false },
      { id: 'opt_2b', text: '"1020" (text concatenation of two strings)', isCorrect: true },
      { id: 'opt_2c', text: 'Raises TypeError: cannot add string to string', isCorrect: false },
      { id: 'opt_2d', text: '200 (multiplied values)', isCorrect: false }
    ],
    explanation: 'In Python, the + operator between two strings concatenates them into "1020", not numeric 30.'
  },
  {
    id: 3,
    tier: 3,
    misconceptionTag: 'ASSIGNMENT_VS_COMPARISON',
    conceptTitle: 'Conditionals: Assignment (=) vs Equality (==)',
    question: 'Which line correctly checks if variable `score` equals 100 without mutating it?',
    codeSnippet: '# Checking if score has reached 100',
    options: [
      { id: 'opt_3a', text: 'if score == 100:', isCorrect: true },
      { id: 'opt_3b', text: 'if score = 100:', isCorrect: false },
      { id: 'opt_3c', text: 'if score === 100:', isCorrect: false },
      { id: 'opt_3d', text: 'if score.equals(100):', isCorrect: false }
    ],
    explanation: 'In Python, == is the equality comparison operator, whereas = assigns a new value.'
  },
  {
    id: 4,
    tier: 4,
    misconceptionTag: 'OFF_BY_ONE',
    conceptTitle: 'Iteration: range() Stop Bounds & Fenceposts',
    question: 'What sequence of numbers does this loop output?',
    codeSnippet: 'for i in range(1, 5):\n    print(i)',
    options: [
      { id: 'opt_4a', text: '1, 2, 3, 4, 5 (inclusive of 5)', isCorrect: false },
      { id: 'opt_4b', text: '1, 2, 3, 4 (exclusive of stop value 5)', isCorrect: true },
      { id: 'opt_4c', text: '0, 1, 2, 3, 4 (starts from 0)', isCorrect: false },
      { id: 'opt_4d', text: '2, 3, 4, 5 (starts at 1 + 1)', isCorrect: false }
    ],
    explanation: 'range(start, stop) generates integers from start up to stop - 1 (exclusive of the stop value).'
  },
  {
    id: 5,
    tier: 5,
    misconceptionTag: 'VARIABLE_VALUE_CONFUSION',
    conceptTitle: 'Variables: Value Copy vs Variable Binding',
    question: 'What is printed at the end of this script?',
    codeSnippet: 'x = 5\ny = x\nx = 10\nprint(y)',
    options: [
      { id: 'opt_5a', text: '10 (y changes dynamically when x changes)', isCorrect: false },
      { id: 'opt_5b', text: '5 (y retains the value 5 bound at assignment time)', isCorrect: true },
      { id: 'opt_5c', text: '15 (sum of 5 and 10)', isCorrect: false },
      { id: 'opt_5d', text: 'None', isCorrect: false }
    ],
    explanation: 'Assigning y = x binds y to the current value 5. Reassigning x = 10 does not alter y.'
  }
];

export interface PlacementEvaluationResult {
  correctCount: number;
  totalQuestions: number;
  placementTier: number; // 1 to 5
  targetUnitNumber: number; // Unit to start in (1, 2, 3, 4, or 6)
  masteredSkillIds: string[];
  masteredLessonIds: string[];
  nextSkillId: string;
  diagnosedMisconceptions: string[];
  awardedXp: number;
  mistakeRecords: MistakeRecord[];
}

export const placementDiagnosticService = {
  getQuestions(): DiagnosticQuestion[] {
    return DIAGNOSTIC_QUESTIONS;
  },

  /**
   * Evaluates answers to the 5 diagnostic questions and maps learner to recommended curriculum unit.
   */
  evaluatePlacement(
    selectedOptionIds: Record<number, string>,
    course: LearningCourse
  ): PlacementEvaluationResult {
    const questions = DIAGNOSTIC_QUESTIONS;
    let correctCount = 0;
    const diagnosedMisconceptions: string[] = [];
    const mistakeRecords: MistakeRecord[] = [];

    questions.forEach(q => {
      const selectedId = selectedOptionIds[q.id];
      const selectedOption = q.options.find(o => o.id === selectedId);
      const isCorrect = Boolean(selectedOption?.isCorrect);

      if (isCorrect) {
        correctCount++;
      } else {
        diagnosedMisconceptions.push(q.misconceptionTag);
        mistakeRecords.push({
          id: `mst_diag_${q.misconceptionTag.toLowerCase()}_${Date.now()}_${q.id}`,
          lessonId: 'placement',
          skillId: `py_skill_${q.tier}_1`,
          challengeId: `diag_q_${q.id}`,
          userCode: q.codeSnippet,
          explanation: q.explanation,
          mistakeType: q.misconceptionTag,
          timestamp: new Date().toISOString(),
          frequency: 1,
          resolved: false
        });
      }
    });

    // Tier mapping:
    // 0 - 1 correct: Tier 1 (Unit 1 Foundations)
    // 2 correct: Tier 2 (Unit 2 Data Structures & Logic)
    // 3 correct: Tier 3 (Unit 3 Control Flow & Functions)
    // 4 correct: Tier 4 (Unit 4 File I/O & Modules)
    // 5 correct: Tier 5 (Unit 6 Algorithms & OOP)
    let targetUnitNumber = 1;
    let placementTier = 1;

    if (correctCount >= 5) {
      placementTier = 5;
      targetUnitNumber = 6;
    } else if (correctCount === 4) {
      placementTier = 4;
      targetUnitNumber = 4;
    } else if (correctCount === 3) {
      placementTier = 3;
      targetUnitNumber = 3;
    } else if (correctCount === 2) {
      placementTier = 2;
      targetUnitNumber = 2;
    } else {
      placementTier = 1;
      targetUnitNumber = 1;
    }

    // Collect skipped skills & lessons prior to target unit
    const masteredSkillIds: string[] = [];
    const masteredLessonIds: string[] = [];

    if (targetUnitNumber > 1 && course?.units) {
      for (const u of course.units) {
        if (u.unitNumber < targetUnitNumber) {
          for (const s of u.skills) {
            masteredSkillIds.push(s.id);
            for (const l of s.lessons) {
              masteredLessonIds.push(l.id);
            }
          }
        }
      }
    }

    const targetUnit = course?.units?.find(u => u.unitNumber === targetUnitNumber);
    const nextSkillId = targetUnit?.skills?.[0]?.id || 'py_skill_1_1';
    const awardedXp = masteredSkillIds.length * 50;

    return {
      correctCount,
      totalQuestions: questions.length,
      placementTier,
      targetUnitNumber,
      masteredSkillIds,
      masteredLessonIds,
      nextSkillId,
      diagnosedMisconceptions,
      awardedXp,
      mistakeRecords
    };
  }
};
