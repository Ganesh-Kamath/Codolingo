export type CourseCategory = 'programming' | 'web' | 'cs';
export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type SkillStatus = 'completed' | 'current' | 'unlocked' | 'locked' | 'review_recommended';

export interface Concept {
  id: string;
  name: string;
  category: string;
  description: string;
  masteryPercentage: number;
}

export interface ChallengeTest {
  id: string;
  description: string;
  expectedOutput: string;
  input?: string;
  isHidden?: boolean;
}

export interface DiagnosticRule {
  id: string;
  mistakeType: string;
  pattern: string;
  message: string;
  fixSuggestion?: string;
}

export interface PredictOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

export * from './question';

export type LessonBlockType = 
  | 'explanation' 
  | 'code_example' 
  | 'fill_in_the_blank' 
  | 'multiple_choice' 
  | 'write_code' 
  | 'predict_output' 
  | 'output_prediction'
  | 'fix_code' 
  | 'short_quiz'
  | 'code_ordering'
  | 'match_code_to_concept'
  | 'error_diagnosis'
  | 'real_world_scenario'
  | 'code_prediction'
  | 'mini_challenge'
  | 'refactoring_challenge'
  | 'trace_execution'
  | 'trace_code'
  | 'CODE_COMPLETION'
  | 'MULTIPLE_CHOICE'
  | 'PREDICT_OUTPUT'
  | 'WRITE_CODE'
  | 'DEBUG_CODE'
  | 'TRACE_CODE'
  | 'TRUE_FALSE_WITH_REASONING'
  | 'APPLY';

export interface LessonBlock {
  id: string;
  type: LessonBlockType;
  // Generic fields
  title?: string;
  subtitle?: string;
  content?: string; 
  contentMarkdown?: string;
  prompt?: string;
  concept?: string;
  skill?: string;
  difficulty?: 'easy' | 'medium' | 'hard' | string;
  explanation?: string;
  commonMistake?: string;
  // Specific to explanation / code_example
  codeSnippet?: string;
  predictCode?: string;
  predictQuestion?: string;
  // Specific to predict / multiple choice / short quiz
  options?: PredictOption[];
  correctAnswer?: any;
  // Specific to fill in the blank
  acceptedAnswers?: string[];
  // Specific to code ordering
  orderingOptions?: string[];
  // Specific to matching
  rawOptions?: any;
  // Specific to coding
  starterCode?: string;
  solutionCode?: string;
  hint?: string;
  tests?: ChallengeTest[];
  diagnosticRules?: DiagnosticRule[];
  // Extended fields for deliberate practice engine
  questionType?: string;
  misconceptionTag?: string;
  misconception_tag?: string;
  repairConcept?: string;
  repair_concept?: string;
  mentalModel?: string;
  mental_model?: string;
  relevantLine?: string;
  relevant_line?: string;
  repairQuestion?: any;
  repair_question?: any;
  traceSteps?: any[];
  trace_steps?: any[];
  progressiveHints?: [string, string, string];
  progressive_hints?: [string, string, string];
  xp?: number;
  order?: number;
  section?: string;
  learning_objective?: string;
}

export interface Challenge {
  id: string;
  lessonId: string;
  conceptId?: string;
  title: string;
  instructionMarkdown?: string;
  codeSnippetExample?: string;
  starterCode: string;
  solutionCode: string;
  hint?: string;
  type: 'code' | 'repair' | 'predict_output';
  tests: ChallengeTest[];
  diagnosticRules?: DiagnosticRule[];
}

export interface Lesson {
  id: string;
  skillId?: string;
  moduleId?: string;
  courseId?: string;
  title: string;
  slug?: string;
  description?: string;
  order: number;
  estimatedMinutes: number;
  xpReward: number;
  conceptIds?: string[];
  challenges?: Challenge[];
  blocks?: LessonBlock[];
}

export interface SkillNode {
  id: string;
  unitId: string;
  title: string;
  slug: string;
  description: string;
  order: number;
  status: SkillStatus;
  mastery: number;
  maxMastery: number;
  iconName: string;
  requiresSkillId?: string;
  lessons: Lesson[];
  pathOffset?: number;
}

export interface CheckpointNode {
  id: string;
  unitId: string;
  title: string;
  description: string;
  status: SkillStatus;
  xpReward: number;
}

export interface Unit {
  id: string;
  courseId: string;
  unitNumber: number;
  title: string;
  subtitle: string;
  description: string;
  themeColor: string;
  accentBg: string;
  skills: SkillNode[];
  checkpoint: CheckpointNode;
}

export interface Module {
  id: string;
  courseId: string;
  title: string;
  description: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  accentColor: string;
  bgLightColor: string;
  borderColor: string;
  difficulty: DifficultyLevel;
  estimatedHours: number;
  totalLessons: number;
  isPrimary: boolean;
  isLocked: boolean;
  skillsTaught: string[];
  modules: Module[];
}

export interface LearningCourse {
  id: string;
  title: string;
  slug: string;
  icon: string;
  description: string;
  units: Unit[];
}

export interface TestResult {
  testId: string;
  description: string;
  passed: boolean;
  actualOutput: string;
  expectedOutput: string;
  error?: string;
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  error?: string;
  diagnostic?: {
    mistakeType: string;
    message: string;
    fixSuggestion?: string;
  };
  testResults: TestResult[];
  executionTimeMs: number;
}

export interface MistakeRecord {
  id: string;
  skillId?: string;
  skillTitle?: string;
  challengeId?: string;
  lessonId: string;
  lessonTitle?: string;
  conceptId?: string;
  conceptName?: string;
  mistakeType: string;
  explanation: string;
  userCode: string;
  frequency: number;
  timestamp: string;
  resolved: boolean;
}

export interface DailyGoal {
  lessonsTarget: number;
  lessonsCompleted: number;
  xpTarget: number;
  xpEarned: number;
}

export interface DailyActivity {
  date: string;
  lessonsCount: number;
  xp: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number;
  maxProgress: number;
}

export interface UserProgressState {
  id?: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string;
  activeCourseId: string;
  streak: number;
  bestStreak?: number;
  level?: number;
  totalXp: number;
  energy: number;
  maxEnergy: number;
  dailyGoalXp: number;
  dailyGoalEarnedXp: number;
  completedSkillIds: string[];
  currentSkillId: string;
  completedLessonIds: string[];
  skillMastery: Record<string, number>;
  mistakes: MistakeRecord[];
  dailyGoal: DailyGoal;
  activityHistory: DailyActivity[];
  achievements: Achievement[];
  // Streak Freeze & Protection (v4)
  freezeInventory?: number;
  freezeRepairsProgress?: number;
  freezeUsedDates?: string[];
  lastActiveDate?: string;
  streakRescuePending?: boolean;
  _version?: number;
  _curriculumVersion?: number;
}

export type UserProfile = UserProgressState;
