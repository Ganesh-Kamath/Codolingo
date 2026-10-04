const fs = require('fs');
const path = require('path');

const curriculumDir = path.resolve('src/curriculum/python/content');
const manifestPath = path.resolve('src/curriculum/python/manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

// Sinuous curve patterns for path offsets: cycles through left, center, right
const PATH_OFFSETS = [0, -0.6, 0.6, -0.5, 0.5, 0, -0.7, 0.7];

// Color palette for 43 units
const PALETTES = [
  { themeColor: '#10B981', accentBg: '#ECFDF5' }, // Emerald
  { themeColor: '#3B82F6', accentBg: '#EFF6FF' }, // Blue
  { themeColor: '#8B5CF6', accentBg: '#F5F3FF' }, // Purple
  { themeColor: '#F59E0B', accentBg: '#FFFBEB' }, // Amber
  { themeColor: '#06B6D4', accentBg: '#ECFEFF' }, // Cyan
  { themeColor: '#EC4899', accentBg: '#FDF2F8' }, // Pink
  { themeColor: '#6366F1', accentBg: '#EEF2FF' }, // Indigo
  { themeColor: '#14B8A6', accentBg: '#F0FDFA' }, // Teal
  { themeColor: '#F97316', accentBg: '#FFF7ED' }, // Orange
  { themeColor: '#84CC16', accentBg: '#F7FEE7' }, // Lime
  { themeColor: '#E11D48', accentBg: '#FFF1F2' }  // Rose
];

function getIconForLesson(title, unitTitle) {
  const t = (title + ' ' + unitTitle).toLowerCase();
  if (t.includes('print') || t.includes('hello')) return 'player-play';
  if (t.includes('variable') || t.includes('naming')) return 'variable';
  if (t.includes('math') || t.includes('operator')) return 'calculator';
  if (t.includes('condition') || t.includes('if') || t.includes('logic')) return 'git-branch';
  if (t.includes('loop') || t.includes('while') || t.includes('for')) return 'repeat';
  if (t.includes('string') || t.includes('text')) return 'quote';
  if (t.includes('list') || t.includes('array')) return 'list';
  if (t.includes('dict') || t.includes('hash')) return 'book-open';
  if (t.includes('function') || t.includes('def')) return 'code';
  if (t.includes('error') || t.includes('debug')) return 'bug';
  if (t.includes('file') || t.includes('json')) return 'file-text';
  if (t.includes('class') || t.includes('object') || t.includes('oop')) return 'box';
  if (t.includes('test')) return 'check-circle';
  if (t.includes('api') || t.includes('network')) return 'globe';
  if (t.includes('database') || t.includes('sql')) return 'database';
  if (t.includes('async') || t.includes('concurrency')) return 'zap';
  if (t.includes('tree') || t.includes('graph')) return 'git-commit';
  if (t.includes('project') || t.includes('capstone')) return 'award';
  if (t.includes('mastery')) return 'sparkles';
  return 'code';
}

const TYPE_STAGE_MAP = {
  'micro_lesson': 'understand',
  'multiple_choice': 'recall',
  'fill_in_the_blank': 'recall',
  'code_prediction': 'predict',
  'output_prediction': 'predict',
  'trace_execution': 'predict',
  'code_ordering': 'apply',
  'match_code_to_concept': 'apply',
  'real_world_scenario': 'apply',
  'error_diagnosis': 'debug',
  'fix_the_code': 'debug',
  'write_the_code': 'code',
  'mini_challenge': 'challenge',
  'refactoring_challenge': 'challenge'
};

const STAGE_ORDER = ['understand', 'recall', 'predict', 'apply', 'debug', 'code', 'challenge'];
const IDEAL_QUOTAS = { understand: 2, recall: 2, predict: 2, apply: 2, debug: 3, code: 3, challenge: 1 };

function selectLessonQuestions(lesson, targetCount = 15) {
  const items = lesson.items || [];
  if (items.length <= targetCount) return [...items];

  const byStage = { understand: [], recall: [], predict: [], apply: [], debug: [], code: [], challenge: [] };

  items.forEach((item, originalIndex) => {
    let stage = TYPE_STAGE_MAP[item.type] || 'recall';
    byStage[stage].push({ ...item, originalIndex });
  });

  const quotas = {};
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

  const selectedItems = [];

  for (const stage of STAGE_ORDER) {
    const targetStageCount = quotas[stage] || 0;
    if (targetStageCount <= 0) continue;

    const pool = byStage[stage];
    const pickedInStage = [];
    const usedConcepts = new Set();
    const usedTypes = new Set();
    const remaining = [...pool];

    while (pickedInStage.length < targetStageCount && remaining.length > 0) {
      remaining.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        if (!usedConcepts.has(a.concept)) scoreA += 10;
        if (!usedConcepts.has(b.concept)) scoreB += 10;

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
      pickedInStage.push(picked);
      if (picked.concept) usedConcepts.add(picked.concept);
      usedTypes.add(picked.type);
    }

    pickedInStage.sort((a, b) => a.originalIndex - b.originalIndex);
    selectedItems.push(...pickedInStage);
  }

  if (selectedItems.length < targetCount) {
    const selectedIds = new Set(selectedItems.map(x => x.id));
    for (const item of items) {
      if (selectedItems.length >= targetCount) break;
      if (!selectedIds.has(item.id)) {
        selectedItems.push(item);
        selectedIds.add(item.id);
      }
    }
    selectedItems.sort((a, b) => {
      const stageA = STAGE_ORDER.indexOf(TYPE_STAGE_MAP[a.type] || 'recall');
      const stageB = STAGE_ORDER.indexOf(TYPE_STAGE_MAP[b.type] || 'recall');
      if (stageA !== stageB) return stageA - stageB;
      return items.findIndex(x => x.id === a.id) - items.findIndex(x => x.id === b.id);
    });
  }

  return selectedItems;
}

function mapItemToBlock(item) {
  const baseBlock = {
    id: item.id,
    type: item.type,
    title: item.title || item.prompt?.slice(0, 60) || 'Exercise',
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
      let optionsList = [];
      const opts = item.options || [];

      if (Array.isArray(opts)) {
        optionsList = opts.map((optText, idx) => {
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
            explanation: isCorrect ? item.explanation : (item.common_mistake || 'Incorrect choice')
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
        type: item.type,
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
      const tests = [];
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
        type: item.type === 'fix_the_code' ? 'fix_code' : (item.type === 'write_the_code' ? 'write_code' : item.type),
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

// Generate the complete Unit structure
const units = [];
const selectedLessonsMap = {};
let prevSkillId = null;

manifest.units.forEach((u, uIdx) => {
  const palette = PALETTES[uIdx % PALETTES.length];
  const unitNum = uIdx + 1;
  const unitId = u.unit_id; // 'unit_01', etc.

  const skills = [];

  u.lessons.forEach((les, lIdx) => {
    const lessonId = les.lesson_id; // '1.1', etc.
    const skillId = `py_skill_${lessonId.replace(/\./g, '_')}`;
    const offset = PATH_OFFSETS[(skills.length) % PATH_OFFSETS.length];

    const lessonJsonPath = path.join(curriculumDir, u.unit_id, path.basename(les.file));
    let selectedBlocks = [];

    if (fs.existsSync(lessonJsonPath)) {
      const lessonRaw = JSON.parse(fs.readFileSync(lessonJsonPath, 'utf8'));
      const selected = selectLessonQuestions(lessonRaw, 15);
      selectedBlocks = selected.map(mapItemToBlock);
      selectedLessonsMap[lessonId] = {
        lessonId,
        title: les.title,
        unitId,
        unitTitle: u.title,
        blocks: selectedBlocks,
        totalPoolCount: lessonRaw.items.length
      };
    }

    const lessonObj = {
      id: lessonId,
      skillId,
      moduleId: unitId,
      courseId: 'python',
      title: les.title,
      order: lIdx + 1,
      estimatedMinutes: Math.max(3, Math.round(selectedBlocks.length * 0.8)),
      xpReward: les.is_project ? 50 : 25,
      conceptIds: les.concepts || []
      // Note: blocks are accessed through courseService / selectedLessonsData
    };

    const skillNode = {
      id: skillId,
      unitId,
      title: les.title,
      slug: les.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: `Master ${les.title} through 15 targeted interactive coding exercises.`,
      order: lIdx + 1,
      status: (unitNum === 1 && lIdx === 0) ? 'completed' : ((unitNum === 1 && lIdx === 1) ? 'current' : 'locked'),
      mastery: (unitNum === 1 && lIdx === 0) ? 5 : ((unitNum === 1 && lIdx === 1) ? 2 : 0),
      maxMastery: 5,
      iconName: getIconForLesson(les.title, u.title),
      requiresSkillId: prevSkillId || undefined,
      lessons: [lessonObj],
      pathOffset: offset
    };

    prevSkillId = skillId;
    skills.push(skillNode);
  });

  const checkpoint = {
    id: `chk_${unitId}`,
    unitId,
    title: `${u.title} Checkpoint`,
    description: `Demonstrate mastery of all concepts in ${u.title}.`,
    status: unitNum === 1 ? 'unlocked' : 'locked',
    xpReward: 100
  };

  units.push({
    id: unitId,
    courseId: 'python',
    unitNumber: unitNum,
    title: `Unit ${unitNum}: ${u.title}`,
    subtitle: `${skills.length} interactive lessons • 15 questions per lesson`,
    description: `Comprehensive mastery of ${u.title}.`,
    themeColor: palette.themeColor,
    accentBg: palette.accentBg,
    skills,
    checkpoint
  });
});

console.log(`Generated ${units.length} units with ${Object.keys(selectedLessonsMap).length} lessons.`);

// Write selectedLessonsMap to JSON
const selectedLessonsPath = path.resolve('src/curriculum/python/selectedLessons.json');
fs.writeFileSync(selectedLessonsPath, JSON.stringify(selectedLessonsMap, null, 2));
console.log(`Saved selected lessons to ${selectedLessonsPath} (${(fs.statSync(selectedLessonsPath).size / (1024 * 1024)).toFixed(2)} MB)`);

// Write Course Structure
const pythonCourseTS = `import { LearningCourse } from '../../types';

export const PYTHON_COURSE: LearningCourse = {
  id: 'python',
  title: 'Python Career Track',
  slug: 'python',
  icon: 'Terminal',
  description: 'Complete 43-unit career curriculum from first principles to professional Python backend, async, and DSA mastery.',
  units: ${JSON.stringify(units, null, 2)}
};
`;

const courseDataPath = path.resolve('src/curriculum/python/pythonCourse.ts');
fs.writeFileSync(courseDataPath, pythonCourseTS);
console.log(`Saved pythonCourse.ts to ${courseDataPath} (${(fs.statSync(courseDataPath).size / 1024).toFixed(2)} KB)`);
