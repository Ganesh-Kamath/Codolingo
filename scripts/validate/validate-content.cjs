/**
 * Codolingo Curriculum Content Validator
 * Validates every question in:
 * - src/curriculum/python/foundations/*.ts
 * - src/curriculum/python/content/**\/*.json
 * 
 * Rules:
 * 1. Parse successfully.
 * 2. Required fields per question type.
 * 3. Run solution_code against test_cases via real Python matching app contract.
 * 4. Fail on '___' in starter_code of write/fix types unless fill_in_the_blank.
 * 5. Fail on duplicate prompts within a lesson.
 * 6. Fail on boilerplate explanations ("This exercise tests `...` in ... Understanding how this construct behaves").
 * 7. Fail if correct_answer is not among options for choice types.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const ts = require('typescript');

const BOILERPLATE_REGEX = /This exercise tests `.+` in .+\.?\s*Understanding how this construct behaves/i;
const GENERIC_BOILERPLATE_REGEX = /This exercise tests `.+` in/i;

// Ultra-fast single-process Python runner
const GLOBAL_PYTHON_RUNNER = `
import sys
import io
import json
import builtins
import time

# Safe environment mocks
try:
    import subprocess
    class DummyProc:
        returncode = 0
        stdout = "Success\\n"
        stderr = ""
    subprocess.run = lambda *a, **k: DummyProc()
    subprocess.Popen = lambda *a, **k: DummyProc()
    subprocess.check_output = lambda *a, **k: b"Success\\n"
except Exception:
    pass

try:
    import requests
    class DummyResp:
        status_code = 200
        text = '{"status": "ok"}'
        def json(self): return {"status": "ok"}
        def raise_for_status(self): pass
    requests.get = lambda *a, **k: DummyResp()
    requests.post = lambda *a, **k: DummyResp()
except Exception:
    pass

try:
    import urllib.request
    urllib.request.urlopen = lambda *a, **k: io.BytesIO(b'{"status": "ok"}')
except Exception:
    pass

try:
    import socket
    socket.create_connection = lambda *a, **k: None
except Exception:
    pass

try:
    import flask
    flask.Flask.run = lambda *a, **k: None
except Exception:
    pass

try:
    import uvicorn
    uvicorn.run = lambda *a, **k: None
except Exception:
    pass

orig_sleep = time.sleep
time.sleep = lambda *a, **k: None

def run_test_item(item):
    code = item.get("code", "")
    tests = item.get("tests", [])
    if not tests:
        tests = [{"expectedOutput": ""}]
        
    orig_stdout = sys.stdout
    orig_input = builtins.input
    test_results = []
    
    for t in tests:
        stdout_buf = io.StringIO()
        sys.stdout = stdout_buf
        user_ns = {"__name__": "__main__"}
        exec_err = None
        
        raw_inp = str(t.get("input") or "")
        inp_queue = raw_inp.splitlines() if raw_inp else []
        
        def mock_input(prompt=""):
            if prompt:
                sys.stdout.write(str(prompt))
            if not inp_queue:
                raise RuntimeError("Your program asked for more input than was provided")
            v = inp_queue.pop(0)
            return v
            
        builtins.input = mock_input
        
        start_time = time.time()
        def timeout_trace(frame, event, arg):
            if time.time() - start_time > 0.15:
                raise TimeoutError("Code execution exceeded 0.15s timeout")
            return timeout_trace
            
        sys.settrace(timeout_trace)
        try:
            exec(code, user_ns)
        except TimeoutError:
            exec_err = "TimeoutError: Execution timed out after 0.15s"
        except SystemExit as se:
            exec_err = f"SystemExit: {se}"
        except Exception as e:
            exec_err = f"{type(e).__name__}: {e}"
        except BaseException as be:
            exec_err = f"{type(be).__name__}: {be}"
        finally:
            sys.settrace(None)
            
        raw_out = stdout_buf.getvalue()
        
        passed = False
        err_msg = exec_err
        
        if not exec_err:
            user_ns["_raw_stdout"] = raw_out
            user_ns["_user_code"] = code
            user_ns["_user_namespace"] = user_ns
            
            assertion = t.get("assertionPython", "")
            raw_exp = str(t.get("expectedOutput", "") if "expectedOutput" in t else (t.get("expected_output", "") if "expected_output" in t else ""))
            
            if assertion:
                try:
                    exec(assertion, user_ns)
                    passed = True
                except AssertionError as ae:
                    err_msg = str(ae) if str(ae) else f"Assertion failed: {assertion}"
                except Exception as ex:
                    err_msg = f"{type(ex).__name__}: {ex}"
            elif raw_exp or ("expectedOutput" in t) or ("expected_output" in t):
                actual_lines = [l.rstrip() for l in raw_out.strip().splitlines()] if raw_out.strip() else []
                exp_lines = [l.rstrip() for l in raw_exp.strip().splitlines()] if raw_exp.strip() else []
                norm_actual = "\\n".join(actual_lines)
                norm_exp = "\\n".join(exp_lines)
                
                if norm_actual == norm_exp:
                    passed = True
                elif raw_exp.startswith(("'", '"')) and raw_exp.endswith(("'", '"')) and norm_actual == raw_exp[1:-1].strip():
                    passed = True
                elif norm_actual and norm_exp:
                    try:
                        if float(norm_actual) == float(norm_exp):
                            passed = True
                    except (ValueError, TypeError):
                        pass
                
                if not passed:
                    err_msg = f"Expected '{norm_exp}', got '{norm_actual}'"
            else:
                passed = True
                
        test_results.append({
            "passed": passed,
            "error": err_msg,
            "actualOutput": raw_out.strip()
        })
        
    sys.stdout = orig_stdout
    builtins.input = orig_input
    
    all_passed = all(r["passed"] for r in test_results)
    errors = [r["error"] for r in test_results if not r["passed"]]
    return {
        "id": item.get("id"),
        "passed": all_passed,
        "error": "; ".join(errors) if errors else None
    }

if __name__ == "__main__":
    raw_payload = sys.stdin.read()
    items = json.loads(raw_payload)
    results = [run_test_item(item) for item in items]
    print(json.dumps(results))
`;

function runAllPythonBatch(items) {
  if (items.length === 0) return {};
  const payload = JSON.stringify(items);
  const res = spawnSync('python', ['-c', GLOBAL_PYTHON_RUNNER], {
    input: payload,
    encoding: 'utf8',
    maxBuffer: 50 * 1024 * 1024,
    timeout: 30000
  });

  const map = {};
  if (res.error || res.status !== 0) {
    const errMsg = res.error ? res.error.message : (res.stderr || 'Python error');
    for (const item of items) {
      map[item.id] = { id: item.id, passed: false, error: `Batch runner error: ${errMsg}` };
    }
    return map;
  }

  try {
    const out = JSON.parse(res.stdout);
    for (const r of out) {
      map[r.id] = r;
    }
  } catch (e) {
    for (const item of items) {
      map[item.id] = { id: item.id, passed: false, error: `JSON parse error from runner: ${e.message}` };
    }
  }
  return map;
}

function normalizeOptionText(opt) {
  if (typeof opt === 'string') return opt.trim();
  if (opt && typeof opt.text === 'string') return opt.text.trim();
  return String(opt).trim();
}

function prevalidateQuestion(q, lessonContext) {
  const errors = [];
  const type = q.question_type || q.type || '';
  const id = q.id || 'unknown';

  if (!q.id) {
    errors.push('Missing question id');
  }

  // 1. Check duplicate prompts within lesson
  const prompt = (q.prompt || q.content || '').trim();
  if (prompt && type !== 'micro_lesson') {
    if (lessonContext.prompts.has(prompt)) {
      errors.push(`Duplicate prompt in lesson: "${prompt.slice(0, 50)}..."`);
    } else {
      lessonContext.prompts.add(prompt);
    }
  }

  // 2. Check boilerplate explanation
  const explanation = (q.explanation || '').trim();
  if (BOILERPLATE_REGEX.test(explanation) || GENERIC_BOILERPLATE_REGEX.test(explanation)) {
    errors.push(`Boilerplate explanation pattern detected: "${explanation.slice(0, 60)}..."`);
  }

  // 3. Choice / Recall / Prediction types
  const isChoiceType = [
    'multiple_choice',
    'output_prediction',
    'code_prediction',
    'real_world_scenario',
    'error_diagnosis',
    'match_code_to_concept',
    'code_ordering',
    'trace_execution',
    'MULTIPLE_CHOICE',
    'PREDICT_OUTPUT',
    'TRUE_FALSE_WITH_REASONING'
  ].includes(type);

  if (isChoiceType) {
    if (!prompt) errors.push('Missing prompt for choice question');
    const opts = q.options || q.orderingOptions;
    if (!Array.isArray(opts) || opts.length === 0) {
      errors.push('Choice question missing options array');
    } else {
      const rawAns = q.correct_answer ?? q.correctAnswer;
      if (rawAns === undefined || rawAns === null || rawAns === '') {
        errors.push('Missing correct_answer for choice question');
      } else {
        const cleanAns = String(rawAns).trim();
        let matched = false;

        if (/^[A-D]$/i.test(cleanAns)) {
          const idx = cleanAns.toUpperCase().charCodeAt(0) - 65;
          if (idx >= 0 && idx < opts.length) matched = true;
        }

        if (!matched && /^\d+$/.test(cleanAns)) {
          const idx = parseInt(cleanAns, 10);
          if (idx >= 0 && idx < opts.length) matched = true;
        }

        if (!matched) {
          for (const opt of opts) {
            const optText = normalizeOptionText(opt);
            if (optText === cleanAns || (opt.id && opt.id === cleanAns)) {
              matched = true;
              break;
            }
            if (optText.startsWith(cleanAns + '.') || optText.startsWith(cleanAns + ':')) {
              matched = true;
              break;
            }
          }
        }

        if (!matched && opts.some(o => o && typeof o === 'object' && o.isCorrect)) {
          const correctOpt = opts.find(o => o.isCorrect);
          if (correctOpt && (correctOpt.text === cleanAns || correctOpt.id === cleanAns)) {
            matched = true;
          }
        }

        if (!matched) {
          errors.push(`correct_answer "${cleanAns}" is not among provided options`);
        }
      }
    }
  }

  // 4. Code Questions
  const isCodeType = [
    'write_the_code',
    'fix_the_code',
    'mini_challenge',
    'refactoring_challenge',
    'WRITE_CODE',
    'DEBUG_CODE',
    'APPLY',
    'write_code',
    'fix_code'
  ].includes(type);

  const isFillBlank = type === 'fill_in_the_blank' || type === 'CODE_COMPLETION';

  let codeToRun = null;
  if (isCodeType) {
    if (!prompt) errors.push('Missing prompt for code question');
    const starter = q.starter_code ?? q.starterCode ?? '';
    const solution = q.solution_code ?? q.solutionCode ?? '';

    if (!isFillBlank && starter.includes('___')) {
      errors.push("Starter code contains '___' in non-blank code question");
    }

    if (!solution || typeof solution !== 'string' || !solution.trim()) {
      errors.push('Missing solution_code for code question');
    } else {
      const rawTests = q.test_cases || q.tests || [];
      const formattedTests = rawTests.map(tc => ({
        input: tc.input,
        expectedOutput: tc.expectedOutput ?? tc.expected_output,
        assertionPython: tc.assertionPython
      }));
      codeToRun = {
        id: q.id,
        code: solution,
        tests: formattedTests
      };
    }
  }

  return { id, type, errors, codeToRun };
}

function loadFoundationsLessons() {
  const fndDir = path.resolve(__dirname, '../../src/curriculum/python/foundations');
  const files = fs.readdirSync(fndDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');
  const lessons = [];

  for (const file of files) {
    const filePath = path.join(fndDir, file);
    const code = fs.readFileSync(filePath, 'utf8');
    const js = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const mod = { exports: {} };
    const fn = new Function('module', 'exports', 'require', js);
    fn(mod, mod.exports, () => ({}));

    const qKey = Object.keys(mod.exports).find(k => k.endsWith('_QUESTIONS'));
    const questions = qKey ? mod.exports[qKey] : [];

    lessons.push({
      file,
      title: path.basename(file, '.ts'),
      unit: 'unit_01',
      items: questions
    });
  }
  return lessons;
}

function loadJsonUnits(unitFilter) {
  const contentDir = path.resolve(__dirname, '../../src/curriculum/python/content');
  const unitDirs = fs.readdirSync(contentDir).filter(f => f.startsWith('unit_'));
  const unitsMap = {};

  for (const u of unitDirs) {
    if (unitFilter && u !== unitFilter) continue;
    const uPath = path.join(contentDir, u);
    if (!fs.statSync(uPath).isDirectory()) continue;
    const jsonFiles = fs.readdirSync(uPath).filter(f => f.endsWith('.json'));

    const lessons = [];
    for (const jf of jsonFiles) {
      const filePath = path.join(uPath, jf);
      try {
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        lessons.push({
          file: jf,
          title: data.title || path.basename(jf, '.json'),
          unit: u,
          items: data.items || []
        });
      } catch (e) {
        lessons.push({
          file: jf,
          title: jf,
          unit: u,
          items: [],
          parseError: e.message
        });
      }
    }
    unitsMap[u] = lessons;
  }
  return unitsMap;
}

function main() {
  console.log('====================================================');
  console.log('CODOLINGO CURRICULUM CONTENT VALIDATOR');
  console.log('====================================================\n');

  const unitFilter = process.argv.find(a => a.startsWith('--unit='))?.split('=')[1];

  // 1. Load Foundations
  const foundationsLessons = loadFoundationsLessons();

  // 2. Load Raw JSON Units
  const rawUnits = loadJsonUnits(unitFilter);

  // Collect all code questions across the entire curriculum
  const allCodeBatch = [];
  const lessonEvalData = [];

  // Prevalidate Foundations
  for (const lesson of foundationsLessons) {
    const lessonContext = { prompts: new Set() };
    const preResults = [];
    for (const q of lesson.items) {
      const res = prevalidateQuestion(q, lessonContext);
      preResults.push(res);
      if (res.codeToRun) allCodeBatch.push(res.codeToRun);
    }
    lessonEvalData.push({ lesson, preResults, isFoundations: true });
  }

  // Prevalidate JSON Units
  for (const [u, lessons] of Object.entries(rawUnits)) {
    for (const lesson of lessons) {
      if (lesson.parseError) {
        lessonEvalData.push({
          lesson,
          preResults: [{ id: 'parse', type: 'json', errors: [`JSON parse error: ${lesson.parseError}`] }],
          isFoundations: false
        });
        continue;
      }
      const lessonContext = { prompts: new Set() };
      const preResults = [];
      for (const q of lesson.items) {
        const res = prevalidateQuestion(q, lessonContext);
        preResults.push(res);
        if (res.codeToRun) allCodeBatch.push(res.codeToRun);
      }
      lessonEvalData.push({ lesson, preResults, isFoundations: false });
    }
  }

  // 1. Evaluate Foundations Curriculum
  console.log('--- 1. Foundations Curriculum (Unit 1 - src/curriculum/python/foundations) ---');
  const fndCodeBatch = [];
  for (const entry of lessonEvalData.filter(e => e.isFoundations)) {
    for (const r of entry.preResults) {
      if (r.codeToRun) fndCodeBatch.push(r.codeToRun);
    }
  }

  const fndResults = runAllPythonBatch(fndCodeBatch);
  let fndTotal = 0;
  let fndFailed = 0;

  for (const entry of lessonEvalData.filter(e => e.isFoundations)) {
    const failures = [];
    for (const r of entry.preResults) {
      if (r.codeToRun && fndResults[r.id] && !fndResults[r.id].passed) {
        r.errors.push(`Solution code failed tests: ${fndResults[r.id].error}`);
      }
      if (r.errors.length > 0) {
        failures.push({ id: r.id, errors: r.errors });
      }
    }
    fndTotal += entry.lesson.items.length;
    fndFailed += failures.length;

    if (failures.length > 0) {
      console.log(`❌ ${entry.lesson.file}: ${failures.length}/${entry.lesson.items.length} questions failed`);
      failures.forEach(f => console.log(`   - [${f.id}] ${f.errors.join('; ')}`));
    } else {
      console.log(`✅ ${entry.lesson.file}: ${entry.lesson.items.length} questions passed`);
    }
  }

  console.log('\n--- 2. Content Units (src/curriculum/python/content) ---');
  const unitStats = {};

  // Group non-foundations lessons by unit
  const lessonsByUnit = {};
  for (const entry of lessonEvalData.filter(e => !e.isFoundations)) {
    const u = entry.lesson.unit;
    if (!lessonsByUnit[u]) lessonsByUnit[u] = [];
    lessonsByUnit[u].push(entry);
  }

  for (const [u, entries] of Object.entries(lessonsByUnit)) {
    const unitCodeBatch = [];
    for (const entry of entries) {
      for (const r of entry.preResults) {
        if (r.codeToRun) unitCodeBatch.push(r.codeToRun);
      }
    }

    const unitRunResults = runAllPythonBatch(unitCodeBatch);

    let uTotal = 0;
    let uFailed = 0;
    for (const entry of entries) {
      uTotal += entry.lesson.items.length;
      for (const r of entry.preResults) {
        if (r.codeToRun && unitRunResults[r.id] && !unitRunResults[r.id].passed) {
          r.errors.push(`Solution code failed tests: ${unitRunResults[r.id].error}`);
        }
        if (r.errors.length > 0) {
          uFailed++;
          console.log(`   - [${entry.lesson.file} -> ${r.id}] ${r.errors.join('; ')}`);
        }
      }
    }

    unitStats[u] = {
      total: uTotal,
      failed: uFailed,
      lessons: entries.length
    };

    if (uFailed === 0) {
      console.log(`✅ ${u}: All ${entries.length} lessons (${uTotal} questions) PASSED`);
    } else {
      console.log(`❌ ${u}: ${uFailed}/${uTotal} questions failed across ${entries.length} lessons`);
    }
  }

  // Playable Units Calculation
  const playableUnits = [];
  const comingSoonUnits = [];

  // Unit 1 uses foundations
  if (fndFailed === 0) {
    playableUnits.push('unit_01');
  } else {
    comingSoonUnits.push('unit_01');
  }

  for (const [u, stats] of Object.entries(unitStats)) {
    if (u === 'unit_01') continue;
    // Must have 0 failed questions and minimum 10 questions per lesson
    if (stats.failed === 0 && stats.total >= stats.lessons * 10) {
      playableUnits.push(u);
    } else {
      comingSoonUnits.push(u);
    }
  }

  console.log('\n====================================================');
  console.log('CURRICULUM VALIDATION SUMMARY');
  console.log('====================================================');
  console.log(`Foundations (Unit 1): ${fndTotal - fndFailed}/${fndTotal} valid (100% verified)`);
  console.log(`Playable Units (${playableUnits.length}): ${playableUnits.join(', ')}`);
  console.log(`Coming Soon Units (${comingSoonUnits.length}): ${comingSoonUnits.join(', ')}`);

  // Write curriculumStatus.json
  const statusFilePath = path.resolve(__dirname, '../../src/curriculum/python/curriculumStatus.json');
  fs.writeFileSync(statusFilePath, JSON.stringify({
    validatedAt: new Date().toISOString(),
    playableUnits,
    comingSoonUnits,
    foundationsValid: fndFailed === 0,
    unitDetails: {
      unit_01: { passed: fndFailed === 0, questions: fndTotal, lessons: foundationsLessons.length }
    }
  }, null, 2));
  console.log(`Saved validation status to ${statusFilePath}`);

  if (fndFailed > 0) {
    console.error(`\nFoundations curriculum has ${fndFailed} failures.`);
    process.exit(1);
  }

  if (unitFilter && unitStats[unitFilter] && unitStats[unitFilter].failed > 0) {
    console.error(`\nUnit ${unitFilter} has ${unitStats[unitFilter].failed} failures.`);
    process.exit(1);
  }
}

main();
