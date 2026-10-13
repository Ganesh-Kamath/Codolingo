# Codolingo Curriculum Map: Canonical Units 1–6

**Document Version:** 1.0.0  
**Status:** Certified & Active  
**Author:** Codolingo Core Curriculum Engineering  

---

## 1. Overview & Architectural Resolution

### 1.1 The Problem
Historically, Codolingo had two divergent definitions of **Unit 1**:
1. **The Raw Content Curriculum (`content/unit_01/*.json` & `pythonCourse.ts`):** Defined a 6-lesson unit focusing on true introductory basics (What is Programming, How Python Works, Running Programs, The Print Function, Comments, Basic Errors).
2. **The Foundations Implementation (`src/curriculum/python/foundations/`):** Implemented a 10-lesson single-unit track that compressed topics from five distinct units into Unit 1 (Variables, Arithmetic, Strings, Input, Casting, Comparisons, Boolean Logic, If/Else, Synthesis).

This created massive structural contradictions:
- **Topic Duplication:** A learner who finished the 10 foundations lessons was forced to relearn Variables in Unit 2, Arithmetic and Comparisons in Unit 3, Input in Unit 4, and Branching in Unit 5.
- **UI & Syllabus Mismatch:** The sidebar, syllabus, and course manifest declared 6 lessons for Unit 1, while the learning path runner displayed 10 lessons.
- **Content Fragmentation:** High-quality, hand-crafted exercises with rich pedagogical metadata (`mental_model`, `misconception_tag`, `repair_concept`) were isolated inside a monolithic `foundations` directory rather than living in the modular units where they pedagogically belonged.

### 1.2 The Resolution: The Non-Overlapping Canonical Curriculum
We establish a single canonical architecture enforcing **One Concept, One Unit, One Home**:
- **Unit 1 (Python Foundations):** Strictly true foundations: programming mindset, Python execution model, running code, print outputs, comments, and syntax errors.
- **Unit 2 (Variables and Data):** Variable lifecycle, naming rules, integer/float types, string basics, booleans, `type()`, and explicit type casting.
- **Unit 3 (Operators and Math):** Arithmetic math, PEMDAS precedence, assignment shortcuts, comparisons (`==`, `<`, `>`), and boolean logic (`and`, `or`, `not`).
- **Unit 4 (User Input and Output):** Interactive `input()`, numeric conversion of user inputs, string concatenation, and modern `f-strings`.
- **Unit 5 (Conditional Logic):** `if`, `else`, `elif`, nesting, truthiness, and the Interactive Calculator synthesis project.
- **Unit 6 (Loops and Repetition):** Repetition rationale, `while` loops, infinite loop protection, `for` loops, `range()`, `break`/`continue`, nested loops, and the Number Guessing Game.

All 105 hand-written foundations questions are **reused and redistributed** into their canonical units rather than deleted.

---

## 2. Canonical Syllabus for Units 1–6

| Unit | Lesson ID | Lesson Title | Canonical Concept | Content Source |
| :--- | :--- | :--- | :--- | :--- |
| **Unit 1: Python Foundations** | `1.1` | What Is Programming? | Algorithms, instructions, determinism | `content/unit_01/1.1_what_is_programming.json` |
| | `1.2` | How Python Works | Interpreter, bytecode, CPython execution | `content/unit_01/1.2_how_python_works.json` |
| | `1.3` | Running Your First Python Program | Interactive vs script, `.py` files | `content/unit_01/1.3_running_your_first_python_program.json` |
| | `1.4` | The Print Function | `print()`, multiple args, string literals | Hand-written `lesson01.ts` (`py_fnd_1_1`–`py_fnd_1_10`) |
| | `1.5` | Comments and Code Structure | `#` comments, PEP 8 indentation, structure | `content/unit_01/1.5_comments_and_code_structure.json` |
| | `1.6` | Basic Errors | `SyntaxError`, `NameError`, reading tracebacks | `content/unit_01/1.6_basic_errors.json` |
| | `unit_01_checkpoint` | Unit 1 Checkpoint | Fundamentals of running code & errors | Checkpoint Challenge |
| **Unit 2: Variables and Data** | `2.1` | Variables | Variable allocation, reassignment, reading | Hand-written `lesson02.ts` (`py_fnd_2_1`–`py_fnd_2_10`) |
| | `2.2` | Naming Variables | `snake_case`, reserved keywords, casing rules | `content/unit_02/2.2_naming_variables.json` |
| | `2.3` | Integers and Floats | `int` vs `float`, precision, numeric types | `content/unit_02/2.3_integers_and_floats.json` |
| | `2.4` | Strings | String literals, concatenation, repetition | Hand-written `lesson04.ts` (`py_fnd_4_1`–`py_fnd_4_10`) |
| | `2.5` | Booleans | `True` & `False` literals, boolean type | `content/unit_02/2.5_booleans.json` |
| | `2.6` | Data Types and the `type()` Function | Inspecting types, dynamic typing mechanics | `content/unit_02/2.6_data_types_and_the_type_function.json` |
| | `2.7` | Type Conversion (Casting) | `int()`, `float()`, `str()`, `ValueError` | Hand-written `lesson06.ts` (`py_fnd_6_1`–`py_fnd_6_10`) |
| | `unit_02_checkpoint` | Unit 2 Checkpoint | Synthesis of variables, types, and casting | Checkpoint Challenge |
| **Unit 3: Operators and Math** | `3.1` | Arithmetic Operators | `+`, `-`, `*`, `/`, `//`, `%`, `**` | Hand-written `lesson03.ts` (`py_fnd_3_1`–`py_fnd_3_10`) |
| | `3.2` | Order of Operations (PEMDAS) | Precedence hierarchy, parentheses grouping | `content/unit_03/3.2_order_of_operations_pemdas.json` |
| | `3.3` | Assignment Operators | `+=`, `-=`, `*=`, `/=`, `%=` shortcuts | `content/unit_03/3.3_assignment_operators.json` |
| | `3.4` | Comparison Operators | `==`, `!=`, `<`, `>`, `<=`, `>=`, `=` vs `==` | Hand-written `lesson07.ts` (`py_fnd_7_1`–`py_fnd_7_10`) |
| | `3.5` | Logical Operators | `and`, `or`, `not`, short-circuit evaluation | Hand-written `lesson08.ts` (`py_fnd_8_1`–`py_fnd_8_10`) |
| | `unit_03_checkpoint` | Unit 3 Checkpoint | Math, comparisons, and logic synthesis | Checkpoint Challenge |
| **Unit 4: User Input and Output** | `4.1` | The `input()` Function | Storing user responses, string return type | Hand-written `lesson05.ts` (`py_fnd_5_1`–`py_fnd_5_10`) |
| | `4.2` | Processing Numeric Input | Combining `input()` with `int()` / `float()` | `content/unit_04/4.2_processing_numeric_input.json` |
| | `4.3` | String Concatenation | Formatting output with commas and `+` | `content/unit_04/4.3_string_concatenation.json` |
| | `4.4` | f-strings | Formatted strings `f"{var}"`, inline expressions | `content/unit_04/4.4_f_strings.json` |
| | `unit_04_checkpoint` | Unit 4 Checkpoint | Complete CLI input-processing pipelines | Checkpoint Challenge |
| **Unit 5: Conditional Logic** | `5.1` | The `if` Statement | Branching, conditions, indentation blocks | Hand-written `lesson09.ts` (`py_fnd_9_1`–`py_fnd_9_10`) |
| | `5.2` | The `else` Statement | Fallback branches, binary decisions | `content/unit_05/5.2_the_else_statement.json` |
| | `5.3` | Multiple Paths with `elif` | Multi-way branching, order of evaluation | `content/unit_05/5.3_multiple_paths_with_elif.json` |
| | `5.4` | Nested Conditions | Deep decision trees, guard clauses | `content/unit_05/5.4_nested_conditions.json` |
| | `5.5` | Truthiness | Truthy/falsy objects, empty sequences | `content/unit_05/5.5_truthiness.json` |
| | `5.6` | Project: Interactive Calculator | Multi-step interactive arithmetic CLI | Hand-written `lesson10.ts` (`py_fnd_10_1`–`py_fnd_10_10`) |
| | `unit_05_checkpoint` | Conditional Logic Capstone | 5 synthesis challenges (BMI, Tip, Cart) | Hand-written `finalChallenge.ts` (`py_fnd_final_1`–`py_fnd_final_5`) |
| **Unit 6: Loops and Repetition** | `6.1` | Why We Need Loops | Code repetition, DRY principle | `content/unit_06/6.1_why_we_need_loops.json` |
| | `6.2` | The `while` Loop | State-based iteration, condition checks | `content/unit_06/6.2_the_while_loop.json` |
| | `6.3` | Avoiding Infinite Loops | Counter increments, sentinel values | `content/unit_06/6.3_avoiding_infinite_loops.json` |
| | `6.4` | The `for` Loop | Definite iteration over sequences | `content/unit_06/6.4_the_for_loop.json` |
| | `6.5` | The `range()` Function | Start, stop, step arguments | `content/unit_06/6.5_the_range_function.json` |
| | `6.6` | Loop Control: `break` and `continue` | Early termination, skipping iterations | `content/unit_06/6.6_loop_control_break_and_continue.json` |
| | `6.7` | Nested Loops | Grids, matrices, 2D coordinates | `content/unit_06/6.7_nested_loops.json` |
| | `6.8` | Project: Number Guessing Game | Synthesis game with random, while, and break | `content/unit_06/6.8_project_number_guessing_game.json` |
| | `unit_06_checkpoint` | Unit 6 Checkpoint | Iteration and algorithmic repetition mastery | Checkpoint Challenge |

---

## 3. Foundations Redistribution Matrix

Every single hand-written question from `src/curriculum/python/foundations/` has been redistributed into its exact canonical topic. No question was discarded.

| Original File | Questions | Original Topic | Canonical Destination | Destination Lesson Title |
| :--- | :--- | :--- | :--- | :--- |
| `lesson01.ts` | `py_fnd_1_1` – `py_fnd_1_10` (10) | Print execution, syntax, quotes | **Unit 1, Lesson 1.4** | The Print Function |
| `lesson02.ts` | `py_fnd_2_1` – `py_fnd_2_10` (10) | Variable allocation & reassignment | **Unit 2, Lesson 2.1** | Variables |
| `lesson03.ts` | `py_fnd_3_1` – `py_fnd_3_10` (10) | Precedence, float division, math | **Unit 3, Lesson 3.1** | Arithmetic Operators |
| `lesson04.ts` | `py_fnd_4_1` – `py_fnd_4_10` (10) | String literals, `+`, `*`, quotes | **Unit 2, Lesson 2.4** | Strings |
| `lesson05.ts` | `py_fnd_5_1` – `py_fnd_5_10` (10) | `input()`, text returns, conversion | **Unit 4, Lesson 4.1** | The `input()` Function |
| `lesson06.ts` | `py_fnd_6_1` – `py_fnd_6_10` (10) | `int()`, `float()`, `str()` casting | **Unit 2, Lesson 2.7** | Type Conversion (Casting) |
| `lesson07.ts` | `py_fnd_7_1` – `py_fnd_7_10` (10) | Comparisons, `=`, `==`, boundaries | **Unit 3, Lesson 3.4** | Comparison Operators |
| `lesson08.ts` | `py_fnd_8_1` – `py_fnd_8_10` (10) | `and`, `or`, `not`, truth tables | **Unit 3, Lesson 3.5** | Logical Operators |
| `lesson09.ts` | `py_fnd_9_1` – `py_fnd_9_10` (10) | `if`, `else`, `elif`, indentation | **Unit 5, Lesson 5.1** | The `if` Statement |
| `lesson10.ts` | `py_fnd_10_1` – `py_fnd_10_10` (10) | Full pipeline synthesis | **Unit 5, Lesson 5.6** | Project: Interactive Calculator |
| `finalChallenge.ts` | `py_fnd_final_1` – `py_fnd_final_5` (5) | Capstone challenges | **Unit 5 Checkpoint** | Conditional Logic Capstone |

**Total Hand-Written Questions Preserved:** **105 / 105 (100%)**

---

## 4. Content Status & Readiness

### 4.1 Unit 1 (Playable & Certified)
- **Lessons:** 6 lessons (`1.1` to `1.6`).
- **Lesson Structure:**
  - `1.1`: What Is Programming? (15 curated blocks in `selectedLessons.json`)
  - `1.2`: How Python Works (15 curated blocks in `selectedLessons.json`)
  - `1.3`: Running Your First Python Program (15 curated blocks in `selectedLessons.json`)
  - `1.4`: The Print Function (10 hand-crafted foundations blocks from `lesson01.ts` with Fix-It Lab diagnostics)
  - `1.5`: Comments and Code Structure (15 curated blocks in `selectedLessons.json`)
  - `1.6`: Basic Errors (15 curated blocks in `selectedLessons.json`)
- **Status:** **100% Playable & Certified** (Tracked in `curriculumStatus.json`).

### 4.2 Units 2–6 (Coming Soon / Staged for Verification)
- **Foundations Anchor Lessons:** Units 2, 3, 4, and 5 now each contain at least one fully hand-crafted lesson with deep repair diagnostics (e.g. `2.1`, `2.4`, `2.7`, `3.1`, `3.4`, `3.5`, `4.1`, `5.1`, `5.6`).
- **Raw JSON Pools:** All lessons in Units 2–6 have 30 candidate items in `content/unit_XX/*.json` and 15 pre-indexed blocks in `selectedLessons.json`.
- **Roadmap to Unlock:** Units 2 through 6 will transition from `comingSoonUnits` to `playableUnits` sequentially as their remaining raw question test suites achieve zero validation failures under `validate-content.cjs`.

---

## 5. Storage Migration & Backward Compatibility

To ensure existing learners lose zero progress and encounter zero runtime errors:
1. **Idempotent Migration:** `migrationService.ts` upgrades existing progress states to `_version: 4` (`_curriculumVersion: 2`).
2. **Progress Credit:** Any user who completed legacy lesson `1.1` retains completion of Unit 1 (`1.1`, `1.2`, `1.3`, `1.4`). Users who completed legacy lessons `1.2` through `1.10` receive credit for the respective canonical skills in Units 2–5.
3. **Skill ID Realignment:** Legacy skill IDs `py_skill_1_7` through `py_skill_1_10` are remapped to their valid canonical equivalents (`py_skill_3_4`, `py_skill_3_5`, `py_skill_5_1`, `py_skill_5_6`).
4. **Storage Key Invariance:** The primary localStorage key remains strictly `codolingo_progress_v3`.

---

## 6. Verification Checklist

- [x] Canonical 6-lesson Unit 1 configured in `PYTHON_MASTER_SYLLABUS.txt`.
- [x] `pathCurriculum.ts` directly consumes canonical `FULL_PYTHON_COURSE`.
- [x] `courseService.ts` resolves canonical lesson IDs without topic collisions.
- [x] All 105 hand-written questions mapped to canonical locations in `src/curriculum/python/foundations/`.
- [x] Dynamic skill count in `LearningPath.tsx` (replaces hardcoded `/ 10`).
- [x] Schema migration tested with legacy test fixtures in `scripts/test-mastery-migration.cjs`.
- [x] Zero TypeScript / Vite build errors (`npm run build`).
