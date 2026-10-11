import { ConceptRepairDrill } from './types';

export const booleanLogicConfusionDrill: ConceptRepairDrill = {
  tag: 'BOOLEAN_LOGIC_CONFUSION',
  friendlyTitle: 'Combining Conditions with and vs or',
  description: 'In Python, `and` requires both sides to be True, while `or` succeeds if at least one side is True.',
  category: 'Conditionals & Logic',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing when `and` fails because one operand is False',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What will this Python code print?\n```python\nscore = 85\nif score >= 90 and score >= 80:\n    print("Top tier")\nelse:\n    print("Standard")\n```',
      codeSnippet: 'score = 85\nif score >= 90 and score >= 80:\n    print("Top tier")\nelse:\n    print("Standard")',
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'Top tier', isCorrect: false, explanation: '85 >= 90 is False, and `and` requires both conditions to be True.' },
        { id: 'opt_2', text: 'Standard', isCorrect: true, explanation: 'Because 85 >= 90 is False, the `and` expression evaluates to False, entering the else branch.' },
        { id: 'opt_3', text: 'TypeError', isCorrect: false, explanation: 'Boolean logic between comparison expressions is completely valid.' }
      ],
      progressiveHints: [
        'Check both sides of the `and` keyword.',
        'Is 85 >= 90? No, that is False.',
        'With `and`, if any part is False, the entire condition is False.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Conjunction (and) vs Disjunction (or)',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which operator should you use if a user can log in with EITHER a password OR an email magic link?',
      explanationText: 'The `and` keyword demands that every condition holds True simultaneously. The `or` keyword succeeds as long as at least one condition is True. Use `and` when both requirements are compulsory (e.g. valid username AND valid password). Use `or` when either alternative suffices.',
      diagram: `True and False --> False  (ALL must be True)
True or False  --> True   (AT LEAST ONE must be True)`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'and', isCorrect: false, explanation: 'and would demand both methods simultaneously.' },
        { id: 'opt_2', text: 'or', isCorrect: true, explanation: 'or permits either login method to succeed.' },
        { id: 'opt_3', text: '||', isCorrect: false, explanation: 'Python uses the English word "or", not ||.' }
      ],
      progressiveHints: [
        'Can the user pick either one?',
        'Use the operator that allows alternatives.',
        'Use `or`.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Changing `and` to `or` for alternative permissions',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 3 so that editors or admins can access the panel (change `and` to `or`):',
      starterCode: learnerSnippet || 'is_admin = False\nis_editor = True\nif is_admin and is_editor:\n    print("Access granted")',
      referenceSolution: 'is_admin = False\nis_editor = True\nif is_admin or is_editor:\n    print("Access granted")',
      testCases: [
        { id: 't1', description: 'Outputs Access granted', expectedOutput: 'Access granted' },
        { id: 't2', description: 'Permits access when is_editor is True', assertionPython: 'assert is_admin or is_editor' }
      ],
      progressiveHints: [
        'Currently line 3 requires BOTH is_admin and is_editor.',
        'Change `and` to `or`.',
        'Use: `if is_admin or is_editor:`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Enforcing range boundary check with `and`',
      questionType: 'WRITE_CODE',
      prompt: 'Set `hour = 12`. Write an `if hour >= 9 and hour <= 17:` statement that prints `"Open"`.',
      starterCode: 'hour = 12\n# Write if statement checking hour is between 9 and 17:\n',
      referenceSolution: 'hour = 12\nif hour >= 9 and hour <= 17:\n    print("Open")',
      testCases: [
        { id: 't1', description: 'Outputs Open', expectedOutput: 'Open' },
        { id: 't2', description: 'hour is between 9 and 17', assertionPython: 'assert hour >= 9 and hour <= 17' }
      ],
      progressiveHints: [
        'Use `and` to ensure both `hour >= 9` and `hour <= 17`.',
        'Indent the print statement under the if condition.',
        'Write:\nhour = 12\nif hour >= 9 and hour <= 17:\n    print("Open")'
      ]
    }
  ]
};
