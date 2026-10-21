import { Course } from '../types';

export const COURSES: Course[] = [
  {
    id: 'python',
    title: 'Python for Developers',
    slug: 'python',
    description: 'Master practical Python from first principles. Write clean, idiomatic code for scripting, data analysis, and backend engineering.',
    category: 'programming',
    accentColor: 'var(--course-python)',
    bgLightColor: 'var(--course-python-bg)',
    borderColor: 'var(--course-python-border)',
    difficulty: 'Beginner',
    estimatedHours: 24,
    totalLessons: 36,
    isPrimary: true,
    isLocked: false,
    skillsTaught: ['Variables & Memory', 'Control Flow', 'Functions & Scope', 'Lists & Dicts', 'Error Handling'],
    modules: [
      {
        id: 'py_mod_1',
        courseId: 'python',
        title: '1. Python Foundations',
        description: 'Establish core syntax, standard output, variable assignments, and type semantics.',
        order: 1,
        lessons: [
          {
            id: 'py_lesson_1',
            moduleId: 'py_mod_1',
            courseId: 'python',
            title: 'Hello, World & Standard Output',
            slug: 'hello-world',
            description: 'Learn how to invoke built-in functions and print formatted messages to the console.',
            order: 1,
            estimatedMinutes: 5,
            xpReward: 100,
            conceptIds: ['py_syntax'],
            challenges: [
              {
                id: 'ch_py_1_1',
                lessonId: 'py_lesson_1',
                conceptId: 'py_syntax',
                title: 'Your First Line of Python',
                instructionMarkdown: `In Python, the \`print()\` function outputs text or values to the screen or terminal console.

Text values are called **strings** and must be wrapped in either double quotes (\`"..."\`) or single quotes (\`'...'\\).

### Example:
\`\`\`python
print("Welcome to VYNTAX")
\`\`\`

### Your Objective:
Output the message \`Hello, World!\` to the console using the \`print\` function.`,
                codeSnippetExample: `print("Welcome to VYNTAX")`,
                starterCode: `# Write your print statement below:\n`,
                solutionCode: `print("Hello, World!")`,
                hint: `Call print with "Hello, World!" enclosed in quotes: print("Hello, World!")`,
                type: 'code',
                tests: [
                  {
                    id: 't_1',
                    description: 'Outputs "Hello, World!" to console',
                    expectedOutput: 'Hello, World!',
                  }
                ],
                diagnosticRules: [
                  {
                    id: 'rule_caps_print',
                    mistakeType: 'case_sensitivity',
                    pattern: 'Print\\(',
                    message: 'Python is case-sensitive! You wrote `Print()`, but the built-in function is lowercase `print()`.',
                    fixSuggestion: 'Change `Print` to `print`'
                  },
                  {
                    id: 'rule_missing_quotes',
                    mistakeType: 'syntax_error',
                    pattern: 'print\\([a-zA-Z]+\\)',
                    message: 'Strings must be wrapped in quotes. Without quotes, Python looks for an undefined variable.',
                    fixSuggestion: 'Wrap the text in double quotes: "Hello, World!"'
                  }
                ]
              }
            ]
          },
          {
            id: 'py_lesson_2',
            moduleId: 'py_mod_1',
            courseId: 'python',
            title: 'Variables & String Values',
            slug: 'variables-and-strings',
            description: 'Store and manipulate data in memory using descriptive variable identifiers.',
            order: 2,
            estimatedMinutes: 8,
            xpReward: 120,
            conceptIds: ['py_variables'],
            challenges: [
              {
                id: 'ch_py_1_2',
                lessonId: 'py_lesson_2',
                conceptId: 'py_variables',
                title: 'Storing User Location',
                instructionMarkdown: `A variable binds a descriptive name to a value in memory so you can reference and reuse it across your program.

In Python, you create a variable using the assignment operator (\`=\`).

### Example:
\`\`\`python
username = "alex99"
age = 25
print(username)
\`\`\`

### Your Objective:
1. Create a variable called \`city\` and assign it the string value \`"Mumbai"\`.
2. Print the value of \`city\` using the \`print()\` function.`,
                codeSnippetExample: `username = "alex99"\nprint(username)`,
                starterCode: `# 1. Create a variable named city containing "Mumbai"\ncity = ""\n\n# 2. Print city\n`,
                solutionCode: `city = "Mumbai"\nprint(city)`,
                hint: `Assign "Mumbai" to city: city = "Mumbai", then on a new line write print(city)`,
                type: 'code',
                tests: [
                  {
                    id: 't_var_city',
                    description: 'Prints "Mumbai" using the city variable',
                    expectedOutput: 'Mumbai',
                  }
                ],
                diagnosticRules: [
                  {
                    id: 'rule_var_case',
                    mistakeType: 'variable_casing',
                    pattern: 'City\\s*=',
                    message: 'Variable names are case-sensitive. The instructions asked for `city`, but you used uppercase `City`.',
                    fixSuggestion: 'Use lowercase `city = "Mumbai"`'
                  },
                  {
                    id: 'rule_print_literal_city',
                    mistakeType: 'logic_error',
                    pattern: 'print\\(["\']city["\']\\)',
                    message: 'You printed the string literal `"city"` instead of the variable value! Remove the quotes around `city` in `print()`.',
                    fixSuggestion: 'Change `print("city")` to `print(city)`'
                  }
                ]
              }
            ]
          },
          {
            id: 'py_lesson_3',
            moduleId: 'py_mod_1',
            courseId: 'python',
            title: 'Comparison Operators (== vs =)',
            slug: 'comparison-operators',
            description: 'Evaluate truth and equality between expressions using relational operators.',
            order: 3,
            estimatedMinutes: 10,
            xpReward: 140,
            conceptIds: ['py_comparison'],
            challenges: [
              {
                id: 'ch_py_1_3',
                lessonId: 'py_lesson_3',
                conceptId: 'py_comparison',
                title: 'Checking Password Equality',
                instructionMarkdown: `One of the most frequent mistakes developers make is confusing **assignment** (\`=\`) with **equality testing** (\`==\`).

* \`=\` assigns a value to a variable: \`score = 100\`
* \`==\` checks if two values are equal and evaluates to \`True\` or \`False\`: \`score == 100\`

### Example:
\`\`\`python
entered_pin = 1234
correct_pin = 1234
is_valid = entered_pin == correct_pin
print(is_valid) # Outputs: True
\`\`\`

### Your Objective:
Compare whether \`saved_role\` and \`user_role\` are identical using the equality comparison operator \`==\`.
Print the result of the comparison.`,
                codeSnippetExample: `entered_pin = 1234\ncorrect_pin = 1234\nprint(entered_pin == correct_pin)`,
                starterCode: `saved_role = "admin"\nuser_role = "admin"\n\n# Compare saved_role with user_role and print the boolean result:\n`,
                solutionCode: `saved_role = "admin"\nuser_role = "admin"\nprint(saved_role == user_role)`,
                hint: `Use print(saved_role == user_role)`,
                type: 'code',
                tests: [
                  {
                    id: 't_comp_eq',
                    description: 'Evaluates and prints True for matching roles',
                    expectedOutput: 'True',
                  }
                ],
                diagnosticRules: [
                  {
                    id: 'rule_single_equals_compare',
                    mistakeType: 'assignment_in_condition',
                    pattern: 'saved_role\\s*=\\s*user_role',
                    message: 'Used `=` (assignment) instead of `==` (equality check)! In Python, a single `=` overwrites the variable, whereas `==` checks whether they are equal.',
                    fixSuggestion: 'Use `saved_role == user_role`'
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'py_mod_2',
        courseId: 'python',
        title: '2. Control Flow & Decisions',
        description: 'Direct program execution using conditional branches and iterative loops.',
        order: 2,
        lessons: [
          {
            id: 'py_lesson_4',
            moduleId: 'py_mod_2',
            courseId: 'python',
            title: 'Conditional Branching: if / else',
            slug: 'conditionals-if-else',
            description: 'Execute distinct blocks of code depending on runtime conditions.',
            order: 4,
            estimatedMinutes: 10,
            xpReward: 150,
            conceptIds: ['py_conditionals'],
            challenges: [
              {
                id: 'ch_py_2_1',
                lessonId: 'py_lesson_4',
                conceptId: 'py_conditionals',
                title: 'Checking Access Level',
                instructionMarkdown: `An \`if\` statement runs an indented code block only when its condition evaluates to \`True\`. An optional \`else\` block executes when the condition is \`False\`.

**Important**: In Python, statement headers end with a colon (\`:\`), and the body must be indented by 4 spaces.

### Example:
\`\`\`python
age = 20
if age >= 18:
    print("Eligible")
else:
    print("Underage")
\`\`\`

### Your Objective:
Check if \`score\` is greater than or equal to \`50\`.
* If true, print \`"Passed"\`
* Otherwise, print \`"Failed"\``,
                codeSnippetExample: `if score >= 50:\n    print("Passed")\nelse:\n    print("Failed")`,
                starterCode: `score = 75\n\n# Write your if / else logic below:\nif score >= 50:\n    \n`,
                solutionCode: `score = 75\nif score >= 50:\n    print("Passed")\nelse:\n    print("Failed")`,
                hint: `Complete the if body with print("Passed") and the else body with print("Failed")`,
                type: 'code',
                tests: [
                  {
                    id: 't_cond_passed',
                    description: 'Outputs "Passed" when score is 75',
                    expectedOutput: 'Passed',
                  }
                ],
                diagnosticRules: [
                  {
                    id: 'rule_missing_colon',
                    mistakeType: 'syntax_error',
                    pattern: 'if\\s+score\\s*>=?\\s*50(?!:)',
                    message: 'SyntaxError: In Python, `if` and `else` statements must end with a colon `:` before the newline.',
                    fixSuggestion: 'Add a colon: `if score >= 50:`'
                  }
                ]
              }
            ]
          },
          {
            id: 'py_lesson_5',
            moduleId: 'py_mod_2',
            courseId: 'python',
            title: 'Loops & Iteration (for in)',
            slug: 'loops-for-in',
            description: 'Automate repetitive operations over collections and sequences.',
            order: 5,
            estimatedMinutes: 12,
            xpReward: 160,
            conceptIds: ['py_loops'],
            challenges: [
              {
                id: 'ch_py_2_2',
                lessonId: 'py_lesson_5',
                conceptId: 'py_loops',
                title: 'Iterating Through Tasks',
                instructionMarkdown: `A \`for\` loop in Python allows you to iterate over items in a list in sequential order.

### Example:
\`\`\`python
fruits = ["apple", "banana", "cherry"]
for fruit in fruits:
    print(fruit)
\`\`\`

### Your Objective:
Loop through the list \`languages\` and print each language to the console.`,
                codeSnippetExample: `for lang in languages:\n    print(lang)`,
                starterCode: `languages = ["Python", "JavaScript", "Rust"]\n\n# Iterate through each language and print it:\n`,
                solutionCode: `languages = ["Python", "JavaScript", "Rust"]\nfor lang in languages:\n    print(lang)`,
                hint: `Use: for lang in languages: followed by indented print(lang)`,
                type: 'code',
                tests: [
                  {
                    id: 't_loop_langs',
                    description: 'Prints all three languages line-by-line',
                    expectedOutput: "Python\nJavaScript\nRust",
                  }
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'py_mod_3',
        courseId: 'python',
        title: '3. Functions & Reusability',
        description: 'Encapsulate logic into reusable functions with parameters and return values.',
        order: 3,
        lessons: [
          {
            id: 'py_lesson_6',
            moduleId: 'py_mod_3',
            courseId: 'python',
            title: 'Defining Functions & Return Values',
            slug: 'functions-and-returns',
            description: 'Create modular, testable components using def and return statements.',
            order: 6,
            estimatedMinutes: 15,
            xpReward: 200,
            conceptIds: ['py_functions'],
            challenges: [
              {
                id: 'ch_py_3_1',
                lessonId: 'py_lesson_6',
                conceptId: 'py_functions',
                title: 'Calculate Tax Function',
                instructionMarkdown: `Functions bundle a set of instructions under a single name. Define a function using \`def\`, followed by parameter parentheses and a colon (\`:\`).

A function sends back its output using the \`return\` keyword.

### Example:
\`\`\`python
def double_value(x):
    return x * 2

result = double_value(10)
print(result) # 20
\`\`\`

### Your Objective:
1. Define a function named \`calculate_tax\` that takes one parameter: \`amount\`.
2. Inside the function, return \`amount * 0.15\`.
3. Call the function with \`100\` and print the result.`,
                codeSnippetExample: `def calculate_tax(amount):\n    return amount * 0.15\n\nprint(calculate_tax(100))`,
                starterCode: `# 1. Define calculate_tax(amount) that returns amount * 0.15:\n\n# 2. Call calculate_tax(100) and print the result:\n`,
                solutionCode: `def calculate_tax(amount):\n    return amount * 0.15\n\nprint(calculate_tax(100))`,
                hint: `Use: def calculate_tax(amount): return amount * 0.15, then print(calculate_tax(100))`,
                type: 'code',
                tests: [
                  {
                    id: 't_fn_tax',
                    description: 'Calls calculate_tax(100) and prints 15.0',
                    expectedOutput: '15.0',
                  }
                ],
                diagnosticRules: [
                  {
                    id: 'rule_print_instead_of_return',
                    mistakeType: 'return_vs_print',
                    pattern: 'def\\s+calculate_tax.*print\\(',
                    message: 'Functions meant to compute values should use `return` rather than `print()`. `return` sends the computed value back to the caller!',
                    fixSuggestion: 'Use `return amount * 0.15` inside the function'
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'javascript',
    title: 'JavaScript (ES6+)',
    slug: 'javascript',
    description: 'Learn modern JavaScript from ground up. DOM manipulation, async programming, Promises, and state management.',
    category: 'web',
    accentColor: 'var(--course-js)',
    bgLightColor: 'var(--course-js-bg)',
    borderColor: 'var(--course-js-border)',
    difficulty: 'Beginner',
    estimatedHours: 28,
    totalLessons: 18,
    isPrimary: false,
    isLocked: false,
    skillsTaught: ['Variables & Scoping', 'Arrow Functions', 'Array Methods (map, filter)', 'Async/Await', 'Fetch API'],
    modules: []
  },
  {
    id: 'html',
    title: 'Semantic HTML5',
    slug: 'html',
    description: 'Structure modern web applications with semantic tags, accessibility best practices, and search engine optimization.',
    category: 'web',
    accentColor: 'var(--course-html)',
    bgLightColor: 'var(--course-html-bg)',
    borderColor: 'var(--course-html-border)',
    difficulty: 'Beginner',
    estimatedHours: 12,
    totalLessons: 10,
    isPrimary: false,
    isLocked: false,
    skillsTaught: ['Document Hierarchy', 'Forms & Inputs', 'Semantic Sections', 'ARIA & Accessibility'],
    modules: []
  },
  {
    id: 'css',
    title: 'Modern CSS & Layouts',
    slug: 'css',
    description: 'Master Flexbox, Grid, custom properties, responsive design tokens, and fluid typography.',
    category: 'web',
    accentColor: 'var(--course-css)',
    bgLightColor: 'var(--course-css-bg)',
    borderColor: 'var(--course-css-border)',
    difficulty: 'Intermediate',
    estimatedHours: 20,
    totalLessons: 15,
    isPrimary: false,
    isLocked: false,
    skillsTaught: ['Flexbox Positioning', 'CSS Grid Systems', 'Design Tokens', 'Micro-interactions'],
    modules: []
  },
  {
    id: 'dsa',
    title: 'Data Structures & Algorithms',
    slug: 'dsa',
    description: 'Master technical interview foundations: asymptotic analysis (Big-O), arrays, trees, hash maps, and recursion.',
    category: 'cs',
    accentColor: 'var(--course-dsa)',
    bgLightColor: 'var(--course-dsa-bg)',
    borderColor: 'var(--course-dsa-border)',
    difficulty: 'Intermediate',
    estimatedHours: 35,
    totalLessons: 25,
    isPrimary: false,
    isLocked: false,
    skillsTaught: ['Big-O Notation', 'Two Pointers', 'Binary Search', 'Linked Lists', 'Recursion & Memoization'],
    modules: []
  }
];
