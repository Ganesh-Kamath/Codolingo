const fs = require('fs');
const path = require('path');

const curriculumDir = 'C:\\Users\\kamat\\Desktop\\Pythoncurriculum\\python_content';

// Mapping function from raw curriculum item to LessonBlock
function mapCurriculumItemToBlock(item) {
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
    case 'micro_lesson': {
      return {
        ...baseBlock,
        type: 'explanation',
        content: item.content,
        contentMarkdown: item.content
      };
    }

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
          const letter = String.fromCharCode(65 + idx); // 'A', 'B', 'C', 'D'
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

      // Check if at least one option is marked correct
      const hasCorrect = optionsList.some(o => o.isCorrect);
      if (!hasCorrect && optionsList.length > 0) {
        // Fallback: match by index if letter provided
        if (typeof item.correct_answer === 'string' && /^[A-D]$/i.test(item.correct_answer)) {
          const idx = item.correct_answer.toUpperCase().charCodeAt(0) - 65;
          if (optionsList[idx]) optionsList[idx].isCorrect = true;
        }
      }

      return {
        ...baseBlock,
        type: item.type === 'real_world_scenario' || item.type === 'error_diagnosis' ? item.type : 'multiple_choice',
        content: item.prompt,
        options: optionsList,
        correctAnswer: item.correct_answer
      };
    }

    case 'fill_in_the_blank': {
      return {
        ...baseBlock,
        type: 'fill_in_the_blank',
        content: item.prompt,
        acceptedAnswers: item.accepted_answers || (item.correct_answer ? [item.correct_answer] : []),
        correctAnswer: item.correct_answer || (item.accepted_answers ? item.accepted_answers[0] : '')
      };
    }

    case 'code_ordering': {
      return {
        ...baseBlock,
        type: 'code_ordering',
        content: item.prompt,
        orderingOptions: Array.isArray(item.options) ? [...item.options] : [],
        correctAnswer: item.correct_answer || item.options
      };
    }

    case 'match_code_to_concept': {
      return {
        ...baseBlock,
        type: 'match_code_to_concept',
        content: item.prompt,
        rawOptions: item.options,
        correctAnswer: item.correct_answer
      };
    }

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
        type: item.type === 'fix_the_code' ? 'fix_code' : 'write_code',
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

// Test mapping on all lessons
let mappedCount = 0;
let errors = 0;

for (const unit of fs.readdirSync(curriculumDir).sort()) {
  const uPath = path.join(curriculumDir, unit);
  if (!fs.statSync(uPath).isDirectory()) continue;
  for (const f of fs.readdirSync(uPath).filter(x => x.endsWith('.json')).sort()) {
    const data = JSON.parse(fs.readFileSync(path.join(uPath, f), 'utf8'));
    for (const it of (data.items || [])) {
      try {
        const b = mapCurriculumItemToBlock(it);
        mappedCount++;
        if (!b.id || !b.type) {
          console.error('Invalid block for item:', it.id);
          errors++;
        }
      } catch (e) {
        console.error('Error mapping item:', it.id, e);
        errors++;
      }
    }
  }
}

console.log('Successfully mapped items:', mappedCount, 'Errors:', errors);
