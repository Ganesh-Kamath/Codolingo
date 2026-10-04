# Codolingo Curriculum Standard (Commercial Specification)

**Version:** 2.0.0  
**Status:** Authoritative Standard  
**Scope:** All Python Courses, Units, Lessons, and Interactive Exercises in Codolingo  

---

## 1. Pedagogical Philosophy

Codolingo teaches programming through an active, experiential loop:

$$\text{Learn} \longrightarrow \text{Try} \longrightarrow \text{Fail} \longrightarrow \text{Understand Why} \longrightarrow \text{Repair} \longrightarrow \text{Verify} \longrightarrow \text{Apply} \longrightarrow \text{Review} \longrightarrow \text{Master}$$

### Core Principles
1. **Action-First (No Textbooks)**: A learner should never read paragraphs of passive prose without immediately writing, predicting, or repairing code.
2. **Code-First Questions**: Conceptual questions must reference concrete Python snippets rather than abstract trivia.
3. **Misconception-Driven Distractors**: Every wrong answer in a multiple-choice exercise must represent a genuine, documented Python beginner/intermediate mistake (e.g., confusing `=` and `==`, off-by-one indexing, mutable default arguments, print vs return).
4. **Explanations That Teach**: Explanations must explain:
   - What actually happens during execution
   - Why Python behaves this way
   - The underlying language rule
   - The common learner misconception
5. **Adaptive Question Bank**: The 30 items in a lesson constitute an adaptive question pool. A learner normally encounters 8–15 items progressing from Level 1 to Level 5, receiving targeted remediation items if they struggle.

---

## 2. Lesson Structure & Metadata Standard

Every lesson JSON document must satisfy the canonical schema:

```json
{
  "lesson_id": "12.1",
  "title": "Defining Functions",
  "unit": "Functions: The Basics",
  "unit_num": 12,
  "learning_objectives": [
    "Define a Python function using the def keyword and snake_case naming",
    "Call a function and pass positional arguments",
    "Return computed values from a function using the return statement",
    "Distinguish between returning a value and printing to stdout"
  ],
  "prerequisites": ["11.1", "11.2"],
  "items": [ ... ]
}
```

### The 5 Core Lesson Questions
Every lesson must answer:
1. **What will the learner learn?** (Measurable learning objectives)
2. **Why does it matter?** (Practical motivation in micro-lessons)
3. **Can the learner recognize it?** (Level 1: MCQs & concept matching)
4. **Can the learner use it?** (Level 2 & 3: prediction, code completion, sequencing)
5. **Can the learner debug & transfer it?** (Level 4 & 5: bug repair, coding challenges, project milestones)

---

## 3. Five-Level Exercise Progression Standard

Exercises within every lesson must follow a strict cognitive progression:

```
┌─────────────────────────────────────────────────────────────┐
│ LEVEL 1: RECOGNIZE (Items 1–6)                              │
│ Micro-lessons, conceptual recall, syntax identification     │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 2: PREDICT (Items 7–12)                               │
│ Output prediction, execution tracing, flow analysis         │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 3: CONSTRUCT (Items 13–18)                            │
│ Fill in the blank (___), code ordering, statement assembly  │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 4: DEBUG (Items 19–24)                                │
│ Error diagnosis (Syntax/Runtime), fix_the_code challenges   │
├─────────────────────────────────────────────────────────────┤
│ LEVEL 5: CREATE & TRANSFER (Items 25–30)                    │
│ write_the_code with unit tests, scenarios, mastery checks   │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. Item Type Specifications

### 4.1 `micro_lesson`
- **Purpose**: Deliver concise, punchy explanations (max 120 words) with a clean Python snippet demonstrating one key concept.
- **Required Fields**: `id`, `type: "micro_lesson"`, `concept`, `skill`, `difficulty`, `prerequisites`, `title`, `content`.
- **Rule**: Must contain executable code fences (````python ... ````).

### 4.2 `multiple_choice` & `match_code_to_concept`
- **Purpose**: Assess conceptual understanding and active recall.
- **Required Fields**: `prompt`, `options` (exactly 4 options), `correct_answer`, `explanation`.
- **Strict Rule on Distractors**:
  - NO joke/filler options (e.g., "banana", "System Kernel Reboot", "Memory Bus").
  - Distractors must reflect plausible misunderstandings (e.g., `None` vs empty string, shallow vs deep copy, variable scope leaks).

### 4.3 `code_prediction` & `output_prediction`
- **Purpose**: Train mental execution tracing.
- **Required Fields**: `prompt` (containing Python code), `options` (4 predicted outputs), `correct_answer`, `explanation`.
- **Strict Verification**: Code snippet must be verified by deterministic Python AST execution; `correct_answer` MUST match actual stdout.

### 4.4 `fill_in_the_blank`
- **Purpose**: Practice precise keyword, method, and operator syntax.
- **Required Fields**: `prompt` (must contain `___` marker), `correct_answer`, `accepted_answers` (list of acceptable variants), `explanation`.
- **Rule**: Replacing `___` with `correct_answer` must produce syntactically valid Python.

### 4.5 `code_ordering`
- **Purpose**: Reinforce algorithmic sequencing, setup before usage, and indentation blocks.
- **Required Fields**: `prompt`, `options` (3–5 shuffled lines), `correct_answer` (same lines in correct execution order), `explanation`.
- **Rule**: `options` and `correct_answer` must contain identical sets of strings.

### 4.6 `fix_the_code` & `error_diagnosis`
- **Purpose**: Real-world debugging skills.
- **Required Fields**: `prompt`, `starter_code` (contains the specific bug), `solution_code` (working fix), `hint`, `explanation`.
- **Rule**: `solution_code` must pass `ast.parse` and execute cleanly.

### 4.7 `write_the_code` & `mini_challenge`
- **Purpose**: Practical coding application and mastery transfer.
- **Required Fields**: `prompt`, `starter_code`, `solution_code`, `test_cases` (list of input/output dictionaries), `hint`, `explanation`.
- **Rule**: `solution_code` executed against each test case input must produce the expected output.

---

## 5. Standardized Taxonomy

### 5.1 Canonical Concept Hierarchy
Concepts must use standardized snake_case identifiers:
- `variables_and_types`: `variable_assignment`, `naming_conventions`, `integer_operations`, `float_precision`, `string_immutability`, `type_casting`
- `operators`: `arithmetic_precedence`, `comparison_equality`, `identity_vs_equality`, `boolean_logic_short_circuit`
- `control_flow`: `if_elif_else_branching`, `truthiness`, `while_termination`, `for_in_iteration`, `range_bounds`, `break_continue_flow`
- `collections`: `list_indexing_bounds`, `list_mutation_methods`, `slice_stride`, `dict_key_immutability`, `dict_lookup_get`, `set_uniqueness`
- `functions`: `def_syntax`, `return_vs_print`, `default_mutable_arguments`, `args_kwargs_packing`, `scope_global_nonlocal`, `lambda_pure_functions`
- `oop`: `class_definition`, `self_binding`, `init_constructor`, `instance_vs_class_attributes`, `inheritance_super`, `dunder_str_repr`
- `advanced_python`: `decorator_wrapping`, `generator_yield_state`, `context_manager_protocol`, `exception_handling_custom`, `type_hinting_mypy`
- `dsa`: `big_o_time_space`, `two_pointers`, `sliding_window`, `stack_lifo`, `queue_fifo`, `linked_list_traversal`, `binary_search_bounds`, `tree_dfs_bfs`

### 5.2 Canonical Skill Hierarchy
- `recognition`: Identifying keywords, tokens, and data types.
- `recall`: Recalling syntax rules and built-in functions.
- `prediction`: Tracing execution flow and calculating exact stdout.
- `syntax`: Typing exact Python keywords, operators, and method signatures.
- `sequencing`: Ordering lines into logically executable Python.
- `debugging`: Diagnosing exceptions and repairing syntax/logic errors.
- `application`: Implementing straightforward functions to solve explicit prompts.
- `synthesis`: Combining multiple concepts to build modules or pipelines.
- `mastery`: Independently solving transfer problems under edge cases.

---

## 6. Project & Capstone Standard

Project lessons (e.g., `5.6 Interactive Calculator`, `6.8 Number Guessing Game`, `25.6 Weather Dashboard`, `42 Capstone`) must provide:
1. **Realistic Context**: Industry-relevant problems (automation, data parsing, APIs, CLI utilities).
2. **Staged Milestones**: Decomposed into 4–8 progressive steps rather than a single monolithic prompt.
3. **Structured Verification**: Unit tests for every milestone function.
4. **Defensive Programming**: Handling invalid user inputs, missing keys, and network timeouts.

---

## 7. Commercial Quality Gates

A curriculum release candidate is accepted ONLY when:
- **0** Broken files or invalid JSON documents.
- **0** Schema errors (`id`, `type`, `concept`, `skill`, `difficulty`, `prerequisites`).
- **0** Python syntax errors in any `solution_code` or `starter_code`.
- **0** Output mismatches between predicted code and actual runtime behavior.
- **0** Nonsensical/filler distractors.
- **0** Missing learning objectives or lesson-level prerequisites.
- **100%** Synchronization between `PYTHON_MASTER_SYLLABUS.txt`, directory tree, and lesson metadata.
