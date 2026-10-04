import { LessonBlock } from '../types';

export interface RawCurriculumItem {
  id: string;
  type: string;
  concept?: string;
  skill?: string;
  difficulty?: string;
  prerequisites?: string[];
  title?: string;
  content?: string;
  prompt?: string;
  explanation?: string;
  options?: any;
  correct_answer?: any;
  common_mistake?: string;
  accepted_answers?: string[];
  starter_code?: string;
  solution_code?: string;
  hint?: string;
  expected_output?: string;
  test_cases?: Array<{
    input?: string;
    expected_output?: string;
    expected?: string;
    expected_behavior?: string;
    description?: string;
  }>;
  metadata?: any;
}

export interface RawCurriculumLesson {
  lesson_id: string;
  title: string;
  unit: string;
  unit_num?: number;
  learning_objectives?: string[];
  items: RawCurriculumItem[];
}

export const TYPE_STAGE_MAP: Record<string, string> = {
  micro_lesson: 'understand',
  multiple_choice: 'recall',
  fill_in_the_blank: 'recall',
  code_prediction: 'predict',
  output_prediction: 'predict',
  trace_execution: 'predict',
  code_ordering: 'apply',
  match_code_to_concept: 'apply',
  real_world_scenario: 'apply',
  error_diagnosis: 'debug',
  fix_the_code: 'debug',
  write_the_code: 'code',
  mini_challenge: 'challenge',
  refactoring_challenge: 'challenge'
};

export const STAGE_ORDER = ['understand', 'recall', 'predict', 'apply', 'debug', 'code', 'challenge'] as const;

export const IDEAL_QUOTAS: Record<string, number> = {
  understand: 2,
  recall: 2,
  predict: 2,
  apply: 2,
  debug: 3,
  code: 3,
  challenge: 1
};

/**
 * Deterministically selects approximately 15 balanced, pedagogically ordered
 * items from the full candidate pool of 30 items.
 */
export function selectLessonQuestions(
  lesson: RawCurriculumLesson,
  targetCount: number = 15
): RawCurriculumItem[] {
  const items = lesson.items || [];
  if (items.length <= targetCount) return [...items];

  const byStage: Record<string, Array<RawCurriculumItem & { originalIndex: number }>> = {
    understand: [],
    recall: [],
    predict: [],
    apply: [],
    debug: [],
    code: [],
    challenge: []
  };

  items.forEach((item, originalIndex) => {
    const stage = TYPE_STAGE_MAP[item.type] || 'recall';
    byStage[stage].push({ ...item, originalIndex });
  });

  const quotas: Record<string, number> = {};
  let allocated = 0;

  for (const s of STAGE_ORDER) {
    const avail = byStage[s].length;
    const ideal = IDEAL_QUOTAS[s] || 2;
    quotas[s] = Math.min(avail, ideal);
    allocated += quotas[s];
  }

  const priority = ['code', 'debug', 'predict', 'apply', 'recall', 'challenge', 'understand'];
  while (allocated < targetCount) {
    let progressed = false;
    for (const s of priority) {
      if (allocated < targetCount && byStage[s].length > quotas[s]) {
        quotas[s]++;
        allocated++;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  const selectedItems: Array<RawCurriculumItem & { originalIndex: number }> = [];

  for (const stage of STAGE_ORDER) {
    const targetStageCount = quotas[stage] || 0;
    if (targetStageCount <= 0) continue;

    const pool = byStage[stage];
    const pickedInStage: Array<RawCurriculumItem & { originalIndex: number }> = [];
    const usedConcepts = new Set<string>();
    const usedTypes = new Set<string>();
    const remaining = [...pool];

    while (pickedInStage.length < targetStageCount && remaining.length > 0) {
      remaining.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (a.concept && !usedConcepts.has(a.concept)) scoreA += 10;
        if (b.concept && !usedConcepts.has(b.concept)) scoreB += 10;

        if (!usedTypes.has(a.type)) scoreA += 5;
        if (!usedTypes.has(b.type)) scoreB += 5;

        const avgPickedIdx = pickedInStage.length > 0
          ? pickedInStage.reduce((acc, p) => acc + p.originalIndex, 0) / pickedInStage.length
          : 0;
        scoreA += Math.abs(a.originalIndex - avgPickedIdx) * 0.1;
        scoreB += Math.abs(b.originalIndex - avgPickedIdx) * 0.1;

        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.originalIndex - b.originalIndex;
      });

      const picked = remaining.shift();
      if (!picked) break;
      pickedInStage.push(picked);
      if (picked.concept) usedConcepts.add(picked.concept);
      usedTypes.add(picked.type);
    }

    pickedInStage.sort((a, b) => a.originalIndex - b.originalIndex);
    selectedItems.push(...pickedInStage);
  }

  if (selectedItems.length < targetCount) {
    const selectedIds = new Set(selectedItems.map(x => x.id));
    for (let i = 0; i < items.length; i++) {
      if (selectedItems.length >= targetCount) break;
      const item = items[i];
      if (!selectedIds.has(item.id)) {
        selectedItems.push({ ...item, originalIndex: i });
        selectedIds.add(item.id);
      }
    }
    selectedItems.sort((a, b) => {
      const stageA = STAGE_ORDER.indexOf(TYPE_STAGE_MAP[a.type] as any || 'recall');
      const stageB = STAGE_ORDER.indexOf(TYPE_STAGE_MAP[b.type] as any || 'recall');
      if (stageA !== stageB) return stageA - stageB;
      return a.originalIndex - b.originalIndex;
    });
  }

  return selectedItems.map(({ originalIndex, ...rest }) => rest as RawCurriculumItem);
}

/**
 * Transforms a raw curriculum item into a fully interactive LessonBlock.
 */
export function mapItemToBlock(item: RawCurriculumItem): LessonBlock {
  const baseBlock: LessonBlock = {
    id: item.id,
    type: item.type as any,
    title: item.title || (item.prompt ? item.prompt.slice(0, 60) : 'Exercise'),
    subtitle: item.concept ? item.concept.replace(/_/g, ' ') : undefined,
    concept: item.concept,
    skill: item.skill,
    difficulty: item.difficulty,
    prompt: item.prompt,
    explanation: item.explanation,
    commonMistake: item.common_mistake,
    hint: item.hint
  };

  switch (item.type) {
    case 'micro_lesson':
      return {
        ...baseBlock,
        type: 'explanation',
        content: item.content,
        contentMarkdown: item.content
      };

    case 'multiple_choice':
    case 'real_world_scenario':
    case 'error_diagnosis':
    case 'output_prediction':
    case 'code_prediction':
    case 'trace_execution': {
      let optionsList: Array<{ id: string; text: string; isCorrect: boolean; explanation: string }> = [];
      const opts = item.options || [];

      if (Array.isArray(opts)) {
        optionsList = opts.map((optText: string, idx: number) => {
          const letter = String.fromCharCode(65 + idx);
          let isCorrect = false;

          if (item.correct_answer === letter) {
            isCorrect = true;
          } else if (typeof item.correct_answer === 'string') {
            const cleanAns = item.correct_answer.trim();
            const cleanOpt = optText.trim();
            if (cleanAns === cleanOpt || cleanOpt.startsWith(cleanAns + '.') || cleanOpt.startsWith(cleanAns + ':')) {
              isCorrect = true;
            }
          }

          return {
            id: `opt_${idx}`,
            text: optText,
            isCorrect,
            explanation: isCorrect ? (item.explanation || 'Correct') : (item.common_mistake || 'Incorrect choice')
          };
        });
      }

      const hasCorrect = optionsList.some(o => o.isCorrect);
      if (!hasCorrect && optionsList.length > 0) {
        if (typeof item.correct_answer === 'string' && /^[A-D]$/i.test(item.correct_answer)) {
          const idx = item.correct_answer.toUpperCase().charCodeAt(0) - 65;
          if (optionsList[idx]) optionsList[idx].isCorrect = true;
        } else {
          const foundIdx = optionsList.findIndex(o => o.text.includes(String(item.correct_answer)));
          if (foundIdx >= 0) optionsList[foundIdx].isCorrect = true;
          else optionsList[0].isCorrect = true;
        }
      }

      return {
        ...baseBlock,
        type: item.type as any,
        content: item.prompt,
        options: optionsList,
        correctAnswer: item.correct_answer
      };
    }

    case 'fill_in_the_blank':
      return {
        ...baseBlock,
        type: 'fill_in_the_blank',
        content: item.prompt,
        acceptedAnswers: item.accepted_answers || (item.correct_answer ? [item.correct_answer] : []),
        correctAnswer: item.correct_answer || (item.accepted_answers ? item.accepted_answers[0] : '')
      };

    case 'code_ordering':
      return {
        ...baseBlock,
        type: 'code_ordering',
        content: item.prompt,
        orderingOptions: Array.isArray(item.options) ? [...item.options] : [],
        correctAnswer: item.correct_answer || item.options
      };

    case 'match_code_to_concept':
      return {
        ...baseBlock,
        type: 'match_code_to_concept',
        content: item.prompt,
        rawOptions: item.options,
        correctAnswer: item.correct_answer
      };

    case 'write_the_code':
    case 'fix_the_code':
    case 'mini_challenge':
    case 'refactoring_challenge': {
      const tests: Array<{ id: string; description: string; input?: string; expectedOutput: string }> = [];
      if (Array.isArray(item.test_cases)) {
        item.test_cases.forEach((tc, idx) => {
          tests.push({
            id: `tc_${idx}`,
            description: tc.description || `Test Case ${idx + 1}`,
            input: tc.input,
            expectedOutput: String(tc.expected_output || tc.expected || tc.expected_behavior || '')
          });
        });
      }

      return {
        ...baseBlock,
        type: item.type === 'fix_the_code' ? 'fix_code' : (item.type === 'write_the_code' ? 'write_code' : item.type as any),
        content: item.prompt,
        starterCode: item.starter_code || '# Write your code below\n',
        solutionCode: item.solution_code || '',
        tests,
        hint: item.hint
      };
    }

    default:
      return {
        ...baseBlock,
        type: 'explanation',
        content: item.prompt || item.content
      };
  }
}
