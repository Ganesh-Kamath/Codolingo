import { loadPyodide, PyodideInterface } from 'pyodide';

let pyodide: PyodideInterface | null = null;
let isInitializing = false;
let initPromise: Promise<PyodideInterface> | null = null;

async function getPyodide(): Promise<PyodideInterface> {
  if (pyodide) return pyodide;
  if (!initPromise) {
    isInitializing = true;
    initPromise = (async () => {
      try {
        const loaded = await loadPyodide({
          indexURL: '/pyodide/'
        });
        pyodide = loaded;
        return loaded;
      } finally {
        isInitializing = false;
      }
    })();
  }
  return initPromise;
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

self.onmessage = async (e: MessageEvent) => {
  const { id, type, code, testsJson } = e.data;
  const startTime = performance.now();

  try {
    const py = await getPyodide();

    if (type === 'executeRaw') {
      const runnerCode = `
import sys
import io
import traceback
import builtins

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

def _mock_input(prompt=""):
    if prompt:
        _stdout_buffer.write(str(prompt))
    return ""
builtins.input = _mock_input

_runtime_err = ""
try:
    exec(${JSON.stringify(code)}, {"__name__": "__main__"})
except Exception as e:
    _runtime_err = traceback.format_exc()
except BaseException as e:
    _runtime_err = f"{type(e).__name__}: {e}"
finally:
    _captured_stdout = _stdout_buffer.getvalue()
    _captured_stderr = _stderr_buffer.getvalue()
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__

import json
json.dumps({
    "stdout": _captured_stdout,
    "error": _runtime_err if _runtime_err else (_captured_stderr if _captured_stderr else None)
})
`;
      const resJson = await py.runPythonAsync(runnerCode);
      const parsed = JSON.parse(String(resJson));
      self.postMessage({
        id,
        success: !parsed.error,
        stdout: parsed.stdout || '',
        error: parsed.error || undefined,
        executionTimeMs: Math.max(5, Math.round(performance.now() - startTime))
      });
      return;
    }

    if (type === 'execute') {
      const pythonScript = `
${RUNNER_SCRIPT}
_run_payload(${JSON.stringify(code)}, ${JSON.stringify(testsJson)})
`;
      const rawJson = await py.runPythonAsync(pythonScript);
      const parsed = JSON.parse(String(rawJson));
      self.postMessage({
        id,
        success: parsed.allPassed,
        stdout: parsed.stdout || '',
        error: parsed.error || undefined,
        testResults: parsed.testResults || [],
        executionTimeMs: Math.max(5, Math.round(performance.now() - startTime))
      });
      return;
    }

    if (type === 'init') {
      self.postMessage({ id, type: 'init_done' });
      return;
    }
  } catch (err: any) {
    self.postMessage({
      id,
      success: false,
      stdout: '',
      error: err?.message || 'Execution error',
      testResults: [],
      executionTimeMs: Math.round(performance.now() - startTime)
    });
  }
};
