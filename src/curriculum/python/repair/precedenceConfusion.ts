import { ConceptRepairDrill } from './types';

export const precedenceConfusionDrill: ConceptRepairDrill = {
  tag: 'PRECEDENCE_CONFUSION',
  friendlyTitle: 'Operator Precedence and Parentheses',
  description: 'In Python, multiplication and division evaluate before addition and subtraction unless grouped with parentheses.',
  category: 'Operators & Conditionals',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing unintended division-first evaluation order',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What does this Python code print?\n```python\nresult = 10 + 20 / 2\nprint(result)\n```',
      codeSnippet: 'result = 10 + 20 / 2\nprint(result)',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: '20.0', isCorrect: true, explanation: 'Python evaluates division before addition: 20 / 2 is 10.0, then 10 + 10.0 is 20.0.' },
        { id: 'opt_2', text: '15.0', isCorrect: false, explanation: '15.0 would require parentheses around (10 + 20) / 2.' },
        { id: 'opt_3', text: 'TypeError', isCorrect: false, explanation: 'Numbers can be added and divided without any type error.' }
      ],
      progressiveHints: [
        'Recall standard order of operations (PEMDAS).',
        'Division (/) happens before addition (+).',
        '20 / 2 is evaluated first (10.0), then added to 10 to make 20.0.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Parentheses override evaluation precedence',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which expression correctly calculates the mathematical average of two numbers `a` and `b`?',
      explanationText: 'Python strictly follows algebraic order of operations: Multiplication and Division precede Addition and Subtraction. If you write `a + b / 2`, Python only divides `b`. Wrapping `(a + b)` in parentheses forces Python to compute the sum before dividing.',
      diagram: `Without grouping:  10 + 20 / 2    --> 10 + 10.0 = 20.0
With grouping:     (10 + 20) / 2  --> 30 / 2 = 15.0 (Correct average!)`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'a + b / 2', isCorrect: false, explanation: 'Only b is divided by 2.' },
        { id: 'opt_2', text: '(a + b) / 2', isCorrect: true, explanation: 'Parentheses force a + b to evaluate first, then divide by 2.' },
        { id: 'opt_3', text: '[a + b] / 2', isCorrect: false, explanation: 'Square brackets create a list in Python, not grouping.' }
      ],
      progressiveHints: [
        'You need both numbers added together before dividing by 2.',
        'Use round parentheses ( ) to group addition.',
        '(a + b) / 2 computes the correct average.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Adding parentheses to force addition before multiplication',
      questionType: 'DEBUG_CODE',
      prompt: 'Add parentheses to line 1 so that `val` equals `20` instead of `14`:',
      starterCode: learnerSnippet || 'val = 2 + 3 * 4\nprint(val)',
      referenceSolution: 'val = (2 + 3) * 4\nprint(val)',
      testCases: [
        { id: 't1', description: 'Outputs 20', expectedOutput: '20' },
        { id: 't2', description: 'val equals 20', assertionPython: 'assert val == 20' }
      ],
      progressiveHints: [
        'Currently 3 * 4 runs first, giving 12 + 2 = 14.',
        'Group (2 + 3) so 5 is multiplied by 4.',
        'Change line 1 to: `val = (2 + 3) * 4`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Calculating grouped average of two variables',
      questionType: 'WRITE_CODE',
      prompt: 'Set `x = 40` and `y = 60`. Calculate the average `(x + y) / 2` and print the result (should output `50.0`).',
      starterCode: 'x = 40\ny = 60\n# Calculate average and print:\n',
      referenceSolution: 'x = 40\ny = 60\nprint((x + y) / 2)',
      testCases: [
        { id: 't1', description: 'Outputs 50.0', expectedOutput: '50.0' },
        { id: 't2', description: 'Calculates correct grouped average', assertionPython: 'assert (x + y) / 2 == 50.0' }
      ],
      progressiveHints: [
        'Wrap `(x + y)` inside parentheses.',
        'Divide by 2: `(x + y) / 2`.',
        'Write:\nprint((x + y) / 2)'
      ]
    }
  ]
};
