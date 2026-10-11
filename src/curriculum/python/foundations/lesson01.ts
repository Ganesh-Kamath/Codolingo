import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_01_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_1_1',
    unit: 'unit_01',
    lesson: '1.1',
    section: '1. What Python does',
    concept: 'print_execution',
    learning_objective: 'Predict the console output of a simple Python print statement.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Look at the following code:\n```python\nprint("Hello, Python!")\n```\nWhat will this program print to the screen?',
    codeSnippet: 'print("Hello, Python!")',
    expected_output: 'Hello, Python!',
    accepted_answers: ['Hello, Python!', 'Hello, Python'],
    options: [
      { id: 'opt_1', text: 'Hello, Python!', isCorrect: true, explanation: 'The print() function outputs the text inside the quotes, without the quotes.' },
      { id: 'opt_2', text: '"Hello, Python!"', isCorrect: false, explanation: 'Python does not include the enclosing quotation marks when printing strings.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_3', text: 'print("Hello, Python!")', isCorrect: false, explanation: 'print() is an instruction to output text, not text to be printed itself.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: 'Nothing (Syntax Error)', isCorrect: false, explanation: 'This is completely valid Python 3 syntax.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Hello, Python!',
    explanation: 'The print() function evaluates the argument inside its parentheses and sends the resulting text to standard output, without quotation marks.',
    hint: 'Quotation marks tell Python where the string begins and ends, but are not printed.',
    mental_model: 'Quotes are like an envelope: Python opens the envelope and delivers the letter inside to your screen.',
    relevant_line: 'print("Hello, Python!")',
    repair_question: {
      prompt: 'What will print("Welcome") output?',
      codeSnippet: 'print("Welcome")',
      options: [
        { id: 'rep_1', text: 'Welcome', isCorrect: true, explanation: 'The text inside the quotes is displayed directly.' },
        { id: 'rep_2', text: '"Welcome"', isCorrect: false, explanation: 'Quotes are delimiters and are not printed.' }
      ],
      correctAnswer: 'Welcome',
      explanation: 'print() outputs the text contents without enclosing quotes.'
    },
    misconception_tag: 'STRING_VS_NUMBER',
    repair_concept: 'print_basics',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_1_2',
    unit: 'unit_01',
    lesson: '1.1',
    section: '2. Running a Python program',
    concept: 'print_purpose',
    learning_objective: 'Identify the primary role of the print() function in Python.',
    difficulty: 'easy',
    question_type: 'MULTIPLE_CHOICE',
    prompt: 'What is the primary purpose of the `print()` function in Python?',
    options: [
      { id: 'opt_1', text: 'To send a physical document to a paper printer', isCorrect: false, explanation: 'Despite its historical name, Python print() does not interact with paper printers.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_2', text: 'To display text or values in the console/terminal', isCorrect: true, explanation: 'print() outputs data to the standard output stream (the terminal screen).' },
      { id: 'opt_3', text: 'To create a new variable in memory', isCorrect: false, explanation: 'Variables are created using assignment (=), not print().', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_4', text: 'To pause the program and wait for user typing', isCorrect: false, explanation: 'Waiting for user typing is done with input(), not print().', misconception_tag: 'INPUT_IS_STRING' }
    ],
    correct_answer: 'To display text or values in the console/terminal',
    explanation: 'In Python, print() is built-in to output human-readable information to the console screen.',
    hint: 'Think about where the output appears when you run code in the editor.',
    xp: 10,
    estimated_time: 30,
    order: 2
  },
  {
    id: 'py_fnd_1_3',
    unit: 'unit_01',
    lesson: '1.1',
    section: '3. print()',
    concept: 'sequential_print',
    learning_objective: 'Understand sequential top-to-bottom execution of multiple print statements.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Predict what the following two lines will print:\n```python\nprint("Line 1")\nprint("Line 2")\n```',
    codeSnippet: 'print("Line 1")\nprint("Line 2")',
    expected_output: 'Line 1\nLine 2',
    options: [
      { id: 'opt_1', text: 'Line 1 and Line 2 on separate lines', isCorrect: true, explanation: 'By default, each call to print() adds an automatic newline character.' },
      { id: 'opt_2', text: 'Line 1 Line 2 on the same single line', isCorrect: false, explanation: 'Each print() statement ends with a newline unless overridden.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_3', text: 'Line 2 only (overwrites Line 1)', isCorrect: false, explanation: 'Python executes sequentially without erasing prior output.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_4', text: '"Line 1"\n"Line 2"', isCorrect: false, explanation: 'Quotes are not printed in console output.', misconception_tag: 'STRING_VS_NUMBER' }
    ],
    correct_answer: 'Line 1 and Line 2 on separate lines',
    explanation: 'Python executes statements one after another from top to bottom. Each print() ends with a newline, placing subsequent prints on the next line.',
    hint: 'Each print() call defaults to moving down to a new line.',
    mental_model: 'Think of print() like typing a line on a typewriter and pressing the Return key.',
    relevant_line: 'print("Line 1")',
    xp: 15,
    estimated_time: 45,
    order: 3
  },
  {
    id: 'py_fnd_1_4',
    unit: 'unit_01',
    lesson: '1.1',
    section: '4. Strings',
    concept: 'print_syntax',
    learning_objective: 'Complete the print function call with correct closing syntax.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to print the word `Codolingo` to the console:\n```python\n____("Codolingo")\n```',
    codeSnippet: '____("Codolingo")',
    accepted_answers: ['print'],
    correct_answer: 'print',
    explanation: 'Python function names are lowercase. `print` is the exact name of the built-in output function.',
    hint: 'Function names in Python are case-sensitive. It starts with a lowercase p.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 15,
    estimated_time: 30,
    order: 4
  },
  {
    id: 'py_fnd_1_5',
    unit: 'unit_01',
    lesson: '1.1',
    section: '5. Basic output',
    concept: 'write_first_print',
    learning_objective: 'Write a valid print statement with quotes and parentheses.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'Write a Python program that prints exactly `Ready to code` to the screen.',
    starter_code: '# Write your code below\n',
    solution_code: 'print("Ready to code")',
    expected_output: 'Ready to code',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Output must be exactly "Ready to code"',
        expectedOutput: 'Ready to code',
        assertionPython: "assert _raw_stdout.strip() == 'Ready to code', f'Expected Ready to code, but got {_raw_stdout.strip()}'"
      },
      {
        id: 'tc_2',
        description: 'Uses the print function',
        expectedOutput: 'Ready to code',
        assertionPython: "assert 'print' in _user_code, 'Must use the print() function'"
      }
    ],
    explanation: '`print("Ready to code")` calls print with a string literal enclosed in double or single quotes.',
    hint: 'Enclose the text inside double quotes: print("Ready to code")',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_1_6',
    unit: 'unit_01',
    lesson: '1.1',
    section: '3. print()',
    concept: 'print_case_sensitivity',
    learning_objective: 'Debug a capitalization error in a Python print call.',
    difficulty: 'easy',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the bug in the program below. When you run it, Python gives a `NameError` because capitalization matters in Python.',
    starter_code: 'Print("Hello World")',
    solution_code: 'print("Hello World")',
    expected_output: 'Hello World',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints "Hello World" with lowercase print',
        expectedOutput: 'Hello World',
        assertionPython: "assert _raw_stdout.strip() == 'Hello World' and not _user_code.startswith('Print(')"
      }
    ],
    progressive_hints: [
      'Look closely at the very first letter of the function name.',
      'Python is case-sensitive: Print with a capital P is not recognized as print().',
      'Change Print(...) to lowercase print(...).'
    ],
    explanation: 'Python is strictly case-sensitive. `Print`, `PRINT`, and `print` are treated as completely different names. The built-in function is lowercase `print`.',
    hint: 'Python built-in functions are lowercase.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 20,
    estimated_time: 45,
    order: 6
  },
  {
    id: 'py_fnd_1_7',
    unit: 'unit_01',
    lesson: '1.1',
    section: '4. Strings',
    concept: 'quote_matching',
    learning_objective: 'Explain why mismatched quotation marks cause a SyntaxError.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at this code:\n```python\nprint("Python\')\n```\nWhy does Python refuse to run this program?',
    options: [
      { id: 'opt_1', text: 'Single quotes and double quotes were mixed without closing the opening quote', isCorrect: true, explanation: 'A string starting with a double quote must close with a double quote.' },
      { id: 'opt_2', text: 'Python does not allow the word "Python" inside strings', isCorrect: false, explanation: 'Any text can be placed inside strings.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_3', text: 'print() only accepts single quotes in modern Python', isCorrect: false, explanation: 'Both single quotes (\') and double quotes (") are completely valid in Python.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: 'The parentheses are missing commas', isCorrect: false, explanation: 'Single argument prints do not need commas.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Single quotes and double quotes were mixed without closing the opening quote',
    explanation: 'String delimiters must match. If you open with `"`, you must close with `"`. Mixing `"..."\'` leaves the string unterminated and causes a SyntaxError: unterminated string literal.',
    hint: 'Check the opening quote and the closing quote.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 15,
    estimated_time: 45,
    order: 7
  },
  {
    id: 'py_fnd_1_8',
    unit: 'unit_01',
    lesson: '1.1',
    section: '5. Basic output',
    concept: 'apply_banner',
    learning_objective: 'Apply print statements to construct a multi-line ASCII banner.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'You are creating the startup screen for a console game. Write a Python program that prints the following 3 lines:\n\n```text\n== GAME START ==\nPlayer: Hero\n================\n```',
    starter_code: '# Print the 3 banner lines\n',
    solution_code: 'print("== GAME START ==")\nprint("Player: Hero")\nprint("================")',
    expected_output: '== GAME START ==\nPlayer: Hero\n================',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints all 3 lines in exact sequence',
        expectedOutput: '== GAME START ==\nPlayer: Hero\n================',
        assertionPython: "assert '== GAME START ==' in _raw_stdout and 'Player: Hero' in _raw_stdout and '================' in _raw_stdout"
      }
    ],
    explanation: 'Each print() statement outputs one line. Using three consecutive print() calls outputs each line in turn.',
    hint: 'Use 3 separate print() calls, one for each line.',
    xp: 25,
    estimated_time: 90,
    order: 8
  },
  {
    id: 'py_fnd_1_9',
    unit: 'unit_01',
    lesson: '1.1',
    section: '3. print()',
    concept: 'trace_output_order',
    learning_objective: 'Trace the exact sequential output of multiple prints.',
    difficulty: 'easy',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the output line by line as Python runs this program:\n```python\nprint("Alpha")\nprint("Beta")\nprint("Gamma")\n```\nWhat is printed at each step?',
    trace_steps: [
      { step: 1, line: 1, code: 'print("Alpha")', variable: 'Output line 1', expectedValue: 'Alpha', hint: 'First statement executes' },
      { step: 2, line: 2, code: 'print("Beta")', variable: 'Output line 2', expectedValue: 'Beta', hint: 'Second statement executes' },
      { step: 3, line: 3, code: 'print("Gamma")', variable: 'Output line 3', expectedValue: 'Gamma', hint: 'Third statement executes' }
    ],
    explanation: 'Python executes strictly from top to bottom. Line 1 prints Alpha, Line 2 prints Beta, and Line 3 prints Gamma.',
    hint: 'Follow the execution order from line 1 down to line 3.',
    xp: 15,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_1_10',
    unit: 'unit_01',
    lesson: '1.1',
    section: '4. Strings',
    concept: 'debug_missing_parentheses',
    learning_objective: 'Debug a missing closing parenthesis syntax error.',
    difficulty: 'easy',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the syntax error in the code below. Notice that every opening parenthesis `(` must have a matching closing parenthesis `)`.',
    starter_code: 'print("System Online"',
    solution_code: 'print("System Online")',
    expected_output: 'System Online',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Successfully prints "System Online" with closed parenthesis',
        expectedOutput: 'System Online',
        assertionPython: "assert _raw_stdout.strip() == 'System Online' and _user_code.strip().endswith(')')"
      }
    ],
    progressive_hints: [
      'Look at the end of the line. Does the parenthesis close?',
      'Count your parentheses: 1 opening `(` needs 1 closing `)`.',
      'Add `)` at the very end of the line: print("System Online")'
    ],
    explanation: 'Every opening delimiter `(` requires a matching closing delimiter `)`. Leaving it open causes a SyntaxError: unexpected EOF while parsing.',
    hint: 'Add a closing parenthesis ) at the end of the line.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_01: LessonStructure = {
  id: '1.1',
  unitId: 'unit_01',
  unitTitle: 'Unit 1: Python Foundations',
  title: 'Your First Python Program',
  slug: 'your-first-python-program',
  order: 1,
  description: 'Master how Python runs, calling print(), handling string literals, and avoiding syntax pitfalls.',
  estimatedMinutes: 8,
  xpReward: 30,
  sections: [
    '1. What Python does',
    '2. Running a Python program',
    '3. print()',
    '4. Strings',
    '5. Basic output'
  ],
  questions: LESSON_01_QUESTIONS
};
