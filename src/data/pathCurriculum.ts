import { LearningCourse, Unit } from '../types';

export const PYTHON_COURSE: LearningCourse = {
  id: 'python',
  title: 'Python Career Path',
  slug: 'python',
  icon: 'Terminal',
  description: 'Master programming from absolute first principles to professional backend & data development.',
  units: [
    {
      id: 'py_unit_1',
      courseId: 'python',
      unitNumber: 1,
      title: 'Unit 1: Python Foundations',
      subtitle: 'Statements, Identifiers & Memory',
      description: 'Understand how computers store values in memory and write your first valid Python scripts.',
      themeColor: '#10B981', // Emerald
      accentBg: '#ECFDF5',
      skills: [
        {
          id: 'py_skill_hello',
          unitId: 'py_unit_1',
          title: 'Hello World',
          slug: 'hello-world',
          description: 'Standard output, the print function, and running your first instructions.',
          order: 1,
          status: 'completed',
          mastery: 5,
          maxMastery: 5,
          iconName: 'player-play',
          pathOffset: 0,
          lessons: [
            {
              id: 'les_hello_1',
              skillId: 'py_skill_hello',
              title: 'Outputting Text',
              order: 1,
              estimatedMinutes: 3,
              xpReward: 15,
              steps: [
                {
                  id: 'step_h1',
                  type: 'learn',
                  title: 'The print() Function',
                  contentMarkdown: 'In Python, we use the `print()` function to display text or numbers to the console screen.'
                }
              ]
            }
          ]
        },
        {
          id: 'py_skill_variables',
          unitId: 'py_unit_1',
          title: 'Variables',
          slug: 'variables',
          description: 'Bind names to values in memory and reference them later in your code.',
          order: 2,
          status: 'current',
          mastery: 2,
          maxMastery: 5,
          iconName: 'variable',
          requiresSkillId: 'py_skill_hello',
          pathOffset: -0.6, // Slight left curve
          lessons: [
            {
              id: 'les_var_1',
              skillId: 'py_skill_variables',
              title: 'What is a Variable?',
              order: 1,
              estimatedMinutes: 4,
              xpReward: 20,
              steps: [
                {
                  id: 'v1_step_learn',
                  type: 'learn',
                  title: 'Step 1: What is a Variable?',
                  subtitle: 'Concept Introduction',
                  contentMarkdown: `A **variable** is like a labeled container in the computer's memory.

Instead of typing the same value over and over, you give it a clear, descriptive name.

* The name goes on the **left**.
* The assignment symbol (\`=\`) goes in the **middle**.
* The value goes on the **right**.`
                },
                {
                  id: 'v1_step_see',
                  type: 'see',
                  title: 'Step 2: Inspecting Syntax',
                  subtitle: 'Code Structure Breakdown',
                  codeSnippet: `name = "Ganesh"\nage = 18\nprint(name)`,
                  contentMarkdown: `Notice three important things:
1. \`name\` holds the text string \`"Ganesh"\`.
2. \`age\` holds the integer number \`18\` (numbers don't need quotes).
3. Passing \`name\` into \`print(name)\` displays its stored value, not the word "name".`
                },
                {
                  id: 'v1_step_predict',
                  type: 'predict',
                  title: 'Step 3: Predict the Output',
                  subtitle: 'Test your intuition before writing code',
                  predictCode: `age = 18\nprint(age)`,
                  predictQuestion: 'What will be printed to the screen when this code runs?',
                  predictOptions: [
                    {
                      id: 'opt_1',
                      text: '18',
                      isCorrect: true,
                      explanation: 'Correct! The variable age was assigned 18, so print(age) outputs the number 18.'
                    },
                    {
                      id: 'opt_2',
                      text: '"age"',
                      isCorrect: false,
                      explanation: 'Not quite. Without quotation marks, Python evaluates the variable name and retrieves its stored value.'
                    },
                    {
                      id: 'opt_3',
                      text: 'Nothing (Syntax Error)',
                      isCorrect: false,
                      explanation: 'This is completely valid Python code.'
                    }
                  ]
                },
                {
                  id: 'v1_step_write',
                  type: 'write',
                  title: 'Step 4: Write Real Code',
                  subtitle: 'Write and run your solution in the Monaco sandbox',
                  prompt: `Create a variable named **\`city\`** and assign it the string value **\`"Mumbai"\`**.

Then, print the value of \`city\` using \`print(city)\`.`,
                  starterCode: `# 1. Create a variable called city\ncity = ""\n\n# 2. Print the city variable\n`,
                  solutionCode: `city = "Mumbai"\nprint(city)`,
                  hint: `Assign "Mumbai" to city: city = "Mumbai", then call print(city)`,
                  tests: [
                    {
                      id: 't_var_1',
                      description: 'Variable city holds "Mumbai" and is printed to output',
                      expectedOutput: 'Mumbai'
                    }
                  ],
                  diagnosticRules: [
                    {
                      id: 'rule_capital_city',
                      mistakeType: 'case_sensitivity',
                      pattern: 'City\\s*=',
                      message: 'Python variables are case-sensitive. You wrote `City`, but the instruction asked for lowercase `city`.',
                      fixSuggestion: 'Use `city = "Mumbai"`'
                    },
                    {
                      id: 'rule_print_literal',
                      mistakeType: 'literal_instead_of_variable',
                      pattern: 'print\\(["\']city["\']\\)',
                      message: 'You printed the string literal `"city"`. To print the variable\'s value, remove the quotes: `print(city)`.',
                      fixSuggestion: 'Change `print("city")` to `print(city)`'
                    }
                  ]
                },
                {
                  id: 'v1_step_apply',
                  type: 'apply',
                  title: 'Step 5: Apply & Reinforce',
                  subtitle: 'Multi-variable memory assignment',
                  prompt: `Variables can store any data type.

1. Create a variable \`price\` set to \`49\` (a number, no quotes).
2. Create a variable \`item\` set to \`"Book"\`.
3. Print \`price\` first, then print \`item\` on the next line.`,
                  starterCode: `price = 49\nitem = "Book"\n\n# Print price, then print item:\n`,
                  solutionCode: `price = 49\nitem = "Book"\nprint(price)\nprint(item)`,
                  hint: `Use print(price) on one line, followed by print(item) on the next.`,
                  tests: [
                    {
                      id: 't_apply_1',
                      description: 'Outputs 49 then Book line-by-line',
                      expectedOutput: '49\nBook'
                    }
                  ]
                },
                {
                  id: 'v1_step_mastery',
                  type: 'mastery',
                  title: 'Step 6: Skill Mastery Challenge',
                  subtitle: 'Variable re-assignment',
                  prompt: `Variables are "variable" — their values can change!

Update the \`status\` variable to \`"Active"\` and print it.`,
                  starterCode: `status = "Pending"\n# Change status to "Active" below:\nstatus = "Active"\n\nprint(status)`,
                  solutionCode: `status = "Pending"\nstatus = "Active"\nprint(status)`,
                  hint: `Write: status = "Active" before the print statement.`,
                  tests: [
                    {
                      id: 't_mastery_1',
                      description: 'Outputs updated status "Active"',
                      expectedOutput: 'Active'
                    }
                  ]
                }
              ]
            },
            {
              id: 'les_var_2',
              skillId: 'py_skill_variables',
              title: 'Creating & Naming Rules',
              order: 2,
              estimatedMinutes: 4,
              xpReward: 20,
              steps: [
                {
                  id: 'v2_step_learn',
                  type: 'learn',
                  title: 'Naming Conventions',
                  contentMarkdown: `In Python, variable names:
* Must start with a letter or underscore (\`user_name\`, \`_count\`)
* Cannot start with numbers (\`1user\` is invalid!)
* Use **snake_case** (lowercase words separated by underscores).`
                }
              ]
            },
            {
              id: 'les_var_3',
              skillId: 'py_skill_variables',
              title: 'Changing Values (Reassignment)',
              order: 3,
              estimatedMinutes: 5,
              xpReward: 25,
              steps: [
                {
                  id: 'v3_step_learn',
                  type: 'learn',
                  title: 'Updating Variables',
                  contentMarkdown: `When you assign a new value to an existing variable, the old value is replaced in memory.`
                }
              ]
            }
          ]
        },
        {
          id: 'py_skill_datatypes',
          unitId: 'py_unit_1',
          title: 'Data Types',
          slug: 'data-types',
          description: 'Integers, floats, booleans, and strings in Python.',
          order: 3,
          status: 'unlocked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'hash',
          requiresSkillId: 'py_skill_variables',
          pathOffset: 0.6, // Slight right curve
          lessons: [
            {
              id: 'les_dt_1',
              skillId: 'py_skill_datatypes',
              title: 'Integers & Floats',
              order: 1,
              estimatedMinutes: 5,
              xpReward: 20,
              steps: [
                {
                  id: 'dt1_learn',
                  type: 'learn',
                  title: 'Numbers in Python',
                  contentMarkdown: 'Python has two main types of numbers:\n* **Integers** (whole numbers like `42`)\n* **Floats** (decimals like `3.14`)'
                },
                {
                  id: 'dt1_write',
                  type: 'write',
                  title: 'Declare Numbers',
                  prompt: 'Create an integer `age` set to `25` and a float `pi` set to `3.14`.',
                  starterCode: 'age = \npi = \nprint(age, pi)',
                  solutionCode: 'age = 25\npi = 3.14\nprint(age, pi)',
                  tests: [
                    {
                      id: 't_dt1',
                      description: 'Outputs 25 and 3.14',
                      expectedOutput: '25 3.14'
                    }
                  ]
                }
              ]
            },
            {
              id: 'les_dt_2',
              skillId: 'py_skill_datatypes',
              title: 'Strings',
              order: 2,
              estimatedMinutes: 4,
              xpReward: 20,
              steps: [
                {
                  id: 'dt2_learn',
                  type: 'learn',
                  title: 'Text Data (Strings)',
                  contentMarkdown: 'Strings store text data. You can use single quotes (`\'hello\'`) or double quotes (`"world"`).'
                },
                {
                  id: 'dt2_write',
                  type: 'write',
                  title: 'Declare Strings',
                  prompt: 'Create a variable `greeting` and assign it the string `"Hello, World!"`. Then print it.',
                  starterCode: 'greeting = \n',
                  solutionCode: 'greeting = "Hello, World!"\nprint(greeting)',
                  tests: [
                    {
                      id: 't_dt2',
                      description: 'Outputs Hello, World!',
                      expectedOutput: 'Hello, World!'
                    }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 'py_skill_expressions',
          unitId: 'py_unit_1',
          title: 'Basic Expressions',
          slug: 'basic-expressions',
          description: 'Arithmetic operators and string concatenations.',
          order: 4,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'code',
          requiresSkillId: 'py_skill_datatypes',
          pathOffset: 0,
          lessons: [
            {
              id: 'les_exp_1',
              skillId: 'py_skill_expressions',
              title: 'Basic Math',
              order: 1,
              estimatedMinutes: 5,
              xpReward: 25,
              steps: [
                {
                  id: 'exp1_learn',
                  type: 'learn',
                  title: 'Arithmetic Operators',
                  contentMarkdown: 'Python supports basic math:\n* Addition: `+`\n* Subtraction: `-`\n* Multiplication: `*`\n* Division: `/`'
                },
                {
                  id: 'exp1_write',
                  type: 'write',
                  title: 'Calculate Total',
                  prompt: 'Create variables `apples = 5` and `oranges = 3`. Create `total = apples + oranges`, and print `total`.',
                  starterCode: 'apples = 5\noranges = 3\ntotal = \nprint(total)',
                  solutionCode: 'apples = 5\noranges = 3\ntotal = apples + oranges\nprint(total)',
                  tests: [
                    {
                      id: 't_exp1',
                      description: 'Outputs 8',
                      expectedOutput: '8'
                    }
                  ]
                }
              ]
            }
          ]
        }
      ],
      checkpoint: {
        id: 'chk_unit_1',
        unitId: 'py_unit_1',
        title: 'Unit 1 Checkpoint',
        description: 'Prove your foundations by building a mini currency converter.',
        status: 'locked',
        xpReward: 75
      }
    },
    {
      id: 'py_unit_2',
      courseId: 'python',
      unitNumber: 2,
      title: 'Unit 2: Working With Data',
      subtitle: 'Strings, Numbers & Interactive Input',
      description: 'Receive inputs from real users, manipulate textual records, and perform mathematical operations.',
      themeColor: '#3B82F6', // Blue
      accentBg: '#EFF6FF',
      skills: [
        {
          id: 'py_skill_strings',
          unitId: 'py_unit_2',
          title: 'Strings & Slicing',
          slug: 'strings',
          description: 'Indexing, string methods, uppercase, lowercase, and length.',
          order: 1,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'typography',
          pathOffset: -0.5,
          lessons: []
        },
        {
          id: 'py_skill_numbers',
          unitId: 'py_unit_2',
          title: 'Numbers & Math',
          slug: 'numbers',
          description: 'Integer arithmetic, floats, modulus, and integer division.',
          order: 2,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'calculator',
          pathOffset: 0.5,
          lessons: []
        },
        {
          id: 'py_skill_input',
          unitId: 'py_unit_2',
          title: 'User Input',
          slug: 'user-input',
          description: 'Making programs interactive with the input() function and typecasting.',
          order: 3,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'terminal',
          pathOffset: 0,
          lessons: []
        }
      ],
      checkpoint: {
        id: 'chk_unit_2',
        unitId: 'py_unit_2',
        title: 'Unit 2 Checkpoint',
        description: 'Terminal receipt generator application.',
        status: 'locked',
        xpReward: 100
      }
    },
    {
      id: 'py_unit_3',
      courseId: 'python',
      unitNumber: 3,
      title: 'Unit 3: Logic & Control Flow',
      subtitle: 'Conditionals & Boolean Algebra',
      description: 'Make decisions in code using if, elif, else, comparison operators, and logical conjunctions.',
      themeColor: '#8B5CF6', // Purple
      accentBg: '#F5F3FF',
      skills: [
        {
          id: 'py_skill_booleans',
          unitId: 'py_unit_3',
          title: 'Boolean Values',
          slug: 'boolean-values',
          description: 'True, False, and logical truthiness.',
          order: 1,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'toggle-left',
          pathOffset: -0.5,
          lessons: []
        },
        {
          id: 'py_skill_comparisons',
          unitId: 'py_unit_3',
          title: 'Comparisons',
          slug: 'comparisons',
          description: 'Evaluating ==, !=, <, >, <=, and >= without assignment pitfalls.',
          order: 2,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'git-commit',
          pathOffset: 0.5,
          lessons: []
        },
        {
          id: 'py_skill_conditions',
          unitId: 'py_unit_3',
          title: 'if / elif / else',
          slug: 'if-conditions',
          description: 'Multi-branch decision logic and indented code blocks.',
          order: 3,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'git-branch',
          pathOffset: 0,
          lessons: []
        }
      ],
      checkpoint: {
        id: 'chk_unit_3',
        unitId: 'py_unit_3',
        title: 'Unit 3 Checkpoint',
        description: 'Automated role-based access controller.',
        status: 'locked',
        xpReward: 125
      }
    },
    {
      id: 'py_unit_4',
      courseId: 'python',
      unitNumber: 4,
      title: 'Unit 4: Loops & Iteration',
      subtitle: 'for, while & Range Generation',
      description: 'Automate repetitive computational tasks over sequences and dynamic collections.',
      themeColor: '#EC4899', // Pink
      accentBg: '#FDF2F8',
      skills: [
        {
          id: 'py_skill_for',
          unitId: 'py_unit_4',
          title: 'for Loops',
          slug: 'for-loops',
          description: 'Iterating through lists, tuples, and string characters.',
          order: 1,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'repeat',
          pathOffset: -0.5,
          lessons: []
        },
        {
          id: 'py_skill_while',
          unitId: 'py_unit_4',
          title: 'while Loops',
          slug: 'while-loops',
          description: 'Condition-driven loops, break, and continue statements.',
          order: 2,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'refresh',
          pathOffset: 0.5,
          lessons: []
        }
      ],
      checkpoint: {
        id: 'chk_unit_4',
        unitId: 'py_unit_4',
        title: 'Unit 4 Checkpoint',
        description: 'Prime number algorithm generator.',
        status: 'locked',
        xpReward: 150
      }
    },
    {
      id: 'py_unit_5',
      courseId: 'python',
      unitNumber: 5,
      title: 'Unit 5: Functions & Scope',
      subtitle: 'Modularity, Parameters & Return Values',
      description: 'Encapsulate repeatable logic into clean, callable functional abstractions.',
      themeColor: '#F59E0B', // Amber
      accentBg: '#FFFBEB',
      skills: [
        {
          id: 'py_skill_functions',
          unitId: 'py_unit_5',
          title: 'Defining Functions',
          slug: 'def-functions',
          description: 'The def keyword, naming, and function call signatures.',
          order: 1,
          status: 'locked',
          mastery: 0,
          maxMastery: 5,
          iconName: 'cpu',
          pathOffset: 0,
          lessons: []
        }
      ],
      checkpoint: {
        id: 'chk_unit_5',
        unitId: 'py_unit_5',
        title: 'Unit 5 Checkpoint',
        description: 'Modular unit test framework.',
        status: 'locked',
        xpReward: 200
      }
    }
  ]
};
