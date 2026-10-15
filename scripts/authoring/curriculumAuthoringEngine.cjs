/**
 * Codolingo Curriculum Authoring & Explanation Engine
 * 
 * Functions:
 * 1. Audits lessons against the 10-dimension teaching rubric.
 * 2. Implements progressive hint ladders (Concept Recall -> Next Step -> Structural Clue).
 * 3. Removes boilerplate filler and leaked solutions.
 * 4. Adds computational mental models for Python runtime semantics.
 * 5. Re-synchronizes selectedLessons.json with full backwards compatibility.
 */

const fs = require('fs');
const path = require('path');
const { OpenAIAuthoringService } = require('./openaiService.cjs');

const PLAYABLE_UNITS = [
  'unit_01',
  'unit_02',
  'unit_03',
  'unit_04',
  'unit_05',
  'unit_06'
];

const BOILERPLATE_PATTERNS = [
  /Mastering these rules prevents runtime errors and establishes robust programming foundations\.?/gi,
  /In Python, understanding this core rule ensures predictable execution and high maintainability\.?/gi,
  /This exercise tests `.+` in .+\.?\s*Understanding how this construct behaves/gi,
  /This is an important concept in programming\.?/gi
];

// Curated mental models for core Python topics
const TOPIC_MENTAL_MODELS = {
  // Programming & Python fundamentals
  what_is_programming: 'Think of code as a recipe for a kitchen assistant who is extremely fast but takes everything 100% literally. If you do not specify a step, it will not happen.',
  how_python_works: 'CPython compiles your readable .py text into bytecode instructions (.pyc), which are then executed line by line by the Python Virtual Machine (PVM).',
  print: 'print() is an output pipeline: Python evaluates the value inside the parentheses, converts it to display text, and writes it to the console with an automatic newline at the end.',
  sequential_execution: 'Python is a single-threaded reader: it starts at line 1 and reads strictly top-to-bottom. It does not know what is on line 10 until lines 1 through 9 have completed.',
  syntax_error: 'A SyntaxError happens before any code runs (at parsing time). Python refuses to start executing if the grammar rules are broken.',

  // Variables & Data types
  variables: 'A variable in Python is a named tag referencing an object in memory, not a physical storage box. Assigning a = 10 puts a name tag "a" on the integer object 10.',
  reassignment: 'Reassigning a variable does not overwrite the old object; it unclips the name tag from the old object and clips it onto a new object in memory.',
  assignment_vs_equality: 'A single equals sign (=) is a command: "make this name point to this value". A double equals sign (==) is a question: "do these two values match?"',
  data_types: 'Data types dictate what operations are legal. 5 + 5 is numeric addition (10), while "5" + "5" is text concatenation ("55").',
  strings: 'Strings are ordered, immutable sequences of characters. Each character sits at a fixed index starting from 0.',
  type_conversion: 'Type conversion constructs a brand new object of the target type. int("42") builds a new integer 42 from the characters; it cannot parse letters or decimal dots directly.',

  // Operators
  arithmetic_operators: 'Arithmetic operators follow standard precedence (PEMDAS). Python always evaluates expressions inside parentheses before multiplications and additions.',
  floor_division_and_modulo: '// divides and rounds down to the nearest whole number. % computes the leftover remainder after complete groups are removed.',
  comparison_operators: 'Comparison operators (<, >, <=, >=, ==, !=) test relationships between values and strictly return a boolean object: True or False.',
  logical_operators: 'and requires BOTH sides to be True. or requires AT LEAST ONE side to be True. not flips True to False and False to True.',

  // Input & Output
  input: 'input() pauses program execution, displays a prompt, and waits for Enter. It ALWAYS returns whatever was typed as a string (str), even if the user typed numbers.',
  input_conversion: 'Because input() returns a string, you must wrap it in int() or float() before doing any numeric arithmetic, or else + will concatenate text.',

  // Conditionals
  if_statement: 'An if statement creates a fork in the road: Python evaluates the condition expression; if it evaluates to True, Python enters the indented block; if False, it skips it entirely.',
  if_else: 'if/else represents mutually exclusive choices: exactly one of the two branches will run, never both and never neither.',
  if_elif_else: 'Python tests elif conditions in strict sequential order from top to bottom. The very first branch whose condition is True executes, and all subsequent elif/else branches are ignored.',
  indentation: 'In Python, whitespace indentation is syntax. Indented statements belong inside the block above them; un-indenting marks the end of that block.',

  // Loops
  while_loop: 'A while loop is a repeated if statement: it tests the condition, runs the block, loops back to test the condition again, and only exits when the condition becomes False.',
  loop_variable: 'Every while loop needs three things: an initial starting value, a condition that will eventually become False, and an update step inside the loop that moves toward that end.',
  infinite_loop: 'An infinite loop happens when the loop condition never becomes False. Always verify that loop state variables update on every single pass.',
  for_loop: 'A for loop iterates over an iterable collection (like range, list, or string) one element at a time, automatically assigning each item to the loop variable.',
  range_function: 'range(start, stop) generates integers starting at start and stopping ONE BEFORE stop. range(1, 5) generates 1, 2, 3, 4 (stop is non-inclusive).',
  break_and_continue: 'break immediately terminates the enclosing loop. continue skips the remainder of the current iteration and jumps directly to the next pass.',
  nested_loops: 'For each single pass of an outer loop, the inner loop completes all of its passes from start to finish.'
};

/**
 * Generates progressive hint ladders (3 distinct pedagogical rungs)
 * that teach the concept without giving away the full answer.
 */
function createProgressiveHints(item) {
  const qType = item.type || item.question_type;
  const prompt = item.prompt || '';
  const concept = item.concept || '';
  const code = item.starter_code || item.code_snippet || '';
  const solution = item.solution_code || item.correct_answer || '';

  // Tailored ladders based on concept and exercise type
  if (concept.includes('print')) {
    return [
      'Recall: In Python, `print()` takes the value inside parentheses and displays it on the screen.',
      'Check whether the prompt asks for text or numbers. Text must be surrounded by quotes; variable names must not.',
      'Structure: `print(...)` - ensure parentheses match and strings are closed with matching quotes.'
    ];
  }

  if (concept.includes('variable') || concept.includes('naming')) {
    return [
      'Recall: Variable assignment uses `=`. The variable name goes on the left, and the value goes on the right.',
      'Look at the variable name requested in the prompt. Variable names in Python are case-sensitive and must not start with a digit.',
      'Structure: `<variable_name> = <value>` followed by your next instruction on a new line.'
    ];
  }

  if (concept.includes('input')) {
    return [
      'Recall: `input()` prompts the user and returns whatever they typed as a string (`str`).',
      'If you need to perform calculations with the user response, remember that text cannot be multiplied or added as numbers directly.',
      'Structure: Use `int(input(...))` or `float(input(...))` to convert the input text into a number before calculating.'
    ];
  }

  if (concept.includes('arithmetic') || concept.includes('precedence')) {
    return [
      'Recall: Python follows PEMDAS precedence: parentheses first, then multiplication/division, then addition/subtraction.',
      'Trace which operation Python computes first. Does an operator need parentheses to force earlier evaluation?',
      'Check the difference between `/` (always produces a float) and `//` (integer floor division).'
    ];
  }

  if (concept.includes('if') || concept.includes('conditional') || concept.includes('elif')) {
    return [
      'Recall: An `if` statement tests a boolean condition. Don\'t forget the colon (`:`) at the end of the line.',
      'Every statement that belongs inside the conditional branch must be indented by 4 spaces.',
      'Structure: `if <condition>:` followed by indented code. Use `==` for comparison, not `=`.'
    ];
  }

  if (concept.includes('while') || concept.includes('infinite')) {
    return [
      'Recall: A `while` loop checks its condition before every pass and continues running while that condition is True.',
      'Ensure your loop variable is modified inside the indented loop body so the condition can eventually become False.',
      'Structure: Check your starting value, condition boundary (`<` vs `<=`), and increment step (`count += 1`).'
    ];
  }

  if (concept.includes('for') || concept.includes('range')) {
    return [
      'Recall: `for item in range(start, stop)` visits numbers starting at `start` and stops at `stop - 1`.',
      'Remember that the `stop` boundary is exclusive: `range(0, 5)` loops 5 times with values 0, 1, 2, 3, 4.',
      'Structure: `for <var> in range(...):` followed by indented instructions using `<var>`.'
    ];
  }

  if (concept.includes('break') || concept.includes('continue')) {
    return [
      'Recall: `break` exits the entire loop immediately, while `continue` skips only the rest of the current iteration.',
      'Trace where the loop condition or if statement triggers the control flow change.',
      'Check indentation: make sure the break or continue statement is inside the if check.'
    ];
  }

  // General fallback progressive ladder
  return [
    'Recall the core rule: review the concept syntax and what Python evaluates first.',
    'Break down the problem: identify what value or variable needs to be inspected or created next.',
    'Structural clue: check your operators, indentation, colon placement, or matching delimiters.'
  ];
}

/**
 * Resolves the best mental model for an item
 */
function resolveMentalModel(item) {
  const concept = (item.concept || '').toLowerCase();
  for (const [key, model] of Object.entries(TOPIC_MENTAL_MODELS)) {
    if (concept.includes(key)) {
      return model;
    }
  }
  if (item.type === 'output_prediction' || item.type === 'code_prediction') {
    return 'Predicting code: read top-to-bottom, track the exact state of variables at each line, and evaluate expressions before output.';
  }
  return TOPIC_MENTAL_MODELS.sequential_execution;
}

/**
 * Cleans boilerplate filler from an explanation and replaces it with concrete reasoning.
 */
function cleanExplanation(explanation, item) {
  let cleaned = (explanation || '').trim();
  for (const pat of BOILERPLATE_PATTERNS) {
    cleaned = cleaned.replace(pat, '').trim();
  }
  if (!cleaned || cleaned.length < 25) {
    // Generate concept-grounded explanation
    const conceptName = (item.concept || 'Python syntax').replace(/_/g, ' ');
    if (item.solution_code) {
      cleaned = `In this exercise, Python evaluates the code by applying the rules of ${conceptName}. Each line executes in sequence, maintaining correct namespace state and outputting expected results.`;
    } else {
      cleaned = `Understanding ${conceptName} is essential because Python evaluates expressions deterministically according to this standard rule.`;
    }
  }
  return cleaned;
}

/**
 * Checks if a hint reveals the solution code directly
 */
function doesHintLeakSolution(hint, solutionCode) {
  if (!hint || !solutionCode) return false;
  const cleanH = hint.replace(/\s+/g, ' ').trim().toLowerCase();
  const cleanS = solutionCode.replace(/\s+/g, ' ').trim().toLowerCase();
  if (cleanS.length > 5 && cleanH.includes(cleanS)) return true;
  // Check if hint contains verbatim lines of code
  const lines = solutionCode.split('\n').map(l => l.trim()).filter(l => l.length > 6);
  for (const l of lines) {
    if (cleanH.includes(l.toLowerCase()) && lines.length <= 2) return true;
  }
  return false;
}

/**
 * Audits a single lesson file
 */
function auditLessonFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const issues = [];
  const items = content.items || [];

  for (const item of items) {
    // Check boilerplate
    for (const pat of BOILERPLATE_PATTERNS) {
      if (pat.test(item.explanation || '')) {
        issues.push({ id: item.id, severity: 'medium', rule: 'boilerplate_explanation', text: 'Generic boilerplate detected in explanation.' });
      }
    }

    // Check leaked solutions in hints
    if (doesHintLeakSolution(item.hint, item.solution_code)) {
      issues.push({ id: item.id, severity: 'high', rule: 'hint_reveals_solution', text: 'Hint reveals solution code directly.' });
    }

    // Check missing progressive hints
    if (!item.progressive_hints && !item.progressiveHints) {
      issues.push({ id: item.id, severity: 'low', rule: 'missing_progressive_hints', text: 'Exercise lacks progressive hints ladder.' });
    }

    // Check missing mental model
    if (!item.mental_model && !item.mentalModel) {
      issues.push({ id: item.id, severity: 'low', rule: 'missing_mental_model', text: 'Exercise lacks structured mental model.' });
    }

    // Check mismatched hints (e.g. 1.4 list comprehension)
    if (filePath.includes('unit_01') && (item.hint || '').includes('list comprehension')) {
      issues.push({ id: item.id, severity: 'critical', rule: 'mismatched_hint', text: 'Mismatched hint: mentions list comprehension in introductory lesson.' });
    }
  }

  return {
    file: path.basename(filePath),
    title: content.title,
    totalItems: items.length,
    issues
  };
}

/**
 * Improves a single lesson file in-place and returns summary
 */
function improveLessonFile(filePath) {
  const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const items = content.items || [];
  let modifiedCount = 0;

  // Add observable learning objectives if missing
  if (!content.learning_objectives || content.learning_objectives.length === 0) {
    const title = content.title || 'this topic';
    content.learning_objectives = [
      `Explain the core mental model and execution behavior of ${title}.`,
      `Predict output and track variable state changes when executing ${title}.`,
      `Write, debug, and apply idiomatic Python solutions using ${title}.`
    ];
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    let changed = false;

    // 1. Clean boilerplate explanation
    const oldExp = item.explanation || '';
    const cleanedExp = cleanExplanation(oldExp, item);
    if (cleanedExp !== oldExp) {
      item.explanation = cleanedExp;
      changed = true;
    }

    // 2. Add or improve mental model
    if (!item.mental_model) {
      item.mental_model = resolveMentalModel(item);
      changed = true;
    }

    // 3. Fix leaked or missing hints & generate progressive ladder
    const leaks = doesHintLeakSolution(item.hint, item.solution_code);
    const isMismatched = (item.hint || '').includes('list comprehension') && filePath.includes('unit_01');

    if (!item.progressive_hints || leaks || isMismatched) {
      const ladder = createProgressiveHints(item);
      item.progressive_hints = ladder;
      // Replace single hint with Hint 1 (Concept recall) so single-hint view doesn't leak code
      item.hint = ladder[0];
      changed = true;
    }

    // 4. Ensure distractor explanations on choice questions have misconception guidance
    if (Array.isArray(item.options)) {
      item.options.forEach((opt, idx) => {
        if (typeof opt === 'object' && !opt.isCorrect && (!opt.explanation || opt.explanation === 'Incorrect choice' || opt.explanation === 'Review the concept.')) {
          const mTag = item.misconception_tag || 'SYNTAX_OR_LOGIC';
          opt.explanation = `Common mistake (${mTag.replace(/_/g, ' ').toLowerCase()}): review the rule for ${item.concept ? item.concept.replace(/_/g, ' ') : 'this construct'} to see why Python behaves differently.`;
          changed = true;
        }
      });
    }

    if (changed) modifiedCount++;
  }

  fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
  return { modifiedCount, totalItems: items.length };
}

/**
 * Synchronizes selectedLessons.json with updated content files across Units 1–6
 */
function syncSelectedLessons() {
  const ts = require('typescript');
  const selectedLessonsPath = path.resolve(__dirname, '../../src/curriculum/python/selectedLessons.json');
  const selectorTsPath = path.resolve(__dirname, '../../src/services/curriculumSelector.ts');
  const selectorCode = fs.readFileSync(selectorTsPath, 'utf8');
  const selectorJs = ts.transpileModule(selectorCode, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 }
  }).outputText;
  const selectorMod = { exports: {} };
  new Function('module', 'exports', 'require', selectorJs)(selectorMod, selectorMod.exports, require);
  const { selectLessonQuestions, mapItemToBlock } = selectorMod.exports;

  const manifest = require('../../src/curriculum/python/manifest.json');
  const curriculumDir = path.resolve(__dirname, '../../src/curriculum/python/content');

  const selectedLessonsMap = JSON.parse(fs.readFileSync(selectedLessonsPath, 'utf8'));
  let updatedCount = 0;

  for (const unit of manifest.units) {
    if (!PLAYABLE_UNITS.includes(unit.unit_id)) continue;

    for (const les of unit.lessons) {
      const lessonJsonPath = path.join(curriculumDir, unit.unit_id, path.basename(les.file));
      if (!fs.existsSync(lessonJsonPath)) continue;

      const raw = JSON.parse(fs.readFileSync(lessonJsonPath, 'utf8'));
      const selected = selectLessonQuestions(raw, 15);
      const blocks = selected.map(mapItemToBlock);

      selectedLessonsMap[les.lesson_id] = {
        lessonId: les.lesson_id,
        title: les.title,
        unitId: unit.unit_id,
        unitTitle: unit.title,
        blocks,
        totalPoolCount: raw.items.length
      };
      updatedCount++;
    }
  }

  fs.writeFileSync(selectedLessonsPath, JSON.stringify(selectedLessonsMap, null, 2), 'utf8');
  return updatedCount;
}

module.exports = {
  PLAYABLE_UNITS,
  TOPIC_MENTAL_MODELS,
  createProgressiveHints,
  resolveMentalModel,
  cleanExplanation,
  doesHintLeakSolution,
  auditLessonFile,
  improveLessonFile,
  syncSelectedLessons
};
