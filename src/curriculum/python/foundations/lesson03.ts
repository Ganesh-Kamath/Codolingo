import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_03_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_3_1',
    unit: 'unit_03',
    lesson: '3.1',
    section: '6. Operator precedence',
    concept: 'arithmetic_precedence',
    learning_objective: 'Predict output of mixed arithmetic involving multiplication and addition.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print without parentheses?\n```python\nresult = 2 + 3 * 4\nprint(result)\n```',
    codeSnippet: 'result = 2 + 3 * 4\nprint(result)',
    expected_output: '14',
    options: [
      { id: 'opt_1', text: '14', isCorrect: true, explanation: 'Multiplication (*) has higher precedence than addition (+). 3 * 4 is 12, and 2 + 12 is 14.' },
      { id: 'opt_2', text: '20', isCorrect: false, explanation: 'Computing left to right ((2 + 3) * 4) ignores standard mathematical operator precedence.', misconception_tag: 'PRECEDENCE_CONFUSION' },
      { id: 'opt_3', text: '24', isCorrect: false, explanation: 'Check your arithmetic: 3 * 4 is 12, then add 2.', misconception_tag: 'PRECEDENCE_CONFUSION' },
      { id: 'opt_4', text: '234', isCorrect: false, explanation: 'These are numbers, not text strings.', misconception_tag: 'STRING_VS_NUMBER' }
    ],
    correct_answer: '14',
    explanation: 'Python follows standard PEMDAS order of operations: multiplication (*) happens before addition (+). Thus `3 * 4 = 12`, then `2 + 12 = 14`.',
    hint: 'Multiplication is computed before addition.',
    mental_model: 'Multiplication binds tighter than addition, like words in a sentence before punctuation.',
    relevant_line: 'result = 2 + 3 * 4',
    misconception_tag: 'PRECEDENCE_CONFUSION',
    repair_concept: 'operator_precedence',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_3_2',
    unit: 'unit_03',
    lesson: '3.1',
    section: '5. Division',
    concept: 'float_division_type',
    learning_objective: 'Explain why standard division in Python always results in a float.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following code:\n```python\nval = 10 / 2\nprint(val)\n```\nWhat does this print, and why?',
    options: [
      { id: 'opt_1', text: '5.0, because single slash (/) division always returns a float in Python', isCorrect: true, explanation: 'Python 3 always returns a floating-point number with a decimal point from single slash division.' },
      { id: 'opt_2', text: '5, because 10 divides evenly by 2 into an integer', isCorrect: false, explanation: 'Even when division divides evenly, single slash / always produces a float.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_3', text: 'Error, because integers cannot be divided', isCorrect: false, explanation: 'Division between integers is standard arithmetic in Python.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: '0, because it only returns the remainder', isCorrect: false, explanation: 'Remainder is computed by the modulo operator (%), not /.', misconception_tag: 'WRONG_OPERATOR' }
    ],
    correct_answer: '5.0, because single slash (/) division always returns a float in Python',
    explanation: 'In Python, the `/` operator always performs true float division, giving `5.0`. If you want integer floor division, you use `//`.',
    hint: 'Single slash division always produces a number with a decimal point.',
    misconception_tag: 'WRONG_TYPE',
    xp: 15,
    estimated_time: 45,
    order: 2
  },
  {
    id: 'py_fnd_3_3',
    unit: 'unit_03',
    lesson: '3.1',
    section: '4. Multiplication',
    concept: 'arithmetic_syntax_multiply',
    learning_objective: 'Complete an arithmetic statement using the asterisk multiplication operator.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to calculate the area of a rectangle with `width = 5` and `height = 8`:\n```python\nwidth = 5\nheight = 8\narea = width ____ height\nprint(area)\n```',
    codeSnippet: 'width = 5\nheight = 8\narea = width ____ height\nprint(area)',
    accepted_answers: ['*'],
    correct_answer: '*',
    explanation: 'In Python, the asterisk `*` is the arithmetic operator for multiplication. `x` is not valid Python syntax for multiplying numbers.',
    hint: 'Use the asterisk symbol above the number 8 key.',
    misconception_tag: 'WRONG_OPERATOR',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_3_4',
    unit: 'unit_03',
    lesson: '3.1',
    section: '6. Operator precedence',
    concept: 'parentheses_precedence',
    learning_objective: 'Predict the outcome of overriding precedence using parentheses.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Now observe parentheses grouping the addition first. What will this program print?\n```python\ntotal = (2 + 3) * 4\nprint(total)\n```',
    codeSnippet: 'total = (2 + 3) * 4\nprint(total)',
    expected_output: '20',
    options: [
      { id: 'opt_1', text: '20', isCorrect: true, explanation: 'Parentheses force (2 + 3) to evaluate first (5), and 5 * 4 = 20.' },
      { id: 'opt_2', text: '14', isCorrect: false, explanation: 'Parentheses take precedence over multiplication.', misconception_tag: 'PRECEDENCE_CONFUSION' },
      { id: 'opt_3', text: '24', isCorrect: false, explanation: 'Check the addition inside parentheses: 2 + 3 is 5.', misconception_tag: 'PRECEDENCE_CONFUSION' },
      { id: 'opt_4', text: 'Error', isCorrect: false, explanation: 'Parentheses are valid grouping syntax in Python math.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: '20',
    explanation: 'Parentheses `()` have the highest precedence in Python. `(2 + 3)` evaluates to 5 first, then `5 * 4 = 20`.',
    hint: 'Calculate inside the parentheses first.',
    mental_model: 'Parentheses create an express lane: whatever is inside them must be resolved before other operators can touch it.',
    relevant_line: 'total = (2 + 3) * 4',
    misconception_tag: 'PRECEDENCE_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_3_5',
    unit: 'unit_03',
    lesson: '3.1',
    section: '2. Addition',
    concept: 'write_arithmetic_code',
    learning_objective: 'Write code to calculate and print the total cost of two items.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'A book costs `25` dollars and a pen costs `5` dollars. Write a Python program that:\n1. Creates a variable `book` equal to `25`\n2. Creates a variable `pen` equal to `5`\n3. Creates a variable `total` equal to `book + pen`\n4. Prints `total`',
    starter_code: '# Calculate total cost\n',
    solution_code: 'book = 25\npen = 5\ntotal = book + pen\nprint(total)',
    expected_output: '30',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Variables book and pen should equal 25 and 5',
        expectedOutput: '30',
        assertionPython: "assert _user_namespace.get('book') == 25 and _user_namespace.get('pen') == 5"
      },
      {
        id: 'tc_2',
        description: 'Variable total should equal 30',
        expectedOutput: '30',
        assertionPython: "assert _user_namespace.get('total') == 30"
      },
      {
        id: 'tc_3',
        description: 'Program prints 30',
        expectedOutput: '30',
        assertionPython: "assert _raw_stdout.strip() == '30'",
        hidden: true
      }
    ],
    explanation: 'We store numbers in variables `book` and `pen`, sum them into `total`, and print the result `30`.',
    hint: 'book = 25, pen = 5, total = book + pen, print(total)',
    misconception_tag: 'WRONG_OPERATOR',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_3_6',
    unit: 'unit_03',
    lesson: '3.1',
    section: '6. Operator precedence',
    concept: 'debug_discount_formula',
    learning_objective: 'Debug an arithmetic bug caused by missing grouping parentheses.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A store wants to find the average of two test scores: 80 and 100. The developer wrote the code below, but it prints 130.0 instead of 90.0! Fix the formula using parentheses.',
    starter_code: 'score1 = 80\nscore2 = 100\naverage = score1 + score2 / 2\nprint(average)',
    solution_code: 'score1 = 80\nscore2 = 100\naverage = (score1 + score2) / 2\nprint(average)',
    expected_output: '90.0',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Correctly computes average as 90.0 with parentheses',
        expectedOutput: '90.0',
        assertionPython: "assert float(_raw_stdout.strip()) == 90.0 and '(' in _user_code and _user_namespace.get('average') == 90.0"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying average variable calculation',
        expectedOutput: '90.0',
        assertionPython: "assert _user_namespace.get('average') == 90.0",
        hidden: true
      }
    ],
    progressive_hints: [
      'In Python, division happens before addition. 100 / 2 = 50, then 80 + 50 = 130.',
      'To average two numbers, you must add them together first before dividing by 2.',
      'Wrap (score1 + score2) in parentheses: average = (score1 + score2) / 2'
    ],
    explanation: 'Without parentheses, `score2 / 2` (50) is calculated first, then added to 80 (130). Adding parentheses `(score1 + score2) / 2` forces the sum to happen first (180 / 2 = 90.0).',
    hint: 'Wrap the addition inside parentheses: (score1 + score2) / 2',
    misconception_tag: 'PRECEDENCE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 6
  },
  {
    id: 'py_fnd_3_7',
    unit: 'unit_03',
    lesson: '3.1',
    section: '2. Addition',
    concept: 'trace_accumulator',
    learning_objective: 'Trace an accumulator variable undergoing addition and subtraction.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `balance` step by step:\n```python\nbalance = 100\nbalance = balance + 50\nbalance = balance - 20\n```\nWhat is `balance` after each line finishes?',
    trace_steps: [
      { step: 1, line: 1, code: 'balance = 100', variable: 'Value of balance', expectedValue: '100', hint: 'Initial balance' },
      { step: 2, line: 2, code: 'balance = balance + 50', variable: 'Value of balance', expectedValue: '150', hint: '100 + 50' },
      { step: 3, line: 3, code: 'balance = balance - 20', variable: 'Value of balance', expectedValue: '130', hint: '150 - 20' }
    ],
    explanation: 'balance starts at 100. Adding 50 brings it to 150. Subtracting 20 leaves 130.',
    hint: 'Track how each line updates the single balance variable.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_3_8',
    unit: 'unit_03',
    lesson: '3.1',
    section: '5. Division',
    concept: 'apply_time_conversion',
    learning_objective: 'Apply integer division // and remainder % to convert minutes to hours and minutes.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'You have `130` minutes. Write a Python script that calculates how many hours and remaining minutes that is.\n1. Set `total_minutes = 130`\n2. Set `hours = total_minutes // 60` (integer division)\n3. Set `minutes = total_minutes % 60` (remainder / modulo)\n4. Print `hours` then print `minutes` on separate lines',
    starter_code: '# Convert 130 minutes into hours and remaining minutes\n',
    solution_code: 'total_minutes = 130\nhours = total_minutes // 60\nminutes = total_minutes % 60\nprint(hours)\nprint(minutes)',
    expected_output: '2\n10',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Computes 2 hours and 10 minutes',
        expectedOutput: '2\n10',
        assertionPython: "assert _user_namespace.get('hours') == 2 and _user_namespace.get('minutes') == 10"
      },
      {
        id: 'tc_2',
        description: 'Prints hours and minutes',
        expectedOutput: '2\n10',
        assertionPython: "assert _raw_stdout.strip() == '2\\n10'",
        hidden: true
      }
    ],
    explanation: '`130 // 60` computes full hours (2), and `130 % 60` computes remaining leftover minutes (10).',
    hint: 'hours = total_minutes // 60, minutes = total_minutes % 60',
    misconception_tag: 'WRONG_OPERATOR',
    xp: 25,
    estimated_time: 90,
    order: 8
  },
  {
    id: 'py_fnd_3_9',
    unit: 'unit_03',
    lesson: '3.1',
    section: '5. Division',
    concept: 'modulo_remainder_prediction',
    learning_objective: 'Predict the result of the modulo remainder operator %.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nremainder = 14 % 4\nprint(remainder)\n```',
    codeSnippet: 'remainder = 14 % 4\nprint(remainder)',
    expected_output: '2',
    options: [
      { id: 'opt_1', text: '2', isCorrect: true, explanation: '4 goes into 14 three times (12), with a remainder of 2.' },
      { id: 'opt_2', text: '3', isCorrect: false, explanation: '3 is the quotient (14 // 4), not the remainder.', misconception_tag: 'WRONG_OPERATOR' },
      { id: 'opt_3', text: '3.5', isCorrect: false, explanation: '3.5 is the float division result (14 / 4), not the modulo remainder.', misconception_tag: 'WRONG_OPERATOR' },
      { id: 'opt_4', text: '0', isCorrect: false, explanation: '14 does not divide evenly by 4.', misconception_tag: 'WRONG_OPERATOR' }
    ],
    correct_answer: '2',
    explanation: 'The `%` operator returns the remainder after division. 14 divided by 4 is 3 with 2 left over. Thus `14 % 4 = 2`.',
    hint: 'Think of dividing 14 candies among 4 friends equally. How many are left in the jar?',
    misconception_tag: 'WRONG_OPERATOR',
    xp: 15,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_3_10',
    unit: 'unit_03',
    lesson: '3.1',
    section: '3. Subtraction',
    concept: 'debug_negative_order',
    learning_objective: 'Debug operand order in subtraction to prevent negative results.',
    difficulty: 'easy',
    question_type: 'DEBUG_CODE',
    prompt: 'A cashier has a 50 dollar bill and purchases an item for 15 dollars. The change should be 35 dollars, but this code prints -35! Fix the subtraction order.',
    starter_code: 'paid = 50\ncost = 15\nchange = cost - paid\nprint(change)',
    solution_code: 'paid = 50\ncost = 15\nchange = paid - cost\nprint(change)',
    expected_output: '35',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Correctly prints 35 for change',
        expectedOutput: '35',
        assertionPython: "assert _raw_stdout.strip() == '35' and _user_namespace.get('change') == 35"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying change variable and output',
        expectedOutput: '35',
        assertionPython: "assert _user_namespace.get('change') == 35",
        hidden: true
      }
    ],
    progressive_hints: [
      'Subtraction is not commutative: 15 - 50 is -35, but 50 - 15 is 35.',
      'Change is calculated as the amount paid minus the cost.',
      'Change line 3 to: change = paid - cost'
    ],
    explanation: 'Order matters in subtraction! `paid - cost` gives `50 - 15 = 35`, whereas `cost - paid` gives `-35`.',
    hint: 'Switch the order: paid - cost',
    misconception_tag: 'WRONG_OPERATOR',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_03: LessonStructure = {
  id: '3.1',
  unitId: 'unit_03',
  unitTitle: 'Unit 3: Operators and Math',
  title: 'Arithmetic Operators',
  slug: 'arithmetic-operators',
  order: 1,
  description: 'Master arithmetic operations, division types (// vs / vs %), and operator precedence rules.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. Integers',
    '2. Addition',
    '3. Subtraction',
    '4. Multiplication',
    '5. Division',
    '6. Operator precedence'
  ],
  questions: LESSON_03_QUESTIONS
};
