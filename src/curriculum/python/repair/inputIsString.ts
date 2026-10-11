import { ConceptRepairDrill } from './types';

export const inputIsStringDrill: ConceptRepairDrill = {
  tag: 'INPUT_IS_STRING',
  friendlyTitle: 'Remembering input() returns Text',
  description: 'In Python, input() always produces a string, even if the user typed digits. Wrap with int() or float() before math.',
  category: 'Types & Input',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing string repetition when expecting numeric arithmetic',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What will this Python code print?\n```python\nnum_text = "5"\nprint(num_text * 2)\n```',
      codeSnippet: 'num_text = "5"\nprint(num_text * 2)',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: '55', isCorrect: true, explanation: 'Because num_text is a string, * repeats the string twice rather than doing numeric math.' },
        { id: 'opt_2', text: '10', isCorrect: false, explanation: '10 would only be printed if num_text were converted to an integer with int().' },
        { id: 'opt_3', text: 'TypeError', isCorrect: false, explanation: 'Python permits string * integer, which performs text repetition.' }
      ],
      progressiveHints: [
        'Notice quotes around `"5"`: it is a string.',
        'Multiplying text by 2 repeats the characters.',
        '"5" repeated twice results in "55".'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Keystroke text vs Numeric value',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'How do you turn user input text into a number that you can do math with?',
      explanationText: 'The `input()` function reads raw keyboard input as characters, so typing 42 returns `"42"`. When Python calculates `"42" + 1`, it crashes; when it calculates `"42" * 2`, it repeats text into `"4242"`. Wrapping the input in `int(...)` parses the string into a genuine numeric integer.',
      diagram: `User types '5':  input()  --> "5" (string)
Math calculation: "5" * 2  --> "55" (repeated text)
With int():       int("5") * 2 --> 10 (arithmetic!)`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'input(int)', isCorrect: false, explanation: 'The argument to input() is only a prompt message.' },
        { id: 'opt_2', text: 'int(user_text)', isCorrect: true, explanation: 'int() parses text containing digits into a Python integer.' },
        { id: 'opt_3', text: 'number(user_text)', isCorrect: false, explanation: 'Python does not have a built-in number() function.' }
      ],
      progressiveHints: [
        'Which built-in Python function converts text to whole numbers?',
        'Use int() for whole numbers or float() for decimals.',
        'int(user_text) converts the string to an integer.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Converting string variable with int() before addition',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so that `score` becomes the number `15` instead of crashing:',
      starterCode: learnerSnippet || 'raw_input = "10"\nscore = raw_input + 5\nprint(score)',
      referenceSolution: 'raw_input = "10"\nscore = int(raw_input) + 5\nprint(score)',
      testCases: [
        { id: 't1', description: 'Outputs 15', expectedOutput: '15' },
        { id: 't2', description: 'Computes numerical sum', assertionPython: 'assert score == 15' }
      ],
      progressiveHints: [
        'Line 2 attempts `"10" + 5`, mixing a str and an int.',
        'Wrap `raw_input` inside `int(raw_input)` on line 2.',
        'Use: `score = int(raw_input) + 5`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Handling string numbers and computing scaled values',
      questionType: 'WRITE_CODE',
      prompt: 'Given `typed = "8"`, convert `typed` to an integer using `int()` and print its product with `3` (should output `24`).',
      starterCode: 'typed = "8"\n# Convert typed to int and print product with 3:\n',
      referenceSolution: 'typed = "8"\nprint(int(typed) * 3)',
      testCases: [
        { id: 't1', description: 'Outputs 24', expectedOutput: '24' },
        { id: 't2', description: 'Correct numeric calculation', assertionPython: 'assert int(typed) * 3 == 24' }
      ],
      progressiveHints: [
        'Use `int(typed)` to convert `"8"` to the number 8.',
        'Multiply by 3: `int(typed) * 3`.',
        'Write:\nprint(int(typed) * 3)'
      ]
    }
  ]
};
