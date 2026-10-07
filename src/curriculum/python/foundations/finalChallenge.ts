import { QuestionMetadata } from '../../../types/question';

export const FINAL_CHALLENGE_QUESTIONS: QuestionMetadata[] = [
  {
    id: 'py_fnd_final_1',
    unit: 'unit_01',
    lesson: 'unit_01_final',
    section: 'Final Challenge 1: Input & Conversion',
    concept: 'input_conversion_arithmetic',
    learning_objective: 'Convert string inputs, perform percentage arithmetic, and format the final total.',
    difficulty: 'medium',
    question_type: 'WRITE_CODE',
    prompt: 'Create a tip calculator program:\n1. Set `bill_text = "50"`\n2. Set `tip_percent = 20`\n3. Convert `bill_text` to an integer, calculate the `tip_amount` (`bill * tip_percent / 100`)\n4. Calculate `total = bill + tip_amount`\n5. Print `total` (should print 60.0)',
    starter_code: '# Calculate tip and total bill\n',
    solution_code: 'bill_text = "50"\ntip_percent = 20\nbill = int(bill_text)\ntip_amount = bill * tip_percent / 100\ntotal = bill + tip_amount\nprint(total)',
    expected_output: '60.0',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Computes total of 60.0',
        expectedOutput: '60.0',
        assertionPython: "assert float(_raw_stdout.strip()) == 60.0"
      },
      {
        id: 'tc_2',
        description: 'Uses int conversion on bill_text',
        expectedOutput: '60.0',
        assertionPython: "assert 'int(' in _user_code"
      }
    ],
    explanation: '`int("50")` yields `50`. Then `50 * 20 / 100 = 10.0`. Finally `50 + 10.0 = 60.0`.',
    hint: 'bill = int(bill_text), tip_amount = bill * tip_percent / 100, total = bill + tip_amount, print(total)',
    xp: 35,
    estimated_time: 90,
    order: 1
  },
  {
    id: 'py_fnd_final_2',
    unit: 'unit_01',
    lesson: 'unit_01_final',
    section: 'Final Challenge 2: Arithmetic Precedence',
    concept: 'bmi_metric_formula',
    learning_objective: 'Compute Body Mass Index (BMI) using weight in kg and height in meters.',
    difficulty: 'hard',
    question_type: 'WRITE_CODE',
    prompt: 'Calculate BMI: `bmi = weight / (height * height)`\n1. Set `weight = 70` (in kg)\n2. Set `height = 1.75` (in meters)\n3. Compute `bmi = weight / (height * height)`\n4. If `bmi >= 25`, print `"Overweight"`\n5. Else, print `"Healthy"` (prints "Healthy")',
    starter_code: '# Calculate BMI and health category\n',
    solution_code: 'weight = 70\nheight = 1.75\nbmi = weight / (height * height)\nif bmi >= 25:\n    print("Overweight")\nelse:\n    print("Healthy")',
    expected_output: 'Healthy',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Correctly outputs "Healthy" for BMI ~22.86',
        expectedOutput: 'Healthy',
        assertionPython: "assert _raw_stdout.strip() == 'Healthy'"
      },
      {
        id: 'tc_2',
        description: 'Uses parenthesis in denominator to enforce height squared',
        expectedOutput: 'Healthy',
        assertionPython: "assert '(' in _user_code and ')' in _user_code"
      }
    ],
    explanation: '`70 / (1.75 * 1.75)` computes `70 / 3.0625 = 22.86`. Because `22.86 < 25`, the program prints `"Healthy"`.',
    hint: 'Wrap (height * height) in parentheses so division happens after the multiplication.',
    xp: 40,
    estimated_time: 100,
    order: 2
  },
  {
    id: 'py_fnd_final_3',
    unit: 'unit_01',
    lesson: 'unit_01_final',
    section: 'Final Challenge 3: Comparison & Boundary',
    concept: 'overtime_pay_calculator',
    learning_objective: 'Calculate regular and overtime pay with a 40-hour boundary cutoff.',
    difficulty: 'hard',
    question_type: 'WRITE_CODE',
    prompt: 'An employee earns $20/hour for regular hours (up to 40) and $30/hour (1.5x) for overtime hours beyond 40.\nWrite a program that:\n1. Set `hours = 45`\n2. Set `hourly_rate = 20`\n3. If `hours > 40`:\n   - Set `regular_pay = 40 * hourly_rate`\n   - Set `overtime_pay = (hours - 40) * (hourly_rate * 1.5)`\n   - Set `total_pay = regular_pay + overtime_pay`\n4. Else:\n   - Set `total_pay = hours * hourly_rate`\n5. Print `total_pay` (should print 950.0)',
    starter_code: '# Calculate overtime and total pay\n',
    solution_code: 'hours = 45\nhourly_rate = 20\nif hours > 40:\n    regular_pay = 40 * hourly_rate\n    overtime_pay = (hours - 40) * (hourly_rate * 1.5)\n    total_pay = regular_pay + overtime_pay\nelse:\n    total_pay = hours * hourly_rate\nprint(total_pay)',
    expected_output: '950.0',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Computes total pay as 950.0',
        expectedOutput: '950.0',
        assertionPython: "assert float(_raw_stdout.strip()) == 950.0"
      }
    ],
    explanation: '40 hours * $20 = $800. 5 overtime hours * $30 = $150. Total pay = $950.0.',
    hint: 'Check if hours > 40, calculate 40 * 20 plus 5 * 30.',
    xp: 45,
    estimated_time: 120,
    order: 3
  },
  {
    id: 'py_fnd_final_4',
    unit: 'unit_01',
    lesson: 'unit_01_final',
    section: 'Final Challenge 4: Condition & Logic',
    concept: 'tiered_shipping_calculator',
    learning_objective: 'Implement a tiered shipping rates calculation using if/elif/else.',
    difficulty: 'hard',
    question_type: 'WRITE_CODE',
    prompt: 'Calculate shipping cost based on weight:\n- If `weight <= 2`, shipping is `5`\n- Elif `weight <= 5`, shipping is `10`\n- Else, shipping is `15`\n\nWrite a program where `weight = 3.5`, sets `shipping`, and prints `shipping` (should print 10).',
    starter_code: '# Tiered shipping cost\n',
    solution_code: 'weight = 3.5\nif weight <= 2:\n    shipping = 5\nelif weight <= 5:\n    shipping = 10\nelse:\n    shipping = 15\nprint(shipping)',
    expected_output: '10',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Correctly outputs 10 for weight 3.5',
        expectedOutput: '10',
        assertionPython: "assert _raw_stdout.strip() == '10'"
      },
      {
        id: 'tc_2',
        description: 'Uses if, elif, and else',
        expectedOutput: '10',
        assertionPython: "assert 'if ' in _user_code and 'elif ' in _user_code and 'else:' in _user_code"
      }
    ],
    explanation: '3.5 is not <= 2 (False), but is <= 5 (True), so shipping is set to 10.',
    hint: 'if weight <= 2:\n    shipping = 5\nelif weight <= 5:\n    shipping = 10\nelse:\n    shipping = 15\nprint(shipping)',
    xp: 40,
    estimated_time: 100,
    order: 4
  },
  {
    id: 'py_fnd_final_5',
    unit: 'unit_01',
    lesson: 'unit_01_final',
    section: 'Final Challenge 5: Small Real-World Program',
    concept: 'parking_fee_with_cap',
    learning_objective: 'Write a full parking garage fee calculator with hourly rate and a daily maximum cap.',
    difficulty: 'hard',
    question_type: 'WRITE_CODE',
    prompt: 'A parking garage charges $4 per hour, but caps the daily fee at a maximum of $25.\nWrite a Python program that:\n1. Sets `hours_parked = 8`\n2. Calculates `fee = hours_parked * 4`\n3. If `fee > 25`, sets `fee = 25` (capped at max)\n4. Prints: `Parking Fee: $25`',
    starter_code: '# Parking garage fee calculator\n',
    solution_code: 'hours_parked = 8\nfee = hours_parked * 4\nif fee > 25:\n    fee = 25\nprint("Parking Fee: $" + str(fee))',
    expected_output: 'Parking Fee: $25',
    test_cases: [
      {
        id: 'tc_1',
        description: 'Outputs Parking Fee: $25 with capped fee',
        expectedOutput: 'Parking Fee: $25',
        assertionPython: "assert _raw_stdout.strip() == 'Parking Fee: $25'"
      },
      {
        id: 'tc_2',
        description: 'Caps fee variable at 25',
        expectedOutput: 'Parking Fee: $25',
        assertionPython: "assert _user_namespace.get('fee') == 25"
      }
    ],
    explanation: '`8 * 4 = 32`. Since `32 > 25`, the conditional caps `fee` at `25`, printing `"Parking Fee: $25"`.',
    hint: 'Calculate fee = hours_parked * 4, if fee > 25: fee = 25, print("Parking Fee: $" + str(fee))',
    xp: 50,
    estimated_time: 120,
    order: 5
  }
];
