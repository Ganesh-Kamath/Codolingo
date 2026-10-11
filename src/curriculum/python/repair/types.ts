import { MisconceptionTag, QuestionType, QuestionOption, StructuredTestCase } from '../../../types/question';

export interface RepairStep {
  stepNumber: 1 | 2 | 3 | 4;
  title: string;
  whatWereFixing: string;
  questionType: QuestionType;
  prompt: string;
  codeSnippet?: string;
  starterCode?: string;
  referenceSolution: string;
  options?: QuestionOption[];
  expectedOutput?: string;
  testCases?: StructuredTestCase[];
  diagram?: string;
  explanationText?: string;
  progressiveHints: [string, string, string]; // 1: diagnosis, 2: targeted hint, 3: explanation + solution
}

export interface ConceptRepairDrill {
  tag: MisconceptionTag;
  friendlyTitle: string;
  description: string;
  category: string;
  getSteps: (learnerSnippet?: string) => [RepairStep, RepairStep, RepairStep, RepairStep];
}
