import { LessonBlock, Lesson, SkillNode, Unit } from '../../../types';
import { QuestionMetadata, LessonStructure } from '../../../types/question';

import { LESSON_01 } from './lesson01';
import { LESSON_02 } from './lesson02';
import { LESSON_03 } from './lesson03';
import { LESSON_04 } from './lesson04';
import { LESSON_05 } from './lesson05';
import { LESSON_06 } from './lesson06';
import { LESSON_07 } from './lesson07';
import { LESSON_08 } from './lesson08';
import { LESSON_09 } from './lesson09';
import { LESSON_10 } from './lesson10';
import { FINAL_CHALLENGE_QUESTIONS } from './finalChallenge';

export {
  LESSON_01,
  LESSON_02,
  LESSON_03,
  LESSON_04,
  LESSON_05,
  LESSON_06,
  LESSON_07,
  LESSON_08,
  LESSON_09,
  LESSON_10,
  FINAL_CHALLENGE_QUESTIONS
};

export const FOUNDATIONS_LESSONS: LessonStructure[] = [
  LESSON_01,
  LESSON_02,
  LESSON_03,
  LESSON_04,
  LESSON_05,
  LESSON_06,
  LESSON_07,
  LESSON_08,
  LESSON_09,
  LESSON_10
];

export const FOUNDATIONS_LESSON_MAP: Record<string, LessonStructure> = {
  // Canonical Lesson ID Mapping (Non-overlapping across Units 1-5)
  '1.4': LESSON_01, // The Print Function (Unit 1)
  '2.1': LESSON_02, // Variables (Unit 2)
  '3.1': LESSON_03, // Arithmetic Operators (Unit 3)
  '2.4': LESSON_04, // Strings (Unit 2)
  '4.1': LESSON_05, // The input() Function (Unit 4)
  '2.7': LESSON_06, // Type Conversion (Casting) (Unit 2)
  '3.4': LESSON_07, // Comparison Operators (Unit 3)
  '3.5': LESSON_08, // Logical Operators (Unit 3)
  '5.1': LESSON_09, // The if Statement (Unit 5)
  '5.6': LESSON_10, // Project: Interactive Calculator (Unit 5)
  'unit_05_checkpoint': {
    id: 'unit_05_checkpoint',
    unitId: 'unit_05',
    unitTitle: 'Unit 5: Conditional Logic',
    title: 'Conditional Logic Capstone Challenge',
    slug: 'conditional-logic-capstone',
    order: 7,
    description: 'The ultimate synthesis challenge: 5 capstone programming problems combining variables, input, conversion, arithmetic, comparisons, and conditional logic.',
    estimatedMinutes: 15,
    xpReward: 100,
    sections: ['Capstone Challenges'],
    questions: FINAL_CHALLENGE_QUESTIONS
  },
  // Backward compatibility alias for legacy unit_01_final
  'unit_01_final': {
    id: 'unit_01_final',
    unitId: 'unit_05',
    unitTitle: 'Unit 5: Conditional Logic',
    title: 'Conditional Logic Capstone Challenge',
    slug: 'conditional-logic-capstone',
    order: 7,
    description: 'The ultimate synthesis challenge: 5 capstone programming problems combining variables, input, conversion, arithmetic, comparisons, and conditional logic.',
    estimatedMinutes: 15,
    xpReward: 100,
    sections: ['Capstone Challenges'],
    questions: FINAL_CHALLENGE_QUESTIONS
  }
};

/**
 * Transforms a rigorous QuestionMetadata item into a fully interactive LessonBlock
 */
export function mapQuestionToBlock(q: QuestionMetadata): LessonBlock {
  let blockType = q.question_type as any;
  if (q.question_type === 'WRITE_CODE' || q.question_type === 'APPLY') {
    blockType = 'write_code';
  } else if (q.question_type === 'DEBUG_CODE') {
    blockType = 'fix_code';
  } else if (q.question_type === 'PREDICT_OUTPUT') {
    blockType = 'predict_output';
  } else if (q.question_type === 'CODE_COMPLETION') {
    blockType = 'fill_in_the_blank';
  } else if (q.question_type === 'TRACE_CODE') {
    blockType = 'trace_code';
  } else if (q.question_type === 'TRUE_FALSE_WITH_REASONING' || q.question_type === 'MULTIPLE_CHOICE') {
    blockType = 'multiple_choice';
  }

  return {
    id: q.id,
    type: blockType,
    title: q.prompt ? q.prompt.split('\n')[0].replace(/^#+\s*/, '').slice(0, 80) : 'Exercise',
    subtitle: q.section || q.concept.replace(/_/g, ' '),
    concept: q.concept,
    difficulty: q.difficulty,
    prompt: q.prompt,
    content: q.prompt,
    contentMarkdown: q.prompt,
    codeSnippet: q.codeSnippet,
    predictCode: q.codeSnippet,
    options: (q.options || []).map(opt => ({
      id: opt.id,
      text: opt.text,
      isCorrect: opt.isCorrect,
      explanation: opt.explanation
    })),
    correctAnswer: q.correct_answer,
    acceptedAnswers: q.accepted_answers,
    starterCode: q.starter_code || '# Write your code below\n',
    solutionCode: q.solution_code || '',
    hint: q.hint,
    tests: (q.test_cases || []).map(tc => ({
      id: tc.id,
      description: tc.description,
      expectedOutput: tc.expectedOutput || '',
      input: tc.input,
      isHidden: tc.isHidden,
      assertionPython: tc.assertionPython
    })),
    explanation: q.explanation,
    commonMistake: q.misconception_tag ? `Misconception: ${q.misconception_tag.replace(/_/g, ' ')}` : undefined,
    // Extended properties
    questionType: q.question_type,
    misconceptionTag: q.misconception_tag,
    repairConcept: q.repair_concept,
    mentalModel: q.mental_model,
    relevantLine: q.relevant_line,
    repairQuestion: q.repair_question,
    traceSteps: q.trace_steps,
    progressiveHints: q.progressive_hints,
    xp: q.xp,
    order: q.order,
    section: q.section,
    learning_objective: q.learning_objective
  };
}

export function getFoundationsLessonBlocks(lessonId: string): LessonBlock[] {
  const lesson = FOUNDATIONS_LESSON_MAP[lessonId];
  if (!lesson) return [];
  return lesson.questions.map(mapQuestionToBlock);
}

/**
 * Returns Unit 1 formatted for LearningCourse
 */
export function buildPythonFoundationsUnit(): Unit {
  const skills: SkillNode[] = FOUNDATIONS_LESSONS.map((les, index) => {
    const isFirst = index === 0;
    const offsets = [0, -0.6, 0.6, -0.5, 0.5, -0.6, 0.6, -0.5, 0.5, 0];
    const icons = ['player-play', 'code', 'calculator', 'align-left', 'terminal', 'refresh', 'scale', 'toggle-left', 'git-branch', 'award'];

    const lessonObj: Lesson = {
      id: les.id,
      skillId: `py_skill_${les.id.replace('.', '_')}`,
      moduleId: 'unit_01',
      courseId: 'python',
      title: les.title,
      slug: les.slug,
      description: les.description,
      order: les.order,
      estimatedMinutes: les.estimatedMinutes,
      xpReward: les.xpReward,
      conceptIds: Array.from(new Set(les.questions.map(q => q.concept)))
    };

    return {
      id: `py_skill_${les.id.replace('.', '_')}`,
      unitId: 'unit_01',
      title: les.title,
      slug: les.slug,
      description: les.description,
      order: les.order,
      status: isFirst ? 'unlocked' : 'locked',
      mastery: 0,
      maxMastery: 5,
      iconName: icons[index] || 'code',
      requiresSkillId: isFirst ? undefined : `py_skill_${FOUNDATIONS_LESSONS[index - 1].id.replace('.', '_')}`,
      lessons: [lessonObj],
      pathOffset: offsets[index] || 0
    };
  });

  return {
    id: 'unit_01',
    courseId: 'python',
    unitNumber: 1,
    title: 'Unit 1: Python Foundations',
    subtitle: '10 deliberate practice lessons • Real code execution & test verification',
    description: 'Master practical Python foundations from first principles: variables, strings, user input, type conversions, arithmetic, comparisons, boolean logic, and branching conditions.',
    themeColor: '#10B981',
    accentBg: '#ECFDF5',
    skills,
    checkpoint: {
      id: 'unit_01_checkpoint',
      unitId: 'unit_01',
      title: 'Python Foundations Capstone',
      description: 'Test your holistic mastery across all 10 lessons with 5 synthesis challenges.',
      status: 'locked',
      xpReward: 100
    }
  };
}
