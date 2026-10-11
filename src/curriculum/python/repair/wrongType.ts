import { ConceptRepairDrill } from './types';

export const wrongTypeDrill: ConceptRepairDrill = {
  tag: 'WRONG_TYPE',
  friendlyTitle: 'Type Conversion with int(), float(), and str()',
  description: 'In Python, values possess fixed types. Use float() for decimal strings and int() for whole number strings.',
  category: 'Types & Input',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing ValueError when passing decimals to int()',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'What happens when this Python code runs?\n```python\nprice = "19.99"\ntotal = int(price)\nprint(total)\n```',
      codeSnippet: 'price = "19.99"\ntotal = int(price)\nprint(total)',
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'Prints 19', isCorrect: false, explanation: 'int() cannot parse strings with decimal points directly; it does not truncate decimal strings.' },
        { id: 'opt_2', text: 'Raises a ValueError: invalid literal for int()', isCorrect: true, explanation: 'int() only accepts whole number strings. Decimal strings must use float().' },
        { id: 'opt_3', text: 'Prints 19.99', isCorrect: false, explanation: 'int() converts to integers, not decimals, but throws an error here first.' }
      ],
      progressiveHints: [
        'Notice that `"19.99"` has a decimal point inside the string.',
        '`int()` expects strings composed purely of digits (like `"19"`).',
        'Passing a decimal string directly to `int()` raises a ValueError.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Decimal strings require float() conversion',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which function converts a decimal string like `"4.50"` into a number Python can calculate with?',
      explanationText: 'Python distinguishes whole integers (`int`) from fractional decimals (`float`). If you have a string with a decimal point like `"4.50"`, `int()` cannot parse the decimal point and raises a ValueError. Using `float("4.50")` correctly parses it into a floating-point number.',
      diagram: `int("4.50")    --> 💥 ValueError (has decimal point!)
float("4.50")  --> 4.5  (successfully parsed decimal!)`,
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'float(price_str)', isCorrect: true, explanation: 'float() parses decimal numbers with floating-point precision.' },
        { id: 'opt_2', text: 'int(price_str)', isCorrect: false, explanation: 'int() crashes on decimal strings.' },
        { id: 'opt_3', text: 'str(price_str)', isCorrect: false, explanation: 'str() keeps it as text, which cannot do math.' }
      ],
      progressiveHints: [
        'You need a decimal number type.',
        'Python calls decimal numbers "floats".',
        'Use float().'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Changing int() to float() for decimal string parsing',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so that `amount` is converted with `float()` and outputs `35.5`:',
      starterCode: learnerSnippet || 'val_str = "25.5"\namount = int(val_str) + 10\nprint(amount)',
      referenceSolution: 'val_str = "25.5"\namount = float(val_str) + 10\nprint(amount)',
      testCases: [
        { id: 't1', description: 'Outputs 35.5', expectedOutput: '35.5' },
        { id: 't2', description: 'amount is a float', assertionPython: 'assert amount == 35.5' }
      ],
      progressiveHints: [
        'Line 2 calls `int(val_str)`, which fails on `"25.5"`.',
        'Replace `int` with `float`.',
        'Use: `amount = float(val_str) + 10`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Parsing integer strings and multiplying safely',
      questionType: 'WRITE_CODE',
      prompt: 'Given `cost = "15"`, convert `cost` to an integer using `int()` and print its product with 4 (should output `60`).',
      starterCode: 'cost = "15"\n# Convert cost to int and print product with 4:\n',
      referenceSolution: 'cost = "15"\nprint(int(cost) * 4)',
      testCases: [
        { id: 't1', description: 'Outputs 60', expectedOutput: '60' },
        { id: 't2', description: 'Correct product computed', assertionPython: 'assert int(cost) * 4 == 60' }
      ],
      progressiveHints: [
        'Use `int(cost)` to convert `"15"` to integer 15.',
        'Multiply by 4: `int(cost) * 4`.',
        'Write:\nprint(int(cost) * 4)'
      ]
    }
  ]
};
