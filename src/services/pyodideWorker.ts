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

def _run_payload(user_code_str, tests_json_str):
    tests = json.loads(tests_json_str)
    
    stdout_capture = io.StringIO()
    stderr_capture = io.StringIO()
    orig_stdout = sys.stdout
    orig_stderr = sys.stderr
    
    sys.stdout = stdout_capture
    sys.stderr = stderr_capture
    
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
        
    raw_stdout = stdout_capture.getvalue()
    raw_stderr = stderr_capture.getvalue()
    
    test_results = []
    all_passed = True
    
    if exec_error is not None:
        all_passed = False
        for t in tests:
            test_results.append({
                "testId": t.get("id", "t_unknown"),
                "description": t.get("description", "Execution verification"),
                "passed": False,
                "actualOutput": raw_stdout,
                "expectedOutput": str(t.get("expectedOutput", "")),
                "error": exec_error
            })
        if len(tests) == 0:
            test_results.append({
                "testId": "exec_0",
                "description": "Code execution",
                "passed": False,
                "actualOutput": raw_stdout,
                "expectedOutput": "",
                "error": exec_error
            })
    else:
        for t in tests:
            assertion = t.get("assertionPython", "")
            raw_exp = str(t.get("expectedOutput", ""))
            test_passed = False
            test_err = None
            
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
                test_passed = (exec_error is None)
                
            if not test_passed:
                all_passed = False
                
            test_results.append({
                "testId": t.get("id", "t_unknown"),
                "description": t.get("description", "Verification test"),
                "passed": test_passed,
                "actualOutput": raw_stdout.strip(),
                "expectedOutput": raw_exp.strip(),
                "error": test_err
            })
            
        if len(tests) == 0:
            all_passed = (exec_error is None)
            
    combined_stdout = raw_stdout + ("\\n" + raw_stderr if raw_stderr else "")
    return json.dumps({
        "stdout": combined_stdout,
        "error": exec_error,
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

_stdout_buffer = io.StringIO()
_stderr_buffer = io.StringIO()
sys.stdout = _stdout_buffer
sys.stderr = _stderr_buffer

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
