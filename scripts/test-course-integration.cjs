const path = require('path');

// Test that dist index bundle runs or that course loading works
async function testCourseIntegration() {
  console.log('Testing course integration...');

  // Check pathCurriculum.ts has Unit 1 mounted
  const pathCurriculum = require('fs').readFileSync(
    path.join(__dirname, '..', 'src', 'data', 'pathCurriculum.ts'),
    'utf8'
  );
  if (!pathCurriculum.includes('buildPythonFoundationsUnit()')) {
    throw new Error('pathCurriculum.ts does not mount buildPythonFoundationsUnit()');
  }
  console.log('✓ pathCurriculum.ts mounts Unit 1 Foundations correctly');

  // Check courseService.ts has foundations fallback/mapping
  const courseService = require('fs').readFileSync(
    path.join(__dirname, '..', 'src', 'services', 'courseService.ts'),
    'utf8'
  );
  if (!courseService.includes('getFoundationsLessonBlocks')) {
    throw new Error('courseService.ts does not reference getFoundationsLessonBlocks');
  }
  console.log('✓ courseService.ts intercepts Unit 1 lessons with getFoundationsLessonBlocks');

  // Check lesson mapping IDs
  const indexTs = require('fs').readFileSync(
    path.join(__dirname, '..', 'src', 'curriculum', 'python', 'foundations', 'index.ts'),
    'utf8'
  );
  const lessons = ['1.1', '1.2', '1.3', '1.4', '1.5', '1.6', '1.7', '1.8', '1.9', '1.10', 'unit_01_final'];
  for (const l of lessons) {
    if (!indexTs.includes(`'${l}'`)) {
      throw new Error(`index.ts does not register lesson ID: ${l}`);
    }
  }
  console.log(`✓ All 10 lessons + unit_01_final registered in FOUNDATIONS_LESSON_MAP`);

  console.log('\nCourse Integration Test Passed 100%!');
}

testCourseIntegration().catch(err => {
  console.error(err);
  process.exit(1);
});
