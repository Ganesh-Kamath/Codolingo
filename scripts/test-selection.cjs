const fs = require('fs');
const path = require('path');

const curriculumDir = 'C:\\Users\\kamat\\Desktop\\Pythoncurriculum\\python_content';

// Mapping of types to stages
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

// Default ideal target counts per stage (sums to 15)
const IDEAL_QUOTAS = {
  understand: 2,
  recall: 2,
  predict: 2,
  apply: 2,
  debug: 3,
  code: 3,
  challenge: 1
};

function selectLessonQuestions(lesson, targetCount = 15) {
  const items = lesson.items || [];
  if (items.length <= targetCount) return [...items];

  // Group items by stage
  const byStage = {
    understand: [],
    recall: [],
    predict: [],
    apply: [],
    debug: [],
    code: [],
    challenge: []
  };

  items.forEach((item, originalIndex) => {
    let stage = TYPE_STAGE_MAP[item.type] || 'recall';
    
    // If it's a hard write_the_code or hard fix_the_code at the very end of lesson, it can qualify as challenge if needed
    if (stage === 'code' && item.difficulty === 'hard' && originalIndex >= 24) {
      // Available as challenge candidate too
    }
    byStage[stage].push({ ...item, originalIndex });
  });

  // Calculate actual quotas based on what's available
  const availableStages = STAGE_ORDER.filter(s => byStage[s].length > 0);
  const quotas = {};
  let allocated = 0;

  // First pass: assign base quotas up to available
  for (const s of STAGE_ORDER) {
    const avail = byStage[s].length;
    const ideal = IDEAL_QUOTAS[s] || 2;
    quotas[s] = Math.min(avail, ideal);
    allocated += quotas[s];
  }

  // Second pass: if under targetCount, distribute remaining slots to available stages with surplus
  while (allocated < targetCount) {
    let progressed = false;
    // Prefer code, debug, predict, apply, recall, understand, challenge
    const priority = ['code', 'debug', 'predict', 'apply', 'recall', 'challenge', 'understand'];
    for (const s of priority) {
      if (allocated < targetCount && byStage[s].length > quotas[s]) {
        quotas[s]++;
        allocated++;
        progressed = true;
      }
    }
    if (!progressed) break;
  }

  // Selection within each stage prioritizing concept diversity and skill diversity
  const selectedItems = [];

  for (const stage of STAGE_ORDER) {
    const targetStageCount = quotas[stage] || 0;
    if (targetStageCount <= 0) continue;

    const pool = byStage[stage];
    const pickedInStage = [];
    const usedConcepts = new Set();
    const usedTypes = new Set();

    // Score function for diversity
    // Higher score = better candidate
    const remaining = [...pool];

    while (pickedInStage.length < targetStageCount && remaining.length > 0) {
      // Find best item that maximizes concept and type diversity
      remaining.sort((a, b) => {
        let scoreA = 0;
        let scoreB = 0;

        // Prefer unused concept
        if (!usedConcepts.has(a.concept)) scoreA += 10;
        if (!usedConcepts.has(b.concept)) scoreB += 10;

        // Prefer unused question type within stage
        if (!usedTypes.has(a.type)) scoreA += 5;
        if (!usedTypes.has(b.type)) scoreB += 5;

        // Spread across original lesson positions (avoid clustering)
        const avgPickedIdx = pickedInStage.length > 0
          ? pickedInStage.reduce((acc, p) => acc + p.originalIndex, 0) / pickedInStage.length
          : 0;
        const distA = Math.abs(a.originalIndex - avgPickedIdx);
        const distB = Math.abs(b.originalIndex - avgPickedIdx);
        scoreA += distA * 0.1;
        scoreB += distB * 0.1;

        if (scoreB !== scoreA) return scoreB - scoreA;
        return a.originalIndex - b.originalIndex;
      });

      const picked = remaining.shift();
      pickedInStage.push(picked);
      if (picked.concept) usedConcepts.add(picked.concept);
      usedTypes.add(picked.type);
    }

    // Sort items within stage by original index for natural pedagogical continuity
    pickedInStage.sort((a, b) => a.originalIndex - b.originalIndex);
    selectedItems.push(...pickedInStage);
  }

  // If still slightly under targetCount, backfill from remaining unselected items maintaining order
  if (selectedItems.length < targetCount) {
    const selectedIds = new Set(selectedItems.map(x => x.id));
    for (const item of items) {
      if (selectedItems.length >= targetCount) break;
      if (!selectedIds.has(item.id)) {
        selectedItems.push(item);
        selectedIds.add(item.id);
      }
    }
    // Re-sort according to stage progression
    selectedItems.sort((a, b) => {
      const stageA = STAGE_ORDER.indexOf(TYPE_STAGE_MAP[a.type] || 'recall');
      const stageB = STAGE_ORDER.indexOf(TYPE_STAGE_MAP[b.type] || 'recall');
      if (stageA !== stageB) return stageA - stageB;
      const idxA = items.findIndex(x => x.id === a.id);
      const idxB = items.findIndex(x => x.id === b.id);
      return idxA - idxB;
    });
  }

  return selectedItems;
}

// Test across all 244 lessons
let totalSelected = 0;
const counts = {};
const stageCounts = {};

for (const unit of fs.readdirSync(curriculumDir).sort()) {
  const uPath = path.join(curriculumDir, unit);
  if (!fs.statSync(uPath).isDirectory()) continue;
  for (const f of fs.readdirSync(uPath).filter(x => x.endsWith('.json')).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(uPath, f), 'utf8'));
    const selected = selectLessonQuestions(data, 15);
    totalSelected += selected.length;
    counts[selected.length] = (counts[selected.length] || 0) + 1;
    for (const item of selected) {
      const st = TYPE_STAGE_MAP[item.type] || 'other';
      stageCounts[st] = (stageCounts[st] || 0) + 1;
    }
  }
}

console.log('Total Selected Items across all 244 lessons:', totalSelected);
console.log('Distribution of item counts per lesson:', counts);
console.log('Stage distribution across all selected items:', stageCounts);

// Print detailed sample for Lesson 1.1 and Lesson 1.4
const l1 = JSON.parse(fs.readFileSync(path.join(curriculumDir, 'unit_01', '1.1_what_is_programming.json'), 'utf8'));
const sel1 = selectLessonQuestions(l1, 15);
console.log('\n--- Selected for 1.1 What is Programming (' + sel1.length + ' items) ---');
sel1.forEach((it, i) => console.log(`${i+1}. [${it.type}] (${it.difficulty}) ${it.id} - ${it.concept || ''}: ${(it.title || it.prompt || '').slice(0, 50)}...`));

const l4 = JSON.parse(fs.readFileSync(path.join(curriculumDir, 'unit_01', '1.4_the_print_function.json'), 'utf8'));
const sel4 = selectLessonQuestions(l4, 15);
console.log('\n--- Selected for 1.4 The Print Function (' + sel4.length + ' items) ---');
sel4.forEach((it, i) => console.log(`${i+1}. [${it.type}] (${it.difficulty}) ${it.id} - ${it.concept || ''}: ${(it.title || it.prompt || '').slice(0, 50)}...`));
