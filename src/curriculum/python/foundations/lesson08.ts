import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_08_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_8_1',
    unit: 'unit_03',
    lesson: '3.5',
    section: '2. and',
    concept: 'predict_and_logic',
    learning_objective: 'Predict the outcome of an and operation when one operand is False.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nhas_ticket = True\nhas_id = False\nprint(has_ticket and has_id)\n```',
    codeSnippet: 'has_ticket = True\nhas_id = False\nprint(has_ticket and has_id)',
    expected_output: 'False',
    options: [
      { id: 'opt_1', text: 'False', isCorrect: true, explanation: 'The and operator requires BOTH sides to be True. Because has_id is False, the result is False.' },
      { id: 'opt_2', text: 'True', isCorrect: false, explanation: 'and requires all conditions to be satisfied, not just one.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: 'None', isCorrect: false, explanation: 'Boolean logic produces True or False.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'Error', isCorrect: false, explanation: 'and is a built-in Python keyword operator.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'False',
    explanation: '`A and B` evaluates to `True` if and only if both `A` and `B` are True. If either operand is False, the result is `False`.',
    hint: 'Both sides must be True for and to produce True.',
    mental_model: 'and is like a two-key vault: you need BOTH keys to open the door.',
    relevant_line: 'print(has_ticket and has_id)',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_8_2',
    unit: 'unit_03',
    lesson: '3.5',
    section: '3. or',
    concept: 'predict_or_logic',
    learning_objective: 'Predict the outcome of an or operation when at least one operand is True.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nis_weekend = False\nis_holiday = True\nprint(is_weekend or is_holiday)\n```',
    codeSnippet: 'is_weekend = False\nis_holiday = True\nprint(is_weekend or is_holiday)',
    expected_output: 'True',
    options: [
      { id: 'opt_1', text: 'True', isCorrect: true, explanation: 'The or operator requires AT LEAST ONE side to be True. Because is_holiday is True, the result is True.' },
      { id: 'opt_2', text: 'False', isCorrect: false, explanation: 'or only evaluates to False if BOTH sides are False.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: 'True or False', isCorrect: false, explanation: 'Python evaluates the expression to a single boolean value.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'Error', isCorrect: false, explanation: 'or is a valid Python keyword operator.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'True',
    explanation: '`A or B` evaluates to `True` if at least one operand is True. Since `is_holiday` is True, `is_weekend or is_holiday` evaluates to `True`.',
    hint: 'Only one side needs to be True for or to evaluate to True.',
    mental_model: 'or is like having two different doors into a room: if EITHER door is unlocked, you can enter.',
    relevant_line: 'print(is_weekend or is_holiday)',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 2
  },
  {
    id: 'py_fnd_8_3',
    unit: 'unit_03',
    lesson: '3.5',
    section: '2. and',
    concept: 'truth_table_reasoning_and',
    learning_objective: 'Reason through truth table conditions for the and operator.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Under what exact circumstances does `condition_A and condition_B` evaluate to `True` in Python?',
    options: [
      { id: 'opt_1', text: 'When both condition_A and condition_B are True simultaneously', isCorrect: true, explanation: 'and strictly requires both operands to be truthy.' },
      { id: 'opt_2', text: 'When at least one of the conditions is True', isCorrect: false, explanation: 'That is the definition of the or operator, not and.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: 'When both conditions are False', isCorrect: false, explanation: 'False and False evaluates to False.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'When condition_A is True, regardless of condition_B', isCorrect: false, explanation: 'If condition_B is False, True and False evaluates to False.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' }
    ],
    correct_answer: 'When both condition_A and condition_B are True simultaneously',
    explanation: 'The logical `and` operator only yields `True` when both left and right expressions evaluate to `True`. If either one is `False`, the entire expression is `False`.',
    hint: 'Both conditions must be met at the same time.',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 3
  },
  {
    id: 'py_fnd_8_4',
    unit: 'unit_03',
    lesson: '3.5',
    section: '5. combining comparisons',
    concept: 'complete_range_condition',
    learning_objective: 'Complete a range check combining two comparisons with the and operator.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to check if `age` is a teenager (at least 13 AND at most 19):\n```python\nage = 15\nis_teen = (age >= 13) ____ (age <= 19)\nprint(is_teen)\n```',
    codeSnippet: 'age = 15\nis_teen = (age >= 13) ____ (age <= 19)\nprint(is_teen)',
    accepted_answers: ['and'],
    correct_answer: 'and',
    explanation: 'To check if a number lies within a range [13, 19], both conditions must be satisfied simultaneously, which requires the `and` operator.',
    hint: 'We need both conditions to hold: use and.',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 15,
    estimated_time: 30,
    order: 4
  },
  {
    id: 'py_fnd_8_5',
    unit: 'unit_03',
    lesson: '3.5',
    section: '5. combining comparisons',
    concept: 'write_compound_boolean_check',
    learning_objective: 'Write code using and to check if a temperature is in the comfortable range.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'Write a Python program that:\n1. Sets `temp = 72`\n2. Sets `is_comfortable = temp >= 68 and temp <= 78`\n3. Prints `is_comfortable`',
    starter_code: '# Check comfortable temperature range\n',
    solution_code: 'temp = 72\nis_comfortable = temp >= 68 and temp <= 78\nprint(is_comfortable)',
    expected_output: 'True',
    test_cases: [
      {
        id: 'tc_1',
        description: 'is_comfortable evaluates to True for 72 degrees',
        expectedOutput: 'True',
        assertionPython: "assert _user_namespace.get('is_comfortable') is True and _raw_stdout.strip() == 'True'"
      },
      {
        id: 'tc_2',
        description: 'Uses the and operator',
        expectedOutput: 'True',
        assertionPython: "assert ' and ' in _user_code",
        hidden: true
      }
    ],
    explanation: 'Because 72 is >= 68 (True) and <= 78 (True), `True and True` evaluates to `True`.',
    hint: 'temp = 72, is_comfortable = temp >= 68 and temp <= 78, print(is_comfortable)',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_8_6',
    unit: 'unit_03',
    lesson: '3.5',
    section: '2. and',
    concept: 'debug_and_or_confusion',
    learning_objective: 'Debug logic when or was incorrectly used instead of and.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'To enter a secure building, an employee must have a valid badge AND know the pin. But the program below currently lets people in if they only have a badge! Fix line 3 to require BOTH.',
    starter_code: 'has_badge = True\nknows_pin = False\ncan_enter = has_badge or knows_pin\nprint(can_enter)',
    solution_code: 'has_badge = True\nknows_pin = False\ncan_enter = has_badge and knows_pin\nprint(can_enter)',
    expected_output: 'False',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints False because knows_pin is False and both are required',
        expectedOutput: 'False',
        assertionPython: "assert _raw_stdout.strip() == 'False' and ' and ' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying can_enter evaluates to False with and',
        expectedOutput: 'False',
        assertionPython: "assert _user_namespace.get('can_enter') is False and ' and ' in _user_code",
        hidden: true
      }
    ],
    progressive_hints: [
      'Currently line 3 uses or. or will be True if either condition is met.',
      'The security requirement states they must have a badge AND know the pin.',
      'Replace or with and on line 3: can_enter = has_badge and knows_pin'
    ],
    explanation: 'When both requirements are mandatory, you must use `and`. Using `or` allows entry even when `knows_pin` is False.',
    hint: 'Replace or with and.',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 6
  },
  {
    id: 'py_fnd_8_7',
    unit: 'unit_03',
    lesson: '3.5',
    section: '4. not',
    concept: 'trace_boolean_not',
    learning_objective: 'Trace the inversion effect of the not operator on boolean variables.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the boolean value of `flag` across these lines:\n```python\nflag = True\nflag = not flag\nflag = not flag\n```\nWhat is `flag` after each line finishes?',
    trace_steps: [
      { step: 1, line: 1, code: 'flag = True', variable: 'Value of flag', expectedValue: 'True', hint: 'Initial assignment' },
      { step: 2, line: 2, code: 'flag = not flag', variable: 'Value of flag', expectedValue: 'False', hint: 'not True becomes False' },
      { step: 3, line: 3, code: 'flag = not flag', variable: 'Value of flag', expectedValue: 'True', hint: 'not False inverts back to True' }
    ],
    explanation: 'The `not` operator inverts a boolean. `not True` becomes `False`. Applying `not` again flips `False` back to `True`.',
    hint: 'not flips True to False, and False to True.',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_8_8',
    unit: 'unit_03',
    lesson: '3.5',
    section: '5. combining comparisons',
    concept: 'apply_vip_discount',
    learning_objective: 'Apply compound boolean logic to evaluate discount qualification.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'A customer qualifies for a special discount if:\n- They are a member (`is_member = True`)\n- AND their purchase is over 50 dollars (`spend = 75`)\n\nWrite code that checks both conditions and prints the resulting boolean.',
    starter_code: '# Check discount qualification\n',
    solution_code: 'is_member = True\nspend = 75\nqualifies = is_member and spend > 50\nprint(qualifies)',
    expected_output: 'True',
    test_cases: [
      {
        id: 'tc_1',
        description: 'qualifies evaluates to True',
        expectedOutput: 'True',
        assertionPython: "assert _raw_stdout.strip() == 'True' and _user_namespace.get('qualifies') is True"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying qualifies boolean variable',
        expectedOutput: 'True',
        assertionPython: "assert _user_namespace.get('qualifies') is True",
        hidden: true
      }
    ],
    explanation: '`is_member and spend > 50` evaluates both conditions: `True and True` produces `True`.',
    hint: 'qualifies = is_member and spend > 50',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 25,
    estimated_time: 60,
    order: 8
  },
  {
    id: 'py_fnd_8_9',
    unit: 'unit_03',
    lesson: '3.5',
    section: '4. not',
    concept: 'predict_not_comparison',
    learning_objective: 'Predict the outcome of not applied to a comparison expression.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nx = 3\nprint(not (x > 5))\n```',
    codeSnippet: 'x = 3\nprint(not (x > 5))',
    expected_output: 'True',
    options: [
      { id: 'opt_1', text: 'True', isCorrect: true, explanation: 'x > 5 is False (3 is not > 5). Then not False flips to True.' },
      { id: 'opt_2', text: 'False', isCorrect: false, explanation: 'x > 5 is False, but not inverts it to True.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: '3', isCorrect: false, explanation: 'not returns a boolean, not the number x.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_4', text: 'Error', isCorrect: false, explanation: 'not (x > 5) is completely valid Python.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'True',
    explanation: 'Inside the parentheses, `3 > 5` evaluates to `False`. The `not` operator in front flips `False` to `True`.',
    hint: 'First evaluate 3 > 5. Then apply not.',
    mental_model: 'not reverses whatever boolean follows it.',
    relevant_line: 'print(not (x > 5))',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_8_10',
    unit: 'unit_03',
    lesson: '3.5',
    section: '5. combining comparisons',
    concept: 'reason_boolean_precedence',
    learning_objective: 'Reason through boolean operator precedence between not, and, and or.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following expression:\n```python\nresult = True or False and False\n```\nWhat does this evaluate to, and why?',
    options: [
      { id: 'opt_1', text: 'True, because and has higher precedence than or in Python, so (False and False) is evaluated first', isCorrect: true, explanation: 'In Python boolean algebra: not has highest precedence, then and, then or. So True or (False and False) -> True or False -> True.' },
      { id: 'opt_2', text: 'False, because it evaluates strictly left to right: (True or False) is True, then True and False is False', isCorrect: false, explanation: 'Python does not evaluate boolean operators strictly left-to-right without precedence; and binds tighter than or.', misconception_tag: 'PRECEDENCE_CONFUSION' },
      { id: 'opt_3', text: 'Error: Cannot combine and and or without parentheses', isCorrect: false, explanation: 'Python allows mixing and and or, following precedence rules.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: 'None', isCorrect: false, explanation: 'Boolean expressions always evaluate to True or False.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' }
    ],
    correct_answer: 'True, because and has higher precedence than or in Python, so (False and False) is evaluated first',
    explanation: 'In Python, `and` has higher precedence than `or`. Therefore `True or False and False` is interpreted as `True or (False and False)`, which is `True or False = True`.',
    hint: 'and binds tighter than or, just like multiplication binds tighter than addition.',
    misconception_tag: 'PRECEDENCE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 10
  }
];

export const LESSON_08: LessonStructure = {
  id: '3.5',
  unitId: 'unit_03',
  unitTitle: 'Unit 3: Operators and Math',
  title: 'Logical Operators',
  slug: 'logical-operators',
  order: 5,
  description: 'Master True/False truth tables, and, or, not operators, and compound condition precedence.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. True / False',
    '2. and',
    '3. or',
    '4. not',
    '5. combining comparisons'
  ],
  questions: LESSON_08_QUESTIONS
};
