import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_02_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_2_1',
    unit: 'unit_01',
    lesson: '1.2',
    section: '1. What a variable represents',
    concept: 'variable_storage',
    learning_objective: 'Predict output when printing a variable holding a value.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Look at the following code:\n```python\nplayer_name = "Alex"\nprint(player_name)\n```\nWhat will this program print?',
    codeSnippet: 'player_name = "Alex"\nprint(player_name)',
    expected_output: 'Alex',
    options: [
      { id: 'opt_1', text: 'Alex', isCorrect: true, explanation: 'Python evaluates player_name, retrieves "Alex", and prints it.' },
      { id: 'opt_2', text: 'player_name', isCorrect: false, explanation: 'Notice player_name is NOT in quotes inside print(), so Python looks up its value rather than printing the word literally.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_3', text: '"Alex"', isCorrect: false, explanation: 'Quotes are not displayed in console output.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_4', text: 'Error', isCorrect: false, explanation: 'This is completely valid variable creation and output.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Alex',
    explanation: 'A variable is a labeled name that references a value in memory. When passed to print() without quotes, Python evaluates the variable and prints the value it stores.',
    hint: 'Because there are no quotes around player_name inside print(), Python looks up the stored value.',
    mental_model: 'A variable is like a sticky label attached to a box. When you call its name, Python opens the box and inspects what is inside.',
    relevant_line: 'print(player_name)',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    repair_concept: 'variables_vs_literals',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_2_2',
    unit: 'unit_01',
    lesson: '1.2',
    section: '2. Creating a variable',
    concept: 'variable_trace_linear',
    learning_objective: 'Trace the value of a variable step by step across consecutive lines.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `x` line by line as Python runs:\n```python\nx = 5\nx = x + 2\nx = x * 2\n```\nWhat is the value of `x` after each line finishes?',
    trace_steps: [
      { step: 1, line: 1, code: 'x = 5', variable: 'Value of x', expectedValue: '5', hint: 'x is initialized to 5' },
      { step: 2, line: 2, code: 'x = x + 2', variable: 'Value of x', expectedValue: '7', hint: '5 + 2 evaluates to 7' },
      { step: 3, line: 3, code: 'x = x * 2', variable: 'Value of x', expectedValue: '14', hint: '7 * 2 evaluates to 14' }
    ],
    explanation: 'Line 1 sets x to 5. Line 2 reads x (5), adds 2 to get 7, and assigns 7 back into x. Line 3 reads x (7), multiplies by 2, and assigns 14 back into x.',
    hint: 'Evaluate the right side of the equals sign first, then assign the result into the variable on the left.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 2
  },
  {
    id: 'py_fnd_2_3',
    unit: 'unit_01',
    lesson: '1.2',
    section: '3. Assigning values',
    concept: 'variable_assignment_syntax',
    learning_objective: 'Complete the statement to assign a value into a variable.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the code to store the name `"Ganesh"` in the variable `name` and then print it:\n```python\nname = "Ganesh"\nprint(____)\n```',
    codeSnippet: 'name = "Ganesh"\nprint(____)',
    accepted_answers: ['name'],
    correct_answer: 'name',
    explanation: 'To print the value held in the variable `name`, we pass `name` into print() without quotes.',
    hint: 'Fill in the variable name that was assigned on the first line.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_2_4',
    unit: 'unit_01',
    lesson: '1.2',
    section: '4. Reassigning values',
    concept: 'predict_reassignment',
    learning_objective: 'Predict the final value of a variable after an increment reassignment.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What is printed by this program?\n```python\nscore = 20\nscore = score + 5\nprint(score)\n```',
    codeSnippet: 'score = 20\nscore = score + 5\nprint(score)',
    expected_output: '25',
    options: [
      { id: 'opt_1', text: '25', isCorrect: true, explanation: 'Python evaluates score + 5 (20 + 5 = 25) and reassigns 25 to score.' },
      { id: 'opt_2', text: '20', isCorrect: false, explanation: 'The second line reassigns score to 25, so 20 is overwritten.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_3', text: '205', isCorrect: false, explanation: 'Both operands are numbers (integers), so mathematical addition is performed, not string concatenation.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_4', text: 'Error: Cannot use score on both sides of =', isCorrect: false, explanation: 'In Python, = is assignment, not algebraic equality. The right side is computed first, then stored in the left.', misconception_tag: 'ASSIGNMENT_VS_COMPARISON' }
    ],
    correct_answer: '25',
    explanation: 'The right-hand side `score + 5` is evaluated first using the current value of `score` (20), giving 25. Then 25 is stored back into `score`.',
    hint: 'Compute 20 + 5 first, then store it back into score.',
    mental_model: 'The equals sign (=) means "calculate the right side and put the result into the box on the left".',
    relevant_line: 'score = score + 5',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_2_5',
    unit: 'unit_01',
    lesson: '1.2',
    section: '5. Reading a variable',
    concept: 'write_variable_creation',
    learning_objective: 'Create a variable, store a number, and print the variable.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'Create a variable called `age` and store the value `18` in it. Then print `age`.',
    starter_code: '# Write your code below\n',
    solution_code: 'age = 18\nprint(age)',
    expected_output: '18',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Variable age should exist in the program',
        expectedOutput: '18',
        assertionPython: "assert 'age' in _user_namespace, 'Variable age was not found in your program'"
      },
      {
        id: 'tc_2',
        description: 'Variable age should equal 18',
        expectedOutput: '18',
        assertionPython: "assert _user_namespace.get('age') == 18, f'Expected age to be 18, got {_user_namespace.get(\"age\")}'"
      },
      {
        id: 'tc_3',
        description: 'Program should print 18',
        expectedOutput: '18',
        assertionPython: "assert _raw_stdout.strip() == '18', f'Expected printed output 18, got {_raw_stdout.strip()}'"
      }
    ],
    explanation: 'Line 1 `age = 18` creates the variable and assigns 18 to it. Line 2 `print(age)` displays its value.',
    hint: 'First line: age = 18. Second line: print(age)',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_2_6',
    unit: 'unit_01',
    lesson: '1.2',
    section: '5. Reading a variable',
    concept: 'debug_case_mismatch',
    learning_objective: 'Debug a NameError caused by mismatched variable casing.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the bug in the program below. Running this raises `NameError: name \'User_Score\' is not defined` because the variable name is capitalized differently.',
    starter_code: 'user_score = 95\nprint(User_Score)',
    solution_code: 'user_score = 95\nprint(user_score)',
    expected_output: '95',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints 95 without casing errors',
        expectedOutput: '95',
        assertionPython: "assert _raw_stdout.strip() == '95' and 'user_score' in _user_code and 'User_Score' not in _user_code"
      }
    ],
    progressive_hints: [
      'Compare how user_score is spelled in line 1 vs line 2.',
      'Python variables are case-sensitive: user_score and User_Score are completely different names.',
      'Change User_Score inside print() to lowercase user_score.'
    ],
    explanation: 'In Python, variable identifiers are strictly case-sensitive. `user_score` is not the same identifier as `User_Score`.',
    hint: 'Make the spelling in print() match the lowercase variable definition.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 6
  },
  {
    id: 'py_fnd_2_7',
    unit: 'unit_01',
    lesson: '1.2',
    section: '4. Reassigning values',
    concept: 'reason_variable_reassignment',
    learning_objective: 'Explain why a variable holds only its most recent value.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following code:\n```python\ncoins = 10\ncoins = 25\nprint(coins)\n```\nWhy does this program print `25` instead of `10` or `35`?',
    options: [
      { id: 'opt_1', text: 'Assigning a new value to a variable overwrites whatever value it held previously', isCorrect: true, explanation: 'Variables only hold one value at a time; the latest assignment replaces the old one.' },
      { id: 'opt_2', text: 'Python automatically adds the values together', isCorrect: false, explanation: 'The = operator does not add; it replaces.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_3', text: 'Variables always choose the larger number', isCorrect: false, explanation: 'Python follows sequential execution, not numerical size.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_4', text: '10 was stored in a temporary hidden cache', isCorrect: false, explanation: 'The reference to 10 is replaced entirely by 25.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' }
    ],
    correct_answer: 'Assigning a new value to a variable overwrites whatever value it held previously',
    explanation: 'A variable can only hold a single value at any given moment. When you assign `coins = 25`, the previous value `10` is discarded.',
    hint: 'Think of a variable as a whiteboard: writing a new value wipes away the old one.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 7
  },
  {
    id: 'py_fnd_2_8',
    unit: 'unit_01',
    lesson: '1.2',
    section: '5. Reading a variable',
    concept: 'apply_score_tracking',
    learning_objective: 'Apply variable reassignment to calculate a player score update.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'In a game, a player starts with `100` points. They then earn `50` bonus points. Write a Python script that:\n1. Creates a variable `points` set to `100`\n2. Reassigns `points` to add `50` to its current value\n3. Prints `points`',
    starter_code: '# Track the player points\n',
    solution_code: 'points = 100\npoints = points + 50\nprint(points)',
    expected_output: '150',
    test_cases: [
      {
        id: 'tc_1',
        description: 'points starts at 100 and ends at 150',
        expectedOutput: '150',
        assertionPython: "assert _user_namespace.get('points') == 150, f'Expected points to be 150, got {_user_namespace.get(\"points\")}'"
      },
      {
        id: 'tc_2',
        description: 'Program prints 150',
        expectedOutput: '150',
        assertionPython: "assert _raw_stdout.strip() == '150', f'Expected printed output 150, got {_raw_stdout.strip()}'"
      }
    ],
    explanation: '`points = 100` followed by `points = points + 50` increments the score to 150 and prints it.',
    hint: 'Start with points = 100, then points = points + 50, then print(points)',
    xp: 25,
    estimated_time: 60,
    order: 8
  },
  {
    id: 'py_fnd_2_9',
    unit: 'unit_01',
    lesson: '1.2',
    section: '4. Reassigning values',
    concept: 'trace_copy_values',
    learning_objective: 'Trace independent values across multiple variable assignments.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `b` across these statements:\n```python\na = 10\nb = a\na = 99\n```\nWhat is the value of `b` after each line?',
    trace_steps: [
      { step: 1, line: 1, code: 'a = 10', variable: 'Value of b', expectedValue: 'None', hint: 'b does not exist yet' },
      { step: 2, line: 2, code: 'b = a', variable: 'Value of b', expectedValue: '10', hint: 'b copies the current value of a (10)' },
      { step: 3, line: 3, code: 'a = 99', variable: 'Value of b', expectedValue: '10', hint: 'Changing a does NOT change b!' }
    ],
    explanation: 'When `b = a` executes, `b` receives the value that `a` currently holds (10). When `a` is later changed to 99, `b` still holds 10. Primitive values are copied by value, not linked by a live wire.',
    hint: 'Changing variable a later does not automatically update variable b.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 9
  },
  {
    id: 'py_fnd_2_10',
    unit: 'unit_01',
    lesson: '1.2',
    section: '2. Creating a variable',
    concept: 'debug_invalid_variable_name',
    learning_objective: 'Debug an invalid variable name that starts with a number.',
    difficulty: 'easy',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the syntax error in the code below. In Python, variable names cannot start with a digit (like `1st`).',
    starter_code: '1st_place = "Gold"\nprint(1st_place)',
    solution_code: 'first_place = "Gold"\nprint(first_place)',
    expected_output: 'Gold',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints "Gold" with a valid identifier name',
        expectedOutput: 'Gold',
        assertionPython: "assert _raw_stdout.strip() == 'Gold' and not _user_code.startswith('1st')"
      }
    ],
    progressive_hints: [
      'Variable names cannot begin with numbers like 1, 2, or 3.',
      'Rename 1st_place to first_place or place_1.',
      'Change both the assignment and the print statement to use first_place.'
    ],
    explanation: 'Python identifier naming rules: names must start with a letter (a-z, A-Z) or underscore (_). They can contain numbers, but cannot start with one.',
    hint: 'Change 1st_place to first_place in both lines.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_02: LessonStructure = {
  id: '1.2',
  unitId: 'unit_01',
  unitTitle: 'Unit 1: Python Foundations',
  title: 'Variables',
  slug: 'variables',
  order: 2,
  description: 'Understand how variables store, read, and update state in memory without common naming and scoping traps.',
  estimatedMinutes: 9,
  xpReward: 30,
  sections: [
    '1. What a variable represents',
    '2. Creating a variable',
    '3. Assigning values',
    '4. Reassigning values',
    '5. Reading a variable'
  ],
  questions: LESSON_02_QUESTIONS
};
