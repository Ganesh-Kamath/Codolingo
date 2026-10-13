# Codolingo Curriculum Content Guide

This document defines the curriculum authoring standard for Codolingo, including exercise schemas, required quality criteria, the 9 automated validation rules, and instructions on running the verification gate.

---

## 1. Exercise Schema & Structure

Every curriculum lesson is defined in TypeScript under `src/curriculum/python/foundations/` (or future units under `src/curriculum/python/content/`) adhering to `QuestionMetadata` in [`src/types/question.ts`](file:///c:/Users/kamat/Desktop/Codolingo/src/types/question.ts).

### Core Fields

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier (e.g., `py_fnd_1_1`, `py_fnd_final_1`). |
| `unit` | `string` | Target unit identifier (e.g., `unit_01`). |
| `lesson` | `string` | Lesson numbering (e.g., `1.4`, `3.1`). |
| `section` | `string` | Section / sub-topic label. |
| `concept` | `string` | Atomic concept tested (e.g., `print_syntax`, `operator_precedence`). |
| `learning_objective` | `string` | Observable action the learner accomplishes. |
| `difficulty` | `'easy' \| 'medium' \| 'hard'` | Pedagogical difficulty tier. |
| `question_type` | `QuestionType` | Exercise interaction format (see below). |
| `prompt` | `string` | Clear markdown instruction with code fences. |
| `misconception_tag` | `MisconceptionTag` | Mandatory tag from the allowed taxonomy. |
| `explanation` | `string` | Feedback explaining *why* the answer is correct and why common mistakes happen. |
| `xp` | `number` | Experience points reward (15–50 XP). |
| `estimated_time` | `number` | Estimated completion time in seconds (30–120s). |

### Question Types

- **`WRITE_CODE`**: Student writes code from scratch or guidance to satisfy automated test cases.
- **`DEBUG_CODE`**: Student finds and fixes an intentional bug in the `starter_code`.
- **`APPLY`**: Multi-step mini-challenge applying real-world context.
- **`PREDICT_OUTPUT`**: Learner determines what a snippet outputs before running it.
- **`MULTIPLE_CHOICE`**: Conceptual multiple choice with distractor explanations.
- **`TRUE_FALSE_WITH_REASONING`**: Binary choice backed by explanation options.
- **`CODE_COMPLETION`**: Fill in single token or keyword.
- **`TRACE_CODE`**: Step-by-step state tracing over variable assignments.

---

## 2. Test Cases & Anti-Hardcoding Standard

Code questions (`WRITE_CODE`, `DEBUG_CODE`, `APPLY`) must include structured test cases:

```typescript
test_cases: [
  {
    id: 'tc_1',
    description: 'Computes total bill of 60.0 and stores in variable total',
    expectedOutput: '60.0',
    assertionPython: "assert float(_raw_stdout.strip()) == 60.0 and _user_namespace.get('total') == 60.0"
  },
  {
    id: 'tc_2',
    description: 'Uses int conversion on bill_text',
    expectedOutput: '60.0',
    assertionPython: "assert 'int(' in _user_code and _user_namespace.get('bill') == 50",
    hidden: true
  }
]
```

### Test Case Rules
1. **Mandatory Hidden Tests**: At least one test case must have `hidden: true` so edge cases cannot be gamed.
2. **Prevent Hardcoding Bypasses**: Never test only static `expectedOutput` if the exercise involves variables, inputs, or calculations. Use `_user_namespace.get('var')` or vary inputs across test cases to ensure the student actually computed the result.

---

## 3. Allowed Misconception Taxonomy

Every exercise must specify a `misconception_tag` matching one of the 13 canonical taxonomy tags in [`src/types/question.ts`](file:///c:/Users/kamat/Desktop/Codolingo/src/types/question.ts):

1. `STRING_VS_NUMBER` — Confusing numeric strings (`"42"`) with numbers (`42`).
2. `ASSIGNMENT_VS_COMPARISON` — Confusing `=` (assignment) with `==` (equality).
3. `OFF_BY_ONE` — Boundary indexing or range mistakes.
4. `WRONG_OPERATOR` — Choosing incorrect operator (`/` vs `//`, `*` vs `+`, etc.).
5. `WRONG_TYPE` — Incompatible operand types (e.g. `str + int`).
6. `VARIABLE_VALUE_CONFUSION` — Confusing variable names with their stored values or string literals.
7. `PRECEDENCE_CONFUSION` — Misunderstanding PEMDAS or parentheses grouping.
8. `BOOLEAN_LOGIC_CONFUSION` — Misapplying `and`, `or`, or `not`.
9. `SYNTAX_ERROR` — Missing colons, unclosed quotes, invalid identifiers.
10. `INDENTATION_ERROR` — Missing or inconsistent block indentation in `if` statements.
11. `INPUT_IS_STRING` — Forgetting that `input()` always returns text strings.
12. `CONDITION_BOUNDARY` — Misapplying boundary operators (`>` vs `>=`).
13. `LOOP_EXECUTION_CONFUSION` — Mispredicting loop bounds or accumulation.

---

## 4. The 9 Automated Quality Rules

The automated validator gate [`scripts/validate-exercises.cjs`](file:///c:/Users/kamat/Desktop/Codolingo/scripts/validate-exercises.cjs) enforces:

1. **Reference Solution Validity (`reference_solution_fails`)**: `solution_code` must pass 100% of its test cases.
2. **Starter Code Completion Guard (`starter_code_passes`)**: `starter_code` must fail tests; it cannot already pass before user interaction.
3. **Hidden Test Enforcement (`no_hidden_test`)**: All `WRITE_CODE`, `DEBUG_CODE`, and `APPLY` questions must include at least one `hidden: true` test case.
4. **Hardcoding Guard (`hardcoded_output_pass`)**: Tests cannot be bypassed by printing the expected output without satisfying the variable or calculation logic.
5. **Single Defensible Answer (`multi_defensible_answer`)**: Multiple choice and prediction options must have exactly one correct answer; no distractor may match real Python execution.
6. **Execution Output Parity (`predict_output_mismatch`)**: `expected_output` for `PREDICT_OUTPUT` must match real headless Python execution stdout (or exception name).
7. **Explanation Consistency (`explanation_contradiction`)**: Explanations must never contradict the correct answer or declare a distractor to be correct.
8. **Deduplication (`near_duplicates`)**: No two questions in the same lesson may have high prompt token overlap (Jaccard similarity $\ge 85\%$).
9. **Taxonomy Conformance (`misconception_tag_invalid_or_missing`)**: Misconception tags must be present and valid members of the allowed 13-tag taxonomy.

---

## 5. Running the Exercise Gate

To run the full automated curriculum verification gate:

```bash
npm run validate
```

Or run directly:

```bash
node scripts/validate-exercises.cjs
```

### Gate Behavior:
- **On Failure**: Prints a readable report grouped by Lesson and Exercise ID with specific failure reasons, marks the unit unplayable in [`src/curriculum/python/curriculumStatus.json`](file:///c:/Users/kamat/Desktop/Codolingo/src/curriculum/python/curriculumStatus.json), and exits with exit code `1`.
- **On Success**: Prints verification badges for all exercises, generates/updates [`src/curriculum/python/curriculumStatus.json`](file:///c:/Users/kamat/Desktop/Codolingo/src/curriculum/python/curriculumStatus.json) marking the unit playable, and exits with exit code `0`.
