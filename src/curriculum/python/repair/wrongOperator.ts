import { ConceptRepairDrill } from './types';

export const wrongOperatorDrill: ConceptRepairDrill = {
  tag: 'WRONG_OPERATOR',
  friendlyTitle: 'Choosing the Right Operator (/ vs // vs %)',
  description: 'In Python, / is true float division, // is integer floor division, and % is the modulo remainder.',
  category: 'Operators & Conditionals',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing floor division discarding fractional remainders',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What does this Python code print?\n```python\nresult = 7 // 2\nprint(result)\n```',
      codeSnippet: 'result = 7 // 2\nprint(result)',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: '3', isCorrect: true, explanation: '// is floor division, which drops the 0.5 decimal and returns integer 3.' },
        { id: 'opt_2', text: '3.5', isCorrect: false, explanation: 'Single slash / gives 3.5; double slash // discards fractions.' },
        { id: 'opt_3', text: '1', isCorrect: false, explanation: '1 is the remainder produced by the modulo operator %.' }
      ],
      progressiveHints: [
        'Notice the double slash `//` operator.',
        'Double slash discards any decimal portion.',
        '7 divided by 2 is 3.5, so // returns 3.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Float division vs Floor division vs Modulo',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which operator finds the remainder left over after dividing two integers?',
      explanationText: 'Python distinguishes three types of division: Single slash `/` always returns a float with decimals (e.g., `7 / 2 = 3.5`). Double slash `//` truncates down to the nearest whole integer (`7 // 2 = 3`). Percent `%` calculates the remainder (`7 % 2 = 1`), which is often used to test even/odd numbers.',
      diagram: `Float division:    7 / 2   --> 3.5 (keeps decimal)
Floor division:    7 // 2  --> 3   (discards decimal)
Modulo remainder:  7 % 2   --> 1   (leftover remainder)`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: '// (double slash)', isCorrect: false, explanation: '// returns the whole quotient, not the remainder.' },
        { id: 'opt_2', text: '% (percent / modulo)', isCorrect: true, explanation: '% calculates the remainder left over from division.' },
        { id: 'opt_3', text: 'mod', isCorrect: false, explanation: 'Python uses % for modulo; mod is not an operator.' }
      ],
      progressiveHints: [
        'Which symbol represents the modulo operator in Python?',
        'Look for the percent sign.',
        '% returns the remainder.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Changing division operator to floor division //',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 1 so that `pairs` gets integer floor division `3` instead of float `3.5`:',
      starterCode: learnerSnippet || 'pairs = 7 / 2\nprint(pairs)',
      referenceSolution: 'pairs = 7 // 2\nprint(pairs)',
      testCases: [
        { id: 't1', description: 'Outputs 3', expectedOutput: '3' },
        { id: 't2', description: 'pairs equals integer 3', assertionPython: 'assert pairs == 3' }
      ],
      progressiveHints: [
        'Single slash / results in 3.5.',
        'Use double slash // for whole numbers.',
        'Change line 1 to: `pairs = 7 // 2`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Using modulo % to detect odd remainder',
      questionType: 'WRITE_CODE',
      prompt: 'Set `num = 11`. Calculate its remainder when divided by 2 using `%` and print the result (should output `1`).',
      starterCode: 'num = 11\n# Calculate num % 2 and print:\n',
      referenceSolution: 'num = 11\nprint(num % 2)',
      testCases: [
        { id: 't1', description: 'Outputs 1', expectedOutput: '1' },
        { id: 't2', description: 'Remainder is 1', assertionPython: 'assert num % 2 == 1' }
      ],
      progressiveHints: [
        'Use the `%` operator: `num % 2`.',
        'Print the calculation.',
        'Write:\nnum = 11\nprint(num % 2)'
      ]
    }
  ]
};
