import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_10_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_10_1',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'predict_full_pipeline',
    learning_objective: 'Predict the output of a multi-step program combining variables, conversion, arithmetic, and if/else.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nraw_price = "40"\nquantity = 2\ntotal = int(raw_price) * quantity\n\nif total >= 100:\n    print("Free Shipping")\nelse:\n    print("Add $10 Shipping")\n```',
    codeSnippet: 'raw_price = "40"\nquantity = 2\ntotal = int(raw_price) * quantity\n\nif total >= 100:\n    print("Free Shipping")\nelse:\n    print("Add $10 Shipping")',
    expected_output: 'Add $10 Shipping',
    options: [
      { id: 'opt_1', text: 'Add $10 Shipping', isCorrect: true, explanation: 'int("40") * 2 is 80. Since 80 is not >= 100, the else branch executes.' },
      { id: 'opt_2', text: 'Free Shipping', isCorrect: false, explanation: '80 is less than 100, so the if condition evaluates to False.', misconception_tag: 'CONDITION_BOUNDARY' },
      { id: 'opt_3', text: '4040', isCorrect: false, explanation: 'int("40") was converted to a number, so math multiplication happened.', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_4', text: 'TypeError', isCorrect: false, explanation: 'All conversions and comparisons are completely valid.', misconception_tag: 'WRONG_TYPE' }
    ],
    correct_answer: 'Add $10 Shipping',
    explanation: '`int("40") * 2` calculates `80`. Then `80 >= 100` evaluates to `False`, executing the `else` block to print `"Add $10 Shipping"`.',
    hint: 'Calculate total first: 40 * 2 = 80. Then check 80 >= 100.',
    mental_model: 'Follow the data flow: string -> integer -> arithmetic result -> condition check -> output.',
    relevant_line: 'if total >= 100:',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 20,
    estimated_time: 60,
    order: 1
  },
  {
    id: 'py_fnd_10_2',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'complete_cart_discount',
    learning_objective: 'Complete conditional discount calculation logic.',
    difficulty: 'medium',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the condition to give a discount if `subtotal` is greater than or equal to `50`:\n```python\nsubtotal = 65\nif subtotal ____ 50:\n    discount = 10\nelse:\n    discount = 0\nprint(discount)\n```',
    codeSnippet: 'subtotal = 65\nif subtotal ____ 50:\n    discount = 10\nelse:\n    discount = 0\nprint(discount)',
    accepted_answers: ['>='],
    correct_answer: '>=',
    explanation: '`>=` checks if `subtotal` is at least 50.',
    hint: 'Use the greater-than-or-equal operator: >=',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 15,
    estimated_time: 30,
    order: 2
  },
  {
    id: 'py_fnd_10_3',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'write_temp_converter',
    learning_objective: 'Write a program converting Fahrenheit to Celsius and printing the result.',
    difficulty: 'medium',
    question_type: 'WRITE_CODE',
    prompt: 'Write a Python program that converts `68` degrees Fahrenheit to Celsius:\nFormula: `celsius = (fahrenheit - 32) * 5 / 9`\n1. Set `fahrenheit = 68`\n2. Compute `celsius = (fahrenheit - 32) * 5 / 9`\n3. Print `celsius`',
    starter_code: '# Convert Fahrenheit to Celsius\n',
    solution_code: 'fahrenheit = 68\ncelsius = (fahrenheit - 32) * 5 / 9\nprint(celsius)',
    expected_output: '20.0',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Computes celsius as 20.0',
        expectedOutput: '20.0',
        assertionPython: "assert float(_raw_stdout.strip()) == 20.0 and _user_namespace.get('celsius') == 20.0"
      },
      {
        id: 'tc_2',
        description: 'Uses parentheses to enforce subtraction before multiplication',
        expectedOutput: '20.0',
        assertionPython: "assert '(' in _user_code and ')' in _user_code",
        hidden: true
      }
    ],
    explanation: '`(68 - 32)` computes `36` first due to parentheses, then `36 * 5 / 9 = 20.0`.',
    hint: 'celsius = (fahrenheit - 32) * 5 / 9',
    misconception_tag: 'PRECEDENCE_CONFUSION',
    xp: 25,
    estimated_time: 75,
    order: 3
  },
  {
    id: 'py_fnd_10_4',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'debug_password_validator',
    learning_objective: 'Debug password length verification to include passwords of exact cutoff length 8.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A security rule requires passwords to be at least 8 characters long. When `length = 8`, the code below prints `Too Short`! Fix the comparison operator so 8-character passwords are accepted as `Valid`.',
    starter_code: 'length = 8\nif length > 8:\n    print("Valid")\nelse:\n    print("Too Short")',
    solution_code: 'length = 8\nif length >= 8:\n    print("Valid")\nelse:\n    print("Too Short")',
    expected_output: 'Valid',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints "Valid" for length of 8 using >=',
        expectedOutput: 'Valid',
        assertionPython: "assert _raw_stdout.strip() == 'Valid' and '>=' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying comparison operator includes 8',
        expectedOutput: 'Valid',
        assertionPython: "assert _raw_stdout.strip() == 'Valid'",
        hidden: true
      }
    ],
    progressive_hints: [
      'length > 8 excludes 8! 8 is not greater than 8.',
      'Change > to >= (greater than or equal to).',
      'Change line 2 to: if length >= 8:'
    ],
    explanation: '`length > 8` rejected passwords of length 8. Replacing with `length >= 8` accepts 8 and above.',
    hint: 'Use >= instead of > on line 2.',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 20,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_10_5',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'trace_ledger_transaction',
    learning_objective: 'Trace a ledger balance across deposit, withdrawal, and fee operations.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `balance` across this bank transaction ledger:\n```python\nbalance = 100\nbalance = balance + 50\nbalance = balance - 30\nbalance = balance - 5\n```\nWhat is `balance` after each line?',
    trace_steps: [
      { step: 1, line: 1, code: 'balance = 100', variable: 'Value of balance', expectedValue: '100', hint: 'Initial balance' },
      { step: 2, line: 2, code: 'balance = balance + 50', variable: 'Value of balance', expectedValue: '150', hint: 'Deposit 50' },
      { step: 3, line: 3, code: 'balance = balance - 30', variable: 'Value of balance', expectedValue: '120', hint: 'Withdrawal 30' },
      { step: 4, line: 4, code: 'balance = balance - 5', variable: 'Value of balance', expectedValue: '115', hint: 'Fee 5' }
    ],
    explanation: '`100 + 50 = 150`, then `150 - 30 = 120`, then `120 - 5 = 115`.',
    hint: 'Track each balance update sequentially.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_10_6',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'reason_tax_exemption_boundary',
    learning_objective: 'Reason through boundary conditions in income tax bracket evaluation.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following tax code:\n```python\nincome = 10000\nif income <= 10000:\n    rate = 0.0\nelse:\n    rate = 0.15\n```\nWhat rate does a taxpayer making exactly $10,000 receive, and why?',
    options: [
      { id: 'opt_1', text: '0.0, because <= includes 10000', isCorrect: true, explanation: 'The less-than-or-equal operator <= evaluates to True when income is exactly 10000.' },
      { id: 'opt_2', text: '0.15, because 10000 triggers the higher tax bracket', isCorrect: false, explanation: '10000 is <= 10000, so the if block runs, not the else.', misconception_tag: 'CONDITION_BOUNDARY' },
      { id: 'opt_3', text: 'Error, decimals cannot be stored in variables', isCorrect: false, explanation: 'Python fully supports floating-point decimals like 0.0 and 0.15.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: 'None', isCorrect: false, explanation: 'rate is assigned 0.0.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' }
    ],
    correct_answer: '0.0, because <= includes 10000',
    explanation: '`income <= 10000` evaluates to `True` when `income` is `10000`. Therefore `rate` becomes `0.0`.',
    hint: '<= means less than OR equal to.',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 15,
    estimated_time: 45,
    order: 6
  },
  {
    id: 'py_fnd_10_7',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'write_delivery_fee_calc',
    learning_objective: 'Calculate delivery fee based on order distance and minimum spend.',
    difficulty: 'medium',
    question_type: 'WRITE_CODE',
    prompt: 'Write a program to calculate delivery fee:\n1. Set `order_total = 40`\n2. If `order_total >= 50`, set `fee = 0`\n3. Else, set `fee = 5`\n4. Print `fee`',
    starter_code: '# Calculate delivery fee\n',
    solution_code: 'order_total = 40\nif order_total >= 50:\n    fee = 0\nelse:\n    fee = 5\nprint(fee)',
    expected_output: '5',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Outputs 5 for order under 50',
        expectedOutput: '5',
        assertionPython: "assert _raw_stdout.strip() == '5' and _user_namespace.get('fee') == 5"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying fee variable calculation',
        expectedOutput: '5',
        assertionPython: "assert _user_namespace.get('fee') == 5",
        hidden: true
      }
    ],
    explanation: 'Since `40 >= 50` is False, the `else` block sets `fee = 5` and prints `5`.',
    hint: 'if order_total >= 50:\n    fee = 0\nelse:\n    fee = 5\nprint(fee)',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_10_8',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'apply_game_health_resolver',
    learning_objective: 'Apply arithmetic and conditional logic to resolve game character health and status.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'A hero has `50` HP and takes `20` damage. If their remaining HP is greater than `0`, they survive.\nWrite a Python program that:\n1. Sets `hp = 50`\n2. Subtracts `20`: `hp = hp - 20`\n3. If `hp > 0`, prints `"Alive"`\n4. Else, prints `"Defeated"`',
    starter_code: '# Resolve player damage and status\n',
    solution_code: 'hp = 50\nhp = hp - 20\nif hp > 0:\n    print("Alive")\nelse:\n    print("Defeated")',
    expected_output: 'Alive',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Correctly prints Alive with remaining hp 30',
        expectedOutput: 'Alive',
        assertionPython: "assert _raw_stdout.strip() == 'Alive' and _user_namespace.get('hp') == 30"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying hp variable calculation',
        expectedOutput: 'Alive',
        assertionPython: "assert _user_namespace.get('hp') == 30",
        hidden: true
      }
    ],
    explanation: '`50 - 20 = 30`. Since `30 > 0` is True, `"Alive"` is printed.',
    hint: 'hp = 50\nhp = hp - 20\nif hp > 0:\n    print("Alive")\nelse:\n    print("Defeated")',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 25,
    estimated_time: 75,
    order: 8
  },
  {
    id: 'py_fnd_10_9',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'debug_discount_coupon_code',
    learning_objective: 'Debug conditional coupon verification requiring exact string and minimum cart spend.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A coupon is valid ONLY if the code is `"SAVE10"` AND the `cart` is at least 50. But the program below currently accepts any coupon code! Fix line 3 to require both.',
    starter_code: 'code = "SAVE10"\ncart = 60\nif code = "SAVE10" and cart >= 50:\n    print("Discount Applied")',
    solution_code: 'code = "SAVE10"\ncart = 60\nif code == "SAVE10" and cart >= 50:\n    print("Discount Applied")',
    expected_output: 'Discount Applied',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Uses == for string comparison in if condition',
        expectedOutput: 'Discount Applied',
        assertionPython: "assert _raw_stdout.strip() == 'Discount Applied' and 'code == \"SAVE10\"' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying code equality syntax',
        expectedOutput: 'Discount Applied',
        assertionPython: "assert _raw_stdout.strip() == 'Discount Applied' and '==' in _user_code",
        hidden: true
      }
    ],
    progressive_hints: [
      'Line 3 has an assignment (=) instead of a comparison (==).',
      'Change code = "SAVE10" to code == "SAVE10".',
      'Update line 3: if code == "SAVE10" and cart >= 50:'
    ],
    explanation: 'Testing equality requires `==`. Using `=` inside an `if` condition triggers a SyntaxError.',
    hint: 'Replace code = "SAVE10" with code == "SAVE10".',
    misconception_tag: 'ASSIGNMENT_VS_COMPARISON',
    xp: 20,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_10_10',
    unit: 'unit_05',
    lesson: '5.6',
    section: 'Foundations Synthesis',
    concept: 'write_atm_withdrawal_validator',
    learning_objective: 'Build an ATM withdrawal validator testing positive amount and sufficient funds.',
    difficulty: 'medium',
    question_type: 'WRITE_CODE',
    prompt: 'You are writing the core validator for an ATM:\n1. Set `balance = 500`\n2. Set `withdraw_amount = 200`\n3. If `withdraw_amount > 0 and withdraw_amount <= balance`, print `"Transaction Approved"`\n4. Else, print `"Transaction Declined"`',
    starter_code: '# ATM Withdrawal Validator\n',
    solution_code: 'balance = 500\nwithdraw_amount = 200\nif withdraw_amount > 0 and withdraw_amount <= balance:\n    print("Transaction Approved")\nelse:\n    print("Transaction Declined")',
    expected_output: 'Transaction Approved',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints "Transaction Approved" for valid withdrawal',
        expectedOutput: 'Transaction Approved',
        assertionPython: "assert _raw_stdout.strip() == 'Transaction Approved'"
      },
      {
        id: 'tc_2',
        description: 'Uses compound condition with and',
        expectedOutput: 'Transaction Approved',
        assertionPython: "assert ' and ' in _user_code",
        hidden: true
      }
    ],
    explanation: '`withdraw_amount > 0` (True) and `withdraw_amount <= balance` (200 <= 500 is True). Both are True, so the transaction is approved.',
    hint: 'if withdraw_amount > 0 and withdraw_amount <= balance:\n    print("Transaction Approved")\nelse:\n    print("Transaction Declined")',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 30,
    estimated_time: 90,
    order: 10
  }
];

export const LESSON_10: LessonStructure = {
  id: '5.6',
  unitId: 'unit_05',
  unitTitle: 'Unit 5: Conditional Logic',
  title: 'Project: Interactive Calculator',
  slug: 'project-interactive-calculator',
  order: 6,
  description: 'Synthesize variables, input, type conversion, arithmetic, comparisons, and conditional branching in deliberate challenge drills.',
  estimatedMinutes: 12,
  xpReward: 50,
  sections: [
    '1. Variables synthesis',
    '2. Input & conversion',
    '3. Arithmetic expressions',
    '4. Comparisons & boundaries',
    '5. Full program integration'
  ],
  questions: LESSON_10_QUESTIONS
};
