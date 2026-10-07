import { ChallengeTest, DiagnosticRule } from './index';

export type MisconceptionTag =
  | 'STRING_VS_NUMBER'
  | 'ASSIGNMENT_VS_COMPARISON'
  | 'OFF_BY_ONE'
  | 'WRONG_OPERATOR'
  | 'WRONG_TYPE'
  | 'VARIABLE_VALUE_CONFUSION'
  | 'PRECEDENCE_CONFUSION'
  | 'BOOLEAN_LOGIC_CONFUSION'
  | 'SYNTAX_ERROR'
  | 'INDENTATION_ERROR'
  | 'INPUT_IS_STRING'
  | 'CONDITION_BOUNDARY'
  | 'LOOP_EXECUTION_CONFUSION';

export type QuestionType =
  | 'MULTIPLE_CHOICE'
  | 'PREDICT_OUTPUT'
  | 'CODE_COMPLETION'
  | 'WRITE_CODE'
  | 'DEBUG_CODE'
  | 'TRACE_CODE'
  | 'TRUE_FALSE_WITH_REASONING'
  | 'APPLY';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
  misconception_tag?: MisconceptionTag;
}

export interface TraceStep {
  step: number;
  line: number;
  code: string;
  variable: string;
  expectedValue: string;
  hint?: string;
}

export interface RepairQuestion {
  prompt: string;
  codeSnippet?: string;
  options: QuestionOption[];
  correctAnswer: string;
  explanation: string;
}

export interface StructuredTestCase extends ChallengeTest {
  assertionPython?: string; // e.g. "assert age == 18, 'age should be 18'"
}

export interface QuestionMetadata {
  id: string;
  unit: string;
  lesson: string;
  section: string;
  concept: string;
  learning_objective: string;
  difficulty: 'easy' | 'medium' | 'hard';
  question_type: QuestionType;
  prompt: string;
  codeSnippet?: string;
  starter_code?: string;
  solution_code?: string;
  expected_output?: string;
  accepted_answers?: string[];
  test_cases?: StructuredTestCase[];
  options?: QuestionOption[];
  correct_answer?: any;
  explanation: string;
  hint: string;
  progressive_hints?: [string, string, string]; // For DEBUG_CODE: Attempt 1 feedback, Attempt 2 hint, Attempt 3 explanation
  misconception_tag?: MisconceptionTag;
  mental_model?: string; // For PREDICT_OUTPUT mental model explanation
  relevant_line?: string; // Highlighting line that causes outcome
  repair_question?: RepairQuestion; // Small follow-up repair for predict mistakes
  trace_steps?: TraceStep[]; // For TRACE_CODE
  repair_concept?: string;
  xp: number;
  estimated_time: number; // in seconds
  order: number;
}

export interface LessonStructure {
  id: string;
  unitId: string;
  unitTitle: string;
  title: string;
  slug: string;
  order: number;
  description: string;
  estimatedMinutes: number;
  xpReward: number;
  sections: string[];
  questions: QuestionMetadata[];
}
