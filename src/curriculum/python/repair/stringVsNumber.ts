import { ConceptRepairDrill } from './types';

export const stringVsNumberDrill: ConceptRepairDrill = {
  tag: 'STRING_VS_NUMBER',
  friendlyTitle: 'Combining Strings and Numbers',
  description: 'In Python, + adds numbers or joins strings, but mixing a string with an integer throws a TypeError.',
  category: 'Types & Input',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing TypeError when mixing text and integers with +',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'What happens when this Python code runs?\n```python\nage = 25\nprint("Age: " + age)\n```',
      codeSnippet: 'age = 25\nprint("Age: " + age)',
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'Prints "Age: 25"', isCorrect: false, explanation: 'Unlike JavaScript, Python does not automatically coerce integers to strings when using +.' },
        { id: 'opt_2', text: 'Raises a TypeError: can only concatenate str to str', isCorrect: true, explanation: 'Python is strongly typed and refuses to add a string and integer without explicit conversion.' },
        { id: 'opt_3', text: 'Prints "Age: "', isCorrect: false, explanation: 'The program crashes before printing because the expression fails evaluation.' }
      ],
      progressiveHints: [
        'Examine the types being combined on line 2: `"Age: "` is a str, `age` is an int.',
        'Python requires both sides of + to be the same general type.',
        'A TypeError occurs because Python will not guess how to convert the number.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Strongly typed operator resolution',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which of the following is the standard way to combine text and a number in Python without an error?',
      explanationText: 'In Python, the `+` operator has two distinct meanings: math addition for numbers, and text joining for strings. When Python sees a string plus an integer, it halts with a TypeError rather than guessing your intent. You must explicitly convert numbers using `str()` or format them.',
      diagram: `"Score: " + 10       --> 💥 TypeError (string + integer not allowed)
"Score: " + str(10)  --> "Score: 10" (string + string works!)`,
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'print("Score: " + str(points))', isCorrect: true, explanation: 'str(points) converts the integer to a string, allowing valid concatenation.' },
        { id: 'opt_2', text: 'print("Score: " ++ points)', isCorrect: false, explanation: 'Python does not have a ++ concatenation operator.' },
        { id: 'opt_3', text: 'print("Score: " + (int)points)', isCorrect: false, explanation: 'C-style casting (int) is invalid Python syntax.' }
      ],
      progressiveHints: [
        'Think about which function converts a value into a string.',
        'Use str(...) to turn numbers into text.',
        'print("Score: " + str(points)) converts points first.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Converting integer to string with str() before concatenation',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so the code prints `"Level: 5"` without raising a TypeError:',
      starterCode: learnerSnippet || 'level = 5\nprint("Level: " + level)',
      referenceSolution: 'level = 5\nprint("Level: " + str(level))',
      testCases: [
        { id: 't1', description: 'Outputs Level: 5', expectedOutput: 'Level: 5' },
        { id: 't2', description: 'Uses str() conversion or valid output', assertionPython: 'assert "Level: 5" in __output__' }
      ],
      progressiveHints: [
        'Look at line 2: `level` is an int, but `"Level: "` is a str.',
        'Wrap `level` inside `str(level)`.',
        'Change line 2 to: `print("Level: " + str(level))`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Building a dynamic string message from variables',
      questionType: 'WRITE_CODE',
      prompt: 'Create a variable `items = 3`. Print `"Items remaining: "` joined with `items` converted to a string using `str()`.',
      starterCode: '# Define items and print message:\n',
      referenceSolution: 'items = 3\nprint("Items remaining: " + str(items))',
      testCases: [
        { id: 't1', description: 'Outputs Items remaining: 3', expectedOutput: 'Items remaining: 3' },
        { id: 't2', description: 'items variable set to 3', assertionPython: 'assert items == 3' }
      ],
      progressiveHints: [
        'Set `items = 3`.',
        'Use `str(items)` to convert the integer to text.',
        'Write:\nitems = 3\nprint("Items remaining: " + str(items))'
      ]
    }
  ]
};
