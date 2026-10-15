# Codolingo Teaching Content Standard & Quality Rubric

This standard defines the instructional philosophy, pedagogical blueprint, explanation requirements, quality rubric, and authoring guidelines for all Python lessons in Codolingo.

---

## 1. Core Teaching Philosophy

Codolingo teaches programming as a **system of computational reasoning**, not a loose collection of syntax trivia to memorize.

For every concept, the curriculum must equip learners to answer five fundamental questions:
1. **What is it?** — An accurate, intuitive definition avoiding circular reasoning.
2. **Why does it exist?** — The computational or software problem it solves.
3. **How does it work?** — A physically sound mental model of what the Python runtime actually does.
4. **When should I use it?** — Concrete scenarios and design choices (e.g., when to choose `while` vs `for`, or `if/elif` vs separate `if` statements).
5. **How can it fail?** — Common beginner misconceptions, type mismatches, syntax errors, and debugging strategies.

---

## 2. The 10-Dimension Quality Rubric

Every lesson explanation, example, hint ladder, and feedback string is evaluated across 10 dimensions on a **0 to 4 scoring scale**.

### The Scoring Scale
* **0 — Missing or Incorrect:** The explanation is absent, factually misleading, or technically wrong.
* **1 — Weak:** The explanation is generic boilerplate, vague, uses unexplained jargon, or merely repeats the question.
* **2 — Adequate:** The core idea is factually correct, but lacks step-by-step reasoning, computational mental models, or misconception guidance.
* **3 — Strong:** The explanation is accurate, clear, specific to the code snippet, structured, and supported by concrete cause-and-effect reasoning.
* **4 — Excellent:** The explanation instills a durable mental model, directly addresses misconceptions, guides through trace steps, provides non-leaking progressive hints, and prepares the learner for independent code authoring.

### Rubric Dimensions

| # | Dimension | Criteria for Score 4 (Excellent) |
|---|---|---|
| **1** | **Technical Correctness** | 100% Python 3.10+ semantic accuracy. No misleading simplifications (e.g., variables are named object references/tags, never "boxes with values stamped inside"). |
| **2** | **Clarity & Language** | Zero generic filler sentences. Jargon is defined before first use. Language is approachable without patronizing the learner. |
| **3** | **Conceptual Depth** | Explains *why* Python behaves this way (e.g., why `input()` returns `str`, why `=` evaluates right-to-left before assignment). |
| **4** | **Quality of Examples** | Realistic, self-contained examples that isolate the target rule. Minimal noise or extraneous syntax. |
| **5** | **Step-by-Step Reasoning** | Explicit code tracing: demonstrates initial state, statement evaluation, value mutation/reassignment, and final output. |
| **6** | **Misconception Coverage** | Proactively targets common pitfalls (e.g., `=` vs `==`, `+` between `str` and `int`, `range(1, 5)` boundary). |
| **7** | **Practical Applicability** | Shows how the construct is used in real applications rather than purely synthetic foo/bar toy puzzles. |
| **8** | **Hint Quality** | 3-tier progressive hint ladder (Concept Recall $\rightarrow$ Next Step $\rightarrow$ Structural Clue). Zero solution leakage in tiers 1 and 2. |
| **9** | **Corrective Feedback** | Explains *why* the student's mistake occurred, the rule violated, and what mental model resolves it, rather than just saying "Incorrect". |
| **10** | **Objective Alignment** | Directly assesses the stated observable learning outcome without testing untaught prerequisite material. |

---

## 3. Instructional Blueprint for Every Lesson

A Codolingo lesson is structured into focused instructional phases that fit into an interactive, gamified session:

### A. Learning Objective
Must specify an observable learner capability.
- *Weak:* "Learn variables."
- *Strong:* "Store a value in a variable, retrieve it in an expression, and explain how rebinding changes the reference."

### B. Computational Mental Model (Intuition Before Syntax)
Provide a clear mental model of Python's execution mechanism before presenting complex syntax.
* **Variables:** A variable is a **labeled sticky note / tag** affixed to an object living in memory. Reassigning moves the tag to a new value; it does not destroy or mutate the previous number.
* **Conditionals:** An `if/elif/else` chain is a **guarded railway switch**. Python checks track gates top-to-bottom and enters the *first* gate evaluating to `True`. Once taken, all subsequent branches are skipped.
* **Type Conversion:** Python values have strict data types. `str("10")` is literal text; `int("10")` extracts the numeric quantity. Combining `+` between text and numbers fails because Python refuses to guess whether to concatenate or add.
* **Loops:** A `while` loop is a **repeating gatekeeper**. Before each lap, it re-tests the condition. If true, the body executes; if false, execution immediately escapes to the following line.

### C. Precise Worked Example with Step-by-Step Tracing
Every code demonstration must explain:
1. Initial state before execution.
2. Each line's evaluation order (e.g., evaluate the right-hand side of `=` first, then bind the identifier).
3. The resulting state change or stdout output.

### D. Progressive Hint Ladders
Hints must never give away the answer immediately. Exercise hints follow a strict 3-tier ladder:
* **Tier 1 (Recall Concept):** Reminds the learner of the core principle or Python construct without referencing solution tokens.
* **Tier 2 (Next Step):** Guides the learner on which part of the problem or syntax line to focus on first.
* **Tier 3 (Structural Clue):** Shows the grammatical pattern or structure using placeholders (e.g., `variable_name = int(input(...))`) without giving the exact literal values.

### E. Misconception-Aware Corrective Feedback
Feedback triggered on incorrect answers must isolate the mistake:
1. State the exact rule that was broken.
2. Explain what Python did (e.g., `TypeError: can only concatenate str (not "int") to str`).
3. Provide the corrective reasoning so the student understands how to repair it.

---

## 4. Boilerplate & Anti-Patterns Checklist

The following anti-patterns are strictly rejected by the automated quality validator (`npm run test:teaching`):

❌ **Generic Filler Sentences:**
- "Mastering these rules prevents runtime errors and establishes robust programming foundations."
- "This is an important concept in programming."
- "Understanding this will help you become a better programmer."
- "Always follow best practices."
- "Practice more to master this concept."

❌ **Solution-Leaking Hints:**
- Hint providing the exact line `age = 18` for a question asking the user to assign 18 to `age`.
- Hint containing the exact option text or completed code block.

❌ **Premature Jargon / Out-of-Order Prerequisites:**
- Mentioning list comprehensions or lambda functions in Unit 1 (Foundations).
- Referencing object mutation before distinguishing mutable from immutable types.

❌ **The "Box" Analogy for Python Variables:**
- Calling a Python variable a "box containing a number" misleads learners when they reach mutable objects, references, and aliasing in Units 7+. Always teach variables as named references/tags.

---

## 5. Authoring & Content Improvement Workflow

Codolingo uses an offline, version-controlled authoring engine powered by OpenAI to assist curriculum creators:

### Security & Architecture Invariants
1. **Zero Client-Side Keys:** The OpenAI API key is strictly stored server-side in `.env` (gitignored). `VITE_OPENAI_API_KEY` is strictly prohibited and guarded by automated tests.
2. **Offline Delivery:** Lessons are reviewed, validated, and saved statically in JSON files (`src/curriculum/python/content/` and `src/curriculum/python/selectedLessons.json`). Students playing lessons **never** make live LLM API calls.
3. **Deterministic Verification:** Every AI-assisted draft must pass automated schema validation, Python syntax verification, and hint-leak detection before inclusion in the curriculum.

### CLI Workflow Commands
```bash
# Audit teaching quality across all playable units
npm run author -- --audit

# Improve playable lessons with structured mental models and progressive hint ladders
npm run author -- --improve-playable

# Synchronize content files with the selected playable curriculum
npm run author -- --sync

# Check authoring engine status and OpenAI configuration
npm run author -- --status

# Run the automated teaching quality test suite
npm run test:teaching
```
