import { Challenge, ExecutionResult, TestResult } from '../types';
import { loadPyodide, PyodideInterface } from 'pyodide';

export interface ICodeExecutionService {
  execute(code: string, challenge: Challenge): Promise<ExecutionResult>;
  executeRaw(code: string): Promise<{ stdout: string; error?: string; executionTimeMs: number }>;
}

const RUNNER_SCRIPT = `
import sys
import io
import json
import builtins

def _run_payload(user_code_str, tests_json_str):
    tests = json.loads(tests_json_str) if tests_json_str else []
    orig_stdout = sys.stdout
    orig_stderr = sys.stderr
    orig_input = getattr(builtins, 'input', None)
    
    test_results = []
    first_stdout = ""
    first_stderr = ""
    first_error = None
    all_passed = True
    
    # If no tests are provided, run user code once with fallback input
    if not tests:
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        sys.stdout = stdout_capture
        sys.stderr = stderr_capture
        
        def mock_input(prompt=""):
            if prompt:
                stdout_capture.write(str(prompt))
            return ""
        builtins.input = mock_input
        
        exec_error = None
        user_namespace = {"__name__": "__main__"}
        try:
            exec(user_code_str, user_namespace)
        except SystemExit as se:
            exec_error = f"SystemExit: {se}"
        except Exception as e:
            exec_error = f"{type(e).__name__}: {e}"
        except BaseException as be:
            exec_error = f"{type(be).__name__}: {be}"
        finally:
            sys.stdout = orig_stdout
            sys.stderr = orig_stderr
            if orig_input:
                builtins.input = orig_input
                
        raw_stdout = stdout_capture.getvalue()
        raw_stderr = stderr_capture.getvalue()
        combined_stdout = raw_stdout + ("\\n" + raw_stderr if raw_stderr else "")
        return json.dumps({
            "stdout": combined_stdout,
            "error": exec_error,
            "allPassed": exec_error is None,
            "testResults": []
        })

    # If tests are provided, execute each test case with its respective scripted input
    for idx, t in enumerate(tests):
        stdout_capture = io.StringIO()
        stderr_capture = io.StringIO()
        sys.stdout = stdout_capture
        sys.stderr = stderr_capture
        
        raw_inp = str(t.get("input") or "")
        inp_queue = raw_inp.splitlines() if raw_inp else []
        def mock_input(prompt=""):
            if prompt:
                stdout_capture.write(str(prompt))
            if not inp_queue:
                return ""
            val = inp_queue.pop(0)
            stdout_capture.write(val + "\\n")
            return val
        builtins.input = mock_input
        
        exec_error = None
        user_namespace = {"__name__": "__main__"}
        try:
            exec(user_code_str, user_namespace)
        except SystemExit as se:
            exec_error = f"SystemExit: {se}"
        except Exception as e:
            exec_error = f"{type(e).__name__}: {e}"
        except BaseException as be:
            exec_error = f"{type(be).__name__}: {be}"
        finally:
            sys.stdout = orig_stdout
            sys.stderr = orig_stderr
            if orig_input:
                builtins.input = orig_input
                
        raw_stdout = stdout_capture.getvalue()
        raw_stderr = stderr_capture.getvalue()
        
        if idx == 0:
            first_stdout = raw_stdout
            first_stderr = raw_stderr
            first_error = exec_error
            
        test_passed = False
        test_err = None
        raw_exp = str(t.get("expectedOutput") or "")
        
        if exec_error is not None:
            test_passed = False
            test_err = exec_error
            all_passed = False
        else:
            assertion = t.get("assertionPython", "")
            user_namespace["_raw_stdout"] = raw_stdout.strip()
            user_namespace["_user_code"] = user_code_str
            user_namespace["_user_namespace"] = user_namespace
            
            if assertion:
                try:
                    exec(assertion, user_namespace)
                    test_passed = True
                except AssertionError as ae:
                    test_passed = False
                    test_err = str(ae) if str(ae) else f"Assertion failed: {assertion}"
                except Exception as ex:
                    test_passed = False
                    test_err = f"{type(ex).__name__}: {ex}"
            elif ("expectedOutput" in t) and t.get("expectedOutput") is not None:
                actual_lines = [line.rstrip() for line in raw_stdout.strip().splitlines()] if raw_stdout.strip() else []
                exp_lines = [line.rstrip() for line in raw_exp.strip().splitlines()] if raw_exp.strip() else []
                norm_actual = "\\n".join(actual_lines)
                norm_expected = "\\n".join(exp_lines)
                
                if norm_actual == norm_expected:
                    test_passed = True
                elif raw_exp.startswith(("'", '"')) and raw_exp.endswith(("'", '"')) and norm_actual == raw_exp[1:-1].strip():
                    test_passed = True
                elif norm_actual and norm_expected:
                    try:
                        if float(norm_actual) == float(norm_expected):
                            test_passed = True
                    except (ValueError, TypeError):
                        pass
                
                if not test_passed:
                    test_err = f"Expected '{norm_expected}', but got '{norm_actual}'"
            else:
                test_passed = True
                
        if not test_passed:
            all_passed = False
            
        test_results.append({
            "testId": t.get("id", f"tc_{idx}"),
            "description": t.get("description", "Verification test"),
            "passed": test_passed,
            "actualOutput": raw_stdout.strip(),
            "expectedOutput": raw_exp.strip(),
            "error": test_err
        })
        
    combined_stdout = first_stdout + ("\\n" + first_stderr if first_stderr else "")
    return json.dumps({
        "stdout": combined_stdout,
        "error": first_error,
        "allPassed": all_passed,
        "testResults": test_results
    })
`;

export class ClientCodeExecutionService implements ICodeExecutionService {
  private worker: Worker | null = null;
  private pendingRequests: Map<string, { resolve: (res: any) => void; reject: (err: any) => void; timer: any }> = new Map();
  private pyodideDirect: PyodideInterface | null = null;
  private initializingDirect: Promise<void> | null = null;
  private pyodideFailedDirect: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.getWorker();
    }
  }

  private getWorker(): Worker | null {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return null;
    }
    if (!this.worker) {
      try {
        this.worker = new Worker(new URL('./pyodideWorker.ts', import.meta.url), { type: 'module' });
        this.worker.onmessage = (e: MessageEvent) => {
          const { id, ...data } = e.data || {};
          if (id && this.pendingRequests.has(id)) {
            const req = this.pendingRequests.get(id)!;
            clearTimeout(req.timer);
            this.pendingRequests.delete(id);
            req.resolve(data);
          }
        };
        this.worker.onerror = (err) => {
          console.warn('Pyodide Worker encountered error:', err);
          this.terminateWorker('Worker error');
        };
      } catch (err) {
        console.warn('Could not initialize Pyodide Worker, will use direct runner fallback:', err);
        this.worker = null;
      }
    }
    return this.worker;
  }

  private terminateWorker(reason: string) {
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    for (const [, req] of this.pendingRequests.entries()) {
      clearTimeout(req.timer);
      req.reject(new Error(reason));
    }
    this.pendingRequests.clear();
  }

  private async initDirectPyodide(): Promise<void> {
    if (!this.initializingDirect) {
      this.initializingDirect = (async () => {
        if (typeof window === 'undefined') {
          this.pyodideFailedDirect = true;
          return;
        }
        try {
          this.pyodideDirect = await loadPyodide({
            indexURL: '/pyodide/'
          });
        } catch (err) {
          console.warn('Direct Pyodide load failed:', err);
          this.pyodideFailedDirect = true;
        }
      })();
    }
    return this.initializingDirect;
  }

  async executeRaw(code: string): Promise<{ stdout: string; error?: string; executionTimeMs: number }> {
    const startTime = performance.now();
    const trimmed = code.trim();
    if (!trimmed) {
      return { stdout: '', error: 'Editor is empty. Write your Python code before running.', executionTimeMs: 0 };
    }

    // 1. In Node.js environment (e.g. CLI runner or automated test scripts)
    if (typeof window === 'undefined') {
      try {
        const cp = (globalThis as any).process?.versions?.node
          ? (globalThis as any).require('child_process')
          : await (Function('m', 'return import(m)')('child_process') as Promise<any>);
        const script = `
import sys
import io
import traceback
import json

_stdout = io.StringIO()
_stderr = io.StringIO()
_orig_out = sys.stdout
_orig_err = sys.stderr
sys.stdout = _stdout
sys.stderr = _stderr
_err = None

try:
    exec(${JSON.stringify(trimmed)}, {"__name__": "__main__"})
except Exception as e:
    _err = traceback.format_exc()
except BaseException as e:
    _err = f"{type(e).__name__}: {e}"
finally:
    sys.stdout = _orig_out
    sys.stderr = _orig_err

print(json.dumps({
    "stdout": _stdout.getvalue(),
    "error": _err if _err else (_stderr.getvalue() if _stderr.getvalue() else None)
}))
`;
        const res = cp.spawnSync('python', [], {
          input: script,
          encoding: 'utf-8',
          timeout: 6000
        });

        if (res.error) {
          if ((res.error as any).code === 'ETIMEDOUT') {
            return {
              stdout: '',
              error: 'Execution timed out (exceeded 6 seconds limit). Infinite loop detected.',
              executionTimeMs: 6000
            };
          }
          return {
            stdout: '',
            error: res.error.message || 'Execution error',
            executionTimeMs: Math.round(performance.now() - startTime)
          };
        }

        const parsed = JSON.parse(res.stdout || '{}');
        return {
          stdout: parsed.stdout || '',
          error: parsed.error || undefined,
          executionTimeMs: Math.max(10, Math.round(performance.now() - startTime))
        };
      } catch (err: any) {
        return {
          stdout: '',
          error: err.message || 'Node execution failed',
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    // 2. In Browser via Web Worker (Timeout & Infinite Loop protected)
    const worker = this.getWorker();
    if (worker) {
      const id = 'req_' + Math.random().toString(36).substring(2, 9) + Date.now();
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          this.pendingRequests.delete(id);
          this.terminateWorker('Execution timed out (infinite loop protection: exceeded 6 seconds)');
          resolve({
            stdout: '',
            error: 'Execution timed out (infinite loop protection: exceeded 6 seconds). Check for while loops without increments or infinite recursion.',
            executionTimeMs: 6000
          });
        }, 6000);

        this.pendingRequests.set(id, {
          resolve: (res) => {
            resolve({
              stdout: res.stdout || '',
              error: res.error,
              executionTimeMs: res.executionTimeMs || Math.round(performance.now() - startTime)
            });
          },
          reject: (err) => {
            resolve({
              stdout: '',
              error: err?.message || 'Worker execution error',
              executionTimeMs: Math.round(performance.now() - startTime)
            });
          },
          timer
        });

        worker.postMessage({ id, type: 'executeRaw', code: trimmed });
      });
    }

    // 3. Browser fallback directly if Worker is disabled by environment
    if (!this.pyodideDirect && !this.pyodideFailedDirect) {
      try {
        await Promise.race([
          this.initDirectPyodide(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Pyodide load timeout')), 5000))
        ]);
      } catch {
        this.pyodideFailedDirect = true;
      }
    }

    if (this.pyodideDirect) {
      try {
        const runnerCode = `
import sys
import io
import traceback
import json

_stdout = io.StringIO()
_stderr = io.StringIO()
sys.stdout = _stdout
sys.stderr = _stderr
_err = ""
try:
    exec(${JSON.stringify(trimmed)}, {"__name__": "__main__"})
except Exception as e:
    _err = traceback.format_exc()
except BaseException as e:
    _err = f"{type(e).__name__}: {e}"
finally:
    _out = _stdout.getvalue()
    _err_out = _stderr.getvalue()
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

json.dumps({
    "stdout": _out,
    "error": _err if _err else (_err_out if _err_out else None)
})
`;
        const resJson = await this.pyodideDirect.runPythonAsync(runnerCode);
        const parsed = JSON.parse(String(resJson));
        return {
          stdout: parsed.stdout || '',
          error: parsed.error || undefined,
          executionTimeMs: Math.max(5, Math.round(performance.now() - startTime))
        };
      } catch (err: any) {
        return {
          stdout: '',
          error: err.message || 'Execution error',
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    return {
      stdout: '',
      error: 'Python runtime is currently unavailable. Please check your connection or reload.',
      executionTimeMs: 0
    };
  }

  async execute(code: string, challenge: Challenge): Promise<ExecutionResult> {
    const startTime = performance.now();
    const trimmedCode = code.trim();

    if (!trimmedCode) {
      return this.createEmptyError(challenge);
    }

    const tests = challenge.tests || [];
    const testPayloadJson = JSON.stringify(tests.map(t => ({
      id: t.id,
      description: t.description,
      expectedOutput: t.expectedOutput,
      input: t.input || '',
      assertionPython: (t as any).assertionPython || ''
    })));

    // 1. Node.js environment execution (for tests and verification scripts)
    if (typeof window === 'undefined') {
      try {
        const cp = (globalThis as any).process?.versions?.node
          ? (globalThis as any).require('child_process')
          : await (Function('m', 'return import(m)')('child_process') as Promise<any>);
        const harness = `
${RUNNER_SCRIPT}
print(_run_payload(${JSON.stringify(trimmedCode)}, ${JSON.stringify(testPayloadJson)}))
`;
        const res = cp.spawnSync('python', [], {
          input: harness,
          encoding: 'utf-8',
          timeout: 6000
        });

        if (res.error) {
          const isTimeout = (res.error as any).code === 'ETIMEDOUT';
          return {
            success: false,
            stdout: '',
            error: isTimeout ? 'Execution timed out (infinite loop protection: exceeded 6 seconds).' : res.error.message,
            diagnostic: {
              mistakeType: isTimeout ? 'infinite_loop_or_timeout' : 'runtime_error',
              message: isTimeout ? 'Your code timed out. Look for infinite loops or recursion.' : res.error.message,
              fixSuggestion: challenge.hint || 'Review your code logic.'
            },
            testResults: tests.map(t => ({
              testId: t.id,
              description: t.description,
              passed: false,
              actualOutput: '',
              expectedOutput: t.expectedOutput || '',
              error: isTimeout ? 'Execution timed out' : res.error?.message
            })),
            executionTimeMs: isTimeout ? 6000 : Math.round(performance.now() - startTime)
          };
        }

        const parsed = JSON.parse(res.stdout || '{}');
        const diagnostic = this.deriveDiagnostic(trimmedCode, challenge, parsed.error);

        return {
          success: Boolean(parsed.allPassed),
          stdout: parsed.stdout || '',
          error: parsed.error || undefined,
          diagnostic: !parsed.allPassed ? diagnostic : undefined,
          testResults: parsed.testResults || [],
          executionTimeMs: Math.max(10, Math.round(performance.now() - startTime))
        };
      } catch (err: any) {
        return {
          success: false,
          stdout: '',
          error: err.message || 'Node execution failed',
          diagnostic: {
            mistakeType: 'execution_error',
            message: err.message || 'Execution error',
            fixSuggestion: 'Please check your code syntax.'
          },
          testResults: tests.map(t => ({
            testId: t.id,
            description: t.description,
            passed: false,
            actualOutput: '',
            expectedOutput: t.expectedOutput || '',
            error: err.message
          })),
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    // 2. In Browser via Web Worker (Timeout & Infinite Loop protected)
    const worker = this.getWorker();
    if (worker) {
      const id = 'req_' + Math.random().toString(36).substring(2, 9) + Date.now();
      return new Promise<ExecutionResult>((resolve) => {
        const timer = setTimeout(() => {
          this.pendingRequests.delete(id);
          this.terminateWorker('Execution timed out (infinite loop protection: exceeded 6 seconds)');
          resolve({
            success: false,
            stdout: '',
            error: 'Execution timed out (infinite loop protection: exceeded 6 seconds). Check for while loops without increments or infinite recursion.',
            diagnostic: {
              mistakeType: 'infinite_loop_or_timeout',
              message: 'Your code ran longer than the allowed 6-second execution limit. Look for loops that never terminate.',
              fixSuggestion: 'Ensure while loop conditions eventually become False or include a break statement.'
            },
            testResults: tests.map(t => ({
              testId: t.id,
              description: t.description,
              passed: false,
              actualOutput: '',
              expectedOutput: t.expectedOutput || '',
              error: 'Execution timed out'
            })),
            executionTimeMs: 6000
          });
        }, 6000);

        this.pendingRequests.set(id, {
          resolve: (res) => {
            const diagnostic = this.deriveDiagnostic(trimmedCode, challenge, res.error);
            resolve({
              success: Boolean(res.success),
              stdout: res.stdout || '',
              error: res.error,
              diagnostic: !res.success ? diagnostic : undefined,
              testResults: res.testResults || [],
              executionTimeMs: res.executionTimeMs || Math.round(performance.now() - startTime)
            });
          },
          reject: (err) => {
            resolve({
              success: false,
              stdout: '',
              error: err?.message || 'Worker execution error',
              diagnostic: {
                mistakeType: 'execution_exception',
                message: err?.message || 'Worker execution error',
                fixSuggestion: 'Please check your syntax or reset to starter code.'
              },
              testResults: tests.map(t => ({
                testId: t.id,
                description: t.description,
                passed: false,
                actualOutput: '',
                expectedOutput: t.expectedOutput || '',
                error: err?.message
              })),
              executionTimeMs: Math.round(performance.now() - startTime)
            });
          },
          timer
        });

        worker.postMessage({ id, type: 'execute', code: trimmedCode, testsJson: testPayloadJson });
      });
    }

    // 3. Browser fallback directly if Worker is not supported
    if (!this.pyodideDirect && !this.pyodideFailedDirect) {
      try {
        await Promise.race([
          this.initDirectPyodide(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Pyodide load timeout')), 5000))
        ]);
      } catch {
        this.pyodideFailedDirect = true;
      }
    }

    if (this.pyodideDirect) {
      try {
        const pythonScript = `
${RUNNER_SCRIPT}
_run_payload(${JSON.stringify(trimmedCode)}, ${JSON.stringify(testPayloadJson)})
`;
        const rawJsonResult = await this.pyodideDirect.runPythonAsync(pythonScript);
        const parsed = JSON.parse(String(rawJsonResult));
        const diagnostic = this.deriveDiagnostic(trimmedCode, challenge, parsed.error);

        return {
          success: Boolean(parsed.allPassed),
          stdout: parsed.stdout || '',
          error: parsed.error || undefined,
          diagnostic: !parsed.allPassed ? diagnostic : undefined,
          testResults: parsed.testResults || [],
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
          testResults: tests.map(t => ({
            testId: t.id,
            description: t.description,
            passed: false,
            actualOutput: '',
            expectedOutput: t.expectedOutput || '',
            error: message
          })),
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }
    }

    // 4. Authoritative Runtime Unavailable Result (NO FALSE SUCCESS FALLBACK)
    return {
      success: false,
      stdout: '',
      error: 'Python runtime is currently unavailable (failed to initialize WebAssembly environment). Please check your internet connection or reload the page.',
      diagnostic: {
        mistakeType: 'runtime_unavailable',
        message: 'The Python execution engine could not be loaded.',
        fixSuggestion: 'Check your network connection and reload the page to initialize the Pyodide environment.'
      },
      testResults: tests.map(t => ({
        testId: t.id,
        description: t.description,
        passed: false,
        actualOutput: '',
        expectedOutput: t.expectedOutput || '',
        error: 'Runtime unavailable'
      })),
      executionTimeMs: 0
    };
  }

  private deriveDiagnostic(code: string, challenge: Challenge, error?: string): { mistakeType: string; message: string; fixSuggestion: string } {
    let mistakeType = 'test_failure';
    let message = error || 'One or more verification tests failed.';
    let fixSuggestion = challenge.hint || 'Review your code logic and test requirements.';

    if (challenge.diagnosticRules) {
      for (const rule of challenge.diagnosticRules) {
        try {
          const regex = new RegExp(rule.pattern, 'm');
          if (regex.test(code)) {
            const solRegex = new RegExp(rule.pattern, 'm');
            if (!solRegex.test(challenge.solutionCode || '')) {
              return {
                mistakeType: rule.mistakeType,
                message: rule.message,
                fixSuggestion: rule.fixSuggestion || challenge.hint || 'Review your code logic.'
              };
            }
          }
        } catch {
          // ignore regex errors
        }
      }
    }

    if (error) {
      if (error.includes('SyntaxError')) {
        const isAssignmentInIf = code.includes('if ') && !code.includes('==') && code.includes('=');
        mistakeType = isAssignmentInIf ? 'ASSIGNMENT_VS_COMPARISON' : 'SYNTAX_ERROR';
        message = isAssignmentInIf ? 'Did you use = instead of == in your condition? Remember = assigns, while == compares.' : error;
        fixSuggestion = isAssignmentInIf
          ? 'Replace = with == in your if statement condition.'
          : 'Check for missing parentheses, missing colons (:), or unclosed quotes.';
      } else if (error.includes('IndentationError')) {
        mistakeType = 'INDENTATION_ERROR';
        message = 'Python uses 4 spaces to define blocks of code under statements like if, for, while, or def.';
        fixSuggestion = 'Indent the line inside the block by 4 spaces.';
      } else if (error.includes('TypeError') && (error.includes('can only concatenate str') || error.includes('unsupported operand'))) {
        mistakeType = 'STRING_VS_NUMBER';
        message = 'Cannot concatenate a string and a number with +. Convert the number with str() first.';
        fixSuggestion = 'Wrap the numeric variable or value in str(...) before concatenating.';
      } else if (error.includes('NameError')) {
        mistakeType = 'VARIABLE_VALUE_CONFUSION';
        message = 'A variable was referenced before being defined or its name is misspelled.';
        fixSuggestion = 'Verify that the variable name is spelled and capitalized consistently.';
      } else if (error.includes('AssertionError')) {
        mistakeType = 'assertion_failure';
        message = error;
        fixSuggestion = 'Check that your variable values match the exercise specifications.';
      }
    }

    return { mistakeType, message, fixSuggestion };
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
        expectedOutput: t.expectedOutput || '',
        error: 'No output generated'
      })),
      executionTimeMs: 0
    };
  }
}

export const codeExecutionService = new ClientCodeExecutionService();
