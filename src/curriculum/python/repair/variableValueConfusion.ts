import { ConceptRepairDrill } from './types';

export const variableValueConfusionDrill: ConceptRepairDrill = {
  tag: 'VARIABLE_VALUE_CONFUSION',
  friendlyTitle: 'Variables vs Literal Strings ("name" vs name)',
  description: 'In Python, quotes create literal text, while unquoted words look up variable values.',
  category: 'Variables & Scope',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Recognizing literal string output instead of variable value evaluation',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What does this Python code print?\n```python\nplayer = "Zara"\nprint("player")\n```',
      codeSnippet: 'player = "Zara"\nprint("player")',
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: 'Zara', isCorrect: false, explanation: 'To print Zara, you must pass the variable name player without quotes.' },
        { id: 'opt_2', text: 'player', isCorrect: true, explanation: 'Because "player" is in quotes, Python treats it as literal characters rather than inspecting the variable.' },
        { id: 'opt_3', text: 'NameError', isCorrect: false, explanation: 'Literal strings never cause NameErrors.' }
      ],
      progressiveHints: [
        'Notice quotes inside `print("player")`.',
        'Quotes tell Python: "Print these exact letters".',
        'It prints the literal word "player", not "Zara".'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Quoted literal characters vs Variable reference',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'How do you tell Python to print the contents stored inside variable `score`?',
      explanationText: 'Quotation marks (`" "` or `\' \'`) tell Python: "Treat this as verbatim text characters". When you want Python to inspect memory and retrieve the data stored in a variable, write the variable identifier with NO quotation marks.',
      diagram: `With quotes:     print("score")  --> prints exact letters 'score'
Without quotes:  print(score)    --> fetches value inside score: 100`,
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'print(score)', isCorrect: true, explanation: 'Passing the variable identifier without quotes retrieves its value.' },
        { id: 'opt_2', text: 'print("score")', isCorrect: false, explanation: 'This prints the literal string "score".' },
        { id: 'opt_3', text: 'print($score)', isCorrect: false, explanation: 'Python does not use $ prefix for variables (that is PHP or Bash).' }
      ],
      progressiveHints: [
        'Do you want the literal word or the stored contents?',
        'Drop quotes to evaluate the variable.',
        'Use print(score).'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Removing quotes from variable call in print statement',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix line 2 so it prints the value stored in `greeting` instead of the literal word `"greeting"`:',
      starterCode: learnerSnippet || 'greeting = "Welcome aboard"\nprint("greeting")',
      referenceSolution: 'greeting = "Welcome aboard"\nprint(greeting)',
      testCases: [
        { id: 't1', description: 'Outputs Welcome aboard', expectedOutput: 'Welcome aboard' },
        { id: 't2', description: 'Prints variable value', assertionPython: 'assert greeting == "Welcome aboard"' }
      ],
      progressiveHints: [
        'Line 2 has `"greeting"` wrapped in quotes.',
        'Remove the quotes from `"greeting"`.',
        'Change line 2 to: `print(greeting)`'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Referencing variables cleanly in output',
      questionType: 'WRITE_CODE',
      prompt: 'Create a variable `city = "Tokyo"`. Print the value of `city` without quotes.',
      starterCode: '# Define city and print its value:\n',
      referenceSolution: 'city = "Tokyo"\nprint(city)',
      testCases: [
        { id: 't1', description: 'Outputs Tokyo', expectedOutput: 'Tokyo' },
        { id: 't2', description: 'city is Tokyo', assertionPython: 'assert city == "Tokyo"' }
      ],
      progressiveHints: [
        'Assign `city = "Tokyo"`.',
        'Print without quotes: `print(city)`.',
        'Write:\ncity = "Tokyo"\nprint(city)'
      ]
    }
  ]
};
