import { ConceptRepairDrill } from './types';

export const conditionBoundaryDrill: ConceptRepairDrill = {
  tag: 'CONDITION_BOUNDARY',
  friendlyTitle: 'Inclusive vs Exclusive Boundaries (< vs <=)',
  description: 'In Python, < and > exclude the exact threshold value, while <= and >= include it.',
  category: 'Conditionals & Logic',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing boundary exclusion with strict comparison operators',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What will this Python code print?\n```python\nage = 18\nif age > 18:\n    print("Can vote")\nelse:\n    print("Too young")\n```',
      codeSnippet: 'age = 18\nif age > 18:\n    print("Can vote")\nelse:\n    print("Too young")',
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'Can vote', isCorrect: false, explanation: '18 > 18 is False because > strictly requires age to exceed 18.' },
        { id: 'opt_2', text: 'Too young', isCorrect: true, explanation: 'Because > is strict, 18 is not greater than 18. The else branch executes.' },
        { id: 'opt_3', text: 'TypeError', isCorrect: false, explanation: 'Both sides are valid integers, so no error occurs.' }
      ],
      progressiveHints: [
        'Notice the comparison `age > 18` when `age` equals exactly 18.',
        'Is 18 strictly greater than 18? No, they are equal.',
        'Since the condition is False, the else block runs, printing "Too young".'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Strict inequality vs Inclusive inequality',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which operator should you use if you want a score of 70 or higher to pass an exam?',
      explanationText: 'Strict operators (`<` and `>`) test whether one number is strictly smaller or larger, never equal. To include the boundary number itself, append an equals sign: `>=` means "greater than or equal to", and `<=` means "less than or equal to".',
      diagram: `Strict:     x > 18   --> 19, 20, 21... (18 is EXCLUDED)
Inclusive:  x >= 18  --> 18, 19, 20... (18 is INCLUDED!)`,
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'score >= 70', isCorrect: true, explanation: '>= includes 70 and anything higher.' },
        { id: 'opt_2', text: 'score > 70', isCorrect: false, explanation: '> excludes 70, requiring at least 71 to pass.' },
        { id: 'opt_3', text: 'score => 70', isCorrect: false, explanation: '=> is a syntax error in Python; the equals sign always comes second.' }
      ],
      progressiveHints: [
        'You want to include 70 as passing.',
        'Use the greater-than-or-equal operator.',
        'score >= 70 includes 70.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Changing strict > to inclusive >= in boundary check',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so that a score of 100 prints `"Perfect score!"`:',
      starterCode: learnerSnippet || 'score = 100\nif score > 100:\n    print("Perfect score!")',
      referenceSolution: 'score = 100\nif score >= 100:\n    print("Perfect score!")',
      testCases: [
        { id: 't1', description: 'Outputs Perfect score! when score is 100', expectedOutput: 'Perfect score!' },
        { id: 't2', description: 'Includes boundary value', assertionPython: 'assert score >= 100' }
      ],
      progressiveHints: [
        'Line 2 tests `score > 100`, which is False when score is 100.',
        'Change `>` to `>=`.',
        'Use: `if score >= 100:`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Applying inclusive boundary check to freezing temperatures',
      questionType: 'WRITE_CODE',
      prompt: 'Set `temp = 32`. Write an `if` statement checking if `temp <= 32`. If true, print `"Freezing"`.',
      starterCode: '# Set temp to 32 and check <= 32:\n',
      referenceSolution: 'temp = 32\nif temp <= 32:\n    print("Freezing")',
      testCases: [
        { id: 't1', description: 'Outputs Freezing', expectedOutput: 'Freezing' },
        { id: 't2', description: 'temp variable set to 32', assertionPython: 'assert temp <= 32' }
      ],
      progressiveHints: [
        'Define `temp = 32`.',
        'Check `if temp <= 32:` to include 32.',
        'Write:\ntemp = 32\nif temp <= 32:\n    print("Freezing")'
      ]
    }
  ]
};
