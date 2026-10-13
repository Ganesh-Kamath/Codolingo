import { QuestionMetadata, LessonStructure } from '../../../types/question';

export const LESSON_09_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_9_1',
    unit: 'unit_05',
    lesson: '5.1',
    section: '2. if/else',
    concept: 'predict_if_else_branch',
    learning_objective: 'Predict which branch executes when the if condition evaluates to False.',
    difficulty: 'easy',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'Look at the following code:\n```python\nage = 18\nif age > 18:\n    print("A")\nelse:\n    print("B")\n```\nWhat will this program print?',
    codeSnippet: 'age = 18\nif age > 18:\n    print("A")\nelse:\n    print("B")',
    expected_output: 'B',
    options: [
      { id: 'opt_1', text: 'B', isCorrect: true, explanation: '18 > 18 is False (18 is not strictly greater than 18). Because the if condition is False, Python executes the else block.' },
      { id: 'opt_2', text: 'A', isCorrect: false, explanation: '18 is equal to 18, so age > 18 evaluates to False, skipping the if block.', misconception_tag: 'CONDITION_BOUNDARY' },
      { id: 'opt_3', text: 'Both A and B', isCorrect: false, explanation: 'if and else are mutually exclusive. Exactly one branch runs.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'Nothing', isCorrect: false, explanation: 'The else branch always catches cases where the condition is False.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' }
    ],
    correct_answer: 'B',
    explanation: '`18 > 18` is `False`. When an `if` condition is False, Python skips the indented `if` block and jumps straight to the `else` block, printing `"B"`.',
    hint: 'Is 18 greater than 18? If not, Python runs the else block.',
    mental_model: 'if/else is a fork in the road: the signpost says "age > 18". If True, take path A; if False, take path B.',
    relevant_line: 'if age > 18:',
    misconception_tag: 'CONDITION_BOUNDARY',
    repair_concept: 'if_else_branching',
    xp: 15,
    estimated_time: 45,
    order: 1
  },
  {
    id: 'py_fnd_9_2',
    unit: 'unit_05',
    lesson: '5.1',
    section: '3. elif',
    concept: 'predict_elif_short_circuit',
    learning_objective: 'Understand that elif stops checking conditions once the first match is found.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nscore = 85\nif score >= 80:\n    print("Silver")\nelif score >= 70:\n    print("Bronze")\nelse:\n    print("Try Again")\n```',
    codeSnippet: 'score = 85\nif score >= 80:\n    print("Silver")\nelif score >= 70:\n    print("Bronze")\nelse:\n    print("Try Again")',
    expected_output: 'Silver',
    options: [
      { id: 'opt_1', text: 'Silver', isCorrect: true, explanation: 'Because score >= 80 is True, "Silver" is printed and Python exits the entire if-elif-else chain immediately.' },
      { id: 'opt_2', text: 'Silver and Bronze', isCorrect: false, explanation: 'In an if/elif chain, once a branch succeeds, Python skips all subsequent elif and else branches.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: 'Bronze', isCorrect: false, explanation: 'The first branch (score >= 80) already matched, so elif is not evaluated.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'Try Again', isCorrect: false, explanation: 'else only runs if all preceding if and elif conditions fail.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' }
    ],
    correct_answer: 'Silver',
    explanation: 'In Python, `elif` chains evaluate top-to-bottom and stop at the very first True condition. Since `85 >= 80` is True, `"Silver"` prints, and the rest of the chain is skipped.',
    hint: 'Only the first matching branch in an if-elif-else chain will execute.',
    mental_model: 'An if-elif-else chain is like a staircase with a trap door: as soon as you step on a True stair, you fall through to the end of the chain.',
    relevant_line: 'if score >= 80:',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 2
  },
  {
    id: 'py_fnd_9_3',
    unit: 'unit_05',
    lesson: '5.1',
    section: '3. elif',
    concept: 'complete_elif_syntax',
    learning_objective: 'Complete an elif clause with proper keyword and colon syntax.',
    difficulty: 'easy',
    question_type: 'CODE_COMPLETION',
    prompt: 'Complete the statement to test an alternative condition in Python:\n```python\nspeed = 45\nif speed > 60:\n    print("Fast")\n____ speed > 30:\n    print("Normal")\nelse:\n    print("Slow")\n```',
    codeSnippet: 'speed = 45\nif speed > 60:\n    print("Fast")\n____ speed > 30:\n    print("Normal")\nelse:\n    print("Slow")',
    accepted_answers: ['elif'],
    correct_answer: 'elif',
    explanation: '`elif` (short for "else if") is the Python keyword for testing another condition when the previous `if` was False.',
    hint: 'Python combines "else if" into a 4-letter keyword: elif',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 15,
    estimated_time: 30,
    order: 3
  },
  {
    id: 'py_fnd_9_4',
    unit: 'unit_05',
    lesson: '5.1',
    section: '1. Basic if',
    concept: 'reason_indentation_block',
    learning_objective: 'Explain why indentation defines code blocks in Python.',
    difficulty: 'medium',
    question_type: 'TRUE_FALSE_WITH_REASONING',
    prompt: 'Look at the following code:\n```python\nif True:\nprint("Hello")\n```\nWhy does Python raise `IndentationError: expected an indented block`?',
    options: [
      { id: 'opt_1', text: 'Python uses indentation (whitespace) instead of curly braces {} to define which code belongs inside a block', isCorrect: true, explanation: 'Every statement controlled by an if, elif, else, or loop must be indented (typically by 4 spaces).' },
      { id: 'opt_2', text: 'True cannot be used in an if condition', isCorrect: false, explanation: 'if True: is completely valid.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: 'The colon is in the wrong position', isCorrect: false, explanation: 'The colon is placed correctly after the condition.', misconception_tag: 'SYNTAX_ERROR' },
      { id: 'opt_4', text: 'Python requires parentheses around the condition', isCorrect: false, explanation: 'Parentheses around if conditions are optional in Python.', misconception_tag: 'SYNTAX_ERROR' }
    ],
    correct_answer: 'Python uses indentation (whitespace) instead of curly braces {} to define which code belongs inside a block',
    explanation: 'Unlike languages that use `{}` braces, Python relies on consistent indentation (usually 4 spaces) to determine which statements belong inside an `if` block.',
    hint: 'Python uses whitespace indentation to know what code belongs to the if statement.',
    misconception_tag: 'INDENTATION_ERROR',
    xp: 15,
    estimated_time: 45,
    order: 4
  },
  {
    id: 'py_fnd_9_5',
    unit: 'unit_05',
    lesson: '5.1',
    section: '4. multiple conditions',
    concept: 'write_grade_classifier',
    learning_objective: 'Write an if-elif-else structure to classify an exam score into grade letters.',
    difficulty: 'medium',
    question_type: 'WRITE_CODE',
    prompt: 'Write a Python program that classifies an exam score:\n1. Set `score = 85`\n2. If `score >= 90`, print `"A"`\n3. Elif `score >= 80`, print `"B"`\n4. Else, print `"C"`',
    starter_code: '# Classify the exam score\n',
    solution_code: 'score = 85\nif score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")',
    expected_output: 'B',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Correctly outputs B for score of 85',
        expectedOutput: 'B',
        assertionPython: "assert _raw_stdout.strip() == 'B'"
      },
      {
        id: 'tc_2',
        description: 'Uses if, elif, and else keywords',
        expectedOutput: 'B',
        assertionPython: "assert 'if ' in _user_code and 'elif ' in _user_code and 'else:' in _user_code",
        hidden: true
      }
    ],
    explanation: 'The code checks `score >= 90` (False), then checks `score >= 80` (True), executing `print("B")`.',
    hint: 'if score >= 90:\n    print("A")\nelif score >= 80:\n    print("B")\nelse:\n    print("C")',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 25,
    estimated_time: 75,
    order: 5
  },
  {
    id: 'py_fnd_9_6',
    unit: 'unit_05',
    lesson: '5.1',
    section: '1. Basic if',
    concept: 'debug_missing_colon_and_indent',
    learning_objective: 'Debug syntax and indentation errors in an if statement.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'Fix the two syntax bugs in the code below:\n1. An if statement must end with a colon `:`\n2. The statement inside the if block must be indented',
    starter_code: 'logged_in = True\nif logged_in\nprint("Welcome back!")',
    solution_code: 'logged_in = True\nif logged_in:\n    print("Welcome back!")',
    expected_output: 'Welcome back!',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Successfully prints "Welcome back!" with colon and 4-space indentation',
        expectedOutput: 'Welcome back!',
        assertionPython: "assert _raw_stdout.strip() == 'Welcome back!' and 'if logged_in:' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying syntax and output',
        expectedOutput: 'Welcome back!',
        assertionPython: "assert _raw_stdout.strip() == 'Welcome back!'",
        hidden: true
      }
    ],
    progressive_hints: [
      'Line 2 is missing a colon at the end: if logged_in:',
      'Line 3 must be indented by 4 spaces under the if statement.',
      'Change line 2 to if logged_in: and indent line 3 with 4 spaces:     print("Welcome back!")'
    ],
    explanation: 'Every `if` condition must end with a colon `:`. The code block that executes when the condition is True must be indented by spaces.',
    hint: 'Add : after logged_in and indent the print line.',
    misconception_tag: 'SYNTAX_ERROR',
    xp: 20,
    estimated_time: 45,
    order: 6
  },
  {
    id: 'py_fnd_9_7',
    unit: 'unit_05',
    lesson: '5.1',
    section: '4. multiple conditions',
    concept: 'trace_branch_path',
    learning_objective: 'Trace which specific branch executes based on input variable values.',
    difficulty: 'medium',
    question_type: 'TRACE_CODE',
    prompt: 'Trace the path executed for this program:\n```python\nx = 15\nif x < 10:\n    res = "Small"\nelif x < 20:\n    res = "Medium"\nelse:\n    res = "Large"\n```\nWhat is `res` after each evaluation line?',
    trace_steps: [
      { step: 1, line: 2, code: 'if x < 10:', variable: 'Condition 1 (x < 10)', expectedValue: 'False', hint: '15 is not < 10' },
      { step: 2, line: 4, code: 'elif x < 20:', variable: 'Condition 2 (x < 20)', expectedValue: 'True', hint: '15 is < 20!' },
      { step: 3, line: 5, code: 'res = "Medium"', variable: 'Final value of res', expectedValue: 'Medium', hint: 'This branch runs' }
    ],
    explanation: '`x < 10` is False, so Python tests `elif x < 20`, which is True. Therefore `res` becomes `"Medium"`. The `else` block is skipped.',
    hint: 'Evaluate each condition in order.',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 60,
    order: 7
  },
  {
    id: 'py_fnd_9_8',
    unit: 'unit_05',
    lesson: '5.1',
    section: '2. if/else',
    concept: 'apply_cinema_admission',
    learning_objective: 'Apply if/else logic to gate cinema admission by age.',
    difficulty: 'medium',
    question_type: 'APPLY',
    prompt: 'You are writing the door check for a cinema. A customer can enter only if their age is at least 18.\nWrite a program that:\n1. Sets `age = 17`\n2. If `age >= 18`, prints `"Allowed"`\n3. Else, prints `"Denied"`',
    starter_code: '# Check cinema age requirement\n',
    solution_code: 'age = 17\nif age >= 18:\n    print("Allowed")\nelse:\n    print("Denied")',
    expected_output: 'Denied',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Outputs Denied for age of 17',
        expectedOutput: 'Denied',
        assertionPython: "assert _raw_stdout.strip() == 'Denied'"
      },
      {
        id: 'tc_2',
        description: 'Uses if/else conditional check',
        expectedOutput: 'Denied',
        assertionPython: "assert 'if ' in _user_code and 'else:' in _user_code",
        hidden: true
      }
    ],
    explanation: '`17 >= 18` is False, so the program routes directly to the `else` block and prints `"Denied"`.',
    hint: 'if age >= 18:\n    print("Allowed")\nelse:\n    print("Denied")',
    misconception_tag: 'CONDITION_BOUNDARY',
    xp: 25,
    estimated_time: 60,
    order: 8
  },
  {
    id: 'py_fnd_9_9',
    unit: 'unit_05',
    lesson: '5.1',
    section: '4. multiple conditions',
    concept: 'debug_multiple_ifs_vs_elif',
    learning_objective: 'Debug an issue where multiple separate if statements execute instead of an elif chain.',
    difficulty: 'medium',
    question_type: 'DEBUG_CODE',
    prompt: 'A temperature app should print ONLY ONE message. But currently, when `temp = 25`, it prints both `Warm` and `Normal` because it used two separate `if` statements instead of `elif`! Fix line 4 to use `elif`.',
    starter_code: 'temp = 25\nif temp >= 20:\n    print("Warm")\nif temp >= 10:\n    print("Normal")',
    solution_code: 'temp = 25\nif temp >= 20:\n    print("Warm")\nelif temp >= 10:\n    print("Normal")',
    expected_output: 'Warm',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Prints only "Warm" using elif on line 4',
        expectedOutput: 'Warm',
        assertionPython: "assert _raw_stdout.strip() == 'Warm' and 'elif temp >= 10:' in _user_code"
      },
      {
        id: 'tc_2',
        description: 'Hidden test verifying elif prevents dual prints',
        expectedOutput: 'Warm',
        assertionPython: "assert 'Normal' not in _raw_stdout and _raw_stdout.strip() == 'Warm'",
        hidden: true
      }
    ],
    progressive_hints: [
      'Two separate if statements are completely independent; both can run if both conditions are True.',
      'To make them part of the same mutually exclusive chain, replace the second if with elif.',
      'Change line 4 to: elif temp >= 10:'
    ],
    explanation: 'Using separate `if` statements means both conditions are evaluated independently. Using `elif` links them so only the first matching branch runs.',
    hint: 'Change the second if to elif.',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 9
  },
  {
    id: 'py_fnd_9_10',
    unit: 'unit_05',
    lesson: '5.1',
    section: '5. nesting only where appropriate',
    concept: 'predict_nested_conditionals',
    learning_objective: 'Predict execution of a nested if condition.',
    difficulty: 'medium',
    question_type: 'PREDICT_OUTPUT',
    prompt: 'What will this program print?\n```python\nis_weekend = True\nis_sunny = False\nif is_weekend:\n    if is_sunny:\n        print("Beach")\n    else:\n        print("Movies")\nelse:\n    print("Work")\n```',
    codeSnippet: 'is_weekend = True\nis_sunny = False\nif is_weekend:\n    if is_sunny:\n        print("Beach")\n    else:\n        print("Movies")\nelse:\n    print("Work")',
    expected_output: 'Movies',
    options: [
      { id: 'opt_1', text: 'Movies', isCorrect: true, explanation: 'is_weekend is True, entering the outer block. Inside, is_sunny is False, which triggers the inner else block, printing "Movies".' },
      { id: 'opt_2', text: 'Beach', isCorrect: false, explanation: 'is_sunny is False, so the inner if does not run.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_3', text: 'Work', isCorrect: false, explanation: 'The outer else is skipped because is_weekend is True.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' },
      { id: 'opt_4', text: 'Movies\nWork', isCorrect: false, explanation: 'The outer else block will not execute.', misconception_tag: 'BOOLEAN_LOGIC_CONFUSION' }
    ],
    correct_answer: 'Movies',
    explanation: 'The outer condition `is_weekend` is `True`, stepping into the nested block. The nested condition `is_sunny` is `False`, taking the inner `else` branch and printing `"Movies"`.',
    hint: 'Step into the first if because is_weekend is True. Then check is_sunny.',
    mental_model: 'Nested ifs are like rooms within rooms: you only check the inner door if you entered the outer room.',
    relevant_line: 'if is_sunny:',
    misconception_tag: 'BOOLEAN_LOGIC_CONFUSION',
    xp: 20,
    estimated_time: 45,
    order: 10
  }
];

export const LESSON_09: LessonStructure = {
  id: '5.1',
  unitId: 'unit_05',
  unitTitle: 'Unit 5: Conditional Logic',
  title: 'The if Statement',
  slug: 'the-if-statement',
  order: 1,
  description: 'Master branch decision making, mutally exclusive elif chains, and clean indentation structure.',
  estimatedMinutes: 10,
  xpReward: 30,
  sections: [
    '1. Basic if',
    '2. if/else',
    '3. elif',
    '4. multiple conditions',
    '5. nesting only where appropriate'
  ],
  questions: LESSON_09_QUESTIONS
};
