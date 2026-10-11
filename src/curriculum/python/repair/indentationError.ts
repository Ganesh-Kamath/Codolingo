import { ConceptRepairDrill } from './types';

export const indentationErrorDrill: ConceptRepairDrill = {
  tag: 'INDENTATION_ERROR',
  friendlyTitle: 'Indentation Errors (IndentationError)',
  description: 'In Python, code blocks inside if statements and functions must be indented consistently with 4 spaces.',
  category: 'Syntax & Structure',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing IndentationError when a block body is not indented',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'What error occurs when this Python code runs?\n```python\nvalid = True\nif valid:\nprint("Success")\n```',
      codeSnippet: 'valid = True\nif valid:\nprint("Success")',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'IndentationError: expected an indented block after "if"', isCorrect: true, explanation: 'Python requires every line inside an if body to be indented.' },
        { id: 'opt_2', text: 'NameError: valid is not defined', isCorrect: false, explanation: 'valid is defined on line 1.' },
        { id: 'opt_3', text: 'Prints "Success"', isCorrect: false, explanation: 'The code halts with an IndentationError before execution.' }
      ],
      progressiveHints: [
        'Look at line 3: notice where `print("Success")` starts.',
        'It is lined up at column 0 with `if valid:`.',
        'Python requires an indented block under an if header.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Significant whitespace defining code hierarchy',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'How does Python know which lines belongs inside an `if` statement block?',
      explanationText: 'Unlike languages that use curly braces `{ }` to enclose code blocks, Python uses whitespace indentation. Lines indented under a colon belong to that block; when indentation returns to the previous level, the block ends.',
      diagram: `if condition:
    line_1  <-- 4 spaces: inside if block
    line_2  <-- 4 spaces: inside if block
line_3      <-- 0 spaces: outside if block`,
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'By looking for an "end" statement', isCorrect: false, explanation: 'Python does not use "end" keywords (that is Ruby or MATLAB).' },
        { id: 'opt_2', text: 'By inspecting indentation (typically 4 spaces)', isCorrect: true, explanation: 'Consistent whitespace indentation defines block structure in Python.' },
        { id: 'opt_3', text: 'By semicolons at line ends', isCorrect: false, explanation: 'Semicolons are not required or used for blocks in Python.' }
      ],
      progressiveHints: [
        'How does Python delimit blocks?',
        'Python relies on whitespace indentation.',
        'Indentation (4 spaces) defines the block.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Indenting the body of an if statement with 4 spaces',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 3 by indenting `print("Active")` with 4 spaces so it runs inside the `if` block:',
      starterCode: learnerSnippet || 'status = True\nif status:\nprint("Active")',
      referenceSolution: 'status = True\nif status:\n    print("Active")',
      testCases: [
        { id: 't1', description: 'Outputs Active', expectedOutput: 'Active' },
        { id: 't2', description: 'Code runs without indentation error', assertionPython: 'assert status is True' }
      ],
      progressiveHints: [
        'Look at line 3.',
        'Add 4 spaces at the start of line 3 before `print("Active")`.',
        'Use: `    print("Active")`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Writing an indented conditional branch',
      questionType: 'WRITE_CODE',
      prompt: 'Set `coins = 5`. Write an `if coins > 0:` block that indents and prints `"Has coins"`.',
      starterCode: '# Set coins and write indented if block:\n',
      referenceSolution: 'coins = 5\nif coins > 0:\n    print("Has coins")',
      testCases: [
        { id: 't1', description: 'Outputs Has coins', expectedOutput: 'Has coins' },
        { id: 't2', description: 'coins is 5', assertionPython: 'assert coins == 5' }
      ],
      progressiveHints: [
        'Define `coins = 5`.',
        'Write `if coins > 0:` then indent the next line with 4 spaces.',
        'Write:\ncoins = 5\nif coins > 0:\n    print("Has coins")'
      ]
    }
  ]
};
