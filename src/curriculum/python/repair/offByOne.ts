import { ConceptRepairDrill } from './types';

export const offByOneDrill: ConceptRepairDrill = {
  tag: 'OFF_BY_ONE',
  friendlyTitle: 'Off-by-One in Loops & range()',
  description: 'In Python, range(start, stop) excludes the stop value. range(1, 5) produces 1, 2, 3, 4 — not 5.',
  category: 'Loops & Iteration',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing that range(start, stop) excludes the stop argument',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What will this Python loop print?\n```python\nfor i in range(1, 5):\n    print(i, end=" ")\n```',
      codeSnippet: 'for i in range(1, 5):\n    print(i, end=" ")',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: '1 2 3 4 ', isCorrect: true, explanation: 'range(1, 5) stops before 5, yielding 1, 2, 3, 4.' },
        { id: 'opt_2', text: '1 2 3 4 5 ', isCorrect: false, explanation: 'In Python, the upper bound is exclusive. 5 is never reached.' },
        { id: 'opt_3', text: '0 1 2 3 4 ', isCorrect: false, explanation: 'The start argument is 1, so iteration begins at 1, not 0.' }
      ],
      progressiveHints: [
        'Look at the second number in range(1, 5).',
        'Python ranges run up to, but NOT including, the stop value.',
        'The loop produces: 1, 2, 3, 4.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Half-open interval [start, stop)',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'If you need a loop to execute for numbers 1 through 10 inclusive, which range expression is required?',
      explanationText: 'Python uses half-open intervals: [start, stop). That means the start is included, but stop is excluded. To include the number N at the end, the stop parameter must be N + 1.',
      diagram: `range(1, 5)  --> [1, 2, 3, 4]     (length: 5 - 1 = 4)
range(1, 6)  --> [1, 2, 3, 4, 5]  (includes 5!)`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'range(1, 10)', isCorrect: false, explanation: 'range(1, 10) stops at 9, leaving out 10.' },
        { id: 'opt_2', text: 'range(1, 11)', isCorrect: true, explanation: 'range(1, 11) runs through 1, 2, ..., 10 inclusive.' },
        { id: 'opt_3', text: 'range(0, 10)', isCorrect: false, explanation: 'This starts at 0 and stops at 9.' }
      ],
      progressiveHints: [
        'You want 10 to be included.',
        'Because stop is exclusive, provide 10 + 1.',
        'Use range(1, 11).'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Fixing upper bound in countdown loop',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix the range so this loop prints numbers 1 through 5 on separate lines:',
      starterCode: learnerSnippet || 'for num in range(1, 5):\n    print(num)',
      referenceSolution: 'for num in range(1, 6):\n    print(num)',
      testCases: [
        { id: 't1', description: 'Outputs 1 through 5', expectedOutput: '1\n2\n3\n4\n5' },
        { id: 't2', description: 'Proper stop value', assertionPython: 'assert list(range(1, 6)) == [1, 2, 3, 4, 5]' }
      ],
      progressiveHints: [
        'Notice range(1, 5) only goes up to 4.',
        'Change 5 to 6 so 5 is included.',
        'Write: for num in range(1, 6):'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Writing an inclusive loop counting from 1 to 3',
      questionType: 'WRITE_CODE',
      prompt: 'Write a `for` loop using `range()` that prints the numbers 1, 2, and 3, each on its own line.',
      starterCode: '# Print 1, 2, 3 using a for loop:\n',
      referenceSolution: 'for i in range(1, 4):\n    print(i)',
      testCases: [
        { id: 't1', description: 'Prints 1, 2, and 3', expectedOutput: '1\n2\n3' },
        { id: 't2', description: 'Starts at 1 and stops before 4', assertionPython: 'assert list(range(1, 4)) == [1, 2, 3]' }
      ],
      progressiveHints: [
        'Start at 1.',
        'To include 3, set stop to 4.',
        'Write:\nfor i in range(1, 4):\n    print(i)'
      ]
    }
  ]
};
