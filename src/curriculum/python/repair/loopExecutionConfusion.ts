import { ConceptRepairDrill } from './types';

export const loopExecutionConfusionDrill: ConceptRepairDrill = {
  tag: 'LOOP_EXECUTION_CONFUSION',
  friendlyTitle: 'While Loop Control Flow & Counter Update',
  description: 'A while loop evaluates its condition before every iteration. If the counter update is missing or out of order, the loop behaves unexpectedly or never terminates.',
  category: 'Loops & Iteration',
  getSteps: (learnerSnippet) => [
    {
      stepNumber: 1,
      title: 'SPOT IT',
      whatWereFixing: 'Predicting counter value after a while loop finishes',
      questionType: 'PREDICT_OUTPUT',
      prompt: 'What will this Python code print?\n```python\ncount = 0\nwhile count < 3:\n    count += 1\nprint(count)\n```',
      codeSnippet: 'count = 0\nwhile count < 3:\n    count += 1\nprint(count)',
      referenceSolution: 'opt_2',
      options: [
        { id: 'opt_1', text: '2', isCorrect: false, explanation: 'When count is 2, 2 < 3 is True, so the body executes once more, setting count to 3.' },
        { id: 'opt_2', text: '3', isCorrect: true, explanation: 'The loop terminates when count reaches 3 because 3 < 3 is False. The final printed value is 3.' },
        { id: 'opt_3', text: '0 1 2', isCorrect: false, explanation: 'print(count) is outside the while loop, so it prints only once.' }
      ],
      progressiveHints: [
        'Trace the value of count: 0 -> 1 -> 2 -> 3.',
        'At count = 3, does 3 < 3 evaluate to True or False?',
        'It is False, so the loop exits and prints the final count: 3.'
      ]
    },
    {
      stepNumber: 2,
      title: 'UNDERSTAND WHY',
      whatWereFixing: 'Mental model: Pre-condition check and loop state progression',
      questionType: 'MULTIPLE_CHOICE',
      prompt: 'Why does a while loop require a state update (such as `x += 1` or `x -= 1`) inside its body?',
      explanationText: 'A while loop repeatedly executes while the condition remains True. If no variables in the condition are modified within the loop body, the condition remains permanently True, creating an infinite loop that freezes execution.',
      diagram: `Start -> [Condition True?] --Yes--> [Run Body & Update State] -> Re-check Condition
                     |
                    No
                     v
                [Exit Loop]`,
      referenceSolution: 'opt_1',
      options: [
        { id: 'opt_1', text: 'To ensure the condition eventually becomes False so the loop terminates', isCorrect: true, explanation: 'Without progressing state toward termination, the loop runs infinitely.' },
        { id: 'opt_2', text: 'Python syntax requires at least one math operator inside every while loop', isCorrect: false, explanation: 'Python does not enforce operators syntactically; it is logical progression.' },
        { id: 'opt_3', text: 'While loops only accept integer increment statements', isCorrect: false, explanation: 'Any condition or update logic can control a while loop.' }
      ],
      progressiveHints: [
        'Think about what happens if the variable never changes.',
        'The condition would stay True forever.',
        'The update makes the condition eventually evaluate to False.'
      ]
    },
    {
      stepNumber: 3,
      title: 'FIX IT',
      whatWereFixing: 'Adding missing counter increment inside while loop body',
      questionType: 'DEBUG_CODE',
      prompt: 'Fix the while loop so that it increments `count` by 1 each time and prints 0, 1, 2:',
      starterCode: learnerSnippet || 'count = 0\nwhile count < 3:\n    print(count)\n    # Add counter update below:',
      referenceSolution: 'count = 0\nwhile count < 3:\n    print(count)\n    count += 1',
      testCases: [
        { id: 't1', description: 'Outputs 0, 1, 2 on separate lines', expectedOutput: '0\n1\n2' },
        { id: 't2', description: 'count reaches 3', assertionPython: 'assert count == 3' }
      ],
      progressiveHints: [
        'The loop currently prints 0 forever because count is never incremented.',
        'Add `count += 1` inside the loop body.',
        'Ensure `count += 1` is indented under the while loop.'
      ]
    },
    {
      stepNumber: 4,
      title: 'PROVE IT',
      whatWereFixing: 'Writing a countdown while loop from 3 down to 1',
      questionType: 'WRITE_CODE',
      prompt: 'Initialize `n = 3`. Write a `while` loop that runs while `n > 0`, prints `n`, and decrements `n -= 1`.',
      starterCode: '# Initialize n = 3 and countdown with while loop:\n',
      referenceSolution: 'n = 3\nwhile n > 0:\n    print(n)\n    n -= 1',
      testCases: [
        { id: 't1', description: 'Prints countdown 3, 2, 1', expectedOutput: '3\n2\n1' },
        { id: 't2', description: 'n ends at 0', assertionPython: 'assert n == 0' }
      ],
      progressiveHints: [
        'Set `n = 3`.',
        'Check `while n > 0:`.',
        'Inside the loop: `print(n)` then `n -= 1`.'
      ]
    }
  ]
};
