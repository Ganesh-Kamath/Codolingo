import { ConceptRepairDrill } from './types';

export const syntaxErrorDrill: ConceptRepairDrill = {
  tag: 'SYNTAX_ERROR',
  friendlyTitle: 'Missing Colons and Unmatched Quotes',
  description: 'In Python, header statements (like if, else, for) must terminate with a colon (:), and all quotes and parentheses must match.',
  category: 'Syntax & Structure',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Spotting missing colons on statement headers',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'What causes a SyntaxError in this code?\n```python\nscore = 80\nif score >= 70\n    print("Passed")\n```',
      codeSnippet: 'score = 80\nif score >= 70\n    print("Passed")',
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'Line 2 is missing a colon (:) at the end of the if header', isCorrect: true, explanation: 'All if, else, elif, for, and def lines must end with a colon.' },
        { id: 'opt_2', text: 'score cannot be compared with 70', isCorrect: false, explanation: '>= comparison between integers is completely valid.' },
        { id: 'opt_3', text: 'print statement should be capitalized', isCorrect: false, explanation: 'print() is lowercase in Python.' }
      ],
      progressiveHints: [
        'Inspect the end of line 2: `if score >= 70`.',
        'Python requires a specific punctuation mark to introduce an indented block.',
        'Add a colon `:` at the end of the header.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Colons introduce code suites',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Which statement header has valid Python syntax?',
      explanationText: 'In Python, the colon (`:`) acts as a gateway introducing an indented suite of code. It tells the parser: "I have finished specifying the condition or header; now expect the indented actions on the next line." Leaving it off causes an immediate SyntaxError before execution starts.',
      diagram: `if condition:        <-- Colon introduces indented block
    print("Action")  <-- Indented block executes when True`,
      referenceSolution: 'opt_3',
      options: [
        { id: 'opt_1', text: 'if count > 0 then', isCorrect: false, explanation: 'Python does not use "then" keywords (that is Pascal or Lua).' },
        { id: 'opt_2', text: 'if (count > 0) {', isCorrect: false, explanation: 'Python does not use curly braces { } for blocks (that is C or JavaScript).' },
        { id: 'opt_3', text: 'if count > 0:', isCorrect: true, explanation: 'Python uses a colon at the end of the condition header.' }
      ],
      progressiveHints: [
        'Python syntax uses a colon instead of "then" or curly braces.',
        'Look for the statement ending with `:`',
        'if count > 0: is valid Python.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Adding missing colon to if header',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so this code executes without a SyntaxError:',
      starterCode: learnerSnippet || 'level = 2\nif level == 2\n    print("Stage 2 active")',
      referenceSolution: 'level = 2\nif level == 2:\n    print("Stage 2 active")',
      testCases: [
        { id: 't1', description: 'Outputs Stage 2 active', expectedOutput: 'Stage 2 active' },
        { id: 't2', description: 'Syntax is valid', assertionPython: 'assert level == 2' }
      ],
      progressiveHints: [
        'Check the end of line 2.',
        'Add a `:` after `level == 2`.',
        'Use: `if level == 2:`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Writing an if statement with valid colon and quotes',
      questionType: 'WRITE_CODE',
      prompt: 'Set `active = True`. Write an `if active == True:` statement (with a colon) that prints `"System online"`.',
      starterCode: '# Set active and verify with if statement:\n',
      referenceSolution: 'active = True\nif active == True:\n    print("System online")',
      testCases: [
        { id: 't1', description: 'Outputs System online', expectedOutput: 'System online' },
        { id: 't2', description: 'active is True', assertionPython: 'assert active is True' }
      ],
      progressiveHints: [
        'Define `active = True`.',
        'Write `if active == True:` with a colon at the end.',
        'Write:\nactive = True\nif active == True:\n    print("System online")'
      ]
    }
  ]
};
