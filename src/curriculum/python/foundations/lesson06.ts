import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_06_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_6_1',
    unit: 'unit_02',
    lesson: '2.7',
    section: '1. int()',
    concept: 'predict_int_conversion',
    learning_objective: 'Predict the result of converting a string of digits to an integer before addition.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\ntext_num = "42"\nresult = int(text_num) + 8\nprint(result)\n```',
    codeSnippet: 'text_num = "42"\nresult = int(text_num) + 8\nprint(result)',
    expected_output: '50',
    options: [
      { id: 'opt_1', text: '50', isCorrect: true, explanation: 'int("42") converts the string to the integer 42. Then 42 + 8 = 50.' },
      { id: 'opt_2', text: '428', isCorrect: false, explanation: 'Because text_num was converted to int(), mathematical addition is performed, not string concatenation.', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_3', text: 'TypeError', isCorrect: false, explanation: 'int("42") is a valid number, so adding 8 is valid math.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: '"50"', isCorrect: false, explanation: 'The result is an integer, printed without quotation marks.', misconception_tag: 'STRING_VS_NUMBER' }
    ],
    correct_answer: '50',
    explanation: '`int("42")` parses the string `"42"` into the integer `42`. Then `42 + 8` evaluates mathematically to `50`.',
    hint: 'int("42") changes the string into the number 42.',
    mental_model: 'int() strips away the quotation marks and interprets the digits inside as an actual number.',
    relevant_line: 'result = int(text_num) + 8',
    misconception_tag: 'INPUT_IS_STRING',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_6_2',
    unit: 'unit_02',
    lesson: '2.7',
    section: '5. Common conversion errors',
    concept: 'value_error_conversion',
    learning_objective: 'Recognize that int() cannot convert non-numeric text.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Look at the following code:\n```python\nval = int("hello")\nprint(val)\n```\nWhat happens when this program runs?',
    codeSnippet: 'val = int("hello")\nprint(val)',
    expected_output: 'ValueError',
    options: [
      { id: 'opt_1', text: 'ValueError: invalid literal for int() with base 10', isCorrect: true, explanation: 'Python cannot convert arbitrary words like "hello" into base-10 integers.' },
      { id: 'opt_2', text: '0', isCorrect: false, explanation: 'Python does not quietly turn invalid text into 0; it raises an explicit error.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_3', text: 'hello', isCorrect: false, explanation: 'int() converts to numbers, it does not keep the text string.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: 'None', isCorrect: false, explanation: 'Python raises a ValueError on invalid conversion.', misconception_tag: 'WRONG_TYPE' }
    ],
    correct_answer: 'ValueError: invalid literal for int() with base 10',
    explanation: '`int()` requires the string to contain valid digits (like `"123"` or `"-5"`). Passing `"hello"` triggers a `ValueError`.',
    hint: 'Can you turn the word "hello" into a number?',
    misconception_tag: 'WRONG_TYPE',
    xp: 15,
    estimated_time: 45,
    order: 2
  },
  {
    id: 'py_fnd_6_3',
    unit: 'unit_02',
    lesson: '2.7',
    section: '3. str()',
    concept: 'str_conversion_syntax',
    learning_objective: 'Complete a statement using str() to convert a number for output.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to convert the integer `items` to text so it can concatenate with the string:\n```python\nitems = 5\nmsg = "Cart items: " + ____(items)\nprint(msg)\n```',
    codeSnippet: 'items = 5\nmsg = "Cart items: " + ____(items)\nprint(msg)',
    accepted_answers: ['str'],
    correct_answer: 'str',
    explanation: '`str()` is the built-in function that converts any value into its string representation.',
    hint: 'Use the 3-letter abbreviation for string: str',
    misconception_tag: 'STRING_VS_NUMBER',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_6_4',
    unit: 'unit_02',
    lesson: '2.7',
    section: '2. float()',
    concept: 'float_vs_int_decimal_string',
    learning_objective: 'Explain why int("3.14") fails whereas float("3.14") succeeds.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at these two statements:\n```python\na = float("3.14")  # Line 1: Works\nb = int("3.14")    # Line 2: Crashes\n```\nWhy does line 2 crash with a ValueError?',
    options: [
      { id: 'opt_1', text: 'int() only converts strings containing pure integer digits; it cannot parse a decimal point directly from a string', isCorrect: true, explanation: 'The string "3.14" contains a decimal point, which int() rejects. To convert "3.14" to an integer, you must first do float("3.14") then int().' },
      { id: 'opt_2', text: '3.14 is a negative number in Python', isCorrect: false, explanation: '3.14 is a positive decimal number.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_3', text: 'Strings cannot be converted to floats', isCorrect: false, explanation: 'float("3.14") works completely fine.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: 'Variable b was not defined', isCorrect: false, explanation: 'b is being defined on that line.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' }
    ],
    correct_answer: 'int() only converts strings containing pure integer digits; it cannot parse a decimal point directly from a string',
    explanation: '`int()` expects only digits `0-9` (and optional sign) in a string literal. A decimal point `.` causes an immediate ValueError unless parsed by `float()` first.',
    hint: 'int() does not understand a decimal point when parsing directly from a string.',
    misconception_tag: 'WRONG_TYPE',
    xp: 20,
    estimated_time: 60,
    order: 4
  },
  {
    id: 'py_fnd_6_5',
    unit: 'unit_02',
    lesson: '2.7',
    section: '4. Why conversion matters',
    concept: 'write_type_conversion_calc',
    learning_objective: 'Convert a string price to a float and calculate the total with tax.',
    difficulty: 'medium',
    question_type: 'WRITE_CODE',
    prompt: 'You have a string price `price_str = "10.0"`. Write code that:\n1. Sets `price_str = "10.0"`\n2. Converts it to a float `price = float(price_str)`\n3. Adds `2.5` for shipping: `total = price + 2.5`\n4. Prints `total`',
    starter_code: '# Convert string price and add shipping\n',
    solution_code: 'price_str = "10.0"\nprice = float(price_str)\ntotal = price + 2.5\nprint(total)',
    expected_output: '12.5',
    test_cases: [
      {
        id: 'tc_1',
        description: 'total equals 12.5 and prints 12.5',
        expectedOutput: '12.5',
        assertionPython: "assert _user_namespace.get('total') == 12.5 and _raw_stdout.strip() == '12.5'"
      },
      {
        id: 'tc_2',
        description: 'Uses float conversion',
        expectedOutput: '12.5',
        assertionPython: "assert 'float(' in _user_code",
        hidden: true
      }
    ],
    explanation: '`float("10.0")` converts the text to `10.0`, allowing arithmetic addition of `2.5` to yield `12.5`.',
    hint: 'price = float(price_str), total = price + 2.5, print(total)',
    misconception_tag: 'WRONG_TYPE',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_6_6',
    unit: 'unit_02',
    lesson: '2.7',
    section: '5. Common conversion errors',
    concept: 'debug_missing_int_conversion',
    learning_objective: 'Debug a program missing int() conversion before multiplication.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A store clerk calculates the cost of 3 tickets at $15 each. But the program below prints `151515` because `quantity` was multiplied by a string! Fix it so it prints `45`.',
    starter_code: 'price = "15"\nquantity = 3\ntotal = price * quantity\nprint(total)',
    solution_code: 'price = "15"\nquantity = 3\ntotal = int(price) * quantity\nprint(total)',
    expected_output: '45',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints 45 instead of repeating string',
        expectedOutput: '45',
        assertionPython: "assert _raw_stdout.strip() == '45' and _user_namespace.get('total') == 45"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying int conversion and total',
        expectedOutput: '45',
        assertionPython: "assert _user_namespace.get('total') == 45 and _raw_stdout.strip() == '45'",
        hidden: true
      }
    ],
    progressive_hints: [
      'In Python, string * 3 repeats the text: "15" * 3 = "151515".',
      'Convert price from text to an integer using int(price) before multiplying.',
      'Change line 3 to: total = int(price) * quantity'
    ],
    explanation: 'Multiplying a string by an integer repeats the string (`"15" * 3 = "151515"`). Converting with `int(price)` performs mathematical multiplication (`15 * 3 = 45`).',
    hint: 'Convert price with int(price): total = int(price) * quantity',
    misconception_tag: 'STRING_VS_NUMBER',
    xp: 20,
    estimated_time: 60,
    order: 6
  },
  {
    id: 'py_fnd_6_7',
    unit: 'unit_02',
    lesson: '2.7',
    section: '4. Why conversion matters',
    concept: 'trace_conversion_types',
    learning_objective: 'Trace variable types across string, integer, and float conversions.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `val` step by step:\n```python\nval = "10"\nval = int(val) * 2\nval = str(val) + "!"\n```\nWhat is the value of `val` after each line?',
    trace_steps: [
      { step: 1, line: 1, code: 'val = "10"', variable: 'Value of val', expectedValue: '10', hint: 'String "10"' },
      { step: 2, line: 2, code: 'val = int(val) * 2', variable: 'Value of val', expectedValue: '20', hint: 'Converted to integer 10 and multiplied by 2' },
      { step: 3, line: 3, code: 'val = str(val) + "!"', variable: 'Value of val', expectedValue: '20!', hint: 'Converted back to string "20" and concatenated with "!"' }
    ],
    explanation: '`val` starts as the string `"10"`. Next, `int("10") * 2` yields the integer `20`. Finally, `str(20) + "!"` creates the string `"20!"`.',
    hint: 'Watch how the data type changes from string to integer and back to string.',
    misconception_tag: 'WRONG_TYPE',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_6_8',
    unit: 'unit_02',
    lesson: '2.7',
    section: '4. Why conversion matters',
    concept: 'apply_bus_fare',
    learning_objective: 'Apply int() and str() to calculate bus ticket total and format a confirmation.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'Write a program for a bus ticket machine:\n1. Set `riders_str = "4"`\n2. Set `fare_per_rider = 5`\n3. Calculate `total_fare = int(riders_str) * fare_per_rider`\n4. Print: `Total: $20`',
    starter_code: '# Calculate and print total bus fare\n',
    solution_code: 'riders_str = "4"\nfare_per_rider = 5\ntotal_fare = int(riders_str) * fare_per_rider\nprint("Total: $" + str(total_fare))',
    expected_output: 'Total: $20',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Computes total fare of 20 and prints formatted Total: $20',
        expectedOutput: 'Total: $20',
        assertionPython: "assert _raw_stdout.strip() == 'Total: $20' and _user_namespace.get('total_fare') == 20"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying calculation of total_fare',
        expectedOutput: 'Total: $20',
        assertionPython: "assert _user_namespace.get('total_fare') == 20 and _raw_stdout.strip() == 'Total: $20'",
        hidden: true
      }
    ],
    explanation: 'We convert `riders_str` with `int()`, compute `4 * 5 = 20`, and convert back with `str(total_fare)` for printing.',
    hint: 'total_fare = int(riders_str) * fare_per_rider, print("Total: $" + str(total_fare))',
    misconception_tag: 'WRONG_TYPE',
    xp: 25,
    estimated_time: 75,
    order: 8
  },
  {
    id: 'py_fnd_6_9',
    unit: 'unit_02',
    lesson: '2.7',
    section: '5. Common conversion errors',
    concept: 'debug_float_string_to_int',
    learning_objective: 'Debug an int() crash on a float string by using float() first.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'The code below crashes with `ValueError: invalid literal for int() with base 10: \'19.99\'`. Fix it so it converts using `float()` instead of `int()`.',
    starter_code: 'price_text = "19.99"\nprice = int(price_text)\nprint(price)',
    solution_code: 'price_text = "19.99"\nprice = float(price_text)\nprint(price)',
    expected_output: '19.99',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Successfully converts decimal string using float()',
        expectedOutput: '19.99',
        assertionPython: "assert float(_raw_stdout.strip()) == 19.99 and 'float(' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying price variable as float',
        expectedOutput: '19.99',
        assertionPython: "assert float(_user_namespace.get('price')) == 19.99 and 'float(' in _user_code",
        hidden: true
      }
    ],
    progressive_hints: [
      'The string "19.99" contains a decimal point, which int() cannot parse directly from text.',
      'Use float() to parse decimal numbers.',
      'Change line 2 to: price = float(price_text)'
    ],
    explanation: '`int()` fails on `"19.99"` because of the decimal point. Using `float(price_text)` properly parses decimal numbers.',
    hint: 'Replace int(price_text) with float(price_text)',
    misconception_tag: 'WRONG_TYPE',
    xp: 20,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_6_10',
    unit: 'unit_02',
    lesson: '2.7',
    section: '1. int()',
    concept: 'identify_valid_int_conversions',
    learning_objective: 'Identify which string values can be safely converted with int().',
    difficulty: 'easy',
    question_type: 'MULTIPLE_CHOICE',
    prompt: 'Which of the following values can be safely converted to an integer using `int(x)` without raising an error?',
    options: [
      { id: 'opt_1', text: '"-10"', isCorrect: true, explanation: 'int() safely handles negative and positive integers in strings, like "-10" or "42".' },
      { id: 'opt_2', text: '"3.5"', isCorrect: false, explanation: '"3.5" contains a decimal point and raises a ValueError in int().', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_3', text: '"one"', isCorrect: false, explanation: 'Words cannot be converted to numbers without custom mapping.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: '"$50"', isCorrect: false, explanation: 'The dollar symbol ($) is not a digit and causes a ValueError.', misconception_tag: 'WRONG_TYPE' }
    ],
    correct_answer: '"-10"',
    explanation: '`int()` can convert positive and negative whole numbers in string form (`"-10"` -> `-10`). Decimals, symbols, and words will raise a `ValueError`.',
    hint: 'Look for whole numbers without decimals or currency symbols.',
    misconception_tag: 'WRONG_TYPE',
    xp: 15,
    estimated_time: 30,
    order: 10
  }
];

export const LESSON_06: LessonStructure = {
  id: '2.7',
  unitId: 'unit_02',
  unitTitle: 'Unit 2: Variables and Data',
  title: 'Type Conversion (Casting)',
  slug: 'type-conversion-casting',
  order: 7,
  description: 'Master int(), float(), and str() conversions and understand why data types cannot be mixed blindly in Python.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. int()',
    '2. float()',
    '3. str()',
    '4. Why conversion matters',
    '5. Common conversion errors'
  ],
  questions: LESSON_06_QUESTIONS
};
