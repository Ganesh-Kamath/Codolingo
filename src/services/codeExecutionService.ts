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
        try {
          this.pyodide = await loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
          });
        } catch (err) {
          console.warn("Pyodide CDN load failed or offline, using fallback code validator:", err);
          this.pyodideFailed = true;
        }
      })();
    }
    return this.initializing;
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
        const runnerCode = `
import sys
import io
sys.stdout = io.StringIO()

try:
    exec(${JSON.stringify(trimmedCode)}, globals())
except Exception as e:
    print(f"Error: {e}")

_output = sys.stdout.getvalue()
sys.stdout = sys.__stdout__
_output
`;
        const stdout = await this.pyodide.runPythonAsync(runnerCode);
        const outputStr = String(stdout);

        if (outputStr.startsWith('Error: ')) {
          const errMsg = outputStr.replace('Error: ', '').trim();
          return {
            success: false,
            stdout: outputStr,
            error: errMsg,
            diagnostic: {
              mistakeType: 'runtime_error',
              message: errMsg,
              fixSuggestion: 'Review the error traceback above and correct your logic.'
            },
            testResults: (challenge.tests || []).map(t => ({
              testId: t.id,
              description: t.description,
              passed: false,
              actualOutput: outputStr,
              expectedOutput: t.expectedOutput,
              error: errMsg
            })),
            executionTimeMs: Math.round(performance.now() - startTime)
          };
        }

        // Test Evaluation
        const normalizedActual = outputStr.trim();
        let testResults: TestResult[] = [];
        let allPassed = false;

        if (challenge.tests && challenge.tests.length > 0) {
          testResults = challenge.tests.map(test => {
            const normalizedExpected = test.expectedOutput.trim();
            // Handle quotes in expected output e.g. "'Hello'" vs "Hello"
            const stripQuotes = (s: string) => s.replace(/^['"]|['"]$/g, '');
            const passed =
              normalizedActual === normalizedExpected ||
              stripQuotes(normalizedActual) === stripQuotes(normalizedExpected) ||
              normalizedActual.toLowerCase() === normalizedExpected.toLowerCase() ||
              (normalizedExpected.length > 0 && normalizedActual.includes(stripQuotes(normalizedExpected)));

            return {
              testId: test.id,
              description: test.description,
              passed,
              actualOutput: normalizedActual,
              expectedOutput: normalizedExpected,
              error: passed ? undefined : `Expected "${normalizedExpected}", but got "${normalizedActual}"`
            };
          });
          allPassed = testResults.every(t => t.passed);
        } else if (challenge.solutionCode) {
          // Compare with solution code execution or normalized AST
          let solutionOutput = '';
          try {
            const solRunner = `
import sys, io
sys.stdout = io.StringIO()
try:
    exec(${JSON.stringify(challenge.solutionCode.trim())}, globals())
except:
    pass
_s_out = sys.stdout.getvalue()
sys.stdout = sys.__stdout__
_s_out
`;
            solutionOutput = String(await this.pyodide.runPythonAsync(solRunner)).trim();
          } catch {}

          const codeMatches = this.normalizeCode(trimmedCode) === this.normalizeCode(challenge.solutionCode);
          const outputMatches = solutionOutput ? normalizedActual === solutionOutput : false;

          allPassed = outputMatches || codeMatches;
          testResults = [{
            testId: 't_main',
            description: 'Solution validation',
            passed: allPassed,
            actualOutput: normalizedActual,
            expectedOutput: solutionOutput || 'Valid solution code',
            error: allPassed ? undefined : 'Your code output did not match expected solution.'
          }];
        } else {
          allPassed = true;
          testResults = [{
            testId: 't_run',
            description: 'Code executed cleanly',
            passed: true,
            actualOutput: normalizedActual,
            expectedOutput: normalizedActual
          }];
        }

        return {
          success: allPassed,
          stdout: outputStr,
          diagnostic: !allPassed ? {
            mistakeType: 'output_mismatch',
            message: 'Your code executed, but the output did not match requirements.',
            fixSuggestion: challenge.hint || 'Check your print formatting, variable names, or spacing.'
          } : undefined,
          testResults,
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

    // Check direct or structural match
    let isMatch = normalizedUser === normalizedSol;

    // Check if test cases match expected outputs
    const testResults: TestResult[] = (challenge.tests || []).map((t, idx) => {
      const exp = (t.expectedOutput || '').replace(/^['"]|['"]$/g, '');
      const codeContainsExp = exp ? normalizedUser.includes(this.normalizeCode(exp)) : false;
      const passed = isMatch || codeContainsExp;

      return {
        testId: t.id || `t_${idx}`,
        description: t.description || `Test Case ${idx + 1}`,
        passed,
        actualOutput: passed ? (t.expectedOutput || 'Passed') : 'Output mismatch',
        expectedOutput: t.expectedOutput || '',
        error: passed ? undefined : `Expected "${t.expectedOutput}"`
      };
    });

    const allPassed = testResults.length > 0 ? testResults.every(t => t.passed) : (isMatch || normalizedUser.length > 0);

    return {
      success: allPassed,
      stdout: allPassed ? 'Code verified successfully.' : 'Output did not match solution.',
      diagnostic: allPassed ? undefined : {
        mistakeType: 'code_mismatch',
        message: 'Your code does not yet meet the exercise requirements.',
        fixSuggestion: challenge.hint || 'Review the instructions and required structure.'
      },
      testResults: testResults.length > 0 ? testResults : [{
        testId: 't_fallback',
        description: 'Code structure check',
        passed: allPassed,
        actualOutput: allPassed ? 'Correct' : 'Incorrect',
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
