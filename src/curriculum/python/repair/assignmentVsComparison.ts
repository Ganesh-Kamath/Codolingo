import { ConceptRepairDrill } from './types';

export const assignmentVsComparisonDrill: ConceptRepairDrill = {
  tag: 'ASSIGNMENT_VS_COMPARISON',
  friendlyTitle: 'Mixing up = and ==',
  description: 'In Python, = assigns a value to a variable, while == checks if two values are equal.',
  category: 'Operators & Conditionals',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Single = assigns a value; double == tests equality',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'What is wrong with this code?\n```python\nscore = 10\nif score = 10:\n    print("Winner")\n```',
      codeSnippet: 'score = 10\nif score = 10:\n    print("Winner")',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'Line 2 uses = (assignment) instead of == (comparison)', isCorrect: true, explanation: '= is used to store values, not test conditions. Python throws a SyntaxError.' },
        { id: 'opt_2', text: 'score cannot be set to 10', isCorrect: false, explanation: 'Setting score = 10 on line 1 is valid assignment.' },
        { id: 'opt_3', text: 'The print statement is missing parentheses', isCorrect: false, explanation: 'print("Winner") has proper parentheses.' }
      ],
      progressiveHints: [
        'Look closely at line 2 inside the `if` header.',
        'Python forbids single = inside condition checks.',
        'Single = assigns; double == compares equality.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Assignment box vs Equality question',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which line checks if `points` is equal to 50 without modifying it?',
      explanationText: 'Single = stores a value into a variable, like dropping data into a box. Double == asks a question: "Are these two sides equal?" and returns True or False. Putting = in an `if` header is a syntax error because Python prevents accidental overwrites.',
      diagram: `Assignment:  x = 5    [x] <--- 5  (stores 5 in x)
Comparison:  x == 5   [x] == 5 ?   (returns True / False)`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'points = 50', isCorrect: false, explanation: 'This overwrites points with 50.' },
        { id: 'opt_2', text: 'points == 50', isCorrect: true, explanation: 'Double == checks equality without changing points.' },
        { id: 'opt_3', text: 'points === 50', isCorrect: false, explanation: 'Python does not have a === operator (that is JavaScript).' }
      ],
      progressiveHints: [
        'Think about which operator checks equality.',
        'Python uses == for comparison.',
        'points == 50 tests equality without changing points.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Repairing the assignment in condition',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so the `if` statement correctly compares `status` with `"active"`:',
      starterCode: learnerSnippet || 'status = "active"\nif status = "active":\n    print("Welcome back")',
      referenceSolution: 'status = "active"\nif status == "active":\n    print("Welcome back")',
      testCases: [
        { id: 't1', description: 'Outputs Welcome back when status is active', expectedOutput: 'Welcome back' },
        { id: 't2', description: 'Uses equality comparison ==', assertionPython: 'assert status == "active"' }
      ],
      progressiveHints: [
        'Notice line 2 has `status = "active"` inside the if condition.',
        'Change single `=` to double `==`.',
        'Use: `if status == "active":`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Transferring = vs == into a fresh security verification check',
      questionType: 'WRITE_CODE',
      prompt: 'Create a variable `pin = 4321`. Then write an `if` statement checking if `pin == 4321`. If true, print `"Access granted"`.',
      starterCode: '# Set pin to 4321 and verify with ==:\n',
      referenceSolution: 'pin = 4321\nif pin == 4321:\n    print("Access granted")',
      testCases: [
        { id: 't1', description: 'Outputs Access granted', expectedOutput: 'Access granted' },
        { id: 't2', description: 'pin variable set to 4321', assertionPython: 'assert pin == 4321, "pin must equal 4321"' }
      ],
      progressiveHints: [
        'First define pin = 4321 using a single = for variable assignment.',
        'Then test if pin == 4321: using double == for comparison.',
        'Write:\npin = 4321\nif pin == 4321:\n    print("Access granted")'
      ]
    }
  ]
};
