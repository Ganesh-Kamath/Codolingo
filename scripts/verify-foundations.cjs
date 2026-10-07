const path = require('path');
const fs = require('fs');

async function runVerification() {
  console.log('====================================================');
  console.log('Codolingo Unit 1 Python Foundations Verification');
  console.log('====================================================\n');

  // Verify curriculum files exist
  const foundationsDir = path.join(__dirname, '..', 'src', 'curriculum', 'python', 'foundations');
  const files = [
    'lesson01.ts',
    'lesson02.ts',
    'lesson03.ts',
    'lesson04.ts',
    'lesson05.ts',
    'lesson06.ts',
    'lesson07.ts',
    'lesson08.ts',
    'lesson09.ts',
    'lesson10.ts',
    'finalChallenge.ts',
    'index.ts'
  ];

  console.log('1. Checking Curriculum Files Existence:');
  for (const f of files) {
    const p = path.join(foundationsDir, f);
    if (!fs.existsSync(p)) {
      throw new Error(`Missing required curriculum file: ${f}`);
    }
    const stats = fs.statSync(p);
    console.log(`  ✓ ${f} (${(stats.size / 1024).toFixed(1)} KB)`);
  }

  // Count questions and types across files
  console.log('\n2. Analyzing Questions Across Lessons:');
  let totalQuestions = 0;
  let totalPredict = 0;
  let totalWrite = 0;
  let totalDebug = 0;
  let totalTrace = 0;
  let totalApply = 0;
  let totalReasoning = 0;
  let totalMCQ = 0;
  let totalCompletion = 0;
  let totalRepairs = 0;
  const misconceptionCounts = {};

  for (let i = 1; i <= 10; i++) {
    const numStr = String(i).padStart(2, '0');
    const fPath = path.join(foundationsDir, `lesson${numStr}.ts`);
    const content = fs.readFileSync(fPath, 'utf8');

    // Count questions
    const qMatches = content.match(/id:\s*['"]py_fnd_\w+['"]/g) || [];
    const lessonQCount = qMatches.length;
    totalQuestions += lessonQCount;

    // Count types
    const predictMatches = content.match(/question_type:\s*['"]PREDICT_OUTPUT['"]/g) || [];
    const writeMatches = content.match(/question_type:\s*['"]WRITE_CODE['"]/g) || [];
    const debugMatches = content.match(/question_type:\s*['"]DEBUG_CODE['"]/g) || [];
    const traceMatches = content.match(/question_type:\s*['"]TRACE_CODE['"]/g) || [];
    const applyMatches = content.match(/question_type:\s*['"]APPLY['"]/g) || [];
    const reasonMatches = content.match(/question_type:\s*['"]TRUE_FALSE_WITH_REASONING['"]/g) || [];
    const mcqMatches = content.match(/question_type:\s*['"]MULTIPLE_CHOICE['"]/g) || [];
    const compMatches = content.match(/question_type:\s*['"]CODE_COMPLETION['"]/g) || [];
    const repairMatches = content.match(/repair_question:\s*\{/g) || [];

    totalPredict += predictMatches.length;
    totalWrite += writeMatches.length;
    totalDebug += debugMatches.length;
    totalTrace += traceMatches.length;
    totalApply += applyMatches.length;
    totalReasoning += reasonMatches.length;
    totalMCQ += mcqMatches.length;
    totalCompletion += compMatches.length;
    totalRepairs += repairMatches.length;

    // Misconceptions
    const miscMatches = content.match(/misconception_tag:\s*['"]([A-Z_]+)['"]/g) || [];
    miscMatches.forEach(m => {
      const tag = m.split(/['"]/)[1];
      misconceptionCounts[tag] = (misconceptionCounts[tag] || 0) + 1;
    });

    console.log(`  Lesson ${i}: ${lessonQCount} questions (Predict: ${predictMatches.length}, Write: ${writeMatches.length}, Debug: ${debugMatches.length}, Trace: ${traceMatches.length}, Repairs: ${repairMatches.length})`);
  }

  // Capstone challenge questions
  const finalContent = fs.readFileSync(path.join(foundationsDir, 'finalChallenge.ts'), 'utf8');
  const finalQMatches = finalContent.match(/id:\s*['"]py_fnd_final_\w+['"]/g) || [];
  totalQuestions += finalQMatches.length;
  totalWrite += (finalContent.match(/question_type:\s*['"]WRITE_CODE['"]/g) || []).length;
  console.log(`  Final Capstone: ${finalQMatches.length} questions (All multi-concept code writing)`);

  console.log('\n3. Question Type Distribution:');
  console.log(`  Total Questions: ${totalQuestions}`);
  console.log(`  • PREDICT_OUTPUT: ${totalPredict} (${Math.round(totalPredict / totalQuestions * 100)}%)`);
  console.log(`  • WRITE_CODE: ${totalWrite} (${Math.round(totalWrite / totalQuestions * 100)}%)`);
  console.log(`  • DEBUG_CODE: ${totalDebug} (${Math.round(totalDebug / totalQuestions * 100)}%)`);
  console.log(`  • TRACE_CODE: ${totalTrace} (${Math.round(totalTrace / totalQuestions * 100)}%)`);
  console.log(`  • APPLY: ${totalApply} (${Math.round(totalApply / totalQuestions * 100)}%)`);
  console.log(`  • TRUE_FALSE_WITH_REASONING: ${totalReasoning} (${Math.round(totalReasoning / totalQuestions * 100)}%)`);
  console.log(`  • MULTIPLE_CHOICE: ${totalMCQ} (${Math.round(totalMCQ / totalQuestions * 100)}%)`);
  console.log(`  • CODE_COMPLETION: ${totalCompletion} (${Math.round(totalCompletion / totalQuestions * 100)}%)`);
  console.log(`  • Interactive Repair Sessions: ${totalRepairs}`);

  console.log('\n4. Standardized Misconceptions Covered:');
  for (const [tag, count] of Object.entries(misconceptionCounts)) {
    console.log(`  ✓ ${tag}: ${count} questions tagged`);
  }

  console.log('\n====================================================');
  console.log('ALL VERIFICATION CHECKS PASSED SUCCESSFULLY!');
  console.log('====================================================\n');
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
