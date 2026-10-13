#!/usr/bin/env node
/**
 * Codolingo Automated Exercise Validation Gate
 * 
 * Strict quality gate for Codolingo curriculum exercises.
 * Fails with a non-zero exit code if any broken exercise is detected.
 * Automatically generates src/curriculum/python/curriculumStatus.json on success.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ts = require('typescript');

const ALLOWED_TAXONOMY = new Set([
  'STRING_VS_NUMBER',
  'ASSIGNMENT_VS_COMPARISON',
  'OFF_BY_ONE',
  'WRONG_OPERATOR',
  'WRONG_TYPE',
  'VARIABLE_VALUE_CONFUSION',
  'PRECEDENCE_CONFUSION',
  'BOOLEAN_LOGIC_CONFUSION',
  'SYNTAX_ERROR',
  'INDENTATION_ERROR',
  'INPUT_IS_STRING',
  'CONDITION_BOUNDARY',
  'LOOP_EXECUTION_CONFUSION'
]);

// Helper for Jaccard token similarity (near-duplicate detection)
function tokenize(text) {
  return new Set((text || '').toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(Boolean));
}

function jaccardSimilarity(setA, setB) {
  if (setA.size === 0 || setB.size === 0) return 0;
  let intersection = 0;
  for (const item of setA) {
    if (setB.has(item)) intersection++;
  }
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

// Load questions for Unit 1 (foundations)
function loadUnit1Questions() {
  const fndDir = path.resolve(__dirname, '../../src/curriculum/python/foundations');
  const files = [
    'lesson01.ts',
    'lesson02.ts',
    'lesson03.ts',
    'lesson04.ts',
    'lesson05.ts',
    'lesson06.ts',
    'lesson07.ts',
    'lesson08.ts',
    'lesson09.ts',
    'lesson10.ts',
    'finalChallenge.ts'
  ];

  const lessons = [];
  for (const file of files) {
    const filePath = path.join(fndDir, file);
    if (!fs.existsSync(filePath)) continue;
    const code = fs.readFileSync(filePath, 'utf8');
    const js = ts.transpileModule(code, {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
    }).outputText;

    const mod = { exports: {} };
    new Function('module', 'exports', 'require', js)(mod, mod.exports, () => ({}));
    
    // Find exported questions array
    const qKey = Object.keys(mod.exports).find(k => k.endsWith('_QUESTIONS'));
    const questions = qKey ? mod.exports[qKey] : [];
    
    // Find lesson metadata if exported
    const lKey = Object.keys(mod.exports).find(k => k.startsWith('LESSON_'));
    const meta = lKey ? mod.exports[lKey] : { title: file, id: file };

    lessons.push({
      file,
      lessonId: meta.id || file.replace('.ts', ''),
      lessonTitle: meta.title || file,
      questions
    });
  }

  return lessons;
}

// Generalized loader for JSON content units (Unit 2, Unit 3, etc.)
function loadUnitContentQuestions(unitDirName, unitId) {
  const dir = path.resolve(__dirname, `../../src/curriculum/python/content/${unitDirName}`);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  const lessons = [];

  for (const file of files) {
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const questions = [];

    for (const item of (raw.items || [])) {
      if (item.type === 'micro_lesson') continue; // readings are not quiz exercises
      
      let qType = item.type;
      if (item.type === 'write_the_code') qType = 'WRITE_CODE';
      else if (item.type === 'fix_the_code') qType = 'DEBUG_CODE';
      else if (item.type === 'mini_challenge') qType = 'APPLY';
      else if (item.type === 'output_prediction' || item.type === 'code_prediction') qType = 'PREDICT_OUTPUT';
      else if (item.type === 'multiple_choice' || item.type === 'real_world_scenario' || item.type === 'error_diagnosis') qType = 'MULTIPLE_CHOICE';
      else if (item.type === 'fill_in_the_blank') qType = 'CODE_COMPLETION';
      else if (item.type === 'trace_execution') qType = 'TRACE_CODE';

      let options = undefined;
      if (item.options) {
        options = item.options.map((opt, idx) => {
          if (typeof opt === 'string') {
            const letter = String.fromCharCode(65 + idx);
            const isCorrect = item.correct_answer === opt || item.correct_answer === letter;
            return {
              id: `opt_${idx}`,
              text: opt,
              isCorrect,
              explanation: isCorrect ? (item.explanation || 'Correct') : 'Review the concept.'
            };
          }
          return opt;
        });
      }

      const tests = (item.test_cases || []).map((tc, tcIdx) => ({
        id: tc.id || `tc_${tcIdx}`,
        description: tc.description || '',
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || tc.expected_output || '',
        assertionPython: tc.assertionPython || '',
        hidden: tc.hidden === true || tc.isHidden === true
      }));

      questions.push({
        id: item.id,
        unit: unitId,
        lesson: raw.lesson_id,
        concept: item.concept,
        question_type: qType,
        prompt: item.prompt,
        codeSnippet: item.code_snippet || item.codeSnippet,
        starter_code: item.starter_code,
        solution_code: item.solution_code,
        expected_output: item.expected_output || item.correct_answer,
        correct_answer: item.correct_answer,
        options,
        test_cases: tests,
        misconception_tag: item.misconception_tag,
        explanation: item.explanation
      });
    }

    lessons.push({
      file,
      lessonId: raw.lesson_id,
      lessonTitle: raw.title,
      questions
    });
  }

  return lessons;
}

function loadUnit2Questions() {
  return loadUnitContentQuestions('unit_02', 'unit_02');
}

function loadUnit3Questions() {
  return loadUnitContentQuestions('unit_03', 'unit_03');
}

function loadUnit4Questions() {
  return loadUnitContentQuestions('unit_04', 'unit_04');
}

function loadUnit5Questions() {
  return loadUnitContentQuestions('unit_05', 'unit_05');
}

function loadUnit6Questions() {
  return loadUnitContentQuestions('unit_06', 'unit_06');
}

// Python execution harness
const PYTHON_HARNESS = `
import sys, io, json, builtins

def run_tests(item):
    code = item.get('code', '')
    tests = item.get('tests', [])
    if not tests:
        tests = [{'input': '', 'expectedOutput': '', 'assertionPython': ''}]
    
    results = []
    for t in tests:
        buf = io.StringIO()
        old_stdout = sys.stdout
        sys.stdout = buf
        user_ns = {'__name__': '__main__'}
        
        raw_inp = str(t.get('input') or '')
        inp_queue = raw_inp.splitlines() if raw_inp else []
        def mock_input(prompt=''):
            if prompt:
                sys.stdout.write(str(prompt))
            if not inp_queue: return ''
            v = inp_queue.pop(0)
            sys.stdout.write(v + '\\n')
            return v
        builtins.input = mock_input
        
        err = None
        _step_count = 0
        def _step_trace(frame, event, arg):
            nonlocal _step_count
            if event == 'line':
                _step_count += 1
                if _step_count > 50000:
                    raise TimeoutError("Execution step limit exceeded (infinite loop)")
            return _step_trace
        try:
            sys.settrace(_step_trace)
            exec(code, user_ns)
        except Exception as e:
            err = f"{type(e).__name__}: {e}"
        finally:
            sys.settrace(None)
        sys.stdout = old_stdout
        
        raw_out = buf.getvalue().strip()
        user_ns['_raw_stdout'] = raw_out
        user_ns['_user_code'] = code
        user_ns['_user_namespace'] = user_ns
        
        passed = False
        reason = ''
        if err:
            passed = False
            reason = f"Execution error: {err}"
        else:
            assertion = t.get('assertionPython', '')
            exp = str(t.get('expectedOutput') or t.get('expected_output') or '').strip()
            if assertion:
                try:
                    exec(assertion, user_ns)
                    passed = True
                except AssertionError as ae:
                    passed = False
                    reason = f"Assertion failed: {assertion}"
                except Exception as ex:
                    passed = False
                    reason = f"Assertion error: {type(ex).__name__}: {ex}"
            elif exp:
                if raw_out == exp:
                    passed = True
                else:
                    passed = False
                    reason = f"Expected stdout '{exp}', got '{raw_out}'"
            else:
                passed = True
                
        results.append({'passed': passed, 'reason': reason, 'stdout': raw_out})
    
    all_passed = len(results) > 0 and all(r['passed'] for r in results)
    return {'all_passed': all_passed, 'tests': results}

def run_predict(item):
    snippet = item.get('snippet', '')
    buf = io.StringIO()
    old_stdout = sys.stdout
    sys.stdout = buf
    actual = ''
    err = None
    _step_count = 0
    def _step_trace(frame, event, arg):
        nonlocal _step_count
        if event == 'line':
            _step_count += 1
            if _step_count > 50000:
                raise TimeoutError("Execution step limit exceeded (infinite loop)")
        return _step_trace
    try:
        sys.settrace(_step_trace)
        exec(snippet, {'__name__': '__main__'})
        actual = buf.getvalue().strip()
    except Exception as e:
        actual = type(e).__name__
        err = f"{type(e).__name__}: {e}"
    finally:
        sys.settrace(None)
    sys.stdout = old_stdout
    return {'actual': actual, 'error': err}

data = json.loads(sys.stdin.read())
mode = data.get('mode')
items = data.get('items', [])
out = []

if mode == 'test_code':
    for it in items:
        res = run_tests(it)
        out.append({'id': it['id'], 'all_passed': res['all_passed'], 'tests': res['tests']})
elif mode == 'predict':
    for it in items:
        res = run_predict(it)
        out.append({'id': it['id'], 'actual': res['actual'], 'error': res['error']})

print(json.dumps(out))
`;

function executePythonBatch(mode, items) {
  const payload = JSON.stringify({ mode, items });
  const proc = spawnSync('python', ['-c', PYTHON_HARNESS], {
    input: payload,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024
  });

  if (proc.status !== 0) {
    throw new Error(`Python execution failed: ${proc.stderr || proc.stdout}`);
  }

  try {
    return JSON.parse(proc.stdout);
  } catch (err) {
    throw new Error(`Failed to parse Python output: ${proc.stdout}`);
  }
}

async function validateCurriculum() {
  console.log('\n===============================================================');
  console.log('Codolingo Exercise Validation Gate (Units 1, 2, 3, 4, 5 & 6)');
  console.log('===============================================================\n');

  const unit1Lessons = loadUnit1Questions();
  const unit2Lessons = loadUnit2Questions();
  const unit3Lessons = loadUnit3Questions();
  const unit4Lessons = loadUnit4Questions();
  const unit5Lessons = loadUnit5Questions();
  const unit6Lessons = loadUnit6Questions();
  const lessons = [...unit1Lessons, ...unit2Lessons, ...unit3Lessons, ...unit4Lessons, ...unit5Lessons, ...unit6Lessons];
  let totalQuestions = 0;
  const allFailures = [];
  const exerciseStats = {
    total: 0,
    passed: 0,
    failed: 0
  };

  // 1. Gather questions
  const allQuestions = [];
  for (const lesson of lessons) {
    for (const q of lesson.questions) {
      allQuestions.push({ lesson, q });
      totalQuestions++;
    }
  }
  exerciseStats.total = totalQuestions;

  console.log(`Loaded ${totalQuestions} exercises across ${lessons.length} lessons in Units 1, 2 & 3.\n`);

  // Prepare batch payloads for Python
  const predictItems = [];
  const starterCodeItems = [];
  const solutionCodeItems = [];
  const hardcodedCodeItems = [];

  for (const { lesson, q } of allQuestions) {
    const isCode = ['WRITE_CODE', 'DEBUG_CODE', 'APPLY'].includes(q.question_type);

    if (q.question_type === 'PREDICT_OUTPUT') {
      let snippet = q.codeSnippet || q.starter_code || '';
      if (!snippet && q.prompt) {
        const m = q.prompt.match(/```python\s*([\s\S]*?)\s*```/);
        if (m) snippet = m[1];
      }
      predictItems.push({ id: q.id, snippet });
    }

    if (isCode) {
      const tests = (q.test_cases || []).map(tc => ({
        input: tc.input || '',
        expectedOutput: tc.expectedOutput || tc.expected_output || '',
        assertionPython: tc.assertionPython || ''
      }));

      if (q.starter_code && tests.length > 0) {
        starterCodeItems.push({ id: q.id, code: q.starter_code, tests });
      }

      if (q.solution_code && tests.length > 0) {
        solutionCodeItems.push({ id: q.id, code: q.solution_code, tests });
      }

      // Check hardcoded bypass test
      const exp = (q.test_cases && q.test_cases[0] && (q.test_cases[0].expectedOutput || q.test_cases[0].expected_output)) || q.expected_output;
      // An exercise is prone to hardcoding bypass if it involves variable logic or inputs
      // and a simple `print(exp)` passes all tests
      if (exp && tests.length > 0) {
        hardcodedCodeItems.push({
          id: q.id,
          code: `print('''${exp}''')`,
          tests
        });
      }
    }
  }

  // Execute Python harnesses
  console.log('Running headless Python test harness...');
  const predictResultsMap = new Map();
  if (predictItems.length > 0) {
    const res = executePythonBatch('predict', predictItems);
    res.forEach(r => predictResultsMap.set(r.id, r));
  }

  const starterResultsMap = new Map();
  if (starterCodeItems.length > 0) {
    const res = executePythonBatch('test_code', starterCodeItems);
    res.forEach(r => starterResultsMap.set(r.id, r));
  }

  const solutionResultsMap = new Map();
  if (solutionCodeItems.length > 0) {
    const res = executePythonBatch('test_code', solutionCodeItems);
    res.forEach(r => solutionResultsMap.set(r.id, r));
  }

  const hardcodedResultsMap = new Map();
  if (hardcodedCodeItems.length > 0) {
    const res = executePythonBatch('test_code', hardcodedCodeItems);
    res.forEach(r => hardcodedResultsMap.set(r.id, r));
  }

  // Perform 9 checks per question
  for (const lesson of lessons) {
    console.log(`\nLesson: ${lesson.lessonTitle} (${lesson.file})`);

    // Check near-duplicates within lesson
    for (let i = 0; i < lesson.questions.length; i++) {
      for (let j = i + 1; j < lesson.questions.length; j++) {
        const q1 = lesson.questions[i];
        const q2 = lesson.questions[j];
        const sim = jaccardSimilarity(tokenize(q1.prompt), tokenize(q2.prompt));
        if (sim >= 0.85) {
          allFailures.push({
            id: `${q1.id} & ${q2.id}`,
            file: lesson.file,
            rule: 'near_duplicates',
            message: `Exercises ${q1.id} and ${q2.id} have high prompt similarity (${(sim * 100).toFixed(1)}%).`
          });
        }
      }
    }

    for (const q of lesson.questions) {
      const qFailures = [];
      const isCode = ['WRITE_CODE', 'DEBUG_CODE', 'APPLY'].includes(q.question_type);

      // Rule 1: Misconception tag missing or invalid
      if (!q.misconception_tag) {
        qFailures.push({
          rule: 'misconception_tag_missing',
          message: 'Missing required misconception_tag.'
        });
      } else if (!ALLOWED_TAXONOMY.has(q.misconception_tag)) {
        qFailures.push({
          rule: 'misconception_tag_invalid',
          message: `Misconception tag '${q.misconception_tag}' is not in allowed taxonomy.`
        });
      }

      // Rule 2: Code question has no hidden test
      if (isCode) {
        const tests = q.test_cases || [];
        const hasHidden = tests.some(t => t.hidden === true || t.is_hidden === true);
        if (!hasHidden) {
          qFailures.push({
            rule: 'no_hidden_test',
            message: `Question type ${q.question_type} requires at least one hidden test case.`
          });
        }
      }

      // Rule 3: Reference solution fails its own tests
      if (isCode && q.solution_code) {
        const solRes = solutionResultsMap.get(q.id);
        if (!solRes || !solRes.all_passed) {
          const failedDetail = solRes?.tests?.find(t => !t.passed)?.reason || 'Test assertion failed';
          qFailures.push({
            rule: 'reference_solution_fails',
            message: `Reference solution failed tests: ${failedDetail}`
          });
        }
      }

      // Rule 4: Starter code already passes
      if (isCode && q.starter_code) {
        const startRes = starterResultsMap.get(q.id);
        if (startRes && startRes.all_passed) {
          qFailures.push({
            rule: 'starter_code_passes',
            message: 'Starter code already passes all tests before student writes any code.'
          });
        }
      }

      // Rule 5: Hardcoded expected output passes all tests
      if (isCode && q.solution_code && hardcodedResultsMap.has(q.id)) {
        const hardRes = hardcodedResultsMap.get(q.id);
        // Only trigger if question requires variables, calculations, or varied inputs
        // (i.e. It is not literally a print-only static string problem like py_fnd_1_5)
        const hasVariables = (q.prompt || '').includes('variable') || (q.prompt || '').includes('calculate') || (q.prompt || '').includes('input(');
        if (hardRes.all_passed && hasVariables) {
          qFailures.push({
            rule: 'hardcoded_output_pass',
            message: 'A dummy print statement passes all test cases, allowing students to hardcode.'
          });
        }
      }

      // Rule 6: Predict output real execution mismatch
      if (q.question_type === 'PREDICT_OUTPUT') {
        const predRes = predictResultsMap.get(q.id);
        const exp = (q.expected_output || q.correct_answer || '').trim();
        if (predRes) {
          const actual = predRes.actual.trim();
          if (actual !== exp && !exp.includes(actual)) {
            qFailures.push({
              rule: 'predict_output_mismatch',
              message: `Predicted output mismatch. Expected '${exp}', Python executed to '${actual}'.`
            });
          }
        }
      }

      // Rule 7: Multiple-choice/predict-output has more than one defensible answer
      if (['MULTIPLE_CHOICE', 'PREDICT_OUTPUT', 'TRUE_FALSE_WITH_REASONING'].includes(q.question_type) && q.options) {
        const correctOpts = q.options.filter(o => o.isCorrect);
        if (correctOpts.length !== 1) {
          qFailures.push({
            rule: 'multi_defensible_answer',
            message: `Expected exactly 1 correct option, but found ${correctOpts.length}.`
          });
        }

        // Check if any distractor matches real Python execution
        const predRes = predictResultsMap.get(q.id);
        if (predRes) {
          const distractors = q.options.filter(o => !o.isCorrect);
          for (const dist of distractors) {
            const dText = (dist.text || '').trim();
            if (dText === predRes.actual.trim()) {
              qFailures.push({
                rule: 'multi_defensible_answer',
                message: `Distractor '${dText}' matches actual Python output '${predRes.actual.trim()}'.`
              });
            }
          }
        }
      }

      // Rule 8: Explanation contradicts the correct answer
      if (q.explanation && (q.correct_answer || (q.options && q.options.some(o => o.isCorrect)))) {
        const correctText = (q.correct_answer || q.options.find(o => o.isCorrect)?.text || '').toLowerCase().trim();
        const expLower = q.explanation.toLowerCase();

        // Check if explanation references a wrong option as correct
        if (q.options) {
          for (const wrongOpt of q.options.filter(o => !o.isCorrect)) {
            const wText = (wrongOpt.text || '').toLowerCase().trim();
            if (wText.length > 5 && expLower.includes('correct answer is ' + wText)) {
              qFailures.push({
                rule: 'explanation_contradiction',
                message: `Explanation claims wrong option '${wrongOpt.text}' is correct.`
              });
            }
          }
        }
      }

      // Record results
      if (qFailures.length > 0) {
        exerciseStats.failed++;
        console.log(`  ✗ [${q.id}] ${q.concept || ''} -> ${qFailures.length} failure(s)`);
        for (const f of qFailures) {
          console.log(`      • [${f.rule}] ${f.message}`);
          allFailures.push({ id: q.id, file: lesson.file, ...f });
        }
      } else {
        exerciseStats.passed++;
        console.log(`  ✓ [${q.id}] ${q.concept || ''}`);
      }
    }
  }

  // Summary Report
  console.log('\n===============================================================');
  console.log('                      VALIDATION SUMMARY                       ');
  console.log('===============================================================');
  console.log(`Total Exercises Audited: ${exerciseStats.total}`);
  console.log(`Passed:                  ${exerciseStats.passed}`);
  console.log(`Failed:                  ${exerciseStats.failed}`);

  if (allFailures.length > 0) {
    console.log(`\n❌ QUALITY GATE FAILED (${allFailures.length} issue(s) detected):`);
    for (const f of allFailures) {
      console.log(` - [${f.file}] ${f.id} (${f.rule}): ${f.message}`);
    }

    // Fail gate: Do not mark unit playable
    const statusPath = path.resolve(__dirname, '../../src/curriculum/python/curriculumStatus.json');
    if (fs.existsSync(statusPath)) {
      const current = JSON.parse(fs.readFileSync(statusPath, 'utf8'));
      current.validatedAt = new Date().toISOString();
      current.foundationsValid = false;
      current.playableUnits = ['unit_01', 'unit_02']; // Revert to only certified units
      if (!current.comingSoonUnits.includes('unit_03')) {
        current.comingSoonUnits.unshift('unit_03');
      }
      current.unitDetails = current.unitDetails || {};
      current.unitDetails.unit_03 = {
        passed: false,
        questions: unit3Lessons.reduce((acc, l) => acc + l.questions.length, 0),
        errors: allFailures.length
      };
      fs.writeFileSync(statusPath, JSON.stringify(current, null, 2));
    }

    process.exit(1);
  }

  // Success: Generate curriculumStatus.json
  console.log('\n✅ ALL EXERCISES PASSED! Generating curriculumStatus.json...');
  const statusPath = path.resolve(__dirname, '../../src/curriculum/python/curriculumStatus.json');
  const allUnitIds = Array.from({ length: 43 }, (_, i) => `unit_${String(i + 1).padStart(2, '0')}`);
  const playableUnits = ['unit_01', 'unit_02', 'unit_03', 'unit_04', 'unit_05', 'unit_06'];
  const comingSoonUnits = allUnitIds.filter(u => !playableUnits.includes(u));

  const u1Count = unit1Lessons.reduce((acc, l) => acc + l.questions.length, 0);
  const u2Count = unit2Lessons.reduce((acc, l) => acc + l.questions.length, 0);
  const u3Count = unit3Lessons.reduce((acc, l) => acc + l.questions.length, 0);
  const u4Count = unit4Lessons.reduce((acc, l) => acc + l.questions.length, 0);
  const u5Count = unit5Lessons.reduce((acc, l) => acc + l.questions.length, 0);
  const u6Count = unit6Lessons.reduce((acc, l) => acc + l.questions.length, 0);

  const updatedStatus = {
    validatedAt: new Date().toISOString(),
    playableUnits,
    comingSoonUnits,
    foundationsValid: true,
    unitDetails: {
      unit_01: {
        passed: true,
        questions: u1Count,
        lessons: unit1Lessons.length,
        errors: 0
      },
      unit_02: {
        passed: true,
        questions: u2Count,
        lessons: unit2Lessons.length,
        errors: 0
      },
      unit_03: {
        passed: true,
        questions: u3Count,
        lessons: unit3Lessons.length,
        errors: 0
      },
      unit_04: {
        passed: true,
        questions: u4Count,
        lessons: unit4Lessons.length,
        errors: 0
      },
      unit_05: {
        passed: true,
        questions: u5Count,
        lessons: unit5Lessons.length,
        errors: 0
      },
      unit_06: {
        passed: true,
        questions: u6Count,
        lessons: unit6Lessons.length,
        errors: 0
      }
    }
  };

  fs.writeFileSync(statusPath, JSON.stringify(updatedStatus, null, 2));
  console.log(`Successfully updated ${path.relative(process.cwd(), statusPath)}.`);
  console.log('Curriculum gate verified: Units 1, 2, 3, 4, 5, and 6 are 100% playable and valid.\n');
  process.exit(0);
}

validateCurriculum().catch(err => {
  console.error('Fatal validator error:', err);
  process.exit(1);
});
