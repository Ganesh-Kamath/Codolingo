import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_07_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_7_1',
    unit: 'unit_01',
    lesson: '1.7',
    section: '5. ==',
    concept: 'predict_equality_operator',
    learning_objective: 'Predict the boolean output of the equality comparison == operator.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nscore = 10\nprint(score == 10)\n```',
    codeSnippet: 'score = 10\nprint(score == 10)',
    expected_output: 'True',
    options: [
      { id: 'opt_1', text: 'True', isCorrect: true, explanation: 'The double equals (==) tests for equality. Because score is 10, the comparison evaluates to True.' },
      { id: 'opt_2', text: '10', isCorrect: false, explanation: 'Comparison operators return booleans (True or False), not numbers.', misconception_tag: 'ASSIGNMENT_VS_COMPARISON' },
      { id: 'opt_3', text: 'False', isCorrect: false, explanation: '10 is equal to 10, so the result is True.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'SyntaxError', isCorrect: false, explanation: 'score == 10 is standard comparison syntax.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'True',
    explanation: '`==` asks a question: "Are these two values equal?". Because `10 == 10`, Python produces the boolean value `True`. Single `=` would be assignment.',
    hint: 'Double equals (==) tests whether two values are equal and answers True or False.',
    mental_model: 'Single = is a command: "Put this value in that box!". Double == is a question: "Are these two values the same?".',
    relevant_line: 'print(score == 10)',
    misconception_tag: 'ASSIGNMENT_VS_COMPARISON',
    repair_concept: 'assignment_vs_comparison',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_7_2',
    unit: 'unit_01',
    lesson: '1.7',
    section: '1. >',
    concept: 'predict_boundary_condition',
    learning_objective: 'Predict strictly greater than (>) behavior at the exact boundary number.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\npoints = 100\nprint(points > 100)\n```',
    codeSnippet: 'points = 100\nprint(points > 100)',
    expected_output: 'False',
    options: [
      { id: 'opt_1', text: 'False', isCorrect: true, explanation: '100 is NOT strictly greater than 100. It is equal to 100, so points > 100 is False.' },
      { id: 'opt_2', text: 'True', isCorrect: false, explanation: '> means strictly greater than. For 100 to be included, you would need greater than or equal to (>=).', misconception_tag: 'CONDITION_BOUNDARY' },
      { id: 'opt_3', text: '100', isCorrect: false, explanation: 'Comparisons return True or False.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_4', text: 'Error', isCorrect: false, explanation: 'Numerical comparisons are fully valid.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'False',
    explanation: 'Strict inequality `>` requires the left number to be larger than the right. Since 100 is not larger than 100, `points > 100` evaluates to `False`. To include 100, use `>=`.',
    hint: 'Is 100 bigger than 100? No, they are equal.',
    mental_model: '> is exclusive (must be strictly bigger). >= is inclusive (can be equal).',
    relevant_line: 'print(points > 100)',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 15,
    estimated_time: 45,
    order: 2
  },
  {
    id: 'py_fnd_7_3',
    unit: 'unit_01',
    lesson: '1.7',
    section: '5. ==',
    concept: 'complete_equality_check',
    learning_objective: 'Complete a comparison statement using the double equals (==) operator.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to check if `status` is equal to `"active"`:\n```python\nstatus = "active"\nis_ready = status ____ "active"\nprint(is_ready)\n```',
    codeSnippet: 'status = "active"\nis_ready = status ____ "active"\nprint(is_ready)',
    accepted_answers: ['=='],
    correct_answer: '==',
    explanation: 'In Python, `==` tests for equality. Using a single `=` here would be an assignment, not a comparison.',
    hint: 'Use two equals signs: ==',
    misconception_tag: 'ASSIGNMENT_VS_COMPARISON',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_7_4',
    unit: 'unit_01',
    lesson: '1.7',
    section: '5. ==',
    concept: 'reason_single_equals_syntax_error',
    learning_objective: 'Explain why using a single equals sign in a condition is invalid.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following code:\n```python\nage = 18\nif age = 18:\n    print("Adult")\n```\nWhy does Python raise a `SyntaxError: invalid syntax` on line 2?',
    options: [
      { id: 'opt_1', text: 'Single equals (=) is used to assign values to variables, whereas double equals (==) is required to test equality in conditions', isCorrect: true, explanation: 'Python forbids assignment statements inside if conditions to prevent accidental bugs.' },
      { id: 'opt_2', text: '18 cannot be compared to a variable', isCorrect: false, explanation: 'Numbers can easily be compared using ==.', misconception_tag: 'ASSIGNMENT_VS_COMPARISON' },
      { id: 'opt_3', text: 'The word "Adult" is not a valid string', isCorrect: false, explanation: '"Adult" is a valid string literal.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_4', text: 'Python requires semicolons after if statements', isCorrect: false, explanation: 'Python uses colons (:), which is already present.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Single equals (=) is used to assign values to variables, whereas double equals (==) is required to test equality in conditions',
    explanation: 'Single `=` means assignment: `x = 5`. To compare values in Python, you must use `==`: `if age == 18:`. Python intentionally raises a SyntaxError to prevent accidental assignments in conditionals.',
    hint: 'Assignment uses =, comparison uses ==.',
    misconception_tag: 'ASSIGNMENT_VS_COMPARISON',
    xp: 20,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_7_5',
    unit: 'unit_01',
    lesson: '1.7',
    section: '3. >=',
    concept: 'write_comparison_code',
    learning_objective: 'Write code comparing age against an adult threshold of 18 inclusive.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'Write a Python program that:\n1. Sets `age = 20`\n2. Sets `can_enter = age >= 18`\n3. Prints `can_enter`',
    starter_code: '# Write comparison for age threshold\n',
    solution_code: 'age = 20\ncan_enter = age >= 18\nprint(can_enter)',
    expected_output: 'True',
    test_cases: [
      {
        id: 'tc_1',
        description: 'can_enter evaluates to True',
        expectedOutput: 'True',
        assertionPython: "assert _user_namespace.get('can_enter') is True and _raw_stdout.strip() == 'True'"
      },
      {
        id: 'tc_2',
        description: 'Uses greater-than-or-equal operator >=',
        expectedOutput: 'True',
        assertionPython: "assert '>=' in _user_code"
      }
    ],
    explanation: '`age >= 18` checks if age is at least 18. Because 20 >= 18 is True, `can_enter` holds `True`.',
    hint: 'can_enter = age >= 18, then print(can_enter)',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_7_6',
    unit: 'unit_01',
    lesson: '1.7',
    section: '5. ==',
    concept: 'debug_assignment_in_conditional',
    learning_objective: 'Debug an accidental single equals assignment in a conditional check.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the bug in the code below. It crashes with `SyntaxError: invalid syntax. Maybe you meant \'==\' or \':=\' instead of \'=\'?` because it accidentally used assignment.',
    starter_code: 'score = 100\nif score = 100:\n    print("Perfect")',
    solution_code: 'score = 100\nif score == 100:\n    print("Perfect")',
    expected_output: 'Perfect',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints "Perfect" using comparison ==',
        expectedOutput: 'Perfect',
        assertionPython: "assert _raw_stdout.strip() == 'Perfect' and 'score == 100' in _user_code"
      }
    ],
    progressive_hints: [
      'Look at line 2: if score = 100:',
      'In an if statement, you test equality using ==, not =.',
      'Change score = 100 to score == 100 on line 2.'
    ],
    explanation: 'In Python conditions, you must test equality using `==`. Using `=` is an assignment and causes a SyntaxError.',
    hint: 'Change if score = 100: to if score == 100:',
    misconception_tag: 'ASSIGNMENT_VS_COMPARISON',
    xp: 20,
    estimated_time: 45,
    order: 6
  },
  {
    id: 'py_fnd_7_7',
    unit: 'unit_01',
    lesson: '1.7',
    section: '6. !=',
    concept: 'trace_comparison_operators',
    learning_objective: 'Trace the boolean outcomes of multiple comparison expressions.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the output for each comparison line:\n```python\nx = 5\ny = 8\nprint(x < y)\nprint(x == y)\nprint(x != y)\n```\nWhat boolean is printed by each line?',
    trace_steps: [
      { step: 1, line: 3, code: 'print(x < y)', variable: 'Output line 1', expectedValue: 'True', hint: 'Is 5 less than 8?' },
      { step: 2, line: 4, code: 'print(x == y)', variable: 'Output line 2', expectedValue: 'False', hint: 'Is 5 equal to 8?' },
      { step: 3, line: 5, code: 'print(x != y)', variable: 'Output line 3', expectedValue: 'True', hint: 'Is 5 not equal to 8?' }
    ],
    explanation: '5 < 8 is True. 5 == 8 is False. 5 != 8 (not equal) is True.',
    hint: '!= means "not equal to".',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_7_8',
    unit: 'unit_01',
    lesson: '1.7',
    section: '3. >=',
    concept: 'apply_free_shipping_check',
    learning_objective: 'Apply comparison logic to check if an order qualifies for free shipping.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'An online store gives free shipping for orders of at least $50. Write a program that:\n1. Sets `cart_total = 50`\n2. Sets `free_shipping = cart_total >= 50`\n3. Prints `free_shipping`',
    starter_code: '# Check free shipping eligibility\n',
    solution_code: 'cart_total = 50\nfree_shipping = cart_total >= 50\nprint(free_shipping)',
    expected_output: 'True',
    test_cases: [
      {
        id: 'tc_1',
        description: 'free_shipping is True for cart_total of 50',
        expectedOutput: 'True',
        assertionPython: "assert _user_namespace.get('free_shipping') is True and _raw_stdout.strip() == 'True'"
      }
    ],
    explanation: 'Because the threshold is "at least 50", an order of exactly 50 qualifies! Thus `>=` is the correct operator, returning `True`.',
    hint: 'Use >= for "at least": free_shipping = cart_total >= 50',
    xp: 25,
    estimated_time: 60,
    order: 8
  },
  {
    id: 'py_fnd_7_9',
    unit: 'unit_01',
    lesson: '1.7',
    section: '5. ==',
    concept: 'predict_type_mismatch_equality',
    learning_objective: 'Predict equality comparison between a string and an integer.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nprint("10" == 10)\n```',
    codeSnippet: 'print("10" == 10)',
    expected_output: 'False',
    options: [
      { id: 'opt_1', text: 'False', isCorrect: true, explanation: 'In Python, strings and integers are completely different types. A string is never equal to a number, even if they contain the same digits.' },
      { id: 'opt_2', text: 'True', isCorrect: false, explanation: 'Python does not coerce types during == comparisons (unlike JavaScript). "10" is a string; 10 is an integer.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_3', text: 'TypeError', isCorrect: false, explanation: 'Comparing with == across types does not crash; it safely returns False.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: '10', isCorrect: false, explanation: '== produces a boolean (True or False).', misconception_tag: 'VARIABLE_VALUE_CONFUSION' }
    ],
    correct_answer: 'False',
    explanation: 'In Python, values of different types are not equal. `"10"` (str) and `10` (int) have different types, so `"10" == 10` is always `False`.',
    hint: 'Python never pretends a string is a number during == comparisons.',
    mental_model: 'A picture of a dog is not an actual dog. The text "10" is not the mathematical number 10.',
    relevant_line: 'print("10" == 10)',
    misconception_tag: 'STRING_VS_NUMBER',
    xp: 15,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_7_10',
    unit: 'unit_01',
    lesson: '1.7',
    section: '3. >=',
    concept: 'debug_boundary_cutoff',
    learning_objective: 'Debug an off-by-one boundary error where 18-year-olds were excluded.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A voting system allows people aged 18 and older to vote. But when `age = 18`, the code below prints `False`! Fix the comparison operator so 18-year-olds are included.',
    starter_code: 'age = 18\ncan_vote = age > 18\nprint(can_vote)',
    solution_code: 'age = 18\ncan_vote = age >= 18\nprint(can_vote)',
    expected_output: 'True',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints True for age 18 using >=',
        expectedOutput: 'True',
        assertionPython: "assert _raw_stdout.strip() == 'True' and '>=' in _user_code"
      }
    ],
    progressive_hints: [
      'age > 18 requires age to be 19 or older. 18 is not greater than 18.',
      'To include 18, use greater than or equal to: >=.',
      'Change line 2 to: can_vote = age >= 18'
    ],
    explanation: '`>` excludes the boundary number (18 > 18 is False). `>=` includes the boundary (18 >= 18 is True).',
    hint: 'Replace > with >=',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_07: LessonStructure = {
  id: '1.7',
  unitId: 'unit_01',
  unitTitle: 'Unit 1: Python Foundations',
  title: 'Comparisons',
  slug: 'comparisons',
  order: 7,
  description: 'Master comparison operators, understand the crucial difference between = and ==, and conquer boundary conditions.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. >',
    '2. <',
    '3. >=',
    '4. <=',
    '5. ==',
    '6. !='
  ],
  questions: LESSON_07_QUESTIONS
};
