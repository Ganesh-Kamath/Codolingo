import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_04_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_4_1',
    unit: 'unit_01',
    lesson: '1.4',
    section: '3. Concatenation',
    concept: 'string_concatenation',
    learning_objective: 'Predict the result of concatenating two string literals with +.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nlang = "Python" + "3"\nprint(lang)\n```',
    codeSnippet: 'lang = "Python" + "3"\nprint(lang)',
    expected_output: 'Python3',
    options: [
      { id: 'opt_1', text: 'Python3', isCorrect: true, explanation: 'When both operands are strings, the + operator concatenates (joins) them without adding spaces.' },
      { id: 'opt_2', text: 'Python 3', isCorrect: false, explanation: 'The + operator does not insert spaces automatically. It glues the strings end-to-end.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_3', text: 'Error: Cannot add numbers to text', isCorrect: false, explanation: '"3" is inside quotes, so it is a string, not a number.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_4', text: 'Python+3', isCorrect: false, explanation: 'The + symbol is an operator, not part of the printed text.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Python3',
    explanation: 'When both sides of `+` are strings, Python performs string concatenation, joining them end-to-end into a single string `Python3`.',
    hint: 'Both "Python" and "3" are strings. The + operator glues strings together.',
    mental_model: 'Think of + with strings like gluing train cars together: car A attaches directly to car B.',
    relevant_line: 'lang = "Python" + "3"',
    misconception_tag: 'STRING_VS_NUMBER',
    repair_concept: 'string_concatenation',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_4_2',
    unit: 'unit_01',
    lesson: '1.4',
    section: '3. Concatenation',
    concept: 'type_error_string_plus_int',
    learning_objective: 'Identify the TypeError caused by concatenating a string and an integer.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Look at the following code:\n```python\nage = 18\nprint("I am " + age)\n```\nWhat will happen when you run this program?',
    codeSnippet: 'age = 18\nprint("I am " + age)',
    expected_output: 'TypeError',
    options: [
      { id: 'opt_1', text: 'TypeError: can only concatenate str (not "int") to str', isCorrect: true, explanation: 'Python refuses to use + between a string and an integer because it does not know whether to add mathematically or join text.' },
      { id: 'opt_2', text: 'I am 18', isCorrect: false, explanation: 'In Python (unlike JavaScript), numbers are NOT automatically converted to strings when using +.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_3', text: 'I am age', isCorrect: false, explanation: 'age is a variable holding 18, not a literal string "age".', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_4', text: '18', isCorrect: false, explanation: '"I am " is not ignored; an error occurs before anything prints.', misconception_tag: 'STRING_VS_NUMBER' }
    ],
    correct_answer: 'TypeError: can only concatenate str (not "int") to str',
    explanation: 'Python is strongly typed. `+` means numerical addition for numbers and concatenation for strings. Attempting to concatenate `"I am "` (str) with `18` (int) raises a `TypeError`.',
    hint: 'Python does not automatically convert numbers to strings when using the + operator.',
    mental_model: 'Python keeps strings and numbers in separate worlds. To join a number with text, you must explicitly convert it using str(age) or separate with a comma in print().',
    relevant_line: 'print("I am " + age)',
    repair_question: {
      prompt: 'How can you safely display both "Score: " and the number 100 without a TypeError?',
      options: [
        { id: 'rep_1', text: 'print("Score:", 100) or print("Score: " + str(100))', isCorrect: true, explanation: 'Passing multiple arguments to print() or using str() converts cleanly.' },
        { id: 'rep_2', text: 'print("Score: " + 100)', isCorrect: false, explanation: 'This raises a TypeError.' }
      ],
      correctAnswer: 'print("Score:", 100) or print("Score: " + str(100))',
      explanation: 'Using a comma in print() separates arguments and prints any type safely with an automatic space.'
    },
    misconception_tag: 'STRING_VS_NUMBER',
    repair_concept: 'string_int_combination',
    xp: 20,
    estimated_time: 60,
    order: 2
  },
  {
    id: 'py_fnd_4_3',
    unit: 'unit_01',
    lesson: '1.4',
    section: '3. Concatenation',
    concept: 'complete_full_name',
    learning_objective: 'Complete string concatenation to include a spacing delimiter.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement so that `full_name` contains `"Ada Lovelace"` with a space between them:\n```python\nfirst = "Ada"\nlast = "Lovelace"\nfull_name = first + ____ + last\nprint(full_name)\n```',
    codeSnippet: 'first = "Ada"\nlast = "Lovelace"\nfull_name = first + ____ + last\nprint(full_name)',
    accepted_answers: ['" "', "' '"],
    correct_answer: '" "',
    explanation: 'Because `+` does not insert spaces automatically, we must concatenate an explicit space string `" "` between `first` and `last`.',
    hint: 'Add a string containing a single space: " "',
    misconception_tag: 'STRING_VS_NUMBER',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_4_4',
    unit: 'unit_01',
    lesson: '1.4',
    section: '4. Repetition',
    concept: 'string_repetition_operator',
    learning_objective: 'Predict the result of repeating a string using the * operator.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\ncheer = "Go!" * 3\nprint(cheer)\n```',
    codeSnippet: 'cheer = "Go!" * 3\nprint(cheer)',
    expected_output: 'Go!Go!Go!',
    options: [
      { id: 'opt_1', text: 'Go!Go!Go!', isCorrect: true, explanation: 'Multiplying a string by an integer n repeats the string n times.' },
      { id: 'opt_2', text: 'Go! Go! Go!', isCorrect: false, explanation: 'Repetition repeats the exact characters without injecting spaces.', misconception_tag: 'STRING_VS_NUMBER' },
      { id: 'opt_3', text: 'Error: Cannot multiply text', isCorrect: false, explanation: 'Python allows string * int to repeat strings.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: 'Go! * 3', isCorrect: false, explanation: 'The * operator is executed, not printed.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Go!Go!Go!',
    explanation: 'In Python, multiplying a string by an integer `string * n` performs string repetition, duplicating the text `n` times in sequence.',
    hint: 'Think of "Go!" repeated 3 times with no spaces added.',
    misconception_tag: 'WRONG_TYPE',
    xp: 15,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_4_5',
    unit: 'unit_01',
    lesson: '1.4',
    section: '2. String variables',
    concept: 'write_greeting_generator',
    learning_objective: 'Create string variables and print a greeting combining them.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'Create two variables:\n1. `greeting = "Hello"`\n2. `target = "World"`\n\nThen print them combined with a comma and space: `Hello, World!`',
    starter_code: '# Create the variables and print the combined greeting\n',
    solution_code: 'greeting = "Hello"\ntarget = "World"\nprint(greeting + ", " + target + "!")',
    expected_output: 'Hello, World!',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Outputs exactly "Hello, World!"',
        expectedOutput: 'Hello, World!',
        assertionPython: "assert _raw_stdout.strip() == 'Hello, World!'"
      },
      {
        id: 'tc_2',
        description: 'Variables greeting and target exist',
        expectedOutput: 'Hello, World!',
        assertionPython: "assert _user_namespace.get('greeting') == 'Hello' and _user_namespace.get('target') == 'World'"
      }
    ],
    explanation: 'We create the two string variables, concatenate them with `", "` and `"!"`, and print the result.',
    hint: 'greeting = "Hello"\ntarget = "World"\nprint(greeting + ", " + target + "!")',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_4_6',
    unit: 'unit_01',
    lesson: '1.4',
    section: '3. Concatenation',
    concept: 'debug_string_concatenation_error',
    learning_objective: 'Debug a TypeError when combining a string with an integer score.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the bug in the program below. It crashes with `TypeError: can only concatenate str (not "int") to str`. Fix it by converting `score` to a string using `str(score)` or using a comma in `print()`.',
    starter_code: 'score = 100\nprint("Your score is: " + score)',
    solution_code: 'score = 100\nprint("Your score is: " + str(score))',
    expected_output: 'Your score is: 100',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Successfully prints "Your score is: 100" without TypeError',
        expectedOutput: 'Your score is: 100',
        assertionPython: "assert 'Your score is: 100' in _raw_stdout.strip()"
      }
    ],
    progressive_hints: [
      'You cannot use + directly between a string and an integer.',
      'Convert the integer to text using str(score): print("Your score is: " + str(score)).',
      'Alternatively, use a comma: print("Your score is:", score).'
    ],
    explanation: 'To combine numbers and strings with `+`, you must convert the number with `str(score)`. Alternatively, `print("Your score is:", score)` passes them as two arguments.',
    hint: 'Wrap score with str(score) or replace + with a comma.',
    misconception_tag: 'STRING_VS_NUMBER',
    xp: 20,
    estimated_time: 60,
    order: 6
  },
  {
    id: 'py_fnd_4_7',
    unit: 'unit_01',
    lesson: '1.4',
    section: '1. String literals',
    concept: 'reason_variable_vs_literal',
    learning_objective: 'Explain the critical difference between print(name) and print("name").',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following code:\n```python\nname = "Maya"\nprint("name")\n```\nWhat is printed and why?',
    options: [
      { id: 'opt_1', text: 'name, because "name" is in quotes so Python treats it as literal text rather than the variable', isCorrect: true, explanation: 'Anything inside quotation marks is treated as literal characters, not a variable identifier.' },
      { id: 'opt_2', text: 'Maya, because Python knows name is a variable holding Maya', isCorrect: false, explanation: 'Quotation marks disable variable lookup. Python prints the literal word "name".', misconception_tag: 'VARIABLE_VALUE_CONFUSION' },
      { id: 'opt_3', text: 'Error: Duplicate name', isCorrect: false, explanation: 'This is completely valid syntax.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: 'Maya Maya', isCorrect: false, explanation: 'Only the single argument is evaluated and printed.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' }
    ],
    correct_answer: 'name, because "name" is in quotes so Python treats it as literal text rather than the variable',
    explanation: 'Quotation marks define a string literal. `print("name")` prints the four letters n-a-m-e. To print the contents of the variable, write `print(name)` without quotes.',
    hint: 'Quotes tell Python: treat this literally as text, do not search for a variable.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 15,
    estimated_time: 45,
    order: 7
  },
  {
    id: 'py_fnd_4_8',
    unit: 'unit_01',
    lesson: '1.4',
    section: '5. String output',
    concept: 'apply_receipt_formatter',
    learning_objective: 'Apply string concatenation to format an itemized receipt line.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'You are writing the receipt printer for a coffee shop. Write a program that:\n1. Sets `item = "Coffee"`\n2. Sets `price = "3.50"`\n3. Prints: `Item: Coffee | Price: $3.50`',
    starter_code: '# Format the receipt line\n',
    solution_code: 'item = "Coffee"\nprice = "3.50"\nprint("Item: " + item + " | Price: $" + price)',
    expected_output: 'Item: Coffee | Price: $3.50',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints formatted receipt line',
        expectedOutput: 'Item: Coffee | Price: $3.50',
        assertionPython: "assert _raw_stdout.strip() == 'Item: Coffee | Price: $3.50'"
      }
    ],
    explanation: 'Concatenating `"Item: "` with `item`, `" | Price: $"`, and `price` constructs the complete formatted line.',
    hint: 'print("Item: " + item + " | Price: $" + price)',
    xp: 25,
    estimated_time: 75,
    order: 8
  },
  {
    id: 'py_fnd_4_9',
    unit: 'unit_01',
    lesson: '1.4',
    section: '3. Concatenation',
    concept: 'trace_string_builder',
    learning_objective: 'Trace a string accumulator growing through consecutive concatenations.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `msg` line by line:\n```python\nmsg = "A"\nmsg = msg + "B"\nmsg = msg + "C"\n```\nWhat is the value of `msg` after each line?',
    trace_steps: [
      { step: 1, line: 1, code: 'msg = "A"', variable: 'Value of msg', expectedValue: 'A', hint: 'Initial character' },
      { step: 2, line: 2, code: 'msg = msg + "B"', variable: 'Value of msg', expectedValue: 'AB', hint: 'Appends B' },
      { step: 3, line: 3, code: 'msg = msg + "C"', variable: 'Value of msg', expectedValue: 'ABC', hint: 'Appends C' }
    ],
    explanation: 'Each line appends another character to the existing string and saves the new string back into `msg`.',
    hint: 'Concatenation attaches each new string to the right end of the previous string.',
    xp: 20,
    estimated_time: 60,
    order: 9
  },
  {
    id: 'py_fnd_4_10',
    unit: 'unit_01',
    lesson: '1.4',
    section: '1. String literals',
    concept: 'debug_embedded_apostrophe',
    learning_objective: 'Debug an unescaped apostrophe inside single quotes by switching to double quotes.',
    difficulty: 'easy',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the syntax error in the code below. The apostrophe in `It\'s` prematurely closes the single-quoted string!',
    starter_code: "print('It's a great day')",
    solution_code: 'print("It\'s a great day")',
    expected_output: "It's a great day",
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints "It\'s a great day" cleanly without SyntaxError',
        expectedOutput: "It's a great day",
        assertionPython: "assert _raw_stdout.strip() == \"It's a great day\""
      }
    ],
    progressive_hints: [
      'Look at the apostrophe in It\'s. Because the string opened with a single quote \', Python thinks the string ends right after It!',
      'When your string contains a single quote or apostrophe, enclose the entire string in double quotes: "...".',
      'Change the outer quotes to double quotes: print("It\'s a great day")'
    ],
    explanation: 'If a string contains an apostrophe, wrap the string in double quotes `"It\'s a great day"`, or escape the apostrophe with `\\\'`.',
    hint: 'Use double quotes on the outside so the inner apostrophe does not close the string.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_04: LessonStructure = {
  id: '1.4',
  unitId: 'unit_01',
  unitTitle: 'Unit 1: Python Foundations',
  title: 'Strings',
  slug: 'strings',
  order: 4,
  description: 'Master string literals, concatenation, repetition, and the critical TypeError pitfalls of combining text with numbers.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. String literals',
    '2. String variables',
    '3. Concatenation',
    '4. Repetition',
    '5. String output'
  ],
  questions: LESSON_04_QUESTIONS
};
