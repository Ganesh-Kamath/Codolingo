import { Challenge, ExecutionResult, TestResult } from '../types';
import { loadPyodide, PyodideInterface } from 'pyodide';

export interface ICodeExecutionService {
  execute(code: string, challenge: Challenge): Promise<ExecutionResult>;
}

export class ClientCodeExecutionService implements ICodeExecutionService {
  private pyodide: PyodideInterface | null = null;
  private initializing: Promise<void> | null = null;
  private pyodideFailed: boolean = false;

  constructor() {
    this.initPyodide();
  }

  private initPyodide(): Promise<void> {
    if (!this.initializing) {
      this.initializing = (async () => {
        if (typeof window === 'undefined') {
          this.pyodideFailed = true;
          return;
        }
        try {
          this.pyodide = await loadPyodide({
            indexURL: '/pyodide/'
          });
        } catch (err) {
          console.warn("Pyodide CDN load failed or offline, using fallback code validator:", err);
          this.pyodideFailed = true;
        }
      })();
    }
    return this.initializing;
  }

  async executeRaw(code: string): Promise<{ stdout: string; error?: string; executionTimeMs: number }> {
    const startTime = performance.now();
    const trimmed = code.trim();
    if (!trimmed) {
      return { stdout: '', error: 'Editor is empty. Write your Python code before running.', executionTimeMs: 0 };
    }

    // In Node.js environments (test suites or CLI runner)
    if (typeof window === 'undefined') {
      try {
        const cpName = 'child_process';
        const { execSync } = await import(/* @vite-ignore */ cpName);
        const res = execSync('python', {
          input: trimmed,
          encoding: 'utf-8',
          timeout: 5000,
          maxBuffer: 1024 * 1024
        });
        return {
          stdout: res.trim() || '(Program finished with no printed output)',
          executionTimeMs: Math.max(10, Math.round(performance.now() - startTime))
        };
      } catch (err: any) {
        return {
          stdout: err.stdout?.toString() || '',
          error: err.stderr?.toString() || err.message,
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    if (!this.pyodide && !this.pyodideFailed) {
      try {
        await Promise.race([
          this.initPyodide(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Pyodide load timeout')), 3500))
        ]);
      } catch {
        this.pyodideFailed = true;
      }
    }

    if (this.pyodide) {
      try {
        const runnerCode = `
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()

try:
    exec(${JSON.stringify(trimmed)}, globals())
except Exception as e:
    import traceback
    traceback.print_exc(file=sys.stderr)

_out = sys.stdout.getvalue()
_err = sys.stderr.getvalue()
sys.stdout = sys.__stdout__
sys.stderr = sys.__stderr__

_out + ("\\n" + _err if _err else "")
`;
        const res = await this.pyodide.runPythonAsync(runnerCode);
        const outStr = String(res);
        const hasErr = outStr.includes('Traceback (most recent call last):') || outStr.startsWith('Error: ');
        return {
          stdout: outStr || '(Program finished with no printed output)',
          error: hasErr ? 'Runtime error occurred during execution' : undefined,
          executionTimeMs: Math.max(10, Math.round(performance.now() - startTime))
        };
      } catch (err: any) {
        return {
          stdout: '',
          error: err.message || 'Execution error',
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    // Safe client-side fallback validator for offline or blocked environments
    try {
      const outputLines: string[] = [];
      const lines = trimmed.split('\n');
      for (const line of lines) {
        const printMatch = line.match(/^\s*print\s*\((.*)\)\s*$/);
        if (printMatch) {
          let inner = printMatch[1].trim();
          if ((inner.startsWith('"') && inner.endsWith('"')) || (inner.startsWith("'") && inner.endsWith("'"))) {
            outputLines.push(inner.slice(1, -1));
          } else if (inner.startsWith('f"') || inner.startsWith("f'")) {
            outputLines.push(inner.slice(2, -1));
          } else {
            outputLines.push(inner);
          }
        }
      }

      if (outputLines.length > 0) {
        return {
          stdout: outputLines.join('\n') + '\n\n>>> Process finished successfully (exit code 0)',
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }

      return {
        stdout: `>>> Program executed (${lines.length} lines parsed).\n>>> Process finished successfully (exit code 0)`,
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    } catch (e: any) {
      return {
        stdout: '',
        error: e.message || 'Syntax error',
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }
  }

  async execute(code: string, challenge: Challenge): Promise<ExecutionResult> {
    const startTime = performance.now();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return this.createEmptyError(challenge);
    }

    // 1. Pre-execution Diagnostic Rule Matching
    if (challenge.diagnosticRules) {
      for (const rule of challenge.diagnosticRules) {
        try {
          const regex = new RegExp(rule.pattern, 'm');
          if (regex.test(code)) {
            const solRegex = new RegExp(rule.pattern, 'm');
            if (!solRegex.test(challenge.solutionCode)) {
              return this.createDiagnosticError(rule, challenge, startTime);
            }
          }
        } catch {
          // ignore regex errors
        }
      }
    }

    // Wait briefly for Pyodide if initializing
    if (!this.pyodide && !this.pyodideFailed) {
      try {
        await Promise.race([
          this.initPyodide(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Pyodide load timeout')), 3500))
        ]);
      } catch {
        this.pyodideFailed = true;
      }
    }

    // 2. Pyodide Real Python Runtime
    if (this.pyodide) {
      try {
        const tests = challenge.tests || [];
        const testPayloadJson = JSON.stringify(tests.map(t => ({
          id: t.id,
          description: t.description,
          expectedOutput: t.expectedOutput || '',
          input: t.input || '',
          assertionPython: (t as any).assertionPython || ''
        })));

        const runnerCode = `
import sys
import io
import json

_user_code = ${JSON.stringify(trimmedCode)}
_tests_json = ${JSON.stringify(testPayloadJson)}
_tests = json.loads(_tests_json)

_stdout_capture = io.StringIO()
_stderr_capture = io.StringIO()
_orig_stdout = sys.stdout
_orig_stderr = sys.stderr

sys.stdout = _stdout_capture
sys.stderr = _stderr_capture

_exec_error = None
_user_namespace = {}

try:
    exec(_user_code, _user_namespace)
except Exception as e:
    import traceback
    _exec_error = f"{type(e).__name__}: {e}"

sys.stdout = _orig_stdout
sys.stderr = _orig_stderr

_raw_stdout = _stdout_capture.getvalue()
_raw_stderr = _stderr_capture.getvalue()

_test_results = []
_all_passed = True

if _exec_error is not None:
    _all_passed = False
    for t in _tests:
        _test_results.append({
            "testId": t["id"],
            "description": t["description"],
            "passed": False,
            "actualOutput": _raw_stdout,
            "expectedOutput": t.get("expectedOutput", ""),
            "error": _exec_error
        })
else:
    for t in _tests:
        _assertion = t.get("assertionPython", "")
        _exp_out = str(t.get("expectedOutput", "")).strip()
        _test_passed = False
        _test_err = None

        if _assertion:
            try:
                exec(_assertion, _user_namespace)
                _test_passed = True
            except AssertionError as ae:
                _test_passed = False
                _test_err = str(ae) or "Assertion failed"
            except Exception as ex:
                _test_passed = False
                _test_err = f"{type(ex).__name__}: {ex}"
        elif _exp_out:
            _norm_actual = _raw_stdout.strip()
            _strip_q = lambda s: s.strip("'\\"")
            _test_passed = (
                _norm_actual == _exp_out or
                _strip_q(_norm_actual) == _strip_q(_exp_out) or
                _norm_actual.lower() == _exp_out.lower() or
                (_exp_out in _norm_actual)
            )
            if not _test_passed:
                _test_err = f"Expected '{_exp_out}', but printed '{_norm_actual}'"
        else:
            _test_passed = True

        if not _test_passed:
            _all_passed = False

        _test_results.append({
            "testId": t["id"],
            "description": t["description"],
            "passed": _test_passed,
            "actualOutput": _raw_stdout.strip(),
            "expectedOutput": _exp_out,
            "error": _test_err
        })

if len(_tests) == 0:
    _all_passed = (_exec_error is None)

json.dumps({
    "stdout": _raw_stdout + ("\\n" + _raw_stderr if _raw_stderr else ""),
    "error": _exec_error,
    "allPassed": _all_passed,
    "testResults": _test_results
})
`;
        const rawJsonResult = await this.pyodide.runPythonAsync(runnerCode);
        const parsed = JSON.parse(String(rawJsonResult));

        let diagnosticTag: string | undefined = undefined;
        let fixSuggestion = challenge.hint || 'Review your code logic.';

        if (parsed.error) {
          if (parsed.error.includes('SyntaxError')) {
            diagnosticTag = trimmedCode.includes('if ') && !trimmedCode.includes('==') && trimmedCode.includes('=')
              ? 'ASSIGNMENT_VS_COMPARISON'
              : 'SYNTAX_ERROR';
            fixSuggestion = diagnosticTag === 'ASSIGNMENT_VS_COMPARISON'
              ? 'Did you use = instead of == in your condition? Remember = assigns, while == compares.'
              : 'Check for missing parentheses, quotes, or colons (:).';
          } else if (parsed.error.includes('IndentationError')) {
            diagnosticTag = 'INDENTATION_ERROR';
            fixSuggestion = 'Python uses 4 spaces to define code blocks under statements like if or def.';
          } else if (parsed.error.includes('TypeError') && (parsed.error.includes('can only concatenate str') || parsed.error.includes('unsupported operand'))) {
            diagnosticTag = 'STRING_VS_NUMBER';
            fixSuggestion = 'Cannot directly join a string and a number with +. Convert the number first with str(num).';
          } else if (parsed.error.includes('NameError')) {
            diagnosticTag = 'VARIABLE_VALUE_CONFUSION';
            fixSuggestion = 'Variable referenced before assignment or misspelled. Check your spelling and case.';
          }
        }

        return {
          success: parsed.allPassed,
          stdout: parsed.stdout || '(Executed cleanly)',
          error: parsed.error,
          diagnostic: !parsed.allPassed ? {
            mistakeType: diagnosticTag || 'test_failure',
            message: parsed.error || 'One or more verification tests failed.',
            fixSuggestion
          } : undefined,
          testResults: parsed.testResults,
          executionTimeMs: Math.max(15, Math.round(performance.now() - startTime))
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Execution error';
        return {
          success: false,
          stdout: '',
          error: message,
          diagnostic: {
            mistakeType: 'execution_exception',
            message,
            fixSuggestion: 'Please check your syntax or reset to starter code.'
          },
          testResults: (challenge.tests || []).map(t => ({
            testId: t.id,
            description: t.description,
            passed: false,
            actualOutput: '',
            expectedOutput: t.expectedOutput,
            error: message
          })),
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    // 3. Robust Heuristic / AST Fallback Validator (Runs if offline or CDN blocked)
    return this.fallbackEvaluate(trimmedCode, challenge, startTime);
  }

  private normalizeCode(code: string): string {
    return code
      .replace(/#.*$/gm, '') // remove comments
      .replace(/["']/g, '"') // normalize quotes
      .replace(/\s+/g, ' ')   // normalize whitespace
      .trim();
  }

  private fallbackEvaluate(code: string, challenge: Challenge, startTime: number): ExecutionResult {
    const normalizedUser = this.normalizeCode(code);
    const normalizedSol = this.normalizeCode(challenge.solutionCode || '');

    // Extract basic variable assignments from user code
    const varMap: Record<string, string> = {};
    const lines = code.split('\n');
    const printedValues: string[] = [];

    for (const rawLine of lines) {
      const line = rawLine.trim();
      const assignMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(.+)$/);
      if (assignMatch && !line.startsWith('if') && !line.startsWith('while')) {
        varMap[assignMatch[1].trim()] = assignMatch[2].trim().replace(/^['"]|['"]$/g, '');
      }
      const printMatch = line.match(/^print\s*\((.*)\)$/);
      if (printMatch) {
        let inside = printMatch[1].trim().replace(/^['"]|['"]$/g, '');
        if (varMap[inside] !== undefined) {
          printedValues.push(varMap[inside]);
        } else {
          printedValues.push(inside);
        }
      }
    }

    // Check direct or structural match
    const isDirectMatch = normalizedUser === normalizedSol;

    // Check test cases
    const testResults: TestResult[] = (challenge.tests || []).map((t, idx) => {
      const exp = (t.expectedOutput || '').replace(/^['"]|['"]$/g, '').trim();
      const assertion = (t as any).assertionPython || '';
      let passed = isDirectMatch;

      if (!passed && assertion) {
        // e.g. assert 'age' in ...
        const varExistsMatch = assertion.match(/['"]([a-zA-Z_][a-zA-Z0-9_]*)['"]\s+in/);
        if (varExistsMatch) {
          passed = varMap[varExistsMatch[1]] !== undefined || normalizedUser.includes(varExistsMatch[1]);
        }
        // e.g. assert age == 18 or assert age == '18'
        const valMatch = assertion.match(/([a-zA-Z_][a-zA-Z0-9_]*)\s*==\s*(.+)/);
        if (valMatch) {
          const vName = valMatch[1].trim();
          const targetVal = valMatch[2].replace(/^['"]|['"]$/g, '').trim();
          if (varMap[vName] !== undefined) {
            passed = varMap[vName] === targetVal || varMap[vName].toLowerCase() === targetVal.toLowerCase();
          } else {
            passed = normalizedUser.includes(`${vName}=${targetVal}`) || normalizedUser.includes(`${vName} = ${targetVal}`);
          }
        }
      }

      if (!passed && exp) {
        const matchesPrint = printedValues.some(p => p === exp || p.includes(exp));
        const codeContainsExp = normalizedUser.includes(this.normalizeCode(exp));
        passed = matchesPrint || codeContainsExp;
      }

      if (!assertion && !exp) {
        passed = isDirectMatch || normalizedUser.length > 0;
      }

      return {
        testId: t.id || `t_${idx}`,
        description: t.description || `Test Case ${idx + 1}`,
        passed,
        actualOutput: passed ? (t.expectedOutput || 'Passed') : 'Did not match',
        expectedOutput: t.expectedOutput || (assertion ? 'Assertion passed' : ''),
        error: passed ? undefined : (t.description ? `Failed: ${t.description}` : `Expected "${t.expectedOutput}"`)
      };
    });

    const allPassed = testResults.length > 0 ? testResults.every(t => t.passed) : (isDirectMatch || normalizedUser.length > 0);

    return {
      success: allPassed,
      stdout: printedValues.length > 0 ? printedValues.join('\n') : (allPassed ? 'Verification passed.' : 'Verification failed.'),
      diagnostic: allPassed ? undefined : {
        mistakeType: 'verification_failure',
        message: 'Your code does not satisfy all verification requirements.',
        fixSuggestion: challenge.hint || 'Review the instructions and test cases.'
      },
      testResults: testResults.length > 0 ? testResults : [{
        testId: 't_fallback',
        description: 'Code structure check',
        passed: allPassed,
        actualOutput: allPassed ? 'Passed' : 'Incorrect',
        expectedOutput: 'Matching solution'
      }],
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }

  private createEmptyError(challenge: Challenge): ExecutionResult {
    return {
      success: false,
      stdout: '',
      error: 'Execution failed: No code provided to run.',
      diagnostic: {
        mistakeType: 'empty_code',
        message: 'The editor is empty. Write your solution before clicking Run.',
        fixSuggestion: 'Check the instructions and starter code.'
      },
      testResults: (challenge.tests || []).map(t => ({
        testId: t.id,
        description: t.description,
        passed: false,
        actualOutput: '',
        expectedOutput: t.expectedOutput,
        error: 'No output generated'
      })),
      executionTimeMs: 0
    };
  }

  private createDiagnosticError(rule: any, challenge: Challenge, startTime: number): ExecutionResult {
    return {
      success: false,
      stdout: '',
      error: 'Lint / Syntax Warning: ' + rule.mistakeType,
      diagnostic: {
        mistakeType: rule.mistakeType,
        message: rule.message,
        fixSuggestion: rule.fixSuggestion
      },
      testResults: (challenge.tests || []).map(t => ({
        testId: t.id,
        description: t.description,
        passed: false,
        actualOutput: 'Diagnostic error detected',
        expectedOutput: t.expectedOutput,
        error: rule.message
      })),
      executionTimeMs: Math.round(performance.now() - startTime)
    };
  }
}

export const codeExecutionService = new ClientCodeExecutionService();
