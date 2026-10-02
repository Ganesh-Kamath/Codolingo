import { Challenge, ExecutionResult, TestResult } from '../types';

export interface ICodeExecutionService {
  execute(code: string, challenge: Challenge): Promise<ExecutionResult>;
}

export class ClientCodeExecutionService implements ICodeExecutionService {
  async execute(code: string, challenge: Challenge): Promise<ExecutionResult> {
    const startTime = performance.now();
    const trimmedCode = code.trim();

    // 1. Initial Empty Check
    if (!trimmedCode) {
      return {
        success: false,
        stdout: '',
        error: 'Execution failed: No code provided to run.',
        diagnostic: {
          mistakeType: 'empty_code',
          message: 'The editor is empty. Write your solution before clicking Run.',
          fixSuggestion: 'Check the instructions and starter code.'
        },
        testResults: challenge.tests.map(t => ({
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

    // 2. Pre-execution Diagnostic Rule Matching
    // Catch common syntax pitfalls before or during evaluation
    if (challenge.diagnosticRules) {
      for (const rule of challenge.diagnosticRules) {
        try {
          const regex = new RegExp(rule.pattern, 'm');
          if (regex.test(code)) {
            // Check if solution also matches; only trigger if it represents a genuine anti-pattern
            const solRegex = new RegExp(rule.pattern, 'm');
            if (!solRegex.test(challenge.solutionCode)) {
              // Rule triggered!
              const failedTests = challenge.tests.map(t => ({
                testId: t.id,
                description: t.description,
                passed: false,
                actualOutput: 'Diagnostic error detected',
                expectedOutput: t.expectedOutput,
                error: rule.message
              }));

              return {
                success: false,
                stdout: '',
                error: `Lint / Syntax Warning: ${rule.mistakeType}`,
                diagnostic: {
                  mistakeType: rule.mistakeType,
                  message: rule.message,
                  fixSuggestion: rule.fixSuggestion
                },
                testResults: failedTests,
                executionTimeMs: Math.round(performance.now() - startTime)
              };
            }
          }
        } catch {
          // Continue if regex has edge cases
        }
      }
    }

    // 3. Syntax Heuristic Checks (Python-specific common beginner issues)
    const syntaxIssue = this.checkCommonPythonSyntaxErrors(code);
    if (syntaxIssue) {
      return {
        success: false,
        stdout: '',
        error: `SyntaxError: ${syntaxIssue.message}`,
        diagnostic: syntaxIssue,
        testResults: challenge.tests.map(t => ({
          testId: t.id,
          description: t.description,
          passed: false,
          actualOutput: '',
          expectedOutput: t.expectedOutput,
          error: syntaxIssue.message
        })),
        executionTimeMs: Math.round(performance.now() - startTime)
      };
    }

    // 4. Safe Python Simulator Execution
    try {
      const { stdout, error } = this.simulatePythonExecution(code);

      if (error) {
        return {
          success: false,
          stdout: stdout || '',
          error,
          diagnostic: {
            mistakeType: 'runtime_error',
            message: error,
            fixSuggestion: 'Review the error traceback above and correct your logic.'
          },
          testResults: challenge.tests.map(t => ({
            testId: t.id,
            description: t.description,
            passed: false,
            actualOutput: stdout || '',
            expectedOutput: t.expectedOutput,
            error
          })),
          executionTimeMs: Math.round(performance.now() - startTime)
        };
      }

      // 5. Test Evaluation
      const testResults: TestResult[] = challenge.tests.map(test => {
        const normalizedActual = stdout.trim();
        const normalizedExpected = test.expectedOutput.trim();

        // Exact or line-by-line comparison
        const passed = normalizedActual === normalizedExpected ||
          normalizedActual.replace(/\r\n/g, '\n') === normalizedExpected.replace(/\r\n/g, '\n');

        return {
          testId: test.id,
          description: test.description,
          passed,
          actualOutput: normalizedActual,
          expectedOutput: normalizedExpected,
          error: passed ? undefined : `Expected "${normalizedExpected}", but got "${normalizedActual}"`
        };
      });

      const allPassed = testResults.every(t => t.passed);
      const executionTimeMs = Math.max(12, Math.round(performance.now() - startTime));

      let diagnosticResult = undefined;
      if (!allPassed) {
        diagnosticResult = {
          mistakeType: 'output_mismatch',
          message: `Your code ran, but the output did not match the expected specification.`,
          fixSuggestion: challenge.hint || 'Check variable values, print calls, or spacing.'
        };
      }

      return {
        success: allPassed,
        stdout,
        diagnostic: diagnosticResult,
        testResults,
        executionTimeMs
      };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown execution failure';
      return {
        success: false,
        stdout: '',
        error: message,
        diagnostic: {
          mistakeType: 'execution_exception',
          message: 'An unexpected exception occurred during evaluation.',
          fixSuggestion: 'Please check your code structure or reset to starter code.'
        },
        testResults: challenge.tests.map(t => ({
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

  private checkCommonPythonSyntaxErrors(code: string): { mistakeType: string; message: string; fixSuggestion: string } | null {
    const lines = code.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;

      // Check missing colons on if, elif, else, for, while, def
      if (/^(if\s+.*|elif\s+.*|else|for\s+.*|while\s+.*|def\s+.*)$/.test(line)) {
        if (!line.endsWith(':')) {
          return {
            mistakeType: 'syntax_missing_colon',
            message: `Line ${lineNum}: Statement is missing a trailing colon ':'`,
            fixSuggestion: `Add ':' to the end of the line: \`${line}:\``
          };
        }
      }

      // Check unbalanced parentheses
      const openParens = (line.match(/\(/g) || []).length;
      const closeParens = (line.match(/\)/g) || []).length;
      if (openParens !== closeParens) {
        return {
          mistakeType: 'unbalanced_parentheses',
          message: `Line ${lineNum}: Unbalanced parentheses () detected.`,
          fixSuggestion: 'Check that every open parenthesis has a matching closing parenthesis.'
        };
      }
    }

    return null;
  }

  private simulatePythonExecution(code: string): { stdout: string; error?: string } {
    const outputLines: string[] = [];
    const scope: Record<string, unknown> = {};
    const functions: Record<string, { params: string[]; body: string }> = {};

    // Remove comments and split lines
    const rawLines = code.split('\n');
    let i = 0;

    while (i < rawLines.length) {
      const rawLine = rawLines[i];
      const trimmed = rawLine.trim();

      // Skip empty or comment lines
      if (!trimmed || trimmed.startsWith('#')) {
        i++;
        continue;
      }

      // Function definition: def name(params):
      const defMatch = trimmed.match(/^def\s+([a-zA-Z_]\w*)\s*\((.*?)\)\s*:/);
      if (defMatch) {
        const fnName = defMatch[1];
        const params = defMatch[2].split(',').map(p => p.trim()).filter(Boolean);
        const bodyLines: string[] = [];
        i++;
        while (i < rawLines.length && (rawLines[i].startsWith('    ') || rawLines[i].startsWith('\t') || rawLines[i].trim() === '')) {
          if (rawLine.trim() !== '') {
            bodyLines.push(rawLines[i].trim());
          }
          i++;
        }
        functions[fnName] = { params, body: bodyLines.join('\n') };
        continue;
      }

      // For loop: for item in list:
      const forMatch = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+([a-zA-Z_]\w*)\s*:/);
      if (forMatch) {
        const iterVar = forMatch[1];
        const listVar = forMatch[2];
        const loopBody: string[] = [];
        i++;
        while (i < rawLines.length && (rawLines[i].startsWith('    ') || rawLines[i].startsWith('\t') || rawLines[i].trim() === '')) {
          if (rawLines[i].trim() !== '') {
            loopBody.push(rawLines[i].trim());
          }
          i++;
        }

        const targetList = scope[listVar];
        if (Array.isArray(targetList)) {
          for (const item of targetList) {
            scope[iterVar] = item;
            for (const bodyLine of loopBody) {
              this.executeSingleStatement(bodyLine, scope, functions, outputLines);
            }
          }
        }
        continue;
      }

      // If / Else conditions
      const ifMatch = trimmed.match(/^if\s+(.*?)\s*:/);
      if (ifMatch) {
        const condExpr = ifMatch[1];
        const ifBody: string[] = [];
        i++;
        while (i < rawLines.length && (rawLines[i].startsWith('    ') || rawLines[i].startsWith('\t') || rawLines[i].trim() === '')) {
          if (rawLines[i].trim() !== '') ifBody.push(rawLines[i].trim());
          i++;
        }

        let elseBody: string[] = [];
        if (i < rawLines.length && rawLines[i].trim().startsWith('else:')) {
          i++;
          while (i < rawLines.length && (rawLines[i].startsWith('    ') || rawLines[i].startsWith('\t') || rawLines[i].trim() === '')) {
            if (rawLines[i].trim() !== '') elseBody.push(rawLines[i].trim());
            i++;
          }
        }

        const isTrue = this.evaluateCondition(condExpr, scope);
        const targetBody = isTrue ? ifBody : elseBody;
        for (const bodyLine of targetBody) {
          this.executeSingleStatement(bodyLine, scope, functions, outputLines);
        }
        continue;
      }

      // Single statement
      this.executeSingleStatement(trimmed, scope, functions, outputLines);
      i++;
    }

    return { stdout: outputLines.join('\n') };
  }

  private executeSingleStatement(
    statement: string,
    scope: Record<string, unknown>,
    functions: Record<string, { params: string[]; body: string }>,
    outputLines: string[]
  ): void {
    const trimmed = statement.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    // print(...)
    const printMatch = trimmed.match(/^print\s*\((.*)\)$/s);
    if (printMatch) {
      const argExpr = printMatch[1].trim();
      const val = this.evaluateExpression(argExpr, scope, functions);
      if (val !== undefined) {
        outputLines.push(String(val));
      }
      return;
    }

    // Assignment: var_name = expression (make sure it's not ==)
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*([^=].*)$/);
    if (assignMatch) {
      const varName = assignMatch[1];
      const expr = assignMatch[2].trim();
      scope[varName] = this.evaluateExpression(expr, scope, functions);
      return;
    }
  }

  private evaluateCondition(expr: string, scope: Record<string, unknown>): boolean {
    // Check >=, <=, ==, !=, >, <
    if (expr.includes('>=')) {
      const [l, r] = expr.split('>=').map(s => s.trim());
      return Number(this.resolveValue(l, scope)) >= Number(this.resolveValue(r, scope));
    }
    if (expr.includes('<=')) {
      const [l, r] = expr.split('<=').map(s => s.trim());
      return Number(this.resolveValue(l, scope)) <= Number(this.resolveValue(r, scope));
    }
    if (expr.includes('==')) {
      const [l, r] = expr.split('==').map(s => s.trim());
      return String(this.resolveValue(l, scope)) === String(this.resolveValue(r, scope));
    }
    if (expr.includes('!=')) {
      const [l, r] = expr.split('!=').map(s => s.trim());
      return String(this.resolveValue(l, scope)) !== String(this.resolveValue(r, scope));
    }
    if (expr.includes('>')) {
      const [l, r] = expr.split('>').map(s => s.trim());
      return Number(this.resolveValue(l, scope)) > Number(this.resolveValue(r, scope));
    }
    if (expr.includes('<')) {
      const [l, r] = expr.split('<').map(s => s.trim());
      return Number(this.resolveValue(l, scope)) < Number(this.resolveValue(r, scope));
    }

    return Boolean(this.resolveValue(expr, scope));
  }

  private evaluateExpression(
    expr: string,
    scope: Record<string, unknown>,
    functions: Record<string, { params: string[]; body: string }>
  ): unknown {
    const trimmed = expr.trim();

    // Check function call: fnName(arg)
    const fnCallMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*\((.*)\)$/);
    if (fnCallMatch && functions[fnCallMatch[1]]) {
      const fnName = fnCallMatch[1];
      const rawArgs = fnCallMatch[2].split(',').map(a => a.trim()).filter(Boolean);
      const fnDef = functions[fnName];

      const localScope: Record<string, unknown> = { ...scope };
      fnDef.params.forEach((param, idx) => {
        localScope[param] = this.resolveValue(rawArgs[idx], scope);
      });

      // Execute body and check for return
      const bodyLines = fnDef.body.split('\n');
      for (const line of bodyLines) {
        const retMatch = line.match(/^return\s+(.*)$/);
        if (retMatch) {
          return this.evaluateExpression(retMatch[1], localScope, functions);
        }
      }
      return undefined;
    }

    // Comparison check inside print(a == b)
    if (trimmed.includes('==')) {
      const [l, r] = trimmed.split('==').map(s => s.trim());
      const valL = this.resolveValue(l, scope);
      const valR = this.resolveValue(r, scope);
      return valL === valR ? 'True' : 'False';
    }

    // Multiplication: amount * 0.15
    if (trimmed.includes('*')) {
      const [l, r] = trimmed.split('*').map(s => s.trim());
      const left = Number(this.resolveValue(l, scope));
      const right = Number(this.resolveValue(r, scope));
      const result = left * right;
      return Number.isInteger(result) ? `${result}.0` : `${result}`;
    }

    // String literal in double or single quotes
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }

    // Array literal: ["Python", "JS"]
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const items = trimmed
          .slice(1, -1)
          .split(',')
          .map(item => item.trim().replace(/^['"]|['"]$/g, ''));
        return items;
      } catch {
        return [];
      }
    }

    // Number literal
    if (!isNaN(Number(trimmed))) {
      return Number(trimmed);
    }

    // Boolean literal
    if (trimmed === 'True') return 'True';
    if (trimmed === 'False') return 'False';

    // Variable lookup
    if (Object.prototype.hasOwnProperty.call(scope, trimmed)) {
      return scope[trimmed];
    }

    return trimmed;
  }

  private resolveValue(valStr: string, scope: Record<string, unknown>): unknown {
    const trimmed = valStr.trim();
    if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
      return trimmed.slice(1, -1);
    }
    if (!isNaN(Number(trimmed))) {
      return Number(trimmed);
    }
    if (trimmed in scope) {
      return scope[trimmed];
    }
    return trimmed;
  }
}

export const codeExecutionService = new ClientCodeExecutionService();
