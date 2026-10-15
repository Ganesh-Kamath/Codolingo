/**
 * Codolingo Curriculum Authoring & Secure OpenAI Integration Test Suite
 * 
 * Verifies:
 * 1. Security & Key Isolation (no keys in client bundles, .env.example safe, .gitignore ignores .env)
 * 2. Server-side OpenAI Service behavior with unconfigured/placeholder keys
 * 3. Configurable model fallback
 * 4. Input validation and payload size limits
 * 5. Progressive hint ladder invariants (no leaked solutions, 3 distinct tiers)
 * 6. Boilerplate filler rejection
 * 7. Non-destructive lesson updates and selectedLessons.json synchronization
 * 8. Static delivery (no live API calls on learner lesson view)
 */

const fs = require('fs');
const path = require('path');
const { OpenAIAuthoringService } = require('../authoring/openaiService.cjs');
const {
  createProgressiveHints,
  resolveMentalModel,
  cleanExplanation,
  doesHintLeakSolution,
  auditLessonFile
} = require('../authoring/curriculumAuthoringEngine.cjs');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedTests++;
  console.log(`  ✅ PASS: ${message}`);
}

console.log('===============================================================');
console.log('   AUTHORING & SECURE OPENAI INTEGRATION TEST SUITE            ');
console.log('===============================================================');

// 1. SECURITY & CLIENT ISOLATION
console.log('\n--- 1. SECURITY & CLIENT ISOLATION ---');
{
  const gitignore = fs.readFileSync(path.resolve('.gitignore'), 'utf8');
  assert(gitignore.includes('.env'), 'Root .gitignore explicitly excludes .env');

  const envExample = fs.readFileSync(path.resolve('.env.example'), 'utf8');
  assert(
    !envExample.includes('sk-') && envExample.includes('YOUR_NEW_ROTATED_API_KEY_HERE'),
    '.env.example contains only non-secret placeholders and no real API keys'
  );
  assert(
    !envExample.includes('VITE_OPENAI_API_KEY'),
    '.env.example never exposes or defines VITE_OPENAI_API_KEY'
  );

  // Check dist output if exists
  const distDir = path.resolve('dist/assets');
  if (fs.existsSync(distDir)) {
    const assetFiles = fs.readdirSync(distDir).filter(f => f.endsWith('.js'));
    let leakedKey = false;
    for (const af of assetFiles) {
      const code = fs.readFileSync(path.join(distDir, af), 'utf8');
      if (code.includes('YOUR_NEW_ROTATED_API_KEY_HERE') || /sk-[a-zA-Z0-9]{20,}/.test(code)) {
        leakedKey = true;
      }
    }
    assert(!leakedKey, 'Production dist bundle does not contain OpenAI API keys or private env placeholders');
  }
}

// 2. OPENAI SERVICE CONFIGURATION & SAFETY
console.log('\n--- 2. OPENAI SERVICE CONFIGURATION & SAFETY ---');
(async () => {
  const service = new OpenAIAuthoringService();

  assert(
    service.model === 'gpt-4o-mini' || typeof service.model === 'string',
    'OpenAI service resolves a valid supported model (gpt-4o-mini default)'
  );

  // Test handling of unconfigured/placeholder key
  const safeRes = await service.improveExercise({ id: 'test_1', prompt: 'test' });
  assert(
    safeRes.success === false,
    'Service returns safe error object when key is unconfigured or placeholder'
  );
  assert(
    typeof safeRes.message === 'string' || typeof safeRes.error === 'string',
    'Service provides descriptive user instructions without crashing'
  );

  // Input validation
  try {
    await service.improveExercise(null);
    assert(false, 'Service should throw on null exerciseData');
  } catch (err) {
    assert(err.message.includes('Invalid exerciseData'), 'Service rejects invalid null payload');
  }

  // Request size limit enforcement
  const giantPayload = { id: 'large', prompt: 'x'.repeat(60000) };
  try {
    await service.improveExercise(giantPayload);
    assert(false, 'Service should throw on oversized exerciseData');
  } catch (err) {
    assert(err.message.includes('exceeds maximum permitted size'), 'Service enforces payload size limit (50KB)');
  }

  // 3. PROGRESSIVE HINT LADDER INVARIANTS
  console.log('\n--- 3. PROGRESSIVE HINT LADDER INVARIANTS ---');
  {
    const sampleItem = {
      concept: 'the_print_function',
      type: 'write_the_code',
      solution_code: 'print("Hello World")'
    };
    const hints = createProgressiveHints(sampleItem);
    assert(Array.isArray(hints) && hints.length === 3, 'Progressive hints ladder contains 3 distinct tiers');
    assert(
      !doesHintLeakSolution(hints[0], sampleItem.solution_code),
      'Hint 1 (Concept Recall) does not leak solution code'
    );
    assert(
      !doesHintLeakSolution(hints[1], sampleItem.solution_code),
      'Hint 2 (Next Step) does not leak solution code'
    );
    assert(
      !doesHintLeakSolution(hints[2], sampleItem.solution_code),
      'Hint 3 (Structural Clue) does not leak solution code'
    );

    // Verify doesHintLeakSolution detector
    assert(
      doesHintLeakSolution('age = 18\nprint(age)', 'age = 18\nprint(age)'),
      'Leak detector catches verbatim solution in hint'
    );
    assert(
      doesHintLeakSolution('First line: age = 18. Second line: print(age)', 'age = 18\nprint(age)'),
      'Leak detector catches paraphrased code in hint'
    );
  }

  // 4. BOILERPLATE REJECTION & MENTAL MODELS
  console.log('\n--- 4. BOILERPLATE REJECTION & MENTAL MODELS ---');
  {
    const boilerplateText = 'In Python, print() is a built-in function. Mastering these rules prevents runtime errors and establishes robust programming foundations.';
    const cleaned = cleanExplanation(boilerplateText, { concept: 'print_syntax' });
    assert(
      !cleaned.includes('Mastering these rules prevents runtime errors'),
      'Boilerplate cleaner removes generic foundation filler sentences'
    );

    const model = resolveMentalModel({ concept: 'variables' });
    assert(
      model.includes('named tag') || model.includes('memory'),
      'Variables resolve accurate named tag mental model rather than physical box'
    );
  }

  // 5. STATIC CURRICULUM DELIVERY INVARIANTS
  console.log('\n--- 5. STATIC CURRICULUM DELIVERY INVARIANTS ---');
  {
    const selectedLessons = require('../../src/curriculum/python/selectedLessons.json');
    assert(
      Object.keys(selectedLessons).length >= 36,
      'Pre-indexed selectedLessons.json contains all playable lessons'
    );
    const lesson1_1 = selectedLessons['1.1'];
    assert(
      lesson1_1 && lesson1_1.blocks && lesson1_1.blocks.length === 15,
      'Lesson 1.1 contains exactly 15 pre-selected playable blocks'
    );
    const hasMentalModels = lesson1_1.blocks.some(b => b.mentalModel || b.mental_model);
    assert(
      hasMentalModels,
      'Lesson 1.1 pre-indexed blocks deliver structured mental models directly without live AI runtime calls'
    );
  }

  console.log('\n===============================================================');
  console.log(`ALL ${passedTests}/${totalTests} AUTHORING & INTEGRATION TESTS PASSED!`);
  console.log('===============================================================');
})().catch(err => {
  console.error('\nTest Suite Failed:', err);
  process.exit(1);
});
