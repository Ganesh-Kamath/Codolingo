import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_05_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_5_1',
    unit: 'unit_04',
    lesson: '4.1',
    section: '2. Input as text',
    concept: 'input_return_type',
    learning_objective: 'Recognize that the input() function always returns a string.',
    difficulty: 'easy',
    question_type: 'MULTIPLE_CHOICE',
    prompt: 'When a user types the number `25` into `input()`, what data type does Python return?',
    options: [
      { id: 'opt_1', text: 'A string (str): "25"', isCorrect: true, explanation: 'input() ALWAYS returns whatever the user typed as a string of characters, even if it consists only of digits.' },
      { id: 'opt_2', text: 'An integer (int): 25', isCorrect: false, explanation: 'Python never converts input to numbers automatically. It remains text until you explicitly convert it.', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_3', text: 'A float: 25.0', isCorrect: false, explanation: 'input() does not produce floats automatically.', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_4', text: 'A boolean: True', isCorrect: false, explanation: 'input() returns user text, not a boolean.', misconception_tag: 'WRONG_TYPE' }
    ],
    correct_answer: 'A string (str): "25"',
    explanation: 'The `input()` function always reads raw text from the keyboard and returns it as a string (`str`). Even if the user types digits like 25, Python stores `"25"`.',
    hint: 'Think about keystrokes: the keyboard produces text characters.',
    misconception_tag: 'INPUT_IS_STRING',
    xp: 15,
    estimated_time: 30,
    order: 1
  },
  {
    id: 'py_fnd_5_2',
    unit: 'unit_04',
    lesson: '4.1',
    section: '2. Input as text',
    concept: 'predict_string_addition_confusion',
    learning_objective: 'Predict output when two string numbers are added with +.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Suppose a program receives `"5"` from input for `a` and `"2"` for `b`:\n```python\na = "5"\nb = "2"\nprint(a + b)\n```\nWhat will this print?',
    codeSnippet: 'a = "5"\nb = "2"\nprint(a + b)',
    expected_output: '52',
    options: [
      { id: 'opt_1', text: '52', isCorrect: true, explanation: 'Because a and b are strings, the + operator concatenates them into "52", rather than adding 5 + 2.' },
      { id: 'opt_2', text: '7', isCorrect: false, explanation: 'Mathematical addition only happens if the values are converted to integers first! Here they are strings.', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_3', text: 'Error', isCorrect: false, explanation: 'Adding two strings together is completely valid concatenation in Python.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: '"7"', isCorrect: false, explanation: 'Python does not inspect the string digits to do math without an int() conversion.', misconception_tag: 'INPUT_IS_STRING' }
    ],
    correct_answer: '52',
    explanation: '`"5" + "2"` produces `"52"` because `+` on two strings joins them end-to-end. To get 7, you must convert them with `int(a) + int(b)`.',
    hint: 'Notice the quotes around "5" and "2". + glues strings together.',
    mental_model: 'When Python sees quotes, it sees words. "5" + "2" is treated just like "cat" + "dog" -> "catdog" -> "52".',
    relevant_line: 'print(a + b)',
    misconception_tag: 'INPUT_IS_STRING',
    repair_concept: 'input_string_conversion',
    xp: 20,
    estimated_time: 45,
    order: 2
  },
  {
    id: 'py_fnd_5_3',
    unit: 'unit_04',
    lesson: '4.1',
    section: '1. input()',
    concept: 'input_function_syntax',
    learning_objective: 'Complete the statement to prompt the user for input.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to prompt the user with `"Enter name: "`:\n```python\nuser_name = ____("Enter name: ")\nprint("Welcome, " + user_name)\n```',
    codeSnippet: 'user_name = ____("Enter name: ")\nprint("Welcome, " + user_name)',
    accepted_answers: ['input'],
    correct_answer: 'input',
    explanation: '`input()` is the built-in Python function that displays a prompt string and pauses execution until the user presses Enter.',
    hint: 'The function name is lowercase: input',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_5_4',
    unit: 'unit_04',
    lesson: '4.1',
    section: '5. Converting input',
    concept: 'reason_input_arithmetic_failure',
    learning_objective: 'Explain why adding a number directly to input() causes an error.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following code:\n```python\nage = input("Enter age: ")\nnext_year = age + 1\n```\nWhy does line 2 crash when the user enters `18`?',
    options: [
      { id: 'opt_1', text: 'age contains a string ("18"), and Python cannot add an integer (1) to a string with +', isCorrect: true, explanation: 'input() returns a string. Trying to do "18" + 1 raises TypeError: can only concatenate str to str.' },
      { id: 'opt_2', text: 'Variables created by input() cannot be used in math expressions', isCorrect: false, explanation: 'They can be used once converted using int(age).', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_3', text: 'next_year is a reserved keyword in Python', isCorrect: false, explanation: 'next_year is a completely valid identifier name.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: 'The user must type the number spelled out in words like "eighteen"', isCorrect: false, explanation: 'Spelling it out would still result in a string.', misconception_tag: 'INPUT_IS_STRING' }
    ],
    correct_answer: 'age contains a string ("18"), and Python cannot add an integer (1) to a string with +',
    explanation: 'Because `input()` returns a string, `age` is `"18"`. Writing `"18" + 1` tries to add a string and integer, triggering a `TypeError`. You must convert with `int(age) + 1`.',
    hint: 'input() returns text. You cannot add 1 to text without converting it first.',
    misconception_tag: 'INPUT_IS_STRING',
    xp: 20,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_5_5',
    unit: 'unit_04',
    lesson: '4.1',
    section: '4. Printing input',
    concept: 'write_greeting_program',
    learning_objective: 'Write a program that takes a variable, stores simulated input, and formats an output greeting.',
    difficulty: 'easy',
    question_type: 'WRITE_CODE',
    prompt: 'Write a Python program that:\n1. Creates a variable `city` set to `"Tokyo"`\n2. Prints: `Destination: Tokyo`',
    starter_code: '# Print the destination\n',
    solution_code: 'city = "Tokyo"\nprint("Destination: " + city)',
    expected_output: 'Destination: Tokyo',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Outputs exactly "Destination: Tokyo"',
        expectedOutput: 'Destination: Tokyo',
        assertionPython: "assert _raw_stdout.strip() == 'Destination: Tokyo'"
      },
      {
        id: 'tc_2',
        description: 'Variable city equals Tokyo',
        expectedOutput: 'Destination: Tokyo',
        assertionPython: "assert _user_namespace.get('city') == 'Tokyo'",
        hidden: true
      }
    ],
    explanation: 'Setting `city = "Tokyo"` and printing `"Destination: " + city` combines the label with the variable.',
    hint: 'city = "Tokyo"\nprint("Destination: " + city)',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 5
  },
  {
    id: 'py_fnd_5_6',
    unit: 'unit_04',
    lesson: '4.1',
    section: '5. Converting input',
    concept: 'debug_string_concatenation_in_math',
    learning_objective: 'Debug string concatenation when mathematical addition was intended.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A developer wanted to add two numbers from input. But when `num1 = "10"` and `num2 = "20"`, the code below prints `1020` instead of `30`! Fix it using `int()`.',
    starter_code: 'num1 = "10"\nnum2 = "20"\ntotal = num1 + num2\nprint(total)',
    solution_code: 'num1 = "10"\nnum2 = "20"\ntotal = int(num1) + int(num2)\nprint(total)',
    expected_output: '30',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints mathematical sum 30 using int() conversion',
        expectedOutput: '30',
        assertionPython: "assert _raw_stdout.strip() == '30' and 'int(' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying int conversion and sum',
        expectedOutput: '30',
        assertionPython: "assert _user_namespace.get('total') == 30 and _raw_stdout.strip() == '30'",
        hidden: true
      }
    ],
    progressive_hints: [
      'num1 and num2 are currently strings ("10" and "20"). "10" + "20" evaluates to "1020".',
      'Wrap each string in int() to convert them to numbers: int(num1) + int(num2).',
      'Update line 3: total = int(num1) + int(num2)'
    ],
    explanation: 'Converting both operands with `int(num1) + int(num2)` converts `"10"` and `"20"` to numbers `10` and `20`, so Python computes `30` instead of `"1020"`.',
    hint: 'Use int(num1) + int(num2)',
    misconception_tag: 'INPUT_IS_STRING',
    xp: 20,
    estimated_time: 60,
    order: 6
  },
  {
    id: 'py_fnd_5_7',
    unit: 'unit_04',
    lesson: '4.1',
    section: '3. Storing input',
    concept: 'trace_input_variable',
    learning_objective: 'Trace variable updates during input processing.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the value of variable `label` step by step:\n```python\nraw = "Guest"\nlabel = "User: "\nlabel = label + raw\n```\nWhat is the value of `label` after each line?',
    trace_steps: [
      { step: 1, line: 1, code: 'raw = "Guest"', variable: 'Value of label', expectedValue: 'None', hint: 'label does not exist yet' },
      { step: 2, line: 2, code: 'label = "User: "', variable: 'Value of label', expectedValue: 'User: ', hint: 'Initial prefix' },
      { step: 3, line: 3, code: 'label = label + raw', variable: 'Value of label', expectedValue: 'User: Guest', hint: 'Concatenates "User: " with "Guest"' }
    ],
    explanation: 'Line 2 creates `label` with `"User: "`. Line 3 appends `"Guest"` to produce `"User: Guest"`.',
    hint: 'Concatenate the prefix with the name stored in raw.',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_5_8',
    unit: 'unit_04',
    lesson: '4.1',
    section: '4. Printing input',
    concept: 'apply_profile_card',
    learning_objective: 'Apply input variable formatting to print a multi-line user badge.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'Write a program that takes two variables:\n1. `name = "Maya"`\n2. `role = "Engineer"`\n\nAnd prints:\n```text\n--- BADGE ---\nName: Maya\nRole: Engineer\n```',
    starter_code: '# Print the badge\n',
    solution_code: 'name = "Maya"\nrole = "Engineer"\nprint("--- BADGE ---")\nprint("Name: " + name)\nprint("Role: " + role)',
    expected_output: '--- BADGE ---\nName: Maya\nRole: Engineer',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints all 3 badge lines accurately',
        expectedOutput: '--- BADGE ---\nName: Maya\nRole: Engineer',
        assertionPython: "assert '--- BADGE ---' in _raw_stdout and 'Name: Maya' in _raw_stdout and 'Role: Engineer' in _raw_stdout"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying name and role variables',
        expectedOutput: '--- BADGE ---\nName: Maya\nRole: Engineer',
        assertionPython: "assert _user_namespace.get('name') == 'Maya' and _user_namespace.get('role') == 'Engineer'",
        hidden: true
      }
    ],
    explanation: 'Using three print calls displays the header and the two formatted field lines.',
    hint: 'print("--- BADGE ---") then print("Name: " + name) then print("Role: " + role)',
    misconception_tag: 'INPUT_IS_STRING',
    xp: 25,
    estimated_time: 75,
    order: 8
  },
  {
    id: 'py_fnd_5_9',
    unit: 'unit_04',
    lesson: '4.1',
    section: '2. Input as text',
    concept: 'predict_type_of_input',
    learning_objective: 'Predict the type output of type(input_value).',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Suppose the user inputs the number `42`. What does this code print?\n```python\nval = "42"\nprint(type(val))\n```',
    codeSnippet: 'val = "42"\nprint(type(val))',
    expected_output: "<class 'str'>",
    options: [
      { id: 'opt_1', text: "<class 'str'>", isCorrect: true, explanation: 'Because val is in quotes, its type is str (string).' },
      { id: 'opt_2', text: "<class 'int'>", isCorrect: false, explanation: 'Digits enclosed in quotes are of type str, not int.', misconception_tag: 'INPUT_IS_STRING' },
      { id: 'opt_3', text: "<class 'number'>", isCorrect: false, explanation: 'Python has no type named "number"; it uses int or float.', misconception_tag: 'WRONG_TYPE' },
      { id: 'opt_4', text: '42', isCorrect: false, explanation: 'type() returns the type class, not the value itself.', misconception_tag: 'VARIABLE_VALUE_CONFUSION' }
    ],
    correct_answer: "<class 'str'>",
    explanation: '`type("42")` evaluates to `<class \'str\'>`. All user input without conversion is of type `str`.',
    hint: 'Anything in quotes is of type str.',
    misconception_tag: 'INPUT_IS_STRING',
    xp: 15,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_5_10',
    unit: 'unit_04',
    lesson: '4.1',
    section: '1. input()',
    concept: 'debug_missing_assignment',
    learning_objective: 'Debug input() when the result is not saved into a variable.',
    difficulty: 'easy',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the bug in the program below. The developer called `input()`, but forgot to save the result into the `username` variable before printing it!',
    starter_code: 'input("Your name: ")\nusername = "Guest"\nprint("Hello, " + username)',
    solution_code: 'username = input("Your name: ")\nprint("Hello, " + username)',
    expected_output: 'Hello, Alex',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Assigns input directly to username variable',
        input: 'Alex',
        expectedOutput: 'Hello, Alex',
        assertionPython: "assert 'username = input(' in _user_code or 'username=input(' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test with different input name',
        input: 'Jordan',
        expectedOutput: 'Hello, Jordan',
        assertionPython: "assert 'Hello, Jordan' in _raw_stdout and _user_namespace.get('username') == 'Jordan'",
        hidden: true
      }
    ],
    progressive_hints: [
      'input() returns a value, but you must capture it with variable = input(...).',
      'Currently username is hardcoded to "Guest" on line 2, throwing away the input.',
      'Assign username directly to the result of input: username = input("Your name: ")'
    ],
    explanation: 'To remember what the user typed, you must assign the return value of `input()` to a variable: `username = input("Your name: ")`.',
    hint: 'username = input("Your name: ")',
    misconception_tag: 'VARIABLE_VALUE_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_05: LessonStructure = {
  id: '4.1',
  unitId: 'unit_04',
  unitTitle: 'Unit 4: User Input and Output',
  title: 'The input() Function',
  slug: 'the-input-function',
  order: 1,
  description: 'Learn how to accept user input, understand why input() always returns text, and handle string arithmetic pitfalls.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. input()',
    '2. Input as text',
    '3. Storing input',
    '4. Printing input',
    '5. Converting input'
  ],
  questions: LESSON_05_QUESTIONS
};
